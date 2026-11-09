// Setzt das Farbschema vor dem ersten Zeichnen, damit die Seite nicht kurz hell aufblitzt.
try {
  var t = localStorage.getItem('lernkompass-theme');
  var dunkel = t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (dunkel) document.documentElement.classList.add('dark');
} catch (e) {
  /* ignorieren */
}
