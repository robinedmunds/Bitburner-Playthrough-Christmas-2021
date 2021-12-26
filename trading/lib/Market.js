/** @param {NS} ns **/
import { Company } from "/scripts/trading/lib/Company.js"

const POSITION_TYPES = {
  LONG: "LONG",
  SHORT: "SHORT"
}

class Market {
  #ns

  constructor(ns) {
    this.#ns = ns
    this.symbols = this.#ns.stock.getSymbols()
    this.companies = this.#buildCompanies(this.symbols)
    this.exposure = this.#calcTotalExposure()
    this.gain = this.#calcPortfolioGain().gainSum
    this.gainDecimal = this.#calcPortfolioGain().gainDecimal
  }

  #buildCompanies() {
    const companies = {}
    for (const symbol of this.symbols) {
      companies[symbol] = new Company(this.#ns, symbol)
    }
    return companies
  }

  #calcTotalExposure() {
    let totalExposure = 0
    for (const [sym, company] of Object.entries(this.companies)) {
      if (company.havePosition === false) continue
      totalExposure = totalExposure + company.customPosition.exposure
    }
    return totalExposure
  }

  #calcPortfolioGain() {
    let count = 0
    let gainSum = null
    let gainDecimal = null

    for (const [sym, company] of Object.entries(
      this.filterCompaniesWithAPosition()
    )) {
      count++
      gainSum = gainSum + company.gain
      gainDecimal = gainDecimal + company.gainDecimal
    }

    gainDecimal = gainDecimal / count

    return { gainSum, gainDecimal }
  }

  // PUBLIC METHODS

  sortCompaniesMostTippedToRise() {
    const sortSecondElemDesc = (a, b) => b[1] - a[1]
    const unordered = []
    for (const [sym, company] of Object.entries(this.companies)) {
      unordered.push([sym, company.forecast])
    }
    const ordered = unordered.sort(sortSecondElemDesc)

    const orderedCompanies = []
    for (const arr of ordered) {
      orderedCompanies.push(this.companies[arr[0]])
    }
    return orderedCompanies
  }

  filterCompaniesWithAPosition() {
    const withPosition = {}
    for (const [sym, company] of Object.entries(this.companies)) {
      if (company.havePosition === true) {
        withPosition[sym] = company
      }
    }
    return withPosition
  }
}

export { Market }
