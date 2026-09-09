import { IconCheck, IconClock, IconAlertCircle } from '../../icons.jsx'

const STATUS_META = {
  done: { label: 'ฉีดแล้ว', badgeClass: 'badge-green', icon: IconCheck },
  due: { label: 'รอฉีด', badgeClass: 'badge-orange', icon: IconClock },
  overdue: { label: 'เกินกำหนด', badgeClass: 'badge-red', icon: IconAlertCircle },
}

export default function VaccineHistoryTab({ schedule }) {
  return (
    <div className="card">
      <div className="card-hd">
        <div style={{ flex: 1 }}>
          <h3>ตารางวัคซีนตามเกณฑ์อายุ</h3>
        </div>
        <span className="vaccine-summary-badge badge-green">
          <span className="badge-dot" />ครบแล้ว {schedule.doneCount}/{schedule.total} เข็ม
        </span>
      </div>
      <div className="card-bd">
        {schedule.items.map((item) => {
          const meta = STATUS_META[item.status]
          const Icon = meta.icon
          return (
            <div className="vaccine-row" key={item.name}>
              <div className={`vaccine-row-icon ${item.status}`}><Icon size={17} /></div>
              <div className="vaccine-row-body">
                <div className="name">{item.name}</div>
                <div className="meta">
                  กำหนด: {item.due}
                  {item.status === 'done' && (
                    <> · ฉีดเมื่อ {item.dateGiven} · สถานที่: {item.location} · รหัสโดส: {item.doseCode}</>
                  )}
                </div>
              </div>
              <span className={`badge ${meta.badgeClass}`}><span className="badge-dot" />{meta.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
