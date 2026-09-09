import { IconAlertOctagon } from './icons.jsx'

export default function ConfirmDeleteModal({ title, itemLabel, consequence = 'จะถูกลบออกจาก Master data ถาวร', onCancel, onConfirm }) {
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="modal" style={{ maxWidth: 448 }}>
        <div className="confirm-modal-bd">
          <IconAlertOctagon size={32} className="confirm-modal-icon" />
          <h3>{title}</h3>
          <p>{itemLabel && <>&ldquo;{itemLabel}&rdquo; </>}{consequence}</p>
        </div>
        <div className="confirm-modal-ft">
          <button className="btn btn-outline btn-lg" onClick={onCancel}>ยกเลิก</button>
          <button className="btn btn-danger-solid btn-lg" onClick={onConfirm}>ลบข้อมูล</button>
        </div>
      </div>
    </div>
  )
}
