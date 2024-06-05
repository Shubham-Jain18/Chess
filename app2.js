var gamestate = new Array(65);

let movehistory = []        // i think it will be better to store the gamestates (history) rather than moves
let turn = 1;

//the following flags represent the file (column), on which a pawn just moved 2 squares ahead, and is vulnerable to getting captured due to en-passant on next move
//enpwhite=0b010 shows that the white pawn on 3rd file (it's indexed 0) just moved 2 pawns ahead, and can be en-passanted on the next move 
var enpwhite = 0b000;
var enpblack = 0b000;

//gamestate shows the current status of the board, storing the piece stored in each of the 64 squares (or if it is empty) in form of bits
//a new 65th square is added to show the castling flag bits
//set bit shows king can castle
//there will be four bits : [white kingside][white queen side][black kingside][black queen side]


const none = 0b0000;
const pawn = 0b0001;
const rook = 0b0010;
const knight = 0b0011;
const bishop = 0b0100;
const queen = 0b0101;
const king = 0b0110;
const white = 0b1000;
const black = 0b0000;

const initialBoard = [
    [rook | black, knight | black, bishop | black, queen | black, king | black, bishop | black, knight | black, rook | black],
    [pawn | black, pawn | black, pawn | black, pawn | black, pawn | black, pawn | black, pawn | black, pawn | black],
    [none, none, none, none, none, none, none, none],
    [none, none, none, none, none, none, none, none],
    [none, none, none, none, none, none, none, none],
    [none, none, none, none, none, none, none, none],
    [pawn | white, pawn | white, pawn | white, pawn | white, pawn | white, pawn | white, pawn | white, pawn | white],
    [rook | white, knight | white, bishop | white, queen | white, king | white, bishop | white, knight | white, rook | white]
];

function initializeGameState() {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            gamestate[63 - row * 8 - col] = initialBoard[row][col];
        }
    }
    gamestate[64] = 0b1111; // Castling bits
}

initializeGameState();

//the numbering of the squares is going to happen this way
// 63 62 61 60 59 58 57 56
// 55 54 53 52 51 50 49 48
// ..
// 15 14 13 12 11 10 9 8
// 7 6 5 4 3 2 1 0


//this function creates a move in the form of binary num, (currently rightmost bit denotes the currentMove, then next 6 bits show targetsquare, and the next 6 show the starting square)

function createMove(startSquare, targetSquare) {
    let move = turn;
    move <<= 6;
    move |= targetSquare;
    move <<= 6;
    move |= startSquare;
    return move;
}


