(() => {
 const main=document.querySelector('.hub-main'),form=document.querySelector('.hub-tools');
 if(!main||Number(main.dataset.publishedCount)<12)return;
 form.hidden=false;
 const grid=document.getElementById('hub-grid'),pager=document.getElementById('hub-pagination'),status=document.querySelector('.hub-results');
 const upcoming=[...grid.querySelectorAll('.upcoming-card')].map(card=>card.cloneNode(true));
 let items=null,currentPage=1,timer;
 const element=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
 function card(a){
  const video=a.format==='video',outer=element('article','hub-card'),picture=element('a','hub-image');picture.href=a.path;
  const image=element('img');image.src=a.guest.portrait;image.alt=a.guest.name;image.loading='lazy';picture.append(image);
  if(video){const play=element('span','play-mark','▶');play.setAttribute('aria-hidden','true');picture.append(play);if(a.video?.duration)picture.append(element('span','duration',a.video.duration));}
  const copy=element('div','card-copy'),label=element('p','format-label',video?'Video interview':'Written interview');
  const date=element('time',null,' · Published '+new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'America/Toronto'}).format(new Date(a.published)));date.dateTime=a.published;label.append(date);
  copy.append(label,element('p','guest-name',a.guest.name),element('p','guest-role',a.guest.role));
  const heading=element('h2'),link=element('a',null,a.headline);link.href=a.path;heading.append(link);copy.append(heading,element('p','card-excerpt',a.excerpt));
  const cta=element('a','read-interview',(video?'Watch':'Read')+' interview →');cta.href=a.path;copy.append(cta);outer.append(picture,copy);return outer;
 }
 async function render(focusPage=false){
  try{
   if(!items){const response=await fetch('/interviews/data/search.json');if(!response.ok)throw Error();items=await response.json();}
   const format=new FormData(form).get('format'),query=form.elements.search.value.trim().toLocaleLowerCase();
   const filtered=items.filter(a=>(format==='all'||a.format===format)&&[a.guest.name,a.guest.role,a.headline].some(s=>s.toLocaleLowerCase().includes(query)));
   const pages=Math.max(1,Math.ceil(filtered.length/12));currentPage=Math.min(currentPage,pages);
   grid.replaceChildren(...filtered.slice((currentPage-1)*12,currentPage*12).map(card));
   if(!query&&format==='all'&&currentPage===1)grid.append(...upcoming.map(card=>card.cloneNode(true)));
   status.hidden=false;status.textContent=filtered.length+' published interview'+(filtered.length===1?'':'s')+(filtered.length?' · Page '+currentPage+' of '+pages: ' · No matches');
   pager.replaceChildren();
   if(pages>1){const nav=element('nav','hub-pagination');nav.setAttribute('aria-label','Interview pages');for(let n=1;n<=pages;n++){const button=element('button',null,String(n));button.type='button';button.dataset.page=n;if(n===currentPage)button.setAttribute('aria-current','page');button.addEventListener('click',()=>{currentPage=n;render(true);});nav.append(button);}pager.append(nav);if(focusPage)nav.querySelector('[data-page="'+currentPage+'"]').focus();}
  }catch{status.hidden=false;status.textContent='Search is temporarily unavailable. Please use the interview page links.';}
 }
 form.addEventListener('submit',event=>{event.preventDefault();currentPage=1;render();});
 form.addEventListener('change',()=>{currentPage=1;render();});
 form.elements.search.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{currentPage=1;render();},180);});
})();
