import { useMemo, useState } from 'react'
import { IconSort } from '../icons.jsx'
import GradeListRow from './GradeListRow.jsx'

export default function GradeListTable({ grades, onView, onEdit }) {
  const [sort, setSort] = useState({ key: null, dir: 1 })

  const sorted = useMemo(() => {
    if (!sort.key) return grades
    const copy = [...grades]
    copy.sort((a, b) => {
      const av = a[sort.key]
      const bv = b[sort.key]
      if (typeof av === 'number') return (av - bv) * sort.dir
      return String(av).localeCompare(String(bv), 'th') * sort.dir
    })
    return copy
  }, [grades, sort])

  function toggleSort(key) {
    setSort((cur) => ({ key, dir: cur.key === key ? cur.dir * -1 : 1 }))
  }
  function sortStyle(key) {
    if (sort.key !== key) return { color: 'var(--text-tertiary)' }
    return { color: 'var(--brand-700)', transform: sort.dir === 1 ? 'rotate(0deg)' : 'rotate(180deg)' }
  }

  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead>
          <tr>
            <th onClick={() => toggleSort('code')}><span className="th-inner">รหัสห้อง <IconSort style={sortStyle('code')} /></span></th>
            <th onClick={() => toggleSort('name')}><span className="th-inner">ชื่อชั้นเรียน <IconSort style={sortStyle('name')} /></span></th>
            <th onClick={() => toggleSort('surveyDate')}><span className="th-inner">วันที่สำรวจ <IconSort style={sortStyle('surveyDate')} /></span></th>
            <th onClick={() => toggleSort('studentCount')}><span className="th-inner">จำนวนนักเรียน <IconSort style={sortStyle('studentCount')} /></span></th>
            <th>การดำเนินการ</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((g) => (
            <GradeListRow key={g.code} grade={g} onView={onView} onEdit={onEdit} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
