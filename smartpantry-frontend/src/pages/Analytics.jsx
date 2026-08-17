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
  const [categoryFilter, setCategoryFilter] = useState('')
  const [periodFilter, setPeriodFilter] = useState('all')

  useEffect(() => {
    setLoading(true)
    API.get('/analytics/', {
      params: {
        category: categoryFilter || undefined,
        period: periodFilter,
      },
    })
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load analytics'))
      .finally(() => setLoading(false))
  }, [categoryFilter, periodFilter])

  if (loading) return <p style={{ padding: 48 }}>Loading analytics...</p>

  const weeklyTrend = data?.weekly_trend || []
  const itemsLoggedTrend = data?.items_logged_trend || []
  const categoryBreakdown = data?.category_breakdown || []
  const hasAnyActivity =
    (data?.total_items ?? 0) > 0 ||
    (data?.total_donated ?? 0) > 0 ||
    (data?.items_used ?? 0) > 0 ||
    (data?.food_saved_from_waste ?? 0) > 0

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

  const itemsLoggedData = {
    labels: itemsLoggedTrend.map((w) => w.week),
    datasets: [
      {
        label: 'Items Logged',
        data: itemsLoggedTrend.map((w) => w.count),
        backgroundColor: '#c9a227',
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

          {!hasAnyActivity && !categoryFilter ? (
            <section className="sp-dash-section" style={{ textAlign: 'center' }}>
              <p className="sp-dash-empty">
                You haven't logged any food-saving activity yet. Add items to your Inventory or make your first donation to start tracking your impact here.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
                <a href="/inventory" className="sp-btn sp-btn-secondary">Go to Inventory</a>
                <a href="/donations" className="sp-btn sp-btn-primary">Browse Donations</a>
              </div>
            </section>
          ) : (
            <>
              <section className="sp-dash-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <h2 className="sp-dash-heading" style={{ margin: 0 }}>Summary</h2>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div className="sp-form-field" style={{ minWidth: 180, margin: 0 }}>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                      >
                        <option value="">All Categories</option>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sp-form-field" style={{ minWidth: 150, margin: 0 }}>
                      <select
                        value={periodFilter}
                        onChange={(e) => setPeriodFilter(e.target.value)}
                      >
                        <option value="all">All time</option>
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="sp-stat-cards">
                  <div className="sp-stat-card">
                    <p className="sp-stat-label">Food Saved From Waste</p>
                    <p className="sp-stat-value">{data?.food_saved_from_waste ?? 0}</p>
                  </div>
                  <div className="sp-stat-card">
                    <p className="sp-stat-label">Items Used</p>
                    <p className="sp-stat-value">{data?.items_used ?? 0}</p>
                  </div>
                  <div className="sp-stat-card">
                    <p className="sp-stat-label">Number of Donations</p>
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
                    <p className="sp-chart-title">Items Logged Per Week</p>
                    {itemsLoggedTrend.length === 0 ? (
                      <p className="sp-dash-empty">No inventory activity yet.</p>
                    ) : (
                      <Bar data={itemsLoggedData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                    )}
                  </div>
                  <div className="sp-dash-panel">
                    <p className="sp-chart-title">Donations Per Week</p>
                    {weeklyTrend.length === 0 ? (
                      <p className="sp-dash-empty">No donation activity yet{categoryFilter ? ' for this category' : ''}.</p>
                    ) : (
                      <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                    )}
                  </div>
                  <div className="sp-dash-panel">
                    <p className="sp-chart-title">Donation Categories</p>
                    {categoryBreakdown.length === 0 ? (
                      <p className="sp-dash-empty">No donations yet{categoryFilter ? ' for this category' : ''}.</p>
                    ) : (
                      <Pie data={pieData} options={{ responsive: true }} />
                    )}
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  )
}