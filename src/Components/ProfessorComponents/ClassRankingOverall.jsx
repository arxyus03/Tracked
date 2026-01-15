import React, { useState } from 'react';
import RankingIcon from '../../assets/Ranking.svg';
import TrackEdIcon from '../../assets/TrackEd.svg';
import ArrowDown from '../../assets/ArrowDown.svg';
import ArrowUp from '../../assets/ArrowUp.svg';
import EmailIcon from '../../assets/Email.svg';
import ArrowDownLight from '../../assets/ArrowDown.svg';

const ClassRankingOverall = ({ 
  studentPerformance = [], 
  classInfo = {}, 
  subjectCode,
  isDarkMode = false 
}) => {
  const [viewMode, setViewMode] = useState('lowest');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentDetails, setStudentDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activityFilter, setActivityFilter] = useState('All');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  // Get professor ID from localStorage
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

  // Get filtered activities
  const getFilteredActivities = (activities) => {
    if (!activities) return [];
    
    switch (activityFilter) {
      case 'Submitted':
        return activities.filter(activity => activity.status === 'Submitted' || activity.status === 'Completed');
      case 'Missed':
        return activities.filter(activity => activity.status === 'Missed');
      case 'Assigned':
        return activities.filter(activity => activity.status === 'Assigned');
      case 'All':
      default:
        return activities;
    }
  };

  // Get status color class
  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': 
      case 'Completed': 
        return isDarkMode ? 'bg-[#00A15D]/20 text-[#00A15D] border border-[#00A15D]/30' : 'bg-[#00A15D]/10 text-[#00A15D] border border-[#00A15D]/20';
      case 'Late': 
        return isDarkMode ? 'bg-[#FFA600]/20 text-[#FFA600] border border-[#FFA600]/30' : 'bg-[#FFA600]/10 text-[#FFA600] border border-[#FFA600]/20';
      case 'Missed': 
        return isDarkMode ? 'bg-[#A15353]/20 text-[#A15353] border border-[#A15353]/30' : 'bg-[#A15353]/10 text-[#A15353] border border-[#A15353]/20';
      case 'Assigned': 
        return isDarkMode ? 'bg-gray-700 text-gray-300 border border-gray-600' : 'bg-gray-200 text-gray-700 border border-gray-300';
      default: 
        return isDarkMode ? 'bg-gray-700 text-gray-300 border border-gray-600' : 'bg-gray-200 text-gray-700 border border-gray-300';
    }
  };

  // Theme-based colors
  const getCardBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getCardBorderColor = () => {
    return isDarkMode ? "border-white/10" : "border-gray-200";
  };

  const getSectionBackgroundColor = () => {
    return isDarkMode ? "bg-[#0F0F15]" : "bg-gray-50";
  };

  const getSectionBorderColor = () => {
    return isDarkMode ? "border-white/5" : "border-gray-200";
  };

  const getModalBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getModalBorderColor = () => {
    return isDarkMode ? "border-white/10" : "border-gray-200";
  };

  const getTextColor = () => {
    return isDarkMode ? "text-white" : "text-gray-900";
  };

  const getSecondaryTextColor = () => {
    return isDarkMode ? "text-white/60" : "text-gray-600";
  };

  const getHoverBackgroundColor = () => {
    return isDarkMode ? "hover:bg-[#767EE0]/20" : "hover:bg-gray-100";
  };

  const getButtonBackgroundColor = (isSelected) => {
    if (isSelected) {
      return viewMode === 'lowest' ? 'bg-[#A15353]' : 'bg-[#00A15D]';
    }
    return isDarkMode ? 'bg-[#0F0F15]' : 'bg-gray-100';
  };

  const getButtonTextColor = (isSelected) => {
    if (isSelected) return 'text-white';
    return isDarkMode ? 'text-white/60' : 'text-gray-600';
  };

  const getSortedStudents = () => {
    const students = [...studentPerformance];
    if (viewMode === 'lowest') {
      return students.sort((a, b) => a.average - b.average);
    } else {
      return students.sort((a, b) => b.average - a.average);
    }
  };

  const getSummaryStudents = () => {
    const students = [...studentPerformance];
    students.sort((a, b) => b.average - a.average);
    
    if (students.length === 0) return { lowest: [], highest: [] };
    
    const highest = students.slice(0, 3);
    const lowest = students.slice(-3).reverse();
    
    return { lowest, highest };
  };

  const handleStudentClick = (student) => {
    fetchStudentDetails(student.id);
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const fetchStudentDetails = async (studentId) => {
    setLoadingDetails(true);
    try {
      const professorId = getProfessorId();
      const response = await fetch(
        `https://tracked.6minds.site/Professor/SubjectOverviewProfDB/get_student_detailed_info.php?student_id=${studentId}&subject_code=${subjectCode}&professor_ID=${professorId}`
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStudentDetails(prev => ({ ...prev, [studentId]: result.details }));
        }
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
    setActivityFilter('All');
    setFilterDropdownOpen(false);
  };

  const getRecommendations = (student) => {
    const recommendations = [];
    const actions = { email: false, remedial: false, extendDeadline: false, materials: false };

    if (!selectedStudent || !studentDetails[selectedStudent.id]) {
      return { recommendations, actions };
    }

    const details = studentDetails[selectedStudent.id];
    const activityStats = details.activity_stats || {};

    if (details.attendance.absences > 3) {
      recommendations.push("Multiple absences detected. Consider scheduling a consultation.");
      actions.email = true;
    }

    if (activityStats.missed > 3) {
      recommendations.push("Several activities missed. May benefit from remedial activities.");
      actions.remedial = true;
      actions.extendDeadline = true;
    }

    const attendanceRate = details.attendance.rate;
    if (attendanceRate < 75) {
      recommendations.push(`Low attendance rate (${attendanceRate}%). Consider intervention.`);
      actions.email = true;
    }

    if (student.average >= 90) {
      recommendations.push("Excellent performance. Consider peer mentoring opportunities.");
    }

    return { recommendations, actions };
  };

  const handleEmailClick = (student) => {
    const subject = `Regarding your performance in ${classInfo?.subject || 'the class'}`;
    const body = `Dear ${student.name},\\n\\nI would like to discuss your performance in ${classInfo?.subject || 'the class'}. Please schedule a meeting.\\n\\nBest regards,\\n[Your Name]`;
    window.open(`mailto:${student.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleRemedialClick = (student) => {
    alert(`Remedial activities assigned for ${student.name} in ${classInfo?.subject || 'the class'}`);
  };

  const handleExtendDeadlineClick = (student) => {
    alert(`Deadlines extended for ${student.name} in ${classInfo?.subject || 'the class'}`);
  };

  const handleMaterialsClick = (student) => {
    alert(`Review materials sent to ${student.name} for ${classInfo?.subject || 'the class'}`);
  };

  const sortedStudents = getSortedStudents();
  const summary = getSummaryStudents();

  return (
    <>
      <div className={`rounded-lg shadow-lg p-3 mb-4 overflow-hidden border ${getCardBorderColor()} ${getCardBackgroundColor()}`}>
        {/* Header with title and toggle buttons */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className={`flex justify-center items-center h-5 w-5 rounded-lg mr-2 ${isDarkMode ? 'bg-[#0F0F15]' : 'bg-gray-100'}`}>
              <img src={RankingIcon} alt="Ranking" className="h-3.5 w-3.5" style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }} />
            </div>
            <div>
              <h2 className={`font-bold text-sm ${getTextColor()}`}>Class Ranking</h2>
              <p className={`text-xs ${getSecondaryTextColor()}`}>{classInfo?.subject} • {classInfo?.section}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              className={`p-1 rounded-lg ${getHoverBackgroundColor()} transition-colors`}
            >
              <img src={isCollapsed ? ArrowDown : ArrowUp} alt="Toggle" className="h-4 w-4" style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }} />
            </button>
            
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setViewMode('lowest')} 
                className={`px-2 py-1 text-[10px] rounded-lg transition-all duration-200 font-medium ${
                  viewMode === 'lowest' 
                    ? 'bg-[#A15353] text-white shadow-md' 
                    : `${getButtonBackgroundColor(false)} ${getButtonTextColor(false)} hover:${isDarkMode ? 'bg-[#767EE0]/20' : 'bg-gray-200'} hover:text-white`
                }`}
              >
                Lowest
              </button>
              <button 
                onClick={() => setViewMode('highest')} 
                className={`px-2 py-1 text-[10px] rounded-lg transition-all duration-200 font-medium ${
                  viewMode === 'highest' 
                    ? 'bg-[#00A15D] text-white shadow-md' 
                    : `${getButtonBackgroundColor(false)} ${getButtonTextColor(false)} hover:${isDarkMode ? 'bg-[#767EE0]/20' : 'bg-gray-200'} hover:text-white`
                }`}
              >
                Highest
              </button>
            </div>
          </div>
        </div>

        {/* Default Collapsed View - Summary */}
        {isCollapsed ? (
          <div className="space-y-2">
            {/* Highest Performers Summary */}
            <div className={`rounded-lg border p-2 ${getSectionBackgroundColor()} ${getSectionBorderColor()}`}>
              <div className="flex items-center justify-between mb-1">
                <h3 className={`text-xs font-semibold ${getTextColor()}`}>Top 3 Performers</h3>
                <div className={`flex items-center text-[10px] ${getSecondaryTextColor()}`}>
                  <div className="h-2 w-2 rounded-full bg-[#00A15D] mr-1"></div>
                  Highest
                </div>
              </div>
              {summary.highest.length === 0 ? (
                <p className={`text-xs text-center py-1 ${getSecondaryTextColor()}`}>No data available</p>
              ) : (
                <div className="space-y-1">
                  {summary.highest.map((student, index) => (
                    <div key={student.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-[#00A15D]/20 text-[#00A15D] border border-[#00A15D]/30 flex items-center justify-center text-[8px] font-bold mr-2">
                          {index + 1}
                        </div>
                        <span className={`text-xs truncate max-w-[100px] ${getTextColor()}`}>{student.name}</span>
                      </div>
                      <span className="text-xs font-bold text-[#00A15D]">{student.average.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lowest Performers Summary */}
            <div className={`rounded-lg border p-2 ${getSectionBackgroundColor()} ${getSectionBorderColor()}`}>
              <div className="flex items-center justify-between mb-1">
                <h3 className={`text-xs font-semibold ${getTextColor()}`}>Lowest 3 Performers</h3>
                <div className={`flex items-center text-[10px] ${getSecondaryTextColor()}`}>
                  <div className="h-2 w-2 rounded-full bg-[#A15353] mr-1"></div>
                  Lowest
                </div>
              </div>
              {summary.lowest.length === 0 ? (
                <p className={`text-xs text-center py-1 ${getSecondaryTextColor()}`}>No data available</p>
              ) : (
                <div className="space-y-1">
                  {summary.lowest.map((student, index) => (
                    <div key={student.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded-full bg-[#A15353]/20 text-[#A15353] border border-[#A15353]/30 flex items-center justify-center text-[8px] font-bold mr-2">
                          {studentPerformance.length - summary.lowest.length + index + 1}
                        </div>
                        <span className={`text-xs truncate max-w-[100px] ${getTextColor()}`}>{student.name}</span>
                      </div>
                      <span className="text-xs font-bold text-[#A15353]">{student.average.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Expanded View - Full List */
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5 overflow-x-hidden">
            {sortedStudents.length === 0 ? (
              <div className={`text-center py-3 rounded-lg border ${getSectionBackgroundColor()} ${getSectionBorderColor()}`}>
                <div className={isDarkMode ? 'text-[#767EE0]/40' : 'text-gray-400'}>
                  <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className={`text-xs mt-1 ${getSecondaryTextColor()}`}>No students found</p>
              </div>
            ) : (
              sortedStudents.map((student, index) => (
                <button 
                  key={student.id} 
                  onClick={() => handleStudentClick(student)} 
                  className={`w-full rounded-lg border p-2 hover:border-[#00A15D] hover:shadow-md hover:shadow-[#00A15D]/10 transition-all duration-200 text-left group ${getSectionBackgroundColor()} ${getSectionBorderColor()}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mr-2 flex-shrink-0 ${
                        viewMode === 'lowest'
                          ? student.average < 60 ? 'bg-[#A15353]/20 text-[#A15353] border border-[#A15353]/30' :
                            student.average < 75 ? 'bg-[#FFA600]/20 text-[#FFA600] border border-[#FFA600]/30' :
                            'bg-[#00A15D]/20 text-[#00A15D] border border-[#00A15D]/30'
                          : student.average >= 90 ? 'bg-[#00A15D]/20 text-[#00A15D] border border-[#00A15D]/30' :
                            student.average >= 75 ? 'bg-[#FFA600]/20 text-[#FFA600] border border-[#FFA600]/30' :
                            'bg-[#A15353]/20 text-[#A15353] border border-[#A15353]/30'
                      }`}>
                        {viewMode === 'lowest' ? index + 1 : studentPerformance.length - index}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col items-start">
                            <p className={`text-xs font-semibold truncate ${getTextColor()}`}>{student.name}</p>
                            <p className={`text-[10px] truncate ${getSecondaryTextColor()}`}>
                              {student.status === 'excellent' ? 'Excellent' :
                               student.status === 'good' ? 'Good' :
                               student.status === 'needs-improvement' ? 'Needs Improvement' : 'At Risk'}
                            </p>
                          </div>
                          <p className={`text-xs font-bold ml-2 flex-shrink-0 ${
                            student.average >= 90 ? 'text-[#00A15D]' :
                            student.average >= 75 ? 'text-[#FFA600]' :
                            'text-[#A15353]'
                          }`}>
                            {student.average.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Performance Details Modal */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-hidden">
          <div className={`rounded-xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden border ${getModalBorderColor()} ${getModalBackgroundColor()}`}>
            {/* Modal Header */}
            <div className={`p-4 border-b ${getModalBorderColor()}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${
                    viewMode === 'lowest'
                      ? selectedStudent.average < 60 ? 'bg-[#A15353]/20 text-[#A15353] border border-[#A15353]/30' :
                        selectedStudent.average < 75 ? 'bg-[#FFA600]/20 text-[#FFA600] border border-[#FFA600]/30' :
                        'bg-[#00A15D]/20 text-[#00A15D] border border-[#00A15D]/30'
                      : selectedStudent.average >= 90 ? 'bg-[#00A15D]/20 text-[#00A15D] border border-[#00A15D]/30' :
                        selectedStudent.average >= 75 ? 'bg-[#FFA600]/20 text-[#FFA600] border border-[#FFA600]/30' :
                        'bg-[#A15353]/20 text-[#A15353] border border-[#A15353]/30'
                  }`}>
                    {sortedStudents.findIndex(s => s.id === selectedStudent.id) + 1}
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm ${getTextColor()}`}>{selectedStudent.name}</h3>
                    <p className={`text-xs ${getSecondaryTextColor()}`}>{selectedStudent.email}</p>
                  </div>
                </div>
                <button onClick={closeModal} className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-[#767EE0]/20' : 'hover:bg-gray-200'} transition-colors`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-2">
                <p className={`text-xs ${getSecondaryTextColor()}`}>{classInfo?.subject} • {classInfo?.section}</p>
                <div className="flex items-baseline mt-1">
                  <p className={`text-xl font-bold ${
                    selectedStudent.average >= 90 ? 'text-[#00A15D]' :
                    selectedStudent.average >= 75 ? 'text-[#FFA600]' :
                    'text-[#A15353]'
                  }`}>
                    {selectedStudent.average.toFixed(1)}%
                  </p>
                  <p className={`text-xs ml-2 ${getSecondaryTextColor()}`}>Overall Performance</p>
                </div>
              </div>
            </div>

            {loadingDetails || !studentDetails[selectedStudent.id] ? (
              <div className="p-8 text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00A15D] border-r-transparent"></div>
                <p className={`mt-3 text-sm ${getSecondaryTextColor()}`}>Loading student details...</p>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row h-[calc(85vh-140px)]">
                {/* Left Column - Statistics */}
                <div className={`lg:w-1/2 p-4 border-r ${getModalBorderColor()} overflow-y-auto`}>
                  <div className="space-y-4">
                    {/* Attendance Section */}
                    <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-[#23232C] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="mb-3">
                        <h4 className={`text-sm font-semibold ${getTextColor()}`}>Attendance</h4>
                        <p className={`text-xs ${getSecondaryTextColor()}`}>
                          Rate: {studentDetails[selectedStudent.id].attendance.rate}%
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Absences', value: studentDetails[selectedStudent.id].attendance.absences, color: 'text-[#A15353]' },
                          { label: 'Lates', value: studentDetails[selectedStudent.id].attendance.lates, color: 'text-[#FFA600]' },
                          { label: 'Present', value: studentDetails[selectedStudent.id].attendance.present, color: 'text-[#00A15D]' }
                        ].map((item, idx) => (
                          <div key={idx} className={`text-center p-3 rounded-lg ${isDarkMode ? 'bg-[#15151C]' : 'bg-white'}`}>
                            <p className={`text-xs mb-1 ${getSecondaryTextColor()}`}>{item.label}</p>
                            <p className={`text-base font-bold ${item.color}`}>
                              {item.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Activity Summary */}
                    <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-[#23232C] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                      <h4 className={`text-sm font-semibold mb-3 ${getTextColor()}`}>Activity Summary</h4>
                      {(() => {
                        const activityStats = studentDetails[selectedStudent.id].activity_stats || {};
                        return (
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { label: 'Total', value: activityStats.total || 0, color: isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-800' },
                              { label: 'Submitted', value: activityStats.submitted || 0, color: isDarkMode ? 'bg-[#00A15D]/20 text-[#00A15D]' : 'bg-[#00A15D]/10 text-[#00A15D]' },
                              { label: 'Missed', value: activityStats.missed || 0, color: isDarkMode ? 'bg-[#A15353]/20 text-[#A15353]' : 'bg-[#A15353]/10 text-[#A15353]' },
                              { label: 'Assigned', value: activityStats.assigned || 0, color: isDarkMode ? 'bg-[#FFA600]/20 text-[#FFA600]' : 'bg-[#FFA600]/10 text-[#FFA600]' }
                            ].map((item, idx) => (
                              <div key={idx} className={`text-center p-2 rounded-lg ${item.color} border ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                                <p className="text-xs font-medium mb-0.5">{item.label}</p>
                                <p className="text-base font-bold">{item.value}</p>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Performance Breakdown */}
                    <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-[#23232C] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                      <h4 className={`text-sm font-semibold mb-3 ${getTextColor()}`}>Performance Breakdown</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className={getSecondaryTextColor()}>Academic Performance</span>
                            <span className="font-medium">{studentDetails[selectedStudent.id].academic_percentage}%</span>
                          </div>
                          <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                            <div 
                              className="bg-[#767EE0] h-2 rounded-full" 
                              style={{ width: `${studentDetails[selectedStudent.id].academic_percentage}%` }}
                            ></div>
                          </div>
                          <p className={`text-xs mt-1 ${getSecondaryTextColor()}`}>(75% weight)</p>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className={getSecondaryTextColor()}>Attendance Performance</span>
                            <span className="font-medium">{studentDetails[selectedStudent.id].attendance.rate}%</span>
                          </div>
                          <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                            <div 
                              className="bg-[#00A15D] h-2 rounded-full" 
                              style={{ width: `${studentDetails[selectedStudent.id].attendance.rate}%` }}
                            ></div>
                          </div>
                          <p className={`text-xs mt-1 ${getSecondaryTextColor()}`}>(25% weight)</p>
                        </div>
                      </div>
                    </div>

                    {/* System Recommendation */}
                    <div className={`rounded-lg border p-4 ${isDarkMode ? 'bg-gradient-to-r from-[#23232C] to-[#15151C]' : 'bg-gradient-to-r from-gray-50 to-white'} ${isDarkMode ? 'border-white/5' : 'border-gray-200'}`}>
                      <div className="flex items-start mb-3">
                        <img src={TrackEdIcon} alt="TrackEd Recommendation" className="h-5 w-5 mr-2 opacity-80 flex-shrink-0" style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }} />
                        <div className="flex-1">
                          <h4 className={`text-xs font-semibold mb-2 ${getTextColor()}`}>System Recommendation</h4>
                          <div className="space-y-2">
                            {(() => {
                              const { recommendations, actions } = getRecommendations(selectedStudent);
                              return (
                                <>
                                  {recommendations.length > 0 ? (
                                    recommendations.map((rec, index) => (
                                      <p key={index} className={`text-xs leading-relaxed ${getSecondaryTextColor()}`}>{rec}</p>
                                    ))
                                  ) : (
                                    <p className={`text-xs leading-relaxed ${getSecondaryTextColor()}`}>Student is performing within expected parameters. No immediate action required.</p>
                                  )}
                                  
                                  {Object.values(actions).some(value => value) && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                      {actions.email && (
                                        <button onClick={() => handleEmailClick(selectedStudent)} className="px-3 py-1.5 text-xs bg-[#767EE0] text-white rounded-lg hover:bg-[#6670D0] transition-all duration-200 font-medium flex items-center">
                                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                          </svg>
                                          Contact Student
                                        </button>
                                      )}
                                      
                                      {actions.remedial && (
                                        <button onClick={() => handleRemedialClick(selectedStudent)} className="px-3 py-1.5 text-xs bg-[#FFA600] text-white rounded-lg hover:bg-[#E69500] transition-all duration-200 font-medium flex items-center">
                                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          Assign Remedial
                                        </button>
                                      )}
                                      
                                      {actions.extendDeadline && (
                                        <button onClick={() => handleExtendDeadlineClick(selectedStudent)} className="px-3 py-1.5 text-xs bg-[#00A15D] text-white rounded-lg hover:bg-[#008F4F] transition-all duration-200 font-medium flex items-center">
                                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          Extend Deadline
                                        </button>
                                      )}
                                      
                                      {actions.materials && (
                                        <button onClick={() => handleMaterialsClick(selectedStudent)} className="px-3 py-1.5 text-xs bg-[#A15353] text-white rounded-lg hover:bg-[#8A4242] transition-all duration-200 font-medium flex items-center">
                                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                          </svg>
                                          Send Materials
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Activities List */}
                <div className="lg:w-1/2 p-4 overflow-y-auto">
                  <div className="flex flex-col h-full">
                    {/* Activities Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-semibold truncate ${getTextColor()}`}>
                          {selectedStudent.name}'s Activities
                        </h3>
                        <p className={`text-xs mt-0.5 truncate ${getSecondaryTextColor()}`}>
                          {selectedStudent.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Activity Filter Dropdown */}
                        <div className="relative">
                          <button
                            onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                            className={`flex items-center justify-between font-medium px-3 py-1.5 rounded-md border transition-all duration-200 text-xs cursor-pointer min-w-[80px] ${
                              isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600 text-white' : 'bg-gray-100 border-gray-300 hover:border-gray-400 text-gray-700'
                            }`}
                          >
                            <span>{activityFilter}</span>
                            <img
                              src={ArrowDownLight}
                              alt=""
                              className={`ml-1.5 h-3 w-3 transition-transform ${filterDropdownOpen ? 'rotate-180' : ''}`}
                              style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
                            />
                          </button>

                          {filterDropdownOpen && (
                            <div className={`absolute top-full mt-1 right-0 rounded-md shadow-lg border z-10 overflow-hidden min-w-[110px] ${
                              isDarkMode ? 'bg-[#15151C] border-gray-700' : 'bg-white border-gray-200'
                            }`}>
                              {["All", "Submitted", "Missed", "Assigned"].map((option) => (
                                <button
                                  key={option}
                                  className={`block w-full text-left px-3 py-2 text-xs hover:transition-colors cursor-pointer ${
                                    activityFilter === option ? (isDarkMode ? 'bg-gray-800 font-semibold' : 'bg-gray-100 font-semibold') : ''
                                  } ${isDarkMode ? 'text-white hover:bg-gray-800' : 'text-gray-900 hover:bg-gray-100'}`}
                                  onClick={() => {
                                    setActivityFilter(option);
                                    setFilterDropdownOpen(false);
                                  }}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <button
                          onClick={() => handleEmailClick(selectedStudent)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border transition-colors cursor-pointer text-xs ${
                            isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700 text-white' : 'bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          <img src={EmailIcon} alt="Email" className="w-3.5 h-3.5" style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }} />
                          <span>Email</span>
                        </button>
                      </div>
                    </div>

                    {/* Activity Count */}
                    <div className="mb-3">
                      <p className={`text-xs ${getSecondaryTextColor()}`}>
                        Showing {getFilteredActivities(studentDetails[selectedStudent.id].activities).length} of {studentDetails[selectedStudent.id].activities.length} activities
                      </p>
                    </div>

                    {/* Activities List */}
                    <div className="flex-1 overflow-y-auto">
                      {getFilteredActivities(studentDetails[selectedStudent.id].activities).length > 0 ? (
                        <div className="space-y-3">
                          {getFilteredActivities(studentDetails[selectedStudent.id].activities).map((activity) => (
                            <div key={activity.id} className={`border rounded-lg p-3 transition-colors ${
                              isDarkMode ? 'border-gray-700 hover:bg-gray-800/50' : 'border-gray-200 hover:bg-gray-50'
                            }`}>
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className={`font-medium text-sm break-words ${getTextColor()}`}>
                                    {activity.title}
                                  </h4>
                                  <div className={`flex flex-wrap items-center gap-1.5 mt-1 text-xs ${getSecondaryTextColor()}`}>
                                    <span>Due: {formatDate(activity.dueDate)}</span>
                                    <span>•</span>
                                    <span>{activity.type}</span>
                                    <span>•</span>
                                    <span className={`font-medium ${
                                      activity.grade === 'Not graded' ? (isDarkMode ? 'text-gray-400' : 'text-gray-500') : 'text-[#00A15D]'
                                    }`}>
                                      {activity.grade}
                                    </span>
                                  </div>
                                  {activity.maxPoints > 0 && (
                                    <div className={`mt-1 text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                      Max points: {activity.maxPoints}
                                    </div>
                                  )}
                                </div>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getStatusColor(activity.status)} flex-shrink-0 self-start sm:self-auto mt-1 sm:mt-0`}>
                                  {activity.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={`h-full flex flex-col items-center justify-center text-center px-3 text-sm ${
                          isDarkMode ? 'text-white/60' : 'text-gray-500'
                        }`}>
                          <div className={`mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p>
                            {activityFilter === "All" 
                              ? "No activities found." 
                              : activityFilter === "Submitted"
                              ? "No submitted activities found."
                              : activityFilter === "Assigned"
                              ? "No assigned activities found."
                              : "No missed activities found."
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className={`p-4 border-t ${getModalBorderColor()}`}>
              <button onClick={closeModal} className="w-full px-3 py-2 text-sm bg-[#767EE0] text-white rounded-lg hover:bg-[#6670D0] transition-all duration-200 font-medium">
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "No date";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  } catch {
    return dateString;
  }
};

export default ClassRankingOverall;