// Pure sudoku logic with nothing to do with the page.
// A board is an array of 81 numbers, row by row, where 0 is an empty cell.

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

// Runs often while generating puzzles, so it checks row, column and box in a single pass
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

// Backtracking in random order, so every board is different
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

// The cell with the fewest candidates gives the smallest search tree. A cell with no candidates means the board is unsolvable.
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

// Stops at limit, because we only need to know whether there is exactly one solution
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

// A digit is only removed if the puzzle still has one solution, so clueCount is a target, not a guarantee
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

// The puzzle has only one solution, so the first valid fill is the right one
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
