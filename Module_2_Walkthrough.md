**Module 2 Walkthrough**

Module 2 is the `Technician Portal`. Its job is to let a technician see only their own assigned jobs, start one, upload service proof, record completion data, and mark it `Job Done`.

**Module 2 Entry Path**
[src/pages/HomePage.tsx](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\pages\HomePage.tsx)
- When a technician signs in, this page becomes the Module 2 launcher.
- It shows the `View Assigned Jobs` CTA.
- This matters because it keeps both portals in one app but clearly separated by role.

[src/pages/TechnicianJobsPage.tsx](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\pages\TechnicianJobsPage.tsx)
- Route-level entry for Module 2.
- Guards the route so only `Technician` users can access it.
- Holds:
  - `jobs`
  - `isLoading`
  - `error`
- Main function:
  - `loadJobs()` inside `useEffect`
    - calls `fetchAssignedJobs(session.name)`
    - pulls only jobs assigned to the signed-in technician
- UI states:
  - loading
  - error
  - empty state
  - job card list

This file exists because technicians need a focused “my jobs” entry screen, not a raw order table.

**Module 2 List Item Component**
[src/components/TechnicianJobCard.tsx](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\components\TechnicianJobCard.tsx)
- Represents one assigned job.
- Shows:
  - order no
  - customer
  - address
  - service type
  - status
  - quoted price
- Links to the job detail page.
- Exists so the jobs page stays simple and reusable.

**Module 2 Main Work Screen**
[src/pages/TechnicianJobDetailPage.tsx](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\pages\TechnicianJobDetailPage.tsx)
- This is the main Module 2 business component and the most complex file in the app.
- It owns:
  - current job
  - load state
  - load error
  - completion form values
  - validation errors
  - selected files
  - submit error
  - submit state
  - completion success state

Main states:
- `job`
- `values`
- `errors`
- `selectedFiles`
- `completedJob`

Important logic inside it:

- `useEffect -> loadJob()`
  - fetches the job via `fetchAssignedJobById(orderId, session.name)`
  - if job not found or belongs to another technician, shows an error
  - if job is still `Assigned`, calls `startServiceJob(orderId, session.name)`
  - otherwise leaves it as `In Progress`
- This is what converts the workflow from passive assignment into active work.

- `finalAmount`
  - computed with `useMemo`
  - `quoted_price + extra_charges`
- Important because final amount is part of the required Module 2 behavior.

- `updateField(field, value)`
  - updates one completion field
  - clears that field’s validation error

- `handleFilesAdd(files)`
  - appends selected files into local state
  - clears file-related error

- `handleFileRemove(fileName)`
  - removes one selected file from the staged list

- `handleSubmit(event)`
  - validates the completion form with `validateServiceCompletion(...)`
  - stops if invalid
  - uploads files first using `uploadServiceMedia(job.order_no, selectedFiles)`
  - then calls `completeServiceJob(job.id, session.name, values, uploadedFiles)`
  - if RPC fails after upload, attempts cleanup with `removeServiceMedia(...)`
  - on success, stores the RPC response in `completedJob`

Rendering sequence:
- if not technician -> redirect
- if loading -> loading state
- if load error -> error state
- if completed -> render [ServiceCompletionSummaryCard](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\components\ServiceCompletionSummaryCard.tsx)
- otherwise render:
  - read-only job header
  - work done form
  - final amount section
  - remarks
  - file picker
  - sticky submit action

This file exists because Module 2 is a full transactional workflow, not just a form.

**Module 2 File Upload UI**
[src/components/ServiceFilePicker.tsx](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\components\ServiceFilePicker.tsx)
- Dedicated upload component for the technician workflow.
- Handles:
  - accepted file types
  - file count display
  - selected files list
  - remove action
  - error text
- Uses:
  - `MAX_COMPLETION_FILES`
  - `MEDIA_ACCEPT`
  - `formatFileSize()`
- Exists because file upload is a distinct UX concern from the rest of the form.

**Module 2 Success UI**
[src/components/ServiceCompletionSummaryCard.tsx](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\components\ServiceCompletionSummaryCard.tsx)
- Shown after a successful job completion.
- Displays:
  - order no
  - customer
  - service type
  - technician
  - final amount
  - files uploaded
  - completed timestamp
- Provides navigation back to jobs or home.
- This completes the technician workflow.

