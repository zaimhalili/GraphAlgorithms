class Graph {
    constructor(numberOfNodes) {
        this.numberOfNodes = numberOfNodes;
    }
}

let matrix = [
    [[1, 4], [2, 8]],
    [[0, 4], [4, 6], [2, 3]],
    [[0, 8], [3, 2], [1, 3]],
    [[2, 2], [4, 10]],
    [[1, 6], [3, 10]]
];

class MinHeap {
    constructor() {
        this.heap = [];
    }

    push(item) {
        this.heap.push(item);
        this._bubbleUp();
    }

    pop() {
        if (this.heap.length === 1) return this.heap.pop();
        const top = this.heap[0];
        this.heap[0] = this.heap.pop();
        this._bubbleDown();
        return top;
    }

    _bubbleUp() {
        let i = this.heap.length - 1;
        while (i > 0) {
            let p = Math.floor((i - 1) / 2);
            if (this.heap[p][0] <= this.heap[i][0]) break;
            [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
            i = p;
        }
    }

    _bubbleDown() {
        let i = 0;
        const n = this.heap.length;
        while (true) {
            let l = 2 * i + 1, r = 2 * i + 2, smallest = i;

            if (l < n && this.heap[l][0] < this.heap[smallest][0]) smallest = l;
            if (r < n && this.heap[r][0] < this.heap[smallest][0]) smallest = r;

            if (smallest === i) break;
            [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
            i = smallest;
        }
    }

    isEmpty() {
        return this.heap.length === 0;
    }
}

//Driver Code Ends
function colorNode(nodeNumber) {
    let classNumber = "";
    if (nodeNumber === 0) classNumber = "zero"
    else if (nodeNumber === 1) classNumber = "one";
    else if (nodeNumber === 2) classNumber = "two";
    else if (nodeNumber === 3) classNumber = "three";
    else if (nodeNumber === 4) classNumber = "four";

    let nodeElement = document.getElementsByClassName(classNumber)[0];
    nodeElement.classList.add("visited");
}

function dijkstra(adj, src) {

    let V = adj.length;

    // Min-heap (priority queue) storing pairs of (distance, node)
    let pq = new MinHeap();

    let dist = Array(V).fill(Number.MAX_SAFE_INTEGER);

    // Distance from source to itself is 0
    dist[src] = 0;
    pq.push([0, src]);

    // Process the queue until all reachable vertices are finalized
    while (!pq.isEmpty()) {
        let [d, u] = pq.pop();

        // If this distance not the latest shortest one, skip it
        if (d > dist[u]) continue;

        // Explore all neighbors of the current vertex
        for (let [v, w] of adj[u]) {

            // If we found a shorter path to v through u, update it
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push([dist[v], v]);
            }
        }
    }

    // Return the final shortest distances from the source
    return dist;
}

function astar() {

}


function selectAlgorithm(name) {
    document.getElementById("dijkstra").classList.remove("selectedButton");
    document.getElementById("astar").classList.remove("selectedButton");

    if (name === "Dijkstra") {
        document.getElementById("dijkstra").classList.add("selectedButton");
        dijkstra(matrix, 0);

        let result = dijkstra(matrix, 0);
        let inputNumber = document.getElementById("numSearch").value;
        document.getElementById("percorso").innerText = "Percorso più corto: " + result[inputNumber];

        colorNode(inputNumber)

    } else if (name === "Astar") {
        document.getElementById("astar").classList.add("selectedButton");
        astar();
    }
}

