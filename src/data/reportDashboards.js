import {
  generateSchoolRoster, generateStudents, generateCheckupDetailRoster, generateVaccineDetailRoster,
  generateHealthCheckupSummary, generateServiceDetailSummary, generateVaccineDetailSummary,
  CHECKUP_CONDITIONS, VACCINE_TAB_DEFS,
} from './schools.js'
import {
  generateDaycareCheckupSummary, generateDaycareServiceDetailSummary, generateDaycareCheckupDetailRoster,
  generateDaycareVaccineDetailSummary, generateDaycareVaccineDetailRoster, BIRTH_YEAR_BY_ROOM,
} from './daycare.js'

function conditionLabel(key) {
  return CHECKUP_CONDITIONS.find((c) => c.key === key)?.label || key
}
function doseLabel(key) {
  return VACCINE_TAB_DEFS.find((d) => d.key === key)?.label || key
}

// A per-institution roster normalized across schools (grade/section rows) and daycare
// rooms (flat child list) so every report generator can share one code path.
function baseRoster(institution, isSchools) {
  if (isSchools) {
    return generateSchoolRoster(institution).map((s) => ({
      id: s.id, seatNo: s.seatNo, fullName: s.fullName, initials: s.firstName.slice(0, 2),
      className: s.sectionName, weight: s.weight, height: s.height,
    }))
  }
  const birthYear = BIRTH_YEAR_BY_ROOM[institution.name] || 2568
  const children = generateStudents({ studentCount: institution.childCount }, birthYear)
  return children.map((c, i) => ({
    id: `${institution.id}-${i}`, seatNo: i + 1, fullName: c.fullName, initials: c.firstName.slice(0, 2),
    className: institution.name, weight: 8 + (i % 12), height: 70 + (i % 35),
  }))
}

function checkupSummary(institution, isSchools) {
  return isSchools ? generateHealthCheckupSummary(institution) : generateDaycareCheckupSummary(institution)
}
function serviceDetailSummary(institution, isSchools) {
  return isSchools ? generateServiceDetailSummary(institution) : generateDaycareServiceDetailSummary(institution)
}
function checkupDetailRoster(institution, isSchools) {
  return isSchools ? generateCheckupDetailRoster(institution) : generateDaycareCheckupDetailRoster(institution)
}
function vaccineDetailSummary(institution, isSchools) {
  return isSchools ? generateVaccineDetailSummary(institution) : generateDaycareVaccineDetailSummary(institution)
}
function vaccineDetailRoster(institution, isSchools) {
  return isSchools ? generateVaccineDetailRoster(institution) : generateDaycareVaccineDetailRoster(institution)
}

// A gently-rising 5-month trend, deterministically shaped per institution so different
// rows don't all look identical.
function generateTrend(seedCode) {
  const seed = Number(seedCode) || 1
  const base = 55 + (seed % 15)
  return ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.'].map((label, i) => ({
    label, value: Math.min(98, base + i * 6 + (seed * (i + 1)) % 7),
  }))
}

const NUTRITION_LEVELS = {
  thin: { key: 'thin', label: 'ผอม', tone: 'red' },
  below: { key: 'below', label: 'ค่อนข้างผอม', tone: 'orange' },
  normal: { key: 'normal', label: 'สมส่วน', tone: 'green' },
  over: { key: 'over', label: 'เริ่มอ้วน', tone: 'orange' },
  obese: { key: 'obese', label: 'อ้วน', tone: 'red' },
}
function classifyNutrition(i) {
  const r = (i * 733) % 100
  if (r < 62) return NUTRITION_LEVELS.normal
  if (r < 74) return NUTRITION_LEVELS.below
  if (r < 84) return NUTRITION_LEVELS.over
  if (r < 92) return NUTRITION_LEVELS.thin
  return NUTRITION_LEVELS.obese
}

