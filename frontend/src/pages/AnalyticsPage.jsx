import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { BarChart3, TrendingUp, Clock, Star } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import WatchTimeChart from '../components/WatchTimeChart';
import { getStats } from '../services/movieService';
import './AnalyticsPage.css';

const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await getStats();
      setStats(data);
    } catch (error) {
      toast.error('Failed to load statistics');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <h2 className="page-title">
          <BarChart3 size={32} />
          Collection Analytics
        </h2>
        <p className="page-subtitle">Insights about your movie collection</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.total_content}</h3>
            <p>Total Content</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.movies}</h3>
            <p>Movies</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.tv_shows}</h3>
            <p>TV Shows</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.completed}</h3>
            <p>Completed</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.watching}</h3>
            <p>Watching</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.wishlist}</h3>
            <p>Wishlist</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <h3>{stats.favorites}</h3>
            <p>Favorites</p>
          </div>
        </div>

        <div className="stat-card accent">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>{stats.total_watch_time_hours}h</h3>
            <p>Watch Time</p>
          </div>
        </div>
      </div>

      {stats.genre_distribution && Object.keys(stats.genre_distribution).length > 0 && (
        <div className="analytics-section">
          <h3 className="section-title">Genre Distribution</h3>
          <div className="genre-list">
            {Object.entries(stats.genre_distribution)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([genre, count]) => (
                <div key={genre} className="genre-item">
                  <span className="genre-name">{genre}</span>
                  <div className="genre-bar">
                    <div 
                      className="genre-fill"
                      style={{ 
                        width: `${(count / Math.max(...Object.values(stats.genre_distribution))) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="genre-count">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {stats.platform_distribution && Object.keys(stats.platform_distribution).length > 0 && (
        <div className="analytics-section">
          <h3 className="section-title">Platform Distribution</h3>
          <div className="platform-grid">
            {Object.entries(stats.platform_distribution).map(([platform, count]) => (
              <div key={platform} className="platform-card">
                <h4>{count}</h4>
                <p>{platform}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <WatchTimeChart />
    </div>
  );
};

export default AnalyticsPage;
