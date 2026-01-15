import React, { useState, useEffect } from 'react';
import DeadlineIcon from '../../assets/Deadline.svg';
import GradeIcon from '../../assets/Points.svg';
import DocumentIcon from '../../assets/Photo.svg';

export default function CalendarDetails({ 
  selectedDate, 
  selectedDayActivities, 
  isCalendarOpen, 
  setIsCalendarOpen,
  getActivityTypeColor,
  // Add these new props for navigation:
  currentMonth,
  currentYear,
  setCurrentMonth,
  setCurrentYear,
  generateCalendarData,
  userId,
  isDarkMode = false
}) {
  const [localDarkMode, setLocalDarkMode] = useState(isDarkMode);

  useEffect(() => {
    setLocalDarkMode(isDarkMode);
  }, [isDarkMode]);

  if (!isCalendarOpen || !selectedDate) return null;

  // Check attendance status
  const isAbsent = selectedDate.status === 'absent';
  const isLate = selectedDate.status === 'late';
  const isPresent = selectedDate.status === 'present';
  const isNoClass = selectedDate.status === 'none';

  // Helper function to format the date nicely
  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Format date for activity cards
  const formatDate = (dateString) => {
    if (!dateString || dateString === "No deadline") return "No deadline";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        timeZone: 'UTC',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Check if deadline is urgent
  const isDeadlineUrgent = (deadline) => {
    if (!deadline || deadline === "No deadline") return false;
    try {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const timeDiff = deadlineDate.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      return hoursDiff <= 24 && hoursDiff > 0;
    } catch {
      return false;
    }
  };

  // Check if deadline passed
  const isDeadlinePassed = (deadline) => {
    if (!deadline || deadline === "No deadline") return false;
    try {
      const deadlineDate = new Date(deadline);
      const now = new Date();
      return deadlineDate.getTime() < now.getTime();
    } catch {
      return false;
    }
  };

  // Get student status for an activity
  const getStudentStatus = (activity) => {
    const now = new Date();
    const deadlineDate = new Date(activity.deadline);
    
    if (activity.deadline && activity.deadline !== "No deadline") {
      if (deadlineDate.getTime() < now.getTime()) {
        return { 
          status: "Missed", 
          color: localDarkMode ? "bg-[#A15353]/20 text-[#A15353]" : "bg-[#A15353]/10 text-[#A15353]", 
          type: "missed" 
        };
      }
    }
    
    return { 
      status: "Active", 
      color: localDarkMode ? "bg-[#767EE0]/20 text-[#767EE0]" : "bg-[#767EE0]/10 text-[#767EE0]", 
      type: "active" 
    };
  };

  // Check if has professor submission
  const hasProfessorSubmission = activity => 
    activity.professor_file_count > 0 || 
    (activity.professor_file_url && activity.professor_file_url !== null);

  // Get card background based on status
  const getCardBackground = (statusType) => {
    if (statusType === 'missed') return localDarkMode ? 'bg-[#A15353]/10' : 'bg-red-50';
    return localDarkMode ? 'bg-[#15151C]' : 'bg-white';
  };

  // Get grading status
  const getGradingStatus = (activity) => {
    const statusInfo = getStudentStatus(activity);
    if (statusInfo.type === 'missed') {
      return {
        text: 'Missed',
        color: localDarkMode ? 'bg-[#A15353]/20 text-[#A15353]' : 'bg-[#A15353]/10 text-[#A15353]'
      };
    }
    
    // Check if submitted
    if (activity.submitted === 1 || activity.submitted === true || activity.submitted === '1') {
      return {
        text: 'Submitted',
        color: localDarkMode ? 'bg-[#00A15D]/20 text-[#00A15D]' : 'bg-[#00A15D]/10 text-[#00A15D]'
      };
    }
    
    return {
      text: 'Not Submitted',
      color: localDarkMode ? 'bg-[#767EE0]/20 text-[#767EE0]' : 'bg-[#767EE0]/10 text-[#767EE0]'
    };
  };

  // Get status color for header
  const getStatusColorForHeader = () => {
    if (isAbsent) return 'bg-[#A15353]';
    if (isLate) return 'bg-[#FFA600]';
    if (isPresent) return 'bg-[#00A15D]';
    if (isNoClass) return 'bg-[#767EE0]';
    return 'bg-[#767EE0]';
  };

  // Get status text for header
  const getStatusTextForHeader = () => {
    if (isAbsent) return 'Absent';
    if (isLate) return 'Late';
    if (isPresent) return 'Present';
    if (isNoClass) return 'No Classes';
    return 'Unknown';
  };

  // Get status description
  const getStatusDescription = () => {
    if (isAbsent) return 'You were absent on this day';
    if (isLate) return 'You were late for some classes';
    if (isPresent) return 'You attended all classes';
    if (isNoClass) return 'No classes were scheduled for this day';
    return 'No attendance data available';
  };

  // Get status icon
  const getStatusIcon = () => {
    if (isAbsent) {
      return (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      );
    }
    if (isLate) {
      return (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      );
    }
    if (isPresent) {
      return (
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
    </svg>
    );
  };

  // Add these functions for month navigation in the modal
  const handlePreviousMonth = () => {
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear = currentYear - 1;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    
    if (userId) {
      generateCalendarData(userId);
    }
  };

  const handleNextMonth = () => {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear = currentYear + 1;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    
    if (userId) {
      generateCalendarData(userId);
    }
  };

  // Function to get month name from month number
  const getMonthNameFromNumber = (month) => {
    const date = new Date(currentYear, month, 1);
    return date.toLocaleDateString('en-US', { month: 'long' });
  };

  // Theme-based colors
  const getBackgroundColor = () => {
    return localDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getHeaderBackgroundColor = () => {
    return localDarkMode ? "bg-[#23232C]" : "bg-gray-50";
  };

  const getBorderColor = () => {
    return localDarkMode ? "border-white/10" : "border-gray-200";
  };

  const getTextColor = () => {
    return localDarkMode ? "text-white" : "text-gray-900";
  };

  const getSecondaryTextColor = () => {
    return localDarkMode ? "text-white/60" : "text-gray-600";
  };

  const getModalBorderColor = () => {
    if (isAbsent) return localDarkMode ? 'border-[#A15353]/30' : 'border-red-300';
    if (isLate) return localDarkMode ? 'border-[#FFA600]/30' : 'border-amber-300';
    if (isPresent) return localDarkMode ? 'border-[#00A15D]/30' : 'border-green-300';
    return localDarkMode ? 'border-white/10' : 'border-gray-200';
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className={`${getBackgroundColor()} rounded-lg shadow-xl border max-w-sm w-full overflow-hidden max-h-[85vh] ${getModalBorderColor()}`}>
        {/* Header - Updated with navigation */}
        <div className={`relative p-3 ${getHeaderBackgroundColor()} border-b ${getBorderColor()}`}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${getStatusColorForHeader()}`}></div>
              <div>
                <h3 className={`font-bold text-sm ${getTextColor()}`}>
                  Daily Activities
                </h3>
                <p className={`text-xs ${getSecondaryTextColor()} mt-0.5 ${
                  isAbsent ? (localDarkMode ? 'text-[#A15353]/70' : 'text-red-600') : 
                  isLate ? (localDarkMode ? 'text-[#FFA600]/70' : 'text-amber-600') : 
                  isPresent ? (localDarkMode ? 'text-[#00A15D]/70' : 'text-green-600') : 
                  getSecondaryTextColor()
                }`}>
                  {formatDisplayDate(selectedDate.date)}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsCalendarOpen(false)}
              className={`${localDarkMode ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} text-xs p-1 rounded transition-colors`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Month Navigation in Modal */}
          <div className={`flex items-center justify-between mb-2 ${localDarkMode ? 'bg-[#15151C]' : 'bg-gray-100'} rounded-lg p-1 border ${getBorderColor()}`}>
            <button
              onClick={handlePreviousMonth}
              className={`${localDarkMode ? 'text-white/70 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'} p-1 rounded transition-colors`}
              title="Previous month"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-center">
              <h4 className={`text-sm font-semibold ${getTextColor()}`}>
                {getMonthNameFromNumber(currentMonth)} {currentYear}
              </h4>
            </div>
            
            <button
              onClick={handleNextMonth}
              className={`${localDarkMode ? 'text-white/70 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'} p-1 rounded transition-colors`}
              title="Next month"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Status Badge */}
          <div className={`px-2 py-1.5 text-xs font-medium rounded border flex items-center gap-1.5 ${
            isAbsent 
              ? localDarkMode 
                ? 'bg-[#A15353]/20 text-[#A15353] border-[#A15353]/30' 
                : 'bg-red-50 text-red-700 border-red-200' : 
            isLate 
              ? localDarkMode
                ? 'bg-[#FFA600]/20 text-[#FFA600] border-[#FFA600]/30'
                : 'bg-amber-50 text-amber-700 border-amber-200' : 
            isPresent 
              ? localDarkMode
                ? 'bg-[#00A15D]/20 text-[#00A15D] border-[#00A15D]/30'
                : 'bg-green-50 text-green-700 border-green-200' : 
              localDarkMode
                ? 'bg-[#767EE0]/20 text-[#767EE0] border-[#767EE0]/30'
                : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            {getStatusIcon()}
            <span>
              {getStatusTextForHeader()} - {getStatusDescription()}
            </span>
          </div>
        </div>

        {/* Activities Section */}
        <div className="p-3">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className={`text-sm font-semibold ${getTextColor()}`}>
                Activities Posted
              </h4>
              <span className={`text-xs px-2 py-1 rounded ${
                isAbsent 
                  ? localDarkMode
                    ? 'text-[#A15353] bg-[#A15353]/10' 
                    : 'text-red-600 bg-red-50' : 
                isLate
                  ? localDarkMode
                    ? 'text-[#FFA600] bg-[#FFA600]/10'
                    : 'text-amber-600 bg-amber-50' : 
                isPresent
                  ? localDarkMode
                    ? 'text-[#00A15D] bg-[#00A15D]/10'
                    : 'text-green-600 bg-green-50' : 
                  localDarkMode
                    ? 'text-white/50 bg-white/5'
                    : 'text-gray-500 bg-gray-100'
              }`}>
                {selectedDayActivities.length} {selectedDayActivities.length === 1 ? 'activity' : 'activities'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {selectedDayActivities.length > 0 ? (
                selectedDayActivities.map((activity, index) => {
                  const statusInfo = getStudentStatus(activity);
                  const hasProfessorSub = hasProfessorSubmission(activity);
                  const deadlineColor = isDeadlinePassed(activity.deadline) || isDeadlineUrgent(activity.deadline) 
                    ? 'text-[#A15353]' 
                    : localDarkMode ? 'text-[#FFFFFF]/80' : 'text-gray-700';
                  
                  const gradingStatus = getGradingStatus(activity);
                  
                  // Format task number
                  const taskNumber = activity.task_number || index + 1;

                  return (
                    <div 
                      key={index} 
                      className={`rounded-lg border p-2.5 hover:shadow-sm transition-all ${
                        localDarkMode ? 'border-white/10' : 'border-gray-200'
                      } ${
                        getCardBackground(statusInfo.type)
                      } ${
                        isAbsent ? (localDarkMode ? 'hover:border-[#A15353]/30' : 'hover:border-red-300') : 
                        isLate ? (localDarkMode ? 'hover:border-[#FFA600]/30' : 'hover:border-amber-300') : 
                        isPresent ? (localDarkMode ? 'hover:border-[#00A15D]/30' : 'hover:border-green-300') : 
                        localDarkMode ? 'hover:border-[#767EE0]/30' : 'hover:border-blue-300'
                      }`}
                    >
                      {/* Header with type+number and status */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`px-1.5 py-0.5 ${getActivityTypeColor(activity.activity_type)} text-xs font-medium rounded`}>
                          {activity.activity_type} #{taskNumber}
                        </span>
                        <div className="flex items-center gap-1">
                          {/* Reference Materials Icon with Count */}
                          <div className="flex items-center gap-1 mr-1">
                            {/* FIXED: Changed from invert(0.2) to invert(0.5) for light mode */}
                            <img 
                              src={DocumentIcon} 
                              alt="Reference Materials" 
                              className={`w-3.5 h-3.5 ${hasProfessorSub ? 'opacity-100' : 'opacity-40'}`}
                              style={{ filter: localDarkMode ? 'none' : 'invert(0.5)' }}
                            />
                            <span className={`text-xs font-bold ${
                              hasProfessorSub 
                                ? 'text-[#00A15D]' 
                                : localDarkMode ? 'text-[#767EE0]' : 'text-blue-600'
                            }`}>
                              {hasProfessorSub ? (activity.professor_file_count || 1) : 0}
                            </span>
                          </div>
                          
                          {/* Attendance Status */}
                          {activity.attendance_status && activity.attendance_status !== 'No Data' && (
                            <span className={`px-1 py-0.5 text-xs font-medium rounded ${
                              activity.attendance_status === 'Present' 
                                ? localDarkMode ? 'bg-[#00A15D]/20 text-[#00A15D]' : 'bg-green-50 text-green-700' : 
                              activity.attendance_status === 'Late'
                                ? localDarkMode ? 'bg-[#FFA600]/20 text-[#FFA600]' : 'bg-amber-50 text-amber-700' : 
                              activity.attendance_status === 'Absent'
                                ? localDarkMode ? 'bg-[#A15353]/20 text-[#A15353]' : 'bg-red-50 text-red-700' : 
                                localDarkMode ? 'bg-[#767EE0]/20 text-[#767EE0]' : 'bg-blue-50 text-blue-700'
                            }`}>
                              {activity.attendance_status}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Title - FIXED: Added text color for better visibility */}
                      <h3 className={`font-medium text-xs mb-2.5 truncate ${getTextColor()}`}>
                        {activity.title}
                      </h3>
                      
                      {/* Subject - FIXED: Added text color for better visibility */}
                      {activity.subject && (
                        <p className={`text-xs ${getSecondaryTextColor()} mb-2`}>
                          {activity.subject}
                        </p>
                      )}
                      
                      {/* Submission Status */}
                      {gradingStatus && (
                        <div className="flex items-center gap-1 text-xs mb-2">
                          <span className={`px-1 py-0.5 rounded ${gradingStatus.color}`}>
                            {gradingStatus.text}
                          </span>
                        </div>
                      )}
                      
                      {/* Info Row */}
                      <div className="flex items-center justify-between mb-2">
                        {/* Deadline */}
                        <div className="flex items-center gap-1">
                          {/* FIXED: Changed from invert(0.2) to invert(0.5) for light mode */}
                          <img src={DeadlineIcon} alt="Deadline" className="w-2.5 h-2.5" style={{ filter: localDarkMode ? 'none' : 'invert(0.5)' }} />
                          <span className={`text-xs font-medium ${deadlineColor}`}>
                            {formatDate(activity.deadline)}
                          </span>
                        </div>
                        
                        {/* Points/Grade Status */}
                        <div className="flex items-center gap-1">
                          {/* FIXED: Changed from invert(0.2) to invert(0.5) for light mode */}
                          <img src={GradeIcon} alt="Grade" className="w-2.5 h-2.5" style={{ filter: localDarkMode ? 'none' : 'invert(0.5)' }} />
                          <span className="text-xs font-medium text-[#FFA600]">
                            {activity.points ? `${activity.points} pts` : 'No Grade'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={`text-center py-6 rounded-lg border ${
                  localDarkMode ? 'border-white/5' : 'border-gray-200'
                } ${
                  isAbsent ? (localDarkMode ? 'bg-[#A15353]/5' : 'bg-red-50') : 
                  isLate ? (localDarkMode ? 'bg-[#FFA600]/5' : 'bg-amber-50') : 
                  isPresent ? (localDarkMode ? 'bg-[#00A15D]/5' : 'bg-green-50') : 
                  localDarkMode ? 'bg-[#23232C]' : 'bg-gray-100'
                }`}>
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full mb-2 ${
                    isAbsent ? (localDarkMode ? 'bg-[#A15353]/20' : 'bg-red-100') : 
                    isLate ? (localDarkMode ? 'bg-[#FFA600]/20' : 'bg-amber-100') : 
                    isPresent ? (localDarkMode ? 'bg-[#00A15D]/20' : 'bg-green-100') : 
                    localDarkMode ? 'bg-[#767EE0]/20' : 'bg-blue-100'
                  }`}>
                    <svg className={`w-4 h-4 ${
                      isAbsent ? 'text-[#A15353]' : 
                      isLate ? 'text-[#FFA600]' : 
                      isPresent ? 'text-[#00A15D]' : 
                      localDarkMode ? 'text-[#767EE0]' : 'text-blue-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className={`text-xs font-semibold ${getTextColor()} mb-1`}>
                    No Activities Posted
                  </h4>
                  <p className={`text-xs ${
                    isAbsent ? (localDarkMode ? 'text-[#A15353]/70' : 'text-red-600') : 
                    isLate ? (localDarkMode ? 'text-[#FFA600]/70' : 'text-amber-600') : 
                    isPresent ? (localDarkMode ? 'text-[#00A15D]/70' : 'text-green-600') : 
                    getSecondaryTextColor()
                  }`}>
                    {isNoClass ? 'No classes were scheduled for this day' : 'No activities found for this day'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className={`pt-3 border-t ${getBorderColor()}`}>
            <button
              onClick={() => setIsCalendarOpen(false)}
              className={`w-full text-white px-4 py-2 rounded text-xs font-medium transition-colors border ${
                isAbsent 
                  ? localDarkMode
                    ? 'bg-[#A15353] hover:bg-[#C67171] border-[#A15353]/30'
                    : 'bg-red-600 hover:bg-red-700 border-red-700' : 
                isLate
                  ? localDarkMode
                    ? 'bg-[#FFA600] hover:bg-[#FFB533] border-[#FFA600]/30'
                    : 'bg-amber-600 hover:bg-amber-700 border-amber-700' : 
                isPresent
                  ? localDarkMode
                    ? 'bg-[#00A15D] hover:bg-[#00C274] border-[#00A15D]/30'
                    : 'bg-green-600 hover:bg-green-700 border-green-700' : 
                  localDarkMode
                    ? 'bg-[#767EE0] hover:bg-[#6369d1] border-[#767EE0]/30'
                    : 'bg-blue-600 hover:bg-blue-700 border-blue-700'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}