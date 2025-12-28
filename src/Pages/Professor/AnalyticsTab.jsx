import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import BackButton from '../../assets/BackButton.svg';
import ClassManagementIcon from "../../assets/ClassManagement.svg"; 
import Announcement from "../../assets/Announcement.svg";
import Classwork from "../../assets/Classwork.svg";
import GradeIcon from "../../assets/Grade.svg";
import AnalyticsIcon from "../../assets/Analytics.svg";
import AttendanceIcon from '../../assets/Attendance.svg';
import SubjectOverview from "../../assets/SubjectOverview.svg";
import LineGraphIcon from '../../assets/LineGraph.svg';

// PerformanceLineChart Component
const PerformanceLineChart = ({ performanceTrend }) => {
  const [hoveredWeek, setHoveredWeek] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isCollapsed, setIsCollapsed] = useState(true);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  // Calculate trend insights
  const trendInsights = useMemo(() => {
    if (performanceTrend.length === 0) {
      return {
        currentWeekScore: 0,
        previousWeekScore: 0,
        trend: 'stable',
        trendPercentage: 0,
        highestWeek: null,
        lowestWeek: null
      };
    }

    const currentWeek = performanceTrend[performanceTrend.length - 1];
    const previousWeek = performanceTrend[performanceTrend.length - 2] || currentWeek;
    
    const trendPercentage = previousWeek.score > 0 
      ? ((currentWeek.score - previousWeek.score) / previousWeek.score * 100).toFixed(1)
      : 0;
    
    const highestWeek = performanceTrend.reduce((max, week) => 
      week.score > max.score ? week : max
    );
    
    const lowestWeek = performanceTrend.reduce((min, week) => 
      week.score < min.score ? week : min
    );

    return {
      currentWeekScore: currentWeek.score,
      previousWeekScore: previousWeek.score,
      trend: currentWeek.score > previousWeek.score ? 'up' : currentWeek.score < previousWeek.score ? 'down' : 'stable',
      trendPercentage: Math.abs(trendPercentage),
      highestWeek,
      lowestWeek,
      currentWeekNumber: currentWeek.week
    };
  }, [performanceTrend]);

  // Chart dimensions
  const chartHeight = 280;
  const margin = { top: 25, right: 30, bottom: 40, left: 40 };
  const innerWidth = 1200;
  const innerHeight = chartHeight - margin.top - margin.bottom;
  
  const maxScore = 100;
  const weeks = performanceTrend;

  // Handle mouse events
  const handleMouseEnter = (week, event) => {
    setHoveredWeek(week);
    
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    setTooltipPosition({ 
      x: mouseX, 
      y: mouseY 
    });
  };

  // Calculate positions
  const xScale = (week) => (week - 1) * (innerWidth / (weeks.length - 1));
  const yScale = (score) => innerHeight - (score / maxScore) * innerHeight;

  // Create smooth line path
  const createSmoothLinePath = () => {
    if (weeks.length < 2) return '';
    
    let path = `M ${margin.left + xScale(weeks[0].week)} ${margin.top + yScale(weeks[0].score)}`;
    
    for (let i = 1; i < weeks.length; i++) {
      const prevX = margin.left + xScale(weeks[i-1].week);
      const prevY = margin.top + yScale(weeks[i-1].score);
      const currX = margin.left + xScale(weeks[i].week);
      const currY = margin.top + yScale(weeks[i].score);
      
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
        <div className={`w-${size} h-${size}`} style={{ color }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4l-8 8h6v8h4v-8h6z"/>
          </svg>
        </div>
      );
    } else if (direction === 'down') {
      return (
        <div className={`w-${size} h-${size}`} style={{ color }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 20l8-8h-6V4h-4v8H4z"/>
          </svg>
        </div>
      );
    }
    return (
      <div className={`w-${size} h-${size}`} style={{ color }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <line x1="4" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2"/>
        </svg>
      </div>
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

  if (weeks.length === 0) {
    return (
      <div className="bg-[#15151C] rounded-xl border border-[#FFFFFF]/10">
        <div className="p-4 border-b border-[#FFFFFF]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <img 
                  src={LineGraphIcon} 
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
                src={LineGraphIcon} 
                alt="Analytics" 
                className="w-8 h-8 opacity-40"
              />
            </div>
            <p className="text-[#FFFFFF]/60">Loading performance data...</p>
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
                src={LineGraphIcon} 
                alt="Analytics" 
                className="w-5 h-5"
              />
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#FFFFFF]">Performance Trend</h3>
              <p className="text-sm text-[#FFFFFF]/60">Weekly progress overview</p>
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
                {[0, 25, 50, 75, 85, 100].map((score) => (
                  <g key={`grid-${score}`}>
                    <line
                      x1={margin.left}
                      y1={margin.top + yScale(score)}
                      x2={innerWidth + margin.left}
                      y2={margin.top + yScale(score)}
                      stroke="#2A2A35"
                      strokeWidth={1}
                      strokeDasharray={score === 75 || score === 85 ? "5,5" : "2,2"}
                      opacity={0.5}
                    />
                    <text
                      x={margin.left - 10}
                      y={margin.top + yScale(score)}
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
                ))}

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
                    return (
                      <text
                        key={`label-${week.week}`}
                        x={margin.left + xScale(week.week)}
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
                        className="cursor-pointer"
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
                        className="cursor-pointer"
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
          </div>
          
          {/* Tooltip arrow */}
          <div className="absolute w-2 h-2 bg-[#23232C] border-r border-b border-[#FFFFFF]/20 
            transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
        </div>
      )}
    </div>
  );
};

// Main AnalyticsTab Component
export default function AnalyticsTab() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get("code");

  // Dummy performance trend data
  const performanceTrendData = [
    { week: 1, score: 65, activities: 3 },
    { week: 2, score: 72, activities: 4 },
    { week: 3, score: 68, activities: 5 },
    { week: 4, score: 80, activities: 4 },
    { week: 5, score: 85, activities: 3 },
    { week: 6, score: 82, activities: 4 },
    { week: 7, score: 88, activities: 5 },
    { week: 8, score: 90, activities: 3 },
  ];

  return (
    <div className="bg-[#15151C] min-h-screen">
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          
          {/* ========== PAGE HEADER ========== */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img
                src={AnalyticsIcon}
                alt="Analytics"
                className="h-7 w-7 sm:h-7 sm:w-7 mr-2 sm:mr-3"
              />
              <h1 className="font-bold text-sm sm:text-2xl text-[#FFFFFF]">
                Student Progress Tracking System
              </h1>
            </div>
            <p className="text-sm sm:text-base text-[#FFFFFF]/80">
              Integrated Academic Data Analytics & Performance Insights
            </p>
          </div>

          {/* ========== SUBJECT INFORMATION ========== */}
          <div className="flex flex-col gap-1 text-sm text-[#FFFFFF]/80 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">SUBJECT CODE:</span>
              <span>{subjectCode || 'N/A'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">SUBJECT:</span>
              <span>N/A</span>
            </div>

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="font-semibold">SECTION:</span>
                <span>N/A</span>
              </div>
              <div className="flex justify-end">
                <Link to="/ClassManagement">
                  <img 
                    src={BackButton} 
                    alt="Back" 
                    className="h-5 w-5 cursor-pointer hover:opacity-70 transition-opacity brightness-0 invert" 
                    title="Back to Class Management"
                  />
                </Link>
              </div>
            </div>
          </div>

          <hr className="border-[#FFFFFF]/20 mb-4" />

          {/* ========== ACTION BUTTONS ========== */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              {/* NEW: Subject Overview Button */}
              <Link to={`/SubjectOverviewProfessor?code=${subjectCode}`} className="flex-1 sm:flex-initial">
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-[#FF5252]/20 text-[#FF5252] border-2 border-[#FF5252]/30 font-semibold text-sm rounded-md shadow-md hover:bg-[#FF5252]/30 transition-all duration-300 cursor-pointer w-full sm:w-auto">
                  <img 
                    src={SubjectOverview} 
                    alt="" 
                    className="h-4 w-4 brightness-0 invert"
                  />
                  <span className="sm:inline">Subject Overview</span>
                </button>
              </Link>

              {/* Announcement Button */}
              <Link to={`/Class?code=${subjectCode}`} className="flex-1 sm:flex-initial">
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-[#00A15D]/20 text-[#00A15D] border-2 border-[#00A15D]/30 font-semibold text-sm rounded-md shadow-md hover:bg-[#00A15D]/30 transition-all duration-300 cursor-pointer w-full sm:w-auto">
                  <img 
                    src={Announcement} 
                    alt="" 
                    className="h-4 w-4 brightness-0 invert"
                  />
                  <span className="sm:inline">Announcements</span>
                </button>
              </Link>

              {/* Classwork Button */}
              <Link to={`/ClassworkTab?code=${subjectCode}`} className="min-w-0">
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-[#767EE0]/20 text-[#767EE0] border-2 border-[#767EE0]/30 font-semibold text-sm rounded-md shadow-md hover:bg-[#767EE0]/30 transition-all duration-300 cursor-pointer w-full">
                  <img 
                    src={Classwork} 
                    alt="" 
                    className="h-4 w-4 flex-shrink-0 brightness-0 invert"
                  />
                  <span className="whitespace-nowrap truncate">Class Work</span>
                </button>
              </Link>

              {/* Attendance Button */}
              <Link to={`/Attendance?code=${subjectCode}`} className="sm:flex-initial">
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-[#FFA600]/20 text-[#FFA600] border-2 border-[#FFA600]/30 font-semibold text-sm rounded-md shadow-md hover:bg-[#FFA600]/30 transition-all duration-300 cursor-pointer w-full sm:w-auto">
                  <img 
                    src={AttendanceIcon}
                    alt="" 
                    className="h-4 w-4 brightness-0 invert"
                  />
                  <span className="sm:inline">Attendance</span>
                </button>
              </Link>

              {/* Grade Button */}
              <Link to={`/GradeTab?code=${subjectCode}`} className="sm:flex-initial">
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-[#A15353]/20 text-[#A15353] border-2 border-[#A15353]/30 font-semibold text-sm rounded-md shadow-md hover:bg-[#A15353]/30 transition-all duration-300 cursor-pointer w-full sm:w-auto">
                  <img 
                    src={GradeIcon} 
                    alt="" 
                    className="h-4 w-4 brightness-0 invert"
                  />
                  <span className="sm:inline">Grade</span>
                </button>
              </Link>

              {/* Analytics Button - Active */}
              <Link to={`/AnalyticsTab?code=${subjectCode}`} className="sm:flex-initial">
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-[#B39DDB]/20 text-[#B39DDB] border-2 border-[#B39DDB]/30 font-semibold text-sm rounded-md shadow-md hover:bg-[#B39DDB]/30 transition-all duration-300 cursor-pointer w-full sm:w-auto">
                  <img 
                    src={AnalyticsIcon} 
                    alt="" 
                    className="h-4 w-4 brightness-0 invert"
                  />
                  <span className="sm:inline">Analytics</span>
                </button>
              </Link>
            </div>

            {/* ========== ICON BUTTONS ========== */}
            <div className="flex items-center gap-2 justify-end sm:justify-start">
              <Link to={`/StudentList?code=${subjectCode}`}>
                <button className="p-2 bg-[#2A2A35] rounded-md shadow-md border-2 border-transparent hover:border-[#00A15D] transition-all duration-200 flex-shrink-0 cursor-pointer" title="Student List">
                  <img 
                    src={ClassManagementIcon} 
                    alt="ClassManagement" 
                    className="h-4 w-4 brightness-0 invert" 
                  />
                </button>
              </Link>
            </div>
          </div>

          {/* ========== PERFORMANCE LINE CHART ========== */}
          <div className="mb-6">
            <PerformanceLineChart performanceTrend={performanceTrendData} />
          </div>

          {/* ========== CONTENT AREA (Now with just the chart) ========== */}
          <div className="text-center py-8 text-[#FFFFFF]/50">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-[#FFFFFF]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-lg font-semibold mb-2">Additional Analytics Coming Soon</p>
            <p className="text-sm">More charts and insights will be added here</p>
            <p className="text-xs mt-2 text-[#FFFFFF]/40">
              Subject Code: {subjectCode || 'Not specified'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}