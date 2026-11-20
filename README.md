# DeFi Yield Optimizer & Risk-Scoring Dashboard

An institutional-grade DeFi financial analytics platform and yield optimizer that assesses smart contract audits, protocol liquidity depth, governance centralization, and APY volatility to construct risk-weighted yield-farming portfolios for institutional treasuries and professional investors.

---

## 🏛️ Architecture & Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **Next.js 14 (App Router) + React + TypeScript** | High-performance institutional UI, SSR/SSG, responsive drawer navigation |
| **Styling** | **Tailwind CSS** | Deep obsidian/navy fintech aesthetic, subtle glassmorphism, color-coded risk indicators |
| **Charts** | **Recharts** | Interactive Area, Bar, Pie, Radar, and Scatter (Efficient Frontier) charts |
| **Backend** | **Node.js + Express.js** | Modular REST APIs with controllers, services, middleware, and route separation |
| **Database** | **MongoDB + Mongoose** | Flexible schemas, validation, indexing, and seamless in-memory fallback layer |
| **Authentication** | **JWT + bcryptjs** | Secure password hashing, token verification, and 1-Click Institutional Demo Login |
| **Version Control** | **Git & GitHub** | Clean repository structure and modular architecture |

---

## 🧮 6-Pillar Quantitative Risk Scoring Engine

Every DeFi protocol is evaluated on a normalized scale from **0 to 100** based on six weighted pillars:

$$\text{Risk Score} = 0.30 \times S_{\text{sec}} + 0.25 \times S_{\text{liq}} + 0.15 \times S_{\text{stab}} + 0.10 \times S_{\text{yield}} + 0.10 \times S_{\text{gov}} + 0.10 \times S_{\text{vol}}$$

1. **Smart Contract Security & Audits (30%)**: Formal audits (OpenZeppelin, Trail of Bits, CertiK, Sigma Prime), code immutability vs proxy upgradeability, and resolved issue velocity.
2. **Liquidity & Solvency Risk (25%)**: TVL depth, pool utilization curves, exit slippage under stress, and secondary market peg resilience.
3. **Protocol Stability & Age (15%)**: Mainnet longevity across multi-year bear market liquidity shocks without bad debt insolvency.
4. **Historical Yield Performance (10%)**: Organic borrower interest rate demand vs hyper-inflationary token incentive emissions.
5. **Governance Decentralization (10%)**: DAO voting distribution, multisig signer thresholds, and mandatory 48-hour timelock execution delays.
6. **Market Volatility Resilience (10%)**: Collateral liquidation bot responsiveness and shortfall safety backstop funds.

### Risk Classifications
- **80–100 (Low Risk)**: Institutional Grade. Multi-audited, battle-tested TVL, decentralized timelock.
- **60–79 (Moderate Risk)**: Standard Yield. Strong operational health with minor pool dependencies or centralization vectors.
- **40–59 (High Risk)**: Elevated Exposure. High APY volatility, single audit, or complex derivative legs.
- **0–39 (Critical Risk)**: Distressed / Unaudited. Active vulnerabilities or privileged un-timelocked admin keys.

---

## 🚀 Key Features

1. **Executive Dashboard (`/dashboard`)**:
   - Total portfolio value, funds invested, net profit/loss, estimated annual yield, and 24h accrued performance.
   - Interactive 30-day compounded portfolio growth chart and protocol-wise allocation pie chart.
   - Live treasury positions table and safe yield opportunity highlights.

2. **Protocol Explorer (`/protocols`)**:
   - Search by name, symbol, or description.
   - Filter by Network (Ethereum, Arbitrum, Polygon, Optimism, Base, Avalanche), Category (Lending, DEX, Liquid Staking, CDP, Yield, Derivatives), and Risk Level.
   - Sort by TVL, APY, Risk Score, or Alphabetical.
   - Dual-view toggle: Institutional Grid Cards or Data Table.

3. **Protocol Details & Audit Inspector (`/protocols/[id]`)**:
   - Visual 0–100 circular radial risk gauge.
   - 6-Factor quantitative decomposition with individual contribution points.
   - Smart contract security specs: timelock hours, multisig signers, upgradeability status, bug bounty cap, and insurance reserves.
   - Full auditor directory with verified audit reports (OpenZeppelin, Trail of Bits, etc.).
   - Interactive 6-month historical APY and TVL trajectory chart.
   - Direct modal to allocate treasury funds into the protocol.

