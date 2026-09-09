import { useMemo, useState } from 'react'
import {
  IconArrowLeft, IconSearch, IconChevronDown, IconUpload, IconGridView, IconListView,
  IconClipboardCheck, IconCalendar, IconSyringe,
} from '../components/icons.jsx'
import Pagination from '../components/Pagination.jsx'
import TabBar from '../components/TabBar.jsx'
import {
  generateCheckupDetailRoster, generateServiceDetailSummary, CHECKUP_CONDITIONS,
  generateVaccineDetailRoster, generateVaccineDetailSummary, VACCINE_TAB_DEFS,
} from '../data/schools.js'

const PAGE_SIZE = 20
const SORTS = ['เรียงตามวันที่', 'ชื่อ ก-ฮ', 'เลขประจำตัว']
const CHECKUP_STATUS_FILTERS = ['ตรวจแล้ว', 'รอดำเนินการ']
const VACCINE_STATUS_FILTERS = ['ฉีดแล้ว', 'รอฉีด', 'เกินกำหนด']
const CHECKUP_TABS = [{ key: 'all', label: 'ทั้งหมด' }, ...CHECKUP_CONDITIONS]
const VACCINE_TABS = [{ key: 'all', label: 'ทั้งหมด' }, ...VACCINE_TAB_DEFS]
const GENERIC_TABS = [{ key: 'all', label: 'ทั้งหมด' }]
// ให้ตรงกับหมวดตรวจสุขภาพในหน้าข้อมูลสุขภาพของนักเรียน (StudentProfilePage) — dental/development/
// mental ยังไม่มีชุดข้อมูล mock เฉพาะทางระดับโรงเรียน จึงใช้โครงสร้างเดียวกับ "ตรวจสุขภาพทั่วไป"
// (ตรวจแล้ว/รอดำเนินการ) ไปพลางก่อน
const KIND_META = {
  checkup: { label: 'ตรวจสุขภาพทั่วไป' },
  dental: { label: 'ตรวจทันตกรรม' },
  development: { label: 'การตรวจพัฒนาการ' },
  mental: { label: 'สุขภาพจิต' },
  vaccine: { label: 'ฉีดวัคซีน' },
}
const VACCINE_BADGE = {
  done: { label: 'ฉีดแล้ว', cls: 'badge-green' },
  pending: { label: 'รอฉีด', cls: 'badge-orange' },
  overdue: { label: 'เกินกำหนด', cls: 'badge-red' },
}

function abbrGrade(gradeName) {
  const n = gradeName.match(/\d+/)?.[0]
  return n ? `ป.${n}` : gradeName
}

