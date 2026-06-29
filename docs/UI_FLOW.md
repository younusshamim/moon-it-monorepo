# Moon IT — UI & User Journey Guide

A practical, screen-by-screen reference for building the Moon IT internal dashboard.

Moon IT Training Institute (Feni, Bangladesh) is a government-affiliated institute running
batch-based programs: short IT/computer courses, language programs, and one-year diploma tracks.
This dashboard is the internal back-office tool used by admins, branch staff, counselors,
accountants, and instructors to run day-to-day operations.

---

## 1. Scope & conventions

### 1.1 What this guide covers

This guide covers the **foundation** and **operational** modules — everything needed to run the
institute end to end:

- **Foundation** (the data the institute is configured with): organization (branches, rooms,
  departments), course catalog & curriculum, affiliation bodies & government exam configuration,
  staff/instructors, and access control (users, roles, permissions).
- **Operational** (the daily work): admissions/leads, students, batches & scheduling, attendance,
  enrollment, finance (invoicing & payments), exams & grades, government exam registration, and
  certificates.

**Out of scope** (intentionally omitted): Reports, Analytics, metric dashboards, automation, and
communications/notifications. The audit log appears only as a read-only system page.

### 1.2 Audience

A frontend developer who knows the stack (Next.js App Router, NestJS API, PostgreSQL via Drizzle)
but not the domain. Each screen below names the **schema tables** it reads/writes so you can wire
the API quickly. Table names refer to `packages/db/src/schema`.

### 1.3 Shared UX patterns

These patterns repeat across the app — they're defined once here and referenced throughout.

**List page anatomy.** Almost every module opens on a list page with the same skeleton:

1. **Page header** — title on the left, a primary action button on the right (e.g. "Add Lead",
   "New Invoice").
2. **Filter bar** — a row of filter controls (status dropdown, type, date range) plus a search
   box. Filters reflect into the URL query string so views are shareable/bookmarkable.
3. **Data table** — paginated, sortable columns, with a status badge column where the entity has a
   status enum. Row click opens the detail view (drawer or full page).
4. **Row actions** — a trailing "⋯" menu per row (Edit, Archive, and context actions like "Record
   Payment").
5. **Empty state** — friendly message + the primary action when no rows match.

**Detail pages.** Entities with rich sub-data (students, batches, invoices, courses) use a full
**detail page** with a header summary and **tabs**. Simpler entities (a lead, a room, a discount)
use a **drawer** instead of a dedicated page.

**Dialogs, drawers, modals — when to use which:**

- **Side drawer (right)** — create/edit forms and quick detail views. The list stays visible
  underneath so the user keeps context. This is the default for create/edit.
- **Modal (centered)** — destructive or irreversible confirmations (void invoice, cancel batch,
  delete) and short focused actions (issue refund, generate sessions). Modals block interaction.
- **Inline editing** — grid-style data entry (attendance marking, grade entry) edits in place
  rather than opening a form per row.

**Branch scoping.** A user's roles are scoped to a branch (`user_roles.branchId`; `null` = all
branches, e.g. super admin). The top-bar **branch switcher** sets the active branch, and most
operational lists (students, batches, invoices, leads) are filtered to it by default.
Institute-wide foundation data (courses, affiliation bodies) is shared across branches but priced
per branch via offerings.

**Soft delete / archive.** Core records (`students`, `courses` via `isPublished`, leads, invoices
via `void`, branches/rooms via `isActive`) are never hard-deleted from the UI — they're archived,
voided, or deactivated. "Delete" actions in the UI map to these soft states.

**Status badges.** Every status enum renders as a colored badge with consistent semantics:
neutral/grey for draft/planned, blue for in-progress, green for done/success, amber for
pending/attention, red for failed/cancelled/void. The exact enum values are listed per screen.

**Money.** All amounts are stored as `numeric(12,2)` strings with a `currency` (default `BDT`).
Always render with the currency and thousands separators; never do float math in the client.

**Implementation invariants (server-side).** A few rules the schema can't enforce on its own and
the API must uphold:

- **Atomic admission.** The New Admission wizard (§5.1) commits student + enrollment + invoice +
  payment in a **single DB transaction** — all or nothing.
- **`batches.enrolledCount`** is a denormalized counter; keep it in sync on every enroll, drop, and
  transfer.
- **`invoices.amountPaid` / `status`** are derived — recompute them from `succeeded` payments minus
  `refunds`, not by trusting the client.
- **Business numbers** (`invoiceNumber`, `receiptNumber`, `certificateNumber`, `studentCode`) are
  generated server-side inside the creating transaction so they stay unique under concurrency.

---

## 2. Global shell

Every authenticated screen renders inside the dashboard shell.

