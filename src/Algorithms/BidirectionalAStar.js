import { MinHeap } from '../Models/MinHeap.js';

const keyOf = ({ r, c }) => `${r},${c}`;
const heuristic = (from, to) => Math.abs(from.r - to.r) + Math.abs(from.c - to.c);

export function bidirectionalAstar(grid, start, goal) {
    const startKey = keyOf(start);
    const goalKey = keyOf(goal);
    const frontiers = [new MinHeap(), new MinHeap()];
    const distances = [new Map([[startKey, 0]]), new Map([[goalKey, 0]])];
    const previous = [new Map(), new Map()];
    const visited = new Set();
    const visitedOrder = [];
    const path = new Set();
    let meetingKey = null;
    let bestDistance = Infinity;
    let expandForward = true;

    frontiers[0].push([heuristic(start, goal), start, 0]);
    frontiers[1].push([heuristic(goal, start), goal, 0]);

    const considerMeeting = (key) => {
        if (!distances[0].has(key) || !distances[1].has(key)) return;
        const distance = distances[0].get(key) + distances[1].get(key);
        if (distance < bestDistance) {
            bestDistance = distance;
            meetingKey = key;
        }
    };

    while (!frontiers[0].isEmpty() && !frontiers[1].isEmpty()) {
        const minForward = frontiers[0].heap[0][0];
        const minBackward = frontiers[1].heap[0][0];
        if (bestDistance < Infinity && minForward >= bestDistance && minBackward >= bestDistance) break;

        const direction = expandForward ? 0 : 1;
        expandForward = !expandForward;
        const [, current, currentDistance] = frontiers[direction].pop();
        const currentKey = keyOf(current);
        if (currentDistance !== distances[direction].get(currentKey)) continue;

        visited.add(currentKey);
        visitedOrder.push(currentKey);
        considerMeeting(currentKey);

        const target = direction === 0 ? goal : start;
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
            const next = { r: current.r + dr, c: current.c + dc };
            if (next.r < 0 || next.r >= grid.length || next.c < 0 || next.c >= grid[0].length || grid[next.r][next.c] === 1) continue;

            const nextKey = keyOf(next);
            const nextDistance = currentDistance + 1;
            if (nextDistance >= (distances[direction].get(nextKey) ?? Infinity)) continue;

            distances[direction].set(nextKey, nextDistance);
            previous[direction].set(nextKey, currentKey);
            frontiers[direction].push([nextDistance + heuristic(next, target), next, nextDistance]);
            considerMeeting(nextKey);
        }
    }

    if (meetingKey !== null) {
        const forwardPath = [];
        let key = meetingKey;
        while (key !== startKey) {
            forwardPath.push(key);
            key = previous[0].get(key);
        }
        forwardPath.reverse();

        key = meetingKey;
        while (key !== goalKey) {
            key = previous[1].get(key);
            forwardPath.push(key);
        }

        for (const pathKey of forwardPath) path.add(pathKey);
    }

    return {
        visited,
        visitedOrder,
        path,
        pathOrder: [...path],
        found: meetingKey !== null,
        distance: bestDistance
    };
}