const axisColor = "rgba(52, 78, 65, 0.84)";
const gridColor = "rgba(52, 78, 65, 0.16)";
const vertexCounts = [8, 16, 32, 64, 128, 256, 512, 1024];
const searchDepths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const branchingFactor = 2;

function createGrowthChart(canvasId, points, xTitle, yTitle, palette) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return;

    const maxX = points.at(-1).x;
    const maxY = points.at(-1).y * 1.03;

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
                            return `${xTitle}: ${new Intl.NumberFormat().format(x)} · ${yTitle}: ${new Intl.NumberFormat().format(y)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: "linear",
                    min: 0,
                    max: maxX,
                    title: { display: true, text: xTitle, color: palette.axis, font: { size: 14 } },
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
                    max: maxY,
                    title: { display: true, text: yTitle, color: palette.axis, font: { size: 14 } },
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

    const palette = {
        main: "#588157",
        fill: "rgba(88, 129, 87, 0.14)",
        axis: axisColor,
        grid: gridColor
    };
    window.Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
    window.Chart.defaults.color = palette.axis;

    const dijkstraPoints = vertexCounts.map(vertices => ({
        x: vertices,
        y: Math.round(vertices * Math.log2(vertices))
    }));
    const astarPoints = searchDepths.map(depth => ({
        x: depth,
        y: branchingFactor ** depth
    }));

    createGrowthChart(
        "dijkstraComplexityChart",
        dijkstraPoints,
        "Vertices (V)",
        "Operations (V log V)",
        palette
    );
    createGrowthChart(
        "astarComplexityChart",
        astarPoints,
        "Search depth (d)",
        `Estimated nodes (b = ${branchingFactor})`,
        palette
    );
}