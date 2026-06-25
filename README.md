# DevMate AI — AI-Powered Engineering Productivity Assistant

DevMate AI is a highly polished, production-ready developer companion tool built for hackathons and daily workflows. It interacts with the Claude API (Anthropic) to solve three real daily engineering problems: estimating task completion time, reviewing JavaScript/Node.js code, and drafting professional GitHub Pull Request descriptions.

## 🚀 Key Features

1. **⏱️ Time Estimator**  
   Input a product requirement, and get an instant, senior-level Node.js-specific project timeline estimate complete with task breakdowns, hours, complexity ratings, recommended npm libraries, and project risks.

2. **🛡️ Code Reviewer**  
   Paste JavaScript or Node.js code to detect security issues (such as SQL injection), promise rejections, async/await error handling, callback issues, validation, rate limiting, and general style violations. Features a beautiful visual score gauge out of 100.

3. **🔀 PR Description Generator**  
   Enter developer logs, git diffs, or summaries to write a conventional-commit styled Pull Request description template complete with automated title suggestion, changes breakdown list, validation tests instructions, and testing steps.

---

## 🛠️ Project Structure

```text
devmate-ai/
├── server/
│   ├── server.js            # Node.js + Express backend server
│   ├── .env                 # API Credentials (never committed to Git)
│   ├── .gitignore           # Ignores Node modules and secrets
│   └── package.json         # Server dependency configurations
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx   # Top-bar display with pill badges
│   │   │   ├── Tabs.jsx     # Navigation menu selector
│   │   │   ├── TimeEstimator.jsx # Time estimate utility interface
│   │   │   ├── CodeReview.jsx    # Code audits and score visualization
│   │   │   └── PRGenerator.jsx   # Pull Request markup compiler
│   │   ├── App.jsx          # Main application orchestrator
│   │   ├── index.css        # Global CSS layout and animations
│   │   └── main.jsx         # React mounting execution entry
│   ├── package.json         # Client build script configurations
│   ├── tailwind.config.js   # Tailwind configurations
│   ├── postcss.config.js    # PostCSS configurations
│   └── index.html           # Main HTML page entry with SEO configurations
└── README.md                # Configuration & documentation
```

---

## ⚙️ Setup & Installation Instructions

Follow these steps to run DevMate AI locally:

### 1. Register for Claude API Key
1. Go to the [Anthropic Console](https://console.anthropic.com/) and register for an account.
2. Generate an API Key under the Developer console.

### 2. Configure Backend Credentials
Create/Open the `.env` file under the `/server/` directory and replace the placeholder API key:
```env
ANTHROPIC_API_KEY=sk-ant-xxxxx
PORT=5000
```

### 3. Run the Express Backend Server
Open a terminal workspace, and run:
```bash
cd server
npm install
npm start
```
The server will boot and run on `http://localhost:5000`.

### 4. Run the React Frontend Client
Open a secondary terminal workspace, and run:
```bash
cd client
npm install --legacy-peer-deps
npm run dev
```
The frontend dev server will launch on `http://localhost:5173`. Open this URL in your web browser.

---

## 🛡️ Security Details

To prevent exposing keys inside frontend bundles, the React client communicates exclusively with the Express proxy server (`localhost:5000/api/claude`). The Express server makes secure HTTP requests to Anthropic using keys retrieved from `dotenv`. The `.env` file is excluded from repository tracking using `.gitignore`.
