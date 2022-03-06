/*

TODO:

[] Desenhar o caminho quando a bola encontra a comida
[] Implementar
    - BFS
    - A*
    - Outros...
[x] Deixar a quantidade de paredes proporcional à quantidade de células
[~] Implementar um toggle para escolher o algoritmo de busca
[-] Implementar uma maquina de estados para alternar entre os algoritmos
[-] Dar toques finais na pagina

*/

const W = 60; //square width 
let columns;
let rows;
let board;
let next;
let player;
let food;
let ground_type;
let fun_arg;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;

const WATER = 0;
const SAND = 1;
const MUD = 2;
const OBSTACLE = 3;
const PLAYER = 4;
const FOOD = 5;

let board_effects;
const NONE = 6;
const VISITED = 7;
const PATH = 8;


let solution_path = [];
let color;

let call_dfs;
let call_teste;

let path_square = []


class Queue {
    constructor() {
        this.elements = {}; 
        this.head = 0; 
        this.tail = 0;
    }
    push(element){
        this.elements[this.tail] = element; 
        this.tail++; 
    }
    pop(){
        const item = this.elements[this.head]
        delete this.elements[this.head]
        this.head++ 
        return item;
    }
    front(){
        return this.elements[this.head]
    }
    get length(){
        return this.tail - this.head;
    }
    get isEmpty(){
        return this.length === 0; 
    }

}


function draw_ij(i, j) {
    let c = color[board[i][j]];
    fill(c[0], c[1], c[2]);
    strokeWeight(0.0);
    rect(i * W, j * W, W, W);

    fill(0);
}
function draw_path(i, j) {
    fill(65);
    strokeWeight(0.0);
    rect(i * W, j * W, W, W);
    console.log("printing")
    fill(40);
}

function draw_map() {
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            draw_ij(i, j);
        }
    }
}

function draw_map_effects() {
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            let c = color[board_effects[i][j]];
            fill(c[0], c[1], c[2], c[3]);
            strokeWeight(0.02);
            rect(i * W, j * W, W, W);
            fill(0);
        }
    }
}

function draw_entities() {

    let col_p = color[PLAYER];
    let col_f = color[FOOD];

    fill(col_p[0], col_p[1], col_p[2]);
    ellipse(player[0] * W + W / 2, player[1] * W + W / 2, W);

    fill(col_f[0], col_f[1], col_f[2]);
    ellipse(food[0] * W + W / 2, food[1] * W + W / 2, W);
}

function place_obstacles() {

    let n_verticals = floor(random(8,( columns/2)))
    let n_horizontals = floor(random(8, rows/2));

    for(let n = 0; n < n_verticals; n++) {
        let col = floor(random(0, columns));
        let ro = floor(random(0, rows));

        let sz = floor(random(10, 30));

        for(let r = ro; r < sz + ro && r < rows; r++) {
            if (board[col][r] == OBSTACLE) break;

            board[col][r] = OBSTACLE;
        }
    }

    for(let n = 0; n < n_horizontals; n++) {
        let col = floor(random(0, columns));
        let ro = floor(random(0, rows));

        let sz = floor(random(10, 20));

        let dir = floor(random(0, 2));

        if (dir == 0) {
            for (let c = col; c < sz + col && c < columns; c++) {
                if (board[c][ro] == OBSTACLE) break;

                board[c][ro] = OBSTACLE;
            }
        } else {
            for (let c = col + sz; c > sz && c < columns && c > 0; c--) {
                if (board[c][ro] == OBSTACLE) break;

                board[c][ro] = OBSTACLE;
            }
        }
    }

}

function reset_board() {

    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            board_effects[i][j] = NONE;
        }
    }

    place_entity(PLAYER);
    place_entity(FOOD);
}


