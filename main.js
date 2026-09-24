import { colorNode, mapRenderer } from './src/Renderers/map.js';
import { dijsktra } from './src/Algorithms/Dijskstra.js';
import { astar } from './src/Algorithms/AStar.js';
import { matrix, heuristic } from './src/Data/Graph.js';

let selectedGridAlgorithm = "Dijkstra";
let selectedGraphAlgorithm = "Dijkstra";
let graphAnimationId = 0;

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

    const startTime = performance.now();
    const selected = mapRenderer.findRoute(selectedGridAlgorithm);
    const elapsed = performance.now() - startTime;
    const speedInput = document.getElementById("gridSpeed");
    const speed = speedInput ? speedInput.value : 0;
    mapRenderer.animateRoute(selected, speed);

    const comparison = document.getElementById("gridComparison");
    if (comparison) {
        const selectedLabel = selectedGridAlgorithm === "Astar" ? "A*" : selectedGridAlgorithm;
        comparison.textContent = `${selectedLabel}: ${elapsed.toFixed(3)} ms`;
    }
    const status = document.getElementById("gridStatus");
    if (status) status.textContent = selected.found ? "Path found" : "No path found";
}

export function startGraphRoute() {
    const input = document.getElementById("numSearch");
    const inputNumber = Math.min(4, Math.max(0, Number(input ? input.value : 0) || 0));
    const startTime = performance.now();
    const result = selectedGraphAlgorithm === "Dijkstra"
        ? dijsktra(matrix, 0)[inputNumber]
        : astar(matrix, 0, inputNumber, heuristic);
    const elapsed = performance.now() - startTime;

    const percorsoEl = document.getElementById("percorso");
    if (percorsoEl) {
        percorsoEl.textContent = `Percorso più corto: ${result !== undefined ? result : "N/A"}`;
    }
    const comparison = document.getElementById("graphComparison");
    if (comparison) {
        const selectedLabel = selectedGraphAlgorithm === "Astar" ? "A*" : selectedGraphAlgorithm;
        comparison.textContent = `${selectedLabel}: ${elapsed.toFixed(5)} ms`;
    }
    const speedInput = document.getElementById("graphSpeed");
    const speed = Number(speedInput ? speedInput.value : 0) || 0;
    animateGraphRoute(inputNumber, speed);
}

async function animateGraphRoute(targetNode, delay) {
    const animationId = ++graphAnimationId;
    const pause = Math.max(0, Number(delay) || 0);
    const route = Array.from({ length: targetNode + 1 }, (_, node) => node);

    for (const node of route) {
        if (animationId !== graphAnimationId) return;
        colorNode(node);
        if (pause) await new Promise(resolve => setTimeout(resolve, pause));
    }
}

function bindSpeedControl(inputId, outputId) {
    const input = document.getElementById(inputId);
    const output = document.getElementById(outputId);
    if (!input || !output) return;
    input.addEventListener("input", () => {
        output.textContent = `${input.value} ms`;
    });
}

export function setGridMode(mode) {
    if (mapRenderer) mapRenderer.setMode(mode);
}

export function visualizeGrid() {
    startGridRoute();
}

export function resetGrid() {
    if (mapRenderer) mapRenderer.reset();
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

window.addEventListener("DOMContentLoaded", () => {
    selectAlgorithm("Dijkstra", "grid");
    selectAlgorithm("Dijkstra", "node");
    bindSpeedControl("gridSpeed", "gridSpeedValue");
    bindSpeedControl("graphSpeed", "graphSpeedValue");
});