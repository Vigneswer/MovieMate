# MovieMate — Project Summary

This file summarizes the repository structure, how the app works, the important files, external services, and quick run instructions.

## Overview
- Full-stack web app to manage a personal movie/TV collection.
- Backend: FastAPI + SQLAlchemy + PostgreSQL.
- Frontend: React (Vite) with client-side routing and Tailwind/CSS styles.
- External services: OMDb (used for search/details), Google Gemini (AI review generation).

## High-level Flow
1. Frontend calls backend API under `/api/movies/*` for collection management and features.
2. Backend persists data in PostgreSQL via SQLAlchemy models and CRUD helpers.
3. For external lookups, the backend uses OMDb (service is in `backend/app/services/tmdb.py` but it calls OMDb and returns TMDB-like results).
4. AI review generation uses the Gemini client in `backend/app/services/gemini.py`.

## Important Files (short guide)
- `backend/app/main.py` — FastAPI app setup, CORS, include routers, startup DB creation.
- `backend/app/routers/movies.py` — All API endpoints for collection, filters, analytics, recommendations, OMDb integration (named `tmdb` in routes for legacy reasons), and AI review generation.
- `backend/app/services/tmdb.py` — Actually implements OMDb integration (search & detail adapters). Despite the name, OMDb is used in code.
- `backend/app/services/gemini.py` — Google Gemini AI client used to generate short review summaries.
- `backend/app/crud/movie.py` — Database operations (create, update, search, toggle favorite, progress updates).
- `backend/app/models/movie.py` — SQLAlchemy model for Movie content.
- `backend/app/schemas/movie.py` — Pydantic schemas for validation/response models.
- `backend/.env` — Environment variables (now contains `OMDB_API_KEY`; removed unused TMDB key).

- `frontend/src/main.jsx` — React entry point.
- `frontend/src/App.jsx` — Router, main routes (Home, Add, Analytics, Search).
- `frontend/src/components/*` — UI components (Header, Movie cards, Modals, etc.).
- `frontend/src/services/movieService.js` — Frontend API wrappers that call backend endpoints.
- `frontend/package.json` — Frontend dependencies and scripts.

## External Services & Keys
- OMDb (`OMDB_API_KEY`) — used for search and movie details. (Service file named `tmdb.py` maps OMDb responses to TMDB-like fields.)
- Google Gemini (`GEMINI_API_KEY`) — used for generating AI review summaries.

## Notable Cleanup / Current State
- Watch Party feature files were removed from backend and frontend (kept DB tables if needed later).
- Several documentation markdown files were removed to reduce clutter; `README.md` remains.
- The project contains a legacy naming inconsistency: service file and routes named `tmdb` but code and API key use OMDb. This is intentional (working) but confusing — renaming to `omdb` is optional and will touch multiple files.
- The unused `TMDB_API_KEY` was removed from `backend/.env`.

## How to run (quick)
Backend:
```powershell
cd backend
pip install -r requirements.txt
# configure backend/.env with DATABASE_URL and OMDB_API_KEY and GEMINI_API_KEY
uvicorn app.main:app --reload
```
Frontend:
```powershell
cd frontend
npm install
npm run dev
```

API base: `http://localhost:8000/api/movies/`
Docs: `http://localhost:8000/docs`

## Recommendations / Next Steps
- (Optional) Rename `tmdb` references to `omdb` for clarity. This requires renaming the service and updating imports and route names if desired.
- Address Vite large chunk warning by applying code-splitting/dynamic imports for big pages (SearchResults, Analytics).
- If you plan to reintroduce Watch Party, restore models, CRUD, schemas and routers and migrate DB if necessary.

---
Generated on 2025-11-13 — concise project overview created by assistant for developer reference.
