/** @param {NS} ns **/

const POSITION_TYPES = {
  LONG: "LONG",
  SHORT: "SHORT"
}

class History {
  #ns

  constructor(ns, positionClosed, sellPrice) {
    this.positionClosed = positionClosed
    this.volume = positionClosed.volume
    this.buyPrice = positionClosed.price
    this.sellPrice = sellPrice
    this.timeOfSale = new Date()
    this.profit = this.#calcProfit()
  }

  #calcProfit() {
    const valueBought = this.volume * this.buyPrice
    const valueSold = this.volume * this.sellPrice
    const profit = valueSold - valueBought
    return profit
  }
}

export { History }
