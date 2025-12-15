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
  studentId
}) => {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityDetails, setShowActivityDetails] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('');

  const handleSuggestionClick = (type) => {
    setCurrentCategory(type);
    let activities = [];
    switch (type) {
      case 'missed':
        activities = performanceSummary.missedOrZeroGradeActivities || [];
        break;
      case 'low-grades':
        activities = performanceSummary.lowGradeActivities || [];
        break;
      default:
        activities = [];
    }

    if (activities.length > 0) {
      setSelectedActivity(activities[0]);
      setShowActivityDetails(true);
    } else {
      alert(`No ${type.replace('-', ' ')} activities found.`);
    }
  };

  const handleActivityNavigation = (direction) => {
    if (!selectedActivity || !currentCategory) return;

    let activities = [];
    switch (currentCategory) {
      case 'missed':
        activities = performanceSummary.missedOrZeroGradeActivities || [];
        break;
      case 'low-grades':
        activities = performanceSummary.lowGradeActivities || [];
        break;
      default:
        activities = [];
    }

    const currentIndex = activities.findIndex(activity => activity.id === selectedActivity.id);
    if (direction === 'next' && currentIndex < activities.length - 1) {
      setSelectedActivity(activities[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      setSelectedActivity(activities[currentIndex - 1]);
    }
  };

  const getNavigationInfo = () => {
    if (!selectedActivity || !currentCategory) return { hasNext: false, hasPrev: false };
    let activities = [];
    switch (currentCategory) {
      case 'missed':
        activities = performanceSummary.missedOrZeroGradeActivities || [];
        break;
      case 'low-grades':
        activities = performanceSummary.lowGradeActivities || [];
        break;
      default:
        activities = [];
    }
    const currentIndex = activities.findIndex(activity => activity.id === selectedActivity.id);
    return {
      hasNext: currentIndex < activities.length - 1,
      hasPrev: currentIndex > 0,
      currentIndex: currentIndex + 1,
      total: activities.length
    };
  };

  const getGradeDisplay = (activity) => {
    if (!activity.grade && activity.grade !== 0) return 'Not Graded';
    if (activity.maxScore) return `${activity.grade}/${activity.maxScore}`;
    return `${activity.grade}%`;
  };

  const getGradeStatusColor = (grade, maxScore = 100) => {
    if (grade === null || grade === undefined) return 'text-[#FFA600]';
    const percentage = maxScore ? (grade / maxScore) * 100 : grade;
    if (percentage >= 75) return 'text-[#00A15D]';
    if (percentage >= 65) return 'text-[#FFA600]';
    return 'text-[#A15353]';
  };

  return (
    <>
      {/* Main Container - Reorganized Layout */}
      <div className="p-3 bg-[#15151C] rounded-lg border border-[#FFFFFF]/10">
        {/* First Row: Big Percentage + Message */}
        <div className="flex items-start gap-3 mb-2">
          {/* Big Percentage Circle - Takes more space */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-[#23232C] to-[#1A1A22] border-2 border-[#767EE0] shadow-xl">
              <span className="text-4xl font-bold text-white">{performanceSummary.percentage}%</span>
            </div>
            {performanceSummary.status === "excellent" && (
              <div className="absolute -top-1 -right-1">
                <img src={CheckCircleIcon} alt="Excellent" className="w-5 h-5" />
              </div>
            )}
          </div>
          
          {/* Message Area - Compact */}
          <div className="flex-1 min-w-0 pt-2">
            <h3 className="text-xs font-semibold text-white mb-1">Your Current Performance</h3>
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
              
              {performanceSummary.critical && (
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
        
        {/* Second Row: Progress Bar that's pushed to left side */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-[#FFFFFF] mb-0.5">
            <span>Progress</span>
            <span className="font-medium">{performanceSummary.percentage}%</span>
          </div>
          <div className="w-[calc(100%-80px)] ml-20 h-1.5 bg-[#23232C] rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${Math.min(performanceSummary.percentage, 100)}%`,
                background: getProgressBarGradient(performanceSummary.percentage)
              }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-[#FFFFFF]/60 mt-0.5">
            <span>0%</span>
            <span className={`font-medium ${
              performanceSummary.percentage >= 75 ? 'text-[#00A15D]' :
              performanceSummary.percentage >= 65 ? 'text-[#FFA600]' :
              'text-[#A15353]'
            }`}>
              75%
            </span>
            <span>100%</span>
          </div>
        </div>

        {/* Third Row: Suggestions */}
        {performanceSummary.suggestions && performanceSummary.suggestions.filter(s => s.type !== 'pending').length > 0 && (
          <div className="pt-2 border-t border-[#FFFFFF]/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#FFFFFF]/80">Suggestions:</span>
              <span className="text-[10px] text-[#FFFFFF]/60 text-center">
                Passing grade: 75%
              </span>
            </div>
            <ul className="text-xs text-[#FFFFFF]/80 space-y-1">
              {performanceSummary.suggestions
                .filter(suggestion => suggestion.type !== 'pending')
                .map((suggestion, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleSuggestionClick(suggestion.type)}
                      className="flex items-center gap-2 hover:bg-[#23232C] transition-colors w-full p-1.5 rounded group"
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        suggestion.type === 'missed' ? 'bg-[#A15353] group-hover:bg-[#C67171]' :
                        suggestion.type === 'low-grades' ? 'bg-[#A15353] group-hover:bg-[#C67171]' :
                        'bg-[#767EE0] group-hover:bg-[#949BFF]'
                      }`}></div>
                      <span className="flex-1 text-left truncate group-hover:text-white transition-colors">
                        {suggestion.text}
                      </span>
                      {suggestion.count > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                          suggestion.type === 'missed' ? 'bg-[#A15353]/20 text-[#A15353] group-hover:bg-[#A15353]/30' :
                          suggestion.type === 'low-grades' ? 'bg-[#A15353]/20 text-[#A15353] group-hover:bg-[#A15353]/30' :
                          'bg-[#767EE0]/20 text-[#767EE0] group-hover:bg-[#767EE0]/30'
                        }`}>
                          {suggestion.count}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
            </ul>
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
          onNext={() => handleActivityNavigation('next')}
          onPrevious={() => handleActivityNavigation('prev')}
          hasNext={getNavigationInfo().hasNext}
          hasPrevious={getNavigationInfo().hasPrev}
          currentIndex={getNavigationInfo().currentIndex}
          total={getNavigationInfo().total}
          gradeInfo={{
            grade: selectedActivity.grade,
            maxScore: selectedActivity.maxScore || 100,
            gradeDisplay: getGradeDisplay(selectedActivity),
            gradeColor: getGradeStatusColor(selectedActivity.grade, selectedActivity.maxScore)
          }}
        />
      )}
    </>
  );
};

export default StudentPerformanceSummary;