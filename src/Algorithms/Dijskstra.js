import { MinHeap } from '../Models/MinHeap.js';

export function dijsktra(adj, src) {
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