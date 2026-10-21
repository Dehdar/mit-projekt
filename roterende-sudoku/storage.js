// localStorage kan være slået fra (privat vindue, blokerede cookies), og så skal spillet stadig virke.

function readStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}
