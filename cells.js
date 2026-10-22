// How a board cell is drawn, shared by the game board and the first lesson.

function createCell(shape, cellIndex) {
  const cell = document.createElement("div");
  cell.className = "cell";
  cell.classList.add(...borderClassesFor(shape, cellIndex));
  const picture = document.createElement("span");
  picture.append(createIcon());
  cell.append(picture);
  return cell;
}

// Thick lines between the boxes, but none at the board edge, where the frame already draws one
function borderClassesFor(shape, cellIndex) {
  const { size, boxRows, boxColumns } = shape;
  const lastIndex = size - 1;
  const classes = [];
  const column = columnOf(shape, cellIndex);
  const row = rowOf(shape, cellIndex);
  if (column === lastIndex) classes.push("edge-right");
  else if ((column + 1) % boxColumns === 0) classes.push("box-right");
  if (row === lastIndex) classes.push("edge-bottom");
  else if ((row + 1) % boxRows === 0) classes.push("box-bottom");
  return classes;
}

// Screen readers hear the picture's name, or that the cell is empty
function showCellPicture(cell, digit) {
  showSymbol(cell.querySelector(".icon"), digit);
  cell.setAttribute("aria-label", digit === EMPTY ? translate("emptyCell") : symbolNameFor(digit));
}