**Sidebar (left).** Grouped navigation sections (see §3). Collapsible to an icon rail; collapsed
items show tooltips. Parent items with children expand/collapse in place. The active route and its
ancestor section are highlighted.

**Top bar.**

- **Branch switcher** — dropdown of branches the user can access; sets the active branch used to
  scope lists. Hidden/locked to a single branch for branch-scoped users.
- **Global search** — jump to a student, lead, invoice, or batch by name/code/number.
- **Profile menu** — current user, role(s), "Settings", sign out.

**Breadcrumbs.** Below the top bar on detail pages: `Section / List / Record`, each segment
linking back up the hierarchy.

**Auth.** Unauthenticated users are redirected to `/login` (already scaffolded). On success they
land on the Dashboard.

---

## 3. Navigation structure

This is the complete sidebar tree. It **replaces** the placeholder routes currently in
`apps/web/src/lib/navigation.ts` (e.g. `/admissions/applicants`, `/admissions/offers`, and the
Reports/Analytics sections), which were scaffolding only.

```
Overview
  └─ Dashboard ................... /

Admissions
  ├─ New Admission ............... /admissions/new   (primary flow; also a global "+ Admit" action)
  └─ Leads ....................... /leads

Students
  └─ Students .................... /students
     └─ Student profile .......... /students/[id]

Academics
  ├─ Courses ..................... /courses
  │  └─ Course detail ............ /courses/[id]
  ├─ Batches ..................... /batches
  │  └─ Batch detail ............. /batches/[id]
  ├─ Schedule .................... /schedule
  ├─ Attendance .................. /attendance
  └─ Exams & Certificates
     ├─ Exams & Grades ........... /exams
     ├─ Govt Exam Registration ... /govt-exams
     └─ Certificates ............. /certificates

Finance
  ├─ Invoices .................... /invoices
  │  └─ Invoice detail ........... /invoices/[id]
  ├─ Payments .................... /payments
  └─ Discounts ................... /discounts

People (HR)
  ├─ Staff ....................... /staff
  └─ Instructors ................. /instructors

Settings
  ├─ Branches .................... /settings/branches
  ├─ Rooms ....................... /settings/rooms
  ├─ Departments ................. /settings/departments
  ├─ Users & Roles ............... /settings/users
  ├─ Affiliation Bodies .......... /settings/affiliation
  └─ Audit Log ................... /settings/audit
```

> Each screen below uses a fixed micro-template: **Route → What the user sees → Primary actions →
> Dialogs/Drawers/Modals → Linked tables.**

---

## 4. Overview — Dashboard

**Route:** `/`

**What the user sees.** A landing page of operational tiles and shortcuts (not analytics): today's
sessions for the active branch, batches open for enrollment, invoices due/overdue counts, new
leads awaiting follow-up, and upcoming government exam events with closing registration windows.
Each tile is a count + a "view" link into the relevant list. A quick-actions row offers the most
common starting points: **Add Lead**, **Admit Student** (launches the New Admission wizard, §5.1),
**New Batch**, **Record Payment**.

**Primary actions.** Navigate into any module via tiles/quick actions.

**Dialogs/Drawers/Modals.** None native; quick actions deep-link to the relevant list and open its
create drawer.

**Linked tables.** Read-only aggregates over `sessions`, `batches`, `invoices`, `leads`,
`govt_exam_events`.

---

## 5. Admissions

Everything from first contact to a paid seat in a batch. Two screens: the **New Admission wizard**
(the primary, do-it-all flow) and **Leads** (the optional CRM funnel that feeds it).

> **"Admission" = creating a `students` record.** There is no separate admission entity — admitting
> a person means inserting a student, and "enrolling" means linking that student to a batch via
> `enrollments`. The wizard below does both (plus the first invoice and payment) in one transaction.

### 5.1 New Admission (wizard) — primary flow

**Route:** `/admissions/new`

**What the user sees.** A single-screen **4-step stepper** that a front-desk operator completes in
one sitting and submits atomically. This is the fastest, default path for a walk-in who is ready to
join:

1. **Student** — search for an existing student by phone/name, or create a new one inline (same
   fields as the Admit Student drawer in §6.1: name, phone, email, gender, DOB, NID/birth-cert,
   guardian, address, photo, home branch). Pre-filled when launched from a lead.
2. **Course & Batch** — pick a course → (if the course has `course_variants`, pick the **variety**)
   → its branch `course_offerings` → an open `batches` (`open_for_enrollment`, capacity-checked
   against `enrolledCount`/`capacity`). The applicable fee is shown (offering `baseFee` +
   `admissionFee` for the chosen variety, overridden by the batch `feeOverride` if set).
3. **Fees & Discount** — review the invoice lines (course fee + admission fee), apply a `discounts`
   code (percentage/fixed) — the chosen discount is recorded on the invoice (`invoices.discountId`)
   in addition to the computed `discountTotal` — and optionally split into an **installment** plan
   (sequence + due dates).
4. **Payment** — record the first payment now (method incl. cash/bKash/Nagad/Rocket/card/bank, with
   reference) or defer to "pay later".

**Primary actions.** **Submit Admission** — one server-side **transaction** creates: `students`
(if new), `enrollments` (set `active`; or `applied`/`confirmed` if an approval gate is adopted —
see §11.1 variant), `invoices` (`issued`, `purpose = course_fee`) with `invoice_lines`, optional
`installments`, and—if paid now—a `payments` row with `payment_allocations`. If the wizard was
launched from a lead, that lead is set to `enrolled`. On success the operator lands on the new
student's profile (§6.2).

**Entry points.** Sidebar **New Admission**; Dashboard quick action **Admit Student**; Lead detail
**Convert to Student** (§5.3, pre-fills step 1); Batch detail **Add Student** (§7.2, pre-fills
step 2).

**Dialogs/Drawers/Modals.** The wizard itself is a full screen (or a large centered modal launched
from quick actions). A confirmation summary precedes the atomic submit; failures roll back wholesale.

**Linked tables.** `students`, `enrollments`, `invoices`, `invoice_lines`, `installments`,
`payments`, `payment_allocations`, `discounts`, `course_offerings`, `batches`, `leads` (when
converting).

### 5.2 Leads list

The top of the funnel: prospective students who walked in, called, or came from Facebook/Google.

**Route:** `/leads`

**What the user sees.** A list of leads for the active branch with two view toggles:

- **Table view** — columns: Name, Phone, Interested Course, Source, Status badge, Assigned To,
  Created. Filters: Status, Source, Assigned To, Interested Course; search by name/phone.
- **Kanban view** — columns by `lead_status`: `new → contacted → interested → enrolled → lost`.
  Cards are draggable between columns to change status.

Source values (`lead_source`): `walk_in`, `facebook`, `google`, `referral`, `phone`, `website`.

**Primary actions.** **Add Lead** (header), drag to change status (kanban), open a lead (row/card).

**Dialogs/Drawers/Modals.**

- **Add/Edit Lead drawer** — name, phone, email, interested course (from `courses`), source,
  assigned-to (a staff user), notes.

**Linked tables.** `leads`, `courses` (interest), `branches` (scope).

### 5.3 Lead detail

**Route:** opens as a **drawer** from the list (no dedicated page).

**What the user sees.** Lead contact summary and status at top; an **activity timeline** below
listing every logged interaction (`lead_activities`: type such as call/visit/follow_up, note,
timestamp, who). A status control and an assignee control sit in the header.

**Primary actions.**

- **Log Activity** — add a call/visit/follow-up note (appends to the timeline).
- **Change Status** / **Reassign**.
- **Convert to Student** — the key conversion step: launches the **New Admission wizard** (§5.1)
  with step 1 pre-filled from the lead's name/phone/email, so the operator continues straight into
  course/batch/fees/payment. On submit the lead moves to `enrolled` and is stamped with the new
  student's id (`leads.convertedStudentId`) to preserve the conversion trail.

**Dialogs/Drawers/Modals.**

- **Log Activity dialog** (small modal/inline form).
- **Convert to Student** opens the **New Admission wizard** (§5.1) pre-populated.

**Linked tables.** `leads`, `lead_activities`, and on conversion the wizard's tables (§5.1).

---

## 6. Students

The institute's people of record. A student may or may not have a portal login (`users`).

### 6.1 Students list

**Route:** `/students`

**What the user sees.** Table of students in the active branch. Columns: Photo, Student Code,
Name, Phone, Gender, Home Branch, Active Enrollments (count), Created. Filters: branch, gender,
has-active-enrollment; search by name/phone/student code.

**Primary actions.** **Admit Student** (header) → opens the create drawer. Row → open profile.

> The Admit Student drawer creates a **student record only** (no batch/fees). For the end-to-end
> admit + enroll + invoice + pay path, use the **New Admission wizard** (§5.1) — that is the primary
> flow, and "Admit Student" on the dashboard launches it. Use this drawer when you only need to add
> or edit a person's details.

**Dialogs/Drawers/Modals.**

- **Admit / Edit Student drawer** — student code (auto-suggested, e.g. `MIT-2026-00142`), full
  name, phone, email, gender, date of birth, NID/birth-cert number, guardian name & phone,
  address, photo upload, home branch. The same field set is embedded as step 1 of the New Admission
  wizard (§5.1).

**Linked tables.** `students`, `branches`, `users` (optional link).

