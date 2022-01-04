/** @param {NS} ns **/

class GangMember {
  #parent

  constructor(parent, name) {
    this.#parent = parent
    this.name = name
    this.info = this.#parent._ns.gang.getMemberInformation(this.name)
    this.ascensionReward = this.#parent._ns.gang.getAscensionResult(this.name)
  }

  setTask(taskId) {
    const taskIds = this.#parent._ns.gang.getTaskNames()
    if (!taskIds.includes(taskId)) throw `ERROR: ${taskId} is not a valid task.`
    this.#parent._ns.gang.setMemberTask(this.name, taskId)
  }

  ascend() {
    const meanAscensionReward =
      [
        this.ascensionReward.hack,
        this.ascensionReward.str,
        this.ascensionReward.def,
        this.ascensionReward.dex,
        this.ascensionReward.agi,
        this.ascensionReward.cha
      ].reduce((runningTotal, curr) => runningTotal + curr) / 6

    if (meanAscensionReward >= 3) this.#parent._ns.gang.ascendMember(this.name)
  }

  purchaseItem(itemId) {
    this.#parent._ns.gang.purchaseEquipment(this.name, itemId)
  }
}

export { GangMember }
