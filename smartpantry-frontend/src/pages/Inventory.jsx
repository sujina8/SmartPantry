import { useState, useEffect } from 'react';
import API from '../services/api';
import Sidebar from '../components/Sidebar';

const CATEGORIES = ['others', 'vegetables', 'fruits', 'dairy', 'meat', 'grains', 'beverages', 'snacks'];
const STORAGE_LOCATIONS = ['pantry', 'fridge', 'freezer', 'counter'];

const emptyForm = {
  name: '',
  quantity: '',
  unit: 'pcs',
  category: 'others',
  storage_location: 'pantry',
  expiry_date: '',
  notes: '',
};

const emptyDonateForm = { description: '', pickup_info: '' };

function getStatus(item) {
  const today = new Date().toISOString().split('T')[0];
  if (item.expiry_date < today) return 'expired';
  if (item.is_expiring_soon) return 'expiring';
  return 'good';
}

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donatingItem, setDonatingItem] = useState(null);
  const [donateForm, setDonateForm] = useState(emptyDonateForm);
  const [donateError, setDonateError] = useState('');

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await API.get('/inventory/');
      setItems(res.data);
    } catch {
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      category: item.category,
      storage_location: item.storage_location,
      expiry_date: item.expiry_date,
      notes: item.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await API.patch(`/inventory/${editingId}/`, formData);
        setSuccess('Food item updated successfully!');
      } else {
        await API.post('/inventory/', formData);
        setSuccess('Food item added successfully!');
      }
      setShowModal(false);
      fetchItems();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to save item. Please check all fields.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await API.delete(`/inventory/${id}/`);
      fetchItems();
    } catch {
      setError('Failed to delete item');
    }
  };

  const openDonateModal = (item) => {
    setDonatingItem(item);
    setDonateForm(emptyDonateForm);
    setDonateError('');
    setShowDonateModal(true);
  };

  const handleDonateChange = (e) => {
    setDonateForm({ ...donateForm, [e.target.name]: e.target.value });
  };

  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    setDonateError('');
    try {
      await API.post('/donations/', {
        food_item: donatingItem.id,
        description: donateForm.description,
        pickup_info: donateForm.pickup_info,
      });
      setShowDonateModal(false);
      setSuccess(`${donatingItem.name} was listed for donation!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setDonateError('Failed to list this item for donation. Please check the details and try again.');
    }
  };

  const filteredItems = items.filter((item) => {
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    const status = getStatus(item);
    if (statusFilter === 'expiring' && status !== 'expiring') return false;
    if (statusFilter === 'expired' && status !== 'expired') return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <p style={{ padding: 48 }}>Loading inventory...</p>;

  return (
    <div className="sp-donations">
      <div className="sp-app-layout">
        <Sidebar active="inventory" />

        <main className="sp-donations-main">
          <div className="sp-page-head">
            <div className="sp-freshness-bar" style={{ margin: '0 auto 20px' }}><span></span><span></span><span></span></div>
            <h1>My Food Inventory</h1>
            <p>Track items, quantities, and expiry dates — stay ahead of waste.</p>
            <button className="sp-btn sp-btn-primary" style={{ marginTop: 16 }} onClick={openAddModal}>
              + Add Item
            </button>
          </div>

          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}

          <div className="sp-donations-grid">
            <aside className="sp-filters">
              <h3>Filters</h3>

              <div className="sp-filter-group">
                <label>Category</label>
                <div className="sp-pill-row">
                  {['all', ...CATEGORIES].map((cat) => (
                    <button
                      key={cat}
                      className={`sp-pill ${categoryFilter === cat ? 'active' : ''}`}
                      onClick={() => setCategoryFilter(cat)}
                    >
                      {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sp-filter-group">
                <label>Status</label>
                <div className="sp-pill-row">
                  {['all', 'expiring', 'expired'].map((s) => (
                    <button
                      key={s}
                      className={`sp-pill ${statusFilter === s ? 'active' : ''}`}
                      onClick={() => setStatusFilter(s)}
                    >
                      {s === 'all' ? 'All' : s === 'expiring' ? 'Expiring Soon' : 'Expired'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sp-filter-group">
                <label htmlFor="search">Search</label>
                <input
                  id="search"
                  type="text"
                  placeholder="Search by item name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </aside>

            <section>
              {filteredItems.length === 0 ? (
                <p className="sp-dash-empty">No food items match your filters.</p>
              ) : (
                <table className="sp-inventory-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Quantity</th>
                      <th>Category</th>
                      <th>Expiry Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => {
                      const status = getStatus(item);
                      return (
                        <tr key={item.id}>
                          <td>{item.name}</td>
                          <td>{item.quantity} {item.unit}</td>
                          <td>{item.category}</td>
                          <td>{item.expiry_date}</td>
                          <td>
                            {status === 'expired' && <span className="sp-badge sp-badge-red">Expired</span>}
                            {status === 'expiring' && <span className="sp-badge sp-badge-amber">Expiring Soon</span>}
                            {status === 'good' && <span className="sp-badge sp-badge-green">Good</span>}
                          </td>
                          <td>
                            <button className="sp-icon-btn sp-icon-btn-donate" onClick={() => openDonateModal(item)}>Donate</button>
                            <button className="sp-icon-btn" onClick={() => openEditModal(item)}>Edit</button>
                            <button className="sp-icon-btn sp-icon-btn-delete" onClick={() => handleDelete(item.id)}>Delete</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </section>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="sp-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="sp-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingId ? 'Edit Food Item' : 'Add New Food Item'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="sp-modal-grid">
                <div className="sp-form-field">
                  <label>Item Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Olive Oil" required />
                </div>
                <div className="sp-form-field">
                  <label>Quantity</label>
                  <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="e.g., 2" required />
                </div>
                <div className="sp-form-field">
                  <label>Unit</label>
                  <input type="text" name="unit" value={formData.unit} onChange={handleChange} placeholder="pcs, kg, L" />
                </div>
                <div className="sp-form-field">
                  <label>Expiry Date</label>
                  <input type="date" name="expiry_date" value={formData.expiry_date} onChange={handleChange} required />
                </div>
                <div className="sp-form-field">
                  <label>Category</label>
                  <select name="category" value={formData.category} onChange={handleChange}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="sp-form-field">
                  <label>Storage Location</label>
                  <select name="storage_location" value={formData.storage_location} onChange={handleChange}>
                    {STORAGE_LOCATIONS.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="sp-form-field">
                <label>Notes (optional)</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Any notes..." />
              </div>
              <div className="sp-register-actions">
                <button type="button" className="sp-btn sp-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="sp-btn sp-btn-primary">{editingId ? 'Save Changes' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDonateModal && donatingItem && (
        <div className="sp-modal-overlay" onClick={() => setShowDonateModal(false)}>
          <div className="sp-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Donate "{donatingItem.name}"</h3>
            <p className="sp-dash-empty" style={{ marginBottom: 16 }}>
              This will list the item on the Donations page for others to claim.
            </p>
            <form onSubmit={handleDonateSubmit}>
              {donateError && <p className="error">{donateError}</p>}
              <div className="sp-form-field">
                <label>Description (optional)</label>
                <textarea
                  name="description"
                  value={donateForm.description}
                  onChange={handleDonateChange}
                  placeholder="e.g., Half loaf, still fresh, opened yesterday"
                />
              </div>
              <div className="sp-form-field">
                <label>Pickup Info (optional)</label>
                <input
                  type="text"
                  name="pickup_info"
                  value={donateForm.pickup_info}
                  onChange={handleDonateChange}
                  placeholder="e.g., Available after 5pm, Block C lobby"
                />
              </div>
              <div className="sp-register-actions">
                <button type="button" className="sp-btn sp-btn-secondary" onClick={() => setShowDonateModal(false)}>Cancel</button>
                <button type="submit" className="sp-btn sp-btn-primary">List for Donation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}