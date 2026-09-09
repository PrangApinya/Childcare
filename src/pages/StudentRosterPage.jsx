import { useEffect, useMemo, useState } from 'react'
import {
  IconArrowLeft, IconSearch, IconChevronDown, IconPlus, IconUpload, IconGridView, IconListView, IconEye, IconEdit,
} from '../components/icons.jsx'
import Pagination from '../components/Pagination.jsx'
import StudentFormPage from './StudentFormPage.jsx'
import { generateStudents } from '../data/schools.js'

const PAGE_SIZE = 20
const SORTS = ['เรียงตามเลขที่', 'ชื่อ ก-ฮ', 'เลขประจำตัว']
const HEALTH_FILTERS = ['ปกติ', 'เฝ้าระวัง', 'ผิดปกติ']
const ENROLL_FILTERS = ['เรียนอยู่', 'ลาออก']
const BADGE_CLASS = { green: 'badge-green', orange: 'badge-orange', red: 'badge-red', grey: 'badge-grey' }

function enrollTone(label) {
  if (label === 'เรียนอยู่') return 'green'
  if (label === 'พักการเรียน') return 'orange'
  return 'grey'
}

export default function StudentRosterPage({ school, grade, onBack, onOpenStudent, showToast, onSubCrumbChange }) {
  const [students, setStudents] = useState(() => generateStudents(grade))
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState(SORTS[0])
  const [healthFilter, setHealthFilter] = useState('ทั้งหมด')
  const [enrollFilter, setEnrollFilter] = useState('ทั้งหมด')
  const [viewMode, setViewMode] = useState('list')
  const [page, setPage] = useState(1)
  const [subScreen, setSubScreen] = useState(null) // null | 'create-student' | 'edit-student'
  const [editingStudent, setEditingStudent] = useState(null)

  const noFilters = search === '' && healthFilter === 'ทั้งหมด' && enrollFilter === 'ทั้งหมด'

  const filtered = useMemo(() => {
    let list = students.filter((s) => (
      (healthFilter === 'ทั้งหมด' || s.healthStatus.label === healthFilter)
      && (enrollFilter === 'ทั้งหมด' || s.enrollStatus.label === enrollFilter)
      && (search.trim() === '' || `${s.fullName} ${s.citizenId}`.toLowerCase().includes(search.trim().toLowerCase()))
    ))
    list = [...list]
    if (sortBy === 'ชื่อ ก-ฮ') list.sort((a, b) => a.fullName.localeCompare(b.fullName, 'th'))
    else if (sortBy === 'เลขประจำตัว') list.sort((a, b) => a.citizenId.localeCompare(b.citizenId))
    else list.sort((a, b) => a.seatNo - b.seatNo)
    return list
  }, [students, search, sortBy, healthFilter, enrollFilter])

  useEffect(() => { setPage(1) }, [search, sortBy, healthFilter, enrollFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageStudents = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function resetFilters() {
    setSearch('')
    setHealthFilter('ทั้งหมด')
    setEnrollFilter('ทั้งหมด')
  }

  function openCreate() {
    setSubScreen('create-student')
    onSubCrumbChange('เพิ่มนักเรียน')
  }
  function openEdit(student) {
    setEditingStudent(student)
    setSubScreen('edit-student')
    onSubCrumbChange('แก้ไขข้อมูลนักเรียน')
  }
  function closeSubScreen() {
    setSubScreen(null)
    setEditingStudent(null)
    onSubCrumbChange(null)
  }

  function handleCreateStudent({ fullName, citizenId, dob, enrollStatusLabel }) {
    const dobLabel = dob ? new Date(`${dob}T00:00:00`).toLocaleDateString('th-TH-u-ca-buddhist', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'
    setStudents((list) => [{
      seatNo: list.length + 1,
      citizenId: citizenId || '—',
      fullName,
      dob,
      dobLabel,
      drugAllergies: [],
      chronic: 'ไม่มี',
      nameEn: '',
      addressLabel: '—',
      healthStatus: { label: 'ปกติ', tone: 'green' },
      enrollStatus: { label: enrollStatusLabel, tone: enrollTone(enrollStatusLabel) },
      initials: fullName.replace(/^(เด็กชาย|เด็กหญิง|นาย|นาง|นางสาว)\s*/, '').slice(0, 2),
    }, ...list])
    showToast('เพิ่มนักเรียนเรียบร้อยแล้ว')
  }

  function handleEditStudent(fields) {
    const dobLabel = fields.dob ? new Date(`${fields.dob}T00:00:00`).toLocaleDateString('th-TH-u-ca-buddhist', { day: 'numeric', month: 'long', year: 'numeric' }) : editingStudent.dobLabel
    setStudents((list) => list.map((s) => (s.seatNo === editingStudent.seatNo ? {
      ...s,
      fullName: fields.fullName,
      dob: fields.dob || s.dob,
      dobLabel,
      bloodType: fields.bloodType,
      chronic: fields.chronic,
      allergy: fields.allergy,
      guardianName: fields.guardianName,
      guardianPhone: fields.guardianPhone,
      address: fields.registeredAddr,
      enrollStatus: { label: fields.enrollStatusLabel, tone: enrollTone(fields.enrollStatusLabel) },
    } : s)))
    showToast('บันทึกการแก้ไขเรียบร้อยแล้ว')
  }

  function handleExport() {
    const header = 'เลขที่,เลขประจำตัว,ชื่อ-สกุล,วันเกิด,สถานะสุขภาพล่าสุด,สถานะการเรียน\n'
    const body = students.map((s) => `${s.seatNo},${s.citizenId},${s.fullName},${s.dobLabel},${s.healthStatus.label},${s.enrollStatus.label}`).join('\n')
    const blob = new Blob([`﻿${header}${body}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${grade.name}-รายชื่อนักเรียน.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showToast('นำออกเอกสารเรียบร้อยแล้ว')
  }

  if (subScreen === 'create-student') {
    return (
      <StudentFormPage mode="create" grade={grade} onCancel={closeSubScreen} onSubmit={handleCreateStudent} onDone={closeSubScreen} showToast={showToast} />
    )
  }
  if (subScreen === 'edit-student' && editingStudent) {
    return (
      <StudentFormPage mode="edit" grade={grade} student={editingStudent} onCancel={closeSubScreen} onSubmit={handleEditStudent} onDone={closeSubScreen} showToast={showToast} />
    )
  }

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <div className="stu-topbar" style={{ maxHeight: 'none', opacity: 1, paddingBottom: 8 }}>
        <button className="btn btn-outline btn-sm" onClick={onBack}><IconArrowLeft size={16} />กลับ</button>
        <h1>{grade.name}</h1>
      </div>

      <div className="toolbar-card">
        <div className="search-input-wrap">
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
          <SelectChip label="สถานสุขภาพ" value={healthFilter} onChange={setHealthFilter} options={['ทั้งหมด', ...HEALTH_FILTERS]} />
          <SelectChip label="สถานะเรียน" value={enrollFilter} onChange={setEnrollFilter} options={['ทั้งหมด', ...ENROLL_FILTERS]} />

          <div className="filter-spacer" />

          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <IconPlus size={16} />เพิ่มนักเรียน
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
          ไม่พบนักเรียนที่ตรงกับตัวกรอง
        </div>
      ) : viewMode === 'list' ? (
        <div className="card">
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>เลขที่</th>
                  <th>เลขประจำตัว</th>
                  <th>ชื่อ-สกุล</th>
                  <th>วันเกิด</th>
                  <th>สถานะสุขภาพล่าสุด</th>
                  <th>สถานะการเรียน</th>
                  <th>การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {pageStudents.map((s) => (
                  <tr key={s.seatNo}>
                    <td className="tabular">{s.seatNo}</td>
                    <td className="tabular">{s.citizenId}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="school-av" style={{ width: 32, height: 32, fontSize: 12, borderRadius: '50%' }}>{s.initials}</div>
                        <span style={{ fontWeight: 600 }}>{s.fullName}</span>
                      </div>
                    </td>
                    <td className="tabular">{s.dobLabel}</td>
                    <td><span className={`badge ${BADGE_CLASS[s.healthStatus.tone]}`}><span className="badge-dot" />{s.healthStatus.label}</span></td>
                    <td><span className={`badge ${BADGE_CLASS[s.enrollStatus.tone]}`}><span className="badge-dot" />{s.enrollStatus.label}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="icon-btn" title="ดูข้อมูลนักเรียน" onClick={() => onOpenStudent(s)}>
                          <IconEye size={16} />
                        </button>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(s)}>
                          <IconEdit size={14} />แก้ไข
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '0 20px' }}>
            <Pagination page={page} totalPages={totalPages} pageSize={PAGE_SIZE} totalItems={filtered.length} onChange={setPage} />
          </div>
        </div>
      ) : (
        <>
          <div className="gd-grid">
            {pageStudents.map((s) => (
              <div className="school-card" key={s.seatNo} style={{ cursor: 'default' }}>
                <div className="school-card-hd">
                  <div className="school-av" style={{ background: 'var(--brand-100)', color: 'var(--brand-700)' }}>{s.initials}</div>
                  <div className="meta">
                    <div className="name">{s.fullName}</div>
                    <div className="loc">เลขที่ {s.seatNo} · เกิด {s.dobLabel}</div>
                  </div>
                </div>
                <div className="badge-row" style={{ marginBottom: 12 }}>
                  <span className={`badge ${BADGE_CLASS[s.healthStatus.tone]}`}><span className="badge-dot" />{s.healthStatus.label}</span>
                  <span className={`badge ${BADGE_CLASS[s.enrollStatus.tone]}`}><span className="badge-dot" />{s.enrollStatus.label}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="school-card-link" onClick={() => onOpenStudent(s)}>↳ ดูข้อมูลนักเรียน</button>
                  <button className="btn btn-outline btn-sm" style={{ marginLeft: 'auto' }} onClick={() => openEdit(s)}>
                    <IconEdit size={14} />แก้ไข
                  </button>
                </div>
              </div>
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
        {options.map((o) => <option key={o} value={o}>{`${label}: ${o}`}</option>)}
      </select>
      <IconChevronDown size={13} />
    </div>
  )
}
