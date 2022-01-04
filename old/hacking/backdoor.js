/** @param {NS} ns **/
// import { AllNodes } from "/scripts/hacking/lib/AllNodes.js"

const NODES_TO_BACKDOOR = [
  "CSEC",
  "avmnite-02h",
  "run4theh111z",
  "I.I.I.I",
  "The-Cave",
  "."
]

const main = (ns) => {
  // const allNodes = new AllNodes(ns)
  let route

  for (const name of NODES_TO_BACKDOOR) {
    // route = allNodes.route[name]
    ns.installBackdoor(name)
  }
}

export { main }
