// Rotating Sudoku: a calm sudoku with no clock and no game over. Finishing a level earns stars.

const LEVEL_COUNT = 20;
const FIRST_LEVEL = 1;
const SAVE_KEY = "rainbow-kingdom";
const PROGRESS_KEY = "rainbow-kingdom-progress";

const BOARD_SHAPE = BOARD_SHAPES.NINE_BY_NINE;
const CELL_COUNT = cellCountOf(BOARD_SHAPE);

const EASIEST_LEVEL_CLUES = 44;
const HARDEST_LEVEL_CLUES = 24;

const STATUS = Object.freeze({ PLAYING: "playing", WON: "won", FINISHED: "finished" });
const ERASE_KEYS = ["Backspace", "Delete", "0"];

// Difficulty slides evenly from the first to the last level
function levelSettings(level) {
  const share = (level - FIRST_LEVEL) / (LEVEL_COUNT - FIRST_LEVEL);
  return { clues: Math.round(interpolate(EASIEST_LEVEL_CLUES, HARDEST_LEVEL_CLUES, share)) };
}

function interpolate(from, to, share) {
  return from + (to - from) * share;
}

// ---------- Game state ----------

// { level, puzzle, solution, board, oopsies, wandsUsed, status }. Saved as JSON, so the keys must not be renamed.
// wandsUsed is reserved for the magic wand hint and stays 0 until it exists.
let state = null;
let selectedCellIndex = null;

function saveGame() {
  writeStorage(SAVE_KEY, JSON.stringify(state));
}

function loadSavedGame() {
  const saved = parseStoredJson(SAVE_KEY);
  return isValidSave(saved) ? saved : null;
}

function parseStoredJson(key) {
  try {
    return JSON.parse(readStorage(key));
  } catch {
    return null;
  }
}

function isValidSave(saved) {
  return Boolean(saved) &&
    isLevel(saved.level) &&
    [saved.puzzle, saved.solution, saved.board].every(isFullBoard) &&
    isCount(saved.oopsies) &&
    isCount(saved.wandsUsed) &&
    Object.values(STATUS).includes(saved.status);
}

function isLevel(value) {
  return Number.isInteger(value) && value >= FIRST_LEVEL && value <= LEVEL_COUNT;
}

function isFullBoard(board) {
  return Array.isArray(board) && board.length === CELL_COUNT;
}

function isCount(value) {
  return Number.isInteger(value) && value >= 0;
}

function startLevel(level) {
  const puzzle = makePuzzle(BOARD_SHAPE, levelSettings(level).clues);
  const solution = solvePuzzle(BOARD_SHAPE, puzzle);
  state = { level, puzzle, solution, board: [...puzzle], oopsies: 0, wandsUsed: 0, status: STATUS.PLAYING };
  selectedCellIndex = null;
  saveGame();
  refreshGame();
  mochi("start");
}

function resumeOrStartGame() {
  const saved = loadSavedGame();
  if (!saved) {
    startLevel(FIRST_LEVEL);
    return;
  }
  state = saved;
  refreshGame();
  mochi(state.status === STATUS.PLAYING ? "start" : state.status);
}

function selectCell(cellIndex) {
  if (state.status !== STATUS.PLAYING) return;
  selectedCellIndex = cellIndex;
  renderBoard();
  if (state.puzzle[cellIndex] === EMPTY) mochi("select");
}

function enterDigit(digit) {
  if (!canEditSelectedCell() || state.board[selectedCellIndex] === digit) return;
  state.board[selectedCellIndex] = digit;
  if (isOops(digit)) state.oopsies++;
  if (isSolved(BOARD_SHAPE, state.board)) finishLevel();
  saveGame();
  refreshGame();
  const sweptUnits = unitsSweptAt(selectedCellIndex);
  if (sweptUnits.length > 0) celebrateSweep(sweptUnits);
  mochi(sweptUnits.length > 0 ? "sweep" : mochiReactionTo(digit));
}

function isOops(digit) {
  return digit !== EMPTY && digit !== state.solution[selectedCellIndex];
}

function finishLevel() {
  state.status = state.level === LEVEL_COUNT ? STATUS.FINISHED : STATUS.WON;
  keepBestStars(state.level, starsEarnedWith(state.oopsies));
}

// Solving the whole level has its own celebration, so a sweep only counts mid-level
function unitsSweptAt(cellIndex) {
  if (state.status !== STATUS.PLAYING) return [];
  return completedUnitsThrough(BOARD_SHAPE, state.board, state.solution, cellIndex);
}

