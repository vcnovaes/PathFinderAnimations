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

//import {MinHeap} from './dataStructure.js' 
const W = 32; //square width 
let columns;
let rows;
let board;
let next;
let player;
let food;
let ground_type;
let fun_arg;
let choosed_algorithm
let executing = false;
let Botao
let path_solution ; 
let last_position ; 
let heap; 
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
const SOLUTION = 9;
const EDGE = 10;

const STOPPED = 0;
const RUNNING = 1;
const PRE_WALKING = 2; 
const WALKING = 3; 
const delay_time = 1;


let game_state = STOPPED;

let color;

let iterations = 0;

let call_dfs;
let call_teste;
let player_anim;

let path_square = []

let DijkstraDist ; 



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

function terrain_slow(terrain_type) {
    if(terrain_type == WATER) {
        return 100;
    } else if(terrain_type == MUD) {
        return 1;
    } else if(terrain_type == SAND) {
        return 5;
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

function draw_map_distances() {
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            let d = DijkstraDist[i][j];
            textSize(12);
            fill(0, 0, 0, 150);
            strokeWeight(0.02);
            text(d, i * W, (j + 1) * W);
            //rect(i * W, j * W, W, W);
            //fill(0);

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

function draw_anim() {
    let col_p = [255, 255, 255];

    fill(col_p[0], col_p[1], col_p[2]);
    ellipse(player_anim[0] * W + W / 2, player_anim[1] * W + W / 2, W);
}

async function redraw_player(){
    fill(col_p[0], col_p[1], col_p[2]);
    ellipse(player[0] * W + W / 2, player[1] * W + W / 2, W);
    await mySleep(100);
}
function place_obstacles() {

    let n_verticals = floor(random(8,( columns/2)))
    let n_horizontals = floor(random(8, rows/2));
    let flag =1;
    for(let n = 0; n < n_verticals; n++) {    
        let col = floor(random(0, columns));
        let ro = floor(random(0, rows));

        let sz = floor(random(5, 10));

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
                if(!flag) continue
                flag = !flag;
                if (board[c][ro] == OBSTACLE) break;

                board[c][ro] = OBSTACLE;
            }
        } else {
            for (let c = col + sz; c > sz && c < columns && c > 0; c--) {
                if(!flag) continue
                flag = !flag;
                if (board[c][ro] == OBSTACLE) break;

                board[c][ro] = OBSTACLE;
            }
        }
        flag = !flag
    }
}

function generate_terrain() {

    console.log("Generating terrain");

    let noise_scale = 20.0;

    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            board_effects[i][j] = NONE;


            let noise_val = noise(i / noise_scale, j / noise_scale, iterations);

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
}



function reset_board(value) {

    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            board_effects[i][j] = NONE;
        }
    }
    if(value==1){
        place_obstacles()
    }
    food =[-1,-1]
    player = [-1,-1]
    place_entity(PLAYER);
    place_entity(FOOD);
}



function place_entity(who) {
    let r_c = floor(random(0, columns));
    let r_r = floor(random(0, rows));

    if (board[r_c][r_r] != OBSTACLE) {
        if(who == PLAYER) {
            if(r_c == food[0] && r_r == food[1]) place_entity(who);
            player = [r_c, r_r]
        } else {
            if(r_c == player[0] && r_r == player[1]) place_entity(who);
            food = [r_c, r_r];
        }
    } else {
        place_entity(who);
    }
}

function mySleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function dfs () {
    game_state = RUNNING;
    let around = [];
    let dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    let stack = [];

    stack.push(player);
    console.log(JSON.stringify(player));
    let sol = {}
    let lp = -1

    while (stack.length > 0) {

        let pos = stack.pop();
        board_effects[pos[0]][pos[1]] = PATH;

        if(pos[0] == food[0] && pos[1] == food[1]) {
            lp = pos; 
            break; 
        }

        for (let i = 0; i < dirs.length; i++) {
            let d = dirs[i];

            let npos = [d[0] + pos[0], d[1] + pos[1]];
            if (npos[0] >= 0 && npos[1] >= 0 && npos[0] < columns && npos[1] < rows
                && board[npos[0]][npos[1]] != OBSTACLE
                && board_effects[npos[0]][npos[1]] != VISITED && board_effects[npos[0]][npos[1]] != PATH ) {
                await mySleep(delay_time);
                sol [npos] = pos; 
                board_effects[npos[0]][npos[1]] = EDGE;
                stack.push(npos);
            }
        }

        board_effects[pos[0]][pos[1]] = VISITED;
    }

    path_solution = sol; 
    last_position = lp;
    game_state = PRE_WALKING;

}

