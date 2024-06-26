const mainDiv = document.getElementById('main')
const grid = document.getElementById('grid')

const pauseBtn = document.getElementById('pauseBtn')
const minesCountText = document.getElementById('minesCount')

// disable right click box
document.addEventListener('contextmenu', event => event.preventDefault())

let gridWidth = 12
let gridHeight = 12

let nMines
let totalMines
let nMinesDiscovered

let stopped
let paused
let firstClick

let squares
let mines

let moveStack = [];

const MOUSE_BUTTONS = {
  LEFT: 0,
  RIGHT: 2
}

const FLAG_TYPES = {
  OK: 1,
  DOUBT: 2
}

class Square {
  constructor({ }) {
    this.mine = false
    this.discovered = false
    this.adjacentMines = 0
    this.flagType = undefined
  }
}

let seconds
let minutes
let hours

let interval

const appendSeconds = document.getElementById('seconds')
const appendMinutes = document.getElementById('minutes')
const appendHours = document.getElementById('hours')

const setInitialVariables = () => {
  stopped = false
  paused = false
  firstClick = true

  seconds = 0
  minutes = 0
  hours = 0

  nMines = 0
  nMinesDiscovered = 0

  pauseBtn.innerHTML = 'Pause'
  grid.style.visibility = 'visible'

  squares = []
  mines = [[]]

  totalMines = 2 * Math.floor(Math.sqrt(gridHeight * gridWidth))
  grid.innerHTML = ''
  grid.style["grid-template-columns"] = "auto ".repeat(gridWidth)
}

const populateGrid = () => {
  for (let i = 0; i < gridHeight; i++) {
    mines[i] = []
    for (let j = 0; j < gridWidth; j++) {
      mines[i].push(new Square({}))
      const square = document.createElement('div')
      square.className = 'square'
      square.addEventListener('mousedown', (event) => {
        switch (event.button) {
          case MOUSE_BUTTONS.LEFT:
            checkMine(i, j)
            break;
          case MOUSE_BUTTONS.RIGHT:
            putFlag(i, j)

          default:
            break;
        }
      })
      squares.push(square)
      grid.appendChild(square)
    }
  }
}

const setMines = () => {
  let minesToPopulate = totalMines
  while (minesToPopulate > 0) {
    let i = Math.floor(Math.random() * gridHeight)
    let j = Math.floor(Math.random() * gridWidth)

    if (!mines[i][j].mine) {
      mines[i][j].mine = true
      minesToPopulate--
    }
  }
}

const setAdjancentMines = () => {
  for (let i = 0; i < mines.length; i++) {
    for (let j = 0; j < mines[i].length; j++) {
      if (!mines[i][j].mine) {
        let n = 0
        if ((i - 1 >= 0) && (j - 1 >= 0) && mines[i - 1][j - 1].mine) {
          n++
        }
        if ((i - 1 >= 0) && mines[i - 1][j].mine) {
          n++
        }
        if ((i - 1 >= 0) && (j + 1 < mines[i].length) && mines[i - 1][j + 1].mine) {
          n++
        }
        if ((j - 1 >= 0) && mines[i][j - 1].mine) {
          n++
        }
        if ((j + 1 < mines[i].length) && mines[i][j + 1].mine) {
          n++
        }
        if ((i + 1 < mines.length) && (j - 1 >= 0) && mines[i + 1][j - 1].mine) {
          n++
        }
        if ((i + 1) < mines.length && mines[i + 1][j].mine) {
          n++
        }
        if ((i + 1 < mines.length) && (j + 1 < mines[i].length) && mines[i + 1][j + 1].mine) {
          n++
        }
        mines[i][j].adjacentMines = n
      }
    }
  }
}

const checkMine = (i, j) => {
  if (stopped) return;
  if (firstClick) {
    firstClick = false;
    startTimer();
  }
  if (mines[i][j].flagType === FLAG_TYPES.OK) {
    return;
  }
  moveStack.push({type: 'discover', i, j, previous: {...mines[i][j]}});
  if (mines[i][j].mine) {
    blow();
    stopped = true;
  } else {
    floodFill(i, j);
  }
};

const floodFill = (i, j) => {
  if (mines[i][j].discovered || mines[i][j].mine) {
    return
  } else {
    mines[i][j].discovered = true
    squares[i * gridWidth + j].style.background = "#c8def1"
    nMinesDiscovered++
    if (nMinesDiscovered === gridWidth * gridHeight - totalMines) {
      alert("You won the game!! Press New Game to play again!")
      stopped = true
    }
    if (mines[i][j].adjacentMines != 0) {
      squares[i * gridWidth + j].innerText = mines[i][j].adjacentMines
      return
    }
  }
  if ((i - 1 >= 0) && (j - 1 >= 0)) {
    floodFill(i - 1, j - 1)
  }
  if (i - 1 >= 0) {
    floodFill(i - 1, j)
  }
  if ((i - 1 >= 0) && (j + 1 < mines[i].length)) {
    floodFill(i - 1, j + 1)
  }
  if (j - 1 >= 0) {
    floodFill(i, j - 1)
  }
  if (j + 1 < mines[i].length) {
    floodFill(i, j + 1)
  }
  if ((i + 1 < mines.length) && (j - 1 >= 0)) {
    floodFill(i + 1, j - 1)
  }
  if ((i + 1 < mines.length)) {
    floodFill(i + 1, j)
  }
  if ((i + 1 < mines.length) && (j + 1 < mines[i].length)) {
    floodFill(i + 1, j + 1)
  }
  return
}