function setup() {

    //frameRate(10);

    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

    /// Calculate columns and rows
    columns = floor(width / W);
    rows = floor(height / W);
    board = new Array(columns);
    board_effects = new Array(columns);


    let noise_scale = 20.0;

    for (let i = 0; i < columns; i++) {
        board[i] = new Array(rows);
        board_effects[i] = new Array(rows);
    }

    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            board_effects[i][j] = NONE;

            let noise_val = noise(i / noise_scale, j / noise_scale);

            if (noise_val < 0.3) {
                board[i][j] = WATER;
            } else if(noise_val < 0.4) {
                board[i][j] = SAND;
            } else {
                board[i][j] = MUD;
            }
            //board[i][j] = (i + j) % 6;
        }
    }

    place_obstacles();
    place_entity(PLAYER);
    place_entity(FOOD);

    color = new Array(11);
    color[SAND] = [230, 197, 37];
    color[MUD] = [92, 51, 18];
    color[WATER] = [95, 116, 222];
    color[OBSTACLE] = [121, 114, 125];
    color[PLAYER] = [84, 191, 113];
    color[FOOD] = [191, 84, 130];


    color[NONE] = [0, 0, 0, 0];
    color[VISITED] = [10, 10, 10, 130];
    color[PATH] = [255, 10, 10, 130];


    //dfs();
    
    bfs()
    //setInterval(dfs, 2000);
    //mouseClicked(() => draw_map())
}


function place_entity(who) {
    let r_c = floor(random(0, columns));
    let r_r = floor(random(0, rows));

    if (board[r_c][r_r] != OBSTACLE) {
        if(who == PLAYER) {
            player = [r_c, r_r];
        } else {
            food = [r_c, r_r];
        }
    } else {
        place_entity(who);
    }
}

function mySleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function coroutine(f) {
    var o = f(); // instantiate the coroutine
    o.next(); // execute until the first yield
    return function(x) {
        o.next(x);
    }
}

async function dfs () {
    let around = [];
    let dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    let stack = [];

    stack.push(player);
    console.log(JSON.stringify(player));
    
    draw_map_effects();

    while (stack.length > 0) {

        let pos = stack.pop();
        board_effects[pos[0]][pos[1]] = PATH;

        draw_ij(pos[0], pos[1]);
        solution_path.push(pos);
        //draw_map_effects();
        //draw_entities();

        if (pos[0] == food[0] && pos[1] == food[1]){
            console.log(solution_path); 
            break;
        }

        for (let i = 0; i < dirs.length; i++) {
            let d = dirs[i];

            let npos = [d[0] + pos[0], d[1] + pos[1]];
            if (npos[0] >= 0 && npos[1] >= 0 && npos[0] < columns && npos[1] < rows
                && board[npos[0]][npos[1]] != OBSTACLE
                && board_effects[npos[0]][npos[1]] != VISITED && board_effects[npos[0]][npos[1]] != PATH ) {
                await mySleep(1);
                solution_path.push(npos);
                stack.push(npos);
            }else {
                solution_path.splice(solution_path.findIndex((p) => p == npos))
            }
        }

        board_effects[pos[0]][pos[1]] = VISITED;
    }
    const print_solution = () => {
        solution_path.forEach((position) =>
            draw_path(position[0], position[1]) 
        )
    }
    print_solution()

}
async function bfs () {
    let around = [];
    let dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    let queue = new Queue();

    queue.push(player);
    console.log(JSON.stringify(player));
    
    draw_map_effects();

    while (queue.length > 0) {

        let pos = queue.pop();
        board_effects[pos[0]][pos[1]] = PATH;

        draw_ij(pos[0], pos[1]);
        solution_path.push(pos);
        //draw_map_effects();
        //draw_entities();

        if (pos[0] == food[0] && pos[1] == food[1]){
            console.log(solution_path); 
            break;
        }

        for (let i = 0; i < dirs.length; i++) {
            let d = dirs[i];

            let npos = [d[0] + pos[0], d[1] + pos[1]];
            if (npos[0] >= 0 && npos[1] >= 0 && npos[0] < columns && npos[1] < rows
                && board[npos[0]][npos[1]] != OBSTACLE
                && board_effects[npos[0]][npos[1]] != VISITED && board_effects[npos[0]][npos[1]] != PATH ) {
                await mySleep(1);
                solution_path.push(npos);
                queue.push(npos);
            }else {
                solution_path.splice(solution_path.findIndex((p) => p == npos))
            }
        }
        board_effects[pos[0]][pos[1]] = VISITED;
    }
    const print_solution = () => {
        solution_path.forEach((position) =>
            draw_path(position[0], position[1]) 
        )
    }
    print_solution()

}

let draw_again = false;
function draw() {

    fix_dpi();

    background(255);

    draw_map();


    draw_map_effects();
    draw_entities();

    //call_dfs.next();
    //call_teste.next();

}
