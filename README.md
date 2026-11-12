
# Kandyan Cultural Centre (KCC) - Web Platform & POS System

**CSC3213 Project in Computer Science - Group G**

This repository contains the final source code for the Kandyan Cultural Centre (KCC) E-Commerce Platform, Workshop Booking System, and Admin Point-of-Sale (POS).

The application is built using **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

---

## ⚠️ Evaluation Setup Instructions

To ensure a seamless evaluation process, this project has been pre-configured to run independently on a local machine using a **Dedicated Hosted Evaluation Database**. You do not need to install PostgreSQL or run any database setup scripts.

### 1. Environment Variables & API Keys

Due to security best practices, the live `.env.local` file containing the Evaluation Database API keys is not committed to this public GitHub repository.

**Please download the `env-keys.zip` or `.env.local` file provided alongside our project submission in the university LMS portal.**

Place the `.env.local` file directly in the root directory of this project.

*(A `.env.example` file is included in the repository for reference.)*

### 2. Prerequisites

- **Node.js:** Version 18.17 or higher
- **npm:** Version 9.0 or higher

### 3. Installation & Running

**Step 1: Clone the repository and navigate to the project folder.**

```bash
git clone https://github.com/shamilaw-sci/CSC3213_20_Group_G.git
cd kandyan-cultural-center-web
```

**Step 2: Install project dependencies.**

```bash
npm install
```

**Step 3: Start the development server.**

```bash
npm run dev
```

**Step 4: Open the application in your browser.**

Visit [http://localhost:3000](http://localhost:3000).

---

## 🔐 Testing Credentials

To evaluate the POS system, Barcode Generator, Inventory Management, and Admin Dashboard, please log in using the following test credentials:

- **Email:** `admin@kcc-eval.test`
- **Password:** `password123`

You can access the admin login via the `/admin` route or through the footer link.

---

## 💳 Testing Payments & Emails (Evaluation Mode)

This system integrates with **PayHere Sri Lanka** (Payments) and **Resend** (SMTP Emails). Because external API webhooks cannot communicate with a `localhost` environment, we have built a local **Evaluation Mode** to allow you to test the end-to-end logic without API crashes.

Inside the provided `.env.local` file, you will find the following flag:

```env
NEXT_PUBLIC_EVAL_MODE=true
```

### What Happens in Evaluation Mode?

1. **Mock Payment Terminal:**
   - When you add items to the cart or book a workshop and proceed to checkout, the live PayHere redirect is safely intercepted.
   - You will be routed to a local **Dummy Payment Page** (`/dummy-payment`).
   - This page allows you to simulate clicking **"Approve"** or **"Decline"**, which manually triggers the local webhook to update the database state and clear the cart.
   - *(Note: The actual production PayHere integration code is preserved and commented in `app/checkout/page.tsx` for your review.)*

2. **Console Email Mocking:**
   - Instead of requiring a live Resend API key, order confirmation and workshop ticket emails are intercepted.
   - The system outputs a mock email receipt directly into your VS Code terminal window to demonstrate that the email function was triggered successfully.

---

## 📂 Key Directory Structure for Evaluation

| Directory | Description |
|---|---|
| `/src/app` | Next.js App Router pages (Frontend & Admin UI) |
| `/src/app/api` | Backend API routes (Webhooks & external integrations) |
| `/src/components` | Reusable UI components (Cart, POS terminal, Navigation) |
| `/src/lib` | Core utility functions, Supabase client initialization, and Email logic |
| `/src/types` | TypeScript definitions directly generated from the Supabase schema |
