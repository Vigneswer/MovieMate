# MovieMate - Quick Start Guide

## 🚀 Running the Application

### Start Backend (Terminal 1)
```powershell
cd d:\MovieMate\backend
uvicorn app.main:app --reload
```
✅ Backend API: http://localhost:8000
📚 API Docs: http://localhost:8000/docs

### Start Frontend (Terminal 2)
```powershell
cd d:\MovieMate\frontend
npm run dev
```
✅ Frontend App: http://localhost:5173 (or 5174 if port in use)

## 📝 Using the App

### 1. Add Movies/TV Shows
- Click **"Add Movie"** in the navigation
- **Option A**: Search TMDB database
  - Enter movie/show name
  - Click on result to add to collection
- **Option B**: Add manually
  - Fill in details manually
  - Great for content not on TMDB

### 2. Manage Your Collection
- View all content on the **Home page**
- **Filter** by:
  - Watch Status (Wishlist, Watching, Completed)
  - Content Type (Movies, TV Shows)
  - Favorites only
- **Search** your collection by title
- Click any card to open **detail modal**

### 3. Update Content
In the detail modal you can:
- ⭐ Mark as favorite
- 📺 Change watch status
- 📊 Update progress (for TV shows)
- ✏️ Edit details
- 🗑️ Delete from collection

### 4. Track TV Show Progress
For TV shows:
- Set current season & episode
- Track total episodes watched
- Progress bar shows completion percentage

### 5. View Analytics
- Click **"Analytics"** in navigation
- See collection statistics:
  - Total content count
  - Movies vs TV shows
  - Watch status breakdown
  - Genre distribution
  - Platform breakdown
  - Total watch time

## 🎯 Quick Tips

1. **Use TMDB Search** - Automatically fills in titles, posters, release dates, and more
2. **Set Platforms** - Tag where you can watch each title
3. **Add Ratings** - Rate titles 1-10 to remember your favorites
4. **Write Reviews** - Keep notes about what you thought
5. **Track Progress** - Never lose your place in a TV series

## 🔧 Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify database credentials in `.env`
- Ensure port 8000 is available

### Frontend won't start
- Run `npm install` in frontend directory
- Check if port 5173 is available
- Clear browser cache if seeing old version

### Can't add from TMDB
- Verify TMDB_API_KEY in `backend/.env`
- Check backend console for API errors
- Ensure backend is running

### Database errors
- Run the setup_permissions.bat script
- Check PostgreSQL service is running
- Verify user has schema permissions

## 🎨 Color Scheme

The app uses a **dark theme** with:
- 🌑 Dark backgrounds (#0f172a, #1e293b)
- 💠 Teal accents (#2dd4bf)
- ⭐ Status colors:
  - 🟡 Wishlist: Amber
  - 🔵 Watching: Blue
  - 🟢 Completed: Green

## 📱 Mobile Support

The app is fully responsive and works great on:
- 💻 Desktop
- 📱 Tablets
- 📲 Mobile phones

## 🔐 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://moviemate_user:password@localhost:5432/moviemate_db
TMDB_API_KEY=your_api_key_here
```

### TMDB API Key
Get your free API key:
1. Create account at https://www.themoviedb.org/
2. Go to Settings → API
3. Request API key (free)
4. Copy and paste into `.env`

## 📚 Database Schema

### Main Table: movies
- **id**: Primary key
- **tmdb_id**: TMDB reference
- **title**: Movie/show title
- **content_type**: 'movie' or 'tv_show'
- **status**: 'wishlist', 'watching', 'completed'
- **platform**: Streaming service
- **is_favorite**: Boolean
- **user_rating**: 1-10 scale
- **user_review**: Personal notes
- **progress tracking**: For TV shows
- **TMDB data**: Posters, genres, runtime, etc.

## 🎬 Next Steps

Once you're comfortable with the basics:
1. Build your collection by adding favorite movies/shows
2. Set watch statuses to organize your viewing
3. Track progress on TV series you're watching
4. Use filters to find what to watch next
5. Check analytics to see your viewing patterns

---

**Happy Movie Tracking! 🍿**
