/** @param {NS} ns **/
import { AllNodes } from "/scripts/lib/classes.js"

const filterMyServers = (ns, allNodes) => {
  const output = {}

  for (const [name, node] of Object.entries(allNodes)) {
    if (node.isServerBelongingToMe) {
      output[name] = node
    }
  }

  return output
}

const filterRootedVictims = (ns, allNodes) => {
  const output = {}

  for (const [name, node] of Object.entries(allNodes)) {
    if (!node.isServerBelongingToMe && node.isRooted) {
      output[name] = node
    }
  }

  return output
}

const filterReadyToRoot = (ns, allNodes) => {
  const output = {}

  for (const [name, node] of Object.entries(allNodes)) {
    if (!node.isRooted && node.canHack) {
      output[name] = node
    }
  }

  return output
}

const main = (ns) => {
  const arg = ns.args[0] || null
  const allNodes = new AllNodes(ns).allNodes
  let output = null

  if (arg === "--all") {
    output = allNodes
  } else if (arg === "--servers") {
    output = filterMyServers(ns, allNodes)
  } else if (arg === "--rooted") {
    output = filterRootedVictims(ns, allNodes)
  } else if (arg === "--ready") {
    output = filterReadyToRoot(ns, allNodes)
  } else {
    ns.tprint("PRINT HELP")
  }

  ns.tprint(JSON.stringify(output, null, 2))
}

export { main }
