import { assessNutrition, isAnemiaEligible, VISION_RESULTS, LICE_RESULTS, HEARING_RESULTS } from './healthAssessment.js'

export const healthCenters = [
  'ศูนย์บริการสาธารณสุข 4 ดินแดง',
  'ศูนย์บริการสาธารณสุข 5 จุฬาลงกรณ์',
  'ศูนย์บริการสาธารณสุข 21 วัดธาตุทอง',
  'ศูนย์บริการสาธารณสุข 29 ช่วง นุชเนตร',
]

export const districts = [
  'ดินแดง', 'วัฒนา', 'ราชเทวี', 'บางพลัด', 'ดุสิต', 'พระนคร',
  'ห้วยขวาง', 'บางกะปิ', 'ลาดพร้าว', 'บึงกุ่ม', 'สวนหลวง', 'ประเวศ',
]
export const subdistricts = [
  'ดินแดง', 'คลองเตยเหนือ', 'ถนนพญาไท', 'บางยี่ขัน', 'ถนนนครไชยศรี', 'บางขุนพรหม',
  'ห้วยขวาง', 'คลองจั่น', 'จันทรเกษม', 'คลองกุ่ม', 'สวนหลวง', 'ประเวศ',
]

const GRADE_LEVELS = ['อนุบาล-ประถมศึกษา', 'ประถมศึกษา', 'อนุบาล-มัธยมศึกษา', 'มัธยมศึกษา']

// Default starter set for the "เพิ่มชั้นเรียน" tag list — matches the reference design's
// pre-filled example on both the create-school and create-grade forms.
export const DEFAULT_GRADE_TAGS = ['มัธยมศึกษาปีที่ 1', 'มัธยมศึกษาปีที่ 2', 'มัธยมศึกษาปีที่ 3', 'มัธยมศึกษาปีที่ 4', 'มัธยมศึกษาปีที่ 5', 'มัธยมศึกษาปีที่ 6']
const COORDINATORS = [
  { name: 'ครูสมหญิง ดีเลิศ', phone: '081-555-0142' },
  { name: 'ครูประยุทธ แสงทอง', phone: '089-444-2231' },
  { name: 'ครูวิไล จันทร์เพ็ญ', phone: '086-333-8871' },
  { name: 'ครูสุชาติ รุ่งเรือง', phone: '083-222-1190' },
]
const ICON_COLORS = ['blue', 'red', 'green', 'gold', 'teal', 'purple']

