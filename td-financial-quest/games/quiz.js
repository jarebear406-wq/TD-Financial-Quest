// ===== FINANCE ACADEMY - ABCmouse-style Quiz =====
const Quiz = (() => {
  let currentQ = 0;
  let xpEarned = 0;
  let answered = false;
  const CHARACTERS = ['🦊', '🐸', '🦁', '🐧', '🦄', '🐯'];
  let charIdx = 0;

  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

  function load() {
    currentQ = 0;
    xpEarned = 0;
    answered = false;
    charIdx = Math.floor(Math.random() * CHARACTERS.length);
    document.getElementById('quiz-char').textContent = CHARACTERS[charIdx];
    document.getElementById('quiz-xp').textContent = '0';
    renderQuestion();
  }

  function renderQuestion() {
    if (currentQ >= QUIZ_QUESTIONS.length) {
      showComplete();
      return;
    }

    answered = false;
    const q = QUIZ_QUESTIONS[currentQ];
    const total = QUIZ_QUESTIONS.length;

    document.getElementById('quiz-question').textContent = q.q;
    document.getElementById('quiz-progress-label').textContent = `Q ${currentQ + 1} of ${total}`;
    document.getElementById('quiz-progress-bar').style.width = `${(currentQ / total) * 100}%`;

    const feedback = document.getElementById('quiz-feedback');
    feedback.className = 'quiz-feedback';
    feedback.textContent = '';

    // Build shuffled answers with original index tracking
    const indexed = q.answers.map((a, i) => ({ text: a, idx: i }));
    const shuffled = shuffle(indexed);

    const container = document.getElementById('quiz-answers');
    container.innerHTML = '';
    shuffled.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'quiz-answer-btn pop-in';
      btn.textContent = item.text;
      btn.onclick = () => answer(item.idx, q.correct, btn, container);
      container.appendChild(btn);
    });
  }

  function answer(chosen, correct, btn, container) {
    if (answered) return;
    answered = true;

    const isCorrect = chosen === correct;
    const feedback = document.getElementById('quiz-feedback');

    // Highlight all buttons
    Array.from(container.children).forEach(b => {
      b.disabled = true;
    });

    if (isCorrect) {
      btn.classList.add('correct');
      const xp = 20;
      xpEarned += xp;
      App.addXP(xp);
      document.getElementById('quiz-xp').textContent = xpEarned;
      feedback.className = 'quiz-feedback correct-fb show';
      feedback.innerHTML = `✅ Correct! +${xp} XP<br/><small>${QUIZ_QUESTIONS[currentQ].explanation}</small>`;
      document.getElementById('quiz-char').textContent = '🎉';
      setTimeout(() => {
        document.getElementById('quiz-char').textContent = CHARACTERS[charIdx];
      }, 1000);
    } else {
      btn.classList.add('wrong');
      feedback.className = 'quiz-feedback wrong-fb show';
      feedback.innerHTML = `❌ Not quite!<br/><small>${QUIZ_QUESTIONS[currentQ].explanation}</small>`;
      btn.classList.add('shake');
    }

    setTimeout(() => {
      currentQ++;
      renderQuestion();
    }, 2200);
  }

  function showComplete() {
    const container = document.getElementById('quiz-answers');
    container.innerHTML = '';
    document.getElementById('quiz-question').textContent = `Quiz complete! You earned ${xpEarned} XP! 🎓`;
    document.getElementById('quiz-char').textContent = '🏆';
    document.getElementById('quiz-progress-bar').style.width = '100%';
    // Submit to leaderboard
    Leaderboard.promptName(name => {
      Leaderboard.submitScore('quiz', xpEarned, name);
    });
    document.getElementById('quiz-feedback').className = 'quiz-feedback correct-fb show';
    document.getElementById('quiz-feedback').innerHTML =
      `Amazing work! You're building real financial skills.<br/>
       <button class="btn-primary" style="margin-top:12px" onclick="Quiz.load()">Play Again</button>
       <button class="btn-primary" style="margin-top:8px;background:var(--td-blue)" onclick="App.showScreen('screen-home')">Back to Map</button>`;
    App.addBadge('quiz-master');
  }

  return { load };
})();
