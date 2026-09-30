import { Graph } from '../Models/Graph.js';

export const graph = new Graph([
    [[1, 4], [2, 8]],          // Node 0 // That means node 0 connects to node 1 with a cost of 4, and to node 2 with a cost of 8
    [[0, 4], [4, 6], [2, 3]],  // Node 1
    [[0, 8], [3, 2], [1, 3]],  // Node 2
    [[2, 2], [4, 10]],         // Node 3
    [[1, 6], [3, 10]]          // Node 4
]);

export const nodeCoords = {
    0: { x: 80, y: 200 },
    1: { x: 220, y: 80 },
    2: { x: 220, y: 320 },
    3: { x: 420, y: 320 },
    4: { x: 420, y: 80 }
};

export function heuristic(node, target) {
    if (!nodeCoords[node] || !nodeCoords[target]) return 0;
    let dx = nodeCoords[node].x - nodeCoords[target].x;
    let dy = nodeCoords[node].y - nodeCoords[target].y;
    return Math.hypot(dx, dy) / 50;
}