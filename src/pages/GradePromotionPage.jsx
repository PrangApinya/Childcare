import { useMemo, useState } from 'react'
import {
  IconSearch, IconChevronDown, IconUpload, IconGridView, IconListView, IconSort, IconEye,
} from '../components/icons.jsx'
import { schoolIconStyle } from '../components/schools/schoolColors.js'
import Pagination from '../components/Pagination.jsx'
import GradePromotionDetailPage from './GradePromotionDetailPage.jsx'
import { districts, subdistricts } from '../data/schools.js'
import { gradePromotions as initialGradePromotions, PROMOTION_STATUS_OPTIONS } from '../data/promotions.js'

const PAGE_SIZE = 20
const SORT_FIELD = { code: 'code', name: 'name', studentCount: 'studentCount', status: 'status' }

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

export default function GradePromotionPage({ showToast }) {
  const [rows, setRows] = useState(() => initialGradePromotions)
  const [viewingPromotion, setViewingPromotion] = useState(null)
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('ทั้งหมด')
  const [subdistrict, setSubdistrict] = useState('ทั้งหมด')
  const [status, setStatus] = useState('ทั้งหมด')
  const [viewMode, setViewMode] = useState('list')
  const [sort, setSort] = useState({ key: null, dir: 1 })
  const [page, setPage] = useState(1)

  const noFilters = search === '' && district === 'ทั้งหมด' && subdistrict === 'ทั้งหมด' && status === 'ทั้งหมด'

  const filtered = useMemo(() => {
    let list = rows.filter((p) => (
      (district === 'ทั้งหมด' || p.district === district)
      && (subdistrict === 'ทั้งหมด' || p.subdistrict === subdistrict)
      && (status === 'ทั้งหมด' || p.status.label === status)
      && (search.trim() === '' || `${p.name} ${p.district} ${p.subdistrict}`.toLowerCase().includes(search.trim().toLowerCase()))
    ))
    if (sort.key) {
      list = [...list]
      list.sort((a, b) => {
        const av = sort.key === 'status' ? a.status.label : a[sort.key]
        const bv = sort.key === 'status' ? b.status.label : b[sort.key]
        if (typeof av === 'number') return (av - bv) * sort.dir
        return String(av).localeCompare(String(bv), 'th') * sort.dir
      })
    }
    return list
  }, [rows, search, district, subdistrict, status, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function resetFilters() {
    setSearch('')
    setDistrict('ทั้งหมด')
    setSubdistrict('ทั้งหมด')
    setStatus('ทั้งหมด')
  }

  function toggleSort(key) {
    setSort((cur) => ({ key, dir: cur.key === key ? cur.dir * -1 : 1 }))
    setPage(1)
  }
  function sortStyle(key) {
    if (sort.key !== key) return { color: 'var(--text-tertiary)' }
    return { color: 'var(--brand-700)', transform: sort.dir === 1 ? 'rotate(0deg)' : 'rotate(180deg)' }
  }

  function handleExport() {
    const header = 'รหัสโรงเรียน,ชื่อโรงเรียน,ปีการศึกษา,จำนวนนักเรียนทั้งหมด,สถานะการเลื่อนชั้น\n'
    const body = filtered.map((p) => `${p.code},${p.name},${p.yearLabel},${p.studentCount},${p.status.label}`).join('\n')
    const blob = new Blob([`﻿${header}${body}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'การเลื่อนชั้น.csv'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showToast('นำออกเอกสารเรียบร้อยแล้ว')
  }

  function handleConfirmPromotion(id) {
    setRows((cur) => cur.map((p) => (p.id === id ? { ...p, status: { label: 'เสร็จสิ้น', tone: 'green' } } : p)))
    showToast('ยืนยันการเลื่อนชั้นเรียบร้อยแล้ว')
  }

  if (viewingPromotion) {
    return (
      <GradePromotionDetailPage
        promotion={viewingPromotion}
        onBack={() => setViewingPromotion(null)}
        onConfirm={handleConfirmPromotion}
      />
    )
  }

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <h1 className="page-title">การเลื่อนชั้น</h1>

      <div className="toolbar-card">
        <div className="search-input-wrap">
          <IconSearch size={20} />
          <input
            className="search-input"
            placeholder="ค้นหาชื่อโรงเรียน / เขต / แขวง"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <div className="filter-row">
          <button className={`chip${noFilters ? ' active' : ''}`} onClick={resetFilters}>ทั้งหมด</button>

          <SelectChip label="เขต" value={district} onChange={(v) => { setDistrict(v); setPage(1) }} options={['ทั้งหมด', ...districts]} />
          <SelectChip label="แขวง" value={subdistrict} onChange={(v) => { setSubdistrict(v); setPage(1) }} options={['ทั้งหมด', ...subdistricts]} />
          <SelectChip label="สถานะ" value={status} onChange={(v) => { setStatus(v); setPage(1) }} options={['ทั้งหมด', ...PROMOTION_STATUS_OPTIONS]} />

          <div className="filter-spacer" />

          <button className="btn btn-outline btn-sm" onClick={handleExport}>
            <IconUpload size={16} />นำออกเอกสาร
          </button>
          <div className="view-toggle">
            <span className="view-toggle-label">มุมมอง</span>
            <button className={viewMode === 'card' ? 'active' : ''} onClick={() => { setViewMode('card'); showToast('ฟีเจอร์นี้ยังไม่พร้อมใช้งาน') }} title="มุมมองการ์ด"><IconGridView size={16} /></button>
            <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} title="มุมมองรายการ"><IconListView size={16} /></button>
          </div>
        </div>
      </div>

      <div className="card">
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>
            ไม่พบโรงเรียนที่ตรงกับตัวกรอง
          </div>
        ) : (
          <>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th onClick={() => toggleSort(SORT_FIELD.code)}><span className="th-inner">รหัสโรงเรียน <IconSort style={sortStyle('code')} /></span></th>
                    <th onClick={() => toggleSort(SORT_FIELD.name)}><span className="th-inner">ชื่อโรงเรียน <IconSort style={sortStyle('name')} /></span></th>
                    <th>ปีการศึกษา</th>
                    <th onClick={() => toggleSort(SORT_FIELD.studentCount)}><span className="th-inner">จำนวนนักเรียนทั้งหมด <IconSort style={sortStyle('studentCount')} /></span></th>
                    <th onClick={() => toggleSort(SORT_FIELD.status)}><span className="th-inner">สถานะการเลื่อนชั้น <IconSort style={sortStyle('status')} /></span></th>
                    <th>การดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((p) => (
                    <tr key={p.id}>
                      <td className="tabular">{p.code}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="school-av" style={{ width: 32, height: 32, fontSize: 12, borderRadius: '50%', ...schoolIconStyle(p.iconColor) }}>
                            {p.initials}
                          </div>
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                        </div>
                      </td>
                      <td className="tabular">{p.yearLabel}</td>
                      <td className="tabular">{p.studentCount.toLocaleString('th-TH')}</td>
                      <td><span className={`badge badge-${p.status.tone}`}><span className="badge-dot" />{p.status.label}</span></td>
                      <td>
                        <button className="icon-btn" title="ดูข้อมูล" onClick={() => setViewingPromotion(p)}>
                          <IconEye size={16} />
                        </button>
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
