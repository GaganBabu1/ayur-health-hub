# E-Ayurvedic Backend API Testing Guide

## 1. Test Health Check
**GET** `http://localhost:5000/api/health`

Expected Response (200):
```json
{
  "status": "ok",
  "message": "E-Ayurvedic backend running"
}
```

---

## 2. Register a New User
**POST** `http://localhost:5000/api/auth/register`

Headers:
```
Content-Type: application/json
```

Request Body:
```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "password": "SecurePass123",
  "age": 28,
  "gender": "Female"
}
```

Expected Response (201):
```json
{
  "_id": "67639f1a2c3b4d5e6f7g8h9i",
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "role": "patient",
  "age": 28,
  "gender": "Female",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save the token** - you'll need it for protected routes!

---

## 3. Login with Email & Password
**POST** `http://localhost:5000/api/auth/login`

Headers:
```
Content-Type: application/json
```

Request Body:
```json
{
  "email": "priya@example.com",
  "password": "SecurePass123"
}
```

Expected Response (200):
```json
{
  "_id": "67639f1a2c3b4d5e6f7g8h9i",
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "role": "patient",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Error Test Cases

### Try registering with same email (should fail with 400):
```json
{
  "name": "Another User",
  "email": "priya@example.com",
  "password": "AnotherPass123"
}
```

Response (400):
```json
{
  "error": "Email already registered"
}
```

### Try login with wrong password (should fail with 401):
```json
{
  "email": "priya@example.com",
  "password": "WrongPassword"
}
```

Response (401):
```json
{
  "error": "Invalid email or password"
}
```

---

## Steps in Postman:

1. **Create a new request** → Select GET
2. **Enter URL**: `http://localhost:5000/api/health`
3. **Click Send** → See the health check response ✅

4. **Create new request** → Select POST
5. **Enter URL**: `http://localhost:5000/api/auth/register`
6. **Go to Body tab** → Select "raw" → Select "JSON"
7. **Paste the register request body**
8. **Click Send** → Get token ✅

9. **Create new request** → Select POST
10. **Enter URL**: `http://localhost:5000/api/auth/login`
11. **Paste the login request body in Body tab**
12. **Click Send** → Get token ✅

---

## Check MongoDB in Compass

After registering a user, check **MongoDB Compass**:
- Connect to `mongodb://localhost:27017`
- Look for database: **ayurhealth**
- Look for collection: **users**
- You should see your registered user there!
