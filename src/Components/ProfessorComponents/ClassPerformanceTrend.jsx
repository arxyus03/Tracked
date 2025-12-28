import React, { useState, useMemo, useRef } from 'react';
import LineGraphIcon from '../../assets/LineGraph.svg';
import ArrowUp from '../../assets/ArrowUp.svg';
import ArrowDown from '../../assets/ArrowDown.svg';
import SectionPerformancePopup from '../../Components/ProfessorComponents/SectionPerformancePopup';

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

// MOCK DATA GENERATOR - This would typically come from your API
const generateMockSections = () => {
  const sections = [
    { sectionId: 'section-a', sectionName: 'Section A' },
    { sectionId: 'section-b', sectionName: 'Section B' },
    { sectionId: 'section-c', sectionName: 'Section C' },
    { sectionId: 'section-d', sectionName: 'Section D' },
    { sectionId: 'section-e', sectionName: 'Section E' },
  ];

  // Generate performance trends for 8 weeks
  const weeks = [1, 2, 3, 4, 5, 6, 7, 8];
  
  return sections.map((section, index) => {
    // Create different performance patterns for each section
    let baseScore;
    let volatility;
    
    switch(index) {
      case 0: // Section A - High performer, upward trend
        baseScore = 82;
        volatility = 6;
        break;
      case 1: // Section B - Middle performer, stable
        baseScore = 78;
        volatility = 8;
        break;
      case 2: // Section C - Low performer, downward trend
        baseScore = 72;
        volatility = 10;
        break;
      case 3: // Section D - High performer with volatility
        baseScore = 85;
        volatility = 12;
        break;
      case 4: // Section E - Improving performer
        baseScore = 68;
        volatility = 5;
        break;
      default:
        baseScore = 75;
        volatility = 8;
    }

    const performanceTrend = weeks.map(week => {
      // Add some trend based on section index
      let trend = 0;
      if (index === 0) trend = week * 0.8; // Upward trend
      if (index === 2) trend = -week * 0.6; // Downward trend
      if (index === 4) trend = week * 1.2; // Strong upward trend
      
      // Add some randomness
      const random = (Math.random() - 0.5) * volatility;
      
      let score = baseScore + trend + random;
      
      // Ensure score stays within bounds
      score = Math.min(Math.max(score, 60), 98);
      
      return {
        week,
        score: Math.round(score)
      };
    });

    return {
      ...section,
      performanceTrend
    };
  });
};

// Function to generate mock performance reasons (FOCUSED ON ACTIVITY, SUBMISSION, ATTENDANCE)
const generatePerformanceReasons = (sectionName, week, currentScore, previousScore) => {
  const scoreChange = previousScore ? currentScore - previousScore : 0;
  const isImproving = scoreChange > 0;

  const reasons = [
    {
      factor: "Activity Scores",
      description: isImproving
        ? "Average activity performance has improved significantly"
        : "Activity performance shows a decline this week",
      impact: isImproving ? "positive" : "negative"
    },
    {
      factor: "Activity Submission",
      description: isImproving
        ? "Timely submission rate has increased"
        : "Submission delays and incomplete work observed",
      impact: isImproving ? "positive" : "negative"
    },
    {
      factor: "Attendance",
      description: isImproving
        ? "Improved class attendance and participation"
        : "Lower attendance affecting overall performance",
      impact: isImproving ? "positive" : "negative"
    }
  ];

  return reasons;
};

// Function to get performance zone color based on score
const getPerformanceZoneColor = (score) => {
  if (score < 71) return '#FF5555'; // Failing red for 70% and below
  if (score >= 71 && score <= 75) return '#FFA600'; // Close to failing orange for 71-75%
  return '#00A15D'; // Passing green for 76% and above
};

const SectionComparisonTrend = ({ 
  sections: propSections, 
  currentSectionId,
  useMockData = false
}) => {
  const [hoveredWeek, setHoveredWeek] = useState(null);
  const [hoveredSection, setHoveredSection] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [visibleSections, setVisibleSections] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  // Use mock data if prop is empty or useMockData is true
  const sections = useMemo(() => {
    if (useMockData || !propSections || propSections.length === 0) {
      return generateMockSections();
    }
    return propSections;
  }, [propSections, useMockData]);

  // Initialize visible sections (all visible by default)
  useMemo(() => {
    if (sections && sections.length > 0) {
      const initialVisibility = {};
      sections.forEach(section => {
        initialVisibility[section.sectionId] = true;
      });
      setVisibleSections(initialVisibility);
    }
  }, [sections]);

  // Default currentSectionId if not provided
  const defaultCurrentSectionId = currentSectionId || (sections?.[0]?.sectionId);
  const currentSection = sections?.find(s => s.sectionId === defaultCurrentSectionId) || sections?.[0];
  
  // Color palette for sections
  const sectionColors = useMemo(() => {
    const colors = [
      '#6366F1', // Primary purple (current section)
      '#10B981', // Green
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#8B5CF6', // Violet
      '#EC4899', // Pink
      '#06B6D4', // Cyan
      '#84CC16', // Lime
    ];
    
    const assignedColors = {};
    let colorIndex = 0;
    
    // Assign colors to sections
    sections?.forEach((section, index) => {
      if (section.sectionId === defaultCurrentSectionId) {
        assignedColors[section.sectionId] = colors[0]; // Primary color for current section
      } else {
        colorIndex = (colorIndex % (colors.length - 1)) + 1; // Skip first color
        assignedColors[section.sectionId] = colors[colorIndex];
      }
    });
    
    return assignedColors;
  }, [sections, defaultCurrentSectionId]);

  // Calculate insights for comparison
  const comparisonInsights = useMemo(() => {
    if (!sections || sections.length === 0) {
      return {
        currentSectionRank: 0,
        totalSections: 0,
        currentSectionAvg: 0,
        classAvg: 0,
        topSection: null,
        trendVsClassAvg: 0,
        trendDirection: 'stable'
      };
    }

    // Calculate class average across all sections
    const allScores = sections.flatMap(section => 
      section.performanceTrend.map(week => week.score)
    );
    const classAvg = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;

    // Current section average
    const currentSectionAvg = currentSection?.performanceTrend?.length > 0
      ? currentSection.performanceTrend.reduce((sum, week) => sum + week.score, 0) / currentSection.performanceTrend.length
      : 0;

    // Sort sections by average performance
    const sortedSections = [...sections].sort((a, b) => {
      const avgA = a.performanceTrend.reduce((sum, week) => sum + week.score, 0) / a.performanceTrend.length;
      const avgB = b.performanceTrend.reduce((sum, week) => sum + week.score, 0) / b.performanceTrend.length;
      return avgB - avgA;
    });

    const currentSectionRank = sortedSections.findIndex(s => s.sectionId === defaultCurrentSectionId) + 1;
    const topSection = sortedSections[0];

    // Trend vs class average
    const trendVsClassAvg = currentSectionAvg - classAvg;
    const trendDirection = trendVsClassAvg > 2 ? 'up' : trendVsClassAvg < -2 ? 'down' : 'stable';

    return {
      currentSectionRank,
      totalSections: sections.length,
      currentSectionAvg: Math.round(currentSectionAvg),
      classAvg: Math.round(classAvg),
      topSection,
      trendVsClassAvg: Math.abs(trendVsClassAvg).toFixed(1),
      trendDirection,
      sortedSections
    };
  }, [sections, defaultCurrentSectionId, currentSection]);

  // Get visible sections data
  const visibleSectionsData = useMemo(() => {
    return sections?.filter(section => visibleSections[section.sectionId]) || [];
  }, [sections, visibleSections]);

  // Chart dimensions
  const chartHeight = 320;
  const margin = { top: 30, right: 30, bottom: 40, left: 40 };
  const innerWidth = 1200;
  const innerHeight = chartHeight - margin.top - margin.bottom;
  
  const maxScore = 100;
  
  // Get all weeks from all sections (assume same weeks for all sections)
  const weeks = currentSection?.performanceTrend || [];

  // Handle mouse events
  const handleMouseEnter = (week, sectionId, event) => {
    setHoveredWeek(week);
    setHoveredSection(sectionId);
    
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    setTooltipPosition({ 
      x: mouseX, 
      y: mouseY 
    });
  };

  // Handle node click
  const handleNodeClick = (week, sectionId, event) => {
    event.stopPropagation();
    
    const section = sections.find(s => s.sectionId === sectionId);
    if (!section) return;
    
    const weekData = section.performanceTrend.find(w => w.week === week);
    if (!weekData) return;
    
    // Get previous week's score for comparison
    const previousWeek = section.performanceTrend.find(w => w.week === week - 1);
    const previousScore = previousWeek ? previousWeek.score : null;
    const performanceChange = previousScore ? weekData.score - previousScore : 0;
    
    // Generate performance reasons
    const reasons = generatePerformanceReasons(
      section.sectionName,
      week,
      weekData.score,
      previousScore
    );
    
    // Get performance zone for the score
    const performanceZone = weekData.score < 71 ? "Failing" : 
                          weekData.score >= 71 && weekData.score <= 75 ? "Close to Failing" : 
                          "Passing";
    
    setSelectedDataPoint({
      sectionData: {
        sectionName: section.sectionName,
        sectionId: section.sectionId,
        currentScore: weekData.score,
        previousScore,
        performanceChange,
        performanceZone
      },
      weekData: {
        week,
        score: weekData.score,
        reasons
      }
    });
    
    setIsPopupOpen(true);
  };

  // Calculate positions
  const xScale = (week) => (week - 1) * (innerWidth / (weeks.length - 1));
  const yScale = (score) => innerHeight - (score / maxScore) * innerHeight;

  // Create smooth line path for a section
  const createSmoothLinePath = (sectionData) => {
    if (!sectionData || sectionData.length < 2) return '';
    
    let path = `M ${margin.left + xScale(sectionData[0].week)} ${margin.top + yScale(sectionData[0].score)}`;
    
    for (let i = 1; i < sectionData.length; i++) {
      const prevX = margin.left + xScale(sectionData[i-1].week);
      const prevY = margin.top + yScale(sectionData[i-1].score);
      const currX = margin.left + xScale(sectionData[i].week);
      const currY = margin.top + yScale(sectionData[i].score);
      
      const cp1x = prevX + (currX - prevX) * 0.25;
      const cp1y = prevY;
      const cp2x = prevX + (currX - prevX) * 0.75;
      const cp2y = currY;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${currX} ${currY}`;
    }
    
    return path;
  };

  // Toggle section visibility
  const toggleSectionVisibility = (sectionId) => {
    setVisibleSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Handle mouse move for tooltip positioning
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
    setSelectedDataPoint(null);
  };

  if (!sections || sections.length === 0) {
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
              <h3 className="font-bold text-lg text-[#FFFFFF]">Section Comparison Trend</h3>
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
            <p className="text-[#FFFFFF]/60">Loading section comparison data...</p>
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
              <h3 className="font-bold text-lg text-[#FFFFFF]">Section Comparison Trend</h3>
              <p className="text-sm text-[#FFFFFF]/60">
                {currentSection?.sectionName || "Current Section"} vs Other Sections
                {useMockData && (
                  <span className="ml-2 text-[#FFA600] text-xs">(Demo Data)</span>
                )}
              </p>
            </div>
          </div>
          
          {/* Right side with stats and collapse button */}
          <div className="flex items-center gap-3">
            {/* Current section stats */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-[#FFFFFF]/60">Section Rank</div>
                <div className="font-bold text-base text-[#FFFFFF]">
                  #{comparisonInsights.currentSectionRank} of {comparisonInsights.totalSections}
                </div>
              </div>
              <div className={`p-1.5 rounded-lg ${comparisonInsights.trendDirection === 'up' ? 'bg-[#00A15D]/10' : comparisonInsights.trendDirection === 'down' ? 'bg-[#FF5555]/10' : 'bg-[#FFA600]/10'}`}>
                <div className={`w-3 h-3 flex items-center justify-center ${comparisonInsights.trendDirection === 'up' ? 'text-[#00A15D]' : comparisonInsights.trendDirection === 'down' ? 'text-[#FF5555]' : 'text-[#FFA600]'}`}>
                  <TrendArrow 
                    direction={comparisonInsights.trendDirection} 
                    color={comparisonInsights.trendDirection === 'up' ? '#00A15D' : comparisonInsights.trendDirection === 'down' ? '#FF5555' : '#FFA600'}
                    size={3}
                  />
                </div>
              </div>
            </div>
            
            {/* Collapse/Expand button - UPDATED with ArrowUp/ArrowDown SVGs */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg bg-[#2A2A35] hover:bg-[#3A3A45] transition-all duration-200 cursor-pointer"
              aria-label={isCollapsed ? "Expand chart" : "Collapse chart"}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                {isCollapsed ? (
                  <img 
                    src={ArrowDown} 
                    alt="Expand" 
                    className="w-3 h-3"
                  />
                ) : (
                  <img 
                    src={ArrowUp} 
                    alt="Collapse" 
                    className="w-3 h-3"
                  />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[600px] opacity-100'
      }`}>
        <div className="p-4 pt-0">
          {/* Section Legend with Toggle */}
          <div className='mt-5'>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs text-[#FFFFFF]/60 mr-2">Toggle sections:</span>
              {sections.map(section => (
                <button
                  key={section.sectionId}
                  onClick={() => toggleSectionVisibility(section.sectionId)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${
                    visibleSections[section.sectionId] 
                      ? section.sectionId === defaultCurrentSectionId 
                        ? 'bg-[#6366F1] text-white' 
                        : 'bg-[#2A2A35] text-white'
                      : 'bg-[#1A1A24] text-[#FFFFFF]/40 border border-[#FFFFFF]/10'
                  }`}
                >
                  <div 
                    className={`w-2 h-2 rounded-full ${visibleSections[section.sectionId] ? '' : 'opacity-30'}`}
                    style={{ backgroundColor: sectionColors[section.sectionId] }}
                  />
                  {section.sectionName}
                  {section.sectionId === defaultCurrentSectionId && (
                    <span className="text-xs bg-white/20 px-1 rounded">Current</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Chart container */}
          <div 
            className="relative pt-4" 
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
              setHoveredWeek(null);
              setHoveredSection(null);
            }}
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
                  {/* Gradient definitions for each visible section */}
                  {visibleSectionsData.map(section => (
                    <linearGradient key={`gradient-${section.sectionId}`} id={`areaGradient-${section.sectionId}`} x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor={sectionColors[section.sectionId]} stopOpacity={section.sectionId === defaultCurrentSectionId ? "0.25" : "0.15"}/>
                      <stop offset="100%" stopColor={sectionColors[section.sectionId]} stopOpacity="0"/>
                    </linearGradient>
                  ))}
                </defs>

                {/* Grid lines */}
                {[0, 25, 50, 70, 75, 100].map((score) => (
                  <g key={`grid-${score}`}>
                    <line
                      x1={margin.left}
                      y1={margin.top + yScale(score)}
                      x2={innerWidth + margin.left}
                      y2={margin.top + yScale(score)}
                      stroke="#2A2A35"
                      strokeWidth={1}
                      strokeDasharray={score === 70 || score === 75 || score === 100 ? "5,5" : "2,2"}
                      opacity={0.5}
                    />
                    <text
                      x={margin.left - 10}
                      y={margin.top + yScale(score)}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fill="#FFFFFF"
                      fontSize="10"
                      fontWeight={score === 70 || score === 75 ? "bold" : "normal"}
                      opacity={0.7}
                    >
                      {score}%
                    </text>
                  </g>
                ))}

                {/* Red line at 70% - Failing threshold */}
                <line
                  x1={margin.left}
                  y1={margin.top + yScale(70)}
                  x2={innerWidth + margin.left}
                  y2={margin.top + yScale(70)}
                  stroke="#FF5555"
                  strokeWidth="1.5"
                  strokeDasharray="5,5"
                  opacity={0.7}
                />

                {/* Orange line at 75% - Close to failing threshold */}
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

                {/* Green line at 76% - Passing threshold */}
                <line
                  x1={margin.left}
                  y1={margin.top + yScale(76)}
                  x2={innerWidth + margin.left}
                  y2={margin.top + yScale(76)}
                  stroke="#00A15D"
                  strokeWidth="1.5"
                  strokeDasharray="5,5"
                  opacity={0.7}
                />

                {/* Draw lines for each visible section */}
                {visibleSectionsData.map(section => {
                  const linePath = createSmoothLinePath(section.performanceTrend);
                  const isCurrent = section.sectionId === defaultCurrentSectionId;
                  
                  return (
                    <g key={`section-${section.sectionId}`}>
                      {/* Area under curve */}
                      {linePath && section.performanceTrend.length > 0 && (
                        <path
                          d={`${linePath} L ${margin.left + xScale(section.performanceTrend[section.performanceTrend.length-1].week)} ${margin.top + innerHeight} L ${margin.left + xScale(section.performanceTrend[0].week)} ${margin.top + innerHeight} Z`}
                          fill={`url(#areaGradient-${section.sectionId})`}
                          opacity={isCurrent ? 0.4 : 0.3}
                        />
                      )}

                      {/* Performance line */}
                      {linePath && (
                        <path
                          d={linePath}
                          fill="none"
                          stroke={sectionColors[section.sectionId]}
                          strokeWidth={isCurrent ? "4" : "2"}
                          strokeLinecap="round"
                          opacity={isCurrent ? 1 : 0.8}
                          strokeDasharray={isCurrent ? "none" : "4,4"}
                        />
                      )}
                    </g>
                  );
                })}

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

                {/* Data points for each visible section */}
                {visibleSectionsData.map(section => {
                  const isCurrent = section.sectionId === defaultCurrentSectionId;
                  
                  return section.performanceTrend.map((week, index) => {
                    const x = margin.left + xScale(week.week);
                    const y = margin.top + yScale(week.score);
                    const isHovered = hoveredWeek === week.week && hoveredSection === section.sectionId;
                    const performanceZoneColor = getPerformanceZoneColor(week.score);
                    
                    return (
                      <g key={`point-${section.sectionId}-${week.week}`}>
                        {/* Hover area */}
                        <circle
                          cx={x}
                          cy={y}
                          r={isCurrent ? 20 : 16}
                          fill="transparent"
                          onMouseEnter={(e) => handleMouseEnter(week.week, section.sectionId, e)}
                          onMouseLeave={() => {
                            setHoveredWeek(null);
                            setHoveredSection(null);
                          }}
                          className="cursor-pointer"
                        />
                        
                        {/* Data point - Clickable */}
                        <circle
                          cx={x}
                          cy={y}
                          r={isHovered ? (isCurrent ? 8 : 6) : (isCurrent ? 6 : 4)}
                          fill={sectionColors[section.sectionId]}
                          stroke={performanceZoneColor}
                          strokeWidth="2"
                          onMouseEnter={(e) => handleMouseEnter(week.week, section.sectionId, e)}
                          onMouseLeave={() => {
                            setHoveredWeek(null);
                            setHoveredSection(null);
                          }}
                          onClick={(e) => handleNodeClick(week.week, section.sectionId, e)}
                          className="cursor-pointer transition-all duration-150 hover:stroke-white hover:stroke-[3px]"
                        />
                      </g>
                    );
                  });
                })}
              </svg>
            </div>
          </div>

          {/* Performance zones legend */}
          <div className="mt-6 flex flex-wrap gap-2 text-xs justify-center">
            <div className="flex items-center gap-1 px-2 py-1 bg-[#2A2A35] rounded">
              <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
              <span className="text-[#FFFFFF] text-xs">Current Section</span>
            </div>
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

      {/* Collapsed State Summary */}
      {isCollapsed && (
        <div className="p-4 border-t border-[#FFFFFF]/10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left side - Current section summary */}
            <div className="flex items-start gap-6">
              <div className="text-left">
                <div className="text-xs text-[#FFFFFF]/60">Current Section</div>
                <div className="font-bold text-base text-[#6366F1]">
                  {currentSection?.sectionName || "Section A"}
                </div>
                <div className="text-sm text-[#FFFFFF] mt-1">
                  Avg: {comparisonInsights.currentSectionAvg}%
                </div>
              </div>
              
              <div className="text-left">
                <div className="text-xs text-[#FFFFFF]/60">Class Average</div>
                <div className="font-bold text-base text-[#FFFFFF]">
                  {comparisonInsights.classAvg}%
                </div>
                <div className={`text-sm ${comparisonInsights.trendDirection === 'up' ? 'text-[#00A15D]' : comparisonInsights.trendDirection === 'down' ? 'text-[#FF5555]' : 'text-[#FFA600]'}`}>
                  {comparisonInsights.trendDirection === 'up' ? '+' : comparisonInsights.trendDirection === 'down' ? '-' : ''}
                  {comparisonInsights.trendVsClassAvg}% vs avg
                </div>
              </div>
              
              <div className="text-left">
                <div className="text-xs text-[#FFFFFF]/60">Section Ranking</div>
                <div className="font-bold text-base text-[#FFFFFF]">
                  #{comparisonInsights.currentSectionRank} / {comparisonInsights.totalSections}
                </div>
                {comparisonInsights.topSection && (
                  <div className="text-sm text-[#FFFFFF]/60 mt-1">
                    Top: {comparisonInsights.topSection.sectionName}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* External Tooltip */}
      {hoveredWeek && hoveredSection && !isCollapsed && (
        <div 
          ref={tooltipRef}
          className="fixed bg-[#23232C] border border-[#FFFFFF]/20 rounded-lg p-3 shadow-2xl z-50 pointer-events-none transition-all duration-150"
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y - 120}px`,
            transform: 'translateX(-50%)',
            minWidth: '180px'
          }}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[#FFFFFF] text-sm font-semibold">Week {hoveredWeek}</span>
              <span className="text-xs text-[#FFFFFF]/60">
                {sections.find(s => s.sectionId === hoveredSection)?.sectionName}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: sectionColors[hoveredSection] }}
              />
              <span className="text-lg font-bold text-white">
                {sections.find(s => s.sectionId === hoveredSection)?.performanceTrend?.find(w => w.week === hoveredWeek)?.score || 0}%
              </span>
              {hoveredSection === defaultCurrentSectionId && (
                <span className="text-xs text-white font-medium bg-[#6366F1] px-2 py-0.5 rounded">
                  Current
                </span>
              )}
            </div>
            
            {/* Show performance zone in tooltip */}
            {(() => {
              const score = sections.find(s => s.sectionId === hoveredSection)?.performanceTrend?.find(w => w.week === hoveredWeek)?.score || 0;
              let zoneText = '';
              let zoneColor = '';
              
              if (score < 71) {
                zoneText = 'Failing';
                zoneColor = '#FF5555';
              } else if (score >= 71 && score <= 75) {
                zoneText = 'Close to Failing';
                zoneColor = '#FFA600';
              } else {
                zoneText = 'Passing';
                zoneColor = '#00A15D';
              }
              
              return (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: zoneColor }} />
                  <span className="text-xs" style={{ color: zoneColor }}>
                    {zoneText}
                  </span>
                </div>
              );
            })()}
            
            <div className="text-xs text-[#FFFFFF]/40 mt-1">
              Click for detailed analysis
            </div>
          </div>
          
          {/* Tooltip arrow */}
          <div className="absolute w-2 h-2 bg-[#23232C] border-r border-b border-[#FFFFFF]/20 
            transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
        </div>
      )}

      {/* Performance Analysis Popup */}
      <SectionPerformancePopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        sectionData={selectedDataPoint?.sectionData}
        weekData={selectedDataPoint?.weekData}
      />
    </div>
  );
};

export default SectionComparisonTrend;