import { useMemo, useState } from 'react'
import { IconSort, IconEye } from '../icons.jsx'
import { schoolIconStyle } from './schoolColors.js'
import { generateServiceStatus } from '../../data/schools.js'

const SORT_FIELD = { code: 'code', name: 'name', lastSurvey: 'lastSurvey', studentCount: 'studentCount' }
const BADGE_CLASS = { green: 'badge-green', orange: 'badge-orange' }

export default function ServiceHistoryTable({ schools, kind, onView }) {
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
            <th>สถานะ</th>
            <th>การดำเนินการ</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((s) => {
            const status = generateServiceStatus(s, kind)
            return (
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
                <td className="tabular">{s.lastSurveyLabel}</td>
                <td className="tabular">{s.studentCount.toLocaleString('th-TH')}</td>
                <td><span className={`badge ${BADGE_CLASS[status.tone]}`}><span className="badge-dot" />{status.label}</span></td>
                <td>
                  <button className="icon-btn" title="ดูข้อมูล" onClick={() => onView(s)}>
                    <IconEye size={16} />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
