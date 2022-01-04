/** @param {NS} ns **/

const ROOTED_SERVERS = ["n00dles", "foodnstuff"]

const main = async (ns) => {
  const doLeetHax = async (serverName) => {
    const myHackingLevel = ns.getHackingLevel()
    const hackingLevelRequired = ns.getServerRequiredHackingLevel(serverName)
    const cash = ns.getServerMoneyAvailable(serverName)
    const maxCash = ns.getServerMaxMoney(serverName)
    const isWorthStealing = cash >= maxCash * 0.1

    if (!ns.hasRootAccess(serverName)) return
    if (hackingLevelRequired > myHackingLevel) return

    if (!isWorthStealing) await ns.grow(serverName)
    if (isWorthStealing) await ns.hack(serverName)
  }

  while (true) {
    await doLeetHax(ROOTED_SERVERS[0])
    // ROOTED_SERVERS.forEach(serverName => {doLeetHax(serverName)})
  }
}

export { main }
