import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import assets
import DeadlineIcon from '../../assets/Deadline.svg';
import GradeIcon from '../../assets/Points.svg';
import DocumentIcon from '../../assets/Photo.svg';

const TaskCompletionDetails = ({
  isOpen,
  onClose,
  selectedActivityType,
  modalActivities,
  getActivityTypeColor,
  getActivityStatusLabel,
  getGradingStatus,
  userName,
  isDarkMode = false
}) => {
  const [localDarkMode, setLocalDarkMode] = useState(isDarkMode);
  const navigate = useNavigate();

  useEffect(() => {
    setLocalDarkMode(isDarkMode);
  }, [isDarkMode]);

  // New function to handle direct navigation to subject's school works
  const handleNavigateToSchoolWorks = (activity) => {
    onClose();
    
    let filterParam = '';
    if (selectedActivityType === 'missed') {
      filterParam = '&filter=Missed';
    } else if (selectedActivityType === 'active') {
      filterParam = '&filter=Active';
    } else if (selectedActivityType === 'submitted') {
      filterParam = '&filter=Submitted';
    }
    
    navigate(`/SubjectSchoolWorksStudent?code=${activity.subjectCode}${filterParam}`);
  };

  // Format date function
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
    const isSubmitted = activity.submitted === 1 || activity.submitted === true || activity.submitted === '1' || activity.submitted === true;
    const isLate = activity.late === 1 || activity.late === true || activity.late === '1';
    
    let isOverdue = false;
    if (activity.deadline && activity.deadline !== "No deadline") {
      try {
        const deadlineDate = new Date(activity.deadline);
        const now = new Date();
        isOverdue = deadlineDate.getTime() < now.getTime() && !isSubmitted;
      } catch {}
    }
    
    if (isOverdue) return { 
      status: "Missed", 
      color: localDarkMode ? "bg-[#A15353]/20 text-[#A15353]" : "bg-[#A15353]/10 text-[#A15353]", 
      type: "missed" 
    };
    if (isSubmitted) return { 
      status: "", // Empty string for submitted activities
      color: "", // No color needed since we won't display status
      type: "submitted" 
    };
    return { 
      status: "Active", 
      color: localDarkMode ? "bg-[#767EE0]/20 text-[#767EE0]" : "bg-[#767EE0]/10 text-[#767EE0]", 
      type: "active" 
    };
  };

  // Get card background based on status
  const getCardBackground = (statusType) => {
    if (statusType === 'missed') return localDarkMode ? 'bg-[#A15353]/10' : 'bg-red-50';
    if (statusType === 'submitted') return localDarkMode ? 'bg-[#15151C]' : 'bg-white';
    return localDarkMode ? 'bg-[#15151C]' : 'bg-white';
  };

  // Generate professor email from professor ID
  const getProfessorEmail = (professorId) => {
    // This is a simple example - you might want to fetch actual professor email from your database
    // For now, we'll generate a generic email based on the professor ID
    return `${professorId.toLowerCase()}@university.edu`;
  };

  // Handle email professor click
  const handleEmailClick = (e, activity) => {
    e.stopPropagation(); // Prevent card click
    const professorEmail = getProfessorEmail(activity.professor_ID);
    const subject = encodeURIComponent(`Regarding: ${activity.title}`);
    const body = encodeURIComponent(`Dear Professor,\n\nI would like to inquire about the activity "${activity.title}" in ${activity.subject}. Could you please let me know what I can do to make up for this task?\n\nThank you,\n${userName}`);
    window.open(`mailto:${professorEmail}?subject=${subject}&body=${body}`);
  };

  // Theme-based colors
  const getBackgroundColor = () => {
    return localDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getHeaderBackgroundColor = () => {
    return localDarkMode ? "from-[#23232C] to-[#15151C]" : "from-gray-50 to-white";
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className={`${getBackgroundColor()} rounded-lg shadow-xl border ${getBorderColor()} max-w-2xl w-full overflow-hidden max-h-[85vh]`}>
        {/* Header - Compact */}
        <div className={`relative p-3 bg-gradient-to-r ${getHeaderBackgroundColor()} border-b ${getBorderColor()}`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                selectedActivityType === 'missed' ? 'bg-[#A15353]' : 
                selectedActivityType === 'active' ? 'bg-[#767EE0]' : 
                'bg-[#00A15D]'
              }`}></div>
              <div>
                <h3 className={`font-bold text-sm ${getTextColor()}`}>
                  {getActivityStatusLabel(selectedActivityType)} Activities
                </h3>
                <p className={`text-xs ${getSecondaryTextColor()} mt-0.5`}>
                  {modalActivities.length} {modalActivities.length === 1 ? 'activity' : 'activities'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className={`${localDarkMode ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'} text-xs p-1 rounded transition-colors`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Activities List */}
        <div className="p-3 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 gap-2">
            {modalActivities.length > 0 ? (
              modalActivities.map((activity) => {
                const statusInfo = getStudentStatus(activity);
                const hasProfessorSubmission = activity.link && activity.link.trim() !== '';
                const deadlineColor = isDeadlinePassed(activity.deadline) || isDeadlineUrgent(activity.deadline) 
                  ? 'text-[#A15353]' 
                  : localDarkMode ? 'text-[#FFFFFF]/80' : 'text-gray-700';
                
                const gradingStatus = getGradingStatus(activity);

                return (
                  <div 
                    key={activity.id} 
                    className={`rounded-lg border p-2.5 hover:shadow-sm transition-all cursor-pointer ${
                      localDarkMode ? 'border-white/10' : 'border-gray-200'
                    } hover:border-[#00A15D]/30 ${getCardBackground(statusInfo.type)}`}
                    onClick={() => handleNavigateToSchoolWorks(activity)}
                  >
                    {/* Header with type+number and status */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`px-1.5 py-0.5 ${getActivityTypeColor(activity.activity_type)} text-xs font-medium rounded`}>
                        {activity.activity_type} #{activity.task_number}
                      </span>
                      <div className="flex items-center gap-1">
                        {/* Reference Materials Icon with Count */}
                        <div className="flex items-center gap-1 mr-1">
                          {/* FIXED: Changed from invert(0.2) to invert(0.5) for light mode */}
                          <img 
                            src={DocumentIcon} 
                            alt="Reference Materials" 
                            className={`w-3.5 h-3.5 ${hasProfessorSubmission ? 'opacity-100' : 'opacity-40'}`}
                            style={{ filter: localDarkMode ? 'none' : 'invert(0.5)' }}
                          />
                          <span className={`text-xs font-bold ${
                            hasProfessorSubmission 
                              ? 'text-[#00A15D]' 
                              : localDarkMode ? 'text-[#767EE0]' : 'text-blue-600'
                          }`}>
                            {hasProfessorSubmission ? 1 : 0}
                          </span>
                        </div>
                        
                        {/* Only show status if it's not empty (i.e., not submitted) */}
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
                    
                    {/* Title - Smaller */}
                    <h3 className={`font-medium text-xs mb-2.5 truncate ${getTextColor()}`}>
                      {activity.title}
                    </h3>
                    
                    {/* Subject */}
                    <p className={`text-xs ${getSecondaryTextColor()} mb-2`}>
                      {activity.subject}
                    </p>
                    
                    {/* Minimal Info Row - Compact */}
                    <div className="flex items-center justify-between mb-2">
                      {/* Deadline */}
                      <div className="flex items-center gap-1">
                        {/* FIXED: Changed from invert(0.2) to invert(0.5) for light mode */}
                        <img src={DeadlineIcon} alt="Deadline" className="w-2.5 h-2.5" style={{ filter: localDarkMode ? 'none' : 'invert(0.5)' }} />
                        <span className={`text-xs font-medium ${deadlineColor}`}>
                          {formatDate(activity.deadline)}
                        </span>
                      </div>
                      
                      {/* Grade Status */}
                      <div className="flex items-center gap-1">
                        {/* FIXED: Changed from invert(0.2) to invert(0.5) for light mode */}
                        <img src={GradeIcon} alt="Grade" className="w-2.5 h-2.5" style={{ filter: localDarkMode ? 'none' : 'invert(0.5)' }} />
                        <span className="text-xs font-medium text-[#FFA600]">
                          {activity.points} pts
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons - Hug to right */}
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent card click
                          handleNavigateToSchoolWorks(activity);
                        }}
                        className="bg-[#767EE0] text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-[#6369d1] transition-colors border border-[#767EE0]/30 flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View in School Works
                      </button>
                      
                      {/* Contact Teacher Button (only for missed activities) */}
                      {selectedActivityType === 'missed' && (
                        <button
                          onClick={(e) => handleEmailClick(e, activity)}
                          className="bg-[#A15353] text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-[#8a3c3c] transition-colors border border-[#A15353]/30 flex items-center justify-center gap-1.5"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Contact Teacher
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className={`text-center py-6 ${localDarkMode ? 'bg-[#23232C]' : 'bg-gray-50'} rounded-lg border ${getBorderColor()}`}>
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                  selectedActivityType === 'missed' ? (localDarkMode ? 'bg-[#A15353]/20' : 'bg-red-100') : 
                  selectedActivityType === 'active' ? (localDarkMode ? 'bg-[#767EE0]/20' : 'bg-blue-100') : 
                  (localDarkMode ? 'bg-[#00A15D]/20' : 'bg-green-100')
                } mb-2`}>
                  <svg className={`w-4 h-4 ${
                    selectedActivityType === 'missed' ? 'text-[#A15353]' : 
                    selectedActivityType === 'active' ? 'text-[#767EE0]' : 
                    'text-[#00A15D]'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className={`text-xs font-semibold ${getTextColor()} mb-1`}>No {getActivityStatusLabel(selectedActivityType)} Activities</h4>
                <p className={`text-xs ${getSecondaryTextColor()}`}>
                  {selectedActivityType === 'missed' 
                    ? "Great job! You haven't missed any activities." 
                    : selectedActivityType === 'active'
                    ? "No active activities at the moment."
                    : "No submitted activities at the moment."
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`pt-3 border-t ${getBorderColor()} p-3`}>
          <button
            onClick={onClose}
            className="w-full bg-[#767EE0] text-white px-4 py-2 rounded text-xs font-medium hover:bg-[#6369d1] transition-colors border border-[#767EE0]/30"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCompletionDetails;