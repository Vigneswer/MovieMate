import api from './api';

// Create a new watch party
export const createWatchParty = async (data) => {
  const response = await api.post('/watch-parties/', data);
  return response.data;
};

// Get all watch parties
export const getAllWatchParties = async () => {
  const response = await api.get('/watch-parties/');
  return response.data;
};

// Get watch party by ID
export const getWatchParty = async (partyId) => {
  const response = await api.get(`/watch-parties/${partyId}`);
  return response.data;
};

// Get watch parties for a specific movie
export const getWatchPartiesByMovie = async (movieId) => {
  const response = await api.get(`/watch-parties/movie/${movieId}`);
  return response.data;
};

// Update watch party
export const updateWatchParty = async (partyId, data) => {
  const response = await api.put(`/watch-parties/${partyId}`, data);
  return response.data;
};

// Delete watch party
export const deleteWatchParty = async (partyId) => {
  await api.delete(`/watch-parties/${partyId}`);
};

// Add participant
export const addParticipant = async (partyId, participantData) => {
  const response = await api.post(`/watch-parties/${partyId}/participants`, participantData);
  return response.data;
};

// Cast vote
export const castVote = async (partyId, voteData) => {
  const response = await api.post(`/watch-parties/${partyId}/votes`, voteData);
  return response.data;
};

// Get best time
export const getBestTime = async (partyId) => {
  const response = await api.get(`/watch-parties/${partyId}/best-time`);
  return response.data;
};
