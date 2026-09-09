import { useMemo, useState } from 'react'
import { IconArrowLeft, IconUpload, IconClipboardCheck } from '../components/icons.jsx'
import LineChart from '../components/charts/LineChart.jsx'
import DonutChart from '../components/charts/DonutChart.jsx'
import Pagination from '../components/Pagination.jsx'
import { generateReportDashboard } from '../data/reportDashboards.js'

const PAGE_SIZE = 20
const STAT_ICON_TONES = {
  neutral: { bg: '#E2E8F0', fg: '#334155' },
  green: { bg: '#D1FAE5', fg: '#065F46' },
  orange: { bg: '#FFEDD5', fg: '#9A3412' },
  red: { bg: '#FEE2E2', fg: '#991B1B' },
}

function badgeToneFor(row, colKey) {
  if (colKey === 'nutritionLabel') return row.nutritionTone
  if (colKey === 'statusLabel') return row.statusTone
  if (colKey === 'devLabel') return row.devTone
  if (colKey === 'findingLabel') return 'red'
  return null
}

export default function ReportDashboardPage({ reportTitle, reportKey, institution, isSchools, onBack, showToast }) {
  const data = useMemo(() => generateReportDashboard(reportKey, institution, isSchools), [reportKey, institution, isSchools])
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(data.tableRows.length / PAGE_SIZE))
  const pageRows = data.tableRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleExport() {
    const header = `${data.tableColumns.map((c) => c.label).join(',')}\n`
    const body = data.tableRows.map((r) => data.tableColumns.map((c) => r[c.key]).join(',')).join('\n')
    const blob = new Blob([`﻿${header}${body}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportTitle}-${institution.name}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    showToast('นำออกเอกสารเรียบร้อยแล้ว')
  }

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <div className="stu-topbar" style={{ maxHeight: 'none', opacity: 1, paddingBottom: 4 }}>
        <button className="btn btn-outline btn-sm" onClick={onBack}><IconArrowLeft size={16} />กลับ</button>
        <h1>{institution.name}</h1>
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16, marginLeft: 4 }}>{reportTitle}</div>

      <div className="checkup-summary-row">
        {data.stats.map((s) => (
          <div key={s.key} className="checkup-summary-card">
            <div className="checkup-summary-icon" style={{ background: STAT_ICON_TONES[s.tone].bg, color: STAT_ICON_TONES[s.tone].fg }}>
              <IconClipboardCheck size={18} />
            </div>
            <div><div className="checkup-summary-n">{s.value.toLocaleString('th-TH')}</div><div className="checkup-summary-l">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="dash-chart-grid">
        <div className="card dash-chart-card">
          <h3 className="dash-card-title">{data.trendTitle}</h3>
          <LineChart data={data.trend} />
        </div>
        <div className="card dash-chart-card">
          <h3 className="dash-card-title">{data.donutTitle}</h3>
          <DonutChart segments={data.donut} />
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 0' }}>
          <h3 className="dash-card-title" style={{ margin: 0 }}>{data.tableTitle}</h3>
          <button className="btn btn-outline btn-sm" onClick={handleExport}>
            <IconUpload size={16} />นำออกเอกสาร
          </button>
        </div>

        {data.tableRows.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-tertiary)' }}>ไม่พบข้อมูลที่ตรงกับรายงานนี้</div>
        ) : (
          <>
            <div className="tbl-wrap" style={{ marginTop: 12 }}>
              <table className="tbl">
                <thead>
                  <tr>
                    {data.tableColumns.map((c) => <th key={c.key}>{c.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r) => (
                    <tr key={r.id}>
                      {data.tableColumns.map((c) => {
                        const tone = badgeToneFor(r, c.key)
                        return (
                          <td key={c.key} className={c.key === 'seatNo' ? 'tabular' : undefined}>
                            {tone ? (
                              <span className={`badge badge-${tone}`}><span className="badge-dot" />{r[c.key]}</span>
                            ) : r[c.key]}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '0 20px' }}>
              <Pagination page={page} totalPages={totalPages} pageSize={PAGE_SIZE} totalItems={data.tableRows.length} onChange={setPage} />
            </div>
          </>
        )}
      </div>
    </section>
  )
}
