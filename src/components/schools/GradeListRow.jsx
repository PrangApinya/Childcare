import { useState } from 'react'
import { IconEye, IconEdit, IconChevronDown } from '../icons.jsx'
import { generateSections } from '../../data/schools.js'

export default function GradeListRow({ grade, onView, onEdit }) {
  const [open, setOpen] = useState(false)
  const sections = open ? generateSections(grade) : []

  return (
    <>
      <tr>
        <td className="tabular">{grade.code}</td>
        <td style={{ fontWeight: 600 }}>{grade.name}</td>
        <td className="tabular">{grade.surveyDate}</td>
        <td className="tabular">{grade.studentCount.toLocaleString('th-TH')}</td>
        <td>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="icon-btn" title="ดูข้อมูลชั้นเรียน" onClick={() => onView(grade)}>
              <IconEye size={16} />
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => onEdit(grade)}>
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
                  <th>ชื่อห้องเรียน</th>
                  <th>วันที่สำรวจ</th>
                  <th>จำนวนนักเรียน</th>
                  <th>การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((s) => (
                  <tr key={s.code}>
                    <td className="tabular">{s.code}</td>
                    <td>{s.name}</td>
                    <td className="tabular">{s.surveyDate}</td>
                    <td className="tabular">{s.studentCount.toLocaleString('th-TH')} คน</td>
                    <td>
                      <button className="icon-btn" title="ดูข้อมูลห้องเรียน" onClick={() => onView(grade, s)}>
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
