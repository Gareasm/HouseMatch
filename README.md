# House Match

A house music recommendation platform with a modern dark theme and purple accents.

## Overview

House Match is a full-stack web application designed to help users discover and match with house music tracks. The platform features user authentication, song management, and a voting system for tracks.

## Features

- User authentication (register, login, logout)
- Song discovery and voting system
- Role-based access (admin/member)
- Responsive React frontend
- RESTful API backend
- MongoDB database integration
- JWT-based authentication

## Tech Stack

### Frontend
- **React** 
- **React DOM** 
- **React Scripts** 

### Backend
- **Node.js** 
- **Express** 
- **MongoDB**  
- **Mongoose** 
- **JWT** (jsonwebtoken 9.0.3) - Authentication tokens



## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas connection)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Gareasm/HouseMatch.git
cd HouseMatch
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Configure environment variables:
Create a `.env` file in the `backend` directory:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

### Running the Project

**Backend (from backend directory):**
```bash
npm run dev    # Development mode with nodemon
npm start      # Production mode
```
Server runs on `http://localhost:5000`

**Frontend (from frontend directory):**
```bash
npm start      # Development server
```
App runs on `http://localhost:3000`

## Project Structure

```
HouseMatch/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection configuration
│   ├── models/
│   │   ├── User.js            # User schema (username, email, password, role)
│   │   └── Song.js            # Song schema (title, artist, soundcloudUrl, votes)
│   ├── routes/
│   │   └── auth.js            # Authentication routes (register, login, logout)
│   ├── server.js              # Express app entry point
│   ├── package.json           # Backend dependencies
│   └── .env                   # Environment variables (not in repo)
├── frontend/
│   ├── public/
│   │   └── index.html         # HTML template
│   ├── src/
│   │   ├── App.js             # Main React component
│   │   ├── App.css            # App styles
│   │   ├── index.js           # React entry point
│   │   └── index.css          # Global styles
│   └── package.json           # Frontend dependencies
└── README.md
```

## API Endpoints

### Authentication (`/auth`)
- `POST /auth/register` - Register new user
  - Body: `{ username, email, password }`
- `POST /auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: `{ token, role, username }`
- `POST /auth/logout` - Logout user

### Health Check
- `GET /health` - Server health status

## Data Models

### User
- `username` (String, required, unique)
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `role` (String, enum: ["admin", "member"], default: "member")
- `timestamps` (createdAt, updatedAt)

### Song
- `title` (String, required)
- `artist` (String, required)
- `soundcloudUrl` (String, required)
- `likes` (Number, default: 0)
- `dislikes` (Number, default: 0)
- `totalVotes` (Number, default: 0)
- `timestamps` (createdAt, updatedAt)

