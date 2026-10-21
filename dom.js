// The browser batches style changes within a frame. Without a reflow in between
// it does not notice that a class was removed and added again, so the animation does not restart.
function forceReflow(element) {
  void element.offsetWidth;
}

function restartAnimation(element, className) {
  element.classList.remove(className);
  forceReflow(element);
  element.classList.add(className);
}
