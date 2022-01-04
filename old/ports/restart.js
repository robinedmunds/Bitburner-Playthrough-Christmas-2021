/** @param {NS} ns **/

const main = async (ns) => {
  // find server process, kill, start it
  const script = "/scripts/ports/server.js"
  ns.kill(script, "home")
  await ns.sleep(100)
  ns.exec(script, "home")

  ns.tprint(`INFO:  Successfully restarted attack control server`)
}

export { main }
