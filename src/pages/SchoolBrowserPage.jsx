import { useEffect, useMemo, useState } from 'react'
import {
  IconSearch, IconChevronDown, IconPlus, IconUpload, IconDownload, IconGridView, IconListView,
} from '../components/icons.jsx'
import SchoolCard from '../components/schools/SchoolCard.jsx'
import RoomTable from '../components/schools/RoomTable.jsx'
import SchoolListTable from '../components/schools/SchoolListTable.jsx'
import Pagination from '../components/Pagination.jsx'
import BemisImportModal from '../components/schools/BemisImportModal.jsx'
import { districts, subdistricts, generateRooms } from '../data/schools.js'

const PAGE_SIZE = 20
const YEARS = ['2569', '2568', '2567']
const DATE_FILTERS = ['วันนี้', '7 วันที่ผ่านมา', '30 วันที่ผ่านมา', 'ทั้งหมด']
const SORTS = ['ล่าสุด', 'เก่าสุด', 'ชื่อ A-Z']

export default function SchoolBrowserPage({ schools, showToast, onOpenGrade, onOpenCreate, onOpenEdit, onOpenSchool }) {
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('ทั้งหมด')
  const [subdistrict, setSubdistrict] = useState('ทั้งหมด')
  const [year, setYear] = useState(YEARS[0])
  const [dateFilter, setDateFilter] = useState(DATE_FILTERS[0])
  const [sortBy, setSortBy] = useState(SORTS[0])
  const [viewMode, setViewMode] = useState('card') // 'card' | 'list'
  const [selectedId, setSelectedId] = useState(schools[0]?.id ?? null)
  const [roomPage, setRoomPage] = useState(1)
  const [listPage, setListPage] = useState(1)
  const [showBemisImport, setShowBemisImport] = useState(false)

  const noFilters = search === '' && district === 'ทั้งหมด' && subdistrict === 'ทั้งหมด'

  const filtered = useMemo(() => {
    let list = schools.filter((s) => (
      (district === 'ทั้งหมด' || s.district === district)
      && (subdistrict === 'ทั้งหมด' || s.subdistrict === subdistrict)
      && (search.trim() === '' || `${s.name} ${s.district} ${s.subdistrict}`.toLowerCase().includes(search.trim().toLowerCase()))
    ))
    list = [...list]
    if (sortBy === 'ล่าสุด') list.sort((a, b) => b.lastSurvey.localeCompare(a.lastSurvey))
    else if (sortBy === 'เก่าสุด') list.sort((a, b) => a.lastSurvey.localeCompare(b.lastSurvey))
    else list.sort((a, b) => a.name.localeCompare(b.name, 'th'))
    return list
  }, [schools, search, district, subdistrict, sortBy])

  const selected = filtered.find((s) => s.id === selectedId) || filtered[0] || null

  useEffect(() => {
    if (selected && selected.id !== selectedId) setSelectedId(selected.id)
  }, [selected, selectedId])

  useEffect(() => { setRoomPage(1) }, [selected?.id])
  useEffect(() => { setListPage(1) }, [filtered.length, sortBy, district, subdistrict, search])

  const rooms = useMemo(() => (selected ? generateRooms(selected) : []), [selected])
  const roomTotalPages = Math.max(1, Math.ceil(rooms.length / PAGE_SIZE))
  const pageRooms = rooms.slice((roomPage - 1) * PAGE_SIZE, roomPage * PAGE_SIZE)

  const listTotalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageSchools = filtered.slice((listPage - 1) * PAGE_SIZE, listPage * PAGE_SIZE)

  function resetFilters() {
    setSearch('')
    setDistrict('ทั้งหมด')
    setSubdistrict('ทั้งหมด')
  }

  function handleExport() {
    if (!selected) return
    const header = 'รหัสห้อง,ชื่อห้องเรียน,ครูประจำชั้น,วันที่สำรวจ,จำนวนนักเรียน\n'
    const body = rooms.map((r) => `${r.code},${r.name},${r.teacherName},${r.surveyDate},${r.studentCount}`).join('\n')
    const blob = new Blob([`﻿${header}${body}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selected.name}-ห้องเรียน.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showToast('นำออกเอกสารเรียบร้อยแล้ว')
  }

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <h1 className="page-title">สถานศึกษา</h1>

      <div className="toolbar-card">
        <div className="search-input-wrap">
          <IconSearch size={20} />
          <input
            className="search-input"
            placeholder="ค้นหาชื่อโรงเรียน / เขต / แขวง"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-row">
          <button className={`chip${noFilters ? ' active' : ''}`} onClick={resetFilters}>ทั้งหมด</button>

          <SelectChip label="เขต" value={district} onChange={setDistrict} options={['ทั้งหมด', ...districts]} />
          <SelectChip label="แขวง" value={subdistrict} onChange={setSubdistrict} options={['ทั้งหมด', ...subdistricts]} />
          <SelectChip label="ปี" value={year} onChange={setYear} options={YEARS} />
          <SelectChip label="วันที่" value={dateFilter} onChange={setDateFilter} options={DATE_FILTERS} />
          <SelectChip label="การสร้าง" value={sortBy} onChange={setSortBy} options={SORTS} />

          <div className="filter-spacer" />

          <button className="btn btn-primary btn-sm" onClick={onOpenCreate}>
            <IconPlus size={16} />สร้างโรงเรียน
          </button>
          <button className="btn btn-outline btn-sm" onClick={() => setShowBemisImport(true)}>
            <IconDownload size={16} />นำเข้าข้อมูลจาก BEMIS
          </button>
          <button className="btn btn-outline btn-sm" onClick={handleExport}>
            <IconUpload size={16} />นำออกเอกสาร
          </button>
          <div className="view-toggle">
            <span className="view-toggle-label">มุมมอง</span>
            <button className={viewMode === 'card' ? 'active' : ''} onClick={() => setViewMode('card')} title="มุมมองการ์ด"><IconGridView size={16} /></button>
            <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} title="มุมมองรายการ"><IconListView size={16} /></button>
          </div>
        </div>
      </div>

      {viewMode === 'card' ? (
        <div className="browser-body">
          <div className="school-col">
            {filtered.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>
                ไม่พบโรงเรียนที่ตรงกับตัวกรอง
              </div>
            )}
            {pageSchools.map((s) => (
              <SchoolCard key={s.id} school={s} selected={selected?.id === s.id} onSelect={() => setSelectedId(s.id)} onOpen={onOpenSchool} />
            ))}
            {filtered.length > 0 && (
              <Pagination page={listPage} totalPages={listTotalPages} pageSize={PAGE_SIZE} totalItems={filtered.length} onChange={setListPage} />
            )}
          </div>

          <div className="table-col">
            {selected ? (
              <>
                <RoomTable rooms={pageRooms} onViewRoom={(room) => onOpenGrade(selected, room)} />
                <Pagination page={roomPage} totalPages={roomTotalPages} pageSize={PAGE_SIZE} totalItems={rooms.length} onChange={setRoomPage} />
              </>
            ) : (
              <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
                เลือกโรงเรียนจากรายการทางซ้ายเพื่อดูข้อมูลห้องเรียน
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          {filtered.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
              ไม่พบโรงเรียนที่ตรงกับตัวกรอง
            </div>
          ) : (
            <>
              <SchoolListTable schools={pageSchools} onView={onOpenSchool} onEdit={onOpenEdit} />
              <div style={{ padding: '0 20px' }}>
                <Pagination page={listPage} totalPages={listTotalPages} pageSize={PAGE_SIZE} totalItems={filtered.length} onChange={setListPage} />
              </div>
            </>
          )}
        </div>
      )}

      {showBemisImport && (
        <BemisImportModal
          schools={schools}
          onCancel={() => setShowBemisImport(false)}
          onDone={() => {
            setShowBemisImport(false)
            showToast('นำเข้าข้อมูลจาก BEMIS เรียบร้อยแล้ว')
          }}
        />
      )}
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
