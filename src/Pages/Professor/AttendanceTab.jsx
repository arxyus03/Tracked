import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

// ========== IMPORT ASSETS ==========
import AttendanceIcon from '../../assets/Attendance.svg'; // Changed to dark theme
import BackButton from '../../assets/BackButton.svg'; // Changed to dark theme
import Search from "../../assets/Search.svg";
import SuccessIcon from '../../assets/Success(Green).svg';
import ErrorIcon from '../../assets/Error(Red).svg';
import RemoveIcon from '../../assets/Delete.svg'; // Changed to Remove icon
import HistoryIcon from '../../assets/History.svg'; // Changed to dark theme
import ClassManagementIcon from "../../assets/ClassManagement.svg"; // Changed to dark theme
import Announcement from "../../assets/Announcement.svg"; // Changed to dark theme
import Classwork from "../../assets/Classwork.svg"; // Changed to dark theme
import GradeIcon from "../../assets/Grade.svg"; // Changed to dark theme
import AnalyticsIcon from "../../assets/Analytics.svg"; // Changed to dark theme
import CopyIcon from "../../assets/Copy.svg"; // Added copy icon
// ADD THIS NEW IMPORT
import SubjectOverview from "../../assets/SubjectOverview.svg";

export default function Attendance() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get("code");

  const [students, setStudents] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState(null);
  const [modalMessage, setModalMessage] = useState("");

  // Email notification states for save_attendance
  const [sendingEmails,] = useState(false);
  const [emailResults, setEmailResults] = useState(null);
  
  // ========== ADDED: Date and Time State ==========
  const [currentDateTime, setCurrentDateTime] = useState({
    date: '',
    time: '',
    day: ''
  });
  
  // ========== ADDED: Save Attendance Loading State ==========
  const [isSaving, setIsSaving] = useState(false);
  
  // ========== ADDED: Today's Attendance Recorded State ==========
  const [todayAttendanceRecorded, setTodayAttendanceRecorded] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [todayDate, setTodayDate] = useState('');

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

  // ========== ADDED: Date and Time Update Effect ==========
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      
      // Format date: Month Day, Year (e.g., "January 1, 2024")
      const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = now.toLocaleDateString('en-US', dateOptions);
      
      // Format time: HH:MM AM/PM (e.g., "12:30 PM")
      const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
      const formattedTime = now.toLocaleTimeString('en-US', timeOptions);
      
      // Get day of week (e.g., "Monday")
      const dayOptions = { weekday: 'long' };
      const formattedDay = now.toLocaleDateString('en-US', dayOptions);
      
      // Get today's date in YYYY-MM-DD format for API calls
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayFormatted = `${year}-${month}-${day}`;
      
      setCurrentDateTime({
        date: formattedDate,
        time: formattedTime,
        day: formattedDay
      });
      
      setTodayDate(todayFormatted);
    };
    
    // Update immediately
    updateDateTime();
    
    // Update every minute
    const intervalId = setInterval(updateDateTime, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  const getProfessorId = () => {
    try {
      const userDataString = localStorage.getItem("user");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        return userData.id;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
    return null;
  };

  // Copy subject code to clipboard function
  const copySubjectCode = () => {
    const codeToCopy = classInfo?.subject_code;
    if (codeToCopy && codeToCopy !== 'N/A') {
      navigator.clipboard.writeText(codeToCopy)
        .then(() => {
          // Show temporary feedback
          const copyButtons = document.querySelectorAll('.copy-text');
          copyButtons.forEach(button => {
            button.textContent = 'Copied!';
            setTimeout(() => {
              button.textContent = 'Copy';
            }, 2000);
          });
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  const formatName = (fullName) => {
    if (!fullName) return "";
    const nameParts = fullName.trim().split(" ");
    if (nameParts.length === 1) return nameParts[0];
    if (nameParts.length === 2) return `${nameParts[1]}, ${nameParts[0]}`;
    const surname = nameParts[nameParts.length - 1];
    const givenNames = nameParts.slice(0, nameParts.length - 1);
    return `${surname}, ${givenNames.join(" ")}`;
  };

  useEffect(() => {
    if (subjectCode) {
      fetchClassAndStudents();
    }
  }, [subjectCode]);

  // ========== ADDED: Check Today's Attendance Function ==========
  const checkTodayAttendance = async () => {
    try {
      const professorId = getProfessorId();
      
      // Get today's date in YYYY-MM-DD format
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;
      
      const response = await fetch(
        "https://tracked.6minds.site/Professor/AttendanceDB/check_today_attendance.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject_code: subjectCode,
            professor_ID: professorId,
            attendance_date: today
          }),
        }
      );

      const result = await response.json();
      console.log("Attendance check result:", result);
      
      if (result.success && result.attendance_exists) {
        setTodayAttendanceRecorded(true);
        setIsEditing(false);
        if (result.last_saved_time) {
          setLastSavedTime(result.last_saved_time);
        }
        
        // Load the saved attendance data
        if (result.attendance_records && result.attendance_records.length > 0) {
          const savedAttendance = {};
          result.attendance_records.forEach(record => {
            savedAttendance[record.student_ID] = record.status;
          });
          setAttendance(savedAttendance);
        }
      } else {
        setTodayAttendanceRecorded(false);
        setIsEditing(true);
        setLastSavedTime(null);
      }
    } catch (error) {
      console.error("Error checking today's attendance:", error);
      setTodayAttendanceRecorded(false);
    }
  };

  const fetchClassAndStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://tracked.6minds.site/Professor/SubjectDetailsDB/get_students_by_section.php?subject_code=${subjectCode}`
      );
      const result = await response.json();
      if (result.success) {
        setClassInfo(result.class_info);
        const studentsData = result.students;
        setStudents(studentsData);

        // Initialize attendance as "present" by default
        const initialAttendance = {};
        studentsData.forEach((s) => {
          initialAttendance[s.tracked_ID] = "present";
        });
        setAttendance(initialAttendance);
        
        // After fetching students, check today's attendance
        await checkTodayAttendance();
      } else {
        setModalMessage(result.message || "Failed to fetch students");
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setModalMessage("Error fetching students");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    if (isEditing) {
      setAttendance((prev) => ({ ...prev, [studentId]: status }));
    }
  };

  const handleMarkAllPresent = () => {
    if (isEditing) {
      const newAttendance = {};
      students.forEach((s) => (newAttendance[s.tracked_ID] = "present"));
      setAttendance(newAttendance);
    }
  };

  const handleSaveAttendance = async () => {
    if (!isEditing) return;
    
    setIsSaving(true);
    
    try {
      const professorId = getProfessorId();
      // Get current date in YYYY-MM-DD format
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const today = `${year}-${month}-${day}`;

      const attendanceData = {
        subject_code: subjectCode,
        professor_ID: professorId,
        attendance_date: today,
        attendance_records: Object.entries(attendance).map(
          ([student_ID, status]) => ({
            student_ID,
            status,
          })
        ),
      };

      console.log("Saving attendance data:", attendanceData);

      const response = await fetch(
        "https://tracked.6minds.site/Professor/AttendanceDB/save_attendance.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(attendanceData),
        }
      );

      const result = await response.json();
      console.log("Save attendance response:", result);
      
      if (result.success) {
        setIsEditing(false);
        setTodayAttendanceRecorded(true);
        
        // Use the server-provided time from the response
        if (result.saved_time) {
          setLastSavedTime(result.saved_time);
        } else {
          // Fallback to local time
          setLastSavedTime(new Date().toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
          }));
        }
        
        // Show email notification results if any
        if (result.email_notifications && 
            (result.email_notifications.absent || result.email_notifications.late)) {
          const absentCount = result.email_notifications.absent ? result.email_notifications.absent.length : 0;
          const lateCount = result.email_notifications.late ? result.email_notifications.late.length : 0;
          
          if (absentCount > 0 || lateCount > 0) {
            setEmailResults(result.email_notifications);
            setModalMessage(`Attendance saved successfully! Notifications sent to ${absentCount} absent and ${lateCount} late students.`);
          } else {
            setModalMessage("Attendance saved successfully!");
          }
        } else {
          setModalMessage("Attendance saved successfully!");
        }
        
        setShowSuccessModal(true);
      } else {
        setModalMessage(result.message || "Error saving attendance");
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Error saving attendance:", error);
      setModalMessage("Error saving attendance");
      setShowErrorModal(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveStudent = (student, e) => {
    e.preventDefault();
    e.stopPropagation();
    setStudentToRemove(student);
    setShowRemoveModal(true);
  };

  const confirmRemove = async () => {
    if (!studentToRemove) return;
    try {
      const professorId = getProfessorId();
      const response = await fetch(
        "https://tracked.6minds.site/Professor/AttendanceDB/remove_student.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_ID: studentToRemove.tracked_ID,
            subject_code: subjectCode,
            professor_ID: professorId,
          }),
        }
      );
      const result = await response.json();
      if (result.success) {
        setStudents((prev) =>
          prev.filter((s) => s.tracked_ID !== studentToRemove.tracked_ID)
        );
        setAttendance((prev) => {
          const newAttendance = { ...prev };
          delete newAttendance[studentToRemove.tracked_ID];
          return newAttendance;
        });
        setShowRemoveModal(false);
        setStudentToRemove(null);
        setModalMessage("Student removed successfully");
        setShowSuccessModal(true);
      } else {
        setModalMessage(result.message || "Failed to remove student");
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Error removing student:", error);
      setModalMessage("Error removing student");
      setShowErrorModal(true);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.tracked_firstname
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.tracked_lastname
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      student.tracked_ID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.tracked_yearandsec &&
        student.tracked_yearandsec
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  // ========== RENDER ACTION BUTTON HELPER ==========
  const renderActionButton = (to, icon, label, active = false, colorClass = "") => (
    <Link to={`${to}?code=${subjectCode}`} className="flex-1 sm:flex-initial min-w-0">
      <button className={`flex items-center justify-center gap-2 px-3 py-2 font-semibold text-sm rounded-md shadow-md border-2 transition-all duration-300 cursor-pointer w-full sm:w-auto ${
        active 
          ? 'bg-[#00A15D]/20 text-[#00A15D] border-[#00A15D]/30' 
          : colorClass
      }`}>
        <img src={icon} alt="" className="h-4 w-4" />
        <span className="sm:inline truncate">{label}</span>
      </button>
    </Link>
  );

  if (loading) {
    return (
      <div className="bg-[#23232C] min-h-screen">
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-8 text-center text-[#FFFFFF]">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00A15D] border-r-transparent"></div>
            <p className="mt-3 text-[#FFFFFF]/80">Loading class details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#23232C] min-h-screen">
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* ========== MAIN CONTENT ========== */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-6">
          
          {/* ========== PAGE HEADER ========== */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <img
                src={AttendanceIcon}
                alt="Attendance"
                className="h-6 w-6 sm:h-7 sm:w-7 mr-2"
              />
              <h1 className="font-bold text-xl lg:text-2xl text-[#FFFFFF]">
                Attendance
              </h1>
            </div>
            <p className="text-sm lg:text-base text-[#FFFFFF]/80">
              Manage your class attendance
            </p>
          </div>

          {/* ========== SUBJECT INFORMATION ========== */}
          <div className="flex flex-col gap-1 text-sm text-[#FFFFFF]/80 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">SUBJECT CODE:</span>
              <div className="flex items-center gap-2">
                <span>{classInfo?.subject_code || 'N/A'}</span>
                {classInfo?.subject_code && classInfo.subject_code !== 'N/A' && (
                  <button
                    onClick={copySubjectCode}
                    className="p-1 text-[#FFFFFF]/60 hover:text-[#FFFFFF] hover:bg-[#15151C] rounded transition-colors cursor-pointer flex items-center gap-1"
                    title="Copy subject code"
                  >
                    <img 
                      src={CopyIcon} 
                      alt="Copy" 
                      className="w-4 h-4" 
                    />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">SUBJECT:</span>
              <span>{classInfo?.subject || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="font-semibold">SECTION:</span>
                <span>{classInfo?.section || 'N/A'}</span>
              </div>
              <div className="flex justify-end">
                <Link to="/ClassManagement">
                  <img 
                    src={BackButton} 
                    alt="Back" 
                    className="h-5 w-5 cursor-pointer hover:opacity-70 transition-opacity" 
                    title="Back to Class Management"
                  />
                </Link>
              </div>
            </div>
          </div>

          <hr className="border-[#FFFFFF]/30 mb-4" />

          {/* ========== ACTION BUTTONS ========== */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              {/* NEW: Subject Overview Button */}
              {renderActionButton("/SubjectOverviewProfessor", SubjectOverview, "Subject Overview", false, "bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]/30 hover:bg-[#FF5252]/30")}
              
              {/* Announcement Button */}
              {renderActionButton("/Class", Announcement, "Announcements", false, "bg-[#00A15D]/20 text-[#00A15D] border-[#00A15D]/30 hover:bg-[#00A15D]/30")}
              
              {/* Classwork Button */}
              {renderActionButton("/ClassworkTab", Classwork, "Class Work", false, "bg-[#767EE0]/20 text-[#767EE0] border-[#767EE0]/30 hover:bg-[#767EE0]/30")}
              
              {/* Attendance Button - Active */}
              {renderActionButton("/Attendance", AttendanceIcon, "Attendance", true)}
              
              {/* Grade Button */}
              {renderActionButton("/GradeTab", GradeIcon, "Grade", false, "bg-[#A15353]/20 text-[#A15353] border-[#A15353]/30 hover:bg-[#A15353]/30")}
              
              {/* Analytics Button */}
              {renderActionButton("/AnalyticsTab", AnalyticsIcon, "Analytics", false, "bg-[#B39DDB]/20 text-[#B39DDB] border-[#B39DDB]/30 hover:bg-[#B39DDB]/30")}
            </div>
            
            {/* ========== ICON BUTTONS ========== */}
            <div className="flex items-center gap-2 justify-end sm:justify-start">
              {/* Class Management Button */}
              <Link to={`/StudentList?code=${subjectCode}`}>
                <button 
                  className="p-2 bg-[#15151C] rounded-md shadow-md border-2 border-transparent hover:border-[#00A15D] transition-all duration-200 flex-shrink-0 cursor-pointer"
                  title="Student List"
                >
                  <img 
                    src={ClassManagementIcon} 
                    alt="ClassManagement" 
                    className="h-4 w-4" 
                  />
                </button>
              </Link>
              
              {/* Attendance History Button */}
              <Link to={`/AttendanceHistory?code=${subjectCode}`}>
                <button 
                  className="p-2 bg-[#15151C] rounded-md shadow-md border-2 border-transparent hover:border-[#00A15D] transition-all duration-200 flex-shrink-0 cursor-pointer"
                  title="Attendance History"
                >
                  <img 
                    src={HistoryIcon} 
                    alt="History" 
                    className="h-4 w-4" 
                  />
                </button>
              </Link>
            </div>
          </div>

          {/* ========== ADDED: DATE AND TIME DISPLAY WITH ATTENDANCE STATUS ========== */}
          <div className="mb-4 p-3 bg-[#15151C] rounded-lg border border-[#FFFFFF]/10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-[#FFFFFF]">Today's Attendance</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <div className="text-xs text-[#00A15D] font-medium bg-[#00A15D]/10 px-2 py-0.5 rounded">
                    {currentDateTime.day}
                  </div>
                  <div className="text-xs text-[#FFFFFF]/70">
                    {currentDateTime.date}
                  </div>
                  
                  {/* ========== ATTENDANCE RECORDED INDICATOR ========== */}
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                      todayAttendanceRecorded 
                        ? 'bg-[#00A15D]/20 text-[#00A15D]' 
                        : 'bg-[#A15353]/20 text-[#A15353]'
                    }`}>
                      <div className={`h-1.5 w-1.5 rounded-full ${
                        todayAttendanceRecorded ? 'bg-[#00A15D]' : 'bg-[#A15353]'
                      }`}></div>
                      <span>
                        {todayAttendanceRecorded ? 'Attendance Recorded' : 'Not Recorded'}
                      </span>
                    </div>
                    
                    {/* Show last saved time if attendance is recorded */}
                    {todayAttendanceRecorded && lastSavedTime && (
                      <div className="text-xs text-[#FFFFFF]/60">
                        (Last saved: {lastSavedTime})
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-[#FFFFFF]/60">
                  Current Time:
                </div>
                <div className="text-sm font-semibold text-[#FFFFFF]">
                  {currentDateTime.time}
                </div>
              </div>
            </div>
            
            {/* ========== ADDED: ATTENDANCE STATUS SUMMARY ========== */}
            {todayAttendanceRecorded && (
              <div className="mt-2 pt-2 border-t border-[#FFFFFF]/10">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-[#00A15D]"></div>
                    <span className="text-[#FFFFFF]/70">Present: </span>
                    <span className="font-semibold text-[#FFFFFF]">
                      {Object.values(attendance).filter(status => status === 'present').length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-[#767EE0]"></div>
                    <span className="text-[#FFFFFF]/70">Late: </span>
                    <span className="font-semibold text-[#FFFFFF]">
                      {Object.values(attendance).filter(status => status === 'late').length}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-[#A15353]"></div>
                    <span className="text-[#FFFFFF]/70">Absent: </span>
                    <span className="font-semibold text-[#FFFFFF]">
                      {Object.values(attendance).filter(status => status === 'absent').length}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========== SEARCH BAR ========== */}
          <div className="mt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, student number, or year & section..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 rounded px-2.5 py-1.5 pr-9 outline-none bg-[#15151C] text-xs text-[#FFFFFF] border border-[#FFFFFF]/10 focus:border-[#767EE0] transition-colors placeholder:text-[#FFFFFF]/40"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[#FFFFFF]/60" title="Search">
                <img
                  src={Search}
                  alt="Search"
                  className="h-3.5 w-3.5"
                />
              </button>
            </div>
          </div>

          {/* ========== ATTENDANCE TABLE ========== */}
          <div className="mt-4 bg-[#15151C] rounded-lg shadow-md border border-[#FFFFFF]/10 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="sm:hidden text-xs text-[#FFFFFF]/50 py-1.5 text-center bg-[#23232C]">
                ← Swipe to see all columns →
              </div>
              <div className="p-3">
                <table className="table-auto w-full border-collapse text-left min-w-[700px]">
                  <thead>
                    <tr className="text-xs font-semibold">
                      <th className="px-2 py-1.5 text-[#FFFFFF]/70">No.</th>
                      <th className="px-2 py-1.5 text-[#FFFFFF]/70">Student No.</th>
                      <th className="px-2 py-1.5 text-[#FFFFFF]/70">Full Name</th>
                      <th className="px-2 py-1.5 text-[#FFFFFF]/70">Year & Section</th>
                      <th className="px-2 py-1.5 text-[#00A15D] text-center w-12">Present</th>
                      <th className="px-2 py-1.5 text-[#767EE0] text-center w-12">Late</th>
                      <th className="px-2 py-1.5 text-[#A15353] text-center w-12">Absent</th>
                      <th className="px-2 py-1.5 text-[#FFFFFF]/70 text-center w-12">Action</th>
                    </tr>
                  </thead>
                  <tbody className='text-[#fff]'>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student, index) => (
                        <tr
                          key={student.tracked_ID}
                          className="hover:bg-[#23232C] text-xs border-b border-[#FFFFFF]/10"
                        >
                          <td className="px-2 py-2">
                            {index + 1}
                          </td>
                          <td className="px-2 py-2">
                            {student.tracked_ID}
                          </td>
                          <td className="px-2 py-2">
                            {formatName(
                              `${student.tracked_firstname} ${
                                student.tracked_middlename || ""
                              } ${student.tracked_lastname}`
                            )}
                          </td>
                          <td className="px-2 py-2">
                            {student.tracked_yearandsec || "N/A"}
                          </td>

                          <td className="px-2 py-2 w-12">
                            <div className="flex justify-center items-center">
                              <input
                                type="radio"
                                title="Present"
                                name={`attendance-${student.tracked_ID}`}
                                checked={
                                  attendance[student.tracked_ID] === "present"
                                }
                                onChange={() =>
                                  handleAttendanceChange(
                                    student.tracked_ID,
                                    "present"
                                  )
                                }
                                disabled={!isEditing}
                                className="appearance-none w-4 h-4 border-2 border-[#00A15D] rounded-md checked:bg-[#00A15D] cursor-pointer disabled:cursor-not-allowed"
                              />
                            </div>
                          </td>
                          <td className="px-2 py-2 w-12">
                            <div className="flex justify-center items-center">
                              <input
                                type="radio"
                                title="Late"
                                name={`attendance-${student.tracked_ID}`}
                                checked={
                                  attendance[student.tracked_ID] === "late"
                                }
                                onChange={() =>
                                  handleAttendanceChange(
                                    student.tracked_ID,
                                    "late"
                                  )
                                }
                                disabled={!isEditing}
                                className="appearance-none w-4 h-4 border-2 border-[#767EE0] rounded-md checked:bg-[#767EE0] cursor-pointer disabled:cursor-not-allowed"
                              />
                            </div>
                          </td>
                          <td className="px-2 py-2 w-12">
                            <div className="flex justify-center items-center">
                              <input
                                type="radio"
                                title="Absent"
                                name={`attendance-${student.tracked_ID}`}
                                checked={
                                  attendance[student.tracked_ID] === "absent"
                                }
                                onChange={() =>
                                  handleAttendanceChange(
                                    student.tracked_ID,
                                    "absent"
                                  )
                                }
                                disabled={!isEditing}
                                className="appearance-none w-4 h-4 border-2 border-[#A15353] rounded-md checked:bg-[#A15353] cursor-pointer disabled:cursor-not-allowed"
                              />
                            </div>
                          </td>
                          <td className="px-2 py-2 w-12">
                            <div className="flex justify-center items-center">
                              <button
                                onClick={(e) => handleRemoveStudent(student, e)}
                                disabled={!isEditing}
                                className={`bg-[#23232C] rounded-md w-8 h-8 shadow-sm flex items-center justify-center border-2 border-transparent hover:border-[#A15353] hover:scale-105 transition-all duration-200 ${isEditing ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
                                title={isEditing ? "Remove student" : "Cannot remove while attendance is locked"}
                              >
                                <img
                                  src={RemoveIcon}
                                  alt="Remove student"
                                  className="h-4 w-4"
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          className="px-4 py-4 text-center text-[#FFFFFF]/50 text-xs"
                        >
                          {searchTerm
                            ? "No students found matching your search."
                            : "No students found."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ========== ACTION BUTTONS ========== */}
            <div className="p-3 border-t border-[#FFFFFF]/10">
              <div className="flex flex-col sm:flex-row justify-end gap-2">
                {!isEditing ? (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setTodayAttendanceRecorded(false);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-[#00A15D] hover:bg-[#00874E] text-white font-semibold rounded-md transition-all duration-200 cursor-pointer text-sm"
                  >
                    Edit Attendance
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleMarkAllPresent}
                      className="w-full sm:w-auto px-4 py-2 bg-[#00A15D] hover:bg-[#00874E] text-white font-semibold rounded-md transition-all duration-200 cursor-pointer text-sm"
                    >
                      Mark All Present
                    </button>
                    <button
                      onClick={handleSaveAttendance}
                      disabled={isSaving}
                      className={`w-full sm:w-auto px-4 py-2 bg-[#00A15D] hover:bg-[#00874E] text-white font-semibold rounded-md transition-all duration-200 text-sm ${
                        isSaving ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      {isSaving ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                          <span>Saving...</span>
                        </div>
                      ) : (
                        'Save Attendance'
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== SUCCESS MODAL ========== */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-[#15151C] text-[#FFFFFF] rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-[#00A15D]/20 mb-3">
              <img
                src={SuccessIcon}
                alt="Success"
                className="h-6 w-6"
              />
            </div>
            <h3 className="text-lg font-bold mb-2">Success!</h3>
            <p className="text-sm text-[#FFFFFF]/70 mb-4">{modalMessage}</p>
            
            {/* Show email results details */}
            {emailResults && (
              <div className="mb-4 p-3 bg-[#23232C] rounded-md text-left text-xs">
                <h4 className="font-semibold mb-1">Email Results:</h4>
                {emailResults.students_at_risk && (
                  <p>Students at risk notified: {emailResults.students_at_risk}</p>
                )}
                {emailResults.notifications_sent && (
                  <p>Daily reports sent: {emailResults.notifications_sent}</p>
                )}
                {emailResults.email_notifications && (
                  <div>
                    {emailResults.email_notifications.absent && (
                      <p>Absent notifications: {emailResults.email_notifications.absent.length}</p>
                    )}
                    {emailResults.email_notifications.late && (
                      <p>Late notifications: {emailResults.email_notifications.late.length}</p>
                    )}
                  </div>
                )}
              </div>
            )}
            
            <button
              onClick={() => {
                setShowSuccessModal(false);
                setEmailResults(null);
              }}
              className="w-full bg-[#00A15D] hover:bg-[#00874E] text-white font-bold py-2.5 rounded transition-all duration-200 cursor-pointer text-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ========== ERROR MODAL ========== */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-[#15151C] text-[#FFFFFF] rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-[#A15353]/20 mb-3">
              <img
                src={ErrorIcon}
                alt="Error"
                className="h-6 w-6"
              />
            </div>
            <h3 className="text-lg font-bold mb-2">Error</h3>
            <p className="text-sm text-[#FFFFFF]/70 mb-4">{modalMessage}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full bg-[#A15353] hover:bg-[#8A4545] text-white font-bold py-2.5 rounded transition-all duration-200 cursor-pointer text-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ========== REMOVE STUDENT CONFIRMATION MODAL ========== */}
      {showRemoveModal && studentToRemove && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-[#15151C] text-[#FFFFFF] rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-[#A15353]/20 mb-3">
              <img
                src={RemoveIcon}
                alt="Remove"
                className="h-6 w-6"
              />
            </div>
            <h3 className="text-lg font-bold mb-2">
              Remove Student
            </h3>
            <p className="text-sm text-[#FFFFFF]/70 mb-4">
              Are you sure you want to remove{" "}
              {formatName(
                `${studentToRemove.tracked_firstname} ${
                  studentToRemove.tracked_middlename || ""
                } ${studentToRemove.tracked_lastname}`
              )}{" "}
              from this class?
            </p>
            <p className="text-xs text-[#FFFFFF]/50 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRemoveModal(false)}
                className="flex-1 bg-[#23232C] hover:bg-[#2A2A35] text-white font-bold py-2.5 rounded transition-all duration-200 cursor-pointer text-sm"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="flex-1 bg-[#A15353] hover:bg-[#8A4545] text-white font-bold py-2.5 rounded transition-all duration-200 cursor-pointer text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}