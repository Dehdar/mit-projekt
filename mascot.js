// Mochi, the cat who teases you while you play.
// She is curious while you look, shocked when you get it right,
// and talks trash when you make mistakes.
// Sometimes she gives the board a shove so it shakes.

const REACTION_DURATION_MS = 3500;
const PUSH_CHANCE = 0.3;
const COMMENT_CHANCE = 0.5;
const RESTING_MOOD = "curious";

// Events that happen so often that she only comments on some of them
const FREQUENT_EVENTS = ["select", "rotate"];
const PROVOKING_EVENTS = ["wrong"];
const GAME_OVER_EVENTS = ["won", "finished"];

const LINES = {
  da: {
    wrong: [
      "Haha, nej. Bare nej.",
      "Er det dit endelige svar? Det er forkert.",
      "Wow. Modigt. Forkert, men modigt.",
      "Min bedstemor løser det her hurtigere. Hun er en kat.",
      "Har du overvejet kryds og bolle i stedet?",
      "Jeg så det. Alle så det.",
      "Den tæller vi som en øvelse.",
      "Sikke en flot fejl. Skal den indrammes?",
    ],
    push: [
      "Ups. Min pote smuttede.",
      "Skub! Vågn op!",
      "Hov, stod det der før?",
      "Jeg skubber bare lidt. Det hjælper.",
      "Katte skubber ting. Det er vores job.",
    ],
    right: [
      "Hvad?! Det var faktisk rigtigt.",
      "Okay, okay... held.",
      "Vent, hvordan vidste du det?",
      "Det tæller ikke, jeg kiggede ikke.",
      "Selv en blind høne finder et korn.",
      "Snyder du? Du snyder.",
    ],
    sweep: [
      "Ni ud af ni? Begynderheld gange ni.",
      "Pænt. Mistænkeligt pænt.",
      "Jeg skulle have sovet lige der.",
      "Hold op med at rydde op. Det er MIT hus.",
      "Nu er der intet at skubbe ned derfra. Tak for ingenting.",
      "Bliv nu ikke kæphøj. Brættet drejer snart.",
      "Hvem har lært dig det? Ikke mig.",
    ],
    erase: [
      "Fortryder du allerede?",
      "Ja, slet beviserne.",
      "Hmm, mistede du modet?",
    ],
    select: [
      "Hmm... den der? Interessant valg.",
      "Hvad kigger du på?",
      "Jeg ville ikke vælge den. Men gør bare.",
      "Spændende. Lad os se, hvor galt det går.",
      "Hmmmm...",
      "Er du sikker på, det er den rigtige?",
    ],
    rotate: [
      "Wheee! Rundt vi går.",
      "Ups, nu står det hele på hovedet.",
      "Fandt du lige det felt? Nu er det væk.",
    ],
    won: [
      "NEJ! Du klarede det?! Jeg kræver omkamp.",
      "Det må have været snyd. Det SKAL have været snyd.",
      "Fint. Næste level knækker dig.",
    ],
    finished: ["Alle 20 levels?! Jeg... har ingen ord. Næsten."],
    start: [
      "Nyt bræt. Jeg glæder mig til at se dig fejle.",
      "Klar? Jeg holder øje med dig.",
    ],
  },
  en: {
    wrong: [
      "Haha, no. Just no.",
      "Is that your final answer? It's wrong.",
      "Wow. Brave. Wrong, but brave.",
      "My grandma solves these faster. She's a cat.",
      "Have you considered tic-tac-toe instead?",
      "I saw that. Everyone saw that.",
      "Let's call that one practice.",
      "What a lovely mistake. Should I frame it?",
    ],
    push: [
      "Oops. My paw slipped.",
      "Shove! Wake up!",
      "Huh, was that there before?",
      "Just a little push. It helps.",
      "Cats push things. It's our job.",
    ],
    right: [
      "What?! That was actually right.",
      "Okay, okay... luck.",
      "Wait, how did you know that?",
      "That doesn't count, I wasn't looking.",
      "Even a broken clock is right twice a day.",
      "Are you cheating? You're cheating.",
    ],
    sweep: [
      "Nine for nine? Beginner's luck, times nine.",
      "Neat. Suspiciously neat.",
      "I was going to nap right there.",
      "Stop tidying. This is MY house.",
      "Great. Now there's nothing left to knock over there.",
      "Don't get cocky. The board turns any second.",
      "Who taught you that? Not me.",
    ],
    erase: [
      "Regretting it already?",
      "Yes, destroy the evidence.",
      "Hmm, lost your nerve?",
    ],
    select: [
      "Hmm... that one? Interesting choice.",
      "What are you looking at?",
      "I wouldn't pick that one. But go ahead.",
      "Exciting. Let's see how badly this goes.",
      "Hmmmm...",
      "Are you sure that's the right one?",
    ],
    rotate: [
      "Wheee! Round and round.",
      "Oops, now it's all upside down.",
      "Did you just find that cell? Now it's gone.",
    ],
    won: [
      "NO! You did it?! I demand a rematch.",
      "That must have been cheating. It HAS to be.",
      "Fine. The next level will break you.",
    ],
    finished: ["All 20 levels?! I... have no words. Almost."],
    start: [
      "New board. I can't wait to watch you fail.",
      "Ready? I'm watching you.",
    ],
  },
};

