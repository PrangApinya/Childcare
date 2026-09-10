import { schools, generateRooms, generateAllSections } from './schools.js'

const THAI_MONTHS_ABBR = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
function dateLabelTh(d) {
  return `${d.getDate()} ${THAI_MONTHS_ABBR[d.getMonth()]} ${d.getFullYear() + 543}`
}

// A room a teacher is responsible for — cycles across schools/rooms so the list looks
// realistically spread out rather than everyone assigned to the same school. Reuses each
// room's own teacherName so this list stays consistent with the room table's ครูประจำชั้น column.
export function generateInitialTeacherAssignments(count = 24) {
  return Array.from({ length: count }, (_, i) => {
    const school = schools[i % schools.length]
    const rooms = generateRooms(school)
    const room = rooms[i % rooms.length]
    return {
      id: `ta-${i}`,
      order: i + 1,
      teacherName: room.teacherName,
      schoolId: school.id,
      schoolName: school.name,
      roomName: room.name,
    }
  })
}

export const ACTIVITY_EXAMPLES = ['ตรวจสุขภาพ', 'ตรวจฟัน', 'ฉีดวัคซีน', 'ตรวจสายตา', 'ตรวจภาวะซีด', 'ตรวจเหา', 'ตรวจพัฒนาการ', 'ตรวจสุขภาพจิต']

// Activity log entries (newest first) recorded per school/classroom, e.g. "ตรวจสุขภาพ".
export function generateInitialActivityLogs(count = 24) {
  const base = new Date(2026, 6, 13) // 13 ก.ค. 2569
  return Array.from({ length: count }, (_, i) => {
    const school = schools[(i * 3) % schools.length]
    const rooms = generateAllSections(school)
    const room = rooms[i % rooms.length]
    const d = new Date(base)
    d.setDate(d.getDate() - i)
    const extraRoom = rooms[(i + 3) % rooms.length]
    const roomNames = extraRoom && extraRoom.code !== room.code ? [room.name, extraRoom.name] : [room.name]
    return {
      id: `act-${i}`,
      dateIso: d.toISOString().slice(0, 10),
      dateLabel: dateLabelTh(d),
      schoolId: school.id,
      schoolName: school.name,
      roomNames,
      activity: ACTIVITY_EXAMPLES[i % ACTIVITY_EXAMPLES.length],
      note: '-',
    }
  })
}

export function activityLogDateLabel(dateIso) {
  if (!dateIso) return '-'
  return dateLabelTh(new Date(`${dateIso}T00:00:00`))
}
