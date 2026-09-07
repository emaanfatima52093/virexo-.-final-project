/* Virexo Local Marketplace — no paid APIs/domain required.
   Uses the included Express + SQLite backend when available, with localStorage fallback. */
(function () {
  const API = window.VIREXO_API_BASE || '';
  const key = 'virexo-local-profile';
  const profile = (() => { try { return JSON.parse(localStorage.getItem(key)) || {}; } catch { return {}; } })();
  const $ = (s) => document.querySelector(s);
  const toast = (m, type='success') => window.showToast ? window.showToast(m, type) : alert(m);

  async function api(path, options={}) {
    const r = await fetch(`${API}${path}`, { ...options, headers: {'Content-Type':'application/json', ...(options.headers||{})} });
    const data = await r.json().catch(()=>({}));
    if (!r.ok) throw new Error(data.error || 'Local server request failed');
    return data;
  }

  // Convert the existing project form into a real marketplace request as well as the original inquiry.
  $('#contactForm')?.addEventListener('submit', async () => {
    const payload = {
      client_name: $('#name')?.value.trim(), client_email: $('#email')?.value.trim(),
      service: $('#service')?.value, budget: $('#budget')?.value, message: $('#message')?.value.trim(),
      provider_id: localStorage.getItem('virexo-selected-provider-id') || null,
      provider_name: localStorage.getItem('virexo-selected-provider-name') || null
    };
    if (!payload.client_name || !payload.client_email || !payload.service || !payload.message) return;
    try {
      const saved = await api('/api/marketplace/requests', {method:'POST', body:JSON.stringify(payload)});
      localStorage.setItem('virexo-last-request-id', saved.id);
      localStorage.setItem('virexo-project-status', saved.status);
      toast('Project request saved to the local Virexo marketplace.');
    } catch {
      localStorage.setItem('virexo-offline-request', JSON.stringify({...payload, status:'Pending', created_at:new Date().toISOString()}));
    }
  }, true);

  // Provider request button remembers the selected provider for the project form.
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-provider-request]');
    if (!b) return;
    const p = window.PROVIDERS?.find(x => x.id === b.dataset.providerRequest);
    if (p) { localStorage.setItem('virexo-selected-provider-id', p.id); localStorage.setItem('virexo-selected-provider-name', p.name); }
  });

  // Persist consultation bookings to SQLite when the existing booking UI is used.
  $('#bookBtn')?.addEventListener('click', async () => {
    const name = $('#name')?.value.trim() || profile.name || 'Guest Client';
    const email = $('#email')?.value.trim() || profile.email || 'guest@local.virexo';
    const date = $('#bookingDate')?.value; const time = $('#bookingTime')?.value;
    if (!date || !time) return;
    try { await api('/api/marketplace/bookings', {method:'POST', body:JSON.stringify({client_name:name, client_email:email, provider_id:localStorage.getItem('virexo-selected-provider-id'), provider_name:localStorage.getItem('virexo-selected-provider-name'), date, time})}); }
    catch { localStorage.setItem('virexo-last-booking', JSON.stringify({name,email,date,time,status:'Requested'})); }
  });

  // Persist workspace chat messages. The UI still works offline.
  $('#workspaceChatForm')?.addEventListener('submit', async () => {
    const input = $('#workspaceChatInput'); const message = input?.value.trim();
    if (!message) return;
    try { await api('/api/marketplace/messages', {method:'POST', body:JSON.stringify({request_id:localStorage.getItem('virexo-last-request-id'), sender:'Client', message})}); }
    catch { const arr = JSON.parse(localStorage.getItem('virexo-messages') || '[]'); arr.push({sender:'Client',message,created_at:new Date().toISOString()}); localStorage.setItem('virexo-messages',JSON.stringify(arr)); }
  }, true);

  // Turn the demo tracker into a persisted tracker for the latest request.
  $('#advanceProjectBtn')?.addEventListener('click', async () => {
    const id = localStorage.getItem('virexo-last-request-id'); if (!id) return;
    const labels = ['Pending','Accepted','In Progress','Review','Completed'];
    const current = localStorage.getItem('virexo-project-status') || 'In Progress';
    const next = labels[Math.min(labels.indexOf(current) + 1, labels.length - 1)];
    try { const saved = await api(`/api/marketplace/requests/${id}`, {method:'PATCH',body:JSON.stringify({status:next})}); localStorage.setItem('virexo-project-status',saved.status); }
    catch { localStorage.setItem('virexo-project-status',next); }
  }, true);
})();
