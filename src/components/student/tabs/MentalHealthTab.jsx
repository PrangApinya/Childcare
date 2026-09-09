import { useState } from 'react'
import { IconClipboardCheck, IconAlertTriangle, IconFileText, IconMore } from '../../icons.jsx'
import { MENTAL_SCREEN_RESULTS, MENTAL_4_DISORDERS, MENTAL_CARE_LEVELS, isMentalScreeningRisk, depressionToolForAge } from '../../../data/schools.js'

const THAI_MONTHS_ABBR = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
function todayThaiLabel() {
  const d = new Date()
  return `${d.getDate()} ${THAI_MONTHS_ABBR[d.getMonth()]} ${d.getFullYear() + 543}  เวลา ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const RESULT_BADGE = { ปกติ: 'badge-green', กลุ่มเสี่ยง: 'badge-orange', มีแนวโน้มซึมเศร้า: 'badge-red' }
const DISORDER_LABEL = Object.fromEntries(MENTAL_4_DISORDERS.map((d) => [d.key, d.label]))

function Badge({ value }) {
  if (!value) return null
  return <span className={`badge ${RESULT_BADGE[value] || 'badge-grey'}`}><span className="badge-dot" />{value}</span>
}

function HistoryCard({ entry, showToast }) {
  const flaggedDisorders = Object.entries(entry.disorders || {}).filter(([, v]) => v).map(([k]) => DISORDER_LABEL[k])
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div className="card-hd">
        <span style={{ fontWeight: 600, fontSize: 13 }}>{entry.recordedDateLabel}</span>
        <button className="icon-btn" style={{ marginLeft: 'auto' }} title="เพิ่มเติม" onClick={() => showToast?.('ฟีเจอร์นี้ยังไม่พร้อมใช้งาน')}>
          <IconMore size={16} />
        </button>
      </div>
      <div className="card-bd">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16, marginBottom: flaggedDisorders.length || entry.careLevel ? 16 : 0 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>9S Plus</div>
            <Badge value={entry.screen9SPlus} />
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>SDQ</div>
            <Badge value={entry.screenSDQ} />
          </div>
        </div>
        {flaggedDisorders.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>ข้อสังเกต 4 โรคหลัก</div>
            <div style={{ fontSize: 13 }}>{flaggedDisorders.join(', ')}</div>
          </div>
        )}
        {entry.depressionResult && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>ภาวะซึมเศร้า</div>
            <Badge value={entry.depressionResult} />
          </div>
        )}
        {entry.careLevel && (
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>ระดับการดูแล</div>
            <div style={{ fontSize: 13 }}>{entry.careLevel}{entry.followUp ? ' · ติดตามผลซ้ำ' : ''}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MentalHealthTab({ history, onSave, showToast }) {
  const latest = history[0]
  const [screen9SPlus, setScreen9SPlus] = useState('')
  const [screenSDQ, setScreenSDQ] = useState('')
  const [disorders, setDisorders] = useState({})
  const [depressionResult, setDepressionResult] = useState('')
  const [careLevel, setCareLevel] = useState('')
  const [followUp, setFollowUp] = useState(false)

  const risk = isMentalScreeningRisk({ screen9SPlus, screenSDQ })
  const depressionTool = depressionToolForAge(latest.ageYears)

  function toggleDisorder(key, checked) {
    setDisorders((cur) => ({ ...cur, [key]: checked }))
  }

  function handleSave() {
    onSave({
      id: `mental-new-${Date.now()}`,
      recordedDateLabel: todayThaiLabel(),
      ageYears: latest.ageYears,
      screen9SPlus, screenSDQ,
      disorders: risk ? disorders : {},
      depressionResult: risk ? depressionResult : '',
      careLevel: risk ? careLevel : '',
      followUp: risk ? followUp : false,
    })
    setScreen9SPlus(''); setScreenSDQ(''); setDisorders({}); setDepressionResult(''); setCareLevel(''); setFollowUp(false)
  }

  return (
    <>
      <div className="card" style={{ marginBottom: 20, background: 'var(--bg-subtle, #F8FAFC)' }}>
        <div className="card-bd" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          ปัจจุบันบริการนี้ยังไม่สามารถเบิกจ่ายได้ แต่ต้องบันทึกเพื่อเป็นภาระงาน (Workload) ของนักจิตวิทยา
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-hd">
          <IconClipboardCheck size={16} />
          <h3 style={{ marginLeft: 8 }}>คัดกรองพฤติกรรมและอารมณ์</h3>
        </div>
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
          <div className="card" style={{ marginBottom: 20, borderColor: 'var(--border-danger, #FCA5A5)' }}>
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

          <div className="card" style={{ marginBottom: 20 }}>
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

          <div className="card" style={{ marginBottom: 20 }}>
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

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
        <button className="btn btn-primary btn-sm" onClick={handleSave}>บันทึกผลประเมินสุขภาพจิต</button>
      </div>

      <div className="card-hd" style={{ padding: '0 0 12px', border: 'none' }}>
        <IconFileText size={16} />
        <h3 style={{ marginLeft: 8 }}>ประวัติการตรวจที่บันทึกแล้ว</h3>
      </div>
      {history.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>ยังไม่มีประวัติการประเมิน</div>
      ) : (
        history.map((entry) => <HistoryCard key={entry.id} entry={entry} showToast={showToast} />)
      )}
    </>
  )
}
