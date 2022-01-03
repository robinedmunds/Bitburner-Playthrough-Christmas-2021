/** @param {NS} ns **/
import { firstNames, surnames } from "/scripts/gang/names.js"

class Item {
  #parent

  constructor(parent, name) {
    this.#parent = parent
    this.id = name
    this.cost = this.#parent._ns.gang.getEquipmentCost(this.id)
    this.type = this.#parent._ns.gang.getEquipmentType(this.id)
    this.stats = this.#parent._ns.gang.getEquipmentStats(this.id)
  }
}

class GangMember {
  #parent

  constructor(parent, name) {
    this.#parent = parent
    this.name = name
    this.info = this.#parent._ns.gang.getMemberInformation(this.name)
    this.ascensionReward = this.#parent._ns.gang.getAscensionResult(this.name)
  }

  setMemberTask(taskId) {
    const taskIds = this._ns.gang.getTaskNames()
    if (!taskIds.includes(taskId)) throw `ERROR: ${taskId} is not a valid task.`
    this.#parent._ns.gang.setMemberTask(taskId)
  }

  ascend() {
    // this.#parent._ns.gang.ascendMember(this.name)
    this.#parent._ns.print(
      `ERROR: ascend not implented. Write checks to see if ascending is beneficial.`
    )
  }
}

class Gang {
  constructor(ns) {
    this._ns = ns
    this.info = this._ns.gang.getGangInformation()
    this.members = this.buildMembers()
    this.equipmentCatalogue = this.buildEquipmentCatalogue()
    this.potentialTasks = this.buildPotentialTasks()
    this.otherGangs = this._ns.gang.getOtherGangInformation()
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

const gang = [
  "ascendMember",
  "canRecruitMember",
  "createGang",
  "getAscensionResult",
  "getBonusTime",
  "getChanceToWinClash",

  "getEquipmentCost",
  "getEquipmentNames",
  "getEquipmentStats",
  "getEquipmentType",

  "getGangInformation",
  "getMemberInformation",
  "getMemberNames",
  "getOtherGangInformation",
  "getTaskNames",
  "getTaskStats",
  "inGang",
  "purchaseEquipment",
  "recruitMember",
  "setMemberTask",
  "setTerritoryWarfare"
]

const main = (ns) => {
  if (ns.gang.inGang() === false) {
    ns.tprint("ERROR: You are not a member of any gang!")
    return
  }

  const gang = new Gang(ns)

  ns.tprint(JSON.stringify(gang, null, 2))
}

export { main }
