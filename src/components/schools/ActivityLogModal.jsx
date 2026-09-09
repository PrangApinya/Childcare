import { useMemo, useState } from 'react'
import { IconX, IconCalendar } from '../icons.jsx'
import MultiSelectField from '../MultiSelectField.jsx'
import { schools, generateAllSections } from '../../data/schools.js'
import { ACTIVITY_EXAMPLES } from '../../data/schoolActivities.js'

export default function ActivityLogModal({ initial, onCancel, onSave }) {
  const [schoolId, setSchoolId] = useState(initial?.schoolId ?? '')
  const [roomNames, setRoomNames] = useState(initial?.roomNames ?? [])
  const [dateIso, setDateIso] = useState(initial?.dateIso ?? '')
  const [activity, setActivity] = useState(initial?.activity ?? '')
  const [note, setNote] = useState(initial?.note ?? '')

  const selectedSchool = schools.find((s) => s.id === schoolId) || null
  const rooms = useMemo(() => (selectedSchool ? generateAllSections(selectedSchool) : []), [selectedSchool])
  const roomOptions = rooms.map((r) => r.name)

  function handleSchoolChange(id) {
    setSchoolId(id)
    setRoomNames([])
  }

  function handleSave() {
    if (!schoolId || roomNames.length === 0 || !dateIso || !activity.trim()) return
    onSave({
      schoolId,
      schoolName: selectedSchool.name,
      roomNames,
      dateIso,
      activity: activity.trim(),
      note: note.trim(),
    })
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="modal">
        <div className="modal-hd">
          <h3>{initial ? 'แก้ไขบันทึกกิจกรรม' : 'บันทึกกิจกรรม'}</h3>
          <button className="modal-close" aria-label="ปิด" onClick={onCancel}><IconX size={16} /></button>
        </div>
        <div className="modal-bd">
          <label className="f-label">โรงเรียน</label>
          <select className="f-input" style={{ marginBottom: 16 }} value={schoolId} onChange={(e) => handleSchoolChange(e.target.value)}>
            <option value="">เลือกโรงเรียน</option>
            {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <label className="f-label">ชั้นเรียน / ห้อง</label>
          <div style={{ marginBottom: 16 }}>
            <MultiSelectField
              options={roomOptions}
              values={roomNames}
              onChange={setRoomNames}
              placeholder={selectedSchool ? 'เลือกชั้นเรียน / ห้อง (เลือกได้หลายรายการ)' : 'เลือกโรงเรียนก่อน'}
              disabled={!selectedSchool}
            />
          </div>

          <label className="f-label">วันที่ตรวจ</label>
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <IconCalendar size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
            <input type="date" className="f-input" style={{ paddingLeft: 38 }} value={dateIso} onChange={(e) => setDateIso(e.target.value)} />
          </div>

          <label className="f-label">กิจกรรม</label>
          <input
            className="f-input"
            style={{ marginBottom: 16 }}
            list="activity-examples"
            placeholder="เช่น ตรวจสุขภาพ"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
          />
          <datalist id="activity-examples">
            {ACTIVITY_EXAMPLES.map((a) => <option key={a} value={a} />)}
          </datalist>

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
