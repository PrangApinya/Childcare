import { useState } from 'react'
import { IconClipboardCheck, IconAlertTriangle, IconFileText, IconMore } from '../../icons.jsx'
import { DEVELOPMENT_RESULTS } from '../../../data/schools.js'

const THAI_MONTHS_ABBR = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
function todayThaiLabel() {
  const d = new Date()
  return `${d.getDate()} ${THAI_MONTHS_ABBR[d.getMonth()]} ${d.getFullYear() + 543}  เวลา ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
function oneMonthFromNowLabel() {
  const d = new Date()
  d.setMonth(d.getMonth() + 1)
  return `${d.getDate()} ${THAI_MONTHS_ABBR[d.getMonth()]} ${d.getFullYear() + 543}`
}

const RESULT_BADGE = { ปกติ: 'badge-green', สงสัยล่าช้า: 'badge-orange', ล่าช้า: 'badge-red' }
const REFERRAL_OPTIONS = ['คลินิกกระตุ้นพัฒนาการ', 'งานสุขภาพจิต']

function HistoryCard({ entry, showToast }) {
  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div className="card-hd">
        <span style={{ fontWeight: 600, fontSize: 13 }}>{entry.recordedDateLabel}</span>
        <button className="icon-btn" style={{ marginLeft: 'auto' }} title="เพิ่มเติม" onClick={() => showToast?.('ฟีเจอร์นี้ยังไม่พร้อมใช้งาน')}>
          <IconMore size={16} />
        </button>
      </div>
      <div className="card-bd" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>รอบการประเมิน</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>ครั้งที่ {entry.round}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>ผลการประเมิน</div>
          <span className={`badge ${RESULT_BADGE[entry.result] || 'badge-grey'}`}><span className="badge-dot" />{entry.result}</span>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>ส่งต่อ</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{entry.referral || '-'}</div>
        </div>
      </div>
    </div>
  )
}

export default function DevelopmentTab({ history, onSave, showToast }) {
  const latest = history[0]
  const suggestedRound = latest?.result === 'สงสัยล่าช้า' && latest.round === 1 ? 2 : 1
  const [round, setRound] = useState(suggestedRound)
  const [result, setResult] = useState('')
  const [referral, setReferral] = useState('')

  function handleSave() {
    onSave({
      id: `development-new-${Date.now()}`,
      recordedDateLabel: todayThaiLabel(),
      round,
      result,
      referral: result === 'ล่าช้า' ? referral : '',
    })
    setRound(1); setResult(''); setReferral('')
  }

  return (
    <>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-hd">
          <IconClipboardCheck size={16} />
          <h3 style={{ marginLeft: 8 }}>การตรวจคัดกรองพัฒนาการ (DSPM)</h3>
        </div>
        <div className="card-bd">
          <label className="f-label">รอบการประเมิน</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <button type="button" className={`chip${round === 1 ? ' active' : ''}`} onClick={() => setRound(1)}>ครั้งที่ 1</button>
            <button type="button" className={`chip${round === 2 ? ' active' : ''}`} onClick={() => setRound(2)}>ครั้งที่ 2 (นัดติดตาม)</button>
          </div>

          <label className="f-label">ผลการประเมิน</label>
          <select className="f-input" value={result} onChange={(e) => setResult(e.target.value)}>
            <option value="">เลือกผลประเมิน</option>
            {DEVELOPMENT_RESULTS.map((r) => <option key={r}>{r}</option>)}
          </select>

          {result && (
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-default)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 4 }}>ผลการประเมิน</div>
              <span className={`badge ${RESULT_BADGE[result]}`}><span className="badge-dot" />{result}</span>
            </div>
          )}
        </div>
      </div>

      {result === 'สงสัยล่าช้า' && round === 1 && (
        <div className="card" style={{ marginBottom: 20, borderColor: 'var(--border-danger, #FCA5A5)' }}>
          <div className="card-bd" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IconAlertTriangle size={16} style={{ color: 'var(--icon-alertdialog-warning, #D97706)', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              ระบบแนะนำให้นัดประเมินครั้งที่ 2 ในวันที่ {oneMonthFromNowLabel()} (1 เดือนถัดไป)
            </span>
          </div>
        </div>
      )}

      {result === 'ล่าช้า' && (
        <div className="card" style={{ marginBottom: 20, borderColor: 'var(--border-danger, #FCA5A5)' }}>
          <div className="card-hd">
            <IconAlertTriangle size={16} style={{ color: 'var(--icon-alertdialog-destructive, #DC2626)' }} />
            <h3 style={{ marginLeft: 8 }}>ส่งต่อ</h3>
          </div>
          <div className="card-bd">
            <select className="f-input" value={referral} onChange={(e) => setReferral(e.target.value)}>
              <option value="">เลือกหน่วยงานที่ส่งต่อ</option>
              {REFERRAL_OPTIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={!result}>บันทึกผลตรวจพัฒนาการ</button>
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
