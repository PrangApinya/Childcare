import { useState } from 'react'
import { IconX, IconAlertTriangle } from '../icons.jsx'
import {
  assessNutrition, isObesityFlag, isAnemiaEligible, assessAnemia,
} from '../../data/healthAssessment.js'

export default function CheckupFindingsModal({ student, weightKg, heightCm, ageYears, initial, onCancel, onSave }) {
  const [obesityAcanthosis, setObesityAcanthosis] = useState(initial?.obesityAcanthosis ?? false)
  const [obesitySnoring, setObesitySnoring] = useState(initial?.obesitySnoring ?? false)
  const [hb, setHb] = useState(initial?.hb ?? '')
  const [hct, setHct] = useState(initial?.hct ?? '')
  const [anemiaAdvice, setAnemiaAdvice] = useState(initial?.anemiaAdvice ?? false)
  const [anemiaNotify, setAnemiaNotify] = useState(initial?.anemiaNotify ?? false)

  const weight = Number(weightKg)
  const height = Number(heightCm)
  const nutrition = weight && height ? assessNutrition({ weightKg: weight, heightCm: height, ageYears }) : null
  const showObesity = isObesityFlag(nutrition)
  const anemiaEligible = isAnemiaEligible(student)
  const anemiaResult = assessAnemia({ hb, hct })

  function handleSave() {
    onSave({
      obesityAcanthosis, obesitySnoring,
      hb, hct, anemiaAdvice, anemiaNotify,
    })
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-hd">
          <h3>ผลตรวจสุขภาพเพิ่มเติม — {student.fullName}</h3>
          <button className="modal-close" aria-label="ปิด" onClick={onCancel}><IconX size={16} /></button>
        </div>
        <div className="modal-bd">
          {showObesity && (
            <div className="card" style={{ marginBottom: 16, borderColor: 'var(--border-danger, #FCA5A5)' }}>
              <div className="card-hd">
                <IconAlertTriangle size={16} style={{ color: 'var(--icon-alertdialog-warning, #D97706)' }} />
                <h3 style={{ marginLeft: 8 }}>คัดกรองความเสี่ยง Obesity Sign</h3>
              </div>
              <div className="card-bd" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <input type="checkbox" checked={obesityAcanthosis} onChange={(e) => setObesityAcanthosis(e.target.checked)} />
                  ภาวะคอดำ (Acanthosis Nigricans)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <input type="checkbox" checked={obesitySnoring} onChange={(e) => setObesitySnoring(e.target.checked)} />
                  การนอนกรน
                </label>
              </div>
            </div>
          )}

          {anemiaEligible && (
            <div className="card" style={{ marginTop: showObesity ? 4 : 0 }}>
              <div className="card-hd"><h3>การคัดกรองภาวะซีด (Anemia Screening)</h3></div>
              <div className="card-bd">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12, marginBottom: 12 }}>
                  <div>
                    <label className="f-label">ฮีโมโกลบิน (Hb)</label>
                    <input className="f-input" type="number" step="0.1" min="0" value={hb} onChange={(e) => setHb(e.target.value)} />
                  </div>
                  <div>
                    <label className="f-label">ฮีมาโตคริต (Hct)</label>
                    <input className="f-input" type="number" step="0.1" min="0" value={hct} onChange={(e) => setHct(e.target.value)} />
                  </div>
                </div>
                {anemiaResult && (
                  <div style={{ marginBottom: 12 }}>
                    <span className={`badge ${anemiaResult === 'ซีด' ? 'badge-red' : 'badge-green'}`}><span className="badge-dot" />{anemiaResult}</span>
                  </div>
                )}
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, marginBottom: 8 }}>
                  <input type="checkbox" checked={anemiaAdvice} onChange={(e) => setAnemiaAdvice(e.target.checked)} />
                  การให้คำแนะนำ
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                  <input type="checkbox" checked={anemiaNotify} onChange={(e) => setAnemiaNotify(e.target.checked)} />
                  การแจ้งผล
                </label>
              </div>
            </div>
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
