import httpx
from typing import Optional
from app.config import settings


class GeminiService:
    """Service for interacting with Google Gemini API."""
    
    # Use v1beta API with gemini-2.0-flash
    BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    
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
            
            # Log detailed error if request fails
            if response.status_code != 200:
                error_body = response.text
                print(f"❌ Gemini API Error (Status {response.status_code}): {error_body}")
                response.raise_for_status()
            
            data = response.json()
            
            if data.get("candidates") and len(data["candidates"]) > 0:
                candidate = data["candidates"][0]
                if candidate.get("content", {}).get("parts"):
                    generated_text = candidate["content"]["parts"][0].get("text", "").strip()
                    print(f"✅ Gemini API Success: Generated {len(generated_text)} characters")
                    return generated_text
            
            print(f"⚠️ Gemini API returned no candidates: {data}")
            return None
            
        except httpx.HTTPStatusError as e:
            print(f"❌ Gemini API HTTP Error: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            print(f"❌ Error generating review with Gemini: {type(e).__name__}: {e}")
            raise


# Create singleton instance
gemini_service = GeminiService()
