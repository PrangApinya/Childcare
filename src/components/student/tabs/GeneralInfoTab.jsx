import { IconPlus } from '../../icons.jsx'

const NUTRITION_CLASS = { green: 'badge-green', orange: 'badge-orange', red: 'badge-red' }

export default function GeneralInfoTab({ record, onGoToCheckup }) {
  return (
    <div className="card">
      <div className="card-hd">
        <div style={{ flex: 1 }}>
          <h3>ข้อมูลการตรวจสุขภาพ</h3>
          <p>ประวัติการสอบถามสุขภาพเบื้องต้น และการตรวจสุขภาพประจำปี</p>
        </div>
        {onGoToCheckup && (
          <button className="btn btn-primary btn-sm" onClick={onGoToCheckup}>
            <IconPlus size={16} />บันทึกผลตรวจสุขภาพ
          </button>
        )}
      </div>
      <div className="card-bd">
        <h3 style={{ fontSize: 15, marginBottom: 4 }}>การตรวจสุขภาพประจำปีล่าสุด – {record.latestCheckupDate}</h3>

        <div className="stat-tile-row">
          <div className="stat-tile"><div className="n">{record.generalHealth}</div><div className="l">สุขภาพทั่วไป</div></div>
          <div className="stat-tile"><div className="n">{record.cavitiesFound}</div><div className="l">ฟันผุที่พบ</div></div>
          <div className="stat-tile"><div className="n">{record.development}</div><div className="l">พัฒนาการ</div></div>
        </div>

        <h3 style={{ fontSize: 14, marginBottom: 10 }}>ประวัติการตรวจย้อนหลัง</h3>
        <div className="tbl-wrap" style={{ border: 'none', marginBottom: 24 }}>
          <table className="tbl">
            <thead><tr><th>วันที่</th><th>ประเภทการตรวจ</th><th>ผลสรุป</th></tr></thead>
            <tbody>
              {record.checkupHistory.map((c) => (
                <tr key={c.date}><td className="tabular">{c.date}</td><td>{c.type}</td><td>{c.result}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="field-grid-2" style={{ alignItems: 'start' }}>
          <div>
            <h3 style={{ fontSize: 14, marginBottom: 10 }}>น้ำหนัก ส่วนสูง และภาวะโภชนาการ</h3>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead><tr><th>วันที่บันทึก</th><th>น้ำหนัก</th><th>ส่วนสูง</th><th>BMI</th><th>ภาวะโภชนาการ</th></tr></thead>
                <tbody>
                  {record.growthHistory.map((g) => (
                    <tr key={g.date}>
                      <td className="tabular">{g.date}</td>
                      <td className="tabular">{g.weight} กก.</td>
                      <td className="tabular">{g.height} ซม.</td>
                      <td className="tabular">{g.bmi}</td>
                      <td><span className={`badge ${NUTRITION_CLASS[g.nutrition.tone]}`}><span className="badge-dot" />{g.nutrition.label}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: 14, marginBottom: 4 }}>ข้อมูลพฤติกรรมเด็ก</h3>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 14 }}>ประวัติการประเมินพฤติกรรมย้อนหลัง พร้อมผลและวันที่ประเมิน</p>
            <div className="behavior-timeline">
              {record.behaviorHistory.map((b) => (
                <div className="behavior-item" key={b.date}>
                  <div className="date">{b.date}</div>
                  <div className="type">
                    {b.type}
                    <span className={`badge ${NUTRITION_CLASS[b.tone]}`}><span className="badge-dot" />{b.result}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