### 6.2 Student profile

**Route:** `/students/[id]`

**What the user sees.** A full page with a header (photo, name, student code, contact, home
branch, portal-login status) and **tabs**:

- **Overview** — personal & guardian details, edit access.
- **Enrollments** — batches the student is in, with `enrollment_status` badges (`applied`,
  `confirmed`, `active`, `completed`, `dropped`, `transferred`) and enrolled/completed dates.
  Action: **Enroll in Batch**.
- **Invoices & Payments** — the student's invoices with status and balance, plus a payment
  history; quick **New Invoice** / **Record Payment**.
- **Attendance** — attendance summary per enrolled batch (present/absent/late/excused tallies)
  with a session-level breakdown.
- **Exam Results** — grades across the student's exams (marks, letter grade) grouped by batch.
- **Certificates** — issued certificates (institute & government) with verification codes and PDF
  links.
- **Govt Registrations** — government exam registrations and their pipeline status.

**Primary actions.** Edit profile; Enroll in Batch; New Invoice; Record Payment; Issue
Certificate (where eligible) — each defined in its own module section below.

**Dialogs/Drawers/Modals.**

- **Enroll in Batch drawer** — for an **already-existing** student, pick an open batch (filtered to
  `open_for_enrollment`), confirm; creates an `enrollments` row (unique per student+batch) and
  optionally kicks off invoice creation. (For brand-new admits, prefer the New Admission wizard,
  §5.1, which does student + enrollment + invoice + payment in one pass.)

**Linked tables.** `students`, `enrollments`, `attendance`, `grades`, `certificates`,
`govt_exam_registrations`, `invoices`, `payments`.

---

## 7. Academics

### 7.1 Courses (catalog)

**Route:** `/courses`

**What the user sees.** Institute-wide catalog (shared across branches). Columns: Code, Title,
Type badge (`short_course`, `language`, `diploma`), Department, Duration (weeks or months), Govt
Affiliated flag, Published flag. Filters: type, department, affiliation, published/draft; search by
title/code.

**Primary actions.** **New Course**; open a course; toggle **Published**.

**Dialogs/Drawers/Modals.**

- **New/Edit Course drawer** — department, type, code, title, slug, description, duration
  (weeks for short courses / months for diplomas), total hours, level (e.g. "Beginner", "B2"),
  default delivery mode (`onsite`/`online`/`hybrid`), "Govt affiliated" toggle + affiliation body,
  publish toggle.

**Linked tables.** `courses`, `departments`, `affiliation_bodies`.

#### Course detail

**Route:** `/courses/[id]`

**What the user sees.** Header with course summary and publish state; **tabs**:

- **Overview** — full course fields (editable).
- **Curriculum** — a **builder**: ordered modules (`course_modules`), each expandable to its
  ordered lessons (`lessons`, with optional duration minutes). Drag to reorder modules and lessons;
  add/edit/remove inline.
- **Varieties** *(optional)* — branch-agnostic catalog variations of the course
  (`course_variants`): name (e.g. "Regular", "Premium", "Crash"), optional code, description, order,
  active toggle. **Most courses have none** — leave this empty and the course is priced as a single
  offering per branch. When present, each variety is priced separately in the Offerings tab. Variety
  names are unique within a course.
- **Offerings** — per-branch availability & pricing (`course_offerings`): branch, mode, **variety**
  (optional — only when the course defines varieties), base fee, admission fee, currency, active
  toggle. Price lives here, so a variety can be priced differently per branch. The offering is
  unique per branch + mode + variety; a course must have an offering in a branch before batches can
  be created there.

**Primary actions.** Add/reorder modules & lessons; **Add Variety**; **Add Offering** (per branch,
optionally for a variety); edit fees; publish/unpublish.

**Dialogs/Drawers/Modals.**

- **Module / Lesson** add-edit (inline or small drawer).
- **Add/Edit Variety drawer** — name, code, description, order, active.
- **Add/Edit Offering drawer** — branch, mode, variety (only shown if the course has varieties),
  base fee, admission fee, currency, active.

**Linked tables.** `courses`, `course_modules`, `lessons`, `course_variants`, `course_offerings`.

### 7.2 Batches

A batch is a scheduled run of a course offering at a branch.

**Route:** `/batches`

**What the user sees.** Table of batches in the active branch. Columns: Code, Course (via
offering), Status badge (`planned`, `open_for_enrollment`, `running`, `completed`, `cancelled`),
Start/End dates, Enrolled/Capacity, Default Room. Filters: status, course/offering, date range.

**Primary actions.** **New Batch**; open a batch; change status (e.g. open enrollment, mark
running/completed).

**Dialogs/Drawers/Modals.**

