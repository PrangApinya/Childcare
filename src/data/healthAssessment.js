// Nutrition/anemia/vision/lice/hearing assessment logic for "การตรวจสุขภาพนักเรียน"
// (คทง5 ครั้งที่ 3, หน้า 3-4). Nutrition bands below are a simplified mock approximation
// for demo purposes — not the real กรมอนามัย BMI-for-age z-score / Growth Chart tables.

// School-age roster rows don't carry a per-student dob, only gradeName — approximate the
// age band from the grade so the BMI-for-age (5-19) vs Growth Chart (<5) branch is correct.
export function estimateAgeYears(gradeName) {
  const m = /(ประถมศึกษา|มัธยมศึกษา)ปีที่ (\d+)/.exec(gradeName || '')
  if (!m) return 8
  const n = Number(m[2])
  return m[1] === 'ประถมศึกษา' ? 5 + n : 11 + n
}

export function assessNutrition({ weightKg, heightCm, ageYears }) {
  const method = ageYears >= 5 ? 'BMI for Age (z-score)' : 'Growth Chart'
  if (!weightKg || !heightCm) return null

  const expectedWeight = ageYears * 2 + 8
  const expectedHeight = ageYears * 6 + 100
  const weightRatio = weightKg / expectedWeight
  const heightRatio = heightCm / expectedHeight
  const bmi = weightKg / (heightCm / 100) ** 2

  const weightForAge = weightRatio < 0.8 ? 'น้อยกว่าเกณฑ์' : weightRatio > 1.2 ? 'มากกว่าเกณฑ์' : 'ตามเกณฑ์'
  const heightForAge = heightRatio < 0.9 ? 'เตี้ย' : heightRatio < 0.95 ? 'ค่อนข้างเตี้ย' : heightRatio <= 1.05 ? 'สูงตามเกณฑ์' : 'สูง'
  const weightForHeight =
    bmi < 15 ? 'ผอม' : bmi < 17 ? 'ค่อนข้างผอม' : bmi < 23 ? 'สมส่วน' : bmi < 25 ? 'ท้วม' : bmi < 28 ? 'เริ่มอ้วน' : 'อ้วน'

  const tallProportionate = (heightForAge === 'สูงตามเกณฑ์' || heightForAge === 'สูง') && weightForHeight === 'สมส่วน'

  return { method, weightForAge, heightForAge, weightForHeight, tallProportionate }
}

export function isObesityFlag(nutrition) {
  return nutrition?.weightForHeight === 'เริ่มอ้วน' || nutrition?.weightForHeight === 'อ้วน'
}

// ดำเนินการในนักเรียนชั้น ป.3 และ ม.2 เพศหญิง เท่านั้น
export function isAnemiaEligible({ gradeName, gender }) {
  if (!gradeName) return false
  if (gradeName.includes('ประถมศึกษาปีที่ 3')) return true
  if (gradeName.includes('มัธยมศึกษาปีที่ 2') && gender === 'หญิง') return true
  return false
}

export function assessAnemia({ hb, hct }) {
  if (!hb && !hct) return null
  const hbNum = Number(hb)
  const hctNum = Number(hct)
  const anemic = (hb && hbNum < 12) || (hct && hctNum < 36)
  return anemic ? 'ซีด' : 'ปกติ'
}

export const VISION_RESULTS = ['ปกติ', 'สายตาสั้น', 'อื่นๆ']
export const LICE_RESULTS = ['ไม่พบ', 'พบ']
export const HEARING_RESULTS = ['ปกติ', 'ผิดปกติ']
