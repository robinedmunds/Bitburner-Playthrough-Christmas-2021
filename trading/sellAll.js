/** @param {NS} ns **/
import { Market } from "/scripts/trading/lib/Market.js"

const main = (ns) => {
  const firstArg = ns.args[0]
  const market = new Market(ns)
  const positions = []
  let volumeSold = 0
  let bidPrice = 0
  let valueSold = 0

  ns.tprint("INFO:  Use --confirm to sell ALL shares immediately.")

  if (firstArg === "--confirm") {
    for (const [symbol, company] of Object.entries(market.companies)) {
      if (company.havePosition === false) continue
      volumeSold = company.customPosition.volume
      bidPrice = company.bidPrice
      valueSold += volumeSold * bidPrice

      company.customPosition.closePosition()
      ns.tprint(`INFO:  Closing positions for ${symbol}`)
    }

    ns.tprint("")
    ns.tprint(`Total value sold:  ${(valueSold / 10 ** 12).toFixed(3)}t`)
  }
}

export { main }
