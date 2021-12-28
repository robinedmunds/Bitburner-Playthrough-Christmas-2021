/** @param {NS} ns **/
import { Market } from "/scripts/trading/lib/Market.js"

const POSITION_TYPES = {
  LONG: "LONG",
  SHORT: "SHORT"
}

const STOP_ORDERS = {
  LOSS: 0.8,
  GAIN: 1.04
}

const N = 23

const PORT = 4
const getCash = (ns) => {
  let parsed = null
  try {
    parsed = JSON.parse(ns.readPort(PORT))
  } catch (err) {
    parsed = { tradingCashPool: 0 }
  }

  return parsed.tradingCashPool
}

const startServers = async (ns) => {
  const servers = ["/scripts/api/portFour.js"]

  for (const server of servers) {
    if (!ns.isRunning(server, "home")) await ns.exec(server, "home")
  }
}

const haveMoneyToSpend = (ns, exposure) => exposure < getCash(ns) * 0.9

const moneyToSpend = (ns, exposure) => {
  const toSpend = getCash(ns) - exposure
  if (toSpend < 0) return 0
  return toSpend
}

const buyShares = async (company, cashPool) => {
  const askPrice = company.askPrice
  const toSpend = cashPool * 0.9
  const volume = Math.floor(toSpend / askPrice)
  if (volume < 1) return false
  await company.buy(volume)
}

const autoBuyShares = async (ns, market) => {
  const tipped = market.sortCompaniesMostTippedToRise()
  const topN = tipped.slice(0, N)

  for (const company of topN) {
    if (!haveMoneyToSpend(ns, market.exposure)) return
    await buyShares(company, moneyToSpend(ns, market.exposure))
  }
}

const sellShares = async (position) => {
  await position.closePosition()
}

const autoSellShares = async (ns, market) => {
  const withPositions = market.filterCompaniesWithAPosition()
  let gain = undefined
  let position = undefined

  for (const [sym, company] of Object.entries(withPositions)) {
    gain = company.gainDecimal
    position = company.customPosition
    if (gain <= STOP_ORDERS.LOSS) {
      await sellShares(position)
      ns.print(
        `WARNING:  Stop-loss activated. Selling ${position.volume.toLocaleString()} ${
          position.symbol
        } shares at \$${position.price.toLocaleString()}.`
      )
    }

    if (gain >= STOP_ORDERS.GAIN) {
      await sellShares(position)
      ns.print(
        `WARNING:  Sell-order activated. Selling ${position.volume.toLocaleString()} ${
          position.symbol
        } shares at \$${position.price.toLocaleString()}.`
      )
    }
  }
}

const main = async (ns) => {
  // SHORTING IS NOT YET UNLOCKED

  // STRATEGY
  // set aside amount of cash for trading
  // find top X most likely to rise
  // find X least volatile
  // invest cash
  // Xpc stop loss
  // Xpc gain stop order

  let market = undefined

  await startServers(ns)

  while (true) {
    await ns.sleep(1000 * 3)
    market = new Market(ns)

    await autoBuyShares(ns, market)
    await autoSellShares(ns, market)

    const currentBidValue = market.exposure * market.gainDecimal
    ns.print(
      `INFO:  Exposure: ${(market.exposure / 10 ** 12).toFixed(
        3
      )}t -- Gain: \$${market.gainDecimal.toFixed(3)} -- Value: \$${(
        currentBidValue /
        10 ** 12
      ).toFixed(3)}t`
    )
  }
}

export { main }
