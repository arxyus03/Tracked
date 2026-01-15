import React, { useState, useEffect } from 'react';
import DownloadIcon from '../../assets/Download.svg';

// ========== GradeTable Component ==========
const GradeTable = ({ 
  classInfo, 
  gradeData, 
  students, 
  subjectCode,
  isDownloading,
  onDownload,
  isDarkMode // Added this prop
}) => {
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [filteredGradeData, setFilteredGradeData] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentGrades, setStudentGrades] = useState({});
  const [, setEditableGrades] = useState({});
  const [summaryData, setSummaryData] = useState(null);
  
  // Expand states for different sections
  const [outputsExpanded, setOutputsExpanded] = useState(true);
  const [examsExpanded, setExamsExpanded] = useState(true);
  const [midtermExpanded, setMidtermExpanded] = useState(true);
  const [finalExpanded, setFinalExpanded] = useState(true);
  const [attendanceExpanded, setAttendanceExpanded] = useState(true);
  
  // Activity types
  const activityTypes = [
    { 
      id: 'assignment', 
      label: 'Assignment', 
      color: 'bg-[#00A15D]/20',
      group: 'outputs'
    },
    { 
      id: 'quiz', 
      label: 'Quiz', 
      color: 'bg-[#FFA600]/20',
      group: 'outputs'
    },
    { 
      id: 'activity', 
      label: 'Activity', 
      color: 'bg-[#0066CC]/20',
      group: 'outputs'
    },
    { 
      id: 'project', 
      label: 'Project', 
      color: 'bg-[#8A2BE2]/20',
      group: 'outputs'
    },
    { 
      id: 'laboratory', 
      label: 'Laboratory', 
      color: 'bg-[#FF6B6B]/20',
      group: 'outputs'
    },
  ];

  // Attendance type - separated for special handling
  const attendanceType = {
    id: 'attendance',
    label: 'Attendance',
    color: 'bg-[#4ECDC4]/20'
  };

  // Exam types with sub-exams
  const examTypes = [
    {
      id: 'midterm_exam',
      label: 'Midterm Exam',
      color: 'bg-[#96CEB4]/20',
      group: 'exams',
      subExams: [
        { id: 'midterm_written', label: 'Written Exam', color: 'bg-[#96CEB4]/40' },
        { id: 'midterm_laboratory', label: 'Laboratory Exam', color: 'bg-[#96CEB4]/60' }
      ]
    },
    {
      id: 'final_exam',
      label: 'Final Exam',
      color: 'bg-[#FFEAA7]/20',
      group: 'exams',
      subExams: [
        { id: 'final_written', label: 'Written Exam', color: 'bg-[#FFEAA7]/40' },
        { id: 'final_laboratory', label: 'Laboratory Exam', color: 'bg-[#FFEAA7]/60' }
      ]
    }
  ];

  // Initialize filtered data with gradeData
  useEffect(() => {
    if (gradeData && gradeData.length > 0) {
      const formattedData = gradeData.map(item => ({
        ...item,
        assignedWorks: parseInt(item.assignedWorks) || 0,
        submissions: parseInt(item.submissions) || 0,
        missedSubmissions: parseInt(item.missedSubmissions) || 0,
        totalScores: parseInt(item.totalScores) || 0,
        sumGradedWorks: parseFloat(item.sumGradedWorks) || 0,
        percentage: item.percentage || "0%"
      }));
      setFilteredGradeData(formattedData);
    }
  }, [gradeData]);

  // ========== FETCH STUDENT-SPECIFIC GRADE DATA ==========
  useEffect(() => {
    const fetchStudentGrades = async () => {
      if (!students.length || !classInfo || !subjectCode) return;

      try {
        const grades = {};
        
        for (const student of students) {
          try {
            const response = await fetch(
              `https://tracked.6minds.site/Professor/GradeProfDB/get_student_grades.php?subject_code=${subjectCode}&section=${classInfo.section}&professor_ID=${classInfo.professor_ID}&student_id=${student.student_id}`
            );
            
            if (response.ok) {
              const result = await response.json();
              if (result.success && result.data) {
                const mergedData = mergeGradeData(result.data);
                grades[student.student_id] = {
                  data: mergedData,
                  summary: result.summary || {}
                };
              }
            }
          } catch (error) {
            console.error(`Error fetching grades for student ${student.student_id}:`, error);
          }
        }
        
        setStudentGrades(grades);
      } catch (error) {
        console.error("Error fetching student grades:", error);
      }
    };

    fetchStudentGrades();
  }, [students, classInfo, subjectCode]);

  // ========== MERGE GRADE DATA WITH ALL ACTIVITY TYPES ==========
  const mergeGradeData = (existingData) => {
    if (!existingData || !Array.isArray(existingData)) {
      existingData = [];
    }
    
    const merged = [...existingData];
    
    // Add regular activity types if missing
    activityTypes.forEach(type => {
      const exists = merged.some(item => item.activityType === type.label);
      if (!exists) {
        merged.push({
          activityType: type.label,
          assignedWorks: 0,
          submissions: 0,
          missedSubmissions: 0,
          totalScores: 0,
          sumGradedWorks: 0,
          percentage: "0%"
        });
      }
    });
    
    // Add attendance type
    const attendanceExists = merged.some(item => item.activityType === attendanceType.label);
    if (!attendanceExists) {
      merged.push({
        activityType: attendanceType.label,
        assignedWorks: 0,
        submissions: 0,
        missedSubmissions: 0,
        totalScores: 0,
        sumGradedWorks: 0,
        percentage: "0%",
        isAttendance: true
      });
    }
    
    // Add exam types if missing
    const examLabels = [
      'Midterm Exam - Written Exam',
      'Midterm Exam - Laboratory Exam',
      'Final Exam - Written Exam',
      'Final Exam - Laboratory Exam'
    ];
    
    examLabels.forEach(label => {
      const exists = merged.some(item => item.activityType === label);
      if (!exists) {
        merged.push({
          activityType: label,
          assignedWorks: 0,
          submissions: 0,
          missedSubmissions: 0,
          totalScores: 0,
          sumGradedWorks: 0,
          percentage: "0%",
          isExam: true
        });
      }
    });
    
    // Ensure all numeric values are properly formatted
    return merged.map(item => ({
      ...item,
      assignedWorks: parseInt(item.assignedWorks) || 0,
      submissions: parseInt(item.submissions) || 0,
      missedSubmissions: parseInt(item.missedSubmissions) || 0,
      totalScores: parseInt(item.totalScores) || 0,
      sumGradedWorks: parseFloat(item.sumGradedWorks) || 0,
      percentage: typeof item.percentage === 'string' ? item.percentage : 
                 (item.percentage || 0).toString() + '%'
    }));
  };

  // ========== HANDLE STUDENT SELECTION ==========
  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);
    
    if (studentId === 'all') {
      const formattedData = gradeData.map(item => ({
        ...item,
        assignedWorks: parseInt(item.assignedWorks) || 0,
        submissions: parseInt(item.submissions) || 0,
        missedSubmissions: parseInt(item.missedSubmissions) || 0,
        totalScores: parseInt(item.totalScores) || 0,
        sumGradedWorks: parseFloat(item.sumGradedWorks) || 0,
        percentage: item.percentage || "0%"
      }));
      setFilteredGradeData(formattedData);
      setEditableGrades({});
      setSummaryData(null);
      return;
    }

    setIsLoadingStudents(true);
    
    setTimeout(() => {
      if (studentGrades[studentId]) {
        const mergedData = mergeGradeData(studentGrades[studentId].data);
        setFilteredGradeData(mergedData);
        setSummaryData(studentGrades[studentId].summary);
      } else {
        const defaultData = mergeGradeData([]);
        setFilteredGradeData(defaultData);
        setSummaryData(null);
      }
      setIsLoadingStudents(false);
    }, 500);
  };

  // ========== GET SELECTED STUDENT INFO ==========
  const getSelectedStudentInfo = () => {
    if (selectedStudent === 'all') return null;
    return students.find(s => s.student_id === selectedStudent);
  };

  const selectedStudentInfo = getSelectedStudentInfo();

  // ========== ENHANCED PDF DOWNLOAD ==========
  const handleEnhancedDownload = () => {
    onDownload(selectedStudent, selectedStudentInfo);
  };

  // ========== THEME HELPER FUNCTIONS ==========
  const getBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getTextColor = () => {
    return isDarkMode ? "text-white" : "text-gray-900";
  };

  const getSecondaryTextColor = () => {
    return isDarkMode ? "text-white/80" : "text-gray-600";
  };

  const getBorderColor = () => {
    return isDarkMode ? "border-[#FFFFFF]/10" : "border-gray-200";
  };

  const getTableHeaderBackground = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-gray-100";
  };

  const getTableRowHover = () => {
    return isDarkMode ? "hover:bg-[#23232C]" : "hover:bg-gray-50";
  };

  const getGroupHeaderBackground = () => {
    return isDarkMode ? "bg-[#2A2A35]" : "bg-gray-100";
  };

  const getExamHeaderBackground = () => {
    return isDarkMode ? "bg-[#33333F]" : "bg-gray-200";
  };

  const getInputBackground = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  // ========== RENDER STUDENT FILTER ==========
  const renderStudentFilter = () => (
    <div className="w-full sm:w-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <label className={`text-sm font-medium whitespace-nowrap ${getTextColor()}`}>
          Filter by Student:
        </label>
        <div className="relative w-full sm:w-64">
          <select
            value={selectedStudent}
            onChange={handleStudentChange}
            disabled={isLoadingStudents || !students.length}
            className={`w-full ${getInputBackground()} ${getTextColor()} text-sm rounded-md px-3 py-2 border ${getBorderColor()} focus:outline-none focus:ring-1 focus:ring-[#00A15D] appearance-none cursor-pointer`}
          >
            <option value="all">All Students (Class Summary)</option>
            {students.map((student) => (
              <option 
                key={student.student_id} 
                value={student.student_id}
              >
                {student.last_name}, {student.first_name} ({student.student_id})
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {isLoadingStudents && (
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
              <div className="h-4 w-4 border-2 border-[#00A15D] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ========== RENDER DOWNLOAD BUTTON ==========
  const renderDownloadButton = () => (
    <div className="w-full sm:w-auto">
      <button 
        onClick={handleEnhancedDownload}
        disabled={isDownloading || filteredGradeData.length === 0}
        className={`flex items-center gap-2 px-3 py-2 ${isDarkMode ? 'bg-[#15151C]' : 'bg-gray-100'} font-semibold text-sm rounded-md shadow-md border-2 border-transparent hover:border-[#00A15D] transition-all duration-200 cursor-pointer ${getTextColor()} w-full sm:w-auto justify-center ${
          isDownloading || filteredGradeData.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={filteredGradeData.length === 0 ? "No data to download" : "Download Grade Report as PDF"}
      >
        {isDownloading ? (
          <>
            <div className="h-4 w-4 border-2 border-[#00A15D] border-t-transparent rounded-full animate-spin"></div>
            <span className={getTextColor()}>Generating PDF...</span>
          </>
        ) : (
          <>
            <img 
              src={DownloadIcon} 
              alt="Download" 
              className="h-4 w-4"
              style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
            />
            <span className={getTextColor()}>
              {selectedStudent === 'all' ? 'Download Class PDF' : 'Download Student PDF'}
            </span>
          </>
        )}
      </button>
    </div>
  );

  // ========== GET ACTIVITY TYPE COLOR ==========
  const getActivityTypeColor = (activityType) => {
    // Check regular activity types
    const activity = activityTypes.find(type => type.label === activityType);
    if (activity) return activity.color;
    
    // Check attendance type
    if (activityType === attendanceType.label) return attendanceType.color;
    
    // Check exam types
    if (activityType.includes('Midterm Exam')) {
      if (activityType.includes('Written Exam')) {
        return 'bg-[#96CEB4]/40';
      } else if (activityType.includes('Laboratory Exam')) {
        return 'bg-[#96CEB4]/60';
      }
      return 'bg-[#96CEB4]/20';
    }
    
    if (activityType.includes('Final Exam')) {
      if (activityType.includes('Written Exam')) {
        return 'bg-[#FFEAA7]/40';
      } else if (activityType.includes('Laboratory Exam')) {
        return 'bg-[#FFEAA7]/60';
      }
      return 'bg-[#FFEAA7]/20';
    }
    
    return 'bg-[#A15353]/20';
  };

  // ========== GET OUTPUTS DATA ==========
  const getOutputsData = () => {
    return filteredGradeData.filter(item => 
      ['Assignment', 'Quiz', 'Activity', 'Project', 'Laboratory'].includes(item.activityType)
    );
  };

  // ========== GET ATTENDANCE DATA ==========
  const getAttendanceData = () => {
    return filteredGradeData.filter(item => item.activityType === attendanceType.label);
  };

  // ========== GET EXAMS DATA ==========
  const getExamsData = () => {
    return filteredGradeData.filter(item => 
      item.activityType.includes('Midterm Exam') || item.activityType.includes('Final Exam')
    );
  };

  // ========== GET EXAM SUB EXAMS DATA ==========
  const getExamSubExamsData = (examId) => {
    if (examId === 'midterm_exam') {
      return filteredGradeData.filter(item => 
        item.activityType.includes('Midterm Exam')
      );
    } else if (examId === 'final_exam') {
      return filteredGradeData.filter(item => 
        item.activityType.includes('Final Exam')
      );
    }
    return [];
  };

  // ========== RENDER GROUP HEADER ==========
  const renderGroupHeader = (label, description, isExpanded, toggleFunction) => {
    return (
      <tr className={`group-header ${getGroupHeaderBackground()} border-b ${getBorderColor()}`}>
        <td colSpan="7" className="px-2 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFunction}
              className={`${getTextColor()} hover:text-[#00A15D] transition-colors duration-200 focus:outline-none`}
              aria-label={isExpanded ? `Collapse ${label}` : `Expand ${label}`}
            >
              {isExpanded ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
            <div className="flex items-center gap-1">
              <h3 className={`text-sm font-bold ${getTextColor()}`}>{label}</h3>
              <span className={`text-xs ${getSecondaryTextColor()} ml-1`}>- {description}</span>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  // ========== RENDER EXAM HEADER ==========
  const renderExamHeader = (exam, isExpanded, toggleFunction) => {
    return (
      <tr className={`group-header ${getExamHeaderBackground()} border-b ${getBorderColor()}`}>
        <td colSpan="7" className="px-2 py-2">
          <div className="flex items-center gap-2 pl-4">
            <button
              onClick={toggleFunction}
              className={`${getTextColor()} hover:text-[#00A15D] transition-colors duration-200 focus:outline-none`}
              aria-label={isExpanded ? `Collapse ${exam.label}` : `Expand ${exam.label}`}
            >
              {isExpanded ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
            <h3 className={`text-sm font-bold ${getTextColor()}`}>{exam.label}</h3>
          </div>
        </td>
      </tr>
    );
  };

  // ========== RENDER ATTENDANCE HEADER ==========
  const renderAttendanceHeader = () => {
    return (
      <tr className={`group-header ${getGroupHeaderBackground()} border-b ${getBorderColor()}`}>
        <td colSpan="7" className="px-2 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAttendanceExpanded(!attendanceExpanded)}
              className={`${getTextColor()} hover:text-[#00A15D] transition-colors duration-200 focus:outline-none`}
              aria-label={attendanceExpanded ? `Collapse Attendance` : `Expand Attendance`}
            >
              {attendanceExpanded ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </button>
            <div className="flex items-center gap-1">
              <h3 className={`text-sm font-bold ${getTextColor()}`}>Attendance</h3>
              <span className={`text-xs ${getSecondaryTextColor()} ml-1`}>- Class attendance records</span>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  // ========== RENDER ACTIVITY ROW ==========
  const renderActivityRow = (item, index) => {
    // Ensure all values are properly parsed
    const assignedWorks = parseInt(item.assignedWorks) || 0;
    const submissions = parseInt(item.submissions) || 0;
    const missedSubmissions = parseInt(item.missedSubmissions) || 0;
    const totalScores = parseInt(item.totalScores) || 0;
    const sumGradedWorks = parseFloat(item.sumGradedWorks) || 0;
    const percentage = item.percentage || "0%";
    
    return (
      <tr
        key={`${item.activityType}-${index}-${selectedStudent}`}
        className={`text-xs border-b ${getBorderColor()} ${getTableRowHover()}`}
      >
        <td className={`px-2 py-2 font-medium flex items-center gap-2 ${getTextColor()}`}>
          <div className={`w-2 h-2 rounded-full ${getActivityTypeColor(item.activityType).replace('/20', '/60')}`}></div>
          {item.activityType}
        </td>
        <td className={`px-2 py-2 text-center ${getTextColor()}`}>
          {assignedWorks}
        </td>
        <td className={`px-2 py-2 text-center ${getTextColor()}`}>
          {submissions}
        </td>
        <td className={`px-2 py-2 text-center ${getTextColor()}`}>
          {missedSubmissions}
        </td>
        <td className={`px-2 py-2 text-center ${getTextColor()}`}>
          {totalScores}
        </td>
        <td className={`px-2 py-2 text-center ${getTextColor()}`}>
          {sumGradedWorks.toFixed(1)}
        </td>
        <td className="px-2 py-2 text-center">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityTypeColor(item.activityType)} ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {percentage}
          </span>
        </td>
      </tr>
    );
  };

  // ========== RENDER SUB EXAM ROW ==========
  const renderSubExamRow = (item, index) => {
    // Ensure all values are properly parsed
    const assignedWorks = parseInt(item.assignedWorks) || 0;
    const submissions = parseInt(item.submissions) || 0;
    const missedSubmissions = parseInt(item.missedSubmissions) || 0;
    const totalScores = parseInt(item.totalScores) || 0;
    const sumGradedWorks = parseFloat(item.sumGradedWorks) || 0;
    const percentage = item.percentage || "0%";
    
    return (
      <tr
        key={`${item.activityType}-${index}-${selectedStudent}`}
        className={`text-xs border-b ${getBorderColor()} ${getTableRowHover()}`}
      >
        <td className={`px-2 py-2 font-medium flex items-center gap-2 pl-8 ${getTextColor()}`}>
          <div className={`w-2 h-2 rounded-full ${getActivityTypeColor(item.activityType).replace('/20', '/60')}`}></div>
          {item.activityType}
        </td>
        <td className={`px-2 py-2 text-center ${getTextColor()}`}>
          {assignedWorks}
        </td>
        <td className={`px-2 py-2 text-center ${getTextColor()}`}>
          {submissions}
        </td>
        <td className={`px-2 py-2 text-center ${getTextColor()}`}>
          {missedSubmissions}
        </td>
        <td className={`px-2 py-2 text-center ${getTextColor()}`}>
          {totalScores}
        </td>
        <td className={`px-2 py-2 text-center ${getTextColor()}`}>
          {sumGradedWorks.toFixed(1)}
        </td>
        <td className="px-2 py-2 text-center">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityTypeColor(item.activityType)} ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {percentage}
          </span>
        </td>
      </tr>
    );
  };

  // ========== CALCULATE SUMMARY DATA ==========
  const calculateSummary = () => {
    if (selectedStudent === 'all' || !summaryData) {
      // Calculate from filtered data
      const totalAssigned = filteredGradeData.reduce((sum, item) => sum + (parseInt(item.assignedWorks) || 0), 0);
      const totalSubmissions = filteredGradeData.reduce((sum, item) => sum + (parseInt(item.submissions) || 0), 0);
      const totalScores = filteredGradeData.reduce((sum, item) => sum + (parseInt(item.totalScores) || 0), 0);
      const sumGradedWorks = filteredGradeData.reduce((sum, item) => sum + (parseFloat(item.sumGradedWorks) || 0), 0);
      const overallPercentage = totalScores > 0 
        ? (sumGradedWorks / totalScores) * 100 
        : 0;

      return {
        totalAssigned,
        totalSubmissions,
        totalScores,
        sumGradedWorks,
        overallPercentage
      };
    } else {
      // Use student-specific summary
      return {
        totalAssigned: parseInt(summaryData.totalAssigned) || 0,
        totalSubmissions: parseInt(summaryData.totalSubmissions) || 0,
        totalScores: parseInt(summaryData.totalScores) || 0,
        sumGradedWorks: parseFloat(summaryData.totalGradedWorks) || 0,
        overallPercentage: parseFloat(summaryData.finalPercentage) || 0,
        academicPercentage: parseFloat(summaryData.academicPercentage) || 0,
        attendancePercentage: parseFloat(summaryData.attendancePercentage) || 0
      };
    }
  };

  const summary = calculateSummary();

  // ========== RENDER GRADE TABLE ==========
  const renderGradeTable = () => {
    // Get data for different sections
    const outputsData = getOutputsData();
    const attendanceData = getAttendanceData();
    const examsData = getExamsData();

    return (
      <div className={`mt-4 ${getBackgroundColor()} rounded-lg shadow-md border ${getBorderColor()} overflow-hidden`}>
        <div className="overflow-x-auto">
          <div className={`sm:hidden text-xs ${getSecondaryTextColor()} py-1.5 text-center ${getTableHeaderBackground()}`}>
            ← Swipe to see all columns →
          </div>
          <div className="p-3">
            <table className="table-auto w-full border-collapse text-left min-w-[900px]">
              <thead>
                <tr className={`text-xs font-semibold ${getTableHeaderBackground()} ${getTextColor()}`}>
                  <th className={`px-2 py-2 border-b ${getBorderColor()}`}>Class Works</th>
                  <th className={`px-2 py-2 border-b ${getBorderColor()} text-center`}>Assigned Works</th>
                  <th className={`px-2 py-2 border-b ${getBorderColor()} text-center`}>Submissions</th>
                  <th className={`px-2 py-2 border-b ${getBorderColor()} text-center`}>Missed Submissions</th>
                  <th className={`px-2 py-2 border-b ${getBorderColor()} text-center`}>Total Scores</th>
                  <th className={`px-2 py-2 border-b ${getBorderColor()} text-center`}>Sum of Graded Works</th>
                  <th className={`px-2 py-2 border-b ${getBorderColor()} text-center`}>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {/* Outputs Section (Collapsible) */}
                {renderGroupHeader(
                  'Outputs',
                  'Assignments, Quizzes, Activities, Projects, and Laboratory Works',
                  outputsExpanded,
                  () => setOutputsExpanded(!outputsExpanded)
                )}
                {outputsExpanded && outputsData.map((item, index) => renderActivityRow(item, index))}
                
                {/* Exams Section (Collapsible) */}
                {renderGroupHeader(
                  'Exams',
                  'Midterm and Final Examinations',
                  examsExpanded,
                  () => setExamsExpanded(!examsExpanded)
                )}
                
                {examsExpanded && examTypes.map((exam) => (
                  <React.Fragment key={exam.id}>
                    {renderExamHeader(
                      exam,
                      exam.id === 'midterm_exam' ? midtermExpanded : finalExpanded,
                      exam.id === 'midterm_exam' 
                        ? () => setMidtermExpanded(!midtermExpanded)
                        : () => setFinalExpanded(!finalExpanded)
                    )}
                    
                    {(exam.id === 'midterm_exam' ? midtermExpanded : finalExpanded) && 
                     getExamSubExamsData(exam.id).map((item, index) => renderSubExamRow(item, index))}
                  </React.Fragment>
                ))}
                
                {/* Attendance Section at the bottom (Collapsible) */}
                {renderAttendanceHeader()}
                {attendanceExpanded && attendanceData.map((item, index) => renderActivityRow(item, index))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========== SUMMARY SECTION ========== */}
        <div className={`p-3 border-t ${getBorderColor()} ${getTableHeaderBackground()}`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="text-center">
              <div className={`font-semibold ${getSecondaryTextColor()}`}>Total Assigned</div>
              <div className={`text-sm font-bold ${getTextColor()}`}>
                {summary.totalAssigned}
              </div>
            </div>
            <div className="text-center">
              <div className={`font-semibold ${getSecondaryTextColor()}`}>Total Submissions</div>
              <div className={`text-sm font-bold ${getTextColor()}`}>
                {summary.totalSubmissions}
              </div>
            </div>
            <div className="text-center">
              <div className={`font-semibold ${getSecondaryTextColor()}`}>Overall Score</div>
              <div className={`text-sm font-bold ${getTextColor()}`}>
                {summary.sumGradedWorks.toFixed(1)}
              </div>
            </div>
            <div className="text-center">
              <div className={`font-semibold ${getSecondaryTextColor()}`}>Overall Percentage</div>
              <div className={`text-sm font-bold ${
                summary.overallPercentage >= 70 ? 'text-green-400' : 
                summary.overallPercentage >= 50 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {summary.overallPercentage.toFixed(2)}%
              </div>
            </div>
          </div>
          
          {/* Weighted Percentage Breakdown (for individual students) */}
          {selectedStudent !== 'all' && summary.academicPercentage !== undefined && (
            <div className={`mt-3 pt-3 border-t ${getBorderColor()}`}>
              <div className={`text-xs ${getSecondaryTextColor()} mb-1`}>Weighted Performance:</div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <div className={getSecondaryTextColor()}>Academic</div>
                  <div className={`${getTextColor()} font-semibold`}>{summary.academicPercentage?.toFixed(2)}%</div>
                </div>
                <div className="text-center">
                  <div className={getSecondaryTextColor()}>Attendance</div>
                  <div className={`${getTextColor()} font-semibold`}>{summary.attendancePercentage?.toFixed(2)}%</div>
                </div>
                <div className="text-center">
                  <div className={getSecondaryTextColor()}>Final (75/25)</div>
                  <div className={`font-semibold ${
                    summary.overallPercentage >= 70 ? 'text-green-400' : 
                    summary.overallPercentage >= 50 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {summary.overallPercentage.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Class Information Display */}
          <div className={`mt-3 pt-3 border-t ${getBorderColor()} text-center`}>
            <div className={`text-xs ${getSecondaryTextColor()}`}>
              Showing data for: <span className={`font-semibold ${getTextColor()}`}>{classInfo?.subject} ({classInfo?.subject_code}) - Section {classInfo?.section}</span>
              {selectedStudent !== 'all' && selectedStudentInfo && (
                <>
                  {' | '}
                  <span className={`font-semibold ${getTextColor()}`}>
                    Student: {selectedStudentInfo.first_name} {selectedStudentInfo.last_name}
                  </span>
                </>
              )}
            </div>
            <div className={`text-xs ${getSecondaryTextColor()} mt-0.5`}>
              Professor: <span className={getTextColor()}>{classInfo?.professor_name || `ID: ${classInfo?.professor_ID}`}</span>
            </div>
            
            {/* Student Filter Status */}
            {selectedStudent !== 'all' && (
              <div className={`text-xs ${getSecondaryTextColor()} mt-0.5`}>
                {studentGrades[selectedStudent] 
                  ? "Showing student-specific grade data" 
                  : "Showing class summary data (student-specific data not available)"}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ========== FILTER AND DOWNLOAD SECTION ========== */}
      <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        {renderStudentFilter()}
        {renderDownloadButton()}
      </div>
      
      {/* ========== GRADE TABLE ========== */}
      {renderGradeTable()}
    </>
  );
};

export default GradeTable;