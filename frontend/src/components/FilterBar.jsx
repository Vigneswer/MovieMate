import { Filter } from 'lucide-react';
import { WATCH_STATUS, PLATFORMS, STATUS_LABELS } from '../utils/constants';
import './FilterBar.css';

const FilterBar = ({ activeFilters, onFilterChange }) => {
  return (
    <div className="filter-bar">
      <div className="filter-section">
        <Filter size={18} className="filter-icon" />
        <span className="filter-label">Filter:</span>
      </div>

      <div className="filter-section">
        <span className="filter-sublabel">Status:</span>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${!activeFilters.status ? 'active' : ''}`}
            onClick={() => onFilterChange('status', null)}
          >
            All
          </button>
          {Object.values(WATCH_STATUS).map((status) => (
            <button
              key={status}
              className={`filter-btn ${activeFilters.status === status ? 'active' : ''}`}
              onClick={() => onFilterChange('status', status)}
            >
              {STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <span className="filter-sublabel">Type:</span>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${!activeFilters.contentType ? 'active' : ''}`}
            onClick={() => onFilterChange('contentType', null)}
          >
            All
          </button>
          <button
            className={`filter-btn ${activeFilters.contentType === 'movie' ? 'active' : ''}`}
            onClick={() => onFilterChange('contentType', 'movie')}
          >
            Movies
          </button>
          <button
            className={`filter-btn ${activeFilters.contentType === 'tv_show' ? 'active' : ''}`}
            onClick={() => onFilterChange('contentType', 'tv_show')}
          >
            TV Shows
          </button>
        </div>
      </div>

      <div className="filter-section">
        <button
          className={`filter-btn favorite-filter ${activeFilters.favorites ? 'active' : ''}`}
          onClick={() => onFilterChange('favorites', !activeFilters.favorites)}
        >
          ❤️ Favorites Only
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