export default function ServiceHistoryDetailPage({ school, kind = 'checkup', onBack, showToast }) {
  const isVaccine = kind === 'vaccine'
  const isCheckup = kind === 'checkup'
  const kindLabel = KIND_META[kind]?.label || KIND_META.checkup.label
  const roster = useMemo(
    () => (isVaccine ? generateVaccineDetailRoster(school) : generateCheckupDetailRoster(school)),
    [school, isVaccine]
  )
  const summary = useMemo(
    () => (isVaccine ? generateVaccineDetailSummary(school) : generateServiceDetailSummary(school)),
    [school, isVaccine]
  )
  const tabs = isVaccine ? VACCINE_TABS : isCheckup ? CHECKUP_TABS : GENERIC_TABS
  const statusFilters = isVaccine ? VACCINE_STATUS_FILTERS : CHECKUP_STATUS_FILTERS

  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState('ทั้งหมด')
  const [sectionFilter, setSectionFilter] = useState('ทั้งหมด')
  const [sortBy, setSortBy] = useState(SORTS[0])
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด')
  const [viewMode, setViewMode] = useState('list')
  const [page, setPage] = useState(1)

  const gradeOptions = useMemo(() => [...new Set(roster.map((s) => s.gradeName))], [roster])
  const sectionOptions = useMemo(() => [...new Set(roster.map((s) => s.sectionName))], [roster])

  const noFilters = search === '' && gradeFilter === 'ทั้งหมด' && sectionFilter === 'ทั้งหมด'

  function matchesTab(s) {
    if (activeTab === 'all') return true
    return isVaccine ? s.doseKey === activeTab : s.condition === activeTab
  }
  function matchesStatus(s) {
    if (statusFilter === 'ทั้งหมด') return true
    if (isVaccine) return VACCINE_BADGE[s.status].label === statusFilter
    return statusFilter === 'ตรวจแล้ว' ? s.done : !s.done
  }

  const filtered = useMemo(() => {
    let list = roster.filter((s) => (
      matchesTab(s)
      && (gradeFilter === 'ทั้งหมด' || s.gradeName === gradeFilter)
      && (sectionFilter === 'ทั้งหมด' || s.sectionName === sectionFilter)
      && matchesStatus(s)
      && (search.trim() === '' || `${s.fullName} ${s.citizenId}`.toLowerCase().includes(search.trim().toLowerCase()))
    ))
    list = [...list]
    if (sortBy === 'ชื่อ ก-ฮ') list.sort((a, b) => a.fullName.localeCompare(b.fullName, 'th'))
    else if (sortBy === 'เลขประจำตัว') list.sort((a, b) => a.citizenId.localeCompare(b.citizenId))
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roster, activeTab, gradeFilter, sectionFilter, statusFilter, search, sortBy, isVaccine])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageStudents = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function resetFilters() {
    setSearch('')
    setGradeFilter('ทั้งหมด')
    setSectionFilter('ทั้งหมด')
    setPage(1)
  }

  function handleViewMode(mode) {
    if (mode === 'card') { showToast('ฟีเจอร์นี้ยังไม่พร้อมใช้งาน'); return }
    setViewMode(mode)
  }

  function statusLabel(s) {
    return isVaccine ? VACCINE_BADGE[s.status].label : (s.done ? 'ตรวจแล้ว' : 'รอดำเนินการ')
  }

  function handleExport() {
    const header = 'วันที่/เวลา,ชั้นเรียน,ห้องเรียน,เลขบัตรประชาชน,ชื่อ-สกุล,สถานะ\n'
    const body = filtered.map((s) => `${s.recordedAtLabel},${s.gradeName},${s.sectionName},${s.citizenId},${s.fullName},${statusLabel(s)}`).join('\n')
    const blob = new Blob([`﻿${header}${body}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${school.name}-${kindLabel}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showToast('นำออกเอกสารเรียบร้อยแล้ว')
  }

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <div className="stu-topbar" style={{ maxHeight: 'none', opacity: 1, paddingBottom: 8 }}>
        <button className="btn btn-outline btn-sm" onClick={onBack}><IconArrowLeft size={16} />กลับ</button>
        <h1>{school.name}</h1>
      </div>

      <div className="checkup-summary-row">
        {isVaccine ? (
          <>
            <div className="checkup-summary-card">
              <div className="checkup-summary-icon" style={{ background: '#CCFBF1', color: '#0F766E' }}><IconSyringe size={18} /></div>
              <div><div className="checkup-summary-n">{summary.done.toLocaleString('th-TH')}</div><div className="checkup-summary-l">ฉีดสำเร็จ</div></div>
            </div>
            <div className="checkup-summary-card">
              <div className="checkup-summary-icon" style={{ background: '#FEF3C7', color: '#92400E' }}><IconSyringe size={18} /></div>
              <div><div className="checkup-summary-n">{summary.pending.toLocaleString('th-TH')}</div><div className="checkup-summary-l">รอฉีด</div></div>
            </div>
            <div className="checkup-summary-card">
              <div className="checkup-summary-icon" style={{ background: '#FEE2E2', color: '#991B1B' }}><IconSyringe size={18} /></div>
              <div><div className="checkup-summary-n">{summary.overdue.toLocaleString('th-TH')}</div><div className="checkup-summary-l">เกินกำหนด</div></div>
            </div>
          </>
        ) : (
          <>
            <div className="checkup-summary-card">
              <div className="checkup-summary-icon" style={{ background: '#CCFBF1', color: '#0F766E' }}><IconClipboardCheck size={18} /></div>
              <div><div className="checkup-summary-n">{summary.done.toLocaleString('th-TH')}</div><div className="checkup-summary-l">ตรวจเสร็จ</div></div>
            </div>
            <div className="checkup-summary-card">
              <div className="checkup-summary-icon" style={{ background: '#FEF3C7', color: '#92400E' }}><IconClipboardCheck size={18} /></div>
              <div><div className="checkup-summary-n">{summary.pending.toLocaleString('th-TH')}</div><div className="checkup-summary-l">รอดำเนินการ</div></div>
            </div>
            <div className="checkup-summary-card">
              <div className="checkup-summary-icon" style={{ background: '#CCFBF1', color: '#0F766E' }}><IconClipboardCheck size={18} /></div>
              <div><div className="checkup-summary-n">{summary.normal.toLocaleString('th-TH')}</div><div className="checkup-summary-l">ปกติ</div></div>
            </div>
            <div className="checkup-summary-card">
              <div className="checkup-summary-icon" style={{ background: '#FEE2E2', color: '#991B1B' }}><IconClipboardCheck size={18} /></div>
              <div><div className="checkup-summary-n">{summary.abnormal.toLocaleString('th-TH')}</div><div className="checkup-summary-l">ไม่ปกติ</div></div>
            </div>
          </>
        )}
      </div>

      <TabBar tabs={tabs} active={activeTab} onChange={(k) => { setActiveTab(k); setPage(1) }} />

      <div className="toolbar-card" style={{ marginTop: 20 }}>
        <div className="search-input-wrap" style={{ maxWidth: 890, margin: '0 auto 20px' }}>
          <IconSearch size={20} />
          <input
            className="search-input"
            placeholder="ค้นหาชื่อ-สกุล / เลขประจำตัว"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <div className="filter-row">
          <button className={`chip${noFilters ? ' active' : ''}`} onClick={resetFilters}>ทั้งหมด</button>

          <SelectChip label="ชั้นเรียน" value={gradeFilter} onChange={(v) => { setGradeFilter(v); setPage(1) }} options={['ทั้งหมด', ...gradeOptions]} />
          <SelectChip label="ห้องเรียน" value={sectionFilter} onChange={(v) => { setSectionFilter(v); setPage(1) }} options={['ทั้งหมด', ...sectionOptions]} />
          <SelectChip label="การจัดเรียง" value={sortBy} onChange={setSortBy} options={SORTS} />
          <SelectChip label="สถานะ" value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1) }} options={['ทั้งหมด', ...statusFilters]} />

          <div className="filter-spacer" />

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
                    <th>วันที่ / เวลา</th>
                    <th>ชั้นเรียน</th>
                    <th>ห้องเรียน</th>
                    <th>เลขบัตรประชาชน</th>
                    <th>ชื่อ-สกุล</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {pageStudents.map((s) => (
                    <tr key={s.id}>
                      <td className="tabular"><IconCalendar size={13} style={{ marginRight: 6, verticalAlign: -2, color: 'var(--text-tertiary)' }} />{s.recordedAtLabel}</td>
                      <td>{abbrGrade(s.gradeName)}</td>
                      <td className="tabular">{s.sectionName.split('/').pop().trim()}</td>
                      <td className="tabular">{s.citizenId}</td>
                      <td style={{ fontWeight: 600 }}>{s.fullName}</td>
                      <td>
                        <span className={`badge ${isVaccine ? VACCINE_BADGE[s.status].cls : (s.done ? 'badge-green' : 'badge-orange')}`}>
                          <span className="badge-dot" />{statusLabel(s)}
                        </span>
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
