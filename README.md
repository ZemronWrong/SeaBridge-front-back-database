# Seabridge Boats Manufacturing Dashboard

A full-stack project utilizing a **Django REST Framework (DRF)** backend and a **Vite + React** frontend to manage boat manufacturing operations including Inventory, Production, DTR (Attendance), and Payroll.

## 🚀 First-Time Setup (Cloning)

Follow these steps to set up the environment on your local machine.

### 1. Prerequisites
Ensure you have the following installed:
- [Python 3.10+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)

### 2. Backend Setup (Django)
1. Open a terminal and navigate to the `backend` directory:
   ```powershell
   cd backend
   ```
2. Create and activate a virtual environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate  # Windows
   # source venv/bin/activate  # macOS/Linux
   ```
3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```
4. Run database migrations:
   ```powershell
   python manage.py migrate
   ```
5. Seed the database with demo data:
   ```powershell
   python manage.py seed_data
   ```

### 3. Frontend Setup (React)
1. Navigate back to the root directory (where `package.json` is located):
   ```powershell
   cd ..
   ```
2. Install dependencies:
   ```powershell
   npm install
   ```

---

## 🔥 Starting the Project

To run the application, you need the Django API and the Vite dev server. The frontend calls `/api` in development; Vite proxies those requests to `http://127.0.0.1:8000`.

### Environment (optional)

Copy `.env.example` to `.env` (or `.env.local`). The default `VITE_API_URL=/api` matches the Vite proxy. For a build served without the proxy, set `VITE_API_URL` to your full backend URL (for example `http://127.0.0.1:8000/api`).

### Option A — One command (recommended)

From the repository root (with Python available and backend dependencies installed):

```powershell
npm run dev:full
```

This runs `python backend/manage.py runserver` and `vite` together via `concurrently`.

### Option B — Two terminals

**1. Backend (Django)**

```powershell
cd backend
.\venv\Scripts\Activate
python manage.py runserver
```

The API is at `http://127.0.0.1:8000/` (for example `http://127.0.0.1:8000/api/auth/login/`).

**2. Frontend (Vite)**

```powershell
npm run dev
```

The app is at `http://localhost:3000/` (see `vite.config.ts`).

---

## 🔑 Demo Credentials

Use the following accounts to test role-based access control (RBAC):

| Role | Username | Password |
| :--- | :--- | :--- |
| **Owner** | `owner` | `owner123` |
| **Finance** | `finance` | `finance123` |
| **Manager** | `manager` | `manager123` |
| **Foreman** | `foreman` | `foreman123` |
| **Worker** | `worker` | `worker123` |

---

## ✅ System Verification

If you have already set up the project and want to verify it's working:
- Check the **Dashboard** for real-time progress.
- Try **Clocking In/Out** in the DTR module.
- Add a **Material** in Inventory or **Update Stock** levels (add/remove).
- Create a **Payroll Record** or view **Payslips** (as a worker).