// 7 hand-authored, real-named Bangkok schools shown at the top of the list
// (matches the reference design's รหัสโรงเรียน 1254-1260 rows exactly).
// Each also carries the full contact/location record the "แก้ไขโรงเรียน" edit page needs.
const featuredSchools = [
  {
    id: 's1', code: '1260', name: 'โรงเรียนโยธินบูรณะ', nameEn: 'Yothinburana School',
    subdistrict: 'คลองเตยเหนือ', district: 'วัฒนา', lastSurvey: '2569-08-27', lastSurveyLabel: '27 สิงหาคม 2569',
    studentCount: 3550, initials: 'ยธ', iconColor: 'blue', gradeLevels: 'มัธยมศึกษา',
    address: '1 ถนนสามเสน แขวงถนนนครไชยศรี เขตดุสิต กรุงเทพมหานคร 10300',
    lat: 13.7942, lng: 100.5216, postalCode: '10300',
    coordinator: 'ครูสมหญิง ดีเลิศ', coordinatorPhone: '081-555-0142',
    phone: '02-243-0642', fax: '02-243-0643', website: 'www.yothinburana.ac.th', email: 'info@yothinburana.ac.th',
    healthCenterAssigned: 'ศูนย์บริการสาธารณสุข 21 วัดธาตุทอง', coordinationCenter: 'งานอนามัยโรงเรียน สำนักอนามัย กทม.',
    healthCenterBranch: 'สาขาบางซื่อ', officeDistrict: 'สำนักงานเขตดุสิต',
    termsPerYear: '2 ภาคเรียน', terms: [{ start: '2569-05-16', end: '2569-10-11' }, { start: '2569-11-01', end: '2570-03-31' }],
  },
  {
    id: 's2', code: '1259', name: 'โรงเรียนสาธิตประสานมิตร', nameEn: 'Prasarnmit Demonstration School',
    subdistrict: 'คลองเตยเหนือ', district: 'วัฒนา', lastSurvey: '2569-08-26', lastSurveyLabel: '26 สิงหาคม 2569',
    studentCount: 4550, initials: 'สป', iconColor: 'red', gradeLevels: 'อนุบาล-มัธยมศึกษา',
    address: '174 ถนนสุขุมวิท 23 แขวงคลองเตยเหนือ เขตวัฒนา กรุงเทพมหานคร 10110',
    lat: 13.7367, lng: 100.5697, postalCode: '10110',
    coordinator: 'ครูประยุทธ แสงทอง', coordinatorPhone: '089-444-2231',
    phone: '02-260-0123', fax: '02-260-0124', website: 'www.prasarnmit.ac.th', email: 'info@prasarnmit.ac.th',
    healthCenterAssigned: 'ศูนย์บริการสาธารณสุข 5 จุฬาลงกรณ์', coordinationCenter: 'งานอนามัยโรงเรียน สำนักอนามัย กทม.',
    healthCenterBranch: 'สาขาคลองเตย', officeDistrict: 'สำนักงานเขตวัฒนา',
    termsPerYear: '2 ภาคเรียน', terms: [{ start: '2569-05-16', end: '2569-10-11' }, { start: '2569-11-01', end: '2570-03-31' }],
  },
  {
    id: 's3', code: '1258', name: 'โรงเรียนสามเสนวิทยาลัย', nameEn: 'Samsenwittayalai School',
    subdistrict: 'ถนนนครไชยศรี', district: 'ดุสิต', lastSurvey: '2569-08-25', lastSurveyLabel: '25 สิงหาคม 2569',
    studentCount: 4500, initials: 'สส', iconColor: 'purple', gradeLevels: 'มัธยมศึกษา',
    address: '132 ถนนสามเสน แขวงถนนนครไชยศรี เขตดุสิต กรุงเทพมหานคร 10300',
    lat: 13.7808, lng: 100.5219, postalCode: '10300',
    coordinator: 'ครูวิไล จันทร์เพ็ญ', coordinatorPhone: '086-333-8871',
    phone: '02-243-1226', fax: '02-243-1227', website: 'www.samsenwit.ac.th', email: 'info@samsenwit.ac.th',
    healthCenterAssigned: 'ศูนย์บริการสาธารณสุข 21 วัดธาตุทอง', coordinationCenter: 'งานอนามัยโรงเรียน สำนักอนามัย กทม.',
    healthCenterBranch: 'สาขาเทเวศร์', officeDistrict: 'สำนักงานเขตดุสิต',
    termsPerYear: '2 ภาคเรียน', terms: [{ start: '2569-05-16', end: '2569-10-11' }, { start: '2569-11-01', end: '2570-03-31' }],
  },
  {
    id: 's4', code: '1257', name: 'โรงเรียนเตรียมอุดมศึกษา', nameEn: 'Triam Udom Suksa School',
    subdistrict: 'ปทุมวัน', district: 'ปทุมวัน', lastSurvey: '2569-08-24', lastSurveyLabel: '24 สิงหาคม 2569',
    studentCount: 3500, initials: 'ตอ', iconColor: 'gold', gradeLevels: 'มัธยมศึกษา',
    address: '227 ถนนพญาไท แขวงปทุมวัน เขตปทุมวัน กรุงเทพมหานคร 10330',
    lat: 13.7409, lng: 100.5328, postalCode: '10330',
    coordinator: 'ครูสุชาติ รุ่งเรือง', coordinatorPhone: '083-222-1190',
    phone: '02-251-1290', fax: '02-251-1291', website: 'www.triamudom.ac.th', email: 'info@triamudom.ac.th',
    healthCenterAssigned: 'ศูนย์บริการสาธารณสุข 5 จุฬาลงกรณ์', coordinationCenter: 'งานอนามัยโรงเรียน สำนักอนามัย กทม.',
    healthCenterBranch: 'สาขาปทุมวัน', officeDistrict: 'สำนักงานเขตปทุมวัน',
    termsPerYear: '2 ภาคเรียน', terms: [{ start: '2569-05-16', end: '2569-10-11' }, { start: '2569-11-01', end: '2570-03-31' }],
  },
  {
    id: 's5', code: '1256', name: 'โรงเรียนสตรีวิทยา', nameEn: 'Satriwithaya School',
    subdistrict: 'บวรนิเวศ', district: 'พระนคร', lastSurvey: '2569-08-23', lastSurveyLabel: '23 สิงหาคม 2569',
    studentCount: 3500, initials: 'สว', iconColor: 'teal', gradeLevels: 'มัธยมศึกษา',
    address: '87 ถนนดินสอ แขวงบวรนิเวศ เขตพระนคร กรุงเทพมหานคร 10200',
    lat: 13.7599, lng: 100.5013, postalCode: '10200',
    coordinator: 'ครูสมหญิง ดีเลิศ', coordinatorPhone: '081-555-0142',
    phone: '02-281-3457', fax: '02-281-3458', website: 'www.satriwit.ac.th', email: 'info@satriwit.ac.th',
    healthCenterAssigned: 'ศูนย์บริการสาธารณสุข 29 ช่วง นุชเนตร', coordinationCenter: 'งานอนามัยโรงเรียน สำนักอนามัย กทม.',
    healthCenterBranch: 'สาขาบางลำพู', officeDistrict: 'สำนักงานเขตพระนคร',
    termsPerYear: '2 ภาคเรียน', terms: [{ start: '2569-05-16', end: '2569-10-11' }, { start: '2569-11-01', end: '2570-03-31' }],
  },
  {
    id: 's6', code: '1255', name: 'โรงเรียนสวนกุหลาบวิทยาลัย', nameEn: 'Suankularb Wittayalai School',
    subdistrict: 'วังบูรพาภิรมย์', district: 'พระนคร', lastSurvey: '2569-08-22', lastSurveyLabel: '22 สิงหาคม 2569',
    studentCount: 3500, initials: 'สก', iconColor: 'green', gradeLevels: 'มัธยมศึกษา',
    address: '88 ถนนตรีเพชร แขวงวังบูรพาภิรมย์ เขตพระนคร กรุงเทพมหานคร 10200',
    lat: 13.7434, lng: 100.4959, postalCode: '10200',
    coordinator: 'ครูประยุทธ แสงทอง', coordinatorPhone: '089-444-2231',
    phone: '02-222-0430', fax: '02-222-0431', website: 'www.suankularb.ac.th', email: 'info@suankularb.ac.th',
    healthCenterAssigned: 'ศูนย์บริการสาธารณสุข 29 ช่วง นุชเนตร', coordinationCenter: 'งานอนามัยโรงเรียน สำนักอนามัย กทม.',
    healthCenterBranch: 'สาขาพาหุรัด', officeDistrict: 'สำนักงานเขตพระนคร',
    termsPerYear: '2 ภาคเรียน', terms: [{ start: '2569-05-16', end: '2569-10-11' }, { start: '2569-11-01', end: '2570-03-31' }],
  },
  {
    id: 's7', code: '1254', name: 'โรงเรียนศึกษานารี', nameEn: 'Suksanari School',
    subdistrict: 'วัดกัลยาณ์', district: 'ธนบุรี', lastSurvey: '2569-08-21', lastSurveyLabel: '21 สิงหาคม 2569',
    studentCount: 3500, initials: 'ศน', iconColor: 'blue', gradeLevels: 'มัธยมศึกษา',
    address: '176 ถนนประชาธิปก แขวงวัดกัลยาณ์ เขตธนบุรี กรุงเทพมหานคร 10600',
    lat: 13.7422, lng: 100.4965, postalCode: '10600',
    coordinator: 'ครูวิไล จันทร์เพ็ญ', coordinatorPhone: '086-333-8871',
    phone: '02-465-0369', fax: '02-465-0370', website: 'www.suksanari.ac.th', email: 'info@suksanari.ac.th',
    healthCenterAssigned: 'ศูนย์บริการสาธารณสุข 29 ช่วง นุชเนตร', coordinationCenter: 'งานอนามัยโรงเรียน สำนักอนามัย กทม.',
    healthCenterBranch: 'สาขาตลาดพลู', officeDistrict: 'สำนักงานเขตธนบุรี',
    termsPerYear: '2 ภาคเรียน', terms: [{ start: '2569-05-16', end: '2569-10-11' }, { start: '2569-11-01', end: '2570-03-31' }],
  },
].map((s) => ({ ...s, gradeTags: DEFAULT_GRADE_TAGS }))

// The reference "แก้ไขโรงเรียน" mock (โรงเรียนศึกษานารี) ships 5 already-uploaded roster rows —
// reproduced here so opening its edit page matches the design exactly.
const suksanari = featuredSchools.find((s) => s.id === 's7')
suksanari.sampleRooms = [
  { grade: 'มัธยมศึกษาปีที่ 1', name: 'ประถมศึกษาปีที่ 1 / 1' },
  { grade: 'มัธยมศึกษาปีที่ 1', name: 'ประถมศึกษาปีที่ 1 / 2' },
  { grade: 'มัธยมศึกษาปีที่ 1', name: 'ประถมศึกษาปีที่ 1 / 3' },
  { grade: 'มัธยมศึกษาปีที่ 2', name: 'ประถมศึกษาปีที่ 2 / 1' },
  { grade: 'มัธยมศึกษาปีที่ 2', name: 'ประถมศึกษาปีที่ 2 / 2' },
]
suksanari.sampleRosterFiles = suksanari.sampleRooms.map((r, i) => ({
  id: `seed-${i}`, grade: r.grade, room: r.name, name: 'Report name_T1.PDF', sizeLabel: '23.5 MB',
}))

const THAI_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
const NAME_PREFIXES = ['โรงเรียนวัด', 'โรงเรียนบ้าน', 'โรงเรียน']
const PLACE_FRAGMENTS = [
  'สามัคคี', 'เทพลีลา', 'ประชาอุทิศ', 'ราษฎร์บำรุง', 'สุขสวัสดิ์', 'บางกอกน้อย', 'ดอนเมือง', 'ลาดพร้าว',
  'บึงกุ่ม', 'สวนหลวง', 'ท่าพระ', 'จอมทอง', 'หนองแขม', 'ทุ่งครุ', 'บางนา', 'พระโขนง',
  'คลองสาน', 'ธนบุรี', 'ยานนาวา', 'สาทร', 'บางรัก', 'ปทุมวัน', 'ห้วยขวาง', 'วังทองหลาง',
  'บางกะปิ', 'สะพานสูง', 'คันนายาว', 'มีนบุรี', 'หนองจอก', 'ลาดกระบัง', 'ประเวศ', 'จันทรเกษม',
  'อ่อนนุช', 'เพชรบุรีตัดใหม่', 'รัชดาภิเษก', 'ประชานุกูล', 'ศรีบำเพ็ญ', 'สุขาภิบาล', 'สะพานควาย', 'อุดมสุข',
]
const NAME_SUFFIXES = ['', '', 'วิทยา', '', 'อนุสรณ์', ''] // mostly blank so the fragment stands alone

// Generate ~124 additional schools so the full "list view" table has a realistic
// ~130-row, paginated dataset (matches the "แสดง 1-20 จาก 130 รายการ" footer in the reference design).
function generateMoreSchools(count) {
  const list = []
  for (let i = 0; i < count; i += 1) {
    const prefix = NAME_PREFIXES[i % NAME_PREFIXES.length]
    const place = PLACE_FRAGMENTS[i % PLACE_FRAGMENTS.length]
    const suffix = NAME_SUFFIXES[i % NAME_SUFFIXES.length]
    const district = districts[i % districts.length]
    const subdistrict = subdistricts[(i + 3) % subdistricts.length]
    const coordinator = COORDINATORS[i % COORDINATORS.length]

    const dayOffset = (i * 3) % 27 + 1
    const monthIndex = 7 - Math.floor(i / 9) % 5 // cycles through recent months, mostly Aug/Jul/Jun/May/Apr
    const year = 2569
    const dateLabel = `${dayOffset} ${THAI_MONTHS[(monthIndex + 12) % 12]} ${year}`
    const isoMonth = String(((monthIndex + 12) % 12) + 1).padStart(2, '0')
    const isoDay = String(dayOffset).padStart(2, '0')

    list.push({
      id: `g${i + 1}`,
      code: String(1253 - i),
      name: `${prefix}${place}${suffix}`,
      subdistrict,
      district,
      lastSurvey: `2569-${isoMonth}-${isoDay}`,
      lastSurveyLabel: dateLabel,
      studentCount: 180 + ((i * 53) % 1370),
      initials: place.slice(0, 2),
      iconColor: ICON_COLORS[i % ICON_COLORS.length],
      gradeLevels: GRADE_LEVELS[i % GRADE_LEVELS.length],
      address: `${20 + i} ถนน${place} แขวง${subdistrict} เขต${district} กรุงเทพมหานคร 10${300 + (i % 90)}`,
      coordinator: coordinator.name,
      coordinatorPhone: coordinator.phone,
    })
  }
  return list
}

export const schools = [...featuredSchools, ...generateMoreSchools(124)]

export const GRADES = ['ประถมศึกษาปีที่ 1', 'ประถมศึกษาปีที่ 2', 'ประถมศึกษาปีที่ 3', 'ประถมศึกษาปีที่ 4', 'ประถมศึกษาปีที่ 5', 'ประถมศึกษาปีที่ 6']
// A-Z so section letters never wrap and repeat a grade/section label — even the
// largest generated school (~120 rooms) only needs ~20 cycles through the 6 grades.
const SECTIONS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const SURVEY_DATES = ['27 สิงหาคม 2569', '26 สิงหาคม 2569', '25 สิงหาคม 2569', '20 สิงหาคม 2569']

// ครูประจำชั้น name pool — shared with schoolActivities.js's TeacherAssignmentPage generator
// so a room's homeroom teacher name is consistent wherever it's shown.
export const TEACHER_FIRST_NAMES = ['อรทัย', 'พิชญา', 'สุภารัตน์', 'วิภาวดี', 'สุวิมล', 'อัมพร', 'วิไลพรรณ', 'ธนากร', 'ปิยะดา', 'ศิริพร', 'จิราภรณ์', 'มานพ']
export const TEACHER_LAST_NAMES = ['ศรีสุข', 'วงศ์สวัสดิ์', 'แก้วดี', 'รุ่งเรือง', 'ไพรวัน', 'ไชยสิทธิ์', 'สุขสวัสดิ์', 'มั่นคง', 'บุญมี', 'ทองดี', 'เกษมสุข', 'พูลสวัสดิ์']

const GRADE_LABELS_SUMMARY = ['ประถมศึกษาปีที่ 1', 'ประถมศึกษาปีที่ 2', 'ประถมศึกษาปีที่ 3', 'ประถมศึกษาปีที่ 4', 'ประถมศึกษาปีที่ 5', 'ประถมศึกษาปีที่ 6']
const SUMMARY_VARIANCE = [30, 0, -30, 0, 50, -20]

// 6-row grade-level totals (not individual class sections) — used by the "list view" row expansion.
export function generateGradeSummary(school) {
  const base = Math.round(school.studentCount / 6)
  return GRADE_LABELS_SUMMARY.map((label, i) => ({
    code: String(i + 1).padStart(4, '0'),
    name: label,
    surveyDate: school.lastSurveyLabel,
    studentCount: Math.max(0, base + SUMMARY_VARIANCE[i]),
  }))
}

const SECTION_VARIANCE = [10, -6, -4, 8]

// Deterministic ครูประจำชั้น name for a room/section — same name lists TeacherAssignmentPage
// uses, so a room's homeroom teacher here reads consistently across the app.
export function roomTeacherName(seed) {
  const firstName = TEACHER_FIRST_NAMES[seed % TEACHER_FIRST_NAMES.length]
  const lastName = TEACHER_LAST_NAMES[(seed * 5 + 1) % TEACHER_LAST_NAMES.length]
  return `ครู${firstName} ${lastName}`
}

// Individual classroom sections within one grade (used by the school-detail page's row expansion).
export function generateSections(gradeRow) {
  const sectionCount = gradeRow.studentCount > 90 ? 4 : gradeRow.studentCount > 45 ? 3 : 2
  const base = Math.round(gradeRow.studentCount / sectionCount)
  return Array.from({ length: sectionCount }, (_, i) => ({
    code: String(i + 1).padStart(4, '0'),
    name: `${gradeRow.name} / ${i + 1}`,
    surveyDate: gradeRow.surveyDate,
    studentCount: Math.max(0, base + SECTION_VARIANCE[i % SECTION_VARIANCE.length]),
    teacherName: roomTeacherName(Number(gradeRow.code) + i),
  }))
}

// Every classroom section across all 6 grades, flattened — same rooms generateSchoolRoster()
// groups students into, so a room picked here matches a roster row's `sectionName` exactly
// (used by ActivityLogModal so a logged "ชั้นเรียน / ห้อง" can filter the checkup roster).
export function generateAllSections(school) {
  return generateGradeSummary(school).flatMap((grade) => generateSections(grade))
}

const BOY_FIRST_NAMES = ['ไพศรี', 'ธนกฤต', 'ณัฐพล', 'ปัณณวิชญ์', 'กันตพงศ์', 'ชยพล', 'ธีรภัทร', 'พีรวิชญ์', 'ศุภกร', 'อนุชา', 'ภูริช', 'วรเมธ']
const GIRL_FIRST_NAMES = ['พิมพ์ชนก', 'กมลชนก', 'ณัฐวดี', 'ชนิกานต์', 'ปวีณ์ธิดา', 'ศศิวิมล', 'ธัญชนก', 'อรวรรณ', 'นันทิดา', 'วรัญญา', 'สุพิชญา', 'เบญญาภา']
const SURNAMES = ['เสถียรเขตต์', 'สายใจดี', 'จันทร์เพ็ญ', 'แสงทอง', 'รุ่งเรือง', 'ดีเลิศ', 'ศรีสุข', 'มั่นคง', 'บุญมี', 'ทองดี', 'วงศ์ษา', 'พูลสวัสดิ์', 'เกษมสุข', 'ไชยวงศ์']
const HEALTH_STATUSES = [
  { label: 'ปกติ', tone: 'green' }, { label: 'ปกติ', tone: 'green' }, { label: 'ปกติ', tone: 'green' },
  { label: 'ปกติ', tone: 'green' }, { label: 'เฝ้าระวัง', tone: 'orange' }, { label: 'ผิดปกติ', tone: 'red' },
]
const ENROLL_STATUSES = [
  { label: 'เรียนอยู่', tone: 'green' }, { label: 'เรียนอยู่', tone: 'green' }, { label: 'เรียนอยู่', tone: 'green' },
  { label: 'เรียนอยู่', tone: 'green' }, { label: 'เรียนอยู่', tone: 'green' }, { label: 'ลาออก', tone: 'grey' },
]
const THAI_MONTHS_FULL = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']
export const STUDENT_BLOOD_TYPES = ['A', 'B', 'AB', 'O']
export const STUDENT_CHRONIC_OPTIONS = ['ไม่มี', 'หอบหืด', 'ภูมิแพ้', 'โรคหัวใจ', 'เบาหวาน', 'อื่นๆ']
const ALLERGY_SAMPLES = [[], [], [], ['Penicillin'], ['Penicillin', 'NSAIDs'], ['Shellfish'], ['Cow milk protein']]
const GUARDIAN_FIRST_NAMES = ['สมชาย', 'วิชัย', 'ประภา', 'สุนีย์', 'อนันต์', 'มาลี', 'สมศักดิ์', 'รัตนา']
const EN_BOY_NAMES = ['Somchai', 'Tanakrit', 'Nattapon', 'Pannawit', 'Kantapong', 'Chayapol']
const EN_GIRL_NAMES = ['Pimchanok', 'Kamonchanok', 'Nattawadee', 'Chanikan', 'Paweethida', 'Sasiwimon']
const EN_SURNAMES = ['Sathienkhet', 'Saijaidee', 'Chanphen', 'Saengthong', 'Rungrueang', 'Deelert', 'Srisuk', 'Mankong', 'Boonmee', 'Thongdee', 'Wongsa', 'Poolsawat', 'Kasemsuk', 'Chaiwong']

// Individual student roster for one grade/section row — used by the class roster page.
export function generateStudents(row, birthYearBE = 2562) {
  const count = Math.max(0, row.studentCount)
  return Array.from({ length: count }, (_, i) => {
    const isBoy = i % 2 === 0
    const prefix = isBoy ? 'ด.ช.' : 'ด.ญ.'
    const firstName = isBoy ? BOY_FIRST_NAMES[i % BOY_FIRST_NAMES.length] : GIRL_FIRST_NAMES[i % GIRL_FIRST_NAMES.length]
    const surname = SURNAMES[(i * 3 + 1) % SURNAMES.length]
    const dobDay = (i * 5) % 27 + 1
    const dobMonth = (i * 7) % 12
    const dobIso = `${birthYearBE - 543}-${String(dobMonth + 1).padStart(2, '0')}-${String(dobDay).padStart(2, '0')}`
    const district = districts[i % districts.length]
    const subdistrict = subdistricts[(i + 2) % subdistricts.length]
    const drugAllergies = ALLERGY_SAMPLES[i % ALLERGY_SAMPLES.length]
    const nameEn = isBoy
      ? `${EN_BOY_NAMES[i % EN_BOY_NAMES.length]} ${EN_SURNAMES[(i * 3 + 1) % EN_SURNAMES.length]}`
      : `${EN_GIRL_NAMES[i % EN_GIRL_NAMES.length]} ${EN_SURNAMES[(i * 3 + 1) % EN_SURNAMES.length]}`
    return {
      seatNo: i + 1,
      citizenId: `1${String(1000 + i * 37).padStart(4, '0')}${String(5000 + i * 91).padStart(5, '0')}${i % 10}${(i + 3) % 10}`,
      prefix,
      firstName,
      lastName: surname,
      fullName: `${prefix} ${firstName} ${surname}`,
      nameEn,
      gender: isBoy ? 'ชาย' : 'หญิง',
      dob: dobIso,
      dobLabel: `${dobDay} ${THAI_MONTHS_FULL[dobMonth]} ${birthYearBE}`,
      bloodType: STUDENT_BLOOD_TYPES[i % STUDENT_BLOOD_TYPES.length],
      chronic: STUDENT_CHRONIC_OPTIONS[i % STUDENT_CHRONIC_OPTIONS.length],
      drugAllergies,
      allergy: drugAllergies.length === 0 ? 'ไม่มี' : `แพ้ ${drugAllergies.join(', ')}`,
      guardianName: `${isBoy ? 'นาง' : 'นาย'}${GUARDIAN_FIRST_NAMES[i % GUARDIAN_FIRST_NAMES.length]} ${surname}`,
      guardianPhone: `08${(i % 10)}-${String(100 + i * 7).padStart(3, '0')}-${String(4000 + i * 13).padStart(4, '0')}`,
      address: { province: 'กรุงเทพมหานคร', district, subdistrict, postalCode: String(10300 + (i % 90)) },
      addressLabel: `แขวง${subdistrict} เขต${district} กรุงเทพฯ`,
      healthStatus: HEALTH_STATUSES[i % HEALTH_STATUSES.length],
      enrollStatus: ENROLL_STATUSES[i % ENROLL_STATUSES.length],
      initials: firstName.slice(0, 2),
    }
  })
}

const CHECKUP_CHECKED_PCT = 34

// Internally-consistent summary tiles for the school-wide health-checkup page
// (female+male and checked+notChecked always sum to the school's studentCount).
export function generateHealthCheckupSummary(school) {
  const total = school.studentCount
  const female = Math.round(total * 0.465)
  const male = total - female
  const checked = Math.round(total * (CHECKUP_CHECKED_PCT / 100))
  const notChecked = total - checked
  return { total, female, male, checked, notChecked }
}

// Matches the reference design's pending/done split for the 7 hand-authored schools.
const KNOWN_PENDING_CODES = new Set(['1258', '1255'])

// Per-school completion status for the "ประวัติการให้บริการ" history page.
// Deterministic and tab-independent (same schools show as pending in both service kinds).
const SERVICE_DONE_LABELS = { vaccine: 'ฉีดเสร็จแล้ว', development: 'ประเมินแล้ว', mental: 'ประเมินแล้ว' }
export function generateServiceStatus(school, kind) {
  const codeNum = Number(school.code) || 0
  const pending = KNOWN_PENDING_CODES.has(school.code) || (codeNum < 1254 && codeNum % 5 === 3)
  if (pending) return { label: 'รอดำเนินการ', tone: 'orange' }
  return { label: SERVICE_DONE_LABELS[kind] || 'ตรวจแล้ว', tone: 'green' }
}

// Flat, school-wide student roster (all grades/sections) for the health-checkup page,
// each row tagged with its grade/section and a deterministic checked/unchecked flag.
export function generateSchoolRoster(school, birthYearBE = 2562) {
  const grades = generateGradeSummary(school)
  const roster = []
  let gi = 0
  grades.forEach((grade) => {
    const sections = generateSections(grade)
    sections.forEach((section) => {
      const seatCount = Math.max(0, section.studentCount)
      for (let s = 0; s < seatCount; s++) {
        const i = gi
        const isBoy = i % 2 === 0
        const prefix = isBoy ? 'ด.ช.' : 'ด.ญ.'
        const firstName = isBoy ? BOY_FIRST_NAMES[i % BOY_FIRST_NAMES.length] : GIRL_FIRST_NAMES[i % GIRL_FIRST_NAMES.length]
        const surname = SURNAMES[(i * 3 + 1) % SURNAMES.length]
        roster.push({
          id: `${school.id}-${i}`,
          seatNo: s + 1,
          citizenId: `1${String(1000 + i * 37).padStart(4, '0')}${String(5000 + i * 91).padStart(5, '0')}${i % 10}${(i + 3) % 10}`,
          prefix,
          firstName,
          lastName: surname,
          fullName: `${prefix} ${firstName} ${surname}`,
          gender: isBoy ? 'ชาย' : 'หญิง',
          gradeName: grade.name,
          sectionName: section.name,
          weight: 20 + (i % 40),
          height: 100 + (i % 45),
          checked: (i * 7919) % 100 < CHECKUP_CHECKED_PCT,
          enrollStatus: ENROLL_STATUSES[i % ENROLL_STATUSES.length],
          healthStatus: HEALTH_STATUSES[i % HEALTH_STATUSES.length],
        })
        gi += 1
      }
    })
  })
  return roster
}

// General-checkup finding categories shown as sub-tabs on the school's checkup-detail page.
export const CHECKUP_CONDITIONS = [
  { key: 'cavity', label: 'ฟันผุ' },
  { key: 'gingivitis', label: 'เหงือกอักเสบ' },
  { key: 'lice', label: 'เหา' },
  { key: 'skin', label: 'โรคผิวหนัง' },
  { key: 'vision', label: 'ความผิดปกติทางสายตา' },
  { key: 'hearing', label: 'ความผิดปกติทางหู' },
  { key: 'goiter', label: 'โรคคอพอก' },
  { key: 'anemia', label: 'ซีด' },
]

const DONE_PCT = 70
const ABNORMAL_PCT = 32

// Internally-consistent tiles for the school's checkup-detail page
// (normal+abnormal always sum to done, done+pending always sum to studentCount).
export function generateServiceDetailSummary(school) {
  const total = school.studentCount
  const done = Math.round(total * (DONE_PCT / 100))
  const pending = total - done
  const abnormal = Math.round(done * (ABNORMAL_PCT / 100))
  const normal = done - abnormal
  return { done, pending, normal, abnormal }
}

