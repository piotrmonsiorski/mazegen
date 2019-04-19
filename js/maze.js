// initial values
const mazeCols = 6;
const mazeRows = 5;
const displayInfo = false;

const divMaze = document.querySelector('.maze');
const divKruskalJoints = document.querySelector('.kruskal-joints');
//const divRows = [...document.querySelectorAll('.maze .row')];
//const divFields = [...document.querySelectorAll('.maze .field')];

const dirs = ['north', 'south', 'east', 'west'];

class Field {
    constructor() {
        this.visible = false;
        this.neighbourN = false;
        this.neighbourS = false;
        this.neighbourE = false;
        this.neighbourW = false;
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
    constructor(cols, rows) {
        this.map = this.generateMaze(cols, rows);
        this.cols = cols;
        this.rows = rows;
        
        this.costOrder = this.kruskalJoints(cols, rows);
        this.generateKruskal();
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
    kruskalJoints(cols, rows) {
        // create table with joints cost - vertical and horizontal
        let joints = [];
        for(let i = 0; i < (2*rows)-1; i++) {
            let row = [];
            let jointCols;
            i%2 ? jointCols = cols : jointCols = cols-1;
            for(let j = 0; j < jointCols; j++) {
                const jointCost = Math.floor(Math.random()*1000);
                const joint = new KruskalJoint(jointCost);
                if (jointCols%2) { // horizontal joint
                    console.log(i,j);
                    joint.firstField = [Math.floor(i/2), j];
                    joint.secondField = [Math.floor(i/2), j+1];
                }
                else { // vertical joint
                    console.log(i,j);
                    joint.firstField = [Math.floor(i/2), j];
                    joint.secondField = [Math.floor(i/2)+1, j];
                }
                row.push(joint);
            }
            joints.push(row);
        }
//        console.log(joints);
        
//        if (displayInfo) {
//            // display joints in overlaying table
//            joints.forEach(row => {
//                const divRow = document.createElement('div');
//                divRow.classList.add('row');
//                row.forEach(joint => {
//                    const divJoint = document.createElement('div');
//                    divJoint.classList.add('joint');
//                    divJoint.innerHTML = `<span class="number">[${joint.firstField}] [${joint.secondField}] <br/>  ${joint.cost}<span>`;
//                    divRow.appendChild(divJoint);
//                });
//                divKruskalJoints.appendChild(divRow);
//            });
//        }
        
        function compare(a,b) {
            return a.cost - b.cost;
        }
        let costOrder = [];
        joints.forEach(row => {
            costOrder = costOrder.concat(row);
        })
        costOrder.sort(compare);
        
        return costOrder;
    }
    generateKruskal() {
        let costOrder = this.costOrder;
//        let costOrder = this.costOrder.splice(0,1);
//        let costOrder = this.costOrder.splice(0,20);
        
//        console.log(costOrder);
        
        let index = 0;
        
        costOrder.forEach(joint => {
            index++;
            setTimeout( () => {
                this.renderMaze();
                let orientation;
//                console.log(joint.firstField[0], joint.firstField[1]);
//                console.log(joint.secondField[0], joint.secondField[1]);
                const firstField = this.map[joint.firstField[0]][joint.firstField[1]];
                const secondField = this.map[joint.secondField[0]][joint.secondField[1]];
                const firstNode = firstField.node;
                const secondNode = secondField.node;

                const firstDiv = document.querySelector(`.row[data-row="${joint.firstField[0]}"] .field[data-col="${joint.firstField[1]}"]`);
                const secondDiv = document.querySelector(`.row[data-row="${joint.secondField[0]}"] .field[data-col="${joint.secondField[1]}"]`);

                if(firstDiv && secondDiv) {
                    firstDiv.classList.add('highlight');
                    secondDiv.classList.add('highlight');
                }

                if (firstNode != secondNode) {
                    // assign all nodes from second grounp to the first group
                    this.map.forEach(row => {
                        row.forEach(field => {
                            if (field.node == secondNode) {
                                field.node = firstNode;
                            }
    //                        field.node == secondField.node ? field.node = firstField.node : false;
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
                setTimeout( () => {
                    if(firstDiv && secondDiv) {
                        firstDiv.classList.remove('highlight');
                        secondDiv.classList.remove('highlight');
                    }
                }, 9)
            }, 10*index);
        });
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
//                const spanNode = document.createElement('span');
//                spanNode.classList.add('node');
//                spanNode.textContent = this.map[i][j].node;
//                divField.appendChild(spanNode);
                
//                if (displayInfo) {
//                    dirs.forEach(dir => {
//                        const spanDir = document.createElement('span');
//                        spanDir.classList.add(dir);
//                        switch(dir) {
//                            case 'north':
//                                spanDir.textContent = `${this.map[i][j].neighbourN}`; break;
//                            case 'south':
//                                spanDir.textContent = `${this.map[i][j].neighbourS}`; break;
//                            case 'east':
//                                spanDir.textContent = `${this.map[i][j].neighbourE}`; break;
//                            case 'west':
//                                spanDir.textContent = `${this.map[i][j].neighbourW}`; break;
//                            default: break;
//                        }
//                        divField.appendChild(spanDir);
//                    });
//                }
                
                divRow.appendChild(divField);
            }
            divMaze.appendChild(divRow);
        }
    }
}

const maze = new Maze(mazeCols, mazeRows);
maze.renderMaze();
//maze.generateMaze();