function canEditSelectedCell() {
  return state.status === STATUS.PLAYING && selectedCellIndex !== null && state.puzzle[selectedCellIndex] === EMPTY;
}

function mochiReactionTo(digit) {
  if (state.status !== STATUS.PLAYING) return state.status;
  if (digit === EMPTY) return "erase";
  return isOops(digit) ? "wrong" : "right";
}

// ---------- Stars ----------

// Stars are earned in this order, so a level with n stars has the first n of them
const CAREFUL_OOPSIES_LIMIT = 2;
const STARS = [
  { icon: "★", labelKey: "starFinished", isEarnedWith: () => true },
  { icon: "✪", labelKey: "starCareful", isEarnedWith: (oopsies) => oopsies <= CAREFUL_OOPSIES_LIMIT },
];

// { starsByLevel: { [level]: stars } }, kept separate from the game so starting a new puzzle never touches it
let progress = loadProgress();

function loadProgress() {
  const saved = parseStoredJson(PROGRESS_KEY);
  return { starsByLevel: validStarsByLevel(saved?.starsByLevel) };
}

// Drops only the entries that make no sense, so one bad value does not cost the child every star
function validStarsByLevel(starsByLevel) {
  if (typeof starsByLevel !== "object" || starsByLevel === null) return {};
  return Object.fromEntries(Object.entries(starsByLevel).filter(([level, stars]) => isLevel(Number(level)) && isStarCount(stars)));
}

function isStarCount(value) {
  return Number.isInteger(value) && value >= 1 && value <= STARS.length;
}

function starsEarnedWith(oopsies) {
  return STARS.filter((star) => star.isEarnedWith(oopsies)).length;
}

function bestStarsFor(level) {
  return progress.starsByLevel[level] ?? 0;
}

// Replaying a level can add stars but never take them away
function keepBestStars(level, stars) {
  progress.starsByLevel[level] = Math.max(bestStarsFor(level), stars);
  writeStorage(PROGRESS_KEY, JSON.stringify(progress));
}

// ---------- Rendering ----------

const boardEl = document.getElementById("board");
const overlayEl = document.getElementById("overlay");
const overlayStarsEl = document.getElementById("overlay-stars");
const cells = createCellsOnBoard();

function createCellsOnBoard() {
  return Array.from({ length: CELL_COUNT }, (_, cellIndex) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.testid = "cell";
    cell.classList.add(...borderClassesFor(cellIndex));
    cell.append(document.createElement("span"));
    cell.addEventListener("click", () => selectCell(cellIndex));
    boardEl.append(cell);
    return cell;
  });
}

// Thick lines between the boxes, but none at the board edge, where the frame already draws one
function borderClassesFor(cellIndex) {
  const { size, boxRows, boxColumns } = BOARD_SHAPE;
  const lastIndex = size - 1;
  const classes = [];
  const column = columnOf(BOARD_SHAPE, cellIndex);
  const row = rowOf(BOARD_SHAPE, cellIndex);
  if (column === lastIndex) classes.push("edge-right");
  else if ((column + 1) % boxColumns === 0) classes.push("box-right");
  if (row === lastIndex) classes.push("edge-bottom");
  else if ((row + 1) % boxRows === 0) classes.push("box-bottom");
  return classes;
}

function refreshGame() {
  renderBoard();
  renderStats();
  renderOverlay();
}

function renderBoard() {
  const conflicts = findConflicts(BOARD_SHAPE, state.board);
  cells.forEach((cell, cellIndex) => renderCell(cell, cellIndex, conflicts));
}

function renderCell(cell, cellIndex, conflicts) {
  const digit = state.board[cellIndex];
  const isSelected = cellIndex === selectedCellIndex;
  const isRelated = !isSelected && selectedCellIndex !== null && isInSameRowColumnOrBox(BOARD_SHAPE, cellIndex, selectedCellIndex);
  cell.firstChild.textContent = digit || "";
  cell.classList.toggle("given", state.puzzle[cellIndex] !== EMPTY);
  cell.classList.toggle("selected", isSelected);
  cell.classList.toggle("related", isRelated);
  cell.classList.toggle("same", !isSelected && digit !== EMPTY && digit === selectedDigit());
  cell.classList.toggle("conflict", conflicts.has(cellIndex));
}

function selectedDigit() {
  return selectedCellIndex === null ? EMPTY : state.board[selectedCellIndex];
}

