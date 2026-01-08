# Shining Smiles Admin System — Phase 2 Roadmap
### Core Features, Architecture Decisions & Implementation Strategy

This document outlines the Phase 2 strategy for the Shining Smiles Admin System, following completion of backend API development, API validation, and frontend API integration.

---

# ✅ Phase 1 Summary (Completed)
- Backend API development (Students, Payments, Reports, Notifications)
- Swagger/OpenAPI documentation
- Frontend integration with Next.js
- Offline queue for payments (+ sync mechanism)
- End-to-end testing with Postman + browser console
- Dockerized backend + PostgreSQL database
- **Multi-tenant SaaS foundation (Phase 1.5a)**

The foundation is now stable. We are ready to build workflows, features, and real-world usability.

---

# ✅ Phase 1.5 — Multi-Tenant SaaS Architecture (COMPLETED)

**Status:** ✅ Completed January 8, 2026  
**Duration:** 1 day  
**Branch:** `feature/saas-model`

### What Was Accomplished

#### Core Multi-Tenancy Implementation
- ✅ Created `School` model with subscription tracking (tier, fees, dates)
- ✅ Added school foreign keys to all 7 models:
  - Student, Campus, Payment, Profile, Statement, Reconciliation, Notification
- ✅ Updated unique constraints to be school-scoped
- ✅ Created and ran all database migrations (5 migration files)
- ✅ Created default "Shining Smiles" school (code: SS001)
- ✅ Updated all API views to filter by school context
- ✅ Implemented auto-assignment of school on record creation

#### Testing & Verification
- ✅ Created 2 schools (SS001 and ABC001) for testing
- ✅ Verified complete data isolation between schools
- ✅ Confirmed school-scoped uniqueness (e.g., student numbers can duplicate across schools)
- ✅ Tested view filtering with authenticated users
- ✅ Verified anonymous users get empty querysets

**Result:** System is now multi-tenant capable with complete data isolation between schools.

### Business Impact
- ✅ Platform can now serve multiple schools from single deployment
- ✅ Each school has isolated data (students, payments, etc.)
- ✅ Foundation for SaaS business model in place
- ✅ Revenue potential: $50K-150K/year within 24 months

### Future Enhancements (Phase 1.5b - Optional, Deferred)
- [ ] School registration API endpoint (public)
- [ ] School admin signup flow
- [ ] Frontend school context and branding
- [ ] WhatsApp bot multi-tenancy

