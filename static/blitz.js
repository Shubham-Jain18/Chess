var gamestate = new Array(65);

let gameStateHistory = []        // i think it will be better to store the gamestates (history) rather than moves
let moveHistory = []        //since i need to show the moves too, i think it is fine to have this too
let turn = 1;


const blackClock = document.getElementById('black-clock');
const whiteClock = document.getElementById('white-clock');
let blackTime = 180;
let whiteTime = 180;
let timerInterval;



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

const pieceImages = {
    [rook | black]: '/static/media/Chess_rdt60.png',
    [knight | black]: '/static/media/Chess_ndt60.png',
    [bishop | black]: '/static/media/Chess_bdt60.png',
    [queen | black]: '/static/media/Chess_qdt60.png',
    [king | black]: '/static/media/Chess_kdt60.png',
    [pawn | black]: '/static/media/Chess_pdt60.png',
    [rook | white]: '/static/media/Chess_rlt60.png',
    [knight | white]: '/static/media/Chess_nlt60.png',
    [bishop | white]: '/static/media/Chess_blt60.png',
    [queen | white]: '/static/media/Chess_qlt60.png',
    [king | white]: '/static/media/Chess_klt60.png',
    [pawn | white]: '/static/media/Chess_plt60.png'
};

function initializeGameState() {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            gamestate[63 - row * 8 - col] = initialBoard[row][col];
        }
    }
    gamestate[64] = 0b1111; // Castling bits
}


initializeGameState();

let copy = deepCopy(gamestate);
gameStateHistory.push(copy);

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
    console.log("Starting square: ", startSquare);
    console.log("Target square: ", targetSquare);
    let flag = isMoveValid(move);
    if (!flag) {
        console.log("The given move is not valid !");
        return;
    }

    else {

        addMove(move);      //add the move to the move history

        let startSquare = move & (0b111111);
        let targetSquare = (move & (0b111111000000)) >> 6;

        let selectedPiece = gamestate[startSquare];
        let targetedPiece = gamestate[targetSquare];

        if (gamestate[targetSquare]) playCaptureSound();
        else playMoveSound();

        let f = 0;



        gamestate[targetSquare] = gamestate[startSquare];
        gamestate[startSquare] = 0b0000;

        //-----------------------------------------------------------------------------------------------------------------

        //pawn promotion section
        if ((selectedPiece === (pawn | white) && targetSquare >= 56) || (selectedPiece === (pawn | black) && targetSquare <= 7)) {
            showPawnPromotionWindow(startSquare, targetSquare, selectedPiece);
            return;
        }


        //--------------------------------------------------------------------------------------------------------------

        //en passant section


        if (selectedPiece === 0b1001 && startSquare + 1 * 8 + 1 === targetSquare && targetedPiece === 0b0000) {       //if the white pawn makes a diagonal capture, and that square is empty, and the move has also passed to be valid, it means it is an en-passant capture, and we need to remove the black pawn off the board
            gamestate[targetSquare - 1 * 8] = 0b0000;
            playCaptureSound();
            f++;
        }

        if (selectedPiece === 0b1001 && startSquare + 1 * 8 - 1 === targetSquare && targetedPiece === 0b0000) {       //if the white pawn makes a diagonal capture, and that square is empty, and the move has also passed to be valid, it means it is an en-passant capture, and we need to remove the black pawn off the board
            gamestate[targetSquare - 1 * 8] = 0b0000;
            playCaptureSound();
            f++;

        }

        if (selectedPiece === 0b0001 && startSquare - 1 * 8 + 1 === targetSquare && targetedPiece === 0b0000) {       //if the black pawn makes a diagonal capture, and that square is empty, and the move has also passed to be valid, it means it is an en-passant capture, and we need to remove the white pawn off the board
            gamestate[targetSquare + 1 * 8] = 0b0000;
            playCaptureSound();
            f++;

        }

        if (selectedPiece === 0b0001 && startSquare - 1 * 8 - 1 === targetSquare && targetedPiece === 0b0000) {       //if the black pawn makes a diagonal capture, and that square is empty, and the move has also passed to be valid, it means it is an en-passant capture, and we need to remove the white pawn off the board
            gamestate[targetSquare + 1 * 8] = 0b0000;
            playCaptureSound();
            f++;

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

        if (f == 0) {
            if (targetedPiece) playCaptureSound();
            else playMoveSound();
        }


        let copy = deepCopy(gamestate);

        gameStateHistory.push(copy);
        switchTurn();
        console.log("turn after making move ", turn);

        if (checkMate(gamestate)) {
            if (check(gamestate)) {
                console.log("CHECKMATE!");
            }
            else {
                console.log("STALEMATE!");
            }

            endGame();
        }

        else if (check(gamestate)) {
            console.log("Check!");
        }


        console.log("---------------------------------------------------------------");
        console.log("\n");
    }
}

