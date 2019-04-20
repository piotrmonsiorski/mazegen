// initial values
const mazeCols = 15;
const mazeRows = 15;
const renderStep = 50;
const displayInfo = false;

const divMaze = document.querySelector('.maze');

const dirs = ['north', 'south', 'east', 'west'];
let renderTimer;

class Field {
    constructor() {
        this.visible = false;
        this.neighbourN = false;
        this.neighbourS = false;
        this.neighbourE = false;
        this.neighbourW = false;
        
        // deep path
        this.visited = false;
        
        // kruskal
        this.node = 0;
    }
}

class KruskalJoint {
    constructor(cost = 999) {
        this.firstField = [0, 0];
        this.secondField = [0, 0];
        this.cost = cost;
    }
}

class Maze {
    constructor(algorythm, cols = mazeCols, rows = mazeRows) {
        const startTime = new Date();
        console.log('algorythm: ' + algorythm);
        
        this.map = this.generateMaze(cols, rows);
        this.cols = cols;
        this.rows = rows;
        
        switch(algorythm) {
            case 'deep-path':
                this.algorythmDeepPath(cols, rows); break;
            case 'kruskal':
                this.algorythmKruskal(cols, rows); break;
            default: break;
        }
        
        const endTime = new Date();
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
        this.renderMaze();
        
        const backTrack = [];
        
        const startCol = Math.floor(Math.random()*mazeCols);
        const startRow = Math.floor(Math.random()*mazeRows);
        
        const nextField = (row, col) => {
            
            this.map[row][col].visible = true;
            document.querySelector(`.row[data-row="${row}"] .field[data-col="${col}"]`).classList.add('visible');
            document.querySelector(`.row[data-row="${row}"] .field[data-col="${col}"]`).classList.add('visited');
            
            const dirsCopy = [...dirs];
            const nextDirs = [];
            for(let i = 4; i > 0; i--) {
                const position = Math.floor(Math.random()*i);
                nextDirs.push(dirsCopy[position]);
                dirsCopy.splice(position,1);
            }
            nextDirs.push('prev'); // if all directions are already checked, go back

            nextDirs.forEach(dir => {
                switch (dir) {
                    case 'north':
                        if(row - 1 >= 0 && !this.map[row-1][col].visible) {
                            document.querySelector(`.row[data-row="${row}"] .field[data-col="${col}"]`).classList.remove('border-top');
                            document.querySelector(`.row[data-row="${row-1}"] .field[data-col="${col}"]`).classList.remove('border-bottom');
                            nextField(row-1, col);
                        }
                        break;
                    case 'south':
                        if(row + 1 < this.map.length && !this.map[row+1][col].visible) {
                            document.querySelector(`.row[data-row="${row}"] .field[data-col="${col}"]`).classList.remove('border-bottom');
                            document.querySelector(`.row[data-row="${row+1}"] .field[data-col="${col}"]`).classList.remove('border-top');
                            nextField(row+1, col);
                        }
                        break;
                    case 'east':
                        if(col + 1 < this.map[0].length && !this.map[row][col+1].visible) {
                            document.querySelector(`.row[data-row="${row}"] .field[data-col="${col}"]`).classList.remove('border-right');
                            document.querySelector(`.row[data-row="${row}"] .field[data-col="${col+1}"]`).classList.remove('border-left');
                            nextField(row, col+1);
                        }
                        break;
                    case 'west':
                        if(col - 1 >= 0 && !this.map[row][col-1].visible) {
                            document.querySelector(`.row[data-row="${row}"] .field[data-col="${col}"]`).classList.remove('border-left');
                            document.querySelector(`.row[data-row="${row}"] .field[data-col="${col-1}"]`).classList.remove('border-right');
                            nextField(row, col-1);
                        }
                        break;
                    default:
                        break;
                }
            });
            document.querySelector(`.row[data-row="${row}"] .field[data-col="${col}"]`).classList.remove('visited');
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
                const jointCost = Math.floor(Math.random()*1000);
                const joint = new KruskalJoint(jointCost);
                if (jointCols%2) { // vertical joint
                    joint.firstField = [Math.floor(i/2), j];
                    joint.secondField = [Math.floor(i/2)+1, j];
                }
                else { // horizontal joint
                    joint.firstField = [Math.floor(i/2), j];
                    joint.secondField = [Math.floor(i/2), j+1];
                }
                row.push(joint);
            }
            joints.push(row);
        }
        
        function compare(a,b) {
            return a.cost - b.cost;
        }
        let costOrder = [];
        joints.forEach(row => {
            costOrder = costOrder.concat(row);
        })
        costOrder.sort(compare);
        
        let index = 0;
        
        costOrder.forEach(joint => {
//            index++;
//            setTimeout( () => {
//                this.renderMaze();
                let orientation;
                const firstField = this.map[joint.firstField[0]][joint.firstField[1]];
                const secondField = this.map[joint.secondField[0]][joint.secondField[1]];
                const firstNode = firstField.node;
                const secondNode = secondField.node;

                const firstDiv = document.querySelector(`.row[data-row="${joint.firstField[0]}"] .field[data-col="${joint.firstField[1]}"]`);
                const secondDiv = document.querySelector(`.row[data-row="${joint.secondField[0]}"] .field[data-col="${joint.secondField[1]}"]`);

//                if(firstDiv && secondDiv) {
//                    firstDiv.classList.add('highlight');
//                    secondDiv.classList.add('highlight');
//                }

                if (firstNode != secondNode) {
                    // assign all nodes from second grounp to the first group
                    this.map.forEach(row => {
                        row.forEach(field => {
                            field.node == secondNode ? field.node = firstNode : false;
                        });
                    });

                    joint.firstField[0] == joint.secondField[0] ? orientation = 'hor' : orientation = 'ver';
                    switch(orientation) {
                        case 'hor':
                            firstField.visible = true;
                            firstField.neighbourE = true;
                            secondField.visible = true;
                            secondField.neighbourW = true;
                            break;
                        case 'ver':
                            firstField.visible = true;
                            firstField.neighbourS = true;
                            secondField.visible = true;
                            secondField.neighbourN = true;
                            break;
                        default: break;
                    }
                }
//                setTimeout( () => {
//                    if(firstDiv && secondDiv) {
//                        firstDiv.classList.remove('highlight');
//                        secondDiv.classList.remove('highlight');
//                    }
//                }, renderStep-1)
//            }, renderStep*index);
        });
        this.renderMaze();
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

//let maze = new Maze('kruskal');
let maze = new Maze('deep-path');

const btnKruskal = document.querySelector('#kruskal');
const btnDeepPath = document.querySelector('#deep-path');
btnKruskal.addEventListener('click', () => { maze = new Maze('kruskal'); });
btnDeepPath.addEventListener('click', () => { maze = new Maze('deep-path'); });