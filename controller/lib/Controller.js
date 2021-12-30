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
    const sortMaxMoneyDesc = (a, b) => b[1] - a[1]
    const victims = this.allNodes.filterIsWorthHacking().nodes

    const array = []
    for (const [name, node] of Object.entries(victims)) {
      array.push([name, node.maxMoney])
    }

    array.sort(sortMaxMoneyDesc)
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

  // calcBotnetRamAvailable() {
  //   let botnetAvailableRam = 0
  //   for (const name of this.attackerOrder) {
  //     const node = this.allNodes.nodes[name]
  //     botnetAvailableRam += node.availableRam
  //   }
  //   return botnetAvailableRam
  // }

  async calcMaxThreadsPerAttackerNode() {
    const array = []
    const primaryAttackFile = this.attackFiles[0]
    let availableRam = 0
    let scriptRam = 0
    for (const name of this.attackerOrder) {
      availableRam = this.allNodes.nodes[name].availableRam
      if (name === "home") availableRam -= 20
      scriptRam = this._ns.getScriptRam(primaryAttackFile, name)
      array.push([name, Math.floor(availableRam / scriptRam)])
    }
    return array
  }

  calcTotalBotnetThreads(maxThreadsPerAttackerNode) {
    let totalThreads = 0
    for (const nameThreadsArr of maxThreadsPerAttackerNode) {
      totalThreads += nameThreadsArr[1]
    }
    return totalThreads
  }

  calcPerfectThreadsForWeaken(victim) {
    const node = this.allNodes.nodes[victim]
    const gap = node.securityLevel - node.minSecurityLevel
    let threads = 1
    while (true) {
      if (this._ns.weakenAnalyze(threads) >= gap) break
      threads++
    }
    return threads
  }

  calcPerfectThreadsForHack(victim) {
    const singleThreadGrowthPercent = this._ns.hackAnalyze(victim)
    const threads = Math.floor(100 / singleThreadGrowthPercent)
    return threads
  }

  calcPerfectThreadsForGrow(victim) {
    const node = this.allNodes.nodes[victim]
    let multiplier = 1
    if (node.money === 0) multiplier = 10 ** 5
    if (node.money > 0)
      multiplier = (node.maxMoney * this.growTarget) / node.money
    const threads = this._ns.growthAnalyze(node.serverName, multiplier)
    return Math.round(threads)
  }

  async launchDistributedAttack() {
    await this.cpFilesToAttackers()
    const maxThreadsPerAttackerNode = await this.calcMaxThreadsPerAttackerNode()
    const totalBotnetThreads = this.calcTotalBotnetThreads(
      maxThreadsPerAttackerNode
    )
    const attackFile = this.attackFiles[0]
    let attackerNode = null
    let victimNode = null
    let botnetThreads = totalBotnetThreads
    let attackMaxThreads = 0
    let perfectThreads = 0
    let threads = 0

    for (const victimName of this.victimOrder) {
      victimNode = this.allNodes.nodes[victimName]

      switch (victimNode.recommendedAction) {
        case ACTIONS.WEAKEN_SECURITY:
          perfectThreads = this.calcPerfectThreadsForWeaken(victimName)
        case ACTIONS.GROW_MONEY:
          perfectThreads = this.calcPerfectThreadsForGrow(victimName)
        case ACTIONS.STEAL_MONEY:
          perfectThreads = this.calcPerfectThreadsForHack(victimName)
      }

      for (const attackerName of this.attackerOrder) {
        attackerNode = this.allNodes.nodes[attackerName]
        attackMaxThreads = maxThreadsPerAttackerNode
          .filter((i) => i[0] === attackerName)
          .flat()[1]

        if (attackMaxThreads < 1) continue

        threads = attackMaxThreads
        if (attackMaxThreads > perfectThreads)
          threads = attackMaxThreads - perfectThreads

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

        perfectThreads -= threads
        botnetThreads -= threads
        if (perfectThreads < 1) break
      }
      if (botnetThreads < 1) break
    }
  }
}

export { Controller }
