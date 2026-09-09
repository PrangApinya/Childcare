import { useState } from 'react'
import { IconPlus } from '../icons.jsx'

export default function TagInput({ tags, onAdd, onRemove, placeholder }) {
  const [value, setValue] = useState('')

  function add() {
    const v = value.trim()
    if (!v || tags.includes(v)) return
    onAdd(v)
    setValue('')
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="f-input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
        />
        <button className="btn btn-outline btn-sm" style={{ flexShrink: 0 }} onClick={add}>
          <IconPlus size={16} />เพิ่ม
        </button>
      </div>
      {tags.length > 0 && (
        <div className="badge-row" style={{ marginTop: 12 }}>
          {tags.map((t) => (
            <span key={t} className="tag-chip">
              {t}
              <button aria-label={`ลบ ${t}`} onClick={() => onRemove(t)}>×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
