import { useMemo, useState } from 'react'
import { IconSort } from '../icons.jsx'
import SchoolListRow from './SchoolListRow.jsx'

const SORT_FIELD = { code: 'code', name: 'name', lastSurvey: 'lastSurvey', studentCount: 'studentCount' }

export default function SchoolListTable({ schools, onView, onEdit }) {
  const [sort, setSort] = useState({ key: null, dir: 1 })

  const sorted = useMemo(() => {
    if (!sort.key) return schools
    const copy = [...schools]
    copy.sort((a, b) => {
      const av = a[sort.key]
      const bv = b[sort.key]
      if (typeof av === 'number') return (av - bv) * sort.dir
      return String(av).localeCompare(String(bv), 'th') * sort.dir
    })
    return copy
  }, [schools, sort])

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
            <th onClick={() => toggleSort(SORT_FIELD.code)}><span className="th-inner">รหัสโรงเรียน <IconSort style={sortStyle('code')} /></span></th>
            <th onClick={() => toggleSort(SORT_FIELD.name)}><span className="th-inner">ชื่อโรงเรียน <IconSort style={sortStyle('name')} /></span></th>
            <th onClick={() => toggleSort(SORT_FIELD.lastSurvey)}><span className="th-inner">วันที่สำรวจ <IconSort style={sortStyle('lastSurvey')} /></span></th>
            <th onClick={() => toggleSort(SORT_FIELD.studentCount)}><span className="th-inner">จำนวนนักเรียน <IconSort style={sortStyle('studentCount')} /></span></th>
            <th>การดำเนินการ</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s) => (
            <SchoolListRow key={s.id} school={s} onView={onView} onEdit={onEdit} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
