import { useEffect, useRef, useState } from 'react'
import { IconArrowLeft } from '../components/icons.jsx'
import SuccessModal from '../components/SuccessModal.jsx'
import AccessMatrix from '../components/AccessMatrix.jsx'
import { flattenPermissionKeys } from '../data/admins.js'

const THAI_MONTHS_ABBR = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
function todayThaiLabel() {
  const d = new Date()
  return `${d.getDate()} ${THAI_MONTHS_ABBR[d.getMonth()]} ${d.getFullYear() + 543}`
}

function emptyAccess() {
  const access = {}
  flattenPermissionKeys().forEach((key) => { access[key] = { create: false, delete: false, edit: false, view: false } })
  return access
}

function draftKeyFor(item) {
  return item ? `mih-edit-access-draft-${item.id}` : 'mih-create-access-draft'
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

export default function AccessRightsFormPage({ mode, item, onCancel, onSubmit, onDone, showToast }) {
  const isEdit = mode === 'edit'
  const isView = mode === 'view'
  const draftKey = draftKeyFor(isEdit ? item : null)
  const draft = useRef(isView ? null : loadDraft(draftKey))

  const [showSuccess, setShowSuccess] = useState(false)
  const [role, setRole] = useState(draft.current?.role ?? item?.role ?? '')
  const [access, setAccess] = useState(draft.current?.access ?? item?.access ?? emptyAccess())
  const [errors, setErrors] = useState({})
  const [lastSavedAt, setLastSavedAt] = useState(draft.current?.lastSavedAt ?? null)
  const [, forceTick] = useState(0)

  useEffect(() => {
    if (isView) return
    const snapshot = { role, access, lastSavedAt: Date.now() }
    localStorage.setItem(draftKey, JSON.stringify(snapshot))
    setLastSavedAt(snapshot.lastSavedAt)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, access])

  useEffect(() => {
    if (isView) return
    const id = setInterval(() => forceTick((t) => t + 1), 15000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSave() {
    const nextErrors = {}
    if (!role.trim()) nextErrors.role = true
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      showToast('กรุณาตรวจสอบข้อมูลที่จำเป็นอีกครั้ง')
      return
    }
    onSubmit({ role: role.trim(), access })
    localStorage.removeItem(draftKey)
    setShowSuccess(true)
  }

  function handleCancel() {
    if (!isView) localStorage.removeItem(draftKey)
    onCancel()
  }

  const title = isView ? 'ดูข้อมูลสิทธิ์การเข้าถึง' : isEdit ? 'แก้ไขสิทธิ์การเข้าถึง' : 'เพิ่มสิทธิ์การเข้าถึง'
  const topbarTitle = isView ? title : 'สิทธิ์การเข้าถึง'

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <div className="stu-topbar" style={{ maxHeight: 'none', opacity: 1, paddingBottom: 8 }}>
        <button className="btn btn-outline btn-sm" onClick={handleCancel}><IconArrowLeft size={16} />กลับ</button>
        <h1>{topbarTitle}</h1>
      </div>

      <div className="form-section">
        <div className="form-section-hd"><h3>{title}</h3></div>
        <div className="form-section-bd">
          <div className="field-grid-2">
            <div>
              <label className="f-label">ตำแหน่ง<span className="req">*</span></label>
              <input className={`f-input${errors.role ? ' error' : ''}`} placeholder="กรอกตำแหน่ง" value={role} onChange={(e) => setRole(e.target.value)} disabled={isView} />
            </div>
          </div>

          <div>
            <label className="f-label">การเข้าถึง</label>
            <AccessMatrix access={access} onChange={setAccess} readOnly={isView} />
          </div>
        </div>
      </div>

      <div className="form-footer-bar">
        {isView ? <span /> : (
          <span className="draft-note"><span className="draft-dot" />ร่างแบบฟอร์ม (บันทึกล่าสุด: {timeAgoTh(lastSavedAt)})</span>
        )}
        <div className="actions">
          {isView ? (
            <button className="btn btn-primary btn-sm" onClick={handleCancel}>ปิด</button>
          ) : (
            <>
              <button className="btn btn-neutral btn-sm" onClick={handleCancel}>ยกเลิก</button>
              <button className="btn btn-primary btn-sm" onClick={handleSave}>บันทึกข้อมูล</button>
            </>
          )}
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
