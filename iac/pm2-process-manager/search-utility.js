/**
 * Search trick for chrome in order to access the Ctrl+F the word in the huge page
 * paste in the console
 */

document.querySelectorAll('*').forEach(el => {
  el.style.maxHeight = 'none';
  el.style.height = 'auto';
  el.style.overflow = 'visible';
});