const DEV_LEVELS = {
  ontrack: { key: 'ontrack', label: 'สมวัย', tone: 'green' },
  watch: { key: 'watch', label: 'ควรติดตาม', tone: 'orange' },
  delayed: { key: 'delayed', label: 'ล่าช้า', tone: 'red' },
}
function classifyDevelopment(i) {
  const r = (i * 617) % 100
  if (r < 78) return DEV_LEVELS.ontrack
  if (r < 92) return DEV_LEVELS.watch
  return DEV_LEVELS.delayed
}

function conditionReport(institution, isSchools, conditionKey, foundLabel) {
  const summary = checkupSummary(institution, isSchools)
  const roster = checkupDetailRoster(institution, isSchools)
  const found = roster.filter((r) => r.condition === conditionKey)
  return {
    stats: [
      { key: 'total', label: 'จำนวนทั้งหมด', value: summary.total, tone: 'neutral' },
      { key: 'checked', label: 'ตรวจแล้ว', value: summary.checked, tone: 'green' },
      { key: 'found', label: foundLabel, value: found.length, tone: 'red' },
      { key: 'pending', label: 'รอตรวจ', value: summary.notChecked, tone: 'orange' },
    ],
    donutTitle: 'สัดส่วนผลตรวจ',
    donut: [
      { key: 'normal', label: 'ปกติ', value: Math.max(0, Math.round(((summary.checked - found.length) / summary.total) * 100)), color: 'var(--brand-600)' },
      { key: 'found', label: foundLabel, value: Math.round((found.length / summary.total) * 100), color: '#DC2626' },
      { key: 'pending', label: 'รอตรวจ', value: Math.round((summary.notChecked / summary.total) * 100), color: '#94A3B8' },
    ],
    trendTitle: 'แนวโน้มอัตราการตรวจรายเดือน (%)',
    trend: generateTrend(institution.code),
    tableTitle: `รายชื่อที่${foundLabel}`,
    tableColumns: [
      { key: 'seatNo', label: 'เลขที่' },
      { key: 'fullName', label: 'ชื่อ-สกุล' },
      { key: 'className', label: 'ชั้นเรียน / ห้อง' },
      { key: 'findingLabel', label: 'ผลการตรวจ' },
      { key: 'recordedAtLabel', label: 'วันที่ตรวจ' },
    ],
    tableRows: found.map((r) => ({ ...r, findingLabel: foundLabel })),
  }
}

