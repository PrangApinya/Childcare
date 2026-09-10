import { useState } from 'react'
import { IconClipboardCheck, IconAlertTriangle, IconFileText, IconMore } from '../../icons.jsx'
import {
  assessNutrition, isObesityFlag, assessAnemia,
  VISION_RESULTS, LICE_RESULTS, HEARING_RESULTS,
} from '../../../data/healthAssessment.js'

const NUTRITION_BADGE = {
  ผอม: 'badge-red', ค่อนข้างผอม: 'badge-orange', สมส่วน: 'badge-green', ท้วม: 'badge-orange',
  เริ่มอ้วน: 'badge-red', อ้วน: 'badge-red', เตี้ย: 'badge-red', ค่อนข้างเตี้ย: 'badge-orange',
  สูงตามเกณฑ์: 'badge-green', สูง: 'badge-green', น้อยกว่าเกณฑ์: 'badge-orange',
  มากกว่าเกณฑ์: 'badge-orange', ตามเกณฑ์: 'badge-green', ปกติ: 'badge-green',
  สายตาสั้น: 'badge-orange', อื่นๆ: 'badge-grey', พบ: 'badge-orange', ไม่พบ: 'badge-green',
  ผิดปกติ: 'badge-red', ซีด: 'badge-red',
}

const THAI_MONTHS_ABBR = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
function todayThaiLabel() {
  const d = new Date()
  return `${d.getDate()} ${THAI_MONTHS_ABBR[d.getMonth()]} ${d.getFullYear() + 543}  เวลา ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function Badge({ value }) {
  if (!value) return <span className="badge badge-grey"><span className="badge-dot" />—</span>
  return <span className={`badge ${NUTRITION_BADGE[value] || 'badge-grey'}`}><span className="badge-dot" />{value}</span>
}

function HistoryField({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>{label}</div>
      <Badge value={value} />
    </div>
  )
}

function HistoryCard({ entry, showToast }) {
  const n = entry.nutrition
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div className="card-hd">
        <span style={{ fontWeight: 600, fontSize: 13 }}>{entry.recordedDateLabel}</span>
        <button
          className="icon-btn"
          style={{ marginLeft: 'auto' }}
          title="เพิ่มเติม"
          onClick={() => showToast?.('ฟีเจอร์นี้ยังไม่พร้อมใช้งาน')}
        >
          <IconMore size={16} />
        </button>
      </div>
      <div className="card-bd" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        <HistoryField label="น้ำหนัก (กก.)" value={entry.weightKg ? `${entry.weightKg} กก.` : '—'} />
        <HistoryField label="ส่วนสูง (ซม.)" value={entry.heightCm ? `${entry.heightCm} ซม.` : '—'} />
        <HistoryField label="ภาวะโภชนาการ" value={n?.weightForHeight} />
        <HistoryField label="สายตา" value={entry.vision} />

        <HistoryField label="เหา" value={entry.lice} />
        <HistoryField label="การได้ยิน" value={entry.hearing} />
        {entry.anemiaEligible && <HistoryField label="ภาวะซีด" value={entry.anemiaResult} />}
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>หมายเหตุ</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {[entry.obesityAcanthosis && 'พบภาวะคอดำ', entry.obesitySnoring && 'พบการนอนกรน'].filter(Boolean).join(', ') || '-'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HealthCheckupTab({ history, onSave, showToast }) {
  const latest = history[0]
  const [weightKg, setWeightKg] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [vision, setVision] = useState('')
  const [lice, setLice] = useState('')
  const [hearing, setHearing] = useState('')
  const [obesityAcanthosis, setObesityAcanthosis] = useState(false)
  const [obesitySnoring, setObesitySnoring] = useState(false)
  const [hb, setHb] = useState('')
  const [hct, setHct] = useState('')
  const [anemiaAdvice, setAnemiaAdvice] = useState(false)
  const [anemiaNotify, setAnemiaNotify] = useState(false)

  const weight = Number(weightKg)
  const height = Number(heightCm)
  const nutrition = weight && height ? assessNutrition({ weightKg: weight, heightCm: height, ageYears: latest.ageYears }) : null
  const showObesity = isObesityFlag(nutrition)
  const anemiaEligible = latest.anemiaEligible
  const anemiaResult = anemiaEligible ? assessAnemia({ hb, hct }) : null

  function handleSave() {
    onSave({
      id: `${latest.id}-new-${Date.now()}`,
      recordedDateLabel: todayThaiLabel(),
      gradeName: latest.gradeName,
      ageYears: latest.ageYears,
      weightKg: weight || null,
      heightCm: height || null,
      nutrition,
      vision, lice, hearing,
      obesityAcanthosis, obesitySnoring,
      hb, hct, anemiaAdvice, anemiaNotify,
      anemiaEligible,
      anemiaResult,
    })
    setWeightKg(''); setHeightCm(''); setVision(''); setLice(''); setHearing('')
    setObesityAcanthosis(false); setObesitySnoring(false); setHb(''); setHct('')
    setAnemiaAdvice(false); setAnemiaNotify(false)
  }

  return (
    <>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-hd">
          <IconClipboardCheck size={16} />
          <h3 style={{ marginLeft: 8 }}>บันทึกผลตรวจสุขภาพนักเรียน</h3>
        </div>
        <div className="card-bd">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>
            <div>
              <label className="f-label">น้ำหนัก (กก.)</label>
              <input className="f-input" type="number" min="0" step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
            </div>
            <div>
              <label className="f-label">ส่วนสูง (ซม.)</label>
              <input className="f-input" type="number" min="0" step="0.1" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
            </div>
            <HistoryField label="ภาวะโภชนาการ" value={nutrition?.weightForHeight} />
          </div>

          {!nutrition && (
            <div style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>กรอกน้ำหนักและส่วนสูงเพื่อให้ระบบประเมินภาวะโภชนาการโดยอัตโนมัติ</div>
          )}
        </div>
      </div>

      {showObesity && (
        <div className="card" style={{ marginBottom: 20, borderColor: 'var(--border-danger, #FCA5A5)' }}>
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

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-hd"><h3>การคัดกรองอื่นๆ</h3></div>
        <div className="card-bd" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          <div>
            <label className="f-label">การตรวจสายตา</label>
            <select className="f-input" value={vision} onChange={(e) => setVision(e.target.value)}>
              <option value="">เลือกผลตรวจ</option>
              {VISION_RESULTS.map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="f-label">การตรวจเหา</label>
            <select className="f-input" value={lice} onChange={(e) => setLice(e.target.value)}>
              <option value="">เลือกผลตรวจ</option>
              {LICE_RESULTS.map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="f-label">การตรวจการได้ยิน</label>
            <select className="f-input" value={hearing} onChange={(e) => setHearing(e.target.value)}>
              <option value="">เลือกผลตรวจ</option>
              {HEARING_RESULTS.map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>
      </div>

      {anemiaEligible && (
        <div className="card" style={{ marginBottom: 20 }}>
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
            {anemiaResult && <div style={{ marginBottom: 12 }}><Badge value={anemiaResult} /></div>}
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

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
        <button className="btn btn-primary btn-sm" onClick={handleSave}>บันทึกผลตรวจสุขภาพ</button>
      </div>

      <div className="card-hd" style={{ padding: '0 0 12px', border: 'none' }}>
        <IconFileText size={16} />
        <h3 style={{ marginLeft: 8 }}>ประวัติการตรวจที่บันทึกแล้ว</h3>
      </div>
      {history.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          ยังไม่มีประวัติการตรวจ
        </div>
      ) : (
        history.map((entry) => <HistoryCard key={entry.id} entry={entry} showToast={showToast} />)
      )}
    </>
  )
}
