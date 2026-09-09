const values = ['Kindness','Courage','Curiosity','Independence','Creativity','Responsibility','Cooperation','Resilience'];
const selected = new Set(['Kindness','Curiosity']);
const $ = id => document.getElementById(id);
const status = $('status'); const valuesEl = $('values');
values.forEach(v=>{const b=document.createElement('button');b.type='button';b.className='chip'+(selected.has(v)?' active':'');b.textContent=v;b.onclick=()=>{selected.has(v)?selected.delete(v):selected.add(v);b.classList.toggle('active')};valuesEl.appendChild(b)});
let saved=[]; try{saved=JSON.parse(localStorage.getItem('moonbeamStories')||'[]');if(!Array.isArray(saved))saved=[]}catch{saved=[]}
let currentBook = null;
let illustrationCache = new Map();
renderLibrary(); $('generate').onclick=generateStory;

async function generateStory(){
 const child={name:$('name').value.trim(),age:Number($('age').value),interests:$('interests').value.trim(),dislikes:$('dislikes').value.trim(),length:$('length').value,tone:$('tone').value,language:$('language').value,values:[...selected]};
 if(!child.name){status.textContent='Give me a name or nickname first.';return}
 if(!Number.isFinite(child.age)||child.age<3||child.age>12){status.textContent='Please choose an age from 3 to 12.';return}
 const button=$('generate');button.disabled=true;status.textContent='Writing tonight’s adventure…';
 try{
  const response=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({child})});
  const raw=await response.text(); let data=null; try{data=JSON.parse(raw)}catch{}
  if(!response.ok){let msg=data?.error; if(typeof msg!=='string')msg=JSON.stringify(msg||raw); throw new Error(msg||`Story service failed (${response.status})`)}
  if(!data?.story)throw new Error('The story service did not return a story.');
  renderStory(data.story,null,child);
 }catch(e){console.error('Moonbeam generation error:',e);status.innerHTML='<span class="error">'+escapeHtml(e?.message||String(e))+'</span>'}
 finally{button.disabled=false}
}

function buildBook(s,image,child){
 const pages = Array.isArray(s.pages) ? s.pages : [];
 return {title:s.title||'Tonight’s Adventure', opening:s.opening||'', character_bible:s.character_bible||'', pages, closing:s.closing||'', image:image||null, child, storyId:Date.now()+'-'+Math.random().toString(36).slice(2)};
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
   <p class="illustration-note" id="illustrationNote">Illustrations are created as you turn the pages.</p>
   <div class="actions">
     <button class="secondary" id="save" type="button">♡ Save story</button>
     <button class="secondary" id="newStory" type="button">↟ New story</button>
   </div>
 </div>`;
 renderBookPage(0);
 $('save').onclick=()=>{
   const cleanPages=currentBook.pages.map(p=>({text:p.text||'',illustration_prompt:p.illustration_prompt||''}));
   saved.unshift({title:currentBook.title,story:{title:currentBook.title,opening:currentBook.opening,character_bible:currentBook.character_bible,pages:cleanPages,closing:currentBook.closing},image:null,child:currentBook.child,at:new Date().toISOString()});
   saved=saved.slice(0,12);localStorage.setItem('moonbeamStories',JSON.stringify(saved));renderLibrary();$('save').textContent='♥ Saved';
 };
 $('newStory').onclick=()=>window.scrollTo({top:0,behavior:'smooth'});
 el.scrollIntoView({behavior:'smooth'});
}

function illustrationKey(book,index){return `${book.storyId}:${index}`}

async function loadIllustration(index, prompt, silent=false){
 const book=currentBook;
 if(!book || !prompt) return;
 const key=illustrationKey(book,index);
 if(illustrationCache.has(key)) {
   if(!silent) renderIllustrationIntoPage(index,illustrationCache.get(key));
   return;
 }
 const frame=document.querySelector('.illustration-frame');
 if(!silent && (!frame || book.currentPage!==index)) return;
 if(!silent && frame) frame.innerHTML='<div class="illustration-loading"><div class="spinner"></div><p>Painting this page…</p><small>Moonbeam is creating the picture.</small></div>';
 try{
   const response=await fetch('/api/illustrate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
     prompt,
     style:`Classic premium children's storybook illustration. Consistent recurring characters: ${book.character_bible || 'Keep the main child character visually consistent across the book.'}`
   })});
   const raw=await response.text(); let data=null; try{data=JSON.parse(raw)}catch{}
   if(!response.ok) throw new Error(data?.error || `Illustration service failed (${response.status})`);
   if(!data?.image) throw new Error('The illustration service returned no image.');
   illustrationCache.set(key,data.image);
   if(currentBook===book && book.currentPage===index) renderIllustrationIntoPage(index,data.image);
   return data.image;
 }catch(e){
   console.error('Moonbeam illustration error:',e);
   if(!silent && currentBook===book && book.currentPage===index){
     const f=document.querySelector('.illustration-frame');
     if(f)f.innerHTML=`<div class="illustration-error"><div class="moon">☾</div><p>We couldn't paint this page just now.</p><small>${escapeHtml(e?.message||String(e))}</small><button class="secondary retry-illustration" type="button">Try again</button></div>`;
     const retry=document.querySelector('.retry-illustration'); if(retry)retry.onclick=()=>loadIllustration(index,prompt,false);
   }
 }
}

