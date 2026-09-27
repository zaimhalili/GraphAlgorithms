import { MinHeap } from "../Models/MinHeap.js";
import { bidirectionalAstar } from "../Algorithms/BidirectionalAStar.js";
import { SearchAudio } from "../Audio/SearchAudio.js";
import { scheduleFrame } from "../Utils/scheduleFrame.js";

export class MapRenderer {
    constructor(canvasId = "gridCanvas", rows = 40, cols = 100, cellSize = 12) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ROWS = rows;
        this.COLS = cols;
        this.CELL_SIZE = cellSize;

        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = this.COLS * this.CELL_SIZE;
        this.canvas.height = this.ROWS * this.CELL_SIZE;
        const palette = getComputedStyle(document.documentElement);
        this.colors = {
            start: palette.getPropertyValue("--grid-start").trim(),
            goal: palette.getPropertyValue("--grid-goal").trim(),
            path: palette.getPropertyValue("--grid-path").trim(),
            visited: palette.getPropertyValue("--grid-visited").trim(),
            wall: palette.getPropertyValue("--grid-wall").trim(),
            empty: palette.getPropertyValue("--grid-empty").trim()
        };

        this.grid = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
        this.start = { r: 3, c: 3 };
        this.goal = { r: this.ROWS - 5, c: this.COLS - 5 };

        this.isMouseDown = false;
        this.drawMode = 1;
        this.interactionMode = "wall";
        this.isVisualized = false;
        this.animationId = 0;
        this.searchAudio = new SearchAudio();

        const soundToggle = document.getElementById("gridSound");
        if (soundToggle) {
            this.searchAudio.setEnabled(soundToggle.checked);
            soundToggle.addEventListener("change", () => {
                this.searchAudio.setEnabled(soundToggle.checked);
            });
        }