function showPawnPromotionWindow(startSquare, targetSquare, selectedPiece) {
    // Create a pawn promotion popup element
    const popup = document.createElement('div');
    popup.classList.add('pawn-promotion-popup');

    // Create a popup content element
    const popupContent = document.createElement('div');
    popupContent.classList.add('pawn-promotion-popup-content');

    // Create text for pawn promotion
    const promotionText = document.createElement('p');
    promotionText.textContent = 'Select a piece to promote your pawn:';

    // Create buttons for each piece option
    const pieceOptions = ['Queen', 'Rook', 'Knight', 'Bishop'];
    pieceOptions.forEach(piece => {
        const button = document.createElement('button');
        button.textContent = piece;
        button.addEventListener('click', () => {
            // Update the gamestate with the selected piece
            const newPiece = piece === 'Queen' ? queen :
                piece === 'Rook' ? rook :
                    piece === 'Knight' ? knight : bishop;
            gamestate[targetSquare] = newPiece | (selectedPiece & white); // Ensure piece color is maintained

            // Update the piece image on the board
            const row = 7 - Math.floor(targetSquare / 8);
            const col = 7 - (targetSquare % 8);
            const pieceImage = document.querySelector(`[data-row="${row}"][data-col="${col}"] .piece`);
            if (pieceImage) {
                pieceImage.src = pieceImages[gamestate[targetSquare]];
                pieceImage.dataset.piece = gamestate[targetSquare];
            }
            // Close the popup
            popup.remove();
            // Update the board

            // Continue with the game
            let copy = deepCopy(gamestate);
            gameStateHistory.push(copy);
            switchTurn();
        });
        popupContent.appendChild(button);
    });

    // Append elements to the popup content
    popupContent.appendChild(promotionText);
    // Append the popup content to the popup
    popup.appendChild(popupContent);
    // Append the popup to the document body
    document.body.appendChild(popup);
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
    //function to check the validity of a given move

    //1) check if the turn is valid or not (startsquare should contain a piece of the same color as turn)

    if (selectedPiece === 0) return false;
    let selectedColor = selectedPiece & (0b1000);
    if ((selectedColor >> 3) != turn) return false;




    //2) the target square should be empty, or occupied by opp's piece

    if (gamestate[targetSquare] != 0) {
        if ((targetedColor >> 3) == turn) {
            return false;
        }
    }


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

            //we also need to ensure that the knight does not flank across the board

            if (startSquare + 2 * 8 + 1 === targetSquare && (startSquare % 8 + 1) === (targetSquare % 8)) flag = true;
            else if (startSquare + 2 * 8 - 1 === targetSquare && (startSquare % 8 - 1) === (targetSquare % 8)) flag = true;
            else if (startSquare + 1 * 8 + 2 === targetSquare && (startSquare % 8 + 2) === (targetSquare % 8)) flag = true;
            else if (startSquare + 1 * 8 - 2 === targetSquare && (startSquare % 8 - 2) === (targetSquare % 8)) flag = true;
            else if (startSquare - 2 * 8 + 1 === targetSquare && (startSquare % 8 + 1) === (targetSquare % 8)) flag = true;
            else if (startSquare - 2 * 8 - 1 === targetSquare && (startSquare % 8 - 1) === (targetSquare % 8)) flag = true;
            else if (startSquare - 1 * 8 + 2 === targetSquare && (startSquare % 8 + 2) === (targetSquare % 8)) flag = true;
            else if (startSquare - 1 * 8 - 2 === targetSquare && (startSquare % 8 - 2) === (targetSquare % 8)) flag = true;

            else return false;

            break;

        case 0b100: //bishop

            for (let i = 1; i < 8; i++) {
                if (startSquare + i * 8 + i === targetSquare && (startSquare % 8 + i) === (targetSquare % 8)) flag = true;
                if ((startSquare + i * 8 + i) >= 0 && (startSquare + i * 8 + i) <= 63 && gamestate[startSquare + i * 8 + i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare + i * 8 - i === targetSquare && (startSquare % 8 - i) === (targetSquare % 8)) flag = true;
                if ((startSquare + i * 8 - i) >= 0 && (startSquare + i * 8 - i) <= 63 && gamestate[startSquare + i * 8 - i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare - i * 8 + i === targetSquare && (startSquare % 8 + i) === (targetSquare % 8)) flag = true;
                if ((startSquare - i * 8 + i) >= 0 && (startSquare - i * 8 + i) <= 63 && gamestate[startSquare - i * 8 + i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare - i * 8 - i === targetSquare && (startSquare % 8 - i) === (targetSquare % 8)) flag = true;
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
                if (startSquare + i === targetSquare && (startSquare % 8 + i) === targetSquare % 8) flag = true;      //ensure rook stays in the same rank(row)
                if ((startSquare + i) >= 0 && (startSquare + i) <= 63 && gamestate[startSquare + i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare - i === targetSquare && (startSquare % 8 - i) === targetSquare % 8) flag = true;
                if ((startSquare - i) >= 0 && (startSquare - i) <= 63 && gamestate[startSquare - i] != 0) break;
            }

            break;

        case 0b101: //queen

            for (let i = 1; i < 8; i++) {
                if (startSquare + i * 8 + i === targetSquare && (startSquare % 8 + i) === (targetSquare % 8)) flag = true;
                if ((startSquare + i * 8 + i) >= 0 && (startSquare + i * 8 + i) <= 63 && gamestate[startSquare + i * 8 + i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare + i * 8 - i === targetSquare && (startSquare % 8 - i) === (targetSquare % 8)) flag = true;
                if ((startSquare + i * 8 - i) >= 0 && (startSquare + i * 8 - i) <= 63 && gamestate[startSquare + i * 8 - i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare - i * 8 + i === targetSquare && (startSquare % 8 + i) === (targetSquare % 8)) flag = true;
                if ((startSquare - i * 8 + i) >= 0 && (startSquare - i * 8 + i) <= 63 && gamestate[startSquare - i * 8 + i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare - i * 8 - i === targetSquare && (startSquare % 8 - i) === (targetSquare % 8)) flag = true;
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
                if (startSquare + i === targetSquare && (startSquare % 8 + i) === targetSquare % 8) flag = true;     //ensure the queen stays in the same row (rank)
                if ((startSquare + i) >= 0 && (startSquare + i) <= 63 && gamestate[startSquare + i] != 0) break;
            }

            for (let i = 1; i < 8; i++) {
                if (startSquare - i === targetSquare && (startSquare % 8 - i) === targetSquare % 8) flag = true;     //ensure the queen stays in the same row (rank)
                if ((startSquare - i) >= 0 && (startSquare - i) <= 63 && gamestate[startSquare - i] != 0) break;
            }


            break;

        case 0b110: //king

            if (startSquare + 1 === targetSquare) flag = true;
            else if (startSquare - 1 === targetSquare && (startSquare % 8 - 1) === (targetSquare % 8)) flag = true;
            else if (startSquare - 1 * 8 === targetSquare) flag = true;
            else if (startSquare + 1 * 8 === targetSquare) flag = true;
            else if (startSquare + 1 * 8 + 1 === targetSquare && (startSquare % 8 + 1) === (targetSquare % 8)) flag = true;
            else if (startSquare + 1 * 8 - 1 === targetSquare && (startSquare % 8 - 1) === (targetSquare % 8)) flag = true;
            else if (startSquare - 1 * 8 - 1 === targetSquare && (startSquare % 8 - 1) === (targetSquare % 8)) flag = true;
            else if (startSquare - 1 * 8 + 1 === targetSquare && (startSquare % 8 + 1) === (targetSquare % 8)) flag = true;

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

                    if (!check(gamestate) && !check(tempgameState1) && !check(tempgameState2)) flag = true;        //this checks the king does not fall under any check on its catling path
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

                    if (!check(gamestate) && !check(tempgameState1) && !check(tempgameState2)) flag = true;        //this checks the king does not fall under any check on its catling path
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

                    if (!check(gamestate) && !check(tempgameState1) && !check(tempgameState2)) flag = true;        //this checks the king does not fall under any check on its catling path
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

                    if (!check(gamestate) && !check(tempgameState1) && !check(tempgameState2)) flag = true;        //this checks the king does not fall under any check on its castling path
                }
            }



            break;

    }

    if (flag === false) return false;

    //4) after the move is played, the king of the current turn should not be in check

    let tempstate = deepCopy(gamestate);
    tempstate = (makeTempMove(move, tempstate));

    if (check(tempstate)) return false;          //the current turn's king ends up in a check after this move is played

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
        if ((kingSquare + 1 * 8 + 1) >= 0 && (kingSquare + 1 * 8 + 1) <= 63 && tempstate[kingSquare + 1 * 8 + 1] === 0b0001 && (kingSquare % 8 + 1) === (kingSquare + 1) % 8) return true;  //check by black pawn
        if ((kingSquare + 1 * 8 - 1) >= 0 && (kingSquare + 1 * 8 - 1) <= 63 && tempstate[kingSquare + 1 * 8 - 1] === 0b0001 && (kingSquare % 8 - 1) === (kingSquare - 1) % 8) return true;
        if ((kingSquare + 1 * 8 + 2) >= 0 && (kingSquare + 1 * 8 + 2) <= 63 && tempstate[kingSquare + 1 * 8 + 2] === 0b0011 && (kingSquare % 8 + 2) === (kingSquare + 2) % 8) return true;   //check by black knight
        if ((kingSquare + 1 * 8 - 2) >= 0 && (kingSquare + 1 * 8 - 2) <= 63 && tempstate[kingSquare + 1 * 8 - 2] === 0b0011 && (kingSquare % 8 - 2) === (kingSquare - 2) % 8) return true;
        if ((kingSquare - 1 * 8 - 2) >= 0 && (kingSquare - 1 * 8 - 2) <= 63 && tempstate[kingSquare - 1 * 8 - 2] === 0b0011 && (kingSquare % 8 - 2) === (kingSquare - 2) % 8) return true;
        if ((kingSquare - 1 * 8 + 2) >= 0 && (kingSquare - 1 * 8 + 2) <= 63 && tempstate[kingSquare - 1 * 8 + 2] === 0b0011 && (kingSquare % 8 + 2) === (kingSquare + 2) % 8) return true;
        if ((kingSquare - 2 * 8 + 1) >= 0 && (kingSquare - 2 * 8 + 1) <= 63 && tempstate[kingSquare - 2 * 8 + 1] === 0b0011 && (kingSquare % 8 + 1) === (kingSquare + 1) % 8) return true;
        if ((kingSquare - 2 * 8 - 1) >= 0 && (kingSquare - 2 * 8 - 1) <= 63 && tempstate[kingSquare - 2 * 8 - 1] === 0b0011 && (kingSquare % 8 - 1) === (kingSquare - 1) % 8) return true;
        if ((kingSquare + 2 * 8 - 1) >= 0 && (kingSquare + 2 * 8 - 1) <= 63 && tempstate[kingSquare + 2 * 8 - 1] === 0b0011 && (kingSquare % 8 - 1) === (kingSquare - 1) % 8) return true;
        if ((kingSquare + 2 * 8 + 1) >= 0 && (kingSquare + 2 * 8 + 1) <= 63 && tempstate[kingSquare + 2 * 8 + 1] === 0b0011 && (kingSquare % 8 + 1) === (kingSquare + 1) % 8) return true;

        for (let i = 1; i < 8; i++) {
            if ((kingSquare + i * 8 + i) >= 0 && (kingSquare + i * 8 + i) <= 63 && tempstate[kingSquare + i * 8 + i] === 0b0100 && (kingSquare % 8 + i) === (kingSquare + i) % 8) return true;  //check by black bishop
            else if ((kingSquare + i * 8 + i) >= 0 && (kingSquare + i * 8 + i) <= 63 && tempstate[kingSquare + i * 8 + i] === 0b0101 && (kingSquare % 8 + i) === (kingSquare + i) % 8) return true; //check by black queen
            else if ((kingSquare + i * 8 + i) >= 0 && (kingSquare + i * 8 + i) <= 63 && tempstate[kingSquare + i * 8 + i] != 0b0000) break;     //a piece interuppts the diagonal
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare + i * 8 - i) >= 0 && (kingSquare + i * 8 - i) <= 63 && tempstate[kingSquare + i * 8 - i] === 0b0100 && (kingSquare % 8 - i) === (kingSquare - i) % 8) return true;  //check by black bishop
            else if ((kingSquare + i * 8 - i) >= 0 && (kingSquare + i * 8 - i) <= 63 && tempstate[kingSquare + i * 8 - i] === 0b0101 && (kingSquare % 8 - i) === (kingSquare - i) % 8) return true; //check by black queen
            else if ((kingSquare + i * 8 - i) >= 0 && (kingSquare + i * 8 - i) <= 63 && tempstate[kingSquare + i * 8 - i] != 0b0000) break;     //a piece interuppts the diagonal
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare - i * 8 - i) >= 0 && (kingSquare - i * 8 - i) <= 63 && tempstate[kingSquare - i * 8 - i] === 0b0100 && (kingSquare % 8 - i) === (kingSquare - i) % 8) return true;  //check by black bishop
            else if ((kingSquare - i * 8 - i) >= 0 && (kingSquare - i * 8 - i) <= 63 && tempstate[kingSquare - i * 8 - i] === 0b0101 && (kingSquare % 8 - i) === (kingSquare - i) % 8) return true; //check by black queen
            else if ((kingSquare - i * 8 - i) >= 0 && (kingSquare - i * 8 - i) <= 63 && tempstate[kingSquare - i * 8 - i] != 0b0000) break;     //a piece interuppts the diagonal
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare - i * 8 + i) >= 0 && (kingSquare - i * 8 + i) <= 63 && tempstate[kingSquare - i * 8 + i] === 0b0100 && (kingSquare % 8 + i) === (kingSquare + i) % 8) return true;  //check by black bishop
            else if ((kingSquare - i * 8 + i) >= 0 && (kingSquare - i * 8 + i) <= 63 && tempstate[kingSquare - i * 8 + i] === 0b0101 && (kingSquare % 8 + i) === (kingSquare + i) % 8) return true; //check by black queen
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
            if ((kingSquare + i) >= 0 && (kingSquare + i) <= 63 && tempstate[kingSquare + i] === 0b0010 && (kingSquare % 8 + i) === (kingSquare + i) % 8) return true;  //check by black rook
            else if ((kingSquare + i) >= 0 && (kingSquare + i) <= 63 && tempstate[kingSquare + i] === 0b0101 && (kingSquare % 8 + i) === (kingSquare + i) % 8) return true; //check by black queen
            else if ((kingSquare + i) >= 0 && (kingSquare + i) <= 63 && tempstate[kingSquare + i] != 0b0000) break;     //a piece interuppts the row(rank)/column(file)
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare - i) >= 0 && (kingSquare - i) <= 63 && tempstate[kingSquare - i] === 0b0010 && (kingSquare % 8 - i) === (kingSquare - i) % 8) return true;  //check by black rook
            else if ((kingSquare - i) >= 0 && (kingSquare - i) <= 63 && tempstate[kingSquare - i] === 0b0101 && (kingSquare % 8 - i) === (kingSquare - i) % 8) return true; //check by black queen
            else if ((kingSquare - i) >= 0 && (kingSquare - i) <= 63 && tempstate[kingSquare - i] != 0b0000) break;     //a piece interuppts the row(rank)/column(file)
        }

        if ((kingSquare + 1 * 8) >= 0 && (kingSquare + 1 * 8) <= 63 && tempstate[kingSquare + 1 * 8] === 0b0110) return true;  //check by black king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare - 1 * 8) >= 0 && (kingSquare - 1 * 8) <= 63 && tempstate[kingSquare - 1 * 8] === 0b0110) return true;  //check by black king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare - 1 * 8 + 1) >= 0 && (kingSquare - 1 * 8 + 1) <= 63 && tempstate[kingSquare - 1 * 8 + 1] === 0b0110 && (kingSquare % 8 + 1) === (kingSquare + 1) % 8) return true;  //check by black king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare - 1 * 8 - 1) >= 0 && (kingSquare - 1 * 8 - 1) <= 63 && tempstate[kingSquare - 1 * 8 - 1] === 0b0110 && (kingSquare % 8 - 1) === (kingSquare - 1) % 8) return true;  //check by black king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare + 1 * 8 - 1) >= 0 && (kingSquare + 1 * 8 - 1) <= 63 && tempstate[kingSquare + 1 * 8 - 1] === 0b0110 && (kingSquare % 8 - 1) === (kingSquare - 1) % 8) return true;  //check by black king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare + 1 * 8 + 1) >= 0 && (kingSquare + 1 * 8 + 1) <= 63 && tempstate[kingSquare + 1 * 8 + 1] === 0b0110 && (kingSquare % 8 + 1) === (kingSquare + 1) % 8) return true;  //check by black king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare + 1) >= 0 && (kingSquare + 1) <= 63 && tempstate[kingSquare + 1] === 0b0110 && (kingSquare % 8 + 1) === (kingSquare + 1) % 8) return true;  //check by black king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare - 1) >= 0 && (kingSquare - 1) <= 63 && tempstate[kingSquare - 1] === 0b0110 && (kingSquare % 8 - 1) === (kingSquare - 1) % 8) return true;  //check by black king (obv not possible, but it means white king ends up being adjacent to the black king )

        return false;

    }

    else {  //for a black king

        if ((kingSquare - 1 * 8 + 1) >= 0 && (kingSquare - 1 * 8 + 1) <= 63 && tempstate[kingSquare - 1 * 8 + 1] === 0b1001 && (kingSquare % 8 + 1) === (kingSquare + 1) % 8) return true;  //check by black pawn
        if ((kingSquare - 1 * 8 - 1) >= 0 && (kingSquare - 1 * 8 - 1) <= 63 && tempstate[kingSquare - 1 * 8 - 1] === 0b1001 && (kingSquare % 8 - 1) === (kingSquare - 1) % 8) return true;
        if ((kingSquare + 1 * 8 + 2) >= 0 && (kingSquare + 1 * 8 + 2) <= 63 && tempstate[kingSquare + 1 * 8 + 2] === 0b1011 && (kingSquare % 8 + 2) === (kingSquare + 2) % 8) return true;   //check by black knight
        if ((kingSquare + 1 * 8 - 2) >= 0 && (kingSquare + 1 * 8 - 2) <= 63 && tempstate[kingSquare + 1 * 8 - 2] === 0b1011 && (kingSquare % 8 - 2) === (kingSquare - 2) % 8) return true;
        if ((kingSquare - 1 * 8 - 2) >= 0 && (kingSquare - 1 * 8 - 2) <= 63 && tempstate[kingSquare - 1 * 8 - 2] === 0b1011 && (kingSquare % 8 - 2) === (kingSquare - 2) % 8) return true;
        if ((kingSquare - 1 * 8 + 2) >= 0 && (kingSquare - 1 * 8 + 2) <= 63 && tempstate[kingSquare - 1 * 8 + 2] === 0b1011 && (kingSquare % 8 + 2) === (kingSquare + 2) % 8) return true;
        if ((kingSquare - 2 * 8 + 1) >= 0 && (kingSquare - 2 * 8 + 1) <= 63 && tempstate[kingSquare - 2 * 8 + 1] === 0b1011 && (kingSquare % 8 + 1) === (kingSquare + 1) % 8) return true;
        if ((kingSquare - 2 * 8 - 1) >= 0 && (kingSquare - 2 * 8 - 1) <= 63 && tempstate[kingSquare - 2 * 8 - 1] === 0b1011 && (kingSquare % 8 - 1) === (kingSquare - 1) % 8) return true;
        if ((kingSquare + 2 * 8 - 1) >= 0 && (kingSquare + 2 * 8 - 1) <= 63 && tempstate[kingSquare + 2 * 8 - 1] === 0b1011 && (kingSquare % 8 - 1) === (kingSquare - 1) % 8) return true;
        if ((kingSquare + 2 * 8 + 1) >= 0 && (kingSquare + 2 * 8 + 1) <= 63 && tempstate[kingSquare + 2 * 8 + 1] === 0b1011 && (kingSquare % 8 + 1) === (kingSquare + 1) % 8) return true;

        for (let i = 1; i < 8; i++) {
            if ((kingSquare + i * 8 + i) >= 0 && (kingSquare + i * 8 + i) <= 63 && tempstate[kingSquare + i * 8 + i] === 0b1100 && (kingSquare % 8 + i) === (kingSquare + i) % 8) return true;  //check by black bishop
            else if ((kingSquare + i * 8 + i) >= 0 && (kingSquare + i * 8 + i) <= 63 && tempstate[kingSquare + i * 8 + i] === 0b1101 && (kingSquare % 8 + i) === (kingSquare + i) % 8) return true; //check by black queen
            else if ((kingSquare + i * 8 + i) >= 0 && (kingSquare + i * 8 + i) <= 63 && tempstate[kingSquare + i * 8 + i] != 0b1000) break;     //a piece interuppts the diagonal
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare + i * 8 - i) >= 0 && (kingSquare + i * 8 - i) <= 63 && tempstate[kingSquare + i * 8 - i] === 0b1100 && (kingSquare % 8 - i) === (kingSquare - i) % 8) return true;  //check by black bishop
            else if ((kingSquare + i * 8 - i) >= 0 && (kingSquare + i * 8 - i) <= 63 && tempstate[kingSquare + i * 8 - i] === 0b1101 && (kingSquare % 8 - i) === (kingSquare - i) % 8) return true; //check by black queen
            else if ((kingSquare + i * 8 - i) >= 0 && (kingSquare + i * 8 - i) <= 63 && tempstate[kingSquare + i * 8 - i] != 0b0000) break;     //a piece interuppts the diagonal
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare - i * 8 - i) >= 0 && (kingSquare - i * 8 - i) <= 63 && tempstate[kingSquare - i * 8 - i] === 0b1100 && (kingSquare % 8 - i) === (kingSquare - i) % 8) return true;  //check by black bishop
            else if ((kingSquare - i * 8 - i) >= 0 && (kingSquare - i * 8 - i) <= 63 && tempstate[kingSquare - i * 8 - i] === 0b1101 && (kingSquare % 8 - i) === (kingSquare - i) % 8) return true; //check by black queen
            else if ((kingSquare - i * 8 - i) >= 0 && (kingSquare - i * 8 - i) <= 63 && tempstate[kingSquare - i * 8 - i] != 0b0000) break;     //a piece interuppts the diagonal
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare - i * 8 + i) >= 0 && (kingSquare - i * 8 + i) <= 63 && tempstate[kingSquare - i * 8 + i] === 0b1100 && (kingSquare % 8 + i) === (kingSquare + i) % 8) return true;  //check by black bishop
            else if ((kingSquare - i * 8 + i) >= 0 && (kingSquare - i * 8 + i) <= 63 && tempstate[kingSquare - i * 8 + i] === 0b1101 && (kingSquare % 8 + i) === (kingSquare + i) % 8) return true; //check by black queen
            else if ((kingSquare - i * 8 + i) >= 0 && (kingSquare - i * 8 + i) <= 63 && tempstate[kingSquare - i * 8 + i] != 0b0000) break;     //a piece interuppts the diagonal
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare - i * 8) >= 0 && (kingSquare - i * 8) <= 63 && tempstate[kingSquare - i * 8] === 0b1010) return true;  //check by black rook
            else if ((kingSquare - i * 8) >= 0 && (kingSquare - i * 8) <= 63 && tempstate[kingSquare - i * 8] === 0b1101) return true; //check by black queen
            else if ((kingSquare - i * 8) >= 0 && (kingSquare - i * 8) <= 63 && tempstate[kingSquare - i * 8] != 0b0000) break;     //a piece interuppts the row(rank)/column(file)
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare + i * 8) >= 0 && (kingSquare + i * 8) <= 63 && tempstate[kingSquare + i * 8] === 0b1010) return true;  //check by black rook
            else if ((kingSquare + i * 8) >= 0 && (kingSquare + i * 8) <= 63 && tempstate[kingSquare + i * 8] === 0b1101) return true; //check by black queen
            else if ((kingSquare + i * 8) >= 0 && (kingSquare + i * 8) <= 63 && tempstate[kingSquare + i * 8] != 0b0000) break;     //a piece interuppts the row(rank)/column(file)
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare + i) >= 0 && (kingSquare + i) <= 63 && tempstate[kingSquare + i] === 0b1010 && (kingSquare % 8 + i) === (kingSquare + i) % 8) return true;  //check by black rook
            else if ((kingSquare + i) >= 0 && (kingSquare + i) <= 63 && tempstate[kingSquare + i] === 0b1101 && (kingSquare % 8 + i) === (kingSquare + i) % 8) return true; //check by black queen
            else if ((kingSquare + i) >= 0 && (kingSquare + i) <= 63 && tempstate[kingSquare + i] != 0b0000) break;     //a piece interuppts the row(rank)/column(file)
        }

        for (let i = 1; i < 8; i++) {
            if ((kingSquare - i) >= 0 && (kingSquare - i) <= 63 && tempstate[kingSquare - i] === 0b1010 && (kingSquare % 8 - i) === (kingSquare - i) % 8) return true;  //check by black rook
            else if ((kingSquare - i) >= 0 && (kingSquare - i) <= 63 && tempstate[kingSquare - i] === 0b1101 && (kingSquare % 8 - i) === (kingSquare - i) % 8) return true; //check by black queen
            else if ((kingSquare - i) >= 0 && (kingSquare - i) <= 63 && tempstate[kingSquare - i] != 0b0000) break;     //a piece interuppts the row(rank)/column(file)
        }

        if ((kingSquare + 1 * 8) >= 0 && (kingSquare + 1 * 8) <= 63 && tempstate[kingSquare + 1 * 8] === 0b1110) return true;  //check by black king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare - 1 * 8) >= 0 && (kingSquare - 1 * 8) <= 63 && tempstate[kingSquare - 1 * 8] === 0b1110) return true;  //check by black king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare - 1 * 8 + 1) >= 0 && (kingSquare - 1 * 8 + 1) <= 63 && tempstate[kingSquare - 1 * 8 + 1] === 0b1110 && (kingSquare % 8 + 1) === (kingSquare + 1) % 8) return true;  //check by black king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare - 1 * 8 - 1) >= 0 && (kingSquare - 1 * 8 - 1) <= 63 && tempstate[kingSquare - 1 * 8 - 1] === 0b1110 && (kingSquare % 8 - 1) === (kingSquare - 1) % 8) return true;  //check by black king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare + 1 * 8 - 1) >= 0 && (kingSquare + 1 * 8 - 1) <= 63 && tempstate[kingSquare + 1 * 8 - 1] === 0b1110 && (kingSquare % 8 - 1) === (kingSquare - 1) % 8) return true;  //check by black king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare + 1 * 8 + 1) >= 0 && (kingSquare + 1 * 8 + 1) <= 63 && tempstate[kingSquare + 1 * 8 + 1] === 0b1110 && (kingSquare % 8 + 1) === (kingSquare + 1) % 8) return true;  //check by black king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare + 1) >= 0 && (kingSquare + 1) <= 63 && tempstate[kingSquare + 1] === 0b1110 && (kingSquare % 8 + 1) === (kingSquare + 1) % 8) return true;  //check by black king (obv not possible, but it means white king ends up being adjacent to the black king )
        if ((kingSquare - 1) >= 0 && (kingSquare - 1) <= 63 && tempstate[kingSquare - 1] === 0b1110 && (kingSquare % 8 - 1) === (kingSquare - 1) % 8) return true;  //check by black king (obv not possible, but it means white king ends up being adjacent to the black king )

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

