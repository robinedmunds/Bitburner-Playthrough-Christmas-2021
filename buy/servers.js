/** @param {NS} ns **/
import { AllNodes } from "/scripts/lib/classes.js"

const PHONETIC = [
  "alpha",
  "bravo",
  "charlie",
  "delta",
  "echo",
  "foxtrot",
  "golf",
  "hotel",
  "india",
  "juliett",
  "kilo",
  "lima",
  "mike",
  "november",
  "oscar",
  "papa",
  "quebec",
  "romeo",
  "sierra",
  "tango",
  "uniform",
  "victor",
  "whiskey",
  "x-ray",
  "yankee",
  "zulu",
  "zero",
  "one",
  "two"
]

const MAX_SERVERS = 25
const HOSTNAME_PREFIX = "slave-"

const calcRamOfAffordableServer = (ns, moneyToSpend) => {
  if (typeof moneyToSpend !== "number") return null
  if (moneyToSpend <= 0) return null
  const maxRamPossible = ns.getPurchasedServerMaxRam()
  const maxRamCost = ns.getPurchasedServerCost(maxRamPossible)
  let cost = null
  let ram = maxRamPossible

  if (moneyToSpend > maxRamCost) {
    return { ram: maxRamPossible, cost: maxRamCost }
  }

  do {
    ram = ram / 2
    if (ram < 2) return null
    cost = ns.getPurchasedServerCost(ram)
  } while (cost > moneyToSpend)

  return { ram, cost }
}

const getWeakestServer = (myServers) => {
  const nodes = myServers.nodes
  const array = []

  for (const [name, node] of Object.entries(nodes)) {
    array.push([name, node.maxRAM])
  }

  const maxRamAsc = (a, b) => a[1] - b[1]
  array.sort(maxRamAsc)

  return array.flat().filter((i) => typeof i !== "number")[0]
}

const returnUniqueHostname = (ns) => {
  const existingNames = ns.getPurchasedServers()
  for (let i = 0; i < PHONETIC.length; i++) {
    const hostname = HOSTNAME_PREFIX + PHONETIC[i]
    if (!existingNames.includes(hostname)) return hostname
  }
  ns.tprint(`ERROR:  returnUniqueHostname is broken`)
}

const makePurchase = (ns, ram) => {
  const hostname = returnUniqueHostname(ns)
  if (ns.purchaseServer(hostname, ram) !== "") {
    ns.tprint(`INFO:  Purchased server ${hostname} with ${ram}GB of RAM.`)
  }
}

const deleteServer = (ns, serverName) => {
  ns.killall(serverName)
  if (ns.deleteServer(serverName) === true) {
    ns.tprint(`WARNING:  ${serverName} destroyed.`)
  }
}

const buyServers = (ns, ram, myServers) => {
  if (myServers.count >= MAX_SERVERS) {
    const weakestServerName = getWeakestServer(myServers)
    const weakestNode = myServers.nodes[weakestServerName]
    if (weakestNode.maxRAM === ns.getPurchasedServerMaxRam()) {
      ns.tprint("ERROR:  All servers have max possible RAM. Aborting...")
      return
    }
    if (weakestNode.maxRAM >= ram) {
      ns.tprint(
        "ERROR:  Trying to purchase server with less RAM than the weakest existing server. Aborting..."
      )
      return
    }
    deleteServer(ns, weakestServerName)
  }
  makePurchase(ns, ram)
}

const main = (ns) => {
  ns.enableLog("ALL")

  let confirm = false
  if (ns.args[0] === "--confirm") confirm = true

  const allNodesObj = new AllNodes(ns)

  let moneyFloor = undefined
  try {
    moneyFloor = JSON.parse(ns.readPort(1)).moneyFloor
  } catch (err) {}
  const moneyToSpend = allNodesObj.getHome().home.money - moneyFloor || 10 ** 6

  const { ram, cost } = calcRamOfAffordableServer(ns, moneyToSpend)
  const costInMillions = cost / 10 ** 6
  const moneyToSpendInMillions = moneyToSpend / 10 ** 6

  ns.tprint("**********************************")
  ns.tprint("***  SERVER PURCHASING SCRIPT  ***")
  ns.tprint("**********************************")
  ns.tprint("")
  ns.tprint("")
  ns.tprint(
    `To buy ${ram}GB server for \$${costInMillions.toLocaleString(
      "en-GB"
    )} mil, re-run the script with --confirm`
  )
  ns.tprint("")
  ns.tprint(
    "WARNING:  If max server count has been reached, purchasing a new server will REPLACE the weakest existing server"
  )
  ns.tprint("If a server is running scripts, it can NOT be deleted.")
  ns.tprint("")
  ns.tprint(
    `Available to spend ${moneyToSpendInMillions
      .toFixed(3)
      .toLocaleString("en-GB")} mil`
  )
  ns.tprint("")

  if (confirm === true) {
    ns.tprint("*********************")
    ns.tprint("***   CONFIRMED   ***")
    ns.tprint("*********************")
    ns.tprint("")

    const myServers = allNodesObj.filterMyServers()
    buyServers(ns, ram, myServers)
  }
}

export { main }
