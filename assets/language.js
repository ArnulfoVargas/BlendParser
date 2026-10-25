// Real links keep both languages available without JavaScript.
// Shared anchor IDs retain the reader's place when switching languages.
for (const link of document.querySelectorAll('[data-language]')) {
 const update = () => { link.hash = location.hash; };
 update();
 addEventListener('hashchange', update);
}
