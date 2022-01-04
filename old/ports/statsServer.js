/** @param {NS} ns **/

const DEFAULT = {
  currentlyWeaking: 0,
  currentlyGrowing: 0,
  currentlyHacking: 0
}

const PORT = 3

const isJsonParsable = (json) => {
  try {
    JSON.parse(json)
    return true
  } catch (err) {
    return false
  }
}

const main = async (ns) => {
  let portData = undefined

  while (true) {
    portData = ns.readPort(PORT)
    if (isJsonParsable(portData) === true) {
      await ns.tryWritePort(PORT, portData)
    } else {
      await ns.tryWritePort(PORT, JSON.stringify(DEFAULT))
    }
    await ns.sleep(10)
  }
}

export { main }
