/** @param {NS} ns **/

const ACTIONS = {
  WEAKEN_SECURITY: "WEAKEN_SECURITY",
  GROW_MONEY: "GROW_MONEY",
  STEAL_MONEY: "STEAL_MONEY",
  DO_NOTHING: "DO_NOTHING"
}

const TARGET_MONEY_RATIO = 0.1

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
    this.isRootable = this.#isRootable()
    this.securityLevel = this.#ns.getServerSecurityLevel(target)
    this.minSecurityLevel = this.#ns.getServerMinSecurityLevel(target)
    this.securityRatio = this.#calcSecurityRatio(target)
    this.money = this.#ns.getServerMoneyAvailable(target)
    this.maxMoney = this.#ns.getServerMaxMoney(target)
    this.moneyRatio = this.#calcMoneyRatio()
    this.isWorthHacking = this.#isWorthHacking()
    this.openPortsRequired = this.#ns.getServerNumPortsRequired(target)
    this.maxRAM = this.#ns.getServerMaxRam(target)
    this.usedRAM = this.#ns.getServerUsedRam(target)
    this.availableRam = this.maxRAM - this.usedRAM
    this.ramUtilisation = this.#calcRamUtilisation()
    this.growthMultiplier = this.#ns.getServerGrowth(target)
    this.hackTime = this.#ns.getHackTime(target)
    this.growTime = this.#ns.getGrowTime(target)
    this.weakenTime = this.#ns.getWeakenTime(target)
    this.hackChance = this.#ns.hackAnalyzeChance(target)
    this.recommendedAction = this.#recommendedAction()
  }

  #isRootable() {
    const myHackingLevel = this.#ns.getHackingLevel()
    return myHackingLevel >= this.hackingLevel
  }

  #recommendedAction() {
    if (!this.isRooted) return ACTIONS.DO_NOTHING
    if (this.hackChance < this.securityRatio) return ACTIONS.WEAKEN_SECURITY
    if (this.money < this.maxMoney * TARGET_MONEY_RATIO)
      return ACTIONS.GROW_MONEY
    return ACTIONS.STEAL_MONEY
  }

  #isWorthHacking() {
    const tenMillion = 10 ** 7
    if (this.maxMoney < tenMillion) return false
    return true
  }

  #calcMoneyRatio() {
    if (this.money <= 0) return 0
    if (this.maxMoney <= 0) return 0
    return this.money / this.maxMoney
  }

  #calcRamUtilisation() {
    if (this.maxRAM === 0) return 1
    return this.usedRAM / this.maxRAM
  }

  #calcSecurityRatio() {
    if (this.securityLevel <= 0) return 1
    return this.minSecurityLevel / this.securityLevel
  }

  #isServerBelongingToMe() {
    const regex = /^slave-/
    return this.serverName.match(regex) !== null
  }
}

export { NodeDetail }
