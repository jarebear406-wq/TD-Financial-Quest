# TD Financial Quest 🏦💰

A financial literacy game app for ages 12–22, built with TD Bank branding. Inspired by ABCmouse and Temple Run — learn real money skills through fun, interactive games.

## Live Demo

> After deploying to GitHub Pages, your link will be:
> `https://YOUR-USERNAME.github.io/td-financial-quest`

## Games

| Game | Type | What You Learn |
|------|------|----------------|
| 🏃 Money Runner | Endless runner | Avoiding debt, collecting savings |
| 🧠 Finance Academy | Quiz game | Budgeting, credit, TFSA, investing |
| 📊 Budget Boss | Strategy | 50/30/20 rule, monthly budgeting |
| 📈 Stock Surge | Simulation | Stocks, diversification, compound growth |

## Features

- Works on desktop and mobile
- TD Bank green branding throughout
- XP system, levels, badges, and streaks
- 6 in-depth financial literacy lessons
- Progress saved in localStorage (no backend needed)
- Pure HTML/CSS/JS — no frameworks, no install required

## Run Locally

Just open the file in your browser:

```bash
open index.html
```

Or use a simple local server:

```bash
npx serve .
# then visit http://localhost:3000
```

## Deploy to GitHub Pages (free hosting)

1. Push this repo to GitHub (see setup below)
2. Go to your repo → **Settings** → **Pages**
3. Set source to `main` branch, `/ (root)` folder
4. Click **Save** — your app will be live in ~60 seconds

## Project Structure

```
td-financial-quest/
├── index.html          # App shell, all screens
├── styles.css          # Full styling (mobile + desktop)
├── app.js              # Main app logic, XP/coins/badges
├── data/
│   └── lessons.js      # Financial literacy content & quiz questions
└── games/
    ├── runner.js       # Money Runner (canvas game)
    ├── quiz.js         # Finance Academy quiz engine
    ├── budget.js       # Budget Boss game logic
    └── invest.js       # Stock Surge simulation
```

## Topics Covered

- Budgeting & the 50/30/20 rule
- Savings & emergency funds
- Credit scores & credit cards
- Investing basics (stocks, bonds, diversification)
- Canadian tax tools (TFSA, RRSP)
- Good debt vs bad debt

---

Built for educational purposes. Not financial advice.
