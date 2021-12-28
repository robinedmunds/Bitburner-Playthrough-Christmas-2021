/** @param {NS} ns **/
import { AllNodes } from "/scripts/hacking/lib/AllNodes.js"

const main = (ns) => {
  const arg = ns.args[0] || "run4theh111z"
  const allNodesObj = new AllNodes(ns, "home")
  const routes = allNodesObj.routes

  ns.tprint("**********************")
  ns.tprint("***  ROUTE FINDER  ***")
  ns.tprint("**********************")
  ns.tprint("")
  ns.tprint("Type server name as first argument or use --all")
  ns.tprint("")

  if (arg !== "--all") {
    if (!ns.serverExists(arg)) {
      ns.tprint(`ERROR:  ${arg} is unreachable.`)
      return
    }
    const route = routes[arg].join(" -> ")
    ns.tprint(`INFO:  ${route}`)
  } else if (arg === "--all") {
    for (const [key, route] of Object.entries(routes)) {
      const formatted = route.join(" -> ")
      ns.tprint(`INFO:  ${key}:  ${formatted}`)
    }
  }
}

export { main }
