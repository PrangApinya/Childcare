import { useMemo, useState } from 'react'
import { IconSearch, IconChevronDown, IconPlus, IconUpload, IconGridView, IconListView, IconEye, IconEdit, IconTrash } from '../components/icons.jsx'
import Pagination from '../components/Pagination.jsx'
import ServiceModal from '../components/ServiceModal.jsx'
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.jsx'
import { generateInitialServices } from '../data/services.js'
import { districts, subdistricts } from '../data/schools.js'

const PAGE_SIZE = 20
const YEARS = ['2569', '2568', '2567']
const DATE_FILTERS = ['วันนี้', '7 วันที่ผ่านมา', '30 วันที่ผ่านมา', 'ทั้งหมด']
const SORTS = ['ล่าสุด', 'เก่าสุด', 'ชื่อ A-Z']

export default function ServicesPage({ showToast }) {
  const [services, setServices] = useState(() => generateInitialServices())
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('ทั้งหมด')
  const [subdistrict, setSubdistrict] = useState('ทั้งหมด')
  const [year, setYear] = useState(YEARS[0])
  const [dateFilter, setDateFilter] = useState(DATE_FILTERS[0])
  const [sortBy, setSortBy] = useState(SORTS[0])
  const [viewMode, setViewMode] = useState('list')
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [deletingService, setDeletingService] = useState(null)

  const noFilters = search === '' && district === 'ทั้งหมด' && subdistrict === 'ทั้งหมด'

  const filtered = useMemo(() => {
    let list = services.filter((s) => (
      search.trim() === '' || s.name.toLowerCase().includes(search.trim().toLowerCase())
    ))
    list = [...list]
    if (sortBy === 'ชื่อ A-Z') list.sort((a, b) => a.name.localeCompare(b.name, 'th'))
    else if (sortBy === 'เก่าสุด') list = [...list].reverse()
    return list
  }, [services, search, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageServices = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function resetFilters() {
    setSearch('')
    setDistrict('ทั้งหมด')
    setSubdistrict('ทั้งหมด')
    setPage(1)
  }

  function handleExport() {
    const header = 'ลำดับ,ประเภทการตรวจสุขภาพ,ชั้นเรียนที่ใช้,การใช้งาน,สถานะ\n'
    const body = filtered.map((s) => `${s.order},${s.name},${s.classes.join('/')},${s.active ? 'เปิด' : 'ปิด'},${s.status.label}`).join('\n')
    const blob = new Blob([`﻿${header}${body}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'บริการ.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showToast('นำออกเอกสารเรียบร้อยแล้ว')
  }

  function handleViewMode(mode) {
    if (mode === 'card') { showToast('ฟีเจอร์นี้ยังไม่พร้อมใช้งาน'); return }
    setViewMode(mode)
  }

  function openCreate() {
    setEditingService(null)
    setModalOpen(true)
  }
  function openEdit(service) {
    setEditingService(service)
    setModalOpen(true)
  }
  function closeModal() {
    setModalOpen(false)
    setEditingService(null)
  }

  function handleSaveService(fields) {
    if (editingService) {
      setServices((list) => list.map((s) => (s.id === editingService.id ? { ...s, ...fields } : s)))
      showToast('บันทึกการแก้ไขเรียบร้อยแล้ว')
    } else {
      const nextOrder = services.length + 1
      setServices((list) => [{ id: `svc-${Date.now()}`, order: nextOrder, active: true, status: { label: 'ปกติ', tone: 'green' }, ...fields }, ...list])
      showToast('บันทึกบริการเรียบร้อยแล้ว')
    }
    closeModal()
  }

  function toggleActive(service) {
    setServices((list) => list.map((s) => (s.id === service.id ? { ...s, active: !s.active } : s)))
  }

  function confirmDelete() {
    setServices((list) => list.filter((s) => s.id !== deletingService.id))
    showToast('ลบบริการเรียบร้อยแล้ว')
    setDeletingService(null)
  }

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <h1 className="page-title">บริการ</h1>

      <div className="toolbar-card">
        <div className="search-input-wrap" style={{ maxWidth: 890, margin: '0 auto 20px' }}>
          <IconSearch size={20} />
          <input
            className="search-input"
            placeholder="ค้นหาชื่อโรค / บริการ"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <div className="filter-row">
          <button className={`chip${noFilters ? ' active' : ''}`} onClick={resetFilters}>ทั้งหมด</button>

          <SelectChip label="เขต" value={district} onChange={(v) => { setDistrict(v); setPage(1) }} options={['ทั้งหมด', ...districts]} />
          <SelectChip label="แขวง" value={subdistrict} onChange={(v) => { setSubdistrict(v); setPage(1) }} options={['ทั้งหมด', ...subdistricts]} />
          <SelectChip label="ปี" value={year} onChange={setYear} options={YEARS} />
          <SelectChip label="วันที่" value={dateFilter} onChange={setDateFilter} options={DATE_FILTERS} />
          <SelectChip label="การสร้าง" value={sortBy} onChange={setSortBy} options={SORTS} />

          <div className="filter-spacer" />

          <button className="btn btn-primary btn-sm" onClick={openCreate}>
            <IconPlus size={16} />เพิ่มบริการ
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
            ไม่พบบริการที่ตรงกับตัวกรอง
          </div>
        ) : (
          <>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>ลำดับ</th>
                    <th>ประเภทการตรวจสุขภาพ</th>
                    <th>การใช้งาน</th>
                    <th>สถานะ</th>
                    <th>การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {pageServices.map((s) => (
                    <tr key={s.id}>
                      <td className="tabular">{s.order}</td>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>
                        <button
                          type="button"
                          className={`switch-sm ${s.active ? 'on' : 'off'}`}
                          title={s.active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                          onClick={() => toggleActive(s)}
                        >
                          <span className="switch-sm-dot" />
                        </button>
                      </td>
                      <td><span className={`badge badge-${s.status.tone}`}><span className="badge-dot" />{s.status.label}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="icon-btn" title="ดูข้อมูล" onClick={() => showToast('ฟีเจอร์นี้ยังไม่พร้อมใช้งาน')}>
                            <IconEye size={16} />
                          </button>
                          <button className="icon-btn" title="แก้ไข" onClick={() => openEdit(s)}>
                            <IconEdit size={16} />
                          </button>
                          <button className="icon-btn icon-btn-danger" title="ลบ" onClick={() => setDeletingService(s)}>
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
        <ServiceModal initial={editingService} onCancel={closeModal} onSave={handleSaveService} />
      )}

      {deletingService && (
        <ConfirmDeleteModal
          title="ลบบริการนี้ ?"
          itemLabel={deletingService.name}
          onCancel={() => setDeletingService(null)}
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
        {options.map((o) => <option key={o} value={o}>{o === 'ทั้งหมด' ? `${label}: ทั้งหมด` : o}</option>)}
      </select>
      <IconChevronDown size={13} />
    </div>
  )
}
