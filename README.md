# Todo 🚀

Todo is a modern, responsive, and secure full-stack Todo application. It utilizes a **Next.js** frontend dashboard coupled with a **Strapi 5** headless CMS backend using a SQLite database. 

The application is built to ensure strict user privacy, featuring custom backend controller routing that limits data access so users can only view, create, edit, or delete their own tasks.

---

## 📂 Project Structure

```text
todo/
├── backend/          # Strapi 5 CMS & Database
│   ├── src/
│   │   ├── api/todo/ # Task/Todo API, controllers, and schemas
│   │   └── index.js  # Auto-bootstrap script for user permissions
│   └── database/     # SQLite local database
│
└── frontend/         # Next.js 16 Client Dashboard
    ├── src/
    │   ├── app/      # Page layout, signin, signup, & dashboard
    │   ├── context/  # AuthContext hook for cookie-based JWT authentication
    │   └── middleware.js
```

---

## 🛠️ Technology Stack

### Backend
- **Framework:** [Strapi v5](https://strapi.io/) (Headless Node.js CMS)
- **Database:** [SQLite](https://www.sqlite.org/) (via `better-sqlite3`)
- **Key Logic:**
  - [Bootstrap Authorization](file:///e:/intern/backend/src/index.js): Automatically grants the required permissions for authenticated and public users on startup.
  - [Scoped Todo Controller](file:///e:/intern/backend/src/api/todo/controllers/todo.js): Intercepts core controller actions (`find`, `findOne`, `create`, `update`, `delete`) to enforce ownership checks, preventing cross-user data exposure.

### Frontend
- **Framework:** [Next.js v16](https://nextjs.org/) (React 19 & App Router)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Authentication:** Token-based authentication using HTTP/Fetch calls and cookies (`js-cookie`) to store JWTs securely.
- **Styling:** Premium Vanilla CSS featuring smooth animations, active progress meters, CSS variables for theme scoping, and a fully responsive grid.

---

## ⚙️ Setup & Installation

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (version `20.x` to `24.x`) and `npm` installed.

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create your environment variable file by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The Strapi server will be available at [http://localhost:1337](http://localhost:1337).*

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The client web application will be available at [http://localhost:3000](http://localhost:3000).*

---

## 🔒 Security & Data Scoping

By default, standard headless CMS APIs allow public or authenticated users to fetch all database records. Todo implements strict row-level security:

- **Automatic Role configuration**: On startup, [backend/src/index.js](file:///e:/intern/backend/src/index.js) hooks into the bootstrap cycle to assign the necessary REST endpoints (e.g., `todo.find`, `todo.create`, `user.me`) to authenticated users, and register endpoints to public users.
- **Enforced ownership scoping**: The [Todo Controller](file:///e:/intern/backend/src/api/todo/controllers/todo.js) overrides default Strapi operations:
  - **Read:** Filters queries automatically to only return records belonging to the authenticated user ID (`ctx.state.user.id`).
  - **Create:** Implicitly binds the task's `user` relation to the authenticated user ID.
  - **Update/Delete:** Validates that the record exists and belongs to the authenticated user before executing the operation.
