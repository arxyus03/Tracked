import React from 'react';
import { Link } from 'react-router-dom';

const HandledSubjectCard = ({ subject, getBorderColor, getTextColor, isDarkMode = false }) => {
  const isCritical = subject.completionRate < 70;
  const isWarning = subject.completionRate >= 71 && subject.completionRate <= 79;
  const isGood = subject.completionRate >= 80;

  // Theme-based colors
  const getCardBackgroundColor = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-gray-50";
  };

  const getHoverBackgroundColor = () => {
    return isDarkMode ? "hover:bg-[#2A2A35]" : "hover:bg-gray-100";
  };

  const getSubjectTextColor = () => {
    return isDarkMode ? "text-white/80" : "text-gray-700";
  };

  const getSecondaryTextColor = () => {
    return isDarkMode ? "text-white/50" : "text-gray-500";
  };

  return (
    <Link 
      to={`/Class?code=${subject.subjectCode}`}
      className="block no-underline"
    >
      <div 
        className={`aspect-square rounded-lg p-2 flex flex-col items-center justify-center transition-all cursor-pointer ${getBorderColor(subject.completionRate)} ${getCardBackgroundColor()} ${getHoverBackgroundColor()}`}
        title={`${subject.subject} - ${subject.completionRate}% class performance (${subject.totalStudents || 0} students)`}
      >
        <p className={`text-[10px] sm:text-xs text-center font-medium mb-1 truncate w-full ${getSubjectTextColor()}`}>
          {subject.subject}
        </p>
        
        <p className={`text-[8px] mb-1 ${getSecondaryTextColor()}`}>
          {subject.section || 'No Section'}
        </p>
        
        <p className={`text-xl sm:text-2xl font-bold ${getTextColor(subject.completionRate)}`}>
          {subject.completionRate}%
        </p>
        
        <p className={`text-[8px] mt-1 ${getSecondaryTextColor()}`}>
          {subject.total || 0} activities
        </p>
        
        <div className="mt-1 flex items-center gap-1">
          {isCritical && (
            <div className="flex items-center gap-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#A15353]"></div>
              <span className="text-[6px] text-[#A15353] font-medium">Low</span>
            </div>
          )}
          
          {isWarning && (
            <div className="flex items-center gap-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#FFA600]"></div>
              <span className="text-[6px] text-[#FFA600] font-medium">Average</span>
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
};

export default HandledSubjectCard;