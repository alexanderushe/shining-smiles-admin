# Authentication API Reference

## Overview
Authentication endpoints for user login, logout, and password management in the multi-tenant school management system.

All authentication uses **token-based auth**. After login, include the token in subsequent requests:
```
Authorization: Token YOUR_TOKEN_HERE
```

---

## Endpoints

### 1. Login
Get authentication token and user information.

**Endpoint:** `POST /api/v1/auth/login/`

**Authentication:** None required

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "token": "9944b09199c62bcf9418ad84e6a3214c5b9e7c6b",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@shiningsmiles.co.zw",
    "full_name": "Admin User",
    "role": "admin",
    "school": {
      "id": 1,
      "name": "Shining Smiles",
      "code": "SS001"
    }
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "non_field_errors": ["Unable to log in with provided credentials."]
}
```

---

### 2. Get Current User
Get currently authenticated user's profile.

**Endpoint:** `GET /api/v1/auth/me/`

**Authentication:** Required (Token)

**Headers:**
```
Authorization: Token YOUR_TOKEN_HERE
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@shiningsmiles.co.zw",
  "full_name": "Admin User",
  "first_name": "Admin",
  "last_name": "User",
  "role": "admin",
  "school": {
    "id": 1,
    "name": "Shining Smiles",
    "code": "SS001",
    "is_active": true
  }
}
```

---

### 3. Logout
Invalidate user's authentication token.

**Endpoint:** `POST /api/v1/auth/logout/`

**Authentication:** Required (Token)

**Headers:**
```
Authorization: Token YOUR_TOKEN_HERE
```

**Response (200 OK):**
```json
{
  "detail": "Successfully logged out"
}
```

**Notes:**
- Deletes the user's auth token from the database
- After logout, the token can no longer be used
- User must login again to get a new token

---

### 4. Password Reset Request
Request a password reset token (for forgot password flow).

**Endpoint:** `POST /api/v1/auth/password-reset/`

**Authentication:** None required

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "detail": "Password reset link sent to email",
  "uid": "MQ",
  "token": "c5u3jr-4f8e0a2b1c3d4e5f6a7b8c9d0e1f2",
  "message": "In production, this would be sent via email"
}
```

**Notes:**
- In development, returns the `uid` and `token` for testing
- In production, these would be sent via email only
- Always returns success even if email doesn't exist (security best practice)
- Token is valid for 24 hours

---

### 5. Password Reset Confirm
Confirm password reset with token and set new password.

**Endpoint:** `POST /api/v1/auth/password-reset/confirm/`

**Authentication:** None required

**Request Body:**
```json
{
  "uid": "MQ",
  "token": "c5u3jr-4f8e0a2b1c3d4e5f6a7b8c9d0e1f2",
  "new_password": "new_secure_password"
}
```

**Response (200 OK):**
```json
{
  "detail": "Password successfully reset"
}
```

**Error Response (400 Bad Request):**
```json
{
  "detail": "Invalid or expired token"
}
```

**Notes:**
- Token expires after 24 hours
- After reset, user can login with new password
- Old password is no longer valid

---

## Example Usage

### Login Flow
```bash
# 1. Login
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Response includes token
# {"token": "abc123...", "user": {...}}

# 2. Use token for authenticated requests
curl -X GET http://localhost:8000/api/v1/auth/me/ \
  -H "Authorization: Token abc123..."

# 3. Logout
curl -X POST http://localhost:8000/api/v1/auth/logout/ \
  -H "Authorization: Token abc123..."
```

### Password Reset Flow
```bash
# 1. Request reset
curl -X POST http://localhost:8000/api/v1/auth/password-reset/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'

# Response includes uid and token (dev only)
# {"uid": "MQ", "token": "c5u3jr-...", ...}

# 2. Confirm reset with new password
curl -X POST http://localhost:8000/api/v1/auth/password-reset/confirm/ \
  -H "Content-Type: application/json" \
  -d '{
    "uid": "MQ",
    "token": "c5u3jr-...",
    "new_password": "my_new_password"
  }'

# 3. Login with new password
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "my_new_password"}'
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (invalid credentials, missing fields) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (valid token, insufficient permissions) |

---

## Multi-Tenant Context

After login, users are automatically scoped to their school:
- All API requests filter data by the user's school
- Users can only see/modify data from their own school
- School context is determined from the user's profile

See [API_REFERENCE.md](./API_REFERENCE.md) for details on multi-tenant data filtering.
