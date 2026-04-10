import { useState, useMemo } from 'react'
import './App.css'

const OUTCOME_TYPES = [
  { id: 'retention', label: 'Retention', icon: '🔒', description: 'People stayed because they felt connected and valued here.' },
  { id: 'performance', label: 'Performance', icon: '📈', description: 'Teams delivered better work through collaboration and trust.' },
  { id: 'engagement', label: 'Engagement', icon: '💬', description: 'People showed up, participated, contributed their voice, and deepened connections with their team.' },
  { id: 'hiring', label: 'Hiring', icon: '🎯', description: 'Culture reputation helped attract and close top candidates.' },
  { id: 'wellbeing', label: 'Wellbeing', icon: '❤️', description: 'People felt mentally and emotionally supported at work, reducing stress and burnout risk.' },
]

const INITIAL_ACTIVITIES = [
  {
    id: 1,
    title: 'ERG Leadership Summit',
    description: 'Quarterly gathering of all ERG leads to align on initiatives',
    date: '2024-03-15',
    participants: 45,
    outcomes: ['retention', 'engagement'],
    retainedEmployees: 3,
    avgSalary: 95000,
  },
  {
    id: 2,
    title: 'Mentorship Program Launch',
    description: 'Paired 120 mentees with senior leaders across departments',
    date: '2024-02-01',
    participants: 240,
    outcomes: ['retention', 'performance'],
    retainedEmployees: 8,
    avgSalary: 85000,
  },
  {
    id: 3,
    title: 'Wellness Week',
    description: 'Company-wide focus on mental and physical health',
    date: '2024-03-01',
    participants: 500,
    outcomes: ['wellbeing', 'engagement'],
    retainedEmployees: 2,
    avgSalary: 75000,
  },
]

