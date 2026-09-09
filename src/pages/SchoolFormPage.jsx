import { useEffect, useRef, useState } from 'react'
import {
  IconArrowLeft, IconPin, IconImage, IconSearch, IconUser,
} from '../components/icons.jsx'
import SchoolLocationMap from '../components/schools/SchoolLocationMap.jsx'
import TagInput from '../components/schools/TagInput.jsx'
import RoomRosterBuilder from '../components/schools/RoomRosterBuilder.jsx'
import TermDateRanges, { blankTerms } from '../components/schools/TermDateRanges.jsx'
import SuccessModal from '../components/SuccessModal.jsx'
import { DEFAULT_GRADE_TAGS } from '../data/schools.js'

const BANGKOK = { lat: 13.7563, lng: 100.5018 }
const TERM_OPTIONS = ['1 ภาคเรียน', '2 ภาคเรียน', '3 ภาคเรียน']
const THAI_MONTHS_ABBR = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

function todayThaiLabel() {
  const d = new Date()
  return `${d.getDate()} ${THAI_MONTHS_ABBR[d.getMonth()]} ${d.getFullYear() + 543}`
}

function emptyFormFor(school) {
  return {
    nameTh: school?.name ?? '',
    nameEn: school?.nameEn ?? '',
    code: school?.code ?? '',
    affiliation: school?.affiliation ?? '',
    province: school?.province ?? 'กรุงเทพมหานคร',
    address: school?.address ?? '',
    district: school?.district ?? '',
    subdistrict: school?.subdistrict ?? '',
    postalCode: school?.postalCode ?? '',
    phone: school?.phone ?? '',
    fax: school?.fax ?? '',
    website: school?.website ?? '',
    email: school?.email ?? '',
    healthCenter: school?.healthCenterAssigned ?? '',
    coordinationCenter: school?.coordinationCenter ?? '',
    healthCenterBranch: school?.healthCenterBranch ?? '',
    officeDistrict: school?.officeDistrict ?? '',
    healthTeacher: school?.coordinator ?? '',
    termsPerYear: school?.termsPerYear ?? '',
  }
}

