# 💼 FinanceOS — Finance Data Processing & Access Control System

> **Stack:** React (Vite) · Node.js · Express · SQLite (via sql.js) · Tailwind CSS

---

## 📁 Project Structure

```
finance-system/
├── backend/
│   ├── server.js       ← Express API server (port 5000)
│   ├── db.js           ← SQLite database module (sql.js)
│   ├── seed.js         ← Pre-fills the DB with 15 sample rows
│   ├── finance.db      ← Auto-created SQLite file (after first run)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.jsx                        ← Root component + state
    │   ├── api.js                         ← All backend fetch calls
    │   ├── index.css                      ← Global styles + CSS vars
    │   └── components/
    │       ├── RoleSwitcher.jsx           ← Admin / Analyst / Viewer toggle
    │       ├── StatsCard.jsx              ← KPI cards (income/expense/balance)
    │       ├── AddTransactionForm.jsx     ← Admin-only add form
    │       ├── TransactionsTable.jsx      ← Data table with delete
    │       └── AccessBanner.jsx          ← "Access Denied" notice
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## 🚀 Run Guide (Step by Step)

### Step 1 — Install Backend Dependencies

```bash
cd finance-system/backend
npm install
```

This installs: `express`, `cors`, `sql.js` (pure JavaScript SQLite — no native build tools needed), and `nodemon`.

---

### Step 2 — Seed the Database

```bash
node seed.js
```

**What this does:** Creates `finance.db` and inserts 15 realistic sample transactions (salaries, rent, freelance fees, etc.). You only need to run this **once**.

Expected output:
```
Created new database: .../finance.db
Seeding database...
Cleared existing data.
Seeded 15 transactions successfully!
```

---

### Step 3 — Start the Backend Server

```bash
npm run dev
# or, without nodemon:
node server.js
```

The API starts at **http://localhost:5000**

Test it in your browser: http://localhost:5000/api/health

---

### Step 4 — Install Frontend Dependencies

Open a **new terminal tab**, then:

```bash
cd finance-system/frontend
npm install
```

---

### Step 5 — Start the Frontend

```bash
npm run dev
```

The React app starts at **http://localhost:5173**

Open that URL in your browser — you should see the full dashboard! ✅

---

## 🌐 CORS Configuration (How Frontend Talks to Backend)

**File:** `backend/server.js`

```js
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST", "DELETE"],
}));
```

**Why this matters:** Browsers enforce a security policy called CORS (Cross-Origin Resource Sharing) that blocks JavaScript on one domain from calling APIs on a different one. Since the frontend runs on port `5173` and the backend on `5000`, they are treated as "different origins." The `cors()` middleware sends the right HTTP headers to tell the browser "this request is allowed."

---

## 🔐 Access Control Matrix

| Feature                | Admin | Analyst | Viewer |
|------------------------|:-----:|:-------:|:------:|
| View Stats (KPI cards) | ✅    | ✅      | ❌     |
| View Transactions Table| ✅    | ❌      | ✅     |
| Add Transaction        | ✅    | ❌      | ❌     |
| Delete Transaction     | ✅    | ❌      | ❌     |

---

## 📡 API Endpoints

| Method   | Endpoint                   | Description                        |
|----------|----------------------------|------------------------------------|
| `GET`    | `/api/health`              | Server health check                |
| `GET`    | `/api/transactions`        | Fetch all transactions             |
| `GET`    | `/api/stats`               | Aggregated income/expense/balance  |
| `POST`   | `/api/transactions`        | Add a new transaction              |
| `DELETE` | `/api/transactions/:id`    | Delete a transaction by ID         |

---

## 🛠️ Troubleshooting

**"Failed to fetch" error in the browser?**
→ Make sure the backend is running (`node server.js` in `/backend`)

**Port already in use?**
→ Kill the process: `lsof -ti:5000 | xargs kill` (Mac/Linux)

**Want to reset all data?**
→ Delete `finance.db`, then run `node seed.js` again

---

## 🎤 Interview Talking Points

See the bottom of this README for 3 technical points to use in your HR interview.

### 1. REST API + Separation of Concerns
> "I designed the backend as a REST API with clearly separated concerns — the database layer (`db.js`), the business logic/validation (`server.js`), and the data seeding (`seed.js`) are all independent files. This makes the code easier to test, debug, and extend."

### 2. CORS & Cross-Origin Communication
> "The frontend and backend run on different ports, so the browser's same-origin policy would normally block requests between them. I configured the `cors` middleware on Express to explicitly whitelist the frontend's origin, which sends the right HTTP headers to authorise cross-origin calls."

### 3. Optimistic UI Updates
> "Instead of refetching all data from the backend after every add or delete, I update the React state immediately on the client side — a pattern called 'optimistic updates'. This makes the UI feel instant, and if the API call fails, I can revert. It's the same technique used by apps like Gmail and Notion."
