/** @param {NS} ns **/

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
    this.childNodes = this.#ns.scan(target)
  }

  #isRootable(target) {
    const myHackingLevel = this.#ns.getHackingLevel()
    const nodeLevel = this.#ns.getServerRequiredHackingLevel(target)
    return myHackingLevel >= nodeLevel
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