/** @param {NS} ns **/
import { AllNodes } from "/scripts/hacking/lib/AllNodes.js"

const calcTotalStealableMoney = (rootedVictims) => {
  let stealable = 0

  for (const [nodeName, node] of Object.entries(rootedVictims.nodes)) {
    stealable = stealable + node.money
  }

  return stealable
}

const getMeanRatio = (worthHacking, type) => {
  const nodeCount = worthHacking.count
  let sumOfRatios = 0.0

  for (const [nodeName, node] of Object.entries(worthHacking.nodes)) {
    sumOfRatios = sumOfRatios + node[type]
  }

  return sumOfRatios / nodeCount
}

const calcRamStats = (myServers) => {
  let totalRam = 0
  let totalUsedRam = 0

  for (const [name, node] of Object.entries(myServers.nodes)) {
    totalRam = totalRam + node.maxRAM
    totalUsedRam = totalUsedRam + node.usedRAM
  }

  const meanRamPerServer = totalRam / myServers.count
  const meanRamUtilisation = totalUsedRam / totalRam

  return { totalRam, totalUsedRam, meanRamPerServer, meanRamUtilisation }
}

const main = (ns) => {
  const allNodesObj = new AllNodes(ns)
  const myServers = allNodesObj.filterMyServers()
  const rootedVictims = allNodesObj.filterRootedVictims()
  const worthHacking = allNodesObj.filterIsWorthHacking()
  const readyToRoot = allNodesObj.filterReadyToRoot()

  const stealableMoney = calcTotalStealableMoney(rootedVictims)
  const stealableInBillions = stealableMoney / 10 ** 9

  const meanMoneyRatio = getMeanRatio(worthHacking, "moneyRatio")
  const meanSecurityRatio = getMeanRatio(worthHacking, "securityRatio")

  const { totalRam, totalUsedRam, meanRamPerServer, meanRamUtilisation } =
    calcRamStats(myServers)
  const maxRamPossible = 25 * ns.getPurchasedServerMaxRam()
  const totalRamMaxRamRatio = totalRam / maxRamPossible

  const convertToTB = (gb) => gb / 1024

  const totalRamTB = convertToTB(totalRam)
  const totalUsedRamTB = convertToTB(totalUsedRam)
  const meanRamPerServerTB = convertToTB(meanRamPerServer)

  ns.tprint("*************************")
  ns.tprint("***  OVERVIEW SCRIPT  ***")
  ns.tprint("*************************")
  ns.tprint("")
  ns.tprint("NODE COUNTS")
  ns.tprint("")
  ns.tprint(`My servers: ${myServers.count} / 25`)
  ns.tprint(`Total RAM: ${totalRamTB.toLocaleString("en-GB")} TB`)
  ns.tprint(`Used RAM: ${totalUsedRamTB.toLocaleString("en-GB")} TB`)
  ns.tprint(
    `Mean RAM per server: ${meanRamPerServerTB.toLocaleString("en-GB")} TB`
  )
  ns.tprint(`Mean RAM utilisation: ${meanRamUtilisation.toFixed(3)}`)
  ns.tprint(`Max RAM ratio: ${totalRamMaxRamRatio.toFixed(3)}`)
  ns.tprint("")
  ns.tprint(`All nodes:  ${allNodesObj.count}`)
  ns.tprint(`Rooted victim nodes:  ${rootedVictims.count}`)
  ns.tprint(`Nodes worth hacking:  ${worthHacking.count}`)
  ns.tprint(`Ready to be rooted:  ${readyToRoot.count}`)
  ns.tprint("")
  ns.tprint("ROOTED AND WORTH HACKING NODE STATS")
  ns.tprint("")
  ns.tprint(`Mean security ratio:  ${meanSecurityRatio.toFixed(3)}`)
  ns.tprint(`Mean money ratio:  ${meanMoneyRatio.toFixed(3)}`)
  ns.tprint("")
  ns.tprint(
    `Total stealable money:  \$ ${stealableInBillions
      .toFixed(1)
      .toLocaleString("en-GB")} billion`
  )
}

export { main }
