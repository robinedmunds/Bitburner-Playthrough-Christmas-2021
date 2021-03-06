/** @param {NS} ns **/

const ACTIONS = {
  WEAKEN_SECURITY: "WEAKEN_SECURITY",
  GROW_MONEY: "GROW_MONEY",
  STEAL_MONEY: "STEAL_MONEY",
  DO_NOTHING: "DO_NOTHING"
}

const pad = (num) => {
  if (num < 10) return `0${num}`
  return `${num}`
}

const main = async (ns) => {
  const victim = ns.args[0]
  const attackType = ns.args[1]
  const startTime = new Date()
  const timeString = [
    pad(startTime.getHours()),
    pad(startTime.getMinutes()),
    pad(startTime.getSeconds())
  ].join(":")

  ns.print(`INFO:  Started at ${timeString}`)

  switch (attackType) {
    case ACTIONS.WEAKEN_SECURITY:
      await ns.weaken(victim)
      break
    case ACTIONS.GROW_MONEY:
      await ns.grow(victim)
      break
    case ACTIONS.STEAL_MONEY:
      await ns.hack(victim)
      break
  }
}

export { main }
