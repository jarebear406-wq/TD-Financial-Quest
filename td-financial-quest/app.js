// ===== TD FINANCIAL QUEST - MAIN APP =====
const App = (() => {
  let state = {
    xp: 0,
    coins: 0,
    level: 1,
    streak: 1,
    lessonsCompleted: 0,
    badges: []
  };

  const BADGES = [
    { id: 'first-run', icon: '🏃', name: 'First Run' },
    { id: 'quiz-master', icon: '🎓', name: 'Quiz Master' },
    { id: 'budget-boss', icon: '📊', name: 'Budget Boss' },
    { id: 'investor', icon: '📈', name: 'Investor' },
    { id: 'saver', icon: '💰', name: 'Super Saver' },
    { id: 'scholar', icon: '📚', name: 'Scholar' },
  ];

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const screen = document.getElementById(id);
    if (screen) screen.classList.add('active');

    // Show sidebar once past splash (desktop only)
    const sidebar = document.getElementById('desktop-sidebar');
    if (sidebar && id !== 'screen-splash') {
      sidebar.style.display = '';  // let CSS media query control it
    }
    if (sidebar && id === 'screen-splash') {
      sidebar.style.display = 'none';
    }

    // Init games when navigating to them
    if (id === 'screen-runner') {
      const overlay = document.getElementById('runner-overlay');
      overlay.classList.remove('hidden');
      document.getElementById('runner-overlay-title').textContent = '🏃 Money Runner';
      document.getElementById('runner-overlay-msg').textContent = 'Collect coins, dodge debt traps!\nTap JUMP or press Space to jump.';
      document.getElementById('runner-start-btn').textContent = 'Play!';
      document.getElementById('runner-tip').textContent = FINANCIAL_TIPS[Math.floor(Math.random() * FINANCIAL_TIPS.length)];
    }
    if (id === 'screen-quiz') Quiz.load();
    if (id === 'screen-budget') Budget.load();
    if (id === 'screen-invest') Invest.load();
    if (id === 'screen-lessons') renderLessons();
    if (id === 'screen-profile') renderProfile();
    if (id === 'screen-home') updateHomeHUD();

    // Update mobile nav
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const navMap = { 'screen-home': 0, 'screen-leaderboard': 1, 'screen-lessons': 2, 'screen-profile': 3 };
    if (navMap[id] !== undefined) {
      document.querySelectorAll('.nav-btn')[navMap[id]]?.classList.add('active');
    }

    // Update sidebar nav
    const sidebarMap = {
      'screen-home': 'snav-home',
      'screen-runner': 'snav-runner',
      'screen-quiz': 'snav-quiz',
      'screen-budget': 'snav-budget',
      'screen-invest': 'snav-invest',
      'screen-lessons': 'snav-lessons',
      'screen-leaderboard': 'snav-leaderboard',
      'screen-profile': 'snav-profile',
    };
    document.querySelectorAll('.sidebar-nav-item').forEach(b => b.classList.remove('active'));
    if (sidebarMap[id]) document.getElementById(sidebarMap[id])?.classList.add('active');

    if (id === 'screen-leaderboard') Leaderboard.render();
  }

  function addXP(amount) {
    state.xp += amount;
    const newLevel = Math.floor(state.xp / 100) + 1;
    if (newLevel > state.level) {
      state.level = newLevel;
      showLevelUp(newLevel);
    }
    // Keep overall XP score on leaderboard in sync
    Leaderboard.submitScore('overall', state.xp);
    updateHomeHUD();
    saveState();
  }

  function addCoins(amount) {
    state.coins += amount;
    updateHomeHUD();
    saveState();
  }

  function addBadge(id) {
    if (!state.badges.includes(id)) {
      state.badges.push(id);
      saveState();
    }
  }

  function updateHomeHUD() {
    const xpEl = document.getElementById('xp-display');
    const coinsEl = document.getElementById('coins-display');
    if (xpEl) xpEl.textContent = `${state.xp} XP`;
    if (coinsEl) coinsEl.textContent = state.coins;

    // Sidebar
    const sbXp = document.getElementById('sb-xp');
    const sbCoins = document.getElementById('sb-coins');
    const sbStreak = document.getElementById('sb-streak');
    const sbName = document.getElementById('sb-name');
    const sbLevel = document.getElementById('sb-level');
    const sbBar = document.getElementById('sb-xp-bar');
    if (sbXp) sbXp.textContent = state.xp;
    if (sbCoins) sbCoins.textContent = state.coins;
    if (sbStreak) sbStreak.textContent = state.streak;
    if (sbName) sbName.textContent = getLevelTitle(state.level);
    if (sbLevel) sbLevel.textContent = `Level ${state.level} · ${getLevelTitle(state.level)}`;
    if (sbBar) sbBar.style.width = `${(state.xp % 100)}%`;

    // Banner greeting
    const banner = document.getElementById('banner-greeting');
    if (banner) banner.textContent = `Welcome back, ${getLevelTitle(state.level)}!`;
  }

  function showLevelUp(level) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position:fixed; top:80px; left:50%; transform:translateX(-50%);
      background:linear-gradient(135deg,#00A651,#006B3F);
      color:white; padding:14px 28px; border-radius:50px;
      font-size:16px; font-weight:800; z-index:9999;
      box-shadow:0 4px 20px rgba(0,166,81,0.5);
      animation:popIn 0.4s cubic-bezier(0.34,1.56,0.64,1);
    `;
    toast.textContent = `🎉 Level Up! You're now Level ${level}!`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }

  function renderLessons() {
    const container = document.getElementById('lessons-container');
    container.innerHTML = '';
    LESSONS.forEach(lesson => {
      const card = document.createElement('div');
      card.className = 'lesson-card';
      card.innerHTML = `
        <h3>${lesson.title}</h3>
        <p>${lesson.summary}</p>
        <span class="lesson-tag">${lesson.tag}</span>
        <div class="lesson-expanded" id="lesson-${lesson.id}">${lesson.content.replace(/\n/g, '<br/>')}</div>
      `;
      card.onclick = () => {
        const exp = document.getElementById(`lesson-${lesson.id}`);
        const isOpen = exp.classList.contains('open');
        document.querySelectorAll('.lesson-expanded').forEach(e => e.classList.remove('open'));
        if (!isOpen) {
          exp.classList.add('open');
          state.lessonsCompleted = Math.max(state.lessonsCompleted, state.lessonsCompleted + 1);
          addXP(5);
          addBadge('scholar');
          saveState();
        }
      };
      container.appendChild(card);
    });
  }

  function renderProfile() {
    document.getElementById('profile-level').textContent = state.level;
    document.getElementById('profile-name').textContent = getLevelTitle(state.level);
    document.getElementById('stat-xp').textContent = state.xp;
    document.getElementById('stat-coins').textContent = state.coins;
    document.getElementById('stat-streak').textContent = state.streak;
    document.getElementById('stat-lessons').textContent = state.lessonsCompleted;

    const grid = document.getElementById('badges-grid');
    grid.innerHTML = '';
    BADGES.forEach(b => {
      const el = document.createElement('div');
      el.className = 'badge-item' + (state.badges.includes(b.id) ? '' : ' locked');
      el.innerHTML = `<div class="badge-icon">${b.icon}</div><div class="badge-name">${b.name}</div>`;
      grid.appendChild(el);
    });
  }

  function getLevelTitle(level) {
    const titles = ['Penny Saver', 'Budget Starter', 'Coin Collector', 'Smart Spender',
      'Savings Star', 'Credit Builder', 'Investment Rookie', 'Finance Pro',
      'Money Master', 'Financial Legend'];
    return titles[Math.min(level - 1, titles.length - 1)];
  }

  function saveState() {
    try { localStorage.setItem('tdFQ_state', JSON.stringify(state)); } catch (e) {}
  }

  function loadState() {
    try {
      const saved = localStorage.getItem('tdFQ_state');
      if (saved) state = { ...state, ...JSON.parse(saved) };
    } catch (e) {}
  }

  // Boot
  document.addEventListener('DOMContentLoaded', () => {
    loadState();
    updateHomeHUD();
    Leaderboard.init(); // check for incoming shared score in URL hash
    // Hide sidebar on splash
    const sidebar = document.getElementById('desktop-sidebar');
    if (sidebar && window.innerWidth >= 768) sidebar.style.display = 'none';
  });

  return { showScreen, addXP, addCoins, addBadge, getState: () => state };
})();
