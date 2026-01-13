import React, { useState, useEffect } from 'react';
import ArrowUp from '../../assets/ArrowUp.svg';
import ArrowDown from '../../assets/ArrowDown.svg';

const SectionPerformanceModal = ({ isOpen, onClose, section, sectionCode, weekData, color }) => {
  const [activityDetails, setActivityDetails] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && sectionCode && weekData) {
      fetchActivityDetails();
    }
  }, [isOpen, sectionCode, weekData]);

  const fetchActivityDetails = async () => {
    if (!sectionCode || !weekData) return;
    
    try {
      setLoadingActivities(true);
      setError(null);
      setActivityDetails([]);
      
      // Extract subject code from sectionCode (e.g., "ITEC110-D" -> "ITEC110")
      const subjectCode = sectionCode.split('-')[0];
      
      const response = await fetch(
        `https://tracked.6minds.site/Professor/ReportsAnalyticsProfDB/fetchActivityDetails.php?subject_code=${subjectCode}&week=${weekData.week}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setActivityDetails(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching activity details:", error);
      setError("Failed to load activity details");
      // Show sample activity data for demonstration
      setActivityDetails([
        {
          activityId: 1,
          title: "Assignment #1",
          type: "Assignment",
          taskNumber: "1",
          maxPoints: 100,
          deadline: new Date().toISOString(),
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          totalSubmissions: Math.floor(weekData.studentCount * 0.85),
          totalStudents: weekData.studentCount || 25,
          submissionRate: 85,
          averageGrade: weekData.score - 5,
          minGrade: weekData.score - 15,
          maxGrade: weekData.score + 10,
          performance: getPerformanceLevel(weekData.score - 5)
        },
        {
          activityId: 2,
          title: "Quiz #1",
          type: "Quiz",
          taskNumber: "1",
          maxPoints: 50,
          deadline: new Date().toISOString(),
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          totalSubmissions: Math.floor(weekData.studentCount * 0.90),
          totalStudents: weekData.studentCount || 25,
          submissionRate: 90,
          averageGrade: weekData.score - 2,
          minGrade: weekData.score - 10,
          maxGrade: weekData.score + 5,
          performance: getPerformanceLevel(weekData.score - 2)
        }
      ]);
    } finally {
      setLoadingActivities(false);
    }
  };

  if (!isOpen || !section || !weekData) return null;

  // Calculate performance zone
  const getPerformanceZone = (score) => {
    if (score < 71) return { 
      text: 'Failing', 
      color: '#FF5555', 
      bg: 'bg-[#FF5555]/10',
      border: 'border-[#FF5555]/20'
    };
    if (score >= 71 && score <= 75) return { 
      text: 'Close to Failing', 
      color: '#FFA600', 
      bg: 'bg-[#FFA600]/10',
      border: 'border-[#FFA600]/20'
    };
    if (score >= 76 && score <= 79) return { 
      text: 'Warning', 
      color: '#FFA600', 
      bg: 'bg-[#FFA600]/10',
      border: 'border-[#FFA600]/20'
    };
    return { 
      text: 'Good', 
      color: '#00A15D', 
      bg: 'bg-[#00A15D]/10',
      border: 'border-[#00A15D]/20'
    };
  };

  const getPerformanceLevel = (percentage) => {
    if (percentage < 71) return 'failing';
    if (percentage >= 71 && percentage <= 75) return 'warning';
    return 'good';
  };

  const performanceZone = getPerformanceZone(weekData.score);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#15151C] rounded-xl border border-[#FFFFFF]/20 p-5 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Section Performance Analysis</h3>
            <p className="text-xs text-white/60">
              {section} - Week {weekData.week}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-1 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Week Score at the Top */}
        <div className="mb-4 p-4 bg-[#23232C] rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/60">Week {weekData.week} Performance</p>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold text-white">{weekData.score.toFixed(1)}%</p>
                <div className={`px-2 py-1 rounded ${performanceZone.bg} ${performanceZone.border}`}>
                  <span className="text-xs font-medium" style={{ color: performanceZone.color }}>
                    {performanceZone.text}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-white/60">{section}</span>
                </div>
                {weekData.studentCount && (
                  <span className="text-xs text-white/60">
                    {weekData.studentCount} students
                  </span>
                )}
                {weekData.submissionRate && (
                  <span className="text-xs text-white/60">
                    {weekData.submissionRate}% submission rate
                  </span>
                )}
              </div>
            </div>
            
            {weekData.performanceChange > 0 && (
              <div className={`text-xs ${weekData.changeDirection === 'up' ? 'text-[#00A15D]' : weekData.changeDirection === 'down' ? 'text-[#FF5555]' : 'text-[#FFA600]'}`}>
                <div className="flex items-center gap-1">
                  {weekData.changeDirection === 'up' ? (
                    <img 
                      src={ArrowUp} 
                      alt="Up" 
                      className="w-8 h-8"
                      style={{ 
                        filter: 'brightness(0) saturate(100%) invert(47%) sepia(22%) saturate(1283%) hue-rotate(105deg) brightness(92%) contrast(101%)' 
                      }}
                    />
                  ) : weekData.changeDirection === 'down' ? (
                    <img 
                      src={ArrowDown} 
                      alt="Down" 
                      className="w-8 h-8"
                      style={{ 
                        filter: 'brightness(0) saturate(100%) invert(42%) sepia(57%) saturate(2487%) hue-rotate(338deg) brightness(103%) contrast(101%)' 
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 flex items-center justify-center text-[#FFA600]">
                      —
                    </div>
                  )}
                  <span className='text-lg font-bold'>{weekData.performanceChange.toFixed(1)}%</span>
                </div>
                <p className="text-[10px] text-white/60 mt-0.5">
                  from previous week
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Activities Summary */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-bold text-sm">Activities for Week {weekData.week}</h4>
            <span className="text-xs text-white/60">
              {weekData.activities || 0} activity{weekData.activities !== 1 ? 's' : ''}
            </span>
          </div>
          
          {loadingActivities ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6366F1] mx-auto mb-3"></div>
              <p className="text-white/60 text-sm">Loading activity details...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-[#FF5555]/10 rounded-lg border border-[#FF5555]/20">
              <p className="text-sm text-[#FF5555] text-center">{error}</p>
              <p className="text-xs text-white/60 text-center mt-1">Showing sample data for demonstration</p>
            </div>
          ) : activityDetails.length > 0 ? (
            <div className="space-y-3">
              {activityDetails.map((activity, index) => (
                <div key={index} className="p-3 bg-[#23232C] rounded-lg border border-[#FFFFFF]/5">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-white">{activity.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          activity.performance === 'failing' ? 'bg-[#FF5555]/10 text-[#FF5555]' :
                          activity.performance === 'warning' ? 'bg-[#FFA600]/10 text-[#FFA600]' :
                          'bg-[#00A15D]/10 text-[#00A15D]'
                        }`}>
                          {activity.type}
                        </span>
                        <span className="text-xs text-white/40">
                          Task {activity.taskNumber}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-white/60">
                        <div>
                          <span className="text-white/40">Posted: </span>
                          {formatDate(activity.createdAt)}
                        </div>
                        <div>
                          <span className="text-white/40">Due: </span>
                          {formatDate(activity.deadline)}
                        </div>
                      </div>
                    </div>
                    <div className={`text-sm font-bold px-2 py-1 rounded ${
                      activity.performance === 'failing' ? 'bg-[#FF5555]/10 text-[#FF5555]' :
                      activity.performance === 'warning' ? 'bg-[#FFA600]/10 text-[#FFA600]' :
                      'bg-[#00A15D]/10 text-[#00A15D]'
                    }`}>
                      {activity.averageGrade}%
                    </div>
                  </div>
                  
                  {/* Activity Stats */}
                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-white/10">
                    <div className="text-center">
                      <div className="text-xs text-white/60">Submissions</div>
                      <div className="text-sm font-medium text-white">
                        {activity.totalSubmissions}/{activity.totalStudents}
                      </div>
                      <div className="text-xs text-white/40">
                        ({activity.submissionRate}%)
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-white/60">High Score</div>
                      <div className="text-sm font-medium text-[#00A15D]">
                        {activity.maxGrade}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-white/60">Low Score</div>
                      <div className="text-sm font-medium text-[#FF5555]">
                        {activity.minGrade}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-white/60">Max Points</div>
                      <div className="text-sm font-medium text-white">
                        {activity.maxPoints}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-[#23232C] rounded-lg border border-[#FFFFFF]/5">
              <div className="flex flex-col items-center justify-center text-center">
                <svg className="w-8 h-8 text-white/40 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
                <p className="text-sm text-white/60">No activities for this week</p>
                <p className="text-xs text-white/40 mt-1">Activities will appear here once created</p>
              </div>
            </div>
          )}
        </div>

        {/* Performance Analysis */}
        <div className="mb-5">
          <h4 className="text-white font-bold mb-2 text-sm">Performance Analysis</h4>
          <div className="p-3 bg-[#23232C] rounded-lg">
            <p className="text-sm text-white/80">{weekData.reason}</p>
            
            {activityDetails.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-white/60 mb-1">Overall Submission Rate</div>
                    <div className="text-sm font-medium text-white">
                      {(
                        activityDetails.reduce((sum, act) => sum + act.submissionRate, 0) / 
                        activityDetails.length
                      ).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-white/60 mb-1">Average Activity Score</div>
                    <div className="text-sm font-medium text-white">
                      {(
                        activityDetails.reduce((sum, act) => sum + act.averageGrade, 0) / 
                        activityDetails.length
                      ).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className="mb-5">
          <h4 className="text-white font-bold mb-2 text-sm">Recommendations</h4>
          <div className="space-y-2">
            {weekData.score < 71 ? (
              <>
                <div className="p-3 bg-[#FF5555]/10 rounded-lg border border-[#FF5555]/20">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-[#FF5555] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.698-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-xs text-[#FF5555] leading-tight">
                      Consider adjusting teaching methods or providing alternative explanations for complex topics
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-[#FF5555]/10 rounded-lg border border-[#FF5555]/20">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-[#FF5555] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-xs text-[#FF5555] leading-tight">
                      Schedule mandatory support sessions or one-on-one help for struggling students
                    </p>
                  </div>
                </div>
              </>
            ) : weekData.score <= 75 ? (
              <>
                <div className="p-3 bg-[#FFA600]/10 rounded-lg border border-[#FFA600]/20">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-[#FFA600] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                    </svg>
                    <p className="text-xs text-[#FFA600] leading-tight">
                      Review challenging concepts and provide additional examples to clarify misunderstandings
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-[#FFA600]/10 rounded-lg border border-[#FFA600]/20">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-[#FFA600] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-[#FFA600] leading-tight">
                      Schedule additional review sessions before the next assessment
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 bg-[#00A15D]/10 rounded-lg border border-[#00A15D]/20">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-[#00A15D] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-xs text-[#00A15D] leading-tight">
                      Continue current teaching strategies - they're working well for this section!
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-[#00A15D]/10 rounded-lg border border-[#00A15D]/20">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-[#00A15D] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <p className="text-xs text-[#00A15D] leading-tight">
                      Consider introducing advanced topics or enrichment activities for high-performing students
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors text-sm font-medium"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionPerformanceModal;