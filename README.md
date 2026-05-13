# ⚡ TaskFlow — Team Task Management App

A full-stack web application for team collaboration and task management. Think Trello/Asana, simplified.

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (JSON Web Tokens) |
| Styling | Custom CSS with CSS Variables |

---

## 📁 Project Structure

```
taskflow/
├── backend/
│   ├── models/
│   │   ├── User.js         # User schema with bcrypt hashing
│   │   ├── Project.js      # Project schema with members & roles
│   │   └── Task.js         # Task schema
│   ├── routes/
│   │   ├── auth.js         # Signup, Login, /me
│   │   ├── projects.js     # CRUD + member management
│   │   ├── tasks.js        # CRUD with role-based control
│   │   └── dashboard.js    # Aggregated stats
│   ├── middleware/
│   │   └── auth.js         # JWT protect + requireAdmin
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── layout/     # Sidebar + Layout
        │   ├── tasks/      # TaskList + TaskModal
        │   ├── dashboard/  # Stats + Charts
        │   └── projects/   # Members management
        ├── pages/
        │   ├── Login.js
        │   ├── Signup.js
        │   ├── Projects.js
        │   └── ProjectDetail.js
        ├── context/
        │   └── AuthContext.js
        ├── utils/
        │   └── api.js      # Axios instance
        └── App.js
```

---

## 🚀 Setup & Run

### Prerequisites
- Node.js v16+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))

### 1. Clone / Extract the project

### 2. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

**`.env` file:**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=change_this_to_a_random_strong_secret
JWT_EXPIRE=7d
```

```bash
# Start backend
npm run dev       # development (nodemon)
npm start         # production
```

Backend runs at: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

> The frontend proxies `/api/*` to `http://localhost:5000` automatically (set in package.json).

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/projects` | All projects for current user |
| POST | `/api/projects` | Create project (becomes admin) |
| GET | `/api/projects/:id` | Get single project |
| PUT | `/api/projects/:id` | Update project (admin) |
| DELETE | `/api/projects/:id` | Delete project (admin) |
| POST | `/api/projects/:id/members` | Add member by email (admin) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (admin) |

### Tasks
| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/tasks?project=id` | Get tasks for a project |
| POST | `/api/tasks` | Create task (admin) |
| PUT | `/api/tasks/:id` | Update task (admin: all fields; member: status only) |
| DELETE | `/api/tasks/:id` | Delete task (admin) |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard?project=id` | Stats: total, by status, overdue, per user |

---

## ✅ Features Implemented

### User Authentication
- [x] Signup with Name, Email, Password
- [x] Password hashed with bcryptjs (salt rounds: 10)
- [x] JWT-based login (7-day expiry)
- [x] Protected routes with middleware

### Project Management
- [x] Create projects (creator auto-assigned as Admin)
- [x] Admin can add members by email
- [x] Admin can remove members
- [x] Members can only view assigned projects

### Task Management
- [x] Create tasks with Title, Description, Due Date, Priority
- [x] Assign tasks to project members
- [x] Update status: To Do → In Progress → Done
- [x] Task filters by status and priority

### Dashboard
- [x] Total tasks count
- [x] Tasks by status (To Do / In Progress / Done)
- [x] Tasks per user with progress bars
- [x] Overdue tasks count

### Role-Based Access
- [x] Admin: Create/Edit/Delete tasks, manage members
- [x] Member: View tasks, update status of assigned tasks only

---

## 🌐 Deployment

### Deploy Backend (Render / Railway)
1. Push to GitHub
2. Connect to [Render.com](https://render.com)
3. Set environment variables (MONGO_URI, JWT_SECRET)
4. Build command: `npm install`
5. Start command: `node server.js`

### Deploy Frontend (Vercel / Netlify)
1. Build: `npm run build`
2. Deploy `build/` folder
3. Set environment variable: `REACT_APP_API_URL=https://your-backend.render.com`
4. Update `api.js` baseURL to use `process.env.REACT_APP_API_URL`

### MongoDB Atlas (Free)
1. Create cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Get connection string
3. Replace `MONGO_URI` in .env

---

## 👤 Author
Built as a full-stack assignment project.
