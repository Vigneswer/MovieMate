import { useState, useEffect } from 'react';
import { X, Users, Calendar, Clock, Plus, Vote, CheckCircle, Trash2, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  createWatchParty,
  getWatchPartiesByMovie,
  getBestTime,
  addParticipant,
  castVote,
  updateWatchParty,
  deleteWatchParty
} from '../services/watchPartyService';
import './WatchPartyPlanner.css';

const WatchPartyPlanner = ({ movie, onClose }) => {
  const [step, setStep] = useState('list'); // 'list', 'create', 'vote'
  const [parties, setParties] = useState([]);
  const [selectedParty, setSelectedParty] = useState(null);
  const [loading, setLoading] = useState(false);

  // Create form state
  const [partyTitle, setPartyTitle] = useState('');
  const [hostName, setHostName] = useState('');
  const [notes, setNotes] = useState('');
  const [timeSlots, setTimeSlots] = useState(['']);
  const [participants, setParticipants] = useState([{ name: '', email: '' }]);

  // Voting state
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [votes, setVotes] = useState({});
  const [bestTime, setBestTime] = useState(null);

  useEffect(() => {
    if (movie) {
      loadWatchParties();
    }
  }, [movie]);

  const loadWatchParties = async () => {
    try {
      setLoading(true);
      const data = await getWatchPartiesByMovie(movie.id);
      setParties(data);
    } catch (error) {
      console.error('Failed to load watch parties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateParty = async (e) => {
    e.preventDefault();

    if (!partyTitle.trim() || !hostName.trim()) {
      toast.error('Please fill in required fields');
      return;
    }

    if (timeSlots.filter(ts => ts.trim()).length === 0) {
      toast.error('Please add at least one time slot');
      return;
    }

    if (participants.filter(p => p.name.trim()).length === 0) {
      toast.error('Please add at least one participant');
      return;
    }

    try {
      setLoading(true);
      const partyData = {
        movie_id: movie.id,
        title: partyTitle,
        host_name: hostName,
        notes: notes || null,
        time_slots: timeSlots.filter(ts => ts.trim()).map(ts => new Date(ts).toISOString()),
        participants: participants.filter(p => p.name.trim()).map(p => ({
          name: p.name,
          email: p.email || null
        }))
      };

      await createWatchParty(partyData);
      toast.success('Watch party created!');
      await loadWatchParties();
      setStep('list');
      resetForm();
    } catch (error) {
      toast.error('Failed to create watch party');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoteSubmit = async () => {
    if (!selectedParticipant) {
      toast.error('Please select a participant');
      return;
    }

    try {
      setLoading(true);
      for (const [timeSlotId, isAvailable] of Object.entries(votes)) {
        await castVote(selectedParty.id, {
          participant_id: parseInt(selectedParticipant),
          time_slot_id: parseInt(timeSlotId),
          is_available: isAvailable
        });
      }

      toast.success('Votes submitted!');
      await loadPartyDetails(selectedParty.id);
    } catch (error) {
      toast.error('Failed to submit votes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadPartyDetails = async (partyId) => {
    try {
      const parties = await getWatchPartiesByMovie(movie.id);
      const party = parties.find(p => p.id === partyId);
      setSelectedParty(party);
      
      // Load best time
      try {
        const best = await getBestTime(partyId);
        setBestTime(best);
      } catch (err) {
        setBestTime(null);
      }
    } catch (error) {
      console.error('Failed to load party details:', error);
    }
  };

  const handleFinalize = async (partyId, timeSlotId) => {
    if (!window.confirm('Finalize this time for the watch party?')) return;

    try {
      const timeSlot = selectedParty.time_slots.find(ts => ts.id === timeSlotId);
      await updateWatchParty(partyId, {
        selected_datetime: timeSlot.proposed_datetime,
        is_finalized: true
      });
      toast.success('Watch party finalized!');
      await loadWatchParties();
      setStep('list');
    } catch (error) {
      toast.error('Failed to finalize party');
      console.error(error);
    }
  };

  const handleDeleteParty = async (partyId) => {
    if (!window.confirm('Delete this watch party?')) return;

    try {
      await deleteWatchParty(partyId);
      toast.success('Watch party deleted');
      await loadWatchParties();
    } catch (error) {
      toast.error('Failed to delete party');
      console.error(error);
    }
  };

  const resetForm = () => {
    setPartyTitle('');
    setHostName('');
    setNotes('');
    setTimeSlots(['']);
    setParticipants([{ name: '', email: '' }]);
  };

  const addTimeSlot = () => setTimeSlots([...timeSlots, '']);
  const removeTimeSlot = (index) => setTimeSlots(timeSlots.filter((_, i) => i !== index));
  const updateTimeSlot = (index, value) => {
    const newSlots = [...timeSlots];
    newSlots[index] = value;
    setTimeSlots(newSlots);
  };

  const addParticipantField = () => setParticipants([...participants, { name: '', email: '' }]);
  const removeParticipant = (index) => setParticipants(participants.filter((_, i) => i !== index));
  const updateParticipant = (index, field, value) => {
    const newParticipants = [...participants];
    newParticipants[index][field] = value;
    setParticipants(newParticipants);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="watch-party-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <h2 className="watch-party-title">
          <Users size={28} />
          Watch Party Planner
        </h2>
        <p className="watch-party-subtitle">{movie.title}</p>

        {step === 'list' && (
          <div className="party-list">
            <button
              className="btn-primary"
              onClick={() => setStep('create')}
              style={{ marginBottom: '1.5rem' }}
            >
              <Plus size={18} />
              Create New Watch Party
            </button>

            {parties.length === 0 ? (
              <div className="empty-state">
                <Calendar size={48} />
                <p>No watch parties yet</p>
                <small>Create one to plan with friends!</small>
              </div>
            ) : (
              <div className="parties-grid">
                {parties.map((party) => (
                  <div key={party.id} className="party-card">
                    <div className="party-card-header">
                      <h4>{party.title}</h4>
                      {party.is_finalized && (
                        <span className="finalized-badge">
                          <CheckCircle size={16} />
                          Finalized
                        </span>
                      )}
                    </div>
                    <p className="party-host">Host: {party.host_name}</p>
                    <p className="party-info">
                      {party.participants.length} participant{party.participants.length !== 1 ? 's' : ''}
                      {' • '}
                      {party.time_slots.length} time slot{party.time_slots.length !== 1 ? 's' : ''}
                    </p>
                    {party.selected_datetime && (
                      <p className="party-time">
                        <Clock size={14} />
                        {new Date(party.selected_datetime).toLocaleString()}
                      </p>
                    )}
                    <div className="party-actions">
                      <button
                        className="btn-vote"
                        onClick={() => {
                          setSelectedParty(party);
                          loadPartyDetails(party.id);
                          setStep('vote');
                        }}
                      >
                        <Vote size={16} />
                        {party.is_finalized ? 'View Details' : 'Vote'}
                      </button>
                      <button
                        className="btn-delete-small"
                        onClick={() => handleDeleteParty(party.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 'create' && (
          <form onSubmit={handleCreateParty} className="create-party-form">
            <div className="form-group">
              <label>Party Title *</label>
              <input
                type="text"
                value={partyTitle}
                onChange={(e) => setPartyTitle(e.target.value)}
                placeholder="e.g., Friday Movie Night"
                required
              />
            </div>

            <div className="form-group">
              <label>Host Name *</label>
              <input
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>

            <div className="form-group">
              <label>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional details..."
                rows={3}
              />
            </div>

            <div className="form-section">
              <h4>
                <Calendar size={18} />
                Proposed Time Slots *
              </h4>
              {timeSlots.map((slot, index) => (
                <div key={index} className="input-row">
                  <input
                    type="datetime-local"
                    value={slot}
                    onChange={(e) => updateTimeSlot(index, e.target.value)}
                    required
                  />
                  {timeSlots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(index)}
                      className="btn-remove"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addTimeSlot} className="btn-add">
                <Plus size={16} />
                Add Time Slot
              </button>
            </div>

            <div className="form-section">
              <h4>
                <Users size={18} />
                Participants *
              </h4>
              {participants.map((participant, index) => (
                <div key={index} className="participant-row">
                  <input
                    type="text"
                    value={participant.name}
                    onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                    placeholder="Name"
                    required
                  />
                  <input
                    type="email"
                    value={participant.email}
                    onChange={(e) => updateParticipant(index, 'email', e.target.value)}
                    placeholder="Email (optional)"
                  />
                  {participants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeParticipant(index)}
                      className="btn-remove"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addParticipantField} className="btn-add">
                <Plus size={16} />
                Add Participant
              </button>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setStep('list');
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Watch Party'}
              </button>
            </div>
          </form>
        )}

        {step === 'vote' && selectedParty && (
          <div className="vote-section">
            {!selectedParty.is_finalized ? (
              <>
                <div className="form-group">
                  <label>Select Your Name *</label>
                  <select
                    value={selectedParticipant || ''}
                    onChange={(e) => setSelectedParticipant(e.target.value)}
                  >
                    <option value="">Choose participant...</option>
                    {selectedParty.participants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="time-slots-vote">
                  <h4>Select Your Available Times</h4>
                  {selectedParty.time_slots.map((slot) => (
                    <label key={slot.id} className="time-slot-option">
                      <input
                        type="checkbox"
                        checked={votes[slot.id] === true}
                        onChange={(e) => setVotes({ ...votes, [slot.id]: e.target.checked })}
                        disabled={!selectedParticipant}
                      />
                      <span className="time-slot-label">
                        <Clock size={16} />
                        {new Date(slot.proposed_datetime).toLocaleString()}
                        <span className="vote-count">({slot.votes} votes)</span>
                      </span>
                    </label>
                  ))}
                </div>

                <button
                  className="btn-primary"
                  onClick={handleVoteSubmit}
                  disabled={!selectedParticipant || Object.keys(votes).length === 0 || loading}
                  style={{ marginTop: '1.5rem' }}
                >
                  Submit Votes
                </button>
              </>
            ) : (
              <div className="finalized-info">
                <CheckCircle size={48} color="#10b981" />
                <h3>Watch Party Finalized!</h3>
                <p className="finalized-time">
                  <Clock size={20} />
                  {new Date(selectedParty.selected_datetime).toLocaleString()}
                </p>
                <p>All participants have been notified</p>
              </div>
            )}

            {bestTime && !selectedParty.is_finalized && (
              <div className="best-time-card">
                <h4>
                  <TrendingUp size={18} />
                  Recommended Best Time
                </h4>
                <p className="best-time-date">
                  {new Date(bestTime.proposed_datetime).toLocaleString()}
                </p>
                <p className="best-time-stats">
                  {bestTime.available_count} / {bestTime.total_participants} participants available
                  ({bestTime.availability_percentage}%)
                </p>
                <button
                  className="btn-finalize"
                  onClick={() => handleFinalize(selectedParty.id, bestTime.time_slot_id)}
                >
                  <CheckCircle size={16} />
                  Finalize This Time
                </button>
              </div>
            )}

            <button
              className="btn-secondary"
              onClick={() => setStep('list')}
              style={{ marginTop: '1rem' }}
            >
              Back to List
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchPartyPlanner;
