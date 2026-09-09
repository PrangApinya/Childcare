import { useMemo, useState } from 'react'
import { IconSearch, IconChevronDown, IconPlus, IconGridView, IconListView, IconEdit, IconTrash } from '../components/icons.jsx'
import Pagination from '../components/Pagination.jsx'
import TeachLogModal from '../components/daycare/TeachLogModal.jsx'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.jsx'
import { generateInitialTeachLogs, teachLogDateLabel } from '../data/daycare.js'

const PAGE_SIZE = 20
const DATE_FILTERS = ['วันนี้', '7 วันที่ผ่านมา', '30 วันที่ผ่านมา', 'ทั้งหมด']

export default function DaycareTeachHistoryPage({ showToast }) {
  const [logs, setLogs] = useState(() => generateInitialTeachLogs())
  const [search, setSearch] = useState('')
  const [dateFilter, setDateFilter] = useState('ทั้งหมด')
  const [viewMode, setViewMode] = useState('list')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingLog, setEditingLog] = useState(null)
  const [deletingLog, setDeletingLog] = useState(null)

  const noFilters = search === '' && dateFilter === 'ทั้งหมด'

  const filtered = useMemo(() => {
    let list = logs.filter((l) => (
      search.trim() === '' || `${l.activity} ${l.className} ${l.teacher}`.toLowerCase().includes(search.trim().toLowerCase())
    ))
    return [...list].sort((a, b) => b.dateIso.localeCompare(a.dateIso))
  }, [logs, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageLogs = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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
    setEditingLog(null)
    setModalOpen(true)
  }
  function openEdit(log) {
    setEditingLog(log)
    setModalOpen(true)
  }
  function closeModal() {
    setModalOpen(false)
    setEditingLog(null)
  }

  function handleSaveLog(fields) {
    const dateLabel = teachLogDateLabel(fields.dateIso)
    if (editingLog) {
      setLogs((list) => list.map((l) => (l.id === editingLog.id ? { ...l, ...fields, dateLabel } : l)))
      showToast('บันทึกการแก้ไขเรียบร้อยแล้ว')
    } else {
      setLogs((list) => [{ id: `log-${Date.now()}`, ...fields, dateLabel }, ...list])
      showToast('บันทึกประวัติการสอนเรียบร้อยแล้ว')
    }
    closeModal()
  }

  function confirmDeleteLog() {
    setLogs((list) => list.filter((l) => l.id !== deletingLog.id))
    showToast('ลบประวัติการสอนเรียบร้อยแล้ว')
    setDeletingLog(null)
  }

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <h1 className="page-title">ประวัติการสอน</h1>

      <div className="toolbar-card">
        <div className="search-input-wrap">
          <IconSearch size={20} />
          <input
            className="search-input"
            placeholder="ค้นหากิจกรรม / ชั้นเรียน /ผู้สอน"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <div className="filter-row">
          <button className={`chip${noFilters ? ' active' : ''}`} onClick={resetFilters}>ทั้งหมด</button>

          <SelectChip label="วันที่" value={dateFilter} onChange={setDateFilter} options={DATE_FILTERS} />

          <div className="filter-spacer" />

          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <IconPlus size={16} />บันทึกการสอน
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
            ไม่พบประวัติการสอนที่ตรงกับตัวกรอง
          </div>
        ) : (
          <>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>วันที่สอน</th>
                    <th>กิจกรรมที่สอน</th>
                    <th>ชั้นเรียน</th>
                    <th>ผู้สอน</th>
                    <th>หมายเหตุ</th>
                    <th>การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {pageLogs.map((l) => (
                    <tr key={l.id}>
                      <td className="tabular">{l.dateLabel}</td>
                      <td style={{ fontWeight: 600 }}>{l.activity}</td>
                      <td>{l.className}</td>
                      <td>{l.teacher}</td>
                      <td>{l.note || '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(l)}>
                            <IconEdit size={14} />แก้ไข
                          </button>
                          <button className="icon-btn icon-btn-danger" title="ลบ" onClick={() => setDeletingLog(l)}>
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
        <TeachLogModal initial={editingLog} onCancel={closeModal} onSave={handleSaveLog} />
      )}

      {deletingLog && (
        <ConfirmDeleteModal
          title="ลบประวัติการสอนนี้ ?"
          itemLabel={deletingLog.activity}
          consequence="จะถูกลบออกจากระบบอย่างถาวร"
          onCancel={() => setDeletingLog(null)}
          onConfirm={confirmDeleteLog}
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
