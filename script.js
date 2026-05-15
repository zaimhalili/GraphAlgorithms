selectAlgorithm("Dijkstra");
let count = 0;
function createMapBlock(){
    const newDiv = document.createElement("div");
    newDiv.classList.add("block");

    const currentDiv = document.getElementById("mapRef");
    
    if (currentDiv) {
        currentDiv.before(newDiv);
    }
    newDiv.innerText = count.toString();
    count++;
}

for(let i = 0; i < 400; i++){
    createMapBlock();
}

function selectAlgorithm(name){
    document.getElementById("dijkstra").classList.remove("selectedButton");
    document.getElementById("astar").classList.remove("selectedButton");

    if(name === "Dijkstra"){
        document.getElementById("dijkstra").classList.add("selectedButton");
        Dijkstra();
    }else if(name === "Astar"){
        document.getElementById("astar").classList.add("selectedButton");
        Astar();
    }
}

function insideBorders(index, direction){
    if(index <= 20 && direction === -20) return false; // top
    if(index >= 381 && direction === 20) return false; // bottom
    if(index % 20 === 0 && direction === -1) return false; // left
    if((index + 1) % 20 === 0 && direction === 1) return false; // right
    return true;
}

let index = 0;
document.getElementsByClassName("block")[0].classList.add("path");
function generateMap(){
    let possiblePath = [-20, 1, 20, -1];
    const blocks = document.getElementsByClassName("block");
    while(index != 399){
        let rnd = Math.floor(Math.random() * 4);
        console.log(possiblePath[rnd])
        if(!blocks[index].classList.contains("path") || insideBorders(index, possiblePath[rnd])){
            index += possiblePath[rnd];
            blocks[index].classList.add("path");
        }
    }
}

generateMap();


function Dijkstra(){

}

function Astar(){

}