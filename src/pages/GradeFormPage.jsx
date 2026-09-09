import { useEffect, useRef, useState } from 'react'
import { IconArrowLeft, IconPin } from '../components/icons.jsx'
import RoomRosterBuilder from '../components/schools/RoomRosterBuilder.jsx'
import SuccessModal from '../components/SuccessModal.jsx'
import { generateSections } from '../data/schools.js'

// Editing an existing grade opens with its current sections already attached —
// mirrors the reference design's pre-filled roster rows.
function sampleRoomsFor(grade) {
  return generateSections(grade).map((s) => ({ grade: grade.name, name: s.name }))
}
function sampleRosterFilesFor(grade) {
  return generateSections(grade).map((s, i) => ({
    id: `seed-${grade.code}-${i}`, grade: grade.name, room: s.name, name: 'Report_name_T1.pdf', sizeLabel: '23.5 MB',
  }))
}

const THAI_MONTHS_ABBR = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
function todayThaiLabel() {
  const d = new Date()
  return `${d.getDate()} ${THAI_MONTHS_ABBR[d.getMonth()]} ${d.getFullYear() + 543}`
}

function draftKeyFor(school, grade) {
  return grade ? `mih-edit-grade-draft-${school.id}-${grade.code}` : `mih-create-grade-draft-${school.id}`
}
function loadDraft(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
function timeAgoTh(ts) {
  if (!ts) return 'ยังไม่ได้บันทึก'
  const diffSec = Math.max(0, Math.round((Date.now() - ts) / 1000))
  if (diffSec < 10) return 'เมื่อสักครู่'
  if (diffSec < 60) return `${diffSec} วินาทีที่แล้ว`
  return `${Math.round(diffSec / 60)} นาทีที่แล้ว`
}

export default function GradeFormPage({ mode, school, grade, onCancel, onSubmit, onDone, showToast }) {
  const isEdit = mode === 'edit'
  const draftKey = draftKeyFor(school, isEdit ? grade : null)
  const draft = useRef(loadDraft(draftKey))

  const gradeNames = [isEdit ? grade.name : 'ชั้นเรียนใหม่']
  const [showSuccess, setShowSuccess] = useState(false)
  const [rooms, setRooms] = useState(draft.current?.rooms ?? (isEdit ? sampleRoomsFor(grade) : []))
  const [rosterFiles, setRosterFiles] = useState(draft.current?.rosterFiles ?? (isEdit ? sampleRosterFilesFor(grade) : []))
  const [roomError, setRoomError] = useState('')
  const [lastSavedAt, setLastSavedAt] = useState(draft.current?.lastSavedAt ?? null)
  const [, forceTick] = useState(0)

  useEffect(() => {
    const snapshot = { rooms, rosterFiles, lastSavedAt: Date.now() }
    localStorage.setItem(draftKey, JSON.stringify(snapshot))
    setLastSavedAt(snapshot.lastSavedAt)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rooms, rosterFiles])

  useEffect(() => {
    const id = setInterval(() => forceTick((t) => t + 1), 15000)
    return () => clearInterval(id)
  }, [])

  function handleSave() {
    if (rooms.length === 0) {
      setRoomError('กรุณาเพิ่มห้องเรียนอย่างน้อย 1 รายการ')
      showToast('กรุณาตรวจสอบข้อมูลที่จำเป็นอีกครั้ง')
      return
    }
    onSubmit({ gradeNames, rooms, rosterFiles })
    localStorage.removeItem(draftKey)
    setShowSuccess(true)
  }

  function handleCancel() {
    localStorage.removeItem(draftKey)
    onCancel()
  }

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <div className="stu-topbar" style={{ maxHeight: 'none', opacity: 1, paddingBottom: 8 }}>
        <button className="btn btn-outline btn-sm" onClick={handleCancel}><IconArrowLeft size={16} />กลับ</button>
        <h1>{isEdit ? 'แก้ไขชั้นเรียน' : 'เพิ่มชั้นเรียน'}</h1>
      </div>

      <div className="form-section">
        <div className="form-section-hd"><IconPin size={16} /><h3>เพิ่มห้องเรียนและรายชื่อนักเรียน</h3></div>
        <div className="form-section-bd">
          <RoomRosterBuilder
            gradeLevels={gradeNames}
            showGradeSelect={false}
            rooms={rooms}
            onAddRoom={(r) => { setRooms((list) => [...list, r]); setRoomError('') }}
            onRemoveRoom={(r) => setRooms((list) => list.filter((x) => !(x.grade === r.grade && x.name === r.name)))}
            rosterFiles={rosterFiles}
            onAddFiles={(newFiles) => setRosterFiles((list) => [...list, ...newFiles])}
            onRemoveFile={(id) => setRosterFiles((list) => list.filter((f) => f.id !== id))}
            accept="image/png,image/jpeg"
            dropHint="ลากและวางรูป หรือคลิกเพื่ออัปโหลด"
            sizeHint="รองรับไฟล์ PNG, JPG ขนาดไม่เกิน 10 MB ต่อไฟล์"
            showTemplate={false}
          />
          {roomError && <div className="f-help error">{roomError}</div>}
        </div>
      </div>

      <div className="form-footer-bar">
        <span className="draft-note"><span className="draft-dot" />ร่างแบบฟอร์ม (บันทึกล่าสุด: {timeAgoTh(lastSavedAt)})</span>
        <div className="actions">
          <button className="btn btn-neutral btn-sm" onClick={handleCancel}>ยกเลิก</button>
          <button className="btn btn-primary btn-sm" onClick={handleSave}>บันทึก</button>
        </div>
      </div>

      {showSuccess && (
        <SuccessModal
          title={isEdit ? 'บันทึกการแก้ไขสำเร็จ' : 'บันทึกข้อมูลสำเร็จ'}
          subtitle={`บันทึก วันที่ ${todayThaiLabel()}`}
          onClose={() => { setShowSuccess(false); onDone() }}
        />
      )}
    </section>
  )
}
