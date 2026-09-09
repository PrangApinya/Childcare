import { useState } from 'react'
import { IconX, IconCalendar } from '../icons.jsx'
import { TEACH_ACTIVITIES, TEACH_CLASSES } from '../../data/daycare.js'

export default function TeachLogModal({ initial, onCancel, onSave }) {
  const [dateIso, setDateIso] = useState(initial?.dateIso ?? '')
  const [activity, setActivity] = useState(initial?.activity ?? '')
  const [className, setClassName] = useState(initial?.className ?? '')
  const [teacher, setTeacher] = useState(initial?.teacher ?? '')
  const [note, setNote] = useState(initial?.note ?? '')

  function handleSave() {
    if (!dateIso || !activity || !className || !teacher.trim()) return
    onSave({ dateIso, activity, className, teacher: teacher.trim(), note: note.trim() })
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="modal">
        <div className="modal-hd">
          <h3>บันทึกประวัติการสอน</h3>
          <button className="modal-close" aria-label="ปิด" onClick={onCancel}><IconX size={16} /></button>
        </div>
        <div className="modal-bd">
          <label className="f-label">วันที่สอน</label>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <IconCalendar size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
            <input type="date" className="f-input" style={{ paddingLeft: 38 }} value={dateIso} onChange={(e) => setDateIso(e.target.value)} />
          </div>

          <label className="f-label">กิจกรรมที่สอน</label>
          <select className="f-input" style={{ marginBottom: 16 }} value={activity} onChange={(e) => setActivity(e.target.value)}>
            <option value="">เลือกกิจกรรมที่สอน</option>
            {TEACH_ACTIVITIES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>

          <label className="f-label">ชั้นเรียน</label>
          <select className="f-input" style={{ marginBottom: 16 }} value={className} onChange={(e) => setClassName(e.target.value)}>
            <option value="">เลือกชั้นเรียน</option>
            {TEACH_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <label className="f-label">ผู้สอน</label>
          <input className="f-input" style={{ marginBottom: 16 }} placeholder="กรอกผู้สอน" value={teacher} onChange={(e) => setTeacher(e.target.value)} />

          <label className="f-label">หมายเหตุ</label>
          <textarea className="f-input" style={{ height: 90, padding: '10px 12px', resize: 'vertical' }} placeholder="ระบุเพิ่มเติม (ถ้ามี)" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="modal-ft">
          <button className="btn btn-neutral btn-sm" onClick={onCancel}>ยกเลิก</button>
          <button className="btn btn-primary btn-sm" onClick={handleSave}>บันทึก</button>
        </div>
      </div>
    </div>
  )
}
