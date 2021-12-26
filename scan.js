/** @param {NS} ns **/

import { AllNodes } from "/scripts/lib/classes.js"

const main = (ns) => {
  const firstArg = ns.args[0]
  const allNodesObj = new AllNodes(ns)

  const filterIsNotMine = allNodesObj.filterIsNotMine()
  const filterMyServers = allNodesObj.filterMyServers()
  const filterRootedVictims = allNodesObj.filterRootedVictims()
  const filterUnrootedVictims = allNodesObj.filterUnrootedVictims()
  const filterIsWorthHacking = allNodesObj.filterIsWorthHacking()
  const filterBotnet = allNodesObj.filterBotnet()
  const filterReadyToRoot = allNodesObj.filterReadyToRoot()
  const homeNode = allNodesObj.getHome()

  const options = [
    "--notmine",
    "--myservers",
    "--rooted",
    "--unrooted",
    "--worth",
    "--botnet",
    "--ready",
    "--home",
    "--all"
  ]

  let output = null

  ns.tprint("*********************")
  ns.tprint("***  SCAN SCRIPT  ***")
  ns.tprint("*********************")
  ns.tprint("")
  ns.tprint("OPTIONS")
  ns.tprint("")
  for (const opt of options) ns.tprint(`    ${opt}`)
  ns.tprint("")
  ns.tprint("")

  if (firstArg === options[options.indexOf("--notmine")])
    output = filterIsNotMine
  if (firstArg === options[options.indexOf("--myservers")])
    output = filterMyServers
  if (firstArg === options[options.indexOf("--rooted")])
    output = filterRootedVictims
  if (firstArg === options[options.indexOf("--unrooted")])
    output = filterUnrootedVictims
  if (firstArg === options[options.indexOf("--worth")])
    output = filterIsWorthHacking
  if (firstArg === options[options.indexOf("--botnet")]) output = filterBotnet
  if (firstArg === options[options.indexOf("--ready")])
    output = filterReadyToRoot
  if (firstArg === options[options.indexOf("--home")]) output = homeNode
  if (firstArg === options[options.indexOf("--all")]) output = all

  if (output) ns.tprint(JSON.stringify(output, null, 2))
}

export { main }
