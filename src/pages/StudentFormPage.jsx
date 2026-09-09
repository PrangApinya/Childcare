import { useEffect, useRef, useState } from 'react'
import { IconArrowLeft, IconUser, IconImage, IconPin } from '../components/icons.jsx'
import SuccessModal from '../components/SuccessModal.jsx'
import { districts, subdistricts, STUDENT_BLOOD_TYPES, STUDENT_CHRONIC_OPTIONS } from '../data/schools.js'

const PREFIXES = ['เด็กชาย', 'เด็กหญิง', 'นาย', 'นาง', 'นางสาว']
const PREFIX_ABBR = { 'เด็กชาย': 'ด.ช.', 'เด็กหญิง': 'ด.ญ.', 'นาย': 'นาย', 'นาง': 'นาง', 'นางสาว': 'นางสาว' }
const PROVINCES = ['กรุงเทพมหานคร', 'นนทบุรี', 'ปทุมธานี', 'สมุทรปราการ']
const ENROLL_OPTIONS = [
  { key: 'active', label: 'เรียนอยู่' },
  { key: 'suspended', label: 'พักการเรียน' },
  { key: 'left', label: 'พ้นสภาพ' },
]

const THAI_MONTHS_ABBR = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
function todayThaiLabel() {
  const d = new Date()
  return `${d.getDate()} ${THAI_MONTHS_ABBR[d.getMonth()]} ${d.getFullYear() + 543}`
}

function ageFromDob(dob) {
  if (!dob) return ''
  const birth = new Date(`${dob}T00:00:00`)
  if (Number.isNaN(birth.getTime())) return ''
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  if (now.getDate() < birth.getDate()) months -= 1
  if (months < 0) { years -= 1; months += 12 }
  if (years < 0) return ''
  return `${years} ปี ${months} เดือน`
}

function enrollKeyFromLabel(label) {
  return ENROLL_OPTIONS.find((o) => o.label === label)?.key ?? 'active'
}

function prefixFromAbbr(abbr) {
  return Object.keys(PREFIX_ABBR).find((k) => PREFIX_ABBR[k] === abbr) ?? ''
}

const emptyAddress = { province: '', district: '', subdistrict: '', postalCode: '' }

