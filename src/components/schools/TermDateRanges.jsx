export default function TermDateRanges({ terms, onChange }) {
  function setTerm(index, field, value) {
    onChange(terms.map((t, i) => (i === index ? { ...t, [field]: value } : t)))
  }

  if (terms.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {terms.map((term, i) => (
        <div key={i}>
          <div className="f-label" style={{ marginBottom: 10 }}>ภาคเรียนที่ {i + 1}</div>
          <div className="field-grid-2">
            <div>
              <label className="f-label">วันเปิดเทอม</label>
              <input className="f-input" type="date" value={term.start} onChange={(e) => setTerm(i, 'start', e.target.value)} />
            </div>
            <div>
              <label className="f-label">วันปิดเทอม</label>
              <input className="f-input" type="date" value={term.end} onChange={(e) => setTerm(i, 'end', e.target.value)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function blankTerms(count) {
  return Array.from({ length: count }, () => ({ start: '', end: '' }))
}
