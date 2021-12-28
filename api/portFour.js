/** @param {NS} ns **/

const CONSTANTS = {
  moneyFloor: 0,
  growTarget: 0.6,
  tradingCashPool: 10 ** 9,
  hacknetCashPool: 10 ** 9
}

const PORT = 4

const myMoney = (ns) => ns.getServerMoneyAvailable("home")

const main = async (ns) => {
  // serve JSON data via writePort
  let serve = { ...CONSTANTS }

  while (true) {
    await ns.sleep(1000 / 10)
    await ns.tryWritePort(PORT, JSON.stringify(serve))
  }
}

export { main }
