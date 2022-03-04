const W = 16;
let columns;
let rows;
let board;
let next;
let player;
let food;
let ground_type;
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

let color;

let call_dfs;
let call_teste;

function draw_map() {
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            let c = color[board[i][j]];
            fill(c[0], c[1], c[2]);
            strokeWeight(0.1);
            rect(i * W, j * W, W, W);

            fill(0);
        }
    }
}

function draw_map_effects() {
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            let c = color[board_effects[i][j]];
            fill(c[0], c[1], c[2], c[3]);
            strokeWeight(0.0);
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

    let n_verticals = floor(random(8, 30));
    let n_horizontals = floor(random(8, 30));

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

            if (noise_val < 0.25) {
                board[i][j] = WATER;
            } else if(noise_val < 0.3) {
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
    color[VISITED] = [10, 10, 10, 100];
    color[PATH] = [255, 10, 10, 100];
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

async function dfs(pos) {
    let around = [];
    let dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

    //console.log(JSON.stringify(pos));

    //draw_map();
    //draw_map_effects();


    let c = color[VISITED];
    fill(c[0], c[1], c[2], c[3]);
    rect(pos[0] * W, pos[1] * W, W, W);

    board_effects[pos[0]][pos[1]] = VISITED;

    draw_entities();
    
    //@FIXME: isso é a porra de um bug, programação assíncrona é difícil.
    await mySleep(50);

    for(let i = 0; i < dirs.length; i++) {
        let d = dirs[i];

        let npos = [d[0] + pos[0], d[1] + pos[1]];
        if (npos[0] >= 0 && npos[1] >= 0 && npos[0] < columns && npos[1] < rows
             && board[npos[0]][npos[1]] != OBSTACLE
             && board_effects[npos[0]][npos[1]] != VISITED) {

                dfs(npos);
        }
    }
}

function teste() {
    console.log('A');
    let a = yield;
    console.log('B');
    let b = yield;
    console.log('C');
    let c = yield;
}

let draw_again = false;
function draw() {

    fix_dpi();

    background(255);

    draw_map();


    draw_map_effects();
    draw_entities();

    dfs(player);
    //call_dfs.next();
    //call_teste.next();

}
