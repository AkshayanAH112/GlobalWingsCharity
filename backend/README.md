# Global Wings Charity - Backend API

## 🚀 Server Status: RUNNING

**Base URL:** http://localhost:5000  
**Database:** MongoDB (Connected)  
**Environment:** Development

---

## 📡 Available Endpoints

### Health Check
```
GET /health
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123!"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <your-jwt-token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <your-jwt-token>
```

---

## 🧪 Testing with cURL

### Register a new user:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "student"
  }'
```

### Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

### Get current user (replace TOKEN):
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🗂️ Database Schema

### Collections:
- **users** - User accounts (admin, teacher, student)
- **students** - Student profiles
- **batches** - Class batches
- **subjects** - Course subjects
- **marks** - Student marks and grades

---

## ✅ Implemented Features

- ✅ User registration with validation
- ✅ User login with JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (admin, teacher, student)
- ✅ Protected routes with JWT middleware
- ✅ Error handling middleware
- ✅ Input validation
- ✅ Rate limiting
- ✅ MongoDB connection
- ✅ Security headers (Helmet)
- ✅ CORS configuration

---

## 🔐 Security Features

- JWT token authentication
- Password hashing (bcrypt, 12 rounds)
- Input sanitization
- Rate limiting (100 requests per 15 mins)
- Helmet security headers
- MongoDB injection prevention
- CORS protection

---

## 📊 Response Format

### Success Response:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": { ... }
  }
}
```

---

## 🎯 Next Steps

1. Test authentication endpoints
2. Implement student management API
3. Add batch and subject endpoints
4. Implement marks management
5. Add Excel import/export
6. Build analytics endpoints

---

**Status:** ✅ Backend Phase 1 Complete  
**Last Updated:** February 4, 2026
