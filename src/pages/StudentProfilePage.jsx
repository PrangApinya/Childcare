import { useMemo, useState } from 'react'
import { IconArrowLeft } from '../components/icons.jsx'
import TabBar from '../components/TabBar.jsx'
import StudentBanner from '../components/student/StudentBanner.jsx'
import GeneralInfoTab from '../components/student/tabs/GeneralInfoTab.jsx'
import VaccineHistoryTab from '../components/student/tabs/VaccineHistoryTab.jsx'
import AttachmentsTab from '../components/student/tabs/AttachmentsTab.jsx'
import GrowthChartTab from '../components/student/tabs/GrowthChartTab.jsx'
import AppointmentsTab from '../components/student/tabs/AppointmentsTab.jsx'
import PlaceholderTab from '../components/student/tabs/PlaceholderTab.jsx'
import { generateHealthRecord, generateVaccineSchedule, generateGrowthRecords, generateAppointments } from '../data/schools.js'

const TABS = [
  { key: 'general', label: 'ข้อมูลทั่วไป' },
  { key: 'vaccine', label: 'ประวัติวัคซีน' },
  { key: 'health-check', label: 'ตรวจสุขภาพทั่วไป' },
  { key: 'dental', label: 'ตรวจทันตกรรม' },
  { key: 'development', label: 'การตรวจพัฒนาการ' },
  { key: 'mental', label: 'สุขภาพจิต' },
  { key: 'growth', label: 'กราฟการเจริญเติบโต' },
  { key: 'appointments', label: 'นัดหมาย' },
  { key: 'attachments', label: 'เอกสารแนบ' },
]

function ageDetailedFromDob(dob) {
  if (!dob) return '—'
  const birth = new Date(`${dob}T00:00:00`)
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  let days = now.getDate() - birth.getDate()
  if (days < 0) {
    months -= 1
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate()
  }
  if (months < 0) { years -= 1; months += 12 }
  return `${years} ปี - ${months} เดือน - ${days} วัน`
}

const CHRONIC_CLASS = { 'ไม่มี': 'badge-grey' }

export default function StudentProfilePage({ school, student, onBack, showToast }) {
  const [activeTab, setActiveTab] = useState('general')

  const enrichedStudent = useMemo(() => ({ ...student, ageLabel: ageDetailedFromDob(student.dob) }), [student])
  const healthRecord = useMemo(() => generateHealthRecord(student), [student])
  const vaccineSchedule = useMemo(() => generateVaccineSchedule(student, school), [student, school])
  const growthRecords = useMemo(() => generateGrowthRecords(student), [student])
  const appointments = useMemo(() => generateAppointments(student), [student])

  return (
    <section className="panel" style={{ paddingTop: 0 }}>
      <div className="stu-topbar" style={{ maxHeight: 'none', opacity: 1, paddingBottom: 8 }}>
        <button className="btn btn-outline btn-sm" onClick={onBack}><IconArrowLeft size={16} />กลับ</button>
        <h1>{student.fullName}</h1>
      </div>

      <StudentBanner student={enrichedStudent} />

      <div className="stu-alerts" style={{ padding: '2px 4px 4px' }}>
        <div className="grp">
          <span className="lbl">แพ้ยา</span>
          <div className="badge-row">
            {student.drugAllergies.length === 0
              ? <span className="badge badge-grey"><span className="badge-dot" />ไม่มี</span>
              : student.drugAllergies.map((a) => <span key={a} className="badge badge-red"><span className="badge-dot" />{a}</span>)}
          </div>
        </div>
        <div className="grp">
          <span className="lbl">โรคประจำตัว</span>
          <div className="badge-row">
            <span className={`badge ${CHRONIC_CLASS[student.chronic] || 'badge-orange'}`}><span className="badge-dot" />{student.chronic}</span>
          </div>
        </div>
      </div>

      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <div className="panel">
        {activeTab === 'general' && <GeneralInfoTab record={healthRecord} />}
        {activeTab === 'vaccine' && <VaccineHistoryTab schedule={vaccineSchedule} />}
        {activeTab === 'health-check' && <PlaceholderTab label="ตรวจสุขภาพทั่วไป" />}
        {activeTab === 'dental' && <PlaceholderTab label="ตรวจทันตกรรม" />}
        {activeTab === 'development' && <PlaceholderTab label="การตรวจพัฒนาการ" />}
        {activeTab === 'mental' && <PlaceholderTab label="สุขภาพจิต" />}
        {activeTab === 'growth' && <GrowthChartTab records={growthRecords} />}
        {activeTab === 'appointments' && <AppointmentsTab appointments={appointments} />}
        {activeTab === 'attachments' && <AttachmentsTab showToast={showToast} />}
      </div>
    </section>
  )
}
