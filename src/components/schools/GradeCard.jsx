import { IconEdit } from '../icons.jsx'

export default function GradeCard({ grade, onView, onEdit }) {
  return (
    <div className="school-card" style={{ cursor: 'default' }}>
      <div className="school-card-hd">
        <div className="school-av" style={{ background: 'var(--brand-100)', color: 'var(--brand-700)' }}>{grade.code}</div>
        <div className="meta">
          <div className="name">{grade.name}</div>
          <div className="loc">สำรวจล่าสุด {grade.surveyDate}</div>
        </div>
      </div>
      <div className="school-stats">
        <div><span>จำนวนนักเรียน:</span><b className="tabular">{grade.studentCount.toLocaleString('th-TH')} คน</b></div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="school-card-link" onClick={() => onView(grade)}>↳ ดูรายละเอียด</button>
        <button className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }} onClick={() => onEdit(grade)}>
          <IconEdit size={14} />แก้ไข
        </button>
      </div>
    </div>
  )
}
