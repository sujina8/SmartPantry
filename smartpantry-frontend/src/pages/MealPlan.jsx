import { useEffect, useState } from 'react'
import API from '../services/api'
import Sidebar from '../components/Sidebar'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snack', label: 'Snack' },
]

// Returns an array of 7 ISO date strings (YYYY-MM-DD) for Mon–Sun of the current week
function getCurrentWeekDates() {
  const today = new Date()
  const day = today.getDay() // 0 = Sunday, 1 = Monday, ...
  const diffToMonday = day === 0 ? -6 : 1 - day
  const monday = new Date(today)
  monday.setDate(today.getDate() + diffToMonday)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

export default function MealPlan() {
  const weekDates = getCurrentWeekDates()

  const [meals, setMeals] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [modalId, setModalId] = useState(null)
  const [modalDate, setModalDate] = useState(weekDates[0])
  const [modalMealType, setModalMealType] = useState('breakfast')
  const [modalMealName, setModalMealName] = useState('')
  const [modalNotes, setModalNotes] = useState('')

  useEffect(() => {
    loadMeals()
    loadSuggestions()
  }, [])

  const loadMeals = async () => {
    try {
      const res = await API.get('/mealplan/')
      setMeals(res.data)
    } catch {
      setError('Failed to load meal plan')
    } finally {
      setLoading(false)
    }
  }

  const loadSuggestions = async () => {
    try {
      const res = await API.get('/mealplan/suggestions/')
      setSuggestions(res.data)
    } catch {
      // Suggestions failing shouldn't block the whole page
      setSuggestions([])
    }
  }

  const findMeal = (date, mealType) =>
    meals.find((m) => m.date === date && m.meal_type === mealType)

  const openAddModal = (date, mealType, prefillName = '') => {
    setModalMode('add')
    setModalId(null)
    setModalDate(date)
    setModalMealType(mealType)
    setModalMealName(prefillName)
    setModalNotes('')
    setModalOpen(true)
  }

  const openEditModal = (meal) => {
    setModalMode('edit')
    setModalId(meal.id)
    setModalDate(meal.date)
    setModalMealType(meal.meal_type)
    setModalMealName(meal.meal_name)
    setModalNotes(meal.notes || '')
    setModalOpen(true)
  }

  const closeModal = () => setModalOpen(false)

  const saveMeal = async () => {
    if (!modalMealName.trim()) return
    const payload = {
      date: modalDate,
      meal_type: modalMealType,
      meal_name: modalMealName,
      notes: modalNotes,
    }
    try {
      if (modalMode === 'add') {
        await API.post('/mealplan/', payload)
      } else {
        await API.patch(`/mealplan/${modalId}/`, payload)
      }
      closeModal()
      loadMeals()
    } catch {
      setError('Failed to save meal')
    }
  }

  const deleteMeal = async () => {
    try {
      await API.delete(`/mealplan/${modalId}/`)
      closeModal()
      loadMeals()
    } catch {
      setError('Failed to delete meal')
    }
  }

  const addSuggestionToPlan = (suggestion) => {
    openAddModal(weekDates[0], suggestion.meal_type, suggestion.name)
  }

  if (loading) return <p style={{ padding: 48 }}>Loading meal plan...</p>

  return (
    <div className="sp-donations">
      <div className="sp-app-layout">
        <Sidebar active="mealplan" />

        <main className="sp-dashboard">
          <div className="sp-page-head">
            <div className="sp-freshness-bar"><span></span><span></span><span></span></div>
            <h1>Weekly Meal Planner</h1>
            <p>Plan meals by day and meal type. Click a cell to add, or an existing meal to edit.</p>
          </div>

          {error && <p className="error">{error}</p>}

          <section className="sp-dash-section">
            <div className="sp-mealplan-grid-wrap">
              <table className="sp-mealplan-grid">
                <thead>
                  <tr>
                    <th></th>
                    {weekDates.map((date, i) => (
                      <th key={date}>
                        <span className="sp-mealplan-day">{DAY_LABELS[i]}</span>
                        <span className="sp-mealplan-date">{date.slice(5)}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MEAL_TYPES.map((mt) => (
                    <tr key={mt.key}>
                      <td className="sp-mealplan-rowlabel">{mt.label}</td>
                      {weekDates.map((date) => {
                        const meal = findMeal(date, mt.key)
                        return (
                          <td
                            key={date + mt.key}
                            className={`sp-mealplan-cell ${meal ? 'filled' : ''}`}
                            onClick={() => (meal ? openEditModal(meal) : openAddModal(date, mt.key))}
                          >
                            {meal ? (
                              <span className="sp-mealplan-cell-name">{meal.meal_name}</span>
                            ) : (
                              <span className="sp-mealplan-cell-add">+</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="sp-dash-section">
            <h2 className="sp-dash-heading">Meal Suggestions</h2>
            <p className="sp-dash-subtext">Quick picks based on your pantry and recent usage.</p>

            {suggestions.length === 0 ? (
              <p className="sp-dash-empty">
                No suggestions yet — add some matching ingredients to your Inventory to see recipe ideas here.
              </p>
            ) : (
              <div className="sp-suggestion-list">
                {suggestions.map((s) => (
                  <div key={s.name} className="sp-suggestion-card">
                    <div className="sp-suggestion-info">
                      <p className="sp-suggestion-name">{s.name}</p>
                      <p className="sp-suggestion-meta">
                        {MEAL_TYPES.find((m) => m.key === s.meal_type)?.label || s.meal_type}
                      </p>
                      <p className="sp-suggestion-uses">Uses: {s.ingredients.join(', ')}</p>
                      <span className={`sp-badge-suggestion ${s.uses_expiring_item ? 'expiring' : ''}`}>
                        {s.uses_expiring_item ? 'Uses Expiring Item' : s.tag}
                      </span>
                    </div>
                    <button className="sp-btn sp-btn-secondary" onClick={() => addSuggestionToPlan(s)}>
                      Add to Plan
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>

        {modalOpen && (
          <div className="sp-modal-overlay" onClick={closeModal}>
            <div className="sp-modal" onClick={(e) => e.stopPropagation()}>
              <h2>{modalMode === 'add' ? 'Add Meal' : 'Edit Meal'}</h2>

              <div className="sp-form-field">
                <label>Date</label>
                <select value={modalDate} onChange={(e) => setModalDate(e.target.value)}>
                  {weekDates.map((date, i) => (
                    <option key={date} value={date}>{DAY_LABELS[i]} ({date})</option>
                  ))}
                </select>
              </div>

              <div className="sp-form-field">
                <label>Meal Type</label>
                <select value={modalMealType} onChange={(e) => setModalMealType(e.target.value)}>
                  {MEAL_TYPES.map((mt) => (
                    <option key={mt.key} value={mt.key}>{mt.label}</option>
                  ))}
                </select>
              </div>

              <div className="sp-form-field">
                <label>Meal Name</label>
                <input
                  type="text"
                  value={modalMealName}
                  onChange={(e) => setModalMealName(e.target.value)}
                  placeholder="e.g. Lemon Herb Chicken Bowl"
                />
              </div>

              <div className="sp-form-field">
                <label>Notes (optional)</label>
                <textarea
                  value={modalNotes}
                  onChange={(e) => setModalNotes(e.target.value)}
                  placeholder="Any extra notes..."
                />
              </div>

              <div className="sp-settings-actions">
                {modalMode === 'edit' && (
                  <button className="sp-btn" onClick={deleteMeal}>Delete</button>
                )}
                <button className="sp-btn" onClick={closeModal}>Cancel</button>
                <button className="sp-btn sp-btn-primary" onClick={saveMeal}>Save</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}