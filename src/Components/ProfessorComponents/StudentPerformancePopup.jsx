import React from 'react';
import ArrowUp from '../../assets/ArrowUp.svg';
import ArrowDown from '../../assets/ArrowDown.svg'; 

const StudentPerformancePopup = ({ isOpen, onClose, studentData, weekData }) => {
  if (!isOpen || !studentData || !weekData) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#15151C] rounded-xl border border-[#FFFFFF]/20 p-5 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Student Performance</h3>
            <p className="text-xs text-white/60">Week {weekData.week}</p>
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
              <p className="text-xs text-white/60">Week {weekData.week} Score</p>
              <p className="text-2xl font-bold text-white">{weekData.score}%</p>
            </div>
            {studentData.previousScore && (
              <div className={`text-xs ${studentData.performanceChange > 0 ? 'text-[#00A15D]' : 'text-[#FF5555]'}`}>
                <div className="flex items-center gap-1">
                  {studentData.performanceChange > 0 ? (
                    <img 
                      src={ArrowUp} 
                      alt="Up" 
                      className="w-10 h-10"
                      style={{ 
                        filter: 'brightness(0) saturate(100%) invert(47%) sepia(22%) saturate(1283%) hue-rotate(105deg) brightness(92%) contrast(101%)' 
                      }}
                    />
                  ) : (
                    <img 
                      src={ArrowDown} 
                      alt="Down" 
                      className="w-10 h-10"
                      style={{ 
                        filter: 'brightness(0) saturate(100%) invert(42%) sepia(57%) saturate(2487%) hue-rotate(338deg) brightness(103%) contrast(101%)' 
                      }}
                    />
                  )}
                  <span className='text-xl'>{Math.abs(studentData.performanceChange)}%</span>
                </div>
                <p className="text-[10px] text-white/60 mt-0.5">from previous week</p>
              </div>
            )}
          </div>
        </div>

        {/* Compact Student Info */}
        <div className="mb-5 p-3 bg-[#23232C] rounded-lg">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/60">Student Name</p>
                <p className="text-sm font-medium text-white">{studentData.studentName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/60">Student #</p>
                <p className="text-sm font-medium text-white">{studentData.studentNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <p className="text-xs text-white/60">Performance Zone:</p>
              <p className={`text-xs font-bold ${
                studentData.performanceZone === "Failing" ? "text-[#FF5555]" :
                studentData.performanceZone === "Close to Failing" ? "text-[#FFA600]" :
                "text-[#00A15D]"
              }`}>
                {studentData.performanceZone}
              </p>
            </div>
          </div>
        </div>

        {/* Performance Factors */}
        <div className="mb-5">
          <h4 className="text-white font-bold mb-2 text-xs">Key Performance Factors</h4>
          <div className="space-y-1.5">
            {weekData.reasons.map((reason, index) => (
              <div key={index} className="p-2 bg-[#23232C] rounded-lg">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-white font-medium text-xs">{reason.factor}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    reason.impact === 'positive' 
                      ? 'bg-[#00A15D]/20 text-[#00A15D]'
                      : 'bg-[#FF5555]/20 text-[#FF5555]'
                  }`}>
                    {reason.impact === 'positive' ? 'Positive' : 'Needs Attention'}
                  </span>
                </div>
                <p className="text-[11px] text-white/80 leading-tight">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div>
          <button
            onClick={onClose}
            className="w-full py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformancePopup;