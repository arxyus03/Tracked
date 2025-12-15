import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

// ========== IMPORT ASSETS ==========
import BackButton from '../../assets/BackButton.svg';
import ArrowDown from "../../assets/ArrowDown.svg";
import Search from "../../assets/Search.svg";
import StudentsIcon from "../../assets/StudentList.svg";
import Announcement from "../../assets/Announcement.svg";
import Classwork from "../../assets/Classwork.svg";
import Attendance from "../../assets/Attendance.svg";
import Analytics from "../../assets/Analytics.svg";
import UserIcon from "../../assets/StudentList.svg";
import ArrowLeft from '../../assets/ArrowLeft.svg';
import ArrowRight from '../../assets/ArrowRight.svg';
import SubjectOverview from "../../assets/SubjectOverview.svg"; // Add this import

// ========== PAGINATION COMPONENT ==========
const Pagination = ({ currentPage, totalPages, onPageChange, dataType, startIndex, endIndex, totalItems }) => {
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pageNumbers = [];
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-2">
      <div className="text-xs sm:text-sm text-[#FFFFFF]/60">
        Showing {startIndex} to {endIndex} of {totalItems} entries
      </div>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center justify-center w-8 h-8 rounded-md border ${
            currentPage === 1 
              ? 'bg-[#15151C] text-[#FFFFFF]/40 cursor-not-allowed border-[#FFFFFF]/10' 
              : 'bg-[#15151C] text-[#FFFFFF] border-[#FFFFFF]/20 hover:bg-[#23232C] cursor-pointer'
          }`}
        >
          <img src={ArrowLeft} alt="Previous" className="w-5 h-5" />
        </button>

        {pageNumbers.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`cursor-pointer flex items-center justify-center w-8 h-8 rounded-md border text-sm font-medium ${
              currentPage === page
                ? 'bg-[#00A15D] text-[#FFFFFF] border-[#00A15D]'
                : 'bg-[#15151C] text-[#FFFFFF] border-[#FFFFFF]/20 hover:bg-[#23232C]'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center justify-center w-8 h-8 rounded-md border ${
            currentPage === totalPages
              ? 'bg-[#15151C] text-[#FFFFFF]/40 cursor-not-allowed border-[#FFFFFF]/10'
              : 'bg-[#15151C] text-[#FFFFFF] border-[#FFFFFF]/20 hover:bg-[#23232C] cursor-pointer'
          }`}
        >
          <img src={ArrowRight} alt="Next" className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// ========== MAIN COMPONENT ==========
export default function SubjectAttendanceStudent() {
  // ========== STATE VARIABLES ==========
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get('code');
  
  const [isOpen, setIsOpen] = useState(true);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState('');
  const [attendanceData, setAttendanceData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [attendanceSummaryData, setAttendanceSummaryData] = useState([]);
  const [attendanceCurrentPage, setAttendanceCurrentPage] = useState(1);
  
  const itemsPerPage = 10;

  // ========== USE EFFECTS ==========
  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setStudentId(userData.id);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (subjectCode) fetchClassDetails();
  }, [subjectCode]);

  useEffect(() => {
    if (classInfo && studentId) {
      fetchAttendanceData();
      fetchAttendanceSummaryData();
    }
  }, [classInfo, studentId]);

  // ========== API CALL FUNCTIONS ==========
  const fetchClassDetails = async () => {
    try {
      const response = await fetch(`https://tracked.6minds.site/Student/SubjectDetailsStudentDB/get_class_details_student.php?subject_code=${subjectCode}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) setClassInfo(result.class_data);
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
    }
  };

  const fetchAttendanceData = async () => {
    if (!studentId || !subjectCode) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const attendanceUrl = `https://tracked.6minds.site/Student/AttendanceStudentDB/get_attendance_history_student.php?student_id=${studentId}&subject_code=${subjectCode}`;
      
      const response = await fetch(attendanceUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAttendanceData(data);
        } else {
          setAttendanceData(null);
        }
      } else {
        setAttendanceData(null);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setAttendanceData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceSummaryData = async () => {
    if (!studentId) return;

    try {
      const response = await fetch(`https://tracked.6minds.site/Student/AttendanceStudentDB/get_attendance_student.php?student_id=${studentId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAttendanceSummaryData(data.attendance_summary);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance summary data:', error);
    }
  };

  // ========== HELPER FUNCTIONS ==========
  const getCombinedAttendanceData = () => {
    if (!attendanceData || !attendanceData.attendance_dates) return [];
    
    const { attendance_dates } = attendanceData;
    const combinedData = [];
    
    const maxRows = Math.max(
      attendance_dates.absent.length, 
      attendance_dates.late.length
    );
    
    for (let i = 0; i < maxRows; i++) {
      combinedData.push({
        absentDate: attendance_dates.absent[i] || "—",
        lateDate: attendance_dates.late[i] || "—",
        index: i
      });
    }
    
    return combinedData;
  };

  const calculateAttendanceWarnings = () => {
    if (!attendanceSummaryData.length) return { overallWarning: false, subjectWarnings: [] };

    let hasOverallWarning = false;
    const subjectWarnings = attendanceSummaryData.map(subject => {
      const equivalentAbsences = Math.floor(subject.late / 3);
      const totalEffectiveAbsences = subject.absent + equivalentAbsences;
      
      const hasWarning = totalEffectiveAbsences >= 2;
      const isAtRisk = totalEffectiveAbsences >= 3;
      
      if (hasWarning) hasOverallWarning = true;

      return {
        ...subject,
        equivalentAbsences,
        totalEffectiveAbsences,
        hasWarning,
        isAtRisk,
        warningMessage: isAtRisk 
          ? `CRITICAL: You have ${totalEffectiveAbsences} effective absences (${subject.absent} absents + ${equivalentAbsences} from ${subject.late} lates). You are at risk of being dropped!`
          : hasWarning
          ? `Warning: You have ${totalEffectiveAbsences} effective absences (${subject.absent} absents + ${equivalentAbsences} from ${subject.late} lates)`
          : null
      };
    });

    return { overallWarning: hasOverallWarning, subjectWarnings };
  };

  // ========== DATA PROCESSING ==========
  const { overallWarning } = calculateAttendanceWarnings();

  const filteredAttendance = () => {
    if (!subjectCode) return [];
    return calculateAttendanceWarnings().subjectWarnings.filter(subject => 
      subject.subject_code === subjectCode
    );
  };

  const combinedAttendanceData = getCombinedAttendanceData();
  const totalPages = Math.ceil(combinedAttendanceData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAttendanceData = combinedAttendanceData.slice(startIndex, endIndex);

  const attendanceTotalPages = Math.ceil(filteredAttendance().length / itemsPerPage);
  const attendanceStartIndex = (attendanceCurrentPage - 1) * itemsPerPage;
  const attendanceEndIndex = attendanceStartIndex + itemsPerPage;
  const currentAttendanceCardData = filteredAttendance().slice(attendanceStartIndex, attendanceEndIndex);

  // ========== HANDLER FUNCTIONS ==========
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleAttendanceCardPageChange = (page) => {
    setAttendanceCurrentPage(page);
  };

  const getCurrentSubjectName = () => {
    return `${classInfo?.subject || 'Unknown Subject'} (${classInfo?.section || 'N/A'})`;
  };

  // ========== RENDER HELPERS ==========
  const renderActionButton = (to, icon, label, active = false, colorClass = "") => (
    <Link to={`${to}?code=${subjectCode}`} className="flex-1 sm:flex-initial min-w-0">
      <button className={`flex items-center justify-center gap-2 px-3 py-2 font-semibold text-sm rounded-md shadow-md border-2 transition-all duration-300 cursor-pointer w-full sm:w-auto ${
        active 
          ? 'bg-[#FFA600]/20 text-[#FFA600] border-[#FFA600]/30 hover:bg-[#FFA600]/30' 
          : colorClass
      }`}>
        <img src={icon} alt="" className="h-4 w-4" />
        <span className="sm:inline truncate">{label}</span>
      </button>
    </Link>
  );

  const renderStatusBadge = (label, count, color) => (
    <div className={`p-2.5 rounded-md border ${color.bg} ${color.border}`}>
      <p className="font-semibold text-xs mb-1" style={{ color: color.text }}>{label}</p>
      <span className="text-base sm:text-lg lg:text-xl font-bold text-[#FFFFFF]">
        {count}
      </span>
    </div>
  );

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className="bg-[#23232C] min-h-screen">
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-8 text-center text-[#FFFFFF]">Loading attendance data...</div>
        </div>
      </div>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <div className="bg-[#23232C] min-h-screen">
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* ========== MAIN CONTENT ========== */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-6">
          
          {/* ========== PAGE HEADER ========== */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <img src={Attendance} alt="Attendance" className="h-6 w-6 sm:h-7 sm:w-7 mr-2" />
              <h1 className="font-bold text-xl lg:text-2xl text-[#FFFFFF]">Attendance</h1>
            </div>
            <p className="text-sm lg:text-base text-[#FFFFFF]/80">View your class attendance records</p>
          </div>

          {/* ========== CLASS INFORMATION ========== */}
          <div className="flex flex-col gap-1 text-sm text-[#FFFFFF]/80 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">SUBJECT:</span>
              <span>{classInfo?.subject || 'Loading...'}</span>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="font-semibold">SECTION:</span>
                <span>{classInfo?.section || 'Loading...'}</span>
              </div>
              <Link to="/Subjects">
                <img 
                  src={BackButton} 
                  alt="Back" 
                  className="h-5 w-5 cursor-pointer hover:opacity-70 transition-opacity" 
                />
              </Link>
            </div>
          </div>

          <hr className="border-[#FFFFFF]/30 mb-4" />

          {/* ========== ACTION BUTTONS ========== */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              {/* New Subject Name Overview Button (Red) */}
              <Link to={`/SubjectOverviewStudent?code=${subjectCode}`} className="flex-1 sm:flex-initial min-w-0">
                <button className="flex items-center justify-center gap-2 px-3 py-2 font-semibold text-sm rounded-md shadow-md border-2 transition-all duration-300 cursor-pointer w-full sm:w-auto bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]/30 hover:bg-[#FF5252]/30">
                  <img src={SubjectOverview} alt="" className="h-4 w-4" />
                  <span className="sm:inline truncate">{classInfo?.subject || 'Subject'} Overview</span>
                </button>
              </Link>
              
              {/* Existing buttons */}
              {renderActionButton("/SubjectAnnouncementStudent", Announcement, "Announcements", false, "bg-[#767EE0]/20 text-[#767EE0] border-[#767EE0]/30 hover:bg-[#767EE0]/30")}
              {renderActionButton("/SubjectSchoolWorksStudent", Classwork, "School Works", false, "bg-[#00A15D]/20 text-[#00A15D] border-[#00A15D]/30 hover:bg-[#00A15D]/30")}
              {renderActionButton("/SubjectAttendanceStudent", Attendance, "Attendance", true)}
              {renderActionButton("/SubjectAnalyticsStudent", Analytics, "Reports", false, "bg-[#B39DDB]/20 text-[#B39DDB] border-[#B39DDB]/30 hover:bg-[#B39DDB]/30")}
            </div>
            <Link to={`/SubjectListStudent?code=${subjectCode}`} className="sm:self-start">
              <button className="p-2 bg-[#15151C] rounded-md shadow-md border-2 border-transparent hover:border-[#FFA600] transition-all duration-200 cursor-pointer">
                <img src={StudentsIcon} alt="Student List" className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {/* ========== ATTENDANCE CONTENT ========== */}
          <div className="mt-4">
            {/* STUDENT INFO - Smaller */}
            <div className="flex items-center bg-[#15151C] p-4 rounded-lg shadow-md mb-4 gap-3">
              <img src={UserIcon} alt="User" className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="text-xs text-[#FFFFFF]/80">
                  Student No: {studentId}
                </p>
                <p className="font-bold text-base text-[#FFFFFF]">
                  {attendanceData?.student?.name || "Student Name"}
                </p>
                {classInfo?.section && (
                  <p className="text-xs text-[#FFFFFF]/60 mt-0.5">
                    Section: {classInfo.section}
                  </p>
                )}
              </div>
            </div>

            {/* ATTENDANCE DATES - Smaller */}
            <div className="bg-[#15151C] p-4 rounded-lg shadow-md mb-4">
              <p className="font-bold mb-3 text-base text-[#FFFFFF]">
                Attendance History ({combinedAttendanceData.length} records)
              </p>
              <hr className="border-[#FFFFFF]/30 mb-3" />

              {combinedAttendanceData.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                      <div className="overflow-hidden rounded-md border border-[#FFFFFF]/10">
                        <table className="min-w-full text-left border-collapse text-xs">
                          <thead className="bg-[#23232C]">
                            <tr>
                              <th className="p-2 font-bold text-[#A15353]">Date Absent</th>
                              <th className="p-2 font-bold text-[#FFA600]">Date Late</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentAttendanceData.map((record) => (
                              <tr key={record.index} className="hover:bg-[#23232C] border-b border-[#FFFFFF]/10 last:border-0">
                                <td className="p-2 text-[#A15353]">
                                  {record.absentDate}
                                </td>
                                <td className="p-2 text-[#FFA600]">
                                  {record.lateDate}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    dataType="attendanceHistory"
                    startIndex={startIndex + 1}
                    endIndex={Math.min(endIndex, combinedAttendanceData.length)}
                    totalItems={combinedAttendanceData.length}
                  />
                </>
              ) : (
                <div className="text-center py-6 bg-[#23232C] rounded-lg">
                  <p className="text-[#FFFFFF]/60 text-sm">
                    No attendance records found
                  </p>
                </div>
              )}
            </div>

            {/* TOTALS - Smaller */}
            <div className="bg-[#15151C] p-4 rounded-lg shadow-md mb-6">
              <p className="font-bold mb-3 text-base text-[#FFFFFF]">
                Attendance Summary
              </p>
              <hr className="border-[#FFFFFF]/30 mb-3" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {renderStatusBadge("Present", attendanceData?.attendance_summary?.present || 0, {
                  bg: "bg-[#00A15D]/10",
                  border: "border-[#00A15D]/20",
                  text: "#00A15D"
                })}
                {renderStatusBadge("Late", attendanceData?.attendance_summary?.late || 0, {
                  bg: "bg-[#FFA600]/10",
                  border: "border-[#FFA600]/20",
                  text: "#FFA600"
                })}
                {renderStatusBadge("Absent", attendanceData?.attendance_summary?.absent || 0, {
                  bg: "bg-[#A15353]/10",
                  border: "border-[#A15353]/20",
                  text: "#A15353"
                })}
                {renderStatusBadge("Total Classes", attendanceData?.attendance_summary?.total || 0, {
                  bg: "bg-[#B39DDB]/10",
                  border: "border-[#B39DDB]/20",
                  text: "#B39DDB"
                })}
              </div>
            </div>

            {/* ATTENDANCE TRACKING CARD - Smaller */}
            <div className="bg-[#15151C] rounded-lg shadow-md mt-4 p-4 text-[#FFFFFF]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-base font-bold">
                  Attendance Tracking
                </p>
                {overallWarning && (
                  <div className="flex items-center bg-[#FFA600]/20 text-[#FFA600] px-2 py-1 rounded-full text-xs font-medium">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Attendance Warnings
                  </div>
                )}
              </div>
              <p className="text-xs mb-3 text-[#FFFFFF]/80">
                Note: Students with 
                <span className='text-[#A15353] font-bold'> 3 (Three) accumulated absences </span>
                will be 
                <span className='text-[#A15353] font-bold'> dropped </span>
                from the class.
                <span className='text-[#FFA600] font-bold'> 3 (Three) late arrivals </span>
                are equivalent to
                <span className='text-[#FFA600] font-bold'> 1 (One) absent. </span>
              </p>
              <hr className="border-[#FFFFFF]/30 mb-3" />
              
              {currentAttendanceCardData.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-[#FFFFFF]/80 text-sm">No attendance data available for {getCurrentSubjectName()}.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-[#FFFFFF]/20">
                          <th className="px-3 py-2 text-left font-bold">Subject</th>
                          <th className="px-3 py-2 text-left font-bold text-[#00A15D]">Present</th>
                          <th className="px-3 py-2 text-left font-bold text-[#FFA600]">Late</th>
                          <th className="px-3 py-2 text-left font-bold text-[#A15353]">Absent</th>
                          <th className="px-3 py-2 text-left font-bold whitespace-nowrap">Effective Absences</th>
                          <th className="px-3 py-2 text-left font-bold whitespace-nowrap text-[#B39DDB]">Total Classes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentAttendanceCardData.map((subject) => (
                          <tr key={subject.subject_code} className={`border-b ${subject.isAtRisk ? 'bg-[#A15353]/10' : subject.hasWarning ? 'bg-[#FFA600]/10' : 'hover:bg-[#23232C]'}`}>
                            <td className="px-3 py-2">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                <span className="font-medium">{subject.subject_name}</span>
                                {subject.warningMessage && (
                                  <div className={`text-xs ${subject.isAtRisk ? 'text-[#A15353]' : 'text-[#FFA600]'}`}>
                                    <span className='font-bold'>⚠️ {subject.isAtRisk ? 'CRITICAL' : 'Warning'}:</span>
                                    <span> {subject.warningMessage.split(':')[1]}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-[#00A15D] font-medium">{subject.present}</td>
                            <td className="px-3 py-2 text-[#FFA600] font-medium">{subject.late}</td>
                            <td className="px-3 py-2 text-[#A15353] font-medium">{subject.absent}</td>
                            <td className="px-3 py-2 font-bold">
                              <span className={subject.totalEffectiveAbsences >= 3 ? 'text-[#A15353]' : subject.totalEffectiveAbsences >= 2 ? 'text-[#FFA600]' : 'text-[#FFFFFF]'}>
                                {subject.totalEffectiveAbsences}
                              </span>
                              <span className="text-[10px] text-[#FFFFFF]/50 ml-1">
                                ({subject.absent} + {subject.equivalentAbsences})
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-[#B39DDB]">{subject.total_classes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <Pagination
                    currentPage={attendanceCurrentPage}
                    totalPages={attendanceTotalPages}
                    onPageChange={handleAttendanceCardPageChange}
                    dataType="attendanceCard"
                    startIndex={attendanceStartIndex + 1}
                    endIndex={Math.min(attendanceEndIndex, filteredAttendance().length)}
                    totalItems={filteredAttendance().length}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}