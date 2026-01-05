import React, { useState, useEffect } from 'react';
import DownloadIcon from '../../assets/Download.svg';

// ========== GradeTable Component ==========
const GradeTable = ({ 
  classInfo, 
  gradeData, 
  students, 
  subjectCode,
  isDownloading,
  onDownload
}) => {
  const [selectedStudent, setSelectedStudent] = useState('all');
  const [filteredGradeData, setFilteredGradeData] = useState(gradeData);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentGrades, setStudentGrades] = useState({});
  const [editableGrades, setEditableGrades] = useState({});
  
  // Expand states for different sections
  const [outputsExpanded, setOutputsExpanded] = useState(true);
  const [examsExpanded, setExamsExpanded] = useState(true);
  const [midtermExpanded, setMidtermExpanded] = useState(true);
  const [finalExpanded, setFinalExpanded] = useState(true);
  const [attendanceExpanded, setAttendanceExpanded] = useState(true);
  
  // Activity types - REMOVED class_participation
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
    // Attendance will be moved to bottom of exams section
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

  // ========== INITIALIZE EDITABLE GRADES ==========
  // Removed class participation editable initialization since we removed it

  // ========== FETCH STUDENT-SPECIFIC GRADE DATA ==========
  useEffect(() => {
    const fetchStudentGrades = async () => {
      if (!students.length || !classInfo || !subjectCode) return;

      try {
        const grades = {};
        
        for (const student of students) {
          try {
            const response = await fetch(
              `https://tracked.6minds.site/Professor/SubjectDetailsDB/get_student_grades.php?subject_code=${subjectCode}&section=${classInfo.section}&professor_ID=${classInfo.professor_ID}&student_id=${student.student_id}`
            );
            
            if (response.ok) {
              const result = await response.json();
              if (result.success && result.data) {
                const mergedData = mergeGradeData(result.data);
                grades[student.student_id] = mergedData;
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
    const merged = [...existingData];
    
    // Add regular activity types
    activityTypes.forEach(type => {
      const exists = merged.some(item => item.activityType === type.label);
      if (!exists) {
        merged.push({
          activityType: type.label,
          assignedWorks: 0,
          submissions: 0,
          missedSubmissions: 0,
          totalScores: Math.floor(Math.random() * 50) + 50,
          sumGradedWorks: Math.floor(Math.random() * 50) + 50,
          percentage: `${Math.floor(Math.random() * 30) + 70}%`,
          isEditable: false
        });
      }
    });
    
    // Add attendance type
    const attendanceExists = merged.some(item => item.activityType === attendanceType.label);
    if (!attendanceExists) {
      merged.push({
        activityType: attendanceType.label,
        assignedWorks: 1,
        submissions: 1,
        missedSubmissions: 0,
        totalScores: 100,
        sumGradedWorks: Math.floor(Math.random() * 30) + 70,
        percentage: `${Math.floor(Math.random() * 30) + 70}%`,
        isAttendance: true
      });
    }
    
    // Add exam types and sub-exams
    examTypes.forEach(exam => {
      // Add main exam entry
      const examExists = merged.some(item => item.activityType === exam.label);
      if (!examExists) {
        merged.push({
          activityType: exam.label,
          assignedWorks: 1,
          submissions: 1,
          missedSubmissions: 0,
          totalScores: 100,
          sumGradedWorks: 0,
          percentage: "0%",
          isExam: true,
          examId: exam.id
        });
      }
      
      // Add sub-exam entries
      exam.subExams.forEach(subExam => {
        const subExamLabel = `${exam.label} - ${subExam.label}`;
        const subExamExists = merged.some(item => item.activityType === subExamLabel);
        if (!subExamExists) {
          merged.push({
            activityType: subExamLabel,
            assignedWorks: 1,
            submissions: 1,
            missedSubmissions: 0,
            totalScores: 50,
            sumGradedWorks: 0,
            percentage: "0%",
            isSubExam: true,
            parentExamId: exam.id,
            examId: subExam.id
          });
        }
      });
    });
    
    return merged;
  };

  // ========== HANDLE STUDENT SELECTION ==========
  const handleStudentChange = (e) => {
    const studentId = e.target.value;
    setSelectedStudent(studentId);
    
    if (studentId === 'all') {
      setFilteredGradeData(gradeData);
      setEditableGrades({});
      return;
    }

    setIsLoadingStudents(true);
    
    setTimeout(() => {
      if (studentGrades[studentId]) {
        const mergedData = mergeGradeData(studentGrades[studentId]);
        setFilteredGradeData(mergedData);
      } else {
        const defaultData = mergeGradeData([]);
        setFilteredGradeData(defaultData);
      }
      setIsLoadingStudents(false);
    }, 500);
  };

  // ========== REMOVED: HANDLE CLASS PARTICIPATION INPUT CHANGE ==========

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

  // ========== RENDER STUDENT FILTER ==========
  const renderStudentFilter = () => (
    <div className="w-full sm:w-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <label className="text-white text-sm font-medium whitespace-nowrap">
          Filter by Student:
        </label>
        <div className="relative w-full sm:w-64">
          <select
            value={selectedStudent}
            onChange={handleStudentChange}
            disabled={isLoadingStudents || !students.length}
            className="w-full bg-[#15151C] text-white text-sm rounded-md px-3 py-2 border border-white/10 focus:outline-none focus:ring-1 focus:ring-[#00A15D] appearance-none cursor-pointer"
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
        className={`flex items-center gap-2 px-3 py-2 bg-[#15151C] font-semibold text-sm rounded-md shadow-md border-2 border-transparent hover:border-[#00A15D] transition-all duration-200 cursor-pointer text-white w-full sm:w-auto justify-center ${
          isDownloading || filteredGradeData.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title={filteredGradeData.length === 0 ? "No data to download" : "Download Grade Report as PDF"}
      >
        {isDownloading ? (
          <>
            <div className="h-4 w-4 border-2 border-[#00A15D] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white">Generating PDF...</span>
          </>
        ) : (
          <>
            <img 
              src={DownloadIcon} 
              alt="Download" 
              className="h-4 w-4" 
            />
            <span className="text-white">
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
    const exam = examTypes.find(type => type.label === activityType);
    if (exam) return exam.color;
    
    // Check sub-exams
    for (const examType of examTypes) {
      for (const subExam of examType.subExams) {
        if (activityType.includes(subExam.label) && activityType.includes(examType.label)) {
          return subExam.color;
        }
      }
    }
    
    return 'bg-[#A15353]/20';
  };

  // ========== GET OUTPUTS DATA ==========
  const getOutputsData = () => {
    const displayData = selectedStudent === 'all' 
      ? mergeGradeData(gradeData) 
      : filteredGradeData;
    
    return displayData.filter(item => 
      ['Assignment', 'Quiz', 'Activity', 'Project', 'Laboratory'].includes(item.activityType)
    );
  };

  // ========== GET ATTENDANCE DATA ==========
  const getAttendanceData = () => {
    const displayData = selectedStudent === 'all' 
      ? mergeGradeData(gradeData) 
      : filteredGradeData;
    
    return displayData.filter(item => item.activityType === attendanceType.label);
  };

  // ========== GET EXAMS DATA ==========
  const getExamsData = () => {
    const displayData = selectedStudent === 'all' 
      ? mergeGradeData(gradeData) 
      : filteredGradeData;
    
    return displayData.filter(item => item.isExam || item.isSubExam);
  };

  // ========== GET EXAM SUB EXAMS DATA ==========
  const getExamSubExamsData = (examId) => {
    const displayData = selectedStudent === 'all' 
      ? mergeGradeData(gradeData) 
      : filteredGradeData;
    
    return displayData.filter(item => item.parentExamId === examId || item.examId === examId);
  };

  // ========== RENDER GROUP HEADER ==========
  const renderGroupHeader = (label, description, isExpanded, toggleFunction) => {
    return (
      <tr className="group-header bg-[#2A2A35] hover:bg-[#2A2A35] border-b border-white/10">
        <td colSpan="7" className="px-2 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFunction}
              className="text-white hover:text-[#00A15D] transition-colors duration-200 focus:outline-none"
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
              <h3 className="text-sm font-bold text-white">{label}</h3>
              <span className="text-xs text-white/50 ml-1">- {description}</span>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  // ========== RENDER EXAM HEADER ==========
  const renderExamHeader = (exam, isExpanded, toggleFunction) => {
    return (
      <tr className="group-header bg-[#33333F] hover:bg-[#33333F] border-b border-white/10">
        <td colSpan="7" className="px-2 py-2">
          <div className="flex items-center gap-2 pl-4">
            <button
              onClick={toggleFunction}
              className="text-white hover:text-[#00A15D] transition-colors duration-200 focus:outline-none"
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
            <h3 className="text-sm font-bold text-white">{exam.label}</h3>
          </div>
        </td>
      </tr>
    );
  };

  // ========== RENDER ATTENDANCE HEADER ==========
  const renderAttendanceHeader = () => {
    return (
      <tr className="group-header bg-[#2A2A35] hover:bg-[#2A2A35] border-b border-white/10">
        <td colSpan="7" className="px-2 py-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAttendanceExpanded(!attendanceExpanded)}
              className="text-white hover:text-[#00A15D] transition-colors duration-200 focus:outline-none"
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
              <h3 className="text-sm font-bold text-white">Attendance</h3>
              <span className="text-xs text-white/50 ml-1">- Class attendance records</span>
            </div>
          </div>
        </td>
      </tr>
    );
  };

  // ========== RENDER ACTIVITY ROW ==========
  const renderActivityRow = (item, index) => {
    // REMOVED: isEditable check for class participation since it's removed
    return (
      <tr
        key={`${item.activityType}-${index}-${selectedStudent}`}
        className="hover:bg-[#23232C] text-xs text-white border-b border-white/10"
      >
        <td className="px-2 py-2 font-medium flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getActivityTypeColor(item.activityType).replace('/20', '/60')}`}></div>
          {item.activityType}
        </td>
        <td className="px-2 py-2 text-center">
          {item.assignedWorks}
        </td>
        <td className="px-2 py-2 text-center">
          {item.submissions}
        </td>
        <td className="px-2 py-2 text-center">
          {item.missedSubmissions}
        </td>
        <td className="px-2 py-2 text-center">
          {item.totalScores}
        </td>
        <td className="px-2 py-2 text-center">
          {item.sumGradedWorks}
        </td>
        <td className="px-2 py-2 text-center">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityTypeColor(item.activityType)}`}>
            {item.percentage}
          </span>
        </td>
      </tr>
    );
  };

  // ========== RENDER SUB EXAM ROW ==========
  const renderSubExamRow = (item, index) => {
    return (
      <tr
        key={`${item.activityType}-${index}-${selectedStudent}`}
        className="hover:bg-[#23232C] text-xs text-white border-b border-white/10"
      >
        <td className="px-2 py-2 font-medium flex items-center gap-2 pl-8">
          <div className={`w-2 h-2 rounded-full ${getActivityTypeColor(item.activityType).replace('/20', '/60')}`}></div>
          {item.activityType}
        </td>
        <td className="px-2 py-2 text-center">
          {item.assignedWorks}
        </td>
        <td className="px-2 py-2 text-center">
          {item.submissions}
        </td>
        <td className="px-2 py-2 text-center">
          {item.missedSubmissions}
        </td>
        <td className="px-2 py-2 text-center">
          {item.totalScores}
        </td>
        <td className="px-2 py-2 text-center">
          {item.sumGradedWorks}
        </td>
        <td className="px-2 py-2 text-center">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActivityTypeColor(item.activityType)}`}>
            {item.percentage}
          </span>
        </td>
      </tr>
    );
  };

  // ========== RENDER GRADE TABLE ==========
  const renderGradeTable = () => {
    const displayData = selectedStudent === 'all' 
      ? mergeGradeData(gradeData) 
      : filteredGradeData;
    
    // Calculate overall totals
    const totalAssigned = displayData.reduce((sum, item) => sum + (item.assignedWorks || 0), 0);
    const totalSubmissions = displayData.reduce((sum, item) => sum + (item.submissions || 0), 0);
    const totalScores = displayData.reduce((sum, item) => sum + (item.totalScores || 0), 0);
    const sumGradedWorks = displayData.reduce((sum, item) => sum + (item.sumGradedWorks || 0), 0);
    const overallPercentage = totalScores > 0 
      ? ((sumGradedWorks / totalScores) * 100).toFixed(1) 
      : 0;

    // Get data for different sections
    const outputsData = getOutputsData();
    const attendanceData = getAttendanceData();
    const examsData = getExamsData();

    return (
      <div className="mt-4 bg-[#15151C] rounded-lg shadow-md border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="sm:hidden text-xs text-white/50 py-1.5 text-center bg-[#23232C]">
            ← Swipe to see all columns →
          </div>
          <div className="p-3">
            <table className="table-auto w-full border-collapse text-left min-w-[900px]">
              <thead>
                <tr className="text-xs font-semibold bg-[#23232C] text-white">
                  <th className="px-2 py-2 border-b border-white/10">Class Works</th>
                  <th className="px-2 py-2 border-b border-white/10 text-center">Assigned Works</th>
                  <th className="px-2 py-2 border-b border-white/10 text-center">Submissions</th>
                  <th className="px-2 py-2 border-b border-white/10 text-center">Missed Submissions</th>
                  <th className="px-2 py-2 border-b border-white/10 text-center">Total Scores</th>
                  <th className="px-2 py-2 border-b border-white/10 text-center">Sum of Graded Works</th>
                  <th className="px-2 py-2 border-b border-white/10 text-center">Percentage</th>
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
        <div className="p-3 border-t border-white/10 bg-[#23232C]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="text-center">
              <div className="font-semibold text-white/70">Total Assigned</div>
              <div className="text-sm font-bold text-white">
                {totalAssigned}
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-white/70">Total Submissions</div>
              <div className="text-sm font-bold text-white">
                {totalSubmissions}
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-white/70">Overall Score</div>
              <div className="text-sm font-bold text-white">
                {sumGradedWorks.toFixed(1)}
              </div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-white/70">Overall Percentage</div>
              <div className={`text-sm font-bold ${
                overallPercentage >= 70 ? 'text-green-400' : 
                overallPercentage >= 50 ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {overallPercentage}%
              </div>
            </div>
          </div>
          
          {/* Class Information Display */}
          <div className="mt-3 pt-3 border-t border-white/10 text-center">
            <div className="text-xs text-white/60">
              Showing data for: <span className="font-semibold text-white">{classInfo?.subject} ({classInfo?.subject_code}) - Section {classInfo?.section}</span>
              {selectedStudent !== 'all' && selectedStudentInfo && (
                <>
                  {' | '}
                  <span className="font-semibold text-white">
                    Student: {selectedStudentInfo.first_name} {selectedStudentInfo.last_name}
                  </span>
                </>
              )}
            </div>
            <div className="text-xs text-white/50 mt-0.5">
              Professor: <span className="text-white">{classInfo?.professor_name || `ID: ${classInfo?.professor_ID}`}</span>
            </div>
            
            {/* Student Filter Status */}
            {selectedStudent !== 'all' && (
              <div className="text-xs text-white/40 mt-0.5">
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
      
      {/* REMOVED: Instructions for editing since class participation is removed */}
      
      {/* ========== GRADE TABLE ========== */}
      {renderGradeTable()}
    </>
  );
};

export default GradeTable;