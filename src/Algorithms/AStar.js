import { MinHeap } from '../Models/MinHeap.js';

export function astar(adj, src, target, heuristicFn, previous = new Map()) {
    let vertices = adj.length;
    let heap = new MinHeap();
    let dist = Array(vertices).fill(Number.MAX_SAFE_INTEGER);
    dist[src] = 0;

    heap.push([dist[src] + heuristicFn(src, target), src]);

    while (!heap.isEmpty()) {
        let [f, u] = heap.pop();

        if (u === target) {
            return dist[target];
        }

        for (let [v, w] of adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                previous.set(v, u);
                let fScore = dist[v] + heuristicFn(v, target);
                heap.push([fScore, v]);
            }
        }
    }

    return dist[target];
}