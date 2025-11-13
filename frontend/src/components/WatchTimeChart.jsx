import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Clock, TrendingUp } from 'lucide-react';
import { getWatchTimeAnalytics } from '../services/movieService';
import { toast } from 'react-hot-toast';
import './WatchTimeChart.css';

const WatchTimeChart = () => {
  const [period, setPeriod] = useState('weekly');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    fetchWatchTimeData();
  }, [period]);

  const fetchWatchTimeData = async () => {
    try {
      setLoading(true);
      const result = await getWatchTimeAnalytics(period);
      setData(result.data);
      
      // Calculate total hours
      const total = result.data.reduce((sum, item) => sum + item.watch_time_hours, 0);
      setTotalHours(total);
    } catch (error) {
      toast.error('Failed to load watch time data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].payload.period}</p>
          <p className="tooltip-value">
            <Clock size={14} />
            {payload[0].value.toFixed(1)} hours
          </p>
          <p className="tooltip-count">
            {payload[0].payload.content_count} item{payload[0].payload.content_count !== 1 ? 's' : ''} watched
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="watch-time-loading">
        <div className="spinner"></div>
        <p>Loading watch time data...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="watch-time-empty">
        <Clock size={48} />
        <p>No watch time data available yet</p>
        <small>Complete some movies or TV shows to see your watch time analytics</small>
      </div>
    );
  }

  return (
    <div className="watch-time-chart">
      <div className="chart-header">
        <div className="chart-title-section">
          <h3>
            <TrendingUp size={24} />
            Watch Time Analytics
          </h3>
          <p className="chart-subtitle">
            Total: <span className="highlight">{totalHours.toFixed(1)} hours</span> watched
          </p>
        </div>
        <div className="period-selector">
          <button
            className={`period-btn ${period === 'weekly' ? 'active' : ''}`}
            onClick={() => setPeriod('weekly')}
          >
            Weekly
          </button>
          <button
            className={`period-btn ${period === 'monthly' ? 'active' : ''}`}
            onClick={() => setPeriod('monthly')}
          >
            Monthly
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="period"
            angle={-45}
            textAnchor="end"
            height={100}
            stroke="#94a3b8"
            style={{ fontSize: '0.75rem' }}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: '0.875rem' }}
            label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(45, 212, 191, 0.1)' }} />
          <Bar
            dataKey="watch_time_hours"
            fill="#2dd4bf"
            radius={[8, 8, 0, 0]}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="chart-stats">
        <div className="stat">
          <span className="stat-label">Average per {period === 'weekly' ? 'week' : 'month'}</span>
          <span className="stat-value">
            {data.length > 0 ? (totalHours / data.length).toFixed(1) : 0} hrs
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Most active {period === 'weekly' ? 'week' : 'month'}</span>
          <span className="stat-value">
            {data.length > 0
              ? data.reduce((max, item) => (item.watch_time_hours > max.watch_time_hours ? item : max)).period
              : 'N/A'}
          </span>
        </div>
        <div className="stat">
          <span className="stat-label">Total content watched</span>
          <span className="stat-value">
            {data.reduce((sum, item) => sum + item.content_count, 0)} items
          </span>
        </div>
      </div>
    </div>
  );
};

export default WatchTimeChart;
