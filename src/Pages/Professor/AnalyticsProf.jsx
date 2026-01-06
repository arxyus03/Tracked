import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import Analytics from '../../assets/Analytics.svg';
import ArrowUp from '../../assets/ArrowUp.svg';
import ArrowDown from '../../assets/ArrowDown.svg';
import SectionPerformanceModal from '../../Components/ProfessorComponents/SectionPerformanceModal';

export default function AnalyticsProf() {
  const [isOpen, setIsOpen] = useState(true);
  const [userName, setUserName] = useState("Professor");
  const [sectionPerformance, setSectionPerformance] = useState([]);
  const [selectedSection, setSelectedSection] = useState("All Sections");

  // Get user name from localStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const fullName = `${user.tracked_firstname} ${user.tracked_lastname}`;
          setUserName(fullName);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    // Mock section comparison data with more realistic section names
    const mockSectionData = [
      {
        section: "ITEC110 - D",
        sectionCode: "ITEC110-D",
        color: "#6366F1",
        data: [
          { week: 1, score: 65, activities: 10, reason: "First week adjustment period" },
          { week: 2, score: 72, activities: 12, reason: "Improved engagement in class discussions" },
          { week: 3, score: 68, activities: 11, reason: "Midweek quiz performance dropped" },
          { week: 4, score: 78, activities: 15, reason: "Extra credit assignment boosted scores" },
          { week: 5, score: 82, activities: 18, reason: "Group project collaboration improved" },
          { week: 6, score: 85, activities: 20, reason: "Excellent performance on final project" },
          { week: 7, score: 80, activities: 16, reason: "Some students struggled with new topic" },
          { week: 8, score: 88, activities: 22, reason: "Final exam preparation paid off" },
        ]
      },
      {
        section: "MATH101 - A",
        sectionCode: "MATH101-A",
        color: "#10B981",
        data: [
          { week: 1, score: 70, activities: 11, reason: "Strong start to the semester" },
          { week: 2, score: 75, activities: 13, reason: "Consistent homework submission" },
          { week: 3, score: 72, activities: 12, reason: "Minor dip in participation" },
          { week: 4, score: 80, activities: 16, reason: "Guest lecture improved understanding" },
          { week: 5, score: 83, activities: 19, reason: "Peer learning sessions effective" },
          { week: 6, score: 87, activities: 21, reason: "Excellent midterm exam results" },
          { week: 7, score: 84, activities: 18, reason: "Technical issues during lab session" },
          { week: 8, score: 90, activities: 24, reason: "Outstanding final project submissions" },
        ]
      },
      {
        section: "PHYS201 - C",
        sectionCode: "PHYS201-C",
        color: "#F59E0B",
        data: [
          { week: 1, score: 60, activities: 9, reason: "Initial learning curve adjustment" },
          { week: 2, score: 68, activities: 11, reason: "Improvement after study group formation" },
          { week: 3, score: 65, activities: 10, reason: "Attendance issues affected scores" },
          { week: 4, score: 75, activities: 14, reason: "Additional office hours helped" },
          { week: 5, score: 78, activities: 16, reason: "Practice exam boosted confidence" },
          { week: 6, score: 82, activities: 19, reason: "Improved time management skills" },
          { week: 7, score: 79, activities: 17, reason: "Conceptual understanding challenges" },
          { week: 8, score: 85, activities: 21, reason: "Significant improvement in final assessments" },
        ]
      },
      {
        section: "ENG102 - B",
        sectionCode: "ENG102-B",
        color: "#EF4444",
        data: [
          { week: 1, score: 72, activities: 12, reason: "Strong writing skills baseline" },
          { week: 2, score: 76, activities: 14, reason: "Improvement in essay structure" },
          { week: 3, score: 74, activities: 13, reason: "Grammar-focused week challenging" },
          { week: 4, score: 81, activities: 17, reason: "Research paper success" },
          { week: 5, score: 79, activities: 15, reason: "Citation format issues" },
          { week: 6, score: 83, activities: 18, reason: "Presentation skills improved" },
          { week: 7, score: 85, activities: 19, reason: "Final paper draft excellence" },
          { week: 8, score: 88, activities: 22, reason: "Outstanding final submissions" },
        ]
      },
      {
        section: "CHEM115 - F",
        sectionCode: "CHEM115-F",
        color: "#8B5CF6",
        data: [
          { week: 1, score: 68, activities: 10, reason: "Lab safety orientation week" },
          { week: 2, score: 71, activities: 12, reason: "Basic concepts grasped" },
          { week: 3, score: 69, activities: 11, reason: "Chemical equation challenges" },
          { week: 4, score: 76, activities: 15, reason: "Lab experiment success" },
          { week: 5, score: 74, activities: 14, reason: "Stoichiometry difficulties" },
          { week: 6, score: 79, activities: 16, reason: "Midterm exam preparation" },
          { week: 7, score: 82, activities: 18, reason: "Improved problem-solving skills" },
          { week: 8, score: 86, activities: 20, reason: "Final practical exam excellence" },
        ]
      }
    ];

    fetchUserData();
    setSectionPerformance(mockSectionData);
  }, []);

  return (
    <div className="bg-[#23232C] min-h-screen">
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName={userName} />

        <div className="p-3 sm:p-4 md:p-5 text-white">
          {/* Header Section */}
          <div className="mb-3">
            <div className="flex items-center mb-1">
              <img 
                src={Analytics} 
                alt="Analytics" 
                className="h-5 w-5 mr-2" 
              />
              <h1 className="font-bold text-lg text-white">Section Comparison Report</h1>
            </div>
            <div className="text-sm text-white/80">
              <span>Compare performance across different class sections</span>
            </div>
          </div>

          <hr className="border-white/30 mb-4 border-1" />

          {/* Section Comparison Line Chart */}
          <div className="mb-6">
            <SectionComparisonChart 
              sectionData={sectionPerformance}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

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

// Section Comparison Line Chart Component
const SectionComparisonChart = ({ sectionData }) => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [visibleSections, setVisibleSections] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredSectionCode, setHoveredSectionCode] = useState(null);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const dropdownRef = useRef(null);

  // Initialize visible sections (limit to 3 visible by default for clarity)
  useMemo(() => {
    if (sectionData && sectionData.length > 0) {
      const initialVisibility = {};
      sectionData.forEach((section, index) => {
        initialVisibility[section.sectionCode] = index < 3;
      });
      setVisibleSections(initialVisibility);
    }
  }, [sectionData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get visible sections data
  const visibleSectionsData = useMemo(() => {
    return sectionData?.filter(section => visibleSections[section.sectionCode]) || [];
  }, [sectionData, visibleSections]);

  // Calculate visible section count
  const visibleCount = Object.values(visibleSections).filter(Boolean).length;

  // Calculate overall statistics
  const overallStats = useMemo(() => {
    if (visibleSectionsData.length === 0) return null;

    let allScores = [];
    let allActivities = 0;
    let totalWeeks = 0;

    visibleSectionsData.forEach(section => {
      section.data.forEach(week => {
        allScores.push(week.score);
        allActivities += week.activities;
        totalWeeks++;
      });
    });

    const averageScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;
    const highestScore = Math.max(...allScores);
    const lowestScore = Math.min(...allScores);
    const averageActivities = allActivities / totalWeeks;

    // Calculate overall trend (last week vs first week)
    const firstWeekAvg = visibleSectionsData.reduce((sum, section) => {
      return sum + (section.data[0]?.score || 0);
    }, 0) / visibleSectionsData.length;
    
    const lastWeekAvg = visibleSectionsData.reduce((sum, section) => {
      return sum + (section.data[section.data.length - 1]?.score || 0);
    }, 0) / visibleSectionsData.length;
    
    const trendPercentage = ((lastWeekAvg - firstWeekAvg) / firstWeekAvg * 100).toFixed(1);
    const trendDirection = lastWeekAvg > firstWeekAvg ? 'up' : lastWeekAvg < firstWeekAvg ? 'down' : 'stable';

    return {
      averageScore: averageScore.toFixed(1),
      highestScore,
      lowestScore,
      averageActivities: averageActivities.toFixed(1),
      totalSections: visibleSectionsData.length,
      trendPercentage: Math.abs(trendPercentage),
      trendDirection
    };
  }, [visibleSectionsData]);

  // Handle node click for modal
  const handleNodeClick = (section, weekData, event) => {
    event.stopPropagation();
    setSelectedNode({
      section: section.section,
      color: section.color,
      weekData
    });
    setIsModalOpen(true);
  };

  // Toggle section visibility
  const toggleSectionVisibility = (sectionCode) => {
    setVisibleSections(prev => ({
      ...prev,
      [sectionCode]: !prev[sectionCode]
    }));
  };

  // Chart dimensions
  const chartHeight = 320;
  const margin = { top: 30, right: 30, bottom: 40, left: 40 };
  const innerWidth = 1200;
  const innerHeight = chartHeight - margin.top - margin.bottom;

  // Get all weeks (assuming all sections have same weeks)
  const weeks = visibleSectionsData[0]?.data.map(w => w.week) || [];
  const maxScore = 100;
  const maxWeek = weeks.length > 0 ? Math.max(...weeks) : 0;

  // Calculate positions
  const xScale = (week) => (week - 1) * (innerWidth / (maxWeek - 1));
  const yScale = (score) => innerHeight - (score / maxScore) * innerHeight;

  // Create smooth line path for a section
  const createSmoothLinePath = (sectionData) => {
    if (sectionData.length < 2) return '';
    
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

  // Function to get performance zone color based on score
  const getPerformanceZoneColor = (score) => {
    if (score < 71) return '#FF5555'; // Failing red for 70% and below
    if (score >= 71 && score <= 75) return '#FFA600'; // Close to failing orange for 71-75%
    return '#00A15D'; // Passing green for 76% and above
  };

  // Handle mouse events
  const handleMouseEnter = (week, sectionCode, event) => {
    const section = sectionData.find(s => s.sectionCode === sectionCode);
    const weekData = section?.data.find(w => w.week === week);
    
    if (section && weekData) {
      setHoveredSectionCode(sectionCode);
      setHoveredNode({
        section: section.section,
        sectionCode: section.sectionCode,
        week: week,
        data: weekData,
        color: section.color,
        x: event.clientX,
        y: event.clientY
      });
    }
  };

  const handleMouseMove = (event) => {
    if (hoveredNode) {
      setHoveredNode(prev => ({
        ...prev,
        x: event.clientX,
        y: event.clientY
      }));
    }
  };

  const handleMouseLeave = () => {
    setHoveredNode(null);
    setHoveredSectionCode(null);
  };

  // Function to get line opacity based on hover state
  const getLineOpacity = (sectionCode) => {
    if (!hoveredSectionCode) return 0.4; // Default opacity when no hover
    return sectionCode === hoveredSectionCode ? 1 : 0.2; // Full opacity for hovered, very low for others
  };

  // Function to get area opacity based on hover state
  const getAreaOpacity = (sectionCode) => {
    if (!hoveredSectionCode) return 0.15; // Default opacity when no hover
    return sectionCode === hoveredSectionCode ? 0.3 : 0.05; // Higher for hovered, very low for others
  };

  // Function to get line stroke width based on hover state
  const getLineStrokeWidth = (sectionCode) => {
    if (!hoveredSectionCode) return 2.5; // Default stroke width
    return sectionCode === hoveredSectionCode ? 3.5 : 1.5; // Thicker for hovered, thinner for others
  };

  if (sectionData.length === 0) {
    return (
      <div className="bg-[#15151C] rounded-xl border border-[#FFFFFF]/10">
        <div className="p-4 border-b border-[#FFFFFF]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <img src={Analytics} alt="Analytics" className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-[#FFFFFF]">Section Performance Comparison</h3>
            </div>
            <div className="text-sm text-[#FFFFFF]/60">No section data available</div>
          </div>
        </div>
        <div className="h-48 flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center mx-auto mb-3">
              <img src={Analytics} alt="Analytics" className="w-8 h-8 opacity-40" />
            </div>
            <p className="text-[#FFFFFF]/60">Loading section data...</p>
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
                <h3 className="font-bold text-lg text-[#FFFFFF]">Section Performance Trend</h3>
                <p className="text-sm text-[#FFFFFF]/60">Weekly performance comparison across sections</p>
              </div>
            </div>
            
            {/* Right side with stats and collapse button */}
            <div className="flex items-center gap-3">
              {/* Overall trend stats */}
              {overallStats && (
                <div className="flex items-center gap-3">
                  <div className="text-right hidden md:block">
                    <div className="text-xs text-[#FFFFFF]/60">Avg Score</div>
                    <div className="font-bold text-base text-[#FFFFFF]">{overallStats.averageScore}%</div>
                  </div>
                  <div className={`p-1.5 rounded-lg ${overallStats.trendDirection === 'up' ? 'bg-[#00A15D]/10' : overallStats.trendDirection === 'down' ? 'bg-[#FF5555]/10' : 'bg-[#FFA600]/10'}`}>
                    <div className={`w-3 h-3 flex items-center justify-center ${overallStats.trendDirection === 'up' ? 'text-[#00A15D]' : overallStats.trendDirection === 'down' ? 'text-[#FF5555]' : 'text-[#FFA600]'}`}>
                      <TrendArrow 
                        direction={overallStats.trendDirection} 
                        color={overallStats.trendDirection === 'up' ? '#00A15D' : overallStats.trendDirection === 'down' ? '#FF5555' : '#FFA600'}
                        size={3}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Collapse/Expand button */}
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
            {/* Section Selection Dropdown - Copied from desired design */}
            <div className='mt-5 relative' ref={dropdownRef}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-[#FFFFFF]/60">Select sections to display:</span>
                
                {/* Custom Dropdown Toggle */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-3 py-2 bg-[#2A2A35] hover:bg-[#3A3A45] rounded-lg text-sm text-white transition-all duration-200 border border-[#FFFFFF]/10"
                  >
                    <span className="flex items-center gap-1">
                      <span className="text-xs font-medium">{visibleCount} selected</span>
                      <div className="w-4 h-4 flex items-center justify-center">
                        {dropdownOpen ? (
                          <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </div>
                    </span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-[#23232C] border border-[#FFFFFF]/10 rounded-lg shadow-2xl z-50 overflow-hidden">
                      {/* Dropdown Header */}
                      <div className="p-3 border-b border-[#FFFFFF]/10 bg-[#1A1A24]">
                        <span className="text-sm font-medium text-white">Select Sections</span>
                      </div>
                      
                      {/* Section List */}
                      <div className="max-h-48 overflow-y-auto custom-scrollbar">
                        {sectionData.map(section => {
                          const isVisible = visibleSections[section.sectionCode];
                          
                          return (
                            <div
                              key={section.sectionCode}
                              className="flex items-center p-3 hover:bg-[#2A2A35] cursor-pointer transition-all"
                              onClick={() => toggleSectionVisibility(section.sectionCode)}
                            >
                              {/* Custom Checkbox */}
                              <div className={`w-4 h-4 rounded flex items-center justify-center border mr-3 ${
                                isVisible 
                                  ? 'bg-[#6366F1] border-[#6366F1]' 
                                  : 'bg-transparent border-[#FFFFFF]/30'
                              }`}>
                                {isVisible && (
                                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              
                              {/* Section Name */}
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: section.color }}
                                />
                                <div className="text-sm text-white">
                                  {section.section}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick Selected Sections Preview */}
              <div className="flex flex-wrap gap-2 mb-4">
                {sectionData
                  .filter(section => visibleSections[section.sectionCode])
                  .map(section => (
                    <div
                      key={section.sectionCode}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#2A2A35] rounded-lg border border-[#FFFFFF]/5"
                    >
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: section.color }}
                      />
                      <span className="text-xs text-white">
                        {section.section}
                      </span>
                      <button
                        onClick={() => toggleSectionVisibility(section.sectionCode)}
                        className="ml-1 text-[#FFFFFF]/40 hover:text-[#FF5555] transition-all"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Chart container */}
            <div 
              className="relative pt-4" 
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
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
                      <linearGradient key={`gradient-${section.sectionCode}`} id={`areaGradient-${section.sectionCode}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={section.color} stopOpacity="0.8"/>
                        <stop offset="100%" stopColor={section.color} stopOpacity="0"/>
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
                    const linePath = createSmoothLinePath(section.data);
                    const isHovered = hoveredSectionCode === section.sectionCode;
                    
                    return (
                      <g key={`section-${section.sectionCode}`}>
                        {/* Area under curve */}
                        {linePath && section.data.length > 0 && (
                          <path
                            d={`${linePath} L ${margin.left + xScale(section.data[section.data.length-1].week)} ${margin.top + innerHeight} L ${margin.left + xScale(section.data[0].week)} ${margin.top + innerHeight} Z`}
                            fill={`url(#gradient-${section.sectionCode})`}
                            opacity={getAreaOpacity(section.sectionCode)}
                          />
                        )}

                        {/* Performance line */}
                        {linePath && (
                          <path
                            d={linePath}
                            fill="none"
                            stroke={section.color}
                            strokeWidth={getLineStrokeWidth(section.sectionCode)}
                            strokeLinecap="round"
                            opacity={getLineOpacity(section.sectionCode)}
                            onMouseEnter={() => setHoveredSectionCode(section.sectionCode)}
                            onMouseLeave={() => setHoveredSectionCode(null)}
                            className="cursor-pointer transition-all duration-200"
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
                          key={`label-${week}`}
                          x={margin.left + xScale(week)}
                          y={chartHeight - 10}
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontSize="10"
                          opacity={0.7}
                        >
                          Week {week}
                        </text>
                      );
                    }
                    return null;
                  })}

                  {/* Data points for each visible section */}
                  {visibleSectionsData.map(section => {
                    return section.data.map((week, index) => {
                      const x = margin.left + xScale(week.week);
                      const y = margin.top + yScale(week.score);
                      const isHovered = hoveredNode?.sectionCode === section.sectionCode && hoveredNode?.week === week.week;
                      const performanceZoneColor = getPerformanceZoneColor(week.score);
                      
                      return (
                        <g key={`point-${section.sectionCode}-${week.week}`}>
                          {/* Hover area */}
                          <circle
                            cx={x}
                            cy={y}
                            r={16}
                            fill="transparent"
                            onMouseEnter={(e) => handleMouseEnter(week.week, section.sectionCode, e)}
                            onMouseLeave={handleMouseLeave}
                            className="cursor-pointer"
                          />
                          
                          {/* Data point - Clickable */}
                          <circle
                            cx={x}
                            cy={y}
                            r={isHovered ? 6 : 4}
                            fill={section.color}
                            stroke={performanceZoneColor}
                            strokeWidth={isHovered ? "3" : "2"}
                            onMouseEnter={(e) => handleMouseEnter(week.week, section.sectionCode, e)}
                            onMouseLeave={handleMouseLeave}
                            onClick={(e) => handleNodeClick(section, week, e)}
                            className="cursor-pointer transition-all duration-150 hover:stroke-white hover:stroke-[3px]"
                            style={{
                              opacity: isHovered || !hoveredSectionCode || hoveredSectionCode === section.sectionCode ? 1 : 0.4
                            }}
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
        {isCollapsed && overallStats && (
          <div className="p-4 border-t border-[#FFFFFF]/10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left side - Section summary */}
              <div className="flex items-start gap-6">
                <div className="text-left">
                  <div className="text-xs text-[#FFFFFF]/60">Average Score</div>
                  <div className="font-bold text-base text-[#FFFFFF]">
                    {overallStats.averageScore}%
                  </div>
                  <div className={`text-sm mt-1 ${overallStats.trendDirection === 'up' ? 'text-[#00A15D]' : overallStats.trendDirection === 'down' ? 'text-[#FF5555]' : 'text-[#FFA600]'}`}>
                    {overallStats.trendDirection === 'up' ? '↑' : overallStats.trendDirection === 'down' ? '↓' : '→'} {overallStats.trendPercentage}%
                  </div>
                </div>
                
                <div className="text-left">
                  <div className="text-xs text-[#FFFFFF]/60">Highest Score</div>
                  <div className="font-bold text-base text-[#00A15D]">
                    {overallStats.highestScore}%
                  </div>
                  <div className="text-sm text-[#FFFFFF] mt-1">
                    {visibleSectionsData.length} sections
                  </div>
                </div>
                
                <div className="text-left">
                  <div className="text-xs text-[#FFFFFF]/60">Lowest Score</div>
                  <div className="font-bold text-base text-[#FF5555]">
                    {overallStats.lowestScore}%
                  </div>
                  <div className="text-sm text-[#FFFFFF]/60 mt-1">
                    Avg Activities: {overallStats.averageActivities}
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        )}

        {/* External Tooltip */}
        {hoveredNode && !isCollapsed && (
          <div 
            ref={tooltipRef}
            className="fixed bg-[#23232C] border border-[#FFFFFF]/20 rounded-lg p-3 shadow-2xl z-50 pointer-events-none transition-all duration-150"
            style={{
              left: `${hoveredNode.x + 10}px`,
              top: `${hoveredNode.y - 120}px`,
              transform: 'translateX(-50%)',
              minWidth: '180px'
            }}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#FFFFFF] text-sm font-semibold">{hoveredNode.section}</span>
                <span className="text-xs text-[#FFFFFF]/60">Week {hoveredNode.week}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: hoveredNode.color }}
                />
                <span className="text-lg font-bold text-white">
                  {hoveredNode.data?.score}%
                </span>
              </div>
              
              {/* Show performance zone in tooltip */}
              {(() => {
                const score = hoveredNode.data?.score || 0;
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
      </div>

      {/* Section Performance Modal */}
      <SectionPerformanceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedNode(null);
        }}
        section={selectedNode?.section}
        weekData={selectedNode?.weekData}
        color={selectedNode?.color}
      />
    </>
  );
};