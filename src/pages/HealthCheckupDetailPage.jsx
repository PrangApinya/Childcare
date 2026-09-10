import { useEffect, useMemo, useRef, useState } from 'react'
import {
  IconArrowLeft, IconSearch, IconChevronDown, IconPlus, IconUpload, IconGridView, IconListView,
  IconClipboardCheck,
} from '../components/icons.jsx'
import Pagination from '../components/Pagination.jsx'
import SuccessModal from '../components/SuccessModal.jsx'
import StudentFormPage from './StudentFormPage.jsx'
import CheckupFindingsModal from '../components/health/CheckupFindingsModal.jsx'
import DentalFindingsModal from '../components/health/DentalFindingsModal.jsx'
import MentalFindingsModal from '../components/health/MentalFindingsModal.jsx'
import { generateSchoolRoster, DEVELOPMENT_RESULTS, MENTAL_4_DISORDERS } from '../data/schools.js'
import {
  assessNutrition, estimateAgeYears, CHECKUP_KIND_BY_ACTIVITY, VISION_RESULTS, LICE_RESULTS, HEARING_RESULTS,
} from '../data/healthAssessment.js'

const NUTRITION_BADGE = {
  ผอม: 'badge-red', ค่อนข้างผอม: 'badge-orange', สมส่วน: 'badge-green', ท้วม: 'badge-orange',
  เริ่มอ้วน: 'badge-red', อ้วน: 'badge-red',
}
const MENTAL_BADGE = { ปกติ: 'badge-green', กลุ่มเสี่ยง: 'badge-orange' }
const REFERRAL_OPTIONS = ['คลินิกกระตุ้นพัฒนาการ', 'งานสุขภาพจิต']
const DISORDER_LABEL = Object.fromEntries(MENTAL_4_DISORDERS.map((d) => [d.key, d.label]))

const KIND_LABELS = { checkup: 'ตรวจสุขภาพทั่วไป', dental: 'ตรวจทันตกรรม', development: 'การตรวจพัฒนาการ', mental: 'สุขภาพจิต' }

const PAGE_SIZE = 20
const SORTS = ['เรียงตามเลขที่', 'ชื่อ ก-ฮ', 'เลขประจำตัว']
const STATUS_FILTERS = ['เรียนอยู่', 'ลาออก']

const THAI_MONTHS_ABBR = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
function todayThaiLabel() {
  const d = new Date()
  return `${d.getDate()} ${THAI_MONTHS_ABBR[d.getMonth()]} ${d.getFullYear() + 543}`
}
function nowTimeLabel() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')} น.`
}

