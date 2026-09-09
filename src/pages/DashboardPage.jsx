import { IconBell } from '../components/icons.jsx'
import LineChart from '../components/charts/LineChart.jsx'
import DonutChart from '../components/charts/DonutChart.jsx'
import { DASHBOARD_STATS, SCREENING_TREND, RESULT_BREAKDOWN, DASHBOARD_ALERTS } from '../data/dashboard.js'

export default function DashboardPage() {
  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <div className="dash-stat-grid">
        {DASHBOARD_STATS.map((s) => (
          <div key={s.key} className="card dash-stat-card">
            <div className="dash-stat-label">{s.label}</div>
            <div className="dash-stat-value">{s.value}</div>
            <div className={`dash-stat-sub dash-stat-sub-${s.tone}`}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="dash-chart-grid">
        <div className="card dash-chart-card">
          <h3 className="dash-card-title">อัตราการตรวจคัดกรองรายเดือน (%)</h3>
          <LineChart data={SCREENING_TREND} />
        </div>
        <div className="card dash-chart-card">
          <h3 className="dash-card-title">สัดส่วนผลตรวจ</h3>
          <DonutChart segments={RESULT_BREAKDOWN} />
        </div>
      </div>

      <div className="card dash-alert-card">
        <h3 className="dash-card-title">รายการแจ้งเตือน</h3>
        <div className="dash-alert-list">
          {DASHBOARD_ALERTS.map((a) => (
            <div key={a.id} className="dash-alert-row">
              <span className="dash-alert-icon"><IconBell size={15} /></span>
              <span><b>{a.school}</b> — {a.detail}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
