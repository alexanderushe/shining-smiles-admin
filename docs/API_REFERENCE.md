# Functional API Inventory

Based on code inspection of `urls.py` and `views.py` files, the following APIs are functional.

## Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login/` | Obtain auth token |
| `GET` | `/api/v1/auth/me/` | Get current user details |

## Students
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET`, `POST`, `PUT`, `DELETE` | `/api/v1/students/` | CRUD for Students |
| `GET`, `POST`, `PUT`, `DELETE` | `/api/v1/students/campuses/` | CRUD for Campuses |

## Payments
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET`, `POST`, `PUT`, `PATCH` | `/api/v1/payments/` | CRUD for Payments. DELETE is restricted for 'posted' payments. |

## Reports
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/reports/<id>/` | Get payment summary for a specific student |
| `GET` | `/api/v1/reports/cashier-daily/` | Daily report for a cashier (requires `date`, `cashier_id`) |
| `GET` | `/api/v1/reports/term-summary/` | Term summary (requires `term`, `year`) |
| `GET` | `/api/v1/reports/student-balance/` | Student balance (requires `student_id`) |
| `GET`, `POST` | `/api/v1/reports/reconciliation/` | Get or Create reconciliation records |

## Notifications
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/notifications/` | List notifications (recent first) |

## Documentation
- Swagger UI: `/api/docs/`
- ReDoc: `/api/redoc/`
- OpenAPI JSON: `/api/openapi/`
