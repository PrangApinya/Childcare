import { useState } from 'react'
import { IconX } from '../icons.jsx'

function CheckField({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

// Mirrors DentalTab.jsx's per-student "บันทึกการให้บริการทันตกรรม" / "บันทึกการตรวจฟัน" cards,
// opened per row from the school checkup-detail page's ตรวจทันตกรรม batch form (as a spacious
// alternative to editing the same 14 fields inline in the table).
export default function DentalFindingsModal({ student, initial, onCancel, onSave }) {
  const [dentalEducation, setDentalEducation] = useState(initial?.dentalEducation ?? false)
  const [checkupAdvice, setCheckupAdvice] = useState(initial?.checkupAdvice ?? false)
  const [brushingTrained, setBrushingTrained] = useState(initial?.brushingTrained ?? false)
  const [fluorideCoating, setFluorideCoating] = useState(initial?.fluorideCoating ?? false)
  const [pitFissureSealant, setPitFissureSealant] = useState(initial?.pitFissureSealant ?? false)
  const [pitFissureSealantTeeth, setPitFissureSealantTeeth] = useState(initial?.pitFissureSealantTeeth ?? '')
  const [filling, setFilling] = useState(initial?.filling ?? false)
  const [extraction, setExtraction] = useState(initial?.extraction ?? false)
  const [scaling, setScaling] = useState(initial?.scaling ?? false)

  const [decayedTeeth, setDecayedTeeth] = useState(initial?.decayedTeeth ?? '')
  const [missingTeeth, setMissingTeeth] = useState(initial?.missingTeeth ?? '')
  const [filledTeeth, setFilledTeeth] = useState(initial?.filledTeeth ?? '')
  const [decayedBabyTeeth, setDecayedBabyTeeth] = useState(initial?.decayedBabyTeeth ?? '')
  const [gingivitis, setGingivitis] = useState(initial?.gingivitis ?? false)
  const [calculus, setCalculus] = useState(initial?.calculus ?? false)

  function handleSave() {
    onSave({
      dentalEducation, checkupAdvice, brushingTrained, fluorideCoating,
      pitFissureSealant, pitFissureSealantTeeth: pitFissureSealant ? Number(pitFissureSealantTeeth) || 0 : 0,
      filling, extraction, scaling,
      decayedTeeth: Number(decayedTeeth) || 0,
      missingTeeth: Number(missingTeeth) || 0,
      filledTeeth: Number(filledTeeth) || 0,
      decayedBabyTeeth: Number(decayedBabyTeeth) || 0,
      gingivitis, calculus,
    })
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-hd">
          <h3>ผลตรวจทันตกรรม — {student.fullName}</h3>
          <button className="modal-close" aria-label="ปิด" onClick={onCancel}><IconX size={16} /></button>
        </div>
        <div className="modal-bd">
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-hd"><h3>บันทึกการให้บริการทันตกรรม</h3></div>
            <div className="card-bd" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <CheckField label="ให้ทันตสุขศึกษา" checked={dentalEducation} onChange={setDentalEducation} />
              <CheckField label="ตรวจแนะนำ" checked={checkupAdvice} onChange={setCheckupAdvice} />
              <CheckField label="ฝึกแปรงฟันถูกวิธี" checked={brushingTrained} onChange={setBrushingTrained} />
              <CheckField label="ได้รับการเคลือบฟลูออไรด์" checked={fluorideCoating} onChange={setFluorideCoating} />

              <div>
                <CheckField label="ได้รับการเคลือบหลุมร่องฟัน" checked={pitFissureSealant} onChange={setPitFissureSealant} />
                {pitFissureSealant && (
                  <div style={{ marginTop: 8, maxWidth: 200 }}>
                    <label className="f-label">จำนวนซี่</label>
                    <input className="f-input" type="number" min="0" value={pitFissureSealantTeeth} onChange={(e) => setPitFissureSealantTeeth(e.target.value)} />
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <CheckField label="อุดฟัน" checked={filling} onChange={setFilling} />
                <CheckField label="ถอนฟัน" checked={extraction} onChange={setExtraction} />
                <CheckField label="ขูดหินปูน" checked={scaling} onChange={setScaling} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-hd"><h3>บันทึกการตรวจฟัน</h3></div>
            <div className="card-bd">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginBottom: 16 }}>
                <div>
                  <label className="f-label">จำนวนฟันแท้ผุ : D (ซี่)</label>
                  <input className="f-input" type="number" min="0" value={decayedTeeth} onChange={(e) => setDecayedTeeth(e.target.value)} />
                </div>
                <div>
                  <label className="f-label">จำนวนฟันแท้ที่ถูกถอนไปแล้ว : M (ซี่)</label>
                  <input className="f-input" type="number" min="0" value={missingTeeth} onChange={(e) => setMissingTeeth(e.target.value)} />
                </div>
                <div>
                  <label className="f-label">จำนวนฟันแท้ที่อุดแล้ว : F (ซี่)</label>
                  <input className="f-input" type="number" min="0" value={filledTeeth} onChange={(e) => setFilledTeeth(e.target.value)} />
                </div>
                <div>
                  <label className="f-label">จำนวนฟันน้ำนมผุ (ซี่)</label>
                  <input className="f-input" type="number" min="0" value={decayedBabyTeeth} onChange={(e) => setDecayedBabyTeeth(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <CheckField label="มีเหงือกอักเสบ" checked={gingivitis} onChange={setGingivitis} />
                <CheckField label="มีหินน้ำลาย" checked={calculus} onChange={setCalculus} />
              </div>
            </div>
          </div>
        </div>
        <div className="modal-ft">
          <button className="btn btn-neutral btn-sm" onClick={onCancel}>ยกเลิก</button>
          <button className="btn btn-primary btn-sm" onClick={handleSave}>บันทึก</button>
        </div>
      </div>
    </div>
  )
}