function makeMove(move) {           //used to make a move on the actual board
    let startSquare = move & (0b111111);
    let targetSquare = (move & (0b111111000000)) >> 6;
    console.log(gamestate[startSquare]);
    console.log(gamestate[targetSquare]);
    let flag = isMoveValid(move);
    console.log(gamestate[startSquare]);
    console.log(gamestate[targetSquare]);
    // console.log(flag);
    if (!flag) {
        console.log("The given move is not valid !");
        return;
    }

    else {
        // console.log("the move is being played!");
        // console.log(gamestate);

        let startSquare = move & (0b111111);
        let targetSquare = (move & (0b111111000000)) >> 6;

        // console.log(startSquare, targetSquare);

        let selectedPiece = gamestate[startSquare];
        let targetedPiece = gamestate[targetSquare];

        // console.log(gamestate);
        console.log(gamestate[startSquare]);
        console.log(gamestate[targetSquare]);

        movehistory.push(gamestate);            //adds the current (without the current move) is added to the history 
        gamestate[targetSquare] = gamestate[startSquare];
        gamestate[startSquare] = 0b0000;



        console.log(gamestate);
        // console.log(gamestate[startSquare]);
        // console.log(gamestate[targetSquare]);


        //--------------------------------------------------------------------------------------------------------------

        //en passant section


        if (selectedPiece === 0b1001 && startSquare + 1 * 8 + 1 === targetSquare && targetedPiece === 0b0000) {       //if the white pawn makes a diagonal capture, and that square is empty, and the move has also passed to be valid, it means it is an en-passant capture, and we need to remove the black pawn off the board 
            gamestate[targetSquare - 1 * 8] = 0b0000;
        }

        if (selectedPiece === 0b1001 && startSquare + 1 * 8 - 1 === targetSquare && targetedPiece === 0b0000) {       //if the white pawn makes a diagonal capture, and that square is empty, and the move has also passed to be valid, it means it is an en-passant capture, and we need to remove the black pawn off the board 
            gamestate[targetSquare - 1 * 8] = 0b0000;
        }

        if (selectedPiece === 0b0001 && startSquare - 1 * 8 + 1 === targetSquare && targetedPiece === 0b0000) {       //if the black pawn makes a diagonal capture, and that square is empty, and the move has also passed to be valid, it means it is an en-passant capture, and we need to remove the white pawn off the board 
            gamestate[targetSquare + 1 * 8] = 0b0000;
        }

        if (selectedPiece === 0b0001 && startSquare - 1 * 8 - 1 === targetSquare && targetedPiece === 0b0000) {       //if the black pawn makes a diagonal capture, and that square is empty, and the move has also passed to be valid, it means it is an en-passant capture, and we need to remove the white pawn off the board 
            gamestate[targetSquare + 1 * 8] = 0b0000;
        }

        if (selectedPiece === 0b1001 && startSquare + 2 * 8 === targetSquare) {      //if the white pawn moves 2 squares ahead, we need to update the en-passant status 
            enpwhite = startSquare % 8;      //stores the column (file )
            enpblack = 0b000;
        }

        else if (selectedPiece === 0b0001 && startSquare - 2 * 8 === targetSquare) {      //if the black pawn moves 2 squares ahead, we need to update the en-passant status 
            enpblack = startSquare % 8;         //stores the column (file )
            enpwhite = 0b000;
        }

        else {
            enpblack = 0b000;
            enpwhite = 0b000;         //no enpassant possible on the next move
        }


        //-----------------------------------------------------------------------------------------------------------------

        //castling section 


        if (startSquare === 3 && targetSquare === 1 && gamestate[64] & 0b1000) {      //if this is a castling move, update the rook's position too
            console.log("this has happened!");
            gamestate[0] = 0b0000;
            gamestate[2] = 0b1010;
        }

        else if (startSquare === 3 && targetSquare === 5 && gamestate[64] & 0b0100) {
            gamestate[7] = 0b0000;
            gamestate[4] = 0b1010;
        }

        else if (startSquare === 59 && targetSquare === 57 && gamestate[64] & 0b0010) {
            gamestate[56] = 0b0000;
            gamestate[58] = 0b0010;
        }

        else if (startSquare === 59 && targetSquare === 61 && gamestate[64] & 0b0010) {
            gamestate[63] = 0b0000;
            gamestate[60] = 0b0010;
        }

        //lets modify the castling bits too

        if (gamestate[0] != 0b1010) gamestate[64] &= 0b0111;       //white kingside rook is not present on its square, means it must have moved!
        if (gamestate[7] != 0b1010) gamestate[64] &= 0b1011;       //now for white queenside rook
        if (gamestate[56] != 0b0010) gamestate[64] &= 0b1101;      //same for black rooks  
        if (gamestate[63] != 0b0010) gamestate[64] &= 0b1110;

        if (gamestate[3] != 0b1110) gamestate[64] &= 0b0011;       //white king is not present on its square, means it must have moved!
        if (gamestate[59] != 0b0110) gamestate[64] &= 0b1100;      //same for black king 

        //------------------------------------------------------------------------------------------------------------------
        // console.log("The move is played!");

        console.log(gamestate);

        turn = 1 - turn;
        console.log("turn after making move ", turn);

        // let tanmay = gamestate;
        // console.log(check(tanmay));

        let caststate = gamestate[64];
        console.log(caststate);


        if (checkMate(gamestate)) {
            if (check(gamestate)) {
                console.log("CHECKMATE!");
            }
            else {
                console.log("STALEMATE!");
            }
        }

        else if (check(gamestate)) {
            console.log("Check!");
        }


        console.log("---------------------------------------------------------------");
        console.log("\n");
    }
}


function makeTempMove(move, tempgameState) {
    // it checks a temporary gamestate by playing a temporary move on it, and then analysing on it 
    let startSquare = move & (0b111111);
    let targetSquare = (move & (0b111111000000)) >> 6;
    tempgameState[targetSquare] = tempgameState[startSquare];
    tempgameState[startSquare] = 0b0000;

    return tempgameState;


}

