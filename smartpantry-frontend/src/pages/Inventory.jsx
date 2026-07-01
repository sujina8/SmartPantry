import { useState, useEffect } from 'react'
import API from '../services/api'

const Inventory = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: 'pcs',
    category: 'others',
    storage_location: 'pantry',
    expiry_date: '',
    notes: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch all food items when page loads
  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await API.get('/inventory/')
      setItems(res.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load inventory')
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await API.post('/inventory/', formData)
      setSuccess('Food item added successfully!')
      setShowForm(false)
      fetchItems()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to add item. Please check all fields.')
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await API.delete(`/inventory/${id}/`)
        fetchItems()
      } catch (err) {
        setError('Failed to delete item')
      }
    }
  }

  if (loading) return <p>Loading inventory...</p>

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h2>My Food Inventory</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-add">
          {showForm ? 'Cancel' : '+ Add Food Item'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="food-form">
          <h3>Add New Food Item</h3>
          <input type="text" name="name" placeholder="Food Name" onChange={handleChange} required />
          <input type="number" name="quantity" placeholder="Quantity" onChange={handleChange} required />
          <input type="text" name="unit" placeholder="Unit (pcs, kg, L)" onChange={handleChange} />
          <select name="category" onChange={handleChange}>
            <option value="others">Others</option>
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="dairy">Dairy</option>
            <option value="meat">Meat</option>
            <option value="grains">Grains</option>
            <option value="beverages">Beverages</option>
            <option value="snacks">Snacks</option>
          </select>
          <select name="storage_location" onChange={handleChange}>
            <option value="pantry">Pantry</option>
            <option value="fridge">Fridge</option>
            <option value="freezer">Freezer</option>
            <option value="counter">Counter</option>
          </select>
          <input type="date" name="expiry_date" onChange={handleChange} required />
          <textarea name="notes" placeholder="Notes (optional)" onChange={handleChange}></textarea>
          <button type="submit">Add Item</button>
        </form>
      )}

      <div className="inventory-list">
        {items.length === 0 ? (
          <p>No food items yet. Add your first item!</p>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Quantity</th>
                <th>Category</th>
                <th>Storage</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className={item.is_expiring_soon ? 'expiring-soon' : ''}>
                  <td>{item.name}</td>
                  <td>{item.quantity} {item.unit}</td>
                  <td>{item.category}</td>
                  <td>{item.storage_location}</td>
                  <td>{item.expiry_date}</td>
                  <td>
                    {item.is_expiring_soon ? (
                      <span className="badge-warning">Expiring Soon!</span>
                    ) : (
                      <span className="badge-good">Good</span>
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleDelete(item.id)} className="btn-delete">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Inventory