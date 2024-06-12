// we will represent every piece  by a unique binary number

let none = 0b000;
let pawn = 0b001;
let rook = 0b010;
let knight = 0b011;
let bishop = 0b100;
let queen = 0b101;
let king = 0b110;

let white = 0b1;
let black = 0b0;

//a white rook will be stored in the gamestate as 1010
//a black queen will be stored as 0101