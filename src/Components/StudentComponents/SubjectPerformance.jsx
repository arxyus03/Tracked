import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Import assets
import PerformanceIcon from '../../assets/SubjectPerformance.svg';

const SubjectPerformance = ({ subjectPerformance = [], isDarkMode = false }) => {
  const [localDarkMode, setLocalDarkMode] = useState(isDarkMode);
  const navigate = useNavigate();

  useEffect(() => {
    setLocalDarkMode(isDarkMode);
  }, [isDarkMode]);

  // Function to determine border color based on percentage
  const getBorderColor = (percentage) => {
    if (percentage <= 70) return localDarkMode ? 'border-[#A15353] border-2' : 'border-red-500 border-2';
    if (percentage >= 71 && percentage <= 75) return localDarkMode ? 'border-[#FFA600] border-2' : 'border-amber-500 border-2';
    return 'border-transparent border-2';
  };

  // Function to determine text color based on percentage
  const getTextColor = (percentage) => {
    if (percentage <= 70) return 'text-[#A15353]';
    if (percentage >= 71 && percentage <= 75) return 'text-[#FFA600]';
    return localDarkMode ? 'text-white' : 'text-gray-900';
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
      if (percentage <= 70) return 3;
      if (percentage <= 75) return 2;
      return 1;
    };
    
    const priorityA = getPriority(percentageA);
    const priorityB = getPriority(percentageB);
    
    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }
    
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

  // Theme-based colors
  const getBackgroundColor = () => {
    return localDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getCardBackgroundColor = () => {
    return localDarkMode ? "bg-[#23232C]" : "bg-gray-50";
  };

  const getCardHoverBackgroundColor = () => {
    return localDarkMode ? "hover:bg-[#2A2A35]" : "hover:bg-gray-100";
  };

  const getTextColorGlobal = () => {
    return localDarkMode ? "text-white" : "text-gray-900";
  };

  const getSecondaryTextColor = () => {
    return localDarkMode ? "text-white/80" : "text-gray-600";
  };

  const getTertiaryTextColor = () => {
    return localDarkMode ? "text-white/50" : "text-gray-500";
  };

  const getDividerColor = () => {
    return localDarkMode ? "border-white/10" : "border-gray-200";
  };

  return (
    <div className={`${getBackgroundColor()} rounded-lg shadow p-3 border-2 ${localDarkMode ? 'border-[#15151C]' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-sm font-semibold flex items-center ${getTextColorGlobal()}`}>
          {/* FIXED: Changed from invert(0.2) to invert(0.5) for light mode */}
          <img src={PerformanceIcon} alt="Performance" className="h-4 w-4 mr-1" style={{ filter: localDarkMode ? 'none' : 'invert(0.5)' }} />
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
                className={`aspect-square rounded-lg p-2 flex flex-col items-center justify-center ${getCardBackgroundColor()} ${getCardHoverBackgroundColor()} transition-all cursor-pointer ${borderColor}`}
                title={`${subject.subject} - ${percentage}% (${subject.gradedActivities || 0} graded activities)`}
              >
                {/* Subject Name - Truncated if too long */}
                <p className={`text-[10px] sm:text-xs text-center font-medium ${getSecondaryTextColor()} mb-1 truncate w-full`}>
                  {subject.subject}
                </p>
                
                {/* Section Info - FIXED: Use tertiary text color for better visibility */}
                <p className={`text-[8px] ${getTertiaryTextColor()} mb-1`}>
                  {subject.section || 'No Section'}
                </p>
                
                {/* Big Percentage Number */}
                <p className={`text-xl sm:text-2xl font-bold ${textColor}`}>
                  {percentage}%
                </p>
                
                {/* Grading Details - FIXED: Use tertiary text color for better visibility */}
                <p className={`text-[8px] ${getTertiaryTextColor()} mt-1`}>
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
            <p className={`${getSecondaryTextColor()} text-sm`}>No subject data available</p>
          </div>
        )}
      </div>
      
      {/* Legend */}
      {(hasFailingSubjects || hasWarningSubjects) && (
        <div className={`mt-3 pt-3 border-t ${getDividerColor()}`}>
          <div className={`flex flex-wrap gap-3 text-[10px] ${getSecondaryTextColor()}`}>
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
              <div className={`h-3 w-3 rounded border-2 border-transparent ${getCardBackgroundColor()}`}></div>
              <span>Good (&gt;75%)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectPerformance;