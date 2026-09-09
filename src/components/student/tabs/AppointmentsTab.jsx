import { IconCalendar } from '../../icons.jsx'

export default function AppointmentsTab({ appointments }) {
  return (
    <div className="card">
      <div className="card-bd" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {appointments.map((a, i) => (
          <div
            key={a.title + a.dateLabel}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '16px 4px',
              borderBottom: i === appointments.length - 1 ? 'none' : '1px solid var(--border-subtle)',
            }}
          >
            <div className={`vaccine-row-icon ${a.status === 'done' ? 'done' : 'due'}`}>
              <IconCalendar size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{a.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                {a.dateLabel} · {a.timeLabel} · ผู้ตรวจสุขภาพ: {a.examiner || '–'}
              </div>
            </div>
            <span className={`badge ${a.status === 'done' ? 'badge-green' : 'badge-orange'}`}>
              <span className="badge-dot" />{a.status === 'done' ? 'เสร็จสิ้น' : 'รอดำเนินการ'}
            </span>
            {a.status === 'done' && (
              <button className="btn btn-outline btn-sm">ดูข้อมูล</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
