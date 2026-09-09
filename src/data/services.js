import { DEFAULT_GRADE_TAGS } from './schools.js'

export const SERVICE_CLASS_OPTIONS = DEFAULT_GRADE_TAGS

const SERVICE_NAMES = [
  'การตรวจฟัน', 'การตรวจสายตา', 'การตรวจการได้ยิน', 'การตรวจน้ำหนักส่วนสูง',
  'การตรวจภาวะโภชนาการ', 'การตรวจพัฒนาการ', 'การตรวจสุขภาพจิต', 'การตรวจภาวะซีด',
  'การตรวจเหา', 'การตรวจผิวหนัง', 'การตรวจคอพอก', 'การตรวจความดันโลหิต',
]

export function generateInitialServices(count = 12) {
  return Array.from({ length: count }, (_, i) => ({
    id: `svc-${i}`,
    order: i + 1,
    name: SERVICE_NAMES[i % SERVICE_NAMES.length],
    classes: [SERVICE_CLASS_OPTIONS[i % SERVICE_CLASS_OPTIONS.length]],
    inputType: i % 3 === 2 ? 'dropdown' : 'text',
    dropdownOptions: i % 3 === 2 ? ['ปกติ', 'ผิดปกติ'] : [],
    active: i % 5 !== 4,
    status: { label: 'ปกติ', tone: 'green' },
  }))
}
