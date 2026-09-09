import { useState } from 'react'
import { IconX, IconPlus } from './icons.jsx'
import MultiSelectField from './MultiSelectField.jsx'
import { SERVICE_CLASS_OPTIONS } from '../data/services.js'

export default function ServiceModal({ initial, onCancel, onSave }) {
  const isEdit = !!initial
  const [name, setName] = useState(initial?.name ?? '')
  const [classes, setClasses] = useState(initial?.classes ?? [])
  const [inputType, setInputType] = useState(initial?.inputType ?? '')
  const [dropdownOptions, setDropdownOptions] = useState(initial?.dropdownOptions ?? [])
  const [optionDraft, setOptionDraft] = useState('')

  function addOption() {
    const v = optionDraft.trim()
    if (!v || dropdownOptions.includes(v)) return
    setDropdownOptions((list) => [...list, v])
    setOptionDraft('')
  }
  function removeOption(v) {
    setDropdownOptions((list) => list.filter((o) => o !== v))
  }

  function handleSave() {
    if (!name.trim() || classes.length === 0 || !inputType) return
    if (inputType === 'dropdown' && dropdownOptions.length === 0) return
    onSave({ name: name.trim(), classes, inputType, dropdownOptions: inputType === 'dropdown' ? dropdownOptions : [] })
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="modal">
        <div className="modal-hd">
          <h3>{isEdit ? 'แก้ไขบริการ' : 'เพิ่มบริการ'}</h3>
          <button className="modal-close" aria-label="ปิด" onClick={onCancel}><IconX size={16} /></button>
        </div>
        <div className="modal-bd">
          <label className="f-label">ชื่อโรค / บริการ</label>
          <input className="f-input" style={{ marginBottom: 16 }} placeholder="กรอกชื่อโรค / บริการ" value={name} onChange={(e) => setName(e.target.value)} />

          <label className="f-label">ชั้นเรียนที่ใช้</label>
          <div style={{ marginBottom: 16 }}>
            <MultiSelectField
              options={SERVICE_CLASS_OPTIONS}
              values={classes}
              onChange={setClasses}
              placeholder="เลือกชั้นเรียนที่ใช้"
            />
          </div>

          <label className="f-label">ลักษณะการตรวจ</label>
          <select className="f-input" style={{ marginBottom: dropdownOptions.length || inputType === 'dropdown' ? 12 : 16 }} value={inputType} onChange={(e) => setInputType(e.target.value)}>
            <option value="">เลือกลักษณะการตรวจ</option>
            <option value="text">กรอกค่า</option>
            <option value="dropdown">Dropdown</option>
          </select>

          {inputType === 'dropdown' && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="f-input"
                  placeholder="กรอกตัวเลือก"
                  value={optionDraft}
                  onChange={(e) => setOptionDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption() } }}
                />
                <button type="button" className="btn btn-outline btn-sm" style={{ flexShrink: 0 }} onClick={addOption}>
                  <IconPlus size={16} />เพิ่ม
                </button>
              </div>
              {dropdownOptions.length > 0 && (
                <div className="badge-row" style={{ marginTop: 10 }}>
                  {dropdownOptions.map((o) => (
                    <span key={o} className="tag-chip">
                      {o}
                      <button aria-label={`ลบตัวเลือก ${o}`} onClick={() => removeOption(o)}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="modal-ft">
          <button className="btn btn-neutral btn-sm" onClick={onCancel}>ยกเลิก</button>
          <button className="btn btn-primary btn-sm" onClick={handleSave}>บันทึก</button>
        </div>
      </div>
    </div>
  )
}
