import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import Analytics from "../../assets/Analytics(Light).svg";
import UserIcon from "../../assets/UserIcon(Light).svg";
import BackButton from "../../assets/BackButton(Light).svg";
import ArrowLeft from '../../assets/ArrowLeft.svg';
import ArrowRight from '../../assets/ArrowRight.svg';

export default function AttendanceHistoryStudent() {
  const [isOpen, setIsOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const location = useLocation();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get parameters from URL query string instead of state
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const subjectFromUrl = urlParams.get('subject_code');
    const studentFromUrl = urlParams.get('student_id');
    
    console.log('URL Parameters:', {
      subject_code: subjectFromUrl,
      student_id: studentFromUrl
    });
    
    if (subjectFromUrl) {
      setSubjectCode(subjectFromUrl);
    }
    
    if (studentFromUrl) {
      setStudentId(studentFromUrl);
    }
  }, [location.search]);

  // Get student ID from localStorage if not in URL
  useEffect(() => {
    if (studentId) return; // Already set from URL
    
    const getStudentId = () => {
      try {
        // Try userData (from AnalyticsStudent)
        const userData = localStorage.getItem('userData');
        if (userData) {
          const user = JSON.parse(userData);
          if (user.tracked_ID) {
            console.log('Found student ID in userData:', user.tracked_ID);
            return user.tracked_ID;
          }
        }
        
        // Try user (from Subjects.jsx)
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.id) {
            console.log('Found student ID in user:', user.id);
            return user.id;
          }
        }
        
        console.log('No student ID found in localStorage');
        return '';
      } catch (error) {
        console.error('Error parsing user data:', error);
        return '';
      }
    };

    const id = getStudentId();
    setStudentId(id);
    console.log('Using student ID from localStorage:', id);
  }, [studentId]);

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!studentId || !subjectCode) {
        console.log('Missing required data:', { studentId, subjectCode });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // FIXED: Correct API endpoint URL
        const attendanceUrl = `https://tracked.6minds.site/Student/AttendanceStudentDB/get_attendance_history_student.php?student_id=${studentId}&subject_code=${subjectCode}`;
        console.log('Fetching attendance from:', attendanceUrl);
        
        const response = await fetch(attendanceUrl);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Attendance history response:', data);
          if (data.success) {
            setAttendanceData(data);
          } else {
            console.error('API returned error:', data.message);
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

    fetchAttendanceData();
  }, [studentId, subjectCode]);

  // Get subject name for display
  const getSubjectName = () => {
    if (attendanceData && attendanceData.class) {
      return attendanceData.class.subject_name;
    }
    return subjectCode || 'Current Subject';
  };

  // Pagination calculations
  const getCombinedAttendanceData = () => {
    if (!attendanceData || !attendanceData.attendance_dates) return [];
    
    const { attendance_dates } = attendanceData;
    const combinedData = [];
    
    // Find the maximum length to determine how many rows to show
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
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`
          transition-all duration-300
          ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
        `}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Student" />
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
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`
          transition-all duration-300
          ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
        `}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Student" />
          <div className="p-8 text-center">
            <p className="text-red-500">Error loading attendance data.</p>
            <p className="text-sm text-gray-600 mb-4">Student: {studentId} | Subject: {subjectCode}</p>
            <Link to="/AnalyticsStudent" className="text-blue-500 hover:underline">
              Go back to Analytics
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const student = attendanceData.student || { 
    id: studentId, 
    name: "Student Name" 
  };

  const attendance = attendanceData.attendance_summary || {
    present: 0,
    late: 0,
    absent: 0,
    total: 0
  };

  return (
    <div>
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        className={`
          transition-all duration-300
          ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
        `}
      >
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Student" />

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

          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <p className="text-sm sm:text-base lg:text-lg">
              Class Attendance Details - {getSubjectName()}
            </p>
            <Link to="/AnalyticsStudent">
              <img 
                src={BackButton} 
                alt="BackButton" 
                className="h-5 w-5 sm:h-6 sm:w-6 hover:opacity-70 cursor-pointer sm:hidden" 
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
                  No attendance records found
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
                  {attendance.present}
                </span>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 rounded-md border border-blue-100">
                <p className="font-semibold text-[#2196F3] mb-1 sm:mb-2">Late</p>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {attendance.late}
                </span>
              </div>
              <div className="p-2 sm:p-3 bg-red-50 rounded-md border border-red-100">
                <p className="font-semibold text-[#FF6666] mb-1 sm:mb-2">Absent</p>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {attendance.absent}
                </span>
              </div>
              <div className="p-2 sm:p-3 bg-violet-50 rounded-md border border-violet-100">
                <p className="font-semibold text-[#9C27B0] mb-1 sm:mb-2">Total Days</p>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {attendance.total}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}