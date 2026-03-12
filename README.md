# 🌸 WishWash

A full-stack media tracking web app to discover and track anime, movies, and TV shows. Built with the MERN stack.

---

## ✨ Features

- 🎌 **Browse Anime** — Top-rated & currently airing anime via Jikan (MyAnimeList)
- 🎬 **Browse Movies** — Popular movies via OMDb (IMDb-backed data)
- 📺 **Browse TV Shows** — Popular TV shows via TVMaze
- 🔍 **Smart Search** — Search scoped to active tab (Anime/Movies/TV Shows/All)
- 📋 **Personal Watchlist** — Add titles, set status (Watching / On Hold / Plan to Watch / Dropped / Completed)
- ⭐ **Rate This** — Hover a watchlist card to open its IMDb or MyAnimeList page
- 🔐 **Auth System** — Sign up / sign in with username or email, JWT-based sessions
- 🌸 **Pastel UI** — Cherry blossom pixel art GIF background, soft pink theme
- ☁️ **MongoDB Atlas** — Cloud database support

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas cloud or local) + Mongoose |
| Auth | JWT + bcryptjs |
| Fonts | Oxanium (display), DM Sans (body) |

---

## 📡 APIs Used (all free, no credit card)

| API | Used For | Key Required |
|-----|----------|-------------|
| [Jikan v4](https://api.jikan.moe) | Anime browse & search | ❌ No |
| [TVMaze](https://api.tvmaze.com) | TV show browse & search | ❌ No |
| [OMDb](https://omdbapi.com) | Movie browse & search | ✅ Free (email only) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local) **or** MongoDB Atlas (cloud)
- OMDb API key — free at [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx)

---

### 1. Clone & install

```bash
git clone <your-repo-url>
cd wishwash

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### 2. Configure environment

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/wishwash?retryWrites=true&w=majority
JWT_SECRET=your_strong_random_secret
OMDB_API_KEY=your_omdb_key
JWT_EXPIRE=7d
```

> For **local MongoDB**: use `MONGODB_URI=mongodb://localhost:27017/wishwash`

---

### 3. Run the app

Open **two terminals**:

**Terminal 1 — Backend**
```bash
cd backend
npm run dev
# → Server running on http://localhost:5000
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm start
# → App running on http://localhost:3000
```

---

## ☁️ MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → create a free **M0** cluster
2. **Database Access** → Add user with password authentication
3. **Network Access** → Add IP `0.0.0.0/0` (allow from anywhere)
4. **Connect** → Drivers → copy connection string
5. Paste into `backend/.env` as `MONGODB_URI`, replacing `<password>` and adding `/wishwash` as the database name

---

## 📁 Project Structure

```
wishwash/
├── backend/
│   ├── server.js               # Express app entry point
│   ├── .env                    # Environment variables (not committed)
│   ├── models/
│   │   ├── User.js             # User schema (username, email, hashed password)
│   │   └── WatchlistItem.js    # Watchlist schema (mediaId, type, status, etc.)
│   ├── routes/
│   │   ├── auth.js             # POST /signup, POST /signin, GET /me
│   │   ├── watchlist.js        # GET/POST/PUT/DELETE /watchlist
│   │   └── media.js            # Anime, Movies, TV, Search endpoints
│   └── middleware/
│       └── auth.js             # JWT verification middleware
│
└── frontend/
    ├── public/
    │   └── bg.gif              # Cherry blossom pixel art background
    └── src/
        ├── App.jsx             # Routes setup
        ├── index.css           # Global styles + pastel theme variables
        ├── context/
        │   └── AuthContext.jsx # Auth state (user, login, logout)
        ├── pages/
        │   ├── AuthPage.jsx    # Split-panel login/signup page
        │   ├── Dashboard.jsx   # Main browse + search page
        │   └── WatchlistPage.jsx
        └── components/
            ├── Navbar.jsx      # Logo + tabs + search + user menu
            ├── MediaSection.jsx # Row view (Home tab) + Grid view (category tabs)
            └── MediaCard.jsx   # Individual media card with watchlist add
```

---

## 🔌 API Endpoints

### Auth
| Method | Route | Body | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/signup` | `{username, email, password}` | Register |
| POST | `/api/auth/signin` | `{identifier, password}` | Login (username or email) |
| GET | `/api/auth/me` | — | Get current user (Bearer token) |

### Watchlist (all require Bearer token)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/watchlist` | Get user's watchlist |
| POST | `/api/watchlist` | Add item |
| PUT | `/api/watchlist/:id` | Update status |
| DELETE | `/api/watchlist/:id` | Remove item |

### Media (all require Bearer token)
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/media/anime/top` | Top anime (Jikan) |
| GET | `/api/media/anime/season` | Currently airing anime |
| GET | `/api/media/tv/popular` | Popular TV shows (TVMaze) |
| GET | `/api/media/movies/popular` | Popular movies (OMDb) |
| GET | `/api/media/search/multi?q=` | Search anime + TV + movies |

---

## 🎨 UI Overview

| Tab | Layout | Behaviour |
|-----|--------|-----------|
| **Home** | Horizontal scroll rows with `01 02 03...` numbered cards | Shows all categories |
| **Anime** | Full grid | Loads top anime, Show More fetches next page |
| **Movies** | Full grid | Loads OMDb movies, Show More fetches next page |
| **TV Shows** | Full grid | Loads TVMaze shows, Show More fetches next page |
| **Search** | Grid (scoped to active tab) | Searching on Anime tab → anime only, etc. |

### Watchlist card hover
Hovering a poster in the Watchlist blurs it and shows **⭐ Rate this?** — clicking opens:
- **Anime** → MyAnimeList page
- **Movies** → IMDb title page
- **TV Shows** → IMDb search

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | ✅ | Backend port (default 5000) |
| `MONGODB_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens |
| `JWT_EXPIRE` | ✅ | Token expiry (e.g. `7d`) |
| `OMDB_API_KEY` | ✅ | Free key from omdbapi.com |

---

## 📝 Notes

- Jikan has a rate limit of ~3 requests/second — the backend retries automatically up to 2 times
- OMDb free tier: 1,000 requests/day
- TVMaze: unlimited, no key required
- The `bg.gif` file must be placed in `frontend/public/` for the background to work