import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import AttendanceIcon from '../../assets/Attendance(Light).svg';
import BackButton from '../../assets/BackButton(Light).svg';
import Search from "../../assets/Search.svg";
import SuccessIcon from '../../assets/Success(Green).svg';
import ErrorIcon from '../../assets/Error(Red).svg';
import RemoveIcon from '../../assets/Remove(Red).svg';
import Archive from "../../assets/Archive(Light).svg"; 
import HistoryIcon from '../../assets/History(Light).svg';
import ClassManagementIcon from "../../assets/ClassManagement(Light).svg"; 
import Announcement from "../../assets/Announcement(Light).svg";
import Classwork from "../../assets/Classwork(Light).svg";
// Import the new icons for Grade and Analytics
import GradeIcon from "../../assets/Grade(Light).svg";
import AnalyticsIcon from "../../assets/Analytics(Light).svg";

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
    if (subjectCode) fetchClassAndStudents();
  }, [subjectCode]);

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
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAllPresent = () => {
    const newAttendance = {};
    students.forEach((s) => (newAttendance[s.tracked_ID] = "present"));
    setAttendance(newAttendance);
  };

  const handleSaveAttendance = async () => {
    try {
      const professorId = getProfessorId();
      const today = new Date().toISOString().split("T")[0];

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

      const response = await fetch(
        "https://tracked.6minds.site/Professor/AttendanceDB/save_attendance.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(attendanceData),
        }
      );

      const result = await response.json();
      if (result.success) {
        setIsEditing(false);
        
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

  if (loading) {
    return (
      <div>
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-5 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00874E] border-r-transparent"></div>
            <p className="mt-3 text-gray-600">Loading class details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* Main Content */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          
          {/* Page Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img
                src={AttendanceIcon}
                alt="Attendance"
                className="h-7 w-7 sm:h-9 sm:w-9 mr-2 sm:mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                Attendance
              </h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-[#465746]">
              Manage your class attendance
            </p>
          </div>

          {/* Subject Information */}
          <div className="flex flex-col gap-2 text-sm sm:text-base lg:text-[1.125rem] text-[#465746] mb-4 sm:mb-5">
            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT CODE:</span>
              <span>{classInfo?.subject_code || 'N/A'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT:</span>
              <span>{classInfo?.subject || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Section:</span>
                <span>{classInfo?.section || 'N/A'}</span>
              </div>
              <div className="w-full flex justify-end">
                <Link to="/ClassManagement">
                  <img 
                    src={BackButton} 
                    alt="Back" 
                    className="h-6 w-6 cursor-pointer hover:opacity-70 transition-opacity" 
                    title="Back to Class Managemen"
                  />
                </Link>
              </div>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full mt-4 sm:mt-5 gap-3">
            {/* Navigation buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              {/* Announcement Button - Full width on mobile, auto on larger */}
              <Link to={`/Class?code=${subjectCode}`} className="flex-1 sm:flex-initial">
                <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#e6f4ea] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#d4edd8] transition-all duration-300 cursor-pointer w-full sm:w-auto" title="Announcement">
                  <img 
                    src={Announcement} 
                    alt="" 
                    className="h-4 w-4 sm:h-5 sm:w-5"
                  />
                  <span className="sm:inline">Announcement</span>
                </button>
              </Link>

              {/* Classwork, Attendance, Grade and Analytics - Grid on mobile, row on desktop */}
              <div className="grid grid-cols-2 gap-3 w-full sm:flex sm:gap-4 sm:w-auto">
                <Link to={`/ClassworkTab?code=${subjectCode}`} className="min-w-0">
                  <button className="flex items-center justify-center gap-2 px-3 sm:px-5 py-2 bg-[#e6f0ff] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#d4e3ff] transition-all duration-300 cursor-pointer w-full" title="Class Work">
                    <img 
                      src={Classwork} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0"
                    />
                    <span className="whitespace-nowrap truncate">Class work</span>
                  </button>
                </Link>

                <Link to={`/Attendance?code=${subjectCode}`} className="sm:flex-initial">
                  <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#fff4e6] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#ffebd4] transition-all duration-300 cursor-pointer w-full sm:w-auto" title="Attendance">
                    <img 
                      src={AttendanceIcon}
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <span className="sm:inline">Attendance</span>
                  </button>
                </Link>

                {/* NEW: Grade Button */}
                <Link to={`/GradeTab?code=${subjectCode}`} className="sm:flex-initial">
                  <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#ffe6e6] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#ffd4d4] transition-all duration-300 cursor-pointer w-full sm:w-auto" title="Grade">
                    <img 
                      src={GradeIcon} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <span className="sm:inline">Grade</span>
                  </button>
                </Link>

                {/* NEW: Analytics Button */}
                <Link to={`/AnalyticsTab?code=${subjectCode}`} className="sm:flex-initial">
                  <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#f0e6ff] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#e6d4ff] transition-all duration-300 cursor-pointer w-full sm:w-auto" title="Analytics">
                    <img 
                      src={AnalyticsIcon} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <span className="sm:inline">Analytics</span>
                  </button>
                </Link>
              </div>
            </div>

            {/* Action buttons - Right aligned on mobile */}
            <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
              {/* Removed: Daily Reports and Send Warnings buttons */}
              
              <Link to={`/StudentList?code=${subjectCode}`}>
                <button className="p-2 bg-[#fff] rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 flex-shrink-0 cursor-pointer" title="Student List">
                  <img 
                    src={ClassManagementIcon} 
                    alt="ClassManagement" 
                    className="h-5 w-5 sm:h-6 sm:w-6" 
                  />
                </button>
              </Link>
              
              <Link to={`/AttendanceHistory?code=${subjectCode}`}>
                <button className="p-2 bg-[#fff] rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 flex-shrink-0 cursor-pointer" title="Attendance History">
                  <img 
                    src={HistoryIcon} 
                    alt="History" 
                    className="h-5 w-5 sm:h-6 sm:w-6" 
                  />
                </button>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 sm:mt-8">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search by name, student number, or year & section..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 sm:h-12 rounded-md px-4 py-2.5 pr-12 shadow-md outline-none bg-white text-sm sm:text-base border-2 border-transparent focus:border-[#00874E] transition-colors"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" title="Search">
                <img
                  src={Search}
                  alt="Search"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
              </button>
            </div>
          </div>

          {/* Email Notification Status */}
          {sendingEmails && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center justify-center">
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent mr-2"></div>
                <span className="text-blue-700 text-sm">Sending email notifications...</span>
              </div>
            </div>
          )}

          {/* Attendance Table */}
          <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="sm:hidden text-xs text-gray-500 py-2 text-center bg-gray-50">
                ← Swipe to see all columns →
              </div>
              <div className="p-3 sm:p-4 md:p-5">
                <table className="table-auto w-full border-collapse text-left min-w-[700px]">
                  <thead>
                    <tr className="text-xs sm:text-sm lg:text-[1.125rem] font-semibold">
                      <th className="px-2 sm:px-3 md:px-4 py-2">No.</th>
                      <th className="px-2 sm:px-3 md:px-4 py-2">Student No.</th>
                      <th className="px-2 sm:px-3 md:px-4 py-2">Full Name</th>
                      <th className="px-2 sm:px-3 md:px-4 py-2">
                        Year & Section
                      </th>
                      <th className="px-2 py-2 text-[#00A15D] text-center w-14 sm:w-16 md:w-20">
                        Present
                      </th>
                      <th className="px-2 py-2 text-[#767EE0] text-center w-14 sm:w-16 md:w-20">
                        Late
                      </th>
                      <th className="px-2 py-2 text-[#EF4444] text-center w-14 sm:w-16 md:w-20">
                        Absent
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student, index) => (
                        <tr
                          key={student.tracked_ID}
                          className="hover:bg-gray-50 text-xs sm:text-sm lg:text-base border-b border-gray-200"
                        >
                          <td className="px-2 sm:px-3 md:px-4 py-3">
                            {index + 1}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-3">
                            {student.tracked_ID}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-3">
                            {formatName(
                              `${student.tracked_firstname} ${
                                student.tracked_middlename || ""
                              } ${student.tracked_lastname}`
                            )}
                          </td>
                          <td className="px-2 sm:px-3 md:px-4 py-3">
                            {student.tracked_yearandsec || "N/A"}
                          </td>

                          <td className="px-2 py-3 w-14 sm:w-16 md:w-20">
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
                                className="appearance-none w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 border-2 border-[#00A15D] rounded-md checked:bg-[#00A15D] cursor-pointer disabled:cursor-not-allowed"
                              />
                            </div>
                          </td>
                          <td className="px-2 py-3 w-14 sm:w-16 md:w-20">
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
                                className="appearance-none w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 border-2 border-[#767EE0] rounded-md checked:bg-[#767EE0] cursor-pointer disabled:cursor-not-allowed"
                              />
                            </div>
                          </td>
                          <td className="px-2 py-3 w-14 sm:w-16 md:w-20">
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
                                className="appearance-none w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 border-2 border-[#EF4444] rounded-md checked:bg-[#EF4444] cursor-pointer disabled:cursor-not-allowed"
                              />
                            </div>
                          </td>
                          <td className="px-2 py-3 w-14 sm:w-16 md:w-20">
                            <div className="flex justify-center items-center">
                              <button
                                onClick={(e) => handleRemoveStudent(student, e)}
                                className="bg-white rounded-md w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 shadow-md flex items-center justify-center border-2 border-transparent hover:border-red-500 hover:scale-105 transition-all duration-200 cursor-pointer"
                                title="Remove student"
                              >
                                <img
                                  src={RemoveIcon}
                                  alt="Remove student"
                                  className="h-5 w-5 sm:h-5 sm:w-5 lg:h-6 lg:w-6"
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
                          className="px-4 py-8 text-center text-gray-500 text-sm"
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

            {/* Action Buttons */}
            <div className="p-4 sm:p-5 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-full sm:w-auto px-6 py-3 bg-[#00A15D] hover:bg-[#00874E] text-white font-semibold rounded-md transition-all duration-200 cursor-pointer"
                  >
                    Edit Attendance
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleMarkAllPresent}
                      className="w-full sm:w-auto px-6 py-3 bg-[#00A15D] hover:bg-[#00874E] text-white font-semibold rounded-md transition-all duration-200 cursor-pointer"
                    >
                      Mark All Present
                    </button>
                    <button
                      onClick={handleSaveAttendance}
                      className="w-full sm:w-auto px-6 py-3 bg-[#00A15D] hover:bg-[#00874E] text-white font-semibold rounded-md transition-all duration-200 cursor-pointer"
                    >
                      Save Attendance
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 sm:p-8 text-center">
            <img
              src={SuccessIcon}
              alt="Success"
              className="h-16 w-16 mx-auto mb-4"
            />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Success!</h3>
            <p className="text-gray-600 mb-6">{modalMessage}</p>
            
            {/* Show email results details */}
            {emailResults && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md text-left">
                <h4 className="font-semibold text-sm mb-2">Email Results:</h4>
                {emailResults.students_at_risk && (
                  <p className="text-sm">Students at risk notified: {emailResults.students_at_risk}</p>
                )}
                {emailResults.notifications_sent && (
                  <p className="text-sm">Daily reports sent: {emailResults.notifications_sent}</p>
                )}
                {emailResults.email_notifications && (
                  <div className="text-sm">
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
              className="w-full bg-[#00A15D] hover:bg-[#00874E] text-white font-bold py-3 rounded-md transition-colors cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 sm:p-8 text-center">
            <img
              src={ErrorIcon}
              alt="Error"
              className="h-16 w-16 mx-auto mb-4"
            />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Error</h3>
            <p className="text-gray-600 mb-6">{modalMessage}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold py-3 rounded-md transition-colors cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Remove Student Confirmation Modal */}
      {showRemoveModal && studentToRemove && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 sm:p-8 text-center">
            <img
              src={RemoveIcon}
              alt="Remove"
              className="h-16 w-16 mx-auto mb-4"
            />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Remove Student
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to remove{" "}
              {formatName(
                `${studentToRemove.tracked_firstname} ${
                  studentToRemove.tracked_middlename || ""
                } ${studentToRemove.tracked_lastname}`
              )}{" "}
              from this class?
            </p>
            <p className="text-sm text-gray-500 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-md transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemove}
                className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold py-3 rounded-md transition-colors cursor-pointer"
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