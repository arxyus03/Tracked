import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import AttendanceCard from "../../Components/AttendanceHistoryComponents/AttendanceCard";
import RemoveStudent from "../../Components/AttendanceHistoryComponents/RemoveStudent";

import AttendanceHistoryIcon from '../../assets/AttendanceHistory.svg';
import BackButton from '../../assets/BackButton(Light).svg';
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
          console.log('Attendance history data:', result.attendance_history);
          setAttendanceHistory(result.attendance_history);
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
    record.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 15;

      // Process each attendance date
      attendanceHistory.forEach((record, recordIndex) => {
        // Check if we need a new page
        if (yPosition > 250 && recordIndex > 0) {
          pdf.addPage();
          yPosition = margin;
        }

        // Date header
        pdf.setFontSize(16);
        pdf.setFont(undefined, 'bold');
        pdf.text(`Attendance for ${record.date}`, margin, yPosition);
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
      <div>
        <Sidebar role="teacher" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsSidebarOpen} isOpen={isSidebarOpen}/>
          <div className="p-5 text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Sidebar role="teacher" isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsSidebarOpen} isOpen={isSidebarOpen} />

        {/* Main Content */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          
          {/* Page Header - Updated to match Attendance style */}
          <div className="mb-4 sm:mb-4">
            <div className="flex items-center mb-2">
              <img
                src={AttendanceHistoryIcon}
                alt="AttendanceHistoryIcon"
                className="h-7 w-7 sm:h-9 sm:w-9 mr-2 sm:mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                Attendance History
              </h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-[#465746]">
              Academic Management
            </p>
          </div>

          {/* Subject Information */}
          <div className="flex flex-col gap-2 text-sm sm:text-base lg:text-[1.125rem] text-[#465746] mb-4 sm:mb-5">
            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT CODE:</span>
              <span>{classInfo?.subject_code || 'Loading...'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT:</span>
              <span>{classInfo?.subject || 'Loading...'}</span>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Section:</span>
                <span>{classInfo?.section || 'Loading...'}</span>
              </div>
              <Link to={`/Attendance?code=${subjectCode}`}>
                <img 
                  src={BackButton} 
                  alt="Back" 
                  className="h-6 w-6 cursor-pointer hover:opacity-70 transition-opacity" 
                />
              </Link>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Search and Download All Button */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-4 sm:mt-5 gap-3">
            <div className="relative flex-1 max-w-full sm:max-w-md">
              <input
                type="text"
                placeholder="Search by date or student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 sm:h-10 lg:h-11 rounded-md pl-3 pr-10 shadow-md outline-none text-[#465746] bg-white text-xs sm:text-sm"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#465746]"
              >
                <img 
                  src={Search} 
                  alt="Search"
                  className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6"
                />
              </button>
            </div>
            
            {/* Download All Button */}
            <button
              onClick={downloadAllAttendanceRecords}
              disabled={downloading || !attendanceHistory.length}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-[#00A15D] text-white font-semibold text-sm rounded-lg hover:bg-[#00874E] disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap cursor-pointer"
            >
              {downloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <span>Download All Records</span>
                </>
              )}
            </button>
          </div>

          {/* Attendance Cards */}
          <div className="space-y-4 mt-4 sm:mt-5">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((record, index) => (
                <AttendanceCard 
                  key={index} 
                  date={record.date} 
                  students={record.students}
                  rawDate={record.raw_date}
                  subjectCode={subjectCode}
                  onRemoveStudent={handleOpenRemoveStudent}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No attendance records found.</p>
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