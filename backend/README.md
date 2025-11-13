# MovieMate Backend API

FastAPI backend with PostgreSQL database for MovieMate application.

## Prerequisites

- Python 3.8 or higher
- PostgreSQL 16 installed and running
- Database `moviemate_db` created
- Database user `moviemate_user` created with access to `moviemate_db`

## Setup Instructions

### 1. Create Virtual Environment

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```powershell
Copy-Item .env.example .env
```

Edit `.env` file with your database credentials:

```env
DATABASE_URL=postgresql://moviemate_user:strongpassword@localhost:5432/moviemate_db
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 4. Verify Database Connection

Make sure PostgreSQL is running:

```powershell
Get-Service | Where-Object { $_.Name -like "postgres*" }
```

If stopped, start it:

```powershell
net start postgresql-x64-16
```

### 5. Run the Application

```powershell
# Make sure you're in the backend directory with venv activated
python -m uvicorn app.main:app --reload
```

Or simply:

```powershell
python app/main.py
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs (Swagger)**: http://localhost:8000/docs
- **Alternative Docs (ReDoc)**: http://localhost:8000/redoc

## API Endpoints

### Movies

- `GET /api/movies/` - Get all movies (with pagination)
- `GET /api/movies/{movie_id}` - Get movie by ID
- `GET /api/movies/search?q={query}` - Search movies
- `GET /api/movies/genre/{genre}` - Get movies by genre
- `GET /api/movies/favorites` - Get favorite movies
- `GET /api/movies/watched` - Get watched movies
- `POST /api/movies/` - Create a new movie
- `PUT /api/movies/{movie_id}` - Update a movie
- `DELETE /api/movies/{movie_id}` - Delete a movie
- `PATCH /api/movies/{movie_id}/favorite` - Toggle favorite status
- `PATCH /api/movies/{movie_id}/watched` - Toggle watched status

### Health

- `GET /` - Root endpoint with API info
- `GET /health` - Health check endpoint

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app initialization
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection and session
│   ├── models/              # SQLAlchemy models
│   │   ├── __init__.py
│   │   └── movie.py
│   ├── schemas/             # Pydantic schemas
│   │   ├── __init__.py
│   │   └── movie.py
│   ├── crud/                # Database CRUD operations
│   │   ├── __init__.py
│   │   └── movie.py
│   └── routers/             # API route handlers
│       ├── __init__.py
│       └── movies.py
├── .env                     # Environment variables (not in git)
├── .env.example             # Example environment variables
├── .gitignore              # Git ignore rules
├── requirements.txt         # Python dependencies
└── README.md               # This file
```

## Testing with Sample Data

You can test the API by creating sample movies:

```bash
curl -X POST "http://localhost:8000/api/movies/" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "The Shawshank Redemption",
    "description": "Two imprisoned men bond over a number of years...",
    "release_year": 1994,
    "genre": "Drama",
    "director": "Frank Darabont",
    "rating": 9.3,
    "duration": 142
  }'
```

Or use the interactive documentation at http://localhost:8000/docs

## Database Schema

### Movies Table

| Column | Type | Description |
|--------|------|-------------|
| id | Integer | Primary key |
| title | String(255) | Movie title |
| description | Text | Plot description |
| release_year | Integer | Release year |
| genre | String(100) | Genre |
| director | String(100) | Director name |
| cast | Text | Comma-separated cast |
| rating | Float | Rating (0-10) |
| duration | Integer | Duration in minutes |
| poster_url | String(500) | Poster image URL |
| trailer_url | String(500) | Trailer video URL |
| is_favorite | Boolean | Favorite status |
| watched | Boolean | Watched status |
| created_at | DateTime | Creation timestamp |
| updated_at | DateTime | Last update timestamp |

## Troubleshooting

### Database Connection Issues

If you get connection errors:

1. Check PostgreSQL is running
2. Verify database credentials in `.env`
3. Ensure database and user exist:

```sql
-- Connect to PostgreSQL
psql -U postgres

-- List databases
\l

-- List users
\du

-- If needed, recreate:
CREATE DATABASE moviemate_db;
CREATE USER moviemate_user WITH PASSWORD 'strongpassword';
GRANT ALL PRIVILEGES ON DATABASE moviemate_db TO moviemate_user;
```

### Port Already in Use

If port 8000 is busy, change it in `.env`:

```env
API_PORT=8001
```

## Development Tips

- Tables are created automatically on first run
- Use `/docs` for interactive API testing
- Enable DEBUG mode for SQL query logging
- CORS is configured for frontend development

## Next Steps

1. Connect your React frontend to `http://localhost:8000/api`
2. Use the API endpoints to manage movies
3. Consider adding authentication/authorization
4. Add database migrations with Alembic for production
