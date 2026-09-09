import { useEffect, useMemo, useState } from 'react'
import { IconArrowLeft, IconSearch, IconPlus, IconUpload, IconGridView, IconListView, IconEye, IconEdit } from '../components/icons.jsx'
import Pagination from '../components/Pagination.jsx'
import StudentFormPage from './StudentFormPage.jsx'
import { generateStudents } from '../data/schools.js'
import { BIRTH_YEAR_BY_ROOM } from '../data/daycare.js'

const PAGE_SIZE = 20
const BADGE_CLASS = { green: 'badge-green', orange: 'badge-orange', red: 'badge-red', grey: 'badge-grey' }

function enrollTone(label) {
  if (label === 'เรียนอยู่') return 'green'
  if (label === 'พักการเรียน') return 'orange'
  return 'grey'
}

export default function DaycareChildRosterPage({ room, onBack, onOpenChild, showToast, onSubCrumbChange }) {
  const [children, setChildren] = useState(() => generateStudents(
    { studentCount: room.childCount },
    BIRTH_YEAR_BY_ROOM[room.name] || 2568
  ))
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('list')
  const [page, setPage] = useState(1)
  const [subScreen, setSubScreen] = useState(null) // null | 'create-child' | 'edit-child'
  const [editingChild, setEditingChild] = useState(null)

  const filtered = useMemo(() => (
    children.filter((c) => search.trim() === '' || `${c.fullName} ${c.citizenId}`.toLowerCase().includes(search.trim().toLowerCase()))
  ), [children, search])

  useEffect(() => { setPage(1) }, [search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageChildren = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleViewMode(mode) {
    if (mode === 'card') { showToast('ฟีเจอร์นี้ยังไม่พร้อมใช้งาน'); return }
    setViewMode(mode)
  }

  function handleExport() {
    const header = 'ชื่อ-สกุล,วันเกิด,สถานะสุขภาพล่าสุด,สถานะการเรียน\n'
    const body = filtered.map((c) => `${c.fullName},${c.dobLabel},${c.healthStatus.label},${c.enrollStatus.label}`).join('\n')
    const blob = new Blob([`﻿${header}${body}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${room.name}-รายชื่อเด็ก.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showToast('นำออกเอกสารเรียบร้อยแล้ว')
  }

  function openCreate() {
    setSubScreen('create-child')
    onSubCrumbChange?.('เพิ่มนักเรียน')
  }
  function openEdit(child) {
    setEditingChild(child)
    setSubScreen('edit-child')
    onSubCrumbChange?.('แก้ไขข้อมูลนักเรียน')
  }
  function closeSubScreen() {
    setSubScreen(null)
    setEditingChild(null)
    onSubCrumbChange?.(null)
  }

  function handleCreateChild({ fullName, citizenId, dob, enrollStatusLabel }) {
    const dobLabel = dob ? new Date(`${dob}T00:00:00`).toLocaleDateString('th-TH-u-ca-buddhist', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'
    setChildren((list) => [{
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

  function handleEditChild(fields) {
    const dobLabel = fields.dob ? new Date(`${fields.dob}T00:00:00`).toLocaleDateString('th-TH-u-ca-buddhist', { day: 'numeric', month: 'long', year: 'numeric' }) : editingChild.dobLabel
    setChildren((list) => list.map((c) => (c.seatNo === editingChild.seatNo ? {
      ...c,
      fullName: fields.fullName,
      dob: fields.dob || c.dob,
      dobLabel,
      bloodType: fields.bloodType,
      chronic: fields.chronic,
      allergy: fields.allergy,
      guardianName: fields.guardianName,
      guardianPhone: fields.guardianPhone,
      address: fields.registeredAddr,
      enrollStatus: { label: fields.enrollStatusLabel, tone: enrollTone(fields.enrollStatusLabel) },
    } : c)))
    showToast('บันทึกการแก้ไขเรียบร้อยแล้ว')
  }

  if (subScreen === 'create-child') {
    return (
      <StudentFormPage mode="create" grade={{ code: `dc-${room.id}`, name: room.name }} onCancel={closeSubScreen} onSubmit={handleCreateChild} onDone={closeSubScreen} showToast={showToast} />
    )
  }
  if (subScreen === 'edit-child' && editingChild) {
    return (
      <StudentFormPage mode="edit" grade={{ code: `dc-${room.id}`, name: room.name }} student={editingChild} onCancel={closeSubScreen} onSubmit={handleEditChild} onDone={closeSubScreen} showToast={showToast} />
    )
  }

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <div className="stu-topbar" style={{ maxHeight: 'none', opacity: 1, paddingBottom: 8 }}>
        <button className="btn btn-outline btn-sm" onClick={onBack}><IconArrowLeft size={16} />กลับ</button>
        <h1>{room.name}</h1>
      </div>

      <div className="toolbar-card">
        <div className="search-input-wrap">
          <IconSearch size={20} />
          <input
            className="search-input"
            placeholder="ค้นหาชื่อ นักเรียน / เลขประจำตัว"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-row">
          <div className="filter-spacer" />
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
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
                    <th>ชื่อ-สกุล</th>
                    <th>วันเกิด</th>
                    <th>สถานะสุขภาพล่าสุด</th>
                    <th>สถานะการเรียน</th>
                    <th>การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {pageChildren.map((c) => (
                    <tr key={c.seatNo}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="school-av" style={{ width: 32, height: 32, fontSize: 12, borderRadius: '50%', background: 'var(--brand-100)', color: 'var(--brand-700)' }}>{c.initials}</div>
                          <span style={{ fontWeight: 600 }}>{c.fullName}</span>
                        </div>
                      </td>
                      <td className="tabular">{c.dobLabel}</td>
                      <td><span className={`badge ${BADGE_CLASS[c.healthStatus.tone]}`}><span className="badge-dot" />{c.healthStatus.label}</span></td>
                      <td><span className={`badge ${BADGE_CLASS[c.enrollStatus.tone]}`}><span className="badge-dot" />{c.enrollStatus.label}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="icon-btn" title="ดูข้อมูล" onClick={() => onOpenChild(c)}>
                            <IconEye size={16} />
                          </button>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(c)}>
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
          </>
        )}
      </div>
    </section>
  )
}