// Per-student general-checkup records for one school: completion status, finding
// (condition key when abnormal), and a recorded date/time — used by the checkup-detail page.
export function generateCheckupDetailRoster(school, birthYearBE = 2562) {
  const roster = generateSchoolRoster(school, birthYearBE)
  return roster.map((s, i) => {
    const done = (i * 5237) % 100 < DONE_PCT
    const abnormal = done && (i * 911) % 100 < ABNORMAL_PCT
    const condition = abnormal ? CHECKUP_CONDITIONS[i % CHECKUP_CONDITIONS.length].key : null
    const day = 1 + (i * 3) % 28
    const month = THAI_MONTHS_SHORT[(i * 2) % 12]
    const hour = String(8 + (i % 8)).padStart(2, '0')
    const minute = String((i * 15) % 60).padStart(2, '0')
    return {
      ...s,
      done,
      condition,
      recordedAtLabel: `${day} ${month} 2569  ${hour}.${minute} น.`,
    }
  })
}

// Vaccine-dose tabs shown on the school's vaccine-detail page (display order,
// independent from VACCINE_SCHEDULE_DEFS' due/overdue-first order used per-student).
export const VACCINE_TAB_DEFS = [
  { key: 'BCG-1', label: 'วัณโรค (BCG)' },
  { key: 'HB-1', label: 'ตับอักเสบบี เข็ม 1' },
  { key: 'DTP-HB3', label: 'คอตีบ-บาดทะยัก-ไอกรน เข็ม 3' },
  { key: 'MMR-1', label: 'หัด-คางทูม-หัดเยอรมัน เข็ม 1' },
  { key: 'JE-2', label: 'ไข้สมองอักเสบเจอี เข็ม 2' },
  { key: 'DTP-4', label: 'คอตีบ-บาดทะยัก กระตุ้น' },
]

const VACCINE_DONE_PCT = 70
const VACCINE_OVERDUE_PCT_OF_REMAINING = 35

// Internally-consistent tiles for the school's vaccine-detail page
// (done+pending+overdue always sum to studentCount).
export function generateVaccineDetailSummary(school) {
  const total = school.studentCount
  const done = Math.round(total * (VACCINE_DONE_PCT / 100))
  const remaining = total - done
  const overdue = Math.round(remaining * (VACCINE_OVERDUE_PCT_OF_REMAINING / 100))
  const pending = remaining - overdue
  return { done, pending, overdue }
}

// Per-student vaccination records for one school: a representative dose, its
// done/pending/overdue status, and a recorded date/time — used by the vaccine-detail page.
export function generateVaccineDetailRoster(school, birthYearBE = 2562) {
  const roster = generateSchoolRoster(school, birthYearBE)
  return roster.map((s, i) => {
    const r = (i * 4231) % 100
    const status = r < VACCINE_DONE_PCT ? 'done' : r < VACCINE_DONE_PCT + (100 - VACCINE_DONE_PCT) * (1 - VACCINE_OVERDUE_PCT_OF_REMAINING / 100) ? 'pending' : 'overdue'
    const doseKey = VACCINE_TAB_DEFS[i % VACCINE_TAB_DEFS.length].key
    const day = 1 + (i * 3) % 28
    const month = THAI_MONTHS_SHORT[(i * 2) % 12]
    const hour = String(8 + (i % 8)).padStart(2, '0')
    const minute = String((i * 15) % 60).padStart(2, '0')
    return {
      ...s,
      status,
      doseKey,
      recordedAtLabel: `${day} ${month} 2569  ${hour}.${minute} น.`,
    }
  })
}

const CHECKUP_TYPES = ['ตรวจสุขภาพประจำปี', 'ตรวจสุขภาพประจำปี + ฟัน', 'ตรวจสุขภาพประจำปี']
const NUTRITION_STATUSES = [
  { label: 'ปกติ', tone: 'green' }, { label: 'ปกติ', tone: 'green' }, { label: 'เริ่มอ้วน', tone: 'orange' },
]
const BEHAVIOR_TYPES = [
  { type: 'แบบประเมิน SDQ (จุดแข็ง-จุดอ่อน)', result: 'ปกติ', tone: 'green' },
  { type: 'ประเมินพฤติกรรมการเข้าสังคมโดยครูประจำชั้น', result: 'ปกติ', tone: 'green' },
  { type: 'แบบประเมิน SDQ', result: 'ควรติดตามด้านสมาธิ', tone: 'orange' },
]

// Health-surveillance record for one student's "ข้อมูลทั่วไป" profile tab.
export function generateHealthRecord(student) {
  const seed = student.seatNo
  const baseHeight = 95 + (seed % 25)
  const baseWeight = 14 + (seed % 12)
  const checkupHistory = [0, 1, 2].map((k) => {
    const yearsAgo = k
    return {
      date: `${(15 - k) % 28 + 1} พ.ค. ${69 - yearsAgo}`,
      type: CHECKUP_TYPES[k],
      result: k === 0 ? `ปกติ / พบฟันผุ ${1 + (seed % 2)} ซี่` : 'ปกติทุกด้าน',
    }
  })
  const growthHistory = [0, 1, 2].map((k) => {
    const weight = +(baseWeight - k * 5).toFixed(1)
    const height = baseHeight - k * 10
    const bmi = +(weight / (height / 100) ** 2).toFixed(2)
    return {
      date: `พ.ค. ${69 - k}`,
      weight,
      height,
      bmi,
      nutrition: NUTRITION_STATUSES[k % NUTRITION_STATUSES.length],
    }
  })
  const behaviorHistory = [
    { date: '20 มี.ค. 2568', ...BEHAVIOR_TYPES[0] },
    { date: '15 ธ.ค. 2567', ...BEHAVIOR_TYPES[1] },
    { date: '10 มี.ค. 2567', ...BEHAVIOR_TYPES[2] },
  ]
  return {
    latestCheckupDate: checkupHistory[0].date,
    generalHealth: student.healthStatus.label,
    cavitiesFound: `${1 + (seed % 2)} ซี่`,
    development: 'สมวัย',
    checkupHistory,
    growthHistory,
    behaviorHistory,
  }
}

