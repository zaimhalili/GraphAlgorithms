export class MapRenderer {
    constructor(canvasId, rows = 60, cols = 60, cellSize = 8) {
        this.ROWS = rows;
        this.COLS = cols;
        this.CELL_SIZE = cellSize;

        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = this.COLS * this.CELL_SIZE;
        this.canvas.height = this.ROWS * this.CELL_SIZE;

        this.grid = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
        this.start = { r: 3, c: 3 };
        this.goal = { r: this.ROWS - 5, c: this.COLS - 5 };

        this.isMouseDown = false;
        this.drawMode = 1; // 1 = draw wall, 0 = erase wall

        this.initEvents();
        this.drawGrid();
    }

    initEvents() {
        this.canvas.addEventListener("mousedown", (e) => {
            this.isMouseDown = true;

            // Determine whether we are drawing or erasing based on the initial cell clicked
            const rect = this.canvas.getBoundingClientRect();
            const c = Math.floor((e.clientX - rect.left) / this.CELL_SIZE);
            const r = Math.floor((e.clientY - rect.top) / this.CELL_SIZE);

            if (r >= 0 && r < this.ROWS && c >= 0 && c < this.COLS) {
                this.drawMode = this.grid[r][c] === 1 ? 0 : 1;
            }

            this.toggleWall(e);
        });

        this.canvas.addEventListener("mouseup", () => (this.isMouseDown = false));
        this.canvas.addEventListener("mouseleave", () => (this.isMouseDown = false));
        this.canvas.addEventListener("mousemove", (e) => {
            if (this.isMouseDown) this.toggleWall(e);
        });
    }

    toggleWall(e) {
        const rect = this.canvas.getBoundingClientRect();
        const c = Math.floor((e.clientX - rect.left) / this.CELL_SIZE);
        const r = Math.floor((e.clientY - rect.top) / this.CELL_SIZE);

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
        this.grid = Array.from({ length: this.ROWS }, () => Array(this.COLS).fill(0));
        this.drawGrid();
    }

    drawGrid(visited = [], path = []) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Fast lookup sets for animation step rendering
        const visitedSet = visited instanceof Set ? visited : new Set(visited.map(v => `${v.r},${v.c}`));
        const pathSet = path instanceof Set ? path : new Set(path.map(p => `${p.r},${p.c}`));

        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                const x = c * this.CELL_SIZE;
                const y = r * this.CELL_SIZE;
                const key = `${r},${c}`;

                if (r === this.start.r && c === this.start.c) {
                    this.ctx.fillStyle = "#22c55e"; // Start Green
                } else if (r === this.goal.r && c === this.goal.c) {
                    this.ctx.fillStyle = "#ef4444"; // Goal Red
                } else if (pathSet.has(key)) {
                    this.ctx.fillStyle = "#f59e0b"; // Path Yellow
                } else if (visitedSet.has(key)) {
                    this.ctx.fillStyle = "#3b82f6"; // Visited Blue
                } else if (this.grid[r][c] === 1) {
                    this.ctx.fillStyle = "#334155"; // Wall Dark Gray
                } else {
                    this.ctx.fillStyle = "#1e293b"; // Empty Dark Blue
                }

                this.ctx.fillRect(x, y, this.CELL_SIZE - 1, this.CELL_SIZE - 1);
            }
        }
    }
}