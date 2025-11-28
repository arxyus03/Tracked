import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import SubjectDetailsIcon from '../../assets/SubjectDetails.svg';
import BackButton from '../../assets/BackButton(Light).svg';
import ArrowDown from "../../assets/ArrowDown(Light).svg";
import Search from "../../assets/Search.svg";
import StudentsIcon from "../../assets/ClassManagement(Light).svg";
import Announcement from "../../assets/Announcement(Light).svg";
import Classwork from "../../assets/Classwork(Light).svg";
import Attendance from "../../assets/Attendance(Light).svg";
import Analytics from "../../assets/Analytics(Light).svg";
import UserIcon from "../../assets/UserIcon(Light).svg";
import ArrowLeft from '../../assets/ArrowLeft.svg';
import ArrowRight from '../../assets/ArrowRight.svg';
import Details from '../../assets/Details(Light).svg';

export default function SubjectAttendanceStudent() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get('code');
  
  const [isOpen, setIsOpen] = useState(true);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState('');
  
  // Attendance states
  const [attendanceData, setAttendanceData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // New states for attendance card functionality
  const [setSubjects] = useState([]);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [attendanceSummaryData, setAttendanceSummaryData] = useState([]);
  const [attendanceCurrentPage, setAttendanceCurrentPage] = useState(1);

  // Get student ID from localStorage
  useEffect(() => {
    const getStudentId = () => {
      try {
        const userDataString = localStorage.getItem('user');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setStudentId(userData.id);
          return userData.id;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
      return null;
    };

    getStudentId();
  }, []);

  // Fetch class details
  useEffect(() => {
    if (subjectCode) {
      fetchClassDetails();
    }
  }, [subjectCode]);

  // Fetch attendance data after classInfo and studentId are available
  useEffect(() => {
    if (classInfo && studentId) {
      fetchAttendanceData();
    }
  }, [classInfo, studentId]);

  // Fetch student classes when studentId is available (for attendance card)
  useEffect(() => {
    if (!studentId || !subjectCode) return;

    const fetchStudentClasses = async () => {
      try {
        console.log('Fetching classes for student:', studentId);
        const response = await fetch(`https://tracked.6minds.site/Student/SubjectsDB/get_student_classes.php?student_id=${studentId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Full API response:', data);
        
        if (data.success && data.classes) {
          console.log('Classes found:', data.classes);
          setSubjects(data.classes);
          
          // Find and set the current subject based on subjectCode from URL
          const currentSubj = data.classes.find(sub => sub.subject_code === subjectCode);
          if (currentSubj) {
            setCurrentSubject(currentSubj);
            console.log('Current subject set:', currentSubj);
          } else {
            console.error('Current subject not found in enrolled classes');
          }
        } else {
          console.error('Failed to fetch classes:', data.message);
          setSubjects([]);
        }
      } catch (error) {
        console.error('Error fetching student classes:', error);
        setSubjects([]);
      }
    };

    fetchStudentClasses();
  }, [studentId, subjectCode]);

  // Fetch attendance summary data when studentId is available (for attendance card)
  useEffect(() => {
    if (!studentId) return;

    const fetchAttendanceSummaryData = async () => {
      try {
        console.log('Fetching attendance summary for student:', studentId);
        const response = await fetch(`https://tracked.6minds.site/Student/AttendanceStudentDB/get_attendance_student.php?student_id=${studentId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Attendance summary data:', data);
        
        if (data.success) {
          setAttendanceSummaryData(data.attendance_summary);
        } else {
          console.error('Failed to fetch attendance summary:', data.message);
        }
      } catch (error) {
        console.error('Error fetching attendance summary data:', error);
      }
    };

    fetchAttendanceSummaryData();
  }, [studentId]);

  const fetchClassDetails = async () => {
    try {
      const response = await fetch(`https://tracked.6minds.site/Student/SubjectDetailsStudentDB/get_class_details_student.php?subject_code=${subjectCode}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setClassInfo(result.class_data);
        } else {
          console.error('Error fetching class details:', result.message);
        }
      } else {
        console.error('HTTP error fetching class details:', response.status);
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
    }
  };

  // Fetch attendance data
  const fetchAttendanceData = async () => {
    if (!studentId || !subjectCode) {
      console.log('Missing required data:', { studentId, subjectCode });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
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

  // Get combined attendance data for table
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

  // Calculate attendance warnings for attendance card
  const calculateAttendanceWarnings = () => {
    if (!attendanceSummaryData.length) return { overallWarning: false, subjectWarnings: [] };

    let hasOverallWarning = false;
    const subjectWarnings = attendanceSummaryData.map(subject => {
      // Convert late arrivals to equivalent absences (3 late = 1 absent)
      const equivalentAbsences = Math.floor(subject.late / 3);
      const totalEffectiveAbsences = subject.absent + equivalentAbsences;
      
      // Check if student has warning (2 or more effective absences)
      const hasWarning = totalEffectiveAbsences >= 2;
      const isAtRisk = totalEffectiveAbsences >= 3; // 3 absences = dropped
      
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

  const { overallWarning } = calculateAttendanceWarnings();

  // Filter attendance for current subject only
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

  // Pagination calculations for attendance card
  const attendanceTotalPages = Math.ceil(filteredAttendance().length / itemsPerPage);
  const attendanceStartIndex = (attendanceCurrentPage - 1) * itemsPerPage;
  const attendanceEndIndex = attendanceStartIndex + itemsPerPage;
  const currentAttendanceCardData = filteredAttendance().slice(attendanceStartIndex, attendanceEndIndex);

  // Pagination handler
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Pagination handler for attendance card
  const handleAttendanceCardPageChange = (page) => {
    setAttendanceCurrentPage(page);
  };

  // Get current subject name
  const getCurrentSubjectName = () => {
    if (!currentSubject) {
      return `${subjectCode || 'Loading...'}`;
    }
    return `${currentSubject.subject || 'Unknown Subject'} (${currentSubject.section})`;
  };

  // Pagination Component
  const Pagination = ({ currentPage, totalPages, onPageChange, dataType }) => {
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
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, dataType === 'attendanceHistory' ? combinedAttendanceData.length : filteredAttendance().length)} of {dataType === 'attendanceHistory' ? combinedAttendanceData.length : filteredAttendance().length} entries
        </div>
        
        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
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
              onClick={() => onPageChange(page)}
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
            onClick={() => onPageChange(currentPage + 1)}
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

  // Get student info for display
  const student = attendanceData?.student || { 
    id: studentId, 
    name: "Student Name" 
  };

  // Get attendance summary
  const attendance = attendanceData?.attendance_summary || {
    present: 0,
    late: 0,
    absent: 0,
    total: 0
  };

  if (loading) {
    return (
      <div>
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-5 text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* Main Content */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          
          {/* Page Header */}
          <div className="mb-4 sm:mb-4">
            <div className="flex items-center mb-2">
              <img
                src={Attendance}
                alt="Attendance"
                className="h-7 w-7 sm:h-9 sm:w-9 mr-2 sm:mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                Attendance
              </h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-[#465746]">
              View your class attendance records
            </p>
          </div>

          {/* Subject Information */}
          <div className="flex flex-col gap-2 text-sm sm:text-base lg:text-[1.125rem] text-[#465746] mb-4 sm:mb-5">
            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT CODE:</span>
              <span>{classInfo?.subject_code || subjectCode || 'Loading...'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT:</span>
              <span>{classInfo?.subject || 'Loading...'}</span>
            </div>

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="font-semibold">SECTION:</span>
                <span>{classInfo?.section || 'Loading...'}</span>
              </div>
              <Link to={"/Subjects"}>
                <img 
                  src={BackButton} 
                  alt="Back" 
                  className="h-6 w-6 cursor-pointer hover:opacity-70 transition-opacity" 
                />
              </Link>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full mt-4 sm:mt-5 gap-3">
            {/* Navigation buttons - Stack on mobile, row on tablet/desktop */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              {/* Class Announcements Button - Active state with different background */}
              <Link to={`/SubjectAnnouncementStudent?code=${subjectCode}`} className="flex-1 sm:flex-initial">
                <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#e6f4ea] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#d4edd8] transition-all duration-300 cursor-pointer w-full sm:w-auto">
                  <img 
                    src={Announcement} 
                    alt="" 
                    className="h-4 w-4 sm:h-5 sm:w-5"
                  />
                  <span className="sm:inline">Announcement</span>
                </button>
              </Link>

              {/* School Works and Attendance - Side by side on all screens */}
              <div className="flex gap-3 w-full sm:w-auto">
                <Link to={`/SubjectSchoolWorksStudent?code=${subjectCode}`} className="flex-1 min-w-0">
                  <button className="flex items-center justify-center gap-2 px-3 sm:px-5 py-2 bg-[#e6f0ff] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#d4e3ff] transition-all duration-300 cursor-pointer w-full">
                    <img 
                      src={Classwork} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0"
                    />
                    <span className="whitespace-nowrap truncate">School Works</span>
                  </button>
                </Link>

                <Link to={`/SubjectAttendanceStudent?code=${subjectCode}`} className="flex-1 sm:flex-initial">
                  <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#fff4e6] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#ffebd4] transition-all duration-300 cursor-pointer w-full sm:w-auto">
                    <img 
                      src={Attendance} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <span className="sm:inline">Attendance</span>
                  </button>
                </Link>

                <Link to={`/SubjectAnalyticsStudent?code=${subjectCode}`} className="flex-1 sm:flex-initial">
                  <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#f0e6ff] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#e6d4ff] transition-all duration-300 cursor-pointer w-full sm:w-auto">
                    <img 
                      src={Analytics} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <span className="sm:inline">Reports</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Action buttons - Icons only on mobile/tablet, unchanged on desktop */}
            <div className="flex items-center gap-2 justify-end sm:justify-start mt-3 sm:mt-0 w-full sm:w-auto">
              <Link to={`/SubjectListStudent?code=${subjectCode}`}>
                <button className="p-2 bg-[#fff] rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 flex-shrink-0 cursor-pointer w-10 h-10 sm:w-auto sm:h-auto">
                  <img 
                    src={StudentsIcon} 
                    alt="Student List" 
                    className="h-5 w-5 sm:h-6 sm:w-6" 
                  />
                </button>
              </Link>
            </div>
          </div>

          {/* ATTENDANCE CONTENT */}
          <div className="mt-4 sm:mt-5">
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
                {classInfo?.section && (
                  <p className="text-xs text-gray-600 mt-1">
                    Section: {classInfo.section}
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
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    dataType="attendanceHistory"
                  />
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
                <div className="p-2 sm:p-3 bg-yellow-50 rounded-md border border-blue-100">
                  <p className="font-semibold text-[#F59E0B] mb-1 sm:mb-2">Late</p>
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
                  <p className="font-semibold text-[#9C27B0] mb-1 sm:mb-2">Total Classes</p>
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                    {attendance.total}
                  </span>
                </div>
              </div>
            </div>

            {/* ATTENDANCE CARD FROM ANALYTICS PAGE */}
            <div className="bg-[#fff] rounded-lg sm:rounded-xl shadow-md mt-4 sm:mt-5 p-4 sm:p-5 text-[#465746]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-base sm:text-lg lg:text-xl font-bold">
                  Attendance Tracking
                </p>
                {overallWarning && (
                  <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Attendance Warnings
                  </div>
                )}
              </div>
              <p className="text-xs sm:text-sm lg:text-base mb-3 sm:mb-4">
                Note: Students with 
                <span className='text-[#FF6666] font-bold'> 3 (Three) accumulated absences </span>
                will be 
                <span className='text-[#FF6666] font-bold'> dropped </span>
                from the class.
                <span className='text-[#F59E0B] font-bold'> 3 (Three) late arrivals </span>
                are equivalent to
                <span className='text-[#F59E0B] font-bold'> 1 (One) absent. </span>
              </p>
              <hr className="border-[#465746]/30 mb-3 sm:mb-4" />
              
              {currentAttendanceCardData.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-[#465746]">No attendance data available for {getCurrentSubjectName()}.</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                    <table className="min-w-full border-collapse text-xs sm:text-sm lg:text-base">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold">Subject</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#00A15D]">Present</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#F59E0B]">Late</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#FF6666]">Absent</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold whitespace-nowrap">Effective Absences</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold whitespace-nowrap">Total Classes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentAttendanceCardData.map((subject) => (
                          <tr key={subject.subject_code} className={`border-b ${subject.isAtRisk ? 'bg-red-50' : subject.hasWarning ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                <span className="font-medium">{subject.subject_name}</span>
                                {subject.warningMessage && (
                                  <div className={`text-xs sm:text-sm ${subject.isAtRisk ? 'text-red-600' : 'text-yellow-600'}`}>
                                    <span className='font-bold'>⚠️ {subject.isAtRisk ? 'CRITICAL' : 'Warning'}:</span>
                                    <span> {subject.warningMessage.split(':')[1]}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#00A15D] font-medium">{subject.present}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#F59E0B] font-medium">{subject.late}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#FF6666] font-medium">{subject.absent}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 font-bold">
                              <span className={subject.totalEffectiveAbsences >= 3 ? 'text-red-600' : subject.totalEffectiveAbsences >= 2 ? 'text-yellow-600' : 'text-gray-600'}>
                                {subject.totalEffectiveAbsences}
                              </span>
                              <span className="text-xs text-gray-500 ml-1">
                                ({subject.absent} + {subject.equivalentAbsences})
                              </span>
                            </td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{subject.total_classes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Attendance Tracking Pagination */}
              {currentAttendanceCardData.length > 0 && (
                <Pagination
                  currentPage={attendanceCurrentPage}
                  totalPages={attendanceTotalPages}
                  onPageChange={handleAttendanceCardPageChange}
                  dataType="attendanceCard"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}