/** @param {NS} ns **/

const POSITION_TYPES = {
  LONG: "LONG",
  SHORT: "SHORT"
}

class Position {
  #ns

  constructor(ns, symbol, type) {
    this.#ns = ns
    this.symbol = symbol
    this.type = this.#parseType(type)
    this.volume = this.#parsePositionArray().volume
    this.price = this.#parsePositionArray().price
    this.exposure = this.volume * this.price
  }

  #parseType(type) {
    if (type in POSITION_TYPES) return type
    this.#ns.tprint("ERROR:  Invalid position type.")
    return null
  }

  #parsePositionArray() {
    const position = this.#ns.stock.getPosition(this.symbol)
    // long
    const volumeOwned = position[0]
    const pricePaid = position[1]
    // short ...
    // I'M GUESSUING THE NEXT TWO FIELD DEFS
    const volumeBorrowed = position[2]
    const priceWhenBorrowed = position[3]

    if (this.type === POSITION_TYPES.LONG) {
      return { volume: volumeOwned, price: pricePaid }
    }

    if (this.type === POSITION_TYPES.SHORT) {
      return { volume: volumeBorrowed, price: priceWhenBorrowed }
    }
  }

  // PUBLIC METHODS

  async closePosition() {
    this.#ns.print(`INFO: Closed LONG ${this.symbol} position.`)
    return await this.#ns.stock.sell(this.symbol, this.volume)
  }
}

export { Position }
