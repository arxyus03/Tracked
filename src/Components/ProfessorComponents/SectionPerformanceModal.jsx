import React from 'react';
import ArrowUp from '../../assets/ArrowUp.svg';
import ArrowDown from '../../assets/ArrowDown.svg';

const SectionPerformanceModal = ({ isOpen, onClose, section, weekData, color }) => {
  if (!isOpen || !section || !weekData) return null;

  // Calculate performance change if previous week exists
  const getPerformanceChange = () => {
    // In a real app, we would have access to previous week's data
    // For now, we'll simulate a random change
    const change = Math.random() > 0.5 ? 3 : -2;
    return {
      change,
      direction: change > 0 ? 'up' : 'down'
    };
  };

  const performanceChange = getPerformanceChange();

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#15151C] rounded-xl border border-[#FFFFFF]/20 p-5 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Section Performance Analysis</h3>
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
            {performanceChange.change !== 0 && (
              <div className={`text-xs ${performanceChange.direction === 'up' ? 'text-[#00A15D]' : 'text-[#FF5555]'}`}>
                <div className="flex items-center gap-1">
                  {performanceChange.direction === 'up' ? (
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
                  <span className='text-xl'>{Math.abs(performanceChange.change)}%</span>
                </div>
                <p className="text-[10px] text-white/60 mt-0.5">from previous week</p>
              </div>
            )}
          </div>
        </div>

        {/* Compact Section Info */}
        <div className="mb-5 p-3 bg-[#23232C] rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/60">Section</p>
              <p className="text-sm font-medium text-white">{section}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/60">Activities Completed</p>
              <p className="text-sm font-medium text-white">{weekData.activities}</p>
            </div>
          </div>
        </div>

        {/* Performance Analysis */}
        <div className="mb-5">
          <h4 className="text-white font-bold mb-2 text-xs">Performance Analysis</h4>
          <div className="space-y-1.5">
            <div className="p-3 bg-[#23232C] rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-white font-medium text-xs">{section} - Week {weekData.week}</span>
              </div>
              <p className="text-[11px] text-white/80 leading-tight">{weekData.reason}</p>
            </div>
          </div>
        </div>

        {/* Recommendations - Simplified without circles */}
        <div className="mb-5">
          <h4 className="text-white font-bold mb-2 text-xs">Recommendations</h4>
          <div className="space-y-2">
            {weekData.score >= 76 ? (
              <>
                <div className="p-3 bg-[#00A15D]/10 rounded-lg border border-[#00A15D]/20">
                  <div className="flex items-start gap-2">
                    <p className="text-xs text-[#00A15D] leading-tight font-medium">
                      • Continue current teaching strategies - they're working well for this section!
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-[#00A15D]/10 rounded-lg border border-[#00A15D]/20">
                  <div className="flex items-start gap-2">
                    <p className="text-xs text-[#00A15D] leading-tight font-medium">
                      • Consider introducing advanced topics or enrichment activities for high-performing students
                    </p>
                  </div>
                </div>
              </>
            ) : weekData.score >= 71 ? (
              <>
                <div className="p-3 bg-[#FFA600]/10 rounded-lg border border-[#FFA600]/20">
                  <div className="flex items-start gap-2">
                    <p className="text-xs text-[#FFA600] leading-tight font-medium">
                      • Review challenging concepts and provide additional examples to clarify misunderstandings
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-[#FFA600]/10 rounded-lg border border-[#FFA600]/20">
                  <div className="flex items-start gap-2">
                    <p className="text-xs text-[#FFA600] leading-tight font-medium">
                      • Schedule additional review sessions before the next assessment
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 bg-[#FF5555]/10 rounded-lg border border-[#FF5555]/20">
                  <div className="flex items-start gap-2">
                    <p className="text-xs text-[#FF5555] leading-tight font-medium">
                      • Consider adjusting teaching methods or providing alternative explanations for complex topics
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-[#FF5555]/10 rounded-lg border border-[#FF5555]/20">
                  <div className="flex items-start gap-2">
                    <p className="text-xs text-[#FF5555] leading-tight font-medium">
                      • Schedule mandatory support sessions or one-on-one help for struggling students
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
            className="w-full py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-colors text-sm font-medium"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionPerformanceModal;