import api from './api';

// ==================== COLLECTION ====================

export const getMovies = async (params = {}) => {
  const response = await api.get('/movies/', { params });
  return response.data;
};

export const getMovieById = async (id) => {
  const response = await api.get(`/movies/${id}`);
  return response.data;
};

export const searchMovies = async (query) => {
  const response = await api.get('/movies/search', { params: { q: query } });
  return response.data;
};

export const getMoviesByStatus = async (status) => {
  const response = await api.get(`/movies/status/${status}`);
  return response.data;
};

export const getMoviesByPlatform = async (platform) => {
  const response = await api.get(`/movies/platform/${platform}`);
  return response.data;
};

export const getFavorites = async () => {
  const response = await api.get('/movies/favorites');
  return response.data;
};

export const createMovie = async (data) => {
  const response = await api.post('/movies/', data);
  return response.data;
};

export const updateMovie = async (id, data) => {
  const response = await api.put(`/movies/${id}`, data);
  return response.data;
};

export const deleteMovie = async (id) => {
  await api.delete(`/movies/${id}`);
};

// ==================== ACTIONS ====================

export const toggleFavorite = async (id) => {
  const response = await api.patch(`/movies/${id}/favorite`);
  return response.data;
};

export const updateStatus = async (id, status) => {
  const response = await api.patch(`/movies/${id}/status`, null, {
    params: { new_status: status }
  });
  return response.data;
};

export const updateProgress = async (id, episodesWatched, currentSeason = null, currentEpisode = null) => {
  const params = {
    episodes_watched: episodesWatched,
    ...(currentSeason && { current_season: currentSeason }),
    ...(currentEpisode && { current_episode: currentEpisode }),
  };
  const response = await api.patch(`/movies/${id}/progress`, null, { params });
  return response.data;
};

// ==================== TMDB ====================

export const tmdbSearchMovies = async (query, page = 1) => {
  const response = await api.get('/movies/tmdb/search/movies', {
    params: { q: query, page }
  });
  return response.data;
};

export const tmdbSearchTVShows = async (query, page = 1) => {
  const response = await api.get('/movies/tmdb/search/tv', {
    params: { q: query, page }
  });
  return response.data;
};

export const tmdbGetMovieDetails = async (tmdbId) => {
  const response = await api.get(`/movies/tmdb/movie/${tmdbId}`);
  return response.data;
};

export const tmdbGetTVDetails = async (tmdbId) => {
  const response = await api.get(`/movies/tmdb/tv/${tmdbId}`);
  return response.data;
};

export const tmdbGetTrending = async (mediaType = 'all', timeWindow = 'week') => {
  const response = await api.get(`/movies/tmdb/trending/${mediaType}`, {
    params: { time_window: timeWindow }
  });
  return response.data;
};

export const tmdbGetPopularMovies = async (page = 1) => {
  const response = await api.get('/movies/tmdb/popular/movies', { params: { page } });
  return response.data;
};

export const tmdbGetPopularTV = async (page = 1) => {
  const response = await api.get('/movies/tmdb/popular/tv', { params: { page } });
  return response.data;
};

// ==================== ANALYTICS ====================

export const getStats = async () => {
  const response = await api.get('/movies/analytics/stats');
  return response.data;
};

export const getWatchTimeAnalytics = async (period = 'weekly') => {
  const response = await api.get('/movies/analytics/watch-time', { params: { period } });
  return response.data;
};

// ==================== RECOMMENDATIONS ====================

export const getRecommendations = async (count = 10) => {
  const response = await api.get('/movies/recommendations/surprise-me', { params: { count } });
  return response.data;
};
