/** @param {NS} ns **/
import { NodeDetail } from "/scripts/lib/classes.js"

const main = async (ns) => {
  const target = ns.args[0]
  if (!ns.serverExists(target)) {
    ns.tprint(`ERROR: server ${target} is unreachable`)
    return
  }

  const nodeDetail = new NodeDetail(ns, target)
  ns.tprint(JSON.stringify(nodeDetail, null, 2))
}

export { main }
