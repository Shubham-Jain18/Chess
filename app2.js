let gamestate = new Array(64);
let movehistory = []
let turn = 1;

//gamestate shows the current status of the board, storing the piece stored in each of the 64 squares (or if it is empty) in form of bits

for (let i = 0; i < 64; i++) {
    gamestate[i] = 0b0;
}

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


function makeMove(move) {
    if (!isMoveValid(move)) {
        console.log("The given move is not valid !");
        return;
    }

    else {
        let startSquare = move & (0b111111);
        let targetSquare = move & (0b111111000000);
        gamestate[targetSquare] = gamestate[startSquare];
        gamestate[startSquare] = 0b0000;
        turn = 1 - turn;
        displayBoard(gamestate);



        if (checkMate(gamestate)) {
            if (check(gamestate)) {
                console.log("CheckMate!");
            }
            else {
                console.log("Stalemate!");
            }
        }

        else if (check(gamestate)) {
            console.log("Check!");
        }
    }
}


function makeTempMove(move, tempgameState) {
    // it checks a temporary gamestate by playing a temporary move on it, and then analysing on it 
    let startSquare = move & (0b111111);
    let targetSquare = move & (0b111111000000);
    tempgameState[targetSquare] = tempgameState[startSquare];
    tempgameState[startSquare] = 0b0000;

    return tempgameState;


}

function isMoveValid(move) {

    let startSquare = move & (0b111111);
    let targetSquare = move & (0b111111000000);
    let selectedPiece = gamestate[startSquare];
    let targetedPiece = gamestate[targetSquare];
    let piece = selectedPiece & (0b111);

    //function to check the validity of a given move 

    //1) check if the turn is valid or not (startsquare should contain a piece of the same color as turn)

    if (selectedPiece === 0) return false;
    let selectedColor = selectedPiece & (0b1000);
    if (selectedColor != turn) return false;


    //2) the target square should be empty, or occupied by opp's piece

    if (targetSquare != 0) {
        let targetedColor = targetedPiece & (0b1000);
        if (targetedColor == turn) return false;
    }

    //3) check for the correct movement of the selected piece

    let flag = false;

    switch (piece) {

        case 0b001: //pawn

            if (turn == 1) { //white pawn

                if (startSquare + 8 === targetSquare) flag = true;    //moves 1 square ahead
                else if (startSquare <= 15 && startSquare >= 8 && startSquare + 16 === targetSquare && gamestate[startSquare + 8] == 0) flag = true;        //moves 2 squares only on the first move (of itself) and ensures there is no piece one square ahead

                //en-passant will be implemented later if needed

            }

            else {      //black pawn 

                if (startSquare - 8 === targetSquare) flag = true;    //moves 1 square ahead
                else if (startSquare <= 55 && startSquare >= 48 && startSquare - 16 === targetSquare && gamestate[startSquare - 8] == 0) flag = true;        //moves 2 squares only on the first move (of itself) and ensures there is no piece one square ahead

                //en-passant will be implemented later if needed

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
                if (gamestate[startSquare + i * 8 + i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare + i * 8 - i === targetSquare) flag = true;
                if (gamestate[startSquare + i * 8 - i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare - i * 8 + i === targetSquare) flag = true;
                if (gamestate[startSquare - i * 8 + i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare - i * 8 - i === targetSquare) flag = true;
                if (gamestate[startSquare - i * 8 - i] != 0) break;
            }

            break;

        case 0b010: //rook

            for (let i = 1; i < 8; i++) {
                if (startSquare + i * 8 === targetSquare) flag = true;
                if (gamestate[startSquare + i * 8] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare - i * 8 === targetSquare) flag = true;
                if (gamestate[startSquare - i * 8] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare + i === targetSquare) flag = true;
                if (gamestate[startSquare + i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare - i === targetSquare) flag = true;
                if (gamestate[startSquare - i] != 0) break;
            }

            break;

        case 0b101: //queen

            for (let i = 1; i < 8; i++) {
                if (startSquare + i * 8 + i === targetSquare) flag = true;
                if (gamestate[startSquare + i * 8 + i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare + i * 8 - i === targetSquare) flag = true;
                if (gamestate[startSquare + i * 8 - i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare - i * 8 + i === targetSquare) flag = true;
                if (gamestate[startSquare - i * 8 + i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare - i * 8 - i === targetSquare) flag = true;
                if (gamestate[startSquare - i * 8 - i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare + i * 8 === targetSquare) flag = true;
                if (gamestate[startSquare + i * 8] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare - i * 8 === targetSquare) flag = true;
                if (gamestate[startSquare - i * 8] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare + i === targetSquare) flag = true;
                if (gamestate[startSquare + i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare - i === targetSquare) flag = true;
                if (gamestate[startSquare - i] != 0) break;
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

            //castling will be implemented later

            break;

    }

    if (flag === false) return false;

    //4) after the move is played, the king of the current turn should not be in check

    let tempstate = gamestate;
    tempstate = (makeTempMove(move, tempstate));
    if (check(tempstate)) return false;          //the current turn's king ends up in a check after this move is played

    return true;

}

function check(tempstate) {
    //function to check if the king of the current turn is in check 


    let kingSquare;   //square of the king of the current turn in the temporary gamestate passed

    for (let i = 0; i < 64; i++) {
        let x = tempstate[i] & (0b1000);
        let y = tempstate[i] & (0b0111);
        if (x === turn && y === 0b0110) {
            kingSquare = i;
            break;
        }
    }


    if (turn === 1) {
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

    else {
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




    //consider all possible moves the king can play as a rook/bishop/knight/queen/pawn, and if any of the squares contain the opp's piece, return true;
}

function checkMate(gamestate) {
    //consider all the gamestates generated by making every move the current player can play
    //if any gamestate results in non-check condition, false;
    //else return true;

    //one important point i just though is, to return true, the king must be in check position right now, else it is declared a stalemate!
}

let mymove = createMove(10, 12);
console.log(mymove);




