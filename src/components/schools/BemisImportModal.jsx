import { useState } from 'react'
import { IconX, IconCheck } from '../icons.jsx'

const FIELDS = ['ชื่อ-นามสกุล', 'เลขบัตรประชาชน', 'วันเดือนปีเกิด', 'ระดับชั้น']

export default function BemisImportModal({ schools, onCancel, onDone }) {
  const [schoolId, setSchoolId] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | done
  const [result, setResult] = useState(null)

  function handleImport() {
    setStatus('loading')
    setTimeout(() => {
      const target = schools.find((s) => s.id === schoolId)
      const base = target ? target.studentCount : schools.reduce((sum, s) => sum + s.studentCount, 0)
      const updated = Math.round(base * 0.08)
      const created = Math.round(base * 0.02)
      setResult({ total: base, updated, created })
      setStatus('done')
    }, 1200)
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && status !== 'loading') onCancel() }}>
      <div className="modal">
        <div className="modal-hd">
          <h3>นำเข้าข้อมูลจาก BEMIS</h3>
          <button className="modal-close" aria-label="ปิด" onClick={onCancel} disabled={status === 'loading'}><IconX size={16} /></button>
        </div>
        <div className="modal-bd">
          {status !== 'done' ? (
            <>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                เชื่อมโยงและดึงข้อมูลพื้นฐานนักเรียนจากระบบ BEMIS ของสำนักการศึกษา เพื่อลดการคีย์ข้อมูลซ้ำ
              </p>

              <label className="f-label">โรงเรียน</label>
              <select className="f-input" style={{ marginBottom: 16 }} value={schoolId} onChange={(e) => setSchoolId(e.target.value)} disabled={status === 'loading'}>
                <option value="">ทุกโรงเรียนในสังกัด</option>
                {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>

              <div className="card" style={{ marginBottom: 4 }}>
                <div className="card-hd"><h3>ข้อมูลที่จะนำเข้า</h3></div>
                <div className="card-bd" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {FIELDS.map((f) => (
                    <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                      <IconCheck size={14} style={{ color: 'var(--brand-700)' }} />{f}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
              <div className="success-modal-icon" style={{ margin: '0 auto 16px' }}><IconCheck size={28} /></div>
              <h3 style={{ marginBottom: 6 }}>นำเข้าข้อมูลสำเร็จ</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                ตรวจสอบข้อมูลนักเรียน {result.total.toLocaleString('th-TH')} คนจาก BEMIS
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--brand-700)' }}>{result.created.toLocaleString('th-TH')}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>เพิ่มนักเรียนใหม่</div>
                </div>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--brand-700)' }}>{result.updated.toLocaleString('th-TH')}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>อัปเดตข้อมูลเดิม</div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="modal-ft">
          {status !== 'done' ? (
            <>
              <button className="btn btn-neutral btn-sm" onClick={onCancel} disabled={status === 'loading'}>ยกเลิก</button>
              <button className="btn btn-primary btn-sm" onClick={handleImport} disabled={status === 'loading'}>
                {status === 'loading' ? 'กำลังเชื่อมต่อ...' : 'เชื่อมต่อและดึงข้อมูล'}
              </button>
            </>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={() => onDone(result)}>เสร็จสิ้น</button>
          )}
        </div>
      </div>
    </div>
  )
}
