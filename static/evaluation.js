function evaluate(position) {            //a gamestate will be passed as position
    let whiteAdvantage = 0;
    let blackAdvantage = 0;
    let movemag = 0.5;                     //advantage per possible move
    let pawnprogress = 0.5;
    let knightactivity = 0.4;               //how close to the centre knight is 
    let kingsafety = 0.5                      //how much guarded the king is 
    let kingactivity = 0.4;
    let threatpoints = 0.05;

    let whiteKingSquare;
    let blackKingSquare;

    if (checkMate(position)) {

        if (check(position)) {
            if (turn == 0) return -100;
            else return 100;
        }

        else return 0;
    }


    for (let i = 0; i < 64; i++) {
        let x = position[i];

        if (x & (0b1000)) whiteAdvantage += points(x & 0b0111);        //total strength of the pieces on the boards
        else blackAdvantage += points(x & (0b0111));

        for (let j = 0; j < 64; j++) {
            let thismove = createMove(i, j);
            if (isMoveValid(thismove)) {            //total number of moves white can play
                if (turn) whiteAdvantage += movemag * Math.floor((points(x & (0b0111)) / 100));
                else blackAdvantage += movemag * Math.floor((points(x & (0b0111)) / 100));

                if (position[j] && turn == 1) whiteAdvantage += points(position[j] & (0b0111)) * threatpoints;        //total threats on the board 
                else if (position[j] && turn == 0) blackAdvantage += points(position[j] & 0b0111) * threatpoints;
            }
            turn = 1 - turn;                        //momentarily toggle the turn to count black's moves

            if (isMoveValid(thismove)) {
                if (turn) whiteAdvantage += movemag * Math.floor((points(x & (0b0111)) / 100));
                else blackAdvantage += movemag * Math.floor((points(x & (0b0111)) / 100));
            }

            turn = 1 - turn;                                        //restore the original turn
        }

        if (x === (0b1001)) whiteAdvantage += (Math.floor(i / 8)) * (pawnprogress);          //how much progress the pawn has made on its way to promotion
        else if (x === 0b0001) blackAdvantage += (7 - (Math.floor(i / 8))) * (pawnprogress);

        else if (x === (0b1011)) whiteAdvantage += (100 - Math.floor(Math.abs(31.5 - i))) * knightactivity;         //how much close to the centre white knight is 
        else if (x === (0b0011)) blackAdvantage += (100 - Math.floor(Math.abs(31.5 - i))) * knightactivity;         //how much close to the centre black knight is 

        else if (x === 0b1110) whiteKingSquare = i;
        else if (x === 0b0110) blackKingSquare = i;

    }

    if (whiteAdvantage > 150) {            //middle game is going on for white, so king should be safe, surrounded by pieces
        let temp = 0;
        if ((whiteKingSquare + 1) >= 0 && (whiteKingSquare + 1) < 64 && (whiteKingSquare + 1) % 8 === ((whiteKingSquare % 8) + 1) && position[whiteKingSquare + 1] & (0b1000)) temp++;
        if ((whiteKingSquare - 1) >= 0 && (whiteKingSquare - 1) < 64 && (whiteKingSquare - 1) % 8 === ((whiteKingSquare % 8) - 1) && position[whiteKingSquare - 1] & (0b1000)) temp++;
        if ((whiteKingSquare - 1 + 8) >= 0 && (whiteKingSquare - 1 + 8) < 64 && (whiteKingSquare - 1) % 8 === ((whiteKingSquare % 8) - 1) && position[whiteKingSquare - 1 + 8] & (0b1000)) temp++;
        if ((whiteKingSquare - 1 - 8) >= 0 && (whiteKingSquare - 1 - 8) < 64 && (whiteKingSquare - 1) % 8 === ((whiteKingSquare % 8) - 1) && position[whiteKingSquare - 1 - 8] & (0b1000)) temp++;
        if ((whiteKingSquare + 1 - 8) >= 0 && (whiteKingSquare + 1 - 8) < 64 && (whiteKingSquare + 1) % 8 === ((whiteKingSquare % 8) + 1) && position[whiteKingSquare + 1 - 8] & (0b1000)) temp++;
        if ((whiteKingSquare + 1 + 8) >= 0 && (whiteKingSquare + 1 + 8) < 64 && (whiteKingSquare + 1) % 8 === ((whiteKingSquare % 8) + 1) && position[whiteKingSquare + 1 + 8] & (0b1000)) temp++;
        if ((whiteKingSquare + 8) >= 0 && (whiteKingSquare + 8) < 64 && position[whiteKingSquare + 8] & (0b1000)) temp++;
        if ((whiteKingSquare - 8) >= 0 && (whiteKingSquare - 8) < 64 && position[whiteKingSquare - 8] & (0b1000)) temp++;
        if (whiteKingSquare % 8 === 0) temp += 3;
        if (whiteKingSquare % 8 === 7) temp += 3;
        if (Math.floor(whiteKingSquare / 8) === 0) temp += 3;


        whiteAdvantage += temp * kingsafety;

    }

    else {                              //endgame is going on for white, so king should be close active  
        whiteAdvantage += (100 - Math.floor(Math.abs(31.5 - whiteKingSquare))) * kingactivity;
    }


    if (blackAdvantage > 150) {
        let temp = 0;
        if ((blackKingSquare + 1) >= 0 && (blackKingSquare + 1) < 64 && (blackKingSquare + 1) % 8 === ((blackKingSquare % 8) + 1) && !(position[blackKingSquare + 1] & (0b1000)) && position[blackKingSquare + 1]) temp++;
        if ((blackKingSquare - 1) >= 0 && (blackKingSquare - 1) < 64 && (blackKingSquare - 1) % 8 === ((blackKingSquare % 8) - 1) && !(position[blackKingSquare - 1] & (0b1000)) && position[blackKingSquare - 1]) temp++;
        if ((blackKingSquare - 1 + 8) >= 0 && (blackKingSquare - 1 + 8) < 64 && (blackKingSquare - 1) % 8 === ((blackKingSquare % 8) - 1) && !(position[blackKingSquare - 1 + 8] & (0b1000)) && position[blackKingSquare - 1 + 8]) temp++;
        if ((blackKingSquare - 1 - 8) >= 0 && (blackKingSquare - 1 - 8) < 64 && (blackKingSquare - 1) % 8 === ((blackKingSquare % 8) - 1) && !(position[blackKingSquare - 1 - 8] & (0b1000)) && position[blackKingSquare - 1 - 8]) temp++;
        if ((blackKingSquare + 1 - 8) >= 0 && (blackKingSquare + 1 - 8) < 64 && (blackKingSquare + 1) % 8 === ((blackKingSquare % 8) + 1) && !(position[blackKingSquare + 1 - 8] & (0b1000)) && position[blackKingSquare + 1 - 8]) temp++;
        if ((blackKingSquare + 1 + 8) >= 0 && (blackKingSquare + 1 + 8) < 64 && (blackKingSquare + 1) % 8 === ((blackKingSquare % 8) + 1) && !(position[blackKingSquare + 1 + 8] & (0b1000)) && position[blackKingSquare + 1 + 8]) temp++;
        if ((blackKingSquare + 8) >= 0 && (blackKingSquare + 8) < 64 && !(position[blackKingSquare + 8] & (0b1000)) && position[blackKingSquare + 8]) temp++;
        if ((blackKingSquare - 8) >= 0 && (blackKingSquare - 8) < 64 && !(position[blackKingSquare - 8] & (0b1000)) && position[blackKingSquare - 8]) temp++;
        if (blackKingSquare % 8 === 0) temp += 3;
        if (blackKingSquare % 8 === 7) temp += 3;
        if (Math.floor(blackKingSquare / 8) === 7) temp += 3;

        blackAdvantage += temp * kingsafety;
        // console.log(temp);
    }

    else {                              //endgame is going on for black, so king should be close active  
        blackAdvantage += (100 - Math.floor(Math.abs(31.5 - blackKingSquare))) * kingactivity;
    }


    return (whiteAdvantage - blackAdvantage) / 10;
}