function drawSolutionPath(sol_path, last_pos) {
    let solution = [food]; 
    while(last_pos != player){
        board_effects[last_pos[0]][last_pos[1]] = SOLUTION;
        last_pos = sol_path[last_pos];
        solution.push(last_pos); 
    }

    board_effects[player[0]][player[1]] = SOLUTION;
    draw_map_effects();

    //game_state = STOPPED;

    return solution.reverse(); 
}

async function animatePlayer(path) {
    let cur = 0;

    while (cur < path.length) {
        let next_pos = path[cur];


        let slow = terrain_slow(board[next_pos[0]][next_pos[1]]) * 10;

        let n = 20;

        for (let i = 1; i < n - 1; i++) {
         
            let ratio = i / n;

            player_anim[0] = player_anim[0] * (1.0 - ratio) + next_pos[0] * ratio;
            player_anim[1] = player_anim[1] * (1.0 - ratio) + next_pos[1] * ratio;

            await mySleep(slow / n);
        }

        cur ++;
    }
    
    await mySleep(1000);

    game_state = STOPPED;
}

async function bfs () {

    game_state = RUNNING;
    let around = [];
    let dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    let queue = new Queue();

    queue.push(player);
    console.log(JSON.stringify(player));
    
    path = {}
    let npos; 
    let lp = -1;
    while (queue.length > 0) {
        console.log('loop')
        let pos = queue.pop();

        if(board_effects[pos[0]][pos[1]] == PATH || board_effects[pos[0]][pos[1]] == VISITED) {
            continue;
        }

        board_effects[pos[0]][pos[1]] = PATH;

        if(pos[0] == food[0] && pos[1] == food[1]){
            lp = pos;
            break;
        }
        for (let i = 0; i < dirs.length; i++) {
            let d = dirs[i];

            npos = [d[0] + pos[0], d[1] + pos[1]];
            if (npos[0] >= 0 && npos[1] >= 0 && npos[0] < columns && npos[1] < rows
                && board[npos[0]][npos[1]] != OBSTACLE
                && board_effects[npos[0]][npos[1]] != VISITED && board_effects[npos[0]][npos[1]] != PATH ) {
                await mySleep(delay_time);

                board_effects[npos[0]][npos[1]] = EDGE;
                queue.push(npos);
                path[npos] = pos; 
            }
        }
    
        board_effects[pos[0]][pos[1]] = VISITED;
    }

    path_solution = path;
    last_position = lp; 
    game_state = PRE_WALKING;
    console.log('terminou loop')
}

function heuristic(posA){    
    return Math.abs(posA[0] - food[0]) + Math.abs(posA[1] - food[1]); 
}

