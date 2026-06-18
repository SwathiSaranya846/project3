# BuildFlow DB — Database Integration

> **DecodeLabs Full Stack Internship · Project 3 · Batch 2026**

Project 3 replaces the in-memory data store from Project 2 with a real **MongoDB** database using **Mongoose** as the ORM. Data now persists permanently — no more losing everything on server restart.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env and add your MongoDB connection string

# 3. Start the server
npm start

# 4. For development (auto-restart)
npm run dev
```

Server runs at → **http://localhost:3000**

---

## ⚙️ MongoDB Setup (2 options)

### Option A — MongoDB Atlas (Free Cloud, Recommended)
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) → Create free account
2. Create a free cluster
3. Click **Connect** → **Drivers** → Copy the connection string
4. Paste it in your `.env` as `MONGO_URI`

### Option B — Local MongoDB
```bash
# Install MongoDB locally, then use:
MONGO_URI=mongodb://localhost:27017/buildflow
```

---

## 📁 Project Structure

```
project3-db/
├── server.js              # Entry point
├── package.json
├── .env.example           # Copy to .env and fill in your values
├── .gitignore
├── README.md
├── config/
│   └── db.js              # MongoDB connection (Pillar 2: The Bridge)
├── models/
│   ├── User.js            # User schema with constraints (Pillar 1: Blueprint)
│   └── Task.js            # Task schema with FK relationship
├── middleware/
│   └── validate.js        # Input validation (The Gatekeeper)
└── routes/
    ├── users.js           # User CRUD endpoints
    └── tasks.js           # Task CRUD endpoints
```

---

## 🗂️ Database Schema

### Users Collection
| Field | Type | Constraints |
|-------|------|-------------|
| `name` | String | NOT NULL, 2–50 chars |
| `email` | String | NOT NULL, UNIQUE, valid format |
| `role` | String | CHECK: `admin` or `member` |
| `isActive` | Boolean | default: true |
| `createdAt` | Date | auto-generated |
| `updatedAt` | Date | auto-generated |

### Tasks Collection
| Field | Type | Constraints |
|-------|------|-------------|
| `title` | String | NOT NULL, 3–100 chars |
| `description` | String | max 500 chars |
| `status` | String | CHECK: `todo`, `in-progress`, `done` |
| `priority` | String | CHECK: `low`, `medium`, `high` |
| `assignedTo` | ObjectId | **Foreign Key** → Users collection |
| `dueDate` | Date | must be future date |
| `createdAt` | Date | auto-generated |

### Relationship: 1:Many
```
User (1) ──────────── (Many) Tasks
         assignedTo FK
```

---

## 🔌 API Endpoints

### Users — `/api/users`
| Method | Endpoint | DB Operation |
|--------|----------|-------------|
| GET | `/api/users` | `User.find()` — SELECT |
| GET | `/api/users?role=admin` | `User.find({role})` — SELECT WHERE |
| GET | `/api/users/:id` | `User.findById()` — SELECT WHERE id |
| GET | `/api/users/:id/tasks` | `Task.find({assignedTo})` + populate — JOIN |
| POST | `/api/users` | `User.create()` — INSERT |
| PUT | `/api/users/:id` | `User.findByIdAndUpdate()` — UPDATE |
| DELETE | `/api/users/:id` | `User.findByIdAndDelete()` — DELETE |

### Tasks — `/api/tasks`
| Method | Endpoint | DB Operation |
|--------|----------|-------------|
| GET | `/api/tasks` | `Task.find()` + populate |
| GET | `/api/tasks?status=todo` | `Task.find({status})` |
| GET | `/api/tasks/:id` | `Task.findById()` + populate |
| POST | `/api/tasks` | `Task.create()` — INSERT |
| PUT | `/api/tasks/:id` | `Task.findByIdAndUpdate()` — UPDATE |
| DELETE | `/api/tasks/:id` | `Task.findByIdAndDelete()` — DELETE |

---

## 🧪 Test the API

```bash
# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Priya Sharma","email":"priya@buildflow.app","role":"admin"}'

# Get all users
curl http://localhost:3000/api/users

# Create a task (use the _id from the user above as assignedTo)
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Build database schema","priority":"high","assignedTo":"<user_id_here>"}'

# Get all tasks with user details (JOIN)
curl http://localhost:3000/api/tasks

# Update task status
curl -X PUT http://localhost:3000/api/tasks/<task_id> \
  -H "Content-Type: application/json" \
  -d '{"status":"done"}'

# Delete a task
curl -X DELETE http://localhost:3000/api/tasks/<task_id>
```

---

## 🛡️ Security — Parameterized Queries

All Mongoose queries are **parameterized by default** — SQL/NoSQL injection is not possible:

```javascript
// ❌ VULNERABLE (raw string concatenation)
db.query("SELECT * FROM users WHERE email = '" + userInput + "'");

// ✅ SAFE (Mongoose — always parameterized)
User.findOne({ email: userInput }); // input treated as data, never as code
```

---

## 🔑 Key Concepts Demonstrated

| Concept | Implementation |
|---------|---------------|
| **Schema Design** | Mongoose schemas with type, required, unique, enum, match |
| **NOT NULL** | `required: true` on name, email, title |
| **UNIQUE** | `unique: true` on email — prevents duplicate accounts |
| **CHECK** | `enum` for role, status, priority — only valid values allowed |
| **Foreign Key** | `assignedTo: { type: ObjectId, ref: 'User' }` |
| **1:Many Relationship** | One User → Many Tasks via assignedTo FK |
| **JOIN (populate)** | `.populate('assignedTo')` fetches full user object |
| **CRUD** | Create/Read/Update/Delete all implemented with proper HTTP codes |
| **Parameterized Queries** | Mongoose sanitizes all inputs — injection-safe |
| **Indexes** | Added on email, status, priority, assignedTo for fast queries |
| **Referential Integrity** | Deleting a user also deletes their tasks |

---

## 📈 Project Progression

```
Project 1 → Frontend (HTML/CSS/JS)
Project 2 → Backend API (Express, in-memory store)
Project 3 → Database (MongoDB + Mongoose) ← YOU ARE HERE
Project 4 → Authentication (JWT)
```

---



## 🏢 About DecodeLabs

Part of the **DecodeLabs Full Stack Development Internship**, Batch 2026.
[www.decodelabs.tech](https://www.decodelabs.tech)

---
