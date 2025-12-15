import React from 'react';
import DeadlineIcon from '../../assets/Deadline.svg';
import GradeIcon from '../../assets/Points.svg';
import DocumentIcon from '../../assets/Photo.svg';

export default function CalendarDetails({ 
  selectedDate, 
  selectedDayActivities, 
  isCalendarOpen, 
  setIsCalendarOpen,
  getActivityTypeColor
}) {
  if (!isCalendarOpen || !selectedDate) return null;

  // Check if student is absent
  const isAbsent = selectedDate.status === 'absent';

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
    } catch (error) {
      return dateString;
    }
  };

  // Format date for activity cards (similar to StudentActivityCard)
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

  // Get student status for an activity (simplified for calendar)
  const getStudentStatus = (activity) => {
    // For calendar activities, we don't have submission data
    // So we'll base it on deadline
    const now = new Date();
    const deadlineDate = new Date(activity.deadline);
    
    if (activity.deadline && activity.deadline !== "No deadline") {
      if (deadlineDate.getTime() < now.getTime()) {
        return { 
          status: "Missed", 
          color: "bg-[#A15353]/20 text-[#A15353]", 
          type: "missed" 
        };
      }
    }
    
    return { 
      status: "Active", 
      color: "bg-[#767EE0]/20 text-[#767EE0]", 
      type: "active" 
    };
  };

  // Check if has professor submission (simplified)
  const hasProfessorSubmission = activity => 
    activity.professor_file_count > 0 || 
    (activity.professor_file_url && activity.professor_file_url !== null);

  // Get card background based on status
  const getCardBackground = (statusType) => {
    if (statusType === 'missed') return 'bg-[#A15353]/10';
    return 'bg-[#15151C]';
  };

  // Get grading status (simplified for calendar)
  const getGradingStatus = (activity) => {
    // For calendar, we don't have grade info, so show based on status
    const statusInfo = getStudentStatus(activity);
    if (statusInfo.type === 'missed') {
      return {
        text: 'Missed',
        color: 'bg-[#A15353]/20 text-[#A15353]'
      };
    }
    return {
      text: 'Not Submitted',
      color: 'bg-[#767EE0]/20 text-[#767EE0]'
    };
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className={`bg-[#15151C] rounded-lg shadow-xl border border-white/10 max-w-sm w-full overflow-hidden max-h-[85vh] ${
        isAbsent ? 'border-[#A15353]/30' : ''
      }`}>
        {/* Header - Solid color instead of gradient */}
        <div className="relative p-3 bg-[#23232C] border-b border-white/5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                isAbsent ? 'bg-[#A15353]' : 'bg-[#767EE0]'
              }`}></div>
              <div>
                <h3 className="font-bold text-sm text-white">
                  Daily Activities
                </h3>
                <p className={`text-xs text-white/60 mt-0.5 ${
                  isAbsent ? 'text-[#A15353]/70' : ''
                }`}>
                  {formatDisplayDate(selectedDate.date)}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsCalendarOpen(false)}
              className="text-white/40 hover:text-white text-xs p-1 hover:bg-white/5 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Absent Badge */}
          {isAbsent && (
            <div className="mt-2 px-2 py-1.5 bg-[#A15353]/20 text-[#A15353] text-xs font-medium rounded border border-[#A15353]/30 flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>You were absent on this day</span>
            </div>
          )}
        </div>

        {/* Activities Section */}
        <div className="p-3">
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-white">
                Activities Posted
              </h4>
              <span className={`text-xs px-2 py-1 rounded ${
                isAbsent 
                  ? 'text-[#A15353] bg-[#A15353]/10' 
                  : 'text-white/50 bg-white/5'
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
                    : 'text-[#FFFFFF]/80';
                  
                  const gradingStatus = getGradingStatus(activity);
                  
                  // Format task number (if not available, use index + 1)
                  const taskNumber = activity.task_number || index + 1;

                  return (
                    <div 
                      key={index} 
                      className={`rounded-lg border border-[#FFFFFF]/10 p-2.5 hover:shadow-sm transition-all ${
                        getCardBackground(statusInfo.type)
                      } ${isAbsent ? 'hover:border-[#A15353]/30' : 'hover:border-[#00A15D]/30'}`}
                    >
                      {/* Header with type+number and status - EXACTLY LIKE StudentActivityCard */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`px-1.5 py-0.5 ${getActivityTypeColor(activity.activity_type)} text-xs font-medium rounded`}>
                          {activity.activity_type} #{taskNumber}
                        </span>
                        <div className="flex items-center gap-1">
                          {/* Reference Materials Icon with Count */}
                          <div className="flex items-center gap-1 mr-1">
                            <img 
                              src={DocumentIcon} 
                              alt="Reference Materials" 
                              className={`w-3.5 h-3.5 ${hasProfessorSub ? 'opacity-100' : 'opacity-40'}`}
                            />
                            <span className={`text-xs font-bold ${
                              hasProfessorSub 
                                ? 'text-[#00A15D]' 
                                : 'text-[#767EE0]'
                            }`}>
                              {hasProfessorSub ? (activity.professor_file_count || 1) : 0}
                            </span>
                          </div>
                          
                          {/* Only show status if it's not empty */}
                          {statusInfo.status && (
                            <span className={`px-1 py-0.5 text-xs font-medium rounded ${statusInfo.color}`}>
                              {statusInfo.status}
                            </span>
                          )}
                          {gradingStatus && (
                            <span className={`px-1 py-0.5 text-xs font-medium rounded ${gradingStatus.color}`}>
                              {gradingStatus.text}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Title - Smaller - EXACTLY LIKE StudentActivityCard */}
                      <h3 className="font-medium text-[#FFFFFF] text-xs mb-2.5 truncate">
                        {activity.title}
                      </h3>
                      
                      {/* Subject (if available) */}
                      {activity.subject && (
                        <p className="text-xs text-white/60 mb-2">
                          {activity.subject}
                        </p>
                      )}
                      
                      {/* Minimal Info Row - Compact - EXACTLY LIKE StudentActivityCard */}
                      <div className="flex items-center justify-between mb-2">
                        {/* Deadline */}
                        <div className="flex items-center gap-1">
                          <img src={DeadlineIcon} alt="Deadline" className="w-2.5 h-2.5" />
                          <span className={`text-xs font-medium ${deadlineColor}`}>
                            {formatDate(activity.deadline)}
                          </span>
                        </div>
                        
                        {/* Points/Grade Status */}
                        <div className="flex items-center gap-1">
                          <img src={GradeIcon} alt="Grade" className="w-2.5 h-2.5" />
                          <span className="text-xs font-medium text-[#FFA600]">
                            {activity.points ? `${activity.points} pts` : 'No Grade'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={`text-center py-6 rounded-lg border border-white/5 ${
                  isAbsent ? 'bg-[#A15353]/5' : 'bg-[#23232C]'
                }`}>
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full mb-2 ${
                    isAbsent ? 'bg-[#A15353]/20' : 'bg-[#767EE0]/20'
                  }`}>
                    <svg className={`w-4 h-4 ${
                      isAbsent ? 'text-[#A15353]' : 'text-[#767EE0]'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-xs font-semibold text-white mb-1">
                    No Activities Posted
                  </h4>
                  <p className={`text-xs ${
                    isAbsent ? 'text-[#A15353]/70' : 'text-white/50'
                  }`}>
                    No classes were scheduled for this day
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-white/5">
            <button
              onClick={() => setIsCalendarOpen(false)}
              className={`w-full text-white px-4 py-2 rounded text-xs font-medium transition-colors border ${
                isAbsent 
                  ? 'bg-[#A15353] hover:bg-[#C67171] border-[#A15353]/30' 
                  : 'bg-[#767EE0] hover:bg-[#6369d1] border-[#767EE0]/30'
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