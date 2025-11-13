export const CONTENT_TYPES = {
  MOVIE: 'movie',
  TV_SHOW: 'tv_show',
};

export const WATCH_STATUS = {
  WISHLIST: 'wishlist',
  WATCHING: 'watching',
  COMPLETED: 'completed',
};

export const PLATFORMS = {
  NETFLIX: 'Netflix',
  PRIME_VIDEO: 'Prime Video',
  DISNEY_PLUS: 'Disney+',
  HBO_MAX: 'HBO Max',
  HULU: 'Hulu',
  APPLE_TV: 'Apple TV+',
  YOUTUBE: 'YouTube',
  THEATER: 'Theater',
  OTHER: 'Other',
};

export const STATUS_LABELS = {
  [WATCH_STATUS.WISHLIST]: 'Wishlist',
  [WATCH_STATUS.WATCHING]: 'Watching',
  [WATCH_STATUS.COMPLETED]: 'Completed',
};

export const STATUS_COLORS = {
  [WATCH_STATUS.WISHLIST]: '#fbbf24', // amber
  [WATCH_STATUS.WATCHING]: '#3b82f6', // blue
  [WATCH_STATUS.COMPLETED]: '#10b981', // green
};

export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const getImageUrl = (path, size = 'w500') => {
  if (!path) return '/placeholder-poster.png';
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const formatRuntime = (minutes) => {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getProgressPercentage = (episodesWatched, totalEpisodes) => {
  if (!totalEpisodes || totalEpisodes === 0) return 0;
  return Math.round((episodesWatched / totalEpisodes) * 100);
};
