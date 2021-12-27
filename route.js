/** @param {NS} ns **/
import { AllNodes } from "/scripts/hacking/lib/AllNodes.js"

// const findRoute = (ns, target, relationships) => {
// 	const parentChilds = relationships
// 	const route = [target]
// 	// target > parent > grand parent > ...

// 	const findParent = (child) => {
// 		// recursive
// 		const relationship = parentChilds.filter(e => e[1] === child)
// 		const parent = relationship[0][0]
// 		route.push(parent)
// 		if (parent !== "home") findParent(parent)
// 	}

// 	findParent(target)

// 	return route.reverse()
// }

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
