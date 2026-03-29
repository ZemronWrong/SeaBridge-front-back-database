# ⚓ Seabridge Boats Manufacturing — Integrated Information System

A full-stack **Boat Manufacturing Inventory Management System** built with **Django REST Framework** (backend) and **Vite + React** (frontend). Features role-based access control, real-time inventory tracking, production management, payroll processing, DTR (Daily Time Record) clock-in/out, sales & CRM, and executive analytics.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [Demo Accounts](#-demo-accounts)
- [Modules Overview](#-modules-overview)
- [Project Structure](#-project-structure)

---

## ✨ Features

- **Role-Based Access Control (RBAC)** — 5 roles: Owner, Finance, Manager, Foreman, Worker
- **Inventory Management** — Materials, Suppliers, Purchase Orders, Material Requests, Stock Alerts
- **Production & QC** — Projects, Tasks, Quality Checks with progress tracking
- **DTR & Attendance** — Clock In/Out for workers and foremen, exportable CSV reports
- **Payroll & Payslips** — Automated payroll generation with gross/net calculations
- **Sales & CRM** — Client directory, Invoicing, Customer management
- **Analytics & Reports** — Executive dashboard with charts (Recharts), inventory valuation, production efficiency
- **Notifications** — Real-time alerts for low stock, QC results, and invoice updates
- **Premium Login UI** — Dark maritime-themed glassmorphism design with secure authentication

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TypeScript, Recharts, shadcn/ui, Lucide Icons |
| **Backend** | Python 3.10+, Django 4.2, Django REST Framework |
| **Database** | SQLite (development) |
| **Auth** | Token-based authentication (DRF TokenAuth) |

---

## 📦 Prerequisites

Make sure you have the following installed on your machine:

- **[Python 3.10+](https://www.python.org/downloads/)** — for the Django backend
- **[Node.js 18+](https://nodejs.org/)** — for the React frontend
- **Git** — to clone the repository

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ZemronWrong/SeaBridge-front-back-database.git
cd SeaBridge-front-back-database
```

### 2. Backend Setup (Django)

```powershell
# Navigate to the backend directory
cd backend

# Create a Python virtual environment
python -m venv venv

# Activate the virtual environment
.\venv\Scripts\Activate          # Windows (PowerShell)
# source venv/bin/activate       # macOS / Linux

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# Seed the database with demo users and test data
python seed_data.py
```

> **Note:** The `seed_data.py` script will create 10 demo accounts, employees, inventory items, projects, invoices, payroll records, and notifications. See [Demo Accounts](#-demo-accounts) for login credentials.

### 3. Frontend Setup (React)

```powershell
# Navigate back to the project root (where package.json is)
cd ..

# Install Node.js dependencies
npm install
```

---

## 🔥 Running the Application

You need **two terminal windows** — one for the backend and one for the frontend.

### Terminal 1 — Start Backend (Django API)

```powershell
cd backend
.\venv\Scripts\Activate
python manage.py runserver
```

The API will be available at: **http://127.0.0.1:8000/**

### Terminal 2 — Start Frontend (Vite Dev Server)

```powershell
npm run dev
```

The application will be accessible at: **http://localhost:3000/**

---

## 🔑 Demo Accounts

All accounts are created by the `seed_data.py` script. Use these credentials to log in:

| Username | Password | Role | Full Name | Team |
|---|---|---|---|---|
| `carlos.santos` | `carlos123` | **Owner** | Carlos Santos | MGMT |
| `maria.cruz` | `maria123` | **Finance** | Maria Cruz | MGMT |
| `jose.garcia` | `jose123` | **Manager** | Jose Garcia | TEAM-A |
| `pedro.reyes` | `pedro123` | **Manager** | Pedro Reyes | TEAM-B |
| `ramon.delacruz` | `ramon123` | **Foreman** | Ramon Dela Cruz | TEAM-A |
| `juan.reyes` | `juan123` | **Worker** | Juan Reyes | TEAM-A |
| `miguel.torres` | `miguel123` | **Worker** | Miguel Torres | TEAM-A |
| `antonio.ramos` | `antonio123` | **Worker** | Antonio Ramos | TEAM-B |
| `rafael.lim` | `rafael123` | **Worker** | Rafael Lim | TEAM-B |
| `diego.villanueva` | `diego123` | **Worker** | Diego Villanueva | TEAM-A |

### Role Permissions

| Feature | Owner | Finance | Manager | Foreman | Worker |
|---|:---:|:---:|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Inventory | ✅ | ✅ | ✅ | — | — |
| Production & QC | ✅ | — | ✅ | ✅ | ✅ |
| DTR Clock In/Out | — | — | — | ✅ | ✅ |
| DTR View All | ✅ | ✅ | ✅ | — | — |
| Payroll & Payslips | ✅ | ✅ | — | — | ✅ |
| Sales & CRM | ✅ | ✅ | — | — | — |
| Analytics & Reports | ✅ | ✅ | — | — | — |

---

## 📁 Modules Overview

### 🏠 Dashboard
Executive overview with KPI cards (Total Materials, Active Projects, Active Workers, Monthly Payroll), low stock alerts, active project progress bars, recent quality checks, and quick action buttons.

### 📦 Inventory Management
- **Stock List** — View all materials with supplier info, stock levels, and unit prices
- **Suppliers** — Manage supplier records (name, contact, email, address)
- **Purchase Orders** — Create and track POs with expected delivery dates
- **Material Requests** — Workers can request materials; managers approve

### ⚙️ Production & QC
- **Projects** — Track boat-building projects with progress bars and deadlines
- **Tasks** — Assign and monitor tasks per project
- **Quality Checks** — Log inspections with Pass/Fail results and notes

### 🕐 DTR & Attendance
- **Clock In / Clock Out** — Workers and foremen can record attendance
- **DTR Filters** — Filter by Today, This Week, This Month, or specific date
- **Export** — Download DTR records as CSV for Excel/PDF reporting

### 💰 Payroll & Payslips
- **Payroll Records** — Automated calculations (gross, deductions, net pay)
- **Payslips** — Workers can view their own pay history

### 🤝 Sales & CRM
- **Client Directory** — Manage customer records
- **Invoicing** — Create and track invoices tied to projects

### 📊 Analytics & Reports
- **KPI Summary** — Total Procurement, Inventory Value, Overdue Projects, Paid Invoices
- **Charts** — Expenditure trends, Production Efficiency bars, Inventory Valuation pie chart

---

## 📁 Project Structure

```
SeaBridge-front-back-database/
├── backend/                    # Django REST Framework API
│   ├── accounts/               # Custom User model & auth
│   ├── analytics/              # Reports aggregation endpoints
│   ├── dtr/                    # Daily Time Record (clock-in/out)
│   ├── inventory/              # Materials, Suppliers, POs
│   ├── notifications/          # In-app notification system
│   ├── payroll/                # Employee & payroll records
│   ├── production/             # Projects, Tasks, QC
│   ├── reports/                # Executive report endpoints
│   ├── sales/                  # Customers & Invoices
│   ├── seabridge/              # Django project config
│   ├── seed_data.py            # Database seeding script
│   ├── manage.py
│   └── requirements.txt
├── src/                        # React frontend
│   ├── components/             # UI modules (Dashboard, Inventory, etc.)
│   ├── context/                # AuthContext (authentication state)
│   ├── api.ts                  # API fetch helper
│   ├── App.tsx                 # Main app with login & routing
│   └── main.tsx                # Vite entry point
├── public/
│   └── login-bg.png            # Login page background image
├── index.html
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🔄 Re-seeding the Database

If you need to reset all data and accounts:

```powershell
cd backend
.\venv\Scripts\Activate
python seed_data.py
```

This will **wipe all existing data** and recreate everything from scratch.

---

## 📄 License

© 2026 Seabridge Boats Manufacturing. All rights reserved.