// Which face belongs to which event
const MOODS = {
  wrong: "trash", push: "trash", erase: "trash", rotate: "trash", start: "trash",
  right: "shocked", sweep: "shocked", won: "shocked", finished: "shocked",
  select: RESTING_MOOD,
};

const mascotEl = document.getElementById("mascot");
const mascotArtEl = mascotEl.querySelector(".mascot-art");
const bubbleEl = document.getElementById("mascot-bubble");
const boardWrapEl = document.querySelector(".board-wrap");
let lastLine = "";
let calmDownTimer = null;
let isGameRunning = false;

// Called from the game: "select", "right", "sweep" (a row, column or box completed), "wrong", "erase", "rotate", "start", "won", "finished"
function mochi(event) {
  trackGameProgress(event);
  if (wantsToComment(event)) react(maybeEscalateToPush(event));
}

function trackGameProgress(event) {
  if (event === "start") isGameRunning = true;
  if (GAME_OVER_EVENTS.includes(event)) isGameRunning = false;
}

// She cannot be bothered to comment on every single click
function wantsToComment(event) {
  return !FREQUENT_EVENTS.includes(event) || Math.random() < COMMENT_CHANCE;
}

function maybeEscalateToPush(event) {
  return PROVOKING_EVENTS.includes(event) && Math.random() < PUSH_CHANCE ? "push" : event;
}

function react(event) {
  if (event === "push") shoveBoard();
  clearTimeout(calmDownTimer);
  setMood(MOODS[event]);
  say(pickLine(event));
  // After the game ends she stays in her reaction
  if (isGameRunning) calmDownTimer = setTimeout(calmDown, REACTION_DURATION_MS);
}

function calmDown() {
  setMood(RESTING_MOOD);
  say("");
}

// Picks a different line than last time so she does not repeat herself
function pickLine(event) {
  const lines = LINES[currentLanguage][event];
  const freshLines = lines.filter((line) => line !== lastLine);
  lastLine = freshLines[Math.floor(Math.random() * freshLines.length)] || lines[0];
  return lastLine;
}

// The mood is cleared first so the face animation restarts
function setMood(mood) {
  mascotEl.dataset.mood = "";
  forceReflow(mascotEl);
  mascotEl.dataset.mood = mood;
}

function say(text) {
  bubbleEl.textContent = text;
  restartAnimation(bubbleEl, "pop");
}

function shoveBoard() {
  restartAnimation(mascotArtEl, "push");
  restartAnimation(boardWrapEl, "shake");
}

// When the language changes she must not keep talking in the old language
function silenceMochi() {
  say("");
}

function pushWhenClicked() {
  if (isGameRunning) mochi("push");
}

mascotArtEl.addEventListener("click", pushWhenClicked);
