# Kandyan Culture Connect (Group G) — Setup & Git Workflow Guide

---

## 1. Cloning the Repository

First, clone the repository to your local machine:

```bash
git clone https://github.com/your-org/kcc-digital-suite.git
cd kcc-digital-suite
```

---

## 2. Setting Up Your Local Branch

Switch to the `dev` branch and pull the latest changes:

```bash
git checkout dev
git pull origin dev
```

⚠️ **CRITICAL:**  
All feature and bugfix branches must be created from the `dev` branch.  
Never branch from or push directly to `main`.

---

## 3. Install Project Dependencies & Setup

### 3.1 Install Dependencies

Because this is a unified Next.js (App Router) project, install all frontend and backend dependencies at the root:

```bash
npm install
```

---

### 3.2 Environment Setup (Supabase)

You need the Supabase database keys to run the project locally.

Copy the example environment file and rename it:

```bash
cp .env.example .env.local
```

> Ask the Team Lead for:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Paste them into `.env.local`.

---

### 3.3 Start the Development Server

```bash
npm run dev
```

Open in your browser:  
http://localhost:3000

---

## 4. Creating Branches

### 4.1 Feature Branch

Before writing new code, create a feature branch from `dev`.

**Format:**
```bash
feature/{member-name}/{feature-name}
```

**Example:**
```bash
git checkout -b feature/isuru/ecommerce-cart-logic
```

---

### 4.2 Bugfix Branch

For fixing bugs or broken features.

**Format:**
```bash
bugfix/{member-name}/{bug-name}
```

**Example:**
```bash
git checkout -b bugfix/pathum/qr-scanner-timeout
```

---

## 5. Supabase Database Setup

To update TypeScript types based on the latest schema:

```bash
npx supabase gen types typescript --project-id "your-project-id" > src/types/supabase.ts
```

---

## 6. Committing and Pushing Changes

### 6.1 Commit Message Format

All commits must follow the **Group G format**:

| Type         | Format              | Example                                      |
|--------------|--------------------|----------------------------------------------|
| New Feature  | `New: description` | `New: implemented POS kiosk UI`              |
| Bug Fix      | `Fix: description` | `Fix: corrected database lock error`         |

---

### 6.2 Feature Commit Examples

```bash
git commit -m "New: added global e-commerce catalog grid"
git commit -m "New: created PayHere payment gateway integration"
git commit -m "New: implemented Admin RBAC routing"
```

---

### 6.3 Bug Fix Examples

```bash
git commit -m "Fix: resolved DHL shipping API timeout issue"
git commit -m "Fix: fixed double-booking conflict logic"
git commit -m "Fix: corrected mobile camera permission error"
```

---

### 6.4 Push Your Branch

```bash
git push origin branch-name
```

**Example:**
```bash
git push origin feature/isuru/ecommerce-cart-logic
```

---

## 7. Creating a Pull Request (PR)

1. Go to the repository on GitHub  
2. Click **"Compare & pull request"**  
3. Ensure:
   - Base branch = `dev` (**NOT main**)  
4. Fill out the PR template  
5. Link the relevant WBS task/issue  
6. Request review from at least one team member  
7. After approval → merge into `dev`

---

## 8. Branch Structure Example

```plaintext
main (Production / Vercel Deployments ONLY)
└── dev (Main integration branch)
    ├── feature/isuru-s/ecommerce-cart-logic
    ├── feature/isuru-d/workshop-booking-engine
    ├── feature/pathum/pos-hardware-scanner
    ├── feature/kushan/admin-dashboard-ui
    ├── bugfix/isuru-s/cart-state-clearing
    └── bugfix/pathum/thermal-printer-alignment
```

---