const STYLES = {
  APPLIED:   { background: '#eef2ff', color: '#4338ca' },
  INTERVIEW: { background: '#fffbeb', color: '#92400e' },
  OFFER:     { background: '#f0fdf4', color: '#166534' },
  REJECTED:  { background: '#fff1f2', color: '#be123c' },
}

export default function StatusBadge({ status }) {
  return (
    <span className="status-badge" style={STYLES[status] ?? {}}>
      {status}
    </span>
  )
}
