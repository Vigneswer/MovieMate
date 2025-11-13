# MovieMate API Documentation

## Overview
Complete REST API for managing your personal movie and TV show collection with TMDB integration.

## Base URL
```
http://localhost:8000
```

## API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Data Models

### Content Types
- `movie` - Movies
- `tv_show` - TV Shows

### Watch Status
- `wishlist` - Want to watch
- `watching` - Currently watching
- `completed` - Finished watching

### Platforms
- `Netflix`
- `Prime Video`
- `Disney+`
- `HBO Max`
- `Hulu`
- `Apple TV+`
- `YouTube`
- `Theater`
- `Other`

### Movie/TV Show Object
```json
{
  "id": 1,
  "content_type": "movie",
  "title": "Inception",
  "description": "A thief who steals corporate secrets...",
  "release_year": 2010,
  "genre": "Action, Sci-Fi, Thriller",
  "director": "Christopher Nolan",
  "cast": "Leonardo DiCaprio, Joseph Gordon-Levitt, Ellen Page",
  "poster_url": "https://image.tmdb.org/t/p/w500/...",
  "backdrop_url": "https://image.tmdb.org/t/p/original/...",
  "trailer_url": "https://www.youtube.com/watch?v=...",
  "platform": "Netflix",
  "status": "completed",
  "duration": 148,
  "total_seasons": null,
  "total_episodes": null,
  "episodes_watched": 0,
  "current_season": null,
  "current_episode": null,
  "user_rating": 9.5,
  "tmdb_rating": 8.8,
  "review": "Mind-bending masterpiece!",
  "notes": "Watch again with friends",
  "tmdb_id": 27205,
  "is_favorite": true,
  "created_at": "2025-11-12T10:00:00Z",
  "updated_at": "2025-11-12T12:00:00Z",
  "watched_at": "2025-11-12T15:00:00Z"
}
```

---

## Endpoints

### 📚 Collection Management

#### Get All Content
```http
GET /api/movies/
```
**Query Parameters:**
- `skip` (int, default: 0) - Pagination offset
- `limit` (int, default: 100) - Max results
- `content_type` (ContentType) - Filter by type
- `status` (WatchStatus) - Filter by status
- `platform` (Platform) - Filter by platform

**Response:** Array of Movie objects

#### Get Content by ID
```http
GET /api/movies/{movie_id}
```
**Response:** Single Movie object

#### Search in Collection
```http
GET /api/movies/search?q={query}
```
**Response:** Array of matching Movie objects

#### Get by Genre
```http
GET /api/movies/genre/{genre}
```
**Response:** Array of Movie objects

#### Get by Status
```http
GET /api/movies/status/{status}
```
**Values:** `wishlist`, `watching`, `completed`
**Response:** Array of Movie objects

#### Get by Platform
```http
GET /api/movies/platform/{platform}
```
**Response:** Array of Movie objects

#### Get Favorites
```http
GET /api/movies/favorites
```
**Response:** Array of favorite Movie objects

#### Get by Type
```http
GET /api/movies/type/{content_type}
```
**Values:** `movie`, `tv_show`
**Response:** Array of Movie objects

---

### ✏️ Create/Update/Delete

#### Add to Collection
```http
POST /api/movies/
```
**Request Body:**
```json
{
  "content_type": "movie",
  "title": "The Matrix",
  "description": "A computer hacker learns...",
  "release_year": 1999,
  "genre": "Action, Sci-Fi",
  "director": "The Wachowskis",
  "cast": "Keanu Reeves, Laurence Fishburne",
  "poster_url": "https://...",
  "platform": "Netflix",
  "status": "wishlist",
  "duration": 136,
  "tmdb_rating": 8.7,
  "tmdb_id": 603
}
```
**Response:** Created Movie object with ID

#### Update Content
```http
PUT /api/movies/{movie_id}
```
**Request Body:** Partial Movie object (only fields to update)
**Response:** Updated Movie object

#### Delete Content
```http
DELETE /api/movies/{movie_id}
```
**Response:** 204 No Content

---

### 🎯 Actions

#### Toggle Favorite
```http
PATCH /api/movies/{movie_id}/favorite
```
**Response:** Updated Movie object

#### Update Watch Status
```http
PATCH /api/movies/{movie_id}/status?new_status={status}
```
**Query Parameters:**
- `new_status` (WatchStatus) - New status value
**Response:** Updated Movie object

