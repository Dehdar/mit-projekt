// Browseren slår stilændringer i samme frame sammen. Uden en reflow imellem
// opdager den ikke, at en klasse er fjernet og tilføjet igen, og animationen starter ikke forfra.
function forceReflow(element) {
  void element.offsetWidth;
}

function restartAnimation(element, className) {
  element.classList.remove(className);
  forceReflow(element);
  element.classList.add(className);
}
