import { useEffect, useRef, useState } from 'react'
import { IconPlus, IconUpload, IconDownload, IconFileText } from '../icons.jsx'

function downloadTemplate() {
  const header = 'ชื่อ-นามสกุล,เลขประจำตัวประชาชน,วันเกิด (วว/ดด/ปปปป),เพศ\n'
  const blob = new Blob([`﻿${header}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'แบบฟอร์มรายชื่อนักเรียน.csv'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function RoomRosterBuilder({
  gradeLevels, rooms, onAddRoom, onRemoveRoom, rosterFiles, onAddFiles, onRemoveFile,
  accept = '.xlsx,.xls,.csv', dropHint = 'ลากและวางไฟล์ หรือคลิกเพื่ออัปโหลด',
  sizeHint = 'รองรับไฟล์ Excel ขนาดไม่เกิน 10 MB เท่านั้น', showTemplate = true,
  showGradeSelect = true,
}) {
  const [grade, setGrade] = useState(gradeLevels[0] || '')
  const [roomName, setRoomName] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef(null)

  // ชั้นเรียนที่เลือกไว้อาจถูกลบออก หรือยังไม่มีชั้นเรียนตอนที่คอมโพเนนต์นี้ mount ครั้งแรก
  // (เช่น หน้าเพิ่มชั้นเรียนที่เริ่มจากไม่มีชั้นเรียนเลย) — sync ให้ชี้ไปยังตัวเลือกที่ยังใช้ได้เสมอ
  useEffect(() => {
    if (!gradeLevels.includes(grade)) setGrade(gradeLevels[0] || '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gradeLevels])

  function add() {
    const name = roomName.trim()
    if (!grade || !name) return
    onAddRoom({ grade, name })
  }

  function handleFiles(fileList) {
    const files = [...(fileList || [])]
    if (files.length === 0) return
    onAddFiles(files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      grade: grade || 'ยังไม่ระบุชั้นเรียน',
      room: roomName.trim() || 'ยังไม่ระบุห้องเรียน',
      name: file.name,
      sizeLabel: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
    })))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ display: 'flex', gap: 8 }}>
          {showGradeSelect && (
            <select className="f-input" style={{ maxWidth: 220 }} value={grade} onChange={(e) => setGrade(e.target.value)} disabled={gradeLevels.length === 0}>
              {gradeLevels.length === 0
                ? <option>เพิ่มชั้นเรียนก่อน</option>
                : gradeLevels.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          )}
          <input
            className="f-input"
            placeholder={showGradeSelect ? 'เพิ่มห้องเรียน เช่น 1/1' : 'เพิ่มห้องเรียน'}
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
            disabled={gradeLevels.length === 0}
          />
          <button className="btn btn-outline btn-sm" style={{ flexShrink: 0 }} onClick={add} disabled={gradeLevels.length === 0}>
            <IconPlus size={16} />เพิ่ม
          </button>
        </div>

        {rooms.length > 0 && (
          showGradeSelect ? (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {gradeLevels.filter((g) => rooms.some((r) => r.grade === g)).map((g) => (
                <div key={g} style={{ fontSize: 13 }}>
                  <span style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>{g}: </span>
                  <span className="badge-row" style={{ display: 'inline-flex', marginLeft: 6 }}>
                    {rooms.filter((r) => r.grade === g).map((r) => (
                      <span key={r.grade + r.name} className="tag-chip">
                        {r.name}
                        <button aria-label={`ลบห้อง ${r.name}`} onClick={() => onRemoveRoom(r)}>×</button>
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="badge-row" style={{ marginTop: 14 }}>
              {rooms.map((r) => (
                <span key={r.grade + r.name} className="tag-chip">
                  {r.name}
                  <button aria-label={`ลบห้อง ${r.name}`} onClick={() => onRemoveRoom(r)}>×</button>
                </span>
              ))}
            </div>
          )
        )}
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <label className="f-label" style={{ margin: 0 }}>อัพโหลดรายชื่อนักเรียน</label>
          {showTemplate && (
            <button className="btn btn-neutral btn-sm" onClick={downloadTemplate}>
              <IconDownload size={14} />Download Template
            </button>
          )}
        </div>

        <div
          className={`dropzone${dragOver ? ' drag-over' : ''}`}
          style={{ cursor: 'pointer' }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        >
          <IconUpload size={26} strokeWidth={1.6} style={{ margin: '0 auto 8px' }} />
          <div style={{ color: 'var(--text-brand)', fontWeight: 600, marginBottom: 4 }}>{dropHint}</div>
          <button className="btn btn-outline btn-sm" style={{ margin: '8px auto' }} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}>
            เลือกไฟล์
          </button>
          <div>{sizeHint}{showGradeSelect ? ` · แนบได้สำหรับ ${grade || '—'}${roomName ? ` / ${roomName}` : ''}` : ''}</div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple
            style={{ display: 'none' }}
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {rosterFiles.length > 0 && (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rosterFiles.map((rf) => (
              <div className="roster-file-row" key={rf.id}>
                <span className="roster-file-tag">{rf.grade}</span>
                <span className="roster-file-tag">{rf.room}</span>
                <IconFileText size={18} style={{ color: 'var(--text-brand)', flexShrink: 0 }} />
                <div className="doc-meta" style={{ flex: 1, minWidth: 0 }}>
                  <b>{rf.name}</b>
                  <span>{rf.sizeLabel}</span>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => onRemoveFile(rf.id)}>ลบ</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
