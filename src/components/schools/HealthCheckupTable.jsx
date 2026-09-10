import { useMemo, useState } from 'react'
import { IconSort } from '../icons.jsx'
import { schoolIconStyle } from './schoolColors.js'

const SORT_FIELD = { code: 'code', name: 'name', checkupDate: 'checkupDateIso', studentCount: 'studentCount' }

export default function HealthCheckupTable({ schools, onCheckup }) {
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
            <th onClick={() => toggleSort(SORT_FIELD.checkupDate)}><span className="th-inner">วันที่ตรวจ <IconSort style={sortStyle('checkupDateIso')} /></span></th>
            <th>กิจกรรมที่จะทำ</th>
            <th onClick={() => toggleSort(SORT_FIELD.studentCount)}><span className="th-inner">จำนวนนักเรียน <IconSort style={sortStyle('studentCount')} /></span></th>
            <th>การดำเนินการ</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s) => (
            <tr key={s.id}>
              <td className="tabular">{s.code}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="school-av" style={{ width: 32, height: 32, fontSize: 12, borderRadius: '50%', ...schoolIconStyle(s.iconColor) }}>
                    {s.initials}
                  </div>
                  <span style={{ fontWeight: 600 }}>{s.name}</span>
                </div>
              </td>
              <td className="tabular">{s.checkupDateLabel}</td>
              <td><span className="badge badge-green"><span className="badge-dot" />{s.checkupActivity}</span></td>
              <td className="tabular">{s.studentCount.toLocaleString('th-TH')}</td>
              <td>
                <button className="btn btn-primary btn-sm" onClick={() => onCheckup(s)}>
                  {s.checkupActivity}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
