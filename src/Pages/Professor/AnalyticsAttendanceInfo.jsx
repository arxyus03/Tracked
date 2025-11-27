import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import Analytics from "../../assets/Analytics(Light).svg";
import UserIcon from "../../assets/UserIcon(Light).svg";
import BackButton from "../../assets/BackButton(Light).svg";
import ArrowLeft from '../../assets/ArrowLeft.svg';
import ArrowRight from '../../assets/ArrowRight.svg';

export default function AnalyticsAttendanceInfo() {
  const [isOpen, setIsOpen] = useState(true);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [section, setSection] = useState('');
  const [professorId, setProfessorId] = useState('');
  const location = useLocation();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get professor ID from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setProfessorId(user.id || '');
      } catch {
        setProfessorId('');
      }
    } else {
      setProfessorId('');
    }
  }, []);

  // Get parameters from URL query string and state
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const subjectFromUrl = urlParams.get('subject_code');
    const studentFromUrl = urlParams.get('student_id');
    const sectionFromUrl = urlParams.get('section');
    
    console.log('URL Parameters:', {
      subject_code: subjectFromUrl,
      student_id: studentFromUrl,
      section: sectionFromUrl
    });
    
    if (subjectFromUrl) {
      setSubjectCode(subjectFromUrl);
    }
    
    if (studentFromUrl) {
      setStudentId(studentFromUrl);
    }

    if (sectionFromUrl) {
      setSection(sectionFromUrl);
    }

    // Also check location state for data passed via navigation
    if (location.state) {
      const { student, subjectCode: stateSubject, section: stateSection } = location.state;
      if (stateSubject && !subjectFromUrl) setSubjectCode(stateSubject);
      if (stateSection && !sectionFromUrl) setSection(stateSection);
      if (student && !studentFromUrl) setStudentId(student.id || student.student_ID);
    }
  }, [location.search, location.state]);

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!studentId || !subjectCode || !professorId) {
        console.log('Missing required data:', { studentId, subjectCode, professorId });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Using the professor's attendance history endpoint (returns all students)
        const attendanceUrl = `https://tracked.6minds.site/Professor/AttendanceDB/get_attendance_history.php?subject_code=${subjectCode}&professor_ID=${professorId}`;
        
        console.log('Fetching attendance from:', attendanceUrl);
        
        const response = await fetch(attendanceUrl);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Attendance history response:', data);
          
          if (data.success && Array.isArray(data.attendance_history)) {
            // Process the data to extract just this student's attendance
            processAttendanceData(data.attendance_history, studentId);
          } else {
            console.error('API returned error or no data:', data.message);
            setAttendanceData(null);
          }
        } else {
          console.error('HTTP error:', response.status);
          setAttendanceData(null);
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setAttendanceData(null);
      } finally {
        setLoading(false);
      }
    };

    if (professorId) {
      fetchAttendanceData();
    }
  }, [studentId, subjectCode, professorId]);

  const processAttendanceData = (attendanceHistory, targetStudentId) => {
    const absentDates = [];
    const lateDates = [];
    let studentName = 'Student';

    // Process each attendance day
    attendanceHistory.forEach(day => {
      if (!Array.isArray(day.students)) return;

      // Find the target student in this day's attendance
      const studentRecord = day.students.find(student => 
        student.student_ID === targetStudentId
      );

      if (studentRecord) {
        // Get student name from first record found
        if (studentName === 'Student' && studentRecord.user_Name) {
          studentName = studentRecord.user_Name;
        }

        const status = String(studentRecord.status).toLowerCase();
        const formattedDate = formatAttendanceDate(day.date || day.raw_date);

        if (status === 'late') {
          lateDates.push({
            date: formattedDate,
            rawDate: day.date || day.raw_date
          });
        } else if (status === 'absent') {
          absentDates.push({
            date: formattedDate,
            rawDate: day.date || day.raw_date
          });
        }
      } else {
        // Student not found in this day's record - treat as absent
        absentDates.push({
          date: formatAttendanceDate(day.date || day.raw_date),
          rawDate: day.date || day.raw_date
        });
      }
    });

    const presentCount = attendanceHistory.length - (lateDates.length + absentDates.length);
    const lateCount = lateDates.length;
    const absentCount = absentDates.length;
    const total = attendanceHistory.length;

    setAttendanceData({
      student: {
        id: targetStudentId,
        name: studentName
      },
      attendanceSummary: {
        present: presentCount,
        late: lateCount,
        absent: absentCount,
        total: total
      },
      attendanceDates: {
        late: lateDates.map(d => d.date),
        absent: absentDates.map(d => d.date)
      },
      rawData: {
        late: lateDates,
        absent: absentDates
      }
    });
  };

  const formatAttendanceDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  // Get subject name for display
  const getSubjectName = () => {
    return subjectCode || 'Current Subject';
  };

  // Pagination calculations
  const getCombinedAttendanceData = () => {
    if (!attendanceData) return [];
    
    const { attendanceDates } = attendanceData;
    const combinedData = [];
    
    // Find the maximum length to determine how many rows to show
    const maxRows = Math.max(
      attendanceDates.absent.length, 
      attendanceDates.late.length
    );
    
    for (let i = 0; i < maxRows; i++) {
      combinedData.push({
        absentDate: attendanceDates.absent[i] || "—",
        lateDate: attendanceDates.late[i] || "—",
        index: i
      });
    }
    
    return combinedData;
  };

  const combinedAttendanceData = getCombinedAttendanceData();
  const totalPages = Math.ceil(combinedAttendanceData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAttendanceData = combinedAttendanceData.slice(startIndex, endIndex);

  // Pagination handler
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Pagination Component
  const Pagination = () => {
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
        <div className="text-xs sm:text-sm text-gray-600">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, combinedAttendanceData.length)} of {combinedAttendanceData.length} entries
        </div>
        
        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center justify-center w-8 h-8 rounded-md border ${
              currentPage === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300' 
                : 'bg-white text-[#465746] border-gray-300 hover:bg-gray-50 cursor-pointer'
            }`}
          >
            <img src={ArrowLeft} alt="Previous" className="w-5 h-5" />
          </button>

          {/* Page Numbers */}
          {pageNumbers.map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`cursor-pointer flex items-center justify-center w-8 h-8 rounded-md border text-sm font-medium ${
                currentPage === page
                  ? 'bg-[#465746] text-white border-[#465746]'
                  : 'bg-white text-[#465746] border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex items-center justify-center w-8 h-8 rounded-md border ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                : 'bg-white text-[#465746] border-gray-300 hover:bg-gray-50 cursor-pointer'
            }`}
          >
            <img src={ArrowRight} alt="Next" className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div>
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`
          transition-all duration-300
          ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
        `}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-8 text-center">
            <p className="text-gray-500">Loading attendance data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!attendanceData) {
    return (
      <div>
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`
          transition-all duration-300
          ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
        `}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-8 text-center">
            <p className="text-red-500">Error loading attendance data.</p>
            <p className="text-sm text-gray-600 mb-4">
              Student: {studentId} | Subject: {subjectCode} {section ? `| Section: ${section}` : ''}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Please check if the student is enrolled in this class.
            </p>
            <Link to="/AnalyticsProf" className="text-blue-500 hover:underline">
              Go back to Analytics
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { student, attendanceSummary } = attendanceData;

  return (
    <div>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        className={`
          transition-all duration-300
          ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
        `}
      >
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* PAGE CONTENT */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8 text-[#465746]">
          {/* HEADER */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img 
                src={Analytics} 
                alt="Analytics" 
                className="h-6 w-6 sm:h-7 sm:w-7 mr-3" 
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl">
                Analytics
              </h1>
            </div>
          </div>

          {/* UPDATED BACK BUTTON - FIXED */}
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <p className="text-sm sm:text-base lg:text-lg">
              Student Attendance Details - {getSubjectName()} {section && `- Section ${section}`}
            </p>
            <Link 
              to="/AnalyticsIndividualInfo" 
              state={{
                student: attendanceData?.student,
                subjectCode: subjectCode,
                section: section
              }}
              className="flex items-center gap-2 hover:opacity-70 transition-opacity"
            >
              <img 
                src={BackButton} 
                alt="BackButton" 
                className="h-5 w-5 sm:h-6 sm:w-6" 
              />
            </Link>
          </div>

          <hr className="border-[#465746]/30 mb-4 sm:mb-5" />

          {/* STUDENT INFO */}
          <div className="flex items-center bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mb-4 sm:mb-5 gap-3 sm:gap-4">
            <img 
              src={UserIcon} 
              alt="User" 
              className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" 
            />
            <div>
              <p className="text-xs sm:text-sm lg:text-base">
                Student No: {student.id}
              </p>
              <p className="font-bold text-base sm:text-lg lg:text-xl">
                {student.name}
              </p>
              {section && (
                <p className="text-xs text-gray-600 mt-1">
                  Section: {section}
                </p>
              )}
            </div>
          </div>

          {/* ATTENDANCE DATES */}
          <div className="bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mb-4 sm:mb-5">
            <p className="font-bold mb-3 text-base sm:text-lg lg:text-xl">
              Attendance History ({combinedAttendanceData.length} records)
            </p>
            <hr className="border-[#465746]/30 mb-3 sm:mb-4" />

            {combinedAttendanceData.length > 0 ? (
              <>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                    <div className="overflow-hidden rounded-lg border border-gray-300">
                      <table className="min-w-full text-left border-collapse text-xs sm:text-sm lg:text-base">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="p-2 sm:p-3 font-bold text-[#FF6666]">Date Absent</th>
                            <th className="p-2 sm:p-3 font-bold text-[#2196F3]">Date Late</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentAttendanceData.map((record) => (
                            <tr key={record.index} className="hover:bg-gray-50 border-b border-gray-200 last:border-0">
                              <td className="p-2 sm:p-3 text-[#FF6666]">
                                {record.absentDate}
                              </td>
                              <td className="p-2 sm:p-3 text-[#2196F3]">
                                {record.lateDate}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <Pagination />
              </>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  No attendance records found for this student.
                </p>
              </div>
            )}
          </div>

          {/* TOTALS */}
          <div className="bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mb-6 sm:mb-8 lg:mb-10">
            <p className="font-bold mb-3 sm:mb-4 text-base sm:text-lg lg:text-xl">
              Attendance Summary
            </p>
            <hr className="border-[#465746]/30 mb-3 sm:mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center text-xs sm:text-sm lg:text-base">
              <div className="p-2 sm:p-3 bg-green-50 rounded-md border border-green-100">
                <p className="font-semibold text-[#00A15D] mb-1 sm:mb-2">Present</p>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {attendanceSummary.present}
                </span>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 rounded-md border border-blue-100">
                <p className="font-semibold text-[#2196F3] mb-1 sm:mb-2">Late</p>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {attendanceSummary.late}
                </span>
              </div>
              <div className="p-2 sm:p-3 bg-red-50 rounded-md border border-red-100">
                <p className="font-semibold text-[#FF6666] mb-1 sm:mb-2">Absent</p>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {attendanceSummary.absent}
                </span>
              </div>
              <div className="p-2 sm:p-3 bg-violet-50 rounded-md border border-violet-100">
                <p className="font-semibold text-[#9C27B0] mb-1 sm:mb-2">Total Days</p>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {attendanceSummary.total}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}