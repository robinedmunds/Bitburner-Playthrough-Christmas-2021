/** @param {NS} ns **/

const TARGET_MONEY_RATIO = 0.9
const TARGET_SECURITY_RATIO = 0.9

const ACTIONS = {
  GAIN_ROOT_ACCESS: "GAIN_ROOT_ACCESS",
  WEAKEN_SECURITY: "WEAKEN_SECURITY",
  GROW_MONEY: "GROW_MONEY",
  STEAL_MONEY: "STEAL_MONEY",
  DO_NOTHING: "DO_NOTHING"
}

class NodeDetail {
  constructor(ns, target) {
    this.serverName = target
    this.isRooted = ns.hasRootAccess(target)
    this.canHack =
      ns.getHackingLevel() >= ns.getServerRequiredHackingLevel(target)
    this.securityRatio =
      ns.getServerMinSecurityLevel(target) / ns.getServerSecurityLevel(target)
    // this.money = ns.getServerMoneyAvailable(target)
    // this.maxMoney = ns.getServerMaxMoney(target)
    this.moneyRatio =
      ns.getServerMoneyAvailable(target) / ns.getServerMaxMoney(target)
    // this.securityLevel = ns.getServerSecurityLevel(target)
    // this.minSecurityLevel = ns.getServerMinSecurityLevel(target)
    // this.hackingLevel = ns.getServerRequiredHackingLevel(target)
    this.openPortsRequired = ns.getServerNumPortsRequired(target)
    this.maxRAM = ns.getServerMaxRam(target)
    this.usedRAM = ns.getServerUsedRam(target)
    this.ramUtilisation =
      ns.getServerUsedRam(target) / ns.getServerMaxRam(target)
    // this.serverExists = ns.serverExists(target)
    // this.childNodes = ns.scan(target)
  }
}

const getAppropriateAction = (nodeDetail) => {
  if (!nodeDetail) return null
  if (!nodeDetail.canHack) return ACTIONS.DO_NOTHING
  if (!nodeDetail.isRooted) return ACTIONS.GAIN_ROOT_ACCESS
  if (nodeDetail.securityRatio < TARGET_SECURITY_RATIO)
    return ACTIONS.WEAKEN_SECURITY
  if (nodeDetail.moneyRatio < TARGET_MONEY_RATIO) return ACTIONS.GROW_MONEY
  return ACTIONS.STEAL_MONEY
}

const performAction = async (ns, action, target) => {
  switch (action) {
    case ACTIONS.GAIN_ROOT_ACCESS:
      const portOpeners = {
        "BruteSSH.exe": ns.brutessh,
        "FTPCrack.exe": ns.ftpcrack,
        "relaySMTP.exe": ns.relaysmtp,
        "HTTPWorm.exe": ns.httpworm,
        "SQLInject.exe": ns.sqlinject
      }

      Object.keys(portOpeners).forEach(async (key, idx) => {
        if (ns.getServerNumPortsRequired(target) >= idx + 1) {
          if (!ns.fileExists(key, "home")) {
            ns.tprint(`ERROR: Port opener, ${key} missing`)
            return "BREAK"
          }
          portOpeners[key](target)
        }
      })

      if (!ns.fileExists("NUKE.exe", "home")) {
        ns.tprint("ERROR: NUKE.exe missing")
        return "BREAK"
      }
      ns.nuke(target)
      return
    case ACTIONS.WEAKEN_SECURITY:
      await ns.weaken(target)
      return
    case ACTIONS.GROW_MONEY:
      await ns.grow(target)
      return
    case ACTIONS.STEAL_MONEY:
      await ns.hack(target)
      return
    case ACTIONS.DO_NOTHING:
      ns.tprint("switch: DO_NOTHING")
      return "BREAK"
    default:
      ns.tprint("default switch: DO_NOTHING")
      return "BREAK"
  }
}

const main = async (ns) => {
  const target = ns.args[0]
  let nodeDetail = null
  let action = null

  if (!ns.serverExists(target)) return

  while (true) {
    nodeDetail = new NodeDetail(ns, target)
    action = getAppropriateAction(nodeDetail)
    if ((await performAction(ns, action, target)) === "BREAK") break
  }
}

export { main }
