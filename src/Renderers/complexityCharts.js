const axisColor = "rgba(209, 248, 255, 0.68)";
const gridColor = "rgba(209, 248, 255, 0.12)";

function createComplexityChart(canvasId, labels, values, options) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return;

    new window.Chart(canvas, {
        type: "line",
        data: {
            labels,
            datasets: [{
                data: values,
                borderColor: options.color,
                backgroundColor: options.fill,
                borderWidth: 2,
                pointRadius: 2,
                pointHoverRadius: 4,
                pointBackgroundColor: options.color,
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
                        label: context => `Operations: ${new Intl.NumberFormat().format(context.raw)}`
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: options.xTitle, color: axisColor, font: { size: 14 } },
                    ticks: { color: axisColor, maxTicksLimit: 7, font: { size: 14 } },
                    grid: { color: gridColor }
                },
                y: {
                    beginAtZero: true,
                    title: { display: true, text: "Number of operations", color: axisColor, font: { size: 14 } },
                    ticks: {
                        color: axisColor,
                        font: { size: 14 },
                        callback: value => new Intl.NumberFormat(undefined, { notation: "compact" }).format(value)
                    },
                    grid: { color: gridColor }
                }
            }
        }
    });
}

export function renderComplexityCharts() {
    if (!window.Chart) return;

    window.Chart.defaults.font.family = "Inter, sans-serif";
    window.Chart.defaults.color = axisColor;

    const vertexCounts = [8, 16, 32, 64, 128, 256, 512, 1024];
    createComplexityChart(
        "dijkstraComplexityChart",
        vertexCounts.map(String),
        vertexCounts.map(vertices => Math.round(vertices * Math.log2(vertices))),
        {
            color: "#d78c00",
            fill: "rgba(215, 140, 0, 0.12)",
            xTitle: "Vertices (V)"
        }
    );

    const depths = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    createComplexityChart(
        "astarComplexityChart",
        depths.map(String),
        depths.map(depth => 2 ** depth),
        {
            color: "#d78c00",
            fill: "rgba(215, 140, 0, 0.12)",
            xTitle: "Depth (d)"
        }
    );
}