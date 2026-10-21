// Tekster på dansk og engelsk. Det valgte sprog huskes mellem besøg.

const LANGUAGE_STORAGE_KEY = "roterende-sudoku-lang";

const TRANSLATIONS = {
  da: {
    title: "Roterende Sudoku",
    level: "Level",
    timeLeft: "Tid tilbage",
    rotatesIn: "Roterer om",
    erase: "Slet",
    reset: "Nulstil spil",
    resetConfirm: "Vil du nulstille og starte et helt nyt spil fra level 1?",
    otherLang: "English",
    lostTitle: "Game over",
    lostText: (level) => `Tiden løb ud på level ${level}. Prøv igen med en ny opgave.`,
    lostButton: "Prøv igen",
    wonTitle: (level) => `Level ${level} klaret!`,
    wonText: (time) => `Du klarede det med ${time} tilbage. Næste level bliver sværere.`,
    wonButton: "Næste level",
    finishedTitle: "Du klarede alle 20 levels!",
    finishedText: "Sejt gået. Vil du starte forfra?",
    finishedButton: "Spil igen",
  },
  en: {
    title: "Rotating Sudoku",
    level: "Level",
    timeLeft: "Time left",
    rotatesIn: "Rotates in",
    erase: "Erase",
    reset: "Reset game",
    resetConfirm: "Reset and start a brand new game from level 1?",
    otherLang: "Dansk",
    lostTitle: "Game over",
    lostText: (level) => `Time ran out on level ${level}. Try again with a new puzzle.`,
    lostButton: "Try again",
    wonTitle: (level) => `Level ${level} complete!`,
    wonText: (time) => `You made it with ${time} left. The next level gets harder.`,
    wonButton: "Next level",
    finishedTitle: "You beat all 20 levels!",
    finishedText: "Well done. Want to start over?",
    finishedButton: "Play again",
  },
};

let currentLanguage = readStorage(LANGUAGE_STORAGE_KEY) === "en" ? "en" : "da";

// Nogle tekster er funktioner, fordi de indeholder tal som level eller tid
function translate(key, ...args) {
  const text = TRANSLATIONS[currentLanguage][key];
  return typeof text === "function" ? text(...args) : text;
}

function toggleLanguage() {
  currentLanguage = currentLanguage === "da" ? "en" : "da";
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
