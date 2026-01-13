import React from 'react';

const StudentPerformancePopup = ({ 
  isOpen, 
  onClose, 
  studentData, 
  weekData,
  activityType = 'all'
}) => {
  if (!isOpen || !studentData || !weekData) return null;

  const getActivityTypeLabel = (type) => {
    const activityTypes = {
      'all': 'All Activities',
      'assignment': 'Assignments',
      'quiz': 'Quizzes',
      'activity': 'Activities',
      'project': 'Projects',
      'laboratory': 'Laboratory'
    };
    return activityTypes[type] || 'All Activities';
  };

  const getScoreColor = (score) => {
    if (score < 71) return '#FF5555'; // Failing
    if (score >= 71 && score <= 75) return '#FFA600'; // Close to failing
    return '#00A15D'; // Passing
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A24] rounded-xl border border-[#FFFFFF]/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[#FFFFFF]/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#FFFFFF]">Performance Analysis</h2>
              <p className="text-sm text-[#FFFFFF]/60">
                Week {weekData.week} • {getActivityTypeLabel(activityType)}
                {activityType === 'all' ? ' (75% Academic + 25% Attendance)' : ' (Academic Only)'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#2A2A35] rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-[#FFFFFF]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Student Info */}
        <div className="p-6 border-b border-[#FFFFFF]/10">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg text-[#FFFFFF]">{studentData.studentName}</h3>
              <p className="text-sm text-[#FFFFFF]/60">Student ID: {studentData.studentNumber}</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#FFFFFF]/60">Week {weekData.week} Score</div>
              <div 
                className="text-2xl font-bold"
                style={{ color: getScoreColor(weekData.score) }}
              >
                {weekData.score.toFixed(2)}%
              </div>
              {studentData.previousScore && (
                <div className={`text-sm ${studentData.performanceChange >= 0 ? 'text-[#00A15D]' : 'text-[#FF5555]'}`}>
                  {studentData.performanceChange >= 0 ? '↗' : '↘'} {Math.abs(studentData.performanceChange).toFixed(2)}% from previous week
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Details */}
        <div className="p-6">
          <h4 className="font-bold text-lg text-[#FFFFFF] mb-4">Performance Details</h4>
          
          {/* Performance Zone */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#FFFFFF]/60">Performance Zone</span>
              <span 
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: getScoreColor(weekData.score) + '20',
                  color: getScoreColor(weekData.score)
                }}
              >
                {studentData.performanceZone}
              </span>
            </div>
            <div className="h-2 bg-[#2A2A35] rounded-full overflow-hidden">
              <div 
                className="h-full"
                style={{ 
                  width: `${Math.min(weekData.score, 100)}%`,
                  backgroundColor: getScoreColor(weekData.score)
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#FFFFFF]/60 mt-1">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Performance Factors */}
          <div className="mb-6">
            <h5 className="font-medium text-[#FFFFFF] mb-3">Performance Factors</h5>
            <div className="space-y-3">
              {weekData.reasons.map((reason, index) => (
                <div key={index} className="p-3 bg-[#2A2A35] rounded-lg border border-[#FFFFFF]/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-[#FFFFFF]">{reason.factor}</span>
                    <span 
                      className={`px-2 py-0.5 rounded text-xs ${reason.impact === 'positive' ? 'bg-[#00A15D]/20 text-[#00A15D]' : 'bg-[#FF5555]/20 text-[#FF5555]'}`}
                    >
                      {reason.impact === 'positive' ? 'Positive' : 'Negative'}
                    </span>
                  </div>
                  <p className="text-sm text-[#FFFFFF]/80 mb-1">{reason.description}</p>
                  <p className="text-xs text-[#FFFFFF]/60">{reason.details}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Student Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-[#2A2A35] rounded-lg border border-[#FFFFFF]/5">
              <div className="text-xs text-[#FFFFFF]/60 mb-1">Overall Attendance</div>
              <div className="text-lg font-bold text-[#00A15D]">{studentData.attendance}%</div>
              {activityType === 'all' && (
                <div className="text-xs text-[#FFFFFF]/60 mt-1">Included in weighted score (25%)</div>
              )}
            </div>
            
            <div className="p-3 bg-[#2A2A35] rounded-lg border border-[#FFFFFF]/5">
              <div className="text-xs text-[#FFFFFF]/60 mb-1">Assignment Completion</div>
              <div className="text-lg font-bold text-[#10B981]">{studentData.assignmentCompletion}%</div>
              <div className="text-xs text-[#FFFFFF]/60 mt-1">Completed activities</div>
            </div>
            
            <div className="p-3 bg-[#2A2A35] rounded-lg border border-[#FFFFFF]/5">
              <div className="text-xs text-[#FFFFFF]/60 mb-1">Current Performance</div>
              <div 
                className="text-lg font-bold"
                style={{ color: getScoreColor(weekData.score) }}
              >
                {weekData.score.toFixed(2)}%
              </div>
              <div className="text-xs text-[#FFFFFF]/60 mt-1">
                {activityType === 'all' ? 'Weighted Score' : 'Academic Score'}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#FFFFFF]/10">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#6366F1] hover:bg-[#767EE0] text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformancePopup;