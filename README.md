# VividInvoice

A modern, full-stack invoice management system built with React, TypeScript, Node.js, Express, and MongoDB.

![VividInvoice Logo](/frontend/public/logo192.png)

## Features

- **User Authentication**
  - Secure login and registration
  - JWT-based authentication
  - Protected routes

- **Client Management**
  - Add, view, edit, and delete clients
  - Client details and history

- **Invoice Management**
  - Create and manage invoices
  - Invoice status tracking
  - PDF generation
  - Email notifications

- **Dashboard**
  - Overview of key metrics
  - Recent activity
  - Quick actions

## Tech Stack

- **Frontend**
  - React 18
  - TypeScript
  - Redux Toolkit
  - React Router
  - Ant Design
  - Axios

- **Backend**
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - JWT Authentication
  - Express Validator

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or cloud instance)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/ZolileN/vividinvoice.git
cd vividinvoice
```

### 2. Set up the Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
npm run dev
```

### 3. Set up the Frontend

```bash
cd ../frontend
cp .env.example .env
# Edit .env with your backend API URL
npm install
npm start
```

### 4. Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

### Backend (`.env` in `/backend`)

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Frontend (`.env` in `/frontend`)

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Available Scripts

### Backend

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

### Frontend

- `npm start` - Start development server
- `npm test` - Launch test runner
- `npm run build` - Build for production

## Project Structure

```
vividinvoice/
├── backend/               # Backend server code
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── server.js         # Entry point
├── frontend/             # Frontend React app
│   ├── public/           # Static files
│   └── src/              # Source code
│       ├── components/   # Reusable components
│       ├── features/     # Feature modules
│       ├── store/        # Redux store
│       └── App.tsx       # Main component
└── README.md             # This file
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Express](https://expressjs.com/)
- [Node.js](https://nodejs.org/)
