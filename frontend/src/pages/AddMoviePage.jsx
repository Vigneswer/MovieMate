import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Film, Tv } from 'lucide-react';
import { createMovie } from '../services/movieService';
import { WATCH_STATUS, CONTENT_TYPES, PLATFORMS } from '../utils/constants';
import './AddMoviePage.css';

const AddMoviePage = ({ onMovieAdded }) => {
  const [activeTab, setActiveTab] = useState('movie');

  // Manual add form state
  const [formData, setFormData] = useState({
    title: '',
    content_type: 'movie',
    overview: '',
    release_date: '',
    runtime: '',
    poster_path: '',
    backdrop_path: '',
    genres: '',
    platform: '',
    status: 'wishlist',
    user_rating: '',
    user_review: '',
    total_episodes: '',
    total_seasons: '',
  });

  const handleManualSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      const movieData = {
        ...formData,
        content_type: activeTab,
        runtime: formData.runtime ? parseInt(formData.runtime) : null,
        user_rating: formData.user_rating ? parseFloat(formData.user_rating) : null,
        total_episodes: formData.total_episodes ? parseInt(formData.total_episodes) : null,
        total_seasons: formData.total_seasons ? parseInt(formData.total_seasons) : null,
        genres: formData.genres ? formData.genres.split(',').map(g => g.trim()) : [],
      };

      await createMovie(movieData);
      toast.success(`Added ${formData.title} to your collection!`);
      if (onMovieAdded) onMovieAdded();

      // Reset form
      setFormData({
        title: '',
        content_type: 'movie',
        overview: '',
        release_date: '',
        runtime: '',
        poster_path: '',
        backdrop_path: '',
        genres: '',
        platform: '',
        status: 'wishlist',
        user_rating: '',
        user_review: '',
        total_episodes: '',
        total_seasons: '',
      });
    } catch (error) {
      toast.error('Failed to add to collection');
      console.error(error);
    }
  };

  return (
    <div className="add-movie-page">
      <div className="add-header">
        <h2 className="page-title">
          <Plus size={32} />
          Add to Collection
        </h2>
        <p className="page-subtitle">Add movies and TV shows manually</p>
      </div>

      <div className="content-type-tabs">
        <button
          className={`tab ${activeTab === 'movie' ? 'active' : ''}`}
          onClick={() => setActiveTab('movie')}
        >
          <Film size={20} />
          Movies
        </button>
        <button
          className={`tab ${activeTab === 'tv_show' ? 'active' : ''}`}
          onClick={() => setActiveTab('tv_show')}
        >
          <Tv size={20} />
          TV Shows
        </button>
      </div>

      <div className="manual-add-section">
        <form onSubmit={handleManualSubmit} className="manual-form">
            <div className="form-row">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Release Date</label>
                <input
                  type="date"
                  value={formData.release_date}
                  onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Overview</label>
              <textarea
                value={formData.overview}
                onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                rows={4}
              />
            </div>

            <div className="form-group">
              <label>Poster Image URL</label>
              <input
                type="url"
                value={formData.poster_path}
                onChange={(e) => setFormData({ ...formData, poster_path: e.target.value })}
                placeholder="https://example.com/poster.jpg"
              />
              {formData.poster_path && (
                <div className="poster-preview">
                  <img src={formData.poster_path} alt="Poster preview" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {Object.entries(WATCH_STATUS).map(([key, value]) => (
                    <option key={key} value={value.toLowerCase()}>{value}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                >
                  <option value="">Select Platform</option>
                  {Object.entries(PLATFORMS).map(([key, value]) => (
                    <option key={key} value={value}>{value}</option>
                  ))}
                </select>
              </div>
            </div>

            {activeTab === 'movie' ? (
              <div className="form-group">
                <label>Runtime (minutes)</label>
                <input
                  type="number"
                  value={formData.runtime}
                  onChange={(e) => setFormData({ ...formData, runtime: e.target.value })}
                />
              </div>
            ) : (
              <div className="form-row">
                <div className="form-group">
                  <label>Total Seasons</label>
                  <input
                    type="number"
                    value={formData.total_seasons}
                    onChange={(e) => setFormData({ ...formData, total_seasons: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Total Episodes</label>
                  <input
                    type="number"
                    value={formData.total_episodes}
                    onChange={(e) => setFormData({ ...formData, total_episodes: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Genres (comma separated)</label>
                <input
                  type="text"
                  value={formData.genres}
                  onChange={(e) => setFormData({ ...formData, genres: e.target.value })}
                  placeholder="Action, Drama, Thriller"
                />
              </div>
              <div className="form-group">
                <label>Your Rating (1-10)</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  step="0.1"
                  value={formData.user_rating}
                  onChange={(e) => setFormData({ ...formData, user_rating: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Your Review</label>
              <textarea
                value={formData.user_review}
                onChange={(e) => setFormData({ ...formData, user_review: e.target.value })}
                rows={4}
              />
            </div>

            <button type="submit" className="submit-btn">
              <Plus size={20} />
              Add to Collection
            </button>
          </form>
      </div>
    </div>
  );
};

export default AddMoviePage;
