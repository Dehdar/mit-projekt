// Pure sudoku logic with nothing to do with the page.
// A board is an array of size * size numbers, row by row, where 0 is an empty cell.
// Its shape says how big it is and how it is split into boxes; boxRows * boxColumns must equal size.

const BOARD_SHAPES = Object.freeze({
  FOUR_BY_FOUR: Object.freeze({ size: 4, boxRows: 2, boxColumns: 2 }),
  SIX_BY_SIX: Object.freeze({ size: 6, boxRows: 2, boxColumns: 3 }),
  NINE_BY_NINE: Object.freeze({ size: 9, boxRows: 3, boxColumns: 3 }),
});
const EMPTY = 0;

function cellCountOf(shape) {
  return shape.size * shape.size;
}

// The digits 1 to size, one for each cell in a row, column or box
function digitsOf(shape) {
  return Array.from({ length: shape.size }, (_, index) => index + 1);
}

function allCellsOf(shape) {
  return [...Array(cellCountOf(shape)).keys()];
}

function rowOf(shape, cellIndex) {
  return Math.floor(cellIndex / shape.size);
}

function columnOf(shape, cellIndex) {
  return cellIndex % shape.size;
}

function boxOf(shape, cellIndex) {
  const boxesPerRow = shape.size / shape.boxColumns;
  const boxRow = Math.floor(rowOf(shape, cellIndex) / shape.boxRows);
  const boxColumn = Math.floor(columnOf(shape, cellIndex) / shape.boxColumns);
  return boxRow * boxesPerRow + boxColumn;
}

function isInSameRowColumnOrBox(shape, firstCell, secondCell) {
  return rowOf(shape, firstCell) === rowOf(shape, secondCell) ||
    columnOf(shape, firstCell) === columnOf(shape, secondCell) ||
    boxOf(shape, firstCell) === boxOf(shape, secondCell);
}

function shuffleInPlace(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

// Runs often while generating puzzles, so it checks row, column and box in a single pass
function canPlaceDigit(shape, grid, cellIndex, digit) {
  const { size, boxRows, boxColumns } = shape;
  const row = rowOf(shape, cellIndex);
  const column = columnOf(shape, cellIndex);
  const boxTop = row - (row % boxRows);
  const boxLeft = column - (column % boxColumns);
  for (let offset = 0; offset < size; offset++) {
    const rowCell = row * size + offset;
    const columnCell = offset * size + column;
    const boxCell = (boxTop + Math.floor(offset / boxColumns)) * size + boxLeft + (offset % boxColumns);
    if (grid[rowCell] === digit || grid[columnCell] === digit || grid[boxCell] === digit) return false;
  }
  return true;
}

function candidatesFor(shape, grid, cellIndex) {
  return digitsOf(shape).filter((digit) => canPlaceDigit(shape, grid, cellIndex, digit));
}

// Backtracking in random order, so every board is different
function fillEmptyCellsRandomly(shape, grid) {
  const cellIndex = grid.indexOf(EMPTY);
  if (cellIndex === -1) return true;
  for (const digit of shuffleInPlace(digitsOf(shape))) {
    if (!canPlaceDigit(shape, grid, cellIndex, digit)) continue;
    grid[cellIndex] = digit;
    if (fillEmptyCellsRandomly(shape, grid)) return true;
    grid[cellIndex] = EMPTY;
  }
  return false;
}

// The cell with the fewest candidates gives the smallest search tree. A cell with no candidates means the board is unsolvable.
function findMostConstrainedEmptyCell(shape, grid) {
  let mostConstrained = null;
  for (let cellIndex = 0; cellIndex < grid.length; cellIndex++) {
    if (grid[cellIndex] !== EMPTY) continue;
    const candidates = candidatesFor(shape, grid, cellIndex);
    if (!mostConstrained || candidates.length < mostConstrained.candidates.length) {
      mostConstrained = { cellIndex, candidates };
    }
    if (candidates.length <= 1) break;
  }
  return mostConstrained;
}

// Stops at limit, because we only need to know whether there is exactly one solution
function countSolutions(shape, grid, limit) {
  const target = findMostConstrainedEmptyCell(shape, grid);
  if (!target) return 1;
  let count = 0;
  for (const digit of target.candidates) {
    grid[target.cellIndex] = digit;
    count += countSolutions(shape, grid, limit - count);
    if (count >= limit) break;
  }
  grid[target.cellIndex] = EMPTY;
  return count;
}

function hasUniqueSolution(shape, grid) {
  return countSolutions(shape, grid, 2) === 1;
}

function createSolvedGrid(shape) {
  const grid = new Array(cellCountOf(shape)).fill(EMPTY);
  fillEmptyCellsRandomly(shape, grid);
  return grid;
}

// A digit is only removed if the puzzle still has one solution, so clueCount is a target, not a guarantee
function makePuzzle(shape, clueCount) {
  const puzzle = createSolvedGrid(shape);
  let filledCount = puzzle.length;
  for (const cellIndex of shuffleInPlace(allCellsOf(shape))) {
    if (filledCount <= clueCount) break;
    const removedDigit = puzzle[cellIndex];
    puzzle[cellIndex] = EMPTY;
    if (hasUniqueSolution(shape, puzzle)) filledCount--;
    else puzzle[cellIndex] = removedDigit;
  }
  return puzzle;
}

// The puzzle has only one solution, so the first valid fill is the right one
function solvePuzzle(shape, puzzle) {
  const solution = [...puzzle];
  fillEmptyCellsRandomly(shape, solution);
  return solution;
}

function findConflicts(shape, board) {
  const conflicts = new Set();
  for (let first = 0; first < board.length; first++) {
    if (board[first] === EMPTY) continue;
    for (let second = first + 1; second < board.length; second++) {
      if (board[first] === board[second] && isInSameRowColumnOrBox(shape, first, second)) {
        conflicts.add(first);
        conflicts.add(second);
      }
    }
  }
  return conflicts;
}

// The row, column and box a cell belongs to, each with its cells in reading order
function unitsThrough(shape, cellIndex) {
  const allCells = allCellsOf(shape);
  const cellsSharing = (unitOf) => allCells.filter((other) => unitOf(shape, other) === unitOf(shape, cellIndex));
  return [
    { kind: "row", cells: cellsSharing(rowOf) },
    { kind: "column", cells: cellsSharing(columnOf) },
    { kind: "box", cells: cellsSharing(boxOf) },
  ];
}

// A unit only counts as complete when every digit in it matches the solution,
// so a lucky but wrong fill that happens to have no conflicts is not celebrated
function completedUnitsThrough(shape, board, solution, cellIndex) {
  return unitsThrough(shape, cellIndex).filter((unit) => unit.cells.every((cell) => board[cell] === solution[cell]));
}

function isSolved(shape, board) {
  return !board.includes(EMPTY) && findConflicts(shape, board).size === 0;
}
