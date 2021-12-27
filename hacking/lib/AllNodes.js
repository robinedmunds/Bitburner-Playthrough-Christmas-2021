/** @param {NS} ns **/
import { NodeDetail } from "/scripts/hacking/lib/NodeDetail.js"

class AllNodes {
  #ns

  constructor(ns, root = "home") {
    if (!ns.serverExists(root)) {
      ns.tprint(`ERROR:  ${root} is unreachable`)
      return null
    }

    this.#ns = ns
    this.root = root
    this.allNodeNames = this.#fetchAllNodeNames(this.root)
    this.count = this.allNodeNames.length
    this.nodes = this.#buildNodes()
    this.relationships = this.#fetchParentChildRelationships(this.root)
    this.routes = this.#findRoutes(this.root)
  }

  #fetchAllNodeNames(root) {
    const allNodeNames = new Set()

    const recursive = (parent) => {
      const children = this.#ns.scan(parent)

      for (const child of children) {
        if (!allNodeNames.has(child)) {
          allNodeNames.add(child)
          recursive(child)
        }
      }
    }

    recursive(root)
    return [...allNodeNames.values()]
  }

  #fetchParentChildRelationships(root) {
    const ids = []
    const relationships = []

    const recursive = (parent) => {
      const children = this.#ns.scan(parent)
      let parentChild = undefined
      let string = undefined

      for (const child of children) {
        parentChild = [parent, child]
        string = parentChild.join("-")

        if (!ids.includes(string)) {
          ids.push(string)
          relationships.push(parentChild)
          recursive(child)
        }
      }
    }

    recursive(root)
    return relationships
  }

  #buildNodes() {
    const allNodeNames = this.allNodeNames
    const nodes = {}

    for (const name of allNodeNames) {
      if (!nodes[name]) {
        nodes[name] = new NodeDetail(this.#ns, name)
      }
    }

    return nodes
  }

  #findRoute(target) {
    const parentChildPairs = this.#fetchParentChildRelationships(this.root)
    const route = [target]
    // target > parent > grand parent > ...

    const findParent = (child) => {
      // recursive
      if (route[route.length - 1] === this.root) return
      const parent = parentChildPairs.filter((i) => i[1] === child)[0][0]
      if (!parent) return
      route.push(parent)
      findParent(parent)
    }

    findParent(target)
    return route.reverse()
  }

  #findRoutes() {
    const allNodeNames = this.allNodeNames
    const root = this.root
    const routes = {}

    for (const target of allNodeNames) {
      if (target === root) continue
      if (routes[target]) continue
      routes[target] = this.#findRoute(target)
    }

    return routes
  }

  // FILTER METHODS

  filterIsNotMine() {
    const nodes = {}
    let count = 0

    for (const [name, node] of Object.entries(this.nodes)) {
      if (name !== "home" && !node.isServerBelongingToMe) {
        nodes[name] = node
        count++
      }
    }

    return { nodes, filter: "filterIsNotMine", count: count }
  }

  filterMyServers() {
    const nodes = {}
    let count = 0

    for (const [name, node] of Object.entries(this.nodes)) {
      if (node.isServerBelongingToMe) {
        nodes[name] = node
        count++
      }
    }

    return { nodes, filter: "filterMyServers", count: count }
  }

  filterRootedVictims() {
    const notMyNodes = this.filterIsNotMine().nodes
    const nodes = {}
    let count = 0

    for (const [name, node] of Object.entries(notMyNodes)) {
      if (node.isRooted) {
        nodes[name] = node
        count++
      }
    }

    return { nodes, filter: "filterRootedVictims", count: count }
  }

  filterUnrootedVictims() {
    const notMyNodes = this.filterIsNotMine().nodes
    const nodes = {}
    let count = 0

    for (const [name, node] of Object.entries(notMyNodes)) {
      if (!node.isRooted) {
        nodes[name] = node
        count++
      }
    }

    return { nodes, filter: "filterUnrootedVictims", count: count }
  }

  filterIsWorthHacking() {
    const rootedVictims = this.filterRootedVictims().nodes
    const nodes = {}
    let count = 0

    for (const [name, node] of Object.entries(rootedVictims)) {
      if (node.isWorthHacking) {
        nodes[name] = node
        count++
      }
    }

    return { nodes, filter: "filterIsWorthHacking", count: count }
  }

  filterBotnet() {
    const rootedVictims = this.filterRootedVictims().nodes
    const nodes = {}
    const minRam = 4
    let count = 0

    for (const [name, node] of Object.entries(rootedVictims)) {
      if (node.maxRAM >= minRam) {
        nodes[name] = node
        count++
      }
    }

    return { nodes, filter: "filterBotnet", count: count }
  }

  filterReadyToRoot() {
    const notMyNodes = this.filterIsNotMine().nodes
    const nodes = {}
    let count = 0

    for (const [name, node] of Object.entries(notMyNodes)) {
      if (!node.isRooted && node.isRootable) {
        nodes[name] = node
        count++
      }
    }

    return { nodes, filter: "filterReadyToRoot", count: count }
  }

  // GET SPECIFIC NODE

  getHome() {
    return { home: this.nodes["home"] }
  }
}

export { AllNodes }
