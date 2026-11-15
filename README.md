# Kandyan Cultural Centre (KCC) - Web Platform & POS System
**CSC3213 Project in Computer Science - Group G**

This repository contains the final source code for the Kandyan Cultural Centre (KCC) E-Commerce Platform, Workshop Booking System, and Admin Point-of-Sale (POS). 

The application is built using **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

---

## ☁️ Database Evaluation Strategy

As per the evaluation recommendations, this project utilizes a **Hosted Database Service (Supabase)** pre-populated with all necessary schemas, storage buckets, RLS policies, and dummy data. 

**You do not need to set up a local database.** The project will connect directly to our hosted Evaluation Database using the API keys provided in the environment file.

---

## ⚙️ Setup & Installation Instructions

### 1. Prerequisites
- **Node.js**: Version 18.17 or higher
- **npm**: Version 9.0 or higher
- **Git**: To clone the repository

### 2. Environment Variables & API Keys
Due to security best practices, the live `.env.local` file containing the Evaluation Database API keys is not committed to this public GitHub repository. 

**Please download the `.env.local` file (or `env-keys.zip`) provided alongside our project submission in the university LMS portal.**

Place the `.env.local` file directly in the root directory of this project. 
*(A `.env.example` file is included in the repository for reference).*

### 3. Running the Project
Open your terminal and run the following commands:

```bash
# 1. Clone the repository
git clone https://github.com/shamilaw-sci/CSC3213_20_Group_G.git
cd kandyan-cultural-center-web

# 2. Install dependencies (matches current package.json)
npm install

# 3. Start the development server
npm run dev
```

Open your browser and navigate to: [http://localhost:3000](http://localhost:3000)

---

## 💳 Testing Payments & Emails (Evaluation Mode)

This system integrates with **PayHere Sri Lanka** (Payments) and **Resend** (SMTP Emails). Because live external API webhooks cannot communicate with a `localhost` environment, we have built a local **Evaluation Mode** to allow you to test the end-to-end logic without API crashes.

Inside the provided `.env.local` file, you will find the following flag:
`NEXT_PUBLIC_EVAL_MODE=true`

### What happens in Evaluation Mode?
1. **Mock Payment Terminal:** When you add items to the cart or book a workshop and proceed to checkout, the live PayHere redirect is safely intercepted. You will be routed to a local **Dummy Payment Page** (`/dummy-payment`). This page allows you to simulate clicking "Approve" or "Decline", which manually triggers the local webhook to update the database state, clear the cart, and securely allocate stock/seats. 
2. **Console Email Mocking:** Instead of requiring a live Resend API key, order confirmation and workshop ticket emails are intercepted. The system will output a mock email receipt directly into your terminal window to prove the email function fired successfully.

---

## 🔐 Testing Credentials

To evaluate the system, please log in using the following test credentials (accessible via the `/admin` route):

**1. Master Admin (Full Dashboard & Settings Access):**
- **Email:** `admin@kcc-eval.test`
- **Password:** `password123`

**2. POS Cashier (Restricted to Terminal & Order Processing):**
- **Email:** `cashier@kcc-eval.test`
- **Password:** `password123`

---

## 📂 Key Directory Structure

- `/src/app`: Next.js App Router pages (Frontend, Admin UI, POS terminal)
- `/src/app/api`: Backend API routes (Webhooks, shipping calculations, data fetching)
- `/src/components`: Reusable UI components (Cart Drawer, Navigation, Modals)
- `/src/context`: React Context providers for global Cart and POS states
- `/src/lib`: Core utility functions and Supabase client initialization
- `/src/types`: TypeScript definitions directly generated from the Supabase schema