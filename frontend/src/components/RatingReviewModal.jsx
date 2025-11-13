import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { updateMovie } from '../services/movieService';
import './RatingReviewModal.css';

const RatingReviewModal = ({ movie, onClose, onUpdate }) => {
  const [rating, setRating] = useState(movie.user_rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState(movie.review || '');
  const [notes, setNotes] = useState(movie.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    try {
      setSaving(true);
      await updateMovie(movie.id, {
        user_rating: rating,
        review: review.trim() || null,
        notes: notes.trim() || null,
      });
      
      toast.success('Rating and review saved!');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to save rating and review');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <h2 className="rating-modal-title">Rate & Review</h2>
        <p className="rating-modal-subtitle">{movie.title}</p>

        <form onSubmit={handleSubmit}>
          <div className="rating-section">
            <label>Your Rating *</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="star-button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    size={32}
                    fill={star <= (hoveredRating || rating) ? '#fbbf24' : 'none'}
                    color={star <= (hoveredRating || rating) ? '#fbbf24' : '#64748b'}
                  />
                </button>
              ))}
            </div>
            <p className="rating-value">{hoveredRating || rating}/10</p>
          </div>

          <div className="form-group">
            <label>Your Review</label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="What did you think about this movie/show?"
              rows={6}
              className="review-textarea"
            />
            <p className="char-count">{review.length} characters</p>
          </div>

          <div className="form-group">
            <label>Personal Notes (Private)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Personal thoughts, reminders, recommendations..."
              rows={4}
              className="notes-textarea"
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={saving || rating === 0}
            >
              {saving ? 'Saving...' : 'Save Rating & Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingReviewModal;
