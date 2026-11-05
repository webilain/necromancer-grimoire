(()=>{
  const english=/\/en(?:\.html)?\/?$/.test(location.pathname);
  const language=english?'en':'ru';
  const url=new URL(location.href);
  let saved=null;try{saved=localStorage.getItem('necromancer-language');}catch{}
  const requested=url.searchParams.get('lang');
  const wanted=requested==='en'||requested==='ru'?requested:saved;
  if(wanted&&wanted!==language){
    url.pathname=url.pathname.replace(/[^/]*$/,wanted==='en'?'en.html':'index.html');
    url.searchParams.set('lang',wanted);location.replace(url.href);return;
  }
  const switcher=document.getElementById('language-switch');
  if(!switcher)return;
  switcher.querySelectorAll('a').forEach(link=>{
    const target=link.dataset.language;
    link.setAttribute('aria-current',target===language?'true':'false');
    link.addEventListener('click',event=>{
      event.preventDefault();try{localStorage.setItem('necromancer-language',target);}catch{}
      const next=new URL(location.href);
      next.pathname=next.pathname.replace(/[^/]*$/,target==='en'?'en.html':'index.html');
      next.searchParams.set('lang',target);location.assign(next.href);
    });
  });
})();
