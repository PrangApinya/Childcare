import { useEffect, useRef, useState } from 'react'

export default function TabBar({ tabs, active, onChange }) {
  const btnRefs = useRef({})
  const [ink, setInk] = useState({ width: 0, left: 0 })

  useEffect(() => {
    function measure() {
      const el = btnRefs.current[active]
      if (el) setInk({ width: el.offsetWidth, left: el.offsetLeft })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [active])

  return (
    <div className="tabbar-wrap">
      <div className="tabbar" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            ref={(el) => { btnRefs.current[t.key] = el }}
            className="tab"
            role="tab"
            aria-selected={active === t.key}
            onClick={() => onChange(t.key)}
          >
            {t.icon && <t.icon size={16} />}
            {t.label}
          </button>
        ))}
        <div className="tab-ink" style={{ width: ink.width, transform: `translateX(${ink.left}px)` }} />
      </div>
    </div>
  )
}
