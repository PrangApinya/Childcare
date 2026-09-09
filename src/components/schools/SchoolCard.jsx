import { schoolIconStyle } from './schoolColors.js'

export default function SchoolCard({ school, selected, onSelect, onOpen }) {
  return (
    <div
      className={`school-card${selected ? ' selected' : ''}`}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect() } }}
    >
      <div className="school-card-hd">
        <div className="school-av" style={schoolIconStyle(school.iconColor)}>{school.initials}</div>
        <div className="meta">
          <div className="name">{school.name}</div>
          <div className="loc">แขวง{school.subdistrict} · เขต{school.district}</div>
        </div>
      </div>
      <div className="school-stats">
        <div><span>การสำรวจล่าสุด:</span><b>{school.lastSurveyLabel}</b></div>
        <div><span>จำนวนนักเรียน:</span><b className="tabular">{school.studentCount.toLocaleString('th-TH')} คน</b></div>
      </div>
      <button
        type="button"
        className="school-card-link"
        onClick={(e) => { e.stopPropagation(); onOpen(school) }}
      >
        ↳ ดูข้อมูลโรงเรียน
      </button>
    </div>
  )
}
