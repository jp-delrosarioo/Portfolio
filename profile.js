document.addEventListener('DOMContentLoaded', () => {

/* ════════════════════════════════════════
   1 — THEME TOGGLE
════════════════════════════════════════ */
const themeBtn = document.getElementById('themeToggle');

function applyTheme(dark) {
  if (dark) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
  themeBtn.innerHTML = dark
    ? '<img src="image/brightness.png" alt="Light mode" style="width:18px;height:18px;object-fit:contain;"> '
    : '<img src="image/night-mode.png" alt="Dark mode" style="width:18px;height:18px;object-fit:contain;">';
}

const saved = localStorage.getItem('theme');
if (saved === 'dark') {
  applyTheme(true);
} else if (saved === 'light') {
  applyTheme(false);
} else {
  applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
}

themeBtn.addEventListener('click', () => {
  const isDark = document.body.classList.contains('dark');
  applyTheme(!isDark);
  localStorage.setItem('theme', !isDark ? 'dark' : 'light');
});

/* ════════════════════════════════════════
   2 — CLICKABLE PROJECT CARDS
════════════════════════════════════════ */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('click', () => {
    let url = card.dataset.url;
    if (!url || url === '#') return;
    if (!url.startsWith('http')) url = 'https://' + url;
    window.open(url, '_blank');
  });
});

/* ════════════════════════════════════════
   3 — VIEW ALL MODAL
════════════════════════════════════════ */
const modal     = document.getElementById('modal');
const modalGrid = document.getElementById('modalGrid');

document.getElementById('viewAllBtn').addEventListener('click', e => {
  e.preventDefault();
  modalGrid.innerHTML = '';
  document.querySelectorAll('.project-card').forEach(card => {
    const el = document.createElement('div');
    el.className = 'modal-card';
    el.innerHTML = `
      <h3>${card.dataset.title}</h3>
      <p>${card.dataset.desc}</p>
      <span class="url">${card.dataset.url}</span>
    `;
    el.addEventListener('click', () => {
      let u = card.dataset.url;
      if (!u || u === '#') return;
      if (!u.startsWith('http')) u = 'https://' + u;
      window.open(u, '_blank');
    });
    modalGrid.appendChild(el);
  });
  modal.classList.add('open');
});

document.getElementById('closeModal').addEventListener('click', () => {
  modal.classList.remove('open');
});

modal.addEventListener('click', e => {
  if (e.target === modal) modal.classList.remove('open');
});

/* ════════════════════════════════════════
   4 — RECOMMENDATIONS DOT PAGINATION
════════════════════════════════════════ */
const recs = [
  {
    quote: '"Add a recommendation from a professor or mentor who can speak to your skills and work ethic."',
    name: 'Name Here',
    role: 'Title, Organization'
  },
  {
    quote: '"Add a second recommendation here from another person who knows your work."',
    name: 'Name Here',
    role: 'Title, Organization'
  },
  {
    quote: '"Add a third recommendation here."',
    name: 'Name Here',
    role: 'Title, Organization'
  },
];

const recQuote = document.getElementById('recQuote');
const recName  = document.getElementById('recName');
const recRole  = document.getElementById('recRole');
const dots     = document.querySelectorAll('.rec-dot');

function showRec(i) {
  recQuote.textContent = recs[i].quote;
  recName.textContent  = recs[i].name;
  recRole.textContent  = recs[i].role;
  dots.forEach((d, j) => d.classList.toggle('active', j === i));
}

dots.forEach(d => d.addEventListener('click', () => showRec(+d.dataset.idx)));

/* ════════════════════════════════════════
   5 — AI CHAT WIDGET (Gemini API - GitHub Pages)
════════════════════════════════════════ */
const chatFab   = document.getElementById('chatFab');
const chatPanel = document.getElementById('chatPanel');
const chatClose = document.getElementById('chatClose');
const chatInput = document.getElementById('chatInput');
const chatSend  = document.getElementById('chatSend');
const chatMsgs  = document.getElementById('chatMessages');

const chatHistory = [];

chatFab.addEventListener('click', () => {
  chatPanel.classList.toggle('open');
  if (chatPanel.classList.contains('open')) {
    setTimeout(() => chatInput.focus(), 220);
  }
});
chatClose.addEventListener('click', () => chatPanel.classList.remove('open'));

function addBubble(text, from) {
  const div = document.createElement('div');
  div.className = `bubble ${from}`;
  div.textContent = text;
  chatMsgs.appendChild(div);
  chatMsgs.scrollTop = chatMsgs.scrollHeight;
  return div;
}

async function sendMsg() {
  const text = chatInput.value.trim();
  if (!text) return;

  addBubble(text, 'from-user');
  chatInput.value = '';
  chatInput.disabled = true;
  chatSend.disabled = true;

  const typing = addBubble('...', 'from-me typing');

  chatHistory.push({ role: 'user', parts: [{ text }] });

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history: chatHistory })
    });

    const data = await response.json();
    const reply = data.reply || "Sorry, I couldn't get a response right now.";

    typing.remove();
    addBubble(reply, 'from-me');
    chatHistory.push({ role: 'model', parts: [{ text: reply }] });

  } catch (err) {
    typing.remove();
    addBubble("Oops! Something went wrong. Try emailing Jp directly at jprizal.gdelrosario@gmail.com", 'from-me');
    console.error('Chat error:', err);
  }

  chatInput.disabled = false;
  chatSend.disabled = false;
  chatInput.focus();
}

chatSend.addEventListener('click', sendMsg);
chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMsg();
});

/* ════════════════════════════════════════
   6 — GALLERY ARROW SLIDER
════════════════════════════════════════ */
const galleryStrip = document.getElementById('galleryStrip');
const galleryPrev  = document.getElementById('galleryPrev');
const galleryNext  = document.getElementById('galleryNext');

function updateGalleryArrows() {
  galleryPrev.disabled = galleryStrip.scrollLeft <= 0;
  galleryNext.disabled = galleryStrip.scrollLeft + galleryStrip.clientWidth >= galleryStrip.scrollWidth - 1;
}

galleryPrev.addEventListener('click', () => {
  galleryStrip.scrollBy({ left: -220, behavior: 'smooth' });
});
galleryNext.addEventListener('click', () => {
  galleryStrip.scrollBy({ left: 220, behavior: 'smooth' });
});

galleryStrip.addEventListener('scroll', updateGalleryArrows);
updateGalleryArrows();

}); // end DOMContentLoaded