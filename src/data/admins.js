import { healthCenters } from './schools.js'

export const ADMIN_CENTER_OPTIONS = healthCenters
export const ADMIN_ROLE_OPTIONS = ['Super Admin', 'System Administrator', 'Health Officer', 'School Nurse', 'Approver', 'Auditor', 'Requester', 'Viewer']
export const ADMIN_STATUS_OPTIONS = ['ใช้งานอยู่', 'ระงับการใช้งาน']

// Mirrors this app's own real nav/submenu structure — the permission matrix an
// admin actually needs, rather than an unrelated module's menu tree.
export const PERMISSION_TREE = [
  {
    key: 'schools', label: 'สถานศึกษา', children: [
      { key: 'student-info', label: 'ข้อมูลนักเรียน' },
      { key: 'student-checkup', label: 'ตรวจสุขภาพนักเรียน' },
      { key: 'school-service-history', label: 'ประวัติการให้บริการ' },
    ],
  },
  {
    key: 'daycare', label: 'สถานรับเลี้ยงเด็กกลางวัน', children: [
      { key: 'daycare-home', label: 'สถานรับเลี้ยงเด็กกลางวัน' },
      { key: 'daycare-checkup', label: 'ตรวจสุขภาพนักเรียน' },
      { key: 'daycare-service-history', label: 'ประวัติการให้บริการ' },
      { key: 'daycare-teach-history', label: 'ประวัติการสอน' },
      { key: 'daycare-teach-activity', label: 'กิจกรรมการสอน' },
    ],
  },
  { key: 'services', label: 'บริการ' },
  {
    key: 'reports', label: 'รายงาน', children: [
      { key: 'report-summary', label: 'รายงานสรุปผลการตรวจสุขภาพ' },
      { key: 'report-weight', label: 'รายงานเด็กน้ำหนักไม่ตรงเกณฑ์' },
      { key: 'report-vision', label: 'รายงานเด็กที่มีปัญหาสายตา' },
      { key: 'report-vaccine', label: 'รายงานการบริการสร้างเสริมภูมิคุ้มกันโรค' },
      { key: 'report-anemia', label: 'รายงานผลการตรวจภาวะซีด' },
      { key: 'report-lice', label: 'รายงานผลการตรวจเหา' },
      { key: 'report-development', label: 'รายงานการตรวจคัดกรองพัฒนาการ' },
    ],
  },
  {
    key: 'users', label: 'ผู้ใช้และสิทธิ์การเข้าถึง', children: [
      { key: 'user-admin', label: 'ผู้ดูแลระบบ' },
      { key: 'user-access', label: 'สิทธิ์การเข้าถึง' },
    ],
  },
]

export const ACCESS_COLUMNS = [
  { key: 'create', label: 'สร้าง' },
  { key: 'delete', label: 'ลบ' },
  { key: 'edit', label: 'แก้ไข' },
  { key: 'view', label: 'อ่านอย่างเดียว' },
]

export function flattenPermissionKeys(tree = PERMISSION_TREE) {
  const keys = []
  tree.forEach((node) => {
    keys.push(node.key)
    if (node.children) keys.push(...node.children.map((c) => c.key))
  })
  return keys
}

// Reasonable default access per role: admins get full access, most staff get
// create/edit/view but not delete, and read-only roles get view only.
export function defaultAccessForRole(role) {
  const full = { create: true, delete: true, edit: true, view: true }
  const readOnly = { create: false, delete: false, edit: false, view: true }
  const staff = { create: true, delete: false, edit: true, view: true }
  const perRow = (role === 'Super Admin' || role === 'System Administrator') ? full
    : (role === 'Viewer' || role === 'Auditor') ? readOnly
      : staff
  const access = {}
  flattenPermissionKeys().forEach((key) => { access[key] = { ...perRow } })
  return access
}

const ADMIN_FIRST_NAMES = ['พัทธรียา', 'สุรพล', 'กชกานต์', 'กมีละห์', 'ปิยพร', 'ดาริน', 'ณิชชา', 'ศิรินทิพย์', 'จิตตานันท์', 'พูลพิชิต', 'ภาณุวัฒน์', 'สโรชา', 'ธีรเดช', 'ปาริชาต']
const ADMIN_LAST_NAMES = ['บัวทอง', 'วงษ์จิต', 'โชติ ณ ภาลัย', 'ปานแก้ว', 'บุรีย์', 'ชื่อสัตย์บุญ', 'บัณฑิตย์วีรกุล', 'สุคนธชาติ', 'วาแมดีซา', 'ไชยรบ', 'ศรีสุวรรณ', 'จันทร์เพ็ญ', 'แสงทอง', 'รุ่งเรือง']

// Reusable permission templates per position — one row per role in ADMIN_ROLE_OPTIONS.
export function generateInitialAccessRoles() {
  return ADMIN_ROLE_OPTIONS.map((role, i) => ({
    id: `access-${i}`,
    order: i + 1,
    role,
    active: i % 6 !== 1,
    status: { label: 'ปกติ', tone: 'green' },
    access: defaultAccessForRole(role),
  }))
}

export function generateInitialAdmins(count = 24) {
  return Array.from({ length: count }, (_, i) => {
    const role = ADMIN_ROLE_OPTIONS[i % ADMIN_ROLE_OPTIONS.length]
    const firstName = ADMIN_FIRST_NAMES[i % ADMIN_FIRST_NAMES.length]
    const lastName = ADMIN_LAST_NAMES[(i * 3 + 1) % ADMIN_LAST_NAMES.length]
    return {
      id: `admin-${i}`,
      order: i + 1,
      fullName: `${firstName} ${lastName}`,
      email: `${firstName.toLowerCase()}.${i}@mih-health.go.th`,
      phone: `08${i % 10}-${String(100 + i * 7).padStart(3, '0')}-${String(4000 + i * 13).padStart(4, '0')}`,
      center: ADMIN_CENTER_OPTIONS[i % ADMIN_CENTER_OPTIONS.length],
      role,
      active: i % 5 !== 1,
      status: { label: 'ปกติ', tone: 'green' },
      access: defaultAccessForRole(role),
    }
  })
}
