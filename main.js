import {
    colorGraphEdge,
    colorGraphTarget,
    colorNode,
    mapRenderer,
    resetGraphRoute
} from './src/Renderers/map.js';
import { scheduleFrame } from './src/Utils/scheduleFrame.js';
import { renderComplexityCharts } from './src/Renderers/complexityCharts.js';
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
    const bidirectionalAstarBtn = isGrid ? document.getElementById("bidirectionalAstar") : null;


    if (dijkstraBtn) dijkstraBtn.classList.toggle("selectedButton", name === "Dijkstra");
    if (astarBtn) astarBtn.classList.toggle("selectedButton", name === "Astar");
    if (bidirectionalAstarBtn) bidirectionalAstarBtn.classList.toggle("selectedButton", name === "bidirectionalAstar");

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
        const selectedLabel = selectedGridAlgorithm === "Astar" ? "A*"
            : selectedGridAlgorithm === "bidirectionalAstar" ? "Bidirectional A*"
                : selectedGridAlgorithm;
        comparison.textContent = `${selectedLabel}: ${elapsed.toFixed(3)} ms`;
    }
    const status = document.getElementById("gridStatus");
    if (status) status.textContent = selected.found ? "Path found" : "No path found";
}

export function startGraphRoute() {
    const input = document.getElementById("numSearch");
    const inputNumber = Math.min(4, Math.max(0, Number(input ? input.value : 0) || 0));
    const startTime = performance.now();
    const previous = new Map();
    const result = selectedGraphAlgorithm === "Dijkstra"
        ? dijsktra(matrix, 0, previous)[inputNumber]
        : astar(matrix, 0, inputNumber, heuristic, previous);
    const elapsed = performance.now() - startTime;
    const route = [inputNumber];
    while (route[0] !== 0 && previous.has(route[0])) {
        route.unshift(previous.get(route[0]));
    }
    if (route[0] !== 0) route.length = 0;

    const percorsoEl = document.getElementById("percorso");
    if (percorsoEl) {
        percorsoEl.textContent = `Percorso più corto: ${result !== undefined ? result : "N/A"}`;
    }
    const comparison = document.getElementById("graphComparison");
    if (comparison) {
        const selectedLabel = selectedGraphAlgorithm === "Astar" ? "A*" : selectedGraphAlgorithm;
        comparison.textContent = `${selectedLabel}: ${elapsed.toFixed(3)} ms`;
    }
    const speedInput = document.getElementById("graphSpeed");
    const speed = Number(speedInput ? speedInput.value : 0) || 0;
    animateGraphRoute(route, speed);
}

async function animateGraphRoute(route, delay) {
    const animationId = ++graphAnimationId;
    const pause = Math.max(0, Number(delay) || 0);
    resetGraphRoute();

    for (let index = 0; index < route.length; index++) {
        if (animationId !== graphAnimationId) return;
        const node = route[index];
        colorNode(node);
        if (index > 0) colorGraphEdge(route[index - 1], node);
        if (index === route.length - 1) colorGraphTarget(node);

        await new Promise(resolve => scheduleFrame(() => {
            if (pause) setTimeout(resolve, pause);
            else resolve();
        }));
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
    if (window.Chart) renderComplexityCharts();
    else window.addEventListener("load", renderComplexityCharts, { once: true });
});