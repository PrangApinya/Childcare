import { useEffect, useMemo, useRef, useState } from 'react'
import {
  IconArrowLeft, IconSearch, IconChevronDown, IconPlus, IconUpload, IconGridView, IconListView,
  IconClipboardCheck,
} from '../components/icons.jsx'
import Pagination from '../components/Pagination.jsx'
import SuccessModal from '../components/SuccessModal.jsx'
import StudentFormPage from './StudentFormPage.jsx'
import CheckupFindingsModal from '../components/health/CheckupFindingsModal.jsx'
import { generateDaycareCheckupRoster, generateDaycareCheckupSummary } from '../data/daycare.js'
import { assessNutrition } from '../data/healthAssessment.js'

const DAYCARE_AGE_YEARS = 3

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

function draftKeyFor(room) {
  return `mih-daycare-checkup-draft-${room.id}`
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

export default function DaycareCheckupDetailPage({ room, onBack, showToast, onSubCrumbChange }) {
  const draftKey = draftKeyFor(room)
  const draft = useRef(loadDraft(draftKey))

  const [roster, setRoster] = useState(() => generateDaycareCheckupRoster(room))
  const summary = useMemo(() => generateDaycareCheckupSummary(room), [room])

  const [search, setSearch] = useState('')
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

  const noFilters = search === ''

  const filtered = useMemo(() => {
    let list = roster.filter((s) => (
      (statusFilter === 'ทั้งหมด' || s.enrollStatus.label === statusFilter)
      && (search.trim() === '' || `${s.fullName} ${s.citizenId}`.toLowerCase().includes(search.trim().toLowerCase()))
    ))
    list = [...list]
    if (sortBy === 'ชื่อ ก-ฮ') list.sort((a, b) => a.fullName.localeCompare(b.fullName, 'th'))
    else if (sortBy === 'เลขประจำตัว') list.sort((a, b) => a.citizenId.localeCompare(b.citizenId))
    return list
  }, [roster, statusFilter, search, sortBy])

  useEffect(() => { setPage(1) }, [search, statusFilter, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageChildren = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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
  }

  function setEntry(id, field, value) {
    setEntries((cur) => ({ ...cur, [id]: { ...cur[id], [field]: value } }))
  }

  function setEntryBulk(id, patch) {
    setEntries((cur) => ({ ...cur, [id]: { ...cur[id], ...patch } }))
  }

  function handleViewMode(mode) {
    if (mode === 'card') { showToast('ฟีเจอร์นี้ยังไม่พร้อมใช้งาน'); return }
    setViewMode(mode)
  }

  function handleExport() {
    const header = 'เลขที่,เลขที่บัตรประชาชน,ชื่อ-สกุล,น้ำหนัก,ส่วนสูง,ภาวะโภชนาการ,สายตา,เหา,การได้ยิน\n'
    const body = filtered.map((s) => {
      const w = entries[s.id]?.weight ?? s.weight ?? ''
      const h = entries[s.id]?.height ?? s.height ?? ''
      const f = entries[s.id] ?? s.findings
      const n = w && h ? assessNutrition({ weightKg: Number(w), heightCm: Number(h), ageYears: DAYCARE_AGE_YEARS }) : null
      return `${s.seatNo},${s.citizenId},${s.fullName},${w},${h},${n?.weightForHeight ?? ''},${f?.vision ?? ''},${f?.lice ?? ''},${f?.hearing ?? ''}`
    }).join('\n')
    const blob = new Blob([`﻿${header}${body}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${room.name}-ตรวจสุขภาพนักเรียน.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showToast('นำออกเอกสารเรียบร้อยแล้ว')
  }

  function handleSave() {
    const doneIds = new Set(
      Object.entries(entries)
        .filter(([, v]) => v?.weight && v?.height)
        .map(([id]) => id)
    )
    if (doneIds.size === 0) {
      showToast('กรุณากรอกน้ำหนักและส่วนสูงอย่างน้อย 1 รายการ')
      return
    }
    setRoster((list) => list.map((s) => (doneIds.has(s.id) ? {
      ...s,
      checked: true,
      weight: Number(entries[s.id].weight),
      height: Number(entries[s.id].height),
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

  function openCreateChild() {
    setSubScreen('create-child')
    onSubCrumbChange?.('เพิ่มนักเรียน')
  }
  function closeSubScreen() {
    setSubScreen(null)
    onSubCrumbChange?.(null)
  }
  function handleCreateChild({ fullName }) {
    showToast(`เพิ่ม ${fullName || 'นักเรียน'} เรียบร้อยแล้ว`)
  }

  if (subScreen === 'create-child') {
    return (
      <StudentFormPage
        mode="create"
        grade={{ code: `dc-checkup-${room.id}`, name: room.name }}
        onCancel={closeSubScreen}
        onSubmit={handleCreateChild}
        onDone={closeSubScreen}
        showToast={showToast}
      />
    )
  }

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <div className="stu-topbar" style={{ maxHeight: 'none', opacity: 1, paddingBottom: 8 }}>
        <button className="btn btn-outline btn-sm" onClick={onBack}><IconArrowLeft size={16} />กลับ</button>
        <h1>{room.name}</h1>
      </div>

      <div className="checkup-summary-row">
        <div className="checkup-summary-card">
          <div className="checkup-summary-icon" style={{ background: '#DBEAFE', color: '#1D4ED8' }}><IconClipboardCheck size={18} /></div>
          <div><div className="checkup-summary-n">{summary.total.toLocaleString('th-TH')}</div><div className="checkup-summary-l">จำนวนทั้งหมด</div></div>
        </div>
        <div className="checkup-summary-card">
          <div className="checkup-summary-icon" style={{ background: '#FCE7F3', color: '#BE185D' }}><IconClipboardCheck size={18} /></div>
          <div><div className="checkup-summary-n">{summary.female.toLocaleString('th-TH')}</div><div className="checkup-summary-l">จำนวนเด็กหญิง</div></div>
        </div>
        <div className="checkup-summary-card">
          <div className="checkup-summary-icon" style={{ background: '#EDE9FE', color: '#5B21B6' }}><IconClipboardCheck size={18} /></div>
          <div><div className="checkup-summary-n">{summary.male.toLocaleString('th-TH')}</div><div className="checkup-summary-l">จำนวนเด็กชาย</div></div>
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

          <SelectChip label="การจัดเรียง" value={sortBy} onChange={setSortBy} options={SORTS} />
          <SelectChip label="สถานะ" value={statusFilter} onChange={setStatusFilter} options={['ทั้งหมด', ...STATUS_FILTERS]} />

          <div className="filter-spacer" />

          <button className="btn btn-primary btn-sm" onClick={openCreateChild}>
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
                    <th>เลขที่บัตรประชาชน</th>
                    <th>ชื่อ-สกุล</th>
                    <th>น้ำหนัก (ก.ก.)</th>
                    <th>ส่วนสูง (ซ.ม.)</th>
                    <th>รายละเอียดเพิ่มเติม</th>
                  </tr>
                </thead>
                <tbody>
                  {pageChildren.map((s) => (
                    <tr key={s.id}>
                      <td className="tabular">{s.seatNo}</td>
                      <td className="tabular">{s.citizenId}</td>
                      <td style={{ fontWeight: 600 }}>{s.fullName}</td>
                      <td>
                        <input
                          className="f-input" type="number" min="0" placeholder="กรอกน้ำหนัก"
                          style={{ width: 130, height: 36 }}
                          value={entries[s.id]?.weight ?? (s.checked ? s.weight : '')}
                          onChange={(e) => setEntry(s.id, 'weight', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          className="f-input" type="number" min="0" placeholder="กรอกส่วนสูง"
                          style={{ width: 130, height: 36 }}
                          value={entries[s.id]?.height ?? (s.checked ? s.height : '')}
                          onChange={(e) => setEntry(s.id, 'height', e.target.value)}
                        />
                      </td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => setFindingsFor(s.id)}>
                          <IconClipboardCheck size={14} />บันทึกผลตรวจ
                        </button>
                      </td>
                    </tr>
                  ))}
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

      {findingsFor && (() => {
        const s = roster.find((r) => r.id === findingsFor)
        if (!s) return null
        return (
          <CheckupFindingsModal
            student={s}
            weightKg={entries[s.id]?.weight}
            heightCm={entries[s.id]?.height}
            ageYears={DAYCARE_AGE_YEARS}
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