// function findTheBestMove(position, depth) {
//     console.log("current depth is: ", depth, " and current turn is: ", turn);
//     let bestmove;
//     let wa;



//     if (turn == 1) {
//         wa = Number.NEGATIVE_INFINITY; // Assuming the initial advantage for white, and now we want to increase it 
//         for (let i = 0; i < 64; i++) {
//             for (let j = 0; j < 64; j++) {
//                 let tempmove = createMove(i, j);
//                 if (isMoveValid(tempmove)) {
//                     let tempstate = deepCopy(position);
//                     tempstate = makeTempMove(tempmove, tempstate);
//                     turn = 1 - turn;
//                     let ev;
//                     if (depth == 1) {
//                         ev = evaluate(tempstate);
//                         console.log("The next pos evalutes to ", ev, " if white will play ", getMove(tempmove));
//                     }
//                     else {
//                         console.log("------------------------------------------");
//                         console.log("The move by white being analysed is ", getMove(tempmove));

//                         ev = findTheBestMove(tempstate, depth - 1).first;
//                         nb = findTheBestMove(tempstate, depth - 1).second;

//                         console.log("best eval found is ", ev, " when white plays ", getMove(tempmove), " and the next best move to be played by black is ", getMove(nb));
//                     }

//                     if (ev > wa) {
//                         wa = ev;
//                         bestmove = tempmove;
//                     }
//                     turn = 1 - turn;
//                 }
//             }
//         }
//     } else {

