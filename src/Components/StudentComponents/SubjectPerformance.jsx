import React from 'react';
import { useNavigate } from 'react-router-dom';

// Import assets
import PerformanceIcon from '../../assets/SubjectPerformance.svg';

const SubjectPerformance = ({ subjectPerformance = [] }) => {
  const navigate = useNavigate();
  
  // Function to determine border color based on percentage
  const getBorderColor = (percentage) => {
    if (percentage <= 70) return 'border-[#A15353] border-2'; // Red for 70% and below
    if (percentage >= 71 && percentage <= 75) return 'border-[#FFA600] border-2'; // Yellow for 71-75%
    return 'border-transparent border-2'; // No border for above 75%
  };

  // Function to determine text color based on percentage
  const getTextColor = (percentage) => {
    if (percentage <= 70) return 'text-[#A15353]';
    if (percentage >= 71 && percentage <= 75) return 'text-[#FFA600]';
    return 'text-white';
  };

  // Function to get status label
  const getStatusLabel = (percentage) => {
    if (percentage <= 70) return 'Failing';
    if (percentage >= 71 && percentage <= 75) return 'At Risk';
    return 'Good';
  };

  // Function to get status color
  const getStatusColor = (percentage) => {
    if (percentage <= 70) return '#A15353';
    if (percentage >= 71 && percentage <= 75) return '#FFA600';
    return '#00A15D';
  };

  // Sort subjects: failing first, then warning, then good, then by lowest percentage
  const sortedSubjects = [...subjectPerformance].sort((a, b) => {
    const percentageA = a.percentage || 0;
    const percentageB = b.percentage || 0;
    
    // Priority: red (≤70%) > yellow (71-75%) > green (>75%)
    const getPriority = (percentage) => {
      if (percentage <= 70) return 3; // Highest priority (failing)
      if (percentage <= 75) return 2; // Medium priority (warning)
      return 1; // Low priority (good)
    };
    
    const priorityA = getPriority(percentageA);
    const priorityB = getPriority(percentageB);
    
    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Higher priority first
    }
    
    // Same status, sort by percentage (lowest first)
    return percentageA - percentageB;
  });

  // Check if there are subjects that need attention
  const hasFailingSubjects = sortedSubjects.some(subject => {
    const percentage = subject.percentage || 0;
    return percentage <= 70;
  });
  
  const hasWarningSubjects = sortedSubjects.some(subject => {
    const percentage = subject.percentage || 0;
    return percentage >= 71 && percentage <= 75;
  });

  // Handle subject click - navigate to subject's school works
  const handleSubjectClick = (subjectCode) => {
    navigate(`/SubjectSchoolWorksStudent?code=${subjectCode}`);
  };

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
            const percentage = subject.percentage || 0;
            const borderColor = getBorderColor(percentage);
            const textColor = getTextColor(percentage);
            const statusLabel = getStatusLabel(percentage);
            const statusColor = getStatusColor(percentage);
            
            return (
              <div
                key={index}
                onClick={() => handleSubjectClick(subject.subjectCode)}
                className={`aspect-square rounded-lg p-2 flex flex-col items-center justify-center bg-[#23232C] hover:bg-[#2A2A35] transition-all cursor-pointer ${borderColor}`}
                title={`${subject.subject} - ${percentage}% (${subject.gradedActivities || 0} graded activities)`}
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
                <p className={`text-xl sm:text-2xl font-bold ${textColor}`}>
                  {percentage}%
                </p>
                
                {/* Grading Details */}
                <p className="text-[8px] text-white/50 mt-1">
                  {subject.gradedActivities || 0} graded
                </p>
                
                {/* Status Indicators */}
                <div className="mt-1 flex items-center gap-1">
                  <div className="flex items-center gap-0.5">
                    <div 
                      className="h-1.5 w-1.5 rounded-full" 
                      style={{ backgroundColor: statusColor }}
                    ></div>
                    <span 
                      className="text-[6px] font-medium" 
                      style={{ color: statusColor }}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-6">
            <p className="text-white/50 text-sm">No subject data available</p>
          </div>
        )}
      </div>
      
      {/* Legend */}
      {(hasFailingSubjects || hasWarningSubjects) && (
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex flex-wrap gap-3 text-[10px] text-white/60">
            {hasFailingSubjects && (
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded border-2 border-[#A15353]"></div>
                <span>Failing (≤70%)</span>
              </div>
            )}
            
            {hasWarningSubjects && (
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded border-2 border-[#FFA600]"></div>
                <span>At Risk (71-75%)</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded border-2 border-transparent bg-[#23232C]"></div>
              <span>Good (&gt;75%)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectPerformance;