Phase 2.1 — Authentication & Role-Based Access

 Backend: Add /auth/login/, /auth/logout/, /auth/user/

 Backend: Add Role field to User model

 Backend: Return role in login response

 Frontend: Auth context provider (store token)

 Frontend: Protect pages based on roles

 Frontend: Login form + error handling

 Add route guards (redirect if not authenticated)

 Add “Set role” admin screen

Phase 2.2 — Students Module

 Students list page with filtering + pagination

 Student profile page

 Student CRUD (add/edit/delete)

 Outstanding balance computation

 PDF statement export

 UI enhancements (search, sort, table polish)

Phase 2.3 — Payments Module

 Payments list UI

 Payment form with validation

 Receipt PDF generation

 Sync offline payments (full workflow)

 Offline status detection

 Clear UI for failed sync

Phase 2.4 — Reports & Analytics

 Daily summary report endpoint

 Cashier report endpoint

 Term fees collection report

 Campus-level summary

 PDF/CSV export options

 Admin UI for report filters

Phase 2.5 — Notifications

 In-app Notifications Center

 Mark-as-read

 Auto notifications (payment posted)

 Global toast notifications UI

 Background sync warnings

Phase 2.6 — Deployment

 Dockerfile optimization

 Nginx reverse proxy setup

 HTTPS via Let’s Encrypt

 Production DB setup

 CI/CD (GitHub actions workflow)

Phase 2.7 — QA

 Cypress test suite

 Unit tests for components

 DRF API test coverage

 Load tests (Locust)

 UAT with staff