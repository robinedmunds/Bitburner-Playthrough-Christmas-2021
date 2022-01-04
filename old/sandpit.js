/** @param {NS} ns **/

const ATTACK_SCRIPT = "/scripts/attack.js"
const EXCLUDE_NODES = ["home", "darkweb", "CSEC"]
const RAM_TARGET_USAGE = 0.8

const buildAllNodes = (ns, parent) => {
  const allNodes = {}

  const recursive = (ns, parent) => {
    if (allNodes[parent]) return

    const children = ns.scan(parent)
    allNodes[parent] = children
    for (const child of children) {
      recursive(ns, child)
    }
  }
  recursive(ns, parent)
  return allNodes
}

const calcScriptMaxThreads = (ns, host, script, ramAvailable) => {
  const scriptRamUsage = ns.getScriptRam(script, host)
  const maxThreads = Math.floor(
    (ramAvailable * RAM_TARGET_USAGE) / scriptRamUsage
  )
  return maxThreads
}

const attackChild = async (ns, parent, child, threads) => {
  if (threads < 1) return
  if (await ns.isRunning(ATTACK_SCRIPT, parent, child)) return

  if ((await ns.exec(ATTACK_SCRIPT, parent, threads, child)) !== 0) {
    ns.tprint(`${parent} is now attacking ${child} with ${ATTACK_SCRIPT}`)
    return
  }
  ns.tprint(`??? ${parent} could not attack ${child} with ${ATTACK_SCRIPT}`)
}

const cascadeAttack = async (ns, allNodes) => {
  for (const [parent, children] of Object.entries(allNodes)) {
    children.filter((child) => !EXCLUDE_NODES.includes(child))
    const ramAvailable =
      ns.getServerMaxRam(parent) - ns.getServerUsedRam(parent)
    const maxThreads = calcScriptMaxThreads(
      ns,
      parent,
      ATTACK_SCRIPT,
      ramAvailable
    )
    const threadsPerInstance = Math.floor(maxThreads / children.length)
    if (!(await ns.hasRootAccess(parent))) return

    if (parent !== "home") {
      if (!(await ns.scp(ATTACK_SCRIPT, parent))) {
        ns.tprint(`*** copied ${ATTACK_SCRIPT} to parent ***`)
      }
    }

    for (const child of children) {
      await attackChild(ns, parent, child, threadsPerInstance)
    }
  }
}

const main = async (ns) => {
  ns.disableLog("scan", "getServerMaxRam", "getServerUsedRam")
  const allNodes = buildAllNodes(ns, "home")
  ns.tprint(JSON.stringify(allNodes, null, 2))

  // while (true) {
  // 	await cascadeAttack(ns, allNodes)
  // 	await ns.sleep(1000 * 60 * 15)
  // }
}

export { main }
