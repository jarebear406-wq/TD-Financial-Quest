// ===== MONEY RUNNER - Temple Run Style Endless Runner =====
const Runner = (() => {
  let canvas, ctx, animId;
  let state = 'idle'; // idle | running | dead
  let score, lives, distance, speed, frameCount;
  let player, obstacles, coins, particles;
  let groundY, jumpForce;

  const OBSTACLE_TYPES = [
    { label: 'DEBT', color: '#E53935', emoji: '💸', tip: 'Debt costs you money over time through interest!' },
    { label: 'SCAM', color: '#6A1B9A', emoji: '⚠️', tip: 'Scams steal your money — never share your PIN!' },
    { label: 'FEES', color: '#E65100', emoji: '🏦', tip: 'Bank fees add up! Look for no-fee accounts.' },
    { label: 'LOAN', color: '#B71C1C', emoji: '📄', tip: 'Payday loans can charge 400%+ interest. Avoid them!' },
  ];

  const COIN_TYPES = [
    { value: 1, color: '#FFB300', size: 14, label: '$' },
    { value: 5, color: '#00A651', size: 18, label: '$$' },
    { value: 10, color: '#1565C0', size: 22, label: '$$$' },
  ];

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height - 60;
    groundY = canvas.height - 80;
  }

  function init() {
    canvas = document.getElementById('runner-canvas');
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('keydown', e => { if (e.code === 'Space') jump(); });
    canvas.addEventListener('touchstart', e => { e.preventDefault(); jump(); }, { passive: false });
    canvas.addEventListener('mousedown', jump);
  }

  function resetState() {
    score = 0; lives = 3; distance = 0; speed = 4; frameCount = 0;
    jumpForce = 0;
    player = {
      x: 80, y: groundY - 50,
      w: 40, h: 50,
      vy: 0, onGround: true,
      frame: 0, frameTimer: 0,
      invincible: 0
    };
    obstacles = []; coins = []; particles = [];
    updateHUD();
  }

  function start() {
    if (state === 'running') return;
    resetState();
    state = 'running';
    document.getElementById('runner-overlay').classList.add('hidden');
    if (animId) cancelAnimationFrame(animId);
    loop();
  }

  function quit() {
    state = 'idle';
    if (animId) cancelAnimationFrame(animId);
    App.showScreen('screen-home');
  }

  function jump() {
    if (state !== 'running') return;
    if (player.onGround) {
      player.vy = -16;
      player.onGround = false;
      spawnParticles(player.x + player.w / 2, player.y + player.h, '#00A651', 6);
    }
  }

  function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: -Math.random() * 5 - 2,
        life: 1, color, size: Math.random() * 6 + 3
      });
    }
  }

  function updateHUD() {
    document.getElementById('runner-score').textContent = score;
    document.getElementById('runner-lives').textContent = '❤️'.repeat(lives);
    document.getElementById('runner-distance').textContent = Math.floor(distance) + 'm';
  }

  function spawnObstacle() {
    const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    const h = 50 + Math.random() * 30;
    obstacles.push({
      x: canvas.width + 20,
      y: groundY - h,
      w: 44, h,
      ...type,
      hit: false
    });
  }

  function spawnCoin() {
    const type = COIN_TYPES[Math.floor(Math.random() * COIN_TYPES.length)];
    const row = Math.random() < 0.3 ? 1 : 0; // 30% chance of high coin
    coins.push({
      x: canvas.width + 20,
      y: groundY - 60 - (row * 80),
      r: type.size / 2,
      ...type,
      collected: false,
      bob: Math.random() * Math.PI * 2
    });
  }

  function drawBackground() {
    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, groundY);
    sky.addColorStop(0, '#0d1b2a');
    sky.addColorStop(1, '#1a3a5c');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.width, groundY);

    // Stars
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    for (let i = 0; i < 30; i++) {
      const sx = (i * 137 + frameCount * 0.2) % canvas.width;
      const sy = (i * 73) % (groundY * 0.7);
      ctx.beginPath();
      ctx.arc(sx, sy, 1, 0, Math.PI * 2);
      ctx.fill();
    }

    // City skyline
    ctx.fillStyle = '#0a1628';
    const buildings = [60, 90, 50, 110, 70, 85, 45, 100, 65, 80, 55, 95];
    let bx = (-frameCount * speed * 0.3) % (canvas.width * 1.5);
    buildings.forEach((bh, i) => {
      const bw = 40 + (i % 3) * 15;
      ctx.fillRect(bx + i * 55, groundY - bh, bw, bh);
      // windows
      ctx.fillStyle = 'rgba(255,220,100,0.3)';
      for (let wy = groundY - bh + 8; wy < groundY - 10; wy += 14) {
        for (let wx = bx + i * 55 + 6; wx < bx + i * 55 + bw - 6; wx += 12) {
          if (Math.random() > 0.4) ctx.fillRect(wx, wy, 6, 8);
        }
      }
      ctx.fillStyle = '#0a1628';
    });

    // Ground
    const ground = ctx.createLinearGradient(0, groundY, 0, canvas.height);
    ground.addColorStop(0, '#006B3F');
    ground.addColorStop(0.3, '#00843D');
    ground.addColorStop(1, '#004d2c');
    ctx.fillStyle = ground;
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    // Ground line
    ctx.strokeStyle = '#00C96A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(canvas.width, groundY);
    ctx.stroke();

    // Road dashes
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 3;
    ctx.setLineDash([30, 20]);
    ctx.beginPath();
    ctx.moveTo(0, groundY + 20);
    ctx.lineTo(canvas.width, groundY + 20);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function drawPlayer() {
    const p = player;
    if (p.invincible > 0 && Math.floor(p.invincible / 4) % 2 === 0) return;

    ctx.save();
    ctx.translate(p.x + p.w / 2, p.y + p.h / 2);

    // Body
    ctx.fillStyle = '#00A651';
    ctx.beginPath();
    ctx.roundRect(-p.w / 2, -p.h / 2, p.w, p.h, 8);
    ctx.fill();

    // TD logo on shirt
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TD', 0, 4);

    // Head
    ctx.fillStyle = '#FDBCB4';
    ctx.beginPath();
    ctx.arc(0, -p.h / 2 - 12, 14, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(-5, -p.h / 2 - 14, 2.5, 0, Math.PI * 2);
    ctx.arc(5, -p.h / 2 - 14, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -p.h / 2 - 10, 5, 0.2, Math.PI - 0.2);
    ctx.stroke();

    ctx.restore();
  }

  function drawObstacles() {
    obstacles.forEach(ob => {
      if (ob.hit) return;
      ctx.save();
      ctx.translate(ob.x + ob.w / 2, ob.y + ob.h / 2);

      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, ob.h / 2 + 4, ob.w / 2, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.fillStyle = ob.color;
      ctx.beginPath();
      ctx.roundRect(-ob.w / 2, -ob.h / 2, ob.w, ob.h, 8);
      ctx.fill();

      // Emoji
      ctx.font = '22px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ob.emoji, 0, -8);

      // Label
      ctx.fillStyle = 'white';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(ob.label, 0, 12);

      ctx.restore();
    });
  }

  function drawCoins() {
    const t = frameCount * 0.05;
    coins.forEach(c => {
      if (c.collected) return;
      ctx.save();
      ctx.translate(c.x, c.y + Math.sin(t + c.bob) * 5);

      // Glow
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, c.r * 2);
      glow.addColorStop(0, c.color + '88');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, c.r * 2, 0, Math.PI * 2);
      ctx.fill();

      // Coin
      ctx.fillStyle = c.color;
      ctx.beginPath();
      ctx.arc(0, 0, c.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = `bold ${c.r}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', 0, 0);

      ctx.restore();
    });
  }

  function drawParticles() {
    particles.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function drawHUD() {
    // Score banner
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.roundRect(10, 10, 120, 36, 18);
    ctx.fill();
    ctx.fillStyle = '#FFB300';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`💰 ${score}`, 20, 28);
  }

  function checkCollisions() {
    // Coins
    coins.forEach(c => {
      if (c.collected) return;
      const dx = (player.x + player.w / 2) - c.x;
      const dy = (player.y + player.h / 2) - c.y;
      if (Math.sqrt(dx * dx + dy * dy) < c.r + 20) {
        c.collected = true;
        score += c.value;
        App.addCoins(c.value);
        spawnParticles(c.x, c.y, c.color, 8);
        updateHUD();
      }
    });

    // Obstacles
    if (player.invincible > 0) return;
    obstacles.forEach(ob => {
      if (ob.hit) return;
      if (
        player.x + 8 < ob.x + ob.w &&
        player.x + player.w - 8 > ob.x &&
        player.y + 8 < ob.y + ob.h &&
        player.y + player.h > ob.y
      ) {
        ob.hit = true;
        lives--;
        player.invincible = 80;
        spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#E53935', 12);
        showTip(ob.tip);
        updateHUD();
        if (lives <= 0) gameOver();
      }
    });
  }

  function showTip(tip) {
    document.getElementById('runner-tip').textContent = tip;
  }

  function gameOver() {
    state = 'dead';
    cancelAnimationFrame(animId);
    const xpEarned = Math.floor(score / 2);
    App.addXP(xpEarned);
    // Submit to leaderboard
    Leaderboard.promptName(name => {
      Leaderboard.submitScore('runner', score, name);
    });
    const overlay = document.getElementById('runner-overlay');
    overlay.classList.remove('hidden');
    document.getElementById('runner-overlay-title').textContent = '💸 Game Over!';
    document.getElementById('runner-overlay-msg').textContent =
      `You ran ${Math.floor(distance)}m and collected ${score} coins!\n+${xpEarned} XP earned!`;
    document.getElementById('runner-tip').textContent =
      FINANCIAL_TIPS[Math.floor(Math.random() * FINANCIAL_TIPS.length)];
    document.getElementById('runner-start-btn').textContent = 'Play Again';
  }

  function loop() {
    if (state !== 'running') return;
    frameCount++;
    distance += speed * 0.05;
    speed = 4 + distance * 0.02; // gradually speed up

    // Physics
    player.vy += 0.7; // gravity
    player.y += player.vy;
    if (player.y >= groundY - player.h) {
      player.y = groundY - player.h;
      player.vy = 0;
      player.onGround = true;
    }
    if (player.invincible > 0) player.invincible--;

    // Spawn
    if (frameCount % Math.max(60, 120 - Math.floor(distance / 10)) === 0) spawnObstacle();
    if (frameCount % 45 === 0) spawnCoin();

    // Move obstacles & coins
    obstacles.forEach(ob => { ob.x -= speed; });
    coins.forEach(c => { c.x -= speed; });
    obstacles = obstacles.filter(ob => ob.x > -100);
    coins = coins.filter(c => c.x > -50);

    // Particles
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.2; p.life -= 0.04;
    });
    particles = particles.filter(p => p.life > 0);

    checkCollisions();

    // Draw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawParticles();
    drawCoins();
    drawObstacles();
    drawPlayer();
    drawHUD();

    animId = requestAnimationFrame(loop);
  }

  // Init on first use
  document.addEventListener('DOMContentLoaded', init);

  return { start, jump, quit };
})();
