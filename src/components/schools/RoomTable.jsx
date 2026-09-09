import { useMemo, useState } from 'react'
import { IconSort, IconEye } from '../icons.jsx'

export default function RoomTable({ rooms, onViewRoom }) {
  const [sort, setSort] = useState({ key: null, dir: 1 })

  const sorted = useMemo(() => {
    if (!sort.key) return rooms
    const copy = [...rooms]
    copy.sort((a, b) => {
      const av = a[sort.key]
      const bv = b[sort.key]
      if (typeof av === 'number') return (av - bv) * sort.dir
      return String(av).localeCompare(String(bv), 'th') * sort.dir
    })
    return copy
  }, [rooms, sort])

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
            <th onClick={() => toggleSort('name')}><span className="th-inner">ชื่อห้องเรียน <IconSort style={sortStyle('name')} /></span></th>
            <th onClick={() => toggleSort('teacherName')}><span className="th-inner">ครูประจำชั้น <IconSort style={sortStyle('teacherName')} /></span></th>
            <th onClick={() => toggleSort('surveyDate')}><span className="th-inner">วันที่สำรวจ <IconSort style={sortStyle('surveyDate')} /></span></th>
            <th onClick={() => toggleSort('studentCount')}><span className="th-inner">จำนวนนักเรียน <IconSort style={sortStyle('studentCount')} /></span></th>
            <th>การดำเนินการ</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.code}>
              <td className="tabular">{r.code}</td>
              <td>{r.name}</td>
              <td>{r.teacherName}</td>
              <td className="tabular">{r.surveyDate}</td>
              <td className="tabular">{r.studentCount} คน</td>
              <td>
                <button className="icon-btn" title="ดูข้อมูลห้องเรียน" onClick={() => onViewRoom(r)}>
                  <IconEye size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
