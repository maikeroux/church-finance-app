# User Service – API Documentation

This microservice handles user registration, login, JWT-based authentication, and role-based access control (RBAC). It's part of the **FaithFinance** backend microservices project.

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- JWT for authentication
- RESTful API with RBAC (superadmin, admin, viewer)

---

## Authentication Endpoints

### POST `/api/auth/register`

Registers a new user.

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "yourpassword",
  "role": "superadmin" // or "admin", "viewer"
}
```

#### Response
- `201 Created` – `{ "message": "User registered" }`
- `409 Conflict` – `{ "message": "Email already in use" }`
- `500 Internal Server Error` – `{ "error": "Registration failed" }`

---

### POST `/api/auth/login`

Logs in a user and returns a JWT token.

#### Request Body
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

#### Response
- `200 OK` – `{ "token": "JWT_TOKEN" }`
- `401 Unauthorized` – `{ "message": "Invalid credentials" }`
- `500 Internal Server Error` – `{ "error": "Login failed" }`

---

### GET `/api/auth/me`

Returns the authenticated user's information.

#### Headers
```
Authorization: Bearer <JWT_TOKEN>
```

#### Response
- `200 OK` – `{ "_id": "...", "email": "...", "role": "..." }`
- `403 Forbidden` – `{ "message": "Invalid or expired token" }`
- `404 Not Found` – `{ "message": "User not found" }`

---

## User Management Endpoints

### GET `/api/users`

Returns a list of all users.  
 Requires `superadmin` role.

#### Headers
```
Authorization: Bearer <JWT_TOKEN>
```

#### Response
- `200 OK`  
```json
[
  { "_id": "...", "email": "...", "role": "admin" },
  ...
]
```
- `403 Forbidden` – `{ "message": "Forbidden: insufficient role" }`
- `401 Unauthorized` – `{ "message": "Missing or invalid token" }`

---

## Auth Middleware Behavior

- Verifies JWT via `Authorization: Bearer <token>`
- Rejects request if:
  - Token is missing → `401 Unauthorized`
  - Token is invalid or expired → `403 Forbidden`
  - Role is insufficient → `403 Forbidden: insufficient role`

Supported Roles:
- `superadmin`
- `admin`
- `viewer`

---

# Monitoring Service

A REST-based internal service to log audit events such as logins, registration attempts, and finance operations. Built with Node.js, Express, and MongoDB. Secured using JWT for internal service authentication.

---

## Base URL

```
http://monitoring-service:4002/api/logs
```

> Use inside Docker network: `http://monitoring-service:4002/api/logs`

---

## Authentication

All routes require a **Bearer JWT token** signed using the shared `JWT_SECRET`.

### Token Payload (Example)
```json
{
  "id": "userId",           // Required to associate log with user
  "service": "user-service" // Identifies source service
}
```

### Header Example
```
Authorization: Bearer <JWT>
```

---

## Endpoints

### POST `/api/logs`

Create a new audit log entry.

#### Headers
| Key           | Value                |
|----------------|----------------------|
| Authorization  | Bearer `<JWT>`       |
| Content-Type   | application/json     |

#### Request Body
```json
{
  "action": "user_logged_in",
  "service": "user-service",
  "metadata": {
    "email": "admin@example.com"
  }
}
```

> `userId` is automatically extracted from the decoded JWT (`req.user.id`)

#### Response `201 Created`
```json
{
  "_id": "log_id_here",
  "userId": "6874759c06f300cbc60c4adf",
  "action": "user_logged_in",
  "service": "user-service",
  "metadata": {
    "email": "admin@example.com"
  },
  "timestamp": "2025-07-14T03:12:15.123Z",
  "__v": 0
}
```

#### Error Response `401 Unauthorized`
```json
{
  "message": "Unauthorized"
}
```

#### Error Response `500 Internal Server Error`
```json
{
  "message": "Error saving log",
  "error": "ValidationError: userId is required"
}
```

---

## Optional: GET `/api/logs`

> *[Optional - Implement this route if needed]*  
Returns an array of all logs in the system. Useful for admin testing or development.

#### Headers
```
Authorization: Bearer <JWT>
```

#### Response
```json
[
  {
    "_id": "log_id_here",
    "userId": "6874759c06f300cbc60c4adf",
    "action": "user_registered",
    "service": "user-service",
    "metadata": {
      "email": "admin@example.com"
    },
    "timestamp": "2025-07-14T03:12:15.123Z"
  }
]
```

---

## Internal Logging Example (Node.js)

```js
const jwt = require('jsonwebtoken');
const axios = require('axios');

const logEvent = async ({ userId, action, service = 'user-service', metadata = {} }) => {
  const token = jwt.sign({ id: userId, service }, process.env.JWT_SECRET, { expiresIn: '1h' });

  await axios.post('http://monitoring-service:4002/api/logs', {
    userId,
    action,
    service,
    metadata
  }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
```

---

## Tech Stack

- Node.js + Express
- MongoDB (via Mongoose)
- JWT (internal authentication)
- Docker (Compose-ready)
- Jest + Supertest (tests)

---

## Environment Variables

Create a `.env` file with:

```
PORT=4002
MONGO_URI=mongodb://mongo:27017/monitoring
JWT_SECRET=your_jwt_secret
```

---

## Docker Compose Service Block

```yaml
  monitoring-service:
    build: ./monitoring-service
    ports:
      - "4002:4002"
    environment:
      - MONGO_URI=mongodb://mongo:27017/monitoring
      - JWT_SECRET=your_jwt_secret
    depends_on:
      - mongo
```

