const CHART_W = 600
const CHART_H = 200
const PAD_L = 34
const PAD_R = 12
const PAD_T = 10
const PAD_B = 24
const Y_TICKS = [0, 25, 50, 75, 100]

export default function LineChart({ data }) {
  const plotW = CHART_W - PAD_L - PAD_R
  const plotH = CHART_H - PAD_T - PAD_B
  const xFor = (i) => PAD_L + (data.length === 1 ? 0 : (i / (data.length - 1)) * plotW)
  const yFor = (v) => PAD_T + plotH - (v / 100) * plotH
  const points = data.map((d, i) => `${xFor(i)},${yFor(d.value)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${CHART_W} ${CHART_H + 14}`} className="dash-linechart">
      {Y_TICKS.map((t) => (
        <g key={t}>
          <line x1={PAD_L} x2={CHART_W - PAD_R} y1={yFor(t)} y2={yFor(t)} className="dash-grid-line" />
          <text x={PAD_L - 8} y={yFor(t) + 4} className="dash-axis-label" textAnchor="end">{t}</text>
        </g>
      ))}
      <polyline points={points} className="dash-line-path" />
      {data.map((d, i) => (
        <circle key={d.label} cx={xFor(i)} cy={yFor(d.value)} r={4} className="dash-line-dot" />
      ))}
      {data.map((d, i) => (
        <text key={d.label} x={xFor(i)} y={CHART_H + 12} className="dash-axis-label" textAnchor="middle">{d.label}</text>
      ))}
    </svg>
  )
}
