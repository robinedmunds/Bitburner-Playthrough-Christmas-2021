/** @param {NS} ns **/
import { GangMember } from "/scripts/gang/lib/GangMember.js"
import { Item } from "/scripts/gang/lib/Item.js"
import { firstNames, surnames } from "/scripts/gang/lib/names.js"

class Gang {
  constructor(ns) {
    this._ns = ns
    this.info = this._ns.gang.getGangInformation()
    this.members = this.buildMembers()
    this.equipmentCatalogue = this.buildEquipmentCatalogue()
    this.potentialTasks = this.buildPotentialTasks()
    this.otherGangs = this._ns.gang.getOtherGangInformation()
    this.respectGainTaskOrder = this.sortTaskRespectGainDesc()
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

  buildMembers() {
    const memberNames = this._ns.gang.getMemberNames()
    const o = {}
    for (const name of memberNames) {
      o[name] = new GangMember(this, name)
    }
    return o
  }

  buildEquipmentCatalogue() {
    const equipmentNames = this._ns.gang.getEquipmentNames()
    const o = {}
    for (const name of equipmentNames) {
      o[name] = new Item(this, name)
    }
    return o
  }

  buildPotentialTasks() {
    const taskIds = this._ns.gang.getTaskNames()
    const o = {}
    for (const id of taskIds) {
      o[id] = {
        id: id,
        stats: this._ns.gang.getTaskStats(id)
      }
    }
    return o
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
