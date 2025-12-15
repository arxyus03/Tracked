import React from 'react';
import { Link } from 'react-router-dom'; // Added Link import

// Import assets
import PerformanceIcon from '../../assets/SubjectPerformance.svg';

const SubjectPerformance = ({ subjectPerformance = [] }) => {
  
  // Function to determine border color based on completion rate
  const getBorderColor = (percentage) => {
    if (percentage < 75) return 'border-[#A15353] border-2'; // Red for below 75%
    if (percentage >= 75 && percentage <= 85) return 'border-[#FFA600] border-2'; // Yellow for 75% to 85%
    return 'border-transparent border-2'; // No border for above 85%
  };

  // Function to determine text color based on completion rate
  const getTextColor = (percentage) => {
    if (percentage < 75) return 'text-[#A15353]';
    if (percentage >= 75 && percentage <= 85) return 'text-[#FFA600]';
    return 'text-white';
  };

  // Sort subjects: failing first, then warning, then good
  const sortedSubjects = [...subjectPerformance].sort((a, b) => {
    // Priority: red (<75%) > yellow (75-85%) > green (>85%)
    const getPriority = (percentage) => {
      if (percentage < 75) return 3; // Highest priority (failing)
      if (percentage <= 85) return 2; // Medium priority (warning)
      return 1; // Low priority (good)
    };
    
    return getPriority(b.completionRate) - getPriority(a.completionRate);
  });

  // Check if there are subjects that need attention
  const hasCriticalSubjects = subjectPerformance.some(subject => subject.completionRate < 75);
  const hasWarningSubjects = subjectPerformance.some(subject => subject.completionRate >= 75 && subject.completionRate <= 85);

  return (
    <div className="bg-[#15151C] rounded-lg shadow p-3 border-2 border-[#15151C]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center text-white">
          <img src={PerformanceIcon} alt="Performance" className="h-4 w-4 mr-1" />
          Subject Performance
        </h3>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {sortedSubjects.length > 0 ? (
          sortedSubjects.map((subject, index) => {
            const isCritical = subject.completionRate < 75;
            const isWarning = subject.completionRate >= 75 && subject.completionRate <= 85;
            const isGood = subject.completionRate > 85;
            
            return (
              <Link 
                to={`/SubjectOverviewStudent?code=${subject.subjectCode}`}
                key={index}
                className="block no-underline"
              >
                <div 
                  className={`aspect-square rounded-lg p-2 flex flex-col items-center justify-center bg-[#23232C] hover:bg-[#2A2A35] transition-all cursor-pointer ${getBorderColor(subject.completionRate)}`}
                  title={`${subject.subject} - ${subject.completionRate}% complete (${subject.completed}/${subject.total} tasks)`}
                >
                  {/* Subject Name - Truncated if too long */}
                  <p className="text-[10px] sm:text-xs text-center font-medium text-white/80 mb-1 truncate w-full">
                    {subject.subject}
                  </p>
                  
                  {/* Section Info */}
                  <p className="text-[8px] text-white/50 mb-1">
                    {subject.section || 'No Section'}
                  </p>
                  
                  {/* Big Percentage Number */}
                  <p className={`text-xl sm:text-2xl font-bold ${getTextColor(subject.completionRate)}`}>
                    {subject.completionRate}%
                  </p>
                  
                  {/* Completion Details */}
                  <p className="text-[8px] text-white/50 mt-1">
                    {subject.completed}/{subject.total} completed
                  </p>
                  
                  {/* Status Indicators */}
                  <div className="mt-1 flex items-center gap-1">
                    {isCritical && (
                      <div className="flex items-center gap-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#A15353]"></div>
                        <span className="text-[6px] text-[#A15353] font-medium">Failing</span>
                      </div>
                    )}
                    
                    {isWarning && (
                      <div className="flex items-center gap-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#FFA600]"></div>
                        <span className="text-[6px] text-[#FFA600] font-medium">Warning</span>
                      </div>
                    )}
                    
                    {isGood && (
                      <div className="flex items-center gap-0.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#00A15D]"></div>
                        <span className="text-[6px] text-[#00A15D] font-medium">Good</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full text-center py-6">
            <p className="text-white/50 text-sm">No subject data available</p>
          </div>
        )}
      </div>
      
      {/* Legend */}
      {(hasCriticalSubjects || hasWarningSubjects) && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex flex-wrap gap-3 text-[10px] text-white/60">
            {hasCriticalSubjects && (
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded border-2 border-[#A15353]"></div>
                <span>Failing (&lt;75%)</span>
              </div>
            )}
            
            {hasWarningSubjects && (
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded border-2 border-[#FFA600]"></div>
                <span>Close to Failing (75-85%)</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded border-2 border-transparent bg-[#23232C]"></div>
              <span>Good (&gt;85%)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectPerformance;