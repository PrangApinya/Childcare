import { useState } from 'react'
import { IconX, IconAlertTriangle } from '../icons.jsx'
import { MENTAL_SCREEN_RESULTS, MENTAL_4_DISORDERS, MENTAL_CARE_LEVELS, isMentalScreeningRisk, depressionToolForAge } from '../../data/schools.js'

const RESULT_BADGE = { ปกติ: 'badge-green', กลุ่มเสี่ยง: 'badge-orange', มีแนวโน้มซึมเศร้า: 'badge-red' }

function Badge({ value }) {
  if (!value) return null
  return <span className={`badge ${RESULT_BADGE[value] || 'badge-grey'}`}><span className="badge-dot" />{value}</span>
}

// Mirrors MentalHealthTab.jsx's per-student screening form, opened per row from the school
// checkup-detail page's สุขภาพจิต batch form.
export default function MentalFindingsModal({ student, ageYears, initial, onCancel, onSave }) {
  const [screen9SPlus, setScreen9SPlus] = useState(initial?.screen9SPlus ?? '')
  const [screenSDQ, setScreenSDQ] = useState(initial?.screenSDQ ?? '')
  const [disorders, setDisorders] = useState(initial?.disorders ?? {})
  const [depressionResult, setDepressionResult] = useState(initial?.depressionResult ?? '')
  const [careLevel, setCareLevel] = useState(initial?.careLevel ?? '')
  const [followUp, setFollowUp] = useState(initial?.followUp ?? false)

  const risk = isMentalScreeningRisk({ screen9SPlus, screenSDQ })
  const depressionTool = depressionToolForAge(ageYears)

  function toggleDisorder(key, checked) {
    setDisorders((cur) => ({ ...cur, [key]: checked }))
  }

  function handleSave() {
    onSave({
      screen9SPlus, screenSDQ,
      disorders: risk ? disorders : {},
      depressionResult: risk ? depressionResult : '',
      careLevel: risk ? careLevel : '',
      followUp: risk ? followUp : false,
    })
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-hd">
          <h3>ผลประเมินสุขภาพจิต — {student.fullName}</h3>
          <button className="modal-close" aria-label="ปิด" onClick={onCancel}><IconX size={16} /></button>
        </div>
        <div className="modal-bd">
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-hd"><h3>คัดกรองพฤติกรรมและอารมณ์</h3></div>
            <div className="card-bd">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16 }}>
                <div>
                  <label className="f-label">แบบประเมิน 9S Plus</label>
                  <select className="f-input" value={screen9SPlus} onChange={(e) => setScreen9SPlus(e.target.value)}>
                    <option value="">เลือกผลประเมิน</option>
                    {MENTAL_SCREEN_RESULTS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="f-label">แบบประเมิน SDQ</label>
                  <select className="f-input" value={screenSDQ} onChange={(e) => setScreenSDQ(e.target.value)}>
                    <option value="">เลือกผลประเมิน</option>
                    {MENTAL_SCREEN_RESULTS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {risk && (
            <>
              <div className="card" style={{ marginBottom: 16, borderColor: 'var(--border-danger, #FCA5A5)' }}>
                <div className="card-hd">
                  <IconAlertTriangle size={16} style={{ color: 'var(--icon-alertdialog-warning, #D97706)' }} />
                  <h3 style={{ marginLeft: 8 }}>สังเกตพฤติกรรม — ประเมิน 4 โรคหลัก</h3>
                </div>
                <div className="card-bd" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {MENTAL_4_DISORDERS.map((d) => (
                    <label key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                      <input type="checkbox" checked={disorders[d.key] ?? false} onChange={(e) => toggleDisorder(d.key, e.target.checked)} />
                      {d.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="card" style={{ marginBottom: 16 }}>
                <div className="card-hd"><h3>ประเมินภาวะซึมเศร้า — {depressionTool}</h3></div>
                <div className="card-bd">
                  <select className="f-input" value={depressionResult} onChange={(e) => setDepressionResult(e.target.value)}>
                    <option value="">เลือกผลประเมิน</option>
                    <option value="ปกติ">ปกติ</option>
                    <option value="มีแนวโน้มซึมเศร้า">มีแนวโน้มซึมเศร้า</option>
                  </select>
                  {depressionResult && <div style={{ marginTop: 12 }}><Badge value={depressionResult} /></div>}
                </div>
              </div>

              <div className="card">
                <div className="card-hd"><h3>แนวทางการดูแลช่วยเหลือและส่งต่อ</h3></div>
                <div className="card-bd">
                  <label className="f-label">ระดับการดูแล</label>
                  <select className="f-input" style={{ marginBottom: 16 }} value={careLevel} onChange={(e) => setCareLevel(e.target.value)}>
                    <option value="">เลือกระดับการดูแล</option>
                    {MENTAL_CARE_LEVELS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                    <input type="checkbox" checked={followUp} onChange={(e) => setFollowUp(e.target.checked)} />
                    ติดตามผลการประเมินซ้ำ
                  </label>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="modal-ft">
          <button className="btn btn-neutral btn-sm" onClick={onCancel}>ยกเลิก</button>
          <button className="btn btn-primary btn-sm" onClick={handleSave}>บันทึก</button>
        </div>
      </div>
    </div>
  )
}
