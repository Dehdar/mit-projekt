// Rotating Sudoku: the board rotates every 10 seconds. Solve it before the time runs out.

const LEVEL_COUNT = 20;
const FIRST_LEVEL = 1;
const ROTATE_EVERY_SECONDS = 10;
const TIME_WARNING_SECONDS = 60;
const TICK_MS = 1000;
const SECONDS_PER_MINUTE = 60;
const SAVE_KEY = "rotating-sudoku";

const EASIEST_LEVEL = { clues: 44, minutes: 15 };
const HARDEST_LEVEL = { clues: 24, minutes: 6 };
const TIME_STEP_SECONDS = 30;

const STATUS = Object.freeze({ PLAYING: "playing", WON: "won", LOST: "lost", FINISHED: "finished" });
const ERASE_KEYS = ["Backspace", "Delete", "0"];

// Difficulty slides evenly from the first to the last level
function levelSettings(level) {
  const progress = (level - FIRST_LEVEL) / (LEVEL_COUNT - FIRST_LEVEL);
  const minutes = interpolate(EASIEST_LEVEL.minutes, HARDEST_LEVEL.minutes, progress);
  return {
    clues: Math.round(interpolate(EASIEST_LEVEL.clues, HARDEST_LEVEL.clues, progress)),
    seconds: roundToStep(minutes * SECONDS_PER_MINUTE, TIME_STEP_SECONDS),
  };
}

function interpolate(from, to, progress) {
  return from + (to - from) * progress;
}

function roundToStep(value, step) {
  return Math.round(value / step) * step;
}

// ---------- Game state ----------

// { level, puzzle, solution, board, timeLeft, status }. Saved as JSON, so the keys must not be renamed.
let state = null;
let selectedCellIndex = null;
let countdownTimer = null;

function saveGame() {
  writeStorage(SAVE_KEY, JSON.stringify(state));
}

function loadSavedGame() {
  try {
    const saved = JSON.parse(readStorage(SAVE_KEY));
    return isValidSave(saved) ? saved : null;
  } catch {
    return null;
  }
}

function isValidSave(saved) {
  return Boolean(saved && saved.level >= FIRST_LEVEL && saved.level <= LEVEL_COUNT && saved.board?.length === CELL_COUNT);
}

function startLevel(level) {
  const { clues, seconds } = levelSettings(level);
  const puzzle = makePuzzle(clues);
  state = { level, puzzle, solution: solvePuzzle(puzzle), board: [...puzzle], timeLeft: seconds, status: STATUS.PLAYING };
  selectedCellIndex = null;
  saveGame();
  refreshGameWithoutAnimation();
  mochi("start");
}

function resumeOrStartGame() {
  const saved = loadSavedGame();
  if (!saved) {
    startLevel(FIRST_LEVEL);
    return;
  }
  state = saved;
  if (state.solution?.length !== CELL_COUNT) state.solution = solvePuzzle(state.puzzle); // older saves
  refreshGameWithoutAnimation();
  mochi(state.status === STATUS.PLAYING ? "start" : state.status);
}

function syncTimerWithStatus() {
  if (state.status === STATUS.PLAYING) startTimer();
  else stopTimer();
}

function startTimer() {
  if (countdownTimer === null) countdownTimer = setInterval(tick, TICK_MS);
}

function stopTimer() {
  clearInterval(countdownTimer);
  countdownTimer = null;
}

function tick() {
  countDownOneSecond();
  saveGame();
  refreshGame();
  if (state.status === STATUS.LOST) mochi("lost");
  else if (isRotationMoment()) mochi("rotate");
}

function countDownOneSecond() {
  state.timeLeft = Math.max(0, state.timeLeft - 1);
  if (state.timeLeft === 0) state.status = STATUS.LOST;
}

function secondsElapsedInLevel() {
  return levelSettings(state.level).seconds - state.timeLeft;
}

function rotationCount() {
  return Math.floor(secondsElapsedInLevel() / ROTATE_EVERY_SECONDS);
}

function secondsUntilRotation() {
  return ROTATE_EVERY_SECONDS - (secondsElapsedInLevel() % ROTATE_EVERY_SECONDS);
}

function isRotationMoment() {
  return secondsElapsedInLevel() % ROTATE_EVERY_SECONDS === 0;
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
  if (isSolved(state.board)) state.status = statusAfterSolvingLevel();
  saveGame();
  refreshGame();
  const sweptUnits = unitsSweptAt(selectedCellIndex);
  if (sweptUnits.length > 0) celebrateSweep(sweptUnits);
  mochi(sweptUnits.length > 0 ? "sweep" : mochiReactionTo(digit));
}

// Solving the whole level has its own celebration, so a sweep only counts mid-level
function unitsSweptAt(cellIndex) {
  if (state.status !== STATUS.PLAYING) return [];
  return completedUnitsThrough(state.board, state.solution, cellIndex);
}

function canEditSelectedCell() {
  return state.status === STATUS.PLAYING && selectedCellIndex !== null && state.puzzle[selectedCellIndex] === EMPTY;
}

function statusAfterSolvingLevel() {
  return state.level === LEVEL_COUNT ? STATUS.FINISHED : STATUS.WON;
}

function mochiReactionTo(digit) {
  if (state.status !== STATUS.PLAYING) return state.status;
  if (digit === EMPTY) return "erase";
  return digit === state.solution[selectedCellIndex] ? "right" : "wrong";
}

// ---------- Rendering ----------

const boardEl = document.getElementById("board");
const overlayEl = document.getElementById("overlay");
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

// Thick lines between the 3x3 boxes, but none at the board edge, where the frame already draws one
function borderClassesFor(cellIndex) {
  const lastIndex = BOARD_SIZE - 1;
  const classes = [];
  const column = columnOf(cellIndex);
  const row = rowOf(cellIndex);
  if (column === lastIndex) classes.push("edge-right");
  else if ((column + 1) % BOX_SIZE === 0) classes.push("box-right");
  if (row === lastIndex) classes.push("edge-bottom");
  else if ((row + 1) % BOX_SIZE === 0) classes.push("box-bottom");
  return classes;
}

function refreshGame() {
  renderBoard();
  renderStats();
  renderRotation();
  renderOverlay();
  syncTimerWithStatus();
}

// On start and reload the board must be in place at once instead of rotating into position
function refreshGameWithoutAnimation() {
  boardEl.classList.add("no-anim");
  refreshGame();
  forceReflow(boardEl);
  boardEl.classList.remove("no-anim");
}

function renderBoard() {
  const conflicts = findConflicts(state.board);
  cells.forEach((cell, cellIndex) => renderCell(cell, cellIndex, conflicts));
}

function renderCell(cell, cellIndex, conflicts) {
  const digit = state.board[cellIndex];
  const isSelected = cellIndex === selectedCellIndex;
  const isRelated = !isSelected && selectedCellIndex !== null && isInSameRowColumnOrBox(cellIndex, selectedCellIndex);
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
  document.getElementById("time").textContent = formatTime(state.timeLeft);
  document.getElementById("time-stat").classList.toggle("warning", state.timeLeft <= TIME_WARNING_SECONDS);
  document.getElementById("rotate").textContent = `${secondsUntilRotation()} s`;
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function renderRotation() {
  boardEl.style.setProperty("--rot", rotationCount());
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
  const visibleKinds = units.map(visibleKindOf);
  visibleKinds.sort((first, second) => UNIT_NAME_ORDER.indexOf(first) - UNIT_NAME_ORDER.indexOf(second));
  const names = visibleKinds.map((kind) => translate(UNIT_NAME_KEYS[kind]));
  sweepBannerEl.textContent = translate("sweep", names);
  restartAnimation(sweepBannerEl, "show");
  clearTimeout(sweepBannerTimer);
  sweepBannerTimer = setTimeout(hideSweepBanner, SWEEP_BANNER_MS);
}

function hideSweepBanner() {
  sweepBannerEl.textContent = "";
}

// After a quarter or three-quarter turn a row runs up and down the screen,
// so the banner names the line the way the player sees it
function visibleKindOf(unit) {
  const isTurnedSideways = rotationCount() % 2 === 1;
  if (!isTurnedSideways || unit.kind === "box") return unit.kind;
  return unit.kind === "row" ? "column" : "row";
}

function renderOverlay() {
  const screen = overlayScreenFor(state.status);
  overlayEl.hidden = !screen;
  if (!screen) return;
  document.getElementById("overlay-title").textContent = screen.title;
  document.getElementById("overlay-text").textContent = screen.text;
  const button = document.getElementById("overlay-button");
  button.textContent = screen.button;
  button.onclick = screen.action;
}

// While playing there is no overlay
function overlayScreenFor(status) {
  const screens = {
    [STATUS.LOST]: {
      title: translate("lostTitle"),
      text: translate("lostText", state.level),
      button: translate("lostButton"),
      action: () => startLevel(state.level),
    },
    [STATUS.WON]: {
      title: translate("wonTitle", state.level),
      text: translate("wonText", formatTime(state.timeLeft)),
      button: translate("wonButton"),
      action: () => startLevel(state.level + 1),
    },
    [STATUS.FINISHED]: {
      title: translate("finishedTitle"),
      text: translate("finishedText"),
      button: translate("finishedButton"),
      action: () => startLevel(FIRST_LEVEL),
    },
  };
  return screens[status];
}

// ---------- Input ----------

function createNumpadButtons() {
  const numpad = document.getElementById("numpad");
  for (const digit of [...DIGITS, EMPTY]) {
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
