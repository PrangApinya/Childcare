import { useMemo, useState } from 'react'
import { IconSearch, IconPlus, IconEdit, IconTrash } from '../components/icons.jsx'
import Pagination from '../components/Pagination.jsx'
import TeacherAssignmentModal from '../components/schools/TeacherAssignmentModal.jsx'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.jsx'
import { generateInitialTeacherAssignments } from '../data/schoolActivities.js'

const PAGE_SIZE = 20

export default function TeacherAssignmentPage({ showToast }) {
  const [assignments, setAssignments] = useState(() => generateInitialTeacherAssignments())
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return assignments
    return assignments.filter((a) => `${a.teacherName} ${a.schoolName} ${a.roomName}`.toLowerCase().includes(q))
  }, [assignments, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }
  function openEdit(a) {
    setEditing(a)
    setModalOpen(true)
  }
  function closeModal() {
    setModalOpen(false)
    setEditing(null)
  }

  function handleSave(fields) {
    if (editing) {
      setAssignments((list) => list.map((a) => (a.id === editing.id ? { ...a, ...fields } : a)))
      showToast('บันทึกการแก้ไขเรียบร้อยแล้ว')
    } else {
      const nextOrder = assignments.length + 1
      setAssignments((list) => [{ id: `ta-${Date.now()}`, order: nextOrder, ...fields }, ...list])
      showToast('เพิ่มครูประจำชั้นเรียบร้อยแล้ว')
    }
    closeModal()
  }

  function confirmDelete() {
    setAssignments((list) => list.filter((a) => a.id !== deleting.id))
    showToast('ลบข้อมูลเรียบร้อยแล้ว')
    setDeleting(null)
  }

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <h1 className="page-title">ครูประจำชั้น</h1>

      <div className="toolbar-card">
        <div className="search-input-wrap">
          <IconSearch size={20} />
          <input
            className="search-input"
            placeholder="ค้นหาชื่อครู / โรงเรียน / ห้อง"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <div className="filter-row">
          <button className={`chip${search === '' ? ' active' : ''}`} onClick={() => { setSearch(''); setPage(1) }}>ทั้งหมด</button>
          <div className="filter-spacer" />
          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <IconPlus size={16} />เพิ่มครูประจำชั้น
          </button>
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            ไม่พบข้อมูลที่ตรงกับตัวกรอง
          </div>
        ) : (
          <>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>ลำดับ</th>
                    <th>ชื่อ-นามสกุลครู</th>
                    <th>โรงเรียน</th>
                    <th>ห้อง / ชั้นที่รับผิดชอบ</th>
                    <th>การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((a, i) => (
                    <tr key={a.id}>
                      <td className="tabular">{(page - 1) * PAGE_SIZE + i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{a.teacherName}</td>
                      <td>{a.schoolName}</td>
                      <td>{a.roomName}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(a)}>
                            <IconEdit size={14} />แก้ไข
                          </button>
                          <button className="icon-btn icon-btn-danger" title="ลบ" onClick={() => setDeleting(a)}>
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
        <TeacherAssignmentModal initial={editing} onCancel={closeModal} onSave={handleSave} />
      )}

      {deleting && (
        <ConfirmDeleteModal
          title="ลบครูประจำชั้นนี้ ?"
          itemLabel={deleting.teacherName}
          consequence="จะถูกลบออกจากระบบอย่างถาวร"
          onCancel={() => setDeleting(null)}
          onConfirm={confirmDelete}
        />
      )}
    </section>
  )
}
