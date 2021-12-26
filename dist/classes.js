/** @param {NS} ns **/

class NodeDetail {
  constructor(ns, target) {
    if (!ns.serverExists(target)) {
      ns.tprint(`ERROR:  ${target} is unreachable`)
      return null
    }

    this._ns = ns
    this.serverName = target
    this.isServerBelongingToMe = this.#isServerBelongingToMe(target)
    this.hackingLevel = ns.getServerRequiredHackingLevel(target)
    this.isRooted = ns.hasRootAccess(target)
    this.isRootable = this.#isRootable(target)
    this.isWorthHacking = this.#isWorthHacking(target)
    // this.canHack = this.isRootable // TODO: legacy, remove
    this.securityRatio = this.#calcSecurityRatio(target)
    this.securityLevel = ns.getServerSecurityLevel(target)
    this.minSecurityLevel = ns.getServerMinSecurityLevel(target)
    this.moneyRatio = this.#calcMoneyRatio(target)
    this.money = ns.getServerMoneyAvailable(target)
    this.maxMoney = ns.getServerMaxMoney(target)
    this.openPortsRequired = ns.getServerNumPortsRequired(target)
    this.ramUtilisation = this.#calcRamUtilisation(target)
    this.maxRAM = ns.getServerMaxRam(target)
    this.usedRAM = ns.getServerUsedRam(target)
    this.availableRam = this.#calcAvailableRam(target)
    this.childNodes = ns.scan(target)
  }

  #isRootable(target) {
    const myHackingLevel = this._ns.getHackingLevel()
    const nodeLevel = this._ns.getServerRequiredHackingLevel(target)
    return myHackingLevel >= nodeLevel
  }

  #isWorthHacking(target) {
    const maxMoney = this._ns.getServerMaxMoney(target)
    const tenMillion = 10 ** 7

    if (maxMoney < tenMillion) return false
    return true
  }

  #calcMoneyRatio(target) {
    const currentMoney = this._ns.getServerMoneyAvailable(target)
    const maxMoney = this._ns.getServerMaxMoney(target)

    if (currentMoney === 0) return 0
    if (maxMoney === 0) return 0
    return currentMoney / maxMoney
  }

  #calcRamUtilisation(target) {
    const usedRam = this._ns.getServerUsedRam(target)
    const maxRam = this._ns.getServerMaxRam(target)

    if (maxRam === 0) return 1
    return usedRam / maxRam
  }

  #calcAvailableRam(target) {
    return this._ns.getServerMaxRam(target) - this._ns.getServerUsedRam(target)
  }

  #calcSecurityRatio(target) {
    const minLevel = this._ns.getServerMinSecurityLevel(target)
    const currentLevel = this._ns.getServerSecurityLevel(target)

    if (currentLevel === 0) return 1
    return minLevel / currentLevel
  }

  #isServerBelongingToMe(target) {
    const myMachineNames = this._ns.getPurchasedServers()
    return myMachineNames.includes(target)
  }
}

class AllNodes {
  constructor(ns, root = "home") {
    if (!ns.serverExists(root)) {
      ns.tprint(`ERROR:  ${root} is unreachable`)
      return null
    }

    this._ns = ns
    this.rootNodeName = root
    this.allNodeNames = this.#fetchAllNodeNames(root)
    this.count = this.allNodeNames.length
    this.nodes = this.#buildNodes()
    this.totalNodes = this.count // TODO: legacy, remove
    this.allNodes = this.nodes // TODO: legacy, remove
  }

  #fetchAllNodeNames(root) {
    const allNodeNames = new Set()

    const recursive = (parent) => {
      const children = this._ns.scan(parent)

      for (const child of children) {
        if (!allNodeNames.has(child)) {
          allNodeNames.add(child)
          recursive(child)
        }
      }
    }

    recursive(root)
    return [...allNodeNames.values()]
  }

  #buildNodes() {
    const allNodeNames = this.allNodeNames
    const nodes = {}

    for (const name of allNodeNames) {
      if (!nodes[name]) {
        nodes[name] = new NodeDetail(this._ns, name)
      }
    }

    return nodes
  }

  // FILTER METHODS

  filterIsNotMine() {
    const nodes = {}
    let count = 0

    for (const [name, node] of Object.entries(this.allNodes)) {
      if (name !== "home" && !node.isServerBelongingToMe) {
        nodes[name] = node
        count++
      }
    }

    return { nodes, filter: "filterIsNotMine", count: count }
  }

  filterMyServers() {
    const nodes = {}
    let count = 0

    for (const [name, node] of Object.entries(this.allNodes)) {
      if (node.isServerBelongingToMe) {
        nodes[name] = node
        count++
      }
    }

    return { nodes, filter: "filterMyServers", count: count }
  }

  filterRootedVictims() {
    const notMyNodes = this.filterIsNotMine().nodes
    const nodes = {}
    let count = 0

    for (const [name, node] of Object.entries(notMyNodes)) {
      if (node.isRooted) {
        nodes[name] = node
        count++
      }
    }

    return { nodes, filter: "filterRootedVictims", count: count }
  }

  filterUnrootedVictims() {
    const notMyNodes = this.filterIsNotMine().nodes
    const nodes = {}
    let count = 0

    for (const [name, node] of Object.entries(notMyNodes)) {
      if (!node.isRooted) {
        nodes[name] = node
        count++
      }
    }

    return { nodes, filter: "filterUnrootedVictims", count: count }
  }

  filterIsWorthHacking() {
    const rootedVictims = this.filterRootedVictims().nodes
    const nodes = {}
    let count = 0

    for (const [name, node] of Object.entries(rootedVictims)) {
      if (node.isWorthHacking) {
        nodes[name] = node
        count++
      }
    }

    return { nodes, filter: "filterIsWorthHacking", count: count }
  }

  filterBotnet() {
    const rootedVictims = this.filterRootedVictims().nodes
    const nodes = {}
    const minRam = 4
    let count = 0

    for (const [name, node] of Object.entries(rootedVictims)) {
      if (node.maxRAM >= minRam) {
        nodes[name] = node
        count++
      }
    }

    return { nodes, filter: "filterBotnet", count: count }
  }

  filterReadyToRoot() {
    const notMyNodes = this.filterIsNotMine().nodes
    const nodes = {}
    let count = 0

    for (const [name, node] of Object.entries(notMyNodes)) {
      if (!node.isRooted && node.isRootable) {
        nodes[name] = node
        count++
      }
    }

    return { nodes, filter: "filterReadyToRoot", count: count }
  }

  // GET SPECIFIC NODE

  getHome() {
    return { home: this.allNodes["home"] }
  }
}

export { AllNodes, NodeDetail }
