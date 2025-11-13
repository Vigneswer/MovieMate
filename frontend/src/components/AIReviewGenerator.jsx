import React, { useState, useEffect } from 'react';
import { Sparkles, X, Loader, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import './AIReviewGenerator.css';

const AIReviewGenerator = ({ movie, onClose, onReviewGenerated }) => {
  const [userComments, setUserComments] = useState('');
  const [generatedReview, setGeneratedReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!userComments.trim()) {
      toast.error('Please enter your thoughts about the movie');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/movies/${movie.id}/generate-review?user_comments=${encodeURIComponent(userComments)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate review');
      }

      const data = await response.json();
      setGeneratedReview(data.generated_review);
      toast.success('AI review generated!');
      
      if (onReviewGenerated) {
        onReviewGenerated(data.generated_review);
      }
    } catch (error) {
      console.error('Error generating review:', error);
      toast.error('Failed to generate review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReview = () => {
    navigator.clipboard.writeText(generatedReview);
    toast.success('Review copied to clipboard!');
  };

  return (
    <div className="ai-review-modal-overlay" onClick={onClose}>
      <div className="ai-review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ai-review-header">
          <div className="header-left">
            <Sparkles className="sparkles-icon" size={28} />
            <div>
              <h2>AI Review Generator</h2>
              <p className="movie-title">{movie.title}</p>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="ai-review-content">
          <div className="movie-info">
            <p className="movie-overview">{movie.description || movie.overview}</p>
            {movie.user_rating && (
              <div className="user-rating">
                <Star size={16} fill="#fbbf24" color="#fbbf24" />
                <span>Your Rating: {movie.user_rating}/10</span>
              </div>
            )}
          </div>

          <div className="form-section">
            <label htmlFor="user-comments">
              <strong>Your Thoughts</strong>
              <span className="label-hint">Share what you liked or didn't like</span>
            </label>
            <textarea
              id="user-comments"
              value={userComments}
              onChange={(e) => setUserComments(e.target.value)}
              placeholder="E.g., Great cinematography, but the ending felt rushed..."
              rows={4}
              disabled={loading}
            />
          </div>

          <button
            className="generate-button"
            onClick={handleGenerate}
            disabled={loading || !userComments.trim()}
          >
            {loading ? (
              <>
                <Loader className="spinning" size={20} />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate AI Review
              </>
            )}
          </button>

          {generatedReview && (
            <div className="generated-review-section">
              <div className="section-header">
                <h3>Generated Review</h3>
                <button className="copy-button" onClick={handleCopyReview}>
                  Copy
                </button>
              </div>
              <div className="generated-review-box">
                <p>{generatedReview}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIReviewGenerator;
