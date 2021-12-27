/** @param {NS} ns **/

const MONEY_FLOOR = 10 ** 12 * 11

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

const buildNodesArray = async (ns) => {
  const nodeCount = await ns.hacknet.numNodes()
  const nodes = []
  for (let id = 0; id < nodeCount; id++) {
    nodes.push(new Node(ns, id))
  }
  return nodes
}

const findCheapestUpgrade = async (ns, nodes) => {
  const sorted = nodes.sort((a, b) => {
    const upgradeCostA = a.upgrades.cheapest.cost
    const upgradeCostB = b.upgrades.cheapest.cost
    if (upgradeCostA > upgradeCostB) return 1
    return -1
  })

  return sorted[0]
}

const makePurchase = async (ns, cheapestUpgrade, newNodeCost) => {
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
    return await purchaseFuncs[upgradeType](nodeId)
  }

  ns.tprint(`*** purchasing new node ***`)
  return await purchaseFuncs["newNode"]()
}

const getMoneyToSpend = async (ns) => {
  return (await ns.getServerMoneyAvailable("home")) - MONEY_FLOOR
}

const getUpgradeCost = (obj) => obj.upgrades.cheapest.cost

const main = async (ns) => {
  let moneyToSpend = await getMoneyToSpend(ns)
  let nodes = await buildNodesArray(ns)
  let cheapestUpgrade = await findCheapestUpgrade(ns, nodes)
  let cheapestUpgradeCost = getUpgradeCost(cheapestUpgrade)
  let newNodeCost = await ns.hacknet.getPurchaseNodeCost()

  while (moneyToSpend > Math.min(cheapestUpgradeCost, newNodeCost)) {
    await makePurchase(ns, cheapestUpgrade, newNodeCost)

    moneyToSpend = await getMoneyToSpend(ns)
    nodes = await buildNodesArray(ns)
    cheapestUpgrade = await findCheapestUpgrade(ns, nodes)
    cheapestUpgradeCost = getUpgradeCost(cheapestUpgrade)
    newNodeCost = await ns.hacknet.getPurchaseNodeCost()
  }
}

export { main }
