import { MinHeap } from '../Models/MinHeap.js';

export function dijsktra(adj, src, previous = new Map()) {
    let vertices = adj.length;
    let heap = new MinHeap();
    let dist = Array(vertices).fill(Number.MAX_SAFE_INTEGER);

    dist[src] = 0;
    heap.push([0, src]);

    while (!heap.isEmpty()) {
        let [d, u] = heap.pop();

        if (d > dist[u]) continue;

        for (let [v, w] of adj[u]) {
            if (dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
                previous.set(v, u);
                heap.push([dist[v], v]);
            }
        }
    }

    return dist;
}