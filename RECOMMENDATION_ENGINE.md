# MovieMate Recommendation Engine

## Overview
The recommendation engine uses **TF-IDF (Term Frequency-Inverse Document Frequency)** vectorization combined with **cosine similarity** to provide personalized movie and TV show recommendations based on your watch history.

## How It Works

### 1. Content-Based Filtering
The system analyzes the movies/shows you've watched or are currently watching and finds similar content from your wishlist.

### 2. Feature Extraction
Each movie/show is converted into a feature vector based on:
- **Genre** (3x weight) - Most important factor
- **Director** (2x weight) - Very important for similarity
- **Cast** (2x weight) - Actors you enjoy
- **Description** (1x weight) - Plot and context
- **Content Type** (Movie vs TV Show)
- **Decade** (e.g., "2020s", "2010s")

### 3. TF-IDF Vectorization
Uses sklearn's `TfidfVectorizer` to:
- Convert text features into numerical vectors
- Weight terms by importance
- Handle unigrams and bigrams
- Filter common English stop words

### 4. Similarity Calculation
- Computes **cosine similarity** between all movies
- Measures angle between feature vectors (0 to 1 scale)
- Higher score = more similar content

### 5. Smart Scoring
Base similarity is enhanced with:
- **Rating Boost**: Your highly-rated movies get more weight
- **Genre Preference**: +20% boost for your favorite genres (watched 2+ times)
- **Director Preference**: +30% boost for directors you love (2+ movies)

### 6. Recommendation Ranking
Final recommendations are sorted by:
1. Combined similarity score
2. Boost factors from preferences
3. Match reasons for transparency

## Using the Feature

### In the App
1. Navigate to the home page
2. Click the **"Surprise Me!"** button (with sparkles ✨)
3. View personalized recommendations in a beautiful modal
4. See similarity scores, match reasons, and similar movies
5. Click any recommendation to view full details

### What You'll See
- **Similarity Score**: Percentage match (higher = better)
- **Match Labels**: "Highly Recommended" (70%+), "Good Match" (50-70%), "Worth Trying" (<50%)
- **Match Reasons**: Why we recommend it (e.g., "Similar genre: Action, Sci-Fi", "Same director: Christopher Nolan")
- **Similar To**: Which movie from your collection it's most like

## Requirements

### For Recommendations to Work
You need:
- ✅ At least 1 movie marked as **"Completed"** or **"Watching"** (builds your taste profile)
- ✅ At least 1 movie in your **"Wishlist"** (potential recommendations)

### Best Results
For better recommendations:
- Rate your watched movies (1-10 stars) - higher rated content gets more weight
- Watch diverse content - helps the algorithm understand your preferences
- Add detailed information when adding movies (genre, director, cast)

## Technical Details

### Backend Endpoint
```
GET /api/movies/recommendations/surprise-me?count=10
```

**Parameters:**
- `count`: Number of recommendations (1-50, default: 10)

**Response:**
```json
{
  "recommendations": [
    {
      "id": 123,
      "title": "Inception",
      "year": 2010,
      "genre": "Action, Sci-Fi, Thriller",
      "director": "Christopher Nolan",
      "actors": "Leonardo DiCaprio, Joseph Gordon-Levitt",
      "plot": "A thief who steals...",
      "poster_url": "https://...",
      "similarity_score": 0.856,
      "raw_similarity": 0.714,
      "boost_factor": 1.2,
      "similar_to": {
        "title": "The Matrix",
        "id": 45
      },
      "match_reasons": [
        "Similar genre: Sci-Fi, Action",
        "You love Sci-Fi movies",
        "Similar era (2010)"
      ]
    }
  ],
  "count": 10
}
```

### Algorithm Parameters
- **Max Features**: 1000 TF-IDF features
- **N-grams**: Unigrams and bigrams (1-2 words)
- **Min Document Frequency**: 1 (include rare terms)
- **Max Document Frequency**: 0.8 (exclude very common terms)
- **Similarity Threshold**: 0.1 (minimum to be considered)

### Performance
- Fast: Processes 100+ movies in <1 second
- Scalable: Efficient sklearn implementation
- Real-time: No pre-computation required

## Examples

### Example 1: Sci-Fi Fan
**Your Watch History:**
- The Matrix (Completed, 10/10)
- Blade Runner 2049 (Completed, 9/10)
- Interstellar (Watching)

**Recommendations:**
1. **Inception** (92% match)
   - Similar genre: Sci-Fi, Action
   - Same director: Christopher Nolan
   - Similar era (2010s)

2. **Arrival** (87% match)
   - Similar genre: Sci-Fi, Drama
   - You love Sci-Fi movies
   - Similar era (2016)

### Example 2: Drama Lover
**Your Watch History:**
- The Shawshank Redemption (Completed, 10/10)
- The Godfather (Completed, 10/10)

**Recommendations:**
1. **Goodfellas** (88% match)
   - Similar genre: Crime, Drama
   - Same director: Martin Scorsese
   - You love Drama movies

## Future Enhancements
Potential improvements:
- [ ] Collaborative filtering (recommendations based on similar users)
- [ ] Hybrid approach (combine content + collaborative)
- [ ] Diversity boost (avoid recommending too similar items)
- [ ] Temporal weighting (recent watches matter more)
- [ ] External ratings integration (IMDb, Rotten Tomatoes)
- [ ] "Because you watched X" explanations
- [ ] Recommendation refresh notifications

## Troubleshooting

### "No recommendations available"
**Cause**: You don't have enough data
**Solution**: 
1. Mark at least 1 movie as "Completed" or "Watching"
2. Add some movies to your "Wishlist"

### Low Similarity Scores
**Cause**: Your wishlist content is very different from watched content
**Solution**:
- Add more diverse content to your wishlist
- Watch and rate more movies to build better profile

### Same Recommendations Repeatedly
**Cause**: Small dataset or limited variety
**Solution**:
- Add more movies to your wishlist
- Rate your watched movies to improve ranking
- Click "Get New Recommendations" to reshuffle

## Technologies Used
- **scikit-learn**: TF-IDF vectorization and cosine similarity
- **NumPy**: Numerical computations and weighting
- **SQLAlchemy**: Database queries
- **FastAPI**: REST endpoint
- **React**: Frontend UI
- **Lucide React**: Icons

---

Built with ❤️ using state-of-the-art machine learning techniques!
