#!/usr/bin/env node

import readline from "readline";
import index from "./index.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "mzemu > "
});

console.clear();
console.log("Type 'help' to view available commands.\n");

rl.prompt();

function help() {
    console.log(`
    ╭──────────────────────────────────────────────╮
    │                  COMMANDS                    │
    ╰──────────────────────────────────────────────╯
    init                       initialize project directory
    build                      build project
    execute -b(build flag)     execute build
    print                      print CPU state
    install                    install modules
    `);
}

rl.on("line", (command) => {
    if (!command) {
        rl.prompt();
        return;
    }

    const parts = command.trim().split(/\s+/);

    switch (parts[0]) {
        case "help":
            help();
            break;

        case "init":
            index.init();
            break;

        case "build": {
            index.build();
            break;
        }

        case "execute": {
            let buildFlag = false;
            if(parts.includes("-b"))buildFlag = true;
            index.execute(buildFlag);
            break;
        }

        case "print":
            index.print();
            break;

        case "install": {
           //nothing for now
           break;
        }

        case "exit":
            rl.close();
            return;

        default:
            console.log(`Unknown command: '${command}'`);
            console.log("Type 'help' for a list of available commands.");
    }
    rl.prompt();
});

rl.on("close", () => {
  process.exit(0);
});