function switchTurn() {
    turn = 1 - turn;
    const turnDisplay = document.getElementById('status-display');
    turnDisplay.textContent = `Turn: ${turn === 1 ? 'White' : 'Black'}`;
}


function updateClocks() {
    if (turn === 1) {
        whiteTime--;
        whiteClock.textContent = formatTime(whiteTime);
    }

    else {
        blackTime--;
        blackClock.textContent = formatTime(blackTime);
    }

    if (whiteTime <= 0 || blackTime <= 0) {
        clearInterval(timerInterval);
        endGame();
    }

}

function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startGame() {
    timerInterval = setInterval(updateClocks, 1000);
}


function endGame() {
    // Game over logic here
    let msg;
    clearInterval(timerInterval);           //stagnates the clocks of both colors

    if (checkMate(gamestate)) {
        if (check(gamestate)) {

            if (turn === 0) msg = "White wins by Checkmate!";
            else msg = "Black wins by Checkmate!";

        }
        else {
            msg = "DRAW by Stalemate!";

        }
    }


    else if (whiteTime === 0) msg = "Black wins by Timeout!";
    else msg = "White wins by timeout!";
    displayMessage(msg);
}

function displayMessage(msg) {
    console.log("Displaying message:", msg);
    document.querySelector('.board-panel').classList.add('blur');
    document.querySelector('.left-panel').classList.add('blur');
    document.querySelector('.right-panel').classList.add('blur');

    // Create the message overlay
    const messageOverlay = document.createElement('div');
    messageOverlay.classList.add('message-overlay');

    // Create a paragraph to hold the message
    const messageParagraph = document.createElement('p');
    messageParagraph.textContent = msg;
    messageOverlay.appendChild(messageParagraph);

    // Create the Back to Main Page button
    const backButton = document.createElement('button');
    backButton.textContent = 'Back to HOME Page';
    backButton.id = 'back-to-main';
    backButton.addEventListener('click', () => {
        console.log("back ho jao");
        // window.location.href = 'index.html';
        window.location.href = '/home/';
    });
    messageOverlay.appendChild(backButton);

    document.body.appendChild(messageOverlay); // Append the message overlay to the body

    // messageOverlay.addEventListener('click', () => {
    //     restoreOriginalPage();
    // });

    // console.log("msg displayed");
}