function renderStats() {
  document.getElementById("level").textContent = `${state.level} / ${LEVEL_COUNT}`;
}

// ---------- Sweep: a row, column or box completed ----------

const SWEEP_BANNER_MS = 1600; // matches the sweep-banner animation in style.css
const UNIT_NAME_KEYS = { row: "unitRow", column: "unitColumn", box: "unitBox" };
const UNIT_NAME_ORDER = Object.keys(UNIT_NAME_KEYS);
const sweepBannerEl = document.getElementById("sweep-banner");
let sweepBannerTimer = null;

function celebrateSweep(units) {
  playSweepWave(units);
  showSweepBanner(units);
}

// Each unit lights up cell by cell, like a wave running through it
function playSweepWave(units) {
  const stepByCell = new Map();
  for (const unit of units) {
    unit.cells.forEach((cellIndex, step) => {
      if (!stepByCell.has(cellIndex)) stepByCell.set(cellIndex, step);
    });
  }
  for (const [cellIndex, step] of stepByCell) {
    cells[cellIndex].style.setProperty("--sweep-step", step);
    restartAnimation(cells[cellIndex], "swept");
  }
}

function showSweepBanner(units) {
  const kinds = units.map((unit) => unit.kind);
  kinds.sort((first, second) => UNIT_NAME_ORDER.indexOf(first) - UNIT_NAME_ORDER.indexOf(second));
  const names = kinds.map((kind) => translate(UNIT_NAME_KEYS[kind]));
  sweepBannerEl.textContent = translate("sweep", names);
  restartAnimation(sweepBannerEl, "show");
  clearTimeout(sweepBannerTimer);
  sweepBannerTimer = setTimeout(hideSweepBanner, SWEEP_BANNER_MS);
}

function hideSweepBanner() {
  sweepBannerEl.textContent = "";
}

function renderOverlay() {
  const screen = overlayScreenFor(state.status);
  overlayEl.hidden = !screen;
  if (!screen) return;
  document.getElementById("overlay-title").textContent = screen.title;
  document.getElementById("overlay-text").textContent = translate("starsText", bestStarsFor(state.level), STARS.length);
  renderStarList(bestStarsFor(state.level));
  const button = document.getElementById("overlay-button");
  button.textContent = screen.button;
  button.onclick = screen.action;
}

// Every star is listed, the missing ones dimmed, so the child sees how to earn them
function renderStarList(earnedStars) {
  overlayStarsEl.replaceChildren(...STARS.map((star, index) => {
    const item = document.createElement("li");
    item.className = index < earnedStars ? "star earned" : "star missing";
    item.textContent = `${star.icon} ${translate(star.labelKey, CAREFUL_OOPSIES_LIMIT)}`;
    return item;
  }));
}

// While playing there is no overlay
function overlayScreenFor(status) {
  const screens = {
    [STATUS.WON]: {
      title: translate("wonTitle", state.level),
      button: translate("wonButton"),
      action: () => startLevel(state.level + 1),
    },
    [STATUS.FINISHED]: {
      title: translate("finishedTitle"),
      button: translate("finishedButton"),
      action: () => startLevel(FIRST_LEVEL),
    },
  };
  return screens[status];
}

// ---------- Input ----------

function createNumpadButtons() {
  const numpad = document.getElementById("numpad");
  for (const digit of [...digitsOf(BOARD_SHAPE), EMPTY]) {
    const button = document.createElement("button");
    button.textContent = digit;
    if (digit === EMPTY) button.dataset.i18n = "erase";
    button.addEventListener("click", () => enterDigit(digit));
    numpad.append(button);
  }
}

function handleKeyDown(event) {
  if (/^[1-9]$/.test(event.key)) enterDigit(Number(event.key));
  else if (ERASE_KEYS.includes(event.key)) enterDigit(EMPTY);
}

// Stars are kept: a reset only starts the journey over
function confirmAndResetGame() {
  if (confirm(translate("resetConfirm"))) startLevel(FIRST_LEVEL);
}

function switchLanguage() {
  toggleLanguage();
  renderOverlay();
  silenceMochi();
}

document.addEventListener("keydown", handleKeyDown);
document.getElementById("reset").addEventListener("click", confirmAndResetGame);
document.getElementById("lang").addEventListener("click", switchLanguage);

// ---------- Start ----------

createNumpadButtons();
translatePage(); // the Erase button only exists now
resumeOrStartGame();
