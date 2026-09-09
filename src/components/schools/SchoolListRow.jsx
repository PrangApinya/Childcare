import { useState } from 'react'
import { IconEye, IconEdit, IconChevronDown } from '../icons.jsx'
import { schoolIconStyle } from './schoolColors.js'
import { generateGradeSummary } from '../../data/schools.js'

export default function SchoolListRow({ school, onView, onEdit }) {
  const [open, setOpen] = useState(false)
  const gradeRows = open ? generateGradeSummary(school) : []

  return (
    <>
      <tr>
        <td className="tabular">{school.code}</td>
        <td>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="school-av" style={{ width: 32, height: 32, fontSize: 12, borderRadius: '50%', ...schoolIconStyle(school.iconColor) }}>
              {school.initials}
            </div>
            <span style={{ fontWeight: 600 }}>{school.name}</span>
          </div>
        </td>
        <td className="tabular">{school.lastSurveyLabel}</td>
        <td className="tabular">{school.studentCount.toLocaleString('th-TH')}</td>
        <td>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="icon-btn" title="ดูข้อมูลโรงเรียน" onClick={() => onView(school)}>
              <IconEye size={16} />
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => onEdit(school)}>
              <IconEdit size={14} />แก้ไข
            </button>
          </div>
        </td>
      </tr>

      {open && (
        <tr className="list-row-sub">
          <td colSpan={5}>
            <table className="tbl tbl-nested">
              <thead>
                <tr>
                  <th>รหัสห้อง</th>
                  <th>ชื่อชั้นเรียน</th>
                  <th>วันที่สำรวจ</th>
                  <th>จำนวนนักเรียน</th>
                  <th>การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {gradeRows.map((g) => (
                  <tr key={g.code}>
                    <td className="tabular">{g.code}</td>
                    <td>{g.name}</td>
                    <td className="tabular">{g.surveyDate}</td>
                    <td className="tabular">{g.studentCount.toLocaleString('th-TH')} คน</td>
                    <td>
                      <button className="icon-btn" title="ดูข้อมูลชั้นเรียน" onClick={() => onView(school)}>
                        <IconEye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </td>
        </tr>
      )}

      <tr className="list-row-toggle-row">
        <td colSpan={5}>
          <button className="list-row-toggle" onClick={() => setOpen((v) => !v)}>
            {open ? 'ปิดการ์ด' : 'เปิดการ์ด เพื่อดูรายละเอียด'}
            <IconChevronDown size={13} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
          </button>
        </td>
      </tr>
    </>
  )
}
