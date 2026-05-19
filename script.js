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
]

selectAlgorithm("Dijkstra");
let row = 0;
let column = 0;
function createMapBlock() {
    const newDiv = document.createElement("div");
    newDiv.classList.add("block");

    const currentDiv = document.getElementById("mapRef");

    if (currentDiv) {
        currentDiv.before(newDiv);
    }
    newDiv.innerText = matrix[row][column].toString();
    column++;
    if (column == 4) {
        row++;
        column = 0;
    }
}

for (let i = 0; i < 25; i++) {
    createMapBlock();
}

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

function IsInsideBorders(index, direction) {
    if (index <= 20 && direction === -20) return false; // top
    if (index >= 381 && direction === 20) return false; // bottom
    if (index % 20 === 0 && direction === -1) return false; // left
    if ((index + 1) % 20 === 0 && direction === 1) return false; // right
    return true;
}

function GoesOverPreviousBlocks(index, direction) {

}


// document.getElementsByClassName("block")[0].classList.add("path");

// function generateMap() {
//     // All possibilities
//     // let possiblePath = [-20, 1, 20, -1]; 

//     // Only right and down
//     let possiblePath = [1, 20];
//     const blocks = document.getElementsByClassName("block");

//     // Generate possible paths
//     for (let i = 0; i < 2; i++) {
//         let index = 0;
//         while (index != 399) {
//             let rnd = Math.floor(Math.random() * possiblePath.length);
//             console.log(possiblePath[rnd])
//             if (!blocks[index].classList.contains("path") || IsInsideBorders(index, possiblePath[rnd])) {
//                 index += possiblePath[rnd];
//                 blocks[index].classList.add("path");
//             }
//         }
//     }

// }

// generateMap();


function Dijkstra() {

}

function Astar() {

}

