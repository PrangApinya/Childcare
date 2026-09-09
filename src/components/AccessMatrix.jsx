import { Fragment } from 'react'
import { PERMISSION_TREE, ACCESS_COLUMNS, flattenPermissionKeys } from '../data/admins.js'

function rowHasAny(access, key) {
  return ACCESS_COLUMNS.some((col) => access[key]?.[col.key])
}

function branchHasAny(access, node) {
  if (rowHasAny(access, node.key)) return true
  return !!node.children?.some((child) => rowHasAny(access, child.key))
}

export default function AccessMatrix({ access, onChange, readOnly = false }) {
  function toggleCell(rowKey, colKey) {
    if (readOnly) return
    onChange((cur) => ({ ...cur, [rowKey]: { ...cur[rowKey], [colKey]: !cur[rowKey]?.[colKey] } }))
  }

  function toggleColumn(colKey, checked) {
    if (readOnly) return
    onChange((cur) => {
      const next = { ...cur }
      flattenPermissionKeys().forEach((k) => { next[k] = { ...next[k], [colKey]: checked } })
      return next
    })
  }

  return (
    <div className="tbl-wrap">
      <table className="tbl access-tbl">
        <thead>
          <tr>
            <th></th>
            {ACCESS_COLUMNS.map((col) => (
              <th key={col.key}>
                <div className="access-col-check">
                  {col.label}
                  <input
                    type="checkbox"
                    disabled={readOnly}
                    checked={flattenPermissionKeys().every((k) => access[k]?.[col.key])}
                    onChange={(e) => toggleColumn(col.key, e.target.checked)}
                  />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSION_TREE.map((group) => (
            <Fragment key={group.key}>
              <tr className="access-row-group">
                <td>
                  <span className="access-row-label">
                    <input type="checkbox" disabled checked={branchHasAny(access, group)} readOnly />
                    {group.label}
                  </span>
                </td>
                {ACCESS_COLUMNS.map((col) => (
                  <td key={col.key}>
                    <input type="checkbox" disabled={readOnly} checked={!!access[group.key]?.[col.key]} onChange={() => toggleCell(group.key, col.key)} />
                  </td>
                ))}
              </tr>
              {group.children?.map((child) => (
                <tr key={child.key} className="access-row-child">
                  <td>
                    <span className="access-row-label">
                      <input type="checkbox" disabled checked={rowHasAny(access, child.key)} readOnly />
                      {child.label}
                    </span>
                  </td>
                  {ACCESS_COLUMNS.map((col) => (
                    <td key={col.key}>
                      <input type="checkbox" disabled={readOnly} checked={!!access[child.key]?.[col.key]} onChange={() => toggleCell(child.key, col.key)} />
                    </td>
                  ))}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}
