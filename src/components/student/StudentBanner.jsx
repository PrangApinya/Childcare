export default function StudentBanner({ student }) {
  return (
    <div className="student-banner">
      <div className="student-banner-top">
        <div className="student-banner-avatar">{student.initials}</div>
        <div>
          <div className="student-banner-name">{student.fullName}</div>
          <div className="student-banner-nameen">{student.nameEn}</div>
        </div>
      </div>
      <div className="student-banner-fields">
        <div><span className="lbl">เพศ</span><span className="val">{student.gender}</span></div>
        <div><span className="lbl">อายุ</span><span className="val">{student.ageLabel}</span></div>
        <div><span className="lbl">เลขบัตรประชาชน</span><span className="val tabular">{student.citizenId}</span></div>
        <div><span className="lbl">หมู่โลหิต</span><span className="val">{student.bloodType || '—'}</span></div>
        <div><span className="lbl">ที่อยู่</span><span className="val">{student.addressLabel}</span></div>
        <div><span className="lbl">ชื่อผู้ปกครอง</span><span className="val">{student.guardianName}</span></div>
        <div><span className="lbl">เบอร์ติดต่อ</span><span className="val tabular">{student.guardianPhone}</span></div>
      </div>
    </div>
  )
}
