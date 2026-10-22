// Texts in English and Danish. The chosen language is remembered between visits.

const LANGUAGE_STORAGE_KEY = "rotating-sudoku-language";

const TRANSLATIONS = {
  da: {
    title: "Rotating Sudoku",
    level: "Level",
    erase: "Slet",
    reset: "Nulstil spil",
    resetConfirm: "Vil du starte forfra fra level 1? Dine stjerner bliver gemt.",
    otherLang: "English",
    wonTitle: (level) => `Level ${level} klaret!`,
    wonButton: "Næste level",
    finishedTitle: "Du klarede alle 20 levels!",
    finishedButton: "Spil igen",
    starsText: (stars, maxStars) => `Du har ${stars} af ${maxStars} stjerner på dette level.`,
    starFinished: "Opgaven løst",
    starCareful: (limit) => `Omhyggelig: højst ${limit} smuttere`,
    unitRow: "Række",
    unitColumn: "Kolonne",
    unitBox: "Boks",
    sweep: (units) => `${units.join(" + ")} klaret!`,
  },
  en: {
    title: "Rotating Sudoku",
    level: "Level",
    erase: "Erase",
    reset: "Reset game",
    resetConfirm: "Start over from level 1? Your stars are kept.",
    otherLang: "Dansk",
    wonTitle: (level) => `Level ${level} complete!`,
    wonButton: "Next level",
    finishedTitle: "You beat all 20 levels!",
    finishedButton: "Play again",
    starsText: (stars, maxStars) => `You have ${stars} of ${maxStars} stars on this level.`,
    starFinished: "Finished the puzzle",
    starCareful: (limit) => `Careful: ${limit} oopsies or fewer`,
    unitRow: "Row",
    unitColumn: "Column",
    unitBox: "Box",
    sweep: (units) => `${units.join(" + ")} complete!`,
  },
};

let currentLanguage = readStorage(LANGUAGE_STORAGE_KEY) === "da" ? "da" : "en";

// Some texts are functions because they contain numbers such as the level or stars
function translate(key, ...args) {
  const text = TRANSLATIONS[currentLanguage][key];
  return typeof text === "function" ? text(...args) : text;
}

function toggleLanguage() {
  currentLanguage = currentLanguage === "en" ? "da" : "en";
  writeStorage(LANGUAGE_STORAGE_KEY, currentLanguage);
  translatePage();
}

function translatePage() {
  document.documentElement.lang = currentLanguage;
  document.title = translate("title");
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = translate(element.dataset.i18n);
  });
}

translatePage();
