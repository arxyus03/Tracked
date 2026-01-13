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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [professorId, setProfessorId] = useState(null);

  // Get user data from localStorage
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const fullName = `${user.tracked_firstname} ${user.tracked_lastname}`;
          setUserName(fullName);
          setProfessorId(user.tracked_ID);
          
          // Fetch section performance data
          await fetchSectionPerformance(user.tracked_ID);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data");
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchSectionPerformance = async (professorId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `https://tracked.6minds.site/Professor/ReportsAnalyticsProfDB/fetchSectionPerformance.php?professor_id=${professorId}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Calculate performance changes and add colors
      const processedData = data.map((section, index) => {
        const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#84CC16'];
        const color = colors[index % colors.length];
        
        // Calculate performance changes between weeks
        const dataWithChanges = section.data.map((week, idx, arr) => {
          let performanceChange = 0;
          let changeDirection = 'stable';
          
          if (idx > 0) {
            const prevWeek = arr[idx - 1];
            performanceChange = week.score - prevWeek.score;
            changeDirection = performanceChange > 0 ? 'up' : 
                             performanceChange < 0 ? 'down' : 'stable';
          }
          
          return {
            ...week,
            performanceChange: Math.abs(performanceChange),
            changeDirection,
            rawChange: performanceChange
          };
        });
        
        return {
          ...section,
          color,
          data: dataWithChanges
        };
      });

      setSectionPerformance(processedData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching section performance:", error);
      setError("Failed to load section performance data. Using sample data.");
      setLoading(false);
      
      // Fallback to mock data if API fails
      const mockSectionData = [
        {
          section: "ITEC110 - D",
          sectionCode: "ITEC110-D",
          color: "#6366F1",
          studentCount: 25,
          data: [
            { week: 1, score: 65, activities: 10, reason: "First week adjustment period", submissionRate: 85 },
            { week: 2, score: 72, activities: 12, reason: "Improved engagement in class discussions", submissionRate: 88 },
            { week: 3, score: 68, activities: 11, reason: "Midweek quiz performance dropped", submissionRate: 82 },
            { week: 4, score: 78, activities: 15, reason: "Extra credit assignment boosted scores", submissionRate: 90 },
            { week: 5, score: 82, activities: 18, reason: "Group project collaboration improved", submissionRate: 92 },
            { week: 6, score: 85, activities: 20, reason: "Excellent performance on final project", submissionRate: 95 },
            { week: 7, score: 80, activities: 16, reason: "Some students struggled with new topic", submissionRate: 87 },
            { week: 8, score: 88, activities: 22, reason: "Final exam preparation paid off", submissionRate: 96 },
          ]
        },
        {
          section: "MATH101 - A",
          sectionCode: "MATH101-A",
          color: "#10B981",
          studentCount: 30,
          data: [
            { week: 1, score: 70, activities: 11, reason: "Strong start to the semester", submissionRate: 90 },
            { week: 2, score: 75, activities: 13, reason: "Consistent homework submission", submissionRate: 92 },
            { week: 3, score: 72, activities: 12, reason: "Minor dip in participation", submissionRate: 88 },
            { week: 4, score: 80, activities: 16, reason: "Guest lecture improved understanding", submissionRate: 93 },
            { week: 5, score: 83, activities: 19, reason: "Peer learning sessions effective", submissionRate: 94 },
            { week: 6, score: 87, activities: 21, reason: "Excellent midterm exam results", submissionRate: 96 },
            { week: 7, score: 84, activities: 18, reason: "Technical issues during lab session", submissionRate: 91 },
            { week: 8, score: 90, activities: 24, reason: "Outstanding final project submissions", submissionRate: 98 },
          ]
        },
        {
          section: "PHYS201 - C",
          sectionCode: "PHYS201-C",
          color: "#F59E0B",
          studentCount: 22,
          data: [
            { week: 1, score: 60, activities: 9, reason: "Initial learning curve adjustment", submissionRate: 80 },
            { week: 2, score: 68, activities: 11, reason: "Improvement after study group formation", submissionRate: 85 },
            { week: 3, score: 65, activities: 10, reason: "Attendance issues affected scores", submissionRate: 82 },
            { week: 4, score: 75, activities: 14, reason: "Additional office hours helped", submissionRate: 88 },
            { week: 5, score: 78, activities: 16, reason: "Practice exam boosted confidence", submissionRate: 90 },
            { week: 6, score: 82, activities: 19, reason: "Improved time management skills", submissionRate: 92 },
            { week: 7, score: 79, activities: 17, reason: "Conceptual understanding challenges", submissionRate: 89 },
            { week: 8, score: 85, activities: 21, reason: "Significant improvement in final assessments", submissionRate: 94 },
          ]
        }
      ].map((section, index) => {
        // Add performance changes to mock data
        const dataWithChanges = section.data.map((week, idx, arr) => {
          let performanceChange = 0;
          let changeDirection = 'stable';
          
          if (idx > 0) {
            const prevWeek = arr[idx - 1];
            performanceChange = week.score - prevWeek.score;
            changeDirection = performanceChange > 0 ? 'up' : 
                             performanceChange < 0 ? 'down' : 'stable';
          }
          
          return {
            ...week,
            performanceChange: Math.abs(performanceChange),
            changeDirection,
            rawChange: performanceChange
          };
        });
        
        return {
          ...section,
          data: dataWithChanges
        };
      });
      
      setSectionPerformance(mockSectionData);
    }
  };

  // Refresh data function
  const refreshData = () => {
    if (professorId) {
      fetchSectionPerformance(professorId);
    }
  };

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
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <img 
                  src={Analytics} 
                  alt="Analytics" 
                  className="h-5 w-5 mr-2" 
                />
                <h1 className="font-bold text-lg text-white">Section Comparison Report</h1>
              </div>
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#6366F1] hover:bg-[#4F46E5] rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            <div className="text-sm text-white/80">
              <span>Compare performance across different class sections</span>
              {loading && <span className="ml-2 text-[#6366F1] animate-pulse">Loading real data...</span>}
              {error && <span className="ml-2 text-[#EF4444]">{error}</span>}
              {!loading && !error && <span className="ml-2 text-[#10B981]">Live data loaded</span>}
            </div>
          </div>

          <hr className="border-white/30 mb-4 border-1" />

          {/* Section Comparison Line Chart */}
          <div className="mb-6">
            <SectionComparisonChart 
              sectionData={sectionPerformance}
              loading={loading}
              professorId={professorId}
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
const SectionComparisonChart = ({ sectionData, loading, professorId }) => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hoveredSectionCode, setHoveredSectionCode] = useState(null);
  const [activityTypeFilter, setActivityTypeFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const dropdownRef = useRef(null);

  // Initialize visible sections (show all by default)
  useMemo(() => {
    if (sectionData && sectionData.length > 0) {
      const initialVisibility = {};
      sectionData.forEach((section) => {
        initialVisibility[section.sectionCode] = true;
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
    let totalStudents = 0;

    visibleSectionsData.forEach(section => {
      section.data.forEach(week => {
        allScores.push(week.score);
        allActivities += week.activities;
        totalWeeks++;
      });
      totalStudents += section.studentCount || 0;
    });

    const averageScore = allScores.reduce((a, b) => a + b, 0) / allScores.length;
    const highestScore = Math.max(...allScores);
    const lowestScore = Math.min(...allScores);
    const averageActivities = allActivities / totalWeeks;

    // Calculate overall trend (last week vs first week)
    const firstWeekAvg = visibleSectionsData.reduce((sum, section) => {
      const firstWeek = section.data.find(w => w.week === 1);
      return sum + (firstWeek?.score || 0);
    }, 0) / visibleSectionsData.length;
    
    const lastWeek = visibleSectionsData.reduce((maxWeek, section) => {
      const sectionLastWeek = Math.max(...section.data.map(w => w.week));
      return Math.max(maxWeek, sectionLastWeek);
    }, 0);
    
    const lastWeekAvg = visibleSectionsData.reduce((sum, section) => {
      const lastWeekData = section.data.find(w => w.week === lastWeek);
      return sum + (lastWeekData?.score || 0);
    }, 0) / visibleSectionsData.length;
    
    const trendPercentage = ((lastWeekAvg - firstWeekAvg) / firstWeekAvg * 100).toFixed(1);
    const trendDirection = lastWeekAvg > firstWeekAvg ? 'up' : lastWeekAvg < firstWeekAvg ? 'down' : 'stable';

    return {
      averageScore: averageScore.toFixed(1),
      highestScore,
      lowestScore,
      averageActivities: averageActivities.toFixed(1),
      totalSections: visibleSectionsData.length,
      totalStudents,
      trendPercentage: Math.abs(trendPercentage),
      trendDirection
    };
  }, [visibleSectionsData]);

  // Handle node click for modal
  const handleNodeClick = (section, weekData, event) => {
    event.stopPropagation();
    setSelectedNode({
      section: section.section,
      sectionCode: section.sectionCode,
      color: section.color,
      weekData: {
        ...weekData,
        studentCount: section.studentCount || 0
      }
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

  // Get all weeks from visible sections
  const allWeeks = visibleSectionsData.flatMap(section => 
    section.data.map(w => w.week)
  );
  const weeks = [...new Set(allWeeks)].sort((a, b) => a - b);
  const maxScore = 100;
  const maxWeek = weeks.length > 0 ? Math.max(...weeks) : 0;

  // Calculate positions
  const xScale = (week) => {
    if (maxWeek === 0 || weeks.length === 1) return margin.left;
    return margin.left + ((week - 1) * (innerWidth / (maxWeek - 1)));
  };
  
  const yScale = (score) => margin.top + (innerHeight - (score / maxScore) * innerHeight);

  // Create smooth line path for a section
  const createSmoothLinePath = (sectionData) => {
    if (sectionData.length < 2) {
      const week = sectionData[0]?.week || 1;
      const score = sectionData[0]?.score || 0;
      const x = xScale(week);
      const y = yScale(score);
      return `M ${x} ${y}`;
    }
    
    let path = `M ${xScale(sectionData[0].week)} ${yScale(sectionData[0].score)}`;
    
    for (let i = 1; i < sectionData.length; i++) {
      const prevX = xScale(sectionData[i-1].week);
      const prevY = yScale(sectionData[i-1].score);
      const currX = xScale(sectionData[i].week);
      const currY = yScale(sectionData[i].score);
      
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
  const handleMouseEnter = (week, sectionCode, weekData, event) => {
    const section = sectionData.find(s => s.sectionCode === sectionCode);
    
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
    if (!hoveredSectionCode) return 0.7; // Default opacity when no hover
    return sectionCode === hoveredSectionCode ? 1 : 0.3; // Full opacity for hovered, low for others
  };

  // Function to get area opacity based on hover state
  const getAreaOpacity = (sectionCode) => {
    if (!hoveredSectionCode) return 0.2; // Default opacity when no hover
    return sectionCode === hoveredSectionCode ? 0.4 : 0.1; // Higher for hovered, very low for others
  };

  // Function to get line stroke width based on hover state
  const getLineStrokeWidth = (sectionCode) => {
    if (!hoveredSectionCode) return 2.5; // Default stroke width
    return sectionCode === hoveredSectionCode ? 3.5 : 2; // Thicker for hovered, thinner for others
  };

  if (loading) {
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
          </div>
        </div>
        <div className="h-48 flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center mx-auto mb-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#6366F1]"></div>
            </div>
            <p className="text-[#FFFFFF]/60">Loading section performance data...</p>
          </div>
        </div>
      </div>
    );
  }

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
          </div>
        </div>
        <div className="h-48 flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center mx-auto mb-3">
              <img src={Analytics} alt="Analytics" className="w-8 h-8 opacity-40" />
            </div>
            <p className="text-[#FFFFFF]/60">No section data available</p>
            <p className="text-sm text-[#FFFFFF]/40 mt-1">Create classes and add activities to see performance data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-[#15151C] rounded-xl border border-[#FFFFFF]/10 relative">
        {/* Header */}
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
            
            {/* Right side with stats */}
            {overallStats && (
              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <div className="text-xs text-[#FFFFFF]/60">Average Score</div>
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
          </div>
        </div>

        {/* Filters Section */}
        <div className="p-4 border-b border-[#FFFFFF]/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-xs text-white/60 mb-1">Activity Type</label>
                <select 
                  value={activityTypeFilter}
                  onChange={(e) => setActivityTypeFilter(e.target.value)}
                  className="bg-[#2A2A35] border border-[#FFFFFF]/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                >
                  <option value="all">All Activities</option>
                  <option value="assignment">Assignments</option>
                  <option value="quiz">Quizzes</option>
                  <option value="project">Projects</option>
                  <option value="exam">Exams</option>
                  <option value="lab">Labs</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-white/60 mb-1">Date Range</label>
                <select 
                  value={dateRangeFilter}
                  onChange={(e) => setDateRangeFilter(e.target.value)}
                  className="bg-[#2A2A35] border border-[#FFFFFF]/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="semester">This Semester</option>
                </select>
              </div>
            </div>

            {/* Section Selection Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60 hidden md:block">Show Sections:</span>
                
                {/* Custom Dropdown Toggle */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2A2A35] hover:bg-[#3A3A45] rounded-lg text-sm text-white transition-all duration-200 border border-[#FFFFFF]/10"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm font-medium">{visibleCount} selected</span>
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
                    <div className="absolute right-0 mt-2 w-64 bg-[#23232C] border border-[#FFFFFF]/10 rounded-lg shadow-2xl z-50 overflow-hidden">
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
            </div>
          </div>

          {/* Quick Selected Sections Preview */}
          <div className="flex flex-wrap gap-2 mt-3">
            {sectionData
              .filter(section => visibleSections[section.sectionCode])
              .map(section => (
                <div
                  key={section.sectionCode}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#2A2A35] rounded-lg border border-[#FFFFFF]/5 hover:border-[#FFFFFF]/20 transition-all"
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
          className="relative p-4" 
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {visibleCount === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 text-white/20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-white/60">No sections selected</p>
                <p className="text-sm text-white/40 mt-1">Select sections from the dropdown above to display the chart</p>
              </div>
            </div>
          ) : (
            <>
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
                        y1={yScale(score)}
                        x2={innerWidth + margin.left}
                        y2={yScale(score)}
                        stroke="#2A2A35"
                        strokeWidth={1}
                        strokeDasharray={score === 70 || score === 75 || score === 100 ? "5,5" : "2,2"}
                        opacity={0.5}
                      />
                      <text
                        x={margin.left - 10}
                        y={yScale(score)}
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
                    y1={yScale(70)}
                    x2={innerWidth + margin.left}
                    y2={yScale(70)}
                    stroke="#FF5555"
                    strokeWidth="1.5"
                    strokeDasharray="5,5"
                    opacity={0.7}
                  />

                  {/* Orange line at 75% - Close to failing threshold */}
                  <line
                    x1={margin.left}
                    y1={yScale(75)}
                    x2={innerWidth + margin.left}
                    y2={yScale(75)}
                    stroke="#FFA600"
                    strokeWidth="1.5"
                    strokeDasharray="5,5"
                    opacity={0.7}
                  />

                  {/* Green line at 76% - Passing threshold */}
                  <line
                    x1={margin.left}
                    y1={yScale(76)}
                    x2={innerWidth + margin.left}
                    y2={yScale(76)}
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
                            d={`${linePath} L ${xScale(section.data[section.data.length-1].week)} ${chartHeight - margin.bottom} L ${xScale(section.data[0].week)} ${chartHeight - margin.bottom} Z`}
                            fill={`url(#areaGradient-${section.sectionCode})`}
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
                    if (index % 2 === 0 || weeks.length <= 8) {
                      return (
                        <text
                          key={`label-${week}`}
                          x={xScale(week)}
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
                      const x = xScale(week.week);
                      const y = yScale(week.score);
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
                            onMouseEnter={(e) => handleMouseEnter(week.week, section.sectionCode, week, e)}
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
                            onMouseEnter={(e) => handleMouseEnter(week.week, section.sectionCode, week, e)}
                            onMouseLeave={handleMouseLeave}
                            onClick={(e) => handleNodeClick(section, week, e)}
                            className="cursor-pointer transition-all duration-150 hover:stroke-white hover:stroke-[3px]"
                            style={{
                              opacity: isHovered || !hoveredSectionCode || hoveredSectionCode === section.sectionCode ? 1 : 0.6
                            }}
                          />
                        </g>
                      );
                    });
                  })}
                </svg>
              </div>

              {/* Performance zones legend */}
              <div className="mt-6 flex flex-wrap gap-3 text-xs justify-center">
                <div className="flex items-center gap-1 px-3 py-1.5 bg-[#2A2A35] rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-[#FF5555]"></div>
                  <span className="text-[#FF5555] text-xs font-medium">Below 70% (Failing)</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 bg-[#2A2A35] rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-[#FFA600]"></div>
                  <span className="text-[#FFA600] text-xs font-medium">71-75% (Close to Failing)</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1.5 bg-[#2A2A35] rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-[#00A15D]"></div>
                  <span className="text-[#00A15D] text-xs font-medium">76%+ (Passing)</span>
                </div>
              </div>

              {/* Overall stats summary */}
              {overallStats && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#2A2A35] p-3 rounded-lg border border-[#FFFFFF]/5">
                    <div className="text-xs text-white/60">Average Score</div>
                    <div className="text-lg font-bold text-white mt-1">{overallStats.averageScore}%</div>
                    <div className="text-xs text-white/40 mt-1">Across {overallStats.totalSections} sections</div>
                  </div>
                  <div className="bg-[#2A2A35] p-3 rounded-lg border border-[#FFFFFF]/5">
                    <div className="text-xs text-white/60">Highest Score</div>
                    <div className="text-lg font-bold text-[#00A15D] mt-1">{overallStats.highestScore}%</div>
                    <div className="text-xs text-white/40 mt-1">Best performing week</div>
                  </div>
                  <div className="bg-[#2A2A35] p-3 rounded-lg border border-[#FFFFFF]/5">
                    <div className="text-xs text-white/60">Lowest Score</div>
                    <div className="text-lg font-bold text-[#FF5555] mt-1">{overallStats.lowestScore}%</div>
                    <div className="text-xs text-white/40 mt-1">Lowest performing week</div>
                  </div>
                  <div className="bg-[#2A2A35] p-3 rounded-lg border border-[#FFFFFF]/5">
                    <div className="text-xs text-white/60">Total Students</div>
                    <div className="text-lg font-bold text-white mt-1">{overallStats.totalStudents}</div>
                    <div className="text-xs text-white/40 mt-1">Across all sections</div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* External Tooltip */}
        {hoveredNode && visibleCount > 0 && (
          <div 
            ref={tooltipRef}
            className="fixed bg-[#23232C] border border-[#FFFFFF]/20 rounded-lg p-3 shadow-2xl z-50 pointer-events-none transition-all duration-150"
            style={{
              left: `${hoveredNode.x + 10}px`,
              top: `${hoveredNode.y - 120}px`,
              transform: 'translateX(-50%)',
              minWidth: '200px'
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
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: zoneColor }} />
                    <span className="text-xs font-medium" style={{ color: zoneColor }}>
                      {zoneText}
                    </span>
                  </div>
                );
              })()}
              
              <div className="grid grid-cols-2 gap-3 mt-2 pt-2 border-t border-white/10">
                <div>
                  <div className="text-xs text-white/60">Activities</div>
                  <div className="text-sm font-medium text-white">
                    {hoveredNode.data?.activities || 0}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/60">Submissions</div>
                  <div className="text-sm font-medium text-white">
                    {hoveredNode.data?.submissionRate || 0}%
                  </div>
                </div>
              </div>
              
              {hoveredNode.data?.performanceChange > 0 && (
                <div className="flex items-center gap-1 text-xs mt-1">
                  <span className="text-white/60">Trend: </span>
                  <span className={`font-medium ${hoveredNode.data?.changeDirection === 'up' ? 'text-[#00A15D]' : 'text-[#FF5555]'}`}>
                    {hoveredNode.data?.changeDirection === 'up' ? '↑' : '↓'} {hoveredNode.data?.performanceChange.toFixed(1)}%
                    <span className="text-white/60 ml-1">from previous week</span>
                  </span>
                </div>
              )}
              
              <div className="text-xs text-[#FFFFFF]/40 mt-2 pt-1 border-t border-white/10">
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
        sectionCode={selectedNode?.sectionCode}
        weekData={selectedNode?.weekData}
        color={selectedNode?.color}
      />
    </>
  );
};