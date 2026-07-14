import { useState, useEffect, useMemo } from 'react'
import api from '../api/axios'
import ApplicationForm from '../components/ApplicationForm'
import StatusBadge from '../components/StatusBadge'
import CoverLetterModal from '../components/CoverLetterModal'
import InterviewModal from '../components/InterviewModal'
import { useToast } from '../context/ToastContext'
import {
  PlusIcon, EditIcon, TrashIcon,
  BriefcaseIcon, UsersIcon, CheckCircleIcon, XCircleIcon,
  DownloadIcon, SearchIcon, SparkleIcon, CalendarIcon, AlertIcon,
} from '../components/Icons'

const STATUSES = ['ALL', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED']
const SORTS = [
  { value: 'newest',    label: 'Newest First' },
  { value: 'oldest',    label: 'Oldest First' },
  { value: 'company',   label: 'Company A–Z' },
  { value: 'role',      label: 'Role A–Z' },
  { value: 'status',    label: 'Status' },
]

function daysBetween(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.round((d - now) / 86400000)
}

function EmptyIllustration() {
  return (
    <svg className="empty-icon" width="96" height="96" viewBox="0 0 96 96" fill="none">
      <rect x="12" y="28" width="72" height="54" rx="8" stroke="currentColor" strokeWidth="4" />
      <path d="M32 28V22a6 6 0 0 1 6-6h20a6 6 0 0 1 6 6v6" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <line x1="28" y1="52" x2="68" y2="52" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <line x1="28" y1="64" x2="52" y2="64" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

function SkeletonRow() {
  return (
    <tr>
      {[140, 120, 80, 80, 160, 100].map((w, i) => (
        <td key={i}><div className="skeleton" style={{ width: w, height: 16 }} /></td>
      ))}
    </tr>
  )
}

export default function Dashboard() {
  const [applications, setApplications] = useState([])
  const [interviewCounts, setInterviewCounts] = useState({})
  const [filter,       setFilter]       = useState('ALL')
  const [search,       setSearch]       = useState('')
  const [sort,         setSort]         = useState('newest')
  const [loading,      setLoading]      = useState(true)
  const [showForm,     setShowForm]     = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [coverLetterApp, setCoverLetterApp] = useState(null)
  const [interviewApp,   setInterviewApp]   = useState(null)
  const { addToast } = useToast()

  useEffect(() => { fetchApplications() }, [])

  async function fetchApplications() {
    try {
      const res = await api.get('/api/applications')
      setApplications(res.data)
      fetchInterviewCounts(res.data)
    } catch {
      addToast('Failed to load applications.', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function fetchInterviewCounts(apps) {
    const counts = {}
    await Promise.all(
      apps.map(async a => {
        try {
          const r = await api.get(`/api/applications/${a.id}/interviews`)
          counts[a.id] = r.data.length
        } catch { counts[a.id] = 0 }
      })
    )
    setInterviewCounts(counts)
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/api/applications/${id}`)
      setApplications(prev => prev.filter(a => a.id !== id))
      addToast('Application deleted.', 'success')
    } catch {
      addToast('Failed to delete application.', 'error')
    }
  }

  async function handleFormSave(data) {
    if (editTarget) {
      const res = await api.put(`/api/applications/${editTarget.id}`, data)
      setApplications(prev => prev.map(a => a.id === editTarget.id ? res.data : a))
      addToast('Application updated.', 'success')
    } else {
      const res = await api.post('/api/applications', data)
      setApplications(prev => [res.data, ...prev])
      addToast('Application added.', 'success')
    }
    closeForm()
  }

  function closeForm()   { setShowForm(false); setEditTarget(null) }
  function openAdd()     { setEditTarget(null); setShowForm(true) }
  function openEdit(app) { setEditTarget(app); setShowForm(true) }

  function exportCSV() {
    const rows = [
      ['Company', 'Role', 'Status', 'Applied Date', 'Deadline', 'Salary', 'Contact Person', 'URL', 'Notes'],
      ...filtered.map(a => [
        a.companyName, a.jobTitle, a.status, a.appliedDate ?? '', a.deadline ?? '',
        a.salary ?? '', a.contactPerson ?? '',
        a.jobUrl ?? '', (a.notes ?? '').replace(/,/g, ';'),
      ]),
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'applications.csv'; a.click()
    URL.revokeObjectURL(url)
    addToast('CSV exported!', 'success')
  }

  const counts = useMemo(() => ({
    ALL:       applications.length,
    APPLIED:   applications.filter(a => a.status === 'APPLIED').length,
    INTERVIEW: applications.filter(a => a.status === 'INTERVIEW').length,
    OFFER:     applications.filter(a => a.status === 'OFFER').length,
    REJECTED:  applications.filter(a => a.status === 'REJECTED').length,
  }), [applications])

  const urgentDeadlines = useMemo(() =>
    applications.filter(a => {
      const d = daysBetween(a.deadline)
      return d !== null && d <= 3 && d >= 0
    }), [applications])

  const filtered = useMemo(() => {
    let list = filter === 'ALL' ? applications : applications.filter(a => a.status === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(a =>
        a.companyName.toLowerCase().includes(q) || a.jobTitle.toLowerCase().includes(q)
      )
    }
    switch (sort) {
      case 'oldest':  return [...list].sort((a, b) => new Date(a.appliedDate||0) - new Date(b.appliedDate||0))
      case 'company': return [...list].sort((a, b) => a.companyName.localeCompare(b.companyName))
      case 'role':    return [...list].sort((a, b) => a.jobTitle.localeCompare(b.jobTitle))
      case 'status':  return [...list].sort((a, b) => a.status.localeCompare(b.status))
      default:        return [...list].sort((a, b) => new Date(b.createdAt||0) - new Date(a.createdAt||0))
    }
  }, [applications, filter, search, sort])

  function rowClass(app) {
    const d = daysBetween(app.deadline)
    if (d !== null && d <= 3 && d >= 0) return 'row-urgent'
    return ''
  }

  function isFollowUp(app) {
    if (app.status !== 'APPLIED') return false
    const d = daysBetween(app.appliedDate)
    return d !== null && d <= -7
  }

  return (
    <>
      {urgentDeadlines.length > 0 && (
        <div className="deadline-banner">
          <AlertIcon size={18} />
          <span>
            <strong>{urgentDeadlines.length} application{urgentDeadlines.length > 1 ? 's have' : ' has'} a deadline within 3 days:</strong>{' '}
            {urgentDeadlines.map(a => a.companyName).join(', ')}
          </span>
        </div>
      )}

      <div id="stats" className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrap si-indigo"><BriefcaseIcon size={22} /></div>
          <div><div className="stat-value">{counts.ALL}</div><div className="stat-label">Total Applied</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap si-amber"><UsersIcon size={22} /></div>
          <div><div className="stat-value">{counts.INTERVIEW}</div><div className="stat-label">Interviews</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap si-green"><CheckCircleIcon size={22} /></div>
          <div><div className="stat-value">{counts.OFFER}</div><div className="stat-label">Offers</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap si-red"><XCircleIcon size={22} /></div>
          <div><div className="stat-value">{counts.REJECTED}</div><div className="stat-label">Rejected</div></div>
        </div>
      </div>

      <div id="applications" className="table-card">
        <div className="table-card-header">
          <div>
            <div className="table-card-title">Applications</div>
            <div className="table-card-meta">{counts.ALL} total · {filtered.length} shown</div>
          </div>

          <div className="filter-tabs">
            {STATUSES.map(s => (
              <button key={s} className={`filter-tab${filter === s ? ' active' : ''}`} onClick={() => setFilter(s)}>
                {s}<span className="tab-count">{counts[s]}</span>
              </button>
            ))}
          </div>

          <div className="spacer" />

          <div className="table-toolbar">
            <div className="search-wrap">
              <SearchIcon size={15} color="var(--text-3)" />
              <input
                className="search-input"
                placeholder="Search company or role…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
              {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            <button className="btn btn-outline btn-sm" onClick={exportCSV} title="Export CSV">
              <DownloadIcon size={14} /> Export
            </button>

            <button className="btn btn-primary btn-sm" onClick={openAdd}>
              <PlusIcon size={15} /> Add
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="applications-table">
              <thead>
                <tr>
                  <th>Company</th><th>Role</th><th>Status</th><th>Applied</th><th>Deadline</th><th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>{[0,1,2,3].map(i => <SkeletonRow key={i} />)}</tbody>
            </table>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            {search ? (
              <>
                <SearchIcon size={48} color="var(--indigo-400)" />
                <h3>No results for "{search}"</h3>
                <p>Try a different search term or clear the filter.</p>
              </>
            ) : filter === 'ALL' ? (
              <>
                <EmptyIllustration />
                <h3>No applications yet</h3>
                <p>Start tracking your job search by adding your first application.</p>
                <button className="btn btn-primary" onClick={openAdd} style={{ marginTop: '0.25rem' }}>
                  <PlusIcon size={15} /> Add Your First Application
                </button>
              </>
            ) : (
              <>
                <EmptyIllustration />
                <h3>No {filter.toLowerCase()} applications</h3>
                <p>No applications with status "{filter}" right now.</p>
              </>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="applications-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Applied</th>
                  <th>Deadline</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => {
                  const deadlineDays = daysBetween(app.deadline)
                  const followUp = isFollowUp(app)
                  return (
                    <tr key={app.id} className={rowClass(app)}>
                      <td className="cell-company">
                        {app.companyName}
                        {followUp && <span className="badge-followup">Follow Up</span>}
                        {(interviewCounts[app.id] || 0) > 0 && (
                          <span className="badge-interviews">
                            <CalendarIcon size={10} />
                            {interviewCounts[app.id]}
                          </span>
                        )}
                      </td>
                      <td className="cell-role">{app.jobTitle}</td>
                      <td><StatusBadge status={app.status} /></td>
                      <td className="cell-date">{app.appliedDate ?? '—'}</td>
                      <td className="cell-date">
                        {app.deadline ? (
                          <span className={deadlineDays !== null && deadlineDays <= 3 && deadlineDays >= 0 ? 'deadline-urgent' : ''}>
                            {app.deadline}
                            {deadlineDays !== null && deadlineDays <= 3 && deadlineDays >= 0 && (
                              <span className="deadline-days">{deadlineDays === 0 ? ' today!' : ` (${deadlineDays}d)`}</span>
                            )}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="cell-actions">
                        <button className="btn btn-sm btn-outline" title="AI Cover Letter" onClick={() => setCoverLetterApp(app)}>
                          <SparkleIcon size={12} />
                        </button>
                        <button className="btn btn-sm btn-outline" title="Interviews" onClick={() => setInterviewApp(app)}>
                          <CalendarIcon size={12} />
                        </button>
                        <button className="btn btn-sm btn-outline" onClick={() => openEdit(app)}>
                          <EditIcon size={13} /> Edit
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(app.id)}>
                          <TrashIcon size={13} /> Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <ApplicationForm initial={editTarget} onSave={handleFormSave} onClose={closeForm} />
      )}
      {coverLetterApp && (
        <CoverLetterModal application={coverLetterApp} onClose={() => setCoverLetterApp(null)} />
      )}
      {interviewApp && (
        <InterviewModal application={interviewApp} onClose={() => setInterviewApp(null)} />
      )}
    </>
  )
}
