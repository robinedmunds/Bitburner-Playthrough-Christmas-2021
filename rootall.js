/** @param {NS} ns **/
import { AllNodes } from "/scripts/lib/classes.js"

const fileExistsOnHome = (ns, filename) => ns.fileExists(filename, "home")

const getExistingPortOpeners = (ns) => {
  const allPortOpeners = {
    "BruteSSH.exe": ns.brutessh,
    "FTPCrack.exe": ns.ftpcrack,
    "relaySMTP.exe": ns.relaysmtp,
    "HTTPWorm.exe": ns.httpworm,
    "SQLInject.exe": ns.sqlinject
  }
  const output = {}

  for (const filename of Object.keys(allPortOpeners)) {
    if (fileExistsOnHome(ns, filename) === true) {
      output[filename] = allPortOpeners[filename]
    }
  }

  return output
}

const rootNode = (ns, node) => {
  const portOpeners = getExistingPortOpeners(ns)
  const portOpenersCount = Object.keys(portOpeners).length
  let portsOpened = 0

  if (portOpenersCount < node.openPortsRequired) {
    ns.tprint(
      `WARNING:  Can not root ${node.serverName}. Insufficient port openers. ${node.openPortsRequired} open ports needed, ${portOpenersCount} port openers available.`
    )
    return null
  }

  Object.keys(portOpeners).forEach((key, idx) => {
    if (node.openPortsRequired >= idx + 1) {
      portOpeners[key](node.serverName)
      portsOpened++
    }
  })

  if (!fileExistsOnHome(ns, "NUKE.exe")) {
    ns.tprint("ERROR: NUKE.exe missing on home")
    return "BREAK"
  }

  ns.nuke(node.serverName)
  ns.tprint(
    `INFO:  Opened ${portsOpened} port(s) and rooted ${node.serverName} successfully.`
  )
  return true
}

const rootNodes = (ns, nodes) => {
  for (const [name, node] of Object.entries(nodes)) {
    const rootAttempt = rootNode(ns, node)
  }
}

const main = async (ns) => {
  const allNodesObj = new AllNodes(ns)
  const readyToRoot = allNodesObj.filterReadyToRoot()

  rootNodes(ns, readyToRoot.nodes)
}

export { main }
