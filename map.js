let w;
let columns;
let rows;
let board;
let next;
let ground_type;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;


const WATER = 0;
const SAND = 1;
const MUD = 2;
const OBSTACLE = 3;
const PLAYER = 4;
const FOOD = 5;

let colors;




function draw_map() {
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            let c = color[board[i][j]];
            fill(c[0], c[1], c[2]);
            strokeWeight(0.0);
            //rect(i * w, j * w, w - 1, w - 1);
            rect(i * w, j * w, w, w);

            fill(0);

            //textSize(20);
            //fill(255);
            //stroke(255);
            //text(board[i][j], i * w, j * w, (i + 1) * w, (j + 1) * w);
        }
    }
}


function setup() {

    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);

    w = 8;
    /// Calculate columns and rows
    columns = floor(width / w);
    rows = floor(height / w);
    board = new Array(columns);


    let noise_scale = 20.0;

    for (let i = 0; i < columns; i++) {
        board[i] = new Array(rows);
    }

    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
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

    colors = new Array(11);
    color[SAND] = [230, 197, 37];
    color[MUD] = [92, 51, 18];
    color[WATER] = [95, 116, 222];
    color[OBSTACLE] = [121, 114, 125];
    color[PLAYER] = [84, 191, 113];
    color[FOOD] = [191, 84, 130];
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

        let sz = floor(random(10, 30));

        for(let c = col; c < sz + col&& c < columns; c++) {
            if (board[c][ro] == OBSTACLE) break;

            board[c][ro] = OBSTACLE;
        }
    }

}

let draw_again = false;
function draw() {

    fix_dpi();

    background(255);
    draw_map();

}
