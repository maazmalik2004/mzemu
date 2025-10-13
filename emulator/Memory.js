
class Memory {
    constructor(wordSize, totalSize) {
        this.wordSize = wordSize;
        this.memory = new Array(totalSize).fill(0);
    }

    write(data, address) {
        const maxValue = (1 << this.wordSize) - 1;
        this.memory[address] = data & maxValue;
    }

    read(address) {
        return this.memory[address];
    }
}

export default Memory;