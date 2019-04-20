// initial values
const mazeCols = 10;
const mazeRows = 10;
const renderStep = 50;
const displayInfo = false;

const divMaze = document.querySelector('.maze');

const dirs = ['north', 'south', 'east', 'west'];
let renderTimer;

const shuffle = (array) => {
    let arrayCopy = [...array];
    let shuffledArray = [];
    for(let i = array.length; i > 0; i--) {
        const position = Math.floor(Math.random()*i);
        shuffledArray.push(arrayCopy[position]);
        arrayCopy.splice(position,1);
    }
    return shuffledArray;
}

class Field {
    constructor() {
        this.visible = false;
        this.neighbourN = false;
        this.neighbourS = false;
        this.neighbourE = false;
        this.neighbourW = false;
        
        // deep path
        this.visited = false;
        
        // kruskal, eller
        this.node = 0;
    }
}

class KruskalJoint {
    constructor() {
        this.firstField = [0, 0];
        this.secondField = [0, 0];
    }
}

class Maze {
    constructor(algorythm, cols = mazeCols, rows = mazeRows) {
        console.log('algorythm: ' + algorythm);
        
        this.map = this.generateMaze(cols, rows);
        this.cols = cols;
        this.rows = rows;
        
        const startTime = new Date();
        
        switch(algorythm) {
            case 'deep-path':
                this.algorythmDeepPath(cols, rows); break;
            case 'kruskal':
                this.algorythmKruskal(cols, rows); break;
            case 'eller':
                this.algorythmEller(cols, rows); break;
            default: break;
        }
        
        const endTime = new Date();
        this.renderMaze();
        
        console.log(`${endTime - startTime} ms`);
    }
    generateMaze(cols, rows) {
        let maze = [];
        let fieldNode = 0;
        for(let i = 0; i < rows; i++) {
            let row = [];
            for(let j = 0; j < cols; j++) {
                const field = new Field;
                field.node = fieldNode++;
                row.push(field);
            }
            maze.push(row);
        }
        return maze;
    }
    algorythmDeepPath(cols, rows) {
        const startCol = Math.floor(Math.random()*mazeCols);
        const startRow = Math.floor(Math.random()*mazeRows);
        
        const nextField = (row, col) => {
            
            this.map[row][col].visible = true;
            
//            const dirsCopy = [...dirs];
//            const nextDirs = [];
//            for(let i = 4; i > 0; i--) {
//                const position = Math.floor(Math.random()*i);
//                nextDirs.push(dirsCopy[position]);
//                dirsCopy.splice(position,1);
//            }
            const nextDirs = shuffle(dirs);
            nextDirs.push('prev'); // if all directions are already checked, go back

            nextDirs.forEach(dir => {
                switch (dir) {
                    case 'north':
                        if(row - 1 >= 0 && !this.map[row-1][col].visible) {
                            this.map[row][col].neighbourN = true;
                            this.map[row-1][col].neighbourS = true;
                            nextField(row-1, col);
                        }
                        break;
                    case 'south':
                        if(row + 1 < this.map.length && !this.map[row+1][col].visible) {
                            this.map[row][col].neighbourS = true;
                            this.map[row+1][col].neighbourN = true;
                            nextField(row+1, col);
                        }
                        break;
                    case 'east':
                        if(col + 1 < this.map[0].length && !this.map[row][col+1].visible) {
                            this.map[row][col].neighbourE = true;
                            this.map[row][col+1].neighbourW = true;
                            nextField(row, col+1);
                        }
                        break;
                    case 'west':
                        if(col - 1 >= 0 && !this.map[row][col-1].visible) {
                            this.map[row][col].neighbourW = true;
                            this.map[row][col-1].neighbourE = true;
                            nextField(row, col-1);
                        }
                        break;
                    default:
                        break;
                }
            });
        }
        
        nextField(startRow, startCol);
    }
    algorythmKruskal(cols, rows) {
        // create table with joints cost - vertical and horizontal
        let joints = [];
        for(let i = 0; i < (2*rows)-1; i++) {
            let row = [];
            let jointCols;
            i%2 ? jointCols = cols : jointCols = cols-1;
            for(let j = 0; j < jointCols; j++) {
//                const jointCost = Math.floor(Math.random()*1000);
                const joint = new KruskalJoint();
                if (jointCols%2) { // vertical joint
                    joint.firstField = [Math.floor(i/2), j];
                    joint.secondField = [Math.floor(i/2), j+1];
                }
                else { // horizontal joint
                    joint.firstField = [Math.floor(i/2), j];
                    joint.secondField = [Math.floor(i/2)+1, j];
                }
                row.push(joint);
            }
            joints.push(row);
        }
        
        // create one dimentional array with all joints
        let jointsConcat = [];
        joints.forEach(row => {
            jointsConcat = jointsConcat.concat(row);
        })
        
        for (let i = 0; i < jointsConcat.length; i) { // no i iteration since jointsConcat array is spliced
            // randomly pick remaining joint
            const position = Math.floor(Math.random() * jointsConcat.length);
            const joint = jointsConcat[position];
            
            const firstField = this.map[joint.firstField[0]][joint.firstField[1]];
            const secondField = this.map[joint.secondField[0]][joint.secondField[1]];
            const firstNode = firstField.node;
            const secondNode = secondField.node;
            
            if (firstNode != secondNode) {
                // assign all nodes from second grounp to the first group
                this.map.forEach(row => {
                    row.forEach(field => {
                        field.node == secondNode ? field.node = firstNode : false;
                    });
                });
                
                if (joint.firstField[0] == joint.secondField[0]) { // horizontal joint
                    firstField.visible = true;
                    firstField.neighbourE = true;
                    secondField.visible = true;
                    secondField.neighbourW = true;
                }
                else { // vertical joint
                    firstField.visible = true;
                    firstField.neighbourS = true;
                    secondField.visible = true;
                    secondField.neighbourN = true;
                }
            }
            jointsConcat.splice(position, 1);
        }
    }
    algorythmEller(cols, rows) {
        this.renderMaze();
        const map = this.map;
        for(let i = 0; i < rows; i++) {
            // random horizontal joints
            for(let j = 0; j < cols-1; j++) { // skip last field in row
                const field = map[i][j];
                const nextField = map[i][j+1];
                const fieldNode = map[i][j].node;
                const nextfieldNode = map[i][j+1].node;
                
                // last row - connect remaining node sets
                if (i == rows - 1) {
                    if (fieldNode != nextfieldNode) {
                        field.neighbourE = true;
                        field.visible = true;
                        nextField.neighbourW = true;
                        nextField.node = fieldNode;
                        nextField.visible = true;
                        
                        this.map.forEach(row => {
                            row.forEach(checkField => {
                                checkField.node == nextfieldNode ? checkField.node = fieldNode : false;
                            });
                        });
                    }
                }
                
                const join = Math.round(Math.random()); // pick randomly if join
                if (join)  {
                    if (i == 0) { // for first row make it random
                        field.neighbourE = true;
                        nextField.neighbourW = true;
                        nextField.node = fieldNode;
                        field.visible = true;
                        nextField.visible = true;
                    }
                    else {
                        if (fieldNode != nextfieldNode) {
                            field.neighbourE = true;
                            nextField.neighbourW = true;
                            nextField.node = fieldNode;
                            field.visible = true;
                            nextField.visible = true;
                            
                            if (nextField.neighbourN) {
                                let checkedNode = this.map[i-1][j+1].node;
                                this.map.forEach((row, rowIndex) => {
                                    row.forEach((checkField, fieldIndex) => {
                                        if (fieldIndex < row.length) {
                                            if(checkField.node == checkedNode) {
                                                checkField.node = fieldNode;
                                            }
                                        }
                                    });
                                });
                            }
                        }
                    }
                }
            }
            
            // random vertical joints, at least once per set
            if (i != rows - 1) { // don't make south joints for last row
                const rowNodes = [];
                for (let j = 0; j < cols*rows; j++) { // loop through all nodes (0 to cols-1)
                    const nodes = [];
                    for (let k = 0; k < cols; k++) { // loop through the whole row to find "j" nodes
                        this.map[i][k].node == j ? nodes.push([i,k]) : false;
                    }
                    rowNodes.push(nodes);
                }
                
                rowNodes.forEach(node => {
                    if(node.length) {
                        const shuffledNode = shuffle(node);
                        
                        shuffledNode.forEach( (field, index) => {
                            let join = 1;
                            index > 0 ? join = Math.round(Math.random()) : false;
                            
                            if (join) {
                                const row = field[0];
                                const col = field[1];
                                const fieldNode = this.map[row][col].node;
                                this.map[row][col].neighbourS = true;
                                this.map[row+1][col].neighbourN = true;
                                this.map[row+1][col].node = this.map[row][col].node;
                                this.map[row][col].visible = true;
                                this.map[row+1][col].visible = true;
                                
                                let checkedNode = this.map[row+1][col].node;
                                this.map.forEach(row => {
                                    row.forEach(checkField => {
                                        checkField.node == checkedNode ? checkField.node = fieldNode : false;
                                    });
                                });
                            }
                        });
                    } 
                });               
                
            }
        }
    }
    renderMaze() {
        divMaze.innerHTML = '';
        for(let i = 0; i < this.rows; i++) {
            const divRow = document.createElement('div');
            divRow.classList.add('row');
            divRow.dataset.row = i;
            for(let j = 0; j < this.cols; j++) {
                const divField = document.createElement('div');
                divField.classList.add('field');
                divField.dataset.col = j;
                
                divField.innerHTML = `<span class="node">${this.map[i][j].node}</span>`;
                
//                console.log(this.map[i][j].neighbourN, this.map[i][j].neighbourS, this.map[i][j].neighbourE, this.map[i][j].neighbourW)
                this.map[i][j].neighbourN ? false : divField.classList.add('border-top');
                this.map[i][j].neighbourS ? false : divField.classList.add('border-bottom');
                this.map[i][j].neighbourE ? false : divField.classList.add('border-right');
                this.map[i][j].neighbourW ? false : divField.classList.add('border-left');
                this.map[i][j].visible ? divField.classList.add('visible') : false;
                
                divRow.appendChild(divField);
            }
            divMaze.appendChild(divRow);
        }
    }
}

//let maze = new Maze('deep-path');
//let maze = new Maze('kruskal');
let maze = new Maze('eller');

const btnKruskal = document.querySelector('#kruskal');
const btnDeepPath = document.querySelector('#deep-path');
const btnEller = document.querySelector('#eller');
btnKruskal.addEventListener('click', () => { maze = new Maze('kruskal'); });
btnDeepPath.addEventListener('click', () => { maze = new Maze('deep-path'); });
btnEller.addEventListener('click', () => { maze = new Maze('eller'); });