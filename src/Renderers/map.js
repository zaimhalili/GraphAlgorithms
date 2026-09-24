export class MapRenderer {
    constructor(canvasId = "gridCanvas", rows = 40, cols = 80, cellSize = 12) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ROWS = rows;
        this.COLS = cols;
        this.CELL_SIZE = cellSize;

        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = this.COLS * this.CELL_SIZE;
        this.canvas.height = this.ROWS * this.CELL_SIZE;

        this.grid = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
        this.start = { r: 3, c: 3 };
        this.goal = { r: this.ROWS - 5, c: this.COLS - 5 };

        this.isMouseDown = false;
        this.drawMode = 1;
        this.interactionMode = "wall";
        this.isVisualized = false;

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
        this.grid = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
        this.start = { r: 3, c: 3 };
        this.goal = { r: this.ROWS - 5, c: this.COLS - 5 };
        this.isVisualized = false;
        this.drawGrid();
    }

    findRoute(algorithm = "Dijkstra") {
        const visited = new Set();
        const path = new Set();
        const frontier = [{ priority: 0, point: this.start }];
        const previous = new Map();
        const distance = new Map();
        const startKey = `${this.start.r},${this.start.c}`;
        const goalKey = `${this.goal.r},${this.goal.c}`;
        visited.add(startKey);
        distance.set(startKey, 0);

        while (frontier.length) {
            frontier.sort((a, b) => a.priority - b.priority);
            const current = frontier.shift().point;
            const currentKey = `${current.r},${current.c}`;
            if (currentKey === goalKey) break;

            for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
                const next = { r: current.r + dr, c: current.c + dc };
                const key = `${next.r},${next.c}`;
                if (next.r < 0 || next.r >= this.ROWS || next.c < 0 || next.c >= this.COLS ||
                    this.grid[next.r][next.c] === 1) continue;
                const nextDistance = distance.get(currentKey) + 1;
                if (nextDistance >= (distance.get(key) ?? Infinity)) continue;
                visited.add(key);
                previous.set(key, currentKey);
                distance.set(key, nextDistance);
                const heuristic = algorithm === "Astar"
                    ? Math.abs(next.r - this.goal.r) + Math.abs(next.c - this.goal.c)
                    : 0;
                frontier.push({ priority: nextDistance + heuristic, point: next });
            }
        }

        let key = goalKey;
        while (key !== startKey && previous.has(key)) {
            path.add(key);
            key = previous.get(key);
        }
        return {
            visited,
            path,
            found: path.size > 0 || startKey === goalKey,
            distance: distance.get(goalKey) ?? Infinity
        };
    }

    compareAlgorithms() {
        const results = {};
        for (const algorithm of ["Dijkstra", "Astar"]) {
            const startTime = performance.now();
            results[algorithm] = this.findRoute(algorithm);
            results[algorithm].time = performance.now() - startTime;
        }
        return results;
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
        this.reset();
    }

    drawGrid(visited = [], path = []) {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const visitedSet = visited instanceof Set ? visited : new Set(visited.map(v => `${v.r},${v.c}`));
        const pathSet = path instanceof Set ? path : new Set(path.map(p => `${p.r},${p.c}`));

        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                const x = c * this.CELL_SIZE;
                const y = r * this.CELL_SIZE;
                const key = `${r},${c}`;

                if (r === this.start.r && c === this.start.c) {
                    this.ctx.fillStyle = "#22c55e"; // Green
                } else if (r === this.goal.r && c === this.goal.c) {
                    this.ctx.fillStyle = "#ef4444"; // Red
                } else if (pathSet.has(key)) {
                    this.ctx.fillStyle = "#f59e0b"; // Yellow
                } else if (visitedSet.has(key)) {
                    this.ctx.fillStyle = "#3b82f6"; // Blue
                } else if (this.grid[r][c] === 1) {
                    this.ctx.fillStyle = "#334155"; // Dark Gray Wall
                } else {
                    this.ctx.fillStyle = "#1e293b"; // Dark Blue Empty
                }

                this.ctx.fillRect(x, y, this.CELL_SIZE - 1, this.CELL_SIZE - 1);
            }
        }
    }
}

export function colorNode(nodeId) {
    const nodes = document.querySelectorAll(".circle");
    nodes.forEach(node => node.classList.remove("bg-yellow-500", "bg-green-500"));

    const targetNode = nodes[nodeId];
    if (targetNode) {
        targetNode.classList.add("bg-yellow-500");
    }
}

export let mapRenderer = null;
window.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("gridCanvas")) {
        mapRenderer = new MapRenderer("gridCanvas");
    }
});