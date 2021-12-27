/** @param {NS} ns **/
import { Market } from "/scripts/trading/lib/Market.js"

const main = async (ns) => {
  const history = []
  let market = 0
  let marketValue = 0
  let mean = 0

  while (true) {
    await ns.sleep(1000 * 3)
    market = new Market(ns)

    for (const [symbol, company] of Object.entries(market.companies)) {
      marketValue += company.price
    }

    history.push(marketValue)

    mean = history.reduce((prev, current) => prev + current) / history.length

    ns.print(
      `INFO:  Historical mean market value: ${mean.toFixed(
        0
      )} -- Current market value: ${marketValue.toFixed(
        0
      )} -- DIFFERENCE RATIO: ${(marketValue / mean).toFixed(3)}`
    )

    marketValue = 0
  }
}

export { main }
