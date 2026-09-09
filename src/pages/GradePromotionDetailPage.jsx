import { useMemo, useState } from 'react'
import {
  IconArrowLeft, IconSearch, IconChevronDown, IconGraduationCap,
} from '../components/icons.jsx'
import SuccessModal from '../components/SuccessModal.jsx'
import { schoolIconStyle } from '../components/schools/schoolColors.js'
import Pagination from '../components/Pagination.jsx'
import { GRADES } from '../data/schools.js'
import { generatePromotionRoster } from '../data/promotions.js'

const PAGE_SIZE = 20
const NEXT_SECTION_NUMBERS = [1, 2, 3, 4]
const STATUS_OPTIONS = ['เลื่อนชั้น', 'ไม่เลื่อนชั้น']

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

const THAI_MONTHS_ABBR = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
function todayThaiLabel() {
  const d = new Date()
  return `${d.getDate()} ${THAI_MONTHS_ABBR[d.getMonth()]} ${d.getFullYear() + 543}`
}

export default function GradePromotionDetailPage({ promotion, onBack, onConfirm }) {
  const roster = useMemo(() => generatePromotionRoster(promotion), [promotion.id])
  const [overrides, setOverrides] = useState({})
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState('ทั้งหมด')
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด')
  const [page, setPage] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)

  const rows = useMemo(() => roster.map((r) => {
    const o = overrides[r.id]
    return {
      ...r,
      promoted: o?.promoted ?? true,
      nextSection: o?.nextSection ?? r.nextSection,
      note: o?.note ?? '',
    }
  }), [roster, overrides])

  const totalCount = rows.length
  const promotedCount = rows.filter((r) => r.promoted).length
  const notPromotedCount = totalCount - promotedCount

  const noFilters = search === '' && gradeFilter === 'ทั้งหมด' && statusFilter === 'ทั้งหมด'

  const filtered = useMemo(() => rows.filter((r) => (
    (gradeFilter === 'ทั้งหมด' || r.currentGrade === gradeFilter)
    && (statusFilter === 'ทั้งหมด' || (statusFilter === 'เลื่อนชั้น' ? r.promoted : !r.promoted))
    && (search.trim() === '' || `${r.fullName} ${r.citizenId}`.toLowerCase().includes(search.trim().toLowerCase()))
  )), [rows, gradeFilter, statusFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function resetFilters() {
    setSearch('')
    setGradeFilter('ทั้งหมด')
    setStatusFilter('ทั้งหมด')
  }

  function patch(id, fields) {
    setOverrides((cur) => ({
      ...cur,
      [id]: { promoted: cur[id]?.promoted ?? true, nextSection: cur[id]?.nextSection ?? null, note: cur[id]?.note ?? '', ...fields },
    }))
  }

  function togglePromoted(row) {
    patch(row.id, { promoted: !row.promoted })
  }

  function handleConfirm() {
    setShowSuccess(true)
  }

  function handleSuccessClose() {
    setShowSuccess(false)
    onConfirm(promotion.id)
    onBack()
  }

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <div className="stu-topbar" style={{ maxHeight: 'none', opacity: 1, paddingBottom: 8 }}>
        <button className="btn btn-outline btn-sm" onClick={onBack}><IconArrowLeft size={16} />กลับ</button>
        <h1>{promotion.name}</h1>
      </div>

      <div className="checkup-summary-row">
        <div className="checkup-summary-card">
          <div className="checkup-summary-icon" style={{ background: '#DBEAFE', color: '#1D4ED8' }}><IconGraduationCap size={18} /></div>
          <div><div className="checkup-summary-n">{totalCount.toLocaleString('th-TH')}</div><div className="checkup-summary-l">จำนวนนักเรียนทั้งหมด</div></div>
        </div>
        <div className="checkup-summary-card">
          <div className="checkup-summary-icon" style={{ background: '#D1FAE5', color: '#065F46' }}><IconGraduationCap size={18} /></div>
          <div><div className="checkup-summary-n">{promotedCount.toLocaleString('th-TH')}</div><div className="checkup-summary-l">เลื่อนชั้น</div></div>
        </div>
        <div className="checkup-summary-card">
          <div className="checkup-summary-icon" style={{ background: '#FFEDD5', color: '#9A3412' }}><IconGraduationCap size={18} /></div>
          <div><div className="checkup-summary-n">{notPromotedCount.toLocaleString('th-TH')}</div><div className="checkup-summary-l">ไม่เลื่อนชั้น</div></div>
        </div>
      </div>

      <div className="toolbar-card">
        <div className="search-input-wrap">
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
          <SelectChip label="ชั้นเรียน" value={gradeFilter} onChange={(v) => { setGradeFilter(v); setPage(1) }} options={['ทั้งหมด', ...GRADES]} />
          <SelectChip label="สถานะการเลื่อนชั้น" value={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1) }} options={['ทั้งหมด', ...STATUS_OPTIONS]} />
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
                    <th>เลขที่</th>
                    <th>เลขประจำตัว</th>
                    <th>ชื่อ-สกุล</th>
                    <th>ชั้นเรียนปัจจุบัน</th>
                    <th>สถานะการเลื่อนชั้น</th>
                    <th>ชั้นเรียนใหม่</th>
                    <th>หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((r) => (
                    <tr key={r.id}>
                      <td className="tabular">{r.seatNo}</td>
                      <td className="tabular">{r.citizenId}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="school-av" style={{ width: 30, height: 30, fontSize: 11, borderRadius: '50%', ...schoolIconStyle(promotion.iconColor) }}>
                            {r.initials}
                          </div>
                          <span>{r.fullName}</span>
                        </div>
                      </td>
                      <td className="tabular">{r.currentSection}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <button
                            type="button"
                            className={`switch-sm ${r.promoted ? 'on' : 'off'}`}
                            title={r.promoted ? 'ไม่เลื่อนชั้น' : 'เลื่อนชั้น'}
                            onClick={() => togglePromoted(r)}
                          >
                            <span className="switch-sm-dot" />
                          </button>
                          <span style={{ fontWeight: 600, color: r.promoted ? 'var(--brand-700)' : 'var(--btn-danger-text)' }}>
                            {r.promoted ? 'เลื่อนชั้น' : 'ไม่เลื่อนชั้น'}
                          </span>
                        </div>
                      </td>
                      <td className="tabular">
                        {r.nextSection && r.promoted ? (
                          <div className="chip-select">
                            <select
                              value={r.nextSection}
                              onChange={(e) => patch(r.id, { nextSection: e.target.value })}
                            >
                              {NEXT_SECTION_NUMBERS.map((n) => {
                                const label = r.nextSection.replace(/\/\s*\d+$/, `/ ${n}`)
                                return <option key={n} value={label}>{label}</option>
                              })}
                            </select>
                            <IconChevronDown size={13} />
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)' }}>{r.nextSection ? r.currentSection : 'จบการศึกษา'}</span>
                        )}
                      </td>
                      <td>
                        <input
                          className="f-input"
                          placeholder="ระบุหมายเหตุ (ถ้ามี)"
                          value={r.note}
                          onChange={(e) => patch(r.id, { note: e.target.value })}
                        />
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

      <div className="form-footer-bar">
        <span className="draft-note"><span className="draft-dot" />ตรวจสอบข้อมูลให้ครบถ้วนก่อนยืนยันการเลื่อนชั้น</span>
        <div className="actions">
          <button className="btn btn-outline btn-sm" onClick={onBack}>กลับ</button>
          <button className="btn btn-primary btn-sm" onClick={handleConfirm}>ยืนยันการเลื่อนชั้น</button>
        </div>
      </div>

      {showSuccess && (
        <SuccessModal
          title="ยืนยันการเลื่อนชั้นสำเร็จ"
          subtitle={`บันทึก วันที่ ${todayThaiLabel()}`}
          onClose={handleSuccessClose}
        />
      )}
    </section>
  )
}