**Module 2 Shared UI**
[src/components/StatusBadge.tsx](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\components\StatusBadge.tsx)
- Shows current job state visually.
- Used in technician list and detail flow.

[src/components/AppShell.tsx](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\components\AppShell.tsx)
- Same shared shell, but now used for mobile-friendly technician pages too.

[src/components/AuthActionBar.tsx](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\components\AuthActionBar.tsx)
- Shows technician name and role.
- Reinforces role-locked access.

**Module 2 Backend And Logic Files**
[src/lib/api.ts](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\lib\api.ts)
Module 2 functions:
- `fetchAssignedJobs(technicianName)`
  - gets only `Assigned` and `In Progress` jobs for that technician
- `fetchAssignedJobById(orderId, technicianName)`
  - gets one job only if it belongs to that technician
- `startServiceJob(orderId, technicianName)`
  - calls the Supabase RPC to move `Assigned` -> `In Progress`
- `uploadServiceMedia(orderNo, files)`
  - uploads selected files into Supabase Storage bucket `service-media`
  - sanitizes file names
  - rejects unsupported file types
  - returns file metadata for database recording
- `removeServiceMedia(filePaths)`
  - cleanup helper if completion fails after upload
- `completeServiceJob(orderId, technicianName, values, files)`
  - calls Supabase RPC to save completion and mark the order `Job Done`

This file is the operational bridge for Module 2.

[src/lib/types.ts](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\lib\types.ts)
Module 2 types:
- `AssignedJobSummary`
- `AssignedJobDetail`
- `ServiceCompletionFormValues`
- `ServiceCompletionErrors`
- `UploadedServiceFile`
- `CompletedJobSummary`

[src/lib/validation.ts](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\lib\validation.ts)
Module 2 validation:
- work done required
- remarks length
- extra charges numeric and non-negative
- file count between 1 and 6

[src/lib/constants.ts](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\lib\constants.ts)
Module 2 constants:
- active statuses
- completion status
- max completion files
- media accept string
- extra field lengths

[src/lib/formatters.ts](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\lib\formatters.ts)
Module 2 formatting:
- currency for final amount
- timestamps for job/completion display
- file size formatting

**Module 2 Database Contract**
[supabase/schema.sql](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\supabase\schema.sql)
Module 2 relevant parts:
- extends `orders.status` to allow:
  - `Assigned`
  - `In Progress`
  - `Job Done`
- creates:
  - `service_completions`
  - `service_completion_files`
- creates storage bucket:
  - `service-media`
- enables read/write policies needed for completion flow
- defines:
  - `start_service_job(...)`
  - `complete_service_job(...)`

What `start_service_job(...)` does:
- verifies the order belongs to the technician
- if status is `Assigned`, updates it to `In Progress`
- returns the updated order

What `complete_service_job(...)` does:
- verifies order belongs to technician
- validates work done
- validates file count
- calculates final amount from quoted price + extra charges
- inserts or updates `service_completions`
- replaces `service_completion_files`
- updates `orders.status` to `Job Done`
- returns a completion summary

This is the real backend center of Module 2.

**Module 2 Test Files**
[src/pages/TechnicianJobsPage.test.tsx](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\pages\TechnicianJobsPage.test.tsx)
- Verifies:
  - only assigned jobs appear
  - empty state
  - unauthorized redirect

[src/pages/TechnicianJobDetailPage.test.tsx](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\pages\TechnicianJobDetailPage.test.tsx)
- Verifies:
  - assigned job auto-starts
  - final amount recalculates
  - file rules are enforced
  - successful completion works
  - admin cannot access technician detail route

**Module 2 Sequence**
1. Technician logs in on [HomePage](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\pages\HomePage.tsx)
2. Clicks into [TechnicianJobsPage](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\pages\TechnicianJobsPage.tsx)
3. Page calls `fetchAssignedJobs(session.name)`
4. Technician selects a job card
5. [TechnicianJobDetailPage](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\pages\TechnicianJobDetailPage.tsx) loads that job
6. If status is `Assigned`, `startServiceJob(...)` updates it to `In Progress`
7. Technician enters work done, extra charges, remarks, and files
8. Files are uploaded via `uploadServiceMedia(...)`
9. Completion is saved through `complete_service_job(...)`
10. Order status becomes `Job Done`
11. [ServiceCompletionSummaryCard](C:\Users\monqichi\Utopia_Assessment\Module_1_Admin_Portal\src\components\ServiceCompletionSummaryCard.tsx) confirms the result
