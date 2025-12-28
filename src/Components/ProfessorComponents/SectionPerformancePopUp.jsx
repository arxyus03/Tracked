// SectionPerformancePopup.jsx
import React from 'react';

const SectionPerformancePopup = ({ 
  isOpen, 
  onClose, 
  sectionData, 
  weekData 
}) => {
  if (!isOpen || !sectionData || !weekData) return null;

  const { sectionName, currentScore, previousScore, performanceChange } = sectionData;
  const { week, score, reasons } = weekData;

  // Determine performance trend
  const trend = performanceChange > 0 ? 'improved' : performanceChange < 0 ? 'declined' : 'stable';
  const trendColor = performanceChange > 0 ? 'text-[#00A15D]' : performanceChange < 0 ? 'text-[#FF5555]' : 'text-[#FFA600]';
  const trendIcon = performanceChange > 0 ? '↑' : performanceChange < 0 ? '↓' : '→';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-[#23232C] rounded-xl border border-[#FFFFFF]/20 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#FFFFFF]/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#6366F1]"></div>
              <h2 className="text-lg font-bold text-white">Performance Analysis</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#3A3A45] rounded-lg transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[#FFFFFF]/60 mb-1">Section</div>
              <div className="font-medium text-white">{sectionName}</div>
              <div className="text-xs text-[#FFFFFF]/40">Week {week}</div>
            </div>
            
            <div className="text-right">
              <div className="text-xs text-[#FFFFFF]/60 mb-1">Score</div>
              <div className="text-xl font-bold text-white">{score}%</div>
              <div className={`text-xs ${trendColor}`}>
                {trendIcon} {Math.abs(performanceChange)}% {trend}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="mb-4">
            <h3 className="font-medium text-white mb-3">Key Performance Factors</h3>
            <div className="space-y-3">
              {reasons?.map((reason, index) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-[#2A2A35]/50 rounded">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${reason.impact === 'positive' ? 'bg-[#00A15D]' : reason.impact === 'negative' ? 'bg-[#FF5555]' : 'bg-[#FFA600]'}`}></div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white mb-1">{reason.factor}</div>
                    <div className="text-xs text-[#FFFFFF]/60">{reason.description}</div>
                    {reason.value && (
                      <div className={`text-xs mt-1 ${reason.valueColor}`}>{reason.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-[#2A2A35]/30 p-2 rounded text-center">
              <div className="text-xs text-[#FFFFFF]/60 mb-1">Previous</div>
              <div className="text-sm font-medium text-white">
                {previousScore ? `${previousScore}%` : 'N/A'}
              </div>
            </div>
            
            <div className="bg-[#2A2A35]/30 p-2 rounded text-center">
              <div className="text-xs text-[#FFFFFF]/60 mb-1">Change</div>
              <div className={`text-sm font-medium ${trendColor}`}>
                {trendIcon} {Math.abs(performanceChange)}%
              </div>
            </div>
            
            <div className="bg-[#2A2A35]/30 p-2 rounded text-center">
              <div className="text-xs text-[#FFFFFF]/60 mb-1">Status</div>
              <div className={`text-sm font-medium ${trendColor} capitalize`}>
                {trend}
              </div>
            </div>
          </div>

          <div className="text-xs text-[#FFFFFF]/40 text-center">
            Analysis based on activity performance, submissions, and attendance
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#FFFFFF]/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm bg-[#6366F1] text-white font-medium rounded hover:bg-[#767EE0] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionPerformancePopup;