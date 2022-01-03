/** @param {NS} ns **/
import { Gang } from "/scripts/gang/lib/Gang.js"

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
  const mostRespectGainingTaskId = gang.respectGainTaskOrder[0]

  for (const [name, member] of Object.entries(gang.members)) {
    member.setMemberTask(mostRespectGainingTaskId)
  }
}

export { main }
