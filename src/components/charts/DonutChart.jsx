export default function DonutChart({ segments }) {
  const r = 60
  const strokeWidth = 24
  const circumference = 2 * Math.PI * r
  let cumulative = 0

  return (
    <div className="dash-donut-wrap">
      <svg viewBox="0 0 160 160" className="dash-donut">
        <g transform="rotate(-90 80 80)">
          {segments.map((seg) => {
            const length = (seg.value / 100) * circumference
            const dasharray = `${length} ${circumference - length}`
            const dashoffset = -cumulative
            cumulative += length
            return (
              <circle
                key={seg.key}
                cx={80}
                cy={80}
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={dasharray}
                strokeDashoffset={dashoffset}
              />
            )
          })}
        </g>
      </svg>
      <div className="dash-donut-legend">
        {segments.map((seg) => (
          <div key={seg.key} className="dash-donut-legend-item">
            <span className="dash-donut-dot" style={{ background: seg.color }} />
            {seg.label}
          </div>
        ))}
      </div>
    </div>
  )
}
