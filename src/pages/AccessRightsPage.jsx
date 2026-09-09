import { useMemo, useState } from 'react'
import { IconPlus, IconEye, IconEdit, IconTrash } from '../components/icons.jsx'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.jsx'
import AccessRightsFormPage from './AccessRightsFormPage.jsx'
import { generateInitialAccessRoles } from '../data/admins.js'

export default function AccessRightsPage({ showToast }) {
  const [roles, setRoles] = useState(() => generateInitialAccessRoles())
  const [subScreen, setSubScreen] = useState(null) // null | 'create' | 'edit' | 'view'
  const [editingRole, setEditingRole] = useState(null)
  const [deletingRole, setDeletingRole] = useState(null)

  const sorted = useMemo(() => [...roles].sort((a, b) => a.order - b.order), [roles])

  function openCreate() {
    setEditingRole(null)
    setSubScreen('create')
  }
  function openEdit(role) {
    setEditingRole(role)
    setSubScreen('edit')
  }
  function openView(role) {
    setEditingRole(role)
    setSubScreen('view')
  }
  function closeSubScreen() {
    setSubScreen(null)
    setEditingRole(null)
  }

  function handleSaveRole(fields) {
    if (editingRole) {
      setRoles((list) => list.map((r) => (r.id === editingRole.id ? { ...r, ...fields } : r)))
    } else {
      const nextOrder = roles.length + 1
      setRoles((list) => [{ id: `access-${Date.now()}`, order: nextOrder, active: true, status: { label: 'ปกติ', tone: 'green' }, ...fields }, ...list])
    }
  }

  function toggleActive(role) {
    setRoles((list) => list.map((r) => (r.id === role.id ? { ...r, active: !r.active } : r)))
  }

  function confirmDelete() {
    setRoles((list) => list.filter((r) => r.id !== deletingRole.id))
    showToast('ลบสิทธิ์การเข้าถึงเรียบร้อยแล้ว')
    setDeletingRole(null)
  }

  if (subScreen === 'create') {
    return (
      <AccessRightsFormPage
        mode="create"
        onCancel={closeSubScreen}
        onSubmit={handleSaveRole}
        onDone={closeSubScreen}
        showToast={showToast}
      />
    )
  }
  if (subScreen === 'edit' && editingRole) {
    return (
      <AccessRightsFormPage
        mode="edit"
        item={editingRole}
        onCancel={closeSubScreen}
        onSubmit={handleSaveRole}
        onDone={closeSubScreen}
        showToast={showToast}
      />
    )
  }
  if (subScreen === 'view' && editingRole) {
    return (
      <AccessRightsFormPage
        mode="view"
        item={editingRole}
        onCancel={closeSubScreen}
        onDone={closeSubScreen}
        showToast={showToast}
      />
    )
  }

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <h1 className="page-title">สิทธิ์การเข้าถึง</h1>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 20px 0' }}>
          <button className="btn btn-outline btn-sm" onClick={openCreate}>
            <IconPlus size={16} />เพิ่มสิทธิ์การเข้าถึง
          </button>
        </div>

        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>ตำแหน่ง</th>
                <th>การใช้งาน</th>
                <th>สถานะ</th>
                <th>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.id}>
                  <td className="tabular">{r.order}</td>
                  <td style={{ fontWeight: 600 }}>{r.role}</td>
                  <td>
                    <button
                      type="button"
                      className={`switch-sm ${r.active ? 'on' : 'off'}`}
                      title={r.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                      onClick={() => toggleActive(r)}
                    >
                      <span className="switch-sm-dot" />
                    </button>
                  </td>
                  <td><span className={`badge badge-${r.status.tone}`}><span className="badge-dot" />{r.status.label}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="icon-btn" title="ดูข้อมูล" onClick={() => openView(r)}>
                        <IconEye size={16} />
                      </button>
                      <button className="icon-btn" title="แก้ไข" onClick={() => openEdit(r)}>
                        <IconEdit size={16} />
                      </button>
                      <button className="icon-btn icon-btn-danger" title="ลบ" onClick={() => setDeletingRole(r)}>
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

      {deletingRole && (
        <ConfirmDeleteModal
          title="ลบสิทธิ์การเข้าถึงนี้ ?"
          itemLabel={deletingRole.role}
          consequence="จะถูกลบออกจากระบบอย่างถาวร"
          onCancel={() => setDeletingRole(null)}
          onConfirm={confirmDelete}
        />
      )}
    </section>
  )
}
