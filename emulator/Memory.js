
class Memory {
    constructor(wordSize, totalSize) {
        this.wordSize = wordSize;
        this.memory = new Array(totalSize).fill(0);
        this.validity = new Array(totalSize).fill(0);
    }

    write(data, address) {
        const maxValue = (1 << this.wordSize) - 1;
        this.memory[address] = data & maxValue;
    }

    read(address) {
        return this.memory[address];
    }

    readValidity(address){
        return this.validity[address];
    }

    writeValidity(value, address){
        value === 0 ? this.validity[address] = 0 : this.validity[address] = 1;
    }
}

export default Memory;