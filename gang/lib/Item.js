/** @param {NS} ns **/

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

export { Item }
