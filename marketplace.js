/* Virexo Marketplace enhancements — front-end demo interactions */
(function () {
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const store = { get(k, fallback){ try{return JSON.parse(localStorage.getItem(k)) ?? fallback}catch(e){return fallback}}, set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}} };
  let compare = store.get('virexo-compare', []);
  let favorites = store.get('virexo-favorites', []);

  const providerById = id => (window.PROVIDERS || []).find(p => p.id === id);
  const renderCompare = () => {
    const el = $('#compareList'); if (!el) return;
    if (!compare.length) { el.innerHTML='<div class="workspace-empty">No providers selected yet. Use <strong>Compare</strong> on a provider card.</div>'; return; }
    el.innerHTML = `<div class="compare-table"><div class="compare-head"><span>Metric</span>${compare.map(id=>`<strong>${providerById(id)?.name||'Provider'}</strong>`).join('')}</div>${['rating','projects','rate','availability'].map(key=>`<div class="compare-row"><span>${key[0].toUpperCase()+key.slice(1)}</span>${compare.map(id=>`<b>${providerById(id)?.[key]||'—'}</b>`).join('')}</div>`).join('')}</div>`;
  };
  const renderFavorites = () => {
    const el=$('#favoriteList'); if(!el)return;
    if(!favorites.length){el.innerHTML='<div class="workspace-empty">Your saved providers will appear here.</div>';return;}
    el.innerHTML=favorites.map(id=>{const p=providerById(id); return p?`<div class="favorite-item"><span class="provider-avatar favorite-avatar">${p.initials}</span><div><strong>${p.name}</strong><small>${p.role}</small></div><button type="button" class="icon-action remove-fav" data-remove-fav="${p.id}" aria-label="Remove ${p.name}">×</button></div>`:''}).join('');
  };
  const syncProviderButtons=()=>{$$('[data-favorite-id]').forEach(b=>{b.classList.toggle('saved',favorites.includes(b.dataset.favoriteId));b.textContent=favorites.includes(b.dataset.favoriteId)?'♥':'♡'});$$('[data-compare-id]').forEach(b=>{b.classList.toggle('selected',compare.includes(b.dataset.compareId));b.textContent=compare.includes(b.dataset.compareId)?'Added':'Compare'});};
  document.addEventListener('click',e=>{
    const fav=e.target.closest('[data-favorite-id]');
    if(fav){const id=fav.dataset.favoriteId; favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id].slice(-6);store.set('virexo-favorites',favorites);renderFavorites();syncProviderButtons();return;}
    const rem=e.target.closest('[data-remove-fav]'); if(rem){favorites=favorites.filter(x=>x!==rem.dataset.removeFav);store.set('virexo-favorites',favorites);renderFavorites();syncProviderButtons();return;}
    const cmp=e.target.closest('[data-compare-id]'); if(cmp){const id=cmp.dataset.compareId;if(compare.includes(id))compare=compare.filter(x=>x!==id);else if(compare.length<3)compare.push(id);else {window.showToast?.('Compare up to 3 providers at a time.','error');return;}store.set('virexo-compare',compare);renderCompare();syncProviderButtons();return;}
  });
  $('#clearCompareBtn')?.addEventListener('click',()=>{compare=[];store.set('virexo-compare',compare);renderCompare();syncProviderButtons();});

  // Smart recommendation engine (demo rules, no API required)
  $('#recommendBtn')?.addEventListener('click',()=>{
    const q=($('#recommendInput')?.value||'').toLowerCase(); const box=$('#recommendResults'); if(!box)return;
    if(q.length<4){box.innerHTML='<span class="recommend-note">Tell us a little more about the project.</span>';return;}
    const picks=[];
    const add=(service,why)=>{if(!picks.some(x=>x.service===service))picks.push({service,why})};
    if(/shop|store|ecommerce|product|checkout|online/.test(q)) add('E-Commerce','Best fit for stores, checkout and product flows.');
    if(/ai|bot|assistant|automat|workflow|chat/.test(q)) add('AI & Automation','Useful for assistants, workflows and repetitive tasks.');
    if(/app|android|ios|mobile/.test(q)) add('Mobile App Development','Ideal for iOS, Android and cross-platform products.');
    if(/design|ui|ux|brand|figma/.test(q)) add('UI/UX Design','A strong fit for user journeys and polished interfaces.');
    if(/seo|marketing|growth|sales|traffic/.test(q)) add('SEO & Growth Marketing','Designed for discoverability and conversion growth.');
    if(/website|web|saas|portal/.test(q)) add('Web Development','Great for business websites, portals and SaaS products.');
    if(!picks.length) add('Web Development','A flexible starting point for most digital projects.');
    box.innerHTML=picks.slice(0,3).map(x=>`<button class="recommend-chip" type="button" data-recommend-service="${x.service}"><strong>${x.service}</strong><small>${x.why}</small></button>`).join('');
  });
  $('#recommendResults')?.addEventListener('click',e=>{const b=e.target.closest('[data-recommend-service]');if(!b)return; const s=$('#service');if(s){const opt=[...s.options].find(o=>o.text===b.dataset.recommendService||o.value===b.dataset.recommendService);if(opt)s.value=opt.value;} document.querySelector('#contact')?.scrollIntoView({behavior:'smooth'});});

  // Project tracker
  const states=[['Request',0],['Accepted',20],['In Progress',60],['Review',85],['Completed',100]]; let stateIndex=2;
  $('#advanceProjectBtn')?.addEventListener('click',()=>{stateIndex=Math.min(stateIndex+1,states.length-1);const pct=states[stateIndex][1];$('#projectProgressText').textContent=pct+'%';$('#projectProgressBar').style.width=pct+'%';$$('.project-steps span').forEach((s,i)=>s.classList.toggle('done',i<stateIndex));$$('.project-steps span').forEach((s,i)=>s.classList.toggle('active',i===stateIndex));});

  // Package cards prefill request
  $$('.package-mini').forEach(btn=>btn.addEventListener('click',()=>{const msg=$('#message');if(msg)msg.value=`I'm interested in the ${btn.dataset.package} service package.\n\nProject goals: `;$('#contact')?.scrollIntoView({behavior:'smooth'});}));
  // Booking
  const date=$('#bookingDate'); if(date){const d=new Date();d.setDate(d.getDate()+1);date.min=d.toISOString().split('T')[0];date.value=date.min;}
  $('#bookBtn')?.addEventListener('click',()=>{const status=$('#bookingStatus');status.textContent=`Consultation requested for ${date?.value||'selected date'} at ${$('#bookingTime')?.value||'selected time'}.`;status.classList.add('success');window.showToast?.('Consultation request saved.','success');});

  // Notifications
  const notes=[['Project request accepted','Hamza accepted your web project request.','2m ago'],['New provider match','Sara is available for your AI automation brief.','18m ago'],['Review requested','Your completed project is ready for review.','1h ago']];
  const nl=$('#notificationList'); if(nl)nl.innerHTML=notes.map(n=>`<button class="notification-item" type="button"><span class="notification-dot"></span><span><strong>${n[0]}</strong><small>${n[1]}</small></span><time>${n[2]}</time></button>`).join('');
  $$('#notificationList .notification-item').forEach(n=>n.addEventListener('click',()=>{n.classList.add('read');const c=$$('.notification-item:not(.read)').length;const badge=$('#notificationCount');if(badge)badge.textContent=c;}));

  // Demo messaging
  $('#workspaceChatForm')?.addEventListener('submit',e=>{e.preventDefault();const input=$('#workspaceChatInput');const text=input.value.trim();if(!text)return;const chat=$('#workspaceChat');chat.insertAdjacentHTML('beforeend',`<div class="chat-bubble sent"><strong>You</strong><span>${text.replace(/[<>]/g,'')}</span></div>`);input.value='';chat.scrollTop=chat.scrollHeight;setTimeout(()=>{chat.insertAdjacentHTML('beforeend','<div class="chat-bubble received"><strong>Hamza · Provider</strong><span>Thanks! I’ve received your message and will respond shortly.</span></div>');chat.scrollTop=chat.scrollHeight;},700);});

  renderCompare();renderFavorites();syncProviderButtons();
})();
