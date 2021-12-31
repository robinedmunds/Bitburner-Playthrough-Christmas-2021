/** @param {NS} ns **/
import { AllNodes } from "/scripts/controller/lib/AllNodes.js"

const ACTIONS = {
  WEAKEN_SECURITY: "WEAKEN_SECURITY",
  GROW_MONEY: "GROW_MONEY",
  STEAL_MONEY: "STEAL_MONEY",
  DO_NOTHING: "DO_NOTHING"
}

class Controller {
  constructor(ns) {
    this._ns = ns
    this.startTime = new Date()
    this.allNodes = new AllNodes(ns)
    this.myMoney = this.getMyMoney()
    this.victimOrder = this.buildVictimOrder()
    this.attackerOrder = this.buildAttackerOrder()
    this.growTarget = 0.15
    this.attackFiles = ["/scripts/controller/dist/attack.js"]
  }

  getMyMoney() {
    return this.allNodes.nodes["home"].money
  }

  buildVictimOrder() {
    const sortAttackPriorityDesc = (a, b) => b[1] - a[1]
    const victims = this.allNodes.filterIsWorthHacking().nodes

    const array = []
    for (const [name, node] of Object.entries(victims)) {
      array.push([name, node.attackPriority])
    }

    array.sort(sortAttackPriorityDesc)
    return array.flat().filter((i) => typeof i === "string")
  }

  buildAttackerOrder() {
    const sortAvailableRamDesc = (a, b) => b[1] - a[1]
    const myServers = this.allNodes.filterMyServers().nodes
    const botnet = this.allNodes.filterBotnet().nodes
    const home = this.allNodes.nodes["home"]
    const attackers = { ...myServers, ...botnet, ...{ home: home } }

    const array = []
    for (const [name, node] of Object.entries(attackers)) {
      array.push([name, node.availableRam])
    }

    array.sort(sortAvailableRamDesc)
    return array.flat().filter((i) => typeof i === "string")
  }

  async cpFilesToAttackers() {
    for (const name of this.attackerOrder) {
      for (const file of this.attackFiles) {
        if (name !== "home") {
          await this._ns.scp(file, name)
        }
      }
    }
  }

  calcPerfectThreadsForWeaken(victim) {
    const node = this.allNodes.nodes[victim]
    const gap = node.securityLevel - node.minSecurityLevel
    const targetSecLevel = gap * (node.hackChance * 1.1)
    let threads = 1
    while (true) {
      if (this._ns.weakenAnalyze(threads) >= targetSecLevel) break
      threads++
    }
    return threads
  }

  calcPerfectThreadsForHack(victim) {
    const singleThreadGrowthPercent = this._ns.hackAnalyze(victim)
    const threads = Math.floor(85 / singleThreadGrowthPercent)
    return threads
  }

  calcPerfectThreadsForGrow(victim) {
    const node = this.allNodes.nodes[victim]
    let multiplier = 1
    if (node.money === 0) multiplier = 10 ** 5
    if (node.money > 0)
      multiplier = (node.maxMoney * this.growTarget) / node.money
    if (multiplier < 1) return 0
    const threads = this._ns.growthAnalyze(node.serverName, multiplier)
    return Math.round(threads)
  }

  calcPerfectThreadsForAction(action, victimName) {
    switch (action) {
      case ACTIONS.WEAKEN_SECURITY:
        return this.calcPerfectThreadsForWeaken(victimName)
      case ACTIONS.GROW_MONEY:
        return this.calcPerfectThreadsForGrow(victimName)
      case ACTIONS.STEAL_MONEY:
        return this.calcPerfectThreadsForHack(victimName)
      default:
        return 0
    }
  }

  calcMaxThreadsPerAttackerNode() {
    // if attack file is not on target, getScriptRam returns null
    const array = []
    const primaryAttackFile = this.attackFiles[0]
    let availableRam = 0
    let scriptRam = 0
    let maxThreads = 0
    for (const name of this.attackerOrder) {
      availableRam = this.allNodes.nodes[name].availableRam
      if (name === "home") availableRam -= 20
      scriptRam = this._ns.getScriptRam(primaryAttackFile, name)
      maxThreads = Math.floor(availableRam / scriptRam)
      if (typeof maxThreads !== "number") maxThreads = 0
      array.push([name, maxThreads])
    }
    return array
  }

  calcTotalBotnetThreads() {
    let totalThreads = 0
    for (const nameThreadsArr of this.maxThreadsPerAttackerNode) {
      totalThreads += nameThreadsArr[1]
    }
    return totalThreads
  }

  attackerLoop() {}

  async launchDistributedAttack() {
    await this.cpFilesToAttackers()
    this._ns.tprint(this.calcMaxThreadsPerAttackerNode())
  }
}

export { Controller }
