import { useMemo, useState } from 'react'
import {
  IconSearch, IconChevronDown, IconUpload, IconGridView, IconListView, IconGraduationCap, IconClock,
} from '../components/icons.jsx'
import Pagination from '../components/Pagination.jsx'
import TabBar from '../components/TabBar.jsx'
import ReportDashboardPage from './ReportDashboardPage.jsx'
import { districts, subdistricts } from '../data/schools.js'

const PAGE_SIZE = 20
const YEARS = ['2569', '2568', '2567']
const DATE_FILTERS = ['วันนี้', '7 วันที่ผ่านมา', '30 วันที่ผ่านมา', 'ทั้งหมด']
const SORTS = ['ล่าสุด', 'เก่าสุด', 'ชื่อ A-Z']
const TABS = [
  { key: 'schools', label: 'สถานศึกษา', icon: IconGraduationCap },
  { key: 'daycare', label: 'สถานรับเลี้ยงเด็กกลางวัน', icon: IconClock },
]

export default function ReportBrowserPage({ reportTitle, reportKey, schools, daycareRooms, showToast }) {
  const [activeTab, setActiveTab] = useState('schools')
  const [viewingInstitution, setViewingInstitution] = useState(null)
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('ทั้งหมด')
  const [subdistrict, setSubdistrict] = useState('ทั้งหมด')
  const [year, setYear] = useState(YEARS[0])
  const [dateFilter, setDateFilter] = useState(DATE_FILTERS[0])
  const [sortBy, setSortBy] = useState(SORTS[0])
  const [viewMode, setViewMode] = useState('list')
  const [page, setPage] = useState(1)

  const isSchools = activeTab === 'schools'
  const noFilters = search === '' && (!isSchools || (district === 'ทั้งหมด' && subdistrict === 'ทั้งหมด'))

  const filtered = useMemo(() => {
    const source = isSchools ? schools : daycareRooms
    let list = source.filter((r) => (
      (!isSchools || district === 'ทั้งหมด' || r.district === district)
      && (!isSchools || subdistrict === 'ทั้งหมด' || r.subdistrict === subdistrict)
      && (search.trim() === '' || `${r.name} ${r.code}`.toLowerCase().includes(search.trim().toLowerCase()))
    ))
    list = [...list]
    const dateKey = isSchools ? 'lastSurvey' : 'surveyDate'
    if (sortBy === 'ล่าสุด') list.sort((a, b) => b[dateKey].localeCompare(a[dateKey]))
    else if (sortBy === 'เก่าสุด') list.sort((a, b) => a[dateKey].localeCompare(b[dateKey]))
    else list.sort((a, b) => a.name.localeCompare(b.name, 'th'))
    return list
  }, [isSchools, schools, daycareRooms, search, district, subdistrict, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function resetFilters() {
    setSearch('')
    setDistrict('ทั้งหมด')
    setSubdistrict('ทั้งหมด')
    setPage(1)
  }

  function handleExport() {
    const countKey = isSchools ? 'studentCount' : 'childCount'
    const dateLabelKey = isSchools ? 'lastSurveyLabel' : 'surveyDateLabel'
    const header = 'รหัส,ชื่อ,วันที่สำรวจ,จำนวน\n'
    const body = filtered.map((r) => `${r.code},${r.name},${r[dateLabelKey]},${r[countKey]}`).join('\n')
    const blob = new Blob([`﻿${header}${body}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportTitle}.csv`
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

  if (viewingInstitution) {
    return (
      <ReportDashboardPage
        reportTitle={reportTitle}
        reportKey={reportKey}
        institution={viewingInstitution}
        isSchools={isSchools}
        onBack={() => setViewingInstitution(null)}
        showToast={showToast}
      />
    )
  }

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <h1 className="page-title">{reportTitle}</h1>

      <TabBar tabs={TABS} active={activeTab} onChange={(k) => { setActiveTab(k); setPage(1); setSearch('') }} />

      <div className="toolbar-card" style={{ marginTop: 20 }}>
        <div className="search-input-wrap" style={{ maxWidth: 890, margin: '0 auto 20px' }}>
          <IconSearch size={20} />
          <input
            className="search-input"
            placeholder={isSchools ? 'ค้นหาชื่อโรงเรียน / รหัสโรงเรียน' : 'ค้นหาชื่อห้องเรียน / รหัสห้อง'}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <div className="filter-row">
          <button className={`chip${noFilters ? ' active' : ''}`} onClick={resetFilters}>ทั้งหมด</button>

          {isSchools && (
            <>
              <SelectChip label="เขต" value={district} onChange={(v) => { setDistrict(v); setPage(1) }} options={['ทั้งหมด', ...districts]} />
              <SelectChip label="แขวง" value={subdistrict} onChange={(v) => { setSubdistrict(v); setPage(1) }} options={['ทั้งหมด', ...subdistricts]} />
            </>
          )}
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
            {isSchools ? 'ไม่พบโรงเรียนที่ตรงกับตัวกรอง' : 'ไม่พบห้องเรียนที่ตรงกับตัวกรอง'}
          </div>
        ) : (
          <>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>{isSchools ? 'รหัสโรงเรียน' : 'รหัสห้อง'}</th>
                    <th>{isSchools ? 'ชื่อโรงเรียน' : 'ชื่อห้องเรียน'}</th>
                    <th>วันที่สำรวจ</th>
                    <th>{isSchools ? 'จำนวนนักเรียน' : 'จำนวนเด็ก'}</th>
                    <th>การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((r) => (
                    <tr key={r.id}>
                      <td className="tabular">{r.code}</td>
                      <td style={{ fontWeight: 600 }}>{r.name}</td>
                      <td className="tabular">{isSchools ? r.lastSurveyLabel : r.surveyDateLabel}</td>
                      <td className="tabular">{(isSchools ? r.studentCount : r.childCount).toLocaleString('th-TH')}</td>
                      <td>
                        <button className="btn btn-primary btn-sm" onClick={() => setViewingInstitution(r)}>ดูรายงาน</button>
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
