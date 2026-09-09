import { useEffect, useState } from 'react'
import {
  IconChart, IconGraduationCap, IconClock, IconHeart, IconFileText, IconUsers,
  IconBell, IconSwap, IconChevronRight, IconChevronDown, IconChevronUp,
} from './icons.jsx'

const NAV = [
  { key: 'dashboard', label: 'แดชบอร์ด', icon: IconChart },
  { key: 'schools', label: 'สถานศึกษา', icon: IconGraduationCap },
  { key: 'daycare', label: 'สถานรับเลี้ยงเด็กกลางวัน', icon: IconClock },
  { key: 'services', label: 'บริการ', icon: IconHeart },
  { key: 'reports', label: 'รายงาน', icon: IconFileText },
  { key: 'users', label: 'ผู้ใช้และสิทธิ์การเข้าถึง', icon: IconUsers },
]

const SUBMENUS = {
  schools: {
    label: 'สถานศึกษา',
    items: [
      { key: 'student-info', label: 'ข้อมูลนักเรียน' },
      { key: 'student-checkup', label: 'ตรวจสุขภาพนักเรียน' },
      { key: 'school-service-history', label: 'ประวัติการให้บริการ' },
      { key: 'grade-promotion', label: 'การเลื่อนชั้น' },
    ],
  },
  daycare: {
    label: 'สถานรับเลี้ยงเด็กกลางวัน',
    items: [
      { key: 'daycare-home', label: 'สถานรับเลี้ยงเด็กกลางวัน' },
      { key: 'daycare-checkup', label: 'ตรวจสุขภาพนักเรียน' },
      { key: 'daycare-service-history', label: 'ประวัติการให้บริการ' },
      { key: 'daycare-teach-history', label: 'ประวัติการสอน' },
      { key: 'daycare-teach-activity', label: 'กิจกรรมการสอน' },
    ],
  },
  reports: {
    label: 'รายงาน',
    items: [
      { key: 'report-summary', label: 'รายงานสรุปผลการตรวจสุขภาพ' },
      { key: 'report-weight', label: 'รายงานเด็กน้ำหนักไม่ตรงเกณฑ์' },
      { key: 'report-vision', label: 'รายงานเด็กที่มีปัญหาสายตา' },
      { key: 'report-vaccine', label: 'รายงานการบริการสร้างเสริมภูมิคุ้มกันโรค' },
      { key: 'report-anemia', label: 'รายงานผลการตรวจภาวะซีด' },
      { key: 'report-lice', label: 'รายงานผลการตรวจเหา' },
      { key: 'report-development', label: 'รายงานการตรวจคัดกรองพัฒนาการ' },
    ],
  },
  users: {
    label: 'สิทธิ์การเข้าถึง',
    items: [
      { key: 'user-admin', label: 'ผู้ดูแลระบบ' },
      { key: 'user-access', label: 'สิทธิ์การเข้าถึง' },
    ],
  },
}

export default function Sidebar({ active, activeSubmenu, onNavigate, showToast }) {
  const [pinned, setPinned] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState(null)
  const [profileOpen, setProfileOpen] = useState(false)

  const notReady = () => showToast?.('ฟีเจอร์นี้ยังไม่พร้อมใช้งาน')

  // Whenever the active page belongs to a submenu section, keep that section's
  // flyout open with the matching item selected — instead of collapsing after navigation.
  useEffect(() => {
    if (!activeSubmenu) return
    const parentKey = Object.keys(SUBMENUS).find((k) => SUBMENUS[k].items.some((it) => it.key === activeSubmenu))
    if (parentKey) setOpenSubmenu(parentKey)
  }, [activeSubmenu])

  const handleNavClick = (item) => {
    if (SUBMENUS[item.key]) {
      setOpenSubmenu((cur) => (cur === item.key ? null : item.key))
      return
    }
    setOpenSubmenu(null)
    if (item.key === 'services') {
      onNavigate('services')
      return
    }
    if (item.key === 'dashboard') {
      onNavigate('dashboard')
      return
    }
    notReady()
  }

  const handleSubmenuClick = (item) => {
    if (item.key === 'student-info') {
      onNavigate('schools')
      return
    }
    if (item.key === 'student-checkup') {
      onNavigate('health-checkup')
      return
    }
    if (item.key === 'school-service-history') {
      onNavigate('service-history')
      return
    }
    if (item.key === 'grade-promotion') {
      onNavigate('grade-promotion')
      return
    }
    if (item.key === 'daycare-home') {
      onNavigate('daycare')
      return
    }
    if (item.key === 'daycare-checkup') {
      onNavigate('daycare-checkup')
      return
    }
    if (item.key === 'daycare-service-history') {
      onNavigate('daycare-service-history')
      return
    }
    if (item.key === 'daycare-teach-history') {
      onNavigate('daycare-teach-history')
      return
    }
    if (item.key === 'daycare-teach-activity') {
      onNavigate('daycare-teach-activities')
      return
    }
    if (item.key.startsWith('report-')) {
      onNavigate('reports', item.key)
      return
    }
    if (item.key === 'user-admin') {
      onNavigate('admin-users')
      return
    }
    if (item.key === 'user-access') {
      onNavigate('access-rights')
      return
    }
    notReady()
  }

  const submenu = openSubmenu ? SUBMENUS[openSubmenu] : null

  return (
    <aside className={`sm-wrap${pinned ? ' pinned' : ''}`}>
      <div className="sm-rail">
        <div className="sm-logo">
          <div className="sm-logo-mark"><IconHeart size={17} /></div>
          <div className="sm-logo-text"><b>สำนักอนามัย</b><span>ศูนย์ 4 ดินแดง</span></div>
          <button className="sm-logo-swap" title="สลับระบบ" aria-label="สลับระบบ" onClick={notReady}>
            <IconSwap size={15} />
          </button>
        </div>

        <nav className="sm-scroll">
          {NAV.map((item) => (
            <button
              key={item.key}
              className={`sm-item${active === item.key ? ' active' : ''}${openSubmenu === item.key ? ' active' : ''}`}
              onClick={() => handleNavClick(item)}
            >
              <item.icon size={18} />
              <span className="sm-item-label">{item.label}</span>
              {SUBMENUS[item.key] && (
                <span className="sm-item-chevron"><IconChevronRight size={15} /></span>
              )}
            </button>
          ))}
        </nav>

        <div className="sm-foot">
          <button className="sm-item" style={{ minHeight: 36, padding: '6px 12px', flexShrink: 0 }} aria-label="แจ้งเตือน" onClick={notReady}>
            <IconBell size={18} />
            <span className="sm-item-label">แจ้งเตือน</span>
            <span className="sm-badge">99+</span>
          </button>
        </div>
        <div className="sm-foot">
          <div className="sm-user-av">สญ</div>
          <div className="sm-user-meta"><b>พญ.สมหญิง รักษ์ดี</b><span>อายุรกรรม</span></div>
          <button className="sm-pin" title="เมนูผู้ใช้" aria-label="เมนูผู้ใช้" onClick={() => setProfileOpen((v) => !v)}>
            {profileOpen ? <IconChevronDown size={15} /> : <IconChevronUp size={15} />}
          </button>
        </div>
      </div>

      {submenu && (
        <div className="sm-submenu">
          <div className="sm-submenu-label">{submenu.label}</div>
          {submenu.items.map((item, i) => (
            <button
              key={item.key + i}
              className={`sm-submenu-item${activeSubmenu === item.key ? ' active' : ''}`}
              onClick={() => handleSubmenuClick(item)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </aside>
  )
}
