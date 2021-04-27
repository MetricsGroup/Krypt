const readline = require("readline")
const chalk = require("chalk")

function log(query) {
  process.stdout.write(query)
}

const read = {
  visual: undefined,

  autofill: undefined,

  prompt: function (query, hide=false) {
    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })
      const stdin = process.openStdin()
      log(query + "<>")
      const onData = char => {
        char = char.toString()
        if (hide) {
          switch (char) {
            case "\n":
            case "\r":
            case "\u0004":
              stdin.pause()
              stdin.removeListener("data", onData)
              break
            default:
              process.stdout.clearLine()
              readline.cursorTo(process.stdout, 0)
              log(query + "*".repeat(rl.line.length))
              break
          }
        } else {
          switch (char) {
            case "\n":
            case "\r":
            case "\u0004":
              log("\u001b[0J\u001b[u\n")
              stdin.removeListener("data", onData)
              stdin.pause()
              break
            case "\t":
              if (this.autofill !== undefined) {
                let length = rl.line.length + query.length + 1
                rl.line = this.autofill(rl.line.slice(0, rl.line.length - 1))
                log(`\u001b[${length}G`)
              }
            default:
              log(
                `\u001b[s\u001b[${query.length + 1}G\u001b[0J\u001b[u\u001b[${
                  query.length + 1
                }G`
              )
              log(rl.line)
              if (this.visual !== undefined) {
                this.visual(rl.line)
                log("\u001b[u")
              }
              break
          }
        }
      }
      process.stdin.on("data", onData)
      rl.question(query, value => {
        rl.history = rl.history.slice(1)
        this.visual = undefined
        this.autofill = undefined
        rl.close()
        resolve(value)
      })
    })
  },
  setVisual: function (func) {
    if (typeof func !== "function" && func !== undefined)
      throw new TypeError("Expected function, recieved " + typeof func + ".")
    this.visual = func
  },
  setAutofill: function (func) {
    if (typeof func !== "function" && func !== undefined)
      throw new TypeError("Expected function, recieved " + typeof func + ".")
    this.autofill = func
  },
  password: function (_query) {
    return new Promise((resolve, reject) => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      })
      const stdin = process.openStdin()
      process.stdin.on("data", char => {
        char = char + ""
        switch (char) {
          case "\n":
          case "\r":
          case "\u0004":
            stdin.pause()
            break
          default:
            process.stdout.clearLine()
            readline.cursorTo(process.stdout, 0)
            log(_query + "*".repeat(rl.line.length))
            break
        }
      })
      rl.question(_query, value => {
        rl.history = rl.history.slice(1)
        rl.close()
        resolve(value)
      })
    })
  },
}

module.exports = read