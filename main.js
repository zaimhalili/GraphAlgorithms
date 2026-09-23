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

// Admissible Euclidean heuristic divided by a scaling factor
function heuristic(node, target) {
    if (!nodeCoords[node] || !nodeCoords[target]) return 0;
    let dx = nodeCoords[node].x - nodeCoords[target].x;
    let dy = nodeCoords[node].y - nodeCoords[target].y;
    return Math.hypot(dx, dy) / 50;
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