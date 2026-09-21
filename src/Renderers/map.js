const COLS = 60;
const ROWS = 60;
const CELL_SIZE = 8;

const canvas = document.getElementById("gridCanvas");
const ctx = canvas.getContext("2d");
canvas.width = COLS * CELL_SIZE;
canvas.height = ROWS * CELL_SIZE;

let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
let start = { r: 3, c: 3 };
let goal = { r: ROWS - 5, c: COLS - 5 };

let isMouseDown = false;
let isRunning = false;

canvas.addEventListener("mousedown", (e) => { if (!isRunning) { isMouseDown = true; toggleWall(e); } });
canvas.addEventListener("mouseup", () => isMouseDown = false);
canvas.addEventListener("mousemove", (e) => { if (isMouseDown && !isRunning) toggleWall(e); });

function toggleWall(e) {
    const rect = canvas.getBoundingClientRect();
    const c = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const r = Math.floor((e.clientY - rect.top) / CELL_SIZE);

    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
        if ((r !== start.r || c !== start.c) && (r !== goal.r || c !== goal.c)) {
            grid[r][c] = 1;
            drawGrid();
        }
    }
}

function clearMap() {
    if (isRunning) return;
    grid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    document.getElementById("stats").innerText = "Click & drag on the map to draw walls!";
    drawGrid();
}

function drawGrid(visited = [], path = []) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            let x = c * CELL_SIZE;
            let y = r * CELL_SIZE;

            if (r === start.r && c === start.c) {
                ctx.fillStyle = "#22c55e";
            } else if (r === goal.r && c === goal.c) {
                ctx.fillStyle = "#ef4444";
            } else if (path.some(p => p.r === r && p.c === c)) {
                ctx.fillStyle = "#f59e0b";
            } else if (visited.some(v => v.r === r && v.c === c)) {
                ctx.fillStyle = "#3b82f6";
            } else if (grid[r][c] === 1) {
                ctx.fillStyle = "#334155";
            } else {
                ctx.fillStyle = "#1e293b";
            }

            ctx.fillRect(x, y, CELL_SIZE - 1, CELL_SIZE - 1);
        }
    }
}

function getNeighbors(r, c) {
    const res = [];
    const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    for (let [dr, dc] of dirs) {
        let nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr][nc] !== 1) {
            res.push({ r: nr, c: nc });
        }
    }
    return res;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runSearch(algo) {
    if (isRunning) return;
    isRunning = true;

    let openSet = [{ ...start, g: 0, f: 0 }];
    let cameFrom = {};
    let gScore = Array.from({ length: ROWS }, () => Array(COLS).fill(Infinity));
    gScore[start.r][start.c] = 0;

    let visitedList = [];
    let startTime = performance.now();
    const delay = () => parseInt(document.getElementById("speed").value);

    while (openSet.length > 0) {
        openSet.sort((a, b) => a.f - b.f);
        let curr = openSet.shift();

        visitedList.push(curr);

        drawGrid(visitedList);
        await sleep(delay());

        if (curr.r === goal.r && curr.c === goal.c) {
            let endTime = performance.now();
            let path = [];
            let temp = `${goal.r},${goal.c}`;
            while (cameFrom[temp]) {
                let [r, c] = temp.split(",").map(Number);
                path.push({ r, c });
                temp = cameFrom[temp];
            }

            drawGrid(visitedList, path);
            document.getElementById("stats").innerText =
                `${algo.toUpperCase()} | Visited: ${visitedList.length} cells | Time: ${(endTime - startTime).toFixed(0)} ms`;
            isRunning = false;
            return;
        }

        for (let neighbor of getNeighbors(curr.r, curr.c)) {
            let tempG = gScore[curr.r][curr.c] + 1;

            if (tempG < gScore[neighbor.r][neighbor.c]) {
                cameFrom[`${neighbor.r},${neighbor.c}`] = `${curr.r},${curr.c}`;
                gScore[neighbor.r][neighbor.c] = tempG;

                let h = (algo === 'astar')
                    ? Math.abs(neighbor.r - goal.r) + Math.abs(neighbor.c - goal.c)
                    : 0;

                let f = tempG + h;

                if (!openSet.some(n => n.r === neighbor.r && n.c === neighbor.c)) {
                    openSet.push({ ...neighbor, g: tempG, f: f });
                }
            }
        }
    }

    document.getElementById("stats").innerText = "No path found!";
    isRunning = false;
}

function selectAlgorithm(algoName) {
    runSearch(algoName.toLowerCase());
}

drawGrid();