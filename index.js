import fs from "fs";
import path from "path";
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
  
  //create main.mz if it doesnt exist
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
    "owner": "",
    "modules":{}
  }

  //create config file if it doesnt exist
  if(!fs.existsSync(configFile)){
    fs.writeFileSync(configFile,JSON.stringify(defaultConfig,null,4));
  }

  console.log("INITIALIZATION COMPLETE");
}

function parse(moduleName, program) {
    // 1) Split the program into lines
    // 2) Remove comments
    // 3) Remove empty lines
    const lines = program
        .split(/\r?\n/)
        .map(line => line.split("//")[0].trim())
        .filter(line => line.length > 0);

    const branchingAndControlSet = ["CALL", "JMP", "JZ", "JNZ", "JC", "JNC", "JN", "JNN"];

    let parsedProgram = "";
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        //Suffix labels with module name
        if (line.includes(':')) {
            const label = line.substring(0, line.indexOf(':'));
            line = `${moduleName}/${label}:`;
        }

        //Suffix label arguments for instructions in specialSet
        const words = line.split(/\s+/);
        if (branchingAndControlSet.includes(words[0].toUpperCase()) && words[1]) {
            words[1] = `${moduleName}/${words[1]}`;
            line = words.join(" ");
        }

        parsedProgram += line + "\n";
    }

    return parsedProgram;
}


function build() {
  console.log("[BUILDING PROJECT...]");

  init();

  let buildContent = fs.readFileSync(mainFile, "utf-8");
  const moduleFiles = fs.readdirSync(modulesDir).filter(f => f.endsWith(".mz"));
  for (const file of moduleFiles) {
    const filePath = path.join(modulesDir, file);
    const moduleCode = parse(path.parse(filePath).name,fs.readFileSync(filePath, "utf-8"));
    buildContent += `\n${moduleCode}\n`;
  }
  fs.writeFileSync(buildFile, buildContent, "utf-8");

  console.log("[BUILD COMPLETE]");
}

function execute(b) {
  console.log("[EXECUTING BUILD...]");

  if(b)build();

  const program = fs.readFileSync(buildFile, "utf-8");
  cpu.execute(program);

  console.log("[EXECUTION COMPLETE]");
}

function print() {
  console.log("[MZ2284MAXRISC CPU STATE]");
  cpu.print();
}

export default {
  init,execute, build, print
}