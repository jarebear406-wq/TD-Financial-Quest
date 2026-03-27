// ===== TD FINANCIAL QUEST — INVESTOR DEMO CONTROLLER =====
const Demo = (() => {
  const TOTAL = 8;
  let current = 1;
  let autoTimer = null;
  const AUTO_INTERVAL = 9000; // 9 seconds per slide

  // ── Navigation ────────────────────────────────────────────────────────────

  function goTo(n) {
    if (n < 1 || n > TOTAL) return;
    document.getElementById(`slide-${current}`)?.classList.remove('active');
    current = n;
    const slide = document.getElementById(`slide-${current}`);
    slide?.classList.add('active');
    document.getElementById('demo-counter').textContent = `${current} / ${TOTAL}`;
    document.getElementById('demo-progress-bar').style.width = `${(current / TOTAL) * 100}%`;
    onSlideEnter(current);
  }

  function next() { goTo(current < TOTAL ? current + 1 : 1); }
  function prev() { goTo(current > 1 ? current - 1 : TOTAL); }

  function toggleAuto() {
    const btn = document.getElementById('demo-auto');
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
      btn.textContent = '▶ Auto';
    } else {
      autoTimer = setInterval(next, AUTO_INTERVAL);
      btn.textContent = '⏸ Pause';
    }
  }

  // ── Per-slide animations ──────────────────────────────────────────────────

  function onSlideEnter(n) {
    if (n === 3) animateSlide3();
    if (n === 4) animateRunnerCanvas();
    if (n === 5) animateSlide5();
  }

  function animateSlide3() {
    // XP bar fill animation
    setTimeout(() => {
      const bar = document.getElementById('mock-xp-anim');
      if (bar) bar.style.width = '68%';
    }, 400);
  }

  function animateSlide5() {
    // Budget bar fill
    setTimeout(() => {
      const bar = document.getElementById('tg-budget-anim');
      if (bar) bar.style.width = '91%';
    }, 400);
    // Mini stock chart
    setTimeout(() => drawMiniChart(), 600);
  }

  function drawMiniChart() {
    const canvas = document.getElementById('demo-mini-chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const datasets = [
      { color: '#00A651', points: [60, 62, 58, 65, 70, 68, 75, 80, 78, 85] },
      { color: '#1565C0', points: [80, 85, 78, 90, 88, 95, 92, 100, 105, 112] },
      { color: '#E65100', points: [45, 44, 46, 43, 47, 45, 48, 46, 50, 49] },
    ];

    const allVals = datasets.flatMap(d => d.points);
    const minV = Math.min(...allVals) * 0.95;
    const maxV = Math.max(...allVals) * 1.05;

    datasets.forEach(ds => {
      ctx.strokeStyle = ds.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ds.points.forEach((v, i) => {
        const x = (i / (ds.points.length - 1)) * (w - 10) + 5;
        const y = h - ((v - minV) / (maxV - minV)) * (h - 10) - 5;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
    });
  }

  // ── Runner canvas preview (animated loop) ────────────────────────────────

  function animateRunnerCanvas() {
    const canvas = document.getElementById('demo-runner-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const groundY = H - 40;
    let frame = 0;
    let playerY = groundY - 36;
    let vy = 0;
    let onGround = true;
    let obstacles = [{ x: W + 40, type: 0 }, { x: W + 200, type: 1 }];
    let coins = [{ x: W + 80, y: groundY - 50 }, { x: W + 140, y: groundY - 80 }];
    let score = 0;
    let animId;

    // Auto-jump every ~2 seconds
    setInterval(() => {
      if (onGround) { vy = -10; onGround = false; }
    }, 2000);

    function loop() {
      frame++;
      // Physics
      vy += 0.5;
      playerY += vy;
      if (playerY >= groundY - 36) { playerY = groundY - 36; vy = 0; onGround = true; }

      // Move objects
      obstacles.forEach(o => { o.x -= 3; });
      coins.forEach(c => { c.x -= 3; });
      obstacles = obstacles.filter(o => o.x > -60);
      coins = coins.filter(c => c.x > -20);
      if (obstacles.length < 2 && frame % 90 === 0) obstacles.push({ x: W + 40, type: Math.floor(Math.random() * 2) });
      if (coins.length < 3 && frame % 45 === 0) coins.push({ x: W + 60, y: groundY - 50 - Math.random() * 40 });

      // Collect coins
      coins.forEach(c => {
        if (Math.abs(c.x - 60) < 20 && Math.abs(c.y - (playerY + 18)) < 20) { score++; c.x = -100; }
      });

      // Draw
      ctx.clearRect(0, 0, W, H);

      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, groundY);
      sky.addColorStop(0, '#0d1b2a'); sky.addColorStop(1, '#1a3a5c');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, groundY);

      // Ground
      ctx.fillStyle = '#006B3F'; ctx.fillRect(0, groundY, W, H - groundY);
      ctx.strokeStyle = '#00C96A'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(W, groundY); ctx.stroke();

      // Coins
      coins.forEach(c => {
        ctx.fillStyle = '#FFB300';
        ctx.beginPath(); ctx.arc(c.x, c.y + Math.sin(frame * 0.08) * 4, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = 'bold 8px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', c.x, c.y + Math.sin(frame * 0.08) * 4);
      });

      // Obstacles
      const obsLabels = ['DEBT', 'FEES'];
      const obsColors = ['#E53935', '#E65100'];
      obstacles.forEach(o => {
        ctx.fillStyle = obsColors[o.type];
        ctx.beginPath();
        ctx.roundRect(o.x, groundY - 44, 36, 44, 6);
        ctx.fill();
        ctx.fillStyle = 'white'; ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center'; ctx.fillText(obsLabels[o.type], o.x + 18, groundY - 14);
        ctx.font = '16px serif'; ctx.fillText(o.type === 0 ? '💸' : '🏦', o.x + 18, groundY - 32);
      });

      // Player
      ctx.fillStyle = '#00A651';
      ctx.beginPath(); ctx.roundRect(40, playerY, 32, 36, 6); ctx.fill();
      ctx.fillStyle = 'white'; ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center'; ctx.fillText('TD', 56, playerY + 22);
      // Head
      ctx.fillStyle = '#FDBCB4';
      ctx.beginPath(); ctx.arc(56, playerY - 10, 11, 0, Math.PI * 2); ctx.fill();

      // HUD
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath(); ctx.roundRect(6, 6, 90, 24, 12); ctx.fill();
      ctx.fillStyle = '#FFB300'; ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left'; ctx.fillText(`💰 ${score} coins`, 14, 22);

      animId = requestAnimationFrame(loop);
    }

    // Stop previous animation if re-entering slide
    if (canvas._animId) cancelAnimationFrame(canvas._animId);
    animId = requestAnimationFrame(loop);
    canvas._animId = animId;
  }

  // ── Keyboard navigation ───────────────────────────────────────────────────

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next();
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   prev();
    if (e.key === ' ') { e.preventDefault(); toggleAuto(); }
  });

  // ── Boot ──────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', () => {
    // Polyfill roundRect
    if (!CanvasRenderingContext2D.prototype.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        r = Math.min(r, w / 2, h / 2);
        this.beginPath();
        this.moveTo(x + r, y); this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r);
        this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r);
        this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y);
        this.closePath(); return this;
      };
    }

    goTo(1);
    // Start auto-advance
    autoTimer = setInterval(next, AUTO_INTERVAL);
  });

  return { next, prev, goTo, toggleAuto };
})();
