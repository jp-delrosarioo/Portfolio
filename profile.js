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
    ? '<img src="image/off.png" alt="Light mode" style="width:18px;height:18px;object-fit:contain;">'
    : '<img src="image/on.png" alt="Dark mode" style="width:18px;height:18px;object-fit:contain;">';
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
   5 — AI CHAT WIDGET (Claude API via secure proxy)
════════════════════════════════════════ */
const chatFab   = document.getElementById('chatFab');
const chatPanel = document.getElementById('chatPanel');
const chatClose = document.getElementById('chatClose');
const chatInput = document.getElementById('chatInput');
const chatSend  = document.getElementById('chatSend');
const chatMsgs  = document.getElementById('chatMessages');

const PORTFOLIO_CONTEXT = `You are an AI assistant embedded in Jp Rizal Del Rosario's personal portfolio website. You speak on Jp's behalf, answering visitor questions in a friendly, warm, and professional tone. Keep answers concise (2-4 sentences). Only use the facts below — never invent or assume details not listed here. If a visitor asks something not covered, say you are not sure and invite them to contact Jp directly via email.

== ABOUT JP ==
Full name: Jp Rizal Del Rosario
Location: Malolos, Bulacan, Philippines
Current role: ML Engineer / Software Engineer (student & self-directed learner)
Education: 3rd-year BS Information Technology student at La Consolacion University Philippines (enrolled 2022)
Started coding: 2020 — wrote his first line of code that year

== BACKGROUND ==
Jp is a passionate IT student focused on machine learning and software development. He works on responsive web design projects and is expanding his back-end skills with Laravel. He improves daily through coding challenges and personal projects, showing up consistently and pushing to grow.

== SKILLS ==
Frontend: HTML, CSS, JavaScript
Backend: PHP, Laravel, Python, MySQL
Machine Learning: scikit-learn, NumPy, Pandas, Jupyter Notebook

== PROJECTS ==
1. Cafe Rencontre - A cafe demo system. School project (Finals, built with PHP). GitHub: github.com/jp-delrosarioo/Cafe-Rencontre-Demo
2. Ordering System - Online food ordering system. School project (Midterms).
3. Student Management System - Manages student records. School project (Finals).
4. AI Con - AI-related project. School project (Midterms).

== EXPERIENCE / TIMELINE ==
- 2020: Wrote first line of code
- 2022: Started BS Information Technology at La Consolacion University Philippines
- 2025: Actively pursuing machine learning studies (self-directed & coursework)

== CONTACT ==
Email: jprizal.gdelrosario@gmail.com
Schedule a call: https://calendly.com/jprizal-gdelrosario/30min
LinkedIn: https://www.linkedin.com/in/jprizaldelrosario/
GitHub: https://github.com/jprizaldelrosario
Instagram: https://www.instagram.com/jprizal.delrosario/

== MEMBERSHIPS ==
Philippine Society of IT Students

== INTERESTS & GOALS ==
Machine learning, responsive web design, Laravel back-end development, coding challenges, personal projects, emerging technologies.

== AVAILABILITY ==
Jp is open to collaboration, internship opportunities, and project work. Visitors can schedule a call via Calendly or email him directly.

== TONE GUIDELINES ==
- Be warm and approachable, like Jp himself
- Use third person when referring to Jp (e.g. "Jp is currently..." or "He's working on...")
- Never make up certifications, grades, awards, or experiences not listed above
- If asked about certifications or recommendations, say those sections are being updated and invite the visitor to reach out directly`;

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

  chatHistory.push({ role: 'user', content: text });

  try {
    // Calls your secure Vercel serverless function — API key stays on the server
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: PORTFOLIO_CONTEXT,
        messages: chatHistory
      })
    });

    const data = await res.json();
    const reply = data.content?.[0]?.text || "Sorry, I couldn't get a response right now.";

    typing.remove();
    addBubble(reply, 'from-me');
    chatHistory.push({ role: 'assistant', content: reply });

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