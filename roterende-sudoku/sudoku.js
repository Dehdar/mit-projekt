// Ren sudoku-logik uden noget med siden at gøre.
// Et bræt er et array med 81 tal, række for række, hvor 0 er et tomt felt.

const BOARD_SIZE = 9;
const BOX_SIZE = 3;
const CELL_COUNT = BOARD_SIZE * BOARD_SIZE;
const EMPTY = 0;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function rowOf(cellIndex) {
  return Math.floor(cellIndex / BOARD_SIZE);
}

function columnOf(cellIndex) {
  return cellIndex % BOARD_SIZE;
}

function boxOf(cellIndex) {
  return Math.floor(rowOf(cellIndex) / BOX_SIZE) * BOX_SIZE + Math.floor(columnOf(cellIndex) / BOX_SIZE);
}

function isInSameRowColumnOrBox(firstCell, secondCell) {
  return rowOf(firstCell) === rowOf(secondCell) ||
    columnOf(firstCell) === columnOf(secondCell) ||
    boxOf(firstCell) === boxOf(secondCell);
}

function shuffleInPlace(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

// Kører tit under generering af opgaver, så den tjekker række, kolonne og boks i ét gennemløb
function canPlaceDigit(grid, cellIndex, digit) {
  const row = rowOf(cellIndex);
  const column = columnOf(cellIndex);
  const boxTop = row - (row % BOX_SIZE);
  const boxLeft = column - (column % BOX_SIZE);
  for (let offset = 0; offset < BOARD_SIZE; offset++) {
    const rowCell = row * BOARD_SIZE + offset;
    const columnCell = offset * BOARD_SIZE + column;
    const boxCell = (boxTop + Math.floor(offset / BOX_SIZE)) * BOARD_SIZE + boxLeft + (offset % BOX_SIZE);
    if (grid[rowCell] === digit || grid[columnCell] === digit || grid[boxCell] === digit) return false;
  }
  return true;
}

function candidatesFor(grid, cellIndex) {
  return DIGITS.filter((digit) => canPlaceDigit(grid, cellIndex, digit));
}

// Backtracking med tilfældig rækkefølge, så hvert bræt bliver forskelligt
function fillEmptyCellsRandomly(grid) {
  const cellIndex = grid.indexOf(EMPTY);
  if (cellIndex === -1) return true;
  for (const digit of shuffleInPlace([...DIGITS])) {
    if (!canPlaceDigit(grid, cellIndex, digit)) continue;
    grid[cellIndex] = digit;
    if (fillEmptyCellsRandomly(grid)) return true;
    grid[cellIndex] = EMPTY;
  }
  return false;
}

// Feltet med færrest muligheder giver det mindste søgetræ. Har et felt ingen muligheder, er brættet uløseligt.
function findMostConstrainedEmptyCell(grid) {
  let mostConstrained = null;
  for (let cellIndex = 0; cellIndex < CELL_COUNT; cellIndex++) {
    if (grid[cellIndex] !== EMPTY) continue;
    const candidates = candidatesFor(grid, cellIndex);
    if (!mostConstrained || candidates.length < mostConstrained.candidates.length) {
      mostConstrained = { cellIndex, candidates };
    }
    if (candidates.length <= 1) break;
  }
  return mostConstrained;
}

// Stopper ved limit, fordi vi kun skal vide, om der er præcis én løsning
function countSolutions(grid, limit) {
  const target = findMostConstrainedEmptyCell(grid);
  if (!target) return 1;
  let count = 0;
  for (const digit of target.candidates) {
    grid[target.cellIndex] = digit;
    count += countSolutions(grid, limit - count);
    if (count >= limit) break;
  }
  grid[target.cellIndex] = EMPTY;
  return count;
}

function hasUniqueSolution(grid) {
  return countSolutions(grid, 2) === 1;
}

function createSolvedGrid() {
  const grid = new Array(CELL_COUNT).fill(EMPTY);
  fillEmptyCellsRandomly(grid);
  return grid;
}

// Et tal fjernes kun, hvis opgaven stadig har én løsning, så clueCount er et mål og ikke en garanti
function makePuzzle(clueCount) {
  const puzzle = createSolvedGrid();
  let filledCount = CELL_COUNT;
  for (const cellIndex of shuffleInPlace([...Array(CELL_COUNT).keys()])) {
    if (filledCount <= clueCount) break;
    const removedDigit = puzzle[cellIndex];
    puzzle[cellIndex] = EMPTY;
    if (hasUniqueSolution(puzzle)) filledCount--;
    else puzzle[cellIndex] = removedDigit;
  }
  return puzzle;
}

// Opgaven har kun én løsning, så første gyldige udfyldning er den rigtige
function solvePuzzle(puzzle) {
  const solution = [...puzzle];
  fillEmptyCellsRandomly(solution);
  return solution;
}

function findConflicts(board) {
  const conflicts = new Set();
  for (let first = 0; first < CELL_COUNT; first++) {
    if (board[first] === EMPTY) continue;
    for (let second = first + 1; second < CELL_COUNT; second++) {
      if (board[first] === board[second] && isInSameRowColumnOrBox(first, second)) {
        conflicts.add(first);
        conflicts.add(second);
      }
    }
  }
  return conflicts;
}

function isSolved(board) {
  return !board.includes(EMPTY) && findConflicts(board).size === 0;
}
