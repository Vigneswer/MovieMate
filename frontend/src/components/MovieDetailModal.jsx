import { X, Star, Calendar, Clock, Tv, Film, Heart, Trash2, Edit, Pen, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { deleteMovie, updateMovie, updateStatus, updateProgress } from '../services/movieService';
import { STATUS_LABELS, WATCH_STATUS, PLATFORMS, formatRuntime, formatDate, getProgressPercentage } from '../utils/constants';
import RatingReviewModal from './RatingReviewModal';
import AIReviewGenerator from './AIReviewGenerator';
import './MovieDetailModal.css';


const MovieDetailModal = ({ movie, onClose, onUpdate, onToggleFavorite }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [episodesWatched, setEpisodesWatched] = useState(movie.episodes_watched || 0);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showAIReview, setShowAIReview] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(movie.platform || '');

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this from your collection?')) return;
    
    try {
      setIsDeleting(true);
      await deleteMovie(movie.id);
      toast.success('Removed from collection');
      onUpdate();
    } catch (error) {
      toast.error('Failed to delete');
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateStatus(movie.id, newStatus);
      toast.success(`Status updated to ${STATUS_LABELS[newStatus]}`);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleProgressUpdate = async () => {
    try {
      await updateProgress(movie.id, episodesWatched);
      toast.success('Progress updated');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const handlePlatformUpdate = async (newPlatform) => {
    try {
      await updateMovie(movie.id, { platform: newPlatform || null });
      setSelectedPlatform(newPlatform);
      toast.success('Platform updated');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update platform');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          {movie.backdrop_url && (
            <img src={movie.backdrop_url} alt={movie.title} className="modal-backdrop" />
          )}
          <div className="modal-header-content">
            <div className="modal-poster">
              <img src={movie.poster_url || '/placeholder-poster.png'} alt={movie.title} />
            </div>
            <div className="modal-info">
              <div className="modal-type">
                {movie.content_type === 'movie' ? <Film size={18} /> : <Tv size={18} />}
                <span>{movie.content_type === 'movie' ? 'Movie' : 'TV Show'}</span>
              </div>
              <h2 className="modal-title">{movie.title}</h2>
              <div className="modal-meta">
                {movie.release_year && (
                  <span className="meta-item">
                    <Calendar size={16} />
                    {movie.release_year}
                  </span>
                )}
                {movie.duration && (
                  <span className="meta-item">
                    <Clock size={16} />
                    {formatRuntime(movie.duration)}
                  </span>
                )}
                {(movie.tmdb_rating || movie.user_rating) && (
                  <span className="meta-item">
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                    {(movie.tmdb_rating || movie.user_rating).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-body">
          {movie.description && (
            <div className="modal-section">
              <h3>Overview</h3>
              <p>{movie.description}</p>
            </div>
          )}

          {movie.genre && (
            <div className="modal-section">
              <h3>Genres</h3>
              <div className="genre-tags">
                {movie.genre.split(',').map((genre, i) => (
                  <span key={i} className="genre-tag">{genre.trim()}</span>
                ))}
              </div>
            </div>
          )}

          {movie.director && (
            <div className="modal-section">
              <h3>Director</h3>
              <p>{movie.director}</p>
            </div>
          )}

          {movie.cast && (
            <div className="modal-section">
              <h3>Cast</h3>
              <p>{movie.cast}</p>
            </div>
          )}

          <div className="modal-section">
            <h3>Streaming Platform</h3>
            <select
              value={selectedPlatform}
              onChange={(e) => handlePlatformUpdate(e.target.value)}
              className="platform-select-modal"
            >
              <option value="">Not specified</option>
              {Object.entries(PLATFORMS).map(([key, value]) => (
                <option key={key} value={value}>{value}</option>
              ))}
            </select>
          </div>

          <div className="modal-section">
            <h3>Watch Status</h3>
            <div className="status-buttons">
              {Object.values(WATCH_STATUS).map((status) => (
                <button
                  key={status}
                  className={`status-btn ${movie.status === status ? 'active' : ''}`}
                  onClick={() => handleStatusChange(status)}
                >
                  {STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </div>

          {movie.content_type === 'tv_show' && movie.total_episodes && (
            <div className="modal-section">
              <h3>Progress</h3>
              <div className="progress-section">
                <div className="progress-info">
                  <span>{episodesWatched} / {movie.total_episodes} episodes</span>
                  <span>{getProgressPercentage(episodesWatched, movie.total_episodes)}%</span>
                </div>
                <div className="progress-bar-large">
                  <div 
                    className="progress-fill"
                    style={{ width: `${getProgressPercentage(episodesWatched, movie.total_episodes)}%` }}
                  />
                </div>
                <input
                  type="number"
                  min="0"
                  max={movie.total_episodes}
                  value={episodesWatched}
                  onChange={(e) => setEpisodesWatched(parseInt(e.target.value) || 0)}
                  className="progress-input"
                />
                <button className="btn-primary" onClick={handleProgressUpdate}>
                  Update Progress
                </button>
              </div>
            </div>
          )}

          {movie.review && (
            <div className="modal-section">
              <h3>My Review</h3>
              <p>{movie.review}</p>
              {movie.user_rating && (
                <div className="user-rating">
                  <Star size={20} fill="#fbbf24" color="#fbbf24" />
                  <span>{movie.user_rating}/10</span>
                </div>
              )}
            </div>
          )}

          <div className="modal-actions">
            {(movie.status === 'completed' || movie.status === 'watching') && (
              <button 
                className="action-btn ai-review"
                onClick={() => setShowAIReview(true)}
              >
                <Sparkles size={18} />
                Generate AI Review
              </button>
            )}
            <button 
              className="action-btn rate"
              onClick={() => setShowRatingModal(true)}
            >
              <Pen size={18} />
              {movie.user_rating ? 'Edit Rating & Review' : 'Rate & Review'}
            </button>
            <button 
              className="action-btn favorite"
              onClick={() => onToggleFavorite(movie.id)}
            >
              <Heart fill={movie.is_favorite ? '#ef4444' : 'none'} />
              {movie.is_favorite ? 'Unfavorite' : 'Favorite'}
            </button>
            <button 
              className="action-btn delete"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 size={18} />
              Delete
            </button>
          </div>
        </div>
      </div>

      {showRatingModal && (
        <RatingReviewModal
          movie={movie}
          onClose={() => setShowRatingModal(false)}
          onUpdate={onUpdate}
        />
      )}

      {showAIReview && (
        <AIReviewGenerator
          movie={movie}
          onClose={() => setShowAIReview(false)}
          onReviewGenerated={(review) => {
            console.log('Generated review:', review);
          }}
        />
      )}
    </div>
  );
};

export default MovieDetailModal;
