import { useMemo, useState } from 'react'
import { IconSearch, IconChevronDown, IconPlus, IconEdit, IconTrash } from '../components/icons.jsx'
import Pagination from '../components/Pagination.jsx'
import ActivityLogModal from '../components/schools/ActivityLogModal.jsx'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.jsx'
import { activityLogDateLabel } from '../data/schoolActivities.js'

const PAGE_SIZE = 20
const DATE_FILTERS = ['วันนี้', '7 วันที่ผ่านมา', '30 วันที่ผ่านมา', 'ทั้งหมด']

export default function ActivityLogPage({ logs, onLogsChange, showToast }) {
  const setLogs = onLogsChange
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('ทั้งหมด')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const noFilters = search === '' && dateFilter === 'ทั้งหมด'

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = logs.filter((l) => (
      !q || `${l.activity} ${l.schoolName} ${l.roomNames.join(' ')}`.toLowerCase().includes(q)
    ))
    return [...list].sort((a, b) => b.dateIso.localeCompare(a.dateIso))
  }, [logs, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function resetFilters() {
    setSearch('')
    setDateFilter('ทั้งหมด')
    setPage(1)
  }

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }
  function openEdit(l) {
    setEditing(l)
    setModalOpen(true)
  }
  function closeModal() {
    setModalOpen(false)
    setEditing(null)
  }

  function handleSave(fields) {
    const dateLabel = activityLogDateLabel(fields.dateIso)
    if (editing) {
      setLogs((list) => list.map((l) => (l.id === editing.id ? { ...l, ...fields, dateLabel } : l)))
      showToast('บันทึกการแก้ไขเรียบร้อยแล้ว')
    } else {
      setLogs((list) => [{ id: `act-${Date.now()}`, ...fields, dateLabel }, ...list])
      showToast('บันทึกกิจกรรมเรียบร้อยแล้ว')
    }
    closeModal()
  }

  function confirmDelete() {
    setLogs((list) => list.filter((l) => l.id !== deleting.id))
    showToast('ลบบันทึกกิจกรรมเรียบร้อยแล้ว')
    setDeleting(null)
  }

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <h1 className="page-title">บันทึกกิจกรรม</h1>

      <div className="toolbar-card">
        <div className="search-input-wrap">
          <IconSearch size={20} />
          <input
            className="search-input"
            placeholder="ค้นหากิจกรรม / โรงเรียน / ห้อง"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <div className="filter-row">
          <button className={`chip${noFilters ? ' active' : ''}`} onClick={resetFilters}>ทั้งหมด</button>
          <SelectChip label="วันที่" value={dateFilter} onChange={setDateFilter} options={DATE_FILTERS} />
          <div className="filter-spacer" />
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <IconPlus size={16} />บันทึกกิจกรรม
          </button>
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            ไม่พบบันทึกกิจกรรมที่ตรงกับตัวกรอง
          </div>
        ) : (
          <>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>วันที่ตรวจ</th>
                    <th>โรงเรียน</th>
                    <th>ชั้นเรียน / ห้อง</th>
                    <th>กิจกรรม</th>
                    <th>หมายเหตุ</th>
                    <th>การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((l) => (
                    <tr key={l.id}>
                      <td className="tabular">{l.dateLabel}</td>
                      <td>{l.schoolName}</td>
                      <td>{l.roomNames.join(', ')}</td>
                      <td style={{ fontWeight: 600 }}>{l.activity}</td>
                      <td>{l.note || '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(l)}>
                            <IconEdit size={14} />แก้ไข
                          </button>
                          <button className="icon-btn icon-btn-danger" title="ลบ" onClick={() => setDeleting(l)}>
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
        <ActivityLogModal initial={editing} onCancel={closeModal} onSave={handleSave} />
      )}

      {deleting && (
        <ConfirmDeleteModal
          title="ลบบันทึกกิจกรรมนี้ ?"
          itemLabel={deleting.activity}
          consequence="จะถูกลบออกจากระบบอย่างถาวร"
          onCancel={() => setDeleting(null)}
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
