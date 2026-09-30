export class Graph {
    constructor(adjList = []) {
        this.adjList = adjList;
    }

    get numberOfNodes() {
        return this.adjList.length;
    }
}