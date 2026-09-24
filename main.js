import { colorNode, mapRenderer } from './src/Renderers/map.js';
import { dijsktra } from './src/Algorithms/Dijskstra.js';
import { astar } from './src/Algorithms/AStar.js';
import { matrix, heuristic } from './src/Data/Graph.js';

let selectedGridAlgorithm = "Dijkstra";
let selectedGraphAlgorithm = "Dijkstra";

export function selectAlgorithm(name, graph = "node") {
    const isGrid = graph === "grid";
    const dijkstraBtn = document.getElementById(isGrid ? "dijkstraGrid" : "dijsktra");
    const astarBtn = document.getElementById(isGrid ? "astarGrid" : "astar");

    if (dijkstraBtn) dijkstraBtn.classList.toggle("selectedButton", name === "Dijkstra");
    if (astarBtn) astarBtn.classList.toggle("selectedButton", name === "Astar");

    if (isGrid) selectedGridAlgorithm = name;
    else selectedGraphAlgorithm = name;
}

export function startGridRoute() {
    if (!mapRenderer) return;

    const results = mapRenderer.compareAlgorithms();
    const selected = results[selectedGridAlgorithm];
    mapRenderer.drawGrid(selected.visited, selected.path);

    const comparison = document.getElementById("gridComparison");
    if (comparison) {
        const selectedLabel = selectedGridAlgorithm === "Astar" ? "A*" : selectedGridAlgorithm;
        comparison.textContent = `Dijkstra: ${results.Dijkstra.time.toFixed(3)} ms | A*: ${results.Astar.time.toFixed(3)} ms | Showing ${selectedLabel}`;
    }
    const status = document.getElementById("gridStatus");
    if (status) status.textContent = selected.found ? "Path found" : "No path found";
}

export function startGraphRoute() {
    const inputNumber = Math.min(4, Math.max(0, Number(document.getElementById("numSearch")?.value) || 0));
    const iterations = 1000;
    let dijkstraResult;
    let astarResult;
    const dijkstraStart = performance.now();
    for (let i = 0; i < iterations; i++) dijkstraResult = dijsktra(matrix, 0);
    const dijkstraTime = (performance.now() - dijkstraStart) / iterations;

    const astarStart = performance.now();
    for (let i = 0; i < iterations; i++) astarResult = astar(matrix, 0, inputNumber, heuristic);
    const astarTime = (performance.now() - astarStart) / iterations;

    const percorsoEl = document.getElementById("percorso");
    if (percorsoEl) {
        const result = selectedGraphAlgorithm === "Dijkstra" ? dijkstraResult[inputNumber] : astarResult;
        percorsoEl.textContent = `Percorso più corto: ${result ?? "N/A"}`;
    }
    const comparison = document.getElementById("graphComparison");
    if (comparison) {
        const selectedLabel = selectedGraphAlgorithm === "Astar" ? "A*" : selectedGraphAlgorithm;
        comparison.textContent = `Dijkstra: ${dijkstraTime.toFixed(5)} ms | A*: ${astarTime.toFixed(5)} ms | Showing ${selectedLabel}`;
    }
    colorNode(inputNumber);
}

export function setGridMode(mode) {
    if (mapRenderer) mapRenderer.setMode(mode);
}

export function visualizeGrid() {
    startGridRoute();
}

export function resetGrid() {
    mapRenderer?.reset();
    const status = document.getElementById("gridStatus");
    if (status) status.textContent = "Ready";
}

export function clearMap() {
    if (mapRenderer && typeof mapRenderer.clearMap === "function") {
        mapRenderer.clearMap();
    }
    const status = document.getElementById("gridStatus");
    if (status) status.textContent = "Ready";
}

// Global binding for inline HTML handlers
window.selectAlgorithm = selectAlgorithm;
window.startGridRoute = startGridRoute;
window.startGraphRoute = startGraphRoute;
window.clearMap = clearMap;
window.setGridMode = setGridMode;
window.visualizeGrid = visualizeGrid;
window.resetGrid = resetGrid;