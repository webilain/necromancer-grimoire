const tabs=[...document.querySelectorAll('[role="tab"]')];
function selectSchool(index,focus=false){tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;document.getElementById(tab.getAttribute('aria-controls')).hidden=i!==index;});if(focus)tabs[index].focus();scheduleNav();}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>selectSchool(i));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(i+1)%tabs.length;else if(event.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();selectSchool(next,true);}});});
const toc=[...document.querySelectorAll('.toc-link')];
const sections=toc.map(link=>document.querySelector(link.getAttribute('href')));
const navGroups=[...document.querySelectorAll('.toc-group')];
function expandNavigation(hash){
  const link=toc.find(item=>item.hash===hash);
  const group=link?.closest('.toc-group');
  if(group)group.open=true;
}
expandNavigation(window.location.hash);
let ticking=false;
function updateNav(){
  const scrollPadding=Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0;
  let current=sections[0];
  for(const section of sections){
    // Anchor navigation adds the page's scroll padding and the target's scroll margin.
    const scrollMargin=Number.parseFloat(getComputedStyle(section).scrollMarginTop)||0;
    if(section.getBoundingClientRect().top<=scrollPadding+scrollMargin+2)current=section;
    else break;
  }
  // The final section can be too short to reach the anchor line at the end of the page.
  if(window.scrollY>0&&window.scrollY+window.innerHeight>=document.documentElement.scrollHeight-2)current=sections.at(-1);
  toc.forEach(link=>{const active=link.hash==='#'+current.id;link.classList.toggle('active',active);if(active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  navGroups.forEach(group=>group.classList.toggle('has-active',!!group.querySelector('.toc-link.active')));
  const activeLink=toc.find(link=>link.hash==='#'+current.id);
  if(activeLink){
    const group=activeLink.closest('.toc-group');
    const visibleEntry=group&&!group.open?group.querySelector('summary'):activeLink;
    const container=document.querySelector(window.matchMedia('(max-width:760px)').matches?'.sidebar nav':'.sidebar-inner');
    const bounds=container.getBoundingClientRect();
    const linkBounds=visibleEntry.getBoundingClientRect();
    // Keep the active entry visible without scrolling the article itself.
    if(linkBounds.top<bounds.top+8)container.scrollTop-=bounds.top+8-linkBounds.top;
    else if(linkBounds.bottom>bounds.bottom-8)container.scrollTop+=linkBounds.bottom-bounds.bottom+8;
  }
  ticking=false;
}
function scheduleNav(){if(!ticking){requestAnimationFrame(updateNav);ticking=true;}}
window.addEventListener('scroll',scheduleNav,{passive:true});
window.addEventListener('scrollend',scheduleNav);
window.addEventListener('resize',scheduleNav);
window.addEventListener('hashchange',scheduleNav);
window.addEventListener('load',scheduleNav);
document.addEventListener('toggle',scheduleNav,true);
updateNav();
let closedBeforePrint=[];
window.addEventListener('beforeprint',()=>{closedBeforePrint=[...document.querySelectorAll('details:not([open])')];closedBeforePrint.forEach(item=>item.open=true);});
window.addEventListener('afterprint',()=>closedBeforePrint.forEach(item=>item.open=false));
document.getElementById('print').addEventListener('click',()=>window.print());
function revealAnchor(hash){
  let id;try{id=decodeURIComponent(hash.slice(1));}catch{return null;}
  const target=id?document.getElementById(id):null;
  if(!target)return null;
  let changed=false;
  const panel=target.closest('.school-panel');
  if(panel?.hidden){
    const index=tabs.findIndex(tab=>tab.getAttribute('aria-controls')===panel.id);
    if(index>=0){selectSchool(index);changed=true;}
  }
  for(let node=target;node;node=node.parentElement){
    if(node.tagName==='DETAILS'&&!node.open){node.open=true;changed=true;}
  }
  return changed?target:null;
}
document.addEventListener('click',event=>{
  const link=event.target.closest?.('a[href^="#"]');
  if(link)revealAnchor(link.hash);
},true);
function revealCurrentAnchor(){
  expandNavigation(window.location.hash);
  const revealed=revealAnchor(window.location.hash);
  if(revealed)requestAnimationFrame(()=>{revealed.scrollIntoView({block:'start'});scheduleNav();});
}
window.addEventListener('hashchange',revealCurrentAnchor);
revealCurrentAnchor();
