# Sejuk Sejuk Service Operations Portal

This project implements a connected internal workflow for:

- Module 1: `Admin Portal` order submission
- Module 2: `Technician Portal` assigned jobs and job completion

The app is built as a single React portal with role-based access, shared Supabase backend logic, and a clean split between desktop-first admin workflow and mobile-first technician workflow.

## Submission Scope

This submission intentionally focuses on `Module 1` and `Module 2` to deliver a working admin-to-technician workflow with stronger execution quality rather than spreading effort across partially implemented modules.

Modules outside this scope, including WhatsApp notifications, manager review, KPI dashboard, and AI operations queries, are documented as not implemented in this build.

## Stack

- React with Vite
- Tailwind CSS
- Supabase Database + RPC
- Supabase Storage
- Vercel
- Vitest + React Testing Library

## What Is Implemented

### Module 1: Admin Portal

- Mock sign-in with fixed demo accounts
- Admin-only route at `/admin/orders/new`
- Active technicians loaded from Supabase
- Service order form with:
  - auto-generated order number
  - customer and address details
  - problem description
  - service type
  - quoted price
  - assigned technician
  - admin notes
- Client-side validation and loading states
- Order creation through Supabase RPC `create_service_order(...)`
- Success summary after submission

### Module 2: Technician Portal

- Technician-only route at `/technician/jobs`
- Technicians only see jobs assigned to their own account
- Technician job detail route at `/technician/jobs/:orderId`
- Opening an assigned job moves it to `In Progress`
- Completion form with:
  - work done
  - extra charges
  - final amount auto-calculation
  - remarks
  - read-only technician name
  - timestamp on completion
- Upload up to 6 files using Supabase Storage:
  - image
  - video
  - PDF
- Completion writes through Supabase RPC `complete_service_job(...)`
- Order status updates to `Job Done`
- Completion summary after successful submit

## Demo Accounts

- `admin@sejuk.com` / `admin123`
- `ali@sejuk.com` / `tech123`
- `john@sejuk.com` / `tech123`
- `bala@sejuk.com` / `tech123`
- `yusoff@sejuk.com` / `tech123`
- `manager@sejuk.com` / `manager123`

Manager remains a placeholder in this build because only Modules 1 and 2 are in scope.

## Local Setup

1. Copy `.env.example` to `.env`
2. Fill in:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Run the SQL in `supabase/schema.sql` inside your Supabase SQL Editor
4. Install dependencies:

```bash
npm install
```

5. Start the app:

```bash
npm run dev
```

## Supabase Setup Notes

The SQL schema sets up:

- `technicians`
- `orders`
- `service_completions`
- `service_completion_files`
- `create_service_order(...)`
- `start_service_job(...)`
- `complete_service_job(...)`
- storage bucket `service-media`
- RLS policies and grants required for the demo app

Seeded technicians:

- Ali
- John
- Bala
- Yusoff

Module 2 expects technician account names to match `orders.assigned_technician_name`.

## Workflow Summary

1. Admin signs in and creates a service order.
2. The order is saved in Supabase with status `Assigned`.
3. Assigned technician signs in with their matching demo account.
4. Technician sees the job in their assigned jobs list.
5. Opening the job moves it to `In Progress`.
6. Technician uploads service proof and completes the job.
7. Supabase stores the completion and updates the order to `Job Done`.

## AI Integration

- Status: Not implemented in this submission.
- Supported AI queries: None.
- AI limitations: This build does not include the `Operations Query Window`, structured AI query handling, or AI-generated operational summaries.
- Scope rationale: Development time was prioritized on delivering a stable workflow for order creation, technician assignment, service completion, and proof-of-work uploads.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run test`

## Verification

- Production build passes with `npm run build`
- Test suite passes with `npm run test`

## Assessment Assumptions

- Authentication is mocked with fixed demo users and `localStorage` session persistence.
- Only Module 1 and Module 2 are in scope.
- Technician identity is matched by technician name for assessment simplicity.
- Optional payment capture is not implemented.
- WhatsApp notifications, manager review, dashboard, and AI features are intentionally excluded from this build.
- This submission is intended to demonstrate a complete and testable core service workflow rather than broader but incomplete feature coverage.
