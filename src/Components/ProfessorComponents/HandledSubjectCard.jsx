import React from 'react';
import { Link } from 'react-router-dom';

const HandledSubjectCard = ({ subject, getBorderColor, getTextColor }) => {
  const isCritical = subject.completionRate < 70;
  const isWarning = subject.completionRate >= 71 && subject.completionRate <= 79;
  const isGood = subject.completionRate >= 80;

  return (
    <Link 
      to={`/Class?code=${subject.subjectCode}`}
      className="block no-underline"
    >
      <div 
        className={`aspect-square rounded-lg p-2 flex flex-col items-center justify-center bg-[#23232C] hover:bg-[#2A2A35] transition-all cursor-pointer ${getBorderColor(subject.completionRate)}`}
        title={`${subject.subject} - ${subject.completionRate}% class performance (${subject.totalStudents || 0} students)`}
      >
        <p className="text-[10px] sm:text-xs text-center font-medium text-white/80 mb-1 truncate w-full">
          {subject.subject}
        </p>
        
        <p className="text-[8px] text-white/50 mb-1">
          {subject.section || 'No Section'}
        </p>
        
        <p className={`text-xl sm:text-2xl font-bold ${getTextColor(subject.completionRate)}`}>
          {subject.completionRate}%
        </p>
        
        <p className="text-[8px] text-white/50 mt-1">
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