        this.initEvents();
        this.drawGrid();
    }

    getGridPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        return {
            c: Math.floor(x / this.CELL_SIZE),
            r: Math.floor(y / this.CELL_SIZE)
        };
    }

    initEvents() {
        this.canvas.addEventListener("mousedown", (e) => {
            this.isMouseDown = true;
            const { r, c } = this.getGridPos(e);

            if (r >= 0 && r < this.ROWS && c >= 0 && c < this.COLS) {
                if (this.interactionMode === "start") {
                    if (!(r === this.goal.r && c === this.goal.c)) this.start = { r, c };
                    this.drawGrid();
                    return;
                }
                if (this.interactionMode === "end") {
                    if (!(r === this.start.r && c === this.start.c)) this.goal = { r, c };
                    this.drawGrid();
                    return;
                }
                this.drawMode = this.grid[r][c] === 1 ? 0 : 1;
            }
            if (this.interactionMode === "wall") this.toggleWall(e);
        });

        this.canvas.addEventListener("mouseup", () => (this.isMouseDown = false));
        this.canvas.addEventListener("mouseleave", () => (this.isMouseDown = false));
        this.canvas.addEventListener("mousemove", (e) => {
            if (this.isMouseDown && this.interactionMode === "wall") this.toggleWall(e);
        });
    }

    setMode(mode) {
        if (["wall", "start", "end"].includes(mode)) this.interactionMode = mode;
    }

    reset() {
        this.animationId++;
        this.grid = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
        this.start = { r: 3, c: 3 };
        this.goal = { r: this.ROWS - 5, c: this.COLS - 5 };
        this.isVisualized = false;
        this.drawGrid();
    }

    findRoute(algorithm = "Dijkstra") {
        if (algorithm === "bidirectionalAstar") {
            return bidirectionalAstar(this.grid, this.start, this.goal);
        }

        const visited = new Set();
        const visitedOrder = [];
        const path = new Set();
        const frontier = new MinHeap();
        const previous = new Map();
        const distance = new Map();
        const startKey = `${this.start.r},${this.start.c}`;
        const goalKey = `${this.goal.r},${this.goal.c}`;
        visited.add(startKey);
        distance.set(startKey, 0);
        frontier.push([0, this.start]);

        while (!frontier.isEmpty()) {
            const [, current] = frontier.pop();
            const currentKey = `${current.r},${current.c}`;
            if (currentKey === goalKey) break;
            visitedOrder.push(currentKey);

            for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                const next = { r: current.r + dr, c: current.c + dc };
                const key = `${next.r},${next.c}`;
                if (next.r < 0 || next.r >= this.ROWS || next.c < 0 || next.c >= this.COLS ||
                    this.grid[next.r][next.c] === 1) continue;

                const nextDistance = distance.get(currentKey) + 1;
                const knownDistance = distance.has(key) ? distance.get(key) : Infinity;
                if (nextDistance >= knownDistance) continue;

                visited.add(key);
                previous.set(key, currentKey);
                distance.set(key, nextDistance);
                let heuristic = 0;
                if (algorithm === "Astar") {
                    heuristic = Math.abs(next.r - this.goal.r) + Math.abs(next.c - this.goal.c);
                }
                frontier.push([nextDistance + heuristic, next]);
            }
        }

        let key = goalKey;
        while (key !== startKey && previous.has(key)) {
            path.add(key);
            key = previous.get(key);
        }
        const pathOrder = [...path].reverse();
        return {
            visited,
            visitedOrder,
            path,
            pathOrder,
            found: path.size > 0 || startKey === goalKey,
            distance: distance.has(goalKey) ? distance.get(goalKey) : Infinity
        };
    }

    async animateRoute(result, delay = 0) {
        const animationId = ++this.animationId;
        const visited = new Set();
        const path = new Set();
        const pause = Math.max(0, Number(delay) || 0);
        this.searchAudio.prepare();
        this.drawGrid(visited, path);

        const animatePhase = (keys, cells, playSound) => new Promise(resolve => {
            let index = 0;
            let previousTime = 0;
            let elapsed = 0;

            const frame = (time) => {
                if (animationId !== this.animationId) {
                    resolve(false);
                    return;
                }

                if (previousTime) elapsed += time - previousTime;
                previousTime = time;
                const batchSize = pause === 0 ? 8 : Math.max(1, Math.floor(elapsed / pause));
                if (pause > 0) elapsed %= pause;

                const end = Math.min(keys.length, index + batchSize);
                while (index < end) {
                    const key = keys[index];
                    cells.add(key);
                    playSound();
                    const separator = key.indexOf(",");
                    this.drawCell(
                        Number(key.slice(0, separator)),
                        Number(key.slice(separator + 1)),
                        visited,
                        path
                    );
                    index++;
                }

                if (index < keys.length) scheduleFrame(frame);
                else resolve(true);
            };

            if (keys.length === 0) resolve(true);
            else scheduleFrame(frame);
        });

        if (!await animatePhase(result.visitedOrder, visited, () => this.searchAudio.playVisited())) return;
        if (!await animatePhase(result.pathOrder, path, () => this.searchAudio.playPathStep())) return;
        this.isVisualized = true;
    }

    visualize(algorithm = "Dijkstra") {
        const result = this.findRoute(algorithm);
        this.isVisualized = true;
        this.drawGrid(result.visited, result.path);
        return result.found;
    }

    toggleWall(e) {
        const { r, c } = this.getGridPos(e);

        if (r >= 0 && r < this.ROWS && c >= 0 && c < this.COLS) {
            const isStart = r === this.start.r && c === this.start.c;
            const isGoal = r === this.goal.r && c === this.goal.c;

            if (!isStart && !isGoal && this.grid[r][c] !== this.drawMode) {
                this.grid[r][c] = this.drawMode;
                this.drawGrid();
            }
        }
    }

    clearMap() {
        this.animationId++;
        this.grid = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
        this.isVisualized = false;
        this.drawGrid();
    }

    drawCell(r, c, visitedSet, pathSet) {
        const x = c * this.CELL_SIZE;
        const y = r * this.CELL_SIZE;
        const key = `${r},${c}`;

        if (r === this.start.r && c === this.start.c) {
            this.ctx.fillStyle = this.colors.start;
        } else if (r === this.goal.r && c === this.goal.c) {
            this.ctx.fillStyle = this.colors.goal;
        } else if (pathSet.has(key)) {
            this.ctx.fillStyle = this.colors.path;
        } else if (visitedSet.has(key)) {
            this.ctx.fillStyle = this.colors.visited;
        } else if (this.grid[r][c] === 1) {
            this.ctx.fillStyle = this.colors.wall;
        } else {
            this.ctx.fillStyle = this.colors.empty;
        }

        this.ctx.fillRect(x, y, this.CELL_SIZE - 1, this.CELL_SIZE - 1);
    }

    drawGrid(visited = [], path = []) {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const visitedSet = visited instanceof Set ? visited : new Set(visited.map(v => `${v.r},${v.c}`));
        const pathSet = path instanceof Set ? path : new Set(path.map(p => `${p.r},${p.c}`));

        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                this.drawCell(r, c, visitedSet, pathSet);
            }
        }
    }
}

export function colorNode(nodeId) {
    const targetNode = document.querySelector(`[data-node-id="${nodeId}"]`);
    if (targetNode) {
        targetNode.classList.add("route-visited");
    }
}

export function colorGraphTarget(nodeId) {
    const targetNode = document.querySelector(`[data-node-id="${nodeId}"]`);
    if (targetNode) {
        targetNode.classList.remove("route-visited");
        targetNode.classList.add("route-target");
    }
}

export function colorGraphEdge(fromNode, toNode) {
    const edge = [fromNode, toNode].sort((a, b) => a - b).join("-");
    document.querySelector(`[data-edge="${edge}"]`)?.classList.add("path-active");
}

export function resetGraphRoute() {
    document.querySelectorAll(".circle").forEach(node => {
        node.classList.remove("route-visited", "route-target");
    });
    document.querySelectorAll("[data-edge]").forEach(edge => edge.classList.remove("path-active"));
}

export let mapRenderer = null;
window.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("gridCanvas")) {
        mapRenderer = new MapRenderer("gridCanvas");
    }
});