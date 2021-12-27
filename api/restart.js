/** @param {NS} ns **/

const main = async (ns) => {
  // find server process, kill, start it
  const script = "/scripts/api/portFour.js"
  ns.kill(script, "home")
  await ns.sleep(100)
  ns.exec(script, "home")

  ns.tprint(`INFO:  Successfully restarted api portFour`)
}

export { main }