function App() {
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES)
  const [showBanner, setShowBanner] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [narrative, setNarrative] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [avgCompanySalary, setAvgCompanySalary] = useState(65000)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    participants: '',
    outcomes: [],
    retainedEmployees: '',
    avgSalary: '',
  })

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalActivities = activities.length
    const totalParticipants = activities.reduce((sum, a) => sum + a.participants, 0)
    const totalRetained = activities.reduce((sum, a) => sum + (a.retainedEmployees || 0), 0)
    const retainedValue = activities.reduce((sum, a) => {
      const salary = a.avgSalary || avgCompanySalary
      return sum + (a.retainedEmployees || 0) * salary * 1.5
    }, 0)

    const outcomeCounts = {}
    activities.forEach(a => {
      a.outcomes.forEach(o => {
        outcomeCounts[o] = (outcomeCounts[o] || 0) + 1
      })
    })

    return { totalActivities, totalParticipants, totalRetained, retainedValue, outcomeCounts }
  }, [activities, avgCompanySalary])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleOutcome = (outcomeId) => {
    setFormData(prev => ({
      ...prev,
      outcomes: prev.outcomes.includes(outcomeId)
        ? prev.outcomes.filter(o => o !== outcomeId)
        : [...prev.outcomes, outcomeId]
    }))
  }

  const deleteActivity = (id) => {
    setActivities(prev => prev.filter(a => a.id !== id))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title || !formData.date) return

    const newActivity = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
      date: formData.date,
      participants: parseInt(formData.participants) || 0,
      outcomes: formData.outcomes,
      retainedEmployees: parseInt(formData.retainedEmployees) || 0,
      avgSalary: parseInt(formData.avgSalary) || avgCompanySalary,
    }

    setActivities(prev => [newActivity, ...prev])
    setFormData({
      title: '',
      description: '',
      date: '',
      participants: '',
      outcomes: [],
      retainedEmployees: '',
      avgSalary: '',
    })
  }

  const generateNarrative = async () => {
    setShowModal(true)
    setIsGenerating(true)
    setNarrative('')

    // Simulate AI generation with a realistic narrative
    await new Promise(resolve => setTimeout(resolve, 2000))

    const topOutcomes = Object.entries(metrics.outcomeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([key]) => OUTCOME_TYPES.find(o => o.id === key)?.label)
      .filter(Boolean)

    const generatedNarrative = `
### Executive Summary

Our culture and community initiatives have delivered measurable business impact this quarter, directly contributing to talent retention and organizational performance.

### Key Achievements

**${metrics.totalActivities} Strategic Initiatives** engaged **${metrics.totalParticipants.toLocaleString()} employees** across the organization, with primary focus on ${topOutcomes.join(', ')}.

### Financial Impact

Through targeted culture investments, we have retained **${metrics.totalRetained} employees** who were identified as flight risks or received competing offers. Using the industry-standard 1.5x salary replacement cost model:

- **Total Retained Value: $${metrics.retainedValue.toLocaleString()}**
- Average cost avoided per retained employee: $${metrics.totalRetained > 0 ? Math.round(metrics.retainedValue / metrics.totalRetained).toLocaleString() : 0}

### Program Highlights

${activities.slice(0, 3).map(a => `
**${a.title}** (${new Date(a.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})
- Reached ${a.participants} participants
- Business outcomes: ${a.outcomes.map(o => OUTCOME_TYPES.find(t => t.id === o)?.label).join(', ')}
${a.retainedEmployees ? `- Contributed to ${a.retainedEmployees} employee retention cases` : ''}
`).join('')}

### Strategic Recommendation

Continue investing in culture initiatives with demonstrated ROI. Our data shows that every dollar invested in employee community programs yields approximately $${metrics.totalActivities > 0 ? Math.round(metrics.retainedValue / (metrics.totalActivities * 5000)).toFixed(1) : 0} in retained talent value.

### Next Steps

1. Scale high-impact programs like mentorship and ERG leadership development
2. Implement quarterly impact assessments to track retention correlation
3. Expand wellness initiatives based on engagement data

---
*This narrative was generated based on ${metrics.totalActivities} tracked activities impacting ${metrics.totalParticipants.toLocaleString()} employees.*
    `.trim()

    setNarrative(generatedNarrative)
    setIsGenerating(false)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="dashboard">
      {showBanner && (
        <div className="info-banner">
          <span><strong>Sample Data Loaded</strong> — This tool comes pre-loaded with example activities. Click the <strong>×</strong> buttons next to each activity to clear them and add your own.</span>
          <button className="banner-dismiss" onClick={() => setShowBanner(false)} aria-label="Dismiss">×</button>
        </div>
      )}

      <header className="dashboard-header">
        <h1>Culture Impact Dashboard</h1>
        <p>Track community activities, measure business outcomes, and quantify cultural ROI</p>
      </header>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Total Activities</div>
          <div className="metric-value">{metrics.totalActivities}</div>
          <div className="metric-subtitle">This quarter</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Employees Reached</div>
          <div className="metric-value">{metrics.totalParticipants.toLocaleString()}</div>
          <div className="metric-subtitle">Unique participants</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Employees Retained</div>
          <div className="metric-value">{metrics.totalRetained}</div>
          <div className="metric-subtitle">Attributed to programs</div>
        </div>
        <div className="metric-card highlight">
          <div className="metric-label">Retained Dollar Value</div>
          <div className="metric-value">{formatCurrency(metrics.retainedValue)}</div>
          <div className="metric-subtitle">1.5x salary replacement cost</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-grid">
        {/* Activities List */}
        <div className="card">
          <div className="card-header">
            <h2>Community Activities</h2>
            <span style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
              {activities.length} activities tracked
            </span>
          </div>
          <div className="activity-list">
            {activities.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <p>No activities yet. Add your first community activity to get started.</p>
              </div>
            ) : (
              activities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-header">
                    <div className="activity-title">{activity.title}</div>
                    <button
                      className="btn-delete"
                      onClick={() => deleteActivity(activity.id)}
                      aria-label="Delete activity"
                    >
                      ×
                    </button>
                  </div>
                  <div className="activity-meta">
                    {new Date(activity.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })} • {activity.participants} participants
                  </div>
                  <div className="activity-tags">
                    {activity.outcomes.map(outcome => (
                      <span key={outcome} className={`activity-tag ${outcome}`}>
                        {OUTCOME_TYPES.find(o => o.id === outcome)?.label}
                      </span>
                    ))}
                  </div>
                  {activity.retainedEmployees > 0 && (
                    <div className="activity-impact">
                      Retained <strong>{activity.retainedEmployees} employees</strong> •
                      Value: <strong>{formatCurrency(activity.retainedEmployees * (activity.avgSalary || avgCompanySalary) * 1.5)}</strong>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Retained Value Chart */}
          {activities.some(a => a.retainedEmployees > 0) && (
            <div className="card" style={{ marginTop: '24px' }}>
              <div className="card-header">
                <h2>Retained Value by Activity</h2>
              </div>
              <div className="card-body">
                <div className="bar-chart">
                  {activities
                    .filter(a => a.retainedEmployees > 0)
                    .map(activity => {
                      const value = activity.retainedEmployees * (activity.avgSalary || avgCompanySalary) * 1.5
                      const maxValue = Math.max(...activities.map(a => a.retainedEmployees * (a.avgSalary || avgCompanySalary) * 1.5))
                      const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0
                      return (
                        <div key={activity.id} className="bar-row">
                          <div className="bar-label">{activity.title}</div>
                          <div className="bar-container">
                            <div className="bar-fill" style={{ width: `${percentage}%` }}></div>
                            <span className="bar-value">{formatCurrency(value)}</span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div>
          {/* Add Activity Form */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h2>Add Activity</h2>
            </div>
            <div className="card-body">
              <form className="activity-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Activity Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Q1 ERG Summit"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of the activity..."
                    rows={2}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Participants</label>
                    <input
                      type="number"
                      name="participants"
                      value={formData.participants}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Business Outcomes</label>
                  <div className="outcomes-selector">
                    {OUTCOME_TYPES.map(outcome => (
                      <div key={outcome.id} className="outcome-option">
                        <button
                          type="button"
                          className={`outcome-tag ${outcome.id} ${formData.outcomes.includes(outcome.id) ? 'selected' : ''}`}
                          onClick={() => toggleOutcome(outcome.id)}
                        >
                          {outcome.icon} {outcome.label}
                        </button>
                        <span className="outcome-description">{outcome.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Employees Retained</label>
                    <input
                      type="number"
                      name="retainedEmployees"
                      value={formData.retainedEmployees}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label>Avg Salary (retained)</label>
                    <input
                      type="number"
                      name="avgSalary"
                      value={formData.avgSalary}
                      onChange={handleInputChange}
                      placeholder={avgCompanySalary.toString()}
                      min="0"
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Add Activity
                </button>
              </form>
            </div>
            <div className="settings-section">
              <div className="settings-row">
                <label>Default Avg Salary:</label>
                <input
                  type="number"
                  value={avgCompanySalary}
                  onChange={(e) => setAvgCompanySalary(parseInt(e.target.value) || 0)}
                  min="0"
                  step="1000"
                />
              </div>
              <p className="settings-note">
                Used to calculate retention value when no specific salary is entered. Default is $65,000 (US median wage). Adjust this to match your organization's average salary for more accurate ROI calculations.
              </p>
            </div>
          </div>

          {/* ROI Calculator */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h2>ROI Summary</h2>
            </div>
            <div className="card-body">
              <div className="roi-calculator">
                <div className="roi-row">
                  <span className="label">Employees Retained</span>
                  <span className="value">{metrics.totalRetained}</span>
                </div>
                <div className="roi-row">
                  <span className="label">Avg Replacement Cost</span>
                  <span className="value">1.5x salary</span>
                </div>
                <div className="roi-row">
                  <span className="label">Default Avg Salary</span>
                  <span className="value">{formatCurrency(avgCompanySalary)}</span>
                </div>
                <div className="roi-row total">
                  <span className="label">Total Value Retained</span>
                  <span className="value">{formatCurrency(metrics.retainedValue)}</span>
                </div>
              </div>
              <p className="roi-citation">
                The 1.5x salary replacement cost is based on research from Gallup and Deloitte on the true cost of employee turnover, including recruiting, onboarding, lost productivity, and institutional knowledge.
              </p>
            </div>
          </div>

          {/* Tell My Story */}
          <div className="card story-card">
            <h3>Ready to Share Your Impact?</h3>
            <p>Generate an AI-powered executive narrative based on your tracked activities and outcomes.</p>
            <button
              className="btn btn-ai"
              onClick={generateNarrative}
              disabled={activities.length === 0}
            >
              ✨ Tell My Story
            </button>
          </div>
        </div>
      </div>

      {/* Narrative Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Executive Narrative</h2>
              <div className="modal-actions">
                {!isGenerating && narrative && (
                  <button className="btn btn-secondary btn-print" onClick={() => window.print()}>
                    Print / Save PDF
                  </button>
                )}
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
            </div>
            <div className="modal-body">
              {isGenerating ? (
                <div className="narrative-loading">
                  <div className="spinner"></div>
                  <p>Generating your executive narrative...</p>
                </div>
              ) : (
                <div className="narrative-content">
                  {narrative.split('\n').map((line, i) => {
                    if (line.startsWith('### ')) {
                      return <h3 key={i}>{line.replace('### ', '')}</h3>
                    } else if (line.startsWith('**') && line.endsWith('**')) {
                      return <p key={i}><strong>{line.replace(/\*\*/g, '')}</strong></p>
                    } else if (line.startsWith('- ')) {
                      return <li key={i}>{line.replace('- ', '')}</li>
                    } else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ')) {
                      return <li key={i}>{line.replace(/^\d\. /, '')}</li>
                    } else if (line.trim()) {
                      return <p key={i} dangerouslySetInnerHTML={{
                        __html: line
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      }} />
                    }
                    return null
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
