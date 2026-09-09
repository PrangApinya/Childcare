import { useEffect, useMemo, useState } from 'react'
import {
  IconArrowLeft, IconSearch, IconChevronDown, IconSyringe, IconCheck,
} from '../components/icons.jsx'
import Pagination from '../components/Pagination.jsx'
import SuccessModal from '../components/SuccessModal.jsx'
import { generateSchoolRoster } from '../data/schools.js'
import { VACCINE_CATALOG, autoVaccineLotNumber } from '../data/services.js'

const PAGE_SIZE = 20
const SORTS = ['เรียงตามเลขที่', 'ชื่อ ก-ฮ', 'เลขประจำตัว']

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}
const THAI_MONTHS_ABBR = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
function todayThaiLabel() {
  const d = new Date()
  return `${d.getDate()} ${THAI_MONTHS_ABBR[d.getMonth()]} ${d.getFullYear() + 543}`
}
function nowTimeLabel() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')} น.`
}

export default function VaccineServicePage({ school, onBack, showToast }) {
  // เฉพาะห้องที่บันทึกไว้ในหน้าบันทึกกิจกรรม (ถ้ามี) และเฉพาะนักเรียนไทยที่มีเลขบัตรประชาชน 13 หลัก
  // ที่สามารถเบิกจ่ายได้ (คทง5 ครั้งที่ 5) — เด็กที่ไม่มีเลขบัตรประชาชนไทยจะไปบันทึกในประวัติวัคซีนแทน
  const [roster, setRoster] = useState(() => {
    const full = generateSchoolRoster(school).filter((s) => s.citizenId.length === 13)
    return school.checkupRoomNames?.length
      ? full.filter((s) => school.checkupRoomNames.includes(s.sectionName))
      : full
  })

  // ข้อมูลการให้บริการวัคซีนชุดนี้มาจากการตั้งค่าไว้แล้วในหน้า "บริการ" จึงแสดงเป็นข้อมูลอ่านอย่างเดียว
  const vaccine = VACCINE_CATALOG[0]
  const [lotNumber] = useState(() => autoVaccineLotNumber(vaccine.lotPrefix))
  const dose = vaccine.dose
  const serviceDateIso = school.checkupDateIso || todayIso()
  const serviceDateLabel = school.checkupDateLabel || todayThaiLabel()

  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState('ทั้งหมด')
  const [sectionFilter, setSectionFilter] = useState('ทั้งหมด')
  const [sortBy, setSortBy] = useState(SORTS[0])
  const [page, setPage] = useState(1)
  const [ticked, setTicked] = useState({})
  const [showSuccess, setShowSuccess] = useState(false)

  const gradeOptions = useMemo(() => [...new Set(roster.map((s) => s.gradeName))], [roster])
  const sectionOptions = useMemo(() => [...new Set(roster.map((s) => s.sectionName))], [roster])
  const noFilters = search === '' && gradeFilter === 'ทั้งหมด' && sectionFilter === 'ทั้งหมด'

  const filtered = useMemo(() => {
    let list = roster.filter((s) => (
      (gradeFilter === 'ทั้งหมด' || s.gradeName === gradeFilter)
      && (sectionFilter === 'ทั้งหมด' || s.sectionName === sectionFilter)
      && (search.trim() === '' || `${s.fullName} ${s.citizenId}`.toLowerCase().includes(search.trim().toLowerCase()))
    ))
    list = [...list]
    if (sortBy === 'ชื่อ ก-ฮ') list.sort((a, b) => a.fullName.localeCompare(b.fullName, 'th'))
    else if (sortBy === 'เลขประจำตัว') list.sort((a, b) => a.citizenId.localeCompare(b.citizenId))
    return list
  }, [roster, gradeFilter, sectionFilter, search, sortBy])

  useEffect(() => { setPage(1) }, [search, gradeFilter, sectionFilter, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageStudents = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const tickedCount = Object.values(ticked).filter(Boolean).length

  function resetFilters() {
    setSearch('')
    setGradeFilter('ทั้งหมด')
    setSectionFilter('ทั้งหมด')
  }

  function toggleTick(id) {
    setTicked((cur) => ({ ...cur, [id]: !cur[id] }))
  }
  function tickAllOnPage() {
    setTicked((cur) => {
      const next = { ...cur }
      pageStudents.forEach((s) => { next[s.id] = true })
      return next
    })
  }

  function handleSave() {
    const ids = Object.entries(ticked).filter(([, v]) => v).map(([id]) => id)
    if (ids.length === 0) {
      showToast('กรุณาทำเครื่องหมายนักเรียนที่ได้รับวัคซีนอย่างน้อย 1 คน')
      return
    }
    setRoster((list) => list.map((s) => (ticked[s.id] ? {
      ...s,
      vaccineGiven: { vaccineLabel: vaccine.label, lotNumber, dose, dateIso: serviceDateIso },
    } : s)))
    setShowSuccess(true)
  }

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <div className="stu-topbar" style={{ maxHeight: 'none', opacity: 1, paddingBottom: 8 }}>
        <button className="btn btn-outline btn-sm" onClick={onBack}><IconArrowLeft size={16} />กลับ</button>
        <h1>{school.name}</h1>
      </div>
      {school.checkupRoomNames?.length > 0 && (
        <div style={{ padding: '0 4px 12px', fontSize: 13, color: 'var(--text-tertiary)' }}>
          แสดงเฉพาะห้องที่บันทึกไว้ในหน้าบันทึกกิจกรรม: {school.checkupRoomNames.join(', ')}
        </div>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-hd">
          <IconSyringe size={16} />
          <h3 style={{ marginLeft: 8 }}>บันทึกการให้บริการวัคซีน</h3>
        </div>
        <div className="card-bd" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          <div>
            <label className="f-label">ชนิดวัคซีน</label>
            <div className="f-view">{vaccine.label}</div>
          </div>
          <div>
            <label className="f-label">Lot Number</label>
            <div className="f-view">{lotNumber}</div>
          </div>
          <div>
            <label className="f-label">ปริมาณที่ให้</label>
            <div className="f-view">{dose}</div>
          </div>
          <div>
            <label className="f-label">วันที่ให้บริการ</label>
            <div className="f-view">{serviceDateLabel}</div>
          </div>
        </div>
      </div>

      <div className="toolbar-card">
        <div className="search-input-wrap" style={{ maxWidth: 890, margin: '0 auto 20px' }}>
          <IconSearch size={20} />
          <input
            className="search-input"
            placeholder="ค้นหาชื่อ-สกุล / เลขประจำตัว"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-row">
          <button className={`chip${noFilters ? ' active' : ''}`} onClick={resetFilters}>ทั้งหมด</button>

          <SelectChip label="ชั้นเรียน" value={gradeFilter} onChange={setGradeFilter} options={['ทั้งหมด', ...gradeOptions]} />
          <SelectChip label="ห้องเรียน" value={sectionFilter} onChange={setSectionFilter} options={['ทั้งหมด', ...sectionOptions]} />
          <SelectChip label="การจัดเรียง" value={sortBy} onChange={setSortBy} options={SORTS} />

          <div className="filter-spacer" />

          <span style={{ fontSize: 13, color: 'var(--text-secondary)', marginRight: 8 }}>
            ทำเครื่องหมายแล้ว {tickedCount} คน
          </span>
          <button className="btn btn-outline btn-sm" onClick={tickAllOnPage}>
            <IconCheck size={16} />ทำเครื่องหมายทั้งหน้า
          </button>
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
                    <th>ชั้นเรียน</th>
                    <th>ห้องเรียน</th>
                    <th>เลขที่บัตรประชาชน</th>
                    <th>ชื่อ-สกุล</th>
                    <th>ได้รับวัคซีน</th>
                  </tr>
                </thead>
                <tbody>
                  {pageStudents.map((s) => (
                    <tr key={s.id}>
                      <td className="tabular">{s.seatNo}</td>
                      <td>{s.gradeName}</td>
                      <td>{s.sectionName}</td>
                      <td className="tabular">{s.citizenId}</td>
                      <td style={{ fontWeight: 600 }}>{s.fullName}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={ticked[s.id] ?? Boolean(s.vaccineGiven)}
                          onChange={() => toggleTick(s.id)}
                          style={{ width: 20, height: 20, cursor: 'pointer' }}
                          aria-label={`${s.fullName} ได้รับวัคซีน`}
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
        <span className="draft-note"><span className="draft-dot" />{vaccine.label} · Lot {lotNumber}</span>
        <div className="actions">
          <button className="btn btn-neutral btn-sm" onClick={onBack}>ยกเลิก</button>
          <button className="btn btn-primary btn-sm" onClick={handleSave}>บันทึก</button>
        </div>
      </div>

      {showSuccess && (
        <SuccessModal
          title="บันทึกข้อมูลสำเร็จ"
          subtitle={`บันทึก วันที่ ${todayThaiLabel()}  ${nowTimeLabel()}`}
          onClose={() => setShowSuccess(false)}
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
