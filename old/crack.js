/** @param {NS} ns **/

const crack = async (target, log) => {
  const isServerHackable = () =>
    ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(target)
  const enoughPortsAreOpen = () => ns.getServerNumPortsRequired(target) < 1

  if (!ns.serverExists(target)) return
  if (ns.hasRootAccess(target)) return

  if (!isServerHackable()) {
    log.push(`Attempted to weaken ${target}`)
    await ns.weaken(target)
  }
  if (isServerHackable() && enoughPortsAreOpen()) {
    log.push(`Attempted to NUKE ${target}`)
    ns.nuke(target)
  }
}

const main = async (ns) => {
  const log = []
  const servers = ns.scan("home")
  log.push("Servers found:  " + servers.join(", "))

  if (!ns.fileExists("NUKE.exe", "home")) return
  log.push("NUKE.exe found locally")

  servers.forEach(async (target) => await crack(target, log))

  log.forEach((line) => ns.print(`**  ${line}  **`))
}

export { main }
