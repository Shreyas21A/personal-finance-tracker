# Personal Finance Tracker

A full-stack MERN application to track income, expenses, and budgets with a modern, responsive Material-UI interface. Visualize spending patterns with interactive charts and manage finances with a professional, user-friendly dashboard.


## Features

- **User Authentication**: Secure register, login, and logout with JWT-based authentication and automatic redirects for unauthorized access.
- **Transaction Management**: Full CRUD operations for transactions (amount, type, date, category, description) with real-time validation.
- **Budgeting**: Set and track monthly budgets per category with visual progress bars and overspending alerts.
- **Category Management**: Create and manage user-specific expense categories on a dedicated page.
- **Interactive Dashboard**: 
  - Pie chart for spending by category with click-to-filter transactions.
  - Line chart for monthly expense trends.
  - Summary cards for total income, expenses, and balance with dynamic color coding.
  - Tabbed navigation for analytics and transaction management.
- **Transaction List**: Sort by date, amount, or category, filter by type (income/expense) or category, and export to CSV.
- **UI/UX Enhancements**:
  - Custom teal/orange Material-UI theme with Roboto typography.
  - Framer Motion animations for smooth transitions and card loading.
  - Responsive design with mobile-friendly navigation drawer.
  - Accessibility with ARIA labels and keyboard navigation.
- **Performance & Security**:
  - Optimized Webpack configuration to eliminate console warnings.
  - Secure MongoDB queries with `mongo-sanitize` and input validation via `joi`.
  - Efficient MongoDB indexes for faster queries.

## Tech Stack

| Component       | Technologies                                      |
|-----------------|--------------------------------------------------|
| **Frontend**    | React, Material-UI, Chart.js, react-hook-form, framer-motion, react-router-dom, react-datepicker, axios |
| **Backend**     | Node.js, Express.js, MongoDB, Joi, mongo-sanitize |
| **Auth**        | JWT, bcrypt                                      |
| **Version Control** | Git, GitHub                                  |



## Setup (Local)

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Steps
1. **Clone Repository**:
   ```bash
   git clone https://github.com/Shreyas21A/personal-finance-tracker.git
   cd personal-finance-tracker
   ```

2. **Backend Setup**:
   - Navigate to the backend directory:
     ```bash
     cd backend
     npm install
     ```
   - Create a `.env` file:
     ```bash
     PORT=5000
     MONGO_URI=mongodb://localhost:27017/finance-tracker
     JWT_SECRET=mysecretkey2025
     ```
   - Start MongoDB (`mongod --dbpath C:\data\db`) and the backend:
     ```bash
     node server.js
     ```

3. **Frontend Setup**:
   - Navigate to the frontend directory:
     ```bash
     cd frontend
     npm install
     ```
   - Create a `.env` file:
     ```bash
     SKIP_PREFLIGHT_CHECK=true
     GENERATE_SOURCEMAP=false
     REACT_APP_API_URL=http://localhost:5000
     ```
   - Start the frontend:
     ```bash
     npm start
     ```

4. **Access the App**:
   - Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

| Method | Endpoint                           | Description                              | Auth Required |
|--------|------------------------------------|------------------------------------------|---------------|
| POST   | `/api/auth/register`              | Register a user (name, email, password) | No            |
| POST   | `/api/auth/login`                 | Login and get JWT token                 | No            |
| GET    | `/api/auth/validate`              | Validate JWT token                      | Yes           |
| POST   | `/api/transactions`               | Create a transaction                    | Yes           |
| GET    | `/api/transactions`               | Get user transactions                   | Yes           |
| PUT    | `/api/transactions/:id`           | Update a transaction                    | Yes           |
| DELETE | `/api/transactions/:id`           | Delete a transaction                    | Yes           |
| GET    | `/api/transactions/by-category`   | Get spending by category                | Yes           |
| GET    | `/api/transactions/summary`       | Get total income, expenses, balance     | Yes           |
| GET    | `/api/transactions/trends`        | Get monthly expense trends              | Yes           |
| GET    | `/api/transactions/export`        | Export transactions as CSV              | Yes           |
| POST   | `/api/budgets`                    | Create a budget                         | Yes           |
| GET    | `/api/budgets`                    | Get budgets with spending               | Yes           |
| GET    | `/api/categories`                 | Get user categories                     | Yes           |
| POST   | `/api/categories`                 | Create a category                       | Yes           |
| DELETE | `/api/categories/:id`             | Delete a category                       | Yes           |

## Git Workflow

- Used feature branches (`feature/auth`, `feature/transactions`, `feature/dashboard`, `feature/budgets`, `feature/categories`, `feature/ui-enhancements`) for modular development.
- Maintained a clean commit history with descriptive messages for resume-worthiness.
- Resolved merge conflicts systematically during branch integration.
- Optimized UI/UX with tabs, interactive charts, and budget tracking for a professional look.

## Planned Improvements
- Budget editing functionality (in progress).
- Multi-currency support for global usability.
- Unit tests with Jest and React Testing Library for robustness.
