import { MinHeap } from '../Models/MinHeap.js';

export function astar(adj, src, target, heuristicFn) {
    let V = adj.length;
    let pq = new MinHeap();
    let dist = Array(V).fill(Number.MAX_SAFE_INTEGER);
    dist[src] = 0;

    pq.push([dist[src] + heuristicFn(src, target), src]);

    while (!pq.isEmpty()) {
        let [f, u] = pq.pop();

        if (u === target) {
            return dist[target];
        }

        for (let [v, w] of adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                let fScore = dist[v] + heuristicFn(v, target);
                pq.push([fScore, v]);
            }
        }
    }

    return dist[target];
}