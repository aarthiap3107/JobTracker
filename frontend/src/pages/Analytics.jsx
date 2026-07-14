import { useState, useEffect, useMemo } from 'react'
import api from '../api/axios'
import {
  LineChart, Line, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { BriefcaseIcon, UsersIcon, CheckCircleIcon, XCircleIcon } from '../components/Icons'

const STATUS_COLORS = {
  APPLIED:   '#6366f1',
  INTERVIEW: '#f59e0b',
  OFFER:     '#22c55e',
  REJECTED:  '#f43f5e',
}

function getWeekLabel(dateStr) {
  const d = new Date(dateStr)
  const mon = new Date(d)
  mon.setDate(d.getDate() - d.getDay() + 1)
  return mon.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function Analytics() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/api/applications').then(r => {
      setApplications(r.data)
    }).finally(() => setLoading(false))
  }, [])

  const counts = useMemo(() => ({
    total:     applications.length,
    interview: applications.filter(a => a.status === 'INTERVIEW').length,
    offer:     applications.filter(a => a.status === 'OFFER').length,
    rejected:  applications.filter(a => a.status === 'REJECTED').length,
  }), [applications])

  const pieData = useMemo(() =>
    Object.entries(STATUS_COLORS).map(([name, fill]) => ({
      name,
      value: applications.filter(a => a.status === name).length,
      fill,
    })).filter(d => d.value > 0),
  [applications])

  const weeklyData = useMemo(() => {
    const map = {}
    applications.forEach(a => {
      if (!a.appliedDate) return
      const wk = getWeekLabel(a.appliedDate)
      map[wk] = (map[wk] || 0) + 1
    })
    return Object.entries(map)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .slice(-10)
      .map(([week, count]) => ({ week, count }))
  }, [applications])

  const companyData = useMemo(() => {
    const map = {}
    applications.forEach(a => { map[a.companyName] = (map[a.companyName] || 0) + 1 })
    return Object.entries(map)
      .sort(([,a],[,b]) => b - a)
      .slice(0, 8)
      .map(([company, count]) => ({ company, count }))
  }, [applications])

  if (loading) return (
    <div className="empty-state"><p style={{ color: 'var(--text-3)' }}>Loading analytics…</p></div>
  )

  return (
    <>
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        {[
          { label: 'Total Applied', value: counts.total,     Icon: BriefcaseIcon, cls: 'si-indigo' },
          { label: 'Interviews',    value: counts.interview,  Icon: UsersIcon,     cls: 'si-amber' },
          { label: 'Offers',        value: counts.offer,      Icon: CheckCircleIcon, cls: 'si-green' },
          { label: 'Rejected',      value: counts.rejected,   Icon: XCircleIcon,   cls: 'si-red' },
        ].map(({ label, value, Icon, cls }) => (
          <div key={label} className="stat-card">
            <div className={`stat-icon-wrap ${cls}`}><Icon size={22} /></div>
            <div>
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="analytics-grid">
        <div className="table-card analytics-card">
          <div className="analytics-card-title">Applications per Week</div>
          {weeklyData.length === 0 ? (
            <p className="analytics-empty">No data with applied dates yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ede9ff" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} width={28} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #ede9ff' }} />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5}
                  dot={{ r: 4, fill: '#6366f1' }} name="Applications" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="table-card analytics-card">
          <div className="analytics-card-title">Status Breakdown</div>
          {pieData.length === 0 ? (
            <p className="analytics-empty">No applications yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  dataKey="value" nameKey="name" paddingAngle={3}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #ede9ff' }} />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="table-card analytics-card analytics-card-wide">
          <div className="analytics-card-title">Top Companies</div>
          {companyData.length === 0 ? (
            <p className="analytics-empty">No applications yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={companyData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ede9ff" vertical={false} />
                <XAxis dataKey="company" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} width={28} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #ede9ff' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </>
  )
}