function getIllustrationPrompt(index){
 const book=currentBook; if(!book)return '';
 const total=book.pages.length+2;
 if(index===0)return `Opening scene for “${book.title}”. A beautiful establishing illustration introducing the main characters and story world. ${book.pages[0]?.illustration_prompt||''}`;
 if(index===total-1)return `Peaceful final scene for “${book.title}”, showing the characters safe, content and ready for bedtime. ${book.pages[book.pages.length-1]?.illustration_prompt||''}`;
 return book.pages[index-1]?.illustration_prompt||'A charming children’s storybook scene';
}

// Start the current illustration immediately, while also quietly preparing the next
// two pages. This makes page turning feel much faster without making the reader wait
// for all the artwork before the book can open.
function prefetchIllustrations(index){
 const book=currentBook; if(!book)return;
 const total=book.pages.length+2;
 [index+1,index+2].filter(i=>i<total).forEach(i=>loadIllustration(i,getIllustrationPrompt(i),true));
}

function renderIllustrationIntoPage(index,image){
 if(!currentBook || currentBook.currentPage!==index)return;
 const frame=document.querySelector('.illustration-frame');
 if(frame)frame.innerHTML=`<img src="${escapeHtml(image)}" alt="Story illustration">`;
}

function renderBookPage(index){
 const book=currentBook; const total=book.pages.length+2;
 const clamped=Math.max(0,Math.min(index,total-1)); book.currentPage=clamped;
 const isOpening=clamped===0, isClosing=clamped===total-1;
 let text='', illustrationPrompt='', label='';
 if(isOpening){text=book.opening;label='The beginning';}
 else if(isClosing){text=book.closing;label='The end';}
 else {const p=book.pages[clamped-1]||{};text=p.text||'';label=`Page ${clamped}`;}
 illustrationPrompt=getIllustrationPrompt(clamped);
 const bookEl=$('book');
 bookEl.innerHTML=`<div class="paper left-page">
   <div class="page-number">${isOpening?'☾':clamped}</div>
   <div class="page-content"><div class="chapter-label">${escapeHtml(label)}</div><div class="story-text">${escapeHtml(text)}</div></div>
   <div class="page-footer">Moonbeam Stories</div>
 </div>
 <div class="paper right-page">
   <div class="page-number">${isClosing?'☾':(clamped+1)}</div>
   <div class="illustration-frame"><div class="illustration-loading"><div class="spinner"></div><p>Painting this page…</p><small>Turn the page and Moonbeam will create the picture.</small></div></div>
   <div class="page-footer">✦</div>
 </div>`;
 $('prevPage').disabled=clamped===0;
 $('nextPage').disabled=clamped===total-1;
 $('nextPage').textContent=clamped===total-1?'The End':'Turn page ›';
 $('pageIndicator').textContent=`${clamped+1} / ${total}`;
 loadIllustration(clamped,illustrationPrompt,false);
 prefetchIllustrations(clamped);
}

$('story').addEventListener('click',e=>{
 if(e.target.id==='prevPage')renderBookPage((currentBook.currentPage||0)-1);
 if(e.target.id==='nextPage')renderBookPage((currentBook.currentPage||0)+1);
});

function renderLibrary(){const l=$('library');if(!saved.length){l.innerHTML='<p class="muted">Your saved stories will appear here.</p>';return}l.innerHTML=saved.map((x,i)=>`<button type="button" onclick="openSaved(${i})">📖 ${escapeHtml(x.title)} <small>— ${escapeHtml(x.child.name)}</small></button>`).join('')}
window.openSaved=i=>{const x=saved[i];if(x)renderStory(x.story,x.image,x.child)};
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
