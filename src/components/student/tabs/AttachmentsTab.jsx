import { useState } from 'react'
import { IconUpload, IconDownload, IconFileText, IconImage } from '../../icons.jsx'
import UploadModal from '../../UploadModal.jsx'

const initialDocuments = [
  { id: 'd1', name: 'สูติบัตรนักเรียน.pdf', meta: 'อัปโหลดเมื่อ 16 พ.ค. 2568 · 812 KB', icon: 'file' },
  { id: 'd2', name: 'รูปถ่ายนักเรียน 1 นิ้ว.jpg', meta: 'อัปโหลดเมื่อ 16 พ.ค. 2568 · 240 KB', icon: 'image' },
  { id: 'd3', name: 'ผลตรวจสุขภาพประจำปี 2569.pdf', meta: 'อัปโหลดเมื่อ 15 พ.ค. 2569 · 480 KB', icon: 'file' },
]

export default function AttachmentsTab({ showToast }) {
  const [documents, setDocuments] = useState(initialDocuments)
  const [showUpload, setShowUpload] = useState(false)

  function handleConfirm(docType) {
    setDocuments((list) => [
      { id: `d${Date.now()}`, name: `${docType}.pdf`, meta: 'อัปโหลดเมื่อ 8 ก.ย. 2569 · เพิ่งเพิ่ม', icon: 'file' },
      ...list,
    ])
    setShowUpload(false)
    showToast('แนบเอกสารเรียบร้อยแล้ว')
  }

  return (
    <div className="card">
      <div className="card-hd">
        <div style={{ flex: 1 }}>
          <h3>เอกสารแนบ</h3>
          <p>ไฟล์และเอกสารประกอบของนักเรียนในระบบ</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowUpload(true)}>
          <IconUpload size={16} />แนบไฟล์
        </button>
      </div>
      <div>
        {documents.map((d) => (
          <div className="doc-row" key={d.id}>
            <div className="doc-ic">{d.icon === 'image' ? <IconImage size={18} /> : <IconFileText size={18} />}</div>
            <div className="doc-meta"><b>{d.name}</b><span>{d.meta}</span></div>
            <div className="sp">
              <button className="icon-btn" title="ดาวน์โหลด"><IconDownload size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {showUpload && (
        <UploadModal onCancel={() => setShowUpload(false)} onConfirm={handleConfirm} />
      )}
    </div>
  )
}
