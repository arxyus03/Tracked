import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import jsPDF from 'jspdf';
// Import autoTable properly
import autoTable from 'jspdf-autotable';

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
import SubjectOverview from "../../assets/SubjectOverview.svg";

// ========== PAGINATION COMPONENT ==========
const Pagination = ({ currentPage, totalPages, onPageChange, startIndex, endIndex, totalItems }) => {
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

// ========== DOWNLOAD BUTTON COMPONENT ==========
const DownloadButton = ({ onClick, label, disabled = false, data = [] }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  const handleClick = async () => {
    if (disabled || !data || data.length === 0) {
      alert(`No data available to download for ${label}`);
      return;
    }
    
    setIsDownloading(true);
    try {
      await onClick();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={disabled || isDownloading || (!data || data.length === 0)}
      className={`flex items-center gap-2 px-4 py-2 font-semibold text-sm rounded-md shadow-md border-2 transition-all duration-300 cursor-pointer ${
        disabled || !data || data.length === 0
          ? 'bg-[#15151C] text-[#FFFFFF]/40 border-[#FFFFFF]/10 cursor-not-allowed'
          : isDownloading
          ? 'bg-[#00A15D]/70 text-[#FFFFFF] border-[#00A15D] cursor-wait'
          : 'bg-[#00A15D] text-[#FFFFFF] border-[#00A15D] hover:bg-[#00A15D]/90'
      }`}
    >
      {isDownloading ? (
        <>
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating...
        </>
      ) : (
        <span>{label}</span>
      )}
    </button>
  );
};

// ========== SIMPLE TIME FORMATTING FUNCTION ==========
const formatAttendanceDate = (record) => {
  if (!record || !record.raw_date) return { date: "—", time: "" };
  
  try {
    const dateObj = new Date(record.raw_date);
    const formattedDate = dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    
    if (record.status === 'absent') {
      return { 
        date: formattedDate, 
        time: ""
      };
    }
    
    if ((record.status === 'present' || record.status === 'late') && record.marked_time) {
      return { 
        date: formattedDate, 
        time: record.marked_time
      };
    }
    
    if ((record.status === 'present' || record.status === 'late') && record.created_at) {
      const timeObj = new Date(record.created_at);
      const timeString = timeObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      return { 
        date: formattedDate, 
        time: timeString
      };
    }
    
    return { 
      date: formattedDate, 
      time: ""
    };
  } catch (error) {
    console.error('Error formatting date:', error);
    return { 
      date: record.raw_date || "—", 
      time: ""
    };
  }
};

// ========== ATTENDANCE STATUS INDICATOR COMPONENT ==========
const AttendanceStatusIndicator = ({ remainingLates, isCritical, isAtRisk }) => {
  const getStatusColor = () => {
    if (isCritical) return 'bg-[#A15353] text-[#FFFFFF]';
    if (isAtRisk) return 'bg-[#FFA600] text-[#FFFFFF]';
    return 'bg-[#00A15D] text-[#FFFFFF]';
  };

  const getStatusText = () => {
    if (isCritical) return 'CRITICAL - DROPPABLE';
    if (isAtRisk) return 'AT RISK';
    return 'SAFE';
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor()} flex items-center gap-1`}>
        <span>{getStatusText()}</span>
      </div>
      <div className="text-xs text-[#FFFFFF]/60">
        {remainingLates > 0 && `(${remainingLates} lates not yet converted)`}
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

  // Debug effects
  useEffect(() => {
    console.log('Combined Attendance Data Updated:', getCombinedAttendanceData());
    console.log('Combined Attendance Data Length:', getCombinedAttendanceData().length);
  }, [attendanceData]);

  useEffect(() => {
    console.log('Filtered Attendance Updated:', filteredAttendance());
    console.log('Filtered Attendance Length:', filteredAttendance().length);
  }, [attendanceSummaryData, subjectCode]);

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
      
      console.log('Fetching from:', attendanceUrl);
      const response = await fetch(attendanceUrl);
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Response (History):', data);
        
        if (data.success) {
          setAttendanceData(data);
          console.log('Attendance history:', data.attendance_history);
          console.log('Attendance summary from history API:', data.attendance_summary);
        } else {
          console.error('API returned error:', data.message);
          setAttendanceData(null);
        }
      } else {
        console.error('HTTP error:', response.status);
        setAttendanceData(null);
      }
    } catch (error) {
      console.error('Network error:', error);
      setAttendanceData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceSummaryData = async () => {
    if (!studentId) return;

    try {
      console.log('Fetching attendance summary data for student:', studentId);
      const response = await fetch(`https://tracked.6minds.site/Student/AttendanceStudentDB/get_attendance_student.php?student_id=${studentId}`);
      
      console.log('Summary response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Response (Summary):', data);
        
        if (data.success) {
          console.log('Attendance summary data:', data.attendance_summary);
          setAttendanceSummaryData(data.attendance_summary);
        } else {
          console.error('Summary API returned error:', data.message);
          setAttendanceSummaryData([]);
        }
      } else {
        console.error('Summary HTTP error:', response.status);
        setAttendanceSummaryData([]);
      }
    } catch (error) {
      console.error('Error fetching attendance summary data:', error);
      setAttendanceSummaryData([]);
    }
  };

  // ========== ENHANCED HELPER FUNCTIONS ==========
  const getCombinedAttendanceData = () => {
    if (!attendanceData || !attendanceData.attendance_history || !Array.isArray(attendanceData.attendance_history)) {
      console.log('No attendance history data available');
      return [];
    }
    
    const sortedHistory = [...attendanceData.attendance_history].sort((a, b) => {
      const dateA = a.raw_date ? new Date(a.raw_date) : new Date(0);
      const dateB = b.raw_date ? new Date(b.raw_date) : new Date(0);
      return dateB - dateA; // Descending order (newest first)
    });
    
    console.log('Sorted History:', sortedHistory);
    return sortedHistory;
  };

  const calculateAttendanceWarnings = () => {
    // Use the data from the history API instead of the summary API
    if (!attendanceData || !attendanceData.attendance_summary) {
      console.log('No attendance summary data available from history API');
      return { 
        overallWarning: false, 
        subjectWarnings: [], 
        criticalSubjects: [],
        totalEffectiveAbsences: 0,
        hasDroppableSubject: false
      };
    }

    let hasOverallWarning = false;
    let hasDroppableSubject = false;
    const criticalSubjects = [];
    let totalEffectiveAbsences = 0;
    
    // Create a single subject warning from the history API data
    const summary = attendanceData.attendance_summary;
    const subjectData = {
      subject_code: subjectCode,
      subject_name: classInfo?.subject || 'Unknown Subject',
      section: classInfo?.section || 'N/A',
      present: summary.present || 0,
      late: summary.late || 0,
      absent: summary.absent || 0,
      total_classes: summary.total || 0
    };
    
    const equivalentAbsences = Math.floor(subjectData.late / 3);
    const remainingLates = subjectData.late % 3;
    totalEffectiveAbsences = subjectData.absent + equivalentAbsences;
    
    const hasWarning = totalEffectiveAbsences >= 1;
    const isAtRisk = totalEffectiveAbsences >= 2;
    const isCritical = totalEffectiveAbsences >= 3;
    
    if (hasWarning) hasOverallWarning = true;
    if (isCritical) {
      criticalSubjects.push(subjectData);
      hasDroppableSubject = true;
    }

    let statusLevel = 'normal';
    let statusMessage = 'Attendance is satisfactory';
    
    if (isCritical) {
      statusLevel = 'critical';
      statusMessage = `DROPPABLE: ${totalEffectiveAbsences} effective absences reached`;
    } else if (isAtRisk) {
      statusLevel = 'warning';
      statusMessage = `WARNING: ${totalEffectiveAbsences} effective absences - 1 more leads to being droppable`;
    } else if (hasWarning) {
      statusLevel = 'notice';
      statusMessage = `NOTICE: ${totalEffectiveAbsences} effective absence${totalEffectiveAbsences !== 1 ? 's' : ''}`;
    }

    const subjectWarning = {
      ...subjectData,
      equivalentAbsences,
      remainingLates,
      totalEffectiveAbsences,
      hasWarning,
      isAtRisk,
      isCritical,
      statusLevel,
      statusMessage,
      warningMessage: `${statusMessage} (${subjectData.absent} absents + ${equivalentAbsences} from ${subjectData.late} lates)`
    };

    console.log('Calculated warnings from history API:', {
      subject: subjectWarning,
      overallWarning: hasOverallWarning,
      hasDroppableSubject,
      totalEffectiveAbsences
    });

    return { 
      overallWarning: hasOverallWarning, 
      subjectWarnings: [subjectWarning], // Return as array with single subject
      criticalSubjects,
      totalEffectiveAbsences,
      hasDroppableSubject
    };
  };

  const filteredAttendance = () => {
    // Use the calculated warnings from history API
    const warnings = calculateAttendanceWarnings();
    console.log('Filtered attendance (from history API):', warnings.subjectWarnings);
    return warnings.subjectWarnings;
  };

  // ========== PDF GENERATION FUNCTIONS ==========
  const generateAttendanceHistoryPDF = () => {
    console.log('Generating Attendance History PDF...');
    console.log('Student ID:', studentId);
    console.log('Subject Code:', subjectCode);
    console.log('Attendance Data:', attendanceData);
    
    const combinedData = getCombinedAttendanceData();
    console.log('Combined Attendance Data:', combinedData);
    console.log('Combined Attendance Data Length:', combinedData.length);
    
    if (!combinedData.length) {
      console.error('No attendance data to generate PDF');
      alert('No attendance history data available to download.');
      return;
    }
    
    // Check if jsPDF and autoTable are loaded
    if (typeof jsPDF === 'undefined') {
      alert('PDF library not loaded. Please refresh the page.');
      return;
    }
    
    if (typeof autoTable === 'undefined') {
      alert('PDF table library not loaded. Please refresh the page.');
      return;
    }
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Header with gradient effect
      doc.setFillColor(35, 35, 44); // Dark background
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Attendance History Report', pageWidth / 2, 25, { align: 'center' });
      
      // Student Information Section
      doc.setFillColor(21, 21, 28); // Slightly lighter background
      doc.rect(10, 45, pageWidth - 20, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Student Information:', 15, 55);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Name: ${attendanceData?.student?.name || 'N/A'}`, 15, 65);
      doc.text(`Student No: ${studentId}`, 15, 72);
      doc.text(`Subject: ${classInfo?.subject || 'N/A'}`, pageWidth / 2, 65);
      doc.text(`Section: ${classInfo?.section || 'N/A'}`, pageWidth / 2, 72);
      
      // Generated date
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Generated: ${currentDate}`, pageWidth - 15, 72, { align: 'right' });
      
      // Attendance History Table - FIXED: Center the table
      const tableY = 85;
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Attendance History', pageWidth / 2, tableY, { align: 'center' });
      
      // Prepare table data - Only 2 columns: Date and Status
      const tableData = combinedData.map(record => {
        const { date, time } = formatAttendanceDate(record);
        
        let statusWithTime = "";
        if (record.status === 'present') {
          statusWithTime = time ? `Present (${time})` : 'Present';
        } else if (record.status === 'late') {
          statusWithTime = time ? `Late (${time})` : 'Late';
        } else {
          statusWithTime = 'Absent';
        }
        
        return [date, statusWithTime];
      });
      
      // Create table - FIXED: Center the table
      autoTable(doc, {
        startY: tableY + 10,
        head: [['Date', 'Status']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [35, 35, 44],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'center'
        },
        bodyStyles: {
          fillColor: [21, 21, 28],
          textColor: [255, 255, 255],
          fontSize: 9,
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [28, 28, 37],
        },
        columnStyles: {
          0: { cellWidth: 70, halign: 'center' },
          1: { cellWidth: 70, halign: 'center' }
        },
        margin: { left: (pageWidth - 140) / 2 }, // Center the table (140 = 70+70 cell widths)
        styles: {
          lineWidth: 0.1,
          lineColor: [100, 100, 100],
        },
        didDrawPage: (data) => {
          // Footer
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(`Page ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }
      });
      
      // Policy Notice - Left aligned as requested
      const finalY = doc.lastAutoTable?.finalY || tableY + 100;
      
      if (finalY < pageHeight - 40) {
        // Longer box for policy
        const policyBoxWidth = pageWidth - 30; // Longer box
        doc.setFillColor(35, 35, 44, 50);
        doc.rect(15, finalY + 10, policyBoxWidth, 25, 'F');
        
        // Left aligned
        doc.setTextColor(255, 166, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Attendance Policy:', 20, finalY + 20);
        
        // Left aligned policy text
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
        // Only 2 policy lines as requested
        doc.text('• 3 accumulated absences = Dropped from class', 20, finalY + 27);
        doc.text('• 3 late arrivals = 1 absence', 20, finalY + 34);
      }
      
      // Save the PDF
      const fileName = `Attendance_History_${studentId}_${subjectCode}_${Date.now()}.pdf`;
      doc.save(fileName);
      console.log('PDF saved as:', fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error generating PDF: ${error.message}`);
    }
  };

  const generateAttendanceSummaryPDF = () => {
    console.log('Generating Attendance Summary PDF...');
    
    // Use attendanceData from the history API for summary data
    if (!attendanceData || !attendanceData.attendance_summary) {
      console.error('No attendance summary data to generate PDF');
      alert('No attendance summary data available to download.');
      return;
    }
    
    // Check if jsPDF and autoTable are loaded
    if (typeof jsPDF === 'undefined') {
      alert('PDF library not loaded. Please refresh the page.');
      return;
    }
    
    if (typeof autoTable === 'undefined') {
      alert('PDF table library not loaded. Please refresh the page.');
      return;
    }
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // Header with gradient effect
      doc.setFillColor(35, 35, 44);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Attendance Summary Report', pageWidth / 2, 25, { align: 'center' });
      
      // Student Information
      doc.setFillColor(21, 21, 28);
      doc.rect(10, 45, pageWidth - 20, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Student Information:', 15, 55);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Name: ${attendanceData?.student?.name || 'N/A'}`, 15, 65);
      doc.text(`Student No: ${studentId}`, 15, 72);
      doc.text(`Subject: ${classInfo?.subject || 'N/A'}`, pageWidth / 2, 65);
      doc.text(`Section: ${classInfo?.section || 'N/A'}`, pageWidth / 2, 72);
      
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Generated: ${currentDate}`, pageWidth - 15, 72, { align: 'right' });
      
      // Overall Statistics
      const statsY = 80;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Overall Attendance Statistics', pageWidth / 2, statsY, { align: 'center' });
      
      // Summary boxes
      const summaryData = [
        { label: 'Present', value: attendanceData?.attendance_summary?.present || 0, color: [0, 161, 93] },
        { label: 'Late', value: attendanceData?.attendance_summary?.late || 0, color: [255, 166, 0] },
        { label: 'Absent', value: attendanceData?.attendance_summary?.absent || 0, color: [161, 83, 83] },
        { label: 'Total Classes', value: attendanceData?.attendance_summary?.total || 0, color: [179, 157, 219] }
      ];
      
      // Box sizes
      const boxSize = 28;
      const totalBoxesWidth = (boxSize * 4) + (8 * 3);
      const startX = (pageWidth - totalBoxesWidth) / 2;
      
      const boxesStartY = statsY + 5;
      
      summaryData.forEach((item, index) => {
        const x = startX + (index * (boxSize + 8));
        
        // Box background
        doc.setFillColor(...item.color, 20);
        doc.rect(x, boxesStartY, boxSize, boxSize, 'F');
        
        // Label
        doc.setTextColor(...item.color);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(item.label, x + boxSize / 2, boxesStartY + 10, { align: 'center' });
        
        // Value
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(item.value.toString(), x + boxSize / 2, boxesStartY + 22, { align: 'center' });
      });
      
      // Detailed Summary Section - Moved closer to the boxes
      const detailsY = boxesStartY + boxSize + 8; // Reduced from 12 to 8px below boxes
      
      // Detailed Summary title - moved closer
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Detailed Attendance Summary', pageWidth / 2, detailsY, { align: 'center' });
      
      // Calculate effective absences
      const present = attendanceData?.attendance_summary?.present || 0;
      const late = attendanceData?.attendance_summary?.late || 0;
      const absent = attendanceData?.attendance_summary?.absent || 0;
      const total = attendanceData?.attendance_summary?.total || 0;
      
      const equivalentAbsences = Math.floor(late / 3);
      const remainingLates = late % 3;
      const totalEffectiveAbsences = absent + equivalentAbsences;
      
      let status = 'SAFE';
      if (totalEffectiveAbsences >= 3) {
        status = 'CRITICAL - DROPPABLE';
      } else if (totalEffectiveAbsences >= 2) {
        status = 'AT RISK';
      } else if (totalEffectiveAbsences >= 1) {
        status = 'WARNING';
      }
      
      // Create detailed summary table
      const summaryTableData = [
        ['Present Count', present.toString()],
        ['Late Count', late.toString()],
        ['Absent Count', absent.toString()],
        ['Total Classes', total.toString()],
        ['Equivalent Absences from Lates', equivalentAbsences.toString()],
        ['Remaining Lates (Not Converted)', remainingLates.toString()],
        ['Total Effective Absences', totalEffectiveAbsences.toString()],
        ['Attendance Status', status]
      ];
      
      // Moved table closer to the title (reduced from 5 to 3)
      autoTable(doc, {
        startY: detailsY + 3, // Reduced spacing
        head: [['Metric', 'Value']],
        body: summaryTableData,
        theme: 'grid',
        headStyles: {
          fillColor: [35, 35, 44],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'center'
        },
        bodyStyles: {
          fillColor: [21, 21, 28],
          textColor: [255, 255, 255],
          fontSize: 10,
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: [28, 28, 37],
        },
        columnStyles: {
          0: { cellWidth: 100, fontStyle: 'bold', halign: 'center' },
          1: { cellWidth: 80, halign: 'center' }
        },
        margin: { left: (pageWidth - 180) / 2 },
        styles: {
          lineWidth: 0.1,
          lineColor: [100, 100, 100],
        },
        didDrawCell: (data) => {
          // Remove color from Attendance Status value
          if (data.row.index === 7) {
            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'normal');
          }
        },
        didDrawPage: (data) => {
          // Footer
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(`Page ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }
      });
      
      // Attendance Policy Section
      const finalY = doc.lastAutoTable?.finalY || detailsY + 100;
      
      if (finalY < pageHeight - 60) {
        doc.setFillColor(35, 35, 44, 50);
        doc.rect(15, finalY + 10, pageWidth - 30, 40, 'F');
        
        // Left aligned
        doc.setTextColor(255, 166, 0);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Attendance Policy Details:', 20, finalY + 20);
        
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        
        const policyLines = [
          '• 3 accumulated absences will result in being dropped from the class',
          '• 3 late arrivals = 1 absence (converted automatically)',
          '• Remaining lates that don\'t make a full absence are tracked separately',
          '• Effective Absences = Absent count + (Late count ÷ 3)'
        ];
        
        policyLines.forEach((line, index) => {
          const cleanLine = line.replace(/[^\x20-\x7E]/g, '');
          doc.text(cleanLine, 20, finalY + 28 + (index * 7));
        });
      }
      
      // Save the PDF
      const fileName = `Attendance_Summary_${studentId}_${subjectCode}_${Date.now()}.pdf`;
      doc.save(fileName);
      console.log('PDF saved as:', fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`Error generating PDF: ${error.message}`);
    }
  };

  // ========== DATA PROCESSING ==========
  const { 
    overallWarning, 
    hasDroppableSubject 
  } = calculateAttendanceWarnings();

  const combinedAttendanceData = getCombinedAttendanceData();
  const totalPages = Math.ceil(combinedAttendanceData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, combinedAttendanceData.length);
  const currentAttendanceData = combinedAttendanceData.slice(startIndex, endIndex);

  const attendanceTotalPages = Math.ceil(filteredAttendance().length / itemsPerPage);
  const attendanceStartIndex = (attendanceCurrentPage - 1) * itemsPerPage;
  const attendanceEndIndex = Math.min(attendanceStartIndex + itemsPerPage, filteredAttendance().length);
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

  // ========== RENDER ATTENDANCE CELL ==========
  const renderAttendanceCell = (record, status) => {
    if (record.status !== status) {
      return (
        <td className="p-2">
          <span className="text-[#FFFFFF]/40">—</span>
        </td>
      );
    }
    
    const { date, time } = formatAttendanceDate(record);
    const textColor = status === 'present' ? 'text-[#00A15D]' : 
                     status === 'late' ? 'text-[#FFA600]' : 
                     'text-[#A15353]';
    
    return (
      <td className="p-2">
        <div className={`${textColor}`}>
          <div className="font-medium">{date}</div>
          {time && (
            <div className="text-xs opacity-80 mt-0.5">
              {time}
            </div>
          )}
        </div>
      </td>
    );
  };

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
            <div className="text-xs text-[#FFFFFF]/60 mt-1">
              Times shown are the exact times when attendance was marked
            </div>
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
              {/* Subject Overview Button */}
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
              <div className="flex justify-between items-center mb-3">
                <p className="font-bold text-base text-[#FFFFFF]">
                  Attendance History ({combinedAttendanceData.length} records)
                </p>
                <div className="flex items-center">
                  <DownloadButton 
                    onClick={generateAttendanceHistoryPDF}
                    label="Download History"
                    data={combinedAttendanceData}
                  />
                </div>
              </div>
              <hr className="border-[#FFFFFF]/30 mb-3" />

              {combinedAttendanceData.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <div className="inline-block min-w-full align-middle">
                      <div className="overflow-hidden rounded-md border border-[#FFFFFF]/10">
                        <table className="min-w-full text-left border-collapse text-xs">
                          <thead className="bg-[#23232C]">
                            <tr>
                              <th className="p-2 font-bold text-[#00A15D]">Date Present</th>
                              <th className="p-2 font-bold text-[#FFA600]">Date Late</th>
                              <th className="p-2 font-bold text-[#A15353]">Date Absent</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentAttendanceData.map((record, index) => (
                              <tr key={index} className="hover:bg-[#23232C] border-b border-[#FFFFFF]/10 last:border-0">
                                {renderAttendanceCell(record, 'present')}
                                {renderAttendanceCell(record, 'late')}
                                {renderAttendanceCell(record, 'absent')}
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
                    endIndex={endIndex}
                    totalItems={combinedAttendanceData.length}
                  />
                </>
              ) : (
                <div className="text-center py-6 bg-[#23232C] rounded-lg">
                  <p className="text-[#FFFFFF]/60 text-sm">
                    No attendance records found
                  </p>
                  <p className="text-[#FFFFFF]/40 text-xs mt-2">
                    Student ID: {studentId}, Subject Code: {subjectCode}
                  </p>
                </div>
              )}
            </div>

            {/* TOTALS - Smaller */}
            <div className="bg-[#15151C] p-4 rounded-lg shadow-md mb-6">
              <div className="flex justify-between items-center mb-3">
                <p className="font-bold text-base text-[#FFFFFF]">
                  Attendance Summary
                </p>
                <div className="flex items-center">
                  <DownloadButton 
                    onClick={generateAttendanceSummaryPDF}
                    label="Download Summary"
                    data={[attendanceData?.attendance_summary || {}]} // Pass the summary data
                  />
                </div>
              </div>
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

            {/* ENHANCED ATTENDANCE TRACKING CARD - Smaller */}
            <div className="bg-[#15151C] rounded-lg shadow-md mt-4 p-4 text-[#FFFFFF]">
              <div className="flex items-center justify-between mb-2">
                <p className="text-base font-bold">
                  Attendance Tracking
                </p>
                {hasDroppableSubject && (
                  <div className="flex items-center bg-[#A15353] text-[#FFFFFF] px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                    <span className="mr-1">🚨</span>
                    DROPPABLE STATUS
                  </div>
                )}
                {overallWarning && !hasDroppableSubject && (
                  <div className="flex items-center bg-[#FFA600]/20 text-[#FFA600] px-2 py-1 rounded-full text-xs font-medium">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Attendance Warnings
                  </div>
                )}
              </div>
              
              {/* Enhanced Warning Note */}
              <div className="mb-4 p-3 rounded-lg bg-[#23232C]/50 border border-[#FFFFFF]/10">
                <p className="text-sm font-semibold mb-2 text-[#FFA600]">⚠️ Attendance Policy:</p>
                <div className="text-xs space-y-1">
                  <p className="flex items-start">
                    <span className="text-[#A15353] font-bold mr-2">•</span>
                    <span><span className="font-bold">3 accumulated absences</span> will result in being <span className="text-[#A15353] font-bold">dropped</span> from the class.</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-[#FFA600] font-bold mr-2">•</span>
                    <span><span className="font-bold">3 late arrivals</span> = <span className="text-[#FFA600] font-bold">1 absence</span> (converted automatically).</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-[#00A15D] font-bold mr-2">•</span>
                    <span>Remaining lates that don't make a full absence are tracked separately.</span>
                  </p>
                </div>
              </div>
              
              <hr className="border-[#FFFFFF]/30 mb-3" />
              
              {currentAttendanceCardData.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-[#FFFFFF]/80 text-sm">No attendance data available for {getCurrentSubjectName()}.</p>
                  <p className="text-[#FFFFFF]/60 text-xs mt-2">
                    This could mean: <br/>
                    1. No attendance has been recorded yet for this subject<br/>
                    2. The student is not enrolled in this subject<br/>
                    3. There's no data in the attendance summary API
                  </p>
                  <div className="mt-4 text-left text-xs text-[#FFFFFF]/50 bg-[#23232C] p-3 rounded">
                    <p><strong>Debug Info:</strong></p>
                    <p>Student ID: {studentId}</p>
                    <p>Subject Code: {subjectCode}</p>
                    <p>Total Summary Data: {attendanceSummaryData.length} subjects</p>
                    <p>Filtered Data: {filteredAttendance().length} subjects</p>
                  </div>
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
                          <th className="px-3 py-2 text-left font-bold whitespace-nowrap">Remaining Lates</th>
                          <th className="px-3 py-2 text-left font-bold whitespace-nowrap">Status</th>
                          <th className="px-3 py-2 text-left font-bold whitespace-nowrap text-[#B39DDB]">Total Classes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentAttendanceCardData.map((subject) => (
                          <tr key={subject.subject_code} className={`border-b ${
                            subject.isCritical ? 'bg-[#A15353]/10' : 
                            subject.isAtRisk ? 'bg-[#FFA600]/10' : 
                            subject.hasWarning ? 'bg-[#FFA600]/5' : 
                            'hover:bg-[#23232C]'
                          }`}>
                            <td className="px-3 py-2">
                              <div className="flex flex-col gap-1">
                                <span className="font-medium">{subject.subject_name}</span>
                                <span className="text-[10px] text-[#FFFFFF]/60">{subject.section}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-[#00A15D] font-medium text-center">{subject.present}</td>
                            <td className="px-3 py-2 text-[#FFA600] font-medium text-center">{subject.late}</td>
                            <td className="px-3 py-2 text-[#A15353] font-medium text-center">{subject.absent}</td>
                            <td className="px-3 py-2 font-bold text-center">
                              <span className={
                                subject.isCritical ? 'text-[#A15353]' : 
                                subject.isAtRisk ? 'text-[#FFA600]' : 
                                'text-[#FFFFFF]'
                              }>
                                {subject.totalEffectiveAbsences}
                              </span>
                              <div className="text-[10px] text-[#FFFFFF]/50">
                                ({subject.absent} absents + {subject.equivalentAbsences} from lates)
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span className={
                                subject.remainingLates > 0 ? 'text-[#FFA600] font-medium' : 'text-[#FFFFFF]/60'
                              }>
                                {subject.remainingLates}
                              </span>
                              <div className="text-[10px] text-[#FFFFFF]/50">
                                (not converted)
                              </div>
                            </td>
                            <td className="px-3 py-2">
                              <AttendanceStatusIndicator
                                remainingLates={subject.remainingLates}
                                isCritical={subject.isCritical}
                                isAtRisk={subject.isAtRisk}
                              />
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-[#B39DDB] text-center">{subject.total_classes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Progress Bar for Effective Absences */}
                  {currentAttendanceCardData.length > 0 && (
                    <div className="mt-4 p-3 bg-[#23232C] rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Effective Absences Progress</span>
                        <span className="text-xs text-[#FFFFFF]/60">
                          {currentAttendanceCardData[0].totalEffectiveAbsences} / 3
                        </span>
                      </div>
                      <div className="w-full bg-[#FFFFFF]/10 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            currentAttendanceCardData[0].totalEffectiveAbsences >= 3 ? 'bg-[#A15353]' :
                            currentAttendanceCardData[0].totalEffectiveAbsences >= 2 ? 'bg-[#FFA600]' :
                            currentAttendanceCardData[0].totalEffectiveAbsences >= 1 ? 'bg-[#FFA600]/50' :
                            'bg-[#00A15D]'
                          }`}
                          style={{ width: `${Math.min(100, (currentAttendanceCardData[0].totalEffectiveAbsences / 3) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-[#00A15D]">0 (Safe)</span>
                        <span className="text-[#FFA600]">1-2 (Warning)</span>
                        <span className="text-[#A15353]">3+ (Droppable)</span>
                      </div>
                    </div>
                  )}
                  
                  <Pagination
                    currentPage={attendanceCurrentPage}
                    totalPages={attendanceTotalPages}
                    onPageChange={handleAttendanceCardPageChange}
                    dataType="attendanceCard"
                    startIndex={attendanceStartIndex + 1}
                    endIndex={attendanceEndIndex}
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