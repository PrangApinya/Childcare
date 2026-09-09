import { useMemo, useState } from 'react'
import { IconX } from '../icons.jsx'
import { schools, generateRooms } from '../../data/schools.js'

export default function TeacherAssignmentModal({ initial, onCancel, onSave }) {
  const [schoolId, setSchoolId] = useState(initial?.schoolId ?? '')
  const [roomName, setRoomName] = useState(initial?.roomName ?? '')
  const [teacherName, setTeacherName] = useState(initial?.teacherName ?? '')

  const selectedSchool = schools.find((s) => s.id === schoolId) || null
  const rooms = useMemo(() => (selectedSchool ? generateRooms(selectedSchool) : []), [selectedSchool])

  function handleSchoolChange(id) {
    setSchoolId(id)
    setRoomName('')
  }

  function handleSave() {
    if (!schoolId || !roomName || !teacherName.trim()) return
    onSave({
      schoolId,
      schoolName: selectedSchool.name,
      roomName,
      teacherName: teacherName.trim(),
    })
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="modal">
        <div className="modal-hd">
          <h3>{initial ? 'แก้ไขครูประจำชั้น' : 'เพิ่มครูประจำชั้น'}</h3>
          <button className="modal-close" aria-label="ปิด" onClick={onCancel}><IconX size={16} /></button>
        </div>
        <div className="modal-bd">
          <label className="f-label">โรงเรียน</label>
          <select className="f-input" style={{ marginBottom: 16 }} value={schoolId} onChange={(e) => handleSchoolChange(e.target.value)}>
            <option value="">เลือกโรงเรียน</option>
            {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <label className="f-label">ห้อง / ชั้นที่รับผิดชอบ</label>
          <select className="f-input" style={{ marginBottom: 16 }} value={roomName} onChange={(e) => setRoomName(e.target.value)} disabled={!selectedSchool}>
            <option value="">{selectedSchool ? 'เลือกห้อง / ชั้น' : 'เลือกโรงเรียนก่อน'}</option>
            {rooms.map((r) => <option key={r.code} value={r.name}>{r.name}</option>)}
          </select>

          <label className="f-label">ชื่อครูประจำชั้น</label>
          <input className="f-input" placeholder="กรอกชื่อ-นามสกุลครู" value={teacherName} onChange={(e) => setTeacherName(e.target.value)} />
        </div>
        <div className="modal-ft">
          <button className="btn btn-neutral btn-sm" onClick={onCancel}>ยกเลิก</button>
          <button className="btn btn-primary btn-sm" onClick={handleSave}>บันทึก</button>
        </div>
      </div>
    </div>
  )
}
