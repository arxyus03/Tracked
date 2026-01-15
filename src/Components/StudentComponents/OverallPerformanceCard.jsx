import React, { useState, useEffect } from 'react';

// Import assets
import PerformanceIcon from '../../assets/SubjectPerformance.svg';

const OverallPerformanceCard = ({ 
  overallPerformance = 0, 
  subjectPerformance = [], 
  tasksDone = 0, 
  totalTasks = 0,
  isDarkMode = false 
}) => {
  const [localDarkMode, setLocalDarkMode] = useState(isDarkMode);
  
  useEffect(() => {
    setLocalDarkMode(isDarkMode);
  }, [isDarkMode]);

  // Function to get overall performance color
  const getOverallPerformanceColor = (percentage) => {
    if (percentage >= 75) return 'text-[#00A15D]';
    if (percentage >= 50) return 'text-[#FFA600]';
    return 'text-[#A15353]';
  };

  // Function to get overall performance background color
  const getOverallPerformanceBgColor = (percentage) => {
    if (percentage >= 75) return 'bg-[#00A15D]';
    if (percentage >= 50) return 'bg-[#FFA600]';
    return 'bg-[#A15353]';
  };

  // Function to get overall performance status text
  const getOverallPerformanceStatus = (percentage) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 75) return 'Good';
    if (percentage >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  // Function to get overall performance icon color
  const getOverallPerformanceIconColor = (percentage) => {
    if (percentage >= 75) return 'text-[#00A15D]';
    if (percentage >= 50) return 'text-[#FFA600]';
    return 'text-[#A15353]';
  };

  // Theme-based colors
  const getBackgroundColor = () => {
    return localDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getBorderColor = () => {
    return localDarkMode ? "border-[#15151C]" : "border-gray-200";
  };

  const getTextColor = () => {
    return localDarkMode ? "text-white" : "text-gray-900";
  };

  const getSecondaryTextColor = () => {
    return localDarkMode ? "text-white/80" : "text-gray-600";
  };

  const getCardBackgroundColor = () => {
    return localDarkMode ? "bg-[#23232C]/30" : "bg-gray-50";
  };

  const getCardBorderColor = () => {
    return localDarkMode ? "border-white/10" : "border-gray-200";
  };

  return (
    <div className={`lg:col-span-2 ${getBackgroundColor()} rounded-lg shadow p-3 border-2 ${getBorderColor()}`}>
      <div className="flex items-center mb-3">
        <div className={`flex justify-center items-center h-6 w-6 rounded mr-1.5 ${getOverallPerformanceIconColor(overallPerformance)}`}>
          {/* FIXED: Changed from invert(0.2) to invert(0.5) for light mode */}
          <img src={PerformanceIcon} alt="Performance" className="h-4 w-4" style={{ filter: localDarkMode ? 'none' : 'invert(0.5)' }} />
        </div>
        <h2 className={`font-bold text-sm ${getTextColor()}`}>Overall Performance</h2>
      </div>

      <div className="text-center mb-4">
        <div className="mb-2">
          <p className={`text-4xl font-bold ${getOverallPerformanceColor(overallPerformance)}`}>
            {overallPerformance}%
          </p>
        </div>
        <p className={`text-xs ${getSecondaryTextColor()} mb-3`}>Average of All Subjects</p>
        
        {/* Performance Rating - Improved visibility */}
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${getOverallPerformanceBgColor(overallPerformance)}`}>
          {getOverallPerformanceStatus(overallPerformance)}
        </div>
      </div>

      {/* Performance Breakdown with improved layout */}
      <div className={`space-y-2 ${getCardBackgroundColor()} rounded-lg p-3 border ${getCardBorderColor()}`}>
        <div className="flex justify-between items-center">
          <span className={`text-xs ${getSecondaryTextColor()}`}>Subjects Enrolled:</span>
          <span className={`text-xs font-bold ${getTextColor()}`}>
            {subjectPerformance.length}
            <span className={`${getSecondaryTextColor()} ml-1 font-normal`}>subjects</span>
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-xs ${getSecondaryTextColor()}`}>Completed Tasks:</span>
          <span className="text-xs font-bold text-[#00A15D]">
            {tasksDone}
            <span className={`${getSecondaryTextColor()} mx-1 font-normal`}>/</span>
            <span className={`${getTextColor()} font-normal`}>{totalTasks}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default OverallPerformanceCard;