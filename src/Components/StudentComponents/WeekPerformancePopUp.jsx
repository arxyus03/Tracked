import React, { useMemo, useState, useEffect } from 'react';

const WeekPerformancePopup = ({ 
  isOpen, 
  onClose, 
  weekData,
  studentId,
  subjectCode
}) => {
  const [detailedData, setDetailedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showActivities, setShowActivities] = useState(false);
  
  // Fetch detailed week analysis when popup opens
  useEffect(() => {
    if (isOpen && weekData && studentId && subjectCode) {
      fetchWeekAnalysis();
    }
  }, [isOpen, weekData?.week, studentId, subjectCode]);
  
  const fetchWeekAnalysis = async () => {
    if (!weekData || !studentId || !subjectCode) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://tracked.6minds.site/Student/AnalyticsStudentDB/get_week_analysis.php?student_id=${studentId}&subject_code=${subjectCode}&week=${weekData.week}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setDetailedData(data);
        }
      }
    } catch (error) {
      console.error('Error fetching week analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const fallbackPerformanceReasons = useMemo(() => {
    if (!weekData) return [];
    
    const reasons = [];
    const score = weekData.score || 0;
    const activities = weekData.activities || 0;
    const submitted = Math.floor(activities * (score / 100));
    
    // Check if it's an idle week
    if (weekData.status === 'idle' || !weekData.has_activities) {
      reasons.push({
        factor: 'Idle Week',
        description: 'No activities were assigned during this week',
        impact: 'neutral',
        value: 'N/A'
      });
      return reasons;
    }
    
    // Generate reasons based on score
    if (score >= 85) {
      reasons.push(
        {
          factor: "Excellent Performance",
          description: `Scored ${score}% overall`,
          impact: "positive",
          value: "+15%"
        },
        {
          factor: "High Completion Rate",
          description: `Completed ${submitted}/${activities} activities`,
          impact: "positive",
          value: "+10%"
        }
      );
    } else if (score >= 75) {
      reasons.push(
        {
          factor: "Good Performance",
          description: `Scored ${score}% overall`,
          impact: "positive",
          value: "+8%"
        },
        {
          factor: "Satisfactory Completion",
          description: `Completed ${submitted}/${activities} activities`,
          impact: "positive",
          value: "+6%"
        }
      );
    } else if (score > 0) {
      reasons.push(
        {
          factor: "Needs Improvement",
          description: `Scored ${score}% overall`,
          impact: "negative",
          value: "-10%"
        },
        {
          factor: "Low Completion",
          description: `Only completed ${submitted}/${activities} activities`,
          impact: "negative",
          value: "-8%"
        }
      );
    }
    
    return reasons;
  }, [weekData]);

  if (!isOpen || !weekData) return null;

  const { week, score, activities, status } = weekData;
  const isIdleWeek = status === 'idle' || !weekData.has_activities;
  
  // Use the data from API or fallback
  const displayData = detailedData || {
    week: week,
    performance_score: score,
    activities: activities,
    submitted: Math.floor(activities * (score / 100)),
    performance_change: 0,
    status: status || 'stable',
    performance_factors: [],
    completion_rate: Math.floor(score / 1.5),
    has_activities: !isIdleWeek,
    average_score: score,
    week_activities: []
  };
  
  // Always use the score from API or line graph data
  const finalScore = displayData.performance_score;
  const trend = displayData.status;
  const trendColor = trend === 'improved' ? 'text-[#00A15D]' : 
                     trend === 'declined' ? 'text-[#FF5555]' : 
                     trend === 'idle' ? 'text-[#6366F1]' : 'text-[#FFA600]';
  const trendIcon = trend === 'improved' ? '↑' : 
                    trend === 'declined' ? '↓' : 
                    trend === 'idle' ? '—' : '→';
  
  // Determine which reasons to use
  const performanceReasons = displayData.performance_factors.length > 0 
    ? displayData.performance_factors 
    : fallbackPerformanceReasons;

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
              <div className={`w-2 h-2 rounded-full ${
                isIdleWeek ? 'bg-[#6366F1]' :
                finalScore >= 85 ? 'bg-[#00A15D]' :
                finalScore >= 75 ? 'bg-[#FFA600]' : 'bg-[#FF5555]'
              }`}></div>
              <h2 className="text-base font-bold text-white">
                Week {displayData.week} Performance Analysis
                {displayData.date_range && (
                  <span className="text-xs text-[#FFFFFF]/60 ml-2 font-normal">
                    ({displayData.date_range.start} - {displayData.date_range.end})
                  </span>
                )}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#3A3A45] rounded-lg transition-colors cursor-pointer"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 text-white" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#FFFFFF]/60 mb-1">Performance Score</div>
              {isIdleWeek ? (
                <div className="text-xl font-bold text-[#6366F1]">No Activities</div>
              ) : (
                <div className={`text-xl font-bold ${
                  finalScore >= 85 ? "text-[#00A15D]" : 
                  finalScore >= 75 ? "text-[#FFA600]" : "text-[#FF5555]"
                }`}>{finalScore}%</div>
              )}
              <div className="text-xs text-[#FFFFFF]/40">
                {isIdleWeek ? (
                  'No activities assigned this week'
                ) : (
                  `${displayData.submitted || 0}/${displayData.activities || 0} activities completed`
                )}
                {displayData.completion_rate > 0 && ` (${displayData.completion_rate}% completion rate)`}
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-[#FFFFFF]/60 mb-1">
                {displayData.previous_week ? `From Week ${displayData.previous_week}` : 'No previous week data'}
              </div>
              {!isIdleWeek && displayData.previous_week_score > 0 ? (
                <>
                  <div className={`text-lg font-bold ${trendColor}`}>
                    {trendIcon} {Math.abs(displayData.performance_change || 0)}%
                  </div>
                  <div className={`text-xs ${trendColor} capitalize`}>
                    {displayData.status}
                  </div>
                </>
              ) : isIdleWeek ? (
                <>
                  <div className="text-lg font-bold text-[#6366F1]">—</div>
                  <div className="text-xs text-[#6366F1] capitalize">
                    Idle
                  </div>
                </>
              ) : (
                <>
                  <div className="text-lg font-bold text-[#FFA600]">New</div>
                  <div className="text-xs text-[#FFA600] capitalize">
                    First Week
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1]"></div>
            </div>
          ) : (
            <>
              {/* Activities Toggle Button */}
              {displayData.week_activities && displayData.week_activities.length > 0 && (
                <div className="mb-3">
                  <button
                    onClick={() => setShowActivities(!showActivities)}
                    className="flex items-center gap-2 px-3 py-2 bg-[#2A2A35] hover:bg-[#3A3A45] rounded-lg transition-colors cursor-pointer"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 text-white transition-transform ${showActivities ? 'rotate-90' : ''}`}
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-white">
                      {showActivities ? 'Hide Activities' : `Show ${displayData.week_activities.length} Activities`}
                    </span>
                  </button>
                </div>
              )}
              
              {/* Activities List */}
              {showActivities && displayData.week_activities && displayData.week_activities.length > 0 && (
                <div className="mb-3">
                  <h3 className="font-medium text-white text-sm mb-2">Week Activities</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {displayData.week_activities.map((activity, index) => (
                      <div key={index} className="bg-[#2A2A35]/50 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-white">
                              {activity.activity_type} {activity.task_number}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-[#3A3A45] text-white">
                              {activity.points || 0} pts
                            </span>
                          </div>
                          <div className={`text-xs font-medium px-2 py-0.5 rounded ${
                            activity.status === 'graded' ? 'bg-[#00A15D]/20 text-[#00A15D]' :
                            activity.status === 'submitted' ? 'bg-[#FFA600]/20 text-[#FFA600]' :
                            activity.status === 'missed' ? 'bg-[#FF5555]/20 text-[#FF5555]' :
                            'bg-[#6366F1]/20 text-[#6366F1]'
                          }`}>
                            {activity.status === 'graded' ? 'Graded' :
                             activity.status === 'submitted' ? 'Submitted' :
                             activity.status === 'missed' ? 'Missed' : 'Pending'}
                          </div>
                        </div>
                        <div className="text-xs font-semibold text-white mb-1">{activity.title}</div>
                        <div className="flex justify-between items-center text-xs text-[#FFFFFF]/60">
                          <div>
                            Deadline: {new Date(activity.deadline).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className={`font-medium ${
                            activity.grade ? (activity.grade >= 75 ? 'text-[#00A15D]' : 'text-[#FF5555]') : 'text-[#FFA600]'
                          }`}>
                            {activity.grade ? `${activity.grade}%` : 'No grade'}
                          </div>
                        </div>
                        {activity.late === 1 && (
                          <div className="text-xs text-[#FF5555] mt-1">⚠️ Submitted late</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mb-3">
                <h3 className="font-medium text-white text-sm mb-2">
                  {isIdleWeek ? 'Week Status' : 'Key Performance Factors'}
                </h3>
                <div className="space-y-2">
                  {performanceReasons.map((reason, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-[#2A2A35]/50 rounded-lg">
                      <div className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        reason.impact === 'positive' ? 'bg-[#00A15D]' : 
                        reason.impact === 'negative' ? 'bg-[#FF5555]' : 'bg-[#6366F1]'
                      }`}></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-start gap-2 mb-0.5">
                          <div className="text-xs font-medium text-white">{reason.factor}</div>
                          <div className={`text-xs font-bold ${
                            reason.impact === 'positive' ? 'text-[#00A15D]' : 
                            reason.impact === 'negative' ? 'text-[#FF5555]' : 'text-[#6366F1]'
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
                  <div className={`text-sm font-medium ${isIdleWeek ? 'text-[#6366F1]' : 'text-white'}`}>
                    {displayData.activities || 0}
                  </div>
                </div>
                
                <div className="bg-[#2A2A35]/30 p-2 rounded-lg text-center">
                  <div className="text-xs text-[#FFFFFF]/60 mb-0.5">
                    {isIdleWeek ? 'Status' : 'Completion'}
                  </div>
                  {isIdleWeek ? (
                    <div className="text-sm font-medium text-[#6366F1]">Idle</div>
                  ) : (
                    <div className="text-sm font-medium text-white">
                      {displayData.submitted || 0}/{displayData.activities || 0}
                    </div>
                  )}
                </div>
                
                <div className="bg-[#2A2A35]/30 p-2 rounded-lg text-center">
                  <div className="text-xs text-[#FFFFFF]/60 mb-0.5">Status</div>
                  <div className={`text-sm font-medium ${trendColor} capitalize`}>
                    {displayData.status}
                  </div>
                </div>
              </div>

              {!isIdleWeek && displayData.average_score > 0 && (
                <div className="mb-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#2A2A35]/30 p-2 rounded-lg">
                      <div className="text-xs text-[#FFFFFF]/60 mb-0.5">Average Score</div>
                      <div className="text-sm font-medium text-white">
                        {displayData.average_score}%
                      </div>
                    </div>
                    
                    <div className="bg-[#2A2A35]/30 p-2 rounded-lg">
                      <div className="text-xs text-[#FFFFFF]/60 mb-0.5">Late Submissions</div>
                      <div className={`text-sm font-medium ${(displayData.late_submissions || 0) > 0 ? 'text-[#FF5555]' : 'text-[#00A15D]'}`}>
                        {displayData.late_submissions || 0}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-xs text-[#FFFFFF]/40 text-center border-t border-[#FFFFFF]/10 pt-2">
                {isIdleWeek 
                  ? 'Idle weeks have no assigned activities and do not affect performance trends.'
                  : 'Performance based on activity completion, submission quality, and timeliness.'
                }
              </div>
            </>
          )}
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