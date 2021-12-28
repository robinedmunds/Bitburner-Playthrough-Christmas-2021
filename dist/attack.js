/** @param {NS} ns **/
import { NodeDetail } from "/scripts/dist/NodeDetail.js"

const ACTIONS = {
  WEAKEN_SECURITY: "WEAKEN_SECURITY",
  GROW_MONEY: "GROW_MONEY",
  STEAL_MONEY: "STEAL_MONEY",
  DO_NOTHING: "DO_NOTHING"
}

const PORT = 4

const getAppropriateAction = (nodeDetail) => {
  return nodeDetail.recommendedAction
}

// const isJsonParsable = (json) => {
//   try {
//     JSON.parse(json)
//     return true
//   } catch (err) {
//     return false
//   }
// }

// const broadcastAction = async (ns, action, prevAction) => {
//   const portData = await ns.readPort(PORT)
//   let json = undefined

//   if (isJsonParsable(portData) === true) {
//     json = JSON.parse(portData)
//   } else {
//     return
//   }

//   switch (action) {
//     case ACTIONS.WEAKEN_SECURITY:
//       json.currentlyWeaking++
//     case ACTIONS.GROW_MONEY:
//       json.currentlyGrowing++
//     case ACTIONS.STEAL_MONEY:
//       json.currentlyHacking++
//   }

//   switch (prevAction) {
//     case ACTIONS.WEAKEN_SECURITY:
//       json.currentlyWeaking--
//     case ACTIONS.GROW_MONEY:
//       json.currentlyGrowing--
//     case ACTIONS.STEAL_MONEY:
//       json.currentlyHacking--
//   }

//   await ns.writePort(PORT, JSON.stringify(json))
// }

const performAction = async (ns, action, target) => {
  const startTime = new Date()
  const timeString = `INFO:  Action started at:  ${startTime.getHours()}:${startTime.getMinutes()}:${startTime.getSeconds()}`
  ns.print(timeString)

  switch (action) {
    case ACTIONS.WEAKEN_SECURITY:
      await ns.weaken(target)
      return
    case ACTIONS.GROW_MONEY:
      await ns.grow(target)
      return
    case ACTIONS.STEAL_MONEY:
      await ns.hack(target)
      return
    case ACTIONS.DO_NOTHING:
      action = null
      ns.tprint("switch: DO_NOTHING")
      return "BREAK"
    default:
      ns.tprint("ERROR:  default switch: DO_NOTHING")
      return "BREAK"
  }
}

const main = async (ns) => {
  const target = ns.args[0]
  let nodeDetail = null
  let action = null
  let prevAction = null

  if (!ns.serverExists(target)) {
    ns.tprint(`${target} is unreachable. Exiting...`)
    return
  }

  while (true) {
    nodeDetail = await new NodeDetail(ns, target)
    action = getAppropriateAction(nodeDetail)
    // await broadcastAction(ns, action, prevAction)
    prevAction = action
    if ((await performAction(ns, action, target)) === "BREAK") break
  }
}

export { main }