4. **Yield Farming Strategy Optimizer (`/optimizer`)**:
   - Constrained Mean-Variance optimization allocating capital across qualifying protocols.
   - Customizable parameters: Investment capital ($), Risk tolerance, Preferred chains, Minimum APY, Duration (3–36 months).
   - Presets: **Conservative** (Capital preservation, cap 30%), **Balanced** (Optimal Sharpe ratio), and **Aggressive** (Alpha yield maximization).
   - Generates weighted APY, portfolio risk score, Herfindahl diversification score, and projected 12-month return curves.
   - **1-Click Deploy to Portfolio**: Deploys optimized allocations directly into active treasury positions.

5. **Treasury Portfolio Management (`/portfolio`)**:
   - Live active positions with APY, principal, current value, earned rewards, and risk badges.
   - Deposit and withdrawal workflows with transaction generation.
   - Settlement and execution audit trail history with hashes and timestamps.

6. **Institutional Analytics & Visualizations (`/analytics`)**:
   - **Risk vs Return Scatter Plot**: Capital Allocation Line / Efficient Frontier with bubble sizing for protocol TVL.
   - **Cross-Protocol APY Comparative Bar Chart**.
   - **12-Month Macro TVL & Yield Trajectory Area Chart**.
   - **Blockchain Network Dominance Share**.

7. **Security & Authentication (`/login`, `/register`, `/settings`)**:
   - Secure registration, login, and password hashing (bcryptjs) with JWT tokens.
   - **1-Click Demo Treasury Session** (`treasury@horizoncapital.fi`) for instant review and grading without registration friction.
   - Institutional profile management, risk limits, and whitelisted networks.

---

## 📁 Project Structure

```
├── backend/
│   ├── config/
│   │   └── db.js                 # Mongoose connector + in-memory persistence fallback
│   ├── controllers/
│   │   ├── authController.js      # Register, login, demoLogin, getMe, updatePreferences
│   │   ├── protocolController.js  # Search, filter, sort protocols, details
│   │   ├── riskController.js      # 6-factor risk assessments & ecosystem overview
│   │   ├── optimizerController.js # Strategy optimizer & portfolio deployment
│   │   ├── portfolioController.js # Valuation, PnL, deposit, withdraw, transactions
│   │   └── analyticsController.js # Scatter plot, APY comparison, TVL trends
│   ├── middleware/
│   │   └── auth.js               # JWT authentication verification
│   ├── models/
│   │   ├── User.js               # User accounts & portfolio metadata
│   │   ├── Protocol.js           # Protocols, audits, 6-factor breakdowns, yields
│   │   ├── Investment.js         # Treasury positions & allocations
│   │   ├── Transaction.js        # Deposits, withdrawals, and settlements
│   │   └── OptimizerResult.js    # Saved optimization strategies
│   ├── routes/                   # Express REST route endpoints
│   ├── services/
│   │   ├── riskEngine.js         # 6-pillar risk scoring calculation algorithm
│   │   └── optimizerService.js   # Mean-variance optimization & diversification
│   ├── seed.js                   # Seeder for 11 institutional DeFi protocols & demo portfolio
│   ├── server.js                 # Express server bootstrap & health check
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx        # Root HTML layout with AuthProvider & AppShell
│   │   │   ├── page.tsx          # Landing page
│   │   │   ├── dashboard/        # Executive overview dashboard
│   │   │   ├── protocols/        # Protocol explorer & search/filter/sort
│   │   │   ├── protocols/[id]/   # Deep dive protocol risk details & deposit modal
│   │   │   ├── risk-analysis/    # Smart contract risk matrix & radar comparison
│   │   │   ├── optimizer/        # Yield strategy optimizer & portfolio deployer
│   │   │   ├── portfolio/        # Portfolio manager & withdrawal modal
│   │   │   ├── analytics/        # Recharts visual analytics (Risk vs Return scatter)
│   │   │   ├── settings/         # Profile & risk safeguards
│   │   │   ├── login/            # Sign in with 1-click Demo button
│   │   │   └── register/         # Treasury registration
│   │   ├── components/
│   │   │   ├── Navbar.tsx        # Header with live metrics & demo profile
│   │   │   ├── Sidebar.tsx       # Institutional navigation sidebar
│   │   │   ├── AppShell.tsx      # Master layout container
│   │   │   ├── MetricCard.tsx    # Quantitative metric cards with glow
│   │   │   ├── RiskBadge.tsx     # Color-coded risk badges
│   │   │   └── RiskGauge.tsx     # Circular radial risk gauge
│   │   ├── lib/
│   │   │   ├── api.ts            # Axios client with JWT interceptors
│   │   │   └── authContext.tsx   # React authentication context & demo session
│   │   └── types/
│   │       └── index.ts          # Comprehensive TypeScript interfaces
│   ├── tailwind.config.ts        # Custom fintech color palette & styles
│   ├── next.config.mjs
│   └── package.json
│
├── start-all.js                  # Single command runner for backend + frontend
├── package.json                  # Root orchestrator
└── README.md
```

