# Personal Finance Tracker

A MERN stack application to track income, expenses, and visualize spending by category with a Chart.js dashboard.

## Features
- User authentication (register, login, logout) with JWT.
- CRUD operations for transactions (create, read, update, delete) with amount, type, date, category, and description.
- Category management (create, delete) with user-specific categories.
- Pie chart dashboard showing spending by category.
- Transaction list with sorting (date, amount, category), filtering (income/expense), and highlighting ($100+ transactions).
- Summary section showing total income, expenses, and balance.
- Local MongoDB integration for data storage.

## Tech Stack
- **MongoDB**: Local database for users, transactions, and categories.
- **Express.js**: Backend API.
- **React**: Frontend with Chart.js for visualizations.
- **Node.js**: Backend runtime.
- **JWT**: Authentication.

## Setup (Local)
1. **Clone Repository**:
   ```bash
   git clone https://github.com/Shreyas21A/personal-finance-tracker.git
   cd personal-finance-tracker
   ```
2. **Backend**:
   - Install MongoDB and start `mongod --dbpath C:\data\db`.
   - `cd backend`
   - `npm install`
   - Create `.env`:
     ```
     PORT=5000
     MONGO_URI=mongodb://localhost:27017/finance-tracker
     JWT_SECRET=mysecretkey2025
     ```
   - `node server.js`
3. **Frontend**:
   - `cd frontend`
   - `npm install`
   - `npm start`
4. Access at `http://localhost:3000`.

## API Endpoints
- `POST /api/auth/register`: Register a user (name, email, password).
- `POST /api/auth/login`: Login and get JWT token.
- `POST /api/transactions`: Create a transaction (requires JWT).
- `GET /api/transactions`: Get user transactions (requires JWT).
- `PUT /api/transactions/:id`: Update a transaction (requires JWT).
- `DELETE /api/transactions/:id`: Delete a transaction (requires JWT).
- `GET /api/transactions/by-category`: Get spending by category (requires JWT).
- `GET /api/transactions/summary`: Get total income, expenses, and balance (requires JWT).
- `GET /api/categories`: Get user categories (requires JWT).
- `POST /api/categories`: Create a category (requires JWT).
- `DELETE /api/categories/:id`: Delete a category (requires JWT).