const blow = () => {
  for (let i = 0; i < mines.length; i++) {
    for (let j = 0; j < mines[i].length; j++) {
      if (mines[i][j].mine) {
        const bombImg = document.createElement('img')
        bombImg.src = './src/bomb.png'
        squares[i * gridWidth + j].innerHTML = ''
        squares[i * gridWidth + j].appendChild(bombImg)
      }
    }
  }
}

const putFlag = (i, j) => {
  moveStack.push({type: 'flag', i, j, previous: {...mines[i][j]}});
  if (!mines[i][j].flagType) {
    const flagImg = document.createElement('img');
    flagImg.src = './src/flag_ok.png';
    squares[i * gridWidth + j].appendChild(flagImg);
    nMines++;
    minesCountText.innerText = `${nMines}/${totalMines}`;
    mines[i][j].flagType = FLAG_TYPES.OK;
  } else if (mines[i][j].flagType === FLAG_TYPES.OK) {
    const flagDoubtImg = document.createElement('img');
    flagDoubtImg.src = './src/flag_doubt.png';
    squares[i * gridWidth + j].innerHTML = '';
    squares[i * gridWidth + j].appendChild(flagDoubtImg);
    nMines--;
    minesCountText.innerText = `${nMines}/${totalMines}`;
    mines[i][j].flagType = FLAG_TYPES.DOUBT;
  } else if (mines[i][j].flagType === FLAG_TYPES.DOUBT) {
    squares[i * gridWidth + j].innerHTML = '';
    mines[i][j].flagType = undefined;
  }
};

const undo = () => {
  if (moveStack.length === 0) return;

  const lastMove = moveStack.pop();

  if (lastMove.type === 'discover') {
    mines[lastMove.i][lastMove.j] = lastMove.previous;
    squares[lastMove.i * gridWidth + lastMove.j].style.background = "#a2d2ff";
    squares[lastMove.i * gridWidth + lastMove.j].innerText = '';
    nMinesDiscovered--;
  } else if (lastMove.type === 'flag') {
    mines[lastMove.i][lastMove.j] = lastMove.previous;
    squares[lastMove.i * gridWidth + lastMove.j].innerHTML = '';
    nMines--;
    minesCountText.innerText = `${nMines}/${totalMines}`;
    if (lastMove.previous.flagType === FLAG_TYPES.OK) {
      const flagImg = document.createElement('img');
      flagImg.src = './src/flag_ok.png';
      squares[lastMove.i * gridWidth + lastMove.j].appendChild(flagImg);
      nMines++;
      minesCountText.innerText = `${nMines}/${totalMines}`;
    } else if (lastMove.previous.flagType === FLAG_TYPES.DOUBT) {
      const flagDoubtImg = document.createElement('img');
      flagDoubtImg.src = './src/flag_doubt.png';
      squares[lastMove.i * gridWidth + lastMove.j].appendChild(flagDoubtImg);
      nMinesCountText.innerText = `${nMines}/${totalMines}`;
    }
  }
};

const stopwatch = () => {
  if (!paused && !stopped) {
    seconds++
  }

  if (seconds <= 9) {
    appendSeconds.innerHTML = "0" + seconds
  }
  if (seconds > 9 && seconds < 60) {
    appendSeconds.innerHTML = seconds
  }
  if (seconds > 59) {
    seconds = 0
    appendSeconds.innerHTML = seconds
    minutes++
  }

  if (minutes <= 9) {
    appendMinutes.innerHTML = "0" + minutes
  }
  if (minutes > 9 && minutes < 60) {
    appendMinutes.innerHTML = minutes
  }
  if (minutes > 59) {
    minutes = 0
    appendMinutes.innerHTML = minutes
    minutes++
  }

  if (hours <= 9) {
    appendHours.innerHTML = "0" + hours
  }
  if (hours > 9 && hours < 60) {
    appendHours.innerHTML = hours
  }
  if (hours > 59) {
    hours = 0
    appendHours.innerHTML = hours
    hours++
  }
}

const clearStopwatch = () => {
  appendSeconds.innerHTML = "00"
  appendMinutes.innerHTML = "00"
  appendHours.innerHTML = "00"
}

const startTimer = () => {
  clearInterval(interval)
  interval = setInterval(stopwatch, 1000)
}

const pause = () => {
  paused = !paused
  if (paused) {
    pauseBtn.innerHTML = 'Continue'
    grid.style.visibility = 'hidden'
  } else {
    pauseBtn.innerHTML = 'Pause'
    grid.style.visibility = 'visible'
  }
}

const newGame = () => {
  const size = document.getElementById('sizeGrid')
  switch (size.value) {
    case 'small':
      gridWidth = 12
      gridHeight = 12
      break;
    case 'medium':
      gridWidth = 16
      gridHeight = 16
      break;
    case 'large':
      gridWidth = 20
      gridHeight = 20
      break;

    default:
      break;
  }
  startGame()
}

const startGame = () => {
  setInitialVariables();
  clearInterval(interval);
  clearStopwatch();
  moveStack = [];
  populateGrid();
  setMines();
  setAdjancentMines();
};

startGame()
