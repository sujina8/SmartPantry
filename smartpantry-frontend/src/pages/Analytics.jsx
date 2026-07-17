import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const PIE_COLORS = ['#2d6a4f', '#6f8f7f', '#c9a227', '#b5543a', '#8ba888'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/analytics/')
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ padding: 48 }}>Loading analytics...</p>;
  if (error) return <p style={{ padding: 48 }} className="error">{error}</p>;
  if (!data) return null;

  const barData = {
    labels: data.weekly_trend.map((w) => w.week),
    datasets: [
      {
        label: 'Donations',
        data: data.weekly_trend.map((w) => w.count),
        backgroundColor: '#2d6a4f',
        borderRadius: 4,
      },
    ],
  };

  const pieData = {
    labels: data.category_breakdown.map((c) => c.category),
    datasets: [
      {
        data: data.category_breakdown.map((c) => c.count),
        backgroundColor: data.category_breakdown.map((_, i) => PIE_COLORS[i % PIE_COLORS.length]),
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 12 } } } },
  };

  return (
    <div className="sp-donations">
      <div className="sp-app-layout">
        <aside className="sp-sidebar">
          <Link to="/dashboard" className="sp-sidebar-link">Dashboard</Link>
          <Link to="/analytics" className="sp-sidebar-link active">Food Analytics</Link>
          <Link to="/donations" className="sp-sidebar-link">Donations</Link>
          <Link to="/inventory" className="sp-sidebar-link">Pantry Items</Link>
        </aside>

        <main className="sp-donations-main">
          <div className="sp-page-head">
            <div className="sp-freshness-bar" style={{ margin: '0 auto 20px' }}><span></span><span></span><span></span></div>
            <h1>My Food Analytics</h1>
            <p>Review your saved food and donation impact over time.</p>
          </div>

          <div className="sp-analytics-summary">
            <div className="sp-stat-card">
              <p className="sp-stat-label">Items Tracked</p>
              <p className="sp-stat-value">{data.total_items}</p>
            </div>
            <div className="sp-stat-card">
              <p className="sp-stat-label">Total Donations</p>
              <p className="sp-stat-value">{data.total_donated}</p>
            </div>
            <div className="sp-stat-card">
              <p className="sp-stat-label">Expiring Soon</p>
              <p className="sp-stat-value">{data.expiring_soon}</p>
            </div>
          </div>

          <div className="sp-analytics-charts">
            <div className="sp-chart-card">
              <h3>Donations Per Week</h3>
              {data.weekly_trend.length === 0 ? (
                <p className="sp-dash-empty">No donation history yet.</p>
              ) : (
                <div className="sp-chart-wrap"><Bar data={barData} options={chartOptions} /></div>
              )}
            </div>
            <div className="sp-chart-card">
              <h3>Donation Categories</h3>
              {data.category_breakdown.length === 0 ? (
                <p className="sp-dash-empty">No donations yet.</p>
              ) : (
                <div className="sp-chart-wrap"><Pie data={pieData} options={pieOptions} /></div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}