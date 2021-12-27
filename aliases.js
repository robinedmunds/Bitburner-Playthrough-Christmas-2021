const aliases = {
  aliases: "/scripts/aliases.js",
  detail: "/scripts/utils/detail.js",
  overview: "/scripts/utils/overview.js",
  route: "/scripts/utils/route.js",
  scan: "/scripts/utils/scan.js",
  buyserver: "/scripts/buy/server.js",
  buyhacknet: "/scripts/buy/hacknet.js",
  cascade: "/scripts/hacking/cascade.js",
  rootall: "/scripts/hacking/rootall.js",
  remotekill: "/scripts/hacking/killall.js"
}

const main = (ns) => {
  let string = ""

  ns.tprint("")
  ns.tprint("Enter each of these commands into the terminal manually...")
  ns.tprint("")

  for (const [key, path] of Object.entries(aliases)) {
    string = `alias ${key}="run ${path}"`
    ns.tprint(string)
    ns.tprint("")
  }
}

export { main }
