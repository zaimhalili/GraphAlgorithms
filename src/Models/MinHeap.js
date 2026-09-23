export class MinHeap {
    constructor() {
        this.heap = [];
    }

    _val(x) {
        return Array.isArray(x) ? x[0] : x;
    }

    push(item) {
        this.heap.push(item);
        this._bubbleUp();
    }

    pop() {
        if (this.isEmpty()) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const top = this.heap[0];
        this.heap[0] = this.heap.pop();
        this._bubbleDown();
        return top;
    }

    _bubbleUp() {
        let i = this.heap.length - 1;
        while (i > 0) {
            let p = (i - 1) >> 1; // bitwise floor
            if (this._val(this.heap[p]) <= this._val(this.heap[i])) break;
            [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
            i = p;
        }
    }

    _bubbleDown() {
        let i = 0;
        const n = this.heap.length;
        while (true) {
            let l = 2 * i + 1, r = 2 * i + 2, smallest = i;

            if (l < n && this._val(this.heap[l]) < this._val(this.heap[smallest])) smallest = l;
            if (r < n && this._val(this.heap[r]) < this._val(this.heap[smallest])) smallest = r;

            if (smallest === i) break;
            [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
            i = smallest;
        }
    }

    isEmpty() {
        return this.heap.length === 0;
    }
}