import { mapRenderer } from "./map.js";

const gridSizes = [8, 12, 16, 20, 24, 28, 32, 36, 40];
const sampleRuns = 9;
const timingBatchSize = 7;

function median(values) {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)];
}

function measureAlgorithm(renderer, algorithm, size) {
    renderer.ROWS = size;
    renderer.COLS = size;
    renderer.grid = Array.from({ length: size }, () => Array(size).fill(0));
    renderer.start = { r: 0, c: 0 };
    renderer.goal = { r: size - 1, c: size - 1 };
    for (let run = 0; run < 3; run++) renderer.findRoute(algorithm);

    const durations = [];
    let result;
    for (let sample = 0; sample < sampleRuns; sample++) {
        const startTime = performance.now();
        for (let run = 0; run < timingBatchSize; run++) {
            result = renderer.findRoute(algorithm);
        }
        durations.push((performance.now() - startTime) / timingBatchSize);
    }

    return {
        x: result.visitedOrder.length + (result.found ? 1 : 0),
        y: median(durations)
    };
}

function collectMeasurements() {
    if (!mapRenderer) return null;

    const original = {
        rows: mapRenderer.ROWS,
        columns: mapRenderer.COLS,
        grid: mapRenderer.grid,
        start: mapRenderer.start,
        goal: mapRenderer.goal
    };
    const dijkstra = [];
    const astar = [];

    try {
        for (const size of gridSizes) {
            dijkstra.push(measureAlgorithm(mapRenderer, "Dijkstra", size));
            astar.push(measureAlgorithm(mapRenderer, "Astar", size));
        }
    } finally {
        mapRenderer.ROWS = original.rows;
        mapRenderer.COLS = original.columns;
        mapRenderer.grid = original.grid;
        mapRenderer.start = original.start;
        mapRenderer.goal = original.goal;
    }

    return { dijkstra, astar };
}

function createPerformanceChart(canvasId, points, palette) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return;

    const maxNodes = Math.max(...points.map(point => point.x));
    const maxTime = Math.max(0.05, Math.max(...points.map(point => point.y)) * 1.03);

    new window.Chart(canvas, {
        type: "line",
        data: {
            datasets: [{
                data: points,
                borderColor: palette.main,
                backgroundColor: palette.fill,
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 5,
                pointBackgroundColor: palette.main,
                fill: true,
                tension: 0.25
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 350 },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: context => {
                            const { x, y } = context.raw;
                            return `${new Intl.NumberFormat().format(x)} nodes checked · ${y.toFixed(3)} ms`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: "linear",
                    min: 0,
                    max: maxNodes,
                    title: { display: true, text: "Nodes checked", color: palette.axis, font: { size: 14 } },
                    ticks: {
                        color: palette.axis,
                        maxTicksLimit: 7,
                        font: { size: 14 },
                        callback: value => new Intl.NumberFormat(undefined, { notation: "compact" }).format(value)
                    },
                    grid: { color: palette.grid }
                },
                y: {
                    beginAtZero: true,
                    min: 0,
                    max: maxTime,
                    title: { display: true, text: "Execution time (ms)", color: palette.axis, font: { size: 14 } },
                    ticks: {
                        color: palette.axis,
                        font: { size: 14 },
                        callback: value => value.toFixed(value < 1 ? 2 : 1)
                    },
                    grid: { color: palette.grid }
                }
            }
        }
    });
}

export function renderComplexityCharts() {
    if (!window.Chart) return;

    const styles = getComputedStyle(document.documentElement);
    const main = styles.getPropertyValue("--main").trim();
    const palette = {
        main,
        fill: `${main}24`,
        axis: styles.getPropertyValue("--light").trim(),
        grid: `${main}35`
    };
    window.Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
    window.Chart.defaults.color = palette.axis;

    const measurements = collectMeasurements();
    if (!measurements) return;

    measurements.dijkstra.sort((a, b) => a.x - b.x);
    measurements.astar.sort((a, b) => a.x - b.x);
    createPerformanceChart("dijkstraComplexityChart", measurements.dijkstra, palette);
    createPerformanceChart("astarComplexityChart", measurements.astar, palette);
}