/** @param {NS} ns **/
import { AllNodes } from "/scripts/hacking/lib/AllNodes.js"

const main = (ns) => {
  const arg = ns.args[0]
  const allNodesObj = new AllNodes(ns, "home")
  const routes = allNodesObj.routes

  if (arg === "--all") {
    for (const [key, route] of Object.entries(routes)) {
      const formatted = route.join(" -> ")
      ns.tprint(`INFO:  ${key}:  ${formatted}`)
    }
  }

  if (Object.keys(allNodesObj.nodes).includes(arg)) {
    const route = routes[arg].join(" -> ")
    const chainedCmd = routes[arg]
      .filter((i) => i !== "home")
      .map((i) => `connect ${i}`)
      .join(" ; ")

    ns.tprint(`INFO:  ${route}`)
    ns.tprint("WARNING: ", chainedCmd)
  }

  if (!arg) {
    ns.tprint("**********************")
    ns.tprint("***  ROUTE FINDER  ***")
    ns.tprint("**********************")
    ns.tprint("")
    ns.tprint("Type server name as first argument or use --all")
    ns.tprint("")
  }
}

export { main }
