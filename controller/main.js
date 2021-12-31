/** @param {NS} ns **/
import { Controller } from "/scripts/controller/lib/Controller.js"

const main = async (ns) => {
  // await ns.disableLog("ALL")
  await ns.disableLog("scan")
  await ns.disableLog("scp")

  const controller = new Controller(ns)
  while (true) {
    await controller.launchDistributedAttack()
    await ns.sleep(1000 * 6)
  }
}

export { main }
