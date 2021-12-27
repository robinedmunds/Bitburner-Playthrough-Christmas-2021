/** @param {NS} ns **/

const ACTIONS = {
  WEAKEN_SECURITY: "WEAKEN_SECURITY",
  GROW_MONEY: "GROW_MONEY",
  STEAL_MONEY: "STEAL_MONEY",
  DO_NOTHING: "DO_NOTHING"
}

class NodeDetail {
  #ns

  constructor(ns, target) {
    if (!ns.serverExists(target)) {
      ns.tprint(`ERROR:  ${target} is unreachable`)
      return null
    }

    this.#ns = ns
    this.serverName = target
    this.isServerBelongingToMe = this.#isServerBelongingToMe(target)
    this.hackingLevel = this.#ns.getServerRequiredHackingLevel(target)
    this.isRooted = this.#ns.hasRootAccess(target)
    this.isRootable = this.#isRootable(target)
    this.isWorthHacking = this.#isWorthHacking(target)
    this.securityRatio = this.#calcSecurityRatio(target)
    this.securityLevel = this.#ns.getServerSecurityLevel(target)
    this.minSecurityLevel = this.#ns.getServerMinSecurityLevel(target)
    this.moneyRatio = this.#calcMoneyRatio(target)
    this.money = this.#ns.getServerMoneyAvailable(target)
    this.maxMoney = this.#ns.getServerMaxMoney(target)
    this.openPortsRequired = this.#ns.getServerNumPortsRequired(target)
    this.ramUtilisation = this.#calcRamUtilisation(target)
    this.maxRAM = this.#ns.getServerMaxRam(target)
    this.usedRAM = this.#ns.getServerUsedRam(target)
    this.availableRam = this.#calcAvailableRam(target)
    this.growthMultiplier = this.#ns.getServerGrowth(target)
    this.hackTime = this.#ns.getHackTime(target)
    this.growTime = this.#ns.getGrowTime(target)
    this.weakenTime = this.#ns.getWeakenTime(target)
    this.hackChance = this.#ns.hackAnalyzeChance(target)
    this.childNodes = this.#ns.scan(target)
    this.recommendedAction = this.#recommendedAction()
  }

  #isRootable(target) {
    const myHackingLevel = this.#ns.getHackingLevel()
    const nodeLevel = this.#ns.getServerRequiredHackingLevel(target)
    return myHackingLevel >= nodeLevel
  }

  #recommendedAction() {
    if (!this.isRooted) return ACTIONS.DO_NOTHING
    if (this.money < this.maxMoney * 0.6) return ACTIONS.GROW_MONEY
    if (this.hackChance * this.hackTime > this.weakenTime)
      return ACTIONS.WEAKEN_SECURITY
    return ACTIONS.STEAL_MONEY
  }

  #isWorthHacking(target) {
    const maxMoney = this.#ns.getServerMaxMoney(target)
    const tenMillion = 10 ** 7

    if (maxMoney < tenMillion) return false
    return true
  }

  #calcMoneyRatio(target) {
    const currentMoney = this.#ns.getServerMoneyAvailable(target)
    const maxMoney = this.#ns.getServerMaxMoney(target)

    if (currentMoney === 0) return 0
    if (maxMoney === 0) return 0
    return currentMoney / maxMoney
  }

  #calcRamUtilisation(target) {
    const usedRam = this.#ns.getServerUsedRam(target)
    const maxRam = this.#ns.getServerMaxRam(target)

    if (maxRam === 0) return 1
    return usedRam / maxRam
  }

  #calcAvailableRam(target) {
    return this.#ns.getServerMaxRam(target) - this.#ns.getServerUsedRam(target)
  }

  #calcSecurityRatio(target) {
    const minLevel = this.#ns.getServerMinSecurityLevel(target)
    const currentLevel = this.#ns.getServerSecurityLevel(target)

    if (currentLevel === 0) return 1
    return minLevel / currentLevel
  }

  #isServerBelongingToMe(target) {
    const myMachineNames = this.#ns.getPurchasedServers()
    return myMachineNames.includes(target)
  }
}

export { NodeDetail }
