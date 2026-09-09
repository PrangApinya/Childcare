import { useState } from 'react'
import { IconClipboardCheck, IconFileText, IconMore } from '../../icons.jsx'

const THAI_MONTHS_ABBR = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
function todayThaiLabel() {
  const d = new Date()
  return `${d.getDate()} ${THAI_MONTHS_ABBR[d.getMonth()]} ${d.getFullYear() + 543}  เวลา ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function CheckField({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

function HistoryValue({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{value}</div>
    </div>
  )
}

const YN = (v) => (v ? 'ใช่' : 'ไม่ใช่')

function HistoryCard({ entry, showToast }) {
  const services = [
    entry.dentalEducation && 'ให้ทันตสุขศึกษา',
    entry.checkupAdvice && 'ตรวจแนะนำ',
    entry.brushingTrained && 'ฝึกแปรงฟันถูกวิธี',
    entry.fluorideCoating && 'เคลือบฟลูออไรด์',
    entry.pitFissureSealant && `เคลือบหลุมร่องฟัน (${entry.pitFissureSealantTeeth} ซี่)`,
    entry.filling && 'อุดฟัน',
    entry.extraction && 'ถอนฟัน',
    entry.scaling && 'ขูดหินปูน',
  ].filter(Boolean)

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div className="card-hd">
        <span style={{ fontWeight: 600, fontSize: 13 }}>{entry.recordedDateLabel}</span>
        <button className="icon-btn" style={{ marginLeft: 'auto' }} title="เพิ่มเติม" onClick={() => showToast?.('ฟีเจอร์นี้ยังไม่พร้อมใช้งาน')}>
          <IconMore size={16} />
        </button>
      </div>
      <div className="card-bd">
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>บริการที่ได้รับ</div>
          <div style={{ fontSize: 13 }}>{services.length ? services.join(', ') : '-'}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          <HistoryValue label="ฟันแท้ผุ (D)" value={`${entry.decayedTeeth} ซี่`} />
          <HistoryValue label="ฟันแท้ถูกถอน (M)" value={`${entry.missingTeeth} ซี่`} />
          <HistoryValue label="ฟันแท้ที่อุดแล้ว (F)" value={`${entry.filledTeeth} ซี่`} />
          <HistoryValue label="ฟันน้ำนมผุ" value={`${entry.decayedBabyTeeth} ซี่`} />
          <HistoryValue label="เหงือกอักเสบ" value={YN(entry.gingivitis)} />
          <HistoryValue label="หินน้ำลาย" value={YN(entry.calculus)} />
        </div>
      </div>
    </div>
  )
}

export default function DentalTab({ history, onSave, showToast }) {
  const [dentalEducation, setDentalEducation] = useState(false)
  const [checkupAdvice, setCheckupAdvice] = useState(false)
  const [brushingTrained, setBrushingTrained] = useState(false)
  const [fluorideCoating, setFluorideCoating] = useState(false)
  const [pitFissureSealant, setPitFissureSealant] = useState(false)
  const [pitFissureSealantTeeth, setPitFissureSealantTeeth] = useState('')
  const [filling, setFilling] = useState(false)
  const [extraction, setExtraction] = useState(false)
  const [scaling, setScaling] = useState(false)

  const [decayedTeeth, setDecayedTeeth] = useState('')
  const [missingTeeth, setMissingTeeth] = useState('')
  const [filledTeeth, setFilledTeeth] = useState('')
  const [decayedBabyTeeth, setDecayedBabyTeeth] = useState('')
  const [gingivitis, setGingivitis] = useState(false)
  const [calculus, setCalculus] = useState(false)

  function handleSave() {
    onSave({
      id: `dental-new-${Date.now()}`,
      recordedDateLabel: todayThaiLabel(),
      dentalEducation, checkupAdvice, brushingTrained, fluorideCoating,
      pitFissureSealant, pitFissureSealantTeeth: pitFissureSealant ? Number(pitFissureSealantTeeth) || 0 : 0,
      filling, extraction, scaling,
      decayedTeeth: Number(decayedTeeth) || 0,
      missingTeeth: Number(missingTeeth) || 0,
      filledTeeth: Number(filledTeeth) || 0,
      decayedBabyTeeth: Number(decayedBabyTeeth) || 0,
      gingivitis, calculus,
    })
    setDentalEducation(false); setCheckupAdvice(false); setBrushingTrained(false); setFluorideCoating(false)
    setPitFissureSealant(false); setPitFissureSealantTeeth(''); setFilling(false); setExtraction(false); setScaling(false)
    setDecayedTeeth(''); setMissingTeeth(''); setFilledTeeth(''); setDecayedBabyTeeth(''); setGingivitis(false); setCalculus(false)
  }

  return (
    <>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-hd">
          <IconClipboardCheck size={16} />
          <h3 style={{ marginLeft: 8 }}>บันทึกการให้บริการทันตกรรม</h3>
        </div>
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

      <div className="card" style={{ marginBottom: 20 }}>
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

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
        <button className="btn btn-primary btn-sm" onClick={handleSave}>บันทึกผลตรวจทันตกรรม</button>
      </div>

      <div className="card-hd" style={{ padding: '0 0 12px', border: 'none' }}>
        <IconFileText size={16} />
        <h3 style={{ marginLeft: 8 }}>ประวัติการตรวจที่บันทึกแล้ว</h3>
      </div>
      {history.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>ยังไม่มีประวัติการตรวจ</div>
      ) : (
        history.map((entry) => <HistoryCard key={entry.id} entry={entry} showToast={showToast} />)
      )}
    </>
  )
}
