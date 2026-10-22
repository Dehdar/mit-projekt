// The pictures that stand for the digits. Boards keep the numbers 1 to 9;
// only the page shows a picture for each, from the SVG sprite in index.html.

const SYMBOLS = Object.freeze(["heart", "star", "moon", "flower", "raindrop", "crown", "gem", "rainbow", "unicorn"]);
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const ICON_VIEW_BOX = "0 0 100 100";

function symbolSpriteIdFor(digit) {
  return `sym-${SYMBOLS[digit - 1]}`;
}

function symbolNameFor(digit) {
  return translate("symbolNames")[SYMBOLS[digit - 1]];
}

// Screen readers hear the name instead, so the drawing itself is hidden from them
function createIcon(spriteId = "") {
  const icon = document.createElementNS(SVG_NAMESPACE, "svg");
  icon.setAttribute("class", "icon");
  icon.setAttribute("viewBox", ICON_VIEW_BOX);
  icon.setAttribute("aria-hidden", "true");
  icon.append(document.createElementNS(SVG_NAMESPACE, "use"));
  showIcon(icon, spriteId);
  return icon;
}

// An empty sprite id hides the icon, for an empty cell
function showIcon(icon, spriteId) {
  icon.firstChild.setAttribute("href", spriteId ? `#${spriteId}` : "");
  icon.classList.toggle("hidden", !spriteId);
}

function showSymbol(icon, digit) {
  showIcon(icon, digit === EMPTY ? "" : symbolSpriteIdFor(digit));
}
