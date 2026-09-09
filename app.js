const values = ['Kindness','Courage','Curiosity','Independence','Creativity','Responsibility','Cooperation','Resilience'];
const selected = new Set(['Kindness','Curiosity']);
const $ = id => document.getElementById(id);
const status = $('status');
const valuesEl = $('values');
values.forEach(v => { const b=document.createElement('button'); b.type='button'; b.className='chip'+(selected.has(v)?' active':''); b.textContent=v; b.onclick=()=>{ if(selected.has(v)) selected.delete(v); else selected.add(v); b.classList.toggle('active'); }; valuesEl.appendChild(b); });
let saved=[]; try { saved=JSON.parse(localStorage.getItem('moonbeamStories')||'[]'); if(!Array.isArray(saved)) saved=[]; } catch { saved=[]; }
renderLibrary();
$('generate').onclick = generateStory;
async function generateStory(){
 const child={name:$('name').value.trim(),age:Number($('age').value),interests:$('interests').value.trim(),dislikes:$('dislikes').value.trim(),length:$('length').value,tone:$('tone').value,values:[...selected]};
 if(!child.name){status.textContent='Give me a name or nickname first.';return;}
 if(!Number.isFinite(child.age)||child.age<3||child.age>12){status.textContent='Please choose an age from 3 to 12.';return;}
 const button=$('generate'); button.disabled=true; status.textContent='Writing tonight’s adventure…';
 try{
   const response = await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({child})});
   const raw = await response.text();
   let data; try { data=JSON.parse(raw); } catch { throw new Error(`The story service returned an unexpected response (${response.status}).`); }
   if(!response.ok) throw new Error(data.error || `Story service failed (${response.status}).`);
   if(!data.story) throw new Error('The story service did not return a story.');
   renderStory(data.story,data.image,child);
 }catch(e){ status.innerHTML='<span class="error">'+escapeHtml(e.message || String(e))+'</span>'; console.error(e); }
 finally{button.disabled=false;}
}
function renderStory(s,image,child){
 status.textContent=''; const el=$('story'); el.classList.remove('hidden');
 el.innerHTML=(image?`<img class="hero" src="${image}" alt="Story illustration">`:'')+`<h1>${escapeHtml(s.title)}</h1><p class="page">${escapeHtml(s.opening||'')}</p>`+(s.pages||[]).map(p=>`<article class="page">${escapeHtml(p.text||'')}</article>`).join('')+`<p class="closing">${escapeHtml(s.closing||'')}</p><div class="actions"><button class="secondary" id="save" type="button">♡ Save story</button><button class="secondary" id="newStory" type="button">↟ New story</button></div>`;
 $('save').onclick=()=>{saved.unshift({title:s.title,story:s,image,child,at:new Date().toISOString()});saved=saved.slice(0,12);localStorage.setItem('moonbeamStories',JSON.stringify(saved));renderLibrary();$('save').textContent='♥ Saved';};
 $('newStory').onclick=()=>window.scrollTo({top:0,behavior:'smooth'}); el.scrollIntoView({behavior:'smooth'});
}
function renderLibrary(){const l=$('library'); if(!saved.length){l.innerHTML='<p class="muted">Your saved stories will appear here.</p>';return;} l.innerHTML=saved.map((x,i)=>`<button type="button" onclick="openSaved(${i})">📖 ${escapeHtml(x.title)} <small>— ${escapeHtml(x.child.name)}</small></button>`).join('');}
window.openSaved=i=>{const x=saved[i];if(x)renderStory(x.story,x.image,x.child);};
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
