# Project Rules

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

**Status**
- These endpoints are reachable and working.

**Routing**
- Do not overlap paths between App Router (`frontend/src/app`) and Pages Router (`frontend/src/pages`).
- Use App Router for the root page `/` and keep Pages Router for non-root routes.

**Frontend–API Mapping**
- `/students` → `GET /api/v1/students/` returns `[{ id, name }]`.
- `/students/[id]` → `GET /api/v1/students/{id}/` returns `{ id, name, transactions: [{ description, Payments, Fees_Levies }] }`.
- `/payments` → `GET /api/v1/payments/` returns `[{ id, studentId, amount, feeType, date }]`.
- `/payments/offline` → queues in browser then `POST /api/v1/payments/` on flush.
- `/statements/[id]` → `GET /api/v1/reports/{id}/` and generate PDF.
- `/notifications` → `GET /api/v1/notifications/`.

**Client-only Code**
- Access to `localStorage` must be client-only; initialize state in `useEffect` to avoid SSR/pre-render errors.

**API Client**
- Centralize HTTP in `frontend/src/lib/api.ts` with `baseURL` `http://localhost:8000/api/v1/` and `withCredentials` when session cookies are needed.
