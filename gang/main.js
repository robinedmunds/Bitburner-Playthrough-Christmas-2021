/** @param {NS} ns **/
import { Gang } from "/scripts/gang/lib/Gang.js"

const crimes = [
  "Human Trafficking",
  "Traffick Illegal Arms",
  "Armed Robbery",
  "Threaten & Blackmail",
  "Run a Con",
  "Deal Drugs",
  "Strongarm Civilians",
  "Mug People",
  "Unassigned",
  "Terrorism",
  "Vigilante Justice",
  "Train Combat",
  "Train Hacking",
  "Train Charisma",
  "Territory Warfare"
]

const main = (ns) => {
  if (ns.gang.inGang() === false) {
    ns.tprint("ERROR: You are not a member of any gang!")
    return
  }

  const gang = new Gang(ns)

  for (const [name, member] of Object.entries(gang.members)) {
    member.ascend()
    member.setTask("Deal Drugs")
  }

  ns.tprint(gang.moneyGainTaskOrder)
  ns.tprint(JSON.stringify(gang.info, null, 2))
  ns.tprint(JSON.stringify(gang.members["a"], null, 2))
  ns.tprint(JSON.stringify(gang.potentialTasks["Human Trafficking"], null, 2))
  ns.tprint(JSON.stringify(gang.otherGangs, null, 2))
}

export { main }