function restoreOriginalPage() {
    document.querySelector('.board-panel').classList.remove('blur');
    document.querySelector('.left-panel').classList.remove('blur');
    document.querySelector('.right-panel').classList.remove('blur');
    const messageOverlay = document.querySelector('.message-overlay');
    if (messageOverlay) {
        messageOverlay.remove();
    }
}

function addMove(move) {
    let startSquare = move & (0b111111);
    let targetSquare = (move & (0b111111000000)) >> 6;
    let piece = gamestate[startSquare] & (0b0111);
    let res = ``;
    switch (piece) {
        case 0b001:     //pawn


            if ((startSquare - 1 * 8 + 1) === targetSquare && gamestate[targetSquare] === 0b0000) res += convert(startSquare % 8) + 'x' + convert(targetSquare % 8) + Math.floor(targetSquare / 8 + 1);   //enpassant capture by a black pawn
            else if ((startSquare - 1 * 8 - 1) === targetSquare && gamestate[targetSquare] === 0b0000) res += convert(startSquare % 8) + 'x' + convert(targetSquare % 8) + Math.floor(targetSquare / 8 + 1);   //enpassant capture by a black pawn
            else if ((startSquare + 1 * 8 - 1) === targetSquare && gamestate[targetSquare] === 0b0000) res += convert(startSquare % 8) + 'x' + convert(targetSquare % 8) + Math.floor(targetSquare / 8 + 1);   //enpassant capture by a white pawn
            else if ((startSquare + 1 * 8 + 1) === targetSquare && gamestate[targetSquare] === 0b0000) res += convert(startSquare % 8) + 'x' + convert(targetSquare % 8) + Math.floor(targetSquare / 8 + 1);   //enpassant capture by a white pawn
            else res += convert(startSquare % 8) + (gamestate[targetSquare] !== 0b0000 ? ('x' + convert(targetSquare % 8)) : '') + Math.floor(targetSquare / 8 + 1);
            break;

        case 0b011:     //knight
            let f = -1;
            let c;
            if ((targetSquare + 1 * 8 + 2) >= 0 && (targetSquare + 1 * 8 + 2) < 64 && gamestate[targetSquare + 1 * 8 + 2] === gamestate[startSquare] && startSquare != (targetSquare + 1 * 8 + 2)) f = targetSquare + 1 * 8 + 2;
            if ((targetSquare + 1 * 8 - 2) >= 0 && (targetSquare + 1 * 8 - 2) < 64 && gamestate[targetSquare + 1 * 8 - 2] === gamestate[startSquare] && startSquare != (targetSquare + 1 * 8 - 2)) f = targetSquare + 1 * 8 - 2;
            if ((targetSquare - 1 * 8 - 2) >= 0 && (targetSquare - 1 * 8 - 2) < 64 && gamestate[targetSquare - 1 * 8 - 2] === gamestate[startSquare] && startSquare != (targetSquare - 1 * 8 - 2)) f = targetSquare - 1 * 8 - 2;
            if ((targetSquare - 1 * 8 + 2) >= 0 && (targetSquare - 1 * 8 + 2) < 64 && gamestate[targetSquare - 1 * 8 + 2] === gamestate[startSquare] && startSquare != (targetSquare - 1 * 8 + 2)) f = targetSquare - 1 * 8 + 2;
            if ((targetSquare - 2 * 8 + 1) >= 0 && (targetSquare - 2 * 8 + 1) < 64 && gamestate[targetSquare - 2 * 8 + 1] === gamestate[startSquare] && startSquare != (targetSquare - 2 * 8 + 1)) f = targetSquare - 2 * 8 + 1;
            if ((targetSquare - 2 * 8 - 1) >= 0 && (targetSquare - 2 * 8 - 1) < 64 && gamestate[targetSquare - 2 * 8 - 1] === gamestate[startSquare] && startSquare != (targetSquare - 2 * 8 - 1)) f = targetSquare - 2 * 8 - 1;
            if ((targetSquare + 2 * 8 - 1) >= 0 && (targetSquare + 2 * 8 - 1) < 64 && gamestate[targetSquare + 2 * 8 - 1] === gamestate[startSquare] && startSquare != (targetSquare + 2 * 8 - 1)) f = targetSquare + 2 * 8 - 1;
            if ((targetSquare + 2 * 8 + 1) >= 0 && (targetSquare + 2 * 8 + 1) < 64 && gamestate[targetSquare + 2 * 8 + 1] === gamestate[startSquare] && startSquare != (targetSquare + 2 * 8 + 1)) f = targetSquare + 2 * 8 + 1;

            if (f != -1) {
                let tmove = createMove(f, targetSquare);
                if (isMoveValid(tmove)) {
                    console.log(f);
                    console.log(Math.floor(f / 8));
                    console.log(Math.floor(startSquare / 8));

                    if ((f % 8) === (startSquare % 8)) c = Math.floor((startSquare / 8) + 1);
                    else c = convert(startSquare % 8);
                }
            }

            res += 'N' + ((c === undefined) ? '' : c) + (gamestate[targetSquare] !== 0b0000 ? 'x' : '') + convert(targetSquare % 8) + Math.floor(targetSquare / 8 + 1);
            break;

        case 0b100:     //bishop
            res += 'B' + (gamestate[targetSquare] !== 0b0000 ? 'x' : '') + convert(targetSquare % 8) + Math.floor(targetSquare / 8 + 1);
            break;

        case 0b010:     //rook

            let f2 = -1;
            let c2;

            for (let i = 1; i < 8; i++) {
                if ((targetSquare + i * 8) >= 0 && (targetSquare + i * 8) < 64 && gamestate[(targetSquare + i * 8)] === gamestate[startSquare] && startSquare != (targetSquare + i * 8)) f2 = (targetSquare + i * 8);
                else if ((targetSquare + i * 8) >= 0 && (targetSquare + i * 8) < 64 && gamestate[(targetSquare + i * 8)] === 0b0000) continue;
                else break;
            }

            for (let i = 1; i < 8; i++) {
                if ((targetSquare - i * 8) >= 0 && (targetSquare - i * 8) < 64 && gamestate[(targetSquare - i * 8)] === gamestate[startSquare] && startSquare != (targetSquare - i * 8)) f2 = (targetSquare - i * 8);
                else if ((targetSquare - i * 8) >= 0 && (targetSquare - i * 8) < 64 && gamestate[(targetSquare - i * 8)] === 0b0000) continue;
                else break;
            }

            for (let i = 1; i < 8; i++) {
                if ((targetSquare - i) >= 0 && (targetSquare - i) < 64 && gamestate[(targetSquare - i)] === gamestate[startSquare] && startSquare != (targetSquare - i)) f2 = (targetSquare - i);
                else if ((targetSquare - i) >= 0 && (targetSquare - i) < 64 && gamestate[(targetSquare - i)] === 0b0000) continue;
                else break;
            }

            for (let i = 1; i < 8; i++) {
                if ((targetSquare + i) >= 0 && (targetSquare + i) < 64 && gamestate[(targetSquare + i)] === gamestate[startSquare] && startSquare != (targetSquare + i)) f2 = (targetSquare + i);
                else if ((targetSquare + i) >= 0 && (targetSquare + i) < 64 && gamestate[(targetSquare + i)] === 0b0000) continue;
                else break;
            }

            if (f2 != -1) {
                let tmove = createMove(f2, targetSquare);
                if (isMoveValid(tmove)) {

                    if ((f2 % 8) === (startSquare % 8)) c2 = Math.floor((startSquare / 8) + 1);
                    else c2 = convert(startSquare % 8);
                }
            }
            res += 'R' + ((c2 === undefined) ? '' : c2) + (gamestate[targetSquare] !== 0b0000 ? 'x' : '') + convert(targetSquare % 8) + Math.floor(targetSquare / 8 + 1);
            break;

        case 0b101:     //QUEEN
            res += 'Q' + (gamestate[targetSquare] !== 0b0000 ? 'x' : '') + convert(targetSquare % 8) + Math.floor(targetSquare / 8 + 1);
            break;

        case 0b110:     //king
            if (startSquare === 3 && targetSquare === 1) res += 'O-O';
            else if (startSquare === 3 && targetSquare === 5) res += 'O-O-O';
            else if (startSquare === 59 && targetSquare === 57) res += 'O-O';
            else if (startSquare === 59 && targetSquare === 61) res += 'O-O-O';
            else res += 'K' + (gamestate[targetSquare] !== 0b0000 ? 'x' : '') + convert(targetSquare % 8) + Math.floor(targetSquare / 8 + 1);
            break;

    }
    let copy = deepCopy(res);

    moveHistory.push(res);
    updateMoveHistory();

}