function draftKeyFor(mode, school) {
  return mode === 'edit' ? `mih-edit-school-draft-${school.id}` : 'mih-create-school-draft'
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

export default function SchoolFormPage({ mode, school, onCancel, onSubmit, onDone, showToast }) {
  const isEdit = mode === 'edit'
  const draftKey = draftKeyFor(mode, school)
  const draft = useRef(loadDraft(draftKey))

  const [showSuccess, setShowSuccess] = useState(false)
  const [form, setForm] = useState(draft.current?.form ?? emptyFormFor(school))
  const [lat, setLat] = useState(draft.current?.lat ?? school?.lat ?? BANGKOK.lat)
  const [lng, setLng] = useState(draft.current?.lng ?? school?.lng ?? BANGKOK.lng)
  const [terms, setTerms] = useState(draft.current?.terms ?? school?.terms ?? [])
  const [gradeLevels, setGradeLevels] = useState(draft.current?.gradeLevels ?? school?.gradeTags ?? (isEdit ? [] : DEFAULT_GRADE_TAGS))
  const [rooms, setRooms] = useState(draft.current?.rooms ?? school?.sampleRooms ?? [])
  const [rosterFiles, setRosterFiles] = useState(draft.current?.rosterFiles ?? school?.sampleRosterFiles ?? [])
  const [photo, setPhoto] = useState(draft.current?.photo ?? null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [nameError, setNameError] = useState('')
  const [lastSavedAt, setLastSavedAt] = useState(draft.current?.lastSavedAt ?? null)
  const [, forceTick] = useState(0)
  const photoInputRef = useRef(null)

  // Live autosave to localStorage — the footer's "last saved" note reflects a real timestamp.
  useEffect(() => {
    const snapshot = { form, lat, lng, terms, gradeLevels, rooms, rosterFiles, photo, lastSavedAt: Date.now() }
    localStorage.setItem(draftKey, JSON.stringify(snapshot))
    setLastSavedAt(snapshot.lastSavedAt)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, lat, lng, terms, gradeLevels, rooms, rosterFiles, photo])

  useEffect(() => {
    const id = setInterval(() => forceTick((t) => t + 1), 15000)
    return () => clearInterval(id)
  }, [])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleTermsPerYearChange(value) {
    set('termsPerYear', value)
    const n = parseInt(value, 10) || 0
    setTerms((prev) => {
      const next = blankTerms(n)
      return next.map((t, i) => prev[i] ?? t)
    })
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result)
    reader.readAsDataURL(file)
  }

  async function handleSearch() {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const q = encodeURIComponent(`${searchQuery} กรุงเทพมหานคร`)
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`)
      const data = await res.json()
      if (data && data[0]) {
        setLat(parseFloat(data[0].lat))
        setLng(parseFloat(data[0].lon))
        showToast('พบตำแหน่งบนแผนที่แล้ว')
      } else {
        showToast('ไม่พบตำแหน่งที่ค้นหา ลองพิกัดบนแผนที่แทน')
      }
    } catch {
      showToast('ค้นหาตำแหน่งไม่สำเร็จ ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต')
    }
    setSearching(false)
  }

  function handleSave() {
    if (!form.nameTh.trim()) {
      setNameError('กรุณากรอกชื่อโรงเรียน')
      showToast('กรุณาตรวจสอบข้อมูลที่จำเป็นอีกครั้ง')
      return
    }
    onSubmit({
      name: form.nameTh.trim(),
      nameEn: form.nameEn,
      district: form.district || (isEdit ? school.district : 'ดินแดง'),
      subdistrict: form.subdistrict || (isEdit ? school.subdistrict : 'ดินแดง'),
      postalCode: form.postalCode,
      address: form.address || '—',
      lat,
      lng,
      phone: form.phone,
      fax: form.fax,
      website: form.website,
      email: form.email,
      healthCenterAssigned: form.healthCenter,
      coordinationCenter: form.coordinationCenter,
      healthCenterBranch: form.healthCenterBranch,
      officeDistrict: form.officeDistrict,
      coordinator: form.healthTeacher || '—',
      coordinatorPhone: form.phone || '—',
      termsPerYear: form.termsPerYear,
      terms,
      gradeTags: gradeLevels,
      gradeLevels: gradeLevels.join(', ') || (isEdit ? school.gradeLevels : 'อนุบาล-ประถมศึกษา'),
    })
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
        <h1>{isEdit ? 'แก้ไขโรงเรียน' : 'สร้างโรงเรียน'}</h1>
      </div>

      <div className="form-section">
        <div className="form-section-hd"><IconPin size={16} /><h3>ข้อมูลโรงเรียน</h3></div>
        <div className="form-section-bd">

          {!isEdit && (
            <div className="photo-upload">
              <div className="box">{photo ? <img src={photo} alt="รูปโรงเรียน" /> : <IconUser size={34} strokeWidth={1.5} />}</div>
              <button className="btn btn-outline btn-sm" onClick={() => photoInputRef.current?.click()}>
                <IconImage size={16} />อัปโหลดรูปภาพ
              </button>
              <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            </div>
          )}

          <div className="field-grid-2">
            <Field label="ชื่อโรงเรียน (ภาษาไทย)" required error={nameError}>
              <input className={`f-input${nameError ? ' error' : ''}`} placeholder="กรอกชื่อโรงเรียน (ภาษาไทย)" value={form.nameTh} onChange={(e) => { set('nameTh', e.target.value); setNameError('') }} />
            </Field>
            <Field label="ชื่อโรงเรียน (ภาษาอังกฤษ)">
              <input className="f-input" placeholder="กรอกชื่อโรงเรียน (ภาษาอังกฤษ)" value={form.nameEn} onChange={(e) => set('nameEn', e.target.value)} />
            </Field>
          </div>

          {!isEdit && (
            <div className="field-grid-3">
              <Field label="รหัสโรงเรียน"><input className="f-input" placeholder="กรอกรหัสโรงเรียน" value={form.code} onChange={(e) => set('code', e.target.value)} /></Field>
              <Field label="สังกัด"><input className="f-input" value={form.affiliation} onChange={(e) => set('affiliation', e.target.value)} /></Field>
              <Field label="จังหวัด"><input className="f-input" value={form.province} onChange={(e) => set('province', e.target.value)} /></Field>
            </div>
          )}

          <div className="school-search-row">
            <input className="f-input" placeholder="ค้นหาโรงเรียน" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearch() } }} />
            <button className="btn btn-primary btn-sm" onClick={handleSearch} disabled={searching}>
              <IconSearch size={16} />{searching ? 'กำลังค้นหา...' : 'ค้นหา'}
            </button>
          </div>

          <SchoolLocationMap lat={lat} lng={lng} onPick={(la, ln) => { setLat(la); setLng(ln) }} />

          <div className="field-grid-2">
            <Field label="ละติจุด"><input className="f-input tabular" value={lat.toFixed(6)} onChange={(e) => setLat(parseFloat(e.target.value) || 0)} /></Field>
            <Field label="ลองติจุด"><input className="f-input tabular" value={lng.toFixed(6)} onChange={(e) => setLng(parseFloat(e.target.value) || 0)} /></Field>
          </div>

          <Field label="ที่อยู่">
            <textarea className="f-input" style={{ height: 72, padding: '8px 12px', resize: 'vertical' }} value={form.address} onChange={(e) => set('address', e.target.value)} />
          </Field>

          <div className="field-grid-2">
            <Field label="จังหวัด"><input className="f-input" value={form.province} onChange={(e) => set('province', e.target.value)} /></Field>
            <Field label="เขต / อำเภอ"><input className="f-input" value={form.district} onChange={(e) => set('district', e.target.value)} /></Field>
          </div>
          <div className="field-grid-2">
            <Field label="แขวง / ตำบล"><input className="f-input" value={form.subdistrict} onChange={(e) => set('subdistrict', e.target.value)} /></Field>
            <Field label="รหัสไปรษณีย์"><input className="f-input tabular" value={form.postalCode} onChange={(e) => set('postalCode', e.target.value)} /></Field>
          </div>
          <div className="field-grid-2">
            <Field label="โทรศัพท์"><input className="f-input tabular" placeholder="ระบุ" value={form.phone} onChange={(e) => set('phone', e.target.value)} /></Field>
            <Field label="โทรสาร"><input className="f-input tabular" placeholder="ระบุ" value={form.fax} onChange={(e) => set('fax', e.target.value)} /></Field>
          </div>
          <div className="field-grid-2">
            <Field label="เว็บไซต์"><input className="f-input" placeholder="ระบุ" value={form.website} onChange={(e) => set('website', e.target.value)} /></Field>
            <Field label="E-mail"><input className="f-input" placeholder="ระบุ" value={form.email} onChange={(e) => set('email', e.target.value)} /></Field>
          </div>
          <div className="field-grid-2">
            <Field label="ศูนย์บริการสาธารณสุขที่ดูแล"><input className="f-input" placeholder="ระบุ" value={form.healthCenter} onChange={(e) => set('healthCenter', e.target.value)} /></Field>
            <Field label="ศูนย์ประสานงาน"><input className="f-input" placeholder="ระบุ" value={form.coordinationCenter} onChange={(e) => set('coordinationCenter', e.target.value)} /></Field>
          </div>
          <div className="field-grid-2">
            <Field label="ศูนย์บริการสาธารณสุขสาขา"><input className="f-input" placeholder="ระบุ" value={form.healthCenterBranch} onChange={(e) => set('healthCenterBranch', e.target.value)} /></Field>
            <Field label="สำนักงานเขตที่ดูแล"><input className="f-input" placeholder="ระบุ" value={form.officeDistrict} onChange={(e) => set('officeDistrict', e.target.value)} /></Field>
          </div>
          <Field label="ครูอนามัย">
            <input className="f-input" placeholder="ระบุ" value={form.healthTeacher} onChange={(e) => set('healthTeacher', e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-hd"><IconPin size={16} /><h3>ข้อมูลภาคเรียน</h3></div>
        <div className="form-section-bd">
          <Field label="จำนวนภาคเรียนต่อปี">
            <select className="f-input" style={{ maxWidth: 280 }} value={form.termsPerYear} onChange={(e) => handleTermsPerYearChange(e.target.value)}>
              <option value="">เลือกจำนวนภาคเรียน</option>
              {TERM_OPTIONS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>
          <TermDateRanges terms={terms} onChange={setTerms} />
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-hd"><IconPin size={16} /><h3>เพิ่มชั้นเรียน</h3></div>
        <div className="form-section-bd">
          <TagInput
            tags={gradeLevels}
            placeholder="เพิ่มชั้นเรียน เช่น มัธยมศึกษาปีที่ 1"
            onAdd={(t) => setGradeLevels((list) => [...list, t])}
            onRemove={(t) => {
              setGradeLevels((list) => list.filter((g) => g !== t))
              setRooms((list) => list.filter((r) => r.grade !== t))
            }}
          />
        </div>
      </div>

      <div className="form-section">
        <div className="form-section-hd"><IconPin size={16} /><h3>เพิ่มห้องเรียนและรายชื่อนักเรียน</h3></div>
        <div className="form-section-bd">
          <RoomRosterBuilder
            gradeLevels={gradeLevels}
            rooms={rooms}
            onAddRoom={(r) => setRooms((list) => [...list, r])}
            onRemoveRoom={(r) => setRooms((list) => list.filter((x) => !(x.grade === r.grade && x.name === r.name)))}
            rosterFiles={rosterFiles}
            onAddFiles={(newFiles) => setRosterFiles((list) => [...list, ...newFiles])}
            onRemoveFile={(id) => setRosterFiles((list) => list.filter((f) => f.id !== id))}
          />
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

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="f-label">{label}{required && <span className="req">*</span>}</label>
      {children}
      {error && <div className="f-help error">{error}</div>}
    </div>
  )
}
