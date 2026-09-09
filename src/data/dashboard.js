export const DASHBOARD_STATS = [
  { key: 'total', label: 'จำนวนเด็กทั้งหมดในระบบ', value: '35,210', sub: '130 สถานศึกษา', tone: 'neutral' },
  { key: 'vaccine', label: 'ความครอบคลุมวัคซีน', value: '89.4%', sub: '+2.1% จากเดือนก่อน', tone: 'green' },
  { key: 'checkup', label: 'ตรวจสุขภาพประจำปีแล้ว', value: '76.2%', sub: 'เป้าหมาย 90%', tone: 'orange' },
  { key: 'followup', label: 'รอการติดตามผล', value: '482 ราย', sub: 'พบผลผิดปกติ', tone: 'red' },
]

export const SCREENING_TREND = [
  { label: 'ม.ค.', value: 61 },
  { label: 'ก.พ.', value: 67 },
  { label: 'มี.ค.', value: 74 },
  { label: 'เม.ย.', value: 70 },
  { label: 'พ.ค.', value: 83 },
]

export const RESULT_BREAKDOWN = [
  { key: 'normal', label: 'ปกติ', value: 72, color: 'var(--brand-600)' },
  { key: 'watch', label: 'เฝ้าระวัง', value: 18, color: '#F59E0B' },
  { key: 'abnormal', label: 'ผิดปกติ', value: 10, color: '#DC2626' },
]

export const DASHBOARD_ALERTS = [
  { id: 'alert-1', school: 'โรงเรียนสวนกุหลาบ', detail: 'เด็ก 14 คน ถึงกำหนดฉีดวัคซีนเข็มถัดไปสัปดาห์นี้' },
  { id: 'alert-2', school: 'โรงเรียนสาธิตประสานมิตร', detail: 'พบผลตรวจภาวะซีดผิดปกติ 6 ราย ยังไม่มีการติดตามผล' },
]