function convert(num) {
    if (num === 0) return 'h';
    else if (num === 1) return 'g';
    else if (num === 2) return 'f';
    else if (num === 3) return 'e';
    else if (num === 4) return 'd';
    else if (num === 5) return 'c';
    else if (num === 6) return 'b';
    else return 'a';
}

function updateMoveHistory() {
    const moveList = document.getElementById('moves-list');
    moveList.innerHTML = ''; // Clear the existing list

    for (let i = 0; i < moveHistory.length; i += 2) {
        const moveItem = document.createElement('li');
        const moveNumber = Math.floor(i / 2) + 1;
        const whiteMove = moveHistory[i] || '';
        const blackMove = moveHistory[i + 1] || '';

        // Create text nodes with tab spaces
        const moveText = document.createTextNode(`${moveNumber}. `);
        const whiteMoveText = document.createTextNode(whiteMove);
        const tabSpace = document.createTextNode('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'); // Tab space
        const blackMoveText = document.createTextNode(blackMove);

        moveItem.appendChild(moveText);
        moveItem.appendChild(whiteMoveText);
        moveItem.appendChild(tabSpace);
        moveItem.appendChild(blackMoveText);

        moveList.appendChild(moveItem);
    }
    moveList.scrollTop = moveList.scrollHeight;
}

function playMoveSound() {
    var moveSound = document.getElementById("moveSound");
    moveSound.play();
}
function playCaptureSound() {
    var moveSound = document.getElementById("CaptureSound");
    moveSound.play();
}

startGame();

// console.log(formatTime(450));












