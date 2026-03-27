// ===== FINANCIAL LITERACY CONTENT =====
const LESSONS = [
  {
    id: 'budgeting',
    title: '💰 What is Budgeting?',
    tag: 'Basics',
    summary: 'A budget is a plan for your money — it tells your dollars where to go.',
    content: `A budget helps you track what you earn and what you spend. The 50/30/20 rule is a great starting point:
• 50% on Needs (rent, food, transit)
• 30% on Wants (games, eating out, clothes)
• 20% on Savings & paying off debt

TD Tip: Even saving $5/week adds up to $260 a year!`
  },
  {
    id: 'savings',
    title: '🏦 Why Save Money?',
    tag: 'Savings',
    summary: 'Saving money gives you freedom and security for the future.',
    content: `Savings protect you when unexpected things happen — like a broken phone or losing a job. There are different types of savings:
• Emergency Fund: 3-6 months of expenses
• Short-term: Saving for something specific (new laptop, trip)
• Long-term: Retirement, house down payment

TD Tip: A TD savings account earns interest — your money grows while you sleep!`
  },
  {
    id: 'credit',
    title: '💳 Understanding Credit',
    tag: 'Credit',
    summary: 'Credit is borrowed money you promise to pay back — use it wisely.',
    content: `A credit score is a number (300–900) that shows how trustworthy you are with money. Higher is better!

What affects your score:
• Paying bills on time ✅
• Not maxing out your credit card ✅
• Having a long credit history ✅
• Applying for too much credit at once ❌

TD Tip: Start building credit early with a student credit card — but always pay the full balance!`
  },
  {
    id: 'investing',
    title: '📈 Investing 101',
    tag: 'Investing',
    summary: 'Investing means putting money to work so it can grow over time.',
    content: `When you invest, you buy something (like stocks) hoping it increases in value. Key concepts:
• Stocks: Owning a small piece of a company
• Bonds: Lending money to a company/government
• Diversification: Spreading money across different investments to reduce risk
• Compound interest: Earning interest on your interest — the magic of long-term investing!

TD Tip: Starting at 18 vs 28 can mean hundreds of thousands more at retirement!`
  },
  {
    id: 'taxes',
    title: '📋 Taxes Explained',
    tag: 'Taxes',
    summary: 'Taxes fund public services — understanding them helps you keep more money.',
    content: `In Canada, you pay income tax on money you earn. The more you earn, the higher your tax rate (progressive tax).

Key tax tools for young Canadians:
• TFSA (Tax-Free Savings Account): Investment growth is TAX FREE
• RRSP: Save for retirement and reduce your taxes now
• Tax return: If too much was withheld, you get money back!

TD Tip: Filing your taxes every year builds your RRSP contribution room — even if you owe nothing!`
  },
  {
    id: 'debt',
    title: '⚠️ Good Debt vs Bad Debt',
    tag: 'Debt',
    summary: 'Not all debt is equal — some debt helps you build wealth, some destroys it.',
    content: `Good debt helps you build value over time:
• Student loans (education increases earning power)
• Mortgage (owning a home builds equity)

Bad debt costs you money with little return:
• High-interest credit card debt (19-29% interest!)
• Payday loans (can be 400%+ interest!)

The Avalanche Method: Pay off highest-interest debt first to save the most money.

TD Tip: Always pay more than the minimum on credit cards!`
  }
];

const QUIZ_QUESTIONS = [
  {
    q: "What does the '50' in the 50/30/20 budget rule represent?",
    answers: ["Savings", "Needs", "Wants", "Investments"],
    correct: 1,
    explanation: "50% goes to Needs like rent, food, and transportation — the essentials you can't skip."
  },
  {
    q: "What is compound interest?",
    answers: ["Interest on a loan", "Earning interest on your interest", "A type of tax", "A bank fee"],
    correct: 1,
    explanation: "Compound interest means you earn interest on both your original money AND the interest already earned. It snowballs over time!"
  },
  {
    q: "What is a good credit score range in Canada?",
    answers: ["100–300", "300–500", "660–900", "1000–1500"],
    correct: 2,
    explanation: "In Canada, credit scores range from 300–900. A score of 660+ is considered good, and 760+ is excellent!"
  },
  {
    q: "What does TFSA stand for?",
    answers: ["Total Financial Savings Account", "Tax-Free Savings Account", "TD Federal Savings Account", "Timed Fixed Savings Account"],
    correct: 1,
    explanation: "TFSA = Tax-Free Savings Account. Any money you earn inside a TFSA is completely tax-free — it's one of the best tools for young Canadians!"
  },
  {
    q: "Which is an example of 'bad debt'?",
    answers: ["Student loan", "Mortgage", "Payday loan", "Business loan"],
    correct: 2,
    explanation: "Payday loans can charge 400%+ annual interest. They trap people in debt cycles. Always avoid them!"
  },
  {
    q: "What is an emergency fund?",
    answers: ["Money for vacations", "3-6 months of living expenses saved", "A government benefit", "A type of investment"],
    correct: 1,
    explanation: "An emergency fund covers 3-6 months of expenses. It's your financial safety net for unexpected events like job loss or medical bills."
  },
  {
    q: "What does 'diversification' mean in investing?",
    answers: ["Putting all money in one stock", "Spreading investments to reduce risk", "Investing only in bonds", "Saving in multiple banks"],
    correct: 1,
    explanation: "Diversification means spreading your money across different investments. If one drops, others may rise — reducing your overall risk."
  },
  {
    q: "When should you start saving for retirement?",
    answers: ["At 60", "At 40", "As early as possible", "After buying a house"],
    correct: 2,
    explanation: "The earlier you start, the more compound interest works in your favor. Starting at 18 vs 28 can mean hundreds of thousands more at retirement!"
  },
  {
    q: "What is the best strategy for paying off multiple debts?",
    answers: ["Pay the smallest debt first", "Pay the highest-interest debt first", "Pay them all equally", "Ignore them"],
    correct: 1,
    explanation: "The Avalanche Method — paying highest-interest debt first — saves you the most money overall. High interest debt grows fast!"
  },
  {
    q: "What happens if you only pay the minimum on your credit card?",
    answers: ["Nothing changes", "Your score improves", "You pay much more in interest over time", "The debt disappears"],
    correct: 2,
    explanation: "Paying only the minimum means most of your payment goes to interest, not the balance. A $1,000 balance can take years and cost hundreds extra!"
  }
];

const FINANCIAL_TIPS = [
  "💡 Pay yourself first — save before you spend!",
  "💡 A latte a day = ~$1,500/year. Small habits add up!",
  "💡 Check your bank statement weekly to spot surprises.",
  "💡 Automate your savings so you never forget.",
  "💡 Your credit score affects your mortgage rate — protect it!",
  "💡 Needs vs Wants: Ask yourself before every purchase.",
  "💡 Compound interest doubles money roughly every 7 years at 10%.",
  "💡 Never invest money you can't afford to lose.",
  "💡 A TFSA is the best first investment account for Canadians.",
  "💡 Negotiate your salary — even a $2k raise compounds over a career!"
];