function isMoveValid(move) {

    let startSquare = move & (0b111111);
    let targetSquare = (move & (0b111111000000)) >> 6;
    let selectedPiece = gamestate[startSquare];
    let targetedPiece = gamestate[targetSquare];
    let piece = selectedPiece & (0b0111);
    let targetedColor = targetedPiece & (0b1000);
    // console.log("check", move, startSquare, targetSquare);
    //function to check the validity of a given move 

    //1) check if the turn is valid or not (startsquare should contain a piece of the same color as turn)

    if (selectedPiece === 0) return false;
    let selectedColor = selectedPiece & (0b1000);
    if ((selectedColor >> 3) != turn) return false;

    // console.log("cleared step 1");
    // console.log(gamestate[startSquare]);
    // console.log(gamestate[targetSquare]);
    // console.log(gamestate);



    //2) the target square should be empty, or occupied by opp's piece

    if (gamestate[targetSquare] != 0) {
        if ((targetedColor >> 3) == turn) {
            // console.log(targetSquare);
            // console.log(targetedColor >> 3);
            // console.log(turn);
            // console.log("target square occupied by same piece color");
            return false;
        }
    }
    // console.log("cleared step 2");
    // console.log(gamestate[startSquare]);
    // console.log(gamestate[targetSquare]);
    // console.log(gamestate);


    //3) check for the correct movement of the selected piece

    let flag = false;

    switch (piece) {

        case 0b001: //pawn

            if (turn == 1) { //white pawn
                // console.log(startSquare, targetSquare, gamestate[startSquare + 8]);
                if (startSquare + 8 === targetSquare && gamestate[targetSquare] === 0b0000) flag = true;    //moves 1 square ahead (the target square should be empty too)
                else if (startSquare <= 15 && startSquare >= 8 && startSquare + 16 === targetSquare && gamestate[startSquare + 8] == 0 && gamestate[targetSquare] === 0b0000) flag = true;        //moves 2 squares only on the first move (of itself) and ensures there is no piece one square ahead
                else if ((startSquare + 1 * 8 + 1) === targetSquare && (startSquare % 8) != 7 && gamestate[targetSquare] != 0b0000 && targetedColor === 0b0000) flag = true;   //capture by a white pawn (diagonally), also ensuring it does not flank the board from file 1 to file 8
                else if ((startSquare + 1 * 8 - 1) === targetSquare && (startSquare % 8) != 0 && gamestate[targetSquare] != 0b0000 && targetedColor === 0b0000) flag = true;   //capture by a white pawn (diagonally)
                else if ((startSquare + 1 * 8 + 1) === targetSquare && (startSquare % 8) != 7 && gamestate[targetSquare] === 0b0000 && gamestate[targetSquare - 1 * 8] === 0b0001 && enpblack === (targetSquare % 8)) flag = true;      //enpassant capture by a white pawn
                else if ((startSquare + 1 * 8 - 1) === targetSquare && (startSquare % 8) != 0 && gamestate[targetSquare] === 0b0000 && gamestate[targetSquare - 1 * 8] === 0b0001 && enpblack === (targetSquare % 8)) flag = true;      //enpassant capture by a white pawn

                //edit: en-passant done !

            }

            else {      //black pawn 

                if (startSquare - 8 === targetSquare && gamestate[targetSquare] === 0b0000) flag = true;    //moves 1 square ahead
                else if (startSquare <= 55 && startSquare >= 48 && startSquare - 16 === targetSquare && gamestate[startSquare - 8] == 0 && gamestate[targetSquare] === 0b0000) flag = true;        //moves 2 squares only on the first move (of itself) and ensures there is no piece one square ahead
                else if ((startSquare - 1 * 8 + 1) === targetSquare && (startSquare % 8) != 7 && gamestate[targetSquare] != 0b000 && targetedColor === 0b1000) flag = true;   //capture by a white pawn (diagonally)
                else if ((startSquare - 1 * 8 - 1) === targetSquare && (startSquare % 8) != 0 && gamestate[targetSquare] != 0b000 && targetedColor === 0b1000) flag = true;   //capture by a black pawn (diagonally)
                else if ((startSquare - 1 * 8 + 1) === targetSquare && (startSquare % 8) != 7 && gamestate[targetSquare] === 0b0000 && gamestate[targetSquare + 1 * 8] === 0b1001 && enpwhite === (targetSquare % 8)) flag = true;      //enpassant capture by a black pawn
                else if ((startSquare - 1 * 8 - 1) === targetSquare && (startSquare % 8) != 0 && gamestate[targetSquare] === 0b0000 && gamestate[targetSquare + 1 * 8] === 0b1001 && enpwhite === (targetSquare % 8)) flag = true;      //enpassant capture by a black pawn


                //edit : en-passant done !

            }


            break;

        case 0b011: //knight

            if (startSquare + 2 * 8 + 1 === targetSquare) flag = true;
            else if (startSquare + 2 * 8 - 1 === targetSquare) flag = true;
            else if (startSquare + 1 * 8 + 2 === targetSquare) flag = true;
            else if (startSquare + 1 * 8 - 2 === targetSquare) flag = true;
            else if (startSquare - 2 * 8 + 1 === targetSquare) flag = true;
            else if (startSquare - 2 * 8 - 1 === targetSquare) flag = true;
            else if (startSquare - 1 * 8 + 2 === targetSquare) flag = true;
            else if (startSquare - 1 * 8 - 2 === targetSquare) flag = true;

            else return false;

            break;

        case 0b100: //bishop

            for (let i = 1; i < 8; i++) {
                if (startSquare + i * 8 + i === targetSquare) flag = true;
                if ((startSquare + i * 8 + i) >= 0 && (startSquare + i * 8 + i) <= 63 && gamestate[startSquare + i * 8 + i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare + i * 8 - i === targetSquare) flag = true;
                if ((startSquare + i * 8 - i) >= 0 && (startSquare + i * 8 - i) <= 63 && gamestate[startSquare + i * 8 - i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare - i * 8 + i === targetSquare) flag = true;
                if ((startSquare - i * 8 + i) >= 0 && (startSquare - i * 8 + i) <= 63 && gamestate[startSquare - i * 8 + i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare - i * 8 - i === targetSquare) flag = true;
                if ((startSquare - i * 8 - i) >= 0 && (startSquare - i * 8 - i) <= 63 && gamestate[startSquare - i * 8 - i] != 0) break;
            }

            break;

        case 0b010: //rook

            for (let i = 1; i < 8; i++) {
                if (startSquare + i * 8 === targetSquare) flag = true;
                if ((startSquare + i * 8) >= 0 && (startSquare + i * 8) <= 63 && gamestate[startSquare + i * 8] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare - i * 8 === targetSquare) flag = true;
                if ((startSquare - i * 8) >= 0 && (startSquare - i * 8) <= 63 && gamestate[startSquare - i * 8] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare + i === targetSquare) flag = true;
                if ((startSquare + i) >= 0 && (startSquare + i) <= 63 && gamestate[startSquare + i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare - i === targetSquare) flag = true;
                if ((startSquare - i) >= 0 && (startSquare - i) <= 63 && gamestate[startSquare - i] != 0) break;
            }

            break;

        case 0b101: //queen

            for (let i = 1; i < 8; i++) {
                if (startSquare + i * 8 + i === targetSquare) flag = true;
                if ((startSquare + i * 8 + i) >= 0 && (startSquare + i * 8 + i) <= 63 && gamestate[startSquare + i * 8 + i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare + i * 8 - i === targetSquare) flag = true;
                if ((startSquare + i * 8 - i) >= 0 && (startSquare + i * 8 - i) <= 63 && gamestate[startSquare + i * 8 - i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare - i * 8 + i === targetSquare) flag = true;
                if ((startSquare - i * 8 + i) >= 0 && (startSquare - i * 8 + i) <= 63 && gamestate[startSquare - i * 8 + i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare - i * 8 - i === targetSquare) flag = true;
                if ((startSquare - i * 8 - i) >= 0 && (startSquare - i * 8 - i) <= 63 && gamestate[startSquare - i * 8 - i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare + i * 8 === targetSquare) flag = true;
                if ((startSquare + i * 8) >= 0 && (startSquare + i * 8) <= 63 && gamestate[startSquare + i * 8] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare - i * 8 === targetSquare) flag = true;
                if ((startSquare - i * 8) >= 0 && (startSquare - i * 8) <= 63 && gamestate[startSquare - i * 8] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare + i === targetSquare) flag = true;
                if ((startSquare + i) >= 0 && (startSquare + i) <= 63 && gamestate[startSquare + i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare - i === targetSquare) flag = true;
                if ((startSquare - i) >= 0 && (startSquare - i) <= 63 && gamestate[startSquare - i] != 0) break;
            }


            break;

        case 0b110: //king

            if (startSquare + 1 === targetSquare) flag = true;
            else if (startSquare - 1 === targetSquare) flag = true;
            else if (startSquare - 1 * 8 === targetSquare) flag = true;
            else if (startSquare + 1 * 8 === targetSquare) flag = true;
            else if (startSquare + 1 * 8 + 1 === targetSquare) flag = true;
            else if (startSquare + 1 * 8 - 1 === targetSquare) flag = true;
            else if (startSquare - 1 * 8 - 1 === targetSquare) flag = true;
            else if (startSquare - 1 * 8 + 1 === targetSquare) flag = true;

            //time to implement castling 

            else if (startSquare === 3 && targetSquare === 1) {    //kingside castling for white 
                let flagbit = gamestate[64] & 0b1000;
                if (flagbit === 0b1000) {           //castling can happen
                    let tempgameState1 = deepCopy(gamestate);
                    let tempgameState2 = deepCopy(gamestate);
                    tempgameState1[3] = 0b0000;
                    tempgameState1[1] = 0b1110;

                    tempgameState2[3] = 0b0000;
                    tempgameState2[2] = 0b1110;

                    if (!check(tempgameState1) && !check(tempgameState2)) flag = true;        //this checks the king does not fall under any check on its catling path
                }
            }


            else if (startSquare === 3 && targetSquare === 5) {    //queenside castling for white 
                let flagbit = gamestate[64] & 0b0100;
                if (flagbit === 0b0100) {           //castling can happen
                    let tempgameState1 = deepCopy(gamestate);
                    let tempgameState2 = deepCopy(gamestate);
                    tempgameState1[3] = 0b0000;
                    tempgameState1[5] = 0b1110;

                    tempgameState2[3] = 0b0000;
                    tempgameState2[4] = 0b1110;

                    if (!check(tempgameState1) && !check(tempgameState2)) flag = true;        //this checks the king does not fall under any check on its catling path
                }
            }

            else if (startSquare === 59 && targetSquare === 57) {    //kingside castling for black
                let flagbit = gamestate[64] & 0b0010;
                if (flagbit === 0b0010) {           //castling can happen
                    let tempgameState1 = deepCopy(gamestate);
                    let tempgameState2 = deepCopy(gamestate);
                    tempgameState1[59] = 0b0000;
                    tempgameState1[57] = 0b0110;

                    tempgameState2[59] = 0b000;
                    tempgameState2[58] = 0b0110;

                    if (!check(tempgameState1) && !check(tempgameState2)) flag = true;        //this checks the king does not fall under any check on its catling path
                }
            }

            else if (startSquare === 59 && targetSquare === 61) {    //queenside castling for black
                let flagbit = gamestate[64] & 0b001;
                if (flagbit === 0b0001) {           //castling can happen
                    let tempgameState1 = deepCopy(gamestate);
                    let tempgameState2 = deepCopy(gamestate);
                    tempgameState1[59] = 0b0000;
                    tempgameState1[61] = 0b0110;

                    tempgameState2[59] = 0b000;
                    tempgameState2[60] = 0b0110;

                    if (!check(tempgameState1) && !check(tempgameState2)) flag = true;        //this checks the king does not fall under any check on its catling path
                }
            }



            break;

    }

    if (flag === false) return false;

    // console.log("cleared step 3");
    // console.log(gamestate[startSquare]);
    // console.log(gamestate[targetSquare]);
    // console.log(gamestate);


    //4) after the move is played, the king of the current turn should not be in check

    let tempstate = deepCopy(gamestate);
    tempstate = (makeTempMove(move, tempstate));
    // console.log(check(tempstate));

    if (check(tempstate)) return false;          //the current turn's king ends up in a check after this move is played


    // console.log("cleared step 4");
    // console.log(gamestate[startSquare]);
    // console.log(gamestate[targetSquare]);
    // console.log(gamestate);

    // console.log("the move turns out to be a valid one ");
    return true;

}

function check(tempstate) {
    //function to check if the king of the current turn is in check 


    let kingSquare;   //square of the king of the current turn in the temporary gamestate passed

    for (let i = 0; i < 64; i++) {
        let x = tempstate[i] & (0b1000);
        let y = tempstate[i] & (0b0111);
        if (x === (turn << 3) && y === 0b0110) {
            kingSquare = i;
            break;
        }
    }

    // console.log("king square of the current turn: ", kingSquare);


    if (turn === 1) {       //for a white king 
        if ((kingSquare + 1 * 8 + 1) >= 0 && (kingSquare + 1 * 8 + 1) <= 63 && tempstate[kingSquare + 1 * 8 + 1] === 0b0001) return true;  //check by black pawn
        if ((kingSquare + 1 * 8 - 1) >= 0 && (kingSquare + 1 * 8 - 1) <= 63 && tempstate[kingSquare + 1 * 8 - 1] === 0b0001) return true;
        if ((kingSquare + 1 * 8 + 2) >= 0 && (kingSquare + 1 * 8 + 2) <= 63 && tempstate[kingSquare + 1 * 8 + 2] === 0b0011) return true;   //check by black knight
        if ((kingSquare + 1 * 8 - 2) >= 0 && (kingSquare + 1 * 8 - 2) <= 63 && tempstate[kingSquare + 1 * 8 - 2] === 0b0011) return true;
        if ((kingSquare - 1 * 8 - 2) >= 0 && (kingSquare - 1 * 8 - 2) <= 63 && tempstate[kingSquare - 1 * 8 - 2] === 0b0011) return true;
        if ((kingSquare - 1 * 8 + 2) >= 0 && (kingSquare - 1 * 8 + 2) <= 63 && tempstate[kingSquare - 1 * 8 + 2] === 0b0011) return true;
        if ((kingSquare - 2 * 8 + 1) >= 0 && (kingSquare - 2 * 8 + 1) <= 63 && tempstate[kingSquare - 2 * 8 + 1] === 0b0011) return true;
        if ((kingSquare - 2 * 8 - 1) >= 0 && (kingSquare - 2 * 8 - 1) <= 63 && tempstate[kingSquare - 2 * 8 - 1] === 0b0011) return true;
        if ((kingSquare + 2 * 8 - 1) >= 0 && (kingSquare + 2 * 8 - 1) <= 63 && tempstate[kingSquare + 2 * 8 - 1] === 0b0011) return true;
        if ((kingSquare + 2 * 8 + 1) >= 0 && (kingSquare + 2 * 8 + 1) <= 63 && tempstate[kingSquare + 2 * 8 + 1] === 0b0011) return true;

        for (let i = 1; i < 8; i++) {
            if ((kingSquare + i * 8 + i) >= 0 && (kingSquare + i * 8 + i) <= 63 && tempstate[kingSquare + i * 8 + i] === 0b0100) return true;  //check by black bishop
            else if ((kingSquare + i * 8 + i) >= 0 && (kingSquare + i * 8 + i) <= 63 && tempstate[kingSquare + i * 8 + i] === 0b0101) return true; //check by black queen
            else if ((kingSquare + i * 8 + i) >= 0 && (kingSquare + i * 8 + i) <= 63 && tempstate[kingSquare + i * 8 + i] != 0b0000) break;     //a piece interuppts the diagonal
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare + i * 8 - i) >= 0 && (kingSquare + i * 8 - i) <= 63 && tempstate[kingSquare + i * 8 - i] === 0b0100) return true;  //check by black bishop
            else if ((kingSquare + i * 8 - i) >= 0 && (kingSquare + i * 8 - i) <= 63 && tempstate[kingSquare + i * 8 - i] === 0b0101) return true; //check by black queen
            else if ((kingSquare + i * 8 - i) >= 0 && (kingSquare + i * 8 - i) <= 63 && tempstate[kingSquare + i * 8 - i] != 0b0000) break;     //a piece interuppts the diagonal
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare - i * 8 - i) >= 0 && (kingSquare - i * 8 - i) <= 63 && tempstate[kingSquare - i * 8 - i] === 0b0100) return true;  //check by black bishop
            else if ((kingSquare - i * 8 - i) >= 0 && (kingSquare - i * 8 - i) <= 63 && tempstate[kingSquare - i * 8 - i] === 0b0101) return true; //check by black queen
            else if ((kingSquare - i * 8 - i) >= 0 && (kingSquare - i * 8 - i) <= 63 && tempstate[kingSquare - i * 8 - i] != 0b0000) break;     //a piece interuppts the diagonal
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare - i * 8 + i) >= 0 && (kingSquare - i * 8 + i) <= 63 && tempstate[kingSquare - i * 8 + i] === 0b0100) return true;  //check by black bishop
            else if ((kingSquare - i * 8 + i) >= 0 && (kingSquare - i * 8 + i) <= 63 && tempstate[kingSquare - i * 8 + i] === 0b0101) return true; //check by black queen
            else if ((kingSquare - i * 8 + i) >= 0 && (kingSquare - i * 8 + i) <= 63 && tempstate[kingSquare - i * 8 + i] != 0b0000) break;     //a piece interuppts the diagonal
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare - i * 8) >= 0 && (kingSquare - i * 8) <= 63 && tempstate[kingSquare - i * 8] === 0b0010) return true;  //check by black rook
            else if ((kingSquare - i * 8) >= 0 && (kingSquare - i * 8) <= 63 && tempstate[kingSquare - i * 8] === 0b0101) return true; //check by black queen
            else if ((kingSquare - i * 8) >= 0 && (kingSquare - i * 8) <= 63 && tempstate[kingSquare - i * 8] != 0b0000) break;     //a piece interuppts the row(rank)/column(file)
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare + i * 8) >= 0 && (kingSquare + i * 8) <= 63 && tempstate[kingSquare + i * 8] === 0b0010) return true;  //check by black rook
            else if ((kingSquare + i * 8) >= 0 && (kingSquare + i * 8) <= 63 && tempstate[kingSquare + i * 8] === 0b0101) return true; //check by black queen
            else if ((kingSquare + i * 8) >= 0 && (kingSquare + i * 8) <= 63 && tempstate[kingSquare + i * 8] != 0b0000) break;     //a piece interuppts the row(rank)/column(file)
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare + i) >= 0 && (kingSquare + i) <= 63 && tempstate[kingSquare + i] === 0b0010) return true;  //check by black rook
            else if ((kingSquare + i) >= 0 && (kingSquare + i) <= 63 && tempstate[kingSquare + i] === 0b0101) return true; //check by black queen
            else if ((kingSquare + i) >= 0 && (kingSquare + i) <= 63 && tempstate[kingSquare + i] != 0b0000) break;     //a piece interuppts the row(rank)/column(file)
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare - i) >= 0 && (kingSquare - i) <= 63 && tempstate[kingSquare - i] === 0b0010) return true;  //check by black rook
            else if ((kingSquare - i) >= 0 && (kingSquare - i) <= 63 && tempstate[kingSquare - i] === 0b0101) return true; //check by black queen
            else if ((kingSquare - i) >= 0 && (kingSquare - i) <= 63 && tempstate[kingSquare - i] != 0b0000) break;     //a piece interuppts the row(rank)/column(file)
        }

        if ((kingSquare + 1 * 8) >= 0 && (kingSquare + 1 * 8) <= 63 && tempstate[kingSquare + 1 * 8] === 0b0110) return true;  //check by black king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare - 1 * 8) >= 0 && (kingSquare - 1 * 8) <= 63 && tempstate[kingSquare - 1 * 8] === 0b0110) return true;  //check by black king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare - 1 * 8 + 1) >= 0 && (kingSquare - 1 * 8 + 1) <= 63 && tempstate[kingSquare - 1 * 8 + 1] === 0b0110) return true;  //check by black king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare - 1 * 8 - 1) >= 0 && (kingSquare - 1 * 8 - 1) <= 63 && tempstate[kingSquare - 1 * 8 - 1] === 0b0110) return true;  //check by black king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare + 1 * 8 - 1) >= 0 && (kingSquare + 1 * 8 - 1) <= 63 && tempstate[kingSquare + 1 * 8 - 1] === 0b0110) return true;  //check by black king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare + 1 * 8 + 1) >= 0 && (kingSquare + 1 * 8 + 1) <= 63 && tempstate[kingSquare + 1 * 8 + 1] === 0b0110) return true;  //check by black king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare + 1) >= 0 && (kingSquare + 1) <= 63 && tempstate[kingSquare + 1] === 0b0110) return true;  //check by black king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare - 1) >= 0 && (kingSquare - 1) <= 63 && tempstate[kingSquare - 1] === 0b0110) return true;  //check by black king (obv not possible, but it means white king ends up being adjacent to the black king )

        return false;

    }

    else {  //for a black king 

        if ((kingSquare + 1 * 8 + 1) >= 0 && (kingSquare + 1 * 8 + 1) <= 63 && tempstate[kingSquare + 1 * 8 + 1] === 0b1001) return true;  //check by white  pawn
        if ((kingSquare + 1 * 8 - 1) >= 0 && (kingSquare + 1 * 8 - 1) <= 63 && tempstate[kingSquare + 1 * 8 - 1] === 0b1001) return true;
        if ((kingSquare + 1 * 8 + 2) >= 0 && (kingSquare + 1 * 8 + 2) <= 63 && tempstate[kingSquare + 1 * 8 + 2] === 0b1011) return true;   //check by white knight
        if ((kingSquare + 1 * 8 - 2) >= 0 && (kingSquare + 1 * 8 - 2) <= 63 && tempstate[kingSquare + 1 * 8 - 2] === 0b1011) return true;
        if ((kingSquare - 1 * 8 - 2) >= 0 && (kingSquare - 1 * 8 - 2) <= 63 && tempstate[kingSquare - 1 * 8 - 2] === 0b1011) return true;
        if ((kingSquare - 1 * 8 + 2) >= 0 && (kingSquare - 1 * 8 + 2) <= 63 && tempstate[kingSquare - 1 * 8 + 2] === 0b1011) return true;
        if ((kingSquare - 2 * 8 + 1) >= 0 && (kingSquare - 2 * 8 + 1) <= 63 && tempstate[kingSquare - 2 * 8 + 1] === 0b1011) return true;
        if ((kingSquare - 2 * 8 - 1) >= 0 && (kingSquare - 2 * 8 - 1) <= 63 && tempstate[kingSquare - 2 * 8 - 1] === 0b1011) return true;
        if ((kingSquare + 2 * 8 - 1) >= 0 && (kingSquare + 2 * 8 - 1) <= 63 && tempstate[kingSquare + 2 * 8 - 1] === 0b1011) return true;
        if ((kingSquare + 2 * 8 + 1) >= 0 && (kingSquare + 2 * 8 + 1) <= 63 && tempstate[kingSquare + 2 * 8 + 1] === 0b1011) return true;

        for (let i = 1; i < 8; i++) {
            if ((kingSquare + i * 8 + i) >= 0 && (kingSquare + i * 8 + i) <= 63 && tempstate[kingSquare + i * 8 + i] === 0b1100) return true;  //check by white bishop
            else if ((kingSquare + i * 8 + i) >= 0 && (kingSquare + i * 8 + i) <= 63 && tempstate[kingSquare + i * 8 + i] === 0b1101) return true; //check by white queen
            else if ((kingSquare + i * 8 + i) >= 0 && (kingSquare + i * 8 + i) <= 63 && tempstate[kingSquare + i * 8 + i] != 0b0000) break;     //a piece interuppts the diagonal
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare + i * 8 - i) >= 0 && (kingSquare + i * 8 - i) <= 63 && tempstate[kingSquare + i * 8 - i] === 0b1100) return true;
            else if ((kingSquare + i * 8 - i) >= 0 && (kingSquare + i * 8 - i) <= 63 && tempstate[kingSquare + i * 8 - i] === 0b1101) return true;
            else if ((kingSquare + i * 8 - i) >= 0 && (kingSquare + i * 8 - i) <= 63 && tempstate[kingSquare + i * 8 - i] != 0b0000) break;
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare - i * 8 - i) >= 0 && (kingSquare - i * 8 - i) <= 63 && tempstate[kingSquare - i * 8 - i] === 0b1100) return true;
            else if ((kingSquare - i * 8 - i) >= 0 && (kingSquare - i * 8 - i) <= 63 && tempstate[kingSquare - i * 8 - i] === 0b1101) return true;
            else if ((kingSquare - i * 8 - i) >= 0 && (kingSquare - i * 8 - i) <= 63 && tempstate[kingSquare - i * 8 - i] != 0b0000) break;
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare - i * 8 + i) >= 0 && (kingSquare - i * 8 + i) <= 63 && tempstate[kingSquare - i * 8 + i] === 0b1100) return true;
            else if ((kingSquare - i * 8 + i) >= 0 && (kingSquare - i * 8 + i) <= 63 && tempstate[kingSquare - i * 8 + i] === 0b1101) return true;
            else if ((kingSquare - i * 8 + i) >= 0 && (kingSquare - i * 8 + i) <= 63 && tempstate[kingSquare - i * 8 + i] != 0b0000) break;
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare - i * 8) >= 0 && (kingSquare - i * 8) <= 63 && tempstate[kingSquare - i * 8] === 0b1010) return true;
            else if ((kingSquare - i * 8) >= 0 && (kingSquare - i * 8) <= 63 && tempstate[kingSquare - i * 8] === 0b1101) return true;
            else if ((kingSquare - i * 8) >= 0 && (kingSquare - i * 8) <= 63 && tempstate[kingSquare - i * 8] != 0b0000) break;
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare + i * 8) >= 0 && (kingSquare + i * 8) <= 63 && tempstate[kingSquare + i * 8] === 0b1010) return true;
            else if ((kingSquare + i * 8) >= 0 && (kingSquare + i * 8) <= 63 && tempstate[kingSquare + i * 8] === 0b1101) return true;
            else if ((kingSquare + i * 8) >= 0 && (kingSquare + i * 8) <= 63 && tempstate[kingSquare + i * 8] != 0b0000) break;
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare + i) >= 0 && (kingSquare + i) <= 63 && tempstate[kingSquare + i] === 0b1010) return true;
            else if ((kingSquare + i) >= 0 && (kingSquare + i) <= 63 && tempstate[kingSquare + i] === 0b1101) return true;
            else if ((kingSquare + i) >= 0 && (kingSquare + i) <= 63 && tempstate[kingSquare + i] != 0b0000) break;
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare - i) >= 0 && (kingSquare - i) <= 63 && tempstate[kingSquare - i] === 0b1010) return true;
            else if ((kingSquare - i) >= 0 && (kingSquare - i) <= 63 && tempstate[kingSquare - i] === 0b1101) return true;
            else if ((kingSquare - i) >= 0 && (kingSquare - i) <= 63 && tempstate[kingSquare - i] != 0b0000) break;
        }

        if ((kingSquare + 1 * 8) >= 0 && (kingSquare + 1 * 8) <= 63 && tempstate[kingSquare + 1 * 8] === 0b1110) return true;  //check by white  king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare - 1 * 8) >= 0 && (kingSquare - 1 * 8) <= 63 && tempstate[kingSquare - 1 * 8] === 0b1110) return true;  //check by white  king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare - 1 * 8 + 1) >= 0 && (kingSquare - 1 * 8 + 1) <= 63 && tempstate[kingSquare - 1 * 8 + 1] === 0b1110) return true;  //check by white king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare - 1 * 8 - 1) >= 0 && (kingSquare - 1 * 8 - 1) <= 63 && tempstate[kingSquare - 1 * 8 - 1] === 0b1110) return true;  //check by white king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare + 1 * 8 - 1) >= 0 && (kingSquare + 1 * 8 - 1) <= 63 && tempstate[kingSquare + 1 * 8 - 1] === 0b1110) return true;  //check by white  king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare + 1 * 8 + 1) >= 0 && (kingSquare + 1 * 8 + 1) <= 63 && tempstate[kingSquare + 1 * 8 + 1] === 0b1110) return true;  //check by white  king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare + 1) >= 0 && (kingSquare + 1) <= 63 && tempstate[kingSquare + 1] === 0b1110) return true;  //check by white king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare - 1) >= 0 && (kingSquare - 1) <= 63 && tempstate[kingSquare - 1] === 0b1110) return true;  //check by white king (obv not possible, but it means white king ends up being adjacent to the black king )

        return false;

    }




    //consider all possible moves the king can play as a rook/bishop/knight/queen/pawn, and if any of the squares contain the opp's piece, return true;
}

function checkMate(gamestate) {
    //consider all the gamestates generated by making every move the current player can play
    //if any gamestate results in non-check condition, return  false;
    //else return true;

    let tempgameState;

    for (let i = 0; i < 64; i++) {              //traverse all the 64 squares of the board
        for (let j = 0; j < 64; j++) {
            let tempMove = createMove(i, j);       //create a temp move for all possible combinations of start and target squares
            tempgameState = deepCopy(gamestate);
            // console.log(tempMove, i, j);
            if (!isMoveValid(tempMove)) continue;        //if the move is invalid, move on
            makeTempMove(tempMove, tempgameState);   //play the temporary move on the board
            if (!check(tempgameState))      //if the king ends up in non-check position, it is not a checkmate 
            {
                // console.log("No checkmate!");
                return false;
            }
        }
    }

    return true;

    //one important point i just thought is, to return true, the king must be in check position right now, else it is declared a stalemate!
    // edit: the above point is ensured in the makeMove function 
}

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

console.log(gamestate);
let caststate = gamestate[64];
console.log(caststate);
// console.log(enpwhite.toString(2));
// console.log(enpblack.toString(2));
// console.log(11 % 8);
// let gu = checkMate(gamestate);
// console.log(gu);









