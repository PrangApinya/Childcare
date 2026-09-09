import { useEffect, useMemo, useState } from 'react'
import {
  IconArrowLeft, IconSearch, IconChevronDown, IconPlus, IconUpload, IconGridView, IconListView,
} from '../components/icons.jsx'
import GradeListTable from '../components/schools/GradeListTable.jsx'
import GradeCard from '../components/schools/GradeCard.jsx'
import GradeFormPage from './GradeFormPage.jsx'
import Pagination from '../components/Pagination.jsx'
import { districts, subdistricts, generateGradeSummary } from '../data/schools.js'

const PAGE_SIZE = 20
const YEARS = ['2569', '2568', '2567']
const DATE_FILTERS = ['วันนี้', '7 วันที่ผ่านมา', '30 วันที่ผ่านมา', 'ทั้งหมด']
const SORTS = ['ล่าสุด', 'เก่าสุด', 'ชื่อ A-Z']

export default function SchoolDetailPage({ school, onBack, onOpenGrade, showToast, onSubCrumbChange }) {
  const [grades, setGrades] = useState(() => generateGradeSummary(school))
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('ทั้งหมด')
  const [subdistrict, setSubdistrict] = useState('ทั้งหมด')
  const [year, setYear] = useState(YEARS[0])
  const [dateFilter, setDateFilter] = useState(DATE_FILTERS[0])
  const [sortBy, setSortBy] = useState(SORTS[0])
  const [viewMode, setViewMode] = useState('list')
  const [page, setPage] = useState(1)
  const [subScreen, setSubScreen] = useState(null) // null | 'create-grade' | 'edit-grade'
  const [editingGrade, setEditingGrade] = useState(null)

  const noFilters = search === '' && district === 'ทั้งหมด' && subdistrict === 'ทั้งหมด'

  const filtered = useMemo(() => {
    let list = grades.filter((g) => search.trim() === '' || g.name.toLowerCase().includes(search.trim().toLowerCase()))
    list = [...list]
    if (sortBy === 'ล่าสุด') list.sort((a, b) => b.code.localeCompare(a.code))
    else if (sortBy === 'เก่าสุด') list.sort((a, b) => a.code.localeCompare(b.code))
    else list.sort((a, b) => a.name.localeCompare(b.name, 'th'))
    return list
  }, [grades, search, sortBy])

  useEffect(() => { setPage(1) }, [search, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageGrades = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function resetFilters() {
    setSearch('')
    setDistrict('ทั้งหมด')
    setSubdistrict('ทั้งหมด')
  }

  function openCreate() {
    setSubScreen('create-grade')
    onSubCrumbChange('เพิ่มชั้นเรียน')
  }
  function openEdit(grade) {
    setEditingGrade(grade)
    setSubScreen('edit-grade')
    onSubCrumbChange('แก้ไขชั้นเรียน')
  }
  function closeSubScreen() {
    setSubScreen(null)
    setEditingGrade(null)
    onSubCrumbChange(null)
  }

  function handleCreateGrade({ gradeNames }) {
    setGrades((list) => {
      let nextIndex = list.length
      const additions = gradeNames.map((name) => {
        nextIndex += 1
        return { code: String(nextIndex).padStart(4, '0'), name, surveyDate: school.lastSurveyLabel, studentCount: 0 }
      })
      return [...list, ...additions]
    })
    showToast('สร้างชั้นเรียนเรียบร้อยแล้ว')
  }

  function handleEditGrade({ gradeNames }) {
    const newName = gradeNames[0] || editingGrade.name
    setGrades((list) => list.map((g) => (g.code === editingGrade.code ? { ...g, name: newName } : g)))
    showToast('บันทึกข้อมูลชั้นเรียนเรียบร้อยแล้ว')
  }

  function handleExport() {
    const header = 'รหัสห้อง,ชื่อชั้นเรียน,วันที่สำรวจ,จำนวนนักเรียน\n'
    const body = grades.map((g) => `${g.code},${g.name},${g.surveyDate},${g.studentCount}`).join('\n')
    const blob = new Blob([`﻿${header}${body}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${school.name}-ชั้นเรียน.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showToast('นำออกเอกสารเรียบร้อยแล้ว')
  }

  if (subScreen === 'create-grade') {
    return (
      <GradeFormPage mode="create" school={school} onCancel={closeSubScreen} onSubmit={handleCreateGrade} onDone={closeSubScreen} showToast={showToast} />
    )
  }
  if (subScreen === 'edit-grade' && editingGrade) {
    return (
      <GradeFormPage mode="edit" school={school} grade={editingGrade} onCancel={closeSubScreen} onSubmit={handleEditGrade} onDone={closeSubScreen} showToast={showToast} />
    )
  }

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <div className="stu-topbar" style={{ maxHeight: 'none', opacity: 1, paddingBottom: 8 }}>
        <button className="btn btn-outline btn-sm" onClick={onBack}><IconArrowLeft size={16} />กลับ</button>
        <h1>{school.name}</h1>
      </div>

      <div className="toolbar-card">
        <div className="search-input-wrap">
          <IconSearch size={20} />
          <input
            className="search-input"
            placeholder="ค้นหาชื่อ ห้อง / เขต / แขวง"
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

          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <IconPlus size={16} />สร้างชั้นเรียน
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

      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
          ไม่พบชั้นเรียนที่ตรงกับตัวกรอง
        </div>
      ) : viewMode === 'list' ? (
        <div className="card">
          <GradeListTable grades={pageGrades} onView={(g, s) => onOpenGrade(school, g, s)} onEdit={openEdit} />
          <div style={{ padding: '0 20px' }}>
            <Pagination page={page} totalPages={totalPages} pageSize={PAGE_SIZE} totalItems={filtered.length} onChange={setPage} />
          </div>
        </div>
      ) : (
        <>
          <div className="gd-grid">
            {pageGrades.map((g) => (
              <GradeCard key={g.code} grade={g} onView={(gr, s) => onOpenGrade(school, gr, s)} onEdit={openEdit} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} pageSize={PAGE_SIZE} totalItems={filtered.length} onChange={setPage} />
        </>
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