//         wa = Number.POSITIVE_INFINITY; // Assuming the initial advantage for white, and now we want to increase it 
//         for (let i = 0; i < 64; i++) {
//             for (let j = 0; j < 64; j++) {
//                 let tempmove = createMove(i, j);
//                 if (isMoveValid(tempmove)) {
//                     let tempstate = deepCopy(position);
//                     tempstate = makeTempMove(tempmove, tempstate);
//                     turn = 1 - turn;
//                     if (depth == 1) {
//                         ev = evaluate(tempstate);
//                         console.log("The next pos evalutes to ", ev, " if black will play ", getMove(tempmove));
//                     }
//                     else {
//                         console.log("------------------------------------------");

//                         console.log("The move by black being analysed is ", getMove(tempmove));
//                         ev = findTheBestMove(tempstate, depth - 1).first;
//                         nb = findTheBestMove(tempstate, depth - 1).second;

//                         console.log("best eval found is ", ev, " when black plays ", getMove(tempmove), " and the next best move to be played by white is ", nb);
//                     }
//                     if (ev < wa) {
//                         wa = ev;
//                         bestmove = tempmove;
//                     }
//                     turn = 1 - turn;
//                 }
//             }
//         }

//     }

//     return { first: wa, second: bestmove };
// }

// function evaluate(position) {
//     let whiteAdvantage = 0;
//     let blackAdvantage = 0;

//     // Adjusted weights
//     const moveMag = 0.1;           // Reduced to prevent overvaluing mobility
//     const pawnProgress = 1.0;      // Increased to reflect the importance of pawn structure
//     const knightActivity = 0.3;    // Adjusted for more accurate knight evaluation
//     const kingSafety = 0.5;        // Kept the same, critical for mid-game
//     const kingActivity = 0.3;      // Reduced to balance its effect
//     const threatPoints = 0.2;      // Increased to better reflect the importance of threats

//     let whiteKingSquare;
//     let blackKingSquare;

//     // Check for checkmate or stalemate
//     if (checkMate(position)) {
//         if (check(position)) {
//             return turn == 0 ? -1000 : 1000;  // High values to reflect the game-ending condition
//         } else {
//             return 0;  // Stalemate
//         }
//     }

//     for (let i = 0; i < 64; i++) {
//         let piece = position[i];

//         // Piece strength evaluation
//         if (piece & 0b1000) {
//             whiteAdvantage += points(piece & 0b0111);
//         } else {
//             blackAdvantage += points(piece & 0b0111);
//         }

//         // Mobility and threats
//         for (let j = 0; j < 64; j++) {
//             let thisMove = createMove(i, j);
//             if (isMoveValid(thisMove)) {
//                 if (piece & 0b1000) {
//                     whiteAdvantage += moveMag * points(piece & 0b0111);
//                     if (position[j] && !(position[j] & 0b1000)) {
//                         whiteAdvantage += points(position[j] & 0b0111) * threatPoints;
//                     }
//                 } else {
//                     blackAdvantage += moveMag * points(piece & 0b0111);
//                     if (position[j] && (position[j] & 0b1000)) {
//                         blackAdvantage += points(position[j] & 0b0111) * threatPoints;
//                     }
//                 }
//             }
//         }

//         // Pawn progress
//         if (piece === 0b1001) {
//             whiteAdvantage += Math.floor(i / 8) * pawnProgress;
//         } else if (piece === 0b0001) {
//             blackAdvantage += (7 - Math.floor(i / 8)) * pawnProgress;
//         }

//         // Knight activity
//         if (piece === 0b1011) {
//             whiteAdvantage += (100 - Math.floor(Math.abs(31.5 - i))) * knightActivity;
//         } else if (piece === 0b0011) {
//             blackAdvantage += (100 - Math.floor(Math.abs(31.5 - i))) * knightActivity;
//         }

//         // King positions
//         if (piece === 0b1110) {
//             whiteKingSquare = i;
//         } else if (piece === 0b0110) {
//             blackKingSquare = i;
//         }
//     }

//     // King safety and activity evaluation
//     const kingSafetyBonus = (kingSquare, color) => {
//         let temp = 0;
//         const adjacentSquares = [
//             kingSquare + 1, kingSquare - 1,
//             kingSquare + 8, kingSquare - 8,
//             kingSquare + 9, kingSquare - 9,
//             kingSquare + 7, kingSquare - 7
//         ];
//         adjacentSquares.forEach(square => {
//             if (square >= 0 && square < 64 && Math.abs((square % 8) - (kingSquare % 8)) <= 1) {
//                 if ((color === 'white' && position[square] & 0b1000) || (color === 'black' && !(position[square] & 0b1000))) {
//                     temp++;
//                 }
//             }
//         });

