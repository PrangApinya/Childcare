import { useCallback, useRef, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Header from './components/Header.jsx'
import Breadcrumb from './components/Breadcrumb.jsx'
import Toast from './components/Toast.jsx'
import SchoolBrowserPage from './pages/SchoolBrowserPage.jsx'
import HealthCheckupBrowserPage from './pages/HealthCheckupBrowserPage.jsx'
import HealthCheckupDetailPage from './pages/HealthCheckupDetailPage.jsx'
import ServiceHistoryPage from './pages/ServiceHistoryPage.jsx'
import ServiceHistoryDetailPage from './pages/ServiceHistoryDetailPage.jsx'
import DaycareBrowserPage from './pages/DaycareBrowserPage.jsx'
import DaycareChildRosterPage from './pages/DaycareChildRosterPage.jsx'
import DaycareCheckupBrowserPage from './pages/DaycareCheckupBrowserPage.jsx'
import DaycareCheckupDetailPage from './pages/DaycareCheckupDetailPage.jsx'
import DaycareServiceHistoryPage from './pages/DaycareServiceHistoryPage.jsx'
import DaycareServiceHistoryDetailPage from './pages/DaycareServiceHistoryDetailPage.jsx'
import DaycareTeachHistoryPage from './pages/DaycareTeachHistoryPage.jsx'
import DaycareTeachActivitiesPage from './pages/DaycareTeachActivitiesPage.jsx'
import ServicesPage from './pages/ServicesPage.jsx'
import ReportBrowserPage from './pages/ReportBrowserPage.jsx'
import AdminUsersPage from './pages/AdminUsersPage.jsx'
import AccessRightsPage from './pages/AccessRightsPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import GradePromotionPage from './pages/GradePromotionPage.jsx'
import SchoolFormPage from './pages/SchoolFormPage.jsx'
import SchoolDetailPage from './pages/SchoolDetailPage.jsx'
import StudentRosterPage from './pages/StudentRosterPage.jsx'
import StudentProfilePage from './pages/StudentProfilePage.jsx'
import PageFooter from './components/PageFooter.jsx'
import { schools as initialSchools } from './data/schools.js'
import { initialDaycareRooms } from './data/daycare.js'

const REPORT_TITLES = {
  'report-summary': 'รายงานสรุปผลการตรวจสุขภาพ',
  'report-weight': 'รายงานเด็กน้ำหนักไม่ตรงเกณฑ์',
  'report-vision': 'รายงานเด็กที่มีปัญหาสายตา',
  'report-vaccine': 'รายงานการบริการสร้างเสริมภูมิคุ้มกันโรค',
  'report-anemia': 'รายงานผลการตรวจภาวะซีด',
  'report-lice': 'รายงานผลการตรวจเหา',
  'report-development': 'รายงานการตรวจคัดกรองพัฒนาการ',
}

export default function App() {
  const scrollRef = useRef(null)
  // 'schools' | 'health-checkup' | 'health-checkup-detail' | 'create-school' | 'edit-school' | 'school-detail' | 'grade-detail' | 'student'
  const [screen, setScreen] = useState('schools')
  const [editingSchool, setEditingSchool] = useState(null)
  const [viewingSchool, setViewingSchool] = useState(null)
  const [viewingCheckupSchool, setViewingCheckupSchool] = useState(null)
  const [viewingServiceSchool, setViewingServiceSchool] = useState(null)
  const [viewingServiceKind, setViewingServiceKind] = useState('checkup')
  const [viewingGrade, setViewingGrade] = useState(null)
  const [viewingStudent, setViewingStudent] = useState(null)
  const [viewingDaycareRoom, setViewingDaycareRoom] = useState(null)
  const [viewingDaycareChild, setViewingDaycareChild] = useState(null)
  const [viewingCheckupRoom, setViewingCheckupRoom] = useState(null)
  const [viewingServiceRoom, setViewingServiceRoom] = useState(null)
  const [viewingServiceRoomKind, setViewingServiceRoomKind] = useState('checkup')
  const [reportKey, setReportKey] = useState('report-summary')
  const [subCrumb, setSubCrumb] = useState(null)
  const [schools, setSchools] = useState(initialSchools)
  const [daycareRooms, setDaycareRooms] = useState(initialDaycareRooms)
  const [toast, setToast] = useState({ show: false, message: '' })
  const toastTimer = useRef(null)

  const showToast = useCallback((message) => {
    setToast({ show: true, message })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 2600)
  }, [])

  function goToSchools() {
    setScreen('schools')
    setEditingSchool(null)
    setViewingSchool(null)
    setViewingGrade(null)
    setViewingStudent(null)
    setSubCrumb(null)
  }

  function goToHealthCheckup() {
    setScreen('health-checkup')
    setEditingSchool(null)
    setViewingSchool(null)
    setViewingGrade(null)
    setViewingStudent(null)
    setViewingCheckupSchool(null)
    setSubCrumb(null)
  }

  function handleOpenCheckup(school) {
    setViewingCheckupSchool(school)
    setSubCrumb(null)
    setScreen('health-checkup-detail')
  }

  function goToServiceHistory() {
    setScreen('service-history')
    setEditingSchool(null)
    setViewingSchool(null)
    setViewingGrade(null)
    setViewingStudent(null)
    setViewingCheckupSchool(null)
    setViewingServiceSchool(null)
    setSubCrumb(null)
  }

  function handleOpenServiceDetail(school, kind) {
    setViewingServiceSchool(school)
    setViewingServiceKind(kind)
    setSubCrumb(null)
    setScreen('service-history-detail')
  }

  function goToDaycare() {
    setScreen('daycare')
    setEditingSchool(null)
    setViewingSchool(null)
    setViewingGrade(null)
    setViewingStudent(null)
    setViewingCheckupSchool(null)
    setViewingServiceSchool(null)
    setViewingDaycareRoom(null)
    setViewingDaycareChild(null)
    setViewingCheckupRoom(null)
    setViewingServiceRoom(null)
    setSubCrumb(null)
  }

  function handleOpenDaycareRoom(room) {
    setViewingDaycareRoom(room)
    setViewingDaycareChild(null)
    setSubCrumb(null)
    setScreen('daycare-room-detail')
  }

  function goToDaycareRoomDetail() {
    setViewingDaycareChild(null)
    setScreen('daycare-room-detail')
  }

  function handleOpenDaycareChild(child) {
    setViewingDaycareChild(child)
    setScreen('daycare-child')
    scrollRef.current?.scrollTo({ top: 0 })
  }

  function goToDaycareCheckup() {
    setScreen('daycare-checkup')
    setEditingSchool(null)
    setViewingSchool(null)
    setViewingGrade(null)
    setViewingStudent(null)
    setViewingCheckupSchool(null)
    setViewingServiceSchool(null)
    setViewingDaycareRoom(null)
    setViewingDaycareChild(null)
    setViewingCheckupRoom(null)
    setViewingServiceRoom(null)
    setSubCrumb(null)
  }

  function handleOpenDaycareCheckup(room) {
    setViewingCheckupRoom(room)
    setSubCrumb(null)
    setScreen('daycare-checkup-detail')
  }

  function goToDaycareServiceHistory() {
    setScreen('daycare-service-history')
    setEditingSchool(null)
    setViewingSchool(null)
    setViewingGrade(null)
    setViewingStudent(null)
    setViewingCheckupSchool(null)
    setViewingServiceSchool(null)
    setViewingDaycareRoom(null)
    setViewingDaycareChild(null)
    setViewingCheckupRoom(null)
    setViewingServiceRoom(null)
    setSubCrumb(null)
  }

  function handleOpenDaycareServiceDetail(room, kind) {
    setViewingServiceRoom(room)
    setViewingServiceRoomKind(kind)
    setSubCrumb(null)
    setScreen('daycare-service-history-detail')
  }

  function goToDaycareTeachHistory() {
    setScreen('daycare-teach-history')
    setEditingSchool(null)
    setViewingSchool(null)
    setViewingGrade(null)
    setViewingStudent(null)
    setViewingCheckupSchool(null)
    setViewingServiceSchool(null)
    setViewingDaycareRoom(null)
    setViewingDaycareChild(null)
    setViewingCheckupRoom(null)
    setViewingServiceRoom(null)
    setSubCrumb(null)
  }

  function goToDaycareTeachActivities() {
    setScreen('daycare-teach-activities')
    setEditingSchool(null)
    setViewingSchool(null)
    setViewingGrade(null)
    setViewingStudent(null)
    setViewingCheckupSchool(null)
    setViewingServiceSchool(null)
    setViewingDaycareRoom(null)
    setViewingDaycareChild(null)
    setViewingCheckupRoom(null)
    setViewingServiceRoom(null)
    setSubCrumb(null)
  }

  function goToServices() {
    setScreen('services')
    setEditingSchool(null)
    setViewingSchool(null)
    setViewingGrade(null)
    setViewingStudent(null)
    setViewingCheckupSchool(null)
    setViewingServiceSchool(null)
    setViewingDaycareRoom(null)
    setViewingDaycareChild(null)
    setViewingCheckupRoom(null)
    setViewingServiceRoom(null)
    setSubCrumb(null)
  }

  function goToReports(key) {
    setReportKey(key)
    setScreen('reports')
    setEditingSchool(null)
    setViewingSchool(null)
    setViewingGrade(null)
    setViewingStudent(null)
    setViewingCheckupSchool(null)
    setViewingServiceSchool(null)
    setViewingDaycareRoom(null)
    setViewingDaycareChild(null)
    setViewingCheckupRoom(null)
    setViewingServiceRoom(null)
    setSubCrumb(null)
  }

  function goToAdminUsers() {
    setScreen('admin-users')
    setEditingSchool(null)
    setViewingSchool(null)
    setViewingGrade(null)
    setViewingStudent(null)
    setViewingCheckupSchool(null)
    setViewingServiceSchool(null)
    setViewingDaycareRoom(null)
    setViewingDaycareChild(null)
    setViewingCheckupRoom(null)
    setViewingServiceRoom(null)
    setSubCrumb(null)
  }

  function goToGradePromotion() {
    setScreen('grade-promotion')
    setEditingSchool(null)
    setViewingSchool(null)
    setViewingGrade(null)
    setViewingStudent(null)
    setViewingCheckupSchool(null)
    setViewingServiceSchool(null)
    setViewingDaycareRoom(null)
    setViewingDaycareChild(null)
    setViewingCheckupRoom(null)
    setViewingServiceRoom(null)
    setSubCrumb(null)
  }

  function goToDashboard() {
    setScreen('dashboard')
    setEditingSchool(null)
    setViewingSchool(null)
    setViewingGrade(null)
    setViewingStudent(null)
    setViewingCheckupSchool(null)
    setViewingServiceSchool(null)
    setViewingDaycareRoom(null)
    setViewingDaycareChild(null)
    setViewingCheckupRoom(null)
    setViewingServiceRoom(null)
    setSubCrumb(null)
  }

  function goToAccessRights() {
    setScreen('access-rights')
    setEditingSchool(null)
    setViewingSchool(null)
    setViewingGrade(null)
    setViewingStudent(null)
    setViewingCheckupSchool(null)
    setViewingServiceSchool(null)
    setViewingDaycareRoom(null)
    setViewingDaycareChild(null)
    setViewingCheckupRoom(null)
    setViewingServiceRoom(null)
    setSubCrumb(null)
  }

  function handleSidebarNavigate(target, extra) {
    if (target === 'dashboard') goToDashboard()
    else if (target === 'health-checkup') goToHealthCheckup()
    else if (target === 'service-history') goToServiceHistory()
    else if (target === 'grade-promotion') goToGradePromotion()
    else if (target === 'daycare') goToDaycare()
    else if (target === 'daycare-checkup') goToDaycareCheckup()
    else if (target === 'daycare-service-history') goToDaycareServiceHistory()
    else if (target === 'daycare-teach-history') goToDaycareTeachHistory()
    else if (target === 'daycare-teach-activities') goToDaycareTeachActivities()
    else if (target === 'services') goToServices()
    else if (target === 'reports') goToReports(extra)
    else if (target === 'admin-users') goToAdminUsers()
    else if (target === 'access-rights') goToAccessRights()
    else goToSchools()
  }

  function goToSchoolDetail() {
    setScreen('school-detail')
    setViewingGrade(null)
    setViewingStudent(null)
    setSubCrumb(null)
  }

  function goToGradeDetail() {
    setScreen('grade-detail')
    setViewingStudent(null)
  }

  function handleOpenSchool(school) {
    setViewingSchool(school)
    setScreen('school-detail')
  }

  function handleOpenGrade(school, grade, section) {
    setViewingSchool(school)
    setViewingGrade(section || grade)
    setSubCrumb(null)
    setScreen('grade-detail')
  }

  function handleOpenStudent(student) {
    setViewingStudent(student)
    setScreen('student')
    scrollRef.current?.scrollTo({ top: 0 })
  }

  function handleCreateSchool(newSchoolFields) {
    const newSchool = {
      id: `s${Date.now()}`,
      code: String(1256 + schools.length),
      studentCount: 0,
      initials: newSchoolFields.name.replace('โรงเรียน', '').trim().slice(0, 2) || 'รร',
      iconColor: 'blue',
      lastSurvey: '2569-09-08',
      lastSurveyLabel: '8 กันยายน 2569',
      ...newSchoolFields,
    }
    setSchools((list) => [newSchool, ...list])
  }

  function handleEditSchool(fields) {
    setSchools((list) => list.map((s) => (s.id === editingSchool.id ? { ...s, ...fields } : s)))
  }

  const crumbItems = (() => {
    if (screen === 'dashboard') return ['แดชบอร์ด']
    if (screen === 'student' && viewingSchool && viewingGrade && viewingStudent) {
      return ['สถานศึกษา', viewingSchool.name, viewingGrade.name, viewingStudent.fullName]
    }
    if (screen === 'health-checkup-detail' && viewingCheckupSchool) {
      return subCrumb
        ? ['สถานศึกษา', 'ตรวจสุขภาพนักเรียน', viewingCheckupSchool.name, subCrumb]
        : ['สถานศึกษา', 'ตรวจสุขภาพนักเรียน', viewingCheckupSchool.name]
    }
    if (screen === 'health-checkup') return ['สถานศึกษา', 'ตรวจสุขภาพนักเรียน']
    if (screen === 'service-history-detail' && viewingServiceSchool) {
      return ['สถานศึกษา', 'ประวัติการให้บริการ', viewingServiceSchool.name]
    }
    if (screen === 'service-history') return ['สถานศึกษา', 'ประวัติการให้บริการ']
    if (screen === 'grade-promotion') return ['สถานศึกษา', 'การเลื่อนชั้น']
    if (screen === 'daycare-child' && viewingDaycareRoom && viewingDaycareChild) {
      return ['สถานรับเลี้ยงเด็กกลางวัน', 'สถานรับเลี้ยงเด็กกลางวัน', viewingDaycareRoom.name, viewingDaycareChild.fullName]
    }
    if (screen === 'daycare-room-detail' && viewingDaycareRoom) {
      return subCrumb
        ? ['สถานรับเลี้ยงเด็กกลางวัน', 'สถานรับเลี้ยงเด็กกลางวัน', viewingDaycareRoom.name, subCrumb]
        : ['สถานรับเลี้ยงเด็กกลางวัน', 'สถานรับเลี้ยงเด็กกลางวัน', viewingDaycareRoom.name]
    }
    if (screen === 'daycare') return ['สถานรับเลี้ยงเด็กกลางวัน', 'สถานรับเลี้ยงเด็กกลางวัน']
    if (screen === 'daycare-checkup-detail' && viewingCheckupRoom) {
      return subCrumb
        ? ['สถานรับเลี้ยงเด็กกลางวัน', 'ตรวจสุขภาพนักเรียน', viewingCheckupRoom.name, subCrumb]
        : ['สถานรับเลี้ยงเด็กกลางวัน', 'ตรวจสุขภาพนักเรียน', viewingCheckupRoom.name]
    }
    if (screen === 'daycare-checkup') return ['สถานรับเลี้ยงเด็กกลางวัน', 'ตรวจสุขภาพนักเรียน']
    if (screen === 'daycare-service-history-detail' && viewingServiceRoom) {
      return ['สถานรับเลี้ยงเด็กกลางวัน', 'ประวัติการให้บริการ', viewingServiceRoom.name]
    }
    if (screen === 'daycare-service-history') return ['สถานรับเลี้ยงเด็กกลางวัน', 'ประวัติการให้บริการ']
    if (screen === 'daycare-teach-history') return ['สถานรับเลี้ยงเด็กกลางวัน', 'ประวัติการสอน']
    if (screen === 'daycare-teach-activities') return ['สถานรับเลี้ยงเด็กกลางวัน', 'กิจกรรมการสอน']
    if (screen === 'services') return ['บริการ']
    if (screen === 'reports') return ['รายงาน', REPORT_TITLES[reportKey] || REPORT_TITLES['report-summary']]
    if (screen === 'admin-users') return ['สิทธิ์การเข้าถึง', 'ผู้ดูแลระบบ']
    if (screen === 'access-rights') return ['สิทธิ์การเข้าถึง', 'สิทธิ์การเข้าถึง']
    if (screen === 'create-school') return ['สถานศึกษา', 'ข้อมูลนักเรียน', 'สร้างโรงเรียน']
    if (screen === 'edit-school') return ['สถานศึกษา', 'ข้อมูลนักเรียน', 'แก้ไขโรงเรียน']
    if (screen === 'grade-detail' && viewingSchool && viewingGrade) {
      return subCrumb
        ? ['สถานศึกษา', viewingSchool.name, viewingGrade.name, subCrumb]
        : ['สถานศึกษา', viewingSchool.name, viewingGrade.name]
    }
    if (screen === 'school-detail' && viewingSchool) {
      return subCrumb ? ['สถานศึกษา', viewingSchool.name, subCrumb] : ['สถานศึกษา', viewingSchool.name]
    }
    return ['สถานศึกษา', 'ข้อมูลนักเรียน']
  })()
  const crumbText = crumbItems.join(' / ')

  return (
    <div className="app">
      <Sidebar
        active={
          screen === 'dashboard' ? 'dashboard'
          : screen === 'daycare' || screen === 'daycare-room-detail' || screen === 'daycare-child'
            || screen === 'daycare-checkup' || screen === 'daycare-checkup-detail'
            || screen === 'daycare-service-history' || screen === 'daycare-service-history-detail'
            || screen === 'daycare-teach-history' || screen === 'daycare-teach-activities' ? 'daycare'
            : screen === 'services' ? 'services'
              : screen === 'reports' ? 'reports'
                : screen === 'admin-users' || screen === 'access-rights' ? 'users' : 'schools'
        }
        activeSubmenu={
          screen === 'health-checkup' || screen === 'health-checkup-detail' ? 'student-checkup'
            : screen === 'service-history' || screen === 'service-history-detail' ? 'school-service-history'
            : screen === 'grade-promotion' ? 'grade-promotion'
              : screen === 'daycare-checkup' || screen === 'daycare-checkup-detail' ? 'daycare-checkup'
                : screen === 'daycare-service-history' || screen === 'daycare-service-history-detail' ? 'daycare-service-history'
                  : screen === 'daycare-teach-history' ? 'daycare-teach-history'
                    : screen === 'daycare-teach-activities' ? 'daycare-teach-activity'
                      : screen === 'reports' ? reportKey
                        : screen === 'admin-users' ? 'user-admin'
                          : screen === 'access-rights' ? 'user-access'
                            : screen === 'daycare' || screen === 'daycare-room-detail' || screen === 'daycare-child' ? 'daycare-home'
                            : 'student-info'
        }
        onNavigate={handleSidebarNavigate}
        showToast={showToast}
      />

      <div className="main-col">
        <Header crumbText={crumbText} />
        <Breadcrumb items={crumbItems} />

        <main className="content" ref={scrollRef}>
          {screen === 'dashboard' && (
            <DashboardPage />
          )}

          {screen === 'grade-promotion' && (
            <GradePromotionPage showToast={showToast} />
          )}

          {screen === 'schools' && (
            <SchoolBrowserPage
              schools={schools}
              showToast={showToast}
              onOpenGrade={handleOpenGrade}
              onOpenCreate={() => setScreen('create-school')}
              onOpenEdit={(school) => { setEditingSchool(school); setScreen('edit-school') }}
              onOpenSchool={handleOpenSchool}
            />
          )}

          {screen === 'health-checkup' && (
            <HealthCheckupBrowserPage schools={schools} showToast={showToast} onOpenCheckup={handleOpenCheckup} />
          )}

          {screen === 'health-checkup-detail' && viewingCheckupSchool && (
            <HealthCheckupDetailPage
              school={viewingCheckupSchool}
              onBack={goToHealthCheckup}
              showToast={showToast}
              onSubCrumbChange={setSubCrumb}
            />
          )}

          {screen === 'service-history' && (
            <ServiceHistoryPage schools={schools} showToast={showToast} onOpenDetail={handleOpenServiceDetail} />
          )}

          {screen === 'service-history-detail' && viewingServiceSchool && (
            <ServiceHistoryDetailPage
              school={viewingServiceSchool}
              kind={viewingServiceKind}
              onBack={goToServiceHistory}
              showToast={showToast}
            />
          )}

          {screen === 'daycare' && (
            <DaycareBrowserPage rooms={daycareRooms} setRooms={setDaycareRooms} showToast={showToast} onOpenRoom={handleOpenDaycareRoom} />
          )}

          {screen === 'daycare-checkup' && (
            <DaycareCheckupBrowserPage rooms={daycareRooms} showToast={showToast} onOpenCheckup={handleOpenDaycareCheckup} />
          )}

          {screen === 'daycare-checkup-detail' && viewingCheckupRoom && (
            <DaycareCheckupDetailPage
              room={viewingCheckupRoom}
              onBack={goToDaycareCheckup}
              showToast={showToast}
              onSubCrumbChange={setSubCrumb}
            />
          )}

          {screen === 'daycare-service-history' && (
            <DaycareServiceHistoryPage rooms={daycareRooms} showToast={showToast} onOpenDetail={handleOpenDaycareServiceDetail} />
          )}

          {screen === 'daycare-service-history-detail' && viewingServiceRoom && (
            <DaycareServiceHistoryDetailPage
              room={viewingServiceRoom}
              kind={viewingServiceRoomKind}
              onBack={goToDaycareServiceHistory}
              showToast={showToast}
            />
          )}

          {screen === 'daycare-teach-history' && (
            <DaycareTeachHistoryPage showToast={showToast} />
          )}

          {screen === 'daycare-teach-activities' && (
            <DaycareTeachActivitiesPage showToast={showToast} />
          )}

          {screen === 'services' && (
            <ServicesPage showToast={showToast} />
          )}

          {screen === 'reports' && (
            <ReportBrowserPage
              reportTitle={REPORT_TITLES[reportKey] || REPORT_TITLES['report-summary']}
              reportKey={reportKey}
              schools={schools}
              daycareRooms={daycareRooms}
              showToast={showToast}
            />
          )}

          {screen === 'admin-users' && (
            <AdminUsersPage showToast={showToast} />
          )}

          {screen === 'access-rights' && (
            <AccessRightsPage showToast={showToast} />
          )}

          {screen === 'daycare-room-detail' && viewingDaycareRoom && (
            <DaycareChildRosterPage
              room={viewingDaycareRoom}
              onBack={goToDaycare}
              onOpenChild={handleOpenDaycareChild}
              showToast={showToast}
              onSubCrumbChange={setSubCrumb}
            />
          )}

          {screen === 'daycare-child' && viewingDaycareRoom && viewingDaycareChild && (
            <StudentProfilePage
              school={{ name: viewingDaycareRoom.name }}
              student={viewingDaycareChild}
              onBack={goToDaycareRoomDetail}
              showToast={showToast}
            />
          )}

          {screen === 'create-school' && (
            <SchoolFormPage mode="create" onCancel={goToSchools} onSubmit={handleCreateSchool} onDone={goToSchools} showToast={showToast} />
          )}

          {screen === 'edit-school' && editingSchool && (
            <SchoolFormPage mode="edit" school={editingSchool} onCancel={goToSchools} onSubmit={handleEditSchool} onDone={goToSchools} showToast={showToast} />
          )}

          {screen === 'school-detail' && viewingSchool && (
            <SchoolDetailPage
              school={viewingSchool}
              onBack={goToSchools}
              onOpenGrade={handleOpenGrade}
              showToast={showToast}
              onSubCrumbChange={setSubCrumb}
            />
          )}

          {screen === 'grade-detail' && viewingSchool && viewingGrade && (
            <StudentRosterPage
              school={viewingSchool}
              grade={viewingGrade}
              onBack={goToSchoolDetail}
              onOpenStudent={handleOpenStudent}
              showToast={showToast}
              onSubCrumbChange={setSubCrumb}
            />
          )}

          {screen === 'student' && viewingSchool && viewingStudent && (
            <StudentProfilePage
              school={viewingSchool}
              student={viewingStudent}
              onBack={goToGradeDetail}
              showToast={showToast}
            />
          )}
        </main>

        <PageFooter />
      </div>

      <Toast message={toast.message} show={toast.show} />
    </div>
  )
}
