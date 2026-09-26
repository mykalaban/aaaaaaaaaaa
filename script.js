/* ================= تنظیمات ================= */
const ADMIN_PASS = "aboofazel133";
const STORAGE_KEY = "shohada_notes_v1";
// برای اینکه دلنوشته‌ها واقعاً به ایمیل شما هم ارسال شوند، یک فرم رایگان
// در formspree.io بسازید (چند دقیقه طول می‌کشد) و آدرس آن را اینجا جایگزین کنید.
// اگر این مقدار خالی بماند، دلنوشته‌ها فقط در همین دستگاه ذخیره می‌شوند.
const NOTIFY_ENDPOINT = ""; // مثال: "https://formspree.io/f/xxxxxxx"
/* ============================================ */

function loadNotes(){
  try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch(e){ return []; }
}
function saveNotes(notes){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}
function escapeHtml(s){
  return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function formatDate(ts){
  try{ return new Date(ts).toLocaleDateString('fa-IR', {year:'numeric',month:'long',day:'numeric'}); }
  catch(e){ return ''; }
}

function renderAdmin(filter){
  const q = (filter || '').trim();
  const notes = loadNotes().filter(n => !q || (n.martyr||'').indexOf(q) !== -1);
  const el = document.getElementById('adminList');
  if(notes.length === 0){
    el.innerHTML = '<div class="empty">دلنوشته‌ای یافت نشد.</div>';
    return;
  }
  el.innerHTML = notes.slice().reverse().map(n => `
    <div class="note">
      <p class="martyr">برای ${escapeHtml(n.martyr || 'شهید گمنام')}</p>
      <p class="text">${escapeHtml(n.text)}</p>
      <div class="meta">
        <span>${escapeHtml(n.name || 'ناشناس')} — ${formatDate(n.date)}</span>
        <button class="del-btn" data-id="${n.id}">حذف</button>
      </div>
    </div>
  `).join('');
  el.querySelectorAll('.del-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-id');
      saveNotes(loadNotes().filter(n => String(n.id) !== id));
      renderAdmin(document.getElementById('adminSearch').value);
    });
  });
}

document.getElementById('adminSearch').addEventListener('input', (e)=>{
  renderAdmin(e.target.value);
});

document.getElementById('noteForm').addEventListener('submit', function(e){
  e.preventDefault();
  const martyrEl = document.getElementById('sh');
  const nameEl = document.getElementById('nm');
  const textEl = document.getElementById('tx');
  const submitBtn = document.getElementById('submitBtn');
  const martyr = martyrEl.value.trim();
  const text = textEl.value.trim();
  if(!text || !martyr) return;

  const entry = { id: Date.now(), martyr, name: nameEl.value.trim(), text, date: Date.now() };

  const notes = loadNotes();
  notes.push(entry);
  saveNotes(notes);

  function finish(){
    martyrEl.value = '';
    nameEl.value = '';
    textEl.value = '';
    submitBtn.disabled = false;
    document.getElementById('thanksMsg').classList.add('show');
    setTimeout(()=>document.getElementById('thanksMsg').classList.remove('show'), 4500);
  }

  if(NOTIFY_ENDPOINT){
    submitBtn.disabled = true;
    fetch(NOTIFY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(entry)
    }).then(finish).catch(finish);
  } else {
    finish();
  }
});

const overlay = document.getElementById('overlay');
const pwInput = document.getElementById('pw');
const pwErr = document.getElementById('pwErr');

document.getElementById('openAdmin').addEventListener('click', ()=>{
  pwInput.value = '';
  pwErr.style.display = 'none';
  overlay.classList.add('open');
  setTimeout(()=>pwInput.focus(), 50);
});
document.getElementById('pwCancel').addEventListener('click', ()=>{
  overlay.classList.remove('open');
});
document.getElementById('pwSubmit').addEventListener('click', tryLogin);
pwInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') tryLogin(); });

function tryLogin(){
  if(pwInput.value === ADMIN_PASS){
    overlay.classList.remove('open');
    document.getElementById('publicView').classList.add('hidden');
    document.getElementById('adminPanel').classList.add('open');
    document.getElementById('adminSearch').value = '';
    renderAdmin();
  } else {
    pwErr.style.display = 'block';
  }
}

document.getElementById('backToSite').addEventListener('click', ()=>{
  document.getElementById('adminPanel').classList.remove('open');
  document.getElementById('publicView').classList.remove('hidden');
});
