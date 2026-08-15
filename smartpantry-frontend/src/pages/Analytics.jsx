import { useEffect, useState } from 'react'
import { Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
import API from '../services/api'
import Sidebar from '../components/Sidebar'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend)

const CATEGORY_LABELS = {
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  dairy: 'Dairy',
  meat: 'Meat',
  grains: 'Grains',
  beverages: 'Beverages',
  snacks: 'Snacks',
  others: 'Others',
}

const CATEGORY_COLORS = [
  '#2d6a4f', '#c9a227', '#b5543a', '#5c6b62',
  '#74a58a', '#e0b94f', '#8a5a44', '#a8b5ac',
]

export default function Analytics() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    API.get('/analytics/')
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ padding: 48 }}>Loading analytics...</p>

  const weeklyTrend = data?.weekly_trend || []
  const categoryBreakdown = data?.category_breakdown || []

  const barData = {
    labels: weeklyTrend.map((w) => w.week),
    datasets: [
      {
        label: 'Donations',
        data: weeklyTrend.map((w) => w.count),
        backgroundColor: '#2d6a4f',
        borderRadius: 6,
      },
    ],
  }

  const pieData = {
    labels: categoryBreakdown.map((c) => CATEGORY_LABELS[c.category] || c.category),
    datasets: [
      {
        data: categoryBreakdown.map((c) => c.count),
        backgroundColor: categoryBreakdown.map((_, i) => CATEGORY_COLORS[i % CATEGORY_COLORS.length]),
        borderWidth: 0,
      },
    ],
  }

  return (
    <div className="sp-donations">
      <div className="sp-app-layout">
        <Sidebar active="analytics" />

        <main className="sp-dashboard">
          <div className="sp-page-head">
            <div className="sp-freshness-bar"><span></span><span></span><span></span></div>
            <h1>My Food Analytics</h1>
            <p>Review your saved food and donation impact over time.</p>
          </div>

          {error && <p className="error">{error}</p>}

          <section className="sp-dash-section">
            <h2 className="sp-dash-heading">Summary</h2>
            <div className="sp-stat-cards">
              <div className="sp-stat-card">
                <p className="sp-stat-label">Items Tracked</p>
                <p className="sp-stat-value">{data?.total_items ?? 0}</p>
              </div>
              <div className="sp-stat-card">
                <p className="sp-stat-label">Total Donations</p>
                <p className="sp-stat-value">{data?.total_donated ?? 0}</p>
              </div>
              <div className="sp-stat-card">
                <p className="sp-stat-label">Expiring Soon</p>
                <p className="sp-stat-value">{data?.expiring_soon ?? 0}</p>
              </div>
            </div>
          </section>

          <section className="sp-dash-section">
            <h2 className="sp-dash-heading">Analytics Charts</h2>
            <div className="sp-dash-panels">
              <div className="sp-dash-panel">
                <p className="sp-chart-title">Donations Per Week</p>
                {weeklyTrend.length === 0 ? (
                  <p className="sp-dash-empty">No donation activity yet.</p>
                ) : (
                  <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                )}
              </div>
              <div className="sp-dash-panel">
                <p className="sp-chart-title">Donation Categories</p>
                {categoryBreakdown.length === 0 ? (
                  <p className="sp-dash-empty">No donations yet.</p>
                ) : (
                  <Pie data={pieData} options={{ responsive: true }} />
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}