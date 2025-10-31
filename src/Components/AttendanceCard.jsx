import { useState } from "react";
import ArrowDown from "../assets/ArrowDown(Light).svg"; 
import jsPDF from "jspdf";

function AttendanceCard({ date, students }) {
  const [open, setOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'text-[#00A15D]';
      case 'late': return 'text-[#767EE0]';
      case 'absent': return 'text-[#EF4444]';
      default: return 'text-gray-600';
    }
  };

  const getStatusBgColor = (status) => {
    switch (status) {
      case 'present': return 'bg-[#00A15D]/10';
      case 'late': return 'bg-[#767EE0]/10';
      case 'absent': return 'bg-[#EF4444]/10';
      default: return 'bg-gray-100';
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

  // Calculate attendance statistics
  const presentCount = students ? students.filter(s => s.status === 'present').length : 0;
  const lateCount = students ? students.filter(s => s.status === 'late').length : 0;
  const absentCount = students ? students.filter(s => s.status === 'absent').length : 0;

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
            pdf.setTextColor(239, 68, 68);
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

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      {/* Card Header - RESPONSIVE: stacks on mobile, row on desktop */}
      <div 
        className="p-4 sm:p-5 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        {/* Mobile Layout */}
        <div className="sm:hidden">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              {/* Title with responsive text size */}
              <span className="text-sm text-[#465746]">
                Class Attendance for <span className="font-bold">{date}</span>
              </span>
              <div className="text-xs text-gray-500 mt-1">
                ({students ? students.length : 0} students)
              </div>
            </div>
            
            {/* Arrow on upper right for mobile */}
            <img
              src={ArrowDown}
              alt="Expand"
              className={`h-5 w-5 flex-shrink-0 transform transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* Summary badges - RESPONSIVE: only visible on mobile when collapsed */}
          {!open && (
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-2 py-1 bg-[#00A15D]/10 text-[#00A15D] text-xs rounded-full font-medium">
                Present: {presentCount}
              </span>
              <span className="px-2 py-1 bg-[#767EE0]/10 text-[#767EE0] text-xs rounded-full font-medium">
                Late: {lateCount}
              </span>
              <span className="px-2 py-1 bg-[#EF4444]/10 text-[#EF4444] text-xs rounded-full font-medium">
                Absent: {absentCount}
              </span>
            </div>
          )}

          {/* Download button for mobile */}
          <button 
            onClick={handleDownload}
            className="w-full px-3 py-2 bg-[#00A15D] text-white font-semibold text-xs rounded-lg hover:bg-[#00874E] transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Download PDF
          </button>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex sm:items-center justify-between gap-3">
          <div className="flex-1">
            {/* Title with responsive text size */}
            <div className="flex flex-row items-center gap-2">
              <span className="text-base lg:text-lg text-[#465746]">
                Class Attendance for <span className="font-bold">{date}</span>
              </span>
              <span className="text-sm text-gray-500">
                ({students ? students.length : 0} students)
              </span>
            </div>
          </div>
          
          {/* Action buttons for desktop */}
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDownload}
              className="px-4 py-2 bg-[#00A15D] text-white font-semibold text-sm rounded-lg hover:bg-[#00874E] transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap cursor-pointer"
            >
              Download PDF
            </button>
            <img
              src={ArrowDown}
              alt="Expand"
              className={`h-6 w-6 flex-shrink-0 transform transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/* Expanded Content - RESPONSIVE: Different layouts for mobile and desktop */}
      {open && (
        <div className="border-t border-gray-200">
          {/* Summary section - RESPONSIVE: only visible on desktop */}
          <div className="hidden sm:flex items-center gap-4 px-5 py-3 bg-gray-50">
            <span className="px-3 py-1 bg-[#00A15D]/10 text-[#00A15D] text-sm rounded-full font-medium">
              Present: {presentCount}
            </span>
            <span className="px-3 py-1 bg-[#767EE0]/10 text-[#767EE0] text-sm rounded-full font-medium">
              Late: {lateCount}
            </span>
            <span className="px-3 py-1 bg-[#EF4444]/10 text-[#EF4444] text-sm rounded-full font-medium">
              Absent: {absentCount}
            </span>
          </div>

          {/* MOBILE CARD VIEW - RESPONSIVE: Only visible on small screens */}
          <div className="block sm:hidden p-4 space-y-3">
            {students && students.length > 0 ? (
              students.map((student, index) => {
                const studentNumber = getStudentNumber(student);
                const studentName = getStudentName(student);
                
                return (
                  <div 
                    key={studentNumber + index} 
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#465746] text-sm mb-1 truncate">
                          {studentName}
                        </p>
                        <p className="text-xs text-gray-600">
                          Student No: {studentNumber}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-2 ${getStatusBgColor(student.status)} ${getStatusColor(student.status)}`}>
                        {getStatusText(student.status)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-gray-500 text-sm">
                No student data available
              </div>
            )}
          </div>

          {/* DESKTOP TABLE VIEW - RESPONSIVE: Only visible on larger screens */}
          <div className="hidden sm:block p-5 overflow-x-auto">
            <table className="w-full bg-white border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  {/* RESPONSIVE: Column text sizes adjust per screen size */}
                  <th className="px-3 py-3 text-xs md:text-sm lg:text-base font-semibold text-[#465746] w-16">No.</th>
                  <th className="px-3 py-3 text-xs md:text-sm lg:text-base font-semibold text-[#465746]">Student No.</th>
                  <th className="px-3 py-3 text-xs md:text-sm lg:text-base font-semibold text-[#465746]">Full Name</th>
                  <th className="px-3 py-3 text-xs md:text-sm lg:text-base font-semibold text-[#465746] text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {students && students.length > 0 ? (
                  students.map((student, index) => {
                    const studentNumber = getStudentNumber(student);
                    const studentName = getStudentName(student);
                    
                    return (
                      <tr 
                        key={studentNumber + index} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                      >
                        {/* RESPONSIVE: Text sizes scale with screen size */}
                        <td className="px-3 py-3 text-xs md:text-sm lg:text-base text-gray-700">{index + 1}</td>
                        <td className="px-3 py-3 text-xs md:text-sm lg:text-base text-gray-700">{studentNumber}</td>
                        <td className="px-3 py-3 text-xs md:text-sm lg:text-base text-gray-700">{studentName}</td>
                        <td className={`px-3 py-3 text-right`}>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs md:text-sm font-bold ${getStatusBgColor(student.status)} ${getStatusColor(student.status)}`}>
                            {getStatusText(student.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="px-3 py-8 text-center text-gray-500 text-sm">
                      No student data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceCard;