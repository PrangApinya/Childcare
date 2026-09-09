import { useEffect, useRef, useState } from 'react'
import {
  IconGrid, IconPin, IconChevronDown, IconCalendar, IconBook, IconBell, IconUser, IconGear,
  IconLogout, IconAlertTriangle, IconInbox, IconCheck,
} from './icons.jsx'
import { notifications } from '../data/notifications.js'
import { healthCenters } from '../data/schools.js'

const notifIcon = { alert: IconAlertTriangle, inbox: IconInbox, check: IconCheck }
const notifColor = { alert: '#92400E', inbox: '#1D4ED8', check: 'var(--text-brand)' }
const shortCenterName = (name) => name.replace('ศูนย์บริการสาธารณสุข', 'ศูนย์')

export default function Header({ crumbText = 'สถานศึกษา / สถานศึกษา', healthCenter, onHealthCenterChange }) {
  const [openDD, setOpenDD] = useState(null) // 'loc' | 'notif' | 'profile' | null
  const location = healthCenter ?? healthCenters[0]
  const [fontSize, setFontSize] = useState(16)
  const rootRef = useRef(null)

  useEffect(() => {
    function onDocClick() { setOpenDD(null) }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  useEffect(() => {
    document.documentElement.style.fontSize = (fontSize / 16 * 100) + '%'
  }, [fontSize])

  function toggle(name) {
    setOpenDD((cur) => (cur === name ? null : name))
  }

  return (
    <header className="hdr" ref={rootRef} onClick={(e) => e.stopPropagation()}>
      <div className="hdr-apps"><IconGrid size={20} /></div>
      <div>
        <div className="hdr-title" style={{ color: 'var(--text-primary)' }}>ระบบสุขภาพนักเรียน</div>
        <div className="hdr-crumb">{crumbText}</div>
      </div>

      <div style={{ position: 'relative' }}>
        <button className={`hdr-tag${openDD === 'loc' ? ' open' : ''}`} onClick={() => toggle('loc')}>
          <IconPin size={16} />
          <span>{shortCenterName(location)}</span>
          <IconChevronDown size={14} className="chev" />
        </button>
        <div className={`dd${openDD === 'loc' ? ' open' : ''}`} style={{ left: 0, minWidth: 260 }}>
          {healthCenters.map((loc) => (
            <button
              key={loc}
              className={`dd-item${loc === location ? ' active' : ''}`}
              onClick={() => { onHealthCenterChange?.(loc); setOpenDD(null) }}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      <div className="hdr-right">
        <div className="hdr-date">
          <IconCalendar size={16} />
          <span>วันอังคารที่ 8 กันยายน 2569</span>
        </div>

        <div className="hdr-fs">
          <span className="hdr-fontsize-label">ขนาดตัวอักษร:</span>
          {[14, 16, 18].map((s) => (
            <button
              key={s}
              className={fontSize === s ? 'active' : ''}
              style={{ fontSize: s }}
              title={s === 14 ? 'ตัวอักษรเล็ก' : s === 16 ? 'ตัวอักษรกลาง' : 'ตัวอักษรใหญ่'}
              onClick={() => setFontSize(s)}
            >
              ก
            </button>
          ))}
        </div>

        <button className="hdr-manual">
          <IconBook size={16} />
          คู่มือใช้งานระบบ
        </button>

        <div style={{ position: 'relative' }}>
          <button className="hdr-icon-btn" aria-label="แจ้งเตือน" onClick={() => toggle('notif')}>
            <IconBell size={19} />
            <span className="hdr-dot" />
          </button>
          <div className={`dd${openDD === 'notif' ? ' open' : ''}`} style={{ right: 0, minWidth: 300 }}>
            <div className="dd-head">การแจ้งเตือน</div>
            {notifications.map((n) => {
              const Icon = notifIcon[n.icon]
              return (
                <div key={n.id} className="dd-item" style={{ alignItems: 'flex-start', whiteSpace: 'normal' }}>
                  <Icon size={16} style={{ marginTop: 2, color: notifColor[n.icon] }} />
                  <div>
                    <b style={{ display: 'block', color: 'var(--text-primary)', fontWeight: 600 }}>{n.title}</b>
                    <span style={{ fontSize: 12 }}>{n.time}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <button className="hdr-av" onClick={() => toggle('profile')}>ณห</button>
          <div className={`dd${openDD === 'profile' ? ' open' : ''}`} style={{ right: 0, minWidth: 200 }}>
            <div className="dd-head">ครูณัฐหทัย ใจงาม</div>
            <button className="dd-item"><IconUser size={16} />โปรไฟล์ของฉัน</button>
            <button className="dd-item"><IconGear size={16} />ตั้งค่าบัญชี</button>
            <div className="dd-sep" />
            <button className="dd-item" style={{ color: '#DC2626' }}><IconLogout size={16} />ออกจากระบบ</button>
          </div>
        </div>
      </div>
    </header>
  )
}
