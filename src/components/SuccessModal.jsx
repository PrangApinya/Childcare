export default function SuccessModal({ title, subtitle, onClose, closeLabel = 'ปิด' }) {
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal success-modal">
        <div className="success-modal-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
        <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={onClose}>{closeLabel}</button>
      </div>
    </div>
  )
}
