# EcoSphereai-Backend

> **EcoSphere** — Production-Ready AI Sustainability & Financial Optimization Engine (Backend REST API)

Built with **Node.js**, **Express.js**, **Supabase PostgreSQL**, **JWT Authentication**, **Bcrypt**, and **IPCC Carbon Calculation Models**.

---

## 🌟 Architecture & Features

- 🏗️ **Clean MVC Architecture**: Controllers, middleware, routes, validators, and dedicated calculation services.
- 🔐 **Secure Authentication**: Bcrypt password hashing, JWT token generation & verification, role-based protection, profile management.
- 🧮 **Carbon Engine (`carbonCalculator.js`)**:
  - Transport footprint (car, bike, bus, metro, train, walking avoided emissions).
  - Energy footprint (electricity kWh, AC, appliances, solar renewable offset).
  - Food footprint (vegan, vegetarian, mixed, meat-heavy, local sourcing).
  - Waste footprint (plastic, recycled, compost, paper, e-waste).
  - Composite EcoScore algorithm (0–100 scale).
- 💰 **Financial Optimization Engine**: Evaluates actionable monthly & annual savings in ₹ INR by adopting sustainable alternatives.
- 🤖 **AI Sustainability Advisor**: Personalized reduction tips, weekly eco-challenges, dynamic 3-month carbon forecasting, and interactive AI chat.
- 🏆 **Gamification Engine**: Automatic level progression (1–5), streaks, and badge awards (Eco Pioneer, Transit Hero, Zero-Waste Master, etc.).
- 📊 **Analytics & Reporting**: Daily, weekly, monthly, and yearly summaries with CSV download and printable audit reports.
- 🛡️ **Database & Cloud Storage**: Supabase PostgreSQL with full SQL schema, Row Level Security (RLS) policies, and resilient fallback handling.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```
Fill in your Supabase project credentials and JWT secret:
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_secret_key
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_secret_key

# Optional
GEMINI_API_KEY=
OPENAI_API_KEY=
```

### 3. Database Migration
Run the SQL script located at:
```
src/config/supabase_schema.sql
```
in your [Supabase SQL Editor](https://supabase.com/dashboard).

### 4. Run the Server
```bash
# Start server
npm start

# Or with nodemon for development
npm run dev
```
The API server will listen on `http://localhost:5000` (or `PORT`).

### 5. Run Verification Tests
```bash
node test_suite.js
```

---

## 📡 Key API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Service health status | No |
| `POST` | `/api/auth/register` | User registration | No |
| `POST` | `/api/auth/login` | User login (returns JWT) | No |
| `GET` | `/api/auth/me` | Fetch authenticated profile | Yes |
| `GET` | `/api/activities` | List commute activities | Yes |
| `POST` | `/api/activities` | Log commute activity | Yes |
| `GET` | `/api/energy` | List home energy logs | Yes |
| `POST` | `/api/energy` | Log energy consumption | Yes |
| `GET` | `/api/food` | List food logs | Yes |
| `POST` | `/api/food` | Log food consumption | Yes |
| `GET` | `/api/waste` | List waste logs | Yes |
| `POST` | `/api/waste` | Log waste management | Yes |
| `GET` | `/api/goals` | List targets & progress | Yes |
| `POST` | `/api/goals` | Create a target goal | Yes |
| `GET` | `/api/ai/tips` | AI personalized tips | Yes |
| `POST` | `/api/ai/chat` | AI sustainability assistant | Yes |
| `GET` | `/api/gamification` | Levels, badges, streaks | Yes |
| `GET` | `/api/reports/summary`| Carbon audit reports | Yes |
| `GET` | `/api/reports/export` | Export CSV report | Yes |

---

## 🌐 Deploy to Render / Railway / Heroku

- **Build Command**: `npm install`
- **Start Command**: `node src/server.js` (or `npm start`)
- **Environment Variables**: Add all values defined in `.env.example`.
