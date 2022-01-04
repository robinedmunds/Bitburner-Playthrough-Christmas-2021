/** @param {NS} ns **/

const ATTACK_SCRIPT = "/scripts/attack.js"
const EXCLUDE_NODES = ["home", "darkweb", "CSEC"]
const nodeHeirarchy = {}

const buildNodeHeirarchy = async (ns, parent) => {
  // recursive
  if (nodeHeirarchy[parent]) return

  const children = await ns.scan(parent)
  nodeHeirarchy[parent] = children
  for (const child of children) {
    await buildNodeHeirarchy(ns, child)
  }
}

const calcScriptMaxThreads = (ns, script, ramAvailable) => {
  const scriptRamUsage = ns.getScriptRam(script, "home")
  const maxThreads = Math.floor(ramAvailable / scriptRamUsage)
  return maxThreads
}

const startAttackCascade = async (ns) => {
  for (const [parent, children] of Object.entries(nodeHeirarchy)) {
    if (!(await ns.scp(ATTACK_SCRIPT, parent))) return

    const ramAvailable =
      ns.getServerMaxRam(parent) - ns.getServerUsedRam(parent)
    const maxThreads = calcScriptMaxThreads(ns, ATTACK_SCRIPT, ramAvailable)
    const filteredChildren = children.filter(
      (child) => !EXCLUDE_NODES.includes(child)
    )
    if (filteredChildren.length === 0) return
    const threads = maxThreads / filteredChildren.length

    for (const child of filteredChildren) {
      if (ns.isRunning(ATTACK_SCRIPT, parent, child)) return
      await ns.exec(ATTACK_SCRIPT, parent, threads, child)
    }

    // filteredChildren.forEach(async child => {
    // 	if (ns.isRunning(ATTACK_SCRIPT, parent, child)) return
    // 	await ns.exec(ATTACK_SCRIPT, parent, threads, child)
    // })
  }
}

const main = async (ns) => {
  const rootNode = ns.args[0] || "home"
  if (!ns.serverExists(rootNode)) {
    ns.tprint(`ERROR: ${rootNode} is unreachable`)
    return
  }

  await buildNodeHeirarchy(ns, rootNode)
  ns.tprint(JSON.stringify(nodeHeirarchy, null, 2))
  await startAttackCascade(ns)

  // while (true) {
  // 	await startAttackCascade(ns)
  // 	await ns.sleep(1000 * 60)
  // }
}

export { main }
