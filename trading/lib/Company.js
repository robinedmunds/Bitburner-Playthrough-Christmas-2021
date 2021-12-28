/** @param {NS} ns **/
import { Position } from "/scripts/trading/lib/Position.js"

const POSITION_TYPES = {
  LONG: "LONG",
  SHORT: "SHORT"
}

class Company {
  #ns

  constructor(parent, symbol) {
    this._parent = parent
    this.#ns = parent.getNs()
    this.symbol = symbol
    this.price = this.#ns.stock.getPrice(this.symbol)
    this.askPrice = this.#ns.stock.getAskPrice(this.symbol)
    this.bidPrice = this.#ns.stock.getBidPrice(this.symbol)
    this.forecast = this.#ns.stock.getForecast(this.symbol)
    this.volatility = this.#ns.stock.getVolatility(this.symbol)
    this.volume = this.#ns.stock.getMaxShares(this.symbol)
    this.position = this.#ns.stock.getPosition(this.symbol)
    this.customPosition = this.#buildCustomPosition()
    this.havePosition = this.#havePosition()
    this.gain = this.#calcGain().gain
    this.gainDecimal = this.#calcGain().gainDecimal
  }

  getNs() {
    return this.#ns
  }

  #havePosition() {
    return !this.position.every((elem) => elem === 0)
  }

  #buildCustomPosition() {
    if (!this.#havePosition()) return null

    const position = this.position
    if (position[0] + position[1] !== 0) {
      return new Position(this, this.symbol, POSITION_TYPES.LONG)
    }
    if (position[2] + position[3] !== 0) {
      return new Position(this, this.symbol, POSITION_TYPES.SHORT)
    }
  }

  #calcGain() {
    if (this.#havePosition() === false) return 0
    const position = this.customPosition

    if (position.type === POSITION_TYPES.LONG) {
      const difference = this.bidPrice - position.price
      const gain = difference * position.volume
      const gainDecimal = difference / position.price + 1
      return { gain, gainDecimal }
    }

    if (position.type === POSITION_TYPES.SHORT) {
      const difference = position.price - this.askPrice
      const gain = difference * position.volume
      const gainDecimal = difference / position.price + 1
      return { gain, gainDecimal }
    }
  }

  // PUBLIC METHODS

  async buy(volume) {
    const companyVolume = this.#ns.stock.getMaxShares(this.symbol)
    let buyableVolume
    if (this.havePosition === true) {
      buyableVolume = companyVolume - this.customPosition.volume
    } else {
      buyableVolume = companyVolume
    }
    if (volume < buyableVolume) {
      return await this.#ns.stock.buy(this.symbol, volume)
    }
    return await this.#ns.stock.buy(this.symbol, buyableVolume)
  }
}

export { Company }
