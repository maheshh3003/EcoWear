# MongoDB Integration TODO

## Setup Tasks

- [x] Install required dependencies (express, mongoose, dotenv, cors, etc.)
- [x] Create .env file with MongoDB connection string and port configuration
- [x] Create .gitignore to exclude .env and node_modules
- [x] Set up Express server on port 8000
- [x] Configure MongoDB connection with Mongoose
- [x] Test MongoDB connection

## Database Schema Design

- [x] Define User schema (with buyer/seller support)
- [x] Define Cart schema
- [x] Define Order schema

## API Routes

- [x] User routes (signup, login, profile)
- [x] Cart routes (add, remove, update, view, clear)
- [x] Order routes (create, get user orders, get all orders, get seller orders, update status)
- [x] Admin routes (get pending sellers, get all sellers, verify seller, reject seller, get stats)

## Features Implemented

- [x] Cart persists in MongoDB for logged-in users
- [x] Orders stored in MongoDB with shipping address
- [x] Seller signup stores in MongoDB with 'pending' status
- [x] Pending sellers cannot login
- [x] Admin can verify/reject sellers from dashboard
- [x] Seller dashboard shows orders for their products
- [x] Admin dashboard shows all orders with customer details
- [x] Admin sees seller order counts and statistics

## Test Accounts

- Admin: admin@gmail.com / admin@gmail.com
- Seller: seller@gmail.com / seller@gmail.com (create via signup, then verify in admin panel)

## Notes

- Backend runs on port 8000
- Frontend runs on port 5173
- Using MongoDB Compass for database management
- Environment variables for sensitive data
