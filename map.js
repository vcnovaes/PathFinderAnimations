
let w;
let columns;
let rows;
let board;
let next;
let ground_type; 
const CANVAS_WIDTH =1200
const CANVAS_HEIGHT = 900 

class Environment{    
    constructor(square_width) {
        this.square_width =  square_width
        this.rows = floor(CANVAS_HEIGHT / this.square_width)
        this.columns = floor(CANVAS_WIDTH / this.square_width)
        this.board = new Array(this.columns)
        for(let i = 0 ; i < this.rows ; i ++){
            this.board[ i ] = new Array(this.rows);
        }
    }
     
}



function setup() {
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  w = 10;
  /// Calculate columns and rows
  columns = floor(width / w);
  rows = floor(height / w);
  // Wacky way to make a 2D array is JS
  board = new Array(columns);
  for (let i = 0; i < columns; i++) {
    board[i] = new Array(rows);
  }
  // Going to use multiple 2D arrays and swap them
  next = new Array(columns);
  for (i = 0; i < columns; i++) {
    next[i] = new Array(rows);
  }
  ground_type = [(66, 135, 245), (245, 161, 66), (245, 239, 66)]
}

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function draw_map(){
  for ( let i = 0; i < columns;i++) {
    for ( let j = 0; j < rows;j++) {
      if ((board[i][j] == 1)) fill(0);
      else {
        let type = ground_type[randomInteger(0,2)]
        console.log(type)
        fill(type[0],type[1],type[2])
      }
      stroke(0);
      strokeWeight(0.1)
      rect(i * w, j * w, w-1, w-1);
    }
  }
}

let draw_again = false;
function draw() {
  background(255);
  draw_map()
}