//         if (kingSquare % 8 === 0 || kingSquare % 8 === 7) {
//             temp += 3;  // King is on the edge
//         }
//         if (Math.floor(kingSquare / 8) === 0 || Math.floor(kingSquare / 8) === 7) {
//             temp += 3;  // King is on the top or bottom edge
//         }

//         return temp * kingSafety;
//     };

//     if (whiteAdvantage > 150) {
//         whiteAdvantage += kingSafetyBonus(whiteKingSquare, 'white');
//     } else {
//         whiteAdvantage += (100 - Math.floor(Math.abs(31.5 - whiteKingSquare))) * kingActivity;
//     }

//     if (blackAdvantage > 150) {
//         blackAdvantage += kingSafetyBonus(blackKingSquare, 'black');
//     } else {
//         blackAdvantage += (100 - Math.floor(Math.abs(31.5 - blackKingSquare))) * kingActivity;
//     }

//     return (whiteAdvantage - blackAdvantage) / 10;
// }




function findTheBestMove(position, depth, alpha = Number.NEGATIVE_INFINITY, beta = Number.POSITIVE_INFINITY) {
    // console.log("current depth is: ", depth, " and current turn is: ", turn);
    let bestMove;
    let wa;

    if (turn == 1) {
        wa = Number.NEGATIVE_INFINITY;
        for (let i = 0; i < 64; i++) {
            for (let j = 0; j < 64; j++) {
                let tempMove = createMove(i, j);
                if (isMoveValid(tempMove)) {
                    let tempState = deepCopy(position);
                    tempState = makeTempMove(tempMove, tempState);
                    turn = 1 - turn;
                    let ev;
                    if (depth == 1) {
                        ev = evaluate(tempState);
                        // console.log("The next position evaluates to ", ev, " if white plays ", getMove(tempMove));
                    } else {
                        // console.log("------------------------------------------");
                        // console.log("The move by white being analyzed is ", getMove(tempMove));

                        let result = findTheBestMove(tempState, depth - 1, alpha, beta);
                        ev = result.first;
                        let nb = result.second;

                        // console.log("best eval found is ", ev, " when white plays ", getMove(tempMove), " and the next best move to be played by black is ", getMove(nb));
                    }

                    if (ev > wa) {
                        wa = ev;
                        bestMove = tempMove;
                    }
                    alpha = Math.max(alpha, ev);
                    turn = 1 - turn;

                    if (beta <= alpha) {
                        break; // Beta cut-off
                    }
                }
            }
        }
    } else {
        wa = Number.POSITIVE_INFINITY;
        for (let i = 0; i < 64; i++) {
            for (let j = 0; j < 64; j++) {
                let tempMove = createMove(i, j);
                if (isMoveValid(tempMove)) {
                    let tempState = deepCopy(position);
                    tempState = makeTempMove(tempMove, tempState);
                    turn = 1 - turn;
                    let ev;
                    if (depth == 1) {
                        ev = evaluate(tempState);
                        // console.log("The next position evaluates to ", ev, " if black plays ", getMove(tempMove));
                    } else {
                        // console.log("------------------------------------------");
                        // console.log("The move by black being analyzed is ", getMove(tempMove));

                        let result = findTheBestMove(tempState, depth - 1, alpha, beta);
                        ev = result.first;
                        let nb = result.second;

                        // console.log("best eval found is ", ev, " when black plays ", getMove(tempMove), " and the next best move to be played by white is ", getMove(nb));
                    }

                    if (ev < wa) {
                        wa = ev;
                        bestMove = tempMove;
                    }
                    beta = Math.min(beta, ev);
                    turn = 1 - turn;

                    if (beta <= alpha) {
                        break; // Alpha cut-off
                    }
                }
            }
        }
    }

    return { first: wa, second: bestMove };
}






function points(piece) {
    if (piece == 0b001) return 10;          // pawn
    else if (piece == 0b011) return 30;     // knight
    else if (piece == 0b100) return 30;     // bishop
    else if (piece == 0b010) return 50;     // rook
    else if (piece == 0b101) return 90;     // queen 
    else return 0;
}

function startSquareTeller(move) {
    return move & (0b111111);
}

function targetSquareTeller(move) {
    return (move & (0b111111000000)) >> 6;
}

// let mymove = createMove(8, 24);
// let tempstate = deepCopy(gamestate);
// tempstate = makeTempMove(tempmove, tempstate);
// console.log(evaluate(tempstate));