import { Film } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import SearchAutocomplete from './SearchAutocomplete';
import './Header.css';

const Header = () => {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <Film size={32} className="logo-icon" />
          <h1 className="logo-text">MovieMate</h1>
        </Link>
        
        <SearchAutocomplete />
        
        <nav className="header-nav">
          <Link
            to="/"
            className={`nav-tab ${isActive('/') && !location.pathname.startsWith('/add') && !location.pathname.startsWith('/analytics') ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/add"
            className={`nav-tab ${isActive('/add') ? 'active' : ''}`}
          >
            Add New
          </Link>
          <Link
            to="/analytics"
            className={`nav-tab ${isActive('/analytics') ? 'active' : ''}`}
          >
            Analytics
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
