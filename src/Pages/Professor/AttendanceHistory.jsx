import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import AttendanceCard from "../../Components/ProfessorComponents/AttendanceCard";
import RemoveStudent from "../../Components/ProfessorComponents/RemoveStudent";

import AttendanceHistoryIcon from '../../assets/History.svg';
import BackButton from '../../assets/BackButton.svg';
import Search from '../../assets/Search.svg';

export default function AttendanceHistory() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get('code');
  
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRemoveStudentModal, setShowRemoveStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [downloading, setDownloading] = useState(false);

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

  // Format date with correct timezone
  const formatDateWithTime = (rawDate, rawTime) => {
    if (!rawDate) return { formatted: 'Unknown Date', time: '' };
    
    try {
      // Parse the date
      const dateObj = new Date(rawDate);
      
      // Format date (F j, Y)
      const formattedDate = dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      // Try to get time from rawTime (created_at field)
      let formattedTime = '';
      if (rawTime) {
        try {
          // Parse the timestamp - handle both UTC and local times
          const timeObj = new Date(rawTime);
          
          // Check if the time is in UTC (ends with Z or has UTC timezone)
          const isUTC = rawTime.includes('Z') || rawTime.includes('+00:00');
          
          if (isUTC) {
            // UTC to Philippines time (UTC+8)
            timeObj.setHours(timeObj.getHours() + 8);
          }
          
          // Format time in 12-hour format
          formattedTime = timeObj.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Manila'
          });
        } catch (timeError) {
          console.error('Error formatting time:', timeError);
          
          // Fallback: Try to extract time from string
          const timeMatch = rawTime.match(/(\d{1,2}):(\d{2})/);
          if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = timeMatch[2];
            const ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;
            formattedTime = `${hours}:${minutes} ${ampm}`;
          }
        }
      }
      
      // If no time from rawTime, try to get current time (for today's attendance)
      if (!formattedTime) {
        const now = new Date();
        const today = new Date().toISOString().split('T')[0];
        const recordDate = new Date(rawDate).toISOString().split('T')[0];
        
        if (today === recordDate) {
          // For today's attendance, show current time
          formattedTime = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Manila'
          });
        }
      }
      
      return {
        formatted: formattedDate,
        time: formattedTime,
        raw: rawDate,
        rawTime: rawTime
      };
    } catch (error) {
      console.error('Error formatting date:', error);
      return { formatted: rawDate, time: '', raw: rawDate, rawTime: rawTime };
    }
  };

  // Fetch class details and attendance history
  useEffect(() => {
    if (subjectCode) {
      fetchClassDetails();
      fetchAttendanceHistory();
    }
  }, [subjectCode]);

  const fetchClassDetails = async () => {
    try {
      const professorId = getProfessorId();
      const response = await fetch(`https://tracked.6minds.site/Professor/SubjectDetailsDB/get_class_details.php?subject_code=${subjectCode}&professor_ID=${professorId}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setClassInfo(result.class_data);
        }
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const professorId = getProfessorId();
      console.log('Fetching attendance history for:', { subjectCode, professorId });
      
      const response = await fetch(`https://tracked.6minds.site/Professor/AttendanceDB/get_attendance_history.php?subject_code=${subjectCode}&professor_ID=${professorId}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Attendance history API response:', result);
        
        if (result.success) {
          // Process dates to show correct time
          const processedHistory = result.attendance_history.map(record => {
            const dateInfo = formatDateWithTime(record.raw_date || record.date, record.raw_time || record.created_at);
            return {
              ...record,
              displayDate: dateInfo.formatted,
              displayTime: dateInfo.time,
              rawDate: dateInfo.raw,
              rawTime: dateInfo.rawTime
            };
          });
          
          // Sort by date and time (newest first)
          processedHistory.sort((a, b) => {
            if (!a.rawTime || !b.rawTime) {
              // Fallback to date comparison
              const dateA = new Date(a.rawDate || a.date);
              const dateB = new Date(b.rawDate || b.date);
              return dateB - dateA;
            }
            
            const timeA = new Date(a.rawTime);
            const timeB = new Date(b.rawTime);
            return timeB - timeA;
          });
          
          console.log('Processed attendance history with times:', processedHistory);
          setAttendanceHistory(processedHistory);
        } else {
          console.error('API returned error:', result.message);
        }
      } else {
        console.error('Failed to fetch attendance history');
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter attendance history based on search term
  const filteredHistory = attendanceHistory.filter(record =>
    record.displayDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.displayTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.rawDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.students.some(student => 
      student.user_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user_ID.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Handle opening remove student modal
  const handleOpenRemoveStudent = (student) => {
    setSelectedStudent(student);
    setShowRemoveStudentModal(true);
  };

  // Handle closing remove student modal
  const handleCloseRemoveStudent = () => {
    setShowRemoveStudentModal(false);
    setSelectedStudent(null);
  };

  // Handle removing student
  const handleRemoveStudent = async (student) => {
    try {
      console.log('Removing student:', student);
      await fetchAttendanceHistory();
      setShowRemoveStudentModal(false);
    } catch (error) {
      console.error('Error removing student:', error);
    }
  };

  // Download all attendance records as PDF
  const downloadAllAttendanceRecords = async () => {
    if (!attendanceHistory.length) {
      alert('No attendance records to download');
      return;
    }

    setDownloading(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 15;
      let yPosition = margin;
      
      // Add title and class information
      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.text('Complete Attendance History', pageWidth / 2, yPosition, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'normal');
      yPosition += 10;
      
      // Class information
      if (classInfo) {
        pdf.text(`Subject: ${classInfo.subject || 'N/A'} (${classInfo.subject_code || 'N/A'})`, margin, yPosition);
        yPosition += 6;
        pdf.text(`Section: ${classInfo.section || 'N/A'}`, margin, yPosition);
        yPosition += 6;
        pdf.text(`Professor: ${classInfo.professor_name || 'N/A'}`, margin, yPosition);
        yPosition += 6;
      }
      
      pdf.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`, margin, yPosition);
      yPosition += 15;

      // Process each attendance date
      attendanceHistory.forEach((record, recordIndex) => {
        // Check if we need a new page
        if (yPosition > 250 && recordIndex > 0) {
          pdf.addPage();
          yPosition = margin;
        }

        // Date header with time if available
        let dateHeader = `Attendance for ${record.displayDate}`;
        if (record.displayTime) {
          dateHeader += ` at ${record.displayTime}`;
        }
        
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.text(dateHeader, margin, yPosition);
        yPosition += 8;

        // Calculate statistics for this date
        const presentCount = record.students.filter(s => s.status === 'present').length;
        const lateCount = record.students.filter(s => s.status === 'late').length;
        const absentCount = record.students.filter(s => s.status === 'absent').length;
        const totalStudents = record.students.length;

        // Summary
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Summary: Present: ${presentCount} | Late: ${lateCount} | Absent: ${absentCount} | Total: ${totalStudents}`, margin, yPosition);
        yPosition += 10;

        // Table headers
        pdf.setFont(undefined, 'bold');
        pdf.text('#', margin, yPosition);
        pdf.text('Student ID', margin + 15, yPosition);
        pdf.text('Full Name', margin + 60, yPosition);
        pdf.text('Status', pageWidth - margin - 20, yPosition);
        
        // Line under headers
        yPosition += 3;
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 7;

        // Student data
        pdf.setFont(undefined, 'normal');
        pdf.setFontSize(9);
        
        record.students.forEach((student, index) => {
          // Check if we need a new page
          if (yPosition > 270) {
            pdf.addPage();
            yPosition = margin;
            
            // Add headers on new page
            pdf.setFont(undefined, 'bold');
            pdf.setFontSize(10);
            pdf.text('#', margin, yPosition);
            pdf.text('Student ID', margin + 15, yPosition);
            pdf.text('Full Name', margin + 60, yPosition);
            pdf.text('Status', pageWidth - margin - 20, yPosition);
            yPosition += 10;
            pdf.setFont(undefined, 'normal');
            pdf.setFontSize(9);
          }

          const studentNumber = student.student_ID || student.user_ID || 'N/A';
          const studentName = student.user_Name || 'Unknown';
          const status = student.status.charAt(0).toUpperCase() + student.status.slice(1);

          // Add student data
          pdf.text(`${index + 1}`, margin, yPosition);
          pdf.text(studentNumber, margin + 15, yPosition);
          
          // Truncate long names to fit
          const maxNameWidth = 80;
          let displayName = studentName;
          if (pdf.getTextWidth(studentName) > maxNameWidth) {
            // Find a reasonable truncation point
            for (let i = studentName.length; i > 0; i--) {
              const testName = studentName.substring(0, i) + '...';
              if (pdf.getTextWidth(testName) <= maxNameWidth) {
                displayName = testName;
                break;
              }
            }
          }
          pdf.text(displayName, margin + 60, yPosition);
          
          // Set color based on status
          switch (student.status) {
            case 'present':
              pdf.setTextColor(0, 161, 93); // Green
              break;
            case 'late':
              pdf.setTextColor(118, 126, 224); // Blue
              break;
            case 'absent':
              pdf.setTextColor(239, 68, 68); // Red
              break;
            default:
              pdf.setTextColor(0, 0, 0);
          }
          
          pdf.text(status, pageWidth - margin - 20, yPosition, { align: 'right' });
          
          // Reset text color for next row
          pdf.setTextColor(0, 0, 0);
          
          yPosition += 6;
        });
        
        yPosition += 10; // Space between records
      });

      // Add footer with page numbers
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      const fileName = `attendance-history-${classInfo?.subject_code || 'class'}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Error details:', error.message);
      alert('Error generating PDF file. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#23232C] min-h-screen">
        <Sidebar role="teacher" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsSidebarOpen} isOpen={isSidebarOpen}/>
          <div className="p-5 text-center text-[#FFFFFF]">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#23232C] min-h-screen">
      <Sidebar role="teacher" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsSidebarOpen} isOpen={isSidebarOpen} />

        {/* Main Content */}
        <div className="p-3 sm:p-4 md:p-5 lg:p-6">
          
          {/* Page Header - Smaller */}
          <div className="mb-3 sm:mb-4">
            <div className="flex items-center mb-1">
              <img
                src={AttendanceHistoryIcon}
                alt="AttendanceHistoryIcon"
                className="h-6 w-6 sm:h-7 sm:w-7 mr-2"
              />
              <h1 className="font-bold text-lg sm:text-xl lg:text-2xl text-[#FFFFFF]">
                Attendance History
              </h1>
            </div>
            <p className="text-xs sm:text-sm lg:text-base text-[#FFFFFF]/80">
              Academic Management
            </p>
          </div>

          {/* Subject Information - Smaller */}
          <div className="flex flex-col gap-1 text-xs sm:text-sm lg:text-base text-[#FFFFFF]/80 mb-3">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <span className="font-semibold">SUBJECT CODE:</span>
              <span>{classInfo?.subject_code || 'Loading...'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <span className="font-semibold">SUBJECT:</span>
              <span>{classInfo?.subject || 'Loading...'}</span>
            </div>

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="font-semibold">SECTION:</span>
                <span>{classInfo?.section || 'Loading...'}</span>
              </div>
              <div className="flex justify-end">
                <Link to={`/Attendance?code=${subjectCode}`}>
                  <img 
                    src={BackButton} 
                    alt="Back" 
                    className="h-5 w-5 cursor-pointer hover:opacity-70 transition-opacity" 
                    title="Back to Attendance"
                  />
                </Link>
              </div>
            </div>
          </div>

          <hr className="border-[#FFFFFF]/30 mb-3" />

          {/* Search and Download All Button - Smaller */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-3 gap-2">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <input
                type="text"
                placeholder="Search by date, time, or student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-8 sm:h-9 rounded-md pl-3 pr-9 shadow-md outline-none text-[#FFFFFF] bg-[#15151C] text-xs sm:text-sm border border-[#FFFFFF]/10 focus:border-[#767EE0] transition-colors"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#FFFFFF]/60 hover:text-[#FFFFFF]"
              >
                <img 
                  src={Search} 
                  alt="Search"
                  className="h-3 w-3 sm:h-4 sm:w-4"
                />
              </button>
            </div>
            
            {/* Download All Button - Smaller */}
            <button
              onClick={downloadAllAttendanceRecords}
              disabled={downloading || !attendanceHistory.length}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#00A15D] text-[#FFFFFF] font-semibold text-xs rounded-md hover:bg-[#00A15D]/90 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap cursor-pointer mt-2 sm:mt-0"
            >
              {downloading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs">Generating PDF...</span>
                </>
              ) : (
                <>
                  <span className="text-xs">Download All Records</span>
                </>
              )}
            </button>
          </div>

          {/* Attendance Cards - Smaller */}
          <div className="space-y-3 mt-3">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((record, index) => (
                <AttendanceCard 
                  key={index} 
                  date={record.displayDate} 
                  time={record.displayTime}
                  students={record.students}
                  rawDate={record.rawDate}
                  rawTime={record.rawTime}
                  subjectCode={subjectCode}
                  onRemoveStudent={handleOpenRemoveStudent}
                />
              ))
            ) : (
              <div className="text-center py-6 text-[#FFFFFF]/60">
                <p className="text-sm">No attendance records found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Remove Student Modal */}
      <RemoveStudent
        isOpen={showRemoveStudentModal}
        onClose={handleCloseRemoveStudent}
        onConfirm={handleRemoveStudent}
        student={selectedStudent}
      />
    </div>
  );
}