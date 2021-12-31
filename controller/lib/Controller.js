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
    this.maxThreadsPerAttackerNode = null
    this.botnetThreads = null

    this.init()
  }

  async init() {
    this.maxThreadsPerAttackerNode = await this.calcMaxThreadsPerAttackerNode()
    this.botnetThreads = this.calcTotalBotnetThreads()
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

  async calcMaxThreadsPerAttackerNode() {
    const array = []
    const primaryAttackFile = this.attackFiles[0]
    let availableRam = 0
    let scriptRam = 0
    for (const name of this.attackerOrder) {
      availableRam = this.allNodes.nodes[name].availableRam
      if (name === "home") availableRam -= 20
      scriptRam = await this._ns.getScriptRam(primaryAttackFile, name)
      array.push([name, Math.floor(availableRam / scriptRam)])
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

  async attackerLoop({ victimName, perfectThreads }) {
    const victimNode = this.allNodes.nodes[victimName]
    const attackFile = this.attackFiles[0]
    let attackerNode = null
    let attackerMaxThreads = undefined
    let threads = undefined
    let threadsExecuted = 0

    for (const attackerName of this.attackerOrder) {
      attackerNode = this.allNodes.nodes[attackerName]
      attackerMaxThreads = this.maxThreadsPerAttackerNode
        .filter((i) => i[0] === attackerName)
        .flat()[1]

      threads = attackerMaxThreads
      if (attackerMaxThreads > perfectThreads) threads = perfectThreads
      if (threads < 1) continue

      this._ns.print(
        `INFO:  Launch remote ${victimNode.recommendedAction} attack of ${victimNode.serverName} using ${threads} threads on ${attackerName}`
      )

      await this._ns.exec(
        attackFile,
        attackerName,
        threads,
        victimNode.serverName,
        victimNode.recommendedAction
      )

      threadsExecuted -= threads
      perfectThreads -= threads
      if (perfectThreads < 1) break
    }

    return { threadsExecuted }
  }

  async launchDistributedAttack() {
    let victimNode = null
    let perfectThreads = 0
    let threadsExecuted = 0

    await this.cpFilesToAttackers()

    for (const victimName of this.victimOrder) {
      victimNode = this.allNodes.nodes[victimName]
      perfectThreads = this.calcPerfectThreadsForAction(
        victimNode.recommendedAction,
        victimName
      )

      threadsExecuted = await this.attackerLoop({
        victimName,
        perfectThreads
      }).threadsExecuted

      this.botnetThreads -= threadsExecuted
      if (this.botnetThreads < 1) break
    }
  }
}

export { Controller }
