/** @param {NS} ns **/

const PORT = 4

const main = async (ns) => {
  let state = ""

  while (true) {
    state = await ns.readPort(PORT)
    ns.print(state)
    await ns.sleep(1000)
  }
}

export { main }
