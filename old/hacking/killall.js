/** @param {NS} ns **/

const CONTROL_MACHINES = ["home"]

const buildNodeList = (ns, rootNode) => {
  const nodeList = []

  const recurse = (ns, rootNode) => {
    const children = ns.scan(rootNode)
    for (const child of children) {
      if (!nodeList.includes(child)) {
        nodeList.push(child)
        recurse(ns, child)
      }
    }
  }
  recurse(ns, rootNode)
  return nodeList.sort()
}

const killNodes = (ns, nodeList) => {
  let killCount = 0
  for (const node of nodeList) {
    if (!CONTROL_MACHINES.includes(node)) {
      if (ns.killall(node)) {
        killCount++
        ns.tprint(`*** successfully killed scripts on ${node} ***`)
      }
    }
  }
  return killCount
}

const main = (ns) => {
  ns.disableLog("scan")
  ns.disableLog("killall")
  const rootNode = ns.args[0] || "home"
  const nodeList = buildNodeList(ns, rootNode)

  ns.print("-------------------")
  ns.print("- KILL ALL SCRIPT -")
  ns.print("-------------------")
  ns.print("")
  ns.print(JSON.stringify(nodeList, null, 2))
  ns.print(`Server count: ${nodeList.length}`)
  ns.print("")

  const killCount = killNodes(ns, nodeList)

  ns.tprint(`\n\nRan kill all on ${killCount} servers\n\n`)
}

export { main }
