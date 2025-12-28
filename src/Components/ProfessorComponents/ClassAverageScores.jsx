import React, { useState, useMemo, useRef, useEffect } from 'react';
import AnalyticsIcon from '../../assets/Analytics.svg';
import ArrowUp from '../../assets/ArrowUp.svg';
import ArrowDown from '../../assets/ArrowDown.svg';

const ClassAverageScores = ({ 
  activitiesData,
  selectedType = 'assignment',
  onTypeChange 
}) => {
  const [hoveredActivity, setHoveredActivity] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [maxScore, setMaxScore] = useState(100);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Activity type options
  const activityTypes = [
    { value: 'assignment', label: 'Assignments' },
    { value: 'quiz', label: 'Quizzes' },
    { value: 'activity', label: 'Activities'},
    { value: 'project', label: 'Projects' },
    { value: 'laboratory', label: 'Laboratory' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get activities for selected type
  const getFilteredActivities = useMemo(() => {
    let activities = [];
    switch (selectedType) {
      case 'assignment':
        activities = activitiesData.assignments || [];
        break;
      case 'quiz':
        activities = activitiesData.quizzes || [];
        break;
      case 'activity':
        activities = activitiesData.activities || [];
        break;
      case 'project':
        activities = activitiesData.projects || [];
        break;
      case 'laboratory':
        activities = activitiesData.laboratories || [];
        break;
      default:
        activities = activitiesData.assignments || [];
    }
    
    // Sort by task number if available, otherwise by title
    return activities.sort((a, b) => {
      const getNumber = (str) => {
        const match = str?.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      };
      
      const aNum = getNumber(a.task || a.title);
      const bNum = getNumber(b.task || b.title);
      return aNum - bNum;
    });
  }, [activitiesData, selectedType]);

  // Handle container resize and screen size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setContainerWidth(width);
        setIsMobile(width < 768);
      }
    };

    updateDimensions();
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    window.addEventListener('resize', updateDimensions);
    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  // Calculate max score for scaling
  useEffect(() => {
    const activities = getFilteredActivities;
    if (activities.length === 0) {
      setMaxScore(100);
      return;
    }

    let max = 100;
    activities.forEach(activity => {
      if (activity.score > max) max = activity.score;
    });

    if (max <= 100) {
      setMaxScore(Math.ceil(max / 10) * 10);
    } else {
      setMaxScore(100);
    }
  }, [getFilteredActivities]);

  // Handle mouse events
  const handleMouseEnter = (activity, clientX, clientY) => {
    if (!isExpanded) return;
    setHoveredActivity(activity);
    
    if (svgRef.current) {
      const svgRect = svgRef.current.getBoundingClientRect();
      setTooltipPosition({ 
        x: clientX - svgRect.left, 
        y: clientY - svgRect.top 
      });
    }
  };

  // Get selected activity type label
  const getSelectedLabel = () => {
    const selected = activityTypes.find(type => type.value === selectedType);
    return selected ? selected.label : 'Select Type';
  };

  // Handle activity type change
  const handleTypeChange = (type) => {
    onTypeChange && onTypeChange(type);
    setIsDropdownOpen(false);
  };

  // Get activity display name
  const getActivityDisplayName = (activity) => {
    if (activity.task) return activity.task;
    if (activity.title) return activity.title;
    return `Activity ${getFilteredActivities.indexOf(activity) + 1}`;
  };

  // Get activity short name for labels (responsive)
  const getShortName = (activity, index) => {
    const fullName = getActivityDisplayName(activity);
    
    if (isMobile) {
      if (fullName.length <= 8) return fullName;
      const match = fullName.match(/(\w+)\s*(\d+)/i);
      if (match) {
        return match[2] ? `#${match[2]}` : match[1].substring(0, 3);
      }
      return `A${index + 1}`;
    } else {
      if (fullName.length <= 12) return fullName;
      const match = fullName.match(/(\w+)\s*(\d+)/i);
      if (match) {
        return `${match[1].substring(0, 4)} ${match[2]}`;
      }
      return `Act ${index + 1}`;
    }
  };

  // Calculate chart layout (responsive)
  const calculateChartLayout = () => {
    const activities = getFilteredActivities;
    const chartHeight = isMobile ? 250 : 300;
    const margin = { 
      top: isMobile ? 20 : 30, 
      right: isMobile ? 10 : 20, 
      bottom: isMobile ? 60 : 80, 
      left: isMobile ? 40 : 60 
    };
    
    const availableWidth = Math.max(containerWidth - 40, 300);
    const chartWidth = availableWidth;
    
    if (activities.length === 0) {
      return {
        chartWidth,
        chartHeight,
        margin,
        barWidth: 0,
        spacing: 0,
        xScale: () => 0,
        yScale: () => 0
      };
    }

    const graphWidth = chartWidth - margin.left - margin.right;
    
    let baseBarWidth, baseSpacing;
    
    if (isMobile) {
      if (activities.length <= 3) {
        baseBarWidth = 40;
        baseSpacing = 30;
      } else if (activities.length <= 6) {
        baseBarWidth = 30;
        baseSpacing = 25;
      } else if (activities.length <= 10) {
        baseBarWidth = 25;
        baseSpacing = 20;
      } else if (activities.length <= 15) {
        baseBarWidth = 20;
        baseSpacing = 15;
      } else {
        baseBarWidth = 15;
        baseSpacing = 10;
      }
    } else {
      if (activities.length <= 3) {
        baseBarWidth = 60;
        baseSpacing = 80;
      } else if (activities.length <= 6) {
        baseBarWidth = 50;
        baseSpacing = 60;
      } else if (activities.length <= 10) {
        baseBarWidth = 40;
        baseSpacing = 50;
      } else if (activities.length <= 15) {
        baseBarWidth = 30;
        baseSpacing = 40;
      } else {
        baseBarWidth = 25;
        baseSpacing = 30;
      }
    }

    const totalWidthNeeded = activities.length * baseBarWidth + (activities.length - 1) * baseSpacing;
    
    let finalBarWidth = baseBarWidth;
    let finalSpacing = baseSpacing;
    
    if (totalWidthNeeded > graphWidth) {
      const scaleFactor = graphWidth / totalWidthNeeded;
      finalBarWidth = Math.max(10, baseBarWidth * scaleFactor);
      finalSpacing = Math.max(5, baseSpacing * scaleFactor);
    } else if (totalWidthNeeded < graphWidth) {
      const extraSpace = graphWidth - totalWidthNeeded;
      finalSpacing += extraSpace / Math.max(1, activities.length);
    }
    
    const totalActualWidth = activities.length * finalBarWidth + (activities.length - 1) * finalSpacing;
    const startX = margin.left + (graphWidth - totalActualWidth) / 2;

    const xScale = (index) => startX + index * (finalBarWidth + finalSpacing);

    const yScale = (score) => {
      const effectiveScore = Math.min(score, 100);
      return chartHeight - margin.bottom - (effectiveScore / maxScore) * (chartHeight - margin.top - margin.bottom);
    };

    return {
      chartWidth,
      chartHeight,
      margin,
      barWidth: finalBarWidth,
      spacing: finalSpacing,
      startX,
      xScale,
      yScale,
      totalActualWidth
    };
  };

  // Get color based on score (UPDATED to match new zones)
  const getScoreColor = (score) => {
    if (score >= 76) return "#00A15D";  // Passing (76%+)
    if (score >= 71) return "#FFA600";  // Close to failing (71-75%)
    return "#FF5555";  // Failing (70% and below)
  };

  // Get performance zone text
  const getPerformanceZone = (score) => {
    if (score >= 76) return "Passing";
    if (score >= 71) return "Close to Failing";
    return "Failing";
  };

  // Render score labels for y-axis (responsive)
  const renderScoreLabels = () => {
    const labels = [];
    let step = 20;
    
    if (maxScore <= 50) step = 10;
    if (maxScore <= 30) step = 5;
    if (isMobile && maxScore > 50) step = 25;
    
    if (isMobile) {
      if (maxScore <= 50) step = 20;
      if (maxScore <= 30) step = 10;
    }
    
    for (let score = 0; score <= maxScore; score += step) {
      if (score === 100) {
        labels.push({ score: 100, label: "100" });
      } else {
        labels.push({ score, label: score });
      }
    }
    
    return labels;
  };

  // Calculate chart layout
  const chartLayout = calculateChartLayout();
  const activities = getFilteredActivities;
  const {
    chartWidth,
    chartHeight,
    margin,
    barWidth,
    spacing,
    xScale,
    yScale
  } = chartLayout;

  // Calculate summary statistics (class average)
  const calculateSummary = () => {
    if (activities.length === 0) {
      return {
        average: 0,
        highest: 0,
        lowest: 0,
        total: 0,
        completed: 0
      };
    }
    
    const scores = activities.map(a => a.score || 0);
    const average = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    
    return {
      average,
      highest,
      lowest,
      total: activities.length,
      completed: activities.length // All activities have been scored
    };
  };

  const summary = calculateSummary();

  // Responsive font sizes
  const scoreLabelFontSize = isMobile ? "9" : "10";
  const barLabelFontSize = isMobile ? "10" : "11";
  const barScoreFontSize = isMobile ? "10" : "11";
  const activityLabelFontSize = isMobile ? "9" : "11";

  if (activities.length === 0) {
    const selectedTypeLabel = activityTypes.find(t => t.value === selectedType)?.label || selectedType;
    
    return (
      <div className="bg-[#15151C] rounded-xl border border-[#FFFFFF]/10">
        <div className="p-5 border-b border-[#FFFFFF]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <img 
                  src={AnalyticsIcon} 
                  alt="Analytics" 
                  className="w-5 h-5"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[#FFFFFF]">Class Average Scores</h3>
                <p className="text-sm text-[#FFFFFF]/60">View class average scores for different activities</p>
              </div>
            </div>
            
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between gap-2 px-3 py-2 bg-[#2A2A35] border border-[#3A3A45] rounded-lg text-sm text-[#FFFFFF] hover:bg-[#3A3A45] transition-all duration-200"
              >
                <span>{getSelectedLabel()}</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-48 bg-[#2A2A35] border border-[#3A3A45] rounded-lg shadow-lg">
                  {activityTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => handleTypeChange(type.value)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-[#3A3A45] transition-colors ${
                        selectedType === type.value 
                          ? 'text-[#767EE0] bg-[#3A3A45]' 
                          : 'text-[#FFFFFF]/80'
                      }`}
                    >
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="h-48 flex flex-col items-center justify-center gap-4">
          <div className="text-center">
            <div className="mb-3">
              <img 
                src={AnalyticsIcon} 
                alt="Analytics" 
                className="w-10 h-10 sm:w-12 sm:h-12 mx-auto opacity-40"
              />
            </div>
            <p className="text-sm sm:text-base text-[#FFFFFF]/60">No {selectedTypeLabel} data available</p>
            <p className="text-xs text-[#FFFFFF]/40 mt-2">Try selecting a different activity type</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#15151C] rounded-xl border border-[#FFFFFF]/10 relative">
      {/* Header - Always visible */}
      <div className="p-4 border-b border-[#FFFFFF]/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center gap-3 mb-3 md:mb-0">
            <div className="flex items-center justify-center">
              <img 
                src={AnalyticsIcon} 
                alt="Analytics" 
                className="w-5 h-5"
              />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#FFFFFF]">Class Average Scores</h3>
              <p className="text-sm text-[#FFFFFF]/60">View class average scores for different activities</p>
            </div>
          </div>
          
          {/* Right side with dropdown and collapse button */}
          <div className="flex items-center gap-3">
            {/* Activity type dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between gap-2 px-3 py-2 bg-[#2A2A35] border border-[#3A3A45] rounded-lg text-sm text-[#FFFFFF] hover:bg-[#3A3A45] transition-all duration-200"
              >
                <span>{getSelectedLabel()}</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-48 bg-[#2A2A35] border border-[#3A3A45] rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {activityTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => handleTypeChange(type.value)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-[#3A3A45] transition-colors ${
                        selectedType === type.value 
                          ? 'text-[#767EE0] bg-[#3A3A45]' 
                          : 'text-[#FFFFFF]/80'
                      }`}
                    >
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Collapse/Expand button - UPDATED with ArrowUp/ArrowDown SVGs */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg bg-[#2A2A35] hover:bg-[#3A3A45] transition-all duration-200 cursor-pointer"
              aria-label={isExpanded ? "Collapse chart" : "Expand chart"}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {isExpanded ? (
                  <img 
                    src={ArrowUp} 
                    alt="Collapse" 
                    className="w-4 h-4"
                  />
                ) : (
                  <img 
                    src={ArrowDown} 
                    alt="Expand" 
                    className="w-4 h-4"
                  />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-5 pt-0">
          {/* Chart container */}
          <div className="relative overflow-x-auto" ref={containerRef}>
            <div style={{ width: '100%', minWidth: '100%' }}>
              <svg 
                ref={svgRef}
                width="100%" 
                height={chartHeight} 
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="relative"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Performance zone backgrounds */}
                {/* Failing zone (below 70%) */}
                <rect
                  x={margin.left}
                  y={yScale(70)}
                  width={chartWidth - margin.left - margin.right}
                  height={chartHeight - margin.bottom - yScale(70)}
                  fill="#FF5555"
                  opacity="0.05"
                  rx="2"
                />
                
                {/* Close to failing zone (71-75%) */}
                <rect
                  x={margin.left}
                  y={yScale(75)}
                  width={chartWidth - margin.left - margin.right}
                  height={yScale(70) - yScale(75)}
                  fill="#FFA600"
                  opacity="0.05"
                  rx="2"
                />
                
                {/* Passing zone (76%+) */}
                <rect
                  x={margin.left}
                  y={margin.top}
                  width={chartWidth - margin.left - margin.right}
                  height={yScale(75) - margin.top}
                  fill="#00A15D"
                  opacity="0.05"
                  rx="2"
                />
                
                {/* Zone boundary lines */}
                {/* 70% line (Failing threshold) */}
                <line
                  x1={margin.left}
                  y1={yScale(70)}
                  x2={chartWidth - margin.right}
                  y2={yScale(70)}
                  stroke="#FF5555"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                  opacity="0.7"
                />
                
                {/* 75% line (Close to failing threshold) */}
                <line
                  x1={margin.left}
                  y1={yScale(75)}
                  x2={chartWidth - margin.right}
                  y2={yScale(75)}
                  stroke="#FFA600"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                  opacity="0.7"
                />
                
                {/* 76% line (Passing threshold) */}
                <line
                  x1={margin.left}
                  y1={yScale(76)}
                  x2={chartWidth - margin.right}
                  y2={yScale(76)}
                  stroke="#00A15D"
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                  opacity="0.7"
                />
                
                {/* Grid lines */}
                {renderScoreLabels().map(({ score, label }) => (
                  <g key={`grid-${score}`}>
                    <line
                      x1={margin.left}
                      y1={yScale(score)}
                      x2={chartWidth - margin.right}
                      y2={yScale(score)}
                      stroke="#2A2A35"
                      strokeWidth={1}
                      strokeDasharray={isMobile ? "1,1" : "2,2"}
                      opacity={0.5}
                    />
                    <text
                      x={margin.left - (isMobile ? 5 : 10)}
                      y={yScale(score)}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fill="#FFFFFF"
                      fontSize={scoreLabelFontSize}
                      opacity={0.7}
                    >
                      {label}%
                    </text>
                  </g>
                ))}

                {/* X-axis line */}
                <line
                  x1={margin.left}
                  y1={chartHeight - margin.bottom}
                  x2={chartWidth - margin.right}
                  y2={chartHeight - margin.bottom}
                  stroke="#2A2A35"
                  strokeWidth={2}
                />

                {/* Y-axis line */}
                <line
                  x1={margin.left}
                  y1={margin.top}
                  x2={margin.left}
                  y2={chartHeight - margin.bottom}
                  stroke="#2A2A35"
                  strokeWidth={2}
                />

                {/* Bars */}
                {activities.map((activity, index) => {
                  const x = xScale(index);
                  const y = yScale(activity.score || 0);
                  const barHeight = chartHeight - margin.bottom - y;
                  const isHovered = hoveredActivity?.id === activity.id;
                  const score = activity.score || 0;
                  const barColor = getScoreColor(score);
                  
                  return (
                    <g key={`bar-${activity.id}-${index}`}>
                      {/* Hover area */}
                      <rect
                        x={x - spacing/2}
                        y={margin.top}
                        width={barWidth + spacing}
                        height={chartHeight - margin.top - margin.bottom}
                        fill="transparent"
                        onMouseEnter={(e) => handleMouseEnter(activity, e.clientX, e.clientY)}
                        onMouseLeave={() => setHoveredActivity(null)}
                        className="cursor-pointer"
                      />
                      
                      {/* Bar shadow */}
                      <rect
                        x={x}
                        y={y + 2}
                        width={barWidth}
                        height={barHeight}
                        fill="#000000"
                        opacity="0.2"
                        rx={isMobile ? "1" : "2"}
                      />
                      
                      {/* Main bar */}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        fill={barColor}
                        opacity={isHovered ? 0.9 : 0.8}
                        rx={isMobile ? "1" : "2"}
                        onMouseEnter={(e) => handleMouseEnter(activity, e.clientX, e.clientY)}
                        onMouseLeave={() => setHoveredActivity(null)}
                        className="cursor-pointer transition-all duration-200 hover:opacity-100"
                      />
                      
                      {/* Score label on bar */}
                      {barHeight > (isMobile ? 15 : 20) && (
                        <text
                          x={x + barWidth / 2}
                          y={y - (isMobile ? 5 : 10)}
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontSize={barScoreFontSize}
                          fontWeight="bold"
                        >
                          {score}%
                        </text>
                      )}
                      
                      {/* Activity label at bottom */}
                      <text
                        x={x + barWidth / 2}
                        y={chartHeight - margin.bottom + (isMobile ? 15 : 20)}
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize={activityLabelFontSize}
                        opacity={0.9}
                        className="select-none"
                      >
                        {getShortName(activity, index)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Tooltip */}
          {hoveredActivity && (
            <div 
              className="absolute bg-[#23232C] border border-[#FFFFFF]/20 rounded-lg p-3 shadow-2xl z-10 pointer-events-none transition-all duration-150"
              style={{
                left: `clamp(20px, ${tooltipPosition.x + 20}px, calc(100% - 200px))`,
                top: `${tooltipPosition.y - 100}px`,
                transform: 'translateX(-50%)',
                minWidth: isMobile ? '140px' : '180px',
                maxWidth: isMobile ? '160px' : '200px'
              }}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: getScoreColor(hoveredActivity.score) }} />
                  <span className="text-xs text-[#FFFFFF]/60 capitalize">{selectedType}</span>
                </div>
                
                <div className="text-[#FFFFFF] font-semibold text-sm mb-1 truncate">
                  {getActivityDisplayName(hoveredActivity)}
                </div>
                
                {/* Performance zone */}
                <div className="mb-2">
                  <div className="text-xs text-[#FFFFFF]/60">Performance</div>
                  <div className="text-sm font-medium" style={{ color: getScoreColor(hoveredActivity.score) }}>
                    {getPerformanceZone(hoveredActivity.score)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between gap-3 sm:gap-4">
                  <div className="text-left">
                    <div className="text-xs text-[#FFFFFF]/60">Class Average</div>
                    <div 
                      className="text-base sm:text-lg font-bold"
                      style={{ color: getScoreColor(hoveredActivity.score) }}
                    >
                      {hoveredActivity.score || 0}%
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-[#FFFFFF]/60">Max Score</div>
                    <div className="text-base sm:text-lg font-bold text-[#FFFFFF]">
                      100%
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute w-2 h-2 bg-[#23232C] border-r border-b border-[#FFFFFF]/20 
                transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
            </div>
          )}

          {/* Performance zone legend - Centered at bottom */}
          <div className="mt-6 flex justify-center">
            <div className="flex flex-wrap justify-center gap-2 text-xs">
              <div className="flex items-center gap-1 px-2 py-1 bg-[#2A2A35] rounded">
                <div className="w-2 h-2 rounded-full bg-[#FF5555]"></div>
                <span className="text-[#FF5555] text-xs">Below 70% (Failing)</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-[#2A2A35] rounded">
                <div className="w-2 h-2 rounded-full bg-[#FFA600]"></div>
                <span className="text-[#FFA600] text-xs">71-75% (Close to Failing)</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-[#2A2A35] rounded">
                <div className="w-2 h-2 rounded-full bg-[#00A15D]"></div>
                <span className="text-[#00A15D] text-xs">76%+ (Passing)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsed State Summary - Simplified */}
      {!isExpanded && (
        <div className="p-4 border-t border-[#FFFFFF]/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left side - Stats summary only */}
            <div className="flex items-center gap-4">
              <div className="text-left">
                <div className="text-xs text-[#FFFFFF]/60">Class Average</div>
                <div className="font-bold text-base text-[#FFFFFF]">{summary.average}%</div>
              </div>
              
              <div className="text-left">
                <div className="text-xs text-[#FFFFFF]/60">Highest Average</div>
                <div className="font-bold text-base text-[#FFFFFF]">{summary.highest}%</div>
              </div>
              
              <div className="text-left">
                <div className="text-xs text-[#FFFFFF]/60">Lowest Average</div>
                <div className="font-bold text-base text-[#FFFFFF]">{summary.lowest}%</div>
              </div>
            </div>
            {/* Removed the right side with color dots and numbers */}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassAverageScores;