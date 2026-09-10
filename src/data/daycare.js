import { generateStudents, CHECKUP_CONDITIONS, VACCINE_TAB_DEFS } from './schools.js'

const THAI_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

export const initialDaycareRooms = [
  { id: 'dc-1', code: '0001', name: 'เด็กเล็ก', surveyDate: '2569-08-20', surveyDateLabel: '20 สิงหาคม 2569', childCount: 18 },
  { id: 'dc-2', code: '0002', name: 'เด็กกลาง', surveyDate: '2569-08-18', surveyDateLabel: '18 สิงหาคม 2569', childCount: 22 },
  { id: 'dc-3', code: '0003', name: 'เด็กโต', surveyDate: '2569-08-15', surveyDateLabel: '15 สิงหาคม 2569', childCount: 15 },
]

// Birth-year (BE) band per room, youngest room = most recent births.
export const BIRTH_YEAR_BY_ROOM = { 'เด็กเล็ก': 2569, 'เด็กกลาง': 2568, 'เด็กโต': 2567 }

export const TEACH_ACTIVITIES = ['นิทานก่อนนอน', 'ร้องเล่นเต้นระบำ', 'ปั้นดินน้ำมัน', 'เกมจับคู่ภาพ', 'แปรงฟันหลังอาหาร', 'ออกกำลังกายกลางแจ้ง']
const TEACH_TEACHERS = ['ครูอรทัย ศรีสุข', 'ครูพิชญา วงศ์สวัสดิ์', 'ครูสุภารัตน์ แก้วดี', 'ครูวิภาวดี รุ่งเรือง', 'ครูสุวิมล ไพรวัน', 'ครูอัมพร ไชยสิทธิ์', 'ครูวิไลพรรณ สุขสวัสดิ์']
const THAI_MONTHS_ABBR = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

function dateLabelTh(d) {
  return `${d.getDate()} ${THAI_MONTHS_ABBR[d.getMonth()]} ${d.getFullYear() + 543}`
}

// Teaching-activity log entries (newest first), used by the "ประวัติการสอน" page. ชั้นเรียนที่ใช้ is
// synced to the actual rooms added on the "สถานรับเลี้ยงเด็กกลางวัน" page (initialDaycareRooms),
// and each entry can cover more than one room.
export function generateInitialTeachLogs(count = 24) {
  const roomNames = initialDaycareRooms.map((r) => r.name)
  const base = new Date(2026, 6, 13) // 13 ก.ค. 2569
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base)
    d.setDate(d.getDate() - i)
    const classNames = i % 3 === 0
      ? [roomNames[i % roomNames.length], roomNames[(i + 1) % roomNames.length]]
      : [roomNames[i % roomNames.length]]
    return {
      id: `log-${i}`,
      dateIso: d.toISOString().slice(0, 10),
      dateLabel: dateLabelTh(d),
      activity: TEACH_ACTIVITIES[i % TEACH_ACTIVITIES.length],
      classNames,
      teacher: TEACH_TEACHERS[i % TEACH_TEACHERS.length],
      note: '-',
    }
  })
}

export function teachLogDateLabel(dateIso) {
  if (!dateIso) return '-'
  return dateLabelTh(new Date(`${dateIso}T00:00:00`))
}

// Teaching-activity master data (the catalog that populates the "กิจกรรมที่สอน"
// dropdown), used by the "กิจกรรมการสอน" page.
export function generateInitialTeachActivities(count = 16) {
  return Array.from({ length: count }, (_, i) => ({
    id: `act-${i}`,
    code: `ACT${String(i + 1).padStart(3, '0')}`,
    name: TEACH_ACTIVITIES[i % TEACH_ACTIVITIES.length],
    description: '',
    durationMin: 20,
    active: i % 4 !== 3,
  }))
}

const CHECKUP_CHECKED_PCT = 34

// Internally-consistent checkup summary tiles for one daycare room.
export function generateDaycareCheckupSummary(room) {
  const total = room.childCount
  const female = Math.round(total * 0.465)
  const male = total - female
  const checked = Math.round(total * (CHECKUP_CHECKED_PCT / 100))
  const notChecked = total - checked
  return { total, female, male, checked, notChecked }
}

