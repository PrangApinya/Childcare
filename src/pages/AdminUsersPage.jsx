import { useMemo, useState } from 'react'
import { IconPlus, IconEye, IconEdit, IconTrash } from '../components/icons.jsx'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.jsx'
import AdminUserFormPage from './AdminUserFormPage.jsx'
import { generateInitialAdmins } from '../data/admins.js'

export default function AdminUsersPage({ showToast }) {
  const [admins, setAdmins] = useState(() => generateInitialAdmins())
  const [subScreen, setSubScreen] = useState(null) // null | 'create' | 'edit' | 'view'
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [deletingAdmin, setDeletingAdmin] = useState(null)

  const sorted = useMemo(() => [...admins].sort((a, b) => a.order - b.order), [admins])

  function openCreate() {
    setEditingAdmin(null)
    setSubScreen('create')
  }
  function openEdit(admin) {
    setEditingAdmin(admin)
    setSubScreen('edit')
  }
  function openView(admin) {
    setEditingAdmin(admin)
    setSubScreen('view')
  }
  function closeSubScreen() {
    setSubScreen(null)
    setEditingAdmin(null)
  }

  function handleSaveAdmin(fields) {
    if (editingAdmin) {
      setAdmins((list) => list.map((a) => (a.id === editingAdmin.id ? { ...a, ...fields } : a)))
    } else {
      const nextOrder = admins.length + 1
      setAdmins((list) => [{ id: `admin-${Date.now()}`, order: nextOrder, status: { label: 'ปกติ', tone: 'green' }, ...fields }, ...list])
    }
  }

  function toggleActive(admin) {
    setAdmins((list) => list.map((a) => (a.id === admin.id ? { ...a, active: !a.active } : a)))
  }

  function confirmDelete() {
    setAdmins((list) => list.filter((a) => a.id !== deletingAdmin.id))
    showToast('ลบผู้ดูแลระบบเรียบร้อยแล้ว')
    setDeletingAdmin(null)
  }

  if (subScreen === 'create') {
    return (
      <AdminUserFormPage
        mode="create"
        onCancel={closeSubScreen}
        onSubmit={handleSaveAdmin}
        onDone={closeSubScreen}
        showToast={showToast}
      />
    )
  }
  if (subScreen === 'edit' && editingAdmin) {
    return (
      <AdminUserFormPage
        mode="edit"
        admin={editingAdmin}
        onCancel={closeSubScreen}
        onSubmit={handleSaveAdmin}
        onDone={closeSubScreen}
        showToast={showToast}
      />
    )
  }
  if (subScreen === 'view' && editingAdmin) {
    return (
      <AdminUserFormPage
        mode="view"
        admin={editingAdmin}
        onCancel={closeSubScreen}
        onDone={closeSubScreen}
        showToast={showToast}
      />
    )
  }

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <h1 className="page-title">ผู้ดูแลระบบ</h1>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 20px 0' }}>
          <button className="btn btn-outline btn-sm" onClick={openCreate}>
            <IconPlus size={16} />เพิ่มผู้ดูแลระบบ
          </button>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>ชื่อ - นามสกุล</th>
                <th>ตำแหน่ง</th>
                <th>การใช้งาน</th>
                <th>สถานะ</th>
                <th>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((a) => (
                <tr key={a.id}>
                  <td className="tabular">{a.order}</td>
                  <td style={{ fontWeight: 600 }}>{a.fullName}</td>
                  <td>{a.role}</td>
                  <td>
                    <button
                      type="button"
                      className={`switch-sm ${a.active ? 'on' : 'off'}`}
                      title={a.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                      onClick={() => toggleActive(a)}
                    >
                      <span className="switch-sm-dot" />
                    </button>
                  </td>
                  <td><span className={`badge badge-${a.status.tone}`}><span className="badge-dot" />{a.status.label}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="icon-btn" title="ดูข้อมูล" onClick={() => openView(a)}>
                        <IconEye size={16} />
                      </button>
                      <button className="icon-btn" title="แก้ไข" onClick={() => openEdit(a)}>
                        <IconEdit size={16} />
                      </button>
                      <button className="icon-btn icon-btn-danger" title="ลบ" onClick={() => setDeletingAdmin(a)}>
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {deletingAdmin && (
        <ConfirmDeleteModal
          title="ลบผู้ดูแลระบบนี้ ?"
          itemLabel={deletingAdmin.fullName}
          consequence="จะถูกลบออกจากระบบอย่างถาวร"
          onCancel={() => setDeletingAdmin(null)}
          onConfirm={confirmDelete}
        />
      )}
    </section>
  )
}
