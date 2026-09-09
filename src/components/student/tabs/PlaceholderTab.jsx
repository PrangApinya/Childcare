import { IconFileText } from '../../icons.jsx'

export default function PlaceholderTab({ label }) {
  return (
    <div className="card">
      <div className="placeholder-card">
        <IconFileText size={40} strokeWidth={1.3} />
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 13 }}>ยังไม่มีข้อมูลในส่วนนี้</div>
      </div>
    </div>
  )
}
