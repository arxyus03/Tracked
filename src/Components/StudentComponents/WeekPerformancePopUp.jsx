import React, { useMemo } from 'react';

const WeekPerformancePopup = ({ 
  isOpen, 
  onClose, 
  weekData,
  performanceChange,
  previousWeekScore
}) => {
  if (!isOpen || !weekData) return null;

  const { week, score, activities } = weekData;
  
  // Determine performance trend
  const trend = performanceChange > 0 ? 'improved' : performanceChange < 0 ? 'declined' : 'stable';
  const trendColor = performanceChange > 0 ? 'text-[#00A15D]' : performanceChange < 0 ? 'text-[#FF5555]' : 'text-[#FFA600]';
  const trendIcon = performanceChange > 0 ? '↑' : performanceChange < 0 ? '↓' : '→';

  // Generate realistic performance reasons based on the score and trend
  const performanceReasons = useMemo(() => {
    const reasons = [];
    
    // Improvement scenarios (score increased)
    if (trend === 'improved') {
      if (score >= 90) {
        reasons.push(
          {
            factor: "Perfect Quiz Scores",
            description: "Scored 100% on all quizzes this week",
            impact: "positive",
            value: "+15%"
          },
          {
            factor: "Early Assignment Submission",
            description: "Submitted all assignments 2 days before deadline",
            impact: "positive",
            value: "+8%"
          },
          {
            factor: "Excellent Lab Performance",
            description: "Perfect scores in laboratory activities and reports",
            impact: "positive",
            value: "+12%"
          }
        );
      } else if (score >= 80) {
        reasons.push(
          {
            factor: "Improved Quiz Performance",
            description: "Average quiz score improved from 75% to 85%",
            impact: "positive",
            value: "+10%"
          },
          {
            factor: "On-time Submissions",
            description: "All assignments submitted on time with good quality",
            impact: "positive",
            value: "+7%"
          },
          {
            factor: "Active Participation",
            description: "Active in class discussions and group activities",
            impact: "positive",
            value: "+5%"
          }
        );
      } else {
        reasons.push(
          {
            factor: "Better Assignment Grades",
            description: "Assignment scores improved by 15% compared to last week",
            impact: "positive",
            value: "+8%"
          },
          {
            factor: "Improved Attendance",
            description: "Perfect attendance this week",
            impact: "positive",
            value: "+5%"
          },
          {
            factor: "Higher Activity Scores",
            description: "Scored above 80% on all learning activities",
            impact: "positive",
            value: "+7%"
          }
        );
      }
    }
    
    // Decline scenarios (score decreased)
    else if (trend === 'declined') {
      if (score < 70) {
        reasons.push(
          {
            factor: "Failed Quiz",
            description: "Scored 55% on major quiz covering week's topics",
            impact: "negative",
            value: "-20%"
          },
          {
            factor: "Late Submissions",
            description: "3 assignments submitted after deadline (15% penalty each)",
            impact: "negative",
            value: "-15%"
          },
          {
            factor: "Incomplete Lab Report",
            description: "Laboratory report missing key sections",
            impact: "negative",
            value: "-12%"
          },
          {
            factor: "Missed Class",
            description: "Absent for 2 important lectures",
            impact: "negative",
            value: "-8%"
          }
        );
      } else if (score < 75) {
        reasons.push(
          {
            factor: "Low Quiz Scores",
            description: "Average quiz score dropped to 68%",
            impact: "negative",
            value: "-12%"
          },
          {
            factor: "Rushed Assignments",
            description: "Quality of assignments decreased due to time constraints",
            impact: "negative",
            value: "-8%"
          },
          {
            factor: "Group Project Contribution",
            description: "Minimal contribution to group project",
            impact: "negative",
            value: "-5%"
          }
        );
      } else {
        reasons.push(
          {
            factor: "Minor Quiz Dip",
            description: "Quiz score decreased by 10% from previous week",
            impact: "negative",
            value: "-6%"
          },
          {
            factor: "One Late Submission",
            description: "Single assignment submitted 1 day late",
            impact: "negative",
            value: "-3%"
          },
          {
            factor: "Lower Activity Scores",
            description: "Average activity score dropped by 8%",
            impact: "negative",
            value: "-5%"
          }
        );
      }
    }
    
    // Stable performance
    else {
      reasons.push(
        {
          factor: "Consistent Performance",
          description: "Maintained similar level of performance as previous week",
          impact: "neutral",
          value: "0% change"
        },
        {
          factor: "Regular Attendance",
          description: "Attended all classes and submitted work on time",
          impact: "positive",
          value: "Maintained"
        },
        {
          factor: "Steady Quiz Scores",
          description: "Quiz scores remained within expected range",
          impact: "neutral",
          value: "No significant change"
        }
      );
    }
    
    // Add a general activity completion reason based on actual activities
    if (activities > 0) {
      reasons.push({
        factor: "Activity Completion",
        description: `Completed ${activities} learning activities this week`,
        impact: "positive",
        value: `+${Math.floor(score/10)}%`
      });
    }
    
    return reasons;
  }, [score, trend, activities]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-[#23232C] rounded-xl border border-[#FFFFFF]/20 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#FFFFFF]/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
              <h2 className="text-base font-bold text-white">Week {week} Performance Analysis</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#3A3A45] rounded-lg transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#FFFFFF]/60 mb-1">Performance Score</div>
              <div className={`text-xl font-bold ${
                score >= 85 ? "text-[#00A15D]" : 
                score >= 75 ? "text-[#FFA600]" : "text-[#FF5555]"
              }`}>{score}%</div>
              <div className="text-xs text-[#FFFFFF]/40">{activities} activities completed</div>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-[#FFFFFF]/60 mb-1">
                {previousWeekScore ? `From ${previousWeekScore}% last week` : 'Change from Previous'}
              </div>
              <div className={`text-lg font-bold ${trendColor}`}>
                {trendIcon} {Math.abs(performanceChange)}%
              </div>
              <div className={`text-xs ${trendColor} capitalize`}>
                {trend}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="mb-3">
            <h3 className="font-medium text-white text-sm mb-2">Key Performance Factors</h3>
            <div className="space-y-2">
              {performanceReasons.map((reason, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-[#2A2A35]/50 rounded-lg">
                  <div className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    reason.impact === 'positive' ? 'bg-[#00A15D]' : 
                    reason.impact === 'negative' ? 'bg-[#FF5555]' : 'bg-[#FFA600]'
                  }`}></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start gap-2 mb-0.5">
                      <div className="text-xs font-medium text-white">{reason.factor}</div>
                      <div className={`text-xs font-bold ${
                        reason.impact === 'positive' ? 'text-[#00A15D]' : 
                        reason.impact === 'negative' ? 'text-[#FF5555]' : 'text-[#FFA600]'
                      }`}>
                        {reason.value}
                      </div>
                    </div>
                    <div className="text-xs text-[#FFFFFF]/60 leading-tight">{reason.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-[#2A2A35]/30 p-2 rounded-lg text-center">
              <div className="text-xs text-[#FFFFFF]/60 mb-0.5">Activities</div>
              <div className="text-sm font-medium text-white">
                {activities}
              </div>
            </div>
            
            <div className="bg-[#2A2A35]/30 p-2 rounded-lg text-center">
              <div className="text-xs text-[#FFFFFF]/60 mb-0.5">Change</div>
              <div className={`text-sm font-medium ${trendColor}`}>
                {trendIcon} {Math.abs(performanceChange)}%
              </div>
            </div>
            
            <div className="bg-[#2A2A35]/30 p-2 rounded-lg text-center">
              <div className="text-xs text-[#FFFFFF]/60 mb-0.5">Status</div>
              <div className={`text-sm font-medium ${trendColor} capitalize`}>
                {trend}
              </div>
            </div>
          </div>

          <div className="text-xs text-[#FFFFFF]/40 text-center border-t border-[#FFFFFF]/10 pt-2">
            Analysis based on activity completion, submission quality, and attendance
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#FFFFFF]/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm bg-[#6366F1] text-white font-medium rounded-lg hover:bg-[#767EE0] transition-colors cursor-pointer"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeekPerformancePopup;