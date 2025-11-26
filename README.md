# 📈 Investment Analysis SaaS  
A professional full-stack SaaS for portfolio configuration, asset allocation tracking, and investment analysis.  
Built with Next.js 14 (App Router), Shadcn/UI, TailwindCSS, Prisma, and Postgres.  
Visual design inspired by XP Investimentos for a corporate, clean, and modern experience.

---

## 🚀 Features

### 🔐 Authentication
- Login, Register, Forgot Password  
- NextAuth (Credentials Provider)  
- Password hashing with bcrypt  
- Protected routes with middleware  

### 🧩 Initial Setup (Sections Configuration)
- User defines up to **4 investment sections**  
- Each section has a **target percentage (0–100)**  
- Real-time total percentage calculator  
- Prevents saving if total exceeds 100%  
- Mandatory onboarding flow for first-time users  

### 📊 Dashboard
- Corporate-style dashboard  
- Displays sections with:
  - Target %
  - Real % (random placeholder for now)  
- Pie Chart comparing section target vs real allocation  
- Asset list grouped per section  
- Clean XP-like UI  

### 🏷️ Assets & Allocation Logic
Each asset belongs to a section and has:
- Name  
- Ticker  
- Type (Stocks, FIIs, ETFs, Bonds, etc.)  
- Description (optional)  
- Current Value  
- Target % inside the section  

Allocation rules:
- Assets are grouped by `(section, type)`  
- Type allocation can exceed 100%  
- Show warning when above 100%  
- **Saving is NOT blocked** (flexible allocation)

### ⚙️ Settings Page
- Edit section names and percentages  
- Manage (add/edit/delete) assets  
- Allocation progress bars per type  
- XP-style interface  

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** (App Router)  
- **Shadcn/UI**  
- **TailwindCSS**  
- **Lucide Icons**  

### Backend
- **Next.js Server Actions**  
- **NextAuth** (Credentials Provider)  
- **Prisma ORM**  
- **Postgres** (Neon, Supabase, Railway, or local Postgres)

### Charts
- **Recharts** or **Tremor**  

---

## 🧱 Database Schema (Prisma ER Model)

### User
- id  
- name  
- email  
- passwordHash  
- createdAt  

### Inv
app/
login/
register/
forgot-password/
setup/
dashboard/
settings/
api/
components/
lib/
prisma/
styles/

Backend logic uses:
- Server Actions for CRUD
- Prisma as database layer
- NextAuth for authentication
- Postgres as relational database

---

## 🔄 User Flow

### First-time user:
1. Register → Login  
2. Redirected to `/setup`  
3. Configure 1–4 sections  
4. Redirected to `/dashboard`

### Returning user:
- Login → Dashboard  
- Access settings from avatar menu  

---

## 🧪 Validation Rules

### Sections
- Maximum 4  
- Total target % must be ≤ 100%  
- If >100%, saving is blocked  

### Assets
- Percent between 0–100  
- Grouped by `(section, type)`  
- If group exceeds 100%:
  - Show warning  
  - Do **not** block saving  

---

## 📊 Charts (Pie Chart)
- Compare section **target %** vs **real %**  
- Real % generated artificially for now  
- Recharts or Tremor component  

---

## 🎨 UI & Design
- XP-Investimentos style  
- Navy blue + graphite + white  
- High contrast  
- Clear hierarchy  
- Professional typography  
- Mobile responsive  

---

## 🏗️ Getting Started

### 1. Install dependencies
```bash
npm install

codex resume 019aafd6-7445-7023-97aa-fc9ee5df8d6b