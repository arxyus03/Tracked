import React, { useState, useMemo, useRef } from 'react';
import Analytics from '../../assets/LineGraph.svg';
import WeekPerformancePopup from './WeekPerformancePopup';

const PerformanceLineChart = ({ performanceTrend, studentId, subjectCode }) => {
  const [hoveredWeek, setHoveredWeek] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedWeekData, setSelectedWeekData] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  // Validate and format performanceTrend data to prevent NaN errors
  const validatedPerformanceTrend = useMemo(() => {
    if (!performanceTrend || !Array.isArray(performanceTrend)) {
      return [];
    }
    
    // Filter out invalid data and ensure all values are numbers
    return performanceTrend
      .filter(week => week && typeof week === 'object')
      .map(week => ({
        week: Number(week.week) || 0,
        score: Number(week.score) || 0,
        activities: Number(week.activities) || 0,
        submitted: Number(week.submitted) || 0,
        completion_rate: Number(week.completion_rate) || 0,
        average_score: Number(week.average_score) || 0,
        late: Number(week.late) || 0
      }))
      .filter(week => week.week > 0) // Remove weeks with invalid week numbers
      .sort((a, b) => a.week - b.week); // Sort by week number
  }, [performanceTrend]);

  // Use validated data
  const weeks = validatedPerformanceTrend;

  // Calculate trend insights with safety checks
  const trendInsights = useMemo(() => {
    if (weeks.length === 0) {
      return {
        currentWeekScore: 0,
        previousWeekScore: 0,
        trend: 'stable',
        trendPercentage: 0,
        highestWeek: null,
        lowestWeek: null,
        currentWeekNumber: 0
      };
    }

    const currentWeek = weeks[weeks.length - 1];
    const previousWeek = weeks[weeks.length - 2] || currentWeek;
    
    // Calculate trend percentage with validation
    let trendPercentage = 0;
    if (previousWeek.score > 0) {
      const calculatedPercentage = ((currentWeek.score - previousWeek.score) / previousWeek.score * 100);
      trendPercentage = isNaN(calculatedPercentage) ? 0 : Number(calculatedPercentage.toFixed(1));
    }
    
    // Find highest and lowest weeks safely
    const highestWeek = weeks.reduce((max, week) => {
      if (!max || week.score > max.score) return week;
      return max;
    }, weeks[0]);
    
    const lowestWeek = weeks.reduce((min, week) => {
      if (!min || week.score < min.score) return week;
      return min;
    }, weeks[0]);

    return {
      currentWeekScore: currentWeek.score,
      previousWeekScore: previousWeek.score,
      trend: currentWeek.score > previousWeek.score ? 'up' : 
             currentWeek.score < previousWeek.score ? 'down' : 'stable',
      trendPercentage: Math.abs(trendPercentage),
      highestWeek,
      lowestWeek,
      currentWeekNumber: currentWeek.week
    };
  }, [weeks]);

  // Chart dimensions - add validation for innerWidth calculation
  const chartHeight = 280;
  const margin = { top: 25, right: 30, bottom: 40, left: 40 };
  
  // Ensure innerWidth calculation doesn't divide by zero
  const innerWidth = weeks.length > 1 ? Math.max(1200, weeks.length * 80) : 1200;
  const innerHeight = chartHeight - margin.top - margin.bottom;
  
  const maxScore = 100;

  // Handle mouse events for hover
  const handleMouseEnter = (week, event) => {
    setHoveredWeek(week);
    
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    setTooltipPosition({ 
      x: mouseX, 
      y: mouseY 
    });
  };

  // Handle click event for popup
  const handleWeekClick = (week) => {
    const weekData = weeks.find(w => w.week === week);
    if (weekData) {
      // Calculate change from previous week
      const weekIndex = weeks.findIndex(w => w.week === week);
      const previousWeekData = weeks[weekIndex - 1];
      
      let performanceChange = 0;
      if (previousWeekData && previousWeekData.score > 0) {
        const calculatedChange = ((weekData.score - previousWeekData.score) / previousWeekData.score * 100);
        performanceChange = isNaN(calculatedChange) ? 0 : Number(calculatedChange.toFixed(1));
      }
      
      setSelectedWeekData({
        ...weekData,
        performanceChange
      });
      setIsPopupOpen(true);
    }
  };

  // Calculate positions with validation
  const xScale = (week) => {
    if (weeks.length <= 1) return 0;
    const weekNumber = Number(week) || 1;
    const minWeek = weeks[0].week;
    const maxWeek = weeks[weeks.length - 1].week;
    const weekRange = maxWeek - minWeek;
    
    if (weekRange === 0) return 0;
    
    return ((weekNumber - minWeek) / weekRange) * innerWidth;
  };

  const yScale = (score) => {
    const validatedScore = Math.max(0, Math.min(100, Number(score) || 0));
    return innerHeight - (validatedScore / maxScore) * innerHeight;
  };

  // Create smooth line path with validation
  const createSmoothLinePath = () => {
    if (weeks.length < 2) return '';
    
    let path = `M ${margin.left + xScale(weeks[0].week)} ${margin.top + yScale(weeks[0].score)}`;
    
    for (let i = 1; i < weeks.length; i++) {
      const prevX = margin.left + xScale(weeks[i-1].week);
      const prevY = margin.top + yScale(weeks[i-1].score);
      const currX = margin.left + xScale(weeks[i].week);
      const currY = margin.top + yScale(weeks[i].score);
      
      // Validate coordinates are numbers
      if (isNaN(prevX) || isNaN(prevY) || isNaN(currX) || isNaN(currY)) {
        continue;
      }
      
      const cp1x = prevX + (currX - prevX) * 0.25;
      const cp1y = prevY;
      const cp2x = prevX + (currX - prevX) * 0.75;
      const cp2y = currY;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${currX} ${currY}`;
    }
    
    return path;
  };

  const linePath = createSmoothLinePath();
  const isCurrentWeek = (weekNumber) => weekNumber === trendInsights.currentWeekNumber;
  const hoveredWeekData = weeks.find(w => w.week === hoveredWeek);
  
  // Simple trend arrow component
  const TrendArrow = ({ direction, color, size = 4 }) => {
    if (direction === 'up') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-${size} h-${size}`} style={{ color }}>
          <path d="M12 4l-8 8h6v8h4v-8h6z"/>
        </svg>
      );
    } else if (direction === 'down') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-${size} h-${size}`} style={{ color }}>
          <path d="M12 20l8-8h-6V4h-4v8H4z"/>
        </svg>
      );
    }
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-${size} h-${size}`} style={{ color }}>
        <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2"/>
      </svg>
    );
  };

  // Collapse/Expand toggle function
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    setHoveredWeek(null);
  };

  // Function to handle mouse move for tooltip positioning
  const handleMouseMove = (event) => {
    if (!hoveredWeek) return;
    
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    setTooltipPosition({ 
      x: mouseX, 
      y: mouseY 
    });
  };

  // Close popup
  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedWeekData(null);
  };

  if (weeks.length === 0) {
    return (
      <div className="bg-[#15151C] rounded-xl border border-[#FFFFFF]/10">
        <div className="p-4 border-b border-[#FFFFFF]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <img 
                  src={Analytics} 
                  alt="Analytics" 
                  className="w-5 h-5"
                />
              </div>
              <h3 className="font-bold text-lg text-[#FFFFFF]">Performance Trend</h3>
            </div>
            <div className="text-sm text-[#FFFFFF]/60">No data available</div>
          </div>
        </div>
        <div className="h-48 flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center mx-auto mb-3">
              <img 
                src={Analytics} 
                alt="Analytics" 
                className="w-8 h-8 opacity-40"
              />
            </div>
            <p className="text-[#FFFFFF]/60">No performance data available for this subject</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#15151C] rounded-xl border border-[#FFFFFF]/10 relative">
        {/* Header - Always visible */}
        <div className="p-4 border-b border-[#FFFFFF]/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center gap-3 mb-3 md:mb-0">
              <div className="flex items-center justify-center">
                <img 
                  src={Analytics} 
                  alt="Analytics" 
                  className="w-5 h-5"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#FFFFFF]">Performance Trend</h3>
                <p className="text-sm text-[#FFFFFF]/60">Weekly progress overview - Click any point for details</p>
              </div>
            </div>
            
            {/* Right side with stats and collapse button */}
            <div className="flex items-center gap-3">
              {/* Current week stats */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-[#FFFFFF]/60">Current Week</div>
                  <div className="font-bold text-base text-[#FFFFFF]">{trendInsights.currentWeekScore}%</div>
                </div>
                <div className={`p-1.5 rounded-lg ${trendInsights.trend === 'up' ? 'bg-[#00A15D]/10' : trendInsights.trend === 'down' ? 'bg-[#FF5555]/10' : 'bg-[#FFA600]/10'}`}>
                  <div className={`w-3 h-3 flex items-center justify-center ${trendInsights.trend === 'up' ? 'text-[#00A15D]' : trendInsights.trend === 'down' ? 'text-[#FF5555]' : 'text-[#FFA600]'}`}>
                    <TrendArrow 
                      direction={trendInsights.trend} 
                      color={trendInsights.trend === 'up' ? '#00A15D' : trendInsights.trend === 'down' ? '#FF5555' : '#FFA600'}
                      size={3}
                    />
                  </div>
                </div>
              </div>
              
              {/* Collapse/Expand button */}
              <button
                onClick={toggleCollapse}
                className="p-1.5 rounded-lg bg-[#2A2A35] hover:bg-[#3A3A45] transition-all duration-200 cursor-pointer"
                aria-label={isCollapsed ? "Expand chart" : "Collapse chart"}
              >
                <div className="w-4 h-4 flex items-center justify-center">
                  {isCollapsed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF" className="w-3 h-3">
                      <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF" className="w-3 h-3">
                      <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
                    </svg>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Content */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'
        }`}>
          <div className="p-4 pt-0">
            {/* Chart container */}
            <div 
              className="relative pt-4" 
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoveredWeek(null)}
            >
              <div style={{ width: innerWidth + margin.left + margin.right, minWidth: '100%' }}>
                <svg 
                  ref={svgRef}
                  width="100%" 
                  height={chartHeight} 
                  viewBox={`0 0 ${innerWidth + margin.left + margin.right} ${chartHeight}`}
                  className="relative"
                >
                  <defs>
                    <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15"/>
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0"/>
                    </linearGradient>
                    
                    <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1"/>
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.8"/>
                    </linearGradient>
                  </defs>

                  {/* Grid lines */}
                  {[0, 25, 50, 75, 85, 100].map((score) => {
                    const y = margin.top + yScale(score);
                    if (isNaN(y)) return null;
                    
                    return (
                      <g key={`grid-${score}`}>
                        <line
                          x1={margin.left}
                          y1={y}
                          x2={innerWidth + margin.left}
                          y2={y}
                          stroke="#2A2A35"
                          strokeWidth={1}
                          strokeDasharray={score === 75 || score === 85 ? "5,5" : "2,2"}
                          opacity={0.5}
                        />
                        <text
                          x={margin.left - 10}
                          y={y}
                          textAnchor="end"
                          dominantBaseline="middle"
                          fill="#FFFFFF"
                          fontSize="10"
                          fontWeight={score === 75 || score === 85 ? "bold" : "normal"}
                          opacity={0.7}
                        >
                          {score}%
                        </text>
                      </g>
                    );
                  })}

                  {/* Orange line at 75% */}
                  <line
                    x1={margin.left}
                    y1={margin.top + yScale(75)}
                    x2={innerWidth + margin.left}
                    y2={margin.top + yScale(75)}
                    stroke="#FFA600"
                    strokeWidth="1.5"
                    strokeDasharray="5,5"
                    opacity={0.7}
                  />

                  {/* Green line at 85% */}
                  <line
                    x1={margin.left}
                    y1={margin.top + yScale(85)}
                    x2={innerWidth + margin.left}
                    y2={margin.top + yScale(85)}
                    stroke="#00A15D"
                    strokeWidth="1.5"
                    strokeDasharray="5,5"
                    opacity={0.7}
                  />

                  {/* Area under curve */}
                  {linePath && (
                    <path
                      d={`${linePath} L ${margin.left + xScale(weeks[weeks.length-1].week)} ${margin.top + innerHeight} L ${margin.left + xScale(weeks[0].week)} ${margin.top + innerHeight} Z`}
                      fill="url(#areaGradient)"
                    />
                  )}

                  {/* Performance line */}
                  {linePath && (
                    <path
                      d={linePath}
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  )}

                  {/* X-axis labels */}
                  {weeks.map((week, index) => {
                    if (index % 2 === 0) {
                      const x = margin.left + xScale(week.week);
                      if (isNaN(x)) return null;
                      
                      return (
                        <text
                          key={`label-${week.week}`}
                          x={x}
                          y={chartHeight - 10}
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontSize="10"
                          opacity={0.7}
                        >
                          Week {week.week}
                        </text>
                      );
                    }
                    return null;
                  })}

                  {/* Data points */}
                  {weeks.map((week) => {
                    const x = margin.left + xScale(week.week);
                    const y = margin.top + yScale(week.score);
                    
                    // Skip if coordinates are invalid
                    if (isNaN(x) || isNaN(y)) return null;
                    
                    const isHovered = hoveredWeek === week.week;
                    const isCurrent = isCurrentWeek(week.week);
                    const scoreColor = week.score >= 85 ? "#00A15D" : 
                                     week.score >= 75 ? "#FFA600" : "#FF5555";
                    
                    return (
                      <g key={`point-${week.week}`}>
                        {/* Hover area */}
                        <circle
                          cx={x}
                          cy={y}
                          r={16}
                          fill="transparent"
                          onMouseEnter={(e) => handleMouseEnter(week.week, e)}
                          onMouseLeave={() => setHoveredWeek(null)}
                          onClick={() => handleWeekClick(week.week)}
                          className="cursor-pointer hover:opacity-80"
                        />
                        
                        {/* Current week indicator */}
                        {isCurrent && (
                          <circle
                            cx={x}
                            cy={y}
                            r={isHovered ? 10 : 8}
                            fill="none"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                            strokeOpacity="0.8"
                          />
                        )}
                        
                        {/* Data point */}
                        <circle
                          cx={x}
                          cy={y}
                          r={isHovered ? 6 : 4}
                          fill={scoreColor}
                          stroke="#15151C"
                          strokeWidth={isCurrent ? "3" : "2"}
                          onMouseEnter={(e) => handleMouseEnter(week.week, e)}
                          onMouseLeave={() => setHoveredWeek(null)}
                          onClick={() => handleWeekClick(week.week)}
                          className="cursor-pointer hover:scale-110 transition-transform duration-150"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Performance zones legend */}
            <div className="mt-4 flex flex-wrap gap-2 text-xs justify-center">
              <div className="flex items-center gap-1 px-2 py-1 bg-[#2A2A35] rounded">
                <div className="w-2 h-2 rounded-full bg-[#FF5555]"></div>
                <span className="text-[#FF5555] text-xs">Below 75%</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-[#2A2A35] rounded">
                <div className="w-2 h-2 rounded-full bg-[#FFA600]"></div>
                <span className="text-[#FFA600] text-xs">75-84%</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-[#2A2A35] rounded">
                <div className="w-2 h-2 rounded-full bg-[#00A15D]"></div>
                <span className="text-[#00A15D] text-xs">85%+</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-[#2A2A35] rounded">
                <div className="w-3 h-3 rounded-full border border-[#FFFFFF] flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-[#FFFFFF]"></div>
                </div>
                <span className="text-[#FFFFFF] text-xs">Current Week</span>
              </div>
            </div>
          </div>
        </div>

        {/* Collapsed State Summary - Made smaller */}
        {isCollapsed && (
          <div className="p-4 border-t border-[#FFFFFF]/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* Left side - Stats summary */}
              <div className="flex items-center gap-4">
                <div className="text-left">
                  <div className="text-xs text-[#FFFFFF]/60">Highest Score</div>
                  <div className="font-bold text-base text-[#00A15D]">{trendInsights.highestWeek?.score || 0}%</div>
                </div>
                
                <div className="text-left">
                  <div className="text-xs text-[#FFFFFF]/60">Lowest Score</div>
                  <div className="font-bold text-base text-[#FF5555]">{trendInsights.lowestWeek?.score || 0}%</div>
                </div>
                
                <div className="text-left">
                  <div className="text-xs text-[#FFFFFF]/60">Trend</div>
                  <div className={`font-bold text-base ${trendInsights.trend === 'up' ? 'text-[#00A15D]' : trendInsights.trend === 'down' ? 'text-[#FF5555]' : 'text-[#FFA600]'}`}>
                    {trendInsights.trend === 'up' ? '↑' : trendInsights.trend === 'down' ? '↓' : '→'} {trendInsights.trendPercentage}%
                  </div>
                </div>
              </div>
              
              {/* Right side - Weeks info */}
              <div className="text-right">
                <div className="text-xs text-[#FFFFFF]/60">
                  {weeks.length} weeks tracked
                </div>
                <div className="text-xs text-[#FFFFFF]/40">
                  Week {trendInsights.currentWeekNumber} current
                </div>
              </div>
            </div>
          </div>
        )}

        {/* External Tooltip */}
        {hoveredWeekData && !isCollapsed && (
          <div 
            ref={tooltipRef}
            className="fixed bg-[#23232C] border border-[#FFFFFF]/20 rounded-lg p-3 shadow-2xl z-50 pointer-events-none transition-all duration-150"
            style={{
              left: `${tooltipPosition.x + 10}px`,
              top: `${tooltipPosition.y - 100}px`,
              transform: 'translateX(-50%)',
              minWidth: '140px'
            }}
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#FFFFFF] text-sm font-semibold">Week {hoveredWeekData.week}</span>
                {isCurrentWeek(hoveredWeekData.week) && (
                  <span className="text-xs text-[#FFFFFF] font-medium bg-[#6366F1] px-2 py-0.5 rounded">
                    Current Week
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${hoveredWeekData.score >= 85 ? "bg-[#00A15D]" : 
                  hoveredWeekData.score >= 75 ? "bg-[#FFA600]" : "bg-[#FF5555]"}`} />
                <span className={`text-lg font-bold ${hoveredWeekData.score >= 85 ? "text-[#00A15D]" : 
                  hoveredWeekData.score >= 75 ? "text-[#FFA600]" : "text-[#FF5555]"}`}>
                  {hoveredWeekData.score}%
                </span>
              </div>
              <div className="text-[#FFFFFF]/60 text-xs mt-1">
                {hoveredWeekData.activities} activities completed
              </div>
              <div className="text-[#FFFFFF]/40 text-xs mt-2">
                Click for detailed analysis
              </div>
            </div>
            
            {/* Tooltip arrow */}
            <div className="absolute w-2 h-2 bg-[#23232C] border-r border-b border-[#FFFFFF]/20 
              transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
          </div>
        )}
      </div>

      {/* Week Performance Popup */}
      <WeekPerformancePopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        weekData={selectedWeekData}
        studentId={studentId}
        subjectCode={subjectCode}
      />
    </>
  );
};

export default PerformanceLineChart;