- **New/Edit Batch drawer** — offering (course + branch + variety, if any), code, name, capacity,
  start/end dates, default room, optional fee override (per-batch promo price).

**Linked tables.** `batches`, `course_offerings`, `rooms`.

#### Batch detail

**Route:** `/batches/[id]`

**What the user sees.** Header (code, course, status, dates, enrolled/capacity); **tabs**:

- **Overview** — batch fields, status control, fee override.
- **Weekly Schedule** — recurring weekly slots (`batch_schedules`): day of week, start/end time,
  room. This template drives session generation.
- **Roster** — enrolled students (`enrollments`) with status; add/remove/transfer students; the
  denormalized `enrolledCount` reflects here. **Add Student** launches the New Admission wizard
  (§5.1) with step 2 pre-filled to this batch.
- **Sessions** — generated calendar of concrete class meetings (`sessions`): date, time,
  instructor, room, topic, cancelled flag.
- **Instructors** — assigned instructors (`batch_instructors`) with a **lead** flag.

**Primary actions.** Edit weekly schedule; **Generate Sessions** (expand the weekly template across
the batch date range); **Open for Enrollment**; **Assign Instructors**; add students to roster;
**Cancel Batch**.

**Dialogs/Drawers/Modals.**

- **Weekly slot** add/edit (inline).
- **Generate Sessions** modal — confirms date range + which weekly slots to expand into sessions.
- **Assign Instructor** drawer — pick instructor(s), set lead.
- **Cancel Batch** confirmation modal.

**Linked tables.** `batches`, `batch_schedules`, `sessions`, `enrollments`, `batch_instructors`,
`rooms`, `instructors`.

### 7.3 Schedule (timetable)

**Route:** `/schedule`

**What the user sees.** A branch-wide calendar/timetable of `sessions` — week and day views,
filterable by room, instructor, or batch. Each block shows batch code, topic, time, room.
Cancelled sessions are visually struck through. This is the read-and-adjust operational view of
everything generated from batch schedules.

**Primary actions.** Open a session; reschedule (drag or edit); cancel a session.

**Dialogs/Drawers/Modals.**

- **Session drawer** — date, time, instructor, room, topic; **Cancel Session** toggle; reschedule
  fields.

**Linked tables.** `sessions`, `batches`, `rooms`, `instructors`.

### 7.4 Attendance

**Route:** `/attendance`

**What the user sees.** First a **session picker** (choose batch → session, defaulting to today's
sessions for the active branch). Once a session is chosen, the batch **roster** renders as an
inline checklist: each enrolled student with an attendance control
(`present` / `absent` / `late` / `excused`). Shows who marked it and when.

**Primary actions.** Mark each student; **Mark all present** (bulk); save. Attendance is unique per
session+enrollment, so re-opening a marked session shows existing values for correction.

**Dialogs/Drawers/Modals.** Inline editing (no drawer); a confirmation toast on save.

**Linked tables.** `attendance`, `sessions`, `enrollments`.

### 7.5 Exams & Grades

**Route:** `/exams`

**What the user sees.** Exams scoped to a selected batch. Each exam (`exams`) shows Type badge
(`quiz`, `midterm`, `final`, `practical`, `assignment`), Title, Total Marks, Pass Marks, Weight,
Exam Date. Selecting an exam opens its **grade-entry grid**: every enrolled student with editable
Marks Obtained, auto/derived Letter Grade, and Remarks (`grades`).

**Primary actions.** **New Exam** (for the batch); enter/edit grades inline; save grades.

**Dialogs/Drawers/Modals.**

- **New/Edit Exam drawer** — type, title, total marks, pass marks, weight (for final-grade
  calculation), exam date.

**Linked tables.** `exams`, `grades`, `batches`, `enrollments`.

### 7.6 Govt Exam Registration

For courses affiliated with bodies like BTEB/NSDA, students register for the body's external exam.

**Route:** `/govt-exams`

**What the user sees.** Two levels:

- **Exam events** (`govt_exam_events`) — list of scheduled board exams: title (e.g. "BTEB Web
  Design — June 2026"), affiliation body, course, exam date, registration open/close dates, result
  published date. Filters: body, course, date.
- **Event detail → registration roster** (`govt_exam_registrations`) — students registered for the
  event with status pipeline badges: `pending_payment → registered → admit_issued → appeared →
  passed / failed / absent / cancelled`. Columns include board roll number, board registration
  number, result grade/marks.

**Primary actions.** **New Exam Event**; **Register Students** (add eligible students from a course
to an event); advance status; **Record Results** (grade/marks, pass/fail); issue government
certificate for those who passed (links into §7.7).

**Dialogs/Drawers/Modals.**

- **New/Edit Exam Event drawer** — body, course, title, dates.
- **Register Students drawer** — pick students (typically from a batch enrollment), creating
  registrations (unique per student+event). Registration in `pending_payment` triggers a
  government exam fee invoice (§8, `invoice_purpose = govt_exam_fee`).
- **Record Results modal** — enter board roll/registration numbers and result grade/marks; sets
  passed/failed/absent.

**Linked tables.** `govt_exam_events`, `govt_exam_registrations`, `affiliation_bodies`, `courses`,
`students`, `enrollments`; fee config from `govt_exam_fees`.

### 7.7 Certificates

**Route:** `/certificates`

**What the user sees.** Issued certificates list. Columns: Certificate Number, Student (via
enrollment), Course, Source badge (`institute` / `government`), Final Grade, Issued Date,
Verification Code, PDF link. Filters: source, course, date.

**Primary actions.** **Issue Certificate** — for a completed enrollment (institute) or a passed
government registration (government). Generates the certificate number and a public verification
code (used for QR-based public verification) and a PDF URL.

**Dialogs/Drawers/Modals.**

- **Issue Certificate drawer** — enrollment, course, source; for government source: linked govt
  registration + affiliation body; final grade. On save, produces certificate number, verification
  code, and PDF.

**Linked tables.** `certificates`, `enrollments`, `courses`, `govt_exam_registrations`,
`affiliation_bodies`.

---

## 8. Finance

### 8.1 Invoices

**Route:** `/invoices`

**What the user sees.** Invoices for the active branch. Columns: Invoice Number, Student, Purpose
badge (`course_fee` / `govt_exam_fee`), Status badge (`draft`, `issued`, `partially_paid`, `paid`,
`void`), Grand Total, Amount Paid, Balance, Due Date. Filters: status, purpose, branch, date range;
search by invoice number/student.

**Primary actions.** **New Invoice**; open an invoice; **Issue** (draft → issued); **Void**.

**Dialogs/Drawers/Modals.**

- **New Invoice drawer** — student, optional linked enrollment, purpose; for `govt_exam_fee`, the
  linked government registration. Add **invoice lines** (description, quantity, unit price, line
  total — e.g. "Course Fee", "Admission Fee"); subtotal/discount/tax/grand-total compute from
  lines and applied discounts. A catalog discount is stored as `invoices.discountId` (with the
  amount in `discountTotal`); ad-hoc discounts just set `discountTotal`. Optionally set up an
  **installment schedule**.

**Linked tables.** `invoices`, `invoice_lines`, `installments`, `students`, `enrollments`,
`govt_exam_registrations`, `discounts`.

#### Invoice detail

**Route:** `/invoices/[id]`

**What the user sees.** Header (invoice number, student, status, grand total, amount paid,
balance, due date). Sections:

- **Lines** (`invoice_lines`) — description, qty, unit price, line total; subtotal, discount, tax,
  grand total.
- **Installment schedule** (`installments`) — sequence, due date, amount due, amount paid per
  installment.
- **Payment history** — payments applied to this invoice and their allocations.

**Primary actions.** Add/edit lines (while draft); apply discount; set/edit installments;
**Issue**; **Record Payment**; **Void** (confirmation modal).

**Dialogs/Drawers/Modals.**

- **Apply Discount** (select from `discounts` — percentage/fixed).
- **Installment editor** (rows of due date + amount).
- **Record Payment drawer** (shared with §8.2).
- **Void Invoice** confirmation modal.

**Linked tables.** `invoices`, `invoice_lines`, `installments`, `payments`, `payment_allocations`,
`discounts`.

### 8.2 Payments

**Route:** `/payments`

**What the user sees.** Payment receipts for the active branch. Columns: Receipt Number, Student,
Method badge (`cash`, `bkash`, `nagad`, `rocket`, `card`, `bank_transfer`), Status (`pending`,
`succeeded`, `failed`, `refunded`), Amount, Reference (e.g. bKash trx id), Paid Date, Received By.
Filters: method, status, date range; search by receipt/student/reference.

**Primary actions.** **Record Payment**; open a receipt; **Issue Refund**.

**Dialogs/Drawers/Modals.**

- **Record Payment drawer** — student, invoice (optional), method, amount, reference, paid date.
  When tied to an invoice with installments, allocate the amount across installments
  (`payment_allocations`); the invoice's amount paid and status update accordingly.
- **Issue Refund modal** — against a payment: refund amount, reason, approver; sets the payment to
  `refunded` and records a `refunds` row.

**Linked tables.** `payments`, `payment_allocations`, `installments`, `invoices`, `students`,
`refunds`.

### 8.3 Discounts

**Route:** `/discounts`

**What the user sees.** Manageable list of discount codes. Columns: Code, Name, Type
(`percentage` / `fixed`), Value, Validity (from/to), Branch scope (or institute-wide). Filters:
type, active/expired, branch.

**Primary actions.** **New Discount**; edit; archive/expire (no `isActive` flag — "expire" sets
`validTo` to a past date, which drops it from the active list).

**Dialogs/Drawers/Modals.**

- **New/Edit Discount drawer** — code, name, type, value, valid-from/valid-to, branch (null =
  institute-wide).

**Linked tables.** `discounts`, `branches`. (Applied to invoices in §8.1.)

---

## 9. People (HR)

Internal staff and the instructors who teach batches.

### 9.1 Staff

**Route:** `/staff`

**What the user sees.** Employees in the active branch. Columns: Employee Code, Name, Designation,
Phone, Status badge (`active`, `on_leave`, `terminated`), Branch, Joined date. Filters: status,
branch; search by name/code.

**Primary actions.** **Add Staff**; open/edit; change status.

**Dialogs/Drawers/Modals.**

- **Add/Edit Staff drawer** — employee code, full name, designation, phone, branch, joined date,
  status, optional linked user account (for login).

**Linked tables.** `employees`, `branches`, `users`.

### 9.2 Instructors

**Route:** `/instructors`

**What the user sees.** Instructor roster — both staff instructors and guest/freelance instructors.
Columns: Name, Type (staff vs freelance), Expertise tags, Rate per session (freelance). Search by
name/expertise.

**Primary actions.** **Add Instructor**; open/edit.

**Dialogs/Drawers/Modals.**

- **Add/Edit Instructor drawer** — full name, link to an employee (staff) **or** a user
  (guest/freelance), expertise tags (e.g. "React", "IELTS"), bio, rate per session for freelancers.

**Linked tables.** `instructors`, `employees`, `users`. (Assigned to batches in §7.2.)

---

## 10. Settings (foundation)

Configuration data set up before/around daily operations. Typically admin-only.

### 10.1 Branches

**Route:** `/settings/branches`

**What the user sees.** Institute branches. Columns: Code (e.g. "DHK-01"), Name, City, Phone,
Email, Timezone, Active. **Add/Edit Branch drawer** — code, name, address lines, city, phone,
email, timezone (default `Asia/Dhaka`), active toggle.

**Linked tables.** `branches`.

### 10.2 Rooms

**Route:** `/settings/rooms`

**What the user sees.** Rooms grouped by branch. Columns: Branch, Name (e.g. "Lab 1", "Room 204"),
Capacity, Has Computers, Active. **Add/Edit Room drawer** — branch, name, capacity, has-computers
toggle, active.

**Linked tables.** `rooms`, `branches`.

### 10.3 Departments

**Route:** `/settings/departments`

**What the user sees.** Departments (e.g. "IT", "Languages", "Diploma"), optionally scoped to a
branch or institute-wide. **Add/Edit Department drawer** — name, branch (null = institute-wide).

**Linked tables.** `departments`, `branches`.

### 10.4 Users & Roles

**Route:** `/settings/users`

**What the user sees.** Access control, presented as tabs:

- **Users** — list of `users`: name, email, phone, Status badge (`active`, `suspended`,
  `invited`), email-verified, assigned roles. Actions: **Invite User**, edit, suspend/reactivate.
- **Roles** — list of `roles` (key, name, system flag) with a **permission matrix**: each role's
  granted `permissions` (`role_permissions`) shown as a checkable grid. System roles are read-only.
- **Role assignments** — assign a role to a user **scoped to a branch** (`user_roles`; null branch
  = all branches / super admin).

**Primary actions.** Invite user; assign/revoke roles per branch; edit role permissions.

**Dialogs/Drawers/Modals.**

- **Invite User drawer** — email, phone, full name; sets status `invited`.
- **Assign Role drawer** — user, role, branch scope.
- **Edit Role / permissions** — name + permission checkboxes.

**Linked tables.** `users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `branches`.

### 10.5 Affiliation Bodies

**Route:** `/settings/affiliation`

**What the user sees.** Government/affiliation bodies and their exam configuration, as tabs:

- **Bodies** (`affiliation_bodies`) — code (e.g. "BTEB", "NSDA"), name, website, active.
- **Govt Exam Fees** (`govt_exam_fees`) — per course (and optionally per branch) registration fee,
  currency, validity window, active. Drives the `govt_exam_fee` invoices.
- **Exam Events** — the same `govt_exam_events` managed operationally in §7.6, surfaced here for
  configuration (cross-linked).

**Primary actions.** Add/edit body; add/edit exam fee per course/branch; manage exam events.

**Dialogs/Drawers/Modals.**

- **Add/Edit Body drawer** — code, name, website, active.
- **Add/Edit Govt Exam Fee drawer** — course, branch (null = institute-wide), registration fee,
  currency, valid-from/to, active.

**Linked tables.** `affiliation_bodies`, `govt_exam_fees`, `govt_exam_events`, `courses`,
`branches`.

### 10.6 Audit Log

**Route:** `/settings/audit`

**What the user sees.** A read-only, append-only trail of sensitive actions (`audit_logs`): actor,
branch, action (e.g. "invoice.void"), entity type/id, and before/after JSON snapshots, with
timestamp. Filterable by actor, branch, entity type, and date range. View-only — no create/edit.

**Linked tables.** `audit_logs`.

---

## 11. Cross-cutting journeys

These tie the modules together end to end. Each step names the screen and the records it creates.

### 11.1 Admission → Certificate (the core student lifecycle)

**Primary path — the One-Step Admission wizard.** The default flow collapses admission, enrollment,
invoicing, and first payment into a single transactional screen:

1. **Admit + enroll + invoice + pay** — New Admission wizard (§5.1): in one submit, creates
   `students` (if new) + `enrollments` (`active`) against an open `batches`/`course_offerings` +
   `invoices` (`purpose = course_fee`) with `invoice_lines` and optional `installments` + (if paid
   now) `payments` with `payment_allocations`. A `discounts` code can be applied in-wizard.
2. **Attend & assess** — Attendance (§7.4) records `attendance` per `sessions`; Exams (§7.5)
   records `grades` against `exams`.
3. **Complete & certify** — enrollment marked `completed`; Certificates (§7.7) issues an
   institute `certificates` row with a verification code.

**Alternate admission variants** (same end state, different front-of-funnel — choose per situation):

- **Lead-first funnel** — Capture a `leads` row and log `lead_activities` (§5.2–5.3), nurture, then
  **Convert to Student** launches the wizard pre-filled. Best when you want CRM tracking/marketing
  attribution before the person commits.
- **Quick direct admission (step-by-step)** — skip the wizard: **Admit Student** drawer (§6.1) →
  **Enroll in Batch** (§6.2) → **New Invoice** (§8.1) → **Record Payment** (§8.2) as discrete
  actions. Useful when the steps happen at different times or desks.
- **Application + approval gate** — create the enrollment as `applied`, have staff review
  (eligibility/seats/docs) and set it `confirmed`, then take payment to move it `active`. Fits
  limited-seat diplomas and govt-affiliated tracks; uses the `applied → confirmed → active` part of
  the `enrollment_status` pipeline.

### 11.2 Government exam journey

1. **Configure** — Settings (§10.5): `affiliation_bodies` + `govt_exam_fees`; create a
   `govt_exam_events` for the body+course.
2. **Register** — Govt Exam Registration (§7.6): create `govt_exam_registrations`
   (`pending_payment`) for enrolled students.
3. **Invoice the fee** — Finance (§8.1): `invoices` with `purpose = govt_exam_fee` linked to the
   registration (`govtRegistrationId`); pay via §8.2. Registration advances to `registered`.
4. **Sit the exam** — status progresses `admit_issued → appeared`; record board roll/registration
   numbers.
5. **Results** — "Record Results" sets `passed` / `failed` / `absent` with grade/marks.
6. **Govt certificate** — for `passed`, Certificates (§7.7) issues a `certificates` row with
   `source = government`, linked to the registration and affiliation body.

---

## 12. Build checklist (coverage)

Every operational/foundation table is owned by at least one screen:

| Domain | Tables | Primary screen(s) |
| --- | --- | --- |
| IAM | users, roles, permissions, role_permissions, user_roles | §10.4 Users & Roles |
| Organization | branches, rooms, departments | §10.1–10.3 |
| People | students | §5.1 New Admission, §6 Students |
| HR | employees, instructors | §9 People (HR) |
| Catalog | courses, course_modules, lessons, course_variants, course_offerings | §7.1 Courses |
| Scheduling | batches, batch_schedules, sessions, batch_instructors | §7.2 Batches, §7.3 Schedule |
| Enrollment | enrollments, attendance | §5.1, §6.2, §7.2, §7.4 |
| Assessment | exams, grades, certificates | §7.5, §7.7 |
| Affiliation | affiliation_bodies, govt_exam_fees, govt_exam_events, govt_exam_registrations | §10.5, §7.6 |
| Finance | invoices, invoice_lines, installments, payments, payment_allocations, discounts, refunds | §8 Finance |
| CRM | leads, lead_activities | §5 Admissions |
| Platform | audit_logs | §10.6 Audit Log |

> Not surfaced (out of scope by design): `platform.notifications` (communications/automation) and
> any reporting/analytics aggregation.
