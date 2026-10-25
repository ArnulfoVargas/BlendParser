// Real links keep both languages available without JavaScript.
// Shared anchor IDs retain the reader's place when switching languages.
for (const link of document.querySelectorAll('[data-language]')) {
 const update = () => { link.hash = location.hash; };
 update();
 addEventListener('hashchange', update);
}
const menu=document.querySelector('.language-switch');
document.addEventListener('click',event=>{if(menu&&!menu.contains(event.target))menu.open=false;});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&menu?.open){menu.open=false;menu.querySelector('summary').focus();}
});
