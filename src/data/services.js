import { DEFAULT_GRADE_TAGS } from './schools.js'

export const SERVICE_CLASS_OPTIONS = DEFAULT_GRADE_TAGS

// ชนิดวัคซีนตามกลุ่มเป้าหมายที่ระบุในเอกสารการประชุมครั้งที่ 5 (ป.1 เก็บตกพื้นฐาน, ป.5 HPV,
// ป.6 dT, ป.1-3 ไข้หวัดใหญ่) — ใช้เป็นตัวเลือกเมื่อกำหนดบริการ "ฉีดวัคซีน" ในหน้าบริการ
export const VACCINE_CATALOG = [
  { key: 'bcg', label: 'วัณโรค (BCG)', lotPrefix: 'BCG', dose: '0.1 มล.' },
  { key: 'hb', label: 'ตับอักเสบบี (HB)', lotPrefix: 'HB', dose: '0.5 มล.' },
  { key: 'dt', label: 'คอตีบ-บาดทะยัก (dT)', lotPrefix: 'DT', dose: '0.5 มล.' },
  { key: 'ipv', label: 'โปลิโอชนิดฉีด (IPV)', lotPrefix: 'IPV', dose: '0.5 มล.' },
  { key: 'opv', label: 'โปลิโอชนิดกิน (OPV)', lotPrefix: 'OPV', dose: '2 หยด' },
  { key: 'mmr', label: 'หัด-คางทูม-หัดเยอรมัน (MMR)', lotPrefix: 'MMR', dose: '0.5 มล.' },
  { key: 'je', label: 'ไข้สมองอักเสบเจอี (JE)', lotPrefix: 'JE', dose: '0.5 มล.' },
  { key: 'hpv', label: 'มะเร็งปากมดลูก (HPV)', lotPrefix: 'HPV', dose: '0.5 มล.' },
  { key: 'flu', label: 'ไข้หวัดใหญ่ (Influenza)', lotPrefix: 'FLU', dose: '0.5 มล.' },
]

export function autoVaccineLotNumber(prefix) {
  const n = 100 + Math.floor(Math.random() * 900)
  return `${prefix}-2569-${n}`
}

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
