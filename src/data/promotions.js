import { schools, GRADES, generateSchoolRoster } from './schools.js'

const CURRENT_YEAR_BE = 2569
const YEAR_LABEL = `${CURRENT_YEAR_BE - 1} → ${CURRENT_YEAR_BE}`

// Deterministic pending/done split, same convention as generateServiceStatus in schools.js —
// most schools still awaiting the batch promotion run, a minority already completed.
function statusFor(school) {
  const codeNum = Number(school.code) || 0
  const done = codeNum % 7 === 0
  return done ? { label: 'เสร็จสิ้น', tone: 'green' } : { label: 'รอดำเนินการ', tone: 'orange' }
}

export const PROMOTION_STATUS_OPTIONS = ['รอดำเนินการ', 'เสร็จสิ้น']

// Per-student roster for the promotion-detail page: current grade/section plus the
// computed next-year grade/section (same section letter, one grade up); students already
// in the final primary grade have no next section and are marked as graduating.
export function generatePromotionRoster(school) {
  const roster = generateSchoolRoster(school)
  return roster.map((s, i) => {
    const gradeIdx = GRADES.indexOf(s.gradeName)
    const sectionSuffix = s.sectionName.split('/').pop().trim()
    const nextGradeName = gradeIdx >= 0 && gradeIdx + 1 < GRADES.length ? GRADES[gradeIdx + 1] : null
    const nextSection = nextGradeName ? `${nextGradeName} / ${sectionSuffix}` : null
    return {
      id: s.id,
      seatNo: i + 1,
      citizenId: s.citizenId,
      fullName: s.fullName,
      initials: s.firstName.slice(0, 2),
      currentSection: s.sectionName,
      currentGrade: s.gradeName,
      nextSection,
    }
  })
}

export const gradePromotions = schools.map((s) => ({
  id: s.id,
  code: s.code,
  name: s.name,
  initials: s.initials,
  iconColor: s.iconColor,
  district: s.district,
  subdistrict: s.subdistrict,
  studentCount: s.studentCount,
  yearLabel: YEAR_LABEL,
  status: statusFor(s),
}))
