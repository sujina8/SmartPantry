import { useState, useEffect } from 'react'
import API from '../services/api'

const BrowseDonations = () => {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchDonations()
  }, [])

  const fetchDonations = async () => {
    try {
      const res = await API.get('/donations/')
      setDonations(res.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to load donations')
      setLoading(false)
    }
  }

  const handleClaim = async (id) => {
    try {
      await API.post(`/donations/${id}/claim/`)
      setSuccess('Donation claimed successfully!')
      fetchDonations()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to claim donation')
    }
  }

  if (loading) return <p>Loading donations...</p>

  return (
    <div className="donations-container">
      <h2>Browse Donations</h2>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">{success}</p>}
      <div className="donations-grid">
        {donations.length === 0 ? (
          <p>No donations available right now.</p>
        ) : (
          donations.map(donation => (
            <div key={donation.id} className="donation-card">
              <h3>{donation.food_item_name}</h3>
              <p><strong>Donor:</strong> {donation.donor_email}</p>
              <p><strong>Pickup:</strong> {donation.pickup_info}</p>
              <p><strong>Description:</strong> {donation.description}</p>
              <span className={`badge-${donation.status}`}>
                {donation.status}
              </span>
              {donation.status === 'available' && (
                <button
                  onClick={() => handleClaim(donation.id)}
                  className="btn-claim">
                  Claim
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default BrowseDonations