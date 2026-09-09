const values = ['Kindness','Courage','Curiosity','Independence','Creativity','Responsibility','Cooperation','Resilience'];
const selected = new Set(['Kindness','Curiosity']);
const $ = id => document.getElementById(id);
const status = $('status'); const valuesEl = $('values');
values.forEach(v=>{const b=document.createElement('button');b.type='button';b.className='chip'+(selected.has(v)?' active':'');b.textContent=v;b.onclick=()=>{selected.has(v)?selected.delete(v):selected.add(v);b.classList.toggle('active')};valuesEl.appendChild(b)});
let saved=[]; try{saved=JSON.parse(localStorage.getItem('moonbeamStories')||'[]');if(!Array.isArray(saved))saved=[]}catch{saved=[]}
let currentBook = null;
renderLibrary(); $('generate').onclick=generateStory;

async function generateStory(){
 const child={name:$('name').value.trim(),age:Number($('age').value),interests:$('interests').value.trim(),dislikes:$('dislikes').value.trim(),length:$('length').value,tone:$('tone').value,values:[...selected]};
 if(!child.name){status.textContent='Give me a name or nickname first.';return}
 if(!Number.isFinite(child.age)||child.age<3||child.age>12){status.textContent='Please choose an age from 3 to 12.';return}
 const button=$('generate');button.disabled=true;status.textContent='Writing tonight’s adventure…';
 try{
  const response=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({child})});
  const raw=await response.text(); let data=null; try{data=JSON.parse(raw)}catch{}
  if(!response.ok){let msg=data?.error; if(typeof msg!=='string')msg=JSON.stringify(msg||raw); throw new Error(msg||`Story service failed (${response.status})`)}
  if(!data?.story)throw new Error('The story service did not return a story.');
  renderStory(data.story,data.image,child);
 }catch(e){console.error('Moonbeam generation error:',e);status.innerHTML='<span class="error">'+escapeHtml(e?.message||String(e))+'</span>'}
 finally{button.disabled=false}
}

function buildBook(s,image,child){
 const pages = Array.isArray(s.pages) ? s.pages : [];
 return {title:s.title||'Tonight’s Adventure', opening:s.opening||'', pages, closing:s.closing||'', image:image||null, child};
}

function renderStory(s,image,child){
 currentBook=buildBook(s,image,child);
 const el=$('story'); el.classList.remove('hidden');
 el.innerHTML=`<div class="book-shell">
   <div class="book-cover-head"><span>MOONBEAM STORIES</span><span>Tonight’s adventure</span></div>
   <div id="book" class="book"></div>
   <div class="book-controls">
     <button class="secondary" id="prevPage" type="button">‹ Previous</button>
     <div class="page-indicator" id="pageIndicator"></div>
     <button class="primary turn" id="nextPage" type="button">Turn page ›</button>
   </div>
   <div class="actions">
     <button class="secondary" id="save" type="button">♡ Save story</button>
     <button class="secondary" id="newStory" type="button">↟ New story</button>
   </div>
 </div>`;
 renderBookPage(0);
 $('save').onclick=()=>{saved.unshift({title:currentBook.title,story:{title:currentBook.title,opening:currentBook.opening,pages:currentBook.pages,closing:currentBook.closing},image:currentBook.image,child:currentBook.child,at:new Date().toISOString()});saved=saved.slice(0,12);localStorage.setItem('moonbeamStories',JSON.stringify(saved));renderLibrary();$('save').textContent='♥ Saved'};
 $('newStory').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
 el.scrollIntoView({behavior:'smooth'});
}

function renderBookPage(index){
 const book=currentBook; const total=book.pages.length+2;
 const clamped=Math.max(0,Math.min(index,total-1)); book.currentPage=clamped;
 const isOpening=clamped===0, isClosing=clamped===total-1;
 let text='', illustrationPrompt='', imageSrc=null, label='';
 if(isOpening){text=book.opening;label='The beginning';illustrationPrompt='A dreamy moonlit opening scene for a classic children’s storybook';}
 else if(isClosing){text=book.closing;label='The end';illustrationPrompt='A peaceful bedtime scene beneath a glowing moon';}
 else {const p=book.pages[clamped-1]||{};text=p.text||'';illustrationPrompt=p.illustration_prompt||'A charming children’s storybook scene';imageSrc=p.image||null;label=`Page ${clamped}`;}
 const bookEl=$('book');
 bookEl.innerHTML=`<div class="paper left-page">
   <div class="page-number">${isOpening?'☾':clamped}</div>
   <div class="page-content"><div class="chapter-label">${escapeHtml(label)}</div><div class="story-text">${escapeHtml(text)}</div></div>
   <div class="page-footer">Moonbeam Stories</div>
 </div>
 <div class="paper right-page">
   <div class="page-number">${isClosing?'☾':(clamped+1)}</div>
   <div class="illustration-frame">${imageSrc?`<img src="${escapeHtml(imageSrc)}" alt="Story illustration">`:`<div class="illustration-placeholder"><div class="moon">☾</div><div class="stars">✦ &nbsp; · &nbsp; ✧ &nbsp; · &nbsp; ✦</div><p>Illustration</p><small>${escapeHtml(illustrationPrompt)}</small></div>`}</div>
   <div class="page-footer">✦</div>
 </div>`;
 $('prevPage').disabled=clamped===0;
 $('nextPage').disabled=clamped===total-1;
 $('nextPage').textContent=clamped===total-1?'The End':'Turn page ›';
 $('pageIndicator').textContent=`${clamped+1} / ${total}`;
}

$('story').addEventListener('click',e=>{
 if(e.target.id==='prevPage')renderBookPage((currentBook.currentPage||0)-1);
 if(e.target.id==='nextPage')renderBookPage((currentBook.currentPage||0)+1);
});

function renderLibrary(){const l=$('library');if(!saved.length){l.innerHTML='<p class="muted">Your saved stories will appear here.</p>';return}l.innerHTML=saved.map((x,i)=>`<button type="button" onclick="openSaved(${i})">📖 ${escapeHtml(x.title)} <small>— ${escapeHtml(x.child.name)}</small></button>`).join('')}
window.openSaved=i=>{const x=saved[i];if(x)renderStory(x.story,x.image,x.child)};
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
