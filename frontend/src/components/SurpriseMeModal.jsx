import React, { useState, useEffect } from 'react';
import { X, Sparkles, Star, TrendingUp, Film, Tv } from 'lucide-react';
import { getRecommendations } from '../services/movieService';
import toast from 'react-hot-toast';
import './SurpriseMeModal.css';

const SurpriseMeModal = ({ onClose, onSelectMovie }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const data = await getRecommendations(10);
      setRecommendations(data.recommendations || []);
      
      // Show message if no recommendations
      if (data.message && data.recommendations.length === 0) {
        toast(data.message, { duration: 4000, icon: '💡' });
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations. Please try again!');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(selectedMovie?.id === movie.id ? null : movie);
  };

  const handleAddToWatchlist = (movie) => {
    onSelectMovie(movie);
    onClose();
  };

  const getSimilarityColor = (score) => {
    if (score >= 0.7) return '#10b981'; // Green
    if (score >= 0.5) return '#f59e0b'; // Orange
    return '#6366f1'; // Purple
  };

  const getSimilarityLabel = (score) => {
    if (score >= 0.7) return 'Highly Recommended';
    if (score >= 0.5) return 'Good Match';
    return 'Worth Trying';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="surprise-me-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-left">
            <Sparkles size={28} className="sparkles-icon" />
            <h2>Surprise Me!</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Finding perfect recommendations for you...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="no-recommendations">
            <Sparkles size={48} />
            <h3>No Recommendations Yet</h3>
            <p>Add at least 2 movies to your collection to get personalized recommendations!</p>
            <p style={{ fontSize: '14px', marginTop: '10px', opacity: 0.8 }}>
              The more movies you add, the better the recommendations will be. 
              Rating your movies also helps improve suggestions!
            </p>
          </div>
        ) : (
          <div className="recommendations-container">
            <div className="recommendations-header">
              <p className="recommendations-subtitle">
                Based on your watch history, we found {recommendations.length} movies you might love
              </p>
            </div>

            <div className="recommendations-grid">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className={`recommendation-card ${selectedMovie?.id === rec.id ? 'selected' : ''}`}
                  onClick={() => handleMovieClick(rec)}
                >
                  <div className="card-poster">
                    {rec.poster_url ? (
                      <img src={rec.poster_url} alt={rec.title} />
                    ) : (
                      <div className="poster-placeholder">
                        {rec.content_type === 'series' ? <Tv size={48} /> : <Film size={48} />}
                      </div>
                    )}
                    <div className="similarity-badge" style={{ backgroundColor: getSimilarityColor(rec.similarity_score || 0) }}>
                      <Star size={14} />
                      <span>{Math.round((rec.similarity_score || 0) * 100)}%</span>
                    </div>
                  </div>

                  <div className="card-content">
                    <h3 className="movie-title">{rec.title || 'Untitled'}</h3>
                    <p className="movie-year">{rec.year || 'N/A'}</p>

                    <div className="similarity-info">
                      <TrendingUp size={16} />
                      <span className="similarity-label">{getSimilarityLabel(rec.similarity_score || 0)}</span>
                    </div>

                    <div className="match-reasons">
                      {rec.match_reasons && rec.match_reasons.length > 0 ? (
                        rec.match_reasons.map((reason, idx) => (
                          <span key={idx} className="reason-tag">
                            {reason}
                          </span>
                        ))
                      ) : (
                        <span className="reason-tag">Recommended for you</span>
                      )}
                    </div>

                    {rec.similar_to && (
                      <div className="similar-to">
                        <p>Similar to: <strong>{rec.similar_to.title}</strong></p>
                      </div>
                    )}

                    {selectedMovie?.id === rec.id && (
                      <div className="expanded-details">
                        <p className="genre"><strong>Genre:</strong> {rec.genre || 'N/A'}</p>
                        {rec.director && (
                          <p className="director"><strong>Director:</strong> {rec.director}</p>
                        )}
                        {rec.actors && (
                          <p className="actors"><strong>Cast:</strong> {rec.actors}</p>
                        )}
                        {rec.plot && (
                          <p className="plot">{rec.plot}</p>
                        )}
                        <button
                          className="view-details-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToWatchlist(rec);
                          }}
                        >
                          View Full Details
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button className="refresh-btn" onClick={fetchRecommendations}>
                <Sparkles size={18} />
                Get New Recommendations
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SurpriseMeModal;
