/** @param {NS} ns **/
import { Market } from "/scripts/trading/lib/Market.js"

const POSITION_TYPES = {
  LONG: "LONG",
  SHORT: "SHORT"
}

const STOP_ORDERS = {
  LOSS: 0.9725,
  GAIN: 1.055
}

const CASH = 10 ** 12 * 7

const haveMoneyToSpend = (exposure) => exposure < CASH * 0.9

const moneyToSpend = (exposure) => {
  const toSpend = CASH - exposure
  if (toSpend < 0) return 0
  return toSpend
}

const buyShares = async (company, cashPool) => {
  const askPrice = company.askPrice
  const toSpend = cashPool / 11
  const volume = Math.floor(toSpend / askPrice)
  if (volume < 1) return false
  await company.buy(volume)
}

const autoBuyShares = async (ns, market) => {
  const tipped = market.sortCompaniesMostTippedToRise()
  const topSix = tipped.slice(0, 6)

  for (const company of topSix) {
    if (!haveMoneyToSpend(market.exposure)) return
    await buyShares(company, moneyToSpend(market.exposure))
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
        `WARNING:  Stop-loss activated. Selling ${position.volume} ${
          position.symbol
        } shares at \$${position.price.toLocaleString()}.`
      )
    }

    if (gain >= STOP_ORDERS.GAIN) {
      await sellShares(position)
      ns.print(
        `WARNING:  Sell-order activated. Selling ${position.volume} ${
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
  // find top 11 most likely to rise
  // find 6 least volatile
  // invest cash
  // 6pc stop loss
  // 12pc gain stop order

  let market = undefined

  while (true) {
    await ns.sleep(1000 * 3)
    market = new Market(ns)

    await autoBuyShares(ns, market)
    await autoSellShares(ns, market)

    ns.print(
      `INFO:  Total gain:  ${market.gain.toLocaleString(
        "en-GB"
      )} / ${market.gainDecimal.toFixed(3)}`
    )
  }

  // const funcs = {
  // 	purchase4SMarketData: ns.stock.purchase4SMarketData,
  // 	purchase4SMarketDataTixApi: ns.stock.purchase4SMarketDataTixApi,
  // 	buy: ns.stock.buy,

  // 	getOrders: ns.stock.getOrders,
  // 	cancelOrder: ns.stock.cancelOrder(),
  // 	getSymbols: ns.stock.getSymbols,
  // 	placeOrder: ns.stock.placeOrder,
  // 	getPurchaseCost: ns.stock.getPurchaseCost(),
  // 	sell: ns.stock.sell,
  // 	sellShort: ns.stock.sellShort,
  // 	short: ns.stock.short,

  // 	getPrice: ns.stock.getPrice(),
  // 	getAskPrice: ns.stock.getAskPrice,
  // 	getBidPrice: ns.stock.getBidPrice,
  // 	getForecast: ns.stock.getForecast,
  // 	getMaxShares: ns.stock.getMaxShares,
  // 	getPosition: ns.stock.getPosition(),
  // 	getVolatility: ns.stock.getVolatility,
  // 	getSaleGain: ns.stock.getSaleGain,

  // }
}

export { main }
