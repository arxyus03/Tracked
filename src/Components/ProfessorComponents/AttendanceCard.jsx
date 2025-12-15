import { useState, useEffect } from "react";
import ArrowDown from "../../assets/ArrowDown(Light).svg"; 
import Edit from "../../assets/Edit(Light).svg";
import SuccessIcon from "../../assets/Success(Green).svg";
import ErrorIcon from "../../assets/Error(Red).svg";
import jsPDF from "jspdf";

function AttendanceCard({ date, students, rawDate, subjectCode }) {
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [attendanceData, setAttendanceData] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Initialize attendance data when students prop changes
  useEffect(() => {
    if (students) {
      const initialData = {};
      students.forEach(student => {
        const studentId = getStudentNumber(student);
        initialData[studentId] = student.status || 'absent';
      });
      setAttendanceData(initialData);
    }
  }, [students]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'text-[#00A15D]';
      case 'late': return 'text-[#767EE0]';
      case 'absent': return 'text-[#A15353]';
      default: return 'text-[#FFFFFF]';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'present': return 'bg-[#00A15D]/20';
      case 'late': return 'bg-[#767EE0]/20';
      case 'absent': return 'bg-[#A15353]/20';
      default: return 'bg-[#23232C]';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present': return 'Present';
      case 'late': return 'Late';
      case 'absent': return 'Absent';
      default: return 'Unknown';
    }
  };

  // Function to get student number - handles both field names
  const getStudentNumber = (student) => {
    return student.student_ID || student.user_ID || student.id || 'N/A';
  };

  // Function to get student name
  const getStudentName = (student) => {
    return student.user_Name || student.name || 'Unknown';
  };

  // Handle attendance status change
  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  // Save attendance changes
  const handleSaveAttendance = async () => {
    try {
      const professorId = getProfessorId();
      
      const attendanceDataToSave = {
        subject_code: subjectCode,
        professor_ID: professorId,
        attendance_date: rawDate,
        attendance_records: Object.entries(attendanceData).map(([student_ID, status]) => ({
          student_ID,
          status,
        })),
      };

      const response = await fetch(
        "https://tracked.6minds.site/Professor/AttendanceDB/update_attendance.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(attendanceDataToSave),
        }
      );

      const result = await response.json();
      if (result.success) {
        setIsEditing(false);
        setModalMessage("Attendance updated successfully!");
        setShowSuccessModal(true);
        // Refresh the page to show updated data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setModalMessage(result.message || "Error updating attendance");
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      setModalMessage("Error updating attendance");
      setShowErrorModal(true);
    }
  };

  // Get professor ID from localStorage
  const getProfessorId = () => {
    try {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        return userData.id;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return null;
  };

  // Calculate attendance statistics
  const presentCount = students ? students.filter(s => {
    const studentId = getStudentNumber(s);
    return (isEditing ? attendanceData[studentId] : s.status) === 'present';
  }).length : 0;
  
  const lateCount = students ? students.filter(s => {
    const studentId = getStudentNumber(s);
    return (isEditing ? attendanceData[studentId] : s.status) === 'late';
  }).length : 0;
  
  const absentCount = students ? students.filter(s => {
    const studentId = getStudentNumber(s);
    return (isEditing ? attendanceData[studentId] : s.status) === 'absent';
  }).length : 0;

  // Function to download as PDF
  const downloadAttendancePDF = () => {
    if (!students || students.length === 0) {
      alert('No attendance data to download');
      return;
    }

    try {
      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = margin;
      
      // Add title
      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.text('Class Attendance Record', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;
      
      // Add date
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'normal');
      pdf.text(`Date: ${date}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      
      // Add summary
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.text('Attendance Summary:', margin, yPosition);
      yPosition += 7;
      
      pdf.setFont(undefined, 'normal');
      pdf.text(`Total Students: ${students.length}`, margin, yPosition);
      pdf.text(`Present: ${presentCount}`, margin + 50, yPosition);
      pdf.text(`Late: ${lateCount}`, margin + 90, yPosition);
      pdf.text(`Absent: ${absentCount}`, margin + 120, yPosition);
      yPosition += 15;
      
      // Add table headers
      pdf.setFont(undefined, 'bold');
      pdf.text('#', margin, yPosition);
      pdf.text('Student No.', margin + 15, yPosition);
      pdf.text('Full Name', margin + 60, yPosition);
      pdf.text('Status', pageWidth - margin - 20, yPosition);
      
      // Add line under headers
      yPosition += 3;
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 7;
      
      // Add student data
      pdf.setFont(undefined, 'normal');
      const lineHeight = 8;
      
      students.forEach((student, index) => {
        // Check if we need a new page
        if (yPosition > pdf.internal.pageSize.getHeight() - 20) {
          pdf.addPage();
          yPosition = margin;
          
          // Add headers on new page
          pdf.setFont(undefined, 'bold');
          pdf.text('#', margin, yPosition);
          pdf.text('Student No.', margin + 15, yPosition);
          pdf.text('Full Name', margin + 60, yPosition);
          pdf.text('Status', pageWidth - margin - 20, yPosition);
          yPosition += 10;
          pdf.setFont(undefined, 'normal');
        }
        
        const studentNumber = getStudentNumber(student);
        const studentName = getStudentName(student);
        const status = getStatusText(student.status);
        
        // Add student data
        pdf.text(`${index + 1}`, margin, yPosition);
        pdf.text(studentNumber, margin + 15, yPosition);
        
        // Truncate long names to fit
        const maxNameWidth = 80;
        let displayName = studentName;
        if (pdf.getTextWidth(studentName) > maxNameWidth) {
          displayName = studentName.substring(0, 30) + '...';
        }
        pdf.text(displayName, margin + 60, yPosition);
        
        // Set color based on status
        switch (student.status) {
          case 'present':
            pdf.setTextColor(0, 161, 93);
            break;
          case 'late':
            pdf.setTextColor(118, 126, 224);
            break;
          case 'absent':
            pdf.setTextColor(161, 83, 83);
            break;
          default:
            pdf.setTextColor(0, 0, 0);
        }
        
        pdf.text(status, pageWidth - margin - 20, yPosition, { align: 'right' });
        
        // Reset text color for next row
        pdf.setTextColor(0, 0, 0);
        
        yPosition += lineHeight;
      });
      
      // Add footer with generation date
      yPosition += 10;
      pdf.setFontSize(10);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        pageWidth / 2,
        pdf.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      
      // Save the PDF
      const fileName = `attendance-${date.replace(/\s+/g, '-')}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF file. Please try again.');
    }
  };

  // Handle download
  const handleDownload = (e) => {
    e.stopPropagation();
    downloadAttendancePDF();
  };

  // Handle edit button click
  const handleEditClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  // Handle cancel edit
  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setIsEditing(false);
    // Reset to original data
    const originalData = {};
    students.forEach(student => {
      const studentId = getStudentNumber(student);
      originalData[studentId] = student.status || 'absent';
    });
    setAttendanceData(originalData);
  };

  return (
    <div className="bg-[#15151C] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-[#23232C]">
      {/* Card Header */}
      <div 
        className="p-3 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        {/* Mobile Layout */}
        <div className="sm:hidden">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1">
              <span className="text-xs text-[#FFFFFF]">
                Attendance for <span className="font-bold">{date}</span>
              </span>
              <div className="text-xs text-gray-400 mt-0.5">
                ({students ? students.length : 0} students)
              </div>
            </div>
            
            {/* Arrow button for mobile */}
            <img
              src={ArrowDown}
              alt="Expand"
              className={`h-4 w-4 flex-shrink-0 transform transition-transform duration-300 invert ${
                open ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* Summary badges */}
          {!open && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span className="px-1.5 py-0.5 bg-[#00A15D]/20 text-[#00A15D] text-xs rounded-full font-medium">
                P: {presentCount}
              </span>
              <span className="px-1.5 py-0.5 bg-[#767EE0]/20 text-[#767EE0] text-xs rounded-full font-medium">
                L: {lateCount}
              </span>
              <span className="px-1.5 py-0.5 bg-[#A15353]/20 text-[#A15353] text-xs rounded-full font-medium">
                A: {absentCount}
              </span>
            </div>
          )}

          {/* Download button for mobile */}
          <button 
            onClick={handleDownload}
            className="w-full px-2 py-1.5 bg-[#767EE0] text-[#FFFFFF] font-medium text-xs rounded hover:bg-[#6366ce] transition-all duration-200"
          >
            Download PDF
          </button>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex sm:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex flex-row items-center gap-2">
              <span className="text-sm text-[#FFFFFF]">
                Attendance for <span className="font-bold">{date}</span>
              </span>
              <span className="text-xs text-gray-400">
                ({students ? students.length : 0} students)
              </span>
            </div>
          </div>
          
          {/* Action buttons for desktop */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDownload}
              className="px-3 py-1.5 bg-[#767EE0] text-[#FFFFFF] font-medium text-xs rounded hover:bg-[#6366ce] transition-all duration-200 whitespace-nowrap cursor-pointer"
            >
              Download PDF
            </button>
            <img
              src={ArrowDown}
              alt="Expand"
              className={`h-5 w-5 flex-shrink-0 transform transition-transform duration-300 invert ${
                open ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {open && (
        <div className="border-t border-[#23232C]">
          {/* Edit Button and Action Buttons - Inside the expanded card */}
          <div className="flex flex-col sm:flex-row-reverse justify-end items-start sm:items-center gap-2 px-3 py-2 bg-[#23232C] border-b border-[#15151C]">
            <div className="flex items-center gap-2">
              {!isEditing && (
                <button 
                  onClick={handleEditClick}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#767EE0] text-[#FFFFFF] font-medium text-xs rounded hover:bg-[#6366ce] transition-all duration-200 whitespace-nowrap cursor-pointer"
                >
                  Edit
                </button>
              )}
              {/* Save/Cancel buttons when editing */}
              {isEditing && (
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 bg-gray-600 text-[#FFFFFF] font-medium text-xs rounded hover:bg-gray-700 transition-all duration-200 whitespace-nowrap cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveAttendance}
                    className="px-3 py-1.5 bg-[#00A15D] text-[#FFFFFF] font-medium text-xs rounded hover:bg-[#00874E] transition-all duration-200 whitespace-nowrap cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
            
            {/* Summary section */}
            <div className="flex items-center gap-3 mr-auto mt-2 sm:mt-0">
              <span className="px-2 py-1 bg-[#00A15D]/20 text-[#00A15D] text-xs rounded-full font-medium">
                P: {presentCount}
              </span>
              <span className="px-2 py-1 bg-[#767EE0]/20 text-[#767EE0] text-xs rounded-full font-medium">
                L: {lateCount}
              </span>
              <span className="px-2 py-1 bg-[#A15353]/20 text-[#A15353] text-xs rounded-full font-medium">
                A: {absentCount}
              </span>
            </div>
          </div>

          {/* MOBILE CARD VIEW */}
          <div className="block sm:hidden p-3 space-y-2">
            {students && students.length > 0 ? (
              students.map((student, index) => {
                const studentNumber = getStudentNumber(student);
                const studentName = getStudentName(student);
                const currentStatus = isEditing ? attendanceData[studentNumber] : student.status;
                
                return (
                  <div 
                    key={studentNumber + index} 
                    className="bg-[#23232C] rounded p-2 border border-[#15151C]"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#FFFFFF] text-xs mb-0.5 truncate">
                          {studentName}
                        </p>
                        <p className="text-xs text-gray-400">
                          #{studentNumber}
                        </p>
                      </div>
                      {!isEditing ? (
                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ml-2 ${getStatusBgColor(currentStatus)} ${getStatusColor(currentStatus)}`}>
                          {getStatusText(currentStatus).charAt(0)}
                        </span>
                      ) : (
                        <div className="flex flex-col gap-0.5 ml-2">
                          {/* Attendance radio buttons for mobile editing with labels - Updated order */}
                          {[
                            { status: 'present', label: 'P', color: '#00A15D' },
                            { status: 'late', label: 'L', color: '#767EE0' },
                            { status: 'absent', label: 'A', color: '#A15353' }
                          ].map(({ status, label, color }) => (
                            <label key={status} className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="radio"
                                name={`attendance-${studentNumber}-${index}`}
                                checked={currentStatus === status}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleAttendanceChange(studentNumber, status);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="appearance-none w-3 h-3 border-2 rounded-sm checked:bg-current cursor-pointer"
                                style={{
                                  borderColor: color,
                                  backgroundColor: currentStatus === status ? color : 'transparent'
                                }}
                              />
                              <span className="text-xs font-medium" style={{ color }}>{label}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-gray-400 text-xs">
                No student data available
              </div>
            )}
          </div>

          {/* DESKTOP TABLE VIEW */}
          <div className="hidden sm:block p-3 overflow-x-auto">
            <table className="w-full bg-[#15151C] border-collapse text-left min-w-[600px]">
              <thead>
                <tr className="text-xs font-semibold text-[#FFFFFF]">
                  <th className="px-2 py-1.5">#</th>
                  <th className="px-2 py-1.5">Student No.</th>
                  <th className="px-2 py-1.5">Full Name</th>
                  {!isEditing ? (
                    <th className="px-2 py-1.5 text-right">Status</th>
                  ) : (
                    <>
                      <th className="px-2 py-1.5 text-[#00A15D] text-center w-16">P</th>
                      <th className="px-2 py-1.5 text-[#767EE0] text-center w-16">L</th>
                      <th className="px-2 py-1.5 text-[#A15353] text-center w-16">A</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {students && students.length > 0 ? (
                  students.map((student, index) => {
                    const studentNumber = getStudentNumber(student);
                    const studentName = getStudentName(student);
                    const currentStatus = isEditing ? attendanceData[studentNumber] : student.status;
                    
                    return (
                      <tr 
                        key={studentNumber + index} 
                        className="hover:bg-[#23232C] text-xs text-[#FFFFFF] border-t border-[#23232C]"
                      >
                        <td className="px-2 py-1.5">{index + 1}</td>
                        <td className="px-2 py-1.5">{studentNumber}</td>
                        <td className="px-2 py-1.5">{studentName}</td>
                        
                        {!isEditing ? (
                          <td className="px-2 py-1.5 text-right">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${getStatusBgColor(currentStatus)} ${getStatusColor(currentStatus)}`}>
                              {getStatusText(currentStatus)}
                            </span>
                          </td>
                        ) : (
                          <>
                            {/* Present Column */}
                            <td className="px-2 py-1.5 w-16">
                              <div className="flex justify-center items-center">
                                <input
                                  type="radio"
                                  name={`attendance-${studentNumber}`}
                                  checked={currentStatus === "present"}
                                  onChange={() => handleAttendanceChange(studentNumber, "present")}
                                  className="appearance-none w-4 h-4 border-2 border-[#00A15D] rounded-sm checked:bg-[#00A15D] cursor-pointer"
                                />
                              </div>
                            </td>

                            {/* Late Column */}
                            <td className="px-2 py-1.5 w-16">
                              <div className="flex justify-center items-center">
                                <input
                                  type="radio"
                                  name={`attendance-${studentNumber}`}
                                  checked={currentStatus === "late"}
                                  onChange={() => handleAttendanceChange(studentNumber, "late")}
                                  className="appearance-none w-4 h-4 border-2 border-[#767EE0] rounded-sm checked:bg-[#767EE0] cursor-pointer"
                                />
                              </div>
                            </td>

                            {/* Absent Column */}
                            <td className="px-2 py-1.5 w-16">
                              <div className="flex justify-center items-center">
                                <input
                                  type="radio"
                                  name={`attendance-${studentNumber}`}
                                  checked={currentStatus === "absent"}
                                  onChange={() => handleAttendanceChange(studentNumber, "absent")}
                                  className="appearance-none w-4 h-4 border-2 border-[#A15353] rounded-sm checked:bg-[#A15353] cursor-pointer"
                                />
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td 
                      colSpan={isEditing ? "6" : "4"} 
                      className="px-4 py-6 text-center text-gray-400 text-xs"
                    >
                      No student data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
          <div className="bg-[#15151C] rounded-lg shadow-2xl w-full max-w-sm p-5 text-center border border-[#23232C]">
            <img
              src={SuccessIcon}
              alt="Success"
              className="h-12 w-12 mx-auto mb-3"
            />
            <h3 className="text-lg font-bold text-[#FFFFFF] mb-2">Success!</h3>
            <p className="text-gray-300 text-sm mb-4">{modalMessage}</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-[#00A15D] hover:bg-[#00874E] text-[#FFFFFF] font-bold py-2 rounded transition-colors cursor-pointer text-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
          <div className="bg-[#15151C] rounded-lg shadow-2xl w-full max-w-sm p-5 text-center border border-[#23232C]">
            <img
              src={ErrorIcon}
              alt="Error"
              className="h-12 w-12 mx-auto mb-3"
            />
            <h3 className="text-lg font-bold text-[#FFFFFF] mb-2">Error</h3>
            <p className="text-gray-300 text-sm mb-4">{modalMessage}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full bg-[#A15353] hover:bg-[#8a4545] text-[#FFFFFF] font-bold py-2 rounded transition-colors cursor-pointer text-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceCard;