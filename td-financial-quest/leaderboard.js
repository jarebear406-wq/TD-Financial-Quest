// ===== TD FINANCIAL QUEST - LEADERBOARD =====
// Stores scores locally. Players can share a score link that auto-submits
// their result when a friend opens it, creating a shared local leaderboard.

const Leaderboard = (() => {

  const STORAGE_KEY = 'tdFQ_leaderboard';
  const PLAYER_KEY  = 'tdFQ_playerName';

  // Score categories
  const CATEGORIES = [
    { id: 'overall',  label: 'Overall XP',     icon: '⭐', unit: 'XP'  },
    { id: 'runner',   label: 'Money Runner',    icon: '🏃', unit: 'pts' },
    { id: 'quiz',     label: 'Finance Academy', icon: '🧠', unit: 'XP'  },
    { id: 'budget',   label: 'Budget Boss',     icon: '📊', unit: 'XP'  },
    { id: 'invest',   label: 'Stock Surge',     icon: '📈', unit: '$'   },
  ];

  let activeTab = 'overall';

  // ── Storage helpers ──────────────────────────────────────────────────────

  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
  }

  function save(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
  }

  function getPlayerName() {
    return localStorage.getItem(PLAYER_KEY) || null;
  }

  function setPlayerName(name) {
    localStorage.setItem(PLAYER_KEY, name.trim().slice(0, 20));
  }

  // ── Public: submit a score ───────────────────────────────────────────────

  function submitScore(category, score, playerName) {
    const name = playerName || getPlayerName() || 'Anonymous';
    const data = load();
    if (!data[category]) data[category] = [];

    // Keep only the best score per player per category
    const existing = data[category].findIndex(e => e.name === name);
    const entry = { name, score, date: Date.now() };
    if (existing >= 0) {
      if (score > data[category][existing].score) data[category][existing] = entry;
    } else {
      data[category].push(entry);
    }

    // Keep top 20
    data[category].sort((a, b) => b.score - a.score);
    data[category] = data[category].slice(0, 20);
    save(data);
  }

  // ── Public: get sorted scores for a category ────────────────────────────

  function getScores(category) {
    const data = load();
    return (data[category] || []).sort((a, b) => b.score - a.score);
  }

  // ── Share link ───────────────────────────────────────────────────────────
  // Encodes name + scores into the URL hash so friends can "receive" the score

  function buildShareLink(playerName, scores) {
    const payload = btoa(JSON.stringify({ n: playerName, s: scores, t: Date.now() }));
    return `${location.href.split('#')[0]}#share=${payload}`;
  }

  function parseShareLink() {
    const hash = location.hash;
    if (!hash.startsWith('#share=')) return null;
    try {
      return JSON.parse(atob(hash.slice(7)));
    } catch { return null; }
  }

  function applySharedScore(payload) {
    // payload: { n: name, s: { runner, quiz, budget, invest, overall }, t: timestamp }
    Object.entries(payload.s).forEach(([cat, score]) => {
      if (score > 0) submitScore(cat, score, payload.n);
    });
    // Clear hash so it doesn't re-apply on refresh
    history.replaceState(null, '', location.pathname);
  }

  // ── Name prompt ──────────────────────────────────────────────────────────

  function promptName(callback) {
    if (getPlayerName()) { callback(getPlayerName()); return; }

    const modal = document.createElement('div');
    modal.id = 'name-modal';
    modal.innerHTML = `
      <div class="name-modal-backdrop"></div>
      <div class="name-modal-card pop-in">
        <div class="name-modal-icon">🏆</div>
        <h2>What's your name?</h2>
        <p>Your name will appear on the leaderboard when you beat high scores.</p>
        <input type="text" id="name-input" placeholder="Enter your name..." maxlength="20" autocomplete="off" />
        <button class="btn-primary" id="name-submit-btn">Let's Go!</button>
      </div>
    `;
    document.body.appendChild(modal);

    const input = document.getElementById('name-input');
    const btn   = document.getElementById('name-submit-btn');
    input.focus();

    const submit = () => {
      const val = input.value.trim();
      if (!val) { input.classList.add('shake'); setTimeout(() => input.classList.remove('shake'), 400); return; }
      setPlayerName(val);
      modal.remove();
      callback(val);
    };

    btn.onclick = submit;
    input.onkeydown = e => { if (e.key === 'Enter') submit(); };
  }

  // ── Render leaderboard screen ────────────────────────────────────────────

  function render() {
    const container = document.getElementById('leaderboard-container');
    if (!container) return;

    const playerName = getPlayerName() || 'You';

    // Tab bar
    const tabsHtml = CATEGORIES.map(c => `
      <button class="lb-tab ${activeTab === c.id ? 'active' : ''}"
              onclick="Leaderboard.setTab('${c.id}')">
        ${c.icon} ${c.label}
      </button>
    `).join('');

    const cat    = CATEGORIES.find(c => c.id === activeTab);
    const scores = getScores(activeTab);
    const myRank = scores.findIndex(e => e.name === playerName);

    // Podium (top 3)
    const podium = [scores[1], scores[0], scores[2]]; // 2nd, 1st, 3rd
    const podiumHtml = `
      <div class="lb-podium">
        ${podium.map((e, i) => {
          const pos = [2, 1, 3][i];
          const heights = ['80px', '110px', '60px'];
          const medals  = ['🥈', '🥇', '🥉'];
          const isMe    = e && e.name === playerName;
          return e ? `
            <div class="podium-slot ${isMe ? 'podium-me' : ''}" style="--h:${heights[i]}">
              <div class="podium-name">${e.name}</div>
              <div class="podium-score">${e.score.toLocaleString()} ${cat.unit}</div>
              <div class="podium-block" style="height:${heights[i]}">
                <span class="podium-medal">${medals[i]}</span>
                <span class="podium-pos">#${pos}</span>
              </div>
            </div>
          ` : `<div class="podium-slot podium-empty" style="--h:${heights[i]}">
            <div class="podium-block" style="height:${heights[i]}; opacity:0.2">
              <span class="podium-pos">#${pos}</span>
            </div>
          </div>`;
        }).join('')}
      </div>
    `;

    // Full list
    const listHtml = scores.length === 0
      ? `<div class="lb-empty">No scores yet — be the first! 🚀</div>`
      : scores.map((e, i) => {
          const isMe = e.name === playerName;
          const rankIcon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
          const date = new Date(e.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
          return `
            <div class="lb-row ${isMe ? 'lb-row-me' : ''}">
              <span class="lb-rank">${rankIcon}</span>
              <span class="lb-player-name">${e.name}${isMe ? ' <span class="lb-you-tag">YOU</span>' : ''}</span>
              <span class="lb-date">${date}</span>
              <span class="lb-score">${e.score.toLocaleString()} <small>${cat.unit}</small></span>
            </div>
          `;
        }).join('');

    // My rank callout
    const myRankHtml = myRank >= 0 ? `
      <div class="lb-my-rank">
        Your rank: <strong>#${myRank + 1}</strong> with
        <strong>${scores[myRank].score.toLocaleString()} ${cat.unit}</strong>
      </div>
    ` : `<div class="lb-my-rank">Play a game to get on the board!</div>`;

    // Share button
    const allScores = {};
    CATEGORIES.forEach(c => {
      const s = getScores(c.id).find(e => e.name === playerName);
      allScores[c.id] = s ? s.score : 0;
    });
    const shareLink = buildShareLink(playerName, allScores);

    container.innerHTML = `
      <div class="lb-tabs">${tabsHtml}</div>
      ${scores.length >= 3 ? podiumHtml : ''}
      <div class="lb-list">${listHtml}</div>
      ${myRankHtml}
      <div class="lb-share-section">
        <p class="lb-share-label">Challenge a friend — share your scores:</p>
        <div class="lb-share-row">
          <input class="lb-share-input" id="lb-share-input" value="${shareLink}" readonly />
          <button class="btn-primary lb-copy-btn" onclick="Leaderboard.copyLink()">Copy Link</button>
        </div>
        <p class="lb-share-hint">When they open this link, your scores are added to their leaderboard automatically.</p>
      </div>
    `;
  }

  function setTab(id) {
    activeTab = id;
    render();
  }

  function copyLink() {
    const input = document.getElementById('lb-share-input');
    if (!input) return;
    navigator.clipboard.writeText(input.value).then(() => {
      const btn = document.querySelector('.lb-copy-btn');
      if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => btn.textContent = 'Copy Link', 2000); }
    }).catch(() => {
      input.select();
      document.execCommand('copy');
    });
  }

  // ── Seed fake players (runs once, never overwrites real scores) ─────────

  function seedFakePlayers() {
    const SEED_KEY = 'tdFQ_seeded_v1';
    if (localStorage.getItem(SEED_KEY)) return; // already seeded

    const now = Date.now();
    const day = 86400000;

    // Realistic teen/young-adult names with varied scores across all categories
    const FAKE = [
      { name: 'Jordan M.',   overall: 840, runner: 312, quiz: 180, budget: 40, invest: 1480, daysAgo: 0  },
      { name: 'Priya S.',    overall: 720, runner: 245, quiz: 200, budget: 40, invest: 1320, daysAgo: 1  },
      { name: 'Marcus T.',   overall: 650, runner: 289, quiz: 160, budget: 35, invest: 1210, daysAgo: 1  },
      { name: 'Aisha K.',    overall: 590, runner: 198, quiz: 180, budget: 40, invest: 1390, daysAgo: 2  },
      { name: 'Liam C.',     overall: 510, runner: 176, quiz: 140, budget: 30, invest: 1150, daysAgo: 2  },
      { name: 'Sofia R.',    overall: 470, runner: 134, quiz: 200, budget: 40, invest: 1280, daysAgo: 3  },
      { name: 'Dev P.',      overall: 420, runner: 221, quiz: 120, budget: 25, invest: 1090, daysAgo: 3  },
      { name: 'Chloe W.',    overall: 380, runner: 109, quiz: 160, budget: 35, invest: 1060, daysAgo: 4  },
      { name: 'Noah B.',     overall: 310, runner: 143, quiz: 100, budget: 20, invest: 1030, daysAgo: 5  },
      { name: 'Fatima A.',   overall: 260, runner:  88, quiz: 120, budget: 30, invest: 1010, daysAgo: 6  },
    ];

    const data = load();

    FAKE.forEach(p => {
      const ts = now - p.daysAgo * day - Math.random() * day * 0.5;
      const push = (cat, score) => {
        if (!data[cat]) data[cat] = [];
        data[cat].push({ name: p.name, score, date: Math.floor(ts) });
      };
      push('overall', p.overall);
      push('runner',  p.runner);
      push('quiz',    p.quiz);
      push('budget',  p.budget);
      push('invest',  p.invest);
    });

    // Sort each category
    Object.keys(data).forEach(cat => {
      data[cat].sort((a, b) => b.score - a.score);
      data[cat] = data[cat].slice(0, 20);
    });

    save(data);
    localStorage.setItem(SEED_KEY, '1');
  }

  // ── Init: seed fake data + check for incoming shared score ───────────────

  function init() {
    seedFakePlayers();

    const shared = parseShareLink();
    if (shared && shared.n && shared.s) {
      applySharedScore(shared);
      setTimeout(() => {
        const toast = document.createElement('div');
        toast.className = 'lb-toast pop-in';
        toast.textContent = `🏆 ${shared.n}'s scores added to your leaderboard!`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3500);
      }, 800);
    }
  }

  return { submitScore, getScores, render, setTab, copyLink, promptName, getPlayerName, init };
})();
