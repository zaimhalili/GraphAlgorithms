class Graph {
    constructor(numberOfNodes) {
        this.numberOfNodes = numberOfNodes;
        this.adjList = [];
    }
}

// Graph setup
const graph = new Graph(5);
graph.adjList = [
    [[1, 4], [2, 8]],          // Node 0
    [[0, 4], [4, 6], [2, 3]],  // Node 1
    [[0, 8], [3, 2], [1, 3]],  // Node 2
    [[2, 2], [4, 10]],         // Node 3
    [[1, 6], [3, 10]]          // Node 4
];

let matrix = graph.adjList;

// Approximate canvas positions (x, y) for A* heuristic
const nodeCoords = {
    0: { x: 80,  y: 200 },
    1: { x: 220, y: 80  },
    2: { x: 220, y: 320 },
    3: { x: 420, y: 320 },
    4: { x: 420, y: 80  }
};

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

function colorNode(nodeNumber) {
    // 1. Remove previous highlighted nodes
    document.querySelectorAll(".visited").forEach(el => el.classList.remove("visited"));

    // 2. Map node number to standard class name words
    const classNames = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];
    let classNumber = classNames[nodeNumber];

    let nodeElement = document.getElementsByClassName(classNumber)[0];
    if (nodeElement) {
        nodeElement.classList.add("visited");
    }
}

function dijkstra(adj, src) {
    let V = adj.length;
    let pq = new MinHeap();
    let dist = Array(V).fill(Number.MAX_SAFE_INTEGER);

    dist[src] = 0;
    pq.push([0, src]);

    while (!pq.isEmpty()) {
        let [d, u] = pq.pop();

        if (d > dist[u]) continue;

        for (let [v, w] of adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                pq.push([dist[v], v]);
            }
        }
    }

    return dist;
}

// Admissible Euclidean heuristic divided by a scaling factor
function heuristic(node, target) {
    if (!nodeCoords[node] || !nodeCoords[target]) return 0;
    let dx = nodeCoords[node].x - nodeCoords[target].x;
    let dy = nodeCoords[node].y - nodeCoords[target].y;
    return Math.hypot(dx, dy) / 50;
}

function astar(adj, src, target) {
    let V = adj.length;
    let pq = new MinHeap();
    let dist = Array(V).fill(Number.MAX_SAFE_INTEGER);
    dist[src] = 0;

    pq.push([dist[src] + heuristic(src, target), src]);

    while (!pq.isEmpty()) {
        let [f, u] = pq.pop();

        if (u === target) {
            return dist[target];
        }

        for (let [v, w] of adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                let fScore = dist[v] + heuristic(v, target);
                pq.push([fScore, v]);
            }
        }
    }

    return dist[target];
}

function selectAlgorithm(name) {
    document.getElementById("dijkstra").classList.remove("selectedButton");
    document.getElementById("astar").classList.remove("selectedButton");

    let inputNumber = Number(document.getElementById("numSearch").value) || 0;
    const ITERATIONS = 10000;

    if (name === "Dijkstra") {
        document.getElementById("dijkstra").classList.add("selectedButton");

        let result;
        const startTime = performance.now();
        for (let i = 0; i < ITERATIONS; i++) {
            result = dijkstra(matrix, 0);
        }
        const endTime = performance.now();
        
        const totalTime = endTime - startTime;
        const avgTime = totalTime / ITERATIONS;
        console.log(`Dijkstra: Total ${totalTime.toFixed(3)} ms (${avgTime.toFixed(5)} ms / call)`);

        document.getElementById("percorso").innerText = "Percorso più corto: " + result[inputNumber];
        colorNode(inputNumber);

    } else if (name === "Astar") {
        document.getElementById("astar").classList.add("selectedButton");

        let result;
        const startTime = performance.now();
        for (let i = 0; i < ITERATIONS; i++) {
            result = astar(matrix, 0, inputNumber);
        }
        const endTime = performance.now();
        
        const totalTime = endTime - startTime;
        const avgTime = totalTime / ITERATIONS;
        console.log(`A*: Total ${totalTime.toFixed(3)} ms (${avgTime.toFixed(5)} ms / call)`);

        document.getElementById("percorso").innerText = "Percorso più corto: " + result;
        colorNode(inputNumber);
    }
}