function draftKeyFor(grade, student) {
  return student ? `mih-edit-student-draft-${grade.code}-${student.seatNo}` : `mih-create-student-draft-${grade.code}`
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

export default function StudentFormPage({ mode, grade, student, onCancel, onSubmit, onDone, showToast }) {
  const isEdit = mode === 'edit'
  const key = draftKeyFor(grade, isEdit ? student : null)
  const draft = useRef(loadDraft(key))

  const [showSuccess, setShowSuccess] = useState(false)
  const [photo, setPhoto] = useState(draft.current?.photo ?? null)
  const [prefix, setPrefix] = useState(draft.current?.prefix ?? (isEdit ? prefixFromAbbr(student.prefix) : ''))
  const [firstName, setFirstName] = useState(draft.current?.firstName ?? (isEdit ? student.firstName : ''))
  const [lastName, setLastName] = useState(draft.current?.lastName ?? (isEdit ? student.lastName : ''))
  const [citizenId, setCitizenId] = useState(draft.current?.citizenId ?? (isEdit ? student.citizenId : ''))
  const [dob, setDob] = useState(draft.current?.dob ?? (isEdit ? student.dob : ''))
  const [bloodType, setBloodType] = useState(draft.current?.bloodType ?? (isEdit ? student.bloodType : ''))
  const [chronic, setChronic] = useState(draft.current?.chronic ?? (isEdit ? student.chronic : ''))
  const [allergy, setAllergy] = useState(draft.current?.allergy ?? (isEdit ? student.allergy : ''))
  const [guardianName, setGuardianName] = useState(draft.current?.guardianName ?? (isEdit ? student.guardianName : ''))
  const [guardianPhone, setGuardianPhone] = useState(draft.current?.guardianPhone ?? (isEdit ? student.guardianPhone : ''))
  const [registeredAddr, setRegisteredAddr] = useState(draft.current?.registeredAddr ?? (isEdit ? student.address : emptyAddress))
  const [sameAsRegistered, setSameAsRegistered] = useState(draft.current?.sameAsRegistered ?? isEdit)
  const [currentAddr, setCurrentAddr] = useState(draft.current?.currentAddr ?? (isEdit ? student.address : emptyAddress))
  const [enrollStatus, setEnrollStatus] = useState(draft.current?.enrollStatus ?? (isEdit ? enrollKeyFromLabel(student.enrollStatus.label) : 'active'))
  const [nameError, setNameError] = useState('')
  const [lastSavedAt, setLastSavedAt] = useState(draft.current?.lastSavedAt ?? null)
  const [, forceTick] = useState(0)
  const photoInputRef = useRef(null)

  const formState = {
    photo, prefix, firstName, lastName, citizenId, dob, bloodType, chronic, allergy,
    guardianName, guardianPhone, registeredAddr, sameAsRegistered, currentAddr, enrollStatus,
  }

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify({ ...formState, lastSavedAt: Date.now() }))
    setLastSavedAt(Date.now())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo, prefix, firstName, lastName, citizenId, dob, bloodType, chronic, allergy, guardianName, guardianPhone, registeredAddr, sameAsRegistered, currentAddr, enrollStatus])

  useEffect(() => {
    const id = setInterval(() => forceTick((t) => t + 1), 15000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (sameAsRegistered) setCurrentAddr(registeredAddr)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sameAsRegistered, registeredAddr])

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result)
    reader.readAsDataURL(file)
  }

  function handleSave() {
    if (!firstName.trim() || !lastName.trim()) {
      setNameError('กรุณากรอกชื่อและนามสกุล')
      showToast('กรุณาตรวจสอบข้อมูลที่จำเป็นอีกครั้ง')
      return
    }
    const enrollLabel = ENROLL_OPTIONS.find((o) => o.key === enrollStatus)?.label ?? 'เรียนอยู่'
    onSubmit({
      fullName: `${prefix} ${firstName.trim()} ${lastName.trim()}`.trim(),
      citizenId,
      dob,
      bloodType,
      chronic,
      allergy,
      guardianName,
      guardianPhone,
      registeredAddr,
      currentAddr,
      enrollStatusLabel: enrollLabel,
    })
    localStorage.removeItem(key)
    setShowSuccess(true)
  }

  function handleCancel() {
    localStorage.removeItem(key)
    onCancel()
  }

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <div className="stu-topbar" style={{ maxHeight: 'none', opacity: 1, paddingBottom: 8 }}>
        <button className="btn btn-outline btn-sm" onClick={handleCancel}><IconArrowLeft size={16} />กลับ</button>
        <h1>{isEdit ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียน'}</h1>
      </div>

      <div className="form-section">
        <div className="form-section-hd"><IconUser size={16} /><h3>ประวัตินักเรียน</h3></div>
        <div className="form-section-bd">
          <div className="photo-upload">
            <div className="box">{photo ? <img src={photo} alt="รูปนักเรียน" /> : <IconUser size={34} strokeWidth={1.5} />}</div>
            <button className="btn btn-outline btn-sm" onClick={() => photoInputRef.current?.click()}>
              <IconImage size={16} />อัปโหลดรูปภาพ
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
          </div>

          <div className="field-grid-3">
            <Field label="คำนำหน้า">
              <select className="f-input" value={prefix} onChange={(e) => setPrefix(e.target.value)}>
                <option value="">เลือกคำนำหน้า</option>
                {PREFIXES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="ชื่อ" required error={nameError}>
              <input className={`f-input${nameError ? ' error' : ''}`} placeholder="กรอกชื่อ" value={firstName} onChange={(e) => { setFirstName(e.target.value); setNameError('') }} />
            </Field>
            <Field label="นามสกุล">
              <input className="f-input" placeholder="กรอกนามสกุล" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </Field>
          </div>

          {!isEdit && (
            <div className="field-grid-3">
              <Field label="เลขประจำตัวประชาชน">
                <input className="f-input tabular" placeholder="กรอกเลขประจำตัวประชาชน" value={citizenId} onChange={(e) => setCitizenId(e.target.value)} />
              </Field>
              <Field label="วัน / เดือน /ปีเกิด">
                <input className="f-input" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </Field>
              <Field label="อายุ">
                <input className="f-input" value={ageFromDob(dob)} disabled placeholder="" />
              </Field>
            </div>
          )}
          {!isEdit && (
            <div className="field-grid-3">
              <Field label="หมู่โลหิต">
                <select className="f-input" value={bloodType} onChange={(e) => setBloodType(e.target.value)}>
                  <option value="">เลือกหมู่โลหิต</option>
                  {STUDENT_BLOOD_TYPES.map((b) => <option key={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="โรคประจำตัว">
                <select className="f-input" value={chronic} onChange={(e) => setChronic(e.target.value)}>
                  <option value="">-- เลือก --</option>
                  {STUDENT_CHRONIC_OPTIONS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="ประวัติแพ้ยา/อาหาร">
                <input className="f-input" placeholder="กรอกประวัติแพ้ยา/อาหาร" value={allergy} onChange={(e) => setAllergy(e.target.value)} />
              </Field>
            </div>
          )}

          {isEdit && (
            <div className="field-grid-3">
              <Field label="วัน / เดือน /ปีเกิด">
                <input className="f-input" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
              </Field>
              <Field label="อายุ">
                <input className="f-input" value={ageFromDob(dob)} disabled placeholder="" />
              </Field>
              <Field label="หมู่โลหิต">
                <select className="f-input" value={bloodType} onChange={(e) => setBloodType(e.target.value)}>
                  <option value="">เลือกหมู่โลหิต</option>
                  {STUDENT_BLOOD_TYPES.map((b) => <option key={b}>{b}</option>)}
                </select>
              </Field>
            </div>
          )}
          {isEdit && (
            <div className="field-grid-2">
              <Field label="โรคประจำตัว">
                <select className="f-input" value={chronic} onChange={(e) => setChronic(e.target.value)}>
                  <option value="">-- เลือก --</option>
                  {STUDENT_CHRONIC_OPTIONS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="ประวัติแพ้ยา/อาหาร">
                <input className="f-input" placeholder="กรอกประวัติแพ้ยา/อาหาร" value={allergy} onChange={(e) => setAllergy(e.target.value)} />
              </Field>
            </div>
          )}

          <div className="field-grid-2">
            <Field label="ชื่อผู้ปกครอง">
              <input className="f-input" placeholder="กรอกชื่อผู้ปกครอง" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />
            </Field>
            <Field label="เบอร์โทรผู้ปกครอง">
              <input className="f-input tabular" placeholder="กรอกเบอร์โทร" value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} />
            </Field>
          </div>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-hd"><IconPin size={16} /><h3>{isEdit ? 'ข้อมูลที่อยู่' : 'ที่อยู่ตามทะเบียนบ้าน'}</h3></div>
        <div className="form-section-bd">
          <AddressFields value={registeredAddr} onChange={setRegisteredAddr} />
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-hd"><IconPin size={16} /><h3>ข้อมูลที่อยู่ปัจจุบัน</h3></div>
        <div className="form-section-bd">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-primary)', marginBottom: 16, cursor: 'pointer' }}>
            <input type="checkbox" checked={sameAsRegistered} onChange={(e) => setSameAsRegistered(e.target.checked)} />
            ที่อยู่ตามทะเบียนบ้าน
          </label>
          <AddressFields value={currentAddr} onChange={setCurrentAddr} />
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-hd"><IconPin size={16} /><h3>สถานะการเรียน</h3></div>
        <div className="form-section-bd" style={{ flexDirection: 'row', gap: 24 }}>
          {ENROLL_OPTIONS.map((o) => (
            <label key={o.key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-primary)', cursor: 'pointer' }}>
              <input type="checkbox" checked={enrollStatus === o.key} onChange={() => setEnrollStatus(o.key)} />
              {o.label}
            </label>
          ))}
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

function AddressFields({ value, onChange }) {
  function set(field, v) {
    onChange({ ...value, [field]: v })
  }
  return (
    <>
      <div className="field-grid-2">
        <Field label="จังหวัด" required>
          <select className="f-input" value={value.province} onChange={(e) => set('province', e.target.value)}>
            <option value="">เลือกจังหวัด</option>
            {PROVINCES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="เขต/อำเภอ" required>
          <select className="f-input" value={value.district} onChange={(e) => set('district', e.target.value)} disabled={!value.province}>
            <option value="">เลือกเขต/อำเภอ</option>
            {districts.map((d) => <option key={d}>{d}</option>)}
          </select>
        </Field>
      </div>
      <div className="field-grid-2">
        <Field label="แขวง/ตำบล" required>
          <select className="f-input" value={value.subdistrict} onChange={(e) => set('subdistrict', e.target.value)} disabled={!value.district}>
            <option value="">เลือกแขวง/ตำบล</option>
            {subdistricts.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="รหัสไปรษณีย์">
          <input className="f-input tabular" placeholder="รหัสไปรษณีย์" value={value.postalCode} onChange={(e) => set('postalCode', e.target.value)} />
        </Field>
      </div>
    </>
  )
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="f-label">{label}{required && <span className="req">*</span>}</label>
      {children}
      {error && <div className="f-help error">{error}</div>}
    </div>
  )
}
