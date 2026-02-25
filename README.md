# MERN Stack Machine Test — Assessment

A full-stack MERN application featuring **Admin Login**, **Agent Management**, and **CSV/XLSX Upload & Distribution**.

---

## 🚀 Features

- **Admin Login** — JWT authentication with secure bcrypt password hashing
- **Agent Management** — Add, edit, and delete agents with name, email, mobile (country code), and password
- **CSV/XLSX Upload** — Upload files containing `FirstName`, `Phone`, `Notes` columns; distributed equally across all agents
- **Distribution Logic** — Remainder rows assigned sequentially (e.g. 27 rows ÷ 5 agents = 5, 5, 5, 6, 6)
- **History View** — See all previous distributions grouped by agent with expandable accordions

---

## 📋 Prerequisites

| Tool       | Version  |
|------------|----------|
| Node.js    | ≥ 18.x   |
| MongoDB    | ≥ 6.x (local) or Atlas URI |
| npm        | ≥ 9.x    |

---

## ⚙️ Setup & Run

### 1. Clone / Navigate to Project
```bash
cd Assessment
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create your environment file (already included as `.env`):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/mern_assessment
JWT_SECRET=mern_assessment_jwt_super_secret_2024
JWT_EXPIRE=7d
```

Seed the admin user:
```bash
npm run seed
```

Start the backend server:
```bash
npm run dev
```
> Backend runs on **http://localhost:5000**

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
> Frontend runs on **http://localhost:5173**

---

## 🔑 Default Admin Credentials

| Field    | Value                 |
|----------|-----------------------|
| Email    | `admin@example.com`   |
| Password | `Admin@123`           |

---

## 📁 Project Structure

```
Assessment/
├── backend/
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── middleware/
│   │   └── auth.js             # JWT protect middleware
│   ├── models/
│   │   ├── User.js             # Admin user model
│   │   ├── Agent.js            # Agent model
│   │   └── TaskList.js         # Distributed task list model
│   ├── routes/
│   │   ├── auth.js             # POST /api/auth/login
│   │   ├── agents.js           # CRUD /api/agents
│   │   ├── upload.js           # POST /api/upload
│   │   └── lists.js            # GET /api/lists
│   ├── scripts/
│   │   └── seedAdmin.js        # Seed admin user
│   ├── server.js               # Express entry point
│   └── .env                    # Environment variables
│
├── frontend/
│   └── src/
│       ├── context/
│       │   └── AuthContext.jsx # JWT state management
│       ├── pages/
│       │   ├── LoginPage.jsx   # Login form
│       │   ├── Dashboard.jsx   # Sidebar layout
│       │   ├── AgentsPage.jsx  # Agent CRUD
│       │   └── UploadPage.jsx  # CSV upload & results
│       ├── utils/
│       │   └── api.js          # Axios instance with interceptors
│       ├── App.jsx             # Routes & auth guards
│       └── index.css           # Global styles
│
├── sample_data.csv             # Test CSV with 30 rows
└── README.md
```

---

## 📝 API Endpoints

| Method | Endpoint             | Auth | Description                          |
|--------|----------------------|------|--------------------------------------|
| POST   | `/api/auth/login`    | No   | Login, returns JWT                   |
| GET    | `/api/agents`        | ✅   | List all agents                      |
| POST   | `/api/agents`        | ✅   | Create agent                         |
| PUT    | `/api/agents/:id`    | ✅   | Update agent                         |
| DELETE | `/api/agents/:id`    | ✅   | Delete agent                         |
| POST   | `/api/upload`        | ✅   | Upload CSV/XLSX and distribute       |
| GET    | `/api/lists`         | ✅   | Get all distributed lists            |

---

## 🧪 Testing with Sample Data

A sample CSV is provided at `sample_data.csv` (30 rows). Upload it on the **Upload Lists** page to see equal distribution across your agents.

**Expected result with 5 agents and 30 rows:**  
Each agent receives **6 items**.

**Expected result with 5 agents and 27 rows:**  
2 agents receive 6 items; 3 agents receive 5 items.

---

## 🛠️ Tech Stack

| Layer    | Technology                          |
|----------|-------------------------------------|
| Database | MongoDB + Mongoose                  |
| Backend  | Node.js, Express.js                 |
| Auth     | JWT (jsonwebtoken) + bcryptjs       |
| Upload   | Multer + xlsx                       |
| Frontend | React (Vite), React Router v6       |
| HTTP     | Axios                               |
| UI       | Custom CSS (dark theme)             |
| Alerts   | React Toastify                      |
