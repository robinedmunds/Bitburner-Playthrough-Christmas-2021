/** @param {NS} ns **/

class Upgrades {
  constructor(ns, id) {
    this.level = { type: "level", cost: ns.hacknet.getLevelUpgradeCost(id) }
    this.ram = { type: "ram", cost: ns.hacknet.getRamUpgradeCost(id) }
    this.core = { type: "core", cost: ns.hacknet.getCoreUpgradeCost(id) }
    this.cheapest = this.getCheapestUpgrade()
  }

  getCheapestUpgrade() {
    const minUpgradeCost = Math.min(
      ...[this.level.cost, this.ram.cost, this.core.cost]
    )

    for (const upgrade of [this.level, this.ram, this.core]) {
      if (upgrade.cost === minUpgradeCost) return upgrade
    }
  }
}

class Node {
  constructor(ns, id) {
    this.id = id
    this.upgrades = new Upgrades(ns, id)
    this.stats = ns.hacknet.getNodeStats(this.id)
  }
}

const buildNodesArray = (ns) => {
  const nodeCount = ns.hacknet.numNodes()
  const nodes = []
  for (let id = 0; id < nodeCount; id++) {
    nodes.push(new Node(ns, id))
  }
  return nodes
}

const findCheapestUpgrade = (ns, nodes) => {
  const sorted = nodes.sort((a, b) => {
    const upgradeCostA = a.upgrades.cheapest.cost
    const upgradeCostB = b.upgrades.cheapest.cost
    if (upgradeCostA > upgradeCostB) return 1
    return -1
  })

  return sorted[0]
}

const makePurchase = (ns, cheapestUpgrade, newNodeCost) => {
  const purchaseFuncs = {
    level: ns.hacknet.upgradeLevel,
    ram: ns.hacknet.upgradeRam,
    core: ns.hacknet.upgradeCore,
    newNode: ns.hacknet.purchaseNode
  }
  const upgradeCost = cheapestUpgrade.upgrades.cheapest.cost

  if (upgradeCost < newNodeCost) {
    const upgradeType = cheapestUpgrade.upgrades.cheapest.type
    const nodeId = cheapestUpgrade.id
    ns.tprint(`*** upgrading ${upgradeType} on nodeId: ${nodeId} ***`)
    return purchaseFuncs[upgradeType](nodeId)
  }

  ns.tprint(`*** purchasing new node ***`)
  return purchaseFuncs["newNode"]()
}

const getUpgradeCost = (obj) => obj.upgrades.cheapest.cost

const main = (ns) => {
  const moneyToSpend = ns.args[0]

  if (typeof moneyToSpend !== "number") {
    ns.tprint("ERROR:  Requires amount to spend as first argument.")
    return
  }
  let nodes = buildNodesArray(ns)
  let cheapestUpgrade = findCheapestUpgrade(ns, nodes)
  let cheapestUpgradeCost = getUpgradeCost(cheapestUpgrade)
  let newNodeCost = ns.hacknet.getPurchaseNodeCost()

  while (moneyToSpend > Math.min(cheapestUpgradeCost, newNodeCost)) {
    makePurchase(ns, cheapestUpgrade, newNodeCost)

    nodes = buildNodesArray(ns)
    cheapestUpgrade = findCheapestUpgrade(ns, nodes)
    cheapestUpgradeCost = getUpgradeCost(cheapestUpgrade)
    newNodeCost = ns.hacknet.getPurchaseNodeCost()
  }
}

export { main }