---

## 🛠️ Local Installation & Execution

### Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher
- **MongoDB** *(Optional)*: Runs automatically with MongoDB daemon on `mongodb://127.0.0.1:27017/defi_risk_optimizer` or automatically boots the high-fidelity persistence fallback layer if MongoDB is not locally running.

### 1. Clone the repository
```bash
git clone <repository-url>
cd "Risk scoring dashboard"
```

### 2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root directory
cd ..
```

### 3. Run the complete application
You can run both frontend and backend concurrently using:
```bash
node start-all.js
```
Or start each service independently in separate terminal windows:

#### Terminal 1 (Backend API on Port 5000):
```bash
cd backend
npm run dev
# Backend boots on http://127.0.0.1:5000
# Health check available at http://127.0.0.1:5000/api/health
```

#### Terminal 2 (Next.js Frontend on Port 3000):
```bash
cd frontend
npm run dev
# Frontend boots on http://localhost:3000
```

### 4. Build for Production
```bash
cd frontend
npm run build
npm start
```

---

## 🔑 Demo Account Credentials
For instant review and evaluation without having to register a new account:
- **Email**: `treasury@horizoncapital.fi`
- **Password**: `demo1234`
- Or simply click the **"1-Click Demo Treasury"** button on the Login page or Navbar for instant session activation!

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | API health check & version info |
| `POST` | `/api/auth/register` | Register new institutional account |
| `POST` | `/api/auth/login` | Log in with credentials |
| `POST` | `/api/auth/demo-login` | 1-Click instant demo session |
| `GET` | `/api/auth/me` | Fetch authenticated user profile & preferences |
| `PATCH` | `/api/auth/preferences`| Update treasury risk tolerance & preferred chains |
| `GET` | `/api/protocols` | List protocols (search, chain, category, APY, risk, sort) |
| `GET` | `/api/protocols/:id` | Get protocol details, audits, & historical yields |
| `GET` | `/api/risk/overview` | Ecosystem risk distribution & sector averages |
| `GET` | `/api/risk/:protocolId`| 6-Factor quantitative risk breakdown & score |
| `POST` | `/api/optimizer/optimize`| Run Mean-Variance yield farming portfolio optimizer |
| `POST` | `/api/optimizer/deploy` | Deploy optimized strategy directly into user portfolio |
| `GET` | `/api/portfolio` | Retrieve active positions, PnL, allocation pie, & growth curve |
| `POST` | `/api/portfolio/investments`| Deposit capital / create new position |
| `POST` | `/api/portfolio/withdraw`| Withdraw funds from existing position |
| `GET` | `/api/portfolio/transactions`| Retrieve transaction & settlement history |
| `GET` | `/api/analytics` | APY comparison, TVL trends, & Risk vs Return scatter data |

---

## 🔒 Security & Quality Standards
- Strict separation of calculation logic from raw protocol data.
- Formal smart contract audit reports linked to verifiable sources.
- No hardcoded secrets: environment variables loaded with fallback defaults.
- Clean TypeScript types for full compile-time safety.
- Responsive institutional layout designed for desktop treasury stations and mobile devices.

---

## 📄 License
MIT License. Built for institutional treasury teams, hackathon evaluators, and DeFi developers.
