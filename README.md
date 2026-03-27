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

To run the application, you need to start both the backend and the frontend servers concurrently.

### 1. Start Backend (Django)
```powershell
cd backend
.\venv\Scripts\Activate
python manage.py runserver
```
The API will be available at `http://127.0.0.1:8000/`.

### 2. Start Frontend (Vite)
Open a **new** terminal window:
```powershell
npm run dev
```
The Dashboard will be accessible at `http://localhost:5173/`.

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