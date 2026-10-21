// Mochi, katten der driller en, mens man spiller.
// Hun er nysgerrig, mens man kigger, chokeret når man rammer rigtigt,
// og taler skrald når man laver fejl eller er for langsom.
// Nogle gange giver hun brættet et skub, så det ryster.

const IDLE_LIMIT_SECONDS = 15;
const IDLE_CHECK_INTERVAL_MS = 1000;
const REACTION_DURATION_MS = 3500;
const PUSH_CHANCE = 0.3;
const COMMENT_CHANCE = 0.5;
const RESTING_MOOD = "curious";

// Begivenheder, der sker så tit, at hun kun kommenterer nogle af dem
const FREQUENT_EVENTS = ["select", "rotate"];
const PROVOKING_EVENTS = ["slow", "wrong"];
const PLAYER_ACTION_EVENTS = ["right", "wrong", "erase", "start"];
const GAME_OVER_EVENTS = ["won", "finished", "lost"];

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
    slow: [
      "Hallo? Er du faldet i søvn?",
      "Tik tak, tik tak...",
      "Jeg kunne have taget tre lure nu.",
      "Tænker du, eller er det bare buffering?",
      "Jeg keder mig. Underhold mig.",
      "Det er et tal fra 1 til 9. Det er ikke raketvidenskab.",
      "Tag din tid. Altså, du har ikke så meget af den.",
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
    lost: [
      "Tiden er gået! Jeg sagde jo, du var for langsom.",
      "Game over. Jeg har aldrig været gladere.",
      "Det gik jo præcis, som jeg forudså.",
    ],
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
    slow: [
      "Hello? Did you fall asleep?",
      "Tick tock, tick tock...",
      "I could have taken three naps by now.",
      "Are you thinking, or just buffering?",
      "I'm bored. Entertain me.",
      "It's a number from 1 to 9. It's not rocket science.",
      "Take your time. Well, you don't have much of it.",
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
    lost: [
      "Time's up! I told you you were too slow.",
      "Game over. I've never been happier.",
      "That went exactly as I predicted.",
    ],
    start: [
      "New board. I can't wait to watch you fail.",
      "Ready? I'm watching you.",
    ],
  },
};

// Hvilket ansigt hører til hvilken begivenhed
const MOODS = {
  wrong: "trash", slow: "trash", push: "trash", erase: "trash", rotate: "trash", lost: "trash", start: "trash",
  right: "shocked", won: "shocked", finished: "shocked",
  select: RESTING_MOOD,
};

const mascotEl = document.getElementById("mascot");
const mascotArtEl = mascotEl.querySelector(".mascot-art");
const bubbleEl = document.getElementById("mascot-bubble");
const boardWrapEl = document.querySelector(".board-wrap");
let lastLine = "";
let calmDownTimer = null;
let idleSeconds = 0;
let isGameRunning = false;

// Kaldes fra spillet: "select", "right", "wrong", "erase", "rotate", "start", "won", "finished", "lost"
function mochi(event) {
  trackGameProgress(event);
  if (wantsToComment(event)) react(maybeEscalateToPush(event));
}

function trackGameProgress(event) {
  if (event === "start") isGameRunning = true;
  if (GAME_OVER_EVENTS.includes(event)) isGameRunning = false;
  if (PLAYER_ACTION_EVENTS.includes(event)) idleSeconds = 0;
}

// Hun gider ikke kommentere hvert eneste klik
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
  // Efter spillets slutning bliver hun i sin reaktion
  if (isGameRunning) calmDownTimer = setTimeout(calmDown, REACTION_DURATION_MS);
}

function calmDown() {
  setMood(RESTING_MOOD);
  say("");
}

// Vælger en anden replik end sidst, så hun ikke gentager sig selv
function pickLine(event) {
  const lines = LINES[currentLanguage][event];
  const freshLines = lines.filter((line) => line !== lastLine);
  lastLine = freshLines[Math.floor(Math.random() * freshLines.length)] || lines[0];
  return lastLine;
}

// Stemningen nulstilles først, så ansigtets animation starter forfra
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

// Når sproget skiftes, skal hun ikke blive ved med at tale på det gamle sprog
function silenceMochi() {
  say("");
}

function pushWhenClicked() {
  if (isGameRunning) mochi("push");
}

function teaseWhenIdle() {
  if (!isGameRunning || document.hidden) return;
  idleSeconds++;
  if (idleSeconds < IDLE_LIMIT_SECONDS) return;
  idleSeconds = 0;
  mochi("slow");
}

mascotArtEl.addEventListener("click", pushWhenClicked);
setInterval(teaseWhenIdle, IDLE_CHECK_INTERVAL_MS);
