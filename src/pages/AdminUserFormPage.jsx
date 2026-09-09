import { useEffect, useRef, useState } from 'react'
import { IconArrowLeft } from '../components/icons.jsx'
import SuccessModal from '../components/SuccessModal.jsx'
import AccessMatrix from '../components/AccessMatrix.jsx'
import { ADMIN_CENTER_OPTIONS, ADMIN_ROLE_OPTIONS, ADMIN_STATUS_OPTIONS, defaultAccessForRole } from '../data/admins.js'

const THAI_MONTHS_ABBR = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
function todayThaiLabel() {
  const d = new Date()
  return `${d.getDate()} ${THAI_MONTHS_ABBR[d.getMonth()]} ${d.getFullYear() + 543}`
}

function draftKeyFor(admin) {
  return admin ? `mih-edit-admin-draft-${admin.id}` : 'mih-create-admin-draft'
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

export default function AdminUserFormPage({ mode, admin, onCancel, onSubmit, onDone, showToast }) {
  const isEdit = mode === 'edit'
  const isView = mode === 'view'
  const draftKey = draftKeyFor(isEdit ? admin : null)
  const draft = useRef(isView ? null : loadDraft(draftKey))

  const [showSuccess, setShowSuccess] = useState(false)
  const [fullName, setFullName] = useState(draft.current?.fullName ?? admin?.fullName ?? '')
  const [email, setEmail] = useState(draft.current?.email ?? admin?.email ?? '')
  const [phone, setPhone] = useState(draft.current?.phone ?? admin?.phone ?? '')
  const [center, setCenter] = useState(draft.current?.center ?? admin?.center ?? '')
  const [role, setRole] = useState(draft.current?.role ?? admin?.role ?? '')
  const [status, setStatus] = useState(draft.current?.status ?? (admin?.active === false ? ADMIN_STATUS_OPTIONS[1] : ADMIN_STATUS_OPTIONS[0]))
  const [access, setAccess] = useState(draft.current?.access ?? admin?.access ?? null)
  const [errors, setErrors] = useState({})
  const [lastSavedAt, setLastSavedAt] = useState(draft.current?.lastSavedAt ?? null)
  const [, forceTick] = useState(0)

  useEffect(() => {
    if (isView) return
    const snapshot = { fullName, email, phone, center, role, status, access, lastSavedAt: Date.now() }
    localStorage.setItem(draftKey, JSON.stringify(snapshot))
    setLastSavedAt(snapshot.lastSavedAt)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullName, email, phone, center, role, status, access])

  useEffect(() => {
    if (isView) return
    const id = setInterval(() => forceTick((t) => t + 1), 15000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleRoleChange(v) {
    setRole(v)
    if (v) setAccess(defaultAccessForRole(v))
  }

  function handleSave() {
    const nextErrors = {}
    if (!fullName.trim()) nextErrors.fullName = true
    if (!email.trim()) nextErrors.email = true
    if (!phone.trim()) nextErrors.phone = true
    if (!center) nextErrors.center = true
    if (!role) nextErrors.role = true
    if (!status) nextErrors.status = true
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      showToast('กรุณาตรวจสอบข้อมูลที่จำเป็นอีกครั้ง')
      return
    }
    onSubmit({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      center,
      role,
      active: status === ADMIN_STATUS_OPTIONS[0],
      access: access || defaultAccessForRole(role),
    })
    localStorage.removeItem(draftKey)
    setShowSuccess(true)
  }

  function handleCancel() {
    if (!isView) localStorage.removeItem(draftKey)
    onCancel()
  }

  const title = isView ? 'ดูรายละเอียดผู้ดูแลระบบ' : isEdit ? 'แก้ไขผู้ดูแลระบบ' : 'เพิ่มผู้ดูแลระบบ'

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <div className="stu-topbar" style={{ maxHeight: 'none', opacity: 1, paddingBottom: 8 }}>
        <button className="btn btn-outline btn-sm" onClick={handleCancel}><IconArrowLeft size={16} />กลับ</button>
        <h1>{title}</h1>
      </div>

      <div className="form-section">
        <div className="form-section-hd"><h3>{title}</h3></div>
        <div className="form-section-bd">
          <div className="field-grid-2">
            <div>
              <label className="f-label">ชื่อ-นามสกุล<span className="req">*</span></label>
              <input className={`f-input${errors.fullName ? ' error' : ''}`} placeholder="กรอกชื่อ-นามสกุล" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={isView} />
            </div>
            <div>
              <label className="f-label">อีเมล<span className="req">*</span></label>
              <input className={`f-input${errors.email ? ' error' : ''}`} placeholder="กรอกอีเมล" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isView} />
            </div>
            <div>
              <label className="f-label">เบอร์โทร<span className="req">*</span></label>
              <input className={`f-input${errors.phone ? ' error' : ''}`} placeholder="กรอกเบอร์โทร" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isView} />
            </div>
            <div>
              <label className="f-label">ศูนย์บริการ<span className="req">*</span></label>
              <select className={`f-input${errors.center ? ' error' : ''}`} value={center} onChange={(e) => setCenter(e.target.value)} disabled={isView}>
                <option value="">เลือกศูนย์บริการ</option>
                {ADMIN_CENTER_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="f-label">ตำแหน่ง<span className="req">*</span></label>
              <select className={`f-input${errors.role ? ' error' : ''}`} value={role} onChange={(e) => handleRoleChange(e.target.value)} disabled={isView}>
                <option value="">เลือกตำแหน่ง</option>
                {ADMIN_ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="f-label">สถานะการใช้งาน<span className="req">*</span></label>
              <select className={`f-input${errors.status ? ' error' : ''}`} value={status} onChange={(e) => setStatus(e.target.value)} disabled={isView}>
                <option value="">เลือกสถานะการใช้งาน</option>
                {ADMIN_STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {role && access && (
            <div>
              <label className="f-label">การเข้าถึง</label>
              <AccessMatrix access={access} onChange={setAccess} readOnly={isView} />
            </div>
          )}
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
