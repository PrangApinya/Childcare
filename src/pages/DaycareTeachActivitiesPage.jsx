import { useMemo, useState } from 'react'
import { IconSearch, IconChevronDown, IconPlus, IconGridView, IconListView, IconEdit, IconTrash } from '../components/icons.jsx'
import Pagination from '../components/Pagination.jsx'
import TeachActivityModal from '../components/daycare/TeachActivityModal.jsx'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.jsx'
import { generateInitialTeachActivities } from '../data/daycare.js'

const PAGE_SIZE = 20
const DATE_FILTERS = ['วันนี้', '7 วันที่ผ่านมา', '30 วันที่ผ่านมา', 'ทั้งหมด']

export default function DaycareTeachActivitiesPage({ showToast }) {
  const [activities, setActivities] = useState(() => generateInitialTeachActivities())
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('ทั้งหมด')
  const [viewMode, setViewMode] = useState('list')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)
  const [deletingActivity, setDeletingActivity] = useState(null)

  const noFilters = search === '' && dateFilter === 'ทั้งหมด'

  const filtered = useMemo(() => (
    activities.filter((a) => (
      search.trim() === '' || a.name.toLowerCase().includes(search.trim().toLowerCase())
    ))
  ), [activities, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageActivities = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function resetFilters() {
    setSearch('')
    setDateFilter('ทั้งหมด')
    setPage(1)
  }

  function handleViewMode(mode) {
    if (mode === 'card') { showToast('ฟีเจอร์นี้ยังไม่พร้อมใช้งาน'); return }
    setViewMode(mode)
  }

  function openCreate() {
    setEditingActivity(null)
    setModalOpen(true)
  }
  function openEdit(activity) {
    setEditingActivity(activity)
    setModalOpen(true)
  }
  function closeModal() {
    setModalOpen(false)
    setEditingActivity(null)
  }

  function handleSaveActivity(fields) {
    if (editingActivity) {
      setActivities((list) => list.map((a) => (a.id === editingActivity.id ? { ...a, ...fields } : a)))
      showToast('บันทึกการแก้ไขเรียบร้อยแล้ว')
    } else {
      const nextNum = activities.length + 1
      setActivities((list) => [{ id: `act-${Date.now()}`, code: `ACT${String(nextNum).padStart(3, '0')}`, ...fields }, ...list])
      showToast('บันทึกกิจกรรมการสอนเรียบร้อยแล้ว')
    }
    closeModal()
  }

  function confirmDelete() {
    setActivities((list) => list.filter((a) => a.id !== deletingActivity.id))
    showToast('ลบกิจกรรมการสอนเรียบร้อยแล้ว')
    setDeletingActivity(null)
  }

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <h1 className="page-title">กิจกรรมการสอน</h1>

      <div className="toolbar-card">
        <div className="search-input-wrap">
          <IconSearch size={20} />
          <input
            className="search-input"
            placeholder="ค้นหากิจกรรม"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <div className="filter-row">
          <button className={`chip${noFilters ? ' active' : ''}`} onClick={resetFilters}>ทั้งหมด</button>

          <SelectChip label="วันที่" value={dateFilter} onChange={setDateFilter} options={DATE_FILTERS} />

          <div className="filter-spacer" />

          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <IconPlus size={16} />บันทึกกิจกรรมการสอน
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
            ไม่พบกิจกรรมที่ตรงกับตัวกรอง
          </div>
        ) : (
          <>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>รหัส</th>
                    <th>ชื่อกิจกรรม</th>
                    <th>ระยะเวลา</th>
                    <th>สถานะ</th>
                    <th>การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {pageActivities.map((a) => (
                    <tr key={a.id}>
                      <td className="tabular">{a.code}</td>
                      <td style={{ fontWeight: 600 }}>{a.name}</td>
                      <td className="tabular">{a.durationMin} นาที</td>
                      <td>
                        <span className={`badge ${a.active ? 'badge-green' : 'badge-red'}`}>
                          <span className="badge-dot" />{a.active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(a)}>
                            <IconEdit size={14} />แก้ไข
                          </button>
                          <button className="icon-btn icon-btn-danger" title="ลบ" onClick={() => setDeletingActivity(a)}>
                            <IconTrash size={16} />
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

      {modalOpen && (
        <TeachActivityModal initial={editingActivity} onCancel={closeModal} onSave={handleSaveActivity} />
      )}

      {deletingActivity && (
        <ConfirmDeleteModal
          title="ลบกิจกรรมการสอนนี้ ?"
          itemLabel={deletingActivity.name}
          onCancel={() => setDeletingActivity(null)}
          onConfirm={confirmDelete}
        />
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
