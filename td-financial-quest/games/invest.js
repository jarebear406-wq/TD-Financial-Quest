// ===== STOCK SURGE - Investment Simulation =====
const Invest = (() => {
  let portfolio, cash, round, holdings;
  let priceHistory = {};
  let canvas, ctx;

  const STOCKS = [
    { symbol: 'TDB', name: 'TD Bank', price: 85, volatility: 0.03, trend: 0.01, color: '#00A651' },
    { symbol: 'TECH', name: 'TechCorp', price: 120, volatility: 0.07, trend: 0.02, color: '#1565C0' },
    { symbol: 'GROC', name: 'GroceryCo', price: 45, volatility: 0.02, trend: 0.005, color: '#E65100' },
    { symbol: 'ENRG', name: 'EnergyPlus', price: 60, volatility: 0.05, trend: -0.005, color: '#6A1B9A' },
  ];

  const TIPS = [
    "💡 Buy low, sell high — but timing the market is nearly impossible. Time IN the market beats timing the market.",
    "💡 Diversify! Don't put all your money in one stock.",
    "💡 Volatility is normal. Don't panic-sell during dips.",
    "💡 TD Bank stock (TDB) is a stable, dividend-paying stock — great for beginners.",
    "💡 Tech stocks grow fast but can crash hard. Balance risk with stable stocks.",
    "💡 In a real TFSA, all these gains would be TAX FREE!",
    "💡 Compound growth: $1,000 at 7%/year = $7,612 after 30 years!",
  ];

  function load() {
    canvas = document.getElementById('stock-canvas');
    ctx = canvas.getContext('2d');
    portfolio = 1000;
    cash = 1000;
    round = 1;
    holdings = {};
    STOCKS.forEach(s => {
      holdings[s.symbol] = 0;
      priceHistory[s.symbol] = [s.price];
    });
    updatePortfolioValue();
    renderTicker();
    renderStocks();
    drawChart();
    showTip();
  }

  function updatePortfolioValue() {
    let stockValue = 0;
    STOCKS.forEach(s => {
      stockValue += (holdings[s.symbol] || 0) * s.price;
    });
    portfolio = cash + stockValue;
    document.getElementById('invest-portfolio').textContent = `$${portfolio.toFixed(0)}`;
  }

  function renderTicker() {
    const items = STOCKS.map(s => {
      const prev = priceHistory[s.symbol];
      const last = prev[prev.length - 1];
      const change = ((s.price - last) / last * 100).toFixed(1);
      const arrow = change >= 0 ? '▲' : '▼';
      return `${s.symbol} $${s.price.toFixed(2)} ${arrow}${Math.abs(change)}%`;
    }).join('   |   ');
    document.getElementById('market-ticker').textContent = `📊 LIVE MARKET: ${items}`;
  }

  function renderStocks() {
    const list = document.getElementById('stock-list');
    list.innerHTML = '';
    STOCKS.forEach(s => {
      const prev = priceHistory[s.symbol];
      const prevPrice = prev.length > 1 ? prev[prev.length - 2] : prev[0];
      const change = ((s.price - prevPrice) / prevPrice * 100).toFixed(1);
      const isUp = change >= 0;
      const owned = holdings[s.symbol] || 0;

      const item = document.createElement('div');
      item.className = 'stock-item';
      item.innerHTML = `
        <div class="stock-symbol" style="color:${s.color}">${s.symbol}</div>
        <div class="stock-name">${s.name}<br/><small style="color:#555">Owned: ${owned} shares</small></div>
        <div>
          <div class="stock-price">$${s.price.toFixed(2)}</div>
          <div class="stock-change ${isUp ? 'up' : 'down'}">${isUp ? '▲' : '▼'}${Math.abs(change)}%</div>
        </div>
        <div class="stock-btns">
          <button class="btn-buy" onclick="Invest.buy('${s.symbol}')">BUY</button>
          <button class="btn-sell" onclick="Invest.sell('${s.symbol}')" ${owned === 0 ? 'disabled style="opacity:0.4"' : ''}>SELL</button>
        </div>
      `;
      list.appendChild(item);
    });
  }

  function buy(symbol) {
    const stock = STOCKS.find(s => s.symbol === symbol);
    if (!stock || cash < stock.price) {
      showFeedback('Not enough cash to buy!');
      return;
    }
    cash -= stock.price;
    holdings[symbol] = (holdings[symbol] || 0) + 1;
    updatePortfolioValue();
    renderStocks();
    showFeedback(`Bought 1 share of ${symbol} at $${stock.price.toFixed(2)}`);
  }

  function sell(symbol) {
    const stock = STOCKS.find(s => s.symbol === symbol);
    if (!stock || !holdings[symbol]) return;
    cash += stock.price;
    holdings[symbol]--;
    updatePortfolioValue();
    renderStocks();
    showFeedback(`Sold 1 share of ${symbol} at $${stock.price.toFixed(2)}`);
  }

  function showFeedback(msg) {
    document.getElementById('invest-tip').textContent = msg;
  }

  function showTip() {
    document.getElementById('invest-tip').textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
  }

  function nextRound() {
    round++;
    // Update prices
    STOCKS.forEach(s => {
      priceHistory[s.symbol].push(s.price);
      const change = (Math.random() - 0.5) * 2 * s.volatility + s.trend;
      s.price = Math.max(5, s.price * (1 + change));
    });

    updatePortfolioValue();
    renderTicker();
    renderStocks();
    drawChart();

    const gain = portfolio - 1000;
    if (round > 10) {
      const xp = Math.max(10, Math.floor(gain / 10));
      App.addXP(xp);
      // Submit portfolio value to leaderboard
      Leaderboard.promptName(name => {
        Leaderboard.submitScore('invest', Math.floor(portfolio), name);
      });
      showFeedback(`Round ${round} — Portfolio: $${portfolio.toFixed(0)} (${gain >= 0 ? '+' : ''}$${gain.toFixed(0)} from start) | +${xp} XP`);
      if (gain > 200) App.addBadge('investor');
    } else {
      showTip();
    }
  }

  function drawChart() {
    if (!ctx) return;
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#21262d';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = (h / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw each stock line
    STOCKS.forEach(s => {
      const hist = priceHistory[s.symbol];
      if (hist.length < 2) return;

      const allPrices = STOCKS.flatMap(st => priceHistory[st.symbol]);
      const minP = Math.min(...allPrices) * 0.95;
      const maxP = Math.max(...allPrices) * 1.05;
      const range = maxP - minP;

      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      hist.forEach((price, i) => {
        const x = (i / Math.max(hist.length - 1, 1)) * (w - 20) + 10;
        const y = h - ((price - minP) / range) * (h - 20) - 10;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();

      // Label at end
      const lastX = w - 10;
      const lastPrice = hist[hist.length - 1];
      const lastY = h - ((lastPrice - minP) / range) * (h - 20) - 10;
      ctx.fillStyle = s.color;
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(s.symbol, lastX, lastY - 4);
    });
  }

  return { load, buy, sell, nextRound };
})();
