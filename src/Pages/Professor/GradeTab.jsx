import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import GradeTable from "../../Components/ProfessorComponents/GradeTable";

// ========== IMPORT ASSETS ==========
import SubjectDetailsIcon from '../../assets/SubjectDetails.svg';
import BackButton from '../../assets/BackButton.svg';
import ClassManagementIcon from '../../assets/ClassManagement.svg';
import Announcement from '../../assets/Announcement.svg';
import Classwork from "../../assets/Classwork.svg";
import GradeIcon from '../../assets/Grade.svg';
import AnalyticsIcon from '../../assets/Analytics.svg';
import Attendance from "../../assets/Attendance.svg";
import Copy from '../../assets/Copy.svg';
import SubjectOverview from "../../assets/SubjectOverview.svg";
import TrackEdLogo from '../../assets/New-FullBlack-TrackEdLogo.png'; // Add this line

export default function GradeTab() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get("code");

  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const [gradeData, setGradeData] = useState([]);
  const [students, setStudents] = useState([]);

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
        // ========== EXTRACT STUDENTS FROM RESPONSE ==========
        if (result.students && Array.isArray(result.students)) {
          // Format the students data to match what GradeTable expects
          const formattedStudents = result.students.map(student => ({
            student_id: student.tracked_ID,
            first_name: student.tracked_firstname,
            last_name: student.tracked_lastname,
            middle_name: student.tracked_middlename,
            email: student.tracked_email,
            gender: student.tracked_gender,
            year_section: student.tracked_yearandsec
          }));
          setStudents(formattedStudents);
        } else if (result.class_info?.students) {
          setStudents(result.class_info.students);
        }
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

  const fetchStudentsList = useCallback(async (classInfo) => {
    try {
      if (!classInfo || !classInfo.section || !classInfo.professor_ID) {
        console.log("Missing class info for students list");
        return;
      }

      // Use the new endpoint for getting students with details
      const url = `https://tracked.6minds.site/Professor/GradeProfDB/get_all_students_with_details.php?subject_code=${subjectCode}&section=${classInfo.section}&professor_ID=${classInfo.professor_ID}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.students) {
        setStudents(result.students);
      } else {
        console.error("Failed to fetch students list:", result.message);
      }
    } catch (error) {
      console.error("Error fetching students list:", error);
    }
  }, [subjectCode]);

  const fetchGradeSummary = useCallback(async (classInfo) => {
    try {
      if (!classInfo || !classInfo.section || !classInfo.professor_ID) {
        console.log("Missing class info for grade summary");
        return;
      }

      // Use the new endpoint for grade statistics
      const url = `https://tracked.6minds.site/Professor/GradeProfDB/get_class_statistics.php?subject_code=${subjectCode}&section=${classInfo.section}&professor_ID=${classInfo.professor_ID}`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setGradeData(result.data);
        if (result.class_info) {
          setClassInfo(prev => ({ ...prev, ...result.class_info }));
        }
      } else {
        console.error("Failed to fetch grade summary:", result.message);
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
    }, 10000);

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const classData = await fetchClassInfo();
        
        if (isMounted && classData) {
          // Fetch students list and grade summary in parallel
          await Promise.all([
            fetchStudentsList(classData),
            fetchGradeSummary(classData)
          ]);
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
  }, [subjectCode, fetchClassInfo, fetchStudentsList, fetchGradeSummary]);

  // Copy subject code to clipboard
  const copySubjectCode = () => {
    if (classInfo?.subject_code) {
      navigator.clipboard.writeText(classInfo.subject_code)
        .then(() => {
          const originalText = document.querySelector('.copy-text');
          if (originalText) {
            originalText.textContent = 'Copied!';
            setTimeout(() => {
              originalText.textContent = 'Copy';
            }, 2000);
          }
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  // ========== ENHANCED PDF DOWNLOAD FUNCTION ==========
  const handleDownload = async (selectedStudent, studentInfo) => {
    if (isDownloading || gradeData.length === 0) return;
    
    setIsDownloading(true);
    
    try {
      // Import jsPDF dynamically to avoid initial bundle size
      const { default: jsPDF } = await import('jspdf');
      
      // Determine if this is for all students or a specific student
      const isForAllStudents = selectedStudent === 'all';
      
      // Calculate totals based on the current view
      const totalAssigned = gradeData.reduce((sum, item) => sum + (parseInt(item.assignedWorks) || 0), 0);
      const totalSubmissions = gradeData.reduce((sum, item) => sum + (parseInt(item.submissions) || 0), 0);
      const totalScores = gradeData.reduce((sum, item) => sum + (parseInt(item.totalScores) || 0), 0);
      const sumGradedWorks = gradeData.reduce((sum, item) => sum + (parseFloat(item.sumGradedWorks) || 0), 0);
      const overallPercentage = totalScores > 0 ? ((sumGradedWorks / totalScores) * 100).toFixed(1) : "0.0";
      
      const pdf = new jsPDF('landscape', 'pt', 'a4');
      
      const margin = 30;
      let yPosition = margin;
      const pageWidth = pdf.internal.pageSize.width;
      const pageHeight = pdf.internal.pageSize.height;
      
      // ========== HEADER SECTION WITH LOGO ==========
      // Try to add the logo
      try {
        // Add logo to PDF - adjust width and height here
        // Current size: width=120, height=40
        // To change size, modify these numbers:
        // - Width (120): horizontal size in points
        // - Height (40): vertical size in points
        const logoWidth = 120;  // Change this to adjust width
        const logoHeight = 40;  // Change this to adjust height
        
        pdf.addImage(TrackEdLogo, 'PNG', margin, yPosition, logoWidth, logoHeight);
        yPosition += 50; // Extra space for logo (adjust this too if needed)
      } catch (logoError) {
        console.warn('Could not add logo to PDF:', logoError);
        // Continue without logo if there's an error
        yPosition += 30;
      }
      
      // Title
      pdf.setFontSize(20);
      pdf.setTextColor(70, 87, 70);
      pdf.setFont('helvetica', 'bold');
      
      if (isForAllStudents) {
        pdf.text('CLASS GRADE SUMMARY REPORT', pageWidth / 2, yPosition, { align: 'center' });
      } else {
        pdf.text('STUDENT GRADE REPORT', pageWidth / 2, yPosition, { align: 'center' });
      }
      yPosition += 30;
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      // Subject Information
      pdf.text(`Subject: ${classInfo?.subject || 'N/A'}`, margin, yPosition);
      pdf.text(`Code: ${classInfo?.subject_code || 'N/A'}`, margin + 200, yPosition);
      pdf.text(`Section: ${classInfo?.section || 'N/A'}`, pageWidth - margin - 250, yPosition);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 18;
      
      pdf.text(`Professor: ${classInfo?.professor_name || classInfo?.professor_ID || 'N/A'}`, margin, yPosition);
      yPosition += 18;
      
      // Student Information (if individual student)
      if (!isForAllStudents && studentInfo) {
        pdf.text(`Student: ${studentInfo.last_name}, ${studentInfo.first_name}`, margin, yPosition);
        pdf.text(`ID: ${studentInfo.student_id}`, margin + 250, yPosition);
        if (studentInfo.year_section) {
          pdf.text(`Year & Section: ${studentInfo.year_section}`, pageWidth - margin - 200, yPosition);
        }
        yPosition += 18;
      }
      
      // Report Type
      pdf.setFont('helvetica', 'italic');
      if (isForAllStudents) {
        pdf.text(`Report Type: Class Summary (All ${students.length || 0} Students)`, margin, yPosition);
      } else {
        pdf.text('Report Type: Individual Student Report', margin, yPosition);
      }
      pdf.setFont('helvetica', 'normal');
      yPosition += 25;
      
      pdf.setDrawColor(70, 87, 70, 0.3);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 20;
      
      // ========== TABLE HEADER ==========
      const headers = [
        'Class Works',
        'Assigned Works',
        'Submissions',
        'Missed Submissions',
        'Total Scores',
        'Sum of Graded Works',
        'Percentage'
      ];
      
      const colWidths = [100, 85, 85, 100, 85, 110, 85];
      const totalTableWidth = colWidths.reduce((sum, width) => sum + width, 0);
      
      const tableStartX = (pageWidth - totalTableWidth) / 2;
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setFillColor(70, 87, 70);
      
      pdf.rect(tableStartX, yPosition, totalTableWidth, 25, 'F');
      
      pdf.setTextColor(255, 255, 255);
      
      let currentX = tableStartX;
      headers.forEach((header, index) => {
        pdf.text(
          header,
          currentX + colWidths[index] / 2,
          yPosition + 16,
          { align: 'center' }
        );
        
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(currentX, yPosition, colWidths[index], 25);
        
        currentX += colWidths[index];
      });
      
      yPosition += 25;
      
      // ========== TABLE DATA ==========
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      
      gradeData.forEach((item, index) => {
        if (yPosition > pageHeight - 80) {
          pdf.addPage('landscape');
          yPosition = margin;
        }
        
        if (index % 2 === 0) {
          pdf.setFillColor(248, 249, 250);
        } else {
          pdf.setFillColor(255, 255, 255);
        }
        
        pdf.rect(tableStartX, yPosition, totalTableWidth, 20, 'F');
        
        currentX = tableStartX;
        
        pdf.text(item.activityType, currentX + 5, yPosition + 14);
        currentX += colWidths[0];
        
        pdf.text((parseInt(item.assignedWorks) || 0).toString(), currentX + colWidths[1] / 2, yPosition + 14, { align: 'center' });
        currentX += colWidths[1];
        
        pdf.text((parseInt(item.submissions) || 0).toString(), currentX + colWidths[2] / 2, yPosition + 14, { align: 'center' });
        currentX += colWidths[2];
        
        pdf.text((parseInt(item.missedSubmissions) || 0).toString(), currentX + colWidths[3] / 2, yPosition + 14, { align: 'center' });
        currentX += colWidths[3];
        
        pdf.text((parseInt(item.totalScores) || 0).toString(), currentX + colWidths[4] / 2, yPosition + 14, { align: 'center' });
        currentX += colWidths[4];
        
        pdf.text((parseFloat(item.sumGradedWorks) || 0).toFixed(1), currentX + colWidths[5] / 2, yPosition + 14, { align: 'center' });
        currentX += colWidths[5];
        
        const percentageValue = parseFloat(item.percentage) || 0;
        if (percentageValue >= 70) {
          pdf.setTextColor(34, 139, 34);
        } else if (percentageValue >= 50) {
          pdf.setTextColor(218, 165, 32);
        } else {
          pdf.setTextColor(220, 53, 69);
        }
        pdf.text(item.percentage, currentX + colWidths[6] / 2, yPosition + 14, { align: 'center' });
        pdf.setTextColor(0, 0, 0);
        
        pdf.setDrawColor(200, 200, 200);
        let borderX = tableStartX;
        colWidths.forEach((width) => {
          pdf.rect(borderX, yPosition, width, 20);
          borderX += width;
        });
        
        yPosition += 20;
      });
      
      yPosition += 25;
      
      // ========== SUMMARY SECTION ==========
      pdf.setDrawColor(70, 87, 70, 0.3);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 20;
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(70, 87, 70);
      pdf.text('SUMMARY', margin, yPosition);
      yPosition += 25;
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      const leftColumn = margin;
      const rightColumn = pageWidth / 2 + 50;
      
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
      
      pdf.text('Sum of Graded Works:', rightColumn, yPosition);
      pdf.setFont('helvetica', 'bold');
      pdf.text(sumGradedWorks.toFixed(1), rightColumn + 150, yPosition);
      pdf.setFont('helvetica', 'normal');
      
      pdf.text('Overall Percentage:', rightColumn, yPosition + 20);
      
      const overallValue = parseFloat(overallPercentage);
      if (overallValue >= 70) {
        pdf.setTextColor(34, 139, 34);
      } else if (overallValue >= 50) {
        pdf.setTextColor(218, 165, 32);
      } else {
        pdf.setTextColor(220, 53, 69);
      }
      
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${overallPercentage}%`, rightColumn + 150, yPosition + 20);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      
      yPosition += 60;
      
      // ========== FOOTER INFORMATION ==========
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'italic');
      pdf.setTextColor(100, 100, 100);
      
      let classInfoLine = '';
      if (isForAllStudents) {
        classInfoLine = `Class Summary for: ${classInfo?.subject || 'N/A'} (${classInfo?.subject_code || 'N/A'}) - Section ${classInfo?.section || 'N/A'} | Total Students: ${students.length || 0}`;
      } else {
        classInfoLine = `Individual Report for: ${studentInfo?.first_name || 'N/A'} ${studentInfo?.last_name || 'N/A'} (ID: ${studentInfo?.student_id || 'N/A'})`;
      }
      
      const professorLine = `Professor: ${classInfo?.professor_name || `ID: ${classInfo?.professor_ID || 'N/A'}`}`;
      
      pdf.text(classInfoLine, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;
      pdf.text(professorLine, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 20;
      pdf.setFontSize(9);
      
      if (isForAllStudents) {
        pdf.text(
          `Class Grade Report generated on: ${new Date().toLocaleString()}`,
          pageWidth / 2,
          yPosition,
          { align: 'center' }
        );
      } else {
        pdf.text(
          `Individual Student Report generated on: ${new Date().toLocaleString()}`,
          pageWidth / 2,
          yPosition,
          { align: 'center' }
        );
      }
      
      // ========== SAVE PDF ==========
      let fileName = '';
      if (isForAllStudents) {
        fileName = `Class_Grade_Report_${classInfo?.subject_code || 'subject'}_${classInfo?.section || 'section'}_${new Date().toISOString().slice(0, 10)}.pdf`;
      } else {
        fileName = `Student_Grade_Report_${studentInfo?.student_id || 'student'}_${classInfo?.subject_code || 'subject'}_${new Date().toISOString().slice(0, 10)}.pdf`;
      }
      
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

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

  // Show error state
  if (error && !loading) {
    return (
      <div className="bg-[#23232C] min-h-screen">
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-5 text-center text-white">
            <div className="text-[#A15353] text-lg mb-4">Error: {error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#00A15D] text-white rounded-md hover:bg-[#00874E] transition-all cursor-pointer text-sm"
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
      <div className="bg-[#23232C] min-h-screen">
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-8 text-center text-white">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00A15D] border-r-transparent"></div>
            <p className="mt-3 text-white/80">Loading grade data...</p>
            {error && <p className="mt-2 text-[#A15353] text-sm">{error}</p>}
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
                src={GradeIcon}
                alt="Grade"
                className="h-6 w-6 sm:h-7 sm:w-7 mr-2"
              />
              <h1 className="font-bold text-xl lg:text-2xl text-white">
                Grade
              </h1>
            </div>
            <p className="text-sm lg:text-base text-gray-400">
              View and manage class grades
            </p>
          </div>

          {/* ========== SUBJECT INFORMATION WITH COPY BUTTON ========== */}
          <div className="flex flex-col gap-1 text-sm text-gray-400 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">SUBJECT CODE:</span>
              <div className="flex items-center gap-2">
                <span>{classInfo?.subject_code || 'N/A'}</span>
                {classInfo?.subject_code && (
                  <button
                    onClick={copySubjectCode}
                    className="p-1 text-gray-400 hover:text-white hover:bg-[#15151C] rounded transition-colors cursor-pointer flex items-center gap-1"
                    title="Copy subject code"
                  >
                    <img 
                      src={Copy} 
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
                    alt="Back to Class Management" 
                    className="h-5 w-5 cursor-pointer hover:opacity-70 transition-opacity"
                  />
                </Link>
              </div>
            </div>
          </div>

          <hr className="border-gray-700 mb-4" />

          {/* ========== ACTION BUTTONS ========== */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              {/* Subject Overview Button */}
              {renderActionButton("/SubjectOverviewProfessor", SubjectOverview, "Subject Overview", false, "bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]/30 hover:bg-[#FF5252]/30")}
              
              {/* Announcement Button */}
              {renderActionButton("/Class", Announcement, "Announcements", false, "bg-[#767EE0]/20 text-[#767EE0] border-[#767EE0]/30 hover:bg-[#767EE0]/30")}
              
              {/* Classwork Button */}
              {renderActionButton("/ClassworkTab", Classwork, "Class Work", false, "bg-[#767EE0]/20 text-[#767EE0] border-[#767EE0]/30 hover:bg-[#767EE0]/30")}
              
              {/* Attendance Button */}
              {renderActionButton("/Attendance", Attendance, "Attendance", false, "bg-[#FFA600]/20 text-[#FFA600] border-[#FFA600]/30 hover:bg-[#FFA600]/30")}
              
              {/* Grade Button - Active */}
              {renderActionButton("/GradeTab", GradeIcon, "Grade", true)}
              
              {/* Analytics Button */}
              {renderActionButton("/AnalyticsTab", AnalyticsIcon, "Analytics", false, "bg-[#B39DDB]/20 text-[#B39DDB] border-[#B39DDB]/30 hover:bg-[#B39DDB]/30")}
            </div>
            
            {/* ========== ICON BUTTONS ========== */}
            <div className="flex items-center gap-2 justify-end sm:justify-start">
              {/* Class Management Button */}
              <Link to={`/StudentList?code=${subjectCode}`}>
                <div className="relative group">
                  <button className="p-2 bg-[#15151C] rounded-md shadow-md border-2 border-transparent hover:border-[#00A15D] transition-all duration-200 flex-shrink-0 cursor-pointer">
                    <img 
                      src={ClassManagementIcon} 
                      alt="ClassManagement" 
                      className="h-4 w-4" 
                    />
                  </button>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    Student List
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* ========== GRADE TABLE COMPONENT ========== */}
          <GradeTable
            classInfo={classInfo}
            gradeData={gradeData}
            students={students}
            subjectCode={subjectCode}
            isDownloading={isDownloading}
            onDownload={handleDownload}
          />
        </div>
      </div>
    </div>
  );
}