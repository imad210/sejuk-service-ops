**Module 1 Walkthrough**

Module 1 is the `Admin Portal`. Its job is very narrow and intentional: create a service order, assign a technician, save it through Supabase, and confirm the result.

**Module 1 Entry Path**
[src/pages/HomePage.tsx](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\pages\HomePage.tsx)
- When an Admin signs in, this page becomes the Module 1 launcher.
- It shows the `Create Service Order` CTA.
- This matters because the app uses one shared login, then branches by role.

[src/pages/AdminOrderPage.tsx](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\pages\AdminOrderPage.tsx)
- This is the route-level guard and shell for Module 1.
- If the user is not signed in as `Admin`, it redirects to `/`.
- If the user is Admin, it renders:
  - [AppShell](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\components\AppShell.tsx)
  - [AuthActionBar](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\components\AuthActionBar.tsx)
  - [OrderForm](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\components\OrderForm.tsx)

This file exists so route protection stays outside the form itself.

**Module 1 Main Business Component**
[src/components/OrderForm.tsx](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\components\OrderForm.tsx)
- This is the heart of Module 1.
- It owns:
  - all order form values
  - all field errors
  - technician loading/error state
  - order submit state
  - success summary state
- Main state:
  - `values`
  - `errors`
  - `technicians`
  - `isLoadingTechnicians`
  - `technicianError`
  - `submitError`
  - `isSubmitting`
  - `createdOrder`

Important functions inside it:

- `loadTechnicians()`
  - Calls `fetchActiveTechnicians()` from [src/lib/api.ts](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\lib\api.ts)
  - Pulls active technicians from Supabase
  - Drives the assignment dropdown
  - Exists because the admin should assign from structured system data, not type technician names manually

- `updateField(field, value)`
  - Updates one form field
  - Clears that field’s existing validation error
  - Exists to keep state updates predictable and localized

- `handleSubmit(event)`
  - Prevents default browser submit
  - Runs `validateOrderForm(...)` from [src/lib/validation.ts](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\lib\validation.ts)
  - Stops if form invalid
  - Calls `createServiceOrder(values)`
  - On success, stores the RPC response in `createdOrder`
  - On failure, shows a top-level error banner

- `handleCreateAnother()`
  - Resets the form to a blank state
  - Clears all errors and success state
  - Reloads technicians
  - Exists so the admin can repeat the workflow without a page refresh

Rendering flow:
- If `createdOrder` exists, the form is replaced by [OrderSummaryCard](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\components\OrderSummaryCard.tsx)
- Otherwise, it renders the full form

UI sections inside the file:
- `Order Details`
  - shows read-only “Auto-generated on submit”
- `Customer Information`
  - name, phone, address
- `Service Information`
  - service type, quoted price, problem description
- `Assignment`
  - technician dropdown
  - admin notes
- Side panel
  - workflow explanation
  - technician load failure
  - no-technician state

This file exists because Module 1 is fundamentally one transactional screen.

**Module 1 Success UI**
[src/components/OrderSummaryCard.tsx](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\components\OrderSummaryCard.tsx)
- Displays the created order after a successful save.
- Shows:
  - order number
  - customer name
  - service type
  - technician
  - quoted price
  - status
  - timestamp
- Gives the admin confirmation that the order was actually created.

This exists because the assessment explicitly values a post-submit summary as a good completion state.

**Module 1 Shared UI**
[src/components/Field.tsx](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\components\Field.tsx)
- Wraps labels, required badge, hint, and error for all admin inputs.
- Keeps the form consistent and easier to maintain.

[src/components/AppShell.tsx](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\components\AppShell.tsx)
- Provides the page frame for the admin portal.

[src/components/AuthActionBar.tsx](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\components\AuthActionBar.tsx)
- Shows signed-in user and role.
- Helps communicate that this is the Admin session.

**Module 1 Backend And Logic Files**
[src/lib/api.ts](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\lib\api.ts)
Module 1 functions:
- `fetchActiveTechnicians()`
  - Reads the `technicians` table
  - Filters `is_active = true`
  - Sorts by name
- `createServiceOrder(values)`
  - Maps frontend form values into RPC parameter names
  - Trims strings
  - converts `quoted_price` to number
  - calls Supabase RPC `create_service_order`

[src/lib/types.ts](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\lib\types.ts)
Module 1 types:
- `TechnicianOption`
- `OrderFormValues`
- `OrderFormErrors`
- `CreatedOrderSummary`

[src/lib/validation.ts](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\lib\validation.ts)
Module 1 validation:
- required customer fields
- required service type
- required technician assignment
- quoted price numeric and non-negative
- max lengths

[src/lib/constants.ts](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\lib\constants.ts)
Module 1 constants:
- service types
- app roles
- max lengths
- auth storage key

[src/lib/formatters.ts](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\lib\formatters.ts)
Module 1 formatting:
- currency
- local date/time formatting for summary UI

[src/lib/supabase.ts](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\lib\supabase.ts)
- Creates the client used by Module 1 and Module 2.

**Module 1 Database Contract**
[supabase/schema.sql](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\supabase\schema.sql)
Module 1 relevant parts:
- `technicians` table
- `orders` table
- `create_service_order(...)`
- RLS policies and grants for reading technicians and using the RPC
- seeded technicians

What `create_service_order(...)` does:
- verifies assigned technician exists and is active
- generates order number in `SSS-YYYYMMDD-XXXX`
- inserts the order as `Assigned`
- snapshots technician name into the order row
- returns the saved order

That RPC is the real backend center of Module 1.

**Module 1 Test Files**
[src/components/OrderForm.test.tsx](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\components\OrderForm.test.tsx)
- Verifies:
  - validation errors
  - invalid quoted price handling
  - success path
  - failure path
  - technician loading states

**Module 1 Sequence**
1. Admin logs in on [HomePage](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\pages\HomePage.tsx)
2. Clicks into [AdminOrderPage](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\pages\AdminOrderPage.tsx)
3. [OrderForm](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\components\OrderForm.tsx) loads technicians
4. Admin fills form
5. Validation runs
6. `createServiceOrder()` calls `create_service_order(...)`
7. Order is inserted into `orders` as `Assigned`
8. [OrderSummaryCard](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\components\OrderSummaryCard.tsx) confirms success
