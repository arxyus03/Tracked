import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import BackButton from '../../assets/BackButton(Light).svg';
import ClassManagementIcon from '../../assets/ClassManagement(Light).svg'; 
import Announcement from '../../assets/Announcement(Light).svg';
import Classwork from '../../assets/Classwork(Light).svg';
import GradeIcon from '../../assets/Grade(Light).svg';
import AnalyticsIcon from '../../assets/Analytics(Light).svg';
import AttendanceIcon from '../../assets/Attendance(Light).svg';
import DownloadIcon from '../../assets/Download(Light).svg';

export default function GradeTab() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get("code");

  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // REAL grade data loaded from backend
  const [gradeData, setGradeData] = useState([]);
 
  // Fetch class info - use useCallback to prevent infinite re-renders
  const fetchClassInfo = useCallback(async () => {
    try {
      const response = await fetch(
        `https://tracked.6minds.site/Professor/SubjectDetailsDB/get_students_by_section.php?subject_code=${subjectCode}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();

      if (result.success) {
        setClassInfo(result.class_info);
        return result.class_info;
      } else {
        throw new Error(result.message || "Failed to fetch class info");
      }
    } catch (error) {
      console.error("Error fetching class info:", error);
      setError("Failed to load class information");
      return null;
    }
  }, [subjectCode]);

  // Fetch REAL grade summary data - use useCallback
  const fetchGradeSummary = useCallback(async (classInfo) => {
    try {
      if (!classInfo || !classInfo.section || !classInfo.professor_ID) {
        console.log("Missing class info for grade summary");
        return;
      }

      console.log("Fetching grade summary for:", {
        subjectCode,
        section: classInfo.section,
        professor_ID: classInfo.professor_ID
      });

      const response = await fetch(
        `https://tracked.6minds.site/Professor/SubjectDetailsDB/get_grade_summary.php?subject_code=${subjectCode}&section=${classInfo.section}&professor_ID=${classInfo.professor_ID}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      console.log("Grade summary response:", result);

      if (result.success) {
        setGradeData(result.data);
        // Update classInfo with additional details from the grade summary
        if (result.class_info) {
          setClassInfo(prev => ({ ...prev, ...result.class_info }));
        }
        // Store summary data if needed
        if (result.summary) {
          console.log("Summary data:", result.summary);
        }
        
        // Debug info
        if (result.debug) {
          console.log("Debug info:", result.debug);
        }
      } else {
        console.error("Failed to fetch grade summary:", result.message);
        // Set empty data on error
        const activityTypes = ["Assignment", "Quiz", "Activity", "Project", "Laboratory"];
        const emptyData = activityTypes.map(type => ({
          activityType: type,
          assignedWorks: 0,
          submissions: 0,
          missedSubmissions: 0,
          totalScores: 0,
          sumGradedWorks: 0,
          percentage: "0%"
        }));
        setGradeData(emptyData);
      }
    } catch (error) {
      console.error("Error fetching grade summary:", error);
      // Set empty data on error
      const activityTypes = ["Assignment", "Quiz", "Activity", "Project", "Laboratory"];
      const emptyData = activityTypes.map(type => ({
        activityType: type,
        assignedWorks: 0,
        submissions: 0,
        missedSubmissions: 0,
        totalScores: 0,
        sumGradedWorks: 0,
        percentage: "0%"
      }));
      setGradeData(emptyData);
      setError("Failed to load grade data");
    }
  }, [subjectCode]);

  useEffect(() => {
    if (!subjectCode) {
      setError("No subject code provided");
      setLoading(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        setError("Request timeout - taking too long to load");
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch class info first
        const classData = await fetchClassInfo();
        
        if (isMounted && classData) {
          // Then fetch grade summary with the class data
          await fetchGradeSummary(classData);
        }
        
        if (isMounted) {
          setLoading(false);
          clearTimeout(timeoutId);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error loading data:", error);
          setError("Failed to load data");
          setLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [subjectCode, fetchClassInfo, fetchGradeSummary]);

  const downloadTableAsPDF = async () => {
    if (isDownloading || gradeData.length === 0) return;
    
    setIsDownloading(true);
    
    try {
      // Calculate totals
      const totalAssigned = gradeData.reduce((sum, item) => sum + item.assignedWorks, 0);
      const totalSubmissions = gradeData.reduce((sum, item) => sum + item.submissions, 0);
      const totalScores = gradeData.reduce((sum, item) => sum + item.totalScores, 0);
      const sumGradedWorks = gradeData.reduce((sum, item) => sum + item.sumGradedWorks, 0);
      const overallPercentage = totalScores > 0 ? ((sumGradedWorks / totalScores) * 100).toFixed(1) : "0.0";
      
      // Create PDF in LANDSCAPE mode for the wide table
      const pdf = new jsPDF('landscape', 'pt', 'a4');
      
      // Set margins - smaller margins in landscape
      const margin = 30;
      let yPosition = margin;
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      
      // Add main title
      pdf.setFontSize(20);
      pdf.setTextColor(70, 87, 70); // #465746
      pdf.setFont('helvetica', 'bold');
      pdf.text('GRADE SUMMARY REPORT', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 30;
      
      // Subject info in a clean layout
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      // First row: Subject and Code on left, Section and Date on right
      pdf.text(`Subject: ${classInfo?.subject || 'N/A'}`, margin, yPosition);
      pdf.text(`Code: ${classInfo?.subject_code || 'N/A'}`, margin + 200, yPosition);
      pdf.text(`Section: ${classInfo?.section || 'N/A'}`, pageWidth - margin - 250, yPosition);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 18;
      
      // Second row: Professor
      pdf.text(`Professor: ${classInfo?.professor_name || classInfo?.professor_ID || 'N/A'}`, margin, yPosition);
      yPosition += 30;
      
      // Add a thin separator line
      pdf.setDrawColor(70, 87, 70, 0.3);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 20;
      
      // Define table structure - 7 columns with proper headers
      const headers = [
        'Class Works',
        'Assigned Works',
        'Submissions',
        'Missed Submissions',
        'Total Scores',
        'Sum of Graded Works',
        'Percentage'
      ];
      
      // Calculate column widths for landscape (more space available)
      const colWidths = [100, 85, 85, 100, 85, 110, 85];
      const totalTableWidth = colWidths.reduce((sum, width) => sum + width, 0);
      
      // Center the table horizontally
      const tableStartX = (pageWidth - totalTableWidth) / 2;
      
      // Draw table headers - FIXED: White text on dark background
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setFillColor(70, 87, 70); // Dark green background
      
      // Draw header background (single rectangle for the whole header row)
      pdf.rect(tableStartX, yPosition, totalTableWidth, 25, 'F');
      
      // Draw header text with WHITE color
      pdf.setTextColor(255, 255, 255); // WHITE TEXT
      
      let currentX = tableStartX;
      headers.forEach((header, index) => {
        pdf.text(
          header,
          currentX + colWidths[index] / 2,
          yPosition + 16,
          { align: 'center' }
        );
        
        // Draw header cell borders (light gray)
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(currentX, yPosition, colWidths[index], 25);
        
        currentX += colWidths[index];
      });
      
      yPosition += 25; // Move down after header
      
      // Draw table data rows
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0); // Black text for data
      
      gradeData.forEach((item, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 80) {
          pdf.addPage('landscape');
          yPosition = margin;
        }
        
        // Alternate row background
        if (index % 2 === 0) {
          pdf.setFillColor(248, 249, 250); // Light gray
        } else {
          pdf.setFillColor(255, 255, 255); // White
        }
        
        // Draw row background
        pdf.rect(tableStartX, yPosition, totalTableWidth, 20, 'F');
        
        // Draw row data
        currentX = tableStartX;
        
        // Column 1: Class Works
        pdf.text(item.activityType, currentX + 5, yPosition + 14);
        currentX += colWidths[0];
        
        // Column 2: Assigned Works (centered)
        pdf.text(item.assignedWorks.toString(), currentX + colWidths[1] / 2, yPosition + 14, { align: 'center' });
        currentX += colWidths[1];
        
        // Column 3: Submissions (centered)
        pdf.text(item.submissions.toString(), currentX + colWidths[2] / 2, yPosition + 14, { align: 'center' });
        currentX += colWidths[2];
        
        // Column 4: Missed Submissions (centered)
        pdf.text(item.missedSubmissions.toString(), currentX + colWidths[3] / 2, yPosition + 14, { align: 'center' });
        currentX += colWidths[3];
        
        // Column 5: Total Scores (centered)
        pdf.text(item.totalScores.toString(), currentX + colWidths[4] / 2, yPosition + 14, { align: 'center' });
        currentX += colWidths[4];
        
        // Column 6: Sum of Graded Works (centered)
        pdf.text(item.sumGradedWorks.toString(), currentX + colWidths[5] / 2, yPosition + 14, { align: 'center' });
        currentX += colWidths[5];
        
        // Column 7: Percentage with color coding (centered)
        const percentageValue = parseFloat(item.percentage);
        if (percentageValue >= 70) {
          pdf.setTextColor(34, 139, 34); // Green
        } else if (percentageValue >= 50) {
          pdf.setTextColor(218, 165, 32); // Yellow/Orange
        } else {
          pdf.setTextColor(220, 53, 69); // Red
        }
        pdf.text(item.percentage, currentX + colWidths[6] / 2, yPosition + 14, { align: 'center' });
        pdf.setTextColor(0, 0, 0); // Reset color to black
        
        // Draw cell borders
        pdf.setDrawColor(200, 200, 200);
        let borderX = tableStartX;
        colWidths.forEach((width) => {
          pdf.rect(borderX, yPosition, width, 20);
          borderX += width;
        });
        
        yPosition += 20; // Row height
      });
      
      yPosition += 25;
      
      // Draw summary separator line
      pdf.setDrawColor(70, 87, 70, 0.3);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 20;
      
      // Summary section title
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(70, 87, 70);
      pdf.text('SUMMARY', margin, yPosition);
      yPosition += 25;
      
      // Summary statistics
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      // Summary items in two columns
      const leftColumn = margin;
      const rightColumn = pageWidth / 2 + 50;
      
      // Left column items
      pdf.setTextColor(0, 0, 0);
      pdf.text('Total Assigned Works:', leftColumn, yPosition);
      pdf.setFont('helvetica', 'bold');
      pdf.text(totalAssigned.toString(), leftColumn + 150, yPosition);
      pdf.setFont('helvetica', 'normal');
      
      pdf.text('Total Submissions:', leftColumn, yPosition + 20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(totalSubmissions.toString(), leftColumn + 150, yPosition + 20);
      pdf.setFont('helvetica', 'normal');
      
      pdf.text('Total Scores:', leftColumn, yPosition + 40);
      pdf.setFont('helvetica', 'bold');
      pdf.text(totalScores.toString(), leftColumn + 150, yPosition + 40);
      pdf.setFont('helvetica', 'normal');
      
      // Right column items
      pdf.text('Sum of Graded Works:', rightColumn, yPosition);
      pdf.setFont('helvetica', 'bold');
      pdf.text(sumGradedWorks.toFixed(1), rightColumn + 150, yPosition);
      pdf.setFont('helvetica', 'normal');
      
      pdf.text('Overall Percentage:', rightColumn, yPosition + 20);
      
      // Color code overall percentage
      const overallValue = parseFloat(overallPercentage);
      if (overallValue >= 70) {
        pdf.setTextColor(34, 139, 34); // Green
      } else if (overallValue >= 50) {
        pdf.setTextColor(218, 165, 32); // Yellow/Orange
      } else {
        pdf.setTextColor(220, 53, 69); // Red
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${overallPercentage}%`, rightColumn + 150, yPosition + 20);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      yPosition += 60;
      
      // Class info at the bottom
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(100, 100, 100);
      
      const classInfoLine = `Showing data for: ${classInfo?.subject || 'N/A'} (${classInfo?.subject_code || 'N/A'}) - Section ${classInfo?.section || 'N/A'}`;
      const professorLine = `Professor: ${classInfo?.professor_name || `ID: ${classInfo?.professor_ID || 'N/A'}`}`;
      
      pdf.text(classInfoLine, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      pdf.text(professorLine, pageWidth / 2, yPosition, { align: 'center' });
      
      // Add generation timestamp
      yPosition += 20;
      pdf.setFontSize(9);
      pdf.text(
        `Generated on: ${new Date().toLocaleString()}`,
        pageWidth / 2,
        yPosition,
        { align: 'center' }
      );
      
      // Save the PDF
      const fileName = `Grade_Report_${classInfo?.subject_code || 'subject'}_${classInfo?.section || 'section'}_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownload = () => {
    downloadTableAsPDF();
  };

  // Show error state
  if (error && !loading) {
    return (
      <div>
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-5 text-center">
            <div className="text-red-500 text-lg mb-4">Error: {error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#00874E] text-white rounded-md hover:bg-[#006e3d] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-5 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00874E] border-r-transparent"></div>
            <p className="mt-3 text-gray-600">Loading grade data...</p>
            {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
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
                src={GradeIcon}
                alt="Grade"
                className="h-7 w-7 sm:h-9 sm:w-9 mr-2 sm:mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                Grade
              </h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-[#465746]">
              View and manage class grades - {classInfo?.subject} ({classInfo?.section})
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
                    title="Back to Class Management"
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

                {/* Grade Button - Active State */}
                <Link to={`/GradeTab?code=${subjectCode}`} className="sm:flex-initial">
                  <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#ffe6e6] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-[#ff9999] hover:bg-[#ffd4d4] transition-all duration-300 cursor-pointer w-full sm:w-auto" title="Grade">
                    <img 
                      src={GradeIcon} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <span className="sm:inline">Grade</span>
                  </button>
                </Link>

                {/* Analytics Button */}
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
              {/* Student List Button */}
              <Link to={`/StudentList?code=${subjectCode}`}>
                <button className="p-2 bg-[#fff] rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 flex-shrink-0 cursor-pointer" title="Student List">
                  <img 
                    src={ClassManagementIcon} 
                    alt="ClassManagement" 
                    className="h-5 w-5 sm:h-6 sm:w-6" 
                  />
                </button>
              </Link>
            </div>
          </div>

          {/* Download Button Section - Replaces Search Bar */}
          <div className="mt-6 sm:mt-8 flex justify-end">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleDownload}
                disabled={isDownloading || gradeData.length === 0}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-white text-gray font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] hover:shadow-lg transition-all duration-200 cursor-pointer ${
                  isDownloading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                title={gradeData.length === 0 ? "No data to download" : "Download Grade Report as PDF"}
              >
                {isDownloading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-[#00874E] border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <img 
                      src={DownloadIcon} 
                      alt="Download" 
                      className="h-5 w-5 sm:h-6 sm:w-6" 
                    />
                    <span>Download PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Grade Table */}
          <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <div className="sm:hidden text-xs text-gray-500 py-2 text-center bg-gray-50">
                ← Swipe to see all columns →
              </div>
              <div className="p-3 sm:p-4 md:p-5">
                <table className="table-auto w-full border-collapse text-left min-w-[800px]">
                  <thead>
                    <tr className="text-xs sm:text-sm lg:text-[1.125rem] font-semibold bg-gray-50">
                      <th className="px-3 sm:px-4 md:px-6 py-3 border-b border-gray-200">Class Works</th>
                      <th className="px-3 sm:px-4 md:px-6 py-3 border-b border-gray-200 text-center">Assigned Works</th>
                      <th className="px-3 sm:px-4 md:px-6 py-3 border-b border-gray-200 text-center">Submissions</th>
                      <th className="px-3 sm:px-4 md:px-6 py-3 border-b border-gray-200 text-center">Missed Submissions</th>
                      <th className="px-3 sm:px-4 md:px-6 py-3 border-b border-gray-200 text-center">Total Scores</th>
                      <th className="px-3 sm:px-4 md:px-6 py-3 border-b border-gray-200 text-center">Sum of Graded Works</th>
                      <th className="px-3 sm:px-4 md:px-6 py-3 border-b border-gray-200 text-center">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gradeData.map((item, index) => (
                      <tr
                        key={item.activityType}
                        className={`hover:bg-gray-50 text-xs sm:text-sm lg:text-base ${
                          index !== gradeData.length - 1 ? 'border-b border-gray-200' : ''
                        }`}
                      >
                        <td className="px-3 sm:px-4 md:px-6 py-3 font-medium text-gray-900">
                          {item.activityType}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 text-center text-gray-700">
                          {item.assignedWorks}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 text-center text-gray-700">
                          {item.submissions}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 text-center text-gray-700">
                          {item.missedSubmissions}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 text-center text-gray-700">
                          {item.totalScores}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 text-center text-gray-700">
                          {item.sumGradedWorks}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 text-center font-semibold">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            parseFloat(item.percentage) >= 70 
                              ? 'bg-green-100 text-green-800' 
                              : parseFloat(item.percentage) >= 50 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.percentage}
                          </span>
                        </td>
                      </tr>
                    ))} 
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary Section */}
            <div className="p-4 sm:p-5 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-gray-700">Total Assigned</div>
                  <div className="text-lg font-bold text-[#00874E]">
                    {gradeData.reduce((sum, item) => sum + item.assignedWorks, 0)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-700">Total Submissions</div>
                  <div className="text-lg font-bold text-[#00874E]">
                    {gradeData.reduce((sum, item) => sum + item.submissions, 0)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-700">Overall Score</div>
                  <div className="text-lg font-bold text-[#00874E]">
                    {gradeData.reduce((sum, item) => sum + item.sumGradedWorks, 0).toFixed(1)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-700">Overall Percentage</div>
                  <div className="text-lg font-bold text-[#00874E]">
                    {((gradeData.reduce((sum, item) => sum + item.sumGradedWorks, 0) / 
                       Math.max(gradeData.reduce((sum, item) => sum + item.totalScores, 0), 1)) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              {/* Class Information Display */}
              <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <div className="text-sm text-gray-600">
                  Showing data for: <span className="font-semibold">{classInfo?.subject} ({classInfo?.subject_code}) - Section {classInfo?.section}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Professor: {classInfo?.professor_name || `ID: ${classInfo?.professor_ID}`}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}