async function dijkstra(){

    game_state = RUNNING;
    let around = [];
    let dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    
    for(let i =0;i < columns;i++){
        for(let j = 0 ; j < rows; j++){
            DijkstraDist[i][j] = Number.POSITIVE_INFINITY;
        }
    }

    DijkstraDist[player[0]][player[1]] = 0; 
     
    
    //heap.insert([0,source]);
   // heap.remove(); 
    //heap.getMin() ; 
    
    heap.insert([0,player])
    let path = {}; 
    let lp =-1;
    while(heap.length != 1){
        if(heap.getMin() == null) break; 
        let distance = heap.getMin()[0];
        let pos = heap.getMin()[1];
        heap.remove();
        
        if(distance > DijkstraDist[pos[0]][pos[1]]) {
            continue;
        }
        //
        if(board_effects[pos[0]][pos[1]] == PATH || board_effects[pos[0]][pos[1]] == VISITED) {
            continue;
        }

        //board_effects[pos[0]][pos[1]] = PATH;

        if(pos[0] == food[0] && pos[1] == food[1]){
            lp = pos;
            //break;
        }
        for (let i = 0; i < dirs.length; i++) {
            let d = dirs[i];

            npos = [d[0] + pos[0], d[1] + pos[1]];

            if (npos[0] >= 0 && npos[1] >= 0 && npos[0] < columns && npos[1] < rows
                && board[npos[0]][npos[1]] != OBSTACLE
                && board_effects[npos[0]][npos[1]] != PATH ) {

                let slow = terrain_slow(board[npos[0]][npos[1]]);
                if((DijkstraDist[pos[0]][pos[1]] + slow) < DijkstraDist[npos[0]][npos[1]]){
                    DijkstraDist[npos[0]][npos[1]] = DijkstraDist[pos[0]][pos[1]] + slow;
                    board_effects[npos[0]][npos[1]] = EDGE;
                    //queue.push(npos);
                    heap.insert([ DijkstraDist[npos[0]][npos[1]],npos])
                    path[npos] = pos; 
                    await mySleep(delay_time);
                }
            }
        }
        board_effects[pos[0]][pos[1]] = VISITED;
        //

    }
    heap.heap = [null];
    path_solution = path;
    last_position = lp; 
    game_state = PRE_WALKING;
}

async function astar(){

    game_state = RUNNING;
    let around = [];
    let dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    
    for(let i =0;i < columns;i++){
        for(let j = 0 ; j < rows; j++){
            DijkstraDist[i][j] = Number.POSITIVE_INFINITY;
        }
    }

    DijkstraDist[player[0]][player[1]] = 0; 
     
    
    //heap.insert([0,source]);
   // heap.remove(); 
    //heap.getMin() ; 
    
    heap.insert([0,0,player])
    let path = {}; 
    let lp=-1;
    while(heap.length != 1){
        if(heap.getMin() == null) break; 
        let distance = heap.getMin()[1];
        let pos = heap.getMin()[2];
        heap.remove();
        
        if(distance > DijkstraDist[pos[0]][pos[1]])continue;
        //
        if(board_effects[pos[0]][pos[1]] == PATH || board_effects[pos[0]][pos[1]] == VISITED) {
            continue;
        }

        //board_effects[pos[0]][pos[1]] = PATH;

        if(pos[0] == food[0] && pos[1] == food[1]){
            lp = pos;
            break;
        }
        for (let i = 0; i < dirs.length; i++) {
            let d = dirs[i];

            npos = [d[0] + pos[0], d[1] + pos[1]];

            if (npos[0] >= 0 && npos[1] >= 0 && npos[0] < columns && npos[1] < rows
                && board[npos[0]][npos[1]] != OBSTACLE
                && board_effects[npos[0]][npos[1]] != PATH ) {

                let slow = terrain_slow(board[npos[0]][npos[1]]);
                if((DijkstraDist[pos[0]][pos[1]] + slow) < DijkstraDist[npos[0]][npos[1]]){
                    DijkstraDist[npos[0]][npos[1]] = DijkstraDist[pos[0]][pos[1]] + slow;
                    board_effects[npos[0]][npos[1]] = EDGE;
                    //queue.push(npos);
                    heap.insert([ DijkstraDist[npos[0]][npos[1]] + heuristic(npos) * 0.8,DijkstraDist[npos[0]][npos[1]],npos])
                    path[npos] = pos; 
                    await mySleep(delay_time);
                }
            }
        }
        board_effects[pos[0]][pos[1]] = VISITED;
        //

    }
    heap.heap = [null];
    path_solution = path;
    last_position = lp; 
    game_state = PRE_WALKING;
}


