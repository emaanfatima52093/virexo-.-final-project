
// Works both when Virexo is served by Express and when auth.html is opened directly.
// Direct file:// opening cannot resolve relative /api URLs, so point API calls to the local server.
const API = window.location.protocol === 'file:'
  ? 'http://localhost:3000/api/auth'
  : '/api/auth';

async function apiRequest(path, options={}) {
  let response;
  try {
    response = await fetch(API + path, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  } catch (networkError) {
    throw new Error('Cannot connect to Virexo server. Please start Virexo with start-virexo.bat and open http://localhost:3000.');
  }
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { error: text || 'Server returned an invalid response.' }; }
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}
const $=id=>document.getElementById(id);
function showMsg(text,error=false){const el=$('msg');el.textContent=text;el.style.display='block';el.style.background=error?'#fff0f0':'#eef7ff';el.style.color=error?'#a11':'#075985';}
function switchMode(signup){
  $('loginForm').style.display=signup?'none':'block'; $('signupForm').style.display=signup?'block':'none';
  $('loginTab').classList.toggle('active',!signup); $('signupTab').classList.toggle('active',signup);
  $('switchText').textContent=signup?'Already have an account?':"Don't have an account?";
  $('switchLink').textContent=signup?'Login':'Create one'; $('msg').style.display='none';
}
$('loginTab').onclick=()=>switchMode(false); $('signupTab').onclick=()=>switchMode(true); $('switchLink').onclick=()=>switchMode($('signupForm').style.display==='none');

$('loginForm').onsubmit=async e=>{
 e.preventDefault(); const btn=e.submitter;btn.disabled=true;
 try{
  const d=await apiRequest('/login',{method:'POST',body:JSON.stringify({email:$('loginEmail').value,password:$('loginPassword').value,role:$('loginRole').value})});
  localStorage.setItem('virexo_token',d.token); localStorage.setItem('virexo_user',JSON.stringify(d.user));
  showMsg('Login successful — opening your dashboard…'); setTimeout(()=>location.href='dashboard.html',350);
 }catch(err){showMsg(err.message,true)} finally{btn.disabled=false}
};
$('signupForm').onsubmit=async e=>{
 e.preventDefault(); const btn=e.submitter;btn.disabled=true;
 try{
  const d=await apiRequest('/signup',{method:'POST',body:JSON.stringify({name:$('signupName').value,email:$('signupEmail').value,password:$('signupPassword').value,role:$('signupRole').value,company:$('signupCompany').value})});
  localStorage.setItem('virexo_token',d.token); localStorage.setItem('virexo_user',JSON.stringify(d.user));
  showMsg('Account created — opening your dashboard…'); setTimeout(()=>location.href='dashboard.html',350);
 }catch(err){showMsg(err.message,true)} finally{btn.disabled=false}
};
