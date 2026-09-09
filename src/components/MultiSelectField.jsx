import { useEffect, useRef, useState } from 'react'
import { IconChevronDown } from './icons.jsx'

export default function MultiSelectField({ options, values, onChange, placeholder }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  function toggle(opt) {
    onChange(values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt])
  }

  return (
    <div style={{ position: 'relative' }} ref={rootRef}>
      <button
        type="button"
        className="f-input"
        style={{ textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
      >
        <span style={{ color: values.length ? 'var(--input-text)' : 'var(--input-placeholder)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {values.length ? values.join(', ') : placeholder}
        </span>
        <IconChevronDown size={14} style={{ flexShrink: 0, color: 'var(--text-tertiary)' }} />
      </button>
      <div className={`dd${open ? ' open' : ''}`} style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, maxHeight: 220, overflowY: 'auto' }}>
        {options.map((opt) => (
          <button key={opt} type="button" className={`dd-item${values.includes(opt) ? ' active' : ''}`} onClick={() => toggle(opt)}>
            <input type="checkbox" checked={values.includes(opt)} readOnly style={{ marginRight: 6, pointerEvents: 'none' }} />
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}
