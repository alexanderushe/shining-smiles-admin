# Payment API Reference

## Overview
The Payment API provides endpoints for managing student fee payments, including creation, modification, and voiding of payment records.

## Base URL
```
http://localhost:8000/api/v1/
```

## Authentication
All API requests require authentication via Bearer token:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## Endpoints

### List Payments
Retrieve a paginated list of payments with optional filtering and sorting.

**Endpoint**: `GET /api/v1/payments/`

**Query Parameters**:
- `page` (integer): Page number for pagination (default: 1)
- `page_size` (integer): Number of results per page (default: 10)
- `status` (string): Filter by status (`pending`, `posted`, `voided`)
- `ordering` (string): Sort field (prefix with `-` for descending). Examples:
  - `-date` (most recent first)
  - `amount` (lowest first)
  - `-voided_at` (recently voided first)

**Example Request**:
```bash
curl -X GET "http://localhost:8000/api/v1/payments/?status=voided&ordering=-voided_at&page=1&page_size=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response** (200 OK):
```json
{
  "count": 45,
  "next": "http://localhost:8000/api/v1/payments/?page=2",
  "previous": null,
  "results": [
    {
      "id": 123,
      "receipt_number": "RCP-2026-001",
      "student": {
        "id": 1,
        "student_number": "SSC001",
        "first_name": "John",
        "last_name": "Doe"
      },
      "amount": "150.00",
      "payment_method": "Cash",
      "fee_type": "Tuition",
      "status": "posted",
      "date": "2026-01-05",
      "cashier_name": "Jane Smith",
      "term": "1",
      "academic_year": 2026
    }
  ]
}
```

---

### Create Payment
Create a new payment record.

**Endpoint**: `POST /api/v1/payments/`

**Authorization**: Admin or Staff

**Request Body**:
```json
{
  "student": 1,
  "amount": "250.00",
  "payment_method": "Bank Transfer",
  "fee_type": "Transport",
  "bank_name": "Test Bank",
  "reference_id": "REF-12345",
  "cashier_id": 2,
  "term": "2",
  "academic_year": 2026
}
```

**Response** (201 Created):
```json
{
  "id": 124,
  "receipt_number": "RCP-2026-002",
  "student": 1,
  "amount": "250.00",
  "payment_method": "Bank Transfer",
  "fee_type": "Transport",
  "bank_name": "Test Bank",
  "reference_id": "REF-12345",
  "status": "pending",
  "date": "2026-01-05",
  ...
}
```

---

### Update Payment
Update an existing payment record (restricted for posted/voided payments).

**Endpoint**: `PATCH /api/v1/payments/{id}/`

**Authorization**: Admin (or Staff for pending payments)

**Request Body** (partial update):
```json
{
  "amount": "300.00",
  "status": "posted"
}
```

**Response** (200 OK):
Returns updated payment object.

**Business Rules**:
- Voided payments cannot be edited
- Only admins can change status to `posted`
- Regular fields can be updated for `pending` payments

---

### Void Payment
Mark a payment as voided with an audit trail.

**Endpoint**: `POST /api/v1/payments/{id}/void/`

**Authorization**: **Admin only**

**Request Body**:
```json
{
  "void_reason": "Duplicate payment entry - correct receipt is RCP-2026-003"
}
```

**Required Fields**:
- `void_reason` (string, non-empty): Explanation for voiding the payment

**Response** (200 OK):
```json
{
  "id": 123,
  "receipt_number": "RCP-2026-001",
  "student": {
    "id": 1,
    "student_number": "SSC001",
    "first_name": "John",
    "last_name": "Doe"
  },
  "amount": "150.00",
  "payment_method": "Cash",
  "fee_type": "Tuition",
  "status": "voided",
  "date": "2026-01-05",
  "void_reason": "Duplicate payment entry - correct receipt is RCP-2026-003",
  "voided_at": "2026-01-05T14:30:45.123Z",
  "voided_by": "Admin User",
  "cashier_name": "Jane Smith",
  ...
}
```

**Error Responses**:

**400 Bad Request** - Missing or invalid void_reason:
```json
{
  "void_reason": ["This field is required."]
}
```

**400 Bad Request** - Payment already voided:
```json
{
  "detail": "This payment has already been voided."
}
```

**403 Forbidden** - Non-admin user:
```json
{
  "detail": "You do not have permission to void payments."
}
```

**404 Not Found** - Payment doesn't exist:
```json
{
  "detail": "Not found."
}
```

**Business Rules**:
1. **Authorization**: Only users with administrator role can void payments
2. **Void Reason Required**: Must provide a non-empty reason for the void action
3. **No Double Voiding**: Payments already marked as `voided` cannot be voided again
4. **Irreversible**: Void action cannot be undone via API
5. **Audit Trail**: System automatically captures:
   - `voided_at`: Timestamp of void action (UTC)
   - `voided_by`: Full name of user who performed the void
   - `void_reason`: Provided explanation
6. **Status Change**: Payment status changes from `pending` or `posted` to `voided`
7. **Original Data Preserved**: All original payment data remains intact

**Example** (cURL):
```bash
curl -X POST http://localhost:8000/api/v1/payments/123/void/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "void_reason": "Duplicate payment entry - correct receipt is RCP-2026-003"
  }'
```

**Example** (Python):
```python
import requests

url = "http://localhost:8000/api/v1/payments/123/void/"
headers = {
    "Authorization": "Bearer YOUR_TOKEN",
    "Content-Type": "application/json"
}
data = {
    "void_reason": "Duplicate payment entry - correct receipt is RCP-2026-003"
}

response = requests.post(url, headers=headers, json=data)
payment = response.json()

print(f"Payment {payment['receipt_number']} voided by {payment['voided_by']}")
print(f"Reason: {payment['void_reason']}")
```

---

### Delete Payment
Permanently delete a payment record (restricted to pending payments).

**Endpoint**: `DELETE /api/v1/payments/{id}/`

**Authorization**: Admin only

**Business Rules**:
- Only `pending` payments can be deleted
- Posted and voided payments cannot be deleted (use void instead)

**Response** (204 No Content)

---

## Data Models

### Payment Object
```typescript
{
  id: number;
  receipt_number: string;
  student: number | {
    id: number;
    student_number: string;
    first_name: string;
    last_name: string;
  };
  amount: string; // Decimal as string
  payment_method: string; // 'Cash', 'Card', 'Bank Transfer', 'Mobile Money'
  fee_type?: string; // 'Tuition', 'Transport', 'Boarding', 'Registration', 'Other'
  status: 'pending' | 'posted' | 'voided';
  date: string; // ISO date
  cashier_name: string;
  term: '1' | '2' | '3';
  academic_year: number;
  
  // Optional fields for specific payment methods
  bank_name?: string;
  reference_id?: string;
  merchant_provider?: string;
  
  // Void tracking (only present when status='voided')
  void_reason?: string;
  voided_at?: string; // ISO datetime
  voided_by?: string;
}
```

---

## Common Use Cases

### Get All Voided Payments
```bash
GET /api/v1/payments/?status=voided&ordering=-voided_at
```

### Get Payments for Specific Student
```bash
GET /api/v1/payments/?student=1
```

### Get Today's Payments
```bash
GET /api/v1/payments/?date=2026-01-05
```

---

## Error Handling

All API endpoints return standard HTTP status codes:
- `200 OK`: Successful request
- `201 Created`: Resource successfully created
- `204 No Content`: Successful deletion
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource doesn't exist
- `500 Internal Server Error`: Server error

Error responses include a descriptive message:
```json
{
  "detail": "Error description here",
  "field_name": ["Field-specific error"]
}
```