async function guloso(){
    console.log('entrou')
    game_state = RUNNING;
    let dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    console.log(JSON.stringify(player));
    
    path = {}
    let npos; 
    let lp=-1;
    let pos = player
    while (true) {

        if(board_effects[pos[0]][pos[1]] == PATH || board_effects[pos[0]][pos[1]] == VISITED) {
            continue;
        } 

        board_effects[pos[0]][pos[1]] = PATH;

        if(pos[0] == food[0] && pos[1] == food[1]){
            lp = pos;
            break;
        }

        let index=-1, dist_min =1000000
        for (let i = 0; i < dirs.length; i++) {
            let d = dirs[i];

            npos = [d[0] + pos[0], d[1] + pos[1]];
        
            if (npos[0] >= 0 && npos[1] >= 0 && npos[0] < columns && npos[1] < rows
                && board[npos[0]][npos[1]] != OBSTACLE
                && board_effects[npos[0]][npos[1]] != VISITED && board_effects[npos[0]][npos[1]] != PATH ) {
                    await mySleep(delay_time);
                    let dist_cur = heuristic(npos);
                    if (dist_min > dist_cur){
                        index = i;
                        dist_min = dist_cur;
                    }
            }
        }
        if(index == -1) break;

        let d2 = dirs[index];
        npos = [d2[0] + pos[0], d2[1] + pos[1]];

        
        board_effects[npos[0]][npos[1]] = EDGE;
        path[npos] = pos; 
        board_effects[pos[0]][pos[1]] = VISITED;
        pos = npos;
    }

    path_solution = path;
    last_position = lp; 
    console.log('Saiu')
    game_state = PRE_WALKING;
}
let draw_again = false;

const getSelectorValue = () =>  { 
    const val = document.querySelector('select').value 
    //console.log(val) 
    return val 
}

function generate_new_map() {
    iterations += 1;
    console.log("testandooo")
    game_state= STOPPED
    generate_terrain();
    reset_board(1);
}

function setup() {
    //frameRate(10);
    cont =0
    flag =1
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

    /// Calculate columns and rows
    columns = floor(width / W);
    rows = floor(height / W);
    board = new Array(columns);
    board_effects = new Array(columns);
    DijkstraDist = new Array(columns);


    for (let i = 0; i < columns; i++) {
        board[i] = new Array(rows);
        board_effects[i] = new Array(rows);
        DijkstraDist[i] = new Array(rows);
    }



    generate_terrain();

    place_obstacles();
    food =[-1,-1]
    player = [-1,-1]
    place_entity(PLAYER);
    place_entity(FOOD);
    heap = new MinHeap();
    color = new Array(11);
    color[SAND] = [230, 197, 37];
    color[MUD] = [92, 51, 18];
    color[WATER] = [95, 116, 222];
    color[OBSTACLE] = [121, 114, 125];
    color[PLAYER] = [84, 191, 113];
    color[FOOD] = [191, 84, 130];


    color[NONE] = [0, 0, 0, 0];
    color[PATH] = [255, 10, 10, 130];
    color[SOLUTION] = [52, 235, 88, 130]

    color[VISITED] = [200, 10, 100, 30];
    color[EDGE] = [200, 10, 100, 80];
    

    let next = getSelectorValue();

    bfs()
    //dfs()
   //dijkstra();
    //astar();
}
        
function draw() {
    document.getElementById("botao").onclick = function() {
        window.location.reload();
    }
    fix_dpi();

    background(255);

    draw_map();
    draw_map_effects();
    draw_entities();
    
    if(game_state == STOPPED) {
        reset_board(0);
        let nextAlgo = getSelectorValue();
        if(nextAlgo == "DFS") {
             dfs();
        } else if(nextAlgo == "BFS") {
            bfs();
        } else if(nextAlgo == "GULOSO") {
            guloso();
        } else if(nextAlgo == "CUSTO_UNIFORME"){
            dijkstra();
        } else if(nextAlgo == "A*") {
            astar();
        }
    } else if(game_state == PRE_WALKING) {
        if(last_position == -1){
            game_state = STOPPED;
        } else{
            let path = drawSolutionPath(path_solution, last_position);
            player_anim = player;
            animatePlayer(path);

            game_state = WALKING;    
        }
    } else if(game_state == WALKING) {
        draw_anim();

        let nextAlgo = getSelectorValue();
        if(nextAlgo == "CUSTO_UNIFORME" && DijkstraDist != null) {
            draw_map_distances();
        }
    } 
    

}