const REPORT_GENERATORS = {
  'report-summary': (institution, isSchools) => {
    const summary = checkupSummary(institution, isSchools)
    const detail = serviceDetailSummary(institution, isSchools)
    const roster = checkupDetailRoster(institution, isSchools)
    const abnormal = roster.filter((r) => r.condition)
    return {
      stats: [
        { key: 'total', label: 'จำนวนทั้งหมด', value: summary.total, tone: 'neutral' },
        { key: 'checked', label: 'ตรวจแล้ว', value: summary.checked, tone: 'green' },
        { key: 'normal', label: 'ผลปกติ', value: detail.normal, tone: 'green' },
        { key: 'abnormal', label: 'ผลผิดปกติ', value: detail.abnormal, tone: 'red' },
      ],
      donutTitle: 'สัดส่วนผลตรวจ',
      donut: [
        { key: 'normal', label: 'ปกติ', value: Math.round((detail.normal / summary.total) * 100), color: 'var(--brand-600)' },
        { key: 'abnormal', label: 'ผิดปกติ', value: Math.round((detail.abnormal / summary.total) * 100), color: '#DC2626' },
        { key: 'pending', label: 'รอตรวจ', value: Math.round((detail.pending / summary.total) * 100), color: '#94A3B8' },
      ],
      trendTitle: 'แนวโน้มอัตราการตรวจรายเดือน (%)',
      trend: generateTrend(institution.code),
      tableTitle: 'รายชื่อที่พบผลผิดปกติ',
      tableColumns: [
        { key: 'seatNo', label: 'เลขที่' },
        { key: 'fullName', label: 'ชื่อ-สกุล' },
        { key: 'className', label: 'ชั้นเรียน / ห้อง' },
        { key: 'findingLabel', label: 'รายการที่พบ' },
        { key: 'recordedAtLabel', label: 'วันที่ตรวจ' },
      ],
      tableRows: abnormal.map((r) => ({ ...r, findingLabel: conditionLabel(r.condition) })),
    }
  },

  'report-weight': (institution, isSchools) => {
    const roster = baseRoster(institution, isSchools).map((r, i) => ({ ...r, nutrition: classifyNutrition(i) }))
    const total = roster.length
    const outOfRange = roster.filter((r) => r.nutrition.key !== 'normal')
    const counts = { thin: 0, below: 0, normal: 0, over: 0, obese: 0 }
    roster.forEach((r) => { counts[r.nutrition.key] += 1 })
    return {
      stats: [
        { key: 'total', label: 'จำนวนทั้งหมด', value: total, tone: 'neutral' },
        { key: 'normal', label: 'สมส่วน', value: counts.normal, tone: 'green' },
        { key: 'thin', label: 'ผอม / ค่อนข้างผอม', value: counts.thin + counts.below, tone: 'orange' },
        { key: 'over', label: 'เริ่มอ้วน / อ้วน', value: counts.over + counts.obese, tone: 'red' },
      ],
      donutTitle: 'สัดส่วนภาวะโภชนาการ',
      donut: [
        { key: 'normal', label: 'สมส่วน', value: Math.round((counts.normal / total) * 100), color: 'var(--brand-600)' },
        { key: 'thin', label: 'ผอม / ค่อนข้างผอม', value: Math.round(((counts.thin + counts.below) / total) * 100), color: '#F59E0B' },
        { key: 'over', label: 'เริ่มอ้วน / อ้วน', value: Math.round(((counts.over + counts.obese) / total) * 100), color: '#DC2626' },
      ],
      trendTitle: 'แนวโน้มภาวะโภชนาการปกติรายเดือน (%)',
      trend: generateTrend(institution.code),
      tableTitle: 'รายชื่อน้ำหนัก-ส่วนสูงไม่ตรงเกณฑ์',
      tableColumns: [
        { key: 'seatNo', label: 'เลขที่' },
        { key: 'fullName', label: 'ชื่อ-สกุล' },
        { key: 'className', label: 'ชั้นเรียน / ห้อง' },
        { key: 'weightLabel', label: 'น้ำหนัก (กก.)' },
        { key: 'heightLabel', label: 'ส่วนสูง (ซม.)' },
        { key: 'nutritionLabel', label: 'ผลการประเมิน' },
      ],
      tableRows: outOfRange.map((r) => ({ ...r, weightLabel: r.weight, heightLabel: r.height, nutritionLabel: r.nutrition.label, nutritionTone: r.nutrition.tone })),
    }
  },

  'report-vision': (institution, isSchools) => conditionReport(institution, isSchools, 'vision', 'พบปัญหาสายตา'),
  'report-anemia': (institution, isSchools) => conditionReport(institution, isSchools, 'anemia', 'พบภาวะซีด'),
  'report-lice': (institution, isSchools) => conditionReport(institution, isSchools, 'lice', 'พบเหา'),

  'report-vaccine': (institution, isSchools) => {
    const summary = vaccineDetailSummary(institution, isSchools)
    const roster = vaccineDetailRoster(institution, isSchools)
    const total = summary.done + summary.pending + summary.overdue
    const notDone = roster.filter((r) => r.status !== 'done')
    return {
      stats: [
        { key: 'total', label: 'จำนวนทั้งหมด', value: total, tone: 'neutral' },
        { key: 'done', label: 'ฉีดครบแล้ว', value: summary.done, tone: 'green' },
        { key: 'pending', label: 'รอฉีด', value: summary.pending, tone: 'orange' },
        { key: 'overdue', label: 'เกินกำหนด', value: summary.overdue, tone: 'red' },
      ],
      donutTitle: 'สัดส่วนความครอบคลุมวัคซีน',
      donut: [
        { key: 'done', label: 'ฉีดครบแล้ว', value: Math.round((summary.done / total) * 100), color: 'var(--brand-600)' },
        { key: 'pending', label: 'รอฉีด', value: Math.round((summary.pending / total) * 100), color: '#F59E0B' },
        { key: 'overdue', label: 'เกินกำหนด', value: Math.round((summary.overdue / total) * 100), color: '#DC2626' },
      ],
      trendTitle: 'แนวโน้มความครอบคลุมวัคซีนรายเดือน (%)',
      trend: generateTrend(institution.code),
      tableTitle: 'รายชื่อที่ยังไม่ฉีดครบ',
      tableColumns: [
        { key: 'seatNo', label: 'เลขที่' },
        { key: 'fullName', label: 'ชื่อ-สกุล' },
        { key: 'className', label: 'ชั้นเรียน / ห้อง' },
        { key: 'doseLabel', label: 'เข็มที่ต้องฉีด' },
        { key: 'statusLabel', label: 'สถานะ' },
      ],
      tableRows: notDone.map((r, i) => ({
        ...r, seatNo: i + 1, className: isSchools ? r.sectionName : institution.name,
        doseLabel: doseLabel(r.doseKey), statusLabel: r.status === 'overdue' ? 'เกินกำหนด' : 'รอฉีด', statusTone: r.status === 'overdue' ? 'red' : 'orange',
      })),
    }
  },

  'report-development': (institution, isSchools) => {
    const roster = baseRoster(institution, isSchools).map((r, i) => ({ ...r, dev: classifyDevelopment(i) }))
    const total = roster.length
    const counts = { ontrack: 0, watch: 0, delayed: 0 }
    roster.forEach((r) => { counts[r.dev.key] += 1 })
    const needsFollowUp = roster.filter((r) => r.dev.key !== 'ontrack')
    return {
      stats: [
        { key: 'total', label: 'จำนวนทั้งหมด', value: total, tone: 'neutral' },
        { key: 'ontrack', label: 'สมวัย', value: counts.ontrack, tone: 'green' },
        { key: 'watch', label: 'ควรติดตาม', value: counts.watch, tone: 'orange' },
        { key: 'delayed', label: 'ล่าช้า', value: counts.delayed, tone: 'red' },
      ],
      donutTitle: 'สัดส่วนผลคัดกรองพัฒนาการ',
      donut: [
        { key: 'ontrack', label: 'สมวัย', value: Math.round((counts.ontrack / total) * 100), color: 'var(--brand-600)' },
        { key: 'watch', label: 'ควรติดตาม', value: Math.round((counts.watch / total) * 100), color: '#F59E0B' },
        { key: 'delayed', label: 'ล่าช้า', value: Math.round((counts.delayed / total) * 100), color: '#DC2626' },
      ],
      trendTitle: 'แนวโน้มพัฒนาการสมวัยรายเดือน (%)',
      trend: generateTrend(institution.code),
      tableTitle: 'รายชื่อที่ควรติดตาม / ล่าช้า',
      tableColumns: [
        { key: 'seatNo', label: 'เลขที่' },
        { key: 'fullName', label: 'ชื่อ-สกุล' },
        { key: 'className', label: 'ชั้นเรียน / ห้อง' },
        { key: 'devLabel', label: 'ผลการคัดกรอง' },
      ],
      tableRows: needsFollowUp.map((r) => ({ ...r, devLabel: r.dev.label, devTone: r.dev.tone })),
    }
  },
}

export function generateReportDashboard(reportKey, institution, isSchools) {
  const generator = REPORT_GENERATORS[reportKey] || REPORT_GENERATORS['report-summary']
  return generator(institution, isSchools)
}
