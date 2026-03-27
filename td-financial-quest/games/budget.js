// ===== BUDGET BOSS - Monthly Budget Strategy Game =====
const Budget = (() => {
  let month, income, expenses, totalSpent;

  const SCENARIOS = [
    {
      income: 1800,
      label: 'Part-time job at a café',
      expenses: [
        { icon: '🏠', name: 'Rent (shared)', desc: 'Your share of a shared apartment', min: 400, max: 800, step: 50, value: 600, required: true },
        { icon: '🍔', name: 'Food & Groceries', desc: 'Meals, snacks, and groceries', min: 100, max: 400, step: 25, value: 200, required: true },
        { icon: '🚌', name: 'Transit Pass', desc: 'Monthly bus/subway pass', min: 0, max: 150, step: 50, value: 100, required: false },
        { icon: '📱', name: 'Phone Plan', desc: 'Monthly cell phone bill', min: 0, max: 80, step: 10, value: 40, required: false },
        { icon: '🎮', name: 'Entertainment', desc: 'Games, streaming, fun', min: 0, max: 200, step: 20, value: 60, required: false },
        { icon: '💰', name: 'Savings', desc: 'Money set aside for the future', min: 0, max: 400, step: 25, value: 100, required: false },
      ]
    },
    {
      income: 3200,
      label: 'First full-time job',
      expenses: [
        { icon: '🏠', name: 'Rent', desc: 'Your own apartment', min: 800, max: 1600, step: 100, value: 1100, required: true },
        { icon: '🍔', name: 'Food & Groceries', desc: 'Meals and groceries', min: 200, max: 600, step: 50, value: 350, required: true },
        { icon: '🚗', name: 'Car / Transit', desc: 'Car payment or transit', min: 0, max: 500, step: 50, value: 200, required: false },
        { icon: '📱', name: 'Phone Plan', desc: 'Monthly cell phone bill', min: 0, max: 100, step: 10, value: 60, required: false },
        { icon: '🎮', name: 'Entertainment', desc: 'Fun money', min: 0, max: 300, step: 25, value: 100, required: false },
        { icon: '💰', name: 'Savings / TFSA', desc: 'Investing in your future', min: 0, max: 800, step: 50, value: 300, required: false },
        { icon: '👕', name: 'Clothing', desc: 'Clothes and accessories', min: 0, max: 200, step: 25, value: 75, required: false },
      ]
    }
  ];

  function load() {
    month = 1;
    const scenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    income = scenario.income;
    expenses = scenario.expenses.map(e => ({ ...e }));
    document.getElementById('budget-income').textContent = `$${income.toLocaleString()}`;
    document.getElementById('budget-month').textContent = month;
    document.getElementById('budget-feedback').className = 'budget-feedback';
    renderExpenses();
  }

  function renderExpenses() {
    totalSpent = expenses.reduce((s, e) => s + e.value, 0);
    const list = document.getElementById('expense-list');
    list.innerHTML = '';

    expenses.forEach((exp, i) => {
      const item = document.createElement('div');
      item.className = 'expense-item';
      item.innerHTML = `
        <div class="expense-icon">${exp.icon}</div>
        <div class="expense-info">
          <h4>${exp.name}${exp.required ? ' <span style="color:var(--td-red);font-size:10px">REQUIRED</span>' : ''}</h4>
          <p>${exp.desc}</p>
        </div>
        <div class="expense-controls">
          <button onclick="Budget.adjust(${i}, -1)">−</button>
          <span class="expense-amount">$${exp.value}</span>
          <button onclick="Budget.adjust(${i}, 1)">+</button>
        </div>
      `;
      list.appendChild(item);
    });

    updateMeter();
  }

  function adjust(idx, dir) {
    const exp = expenses[idx];
    const newVal = exp.value + dir * exp.step;
    if (newVal < exp.min || newVal > exp.max) return;
    exp.value = newVal;
    renderExpenses();
  }

  function updateMeter() {
    totalSpent = expenses.reduce((s, e) => s + e.value, 0);
    const pct = Math.min((totalSpent / income) * 100, 100);
    const fill = document.getElementById('budget-meter-fill');
    fill.style.width = pct + '%';
    fill.className = 'meter-fill' + (totalSpent > income ? ' over' : '');
    document.getElementById('budget-spent-label').textContent = `$${totalSpent} / $${income}`;
  }

  function submitMonth() {
    const remaining = income - totalSpent;
    const savingsExp = expenses.find(e => e.name.includes('Savings'));
    const savings = savingsExp ? savingsExp.value : 0;
    const feedback = document.getElementById('budget-feedback');
    feedback.className = 'budget-feedback show';

    let msg = '';
    let xp = 0;

    if (totalSpent > income) {
      msg = `⚠️ You overspent by $${totalSpent - income}! You're going into debt this month. Try reducing entertainment or clothing expenses.`;
      xp = 5;
    } else if (savings >= income * 0.2) {
      msg = `🌟 Amazing! You saved ${Math.round((savings / income) * 100)}% of your income — that's the 50/30/20 rule in action! You have $${remaining} left over.`;
      xp = 40;
      App.addBadge('budget-boss');
    } else if (savings > 0) {
      msg = `✅ Good job! You saved $${savings} this month. Try to aim for 20% of income ($${Math.floor(income * 0.2)}) for maximum financial health.`;
      xp = 20;
    } else {
      msg = `💡 You balanced your budget but saved nothing. Even $${Math.floor(income * 0.1)}/month would add up to $${Math.floor(income * 0.1 * 12)}/year!`;
      xp = 10;
    }

    App.addXP(xp);
    msg += `<br/><br/><strong>+${xp} XP earned!</strong>`;
    // Submit to leaderboard
    Leaderboard.promptName(name => {
      Leaderboard.submitScore('budget', xp, name);
    });

    if (month < 6) {
      msg += `<br/><button class="btn-primary" style="margin-top:12px" onclick="Budget.nextMonth()">Next Month ▶</button>`;
    } else {
      msg += `<br/><button class="btn-primary" style="margin-top:12px" onclick="Budget.load()">Play Again</button>`;
    }

    feedback.innerHTML = msg;
  }

  function nextMonth() {
    month++;
    document.getElementById('budget-month').textContent = month;
    // Slight income increase each month
    income = Math.floor(income * 1.03);
    document.getElementById('budget-income').textContent = `$${income.toLocaleString()}`;
    document.getElementById('budget-feedback').className = 'budget-feedback';
    renderExpenses();
  }

  return { load, adjust, submitMonth, nextMonth };
})();
