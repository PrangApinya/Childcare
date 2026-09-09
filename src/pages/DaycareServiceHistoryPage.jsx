import { useMemo, useState } from 'react'
import { IconSearch, IconChevronDown, IconUpload, IconGridView, IconListView, IconFileText, IconSyringe, IconEye } from '../components/icons.jsx'
import Pagination from '../components/Pagination.jsx'
import TabBar from '../components/TabBar.jsx'
import { generateDaycareServiceStatus } from '../data/daycare.js'

const PAGE_SIZE = 20
const YEARS = ['2569', '2568', '2567']
const DATE_FILTERS = ['วันนี้', '7 วันที่ผ่านมา', '30 วันที่ผ่านมา', 'ทั้งหมด']
const SORTS = ['ล่าสุด', 'เก่าสุด', 'ชื่อ A-Z']
const TABS = [
  { key: 'checkup', label: 'ตรวจสุขภาพทั่วไป', icon: IconFileText },
  { key: 'vaccine', label: 'ฉีดวัคซีน', icon: IconSyringe },
]
const BADGE_CLASS = { green: 'badge-green', orange: 'badge-orange' }

export default function DaycareServiceHistoryPage({ rooms, showToast, onOpenDetail }) {
  const [activeTab, setActiveTab] = useState('checkup')
  const [search, setSearch] = useState('')
  const [year, setYear] = useState(YEARS[0])
  const [dateFilter, setDateFilter] = useState(DATE_FILTERS[0])
  const [sortBy, setSortBy] = useState(SORTS[0])
  const [viewMode, setViewMode] = useState('list')
  const [page, setPage] = useState(1)

  const noFilters = search === ''

  const filtered = useMemo(() => {
    let list = rooms.filter((r) => (
      search.trim() === '' || `${r.name} ${r.code}`.toLowerCase().includes(search.trim().toLowerCase())
    ))
    list = [...list]
    if (sortBy === 'ล่าสุด') list.sort((a, b) => b.surveyDate.localeCompare(a.surveyDate))
    else if (sortBy === 'เก่าสุด') list.sort((a, b) => a.surveyDate.localeCompare(b.surveyDate))
    else list.sort((a, b) => a.name.localeCompare(b.name, 'th'))
    return list
  }, [rooms, search, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageRooms = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function resetFilters() {
    setSearch('')
    setPage(1)
  }

  function handleExport() {
    const header = 'รหัสห้อง,ชื่อห้องเรียน,วันที่สำรวจ,จำนวนเด็ก\n'
    const body = filtered.map((r) => `${r.code},${r.name},${r.surveyDateLabel},${r.childCount}`).join('\n')
    const blob = new Blob([`﻿${header}${body}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ประวัติการให้บริการ-สถานรับเลี้ยงเด็กกลางวัน.csv'
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
      <h1 className="page-title">ประวัติการให้บริการ</h1>

      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <div className="toolbar-card" style={{ marginTop: 20 }}>
        <div className="search-input-wrap" style={{ maxWidth: 890, margin: '0 auto 20px' }}>
          <IconSearch size={20} />
          <input
            className="search-input"
            placeholder="ค้นหาชื่อห้องเรียน / รหัสห้อง"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <div className="filter-row">
          <button className={`chip${noFilters ? ' active' : ''}`} onClick={resetFilters}>ทั้งหมด</button>

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
            ไม่พบห้องเรียนที่ตรงกับตัวกรอง
          </div>
        ) : (
          <>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>รหัสห้อง</th>
                    <th>ชื่อห้องเรียน</th>
                    <th>วันที่สำรวจ</th>
                    <th>จำนวนเด็ก</th>
                    <th>สถานะ</th>
                    <th>การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRooms.map((r) => {
                    const status = generateDaycareServiceStatus(r, activeTab)
                    return (
                      <tr key={r.id}>
                        <td className="tabular">{r.code}</td>
                        <td style={{ fontWeight: 600 }}>{r.name}</td>
                        <td className="tabular">{r.surveyDateLabel}</td>
                        <td className="tabular">{r.childCount.toLocaleString('th-TH')}</td>
                        <td><span className={`badge ${BADGE_CLASS[status.tone]}`}><span className="badge-dot" />{status.label}</span></td>
                        <td>
                          <button className="icon-btn" title="ดูข้อมูล" onClick={() => onOpenDetail(r, activeTab)}>
                            <IconEye size={16} />
                          </button>
                        </td>
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
