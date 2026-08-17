import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from '../components/Sidebar';

const CATEGORY_OPTIONS = [
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'fruits', label: 'Fruits' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'meat', label: 'Meat' },
  { value: 'grains', label: 'Grains' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'others', label: 'Others' },
];

export default function BrowseDonations() {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkedCategories, setCheckedCategories] = useState([]);
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);
  const [selectedDonation, setSelectedDonation] = useState(null);

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

    setDonations((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: "claimed" } : d
      )
    );
  } catch (err) {
    console.log(err.response);
    console.log(err.response?.data);
    alert(JSON.stringify(err.response?.data));
  }
};

  const filteredDonations = donations.filter((item) => {
    const category = (item.food_item_detail?.category || '').toLowerCase();
    const categoryMatch = checkedCategories.length === 0 || checkedCategories.includes(category);
    const locationText = `${item.pickup_info || ''} ${item.food_item_detail?.location || ''}`.toLowerCase();
    const locationMatch = !location || locationText.includes(location.toLowerCase());
    return categoryMatch && locationMatch;
  });

  const openDetails = (item) => {
    setSelectedDonation(item);
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
                {CATEGORY_OPTIONS.map((cat) => (
                  <div className="sp-checkbox-row" key={cat.value}>
                    <input
                      type="checkbox"
                      id={`cat-${cat.value}`}
                      checked={checkedCategories.includes(cat.value)}
                      onChange={() => toggleCategory(cat.value)}
                    />
                    <label htmlFor={`cat-${cat.value}`} style={{ fontWeight: 400, margin: 0 }}>{cat.label}</label>
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
              ) : filteredDonations.length === 0 ? (
                <p className="sp-dash-empty">No items found. Please adjust your filters</p>
              ) : (
                <>
                  <p className="sp-donations-count">Showing {filteredDonations.length} items</p>
                  <div className="sp-donation-cards">
                    {filteredDonations.map((item) => {
                      const food = item.food_item_detail;
                      return (
                        <div className="sp-donation-card" key={item.id}>
                          <div className="sp-donation-image">
                            {food?.image ? (
                              <img
                                src={food.image}
                                alt={food.name}
                                className="sp-donation-img"
                              />
                            ) : (
                              <div className="sp-no-image">No image</div>
                            )}
                            <span className="sp-donation-tag">{food?.category}</span>
                          </div>
                          <div className="sp-donation-body">
                            <h4>{food?.name || 'Unnamed item'}</h4>
                            <p className="sp-donation-meta">Qty: {food?.quantity} {food?.unit}</p>
                            <p className="sp-donation-expiry">Expires: {food?.expiry_date}</p>
                            <p className="sp-donation-donor">Donated by: {item.donor_full_name || item.donor_email}</p>
                            <p className="sp-donation-contact">Contact: {item.donor_contact || item.donor_phone || item.donor_email || 'Not provided'}</p>
                            <p className="sp-donation-location">Location: {item.pickup_info || 'Not specified'}</p>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                              <button className="sp-btn sp-btn-secondary" onClick={() => openDetails(item)}>View details</button>
                              <button className="sp-btn sp-btn-primary" disabled={item.status === 'claimed'} onClick={() => handleClaim(item.id)}>
                                {item.status === 'claimed' ? 'Claimed' : 'Claim'}
                              </button>
                              <button className="sp-btn sp-btn-secondary" onClick={() => navigate('/mealplan')}>Plan meal</button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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

      {selectedDonation && (
        <div className="sp-modal-overlay" onClick={() => setSelectedDonation(null)}>
          <div className="sp-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedDonation.food_item_detail?.name || 'Food item details'}</h3>
            <div className="sp-modal-grid">
              <div className="sp-form-field">
                <label>Category</label>
                <input value={selectedDonation.food_item_detail?.category || ''} readOnly />
              </div>
              <div className="sp-form-field">
                <label>Storage</label>
                <input value={selectedDonation.food_item_detail?.storage_location || 'Not specified'} readOnly />
              </div>
              <div className="sp-form-field">
                <label>Quantity</label>
                <input value={`${selectedDonation.food_item_detail?.quantity || ''} ${selectedDonation.food_item_detail?.unit || ''}`} readOnly />
              </div>
              <div className="sp-form-field">
                <label>Expiry Date</label>
                <input value={selectedDonation.food_item_detail?.expiry_date || ''} readOnly />
              </div>
              <div className="sp-form-field" style={{ gridColumn: '1 / -1' }}>
                <label>Pickup Info</label>
                <textarea value={selectedDonation.pickup_info || 'Not specified'} readOnly />
              </div>
              <div className="sp-form-field" style={{ gridColumn: '1 / -1' }}>
                <label>Contact</label>
                <input value={selectedDonation.donor_contact || selectedDonation.donor_phone || selectedDonation.donor_email || 'Not provided'} readOnly />
              </div>
            </div>
            <div className="sp-register-actions">
              <button type="button" className="sp-btn sp-btn-secondary" onClick={() => setSelectedDonation(null)}>Close</button>
              <button type="button" className="sp-btn sp-btn-primary" onClick={() => handleClaim(selectedDonation.id)} disabled={selectedDonation.status === 'claimed'}>
                {selectedDonation.status === 'claimed' ? 'Claimed' : 'Claim item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
