import Memory from "./Memory.js";

class CPU {
    constructor(nDataBits, nAddressBits) {
        this.nDataBits = nDataBits;
        this.nAddressBits = nAddressBits;

        this.registers = {
            R0: 0,
            R1: 0,

            IR: 0,
            RR: 0,

            PR: 0,

            SP: 0,
            IP: 0
        }

        this.flags = {
            Z: 0,
            C: 0,
            N: 0
        }

        this.memory = new Memory(nDataBits, 1 << nAddressBits);
        this.stack = [];
        this.labels = {};
        this.program = [];
    }

    //memory instructions
    LDM(address) {
        this.registers.R0 = this.memory.read(address)
    }

    STM(address) {
        this.memory.write(this.registers.R0, address);
    }

    //data transfer instructions
    MOVR0DR(data) {
        this.registers.R0 = data;
    }

    MOVR1R0() {
        this.registers.R1 = this.registers.R0;
    }

    MOVR0R1() {
        this.registers.R0 = this.registers.R1;
    }

    MOVIRR0() {
        this.registers.IR = this.registers.R0;
    }

    MOVR0RR() {
        this.registers.R0 = this.registers.RR;
    }

    MOVPRR0() {
        this.registers.PR = this.registers.R0;
    }

    MOVR0PR() {
        this.registers.R0 = this.registers.PR;
    }

    //flag transfer instructions
    MOVR0Z() {
        this.registers.R0 = this.flags.Z;
    }

    MOVR0C() {
        this.registers.R0 = this.flags.C;
    }

    MOVR0N() {
        this.registers.R0 = this.flags.N;
    }


    //pointer dereferencing instructions
    LDDEREF() {
        this.registers.R0 = this.memory.read(this.registers.PR);
    }

    STDEREF() {
        this.memory.write(this.registers.R0, this.registers.PR);
    }

    //arithmetic and logical instructions
    SUM() {
        const result = this.registers.R0 + this.registers.IR;
        const maxValue = (1 << this.nDataBits) - 1;
        this.registers.RR = result & maxValue;

        this.flags.Z = result === 0 ? 1 : 0;
        this.flags.C = result > maxValue ? 1 : 0;
    }

    SUB() {
        const result = this.registers.R0 - this.registers.IR;
        const maxValue = (1 << this.nDataBits) - 1;
        this.registers.RR = result & maxValue;

        this.flags.Z = result === 0 ? 1 : 0;
        this.flags.N = result < 0 ? 1 : 0;
    }

    CMP(){
        const result = this.registers.R0 - this.registers.IR;

        this.flags.Z = result === 0 ? 1 : 0;
        this.flags.N = result < 0 ? 1 : 0;
    }

    AND() {
        this.registers.RR = this.registers.R0 & this.registers.IR;
        this.flags.Z = this.registers.RR === 0 ? 1 : 0;
    }

    OR() {
        this.registers.RR = this.registers.R0 | this.registers.IR;
        this.flags.Z = this.registers.RR === 0 ? 1 : 0;
    }

    NOT() {
        this.registers.RR = (~this.registers.R0) & ((1 << this.nDataBits) - 1);
        this.flags.Z = this.registers.RR === 0 ? 1 : 0;
    }

    XOR() {
        this.registers.RR = this.registers.R0 ^ this.registers.IR;
        this.flags.Z = this.registers.RR === 0 ? 1 : 0;
    }

    //increment and decrement operations
    INCR0() {
        this.registers.R0 = (this.registers.R0 + 1) & ((1 << this.nDataBits) - 1);
    }

    INCPR() {
        this.registers.PR = (this.registers.PR + 1) & ((1 << this.nDataBits) - 1);
    }

    DECR0() {
        this.registers.R0 = (this.registers.R0 - 1) & ((1 << this.nDataBits) - 1);
    }

    DECPR() {
        this.registers.PR = (this.registers.PR - 1) & ((1 << this.nDataBits) - 1);
    }

    //branching and control
    JMP(insAddress) {
        this.registers.IP = insAddress;
    }

    JZ(insAddress) {
        if (this.flags.Z === 1) this.registers.IP = insAddress;
    }

    JNZ(insAddress) {
        if (this.flags.Z === 0) this.registers.IP = insAddress;
    }

    JC(insAddress) {
        if (this.flags.C === 1) this.registers.IP = insAddress;
    }

    JNC(insAddress) {
        if (this.flags.C === 0) this.registers.IP = insAddress;
    }

    JN(insAddress) {
        if (this.flags.N === 1) this.registers.IP = insAddress;
    }

    JNN(insAddress) {
        if (this.flags.N === 0) this.registers.IP = insAddress;
    }

    CALL(insAddress) {
        this.stack.push(this.registers.IP);
        this.registers.IP = insAddress;
    }

    RETURN() {
        this.registers.IP = this.stack.pop();
    }

    HALT() {
        //DO NOTHING
    }

    NOP() {
        //DO NOTHING
    }

