# Legacy Wallet Backend API

Backend server for Legacy Wallet with user registration and authentication.

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create .env file:**
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

3. **Initialize database:**
   ```bash
   node migrations/initDatabase.js
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:3001`

## API Endpoints

### Register User
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "mobile": "1234567890",
    "password": "password123",
    "confirm_password": "password123",
    "address1": "123 Main St",
    "address2": "Apt 4B",
    "age": 30,
    "gender": "male",
    "state": "California",
    "postal_code": "12345"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Account created successfully",
    "data": {
      "user": { ... },
      "token": "jwt_token_here"
    }
  }
  ```

### Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "user": { ... },
      "token": "jwt_token_here"
    }
  }
  ```

### Health Check
- **GET** `/health`

### Test Database Connection
- **GET** `/api/test-db`

## Database Schema

### Users Table
- `id` (SERIAL PRIMARY KEY)
- `username` (VARCHAR, UNIQUE)
- `email` (VARCHAR, UNIQUE)
- `mobile` (VARCHAR)
- `password` (VARCHAR, hashed)
- `address1` (VARCHAR)
- `address2` (VARCHAR)
- `age` (INTEGER)
- `gender` (VARCHAR)
- `state` (VARCHAR)
- `postal_code` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
