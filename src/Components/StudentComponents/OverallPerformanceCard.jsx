import React from 'react';

// Import assets
import PerformanceIcon from '../../assets/SubjectPerformance.svg';

const OverallPerformanceCard = ({ 
  overallPerformance = 0, 
  subjectPerformance = [], 
  tasksDone = 0, 
  totalTasks = 0,
  submissionRate = 0 
}) => {
  
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

  return (
    <div className="lg:col-span-2 bg-[#15151C] rounded-lg shadow p-3 border-2 border-[#15151C]">
      <div className="flex items-center mb-3">
        <div className={`flex justify-center items-center h-6 w-6 rounded mr-1.5 ${getOverallPerformanceIconColor(overallPerformance)}`}>
          <img src={PerformanceIcon} alt="Performance" className="h-4 w-4" />
        </div>
        <h2 className="font-bold text-sm text-white">Overall Performance</h2>
      </div>

      <div className="text-center mb-4">
        <div className="mb-2">
          <p className={`text-4xl font-bold ${getOverallPerformanceColor(overallPerformance)}`}>
            {overallPerformance}%
          </p>
        </div>
        <p className="text-xs text-white/60 mb-3">Average of All Subjects</p>
        
        {/* Performance Rating - Improved visibility */}
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white ${getOverallPerformanceBgColor(overallPerformance)}`}>
          {getOverallPerformanceStatus(overallPerformance)}
        </div>
      </div>

      {/* Performance Breakdown with improved layout */}
      <div className="space-y-2 bg-[#23232C]/30 rounded-lg p-3 border border-white/10">
        <div className="flex justify-between items-center">
          <span className="text-xs text-white/70">Subjects Enrolled:</span>
          <span className="text-xs font-bold text-white">
            {subjectPerformance.length}
            <span className="text-white/50 ml-1 font-normal">subjects</span>
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-white/70">Completed Tasks:</span>
          <span className="text-xs font-bold text-[#00A15D]">
            {tasksDone}
            <span className="text-white/50 mx-1 font-normal">/</span>
            <span className="text-white font-normal">{totalTasks}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default OverallPerformanceCard;