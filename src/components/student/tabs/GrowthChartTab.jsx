import { IconClipboardCheck } from '../../icons.jsx'

const W = 860
const H = 340
const M = { left: 54, right: 54, top: 24, bottom: 64 }
const PLOT_W = W - M.left - M.right
const PLOT_H = H - M.top - M.bottom
const WEIGHT_MAX = 40
const HEIGHT_MIN = 100
const HEIGHT_MAX = 140

const WEIGHT_COLOR = 'var(--brand-700)'
const HEIGHT_COLOR = '#CA8A04'

function xAt(i, n) {
  return M.left + (n === 1 ? 0 : (i / (n - 1)) * PLOT_W)
}
function yWeight(v) {
  return M.top + PLOT_H - (v / WEIGHT_MAX) * PLOT_H
}
function yHeight(v) {
  return M.top + PLOT_H - ((v - HEIGHT_MIN) / (HEIGHT_MAX - HEIGHT_MIN)) * PLOT_H
}

export default function GrowthChartTab({ records }) {
  const n = records.length
  const rows = [0, 1, 2, 3, 4] // top(4) -> bottom(0), 5 gridlines
  const weightPoints = records.map((r, i) => `${xAt(i, n)},${yWeight(r.weight)}`).join(' ')
  const heightPoints = records.map((r, i) => `${xAt(i, n)},${yHeight(r.height)}`).join(' ')

  return (
    <>
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-hd"><h3>น้ำหนัก (กก.) และส่วนสูง (ซม.) ตามปีการศึกษา</h3></div>
        <div className="card-bd">
          <div style={{ overflowX: 'auto' }}>
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 560, height: 'auto' }} role="img" aria-label="กราฟน้ำหนักและส่วนสูงตามปีการศึกษา">
              {rows.map((r) => {
                const y = M.top + (r / 4) * PLOT_H
                const weightLabel = WEIGHT_MAX - r * (WEIGHT_MAX / 4)
                const heightLabel = HEIGHT_MAX - r * ((HEIGHT_MAX - HEIGHT_MIN) / 4)
                return (
                  <g key={r}>
                    <line x1={M.left} y1={y} x2={W - M.right} y2={y} stroke="var(--border-default)" strokeWidth="1" />
                    <text x={M.left - 12} y={y + 4} textAnchor="end" fontSize="11" fill="var(--text-tertiary)">{weightLabel}</text>
                    <text x={W - M.right + 12} y={y + 4} textAnchor="start" fontSize="11" fill="var(--text-tertiary)">{heightLabel}</text>
                  </g>
                )
              })}

              <polyline points={weightPoints} fill="none" stroke={WEIGHT_COLOR} strokeWidth="2.5" />
              <polyline points={heightPoints} fill="none" stroke={HEIGHT_COLOR} strokeWidth="2.5" />

              {records.map((r, i) => (
                <g key={`w${i}`}>
                  <circle cx={xAt(i, n)} cy={yWeight(r.weight)} r="5" fill="var(--bg-surface)" stroke={WEIGHT_COLOR} strokeWidth="2.5" />
                  <circle cx={xAt(i, n)} cy={yHeight(r.height)} r="5" fill="var(--bg-surface)" stroke={HEIGHT_COLOR} strokeWidth="2.5" />
                </g>
              ))}

              {records.map((r, i) => (
                <g key={`x${i}`}>
                  <text x={xAt(i, n)} y={H - 40} textAnchor="middle" fontSize="12" fontWeight="600" fill="var(--text-primary)">ปีการศึกษา {r.year}</text>
                  <text x={xAt(i, n)} y={H - 22} textAnchor="middle" fontSize="11" fill="var(--text-tertiary)">{r.grade}</text>
                </g>
              ))}
            </svg>
          </div>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 4 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
              <span style={{ width: 16, height: 2, background: WEIGHT_COLOR, display: 'inline-block' }} />น้ำหนัก (กก.)
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
              <span style={{ width: 16, height: 2, background: HEIGHT_COLOR, display: 'inline-block' }} />ส่วนสูง (ซม.)
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-hd"><IconClipboardCheck size={16} /><h3 style={{ marginLeft: 8 }}>ประวัติการบันทึก น้ำหนัก ส่วนสูง</h3></div>
        <div className="card-bd" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...records].reverse().map((r) => (
            <div key={r.year} className="roster-file-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 3 }}>วันที่ / เวลา</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{r.dateLabel}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 3 }}>น้ำหนัก (ก.ก.)</div>
                <div className="tabular" style={{ fontSize: 14, fontWeight: 600 }}>{r.weight} ก.ก.</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 3 }}>ส่วนสูง (ซ.ม.)</div>
                <div className="tabular" style={{ fontSize: 14, fontWeight: 600 }}>{r.height} ซ.ม.</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 3 }}>ภาวะโภชนาการ</div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{r.nutrition}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
