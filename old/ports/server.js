/** @param {NS} ns **/

const STATE = {
  targetSecurityRatio: 0.89,
  targetMoneyRatio: 0.89,
  moneyFloor: 0
}

const main = async (ns) => {
  const delayMultiplier = 0.1
  let data = {}
  let json = "{}"
  let count = 0

  while (true) {
    data = { secondsActive: Math.round(count), ...STATE }
    json = JSON.stringify(data)

    await ns.writePort(1, json)
    count = count + delayMultiplier
    await ns.sleep(1000 * delayMultiplier)
  }
}

export { main }
