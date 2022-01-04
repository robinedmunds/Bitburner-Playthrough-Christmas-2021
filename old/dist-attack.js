/** @param {NS} ns **/
import { AllNodes } from "/scripts/lib/classes.js"

const ATTACK_SCRIPT = "/scripts/dist/attack.js"
const RAM_UTILISATION_TARGET = 0.9

const cpFilesToAttackers = async (ns, attackers) => {
  const files = ["/scripts/dist/classes.js", "/scripts/dist/attack.js"]

  for (const nodeName of Object.keys(attackers)) {
    for (const file of files) {
      if (nodeName !== "home") {
        if (await ns.scp(file, nodeName)) {
          ns.tprint(`scp of ${file} to ${nodeName}`)
        }
      }
    }
  }
}

const sortVictimsMaxMoneyDesc = (victims) => {
  const sortMaxMoneyDesc = (a, b) => b[1] - a[1]
  const array = []

  for (const [name, node] of Object.entries(victims)) {
    array.push([name, node.maxMoney])
  }

  array.sort(sortMaxMoneyDesc)
  return array.flat().filter((i) => typeof i === "string")
}

const sortVictimsMoneyDesc = (victims) => {
  const sortMoneyDesc = (a, b) => b[1] - a[1]
  const array = []

  for (const [name, node] of Object.entries(victims)) {
    array.push([name, node.money])
  }

  array.sort(sortMoneyDesc)
  return array.flat().filter((i) => typeof i === "string")
}

const sortAttackersAvailableRamDesc = (attackers) => {
  const sortAvailableRamDesc = (a, b) => b[1] - a[1]
  const array = []

  for (const [name, node] of Object.entries(attackers)) {
    array.push([name, node.availableRam])
  }

  array.sort(sortAvailableRamDesc)
  return array.flat().filter((i) => typeof i === "string")
}

const launchAttack = (ns, attackers, victims, attackerOrder, victimOrder) => {
  const attackerCount = attackerOrder.length
  const victimCount = victimOrder.length
  let attackerOrderIdx = 0

  ns.tprint(`attackerCount:  ${attackerCount}`)
  ns.tprint(`victimCount:  ${victimCount}`)

  for (const victimName of victimOrder) {
    const attackerName = attackerOrder[attackerOrderIdx]
    const attacker = attackers[attackerName]
    const availableRam = attacker.availableRam

    const ramRequired = ns.getScriptRam(ATTACK_SCRIPT, attackerName)
    if (ramRequired === 0) {
      ns.tprint(`ERROR: ${ATTACK_SCRIPT} not present on target`)
      return
    }
    const threads = Math.floor(
      (availableRam * RAM_UTILISATION_TARGET) / ramRequired
    )

    if (!ns.isRunning(ATTACK_SCRIPT, attackerName, victimName)) {
      if (threads > 0) {
        ns.tprint(
          `'exec ${ATTACK_SCRIPT}, threads: ${threads}, host: ${attackerName}, victim: ${victimName}'`
        )
        ns.exec(ATTACK_SCRIPT, attackerName, threads, victimName)
        if (attackerOrderIdx < attackerCount) {
          attackerOrderIdx++
        } else {
          attackerOrderIdx = 0
        }
      }
    }
  }
}

const main = async (ns) => {
  const allNodesObj = new AllNodes(ns)
  const homeNode = allNodesObj.getHome()
  const myServers = allNodesObj.filterMyServers().nodes
  const botnet = allNodesObj.filterBotnet().nodes
  const victims = allNodesObj.filterIsWorthHacking().nodes
  const attackers = { ...myServers, ...homeNode, ...botnet }

  await cpFilesToAttackers(ns, attackers)

  // const victimOrder = sortVictimsMaxMoneyDesc(victims) // SLOW, HIGH INCOMME
  const victimOrder = sortVictimsMoneyDesc(victims) // FAST, LOWER INCOME

  const attackerOrder = sortAttackersAvailableRamDesc(attackers)

  launchAttack(ns, attackers, victims, attackerOrder, victimOrder)
}

export { main }
