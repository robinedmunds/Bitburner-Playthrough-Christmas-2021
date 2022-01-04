/** @param {NS} ns **/

class Process {
  #ns

  constructor(ns, pid, script, attackerName, victimName, action, threads) {
    this.#ns = ns
    this.pid = pid
    this.script = script
    this.attackerName = attackerName
    this.victimName = victimName
    this.action = action
    this.threads = threads
  }

  kill() {
    if (
      this.#ns.isRunning(
        this.script,
        this.attackerName,
        this.victimName,
        this.action
      )
    ) {
      this.#ns.kill(this.pid, this.attackerName, this.victimName, this.action)
      this.#ns.print(
        `WARNING: Killed process on ${this.attackerName}: ${this.pid}:${this.script}:${this.victimName}:${this.action}`
      )
    }
  }
}

export { Process }
