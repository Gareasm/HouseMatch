# HouseMatch

A swipe-to-vote music curation platform built for college house music fans.

---

## Overview

HouseMatch solves a specific problem: house music fans have no centralized, democratic tool for ranking tracks. Spotify and SoundCloud are algorithmic and passive. HouseMatch puts curation in the hands of the community through a swipe-to-vote mechanic that surfaces the best tracks to the top.

The platform supports two user roles. Members browse the feed, vote on songs, and track the leaderboard. Admins do all of that plus submit songs, delete songs, and manage the catalog through a dedicated dashboard. No audio files are stored. All playback is handled via SoundCloud embeds, keeping the platform copyright-clean.

---

## Features

**Member**
- Register, log in, and log out with JWT-based session management
- Browse a swipe-style song feed with real-time search and filter
- Vote on tracks (like or pass) with scores reflected on the leaderboard instantly
- View a community leaderboard ranked by vote score, paginated at 20 songs per page
- View a personal profile page with submitted songs
- Persistent login across page refreshes via token check on app load
- Automatic logout with confirmation banner when a session token expires mid-use

**Admin**
- All member permissions, plus role-enforced access to admin-only routes
- Submit new songs with duplicate SoundCloud URL prevention
- Delete songs with cascade removal of all associated votes
- Access the admin dashboard for full catalog management

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router DOM 7, Framer Motion |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose 9 |
| Auth | JWT (jsonwebtoken 9.0.3), bcrypt |
| DevOps | GitHub Actions CI, Jira |

---

## Getting Started

### Prerequisites

- Node.js v14 or higher
- MongoDB running locally or a MongoDB Atlas connection string
- npm or yarn

### Installation

1. Clone the repository.

```bash
git clone https://github.com/Gareasm/HouseMatch.git
cd HouseMatch
```

2. Install backend dependencies.

```bash
cd backend
npm install
```

3. Install frontend dependencies.

```bash
cd ../frontend
npm install
```

4. Create a `.env` file inside the `backend` directory using `.env.example` as a reference.

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

5. Seed the database with 100+ house tracks and auto-generated user accounts.

```bash
cd ../backend
node seed.js
```

6. Start the backend server.

```bash
npm run dev
```

Server runs on `http://localhost:5000`.

7. Start the frontend.

```bash
cd ../frontend
npm start
```

App runs on `http://localhost:3000`.

---

## Project Structure

```
HouseMatch/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── middleware/
│   │   └── authMiddleware.js      # protect and admin middleware
│   ├── models/
│   │   ├── User.js                # username, email, hashed password, role
│   │   ├── Song.js                # title, artist, soundcloudUrl, likes, dislikes
│   │   └── Vote.js                # user reference, song reference, vote value
│   ├── routes/
│   │   ├── auth.js                # register, login, logout
│   │   └── songRoutes.js          # all song endpoints including admin DELETE
│   ├── seed.js                    # seeds 100+ songs and auto-generated users
│   └── server.js                  # Express entry point
├── frontend/src/
│   ├── api/
│   │   └── apiFetch.js            # fetch wrapper with 401 redirect on token expiry
│   ├── components/
│   │   ├── AuthGuard.js           # blocks unauthenticated access to protected routes
│   │   ├── Feed.js                # swipe feed with search and apiFetch integration
│   │   ├── Navbar.js              # navigation with logout confirmation banner
│   │   └── SongDetail.js          # song detail view with SoundCloud embed
│   └── App.js                     # routing and persistent login check on load
└── .github/workflows/             # CI workflow on push and pull request
```

---

## API Endpoints

**Authentication**

| Method | Route | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user. Body: `{ username, email, password }` |
| POST | `/auth/login` | Log in. Returns `{ token, role, username }` |
| POST | `/auth/logout` | Log out |

**Songs**

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/songs` | Member | Fetch all songs for the feed |
| POST | `/api/songs` | Admin | Submit a new song |
| GET | `/api/songs/:id` | Member | Fetch a single song by ID |
| DELETE | `/api/songs/:id` | Admin | Delete a song and all associated votes |

**Votes**

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/votes` | Member | Submit a vote on a song |

**Health**

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Server health check |

---

## Data Models

**User**
- `username` String, required, unique
- `email` String, required, unique
- `password` String, required, hashed with bcrypt
- `role` String, enum: `["admin", "member"]`, default: `"member"`

**Song**
- `title` String, required
- `artist` String, required
- `soundcloudUrl` String, required, unique
- `likes` Number, default: 0
- `dislikes` Number, default: 0
- `totalVotes` Number, default: 0

**Vote**
- `user` ObjectId reference to User
- `song` ObjectId reference to Song
- `value` Number

---

## Contributors

| Name | GitHub | Role |
|---|---|---|
| Nicholas Borden | [@nborden11](https://github.com/nborden11) | Product Owner |
| Gabriel Areas | [@Gareasm](https://github.com/Gareasm) | Scrum Master |
| Jonathan Kashanian | [@JonathanKash](https://github.com/JonathanKash) | Frontend Engineer |
| Lucas Fonte | [@lucasfonte21](https://github.com/lucasfonte21) | Backend Engineer |