    parse(program) {
        //1)split the program into lines
        //2)remove comments
        //3)remove empty lines or lines with only comments
        const lines = program.split(/\r?\n/).map(line => line.split("//")[0].trim()).filter(line => line.length > 0);

        //parsing labels
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // console.log(`${i}\t${line}`);
            if (line.includes(':')) {
                const label = line.substring(0, line.indexOf(':'));
                this.labels[label] = i;
            }
        }
        // console.log(this.labels);
        return lines;
    }

    execute(program) {
        this.program = this.parse(program);
        // console.log('EXECUTION LOGS...');
        while (this.registers.IP < this.program.length) {
            const line = this.program[this.registers.IP];
            const parts = line.split(/\s+/);
            const operation = parts[0];
            const operand = parts[1] || null;

            switch (operation.toUpperCase()) {
                //memory access instructions
                case "LDM":
                    if (operand) this.LDM(((1 << this.nAddressBits) - 1) & parseInt(operand, 2));
                    break;
                case "STM":
                    if (operand) this.STM(((1 << this.nAddressBits) - 1) & parseInt(operand, 2));
                    break;

                    //data transfer instructions
                case "MOVR0DR":
                    if (operand) this.MOVR0DR(((1 << this.nDataBits) - 1) & parseInt(operand, 2));
                    break;

                case "MOVR0R1":
                    this.MOVR0R1();
                    break;
                case "MOVR1R0":
                    this.MOVR1R0();
                    break;

                case "MOVIRR0":
                    this.MOVIRR0();
                    break;

                case "MOVR0RR":
                    this.MOVR0RR();
                    break;

                case "MOVPRR0":
                    this.MOVPRR0();
                    break;

                case "MOVR0PR":
                    this.MOVR0PR();
                    break;

                case "MOVR0Z":
                    this.MOVR0Z();
                    break;

                case "MOVR0C":
                    this.MOVR0C();
                    break;

                case "MOVR0N":
                    this.MOVR0N();
                    break;

                    //pointer dereferencing
                case "LDDEREF":
                    this.LDDEREF();
                    break;

                case "STDEREF":
                    this.STDEREF();
                    break;

                    //arithmetic and logical operations
                case "SUM":
                    this.SUM();
                    break;

                case "SUB":
                    this.SUB();
                    break;

                case "CMP":
                    this.CMP();
                    break;

                case "AND":
                    this.AND();
                    break;

                case "OR":
                    this.OR();
                    break;

                case "NOT":
                    this.NOT();
                    break;

                case "XOR":
                    this.XOR();
                    break;

                    //increment and decrement
                case "INCR0":
                    this.INCR0();
                    break;

                case "INCPR":
                    this.INCPR();
                    break;

                case "DECR0":
                    this.DECR0();
                    break;

                case "DECPR":
                    this.DECPR();
                    break;

                    //branching and control
                case "JMP":
                    if (operand) this.JMP(this.labels[operand]);
                    break;

                case "JZ":
                    if (operand) this.JZ(this.labels[operand]);
                    break;

                case "JNZ":
                    if (operand) this.JNZ(this.labels[operand]);
                    break;

                case "JC":
                    if (operand) this.JC(this.labels[operand]);
                    break;

                case "JNC":
                    if (operand) this.JNC(this.labels[operand]);
                    break;

                case "JN":
                    if (operand) this.JN(this.labels[operand]);
                    break;

                case "JNN":
                    if (operand) this.JNN(this.labels[operand]);
                    break;

                case "CALL":
                    if (operand) this.CALL(this.labels[operand]);
                    break;

                case "RETURN":
                    this.RETURN();
                    break;

                case "HALT":
                    return;

                case "NOP":
                    break;

                default:
                    if (operation.includes(':')) break;
                    console.log("INSTRUCTION NOT FOUND : ", line)
            }

            this.registers.IP++;
        }
    }

    // print() {
    //     console.log("PARSED PROGRAM");
    //     console.log(this.program);

    //     console.log("REGISTERS");
    //     console.log(this.registers);

    //     console.log("FLAGS");
    //     console.log(this.flags);

    //     console.log("MEMORY");
    //     for (let i = 0; i < (1 << this.nAddressBits); i++) {
    //         console.log(`${i}\t${this.memory.read(i)}`);
    //     }
    // }
    
    print() {
        const registersTable = Object.entries(this.registers).map(([reg, value]) => ({
            Register: reg,
            Decimal: value,
            Binary: value.toString(2).padStart(this.nDataBits, '0'),
            Hex: value.toString(16).toUpperCase().padStart(2, '0')
        }));
        console.log("REGISTERS:");
        console.table(registersTable);

        const flagsTable = Object.entries(this.flags).map(([flag, value]) => ({
            Flag: flag,
            Value: value
        }));
        console.log("FLAGS:");
        console.table(flagsTable);

        const memoryTable = [];
        for (let addr = 0; addr < (1 << this.nAddressBits); addr++) {
            const value = this.memory.read(addr);
            memoryTable.push({
                AddrDec: addr,
                AddrBin: addr.toString(2).padStart(this.nAddressBits, '0'),
                AddrHex: addr.toString(16).toUpperCase().padStart(2, '0'),
                ValueDec: value,
                ValueBin: value.toString(2).padStart(this.nDataBits, '0'),
                ValueHex: value.toString(16).toUpperCase().padStart(2, '0')
            });
        }
        console.log("MEMORY:");
        console.table(memoryTable);
    }
}

export default CPU;