// Flat per-child roster for one daycare room, tagged with a deterministic
// checked/unchecked flag — used by the daycare health-checkup detail page.
export function generateDaycareCheckupRoster(room) {
  const children = generateStudents({ studentCount: room.childCount }, BIRTH_YEAR_BY_ROOM[room.name] || 2568)
  return children.map((c, i) => ({
    ...c,
    id: `${room.id}-${i}`,
    checked: (i * 7919) % 100 < CHECKUP_CHECKED_PCT,
  }))
}

// Deterministic per-room completion status for the "ประวัติการให้บริการ" history page.
const DAYCARE_SERVICE_DONE_LABELS = { vaccine: 'ฉีดเสร็จแล้ว', development: 'ประเมินแล้ว', mental: 'ประเมินแล้ว' }
export function generateDaycareServiceStatus(room, kind) {
  const codeNum = Number(room.code) || 0
  const pending = codeNum % 2 === 0
  if (pending) return { label: 'รอดำเนินการ', tone: 'orange' }
  return { label: DAYCARE_SERVICE_DONE_LABELS[kind] || 'ตรวจแล้ว', tone: 'green' }
}

const SERVICE_DONE_PCT = 70
const SERVICE_ABNORMAL_PCT = 32

// Internally-consistent tiles for the daycare room's checkup-detail (service-history) page.
export function generateDaycareServiceDetailSummary(room) {
  const total = room.childCount
  const done = Math.round(total * (SERVICE_DONE_PCT / 100))
  const pending = total - done
  const abnormal = Math.round(done * (SERVICE_ABNORMAL_PCT / 100))
  const normal = done - abnormal
  return { done, pending, normal, abnormal }
}

// Per-child general-checkup service-history records for one daycare room.
export function generateDaycareCheckupDetailRoster(room) {
  const children = generateStudents({ studentCount: room.childCount }, BIRTH_YEAR_BY_ROOM[room.name] || 2568)
  return children.map((c, i) => {
    const done = (i * 5237) % 100 < SERVICE_DONE_PCT
    const abnormal = done && (i * 911) % 100 < SERVICE_ABNORMAL_PCT
    const condition = abnormal ? CHECKUP_CONDITIONS[i % CHECKUP_CONDITIONS.length].key : null
    const day = 1 + (i * 3) % 28
    const month = THAI_MONTHS_SHORT[(i * 2) % 12]
    const hour = String(8 + (i % 8)).padStart(2, '0')
    const minute = String((i * 15) % 60).padStart(2, '0')
    return {
      ...c,
      id: `${room.id}-svc-${i}`,
      done,
      condition,
      recordedAtLabel: `${day} ${month} 2569  ${hour}.${minute} น.`,
    }
  })
}

const VACCINE_DONE_PCT = 70
const VACCINE_OVERDUE_PCT_OF_REMAINING = 35

// Internally-consistent tiles for the daycare room's vaccine-detail (service-history) page.
export function generateDaycareVaccineDetailSummary(room) {
  const total = room.childCount
  const done = Math.round(total * (VACCINE_DONE_PCT / 100))
  const remaining = total - done
  const overdue = Math.round(remaining * (VACCINE_OVERDUE_PCT_OF_REMAINING / 100))
  const pending = remaining - overdue
  return { done, pending, overdue }
}

// Per-child vaccination service-history records for one daycare room.
export function generateDaycareVaccineDetailRoster(room) {
  const children = generateStudents({ studentCount: room.childCount }, BIRTH_YEAR_BY_ROOM[room.name] || 2568)
  return children.map((c, i) => {
    const r = (i * 4231) % 100
    const status = r < VACCINE_DONE_PCT ? 'done' : r < VACCINE_DONE_PCT + (100 - VACCINE_DONE_PCT) * (1 - VACCINE_OVERDUE_PCT_OF_REMAINING / 100) ? 'pending' : 'overdue'
    const doseKey = VACCINE_TAB_DEFS[i % VACCINE_TAB_DEFS.length].key
    const day = 1 + (i * 3) % 28
    const month = THAI_MONTHS_SHORT[(i * 2) % 12]
    const hour = String(8 + (i % 8)).padStart(2, '0')
    const minute = String((i * 15) % 60).padStart(2, '0')
    return {
      ...c,
      id: `${room.id}-vac-${i}`,
      status,
      doseKey,
      recordedAtLabel: `${day} ${month} 2569  ${hour}.${minute} น.`,
    }
  })
}