const THAI_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
const VACCINE_SCHEDULE_DEFS = [
  { name: 'คอตีบ-บาดทะยัก กระตุ้น', due: '4 ปี', doseCode: 'DTP-4', due2: true },
  { name: 'ไข้สมองอักเสบเจอี เข็ม 2', due: '2 ปี 6 เดือน', doseCode: 'JE-2', overdue: true },
  { name: 'วัณโรค (BCG)', due: 'แรกเกิด', doseCode: 'BCG-1', offsetDays: 2 },
  { name: 'ตับอักเสบบี เข็ม 1', due: 'แรกเกิด', doseCode: 'HB-1', offsetDays: 2 },
  { name: 'คอตีบ-บาดทะยัก-ไอกรน เข็ม 3', due: '6 เดือน', doseCode: 'DTP-HB3', offsetDays: 183 },
  { name: 'หัด-คางทูม-หัดเยอรมัน เข็ม 1', due: '9-12 เดือน', doseCode: 'MMR-1', offsetDays: 300 },
]

// Vaccination record for the "ประวัติวัคซีน" tab — mostly administered, one due, one overdue.
export function generateVaccineSchedule(student, school) {
  const birth = new Date(`${student.dob}T00:00:00`)
  const items = VACCINE_SCHEDULE_DEFS.map((def) => {
    if (def.overdue) return { ...def, status: 'overdue' }
    if (def.due2) return { ...def, status: 'due' }
    const given = new Date(birth)
    given.setDate(given.getDate() + def.offsetDays)
    const dateGiven = `${given.getDate()} ${THAI_MONTHS_SHORT[given.getMonth()]} ${given.getFullYear() + 543}`
    return { ...def, status: 'done', dateGiven, location: school.name }
  })
  const doneCount = items.filter((i) => i.status === 'done').length
  return { items, doneCount, total: items.length }
}

const NUTRITION_LABELS = ['ผอม', 'ค่อนข้างผอม', 'สมส่วน', 'สมส่วน']
const GROWTH_YEAR_GRADES = ['อนุบาล 1', 'อนุบาล 2', 'อนุบาล 3', 'ประถมศึกษาปีที่ 1']

// 4-point weight/height history (one per academic year) for the "กราฟการเจริญเติบโต" tab.
export function generateGrowthRecords(student) {
  const seed = student.seatNo
  const weightBase = 12 + (seed % 4)
  const weightStep = 4 + (seed % 3)
  const heightBase = 98 + (seed % 6)
  const heightStep = 9 + (seed % 4)
  return [0, 1, 2, 3].map((k) => {
    const weight = weightBase + k * weightStep
    const height = heightBase + k * heightStep
    return {
      year: 2566 + k,
      grade: GROWTH_YEAR_GRADES[k],
      dateLabel: `${10 + (seed + k * 5) % 18} ${THAI_MONTHS_SHORT[(seed + k * 4) % 12]} ${2566 + k} เวลา 09:20`,
      weight,
      height,
      nutrition: NUTRITION_LABELS[k],
    }
  })
}

const APPOINTMENT_DEFS = [
  { title: 'ตรวจสุขภาพประจำปี', dateLabel: '20 พ.ค. 2569', timeLabel: '09:30 น.', status: 'pending' },
  { title: 'ตรวจพัฒนาการ / สายตา', dateLabel: '3 มี.ค. 2568', timeLabel: '10:00 น.', status: 'done' },
  { title: 'ตรวจสุขภาพทั่วไป / ฟัน', dateLabel: '12 พ.ค. 2568', timeLabel: '13:00 น.', status: 'done' },
]
const EXAMINERS = ['ชารีฟะ มานะรุ่งโรจน์', 'สมหญิง ดีเลิศ', 'ประยุทธ แสงทอง']

// Appointment list for the "นัดหมาย" tab.
export function generateAppointments(student) {
  const examiner = EXAMINERS[student.seatNo % EXAMINERS.length]
  return APPOINTMENT_DEFS.map((a) => ({ ...a, examiner: a.status === 'done' ? examiner : null }))
}

function checkupDateTimeLabel(seed, i) {
  const day = ((seed + i * 7) % 27) + 1
  const month = THAI_MONTHS_FULL[(seed + i * 3) % 12]
  const hour = String(8 + ((seed + i) % 4)).padStart(2, '0')
  const minute = String((seed * 7 + i * 13) % 60).padStart(2, '0')
  return `${day} ${month} ${2568 - i}  เวลา ${hour}:${minute}`
}

// Deterministic mock "ตรวจสุขภาพนักเรียน" history (2 past visits, newest first) for the
// student-profile "ตรวจสุขภาพทั่วไป" tab's ประวัติการตรวจที่บันทึกแล้ว list — self-contained
// like GrowthChartTab/VaccineHistoryTab's generators (no shared/global state with the
// school/daycare batch-entry checkup pages).
export function generateCheckupHistory(student) {
  const seed = student.seatNo
  const ageYears = 6 + (seed % 12)
  const gradeName = GRADES[seed % GRADES.length]
  const anemiaEligible = isAnemiaEligible({ gradeName, gender: student.gender })
  return [0, 1].map((i) => {
    const weightKg = 16 + (seed % 30) - i * 2
    const heightCm = 105 + (seed % 55) - i * 3
    const nutrition = assessNutrition({ weightKg, heightCm, ageYears: Math.max(ageYears - i, 5) })
    return {
      id: `${student.id || seed}-checkup-${i}`,
      recordedDateLabel: checkupDateTimeLabel(seed, i),
      gradeName,
      ageYears,
      weightKg,
      heightCm,
      nutrition,
      vision: VISION_RESULTS[(seed + i) % VISION_RESULTS.length],
      lice: LICE_RESULTS[(seed + i) % LICE_RESULTS.length],
      hearing: HEARING_RESULTS[(seed + i) % HEARING_RESULTS.length],
      obesityAcanthosis: false,
      obesitySnoring: false,
      anemiaEligible,
      anemiaResult: anemiaEligible ? ((seed + i) % 5 === 0 ? 'ซีด' : 'ปกติ') : null,
    }
  })
}

