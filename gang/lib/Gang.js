/** @param {NS} ns **/
import { GangMember } from "/scripts/gang/lib/GangMember.js"
import { Item } from "/scripts/gang/lib/Item.js"
import { firstNames, surnames } from "/scripts/gang/lib/names.js"

class Gang {
  constructor(ns) {
    this._ns = ns
    this.info = this._ns.gang.getGangInformation()
    this.memberNames = this._ns.gang.getMemberNames()
    this.members = this.buildMembers()
    this.equipmentNames = this._ns.gang.getEquipmentNames()
    this.equipmentCatalogue = this.buildEquipmentCatalogue()
    this.taskNames = this._ns.gang.getTaskNames()
    this.potentialTasks = this.buildPotentialTasks()
    this.respectGainTaskOrder = this.sortTaskRespectGainDesc()
    this.moneyGainTaskOrder = this.sortTaskMoneyGainDesc()
    this.otherGangs = this.buildOtherGangs()
    this.myMoney = this._ns.getServerMoneyAvailable("home")
  }

  buildMembers() {
    const o = {}
    for (const name of this.memberNames) {
      o[name] = new GangMember(this, name)
    }
    return o
  }

  buildEquipmentCatalogue() {
    const o = {}
    for (const name of this.equipmentNames) {
      o[name] = new Item(this, name)
    }
    return o
  }

  buildPotentialTasks() {
    const o = {}
    for (const taskName of this.taskNames) {
      o[taskName] = {
        id: taskName,
        stats: this._ns.gang.getTaskStats(taskName)
      }
    }
    return o
  }

  sortTaskMoneyGainDesc() {
    const sortBaseMoneyDesc = (a, b) => b[1] - a[1]
    const arr = []
    for (const [taskId, task] of Object.entries(this.potentialTasks)) {
      arr.push([taskId, task.stats.baseMoney])
    }
    arr.sort(sortBaseMoneyDesc)
    return arr.flat().filter((i) => typeof i === "string")
  }

  sortTaskRespectGainDesc() {
    const sortBaseRespectDesc = (a, b) => b[1] - a[1]
    const arr = []
    for (const [taskId, task] of Object.entries(this.potentialTasks)) {
      arr.push([taskId, task.stats.baseRespect])
    }
    arr.sort(sortBaseRespectDesc)
    return arr.flat().filter((i) => typeof i === "string")
  }

  buildOtherGangs() {
    const gangInfo = this._ns.gang.getOtherGangInformation()
    const o = {}
    let clashChance = null
    for (const [key, value] of Object.entries(gangInfo)) {
      clashChance = this._ns.gang.getChanceToWinClash(key)
      o[key] = { ...value, clashChance }
    }
    return o
  }

  enableGangWarfare() {
    this._ns.gang.setTerritoryWarfare(true)
  }

  disableGangWarfare() {
    this._ns.gang.setTerritoryWarfare(false)
  }

  generateRandomName() {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const surname = surnames[Math.floor(Math.random() * surnames.length)]
    return `${firstName} ${surname}`
  }

  attemptToRecruitNewMember() {
    if (!this._ns.gang.canRecruitMember()) return false

    const existingNames = this._ns.gang.getMemberNames()
    let newName = this.generateRandomName()
    while (existingNames.includes(newName)) {
      newName = this.generateRandomName()
    }

    if (this._ns.gang.recruitMember(newName) === true) {
      this._ns.print(`INFO: Recruited new gang member, ${newName}`)
    }
  }
}

export { Gang }
