import { useState } from 'react'
import { IconX } from '../icons.jsx'
import { TEACH_CLASSES } from '../../data/daycare.js'

export default function TeachActivityModal({ initial, onCancel, onSave }) {
  const isEdit = !!initial
  const [name, setName] = useState(initial?.name ?? '')
  const [className, setClassName] = useState(initial?.className ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [durationMin, setDurationMin] = useState(initial?.durationMin ?? '')
  const [active, setActive] = useState(initial?.active ?? true)

  function handleSave() {
    if (!name.trim() || !className || !durationMin) return
    onSave({ name: name.trim(), className, description: description.trim(), durationMin: Number(durationMin), active })
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="modal">
        <div className="modal-hd">
          <h3>{isEdit ? 'แก้ไขกิจกรรมการสอน' : 'เพิ่มกิจกรรมการสอน'}</h3>
          <button className="modal-close" aria-label="ปิด" onClick={onCancel}><IconX size={16} /></button>
        </div>
        <div className="modal-bd">
          <label className="f-label">ชื่อกิจกรรม</label>
          <input className="f-input" style={{ marginBottom: 16 }} placeholder="กรอกชื่อกิจกรรม" value={name} onChange={(e) => setName(e.target.value)} />

          <label className="f-label">ชั้นเรียนที่ใช้</label>
          <select className="f-input" style={{ marginBottom: 16 }} value={className} onChange={(e) => setClassName(e.target.value)}>
            <option value="">เลือกชั้นเรียนที่ใช้</option>
            {TEACH_CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <label className="f-label">คำอธิบายกิจกรรม</label>
          <textarea
            className="f-input" style={{ height: 90, padding: '10px 12px', resize: 'vertical', marginBottom: 16 }}
            placeholder="วัตถุประสงค์ / รายละเอียดกิจกรรม"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <label className="f-label">ระยะเวลา (นาที)</label>
          <input
            className="f-input" style={{ marginBottom: 16 }} type="number" min="0" placeholder="กรอกระยะเวลา"
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label className="f-label" style={{ margin: 0 }}>สถานะการใช้งาน</label>
            <button
              type="button"
              className={`status-toggle ${active ? 'on' : 'off'}`}
              onClick={() => setActive((v) => !v)}
            >
              <span className="status-toggle-dot" />
              {active ? 'เปิด' : 'ปิด'}
            </button>
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
