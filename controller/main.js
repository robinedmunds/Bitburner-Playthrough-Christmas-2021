/** @param {NS} ns **/
import { Controller } from "/scripts/controller/lib/Controller.js"

const main = async (ns) => {
  await ns.disableLog("ALL")

  let controller = null
  // while (true) {
  controller = new Controller(ns)
  await controller.launchDistributedAttack()

  //   await ns.sleep(1000 * 6)
  // }
}

export { main }