// Deterministic mock "ตรวจทันตกรรม" history (2 past visits, newest first) for the
// student-profile "ตรวจทันตกรรม" tab (คทง5 ครั้งที่ 3 หน้า 4) — self-contained like
// generateCheckupHistory above.
export function generateDentalHistory(student) {
  const seed = student.seatNo
  return [0, 1].map((i) => {
    const s = seed + i * 11
    return {
      id: `${student.id || seed}-dental-${i}`,
      recordedDateLabel: checkupDateTimeLabel(seed, i),
      // บันทึกการให้บริการทันตกรรม
      dentalEducation: s % 3 !== 0,
      checkupAdvice: s % 4 !== 0,
      brushingTrained: s % 2 === 0,
      fluorideCoating: s % 5 === 0,
      pitFissureSealant: s % 6 === 0,
      pitFissureSealantTeeth: s % 6 === 0 ? 1 + (s % 4) : 0,
      filling: s % 9 === 0,
      extraction: s % 11 === 0,
      scaling: s % 7 === 0,
      // บันทึกการตรวจฟัน
      decayedTeeth: s % 4,
      missingTeeth: s % 3,
      filledTeeth: s % 2,
      decayedBabyTeeth: s % 5,
      gingivitis: s % 6 === 0,
      calculus: s % 8 === 0,
    }
  })
}

// ผลการประเมิน DSPM ตามที่ระบุในเอกสาร — เอกสารกล่าวถึง "ผลการประเมิน" เป็นภาพรวมค่าเดียว
// (ปกติ/สงสัยล่าช้า/ล่าช้า) ไม่ได้ระบุรายละเอียดแบ่งตามด้านพัฒนาการ จึงไม่ใส่รายละเอียดที่ไม่มี
// อ้างอิงในเอกสาร
export const DEVELOPMENT_RESULTS = ['ปกติ', 'สงสัยล่าช้า', 'ล่าช้า']

// Deterministic mock "การตรวจพัฒนาการ" (DSPM) history (2 past visits, newest first) for the
// student-profile tab (คทง5 ครั้งที่ 3 หน้า 5, ครั้งที่ 4 หน้า 4-5) — เฉพาะเด็กปฐมวัย —
// self-contained like generateCheckupHistory above.
export function generateDevelopmentHistory(student) {
  const seed = student.seatNo
  return [0, 1].map((i) => {
    const s = seed + i * 9
    const result = DEVELOPMENT_RESULTS[s % 20 < 16 ? 0 : (s % 3 === 0 ? 2 : 1)]
    return {
      id: `${student.id || seed}-development-${i}`,
      recordedDateLabel: checkupDateTimeLabel(seed, i),
      result,
      referral: result === 'ล่าช้า' ? (s % 2 === 0 ? 'คลินิกกระตุ้นพัฒนาการ' : 'งานสุขภาพจิต') : '',
    }
  })
}

export const MENTAL_SCREEN_RESULTS = ['ปกติ', 'กลุ่มเสี่ยง']
export const MENTAL_4_DISORDERS = [
  { key: 'id', label: 'ภาวะบกพร่องทางสติปัญญา (ID)' },
  { key: 'autistic', label: 'ออทิสติก (Autistic)' },
  { key: 'adhd', label: 'สมาธิสั้น (ADHD)' },
  { key: 'ld', label: 'ภาวะบกพร่องทางการเรียนรู้ (LD)' },
]
export const MENTAL_CARE_LEVELS = ['ให้คำแนะนำ', 'รับฟังพฤติกรรม', 'ส่งต่อคลินิกสุขภาพจิต', 'ส่งต่อตามสิทธิการรักษา']

export function isMentalScreeningRisk({ screen9SPlus, screenSDQ }) {
  return screen9SPlus === 'กลุ่มเสี่ยง' || screenSDQ === 'กลุ่มเสี่ยง'
}

// CDI ใช้กับอายุ 10-14 ปี, PHQ-A ใช้กับอายุ 11-20 ปี — ช่วงอายุ 11-14 ปีทับซ้อนกัน จึงเลือก
// เครื่องมือสำหรับเด็กเล็กกว่า (CDI) ก่อนเมื่ออายุ <=14, มิฉะนั้นใช้ PHQ-A
export function depressionToolForAge(ageYears) {
  return ageYears <= 14 ? 'CDI (อายุ 10-14 ปี)' : 'PHQ-A (อายุ 11-20 ปี)'
}

// Deterministic mock "สุขภาพจิต" history (2 past visits, newest first) for the student-profile
// tab (คทง5 ครั้งที่ 3 หน้า 5, ครั้งที่ 4 หน้า 5) — คัดกรอง 9S Plus/SDQ ก่อน ถ้าเข้ากลุ่มเสี่ยงจึง
// ประเมิน 4 โรคหลักและภาวะซึมเศร้าต่อ — self-contained like generateCheckupHistory above.
export function generateMentalHealthHistory(student) {
  const seed = student.seatNo
  const ageYears = 6 + (seed % 12)
  return [0, 1].map((i) => {
    const s = seed + i * 13
    const screen9SPlus = MENTAL_SCREEN_RESULTS[s % 5 === 0 ? 1 : 0]
    const screenSDQ = MENTAL_SCREEN_RESULTS[s % 7 === 0 ? 1 : 0]
    const risk = isMentalScreeningRisk({ screen9SPlus, screenSDQ })
    return {
      id: `${student.id || seed}-mental-${i}`,
      recordedDateLabel: checkupDateTimeLabel(seed, i),
      ageYears,
      screen9SPlus,
      screenSDQ,
      disorders: risk ? { id: false, autistic: false, adhd: s % 2 === 0, ld: false } : { id: false, autistic: false, adhd: false, ld: false },
      depressionResult: risk ? (s % 3 === 0 ? 'มีแนวโน้มซึมเศร้า' : 'ปกติ') : '',
      careLevel: risk ? MENTAL_CARE_LEVELS[s % MENTAL_CARE_LEVELS.length] : '',
      followUp: risk && s % 2 === 0,
    }
  })
}

// Deterministic mock room roster sized to roughly match each school's studentCount (~30/room).
export function generateRooms(school) {
  const roomCount = Math.max(6, Math.round(school.studentCount / 30))
  const rooms = []
  for (let i = 0; i < roomCount; i += 1) {
    const grade = GRADES[i % GRADES.length]
    const cycle = Math.floor(i / GRADES.length)
    // Only disambiguate with a section letter once a room repeats a grade from an
    // earlier full pass — the first pass through all 6 grades never needs one.
    const label = cycle > 0 ? `${grade}/${SECTIONS[cycle % SECTIONS.length]}` : grade
    rooms.push({
      code: String(i + 1).padStart(4, '0'),
      name: label,
      surveyDate: SURVEY_DATES[i % SURVEY_DATES.length],
      studentCount: 25 + ((i * 7) % 21), // 25-45, deterministic spread
      teacherName: roomTeacherName(i),
    })
  }
  return rooms
}
