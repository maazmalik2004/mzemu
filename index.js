#!/usr/bin/env node

import fs from "fs";
import path from "path";
import readline from "readline";
import CPU from "./emulator/CPU.js";

const cpu = new CPU(8,8);
const currentDir = process.cwd();
const devDir = path.resolve(currentDir);
const modulesDir = path.join(devDir, "modules");
const mainFile = path.join(devDir, "main.mz");
const buildDir = path.join(devDir,"build");
const buildFile = path.join(devDir,"build","build.mz");

function build() {
  console.log("[BUILDING PROJECT...]");

  let buildContent = fs.readFileSync(mainFile, "utf-8").trim();

  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
    console.log("[BUILD FOLDER CREATED]");
  }

  if (fs.existsSync(modulesDir)) {
    const moduleFiles = fs.readdirSync(modulesDir).filter(f => f.endsWith(".mz"));
    for (const file of moduleFiles) {
      const filePath = path.join(modulesDir, file);
      const moduleCode = fs.readFileSync(filePath, "utf-8").trim();
      buildContent += `\n//MODULE ${file}\n${moduleCode}\n`;
    }
  }

  fs.writeFileSync(buildFile, buildContent, "utf-8");
  console.log("[BUILD COMPLETE]");
}

function execute() {
  if (!fs.existsSync(buildFile)) {
    console.log("[BUILD NOT FOUND. BUILDING PROJECT...]");
    build();
  }

  console.log("[EXECUTING BUILD...]");
  const program = fs.readFileSync(buildFile, "utf-8");
  cpu.execute(program);
  console.log("[EXECUTION COMPLETE]");
}

function print() {
  console.log("[MZ2284MAXRISC CPU STATE]");
  cpu.print();
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "MZ2284MAXRISC emulator > "
});

console.log("[MZ2284MAXRISC Emulator CLI]");
rl.prompt();

rl.on("line", (line) => {
  const cmd = line.trim();
  switch (cmd) {
    case "build":
      build();
      break;
    case "execute":
      execute();
      break;
    case "print":
      print();
      break;
    case "exit":
      rl.close();
      return;
    default:
      console.log("[Unknown command. Use: build | execute | print | exit]");
  }
  rl.prompt();
});

rl.on("close", () => {
  console.log("[EXIT]");
  process.exit(0);
});
