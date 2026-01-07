const gameBoard = (function () {
  const board = [[], [], []];

  const checkHorizontalWin = (row, mark) => {
    for(let i = 0; i < 3; i++) {
      if (board[row][i] !== mark) {
        return false;
      }
    }

    return true;
  }

  const checkVerticalWin = (col, mark) => {
    for(let i = 0; i < 3; i++) {
      if (board[i][col] !== mark) {
        return false;
      }
    }

    return true;
  }

  const checkDiagonalWin = (row, col, mark) => {
    row = parseInt(row);
    col = parseInt(col);
    
    if (row === 0) {

      if (col === 0) {

        if (board[row+1][col+1] === mark && board[row+2][col+2] === mark) return true;
        
      } else if (col == 2) {
        if (board[row+1][col-1] === mark && board[row+2][col-2] === mark) return true;
      }

    } else if (row == 1 && col == 1) {
      
      if (board[row-1][col-1] === mark && board[row+1][col+1] === mark) return true;
      if (board[row-1][col+1] === mark && board[row+1][col-1] === mark) return true;

    } else if (row == 2) {

      if (col == 0) {
        if (board[row-1][col+1] === mark && board[row-2][col+2] === mark) return true;
      } else if (col == 2) {
        if (board[row-1][col-1] === mark && board[row-2][col-2] === mark) return true;
      }

    }

    return false;
  }

  const setMark = (row, col, mark, movesMade) => {
    board[row][col] = mark;
  
    return checkHorizontalWin(row, mark) || checkVerticalWin(col, mark) || checkDiagonalWin(row, col, mark); 
  };

  const getMark = (row, col) => {
    return board[row][col];
  }

  const cleanBoard = () => {
    board.forEach(row => row.length = 0);
  }

  return { setMark, getMark, cleanBoard };
})();

function createPlayer(mark, name = '') {

  if (mark != '❌' && mark != '⭕') {
    return null;
  }

  const getMark = () => mark;

  const getName = () => name;

  const setName = (newName) => name = newName;

  return { getMark, getName, setName };
}

const gameController = (function () {
  const xPlayer = createPlayer('❌');
  const oPlayer = createPlayer('⭕');

  let startGameButton = document.getElementById('start-game');
  let restartGameButton = document.getElementById('restart-game');
  const cells = document.querySelectorAll('.cell');

  let gameFinished = false;
  
  let movesMade = 0;
  let currentPlayer = xPlayer;

  const togglePlayer = () => {
    if (currentPlayer == xPlayer) {
      currentPlayer = oPlayer;
    } else {
      currentPlayer = xPlayer;
    }
  }

  startGameButton.addEventListener('click', (e) => {
    play();
    e.target.disabled = true;
    restartGameButton.disabled = false;
  });

  restartGameButton.addEventListener('click', (e) => {
    restart();
    e.target.disabled = true;
    startGameButton.disabled = true;
  })

  const showMessage = (game_state) => {
    let message
    if (!game_state) {
      message = `Current player: ${currentPlayer.getMark()}`
    } else if (game_state == 'tie') {
      message = "It's a tie."
    } else {
      togglePlayer();
      message = `Player ${currentPlayer.getMark()} wins!`
    }
    
    let messagePlaceholder = document.getElementById('message');
    messagePlaceholder.innerHTML = message;
  }

  const setup = () => {

    let gameButtons = document.getElementById('game-buttons');
    let xPlayerNameSetterButton = document.getElementById('set-x-name');
    let oPlayerNameSetterButton = document.getElementById('set-o-name');
    
    let playerXInput = document.getElementById('player-x-input');
    let playerOInput = document.getElementById('player-o-input');

    playerXInput.addEventListener('input', (e) => {
      
      if(e.target.value.length > 0) {
        xPlayerNameSetterButton.disabled = false;
      } else {
        xPlayerNameSetterButton.disabled = true;
      }

    });

    playerOInput.addEventListener('input', (e) => {
      
      if (e.target.value.length > 0) {
        oPlayerNameSetterButton.disabled = false;
      } else {
        oPlayerNameSetterButton.disabled = true;
      }

    });

    gameButtons.style.display = 'none';

    xPlayerNameSetterButton.addEventListener('click', (e) => {
      xPlayer.setName(playerXInput.value);
      e.target.style.display = 'none';
      playerXInput.value = '';
      playerXInput.style.display = 'none';
      
      document.getElementById('player-x-container').innerHTML = `<h3>${xPlayer.getName()} (${xPlayer.getMark()})</h3>`;

      if (oPlayer.getName() && xPlayer.getName()) {
        gameButtons.style.display = 'block';
        startGameButton.disabled = false;
      }
    });

    oPlayerNameSetterButton.addEventListener('click', (e) => {
      oPlayer.setName(playerOInput.value);
      e.target.style.display = 'none';
      playerOInput.value = '';
      playerOInput.style.display = 'none';
      
      document.getElementById('player-o-container').innerHTML = `<h3>${oPlayer.getName()} (${oPlayer.getMark()})</h3>`;

      if (oPlayer.getName() && xPlayer.getName()) {
        gameButtons.style.display = 'block';
        startGameButton.disabled = false;
      }
    });
  }

  const setMarkHandler = (e) => {

    if (restartGameButton.disabled) {
      restartGameButton.disabled = false;
    }

    movesMade++;
    
    gameFinished = gameBoard.setMark(e.target.dataset.row, e.target.dataset.col, currentPlayer.getMark(), movesMade);
    e.target.innerHTML = `<span>${gameBoard.getMark(e.target.dataset.row, e.target.dataset.col)}</span>`;

    if (gameFinished) {
      restartGameButton.disabled = false;
      cells.forEach(cell => {
        cell.removeEventListener('click', setMarkHandler);
      })
    } else if (!gameFinished && movesMade == 9) {
      gameFinished = "tie"
      restartGameButton.disabled = false;
    }
    
    togglePlayer();
    showMessage(gameFinished);
    
    e.target.removeEventListener('click', setMarkHandler);
  }

  const play = () => {
    showMessage(gameFinished);
    
    cells.forEach(cell => {
      cell.addEventListener('click', setMarkHandler);
    });
  }

  const restart = () => {
    gameBoard.cleanBoard();
    cells.forEach(cell => {
      cell.innerHTML = '';
      cell.removeEventListener('click', setMarkHandler);
    })

    currentPlayer = xPlayer;
    movesMade = 0;
    gameFinished = false;
    play();
  }

  return { setup }
})();

gameController.setup();