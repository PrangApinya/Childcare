import { IconChevronLeft, IconChevronRight } from './icons.jsx'

function buildPageList(page, totalPages) {
  const pages = []
  const windowSize = 5
  let start = Math.max(1, page - 2)
  let end = Math.min(totalPages, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)

  for (let p = start; p <= end; p += 1) pages.push(p)
  if (start > 1) pages.unshift('…')
  if (end < totalPages) pages.push('…')
  return pages
}

export default function Pagination({ page, totalPages, pageSize, totalItems, onChange }) {
  const pages = buildPageList(page, totalPages)
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, totalItems)

  return (
    <div className="pagination">
      <div className="pagination-info">แสดง {from}-{to} จาก {totalItems} รายการ</div>
      <div className="pagination-pages">
        <button className="page-btn" disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="ก่อนหน้า">
          <IconChevronLeft size={15} />
        </button>
        {pages.map((p, i) => (p === '…'
          ? <span className="page-ellipsis" key={`e${i}`}>…</span>
          : (
            <button key={p} className={`page-btn${p === page ? ' active' : ''}`} onClick={() => onChange(p)}>
              {p}
            </button>
          )))}
        <button className="page-btn" disabled={page === totalPages} onClick={() => onChange(page + 1)} aria-label="ถัดไป">
          <IconChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}
