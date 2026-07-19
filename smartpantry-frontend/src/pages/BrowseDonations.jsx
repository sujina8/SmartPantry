import { useState, useEffect } from 'react';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

const CATEGORIES = ['Fresh', 'Canned', 'Frozen', 'Dairy'];

export default function BrowseDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkedCategories, setCheckedCategories] = useState([]);
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get('/donations/')
      .then((res) => setDonations(res.data))
      .catch((err) => console.error('Failed to load donations', err))
      .finally(() => setLoading(false));
  }, []);

  const toggleCategory = (cat) => {
    setCheckedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleClaim = async (id) => {
    try {
      await api.post(`/donations/${id}/claim/`);
      setDonations((prev) => prev.map((d) => (d.id === id ? { ...d, status: 'claimed' } : d)));
    } catch (err) {
      console.error('Failed to claim donation', err);
    }
  };

  return (
    <div className="sp-donations">
      <div className="sp-app-layout">
        <Sidebar active="donations" />

        <main className="sp-donations-main">
          <div className="sp-page-head">
            <div className="sp-freshness-bar" style={{ margin: '0 auto 20px' }}><span></span><span></span><span></span></div>
            <h1>Browse food donations</h1>
            <p>Filter and claim food items near you.</p>
          </div>

          <div className="sp-donations-grid">
            <aside className="sp-filters">
              <h3>Filters</h3>

              <div className="sp-filter-group">
                <label>Categories</label>
                {CATEGORIES.map((cat) => (
                  <div className="sp-checkbox-row" key={cat}>
                    <input
                      type="checkbox"
                      id={`cat-${cat}`}
                      checked={checkedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                    />
                    <label htmlFor={`cat-${cat}`} style={{ fontWeight: 400, margin: 0 }}>{cat}</label>
                  </div>
                ))}
              </div>

              <div className="sp-filter-group">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  type="text"
                  placeholder="Enter city or ZIP code"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="sp-filter-actions">
                <button className="sp-btn sp-btn-secondary" onClick={() => { setCheckedCategories([]); setLocation(''); }}>Clear</button>
                <button className="sp-btn sp-btn-primary">Apply</button>
              </div>
            </aside>

            <section>
              {loading ? (
                <p>Loading donations...</p>
              ) : (
                <>
                  <p className="sp-donations-count">Showing {donations.length} items</p>
                  <div className="sp-donation-cards">
                    {donations.map((item) => (
                      <div className="sp-donation-card" key={item.id}>
                        <div className="sp-donation-image">
                          <span className="sp-donation-tag">{item.category}</span>
                        </div>
                        <div className="sp-donation-body">
                          <h4>{item.food_item?.name || item.name}</h4>
                          <p className="sp-donation-meta">Qty: {item.quantity}</p>
                          <p className="sp-donation-expiry">Expires: {item.expiry_date}</p>
                          <button
                            className="sp-btn sp-btn-primary"
                            disabled={item.status === 'claimed'}
                            onClick={() => handleClaim(item.id)}
                          >
                            {item.status === 'claimed' ? 'Claimed' : 'Claim'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="sp-pagination">
                    <button className="sp-page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>&larr;</button>
                    <button className={`sp-page-btn ${page === 1 ? 'active' : ''}`} onClick={() => setPage(1)}>1</button>
                    <button className={`sp-page-btn ${page === 2 ? 'active' : ''}`} onClick={() => setPage(2)}>2</button>
                    <button className="sp-page-btn" onClick={() => setPage(page + 1)}>&rarr;</button>
                  </div>
                </>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}