import { useMemo, useState } from 'react'
import { IconSearch, IconChevronDown, IconUpload, IconGridView, IconListView, IconFileText, IconSyringe } from '../components/icons.jsx'
import HealthCheckupTable from '../components/schools/HealthCheckupTable.jsx'
import TabBar from '../components/TabBar.jsx'
import Pagination from '../components/Pagination.jsx'
import { districts, subdistricts } from '../data/schools.js'

const PAGE_SIZE = 20
const YEARS = ['2569', '2568', '2567']
const DATE_FILTERS = ['วันนี้', '7 วันที่ผ่านมา', '30 วันที่ผ่านมา', 'ทั้งหมด']
const SORTS = ['ล่าสุด', 'เก่าสุด', 'ชื่อ A-Z']
// เฉพาะกิจกรรมที่มีหน้าบันทึกผลแบบกลุ่ม (ตามห้อง) รองรับอยู่แล้ว — ตรวจฟัน/ตรวจพัฒนาการ/สุขภาพจิต
// ที่บันทึกในหน้าบันทึกกิจกรรมยังไม่มีหน้าบันทึกผลแบบกลุ่มของตัวเอง (มีแค่ในโปรไฟล์รายคน)
const TABS = [
  { key: 'checkup', label: 'ตรวจสุขภาพ', icon: IconFileText, activity: 'ตรวจสุขภาพ' },
  { key: 'vaccine', label: 'ฉีดวัคซีน', icon: IconSyringe, activity: 'ฉีดวัคซีน' },
]

const THAI_MONTHS_FULL = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
function todayCheckupDate() {
  const d = new Date()
  const iso = d.toISOString().slice(0, 10)
  const label = `${d.getDate()} ${THAI_MONTHS_FULL[d.getMonth()]} ${d.getFullYear() + 543}`
  return { iso, label }
}

// ผูกวันที่ตรวจของแต่ละโรงเรียนเข้ากับบันทึกล่าสุด "เฉพาะกิจกรรมของแท็บที่เลือกอยู่" ในหน้า
// "บันทึกกิจกรรม" — ถ้ายังไม่เคยมีการบันทึกกิจกรรมประเภทนี้ให้โรงเรียนนั้น ใช้วันนี้เป็นค่าเริ่มต้น
function withCheckupDate(schools, activityLogs, activityType) {
  const today = todayCheckupDate()
  return schools.map((s) => {
    const matches = activityLogs.filter((l) => l.schoolId === s.id && l.activity === activityType)
    const latest = matches.reduce((best, l) => (!best || l.dateIso > best.dateIso ? l : best), null)
    return {
      ...s,
      checkupDateIso: latest ? latest.dateIso : today.iso,
      checkupDateLabel: latest ? latest.dateLabel : today.label,
      checkupRoomNames: latest ? latest.roomNames : null,
      checkupActivity: activityType,
    }
  })
}

export default function HealthCheckupBrowserPage({ schools, activityLogs, showToast, onOpenCheckup }) {
  const [activeTab, setActiveTab] = useState('checkup')
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('ทั้งหมด')
  const [subdistrict, setSubdistrict] = useState('ทั้งหมด')
  const [year, setYear] = useState(YEARS[0])
  const [dateFilter, setDateFilter] = useState(DATE_FILTERS[0])
  const [sortBy, setSortBy] = useState(SORTS[0])
  const [viewMode, setViewMode] = useState('list') // 'card' | 'list'
  const [page, setPage] = useState(1)

  const noFilters = search === '' && district === 'ทั้งหมด' && subdistrict === 'ทั้งหมด'

  const activeActivity = TABS.find((t) => t.key === activeTab)?.activity ?? TABS[0].activity
  const schoolsWithCheckupDate = useMemo(
    () => withCheckupDate(schools, activityLogs, activeActivity),
    [schools, activityLogs, activeActivity]
  )

  const filtered = useMemo(() => {
    let list = schoolsWithCheckupDate.filter((s) => (
      (district === 'ทั้งหมด' || s.district === district)
      && (subdistrict === 'ทั้งหมด' || s.subdistrict === subdistrict)
      && (search.trim() === '' || `${s.name} ${s.code}`.toLowerCase().includes(search.trim().toLowerCase()))
    ))
    list = [...list]
    if (sortBy === 'ล่าสุด') list.sort((a, b) => b.checkupDateIso.localeCompare(a.checkupDateIso))
    else if (sortBy === 'เก่าสุด') list.sort((a, b) => a.checkupDateIso.localeCompare(b.checkupDateIso))
    else list.sort((a, b) => a.name.localeCompare(b.name, 'th'))
    return list
  }, [schoolsWithCheckupDate, search, district, subdistrict, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageSchools = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function resetFilters() {
    setSearch('')
    setDistrict('ทั้งหมด')
    setSubdistrict('ทั้งหมด')
    setPage(1)
  }

  function handleTabChange(key) {
    setActiveTab(key)
    setPage(1)
  }

  function handleExport() {
    const header = 'รหัสโรงเรียน,ชื่อโรงเรียน,วันที่ตรวจ,กิจกรรมที่จะทำ,จำนวนนักเรียน\n'
    const body = filtered.map((s) => `${s.code},${s.name},${s.checkupDateLabel},${s.checkupActivity},${s.studentCount}`).join('\n')
    const blob = new Blob([`﻿${header}${body}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ตรวจสุขภาพนักเรียน-${activeActivity}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showToast('นำออกเอกสารเรียบร้อยแล้ว')
  }

  function handleViewMode(mode) {
    if (mode === 'card') { showToast('ฟีเจอร์นี้ยังไม่พร้อมใช้งาน'); return }
    setViewMode(mode)
  }

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <h1 className="page-title">ตรวจสุขภาพนักเรียน</h1>

      <TabBar tabs={TABS} active={activeTab} onChange={handleTabChange} />

      <div className="toolbar-card" style={{ marginTop: 20 }}>
        <div className="search-input-wrap" style={{ maxWidth: 890, margin: '0 auto 20px' }}>
          <IconSearch size={20} />
          <input
            className="search-input"
            placeholder="ค้นหาชื่อ โรงเรียน /รหัสโรงเรียน"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <div className="filter-row">
          <button className={`chip${noFilters ? ' active' : ''}`} onClick={resetFilters}>ทั้งหมด</button>

          <SelectChip label="เขต" value={district} onChange={(v) => { setDistrict(v); setPage(1) }} options={['ทั้งหมด', ...districts]} />
          <SelectChip label="แขวง" value={subdistrict} onChange={(v) => { setSubdistrict(v); setPage(1) }} options={['ทั้งหมด', ...subdistricts]} />
          <SelectChip label="ปี" value={year} onChange={setYear} options={YEARS} />
          <SelectChip label="วันที่" value={dateFilter} onChange={setDateFilter} options={DATE_FILTERS} />
          <SelectChip label="การสร้าง" value={sortBy} onChange={setSortBy} options={SORTS} />

          <div className="filter-spacer" />

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
            ไม่พบโรงเรียนที่ตรงกับตัวกรอง
          </div>
        ) : (
          <>
            <HealthCheckupTable schools={pageSchools} onCheckup={onOpenCheckup} />
            <div style={{ padding: '0 20px' }}>
              <Pagination page={page} totalPages={totalPages} pageSize={PAGE_SIZE} totalItems={filtered.length} onChange={setPage} />
            </div>
          </>
        )}
      </div>
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
