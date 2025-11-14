# Shining Smiles Admin

**Overview**
- Admin application for Shining Smiles with a Next.js frontend and a Django REST backend.
- Provides management for students, payments, reports, and notifications.
- API is documented via Swagger at `http://localhost:8000/api/docs/`.
- Frontend scaffold includes offline-ready payment queue, PDF statements, and a role-based dashboard.

**Tech Stack**
- Frontend: `Next.js` (App Router + legacy Pages for non-root routes), `React`, `TailwindCSS`.
- Backend: `Django` + `Django REST Framework`, `drf-yasg` for Swagger docs.

**API Root Confirmation**
```json
{
  "students": "/api/v1/students/",
  "payments": "/api/v1/payments/",
  "reports": "/api/v1/reports/",
  "notifications": "/api/v1/notifications/",
  "swagger": "/api/docs/"
}
```
These endpoints are reachable and working.

**Getting Started**
- Backend
  - Create and activate a Python virtualenv.
  - Install deps: `pip install -r backend/requirements.txt`.
  - Run server: `python manage.py runserver` (from `backend` if using a standard Django layout).
- Frontend
  - Install deps: `npm install` (from `frontend`).
  - Development: `npm run dev` then open `http://localhost:3000`.
  - Production build: `npm run build` and start: `npm start`.

**Testing the API**
- Swagger UI: open `http://localhost:8000/api/docs/` and test endpoints.
- Postman: create a collection targeting `http://localhost:8000/api/v1/` and invoke the same endpoints.
- Ensure responses match expected shapes used by the frontend pages (see mapping below).

**Frontend Pages → API Mapping**
- Students
  - Page: `/students` → `GET /api/v1/students/` returns `[{ id, name }]`.
  - Page: `/students/[id]` → `GET /api/v1/students/{id}/` returns `{ id, name, transactions: [{ description, Payments, Fees_Levies }] }`.
  - PDF: statement generated client-side.
- Payments
  - Page: `/payments` → `GET /api/v1/payments/` returns `[{ id, studentId, amount, feeType, date }]`.
  - Page: `/payments/offline` → adds to local offline queue and `POST /api/v1/payments/` on flush.
- Reports
  - Page: `/statements/[id]` → `GET /api/v1/reports/{id}/` and generate PDF.
- Notifications
  - Page: `/notifications` → `GET /api/v1/notifications/` returns `[{ id, title, body, created_at }]`.

**Role-based Dashboard**
- Root: `/` displays links to key sections.
- Role read from `localStorage.userRole` (`admin`, `staff`, `viewer`).
- Set role for testing: in browser console run `localStorage.setItem('userRole','admin')` and refresh.

**Project Structure**
- `backend/` — Django project and API.
- `frontend/` — Next.js app (`app/` for the root, `pages/` for other routes).
- `README.md` — Project overview and quick start.
- `PROJECT_RULES.md` — Working API root confirmation and conventions.

**Notes**
- Root path `/` is served via `frontend/src/app/page.tsx`.
- Pages routes (e.g., `/students`, `/payments`) live under `frontend/src/pages/` without conflicting with `/`.
- Offline queue uses browser `localStorage` and only initializes on the client to avoid SSR errors.

**API Usage Guide**
- Base URL: `http://localhost:8000/api/v1/`
- Swagger docs: `http://localhost:8000/api/docs/`
- Auth & cookies:
  - Frontend requests include cookies via `withCredentials` in `frontend/src/lib/api.ts:1`.
  - If CSRF is enforced, add the CSRF header from your cookie to requests that mutate state.
- Examples (curl):
  - List students: `curl -s http://localhost:8000/api/v1/students/`
  - Get a student: `curl -s http://localhost:8000/api/v1/students/1/`
  - List payments: `curl -s http://localhost:8000/api/v1/payments/`
  - Create payment:
    ```bash
    curl -X POST http://localhost:8000/api/v1/payments/ \
      -H 'Content-Type: application/json' \
      --data '{"studentId":1,"amount":100,"feeType":"Tuition","date":"2025-11-13"}'
    ```
  - Student report: `curl -s http://localhost:8000/api/v1/reports/1/`
  - Notifications: `curl -s http://localhost:8000/api/v1/notifications/`
- Expected response shapes used by the frontend:
  - Students list: `[{ id, name }]`
  - Student detail: `{ id, name, transactions: [{ description, Payments, Fees_Levies }] }`
  - Payments list: `[{ id, studentId, amount, feeType, date }]`
  - Report detail: `{ id, name, transactions: [...] }`
  - Notifications list: `[{ id, title, body, created_at }]`

**Frontend Usage Guide**
- Run: `cd frontend && npm install && npm run dev` → open `http://localhost:3000`.
- Pages and data:
  - `/students` fetches `GET /students/` and links to profiles (`frontend/src/pages/students/index.tsx:1`).
  - `/students/[id]` fetches `GET /students/{id}/` and generates PDFs (`frontend/src/pages/students/[id].tsx:1`, `frontend/src/lib/pdf.ts:1`).
  - `/payments` fetches `GET /payments/` (`frontend/src/pages/payments/index.tsx:1`).
  - `/payments/offline` queues locally and flushes to `POST /payments/` (`frontend/src/pages/payments/offline.tsx:1`, `frontend/src/lib/offlineQueue.ts:1`).
  - `/statements/[id]` fetches `GET /reports/{id}/` and downloads a PDF (`frontend/src/pages/statements/[id].tsx:1`).
  - `/notifications` fetches `GET /notifications/` (`frontend/src/pages/notifications/index.tsx:1`).
- Dashboard and roles:
  - `/` shows quick links; role controls visibility (`frontend/src/app/page.tsx:1`).
  - Set test role: `localStorage.setItem('userRole','admin')`.
- Configuration:
  - API client lives in `frontend/src/lib/api.ts:1` with base URL `http://localhost:8000/api/v1/` and `withCredentials` enabled.
  - If you want to externalize the base URL, we can add `NEXT_PUBLIC_API_BASE_URL` support.
- PDFs:
  - Generated via `jspdf` in `frontend/src/lib/pdf.ts:1` and triggered from student pages.
- Offline queue:
  - Stored in `localStorage`, initialized in `useEffect` to avoid SSR errors.

## 📘 Project Documentation
- [Roadmap](./docs/ROADMAP.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [GitHub Board Tasks](./docs/PROJECT-BOARD.md)
