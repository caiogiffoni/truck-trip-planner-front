import { useState, type FormEvent } from 'react'

export interface TripFormData {
  current_location: string
  pickup_location: string
  dropoff_location: string
  current_cycle_used: number
  has_curfew: boolean
}

interface TripFormProps {
  onSubmit: (data: TripFormData) => void
  loading?: boolean
  error?: string | null
}

export default function TripForm({ onSubmit, loading = false, error }: TripFormProps) {
  const [form, setForm] = useState({
    current_location: '',
    pickup_location: '',
    dropoff_location: '',
    has_curfew: false,
  })
  const [cycleRaw, setCycleRaw] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit({ ...form, current_cycle_used: parseFloat(cycleRaw) })
  }

  const cycleValue = cycleRaw === '' ? 0 : parseFloat(cycleRaw) || 0

  return (
    <div className="form-wrapper">
      <div className="form-header">
        <div className="form-header-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="18.5" cy="18.5" r="2.5" />
          </svg>
        </div>
        <div>
          <h1>ELD Trip Planner</h1>
          <p className="form-subtitle">HOS-compliant route scheduling for property-carrying drivers</p>
        </div>
      </div>

      <form className="trip-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2 className="section-label">Route</h2>
          <div className="field-group">
            <div className="field">
              <label htmlFor="current_location">
                <span className="field-marker field-marker--start" />
                Current Location
              </label>
              <input
                id="current_location"
                name="current_location"
                type="text"
                placeholder="e.g. Chicago, IL"
                value={form.current_location}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </div>

            <div className="field-connector" />

            <div className="field">
              <label htmlFor="pickup_location">
                <span className="field-marker field-marker--pickup" />
                Pickup Location
              </label>
              <input
                id="pickup_location"
                name="pickup_location"
                type="text"
                placeholder="e.g. St. Louis, MO"
                value={form.pickup_location}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </div>

            <div className="field-connector" />

            <div className="field">
              <label htmlFor="dropoff_location">
                <span className="field-marker field-marker--dropoff" />
                Dropoff Location
              </label>
              <input
                id="dropoff_location"
                name="dropoff_location"
                type="text"
                placeholder="e.g. Nashville, TN"
                value={form.dropoff_location}
                onChange={handleChange}
                required
                autoComplete="off"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-label">Driver Status</h2>
          <div className="field">
            <label htmlFor="current_cycle_used">
              Current Cycle Hours Used
              <span className="field-hint">70 hr / 8-day rolling limit</span>
            </label>
            <div className="input-with-unit">
              <input
                id="current_cycle_used"
                name="current_cycle_used"
                type="number"
                min="0"
                max="70"
                step="0.5"
                placeholder="0.0"
                value={cycleRaw}
                onChange={e => setCycleRaw(e.target.value)}
                required
                className="mono"
              />
              <span className="input-unit">hrs</span>
            </div>
            <div className="cycle-bar">
              <div
                className="cycle-bar-fill"
                style={{ width: `${Math.min((cycleValue / 70) * 100, 100)}%` }}
              />
              <span className="cycle-bar-label mono">
                {cycleValue.toFixed(1)} / 70.0 hrs
              </span>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="section-label">Options</h2>
          <button
            type="button"
            className={`toggle-row${form.has_curfew ? ' toggle-row--on' : ''}`}
            onClick={() => setForm(prev => ({ ...prev, has_curfew: !prev.has_curfew }))}
          >
            <span className={`toggle-switch${form.has_curfew ? ' toggle-switch--on' : ''}`}>
              <span className="toggle-thumb" />
            </span>
            <span className="toggle-text">
              <span className="toggle-label">Curfew</span>
              <span className="toggle-desc">No night driving · 11 pm - 5 am</span>
            </span>
          </button>
        </div>

        {error && (
          <div className="form-error">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <span className="form-error-hint">Something went wrong — please try again.</span>
              <span className="form-error-detail">{error}</span>
            </div>
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner" />
              Calculating Route…
            </>
          ) : (
            <>
              Plan Trip
            </>
          )}
        </button>
      </form>
    </div>
  )
}
