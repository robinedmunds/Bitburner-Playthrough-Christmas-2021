/** @param {NS} ns **/

class GangMember {
  #parent

  constructor(parent, name) {
    this.#parent = parent
    this.name = name
    this.info = this.#parent._ns.gang.getMemberInformation(this.name)
    this.ascensionReward = this.#parent._ns.gang.getAscensionResult(this.name)
  }

  setMemberTask(taskId) {
    const taskIds = this.#parent._ns.gang.getTaskNames()
    if (!taskIds.includes(taskId)) throw `ERROR: ${taskId} is not a valid task.`
    this.#parent._ns.gang.setMemberTask(this.name, taskId)
  }

  ascend() {
    // this.#parent._ns.gang.ascendMember(this.name)
    this.#parent._ns.print(
      `ERROR: ascend not implented. Write checks to see if ascending is beneficial.`
    )
  }
}

export { GangMember }
