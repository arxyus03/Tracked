import React, { useState } from 'react';
import EmailIcon from '../../assets/Email.svg';
import WarningIcon from '../../assets/Warning.svg';
import CheckCircleIcon from '../../assets/CheckCircle.svg';
import TrackEdIcon from '../../assets/TrackEd.svg';
import StudentActivityDetails from './StudentActivityDetails';

const StudentPerformanceSummary = ({
  performanceSummary,
  performanceData,
  currentSubject,
  handleAskForExtraWork,
  getProgressBarGradient,
  subjectAttendance,
  studentId,
  studentName
}) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityDetails, setShowActivityDetails] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('');
  const [expandedSuggestionsSection, setExpandedSuggestionsSection] = useState(false);
  const [expandedIndividualSuggestions, setExpandedIndividualSuggestions] = useState({});

  // Function to get color based on current performance percentage
  const getPerformanceColor = (percentage) => {
    if (percentage >= 75) return 'text-[#00A15D]'; // Green for 75% and above
    if (percentage >= 71 && percentage <= 74) return 'text-[#FFA600]'; // Yellow for 71-74%
    return 'text-[#A15353]'; // Red for 70% and below
  };

  // Function to get border color for the circle
  const getPerformanceBorderColor = (percentage) => {
    if (percentage >= 75) return 'border-[#00A15D]';
    if (percentage >= 71 && percentage <= 74) return 'border-[#FFA600]';
    return 'border-[#A15353]';
  };

  // Function to get progress bar gradient based on percentage
  const getCurrentPerformanceGradient = (percentage) => {
    if (percentage >= 75) return 'linear-gradient(to right, #00A15D, #00C853)';
    if (percentage >= 71 && percentage <= 74) return 'linear-gradient(to right, #FFA600, #FFD700)';
    return 'linear-gradient(to right, #A15353, #FF4757)';
  };

  // Function to format percentage - 2 digits for circle, 2 decimal places for gauge
  const formatPercentageForCircle = (percentage) => {
    return Math.round(percentage); // 2-digit whole number for circle
  };

  const formatPercentageForGauge = (percentage) => {
    return percentage.toFixed(2); // 2 decimal places for gauge
  };

  const toggleIndividualSuggestion = (type) => {
    setExpandedIndividualSuggestions(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleViewActivityFromSuggestion = (activity) => {
    setSelectedActivity(activity);
    setShowActivityDetails(true);
  };

  const handleEmailActivityFromSuggestion = (activity) => {
    const { teacherEmail, teacherName } = performanceData;
    
    if (!teacherEmail) {
      alert("Teacher email not available. Please contact your teacher directly.");
      return;
    }

    const percentage = activity.grade !== null && activity.points > 0 ? 
      Math.round((activity.grade / activity.points) * 100) : null;
    
    const subject = encodeURIComponent(`Question about ${activity.activity_type} ${activity.task_number} - ${currentSubject?.subject || 'Subject'}`);
    
    let body = `Dear ${teacherName || 'Professor'},\n\n`;
    body += `I have a question regarding the following activity:\n\n`;
    body += `STUDENT INFORMATION:\n`;
    body += `- Student ID: ${studentId}\n`;
    body += `- Student Name: ${studentName}\n`;
    body += `- Subject: ${currentSubject?.subject || ''}\n`;
    body += `- Section: ${currentSubject?.section || ''}\n\n`;
    body += `ACTIVITY DETAILS:\n`;
    body += `- Activity Type: ${activity.activity_type}\n`;
    body += `- Task Number: ${activity.task_number}\n`;
    body += `- Title: ${activity.title}\n`;
    body += `- Deadline: ${activity.deadline ? new Date(activity.deadline).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : 'No deadline'}\n`;
    body += `- Status: ${activity.status}\n`;
    body += `- Score: ${activity.grade !== null ? `${activity.grade}/${activity.points}` : 'Not graded yet'}\n`;
    if (percentage !== null) body += `- Percentage: ${percentage}%\n\n`;
    body += `MY QUESTION:\n\n`;
    body += `[Please state your question here]\n\n`;
    body += `Thank you for your time and assistance.\n\n`;
    body += `Sincerely,\n${studentName}\nStudent ID: ${studentId}`;
    
    const mailtoLink = `mailto:${teacherEmail}?subject=${subject}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  const getActivityStatusText = (activity) => {
    switch(activity.status) {
      case 'passed': return 'Passed (≥80%)';
      case 'low': return 'Low (75-79%)';
      case 'failed': return 'Failed (<75%)';
      case 'missed': return 'Missed';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  const getActivityStatusColor = (activity) => {
    switch(activity.status) {
      case 'passed': return 'text-[#00A15D]';
      case 'low': return 'text-[#FFA600]';
      case 'failed': return 'text-[#A15353]';
      case 'missed': return 'text-[#A15353]';
      case 'pending': return 'text-[#767EE0]';
      default: return 'text-[#FFFFFF]';
    }
  };

  const getActivityPercentage = (activity) => {
    if (activity.grade !== null && activity.points > 0) {
      return Math.round((activity.grade / activity.points) * 100);
    }
    return null;
  };

  const renderIndividualSuggestionDropdown = (suggestion, activities) => {
    const isExpanded = expandedIndividualSuggestions[suggestion.type];
    
    if (!activities || activities.length === 0) return null;

    return (
      <div className="mb-1">
        <div 
          className="cursor-pointer p-1.5 rounded hover:bg-[#23232C]/50 transition-colors"
          onClick={() => toggleIndividualSuggestion(suggestion.type)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                suggestion.type === 'missed' ? 'bg-[#A15353]' :
                suggestion.type === 'failed' ? 'bg-[#A15353]' :
                suggestion.type === 'low' ? 'bg-[#FFA600]' :
                suggestion.type === 'absences' ? 'bg-[#FF6B6B]' :
                'bg-[#767EE0]'
              }`}></div>
              <span className="text-xs flex-1 min-w-0 truncate text-[#FFFFFF]/80 group-hover:text-white transition-colors">
                {suggestion.text}
              </span>
              {suggestion.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                  suggestion.type === 'missed' ? 'bg-[#A15353]/20 text-[#A15353]' :
                  suggestion.type === 'failed' ? 'bg-[#A15353]/20 text-[#A15353]' :
                  suggestion.type === 'low' ? 'bg-[#FFA600]/20 text-[#FFA600]' :
                  suggestion.type === 'absences' ? 'bg-[#FF6B6B]/20 text-[#FF6B6B]' :
                  'bg-[#767EE0]/20 text-[#767EE0]'
                }`}>
                  {suggestion.count}
                </span>
              )}
            </div>
            <button className="text-[#FFFFFF]/60 hover:text-[#FFFFFF] transition-colors ml-2">
              {isExpanded ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="ml-3 pl-3 border-l border-[#FFFFFF]/20 mt-1 mb-1 animate-slideDown">
            {suggestion.type === 'absences' ? (
              <div className="p-2 bg-[#23232C]/30 rounded text-xs text-[#FFFFFF]/70">
                <p>You have {subjectAttendance.absent || 0} absences and {subjectAttendance.late || 0} late arrivals.</p>
                <p className="mt-1">3 late arrivals = 1 absence</p>
                <div className="mt-2">
                  <button
                    onClick={handleAskForExtraWork}
                    className="flex items-center justify-center gap-1 px-2 py-1 bg-gradient-to-r from-[#FF6B6B] to-[#FF5252] text-white text-[10px] font-semibold rounded hover:opacity-90 transition-all duration-200"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Email Teacher About Absences</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {activities.map((activity, index) => (
                  <div key={activity.id || index} className="p-2 bg-[#23232C]/30 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${
                          activity.status === 'passed' ? 'bg-[#00A15D]/20 text-[#00A15D]' :
                          activity.status === 'low' ? 'bg-[#FFA600]/20 text-[#FFA600]' :
                          activity.status === 'failed' ? 'bg-[#A15353]/20 text-[#A15353]' :
                          activity.status === 'missed' ? 'bg-[#A15353]/20 text-[#A15353]' :
                          'bg-[#767EE0]/20 text-[#767EE0]'
                        }`}>
                          {activity.activity_type} #{activity.task_number}
                        </span>
                        <span className="text-xs font-medium text-[#FFFFFF] truncate max-w-[120px]">
                          {activity.title}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-[10px] text-[#FFFFFF]/60">
                      <div>
                        {activity.deadline && (
                          <span>Due: {new Date(activity.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        )}
                        {activity.grade !== null && (
                          <span className="ml-2">
                            Score: {activity.grade}/{activity.points}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewActivityFromSuggestion(activity)}
                          className="p-0.5 rounded hover:bg-[#FFFFFF]/10 transition-colors group"
                          title="View Details"
                        >
                          <svg className="w-3 h-3 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEmailActivityFromSuggestion(activity)}
                          className="p-0.5 rounded hover:bg-[#FFFFFF]/10 transition-colors group"
                          title="Email Teacher"
                        >
                          <svg className="w-3 h-3 opacity-70 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Main Container - Reorganized Layout */}
      <div className="p-3 bg-[#15151C] rounded-lg border border-[#FFFFFF]/10">
        {/* First Row: Big Percentage + Message */}
        <div className="flex items-start gap-3 mb-2">
          {/* Big Percentage Circle - Takes more space */}
          <div className="relative flex-shrink-0">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-[#23232C] to-[#1A1A22] border-2 shadow-xl ${getPerformanceBorderColor(performanceSummary.percentage)}`}>
              <span className={`text-4xl font-bold ${getPerformanceColor(performanceSummary.percentage)}`}>
                {formatPercentageForCircle(performanceSummary.percentage)}%
              </span>
            </div>
            
            {/* Show warning icon if 70% and below */}
            {performanceSummary.percentage <= 70 && (
              <div className="absolute -top-1 -right-1">
                <img src={WarningIcon} alt="Failing" className="w-5 h-5" />
              </div>
            )}
            
            {/* Show check icon if above 75% */}
            {performanceSummary.percentage >= 75 && (
              <div className="absolute -top-1 -right-1">
                <img src={CheckCircleIcon} alt="Excellent" className="w-5 h-5" />
              </div>
            )}
          </div>
          
          {/* Message Area - Compact */}
          <div className="flex-1 min-w-0 pt-2">
            <h3 className="text-xs font-semibold text-white mb-1">Current Performance</h3>
            <div className="flex items-center gap-1.5">
              {(performanceSummary.status === "warning" || performanceSummary.status === "urgent") && (
                <img src={TrackEdIcon} alt="Warning" className="w-3 h-3 flex-shrink-0" />
              )}
              <p className={`text-xs flex-1 min-w-0 ${
                performanceSummary.status === "excellent" ? "text-[#00A15D]" :
                performanceSummary.status === "warning" ? "text-[#FFA600]" :
                performanceSummary.status === "urgent" ? "text-[#A15353]" :
                "text-[#A15353]"
              }`}>
                {performanceSummary.message}
              </p>
            </div>
            
            {/* Action Buttons under message */}
            <div className="flex gap-1.5 mt-2">
              {performanceSummary.needsImprovement && performanceData.teacherEmail && (
                <button
                  onClick={handleAskForExtraWork}
                  className="flex items-center justify-center gap-1 px-3 py-1 bg-gradient-to-r from-[#FFA600] to-[#FF8C00] text-white text-xs font-semibold rounded hover:opacity-90 transition-all duration-200 shadow whitespace-nowrap"
                >
                  <img src={EmailIcon} alt="Email" className="w-3 h-3" />
                  <span>Ask for Extra Work</span>
                </button>
              )}
              
              {performanceSummary.critical && performanceData.teacherEmail && (
                <button
                  onClick={handleAskForExtraWork}
                  className="flex items-center justify-center gap-1 px-3 py-1 bg-gradient-to-r from-[#A15353] to-[#8B3A3A] text-white text-xs font-semibold rounded hover:opacity-90 transition-all duration-200 shadow whitespace-nowrap"
                >
                  <img src={WarningIcon} alt="Warning" className="w-3 h-3" />
                  <span>Contact Teacher</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Second Row: Progress Bar - Only 0%, 70%, 100% markers */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-[#FFFFFF] mb-0.5">
            <span>Current Performance</span>
            <span className={`font-medium ${getPerformanceColor(performanceSummary.percentage)}`}>
              {formatPercentageForGauge(performanceSummary.percentage)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#23232C] rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min(performanceSummary.percentage, 100)}%`,
                background: getCurrentPerformanceGradient(performanceSummary.percentage)
              }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-[#FFFFFF]/60 mt-0.5">
            <span>0%</span>
            <span>70%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Failing Warning Message (70% and below) */}
        {performanceSummary.percentage <= 70 && (
          <div className="bg-[#A15353]/20 border border-[#A15353]/30 rounded-md p-2 mb-2">
            <div className="flex items-center gap-2">
              <img src={WarningIcon} alt="Warning" className="w-3 h-3" />
              <span className="text-xs font-medium text-[#A15353]">
                Failing Warning: Your current performance is below 71%
              </span>
              {performanceData.teacherEmail && (
                <button
                  onClick={handleAskForExtraWork}
                  className="ml-auto flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-[#A15353] to-[#8B3A3A] text-white text-[10px] font-semibold rounded hover:opacity-90 transition-all duration-200"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Email Teacher</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Third Row: Suggestions Section as a Dropdown */}
        {performanceSummary.suggestions && performanceSummary.suggestions.length > 0 && (
          <div className="pt-2 border-t border-[#FFFFFF]/10">
            <div 
              className="cursor-pointer transition-all duration-200 mb-1"
              onClick={() => setExpandedSuggestionsSection(!expandedSuggestionsSection)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-[#FF5252]/20">
                    <div className="text-[#FF5252]">
                      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#FFFFFF]">
                      Suggestions
                    </h3>
                    <div className="text-xs text-[#FFFFFF]/60">
                      {performanceSummary.suggestions.length} suggestion{performanceSummary.suggestions.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <button className="text-[#FFFFFF] hover:text-[#FFFFFF]/80 transition-colors">
                    {expandedSuggestionsSection ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {expandedSuggestionsSection && (
              <div className="mt-2 animate-slideDown">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[#FFFFFF]/80">Click on suggestions to expand:</span>
                  <span className="text-[10px] text-[#FFFFFF]/60">
                    Passing grade: 75%
                  </span>
                </div>
                <ul className="text-xs text-[#FFFFFF]/80 space-y-1">
                  {performanceSummary.suggestions.map((suggestion, index) => {
                    // Get activities for this suggestion type
                    let activities = [];
                    switch (suggestion.type) {
                      case 'missed':
                        activities = performanceSummary.suggestionsData?.missed || [];
                        break;
                      case 'failed':
                        activities = performanceSummary.suggestionsData?.failed || [];
                        break;
                      case 'low':
                        activities = performanceSummary.suggestionsData?.low || [];
                        break;
                      case 'pending':
                        activities = performanceSummary.suggestionsData?.pending || [];
                        break;
                      case 'absences':
                        activities = performanceSummary.suggestionsData?.absences || [];
                        break;
                      default:
                        activities = [];
                    }

                    return (
                      <li key={index}>
                        {renderIndividualSuggestionDropdown(suggestion, activities)}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Student Activity Details Modal */}
      {showActivityDetails && selectedActivity && studentId && (
        <StudentActivityDetails
          activity={selectedActivity}
          isOpen={showActivityDetails}
          onClose={() => {
            setShowActivityDetails(false);
            setSelectedActivity(null);
            setCurrentCategory('');
          }}
          studentId={studentId}
          teacherEmail={performanceData.teacherEmail}
          teacherName={performanceData.teacherName}
          subjectName={currentSubject?.subject}
          gradeInfo={{
            grade: selectedActivity.grade,
            maxScore: selectedActivity.points || 100,
            gradeDisplay: selectedActivity.grade !== null ? 
              `${selectedActivity.grade}/${selectedActivity.points}` : 'Not Graded',
            gradeColor: getActivityStatusColor(selectedActivity)
          }}
        />
      )}
      
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </>
  );
};

export default StudentPerformanceSummary;