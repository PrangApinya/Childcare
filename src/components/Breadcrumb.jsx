import { IconHome, IconChevronRight } from './icons.jsx'

export default function Breadcrumb({ items }) {
  return (
    <nav className="crumbrow">
      <IconHome size={14} />
      {items.map((label, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <IconChevronRight size={12} />
            {isLast ? <span className="cur">{label}</span> : <a href="#">{label}</a>}
          </span>
        )
      })}
    </nav>
  )
}
