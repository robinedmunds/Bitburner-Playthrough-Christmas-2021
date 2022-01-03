/** @param {NS} ns **/
import { AllNodes } from "/scripts/controller/lib/AllNodes.js"
import { Process } from "/scripts/controller/lib/Process.js"
import { ACTIONS, GROW_TARGET } from "/scripts/controller/lib/constants.js"

class Controller {
  constructor(ns) {
    this._ns = ns
    this.startTime = new Date()
    this.allNodes = new AllNodes(ns)
    this.myMoney = this.getMyMoney()
    this.victimOrder = this.buildVictimOrder()
    this.attackerOrder = this.buildAttackerOrder()
    this.growTarget = GROW_TARGET
    this.attackFiles = ["/scripts/controller/dist/attack.js"]
    this.maxThreadsPerAttackerNode = null
    this.totalBotnetThreads = null
    this.processes = []
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
        throw "Invalid ACTION argument passed to Controller:calcPerfectThreadsForAction."
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
      if (name === "home") availableRam -= 30
      scriptRam = this._ns.getScriptRam(primaryAttackFile, name)
      maxThreads = Math.floor((availableRam * 0.98) / scriptRam)
      if (maxThreads < 1) maxThreads = 0
      if (typeof scriptRam !== "number") {
        throw "calcMaxThreadsPerAttackerNode: getScriptRam returning null because file is not on target."
      }
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

  killRedundantProcesses() {
    let victimNode = null
    for (const process of this.processes) {
      victimNode = this.allNodes.nodes[process.victimName]
      if (victimNode.recommendedAction !== process.action) {
        process.kill()
        this.processes.splice(this.processes.indexOf(process), 1)
      }
    }
  }

  attackPrerequisites() {
    this.allNodes = new AllNodes(this._ns)
    this.victimOrder = this.buildVictimOrder()
    this.attackerOrder = this.buildAttackerOrder()
    this.maxThreadsPerAttackerNode = this.calcMaxThreadsPerAttackerNode()
    this.totalBotnetThreads = this.calcTotalBotnetThreads()
  }

  async victimLoop() {
    let victimNode = null
    let perfectThreads = null

    for (const victimName of this.victimOrder) {
      this.attackPrerequisites()

      await this._ns.sleep(100)

      if (this.totalBotnetThreads < 1) break
      victimNode = this.allNodes.nodes[victimName]
      perfectThreads = this.calcPerfectThreadsForAction(
        victimNode.recommendedAction,
        victimName
      )

      this.attackerLoop({ victimNode, perfectThreads })
    }
  }

  attackerLoop({ victimNode, perfectThreads }) {
    const attackFile = this.attackFiles[0]
    let attackerThreadsAvailable = null
    let threadsToRun = perfectThreads
    let threads = undefined
    let pid = 0

    for (const attackerName of this.attackerOrder) {
      attackerThreadsAvailable = this.maxThreadsPerAttackerNode.filter(
        (arr) => arr[0] === attackerName
      )[0][1]

      if (threadsToRun < 1) break
      if (attackerThreadsAvailable < 1) continue

      threads = attackerThreadsAvailable
      if (attackerThreadsAvailable > threadsToRun) {
        threads = threadsToRun
      }

      if (
        this._ns.isRunning(
          attackFile,
          attackerName,
          victimNode.serverName,
          victimNode.recommendedAction
        )
      )
        continue

      pid = 0
      pid = this._ns.exec(
        attackFile,
        attackerName,
        threads,
        victimNode.serverName,
        victimNode.recommendedAction
      )

      this._ns.print(
        `INFO: Executing attack from ${attackerName} -- ${victimNode.serverName}:${victimNode.recommendedAction} with ${threads} threads.`
      )

      if (pid !== 0) {
        // constructor(ns, pid, script, attackerName, victimName, action, threads)
        this.processes.push(
          new Process(
            this._ns,
            pid,
            attackFile,
            attackerName,
            victimNode.serverName,
            victimNode.recommendedAction,
            threads
          )
        )
      }
      threadsToRun -= threads
    }
  }

  async launchDistributedAttack() {
    await this.cpFilesToAttackers()
    this.killRedundantProcesses()
    await this.victimLoop()
  }
}

export { Controller }
