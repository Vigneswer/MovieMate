# MovieMate - Movie & TV Show Tracker

A full-stack web application for tracking and managing your personal movie and TV show collection.

## 🎬 Features

- **Collection Management**: Add, edit, and delete movies and TV shows
- **TMDB Integration**: Search and import data from The Movie Database
- **Watch Status Tracking**: Organize content by Wishlist, Watching, or Completed
- **Progress Tracking**: Track episodes watched for TV shows
- **Platform Organization**: Tag content by streaming platform (Netflix, Prime, Disney+, etc.)
- **Ratings & Reviews**: Add personal ratings and reviews
- **Advanced Filtering**: Filter by status, content type, and favorites
- **Analytics Dashboard**: View collection statistics and insights
- **Dark Theme UI**: Modern, responsive interface with teal accents

## 🚀 Tech Stack

### Backend
- **FastAPI** 0.104.1 - Modern Python web framework
- **PostgreSQL** 16 - Relational database
- **SQLAlchemy** 2.0.23 - ORM
- **httpx** 0.25.2 - TMDB API integration
- **Pydantic** 2.5.0 - Data validation

### Frontend
- **React** 18.3.1 - UI library
- **Vite** 7.2.2 - Build tool
- **React Router** 7.1.3 - Routing
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## 📦 Project Structure

```
MovieMate/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── config.py            # Configuration & settings
│   │   ├── models/
│   │   │   └── movie.py         # Database models
│   │   ├── schemas/
│   │   │   └── movie.py         # Pydantic schemas
│   │   ├── crud/
│   │   │   └── movie.py         # Database operations
│   │   ├── routers/
│   │   │   └── movies.py        # API endpoints
│   │   └── services/
│   │       └── tmdb.py          # TMDB API service
│   ├── .env                     # Environment variables
│   └── requirements.txt         # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── components/          # Reusable components
    │   │   ├── Header.jsx
    │   │   ├── SearchBar.jsx
    │   │   ├── MovieCard.jsx
    │   │   ├── FilterBar.jsx
    │   │   ├── LoadingSpinner.jsx
    │   │   └── MovieDetailModal.jsx
    │   ├── pages/               # Main pages
    │   │   ├── HomePage.jsx
    │   │   ├── AddMoviePage.jsx
    │   │   └── AnalyticsPage.jsx
    │   ├── services/            # API services
    │   │   ├── api.js
    │   │   └── movieService.js
    │   ├── utils/
    │   │   └── constants.js     # Constants & utilities
    │   ├── App.jsx              # Main App component
    │   ├── App.css
    │   ├── main.jsx             # Entry point
    │   └── index.css            # Global styles
    └── package.json
```

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.8+
- PostgreSQL 16
- Node.js 18+
- TMDB API Key (get from https://www.themoviedb.org/settings/api)

### Backend Setup

1. **Create PostgreSQL Database**
   ```powershell
   psql -U postgres
   CREATE DATABASE moviemate_db;
   CREATE USER moviemate_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE moviemate_db TO moviemate_user;
   \c moviemate_db
   GRANT ALL ON SCHEMA public TO moviemate_user;
   ```

2. **Install Python Dependencies**
   ```powershell
   cd backend
   pip install -r requirements.txt
   ```

3. **Configure Environment**
   Create `backend/.env`:
   ```
   DATABASE_URL=postgresql://moviemate_user:your_password@localhost:5432/moviemate_db
   TMDB_API_KEY=your_tmdb_api_key
   ```

4. **Run Backend Server**
   ```powershell
   cd backend
   uvicorn app.main:app --reload
   ```
   Backend runs at: http://localhost:8000
   API Docs: http://localhost:8000/docs

### Frontend Setup

1. **Install Dependencies**
   ```powershell
   cd frontend
   npm install
   ```

2. **Run Development Server**
   ```powershell
   npm run dev
   ```
   Frontend runs at: http://localhost:5173

## 📡 API Endpoints

### Collection Management
- `GET /api/movies/` - Get all movies/shows
- `GET /api/movies/{id}` - Get specific movie/show
- `POST /api/movies/` - Add new content
- `PUT /api/movies/{id}` - Update content
- `DELETE /api/movies/{id}` - Delete content

### Filtering & Search
- `GET /api/movies/status/{status}` - Filter by watch status
- `GET /api/movies/platform/{platform}` - Filter by platform
- `GET /api/movies/genre/{genre}` - Filter by genre
- `GET /api/movies/search?q=query` - Search collection

### TMDB Integration
- `GET /api/movies/tmdb/search/movies?q=query` - Search TMDB movies
- `GET /api/movies/tmdb/search/tv?q=query` - Search TMDB TV shows
- `GET /api/movies/tmdb/movie/{id}` - Get TMDB movie details
- `GET /api/movies/tmdb/tv/{id}` - Get TMDB TV show details

### Features
- `PUT /api/movies/{id}/favorite` - Toggle favorite status
- `PUT /api/movies/{id}/progress` - Update watch progress
- `GET /api/movies/analytics/stats` - Get collection statistics

## 🎨 Design

The application features a modern dark theme with:
- Primary Background: `#0f172a` (Slate 900)
- Secondary Background: `#1e293b` (Slate 800)
- Accent Color: `#2dd4bf` (Teal 400)
- Responsive grid layout
- Smooth animations and transitions
- Mobile-friendly design

## 🔑 Key Features Explained

### Watch Status
- **Wishlist**: Content you want to watch
- **Watching**: Currently watching
- **Completed**: Finished watching

### Content Types
- **Movies**: Feature films
- **TV Shows**: Series with episode tracking

### Progress Tracking
For TV shows, track:
- Current season
- Current episode
- Total episodes watched
- Progress percentage

### Streaming Platforms
- Netflix
- Prime Video
- Disney+
- HBO Max
- Hulu
- Apple TV+
- YouTube
- Theater
- Other

## 📊 Analytics

The Analytics page provides:
- Total content count
- Movies vs TV shows breakdown
- Status distribution (Wishlist/Watching/Completed)
- Favorites count
- Total watch time
- Genre distribution chart
- Platform distribution

## 🤝 Contributing

This is a personal project, but feel free to fork and customize for your own use!

## 📝 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments


- [Lucide](https://lucide.dev/) for beautiful icons
- [FastAPI](https://fastapi.tiangolo.com/) for the excellent framework
- [React](https://react.dev/) for the UI library

---

**Made with ❤️ using FastAPI, React, and PostgreSQL**
