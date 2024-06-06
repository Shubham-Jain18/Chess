document.addEventListener('DOMContentLoaded', () => {
  const chessBoard = document.getElementById('chess-board');
  const boardSize = 8;
  let selectedPiece = null;
  const moveList = document.getElementById('moves-list');

  const none = 0b0000;
  const pawn = 0b0001;
  const rook = 0b0010;
  const knight = 0b0011;
  const bishop = 0b0100;
  const queen = 0b0101;
  const king = 0b0110;

  const white = 0b1000;
  const black = 0b0000;

  const pieceImages = {
    [rook | black]: 'media/Chess_rdt60.png',
    [knight | black]: 'media/Chess_ndt60.png',
    [bishop | black]: 'media/Chess_bdt60.png',
    [queen | black]: 'media/Chess_qdt60.png',
    [king | black]: 'media/Chess_kdt60.png',
    [pawn | black]: 'media/Chess_pdt60.png',
    [rook | white]: 'media/Chess_rlt60.png',
    [knight | white]: 'media/Chess_nlt60.png',
    [bishop | white]: 'media/Chess_blt60.png',
    [queen | white]: 'media/Chess_qlt60.png',
    [king | white]: 'media/Chess_klt60.png',
    [pawn | white]: 'media/Chess_plt60.png'
  };

  function initializeBoard() {
    chessBoard.innerHTML = '';
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        const square = document.createElement('div');
        square.classList.add('square');
        square.classList.add((row + col) % 2 === 0 ? 'white-square' : 'black-square');
        square.dataset.row = row;
        square.dataset.col = col;

        const pieceCode = gamestate[boardSize * boardSize - 1 - row * boardSize - col];
        if (pieceCode !== none) {
          const piece = document.createElement('img');
          piece.src = pieceImages[pieceCode];
          piece.classList.add('piece');
          piece.dataset.piece = pieceCode;
          piece.dataset.row = row;
          piece.dataset.col = col;
          square.appendChild(piece);
        }

        square.addEventListener('click', handleSquareClick);
        chessBoard.appendChild(square);
      }
    }
  }

  function handleSquareClick(event) {
    const clickedSquare = event.currentTarget;
    const clickedPiece = clickedSquare.querySelector('.piece');

    if (selectedPiece) {
      const startRow = parseInt(selectedPiece.dataset.row);
      const startCol = parseInt(selectedPiece.dataset.col);
      const targetRow = parseInt(clickedSquare.dataset.row);
      const targetCol = parseInt(clickedSquare.dataset.col);

      const startSquare = boardSize * boardSize - 1 - startRow * boardSize - startCol;
      const targetSquare = boardSize * boardSize - 1 - targetRow * boardSize - targetCol;

      const move = createMove(startSquare, targetSquare);
      makeMove(move);
      updateBoard();
      selectedPiece = null;
    }

    else if (clickedPiece) {
      const pieceCode = parseInt(clickedPiece.dataset.piece);
      const pieceColor = pieceCode & 0b1000;

      if ((turn === 1 && pieceColor === white) || (turn === 0 && pieceColor === black)) {
        selectedPiece = clickedPiece;
      }
    }
  }



  function undoMove() {

    if (gameStateHistory.length > 1) {
      gameStateHistory.pop();
      let takes = gameStateHistory[gameStateHistory.length - 1];
      gamestate = deepCopy(takes);
      updateBoard();

      for (let i = 0; i < moveHistory.length; i++) {
        console.log(moveHistory[i]);
      }
      console.log("this is happening ");
      moveHistory.pop();
      console.log("this is happening ");
      updateMoveHistory();
      console.log("this is happening ");

      switchTurn();
    }
  }

  document.getElementById('undo-button').addEventListener('click', undoMove);

  function updateBoard() {
    initializeBoard();
    // for (let i = 0; i < gameStateHistory.length; i++) {
    //   console.log(gameStateHistory[i]);
    // }
    // console.log("---------------------------------------");
  }


  initializeBoard();
  startGame();
});
