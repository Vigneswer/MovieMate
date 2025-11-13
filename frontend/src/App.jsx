import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import AddMoviePage from './pages/AddMoviePage';
import AnalyticsPage from './pages/AnalyticsPage';
import SearchResultsPage from './pages/SearchResultsPage';
import './App.css';

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMovieAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <Router>
      <div className="app">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #2dd4bf',
            },
            success: {
              iconTheme: {
                primary: '#2dd4bf',
                secondary: '#0f172a',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#0f172a',
              },
            },
          }}
        />
        
        <Header />
        
        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={<HomePage key={refreshTrigger} />} 
            />
            <Route 
              path="/add" 
              element={<AddMoviePage onMovieAdded={handleMovieAdded} />} 
            />
            <Route 
              path="/analytics" 
              element={<AnalyticsPage />} 
            />
            <Route 
              path="/search" 
              element={<SearchResultsPage />} 
            />
            <Route 
              path="/search/:type/:id" 
              element={<SearchResultsPage />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
