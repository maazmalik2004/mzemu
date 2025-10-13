#!/usr/bin/env node

import fs from "fs";
import path from "path";
import readline from "readline";
import CPU from "./emulator/CPU.js";

const cpu = new CPU(8,8);

const currentDir = process.cwd();
const devDir = path.resolve(currentDir);
const mainFile = path.join(devDir, "main.mz");
const modulesDir = path.join(devDir, "modules");
const buildDir = path.join(devDir,"build");
const buildFile = path.join(devDir,"build","build.mz");
const configFile = path.join(devDir, "config.json");

function init(){
  console.log("INITIALIZING PROJECT...")
  //create main.mz file if doesnt exist
  if(!fs.existsSync(mainFile)){
    fs.writeFileSync(mainFile,"");
  }

  //create modules folder if doesnt exist
  if (!fs.existsSync(modulesDir)) {
    fs.mkdirSync(modulesDir);
  }

  //create build folder if doesnt exist
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
  }

  const defaultConfig = {
    "name": path.basename(devDir),
    "version": "1.0.0",
    "description": "",
    "developer": ""
  }

  //create config file
  if(!fs.existsSync(configFile)){
    fs.writeFileSync(configFile,JSON.stringify(defaultConfig,null,4));
  }

  console.log("INITIALIZATION COMPLETE");
}

function build() {
  init();

  console.log("[BUILDING PROJECT...]");

  let buildContent = fs.readFileSync(mainFile, "utf-8");

  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
    console.log("[BUILD COMPLETE]");
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
  prompt: "mzemu > "
});

console.log("[MZ2284MAXRISC Emulator CLI]");
rl.prompt();

rl.on("line", (line) => {
  const cmd = line.trim();
  switch (cmd) {
    case "init":
      init();
      break;
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
      console.log("[Unknown command. Use: init | build | execute | print | exit]");
  }
  rl.prompt();
});

rl.on("close", () => {
  console.log("[EXITING...]");
  process.exit(0);
});
