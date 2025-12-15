import React from 'react';
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
  handleEmailProfessor,
  getActivityTypeColor,
  getActivityStatusColor,
  getActivityStatusLabel,
  formatModalDate,
  getGradingStatus
}) => {
  const navigate = useNavigate();

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

  // Format date function similar to StudentActivityCard
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
    const isSubmitted = activity.submitted === 1 || activity.submitted === true || activity.submitted === '1';
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
      color: "bg-[#A15353]/20 text-[#A15353]", 
      type: "missed" 
    };
    if (isSubmitted) return { 
      status: "", // Empty string for submitted activities
      color: "", // No color needed since we won't display status
      type: "submitted" 
    };
    return { 
      status: "Active", 
      color: "bg-[#767EE0]/20 text-[#767EE0]", 
      type: "active" 
    };
  };

  // Get card background based on status
  const getCardBackground = (statusType) => {
    if (statusType === 'missed') return 'bg-[#A15353]/10';
    if (statusType === 'submitted') return 'bg-[#15151C]';
    return 'bg-[#15151C]';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[#15151C] rounded-lg shadow-xl border border-white/10 max-w-2xl w-full overflow-hidden max-h-[85vh]">
        {/* Header - Compact */}
        <div className="relative p-3 bg-gradient-to-r from-[#23232C] to-[#15151C] border-b border-white/5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${
                selectedActivityType === 'missed' ? 'bg-[#A15353]' : 
                selectedActivityType === 'active' ? 'bg-[#767EE0]' : 
                'bg-[#00A15D]'
              }`}></div>
              <div>
                <h3 className="font-bold text-sm text-white">
                  {getActivityStatusLabel(selectedActivityType)} Activities
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  {modalActivities.length} {modalActivities.length === 1 ? 'activity' : 'activities'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white/40 hover:text-white text-xs p-1 hover:bg-white/5 rounded transition-colors"
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
                const hasProfessorSubmission = activity.professor_file_count > 0 || 
                                             (activity.professor_file_url && activity.professor_file_url !== null);
                const deadlineColor = isDeadlinePassed(activity.deadline) || isDeadlineUrgent(activity.deadline) 
                  ? 'text-[#A15353]' 
                  : 'text-[#FFFFFF]/80';
                
                const gradingStatus = getGradingStatus(activity);

                return (
                  <div 
                    key={activity.id} 
                    className={`rounded-lg border border-[#FFFFFF]/10 p-2.5 hover:shadow-sm transition-all cursor-pointer hover:border-[#00A15D]/30 ${getCardBackground(statusInfo.type)}`}
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
                          <img 
                            src={DocumentIcon} 
                            alt="Reference Materials" 
                            className={`w-3.5 h-3.5 ${hasProfessorSubmission ? 'opacity-100' : 'opacity-40'}`}
                          />
                          <span className={`text-xs font-bold ${
                            hasProfessorSubmission 
                              ? 'text-[#00A15D]' 
                              : 'text-[#767EE0]'
                          }`}>
                            {hasProfessorSubmission ? (activity.professor_file_count || 1) : 0}
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
                    <h3 className="font-medium text-[#FFFFFF] text-xs mb-2.5 truncate">
                      {activity.title}
                    </h3>
                    
                    {/* Subject */}
                    <p className="text-xs text-white/60 mb-2">
                      {activity.subject}
                    </p>
                    
                    {/* Minimal Info Row - Compact */}
                    <div className="flex items-center justify-between mb-2">
                      {/* Deadline */}
                      <div className="flex items-center gap-1">
                        <img src={DeadlineIcon} alt="Deadline" className="w-2.5 h-2.5" />
                        <span className={`text-xs font-medium ${deadlineColor}`}>
                          {formatDate(activity.deadline)}
                        </span>
                      </div>
                      
                      {/* Grade Status */}
                      <div className="flex items-center gap-1">
                        <img src={GradeIcon} alt="Grade" className="w-2.5 h-2.5" />
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
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            handleEmailProfessor(activity.professorEmail, activity.title);
                          }}
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
              <div className="text-center py-6 bg-[#23232C] rounded-lg border border-white/5">
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                  selectedActivityType === 'missed' ? 'bg-[#A15353]/20' : 
                  selectedActivityType === 'active' ? 'bg-[#767EE0]/20' : 
                  'bg-[#00A15D]/20'
                } mb-2`}>
                  <svg className={`w-4 h-4 ${
                    selectedActivityType === 'missed' ? 'text-[#A15353]' : 
                    selectedActivityType === 'active' ? 'text-[#767EE0]' : 
                    'text-[#00A15D]'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h4 className="text-xs font-semibold text-white mb-1">No {getActivityStatusLabel(selectedActivityType)} Activities</h4>
                <p className="text-xs text-white/50">
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
        <div className="pt-3 border-t border-white/5 p-3">
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