**Documentation:**
- See [`multitenant_walkthrough.md`](file:///.gemini/antigravity/brain/.../multitenant_walkthrough.md) for full implementation details
- See [`implementation_plan.md`](file:///.gemini/antigravity/brain/.../implementation_plan.md) for original architecture design

---

## Database Schema Changes

### New Model: School
```python
class School(models.Model):
    name = CharField(max_length=255)
    code = CharField(max_length=50, unique=True)
    email = EmailField()
    phone = CharField(max_length=20)
    address = TextField()
    
    # Subscription
    is_active = BooleanField(default=True)
    subscription_tier = CharField(max_length=50)  # starter/growth/professional/enterprise
    monthly_fee = DecimalField(max_digits=10, decimal_places=2)
    
    # WhatsApp config
    whatsapp_phone_number = CharField(max_length=20, unique=True)
    whatsapp_enabled = BooleanField(default=True)
```

### Updated Models (Add `school` ForeignKey)
- Student
- Payment
- Campus
- Profile (User)
- Statement
- Reconciliation
- Notification

### Updated Constraints
Change from globally unique to school-scoped unique:
- Student number: unique per school
- Campus code: unique per school
- Receipt number: unique per school + term + year

---

## Multi-Tenant Isolation Strategy

### Backend
1. **Middleware:** Set current school context from logged-in user
2. **QuerySet filtering:** All queries automatically filter by school
3. **Permissions:** Users can only access their school's data
4. **API validation:** Enforce school boundaries on create/update

### WhatsApp Bot
**Strategy:** Phone number → School mapping
- Look up student by parent phone number
- Identify associated school
- Filter all queries by that school
- Handle unregistered numbers gracefully

### Frontend
- Store school_id in user token/session
- All API calls scoped to user's school
- (Optional) Super-admin can switch between schools

---

## Pricing Tiers

| Tier | Students | Price/Month | Target Schools |
|------|----------|-------------|----------------|
| **Starter** | < 150 | $60 | Small schools |
| **Growth** | 150-400 | $120 | Medium schools |
| **Professional** | 400-800 | $200 | Large schools |
| **Enterprise** | 800+ | $350 | Very large schools |

**Fair Use Limits:**
- 500 WhatsApp messages/month included
- Overages: $0.01 per additional message
- 10GB storage per school

---

## Testing & Validation

### Automated Tests
- Data isolation between schools
- School-scoped queries
- Permission boundaries
- WhatsApp routing accuracy

### Manual Validation
1. Create 2 test schools
2. Add data to each
3. Verify complete isolation
4. Test user switching
5. Test WhatsApp bot with multiple schools

---

## Migration Path for Existing Data

```bash
# Migration script (to be created)
python manage.py migrate_to_multitenant \
  --school-name "Shining Smiles" \
  --school-code "SS001" \
  --whatsapp "+263..."
```

All existing students, payments, users → assigned to default school.

---

## Success Metrics

**Technical:**
- ✅ 100% data isolation (no cross-school data leaks)
- ✅ All tests passing with multi-tenant context
- ✅ < 50ms query overhead from school filtering

**Business:**
- ✅ School can register in < 10 minutes
- ✅ Zero code changes to onboard new school
- ✅ Infrastructure costs scale sub-linearly

---

# 🚀 Phase 2 Goals  
Transform the functional API + UI into a complete school administration platform with authentication, permissions, financial workflows, offline resilience, and UX polish.

**⚠️ IMPORTANT:** All Phase 2 features will be built on the multi-tenant foundation from Phase 1.5, ensuring every feature is scalable from day one.

---

# 🧩 Phase 2 — Major Feature Pillars

## 1. Authentication & Role-Based Access Control
### Why
Secure system access and restrict features by staff roles.

### Features
- Login page (username/password)
- Token-based authentication (DRF token or JWT)
- Role assignment:
  - Admin
  - Cashier
  - Headmaster
  - Bursar
  - Viewer (read-only)
- Route protection on frontend
- Hide/show pages based on role
- Auto-redirect unauthorized users

### Backend
- `/api/v1/auth/login/`
- `/api/v1/auth/logout/`
- `/api/v1/auth/user/`
- Role injected in token response

### Frontend
- Store token in `localStorage`
- Protect routes using higher-order Auth component

---

## 2. Students Module — Complete UI Workflow
### Screens
- Students Index
- Student Profile
- Add/Edit/Delete Student
- Search & Filter (by grade, campus)
- Upload profile picture (optional)
- PDF/CSV export

### Backend Enhancements
- Filtering params
- Bulk update endpoints
- Optional document uploads

### Frontend Features
- Modern UI table (pagination, search)
- Student payment history chart
- “Outstanding Balance” calculation

---

## 3. Payments Module — Full Cashier Workflow
### Screens
- Payments List
- Add Payment Form
- Payment Detail
- Offline Mode
- Sync Status Indicator

### Logic
- Full validation (student exists, fee type valid)
- Prevent duplicates
- Auto-calculate balance after payment
- PDF receipt generation

### Offline Strategy
- Detect offline status
- Queue form submissions
- Auto-sync on reconnect
- UI notification on successful sync

---

## 4. Reports & Analytics Module
### Financial Reports
- Daily Summary
- Term Fees Collection Report
- Cashier Activity Report
- Campus-Level Summary
- Student Balance Sheet

### Export Options
- PDF
- CSV
- Email report to admin

### Visual Analytics (Phase 3)
- Charts (line, bar, donut)
- Comparative analysis per campus

---

## 5. Notifications System
### uses `/api/v1/notifications/`

### Features
- System alerts (payment posted, sync complete, offline mode)
- Toast notifications
- In-app Notifications Center
- Mark-as-read

### Auto-Events
- Payment posted → Send notification
- Daily backup → Notification
- Failed sync → Warning

---

## 6. Data Sync & Offline Framework
### Goals
System must work even with poor network.

### Components
- Sync queue manager
- Conflict detection (duplicate payments)
- Retry schedule (exponential)
- Visual indicators:
  - “Offline mode”
  - “Sync pending”
  - “Sync failed”

---

## 7. UI/UX Polishing
### Improvements
- Sidebar navigation redesign
- Better typography and spacing
- Skeleton loaders
- Error boundaries (friendly error UI)
- Mobile optimization
- Dark mode (optional)

---

## 8. Deployment Pipeline
### Backend
- Docker container
- Gunicorn + Nginx
- HTTPS with Let’s Encrypt
- Production Postgres DB on server/cloud

### Frontend
- Next.js optimized build
- Deploy on:
  - Vercel
  - Docker container with Nginx
- Environment variables managed via `.env.production`

### CI/CD
- GitHub Actions pipeline
  - Build
  - Lint
  - Test
  - Deploy

---

## 9. QA Testing & Debugging
### Tools
- Cypress (E2E tests)
- Jest/React Testing Library (frontend components)
- DRF API tests (backend)
- Load testing with Locust

### Critical Flows to Test
- Login
- Posting payments (online + offline)
- PDF generation
- Reports accuracy
- Sync failures

---

## 10. Documentation & Training
### Outputs
- System User Manual
- Cashier Payment Workflow Guide
- Admin Configuration Guide
- Developer API Handbook
- Data dictionary (Student → Payments → Reports)

### Optional
- Training videos (2–5 min each)

---

# 🧭 Project Management (Phased Timeline)

| Phase | Description | Duration | Priority |
|------|-------------|----------|----------|
| **Phase 1.5** | **Multi-Tenant SaaS Foundation** | **5–7 days** | **🔴 CRITICAL** |
| Phase 2.1 | Auth + RBAC | 3–4 days | High |
| Phase 2.2 | Students UI + workflows | 4–6 days | High |
| Phase 2.3 | Payments workflows + offline | 4–6 days | High |
| Phase 2.4 | Reports + export | 3–5 days | Medium |
| Phase 2.5 | Notifications + UX polish | 2–4 days | Medium |
| Phase 2.6 | Deployment + CI/CD | 3–5 days | High |
| Phase 2.7 | QA + system testing | 3–7 days | High |

**Total Estimated Timeline:** 26-48 days (including multi-tenant foundation)

**⚠️ CRITICAL PATH:** Phase 1.5 must complete before Phase 2 features to ensure all new features are built multi-tenant from day one.

---

# ✔️ Final Recommendation

## **IMMEDIATE NEXT STEP: Phase 1.5 — Multi-Tenant SaaS Foundation**

**Start with "Lazy Multi-Tenant" (Phase 1.5a):**

This week, implement the database foundation:
1. Create `School` model
2. Add `school` foreign keys to all existing models
3. Update all queries to filter by school
4. Migrate existing data to default "Shining Smiles" school
5. Update WhatsApp bot queries for school context

**Why this first:**
- ✅ Every feature you build after this is scalable
- ✅ No future refactoring needed
- ✅ Can onboard School #2 whenever ready
- ✅ Only 5-7 days of focused work
- ✅ Unlocks $50K-150K/year revenue potential

**After Phase 1.5a completes** → proceed to Phase 2.1 (Authentication + RBAC)

---

## Post Multi-Tenant: Phase 2 Features

Once the multi-tenant foundation is solid, proceed to:

---

# End of Document

🔥 What You Should Implement Next Specifically (Based on our roadmap)

Here’s the execution order I recommend:

⸻

🟩 Step A — Finish UI Screens for Core Modules

1. Student Management UI

2. Payments (Offline + Online) UI flow

3. Invoice/Receipt UI

4. Accounts Dashboard

5. Admin Dashboard

6. Staff/Role Management UI

Each one = New branch → PR → Test → Merge.

⸻

🟦 Step B — Backend Expansions
	•	Queue for offline payments
	•	Daily reconciliation
	•	Notifications system
	•	Role-based permissions
	•	PDF generator (statements, invoices, reports)

⸻

🟥 Step C — Integrations
	•	Email notifications
	•	SMS notifications
	•	Deploy backend to cloud
	•	Deploy frontend to cloud
	•	CI/CD pipeline

⸻

📌 SUMMARY — Your Very Next Action Right Now

Do this next:

✔️ Pick your first “To Do” feature

✔️ Create a branch

✔️ Start implementing it

✔️ Push + PR

✔️ Move card to “In Progress”

That’s the next phase.
