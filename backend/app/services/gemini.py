import httpx
from typing import Optional
from app.config import settings


class GeminiService:
    """Service for interacting with Google Gemini API."""
    
    BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"
    
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()
    
    async def generate_review_summary(
        self,
        movie_title: str,
        movie_overview: str,
        user_comments: str,
        user_rating: Optional[float] = None
    ) -> Optional[str]:
        """
        Generate a concise review summary using Gemini AI.
        
        Args:
            movie_title: Title of the movie
            movie_overview: Movie plot/overview
            user_comments: User's personal comments/thoughts
            user_rating: Optional user rating (1-10)
            
        Returns:
            Generated review summary or None if failed
        """
        try:
            rating_text = f"rated {user_rating}/10" if user_rating else "watched"
            
            prompt = f"""You are a movie review assistant. Based on the following information, generate a SHORT, engaging review summary (2-3 sentences maximum) that captures the user's perspective.

Movie: {movie_title}
Plot: {movie_overview}
User's thoughts: {user_comments}
User {rating_text}

Generate a natural, conversational review summary that combines the plot context with the user's personal opinion. Keep it concise and engaging."""

            payload = {
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 150,
                    "topP": 0.8,
                    "topK": 40
                }
            }
            
            response = await self.client.post(
                f"{self.BASE_URL}?key={self.api_key}",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            data = response.json()
            
            if data.get("candidates") and len(data["candidates"]) > 0:
                candidate = data["candidates"][0]
                if candidate.get("content", {}).get("parts"):
                    return candidate["content"]["parts"][0].get("text", "").strip()
            
            return None
            
        except Exception as e:
            print(f"Error generating review with Gemini: {e}")
            return None


# Create singleton instance
gemini_service = GeminiService()
