import { useState } from 'react'
import { IconUpload } from './icons.jsx'

const DOC_TYPES = ['ใบสมัครเข้าเรียน', 'ผลตรวจสุขภาพ', 'สำเนาทะเบียนบ้าน', 'อื่นๆ']

export default function UploadModal({ onCancel, onConfirm }) {
  const [docType, setDocType] = useState(DOC_TYPES[0])

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="modal">
        <div className="modal-hd"><h3>อัปโหลดเอกสาร</h3></div>
        <div className="modal-bd">
          <label className="f-label">ประเภทเอกสาร</label>
          <select className="f-input" style={{ marginBottom: 16 }} value={docType} onChange={(e) => setDocType(e.target.value)}>
            {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <label className="f-label">ไฟล์</label>
          <div className="dropzone">
            <IconUpload size={26} strokeWidth={1.6} style={{ margin: '0 auto 8px' }} />
            ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์<br />รองรับ PDF, JPG, PNG ขนาดไม่เกิน 10MB
          </div>
        </div>
        <div className="modal-ft">
          <button className="btn btn-neutral btn-sm" onClick={onCancel}>ยกเลิก</button>
          <button className="btn btn-primary btn-sm" onClick={() => onConfirm(docType)}>แนบไฟล์</button>
        </div>
      </div>
    </div>
  )
}