function draftKeyFor(school, kind) {
  return `mih-checkup-draft-${school.id}-${kind}`
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

export default function HealthCheckupDetailPage({ school, onBack, showToast, onSubCrumbChange }) {
  const kind = CHECKUP_KIND_BY_ACTIVITY[school.checkupActivity] ?? 'checkup'
  const isCheckup = kind === 'checkup'
  const isDental = kind === 'dental'
  const isDevelopment = kind === 'development'
  const isMental = kind === 'mental'
  const draftKey = draftKeyFor(school, kind)
  const draft = useRef(loadDraft(draftKey))

  // เมื่อโรงเรียนนี้ถูกบันทึกกิจกรรม "ตรวจสุขภาพ" ไว้ในหน้าบันทึกกิจกรรม ให้แสดงเฉพาะนักเรียนใน
  // ชั้นเรียน/ห้องที่ระบุไว้ (ซิงค์กับหน้าบันทึกกิจกรรม) — ถ้ายังไม่มีการบันทึกไว้ ให้แสดงทั้งโรงเรียน
  const [roster, setRoster] = useState(() => {
    const full = generateSchoolRoster(school)
    return school.checkupRoomNames?.length
      ? full.filter((s) => school.checkupRoomNames.includes(s.sectionName))
      : full
  })
  const summary = useMemo(() => {
    const total = roster.length
    const female = roster.filter((s) => s.gender === 'หญิง').length
    const checked = roster.filter((s) => s.checked).length
    return { total, female, male: total - female, checked, notChecked: total - checked }
  }, [roster])

  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState('ทั้งหมด')
  const [sectionFilter, setSectionFilter] = useState('ทั้งหมด')
  const [sortBy, setSortBy] = useState(SORTS[0])
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด')
  const [viewMode, setViewMode] = useState('list')
  const [page, setPage] = useState(1)
  const [entries, setEntries] = useState(draft.current?.entries ?? {})
  const [lastSavedAt, setLastSavedAt] = useState(draft.current?.lastSavedAt ?? null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [subScreen, setSubScreen] = useState(null)
  const [findingsFor, setFindingsFor] = useState(null)
  const [, forceTick] = useState(0)

  const gradeOptions = useMemo(() => [...new Set(roster.map((s) => s.gradeName))], [roster])
  const sectionOptions = useMemo(() => [...new Set(roster.map((s) => s.sectionName))], [roster])

  const noFilters = search === '' && gradeFilter === 'ทั้งหมด' && sectionFilter === 'ทั้งหมด'

  const filtered = useMemo(() => {
    let list = roster.filter((s) => (
      (gradeFilter === 'ทั้งหมด' || s.gradeName === gradeFilter)
      && (sectionFilter === 'ทั้งหมด' || s.sectionName === sectionFilter)
      && (statusFilter === 'ทั้งหมด' || s.enrollStatus.label === statusFilter)
      && (search.trim() === '' || `${s.fullName} ${s.citizenId}`.toLowerCase().includes(search.trim().toLowerCase()))
    ))
    list = [...list]
    if (sortBy === 'ชื่อ ก-ฮ') list.sort((a, b) => a.fullName.localeCompare(b.fullName, 'th'))
    else if (sortBy === 'เลขประจำตัว') list.sort((a, b) => a.citizenId.localeCompare(b.citizenId))
    return list
  }, [roster, gradeFilter, sectionFilter, statusFilter, search, sortBy])

  useEffect(() => { setPage(1) }, [search, gradeFilter, sectionFilter, statusFilter, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageStudents = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    const snapshot = { entries, lastSavedAt: Date.now() }
    localStorage.setItem(draftKey, JSON.stringify(snapshot))
    setLastSavedAt(snapshot.lastSavedAt)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries])

  useEffect(() => {
    const id = setInterval(() => forceTick((t) => t + 1), 15000)
    return () => clearInterval(id)
  }, [])

  function resetFilters() {
    setSearch('')
    setGradeFilter('ทั้งหมด')
    setSectionFilter('ทั้งหมด')
  }

  function setEntry(id, field, value) {
    setEntries((cur) => ({ ...cur, [id]: { ...cur[id], [field]: value } }))
  }

  function setEntryBulk(id, patch) {
    setEntries((cur) => ({ ...cur, [id]: { ...cur[id], ...patch } }))
  }

  function findingsOf(s) {
    return entries[s.id] ?? (s.checked ? s.findings : null) ?? {}
  }

  function handleViewMode(mode) {
    if (mode === 'card') { showToast('ฟีเจอร์นี้ยังไม่พร้อมใช้งาน'); return }
    setViewMode(mode)
  }

  function handleExport() {
    let header = ['เลขที่', 'ชั้นเรียน', 'ห้องเรียน', 'เลขที่บัตรประชาชน', 'ชื่อ-สกุล']
    if (isCheckup) header = [...header, 'น้ำหนัก', 'ส่วนสูง', 'ภาวะโภชนาการ', 'การตรวจสายตา', 'การตรวจเหา', 'การตรวจการได้ยิน']
    else if (isDental) {
      header = [...header,
        'ฟันแท้ผุ (D)', 'ฟันแท้ถูกถอน (M)', 'ฟันแท้ที่อุดแล้ว (F)', 'ฟันน้ำนมผุ', 'เหงือกอักเสบ', 'หินน้ำลาย',
        'ให้ทันตสุขศึกษา', 'ตรวจแนะนำ', 'ฝึกแปรงฟันถูกวิธี', 'เคลือบฟลูออไรด์', 'เคลือบหลุมร่องฟัน', 'อุดฟัน', 'ถอนฟัน', 'ขูดหินปูน']
    } else if (isDevelopment) header = [...header, 'ผลการประเมิน', 'ส่งต่อ']
    else if (isMental) header = [...header, '9S Plus', 'SDQ', 'ข้อสังเกต 4 โรคหลัก', 'ภาวะซึมเศร้า', 'ระดับการดูแล', 'ติดตามผลซ้ำ']

    const body = filtered.map((s) => {
      const f = findingsOf(s)
      let row = [s.seatNo, s.gradeName, s.sectionName, s.citizenId, s.fullName]
      if (isCheckup) {
        const w = entries[s.id]?.weight ?? s.weight ?? ''
        const h = entries[s.id]?.height ?? s.height ?? ''
        const n = w && h ? assessNutrition({ weightKg: Number(w), heightCm: Number(h), ageYears: estimateAgeYears(s.gradeName) }) : null
        row = [...row, w, h, n?.weightForHeight ?? '', f.vision ?? '', f.lice ?? '', f.hearing ?? '']
      } else if (isDental) {
        row = [...row,
          f.decayedTeeth ?? '', f.missingTeeth ?? '', f.filledTeeth ?? '', f.decayedBabyTeeth ?? '',
          f.gingivitis ? 'ใช่' : '', f.calculus ? 'ใช่' : '',
          f.dentalEducation ? 'ใช่' : '', f.checkupAdvice ? 'ใช่' : '', f.brushingTrained ? 'ใช่' : '',
          f.fluorideCoating ? 'ใช่' : '', f.pitFissureSealant ? 'ใช่' : '', f.filling ? 'ใช่' : '',
          f.extraction ? 'ใช่' : '', f.scaling ? 'ใช่' : '']
      } else if (isDevelopment) {
        row = [...row, f.result ?? '', f.referral ?? '']
      } else if (isMental) {
        const disorderList = Object.entries(f.disorders || {}).filter(([, v]) => v).map(([k]) => DISORDER_LABEL[k]).join('; ')
        row = [...row, f.screen9SPlus ?? '', f.screenSDQ ?? '', disorderList, f.depressionResult ?? '', f.careLevel ?? '', f.followUp ? 'ใช่' : '']
      }
      return row.join(',')
    }).join('\n')

    const blob = new Blob([`﻿${header.join(',')}\n${body}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${school.name}-${KIND_LABELS[kind]}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showToast('นำออกเอกสารเรียบร้อยแล้ว')
  }

  function isRowDone(v) {
    if (isCheckup) return v?.weight && v?.height
    if (isDevelopment) return Boolean(v?.result)
    if (isMental) return Boolean(v?.screen9SPlus || v?.screenSDQ)
    return Boolean(v && Object.keys(v).length > 0)
  }

  function handleSave() {
    const doneIds = new Set(
      Object.entries(entries).filter(([, v]) => isRowDone(v)).map(([id]) => id)
    )
    if (doneIds.size === 0) {
      showToast(isCheckup ? 'กรุณากรอกน้ำหนักและส่วนสูงอย่างน้อย 1 รายการ' : 'กรุณากรอกผลตรวจอย่างน้อย 1 รายการ')
      return
    }
    setRoster((list) => list.map((s) => (doneIds.has(s.id) ? {
      ...s,
      checked: true,
      ...(isCheckup ? { weight: Number(entries[s.id].weight), height: Number(entries[s.id].height) } : {}),
      findings: entries[s.id],
    } : s)))
    setEntries((cur) => {
      const next = { ...cur }
      doneIds.forEach((id) => delete next[id])
      return next
    })
    localStorage.removeItem(draftKey)
    setShowSuccess(true)
  }

  function openCreateStudent() {
    setSubScreen('create-student')
    onSubCrumbChange?.('เพิ่มนักเรียน')
  }
  function closeSubScreen() {
    setSubScreen(null)
    onSubCrumbChange?.(null)
  }
  function handleCreateStudent({ fullName, citizenId }) {
    showToast(`เพิ่ม ${fullName || 'นักเรียน'} เรียบร้อยแล้ว`)
  }

  if (subScreen === 'create-student') {
    return (
      <StudentFormPage
        mode="create"
        grade={{ code: `hc-${school.id}`, name: '' }}
        onCancel={closeSubScreen}
        onSubmit={handleCreateStudent}
        onDone={closeSubScreen}
        showToast={showToast}
      />
    )
  }

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <div className="stu-topbar" style={{ maxHeight: 'none', opacity: 1, paddingBottom: 8 }}>
        <button className="btn btn-outline btn-sm" onClick={onBack}><IconArrowLeft size={16} />กลับ</button>
        <h1>{school.name}</h1>
        <span className="badge badge-green" style={{ marginLeft: 8 }}><span className="badge-dot" />{KIND_LABELS[kind]}</span>
      </div>
      {school.checkupRoomNames?.length > 0 && (
        <div style={{ padding: '0 4px 12px', fontSize: 13, color: 'var(--text-tertiary)' }}>
          แสดงเฉพาะห้องที่บันทึกไว้ในหน้าบันทึกกิจกรรม: {school.checkupRoomNames.join(', ')}
        </div>
      )}

      <div className="checkup-summary-row">
        <div className="checkup-summary-card">
          <div className="checkup-summary-icon" style={{ background: '#DBEAFE', color: '#1D4ED8' }}><IconClipboardCheck size={18} /></div>
          <div><div className="checkup-summary-n">{summary.total.toLocaleString('th-TH')}</div><div className="checkup-summary-l">จำนวนทั้งหมด</div></div>
        </div>
        <div className="checkup-summary-card">
          <div className="checkup-summary-icon" style={{ background: '#FCE7F3', color: '#BE185D' }}><IconClipboardCheck size={18} /></div>
          <div><div className="checkup-summary-n">{summary.female.toLocaleString('th-TH')}</div><div className="checkup-summary-l">จำนวนนักเรียนหญิง</div></div>
        </div>
        <div className="checkup-summary-card">
          <div className="checkup-summary-icon" style={{ background: '#EDE9FE', color: '#5B21B6' }}><IconClipboardCheck size={18} /></div>
          <div><div className="checkup-summary-n">{summary.male.toLocaleString('th-TH')}</div><div className="checkup-summary-l">จำนวนนักเรียนชาย</div></div>
        </div>
        <div className="checkup-summary-card">
          <div className="checkup-summary-icon" style={{ background: '#CCFBF1', color: '#0F766E' }}><IconClipboardCheck size={18} /></div>
          <div><div className="checkup-summary-n">{summary.checked.toLocaleString('th-TH')}</div><div className="checkup-summary-l">ตรวจแล้ว</div></div>
        </div>
        <div className="checkup-summary-card">
          <div className="checkup-summary-icon" style={{ background: '#FEF3C7', color: '#92400E' }}><IconClipboardCheck size={18} /></div>
          <div><div className="checkup-summary-n">{summary.notChecked.toLocaleString('th-TH')}</div><div className="checkup-summary-l">ยังไม่ตรวจ</div></div>
        </div>
      </div>

      <div className="toolbar-card" style={{ marginTop: 20 }}>
        <div className="search-input-wrap" style={{ maxWidth: 890, margin: '0 auto 20px' }}>
          <IconSearch size={20} />
          <input
            className="search-input"
            placeholder="ค้นหาชื่อ-สกุล / เลขประจำตัว"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-row">
          <button className={`chip${noFilters ? ' active' : ''}`} onClick={resetFilters}>ทั้งหมด</button>

          <SelectChip label="ชั้นเรียน" value={gradeFilter} onChange={setGradeFilter} options={['ทั้งหมด', ...gradeOptions]} />
          <SelectChip label="ห้องเรียน" value={sectionFilter} onChange={setSectionFilter} options={['ทั้งหมด', ...sectionOptions]} />
          <SelectChip label="การจัดเรียง" value={sortBy} onChange={setSortBy} options={SORTS} />
          <SelectChip label="สถานะ" value={statusFilter} onChange={setStatusFilter} options={['ทั้งหมด', ...STATUS_FILTERS]} />

          <div className="filter-spacer" />

          <button className="btn btn-primary btn-sm" onClick={openCreateStudent}>
            <IconPlus size={16} />เพิ่มนักเรียน
          </button>
          <button className="btn btn-outline btn-sm" onClick={handleExport}>
            <IconUpload size={16} />นำออกเอกสาร
          </button>
          <div className="view-toggle">
            <span className="view-toggle-label">มุมมอง</span>
            <button className={viewMode === 'card' ? 'active' : ''} onClick={() => handleViewMode('card')} title="มุมมองการ์ด"><IconGridView size={16} /></button>
            <button className={viewMode === 'list' ? 'active' : ''} onClick={() => handleViewMode('list')} title="มุมมองรายการ"><IconListView size={16} /></button>
          </div>
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            ไม่พบนักเรียนที่ตรงกับตัวกรอง
          </div>
        ) : (
          <>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>เลขที่</th>
                    <th>ชั้นเรียน</th>
                    <th>ห้องเรียน</th>
                    <th>เลขที่บัตรประชาชน</th>
                    <th>ชื่อ-สกุล</th>
                    {isCheckup && (<>
                      <th>น้ำหนัก (ก.ก.)</th>
                      <th>ส่วนสูง (ซ.ม.)</th>
                      <th>ภาวะโภชนาการ</th>
                      <th>การตรวจสายตา</th>
                      <th>การตรวจเหา</th>
                      <th>การตรวจการได้ยิน</th>
                      <th>รายละเอียดเพิ่มเติม</th>
                    </>)}
                    {isDental && (<>
                      <th>ให้ทันตสุขศึกษา</th>
                      <th>ตรวจแนะนำ</th>
                      <th>ฝึกแปรงฟันถูกวิธี</th>
                      <th>เคลือบฟลูออไรด์</th>
                      <th>เคลือบหลุมร่องฟัน</th>
                      <th>อุดฟัน</th>
                      <th>ถอนฟัน</th>
                      <th>ขูดหินปูน</th>
                      <th>ฟันแท้ผุ D (ซี่)</th>
                      <th>ฟันแท้ถูกถอน M (ซี่)</th>
                      <th>ฟันแท้ที่อุดแล้ว F (ซี่)</th>
                      <th>ฟันน้ำนมผุ (ซี่)</th>
                      <th>เหงือกอักเสบ</th>
                      <th>หินน้ำลาย</th>
                      <th>รายละเอียดเพิ่มเติม</th>
                    </>)}
                    {isDevelopment && (<>
                      <th>ผลการประเมิน</th>
                      <th>ส่งต่อ</th>
                    </>)}
                    {isMental && (<>
                      <th>9S Plus</th>
                      <th>SDQ</th>
                      <th>บันทึกผลตรวจ</th>
                    </>)}
                  </tr>
                </thead>
                <tbody>
                  {pageStudents.map((s) => {
                    const f = findingsOf(s)
                    const weightVal = entries[s.id]?.weight ?? (s.checked ? s.weight : '')
                    const heightVal = entries[s.id]?.height ?? (s.checked ? s.height : '')
                    const nutrition = weightVal && heightVal
                      ? assessNutrition({ weightKg: Number(weightVal), heightCm: Number(heightVal), ageYears: estimateAgeYears(s.gradeName) })
                      : null
                    return (
                      <tr key={s.id}>
                        <td className="tabular">{s.seatNo}</td>
                        <td>{s.gradeName}</td>
                        <td>{s.sectionName}</td>
                        <td className="tabular">{s.citizenId}</td>
                        <td style={{ fontWeight: 600 }}>{s.fullName}</td>

                        {isCheckup && (<>
                          <td>
                            <input
                              className="f-input" type="number" min="0" placeholder="กรอกน้ำหนัก"
                              style={{ width: 130, height: 36 }}
                              value={weightVal}
                              onChange={(e) => setEntry(s.id, 'weight', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              className="f-input" type="number" min="0" placeholder="กรอกส่วนสูง"
                              style={{ width: 130, height: 36 }}
                              value={heightVal}
                              onChange={(e) => setEntry(s.id, 'height', e.target.value)}
                            />
                          </td>
                          <td>
                            {nutrition
                              ? <span className={`badge ${NUTRITION_BADGE[nutrition.weightForHeight] || 'badge-grey'}`}><span className="badge-dot" />{nutrition.weightForHeight}</span>
                              : <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>รอข้อมูล</span>}
                          </td>
                          <td>
                            <select
                              className="f-input" style={{ width: 130, height: 36 }}
                              value={entries[s.id]?.vision ?? (s.checked ? s.findings?.vision : '') ?? ''}
                              onChange={(e) => setEntry(s.id, 'vision', e.target.value)}
                            >
                              <option value="">เลือกผลตรวจ</option>
                              {VISION_RESULTS.map((v) => <option key={v} value={v}>{v}</option>)}
                            </select>
                          </td>
                          <td>
                            <select
                              className="f-input" style={{ width: 130, height: 36 }}
                              value={entries[s.id]?.lice ?? (s.checked ? s.findings?.lice : '') ?? ''}
                              onChange={(e) => setEntry(s.id, 'lice', e.target.value)}
                            >
                              <option value="">เลือกผลตรวจ</option>
                              {LICE_RESULTS.map((v) => <option key={v} value={v}>{v}</option>)}
                            </select>
                          </td>
                          <td>
                            <select
                              className="f-input" style={{ width: 130, height: 36 }}
                              value={entries[s.id]?.hearing ?? (s.checked ? s.findings?.hearing : '') ?? ''}
                              onChange={(e) => setEntry(s.id, 'hearing', e.target.value)}
                            >
                              <option value="">เลือกผลตรวจ</option>
                              {HEARING_RESULTS.map((v) => <option key={v} value={v}>{v}</option>)}
                            </select>
                          </td>
                          <td>
                            <button className="btn btn-outline btn-sm" onClick={() => setFindingsFor(s.id)}>
                              <IconClipboardCheck size={14} />บันทึกผลตรวจ
                            </button>
                          </td>
                        </>)}

                        {isDental && (<>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={entries[s.id]?.dentalEducation ?? (s.checked ? f.dentalEducation : false) ?? false}
                              onChange={(e) => setEntry(s.id, 'dentalEducation', e.target.checked)}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={entries[s.id]?.checkupAdvice ?? (s.checked ? f.checkupAdvice : false) ?? false}
                              onChange={(e) => setEntry(s.id, 'checkupAdvice', e.target.checked)}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={entries[s.id]?.brushingTrained ?? (s.checked ? f.brushingTrained : false) ?? false}
                              onChange={(e) => setEntry(s.id, 'brushingTrained', e.target.checked)}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={entries[s.id]?.fluorideCoating ?? (s.checked ? f.fluorideCoating : false) ?? false}
                              onChange={(e) => setEntry(s.id, 'fluorideCoating', e.target.checked)}
                            />
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                              <input
                                type="checkbox"
                                checked={entries[s.id]?.pitFissureSealant ?? (s.checked ? f.pitFissureSealant : false) ?? false}
                                onChange={(e) => setEntry(s.id, 'pitFissureSealant', e.target.checked)}
                              />
                              {(entries[s.id]?.pitFissureSealant ?? (s.checked ? f.pitFissureSealant : false)) && (
                                <input
                                  className="f-input" type="number" min="0" placeholder="จำนวนซี่"
                                  style={{ width: 90, height: 30 }}
                                  value={entries[s.id]?.pitFissureSealantTeeth ?? (s.checked ? f.pitFissureSealantTeeth : '') ?? ''}
                                  onChange={(e) => setEntry(s.id, 'pitFissureSealantTeeth', e.target.value)}
                                />
                              )}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={entries[s.id]?.filling ?? (s.checked ? f.filling : false) ?? false}
                              onChange={(e) => setEntry(s.id, 'filling', e.target.checked)}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={entries[s.id]?.extraction ?? (s.checked ? f.extraction : false) ?? false}
                              onChange={(e) => setEntry(s.id, 'extraction', e.target.checked)}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={entries[s.id]?.scaling ?? (s.checked ? f.scaling : false) ?? false}
                              onChange={(e) => setEntry(s.id, 'scaling', e.target.checked)}
                            />
                          </td>
                          <td>
                            <input
                              className="f-input" type="number" min="0"
                              style={{ width: 80, height: 36 }}
                              value={entries[s.id]?.decayedTeeth ?? (s.checked ? f.decayedTeeth : '') ?? ''}
                              onChange={(e) => setEntry(s.id, 'decayedTeeth', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              className="f-input" type="number" min="0"
                              style={{ width: 80, height: 36 }}
                              value={entries[s.id]?.missingTeeth ?? (s.checked ? f.missingTeeth : '') ?? ''}
                              onChange={(e) => setEntry(s.id, 'missingTeeth', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              className="f-input" type="number" min="0"
                              style={{ width: 80, height: 36 }}
                              value={entries[s.id]?.filledTeeth ?? (s.checked ? f.filledTeeth : '') ?? ''}
                              onChange={(e) => setEntry(s.id, 'filledTeeth', e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              className="f-input" type="number" min="0"
                              style={{ width: 80, height: 36 }}
                              value={entries[s.id]?.decayedBabyTeeth ?? (s.checked ? f.decayedBabyTeeth : '') ?? ''}
                              onChange={(e) => setEntry(s.id, 'decayedBabyTeeth', e.target.value)}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={entries[s.id]?.gingivitis ?? (s.checked ? f.gingivitis : false) ?? false}
                              onChange={(e) => setEntry(s.id, 'gingivitis', e.target.checked)}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={entries[s.id]?.calculus ?? (s.checked ? f.calculus : false) ?? false}
                              onChange={(e) => setEntry(s.id, 'calculus', e.target.checked)}
                            />
                          </td>
                          <td>
                            <button className="btn btn-outline btn-sm" onClick={() => setFindingsFor(s.id)}>
                              <IconClipboardCheck size={14} />บันทึกผลตรวจ
                            </button>
                          </td>
                        </>)}

                        {isDevelopment && (<>
                          <td>
                            <select
                              className="f-input" style={{ width: 140, height: 36 }}
                              value={entries[s.id]?.result ?? (s.checked ? s.findings?.result : '') ?? ''}
                              onChange={(e) => setEntry(s.id, 'result', e.target.value)}
                            >
                              <option value="">เลือกผลประเมิน</option>
                              {DEVELOPMENT_RESULTS.map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </td>
                          <td>
                            <select
                              className="f-input" style={{ width: 180, height: 36 }}
                              value={entries[s.id]?.referral ?? (s.checked ? s.findings?.referral : '') ?? ''}
                              onChange={(e) => setEntry(s.id, 'referral', e.target.value)}
                              disabled={f.result !== 'ล่าช้า'}
                            >
                              <option value="">เลือกหน่วยงานที่ส่งต่อ</option>
                              {REFERRAL_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </td>
                        </>)}

                        {isMental && (<>
                          <td>
                            {f.screen9SPlus
                              ? <span className={`badge ${MENTAL_BADGE[f.screen9SPlus] || 'badge-grey'}`}><span className="badge-dot" />{f.screen9SPlus}</span>
                              : <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>-</span>}
                          </td>
                          <td>
                            {f.screenSDQ
                              ? <span className={`badge ${MENTAL_BADGE[f.screenSDQ] || 'badge-grey'}`}><span className="badge-dot" />{f.screenSDQ}</span>
                              : <span style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>-</span>}
                          </td>
                          <td>
                            <button className="btn btn-outline btn-sm" onClick={() => setFindingsFor(s.id)}>
                              <IconClipboardCheck size={14} />บันทึกผลตรวจ
                            </button>
                          </td>
                        </>)}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '0 20px' }}>
              <Pagination page={page} totalPages={totalPages} pageSize={PAGE_SIZE} totalItems={filtered.length} onChange={setPage} />
            </div>
          </>
        )}
      </div>

      <div className="form-footer-bar">
        <span className="draft-note"><span className="draft-dot" />ร่างแบบฟอร์ม (บันทึกล่าสุด: {timeAgoTh(lastSavedAt)})</span>
        <div className="actions">
          <button className="btn btn-neutral btn-sm" onClick={onBack}>ยกเลิก</button>
          <button className="btn btn-primary btn-sm" onClick={handleSave}>บันทึก</button>
        </div>
      </div>

      {showSuccess && (
        <SuccessModal
          title="บันทึกข้อมูลสำเร็จ"
          subtitle={`บันทึก วันที่ ${todayThaiLabel()}  ${nowTimeLabel()}`}
          onClose={() => setShowSuccess(false)}
        />
      )}

      {findingsFor && isCheckup && (() => {
        const s = roster.find((r) => r.id === findingsFor)
        if (!s) return null
        return (
          <CheckupFindingsModal
            student={s}
            weightKg={entries[s.id]?.weight}
            heightCm={entries[s.id]?.height}
            ageYears={estimateAgeYears(s.gradeName)}
            initial={entries[s.id] ?? s.findings}
            onCancel={() => setFindingsFor(null)}
            onSave={(findings) => { setEntryBulk(s.id, findings); setFindingsFor(null) }}
          />
        )
      })()}

      {findingsFor && isDental && (() => {
        const s = roster.find((r) => r.id === findingsFor)
        if (!s) return null
        return (
          <DentalFindingsModal
            student={s}
            initial={entries[s.id] ?? s.findings}
            onCancel={() => setFindingsFor(null)}
            onSave={(findings) => { setEntryBulk(s.id, findings); setFindingsFor(null) }}
          />
        )
      })()}

      {findingsFor && isMental && (() => {
        const s = roster.find((r) => r.id === findingsFor)
        if (!s) return null
        return (
          <MentalFindingsModal
            student={s}
            ageYears={estimateAgeYears(s.gradeName)}
            initial={entries[s.id] ?? s.findings}
            onCancel={() => setFindingsFor(null)}
            onSave={(findings) => { setEntryBulk(s.id, findings); setFindingsFor(null) }}
          />
        )
      })()}
    </section>
  )
}

function SelectChip({ label, value, onChange, options }) {
  return (
    <div className="chip-select">
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        {options.map((o) => <option key={o} value={o}>{o === 'ทั้งหมด' ? `${label}: ทั้งหมด` : o}</option>)}
      </select>
      <IconChevronDown size={13} />
    </div>
  )
}