#### Update TV Show Progress
```http
PATCH /api/movies/{movie_id}/progress
```
**Query Parameters:**
- `episodes_watched` (int, required)
- `current_season` (int, optional)
- `current_episode` (int, optional)
**Response:** Updated Movie object

---

### 🎬 TMDB Integration

#### Search Movies on TMDB
```http
GET /api/movies/tmdb/search/movies?q={query}&page={page}
```
**Response:** TMDB search results

#### Search TV Shows on TMDB
```http
GET /api/movies/tmdb/search/tv?q={query}&page={page}
```
**Response:** TMDB search results

#### Get Movie Details from TMDB
```http
GET /api/movies/tmdb/movie/{tmdb_id}
```
**Response:** Formatted Movie object (ready to add to collection)

#### Get TV Show Details from TMDB
```http
GET /api/movies/tmdb/tv/{tmdb_id}
```
**Response:** Formatted TV Show object (ready to add to collection)

#### Get Trending
```http
GET /api/movies/tmdb/trending/{media_type}?time_window={window}
```
**Path Parameters:**
- `media_type`: `movie`, `tv`, or `all`
**Query Parameters:**
- `time_window`: `day` or `week`
**Response:** TMDB trending results

#### Get Popular Movies
```http
GET /api/movies/tmdb/popular/movies?page={page}
```
**Response:** TMDB popular movies

#### Get Popular TV Shows
```http
GET /api/movies/tmdb/popular/tv?page={page}
```
**Response:** TMDB popular TV shows

---

### 📊 Analytics

#### Get Collection Statistics
```http
GET /api/movies/analytics/stats
```
**Response:**
```json
{
  "total_content": 50,
  "movies": 35,
  "tv_shows": 15,
  "wishlist": 10,
  "watching": 8,
  "completed": 32,
  "favorites": 12,
  "total_watch_time_minutes": 4200,
  "total_watch_time_hours": 70.0,
  "genre_distribution": {
    "Action": 15,
    "Drama": 20,
    "Comedy": 10
  },
  "platform_distribution": {
    "Netflix": 20,
    "Prime Video": 15,
    "Disney+": 10
  }
}
```

---

## Common Workflows

### Adding a Movie from TMDB
1. Search: `GET /api/movies/tmdb/search/movies?q=Inception`
2. Get Details: `GET /api/movies/tmdb/movie/27205`
3. Add to Collection: `POST /api/movies/` with the formatted data
4. Optionally set platform, status, user rating

### Tracking TV Show Progress
1. Add show: `POST /api/movies/` with `content_type: "tv_show"`
2. Update progress: `PATCH /api/movies/{id}/progress?episodes_watched=5&current_season=1&current_episode=5`
3. Auto-completes when all episodes watched

### Managing Watch Status
1. Add to wishlist: Create with `status: "wishlist"`
2. Start watching: `PATCH /api/movies/{id}/status?new_status=watching`
3. Mark completed: `PATCH /api/movies/{id}/status?new_status=completed`
   - Automatically sets `watched_at` timestamp

---

## Error Responses

### 404 Not Found
```json
{
  "detail": "Content with id 123 not found"
}
```

### 400 Bad Request
```json
{
  "detail": "This content is already in your collection (ID: 5)"
}
```

### 422 Validation Error
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

---

## Rate Limiting
No rate limiting on local API. TMDB API has its own rate limits (40 requests per 10 seconds).

## Authentication
Currently no authentication. Add JWT/OAuth for production deployment.

---

## Examples

### cURL Examples

**Get all movies:**
```bash
curl http://localhost:8000/api/movies/
```

**Add a movie:**
```bash
curl -X POST http://localhost:8000/api/movies/ \
  -H "Content-Type: application/json" \
  -d '{
    "content_type": "movie",
    "title": "Pulp Fiction",
    "release_year": 1994,
    "genre": "Crime, Drama",
    "director": "Quentin Tarantino",
    "platform": "Netflix",
    "status": "wishlist"
  }'
```

**Search TMDB:**
```bash
curl "http://localhost:8000/api/movies/tmdb/search/movies?q=Matrix"
```

**Update status:**
```bash
curl -X PATCH "http://localhost:8000/api/movies/1/status?new_status=watching"
```

**Get statistics:**
```bash
curl http://localhost:8000/api/movies/analytics/stats
```

---

## Next Steps
- Implement authentication
- Add user accounts
- Deploy to production
- Add recommendation engine
- Implement social features (sharing, reviews)
