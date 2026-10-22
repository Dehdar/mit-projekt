// Texts in English and Danish. The chosen language is remembered between visits.

const LANGUAGE_STORAGE_KEY = "rotating-sudoku-language";

const TRANSLATIONS = {
  da: {
    title: "Rainbow Kingdom Sudoku",
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
    pictures: "Billeder",
    howToPlay: "Sådan spiller du",
    lessonTitle: "Sådan spiller du",
    lessonHint: "Hvert billede én gang i hver række, kolonne og boks",
    lessonDone: "Godt klaret!",
    lessonPlay: "Lad os spille!",
    lessonSkip: "Spring over",
    emptyCell: "Tomt felt",
    symbolNames: {
      heart: "Hjerte", star: "Stjerne", moon: "Måne", flower: "Blomst", raindrop: "Regndråbe",
      crown: "Krone", gem: "Ædelsten", rainbow: "Regnbue", unicorn: "Enhjørning",
    },
  },
  en: {
    title: "Rainbow Kingdom Sudoku",
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
    pictures: "Pictures",
    howToPlay: "How to play",
    lessonTitle: "How to play",
    lessonHint: "Each picture once in every row, column and box",
    lessonDone: "Well done!",
    lessonPlay: "Let's play!",
    lessonSkip: "Skip",
    emptyCell: "Empty cell",
    symbolNames: {
      heart: "Heart", star: "Star", moon: "Moon", flower: "Flower", raindrop: "Raindrop",
      crown: "Crown", gem: "Gem", rainbow: "Rainbow", unicorn: "Unicorn",
    },
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
  document.querySelectorAll("[data-i18n-label]").forEach((element) => {
    element.setAttribute("aria-label", translate(element.dataset.i18nLabel));
  });
}

translatePage();
