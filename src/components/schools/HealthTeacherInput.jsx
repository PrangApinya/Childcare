import { useState } from 'react'
import { IconPlus, IconTrash } from '../icons.jsx'

// A school can have more than one ครูอนามัย (health-coordinator teacher) — this
// lets the form collect a growing list of name + ตำแหน่ง + เบอร์โทร instead of one field.
export default function HealthTeacherInput({ teachers, onAdd, onRemove }) {
  const [name, setName] = useState('')
  const [position, setPosition] = useState('')
  const [phone, setPhone] = useState('')

  function add() {
    const n = name.trim()
    if (!n) return
    onAdd({ name: n, position: position.trim(), phone: phone.trim() })
    setName('')
    setPosition('')
    setPhone('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); add() }
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input className="f-input" placeholder="ชื่อครูอนามัย" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={handleKeyDown} style={{ flex: 2 }} />
        <input className="f-input" placeholder="ตำแหน่ง" value={position} onChange={(e) => setPosition(e.target.value)} onKeyDown={handleKeyDown} style={{ flex: 1 }} />
        <input className="f-input" placeholder="เบอร์โทรศัพท์" value={phone} onChange={(e) => setPhone(e.target.value)} onKeyDown={handleKeyDown} style={{ flex: 1 }} />
        <button className="btn btn-outline btn-sm" style={{ flexShrink: 0 }} onClick={add}>
          <IconPlus size={16} />เพิ่ม
        </button>
      </div>
      {teachers.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          {teachers.map((t, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: '1px solid var(--border-default)', borderRadius: 8, background: 'var(--bg-surface)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.name}</span>
              {t.position && <span style={{ color: 'var(--text-secondary)' }}>{t.position}</span>}
              {t.phone && <span style={{ color: 'var(--text-tertiary)' }}>{t.phone}</span>}
              <button className="icon-btn icon-btn-danger" style={{ marginLeft: 'auto', width: 28, height: 28 }} aria-label={`ลบ ${t.name}`} onClick={() => onRemove(i)}>
                <IconTrash size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
