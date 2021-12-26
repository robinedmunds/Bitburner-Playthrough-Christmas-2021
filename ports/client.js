/** @param {NS} ns **/

const main = async (ns) => {
  let state = ""

  while (true) {
    state = await ns.readPort(3)
    ns.print(state)
    await ns.sleep(1000)
  }
}

export { main }
