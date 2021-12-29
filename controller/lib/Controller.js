/** @param {NS} ns **/
import { AllNodes } from "/scripts/controller/lib/AllNodes.js"

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
    const attackers = { ...myServers, ...botnet }

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

  async launchDistributedAttack() {
    // calc threads that will fit in each attacker node's ram
    // check effect of that many threads on grow/weaken/hack
    // pick node to focus attack on
    // execute appropriate action on all attacker nodes
    await this.cpFilesToAttackers()
    const maxThreadsPerAttackerNode = await this.calcMaxThreadsPerAttackerNode()
    const totalBotnetThreads = this.calcTotalBotnetThreads(
      maxThreadsPerAttackerNode
    )
    const victimNode = this.allNodes.nodes[this.victimOrder[0]]
    const attackFile = this.attackFiles[0]
    let attackerNode = null
    let threads = 0

    for (const attackerName of this.attackerOrder) {
      attackerNode = this.allNodes.nodes[attackerName]
      threads = maxThreadsPerAttackerNode
        .filter((i) => i[0] === attackerName)
        .flat()[1]

      if (threads < 1) continue
      this._ns.tprint(
        `INFO:  Launch remote ${victimNode.recommendedAction} attack of ${victimNode.serverName} using ${threads} threads on ${attackerName}`
      )

      await this._ns.exec(
        attackFile,
        attackerName,
        threads,
        victimNode.serverName,
        victimNode.recommendedAction
      )
    }
  }
}

export { Controller }
