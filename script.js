class Graph {
    constructor() {

    }
}

let matrix = [
    [
        0,
        5,
        100,
        7,
        100
    ],
    [
        5,
        0,
        4,
        9,
        1
    ],
    [
        100,
        4,
        0,
        100,
        12
    ],
    [
        7,
        9,
        100,
        0,
        8
    ],
    [
        100,
        1,
        12,
        8,
        0
    ]
];

selectAlgorithm("Dijkstra");

let row = 0;
let column = 0;

function createMapBlocks(numberOfBlocks) {
    for (let i = 0; i < numberOfBlocks; i++) {
        const newDiv = document.createElement("div");
        newDiv.classList.add("block");

        const currentDiv = document.getElementById("mapRef");

        if (currentDiv) {
            currentDiv.before(newDiv);
        }
        newDiv.innerText = matrix[row][column].toString();
        column++;
        if (column == 5) {
            row++;
            column = 0;
        }
    }
}

createMapBlocks(25);

function selectAlgorithm(name) {
    document.getElementById("dijkstra").classList.remove("selectedButton");
    document.getElementById("astar").classList.remove("selectedButton");

    if (name === "Dijkstra") {
        document.getElementById("dijkstra").classList.add("selectedButton");
        Dijkstra();
    } else if (name === "Astar") {
        document.getElementById("astar").classList.add("selectedButton");
        Astar();
    }
}

function Dijkstra() {

}

function Astar() {

}

