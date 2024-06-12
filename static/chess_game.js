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
      if (check(gamestate)) {       //to highlight the king in danger in check
        const squares = document.querySelectorAll('.square');
        squares.forEach((square, i) => {
          if (gamestate[63 - i] === ((turn << 3) | (0b0110))) {
            square.classList.add('highlight-check');
          }
        });
      }
      selectedPiece = null;
    }

    else if (clickedPiece) {
      const pieceCode = parseInt(clickedPiece.dataset.piece);
      const pieceColor = pieceCode & 0b1000;

      if ((turn === 1 && pieceColor === white) || (turn === 0 && pieceColor === black)) {
        selectedPiece = clickedPiece;
        const startRow = parseInt(selectedPiece.dataset.row);
        const startCol = parseInt(selectedPiece.dataset.col);
        const startSquare = boardSize * boardSize - 1 - startRow * boardSize - startCol;

        highlight(startSquare);     //highlighting all possible moves
      }
    }
  }

  function highlight(startSquare) {
    const squares = document.querySelectorAll('.square');
    squares.forEach((square, i) => {
      let tpmove = createMove(startSquare, 63 - i);
      if (isMoveValid(tpmove)) {
        square.classList.add('highlight');
      }
    });
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
    selectedPiece = null;
  }

  document.getElementById('undo-button').addEventListener('click', undoMove);

  function updateBoard() {
    initializeBoard();
  }


  initializeBoard();
  // Add the following for the resign functionality
  document.getElementById('resign-button').addEventListener('click', () => {
    const resignMessage = document.getElementById('resign-message');
    const modal = document.getElementById('resign-modal');
    modal.classList.remove('d-none');
    document.querySelector('.board-panel').classList.add('blur');
    document.querySelector('.left-panel').classList.add('blur');
    document.querySelector('.right-panel').classList.add('blur');
    const winner = turn === 1 ? 'Black' : 'White'; // Assuming turn 1 is White and 0 is Black

    resignMessage.textContent = `${winner} wins!`;
    modal.style.display = 'flex'; // Show the modal
  });

  // Get the modal and the back-to-main button
  const modal = document.getElementById('resign-modal');
  const backToMain = document.getElementById('back-to-main');

  // When the user clicks on the back-to-main button, redirect to main page
  backToMain.onclick = function() {
    window.location.href = '/home/';
  }




});

