import React, { useState, useMemo, useRef, useEffect } from 'react';
import LineGraphIcon from '../../assets/LineGraph.svg';
import ArrowUp from '../../assets/ArrowUp.svg';
import ArrowDown from '../../assets/ArrowDown.svg';
import StudentPerformancePopup from './StudentPerformancePopup';

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

// Function to generate performance reasons for students (removed class participation)
const generatePerformanceReasons = (studentName, week, currentScore, previousScore) => {
  const scoreChange = previousScore ? currentScore - previousScore : 0;
  const isImproving = scoreChange > 0;

  const reasons = [
    {
      factor: "Activity Scores",
      description: isImproving
        ? "Activity scores have improved significantly"
        : "Activity scores show a decline this week",
      impact: isImproving ? "positive" : "negative",
      details: isImproving 
        ? "Higher accuracy in submitted work" 
        : "Multiple errors in recent submissions"
    },
    {
      factor: "Attendance",
      description: isImproving
        ? "Good attendance maintained"
        : "Attendance issues affecting performance",
      impact: isImproving ? "positive" : "negative",
      details: isImproving
        ? "Consistently present and punctual"
        : "Missed important concepts due to absences"
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

// Activity type options
const activityTypes = [
  { value: 'all', label: 'All Activities', color: '#6366F1' },
  { value: 'assignment', label: 'Assignments', color: '#10B981' },
  { value: 'quiz', label: 'Quizzes', color: '#F59E0B' },
  { value: 'activity', label: 'Activities', color: '#EF4444' },
  { value: 'project', label: 'Projects', color: '#8B5CF6' },
  { value: 'laboratory', label: 'Laboratory', color: '#EC4899' }
];

const ClassPerformanceTrend = ({ 
  students: propStudents, 
  subjectCode,
  useMockData = false,
  isDarkMode = false // Added theme prop
}) => {
  const [hoveredWeek, setHoveredWeek] = useState(null);
  const [hoveredStudent, setHoveredStudent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [visibleStudents, setVisibleStudents] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const [activityDropdownOpen, setActivityDropdownOpen] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState('all');
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const studentDropdownRef = useRef(null);
  const activityDropdownRef = useRef(null);

  // Theme-based styles
  const getCardBackground = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getCardBorder = () => {
    return isDarkMode ? "border-[#FFFFFF]/10" : "border-gray-200";
  };

  const getTextColor = () => {
    return isDarkMode ? "text-[#FFFFFF]" : "text-gray-900";
  };

  const getSecondaryTextColor = () => {
    return isDarkMode ? "text-[#FFFFFF]/60" : "text-gray-600";
  };

  const getInputBackground = () => {
    return isDarkMode ? "bg-[#2A2A35]" : "bg-gray-100";
  };

  const getInputBorder = () => {
    return isDarkMode ? "border-[#FFFFFF]/10" : "border-gray-300";
  };

  const getInputHover = () => {
    return isDarkMode ? "hover:bg-[#3A3A45]" : "hover:bg-gray-200";
  };

  const getDropdownBackground = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-white";
  };

  const getDropdownBorder = () => {
    return isDarkMode ? "border-[#FFFFFF]/10" : "border-gray-200";
  };

  const getDropdownHeader = () => {
    return isDarkMode ? "bg-[#1A1A24]" : "bg-gray-50";
  };

  const getHoverBackground = () => {
    return isDarkMode ? "hover:bg-[#2A2A35]" : "hover:bg-gray-100";
  };

  const getTooltipBackground = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-white";
  };

  const getTooltipBorder = () => {
    return isDarkMode ? "border-[#FFFFFF]/20" : "border-gray-200";
  };

  // Fetch performance data for selected students and activity type
  useEffect(() => {
    if (!subjectCode || propStudents.length === 0) return;

    const fetchPerformanceData = async () => {
      setLoading(true);
      try {
        // Get student IDs that are currently visible
        const visibleStudentIds = Object.entries(visibleStudents)
          .filter(([isVisible]) => isVisible)
          .map(([id]) => id);

        // If no students selected, use first 4 students
        const studentIdsToFetch = visibleStudentIds.length > 0 
          ? visibleStudentIds 
          : propStudents.slice(0, 4).map(s => s.studentId);

        const response = await fetch(
          `https://tracked.6minds.site/Professor/SubjectAnalyticsProfDB/fetch_student_performance.php?code=${subjectCode}&student_ids=${studentIdsToFetch.join(',')}&activity_type=${selectedActivityType}`
        );
        const data = await response.json();
        
        if (data.success) {
          setPerformanceData(data.students);
        }
      } catch (error) {
        console.error('Error fetching performance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [subjectCode, propStudents, visibleStudents, selectedActivityType]);

  // Initialize visible students with first 4 students
  useEffect(() => {
    if (propStudents && propStudents.length > 0) {
      const initialVisibility = {};
      propStudents.forEach((student, index) => {
        // Show first 4 students by default
        initialVisibility[student.studentId] = index < 4;
      });
      setVisibleStudents(initialVisibility);
    }
  }, [propStudents]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(event.target)) {
        setStudentDropdownOpen(false);
      }
      if (activityDropdownRef.current && !activityDropdownRef.current.contains(event.target)) {
        setActivityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get current student data (first visible student)
  const currentStudent = useMemo(() => {
    if (performanceData.length === 0) return null;
    const visibleStudentIds = Object.entries(visibleStudents)
      .filter(([isVisible]) => isVisible)
      .map(([id]) => id);
    
    return performanceData.find(s => s.studentId === visibleStudentIds[0]) || performanceData[0];
  }, [performanceData, visibleStudents]);

  // Color palette for students
  const studentColors = useMemo(() => {
    const colors = [
      '#6366F1', // Primary purple (first visible student)
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
    
    // Assign colors to visible students
    performanceData.forEach((student, index) => {
      if (visibleStudents[student.studentId]) {
        if (index === 0) {
          assignedColors[student.studentId] = colors[0]; // Primary color for first student
        } else {
          colorIndex = (colorIndex % (colors.length - 1)) + 1; // Skip first color
          assignedColors[student.studentId] = colors[colorIndex];
        }
      }
    });
    
    return assignedColors;
  }, [performanceData, visibleStudents]);

  // Calculate insights for comparison
  const comparisonInsights = useMemo(() => {
    if (performanceData.length === 0 || !currentStudent) {
      return {
        currentStudentRank: 0,
        totalStudents: 0,
        currentStudentAvg: 0,
        classAvg: 0,
        topStudent: null,
        bottomStudent: null,
        trendVsClassAvg: 0,
        trendDirection: 'stable'
      };
    }

    // Calculate class average across all students in the class
    const allScores = performanceData.flatMap(student => 
      student.performanceTrend.map(week => week.score)
    );
    const classAvg = allScores.length > 0 
      ? allScores.reduce((sum, score) => sum + score, 0) / allScores.length 
      : 0;

    // Current student average
    const currentStudentAvg = currentStudent?.performanceTrend?.length > 0
      ? currentStudent.performanceTrend.reduce((sum, week) => sum + week.score, 0) / currentStudent.performanceTrend.length
      : 0;

    // Sort students by average performance
    const sortedStudents = [...performanceData].sort((a, b) => {
      const avgA = a.performanceTrend.length > 0 
        ? a.performanceTrend.reduce((sum, week) => sum + week.score, 0) / a.performanceTrend.length 
        : 0;
      const avgB = b.performanceTrend.length > 0 
        ? b.performanceTrend.reduce((sum, week) => sum + week.score, 0) / b.performanceTrend.length 
        : 0;
      return avgB - avgA;
    });

    const currentStudentRank = sortedStudents.findIndex(s => s.studentId === currentStudent.studentId) + 1;
    const topStudent = sortedStudents[0];
    const bottomStudent = sortedStudents[sortedStudents.length - 1];

    // Trend vs class average
    const trendVsClassAvg = currentStudentAvg - classAvg;
    const trendDirection = trendVsClassAvg > 2 ? 'up' : trendVsClassAvg < -2 ? 'down' : 'stable';

    return {
      currentStudentRank,
      totalStudents: performanceData.length,
      currentStudentAvg: parseFloat(currentStudentAvg.toFixed(2)), // 2 decimal points
      classAvg: parseFloat(classAvg.toFixed(2)), // 2 decimal points
      topStudent,
      bottomStudent,
      trendVsClassAvg: Math.abs(trendVsClassAvg).toFixed(2), // 2 decimal points
      trendDirection,
      sortedStudents
    };
  }, [performanceData, currentStudent]);

  // Get visible students data
  const visibleStudentsData = useMemo(() => {
    return performanceData.filter(student => visibleStudents[student.studentId]) || [];
  }, [performanceData, visibleStudents]);

  // Calculate visible student count
  const visibleCount = Object.values(visibleStudents).filter(Boolean).length;

  // Get all weeks from all students
  const weeks = useMemo(() => {
    if (visibleStudentsData.length === 0) return [];
    
    // Find the student with the most weeks
    const studentWithMostWeeks = visibleStudentsData.reduce((prev, current) => 
      current.performanceTrend.length > prev.performanceTrend.length ? current : prev
    );
    
    return studentWithMostWeeks.performanceTrend || [];
  }, [visibleStudentsData]);

  // Chart dimensions
  const chartHeight = 320;
  const margin = { top: 30, right: 30, bottom: 40, left: 40 };
  const innerWidth = 1200;
  const innerHeight = chartHeight - margin.top - margin.bottom;
  
  const maxScore = 100;
  
  // Calculate positions
  const xScale = (week) => (week - 1) * (innerWidth / Math.max(weeks.length - 1, 1));
  const yScale = (score) => innerHeight - (score / maxScore) * innerHeight;

  // Handle mouse events
  const handleMouseEnter = (week, studentId, event) => {
    setHoveredWeek(week);
    setHoveredStudent(studentId);
    
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    setTooltipPosition({ 
      x: mouseX, 
      y: mouseY 
    });
  };

  // Handle node click
  const handleNodeClick = (week, studentId, event) => {
    event.stopPropagation();
    
    const student = performanceData.find(s => s.studentId === studentId);
    if (!student) return;
    
    const weekData = student.performanceTrend.find(w => w.week === week);
    if (!weekData) return;
    
    // Get previous week's score for comparison
    const previousWeek = student.performanceTrend.find(w => w.week === week - 1);
    const previousScore = previousWeek ? previousWeek.score : null;
    const performanceChange = previousScore ? weekData.score - previousScore : 0;
    
    // Generate performance reasons
    const reasons = generatePerformanceReasons(
      student.studentName,
      week,
      weekData.score,
      previousScore
    );
    
    // Get performance zone for the score
    const performanceZone = weekData.score < 71 ? "Failing" : 
                          weekData.score >= 71 && weekData.score <= 75 ? "Close to Failing" : 
                          "Passing";
    
    const dataPoint = {
      studentData: {
        studentName: student.studentName,
        studentNumber: student.studentNumber,
        currentScore: parseFloat(weekData.score.toFixed(2)), // 2 decimal points
        previousScore: previousScore ? parseFloat(previousScore.toFixed(2)) : null,
        performanceChange: parseFloat(performanceChange.toFixed(2)), // 2 decimal points
        performanceZone,
        attendance: student.attendance || 0,
        assignmentCompletion: student.assignmentCompletion || 0
      },
      weekData: {
        week,
        score: parseFloat(weekData.score.toFixed(2)), // 2 decimal points
        reasons
      }
    };
    
    setSelectedDataPoint(dataPoint);
    setIsPopupOpen(true);
  };

  // Create smooth line path for a student
  const createSmoothLinePath = (studentData) => {
    if (!studentData || studentData.length < 2) return '';
    
    let path = `M ${margin.left + xScale(studentData[0].week)} ${margin.top + yScale(studentData[0].score)}`;
    
    for (let i = 1; i < studentData.length; i++) {
      const prevX = margin.left + xScale(studentData[i-1].week);
      const prevY = margin.top + yScale(studentData[i-1].score);
      const currX = margin.left + xScale(studentData[i].week);
      const currY = margin.top + yScale(studentData[i].score);
      
      const cp1x = prevX + (currX - prevX) * 0.25;
      const cp1y = prevY;
      const cp2x = prevX + (currX - prevX) * 0.75;
      const cp2y = currY;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${currX} ${currY}`;
    }
    
    return path;
  };

  // Toggle student visibility
  const toggleStudentVisibility = (studentId) => {
    setVisibleStudents(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  // Select/deselect all students
  const toggleAllStudents = () => {
    const allVisible = Object.values(visibleStudents).every(Boolean);
    const newVisibility = {};
    
    propStudents.forEach(student => {
      newVisibility[student.studentId] = !allVisible;
    });
    
    setVisibleStudents(newVisibility);
  };

  // Handle activity type change
  const handleActivityTypeChange = (type) => {
    setSelectedActivityType(type);
    setActivityDropdownOpen(false);
  };

  // Get selected activity type label
  const getSelectedActivityLabel = () => {
    const selected = activityTypes.find(type => type.value === selectedActivityType);
    return selected ? selected.label : 'All Activities';
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

  if (loading) {
    return (
      <div className={`${getCardBackground()} rounded-xl border ${getCardBorder()}`}>
        <div className={`p-4 border-b ${getCardBorder()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <img 
                  src={LineGraphIcon} 
                  alt="Analytics" 
                  className="w-5 h-5"
                  style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
                />
              </div>
              <h3 className={`font-bold text-lg ${getTextColor()}`}>Student Performance Trend</h3>
            </div>
            <div className={`text-sm ${getSecondaryTextColor()}`}>Loading...</div>
          </div>
        </div>
        <div className="h-48 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6366F1] mx-auto mb-3"></div>
            <p className={getSecondaryTextColor()}>Loading performance data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (performanceData.length === 0 && !useMockData) {
    return (
      <div className={`${getCardBackground()} rounded-xl border ${getCardBorder()}`}>
        <div className={`p-4 border-b ${getCardBorder()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <img 
                  src={LineGraphIcon} 
                  alt="Analytics" 
                  className="w-5 h-5"
                  style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
                />
              </div>
              <h3 className={`font-bold text-lg ${getTextColor()}`}>Student Performance Trend</h3>
            </div>
            <div className={`text-sm ${getSecondaryTextColor()}`}>No data available</div>
          </div>
        </div>
        <div className="h-48 flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center mx-auto mb-3">
              <img 
                src={LineGraphIcon} 
                alt="Analytics" 
                className="w-8 h-8 opacity-40"
                style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
              />
            </div>
            <p className={getSecondaryTextColor()}>No performance data available for this subject</p>
            <p className={`text-sm ${getSecondaryTextColor()} mt-2`}>Check if activities and attendance have been recorded</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${getCardBackground()} rounded-xl border ${getCardBorder()} relative`}>
      {/* Header - Always visible */}
      <div className={`p-4 border-b ${getCardBorder()}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center gap-3 mb-3 md:mb-0">
            <div className="flex items-center justify-center">
              <img 
                src={LineGraphIcon} 
                alt="Analytics" 
                className="w-5 h-5"
                style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
              />
            </div>
            <div>
              <h3 className={`font-bold text-lg ${getTextColor()}`}>Student Performance Trend</h3>
              <p className={`text-sm ${getSecondaryTextColor()}`}>
                Individual student performance comparison
                {selectedActivityType !== 'all' && (
                  <span className="ml-2 text-[#FFA600] text-xs">
                    ({getSelectedActivityLabel()})
                  </span>
                )}
                {useMockData && performanceData.length === 0 && (
                  <span className="ml-2 text-[#FFA600] text-xs">(Sample Data)</span>
                )}
              </p>
            </div>
          </div>
          
          {/* Right side with stats and collapse button */}
          <div className="flex items-center gap-3">
            {/* Current student stats */}
            {currentStudent && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className={`text-xs ${getSecondaryTextColor()}`}>Student Rank</div>
                  <div className={`font-bold text-base ${getTextColor()}`}>
                    #{comparisonInsights.currentStudentRank} of {comparisonInsights.totalStudents}
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
            )}
            
            {/* Collapse/Expand button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-1.5 rounded-lg ${getInputBackground()} ${getInputHover()} transition-all duration-200 cursor-pointer`}
              aria-label={isCollapsed ? "Expand chart" : "Collapse chart"}
            >
              <div className="w-4 h-4 flex items-center justify-center">
                {isCollapsed ? (
                  <img 
                    src={ArrowDown} 
                    alt="Expand" 
                    className="w-3 h-3"
                    style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
                  />
                ) : (
                  <img 
                    src={ArrowUp} 
                    alt="Collapse" 
                    className="w-3 h-3"
                    style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
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
          {/* Filters Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            {/* Activity Type Filter */}
            <div className="relative" ref={activityDropdownRef}>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${getSecondaryTextColor()}`}>Filter by:</span>
                <button
                  onClick={() => setActivityDropdownOpen(!activityDropdownOpen)}
                  className={`flex items-center justify-between gap-2 px-3 py-2 ${getInputBackground()} ${getInputHover()} rounded-lg text-sm ${getTextColor()} transition-all duration-200 border ${getInputBorder()} min-w-[180px]`}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ 
                        backgroundColor: activityTypes.find(t => t.value === selectedActivityType)?.color || '#6366F1' 
                      }}
                    />
                    <span>{getSelectedActivityLabel()}</span>
                  </div>
                  <div className="w-4 h-4 flex items-center justify-center">
                    {activityDropdownOpen ? (
                      <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </button>
                
                {/* Activity Type Dropdown Menu */}
                {activityDropdownOpen && (
                  <div className={`absolute left-0 mt-2 w-56 ${getDropdownBackground()} border ${getDropdownBorder()} rounded-lg shadow-2xl z-50 overflow-hidden`}>
                    <div className={`p-3 border-b ${getDropdownBorder()} ${getDropdownHeader()}`}>
                      <span className={`text-sm font-medium ${getTextColor()}`}>Select Activity Type</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                      {activityTypes.map(type => (
                        <button
                          key={type.value}
                          onClick={() => handleActivityTypeChange(type.value)}
                          className={`w-full flex items-center gap-3 p-3 ${getHoverBackground()} transition-all ${
                            selectedActivityType === type.value ? `${isDarkMode ? 'bg-[#2A2A35]' : 'bg-gray-100'}` : ''
                          }`}
                        >
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: type.color }}
                          />
                          <span className={`text-sm ${getTextColor()}`}>
                            {type.label}
                          </span>
                          {selectedActivityType === type.value && (
                            <svg className="w-4 h-4 ml-auto text-[#6366F1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Student Selection Dropdown */}
            <div className="relative" ref={studentDropdownRef}>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${getSecondaryTextColor()}`}>Students:</span>
                <button
                  onClick={() => setStudentDropdownOpen(!studentDropdownOpen)}
                  className={`flex items-center justify-between gap-2 px-3 py-2 ${getInputBackground()} ${getInputHover()} rounded-lg text-sm ${getTextColor()} transition-all duration-200 border ${getInputBorder()} min-w-[180px]`}
                >
                  <span className="flex items-center gap-1">
                    <span className="text-xs font-medium">{visibleCount} selected</span>
                    <div className="w-4 h-4 flex items-center justify-center">
                      {studentDropdownOpen ? (
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
                
                {/* Student Dropdown Menu */}
                {studentDropdownOpen && (
                  <div className={`absolute right-0 mt-2 w-56 ${getDropdownBackground()} border ${getDropdownBorder()} rounded-lg shadow-2xl z-50 overflow-hidden`}>
                    <div className={`p-3 border-b ${getDropdownBorder()} ${getDropdownHeader()}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${getTextColor()}`}>Select Students</span>
                        <button
                          onClick={toggleAllStudents}
                          className="text-xs text-[#6366F1] hover:text-[#767EE0] transition-colors"
                        >
                          {Object.values(visibleStudents).every(Boolean) ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                      {propStudents.map(student => {
                        const isVisible = visibleStudents[student.studentId];
                        const studentData = performanceData.find(s => s.studentId === student.studentId);
                        const hasPerformanceData = studentData && studentData.performanceTrend.length > 0;
                        
                        return (
                          <div
                            key={student.studentId}
                            className={`flex items-center p-3 ${getHoverBackground()} cursor-pointer transition-all ${
                              !hasPerformanceData ? 'opacity-50' : ''
                            }`}
                            onClick={() => {
                              if (hasPerformanceData) {
                                toggleStudentVisibility(student.studentId);
                              }
                            }}
                          >
                            {/* Custom Checkbox */}
                            <div className={`w-4 h-4 rounded flex items-center justify-center border mr-3 ${
                              isVisible && hasPerformanceData
                                ? 'bg-[#6366F1] border-[#6366F1]' 
                                : `${getInputBorder()} ${getInputBackground()}`
                            } ${!hasPerformanceData ? 'cursor-not-allowed' : ''}`}>
                              {isVisible && hasPerformanceData && (
                                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            
                            {/* Student Name */}
                            <div className={`text-sm ${getTextColor()} flex-1`}>
                              {student.studentName}
                              {!hasPerformanceData && (
                                <span className="ml-2 text-xs text-[#FFA600]">(No data)</span>
                              )}
                            </div>
                            
                            {/* Student Score if available */}
                            {studentData && studentData.performanceTrend.length > 0 && (
                              <div className={`text-xs ${getSecondaryTextColor()} ml-2`}>
                                {(
                                  studentData.performanceTrend.reduce((sum, week) => sum + week.score, 0) / 
                                  studentData.performanceTrend.length
                                ).toFixed(2)}%
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Selected Students Preview */}
          <div className="flex flex-wrap gap-2 mb-4">
            {propStudents
              .filter(student => visibleStudents[student.studentId])
              .map(student => {
                const studentData = performanceData.find(s => s.studentId === student.studentId);
                
                return (
                  <div
                    key={student.studentId}
                    className={`flex items-center gap-2 px-3 py-1.5 ${getInputBackground()} rounded-lg border ${getInputBorder()}`}
                  >
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: studentColors[student.studentId] || '#6366F1' }}
                    />
                    <span className={`text-xs ${getTextColor()}`}>
                      {student.studentName.split(' ')[0]}
                    </span>
                    {studentData && (
                      <span className="text-xs text-[#00A15D] ml-1">
                        {(
                          studentData.performanceTrend.reduce((sum, week) => sum + week.score, 0) / 
                          Math.max(studentData.performanceTrend.length, 1)
                        ).toFixed(2)}%
                      </span>
                    )}
                    <button
                      onClick={() => toggleStudentVisibility(student.studentId)}
                      className={`ml-1 ${getSecondaryTextColor()} hover:text-[#FF5555] transition-all`}
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                );
              })}
          </div>

          {/* Chart container */}
          {visibleStudentsData.length > 0 ? (
            <div 
              className="relative pt-4" 
              onMouseMove={handleMouseMove}
              onMouseLeave={() => {
                setHoveredWeek(null);
                setHoveredStudent(null);
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
                    {/* Gradient definitions for each visible student */}
                    {visibleStudentsData.map(student => (
                      <linearGradient key={`gradient-${student.studentId}`} id={`areaGradient-${student.studentId}`} x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={studentColors[student.studentId] || '#6366F1'} stopOpacity="0.25"/>
                        <stop offset="100%" stopColor={studentColors[student.studentId] || '#6366F1'} stopOpacity="0"/>
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
                        stroke={isDarkMode ? "#2A2A35" : "#e5e7eb"}
                        strokeWidth={1}
                        strokeDasharray={score === 70 || score === 75 || score === 100 ? "5,5" : "2,2"}
                        opacity={0.5}
                      />
                      <text
                        x={margin.left - 10}
                        y={margin.top + yScale(score)}
                        textAnchor="end"
                        dominantBaseline="middle"
                        fill={isDarkMode ? "#FFFFFF" : "#374151"}
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

                  {/* Draw lines for each visible student */}
                  {visibleStudentsData.map(student => {
                    const linePath = createSmoothLinePath(student.performanceTrend);
                    const isFirst = visibleStudentsData[0]?.studentId === student.studentId;
                    
                    return (
                      <g key={`student-${student.studentId}`}>
                        {/* Area under curve */}
                        {linePath && student.performanceTrend.length > 0 && (
                          <path
                            d={`${linePath} L ${margin.left + xScale(student.performanceTrend[student.performanceTrend.length-1].week)} ${margin.top + innerHeight} L ${margin.left + xScale(student.performanceTrend[0].week)} ${margin.top + innerHeight} Z`}
                            fill={`url(#areaGradient-${student.studentId})`}
                            opacity={0.3}
                          />
                        )}

                        {/* Performance line */}
                        {linePath && (
                          <path
                            d={linePath}
                            fill="none"
                            stroke={studentColors[student.studentId] || '#6366F1'}
                            strokeWidth={isFirst ? "4" : "2"}
                            strokeLinecap="round"
                            opacity={0.8}
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
                          fill={isDarkMode ? "#FFFFFF" : "#374151"}
                          fontSize="10"
                          opacity={0.7}
                        >
                          Week {week.week}
                        </text>
                      );
                    }
                    return null;
                  })}

                  {/* Data points for each visible student */}
                  {visibleStudentsData.map(student => {
                    const isFirst = visibleStudentsData[0]?.studentId === student.studentId;
                    
                    return student.performanceTrend.map((week) => {
                      const x = margin.left + xScale(week.week);
                      const y = margin.top + yScale(week.score);
                      const isHovered = hoveredWeek === week.week && hoveredStudent === student.studentId;
                      const performanceZoneColor = getPerformanceZoneColor(week.score);
                      
                      return (
                        <g key={`point-${student.studentId}-${week.week}`}>
                          {/* Hover area */}
                          <circle
                            cx={x}
                            cy={y}
                            r={isFirst ? 20 : 16}
                            fill="transparent"
                            onMouseEnter={(e) => handleMouseEnter(week.week, student.studentId, e)}
                            onMouseLeave={() => {
                              setHoveredWeek(null);
                              setHoveredStudent(null);
                            }}
                            className="cursor-pointer"
                          />
                          
                          {/* Data point - Clickable */}
                          <circle
                            cx={x}
                            cy={y}
                            r={isHovered ? (isFirst ? 8 : 6) : (isFirst ? 6 : 4)}
                            fill={studentColors[student.studentId] || '#6366F1'}
                            stroke={performanceZoneColor}
                            strokeWidth="2"
                            onMouseEnter={(e) => handleMouseEnter(week.week, student.studentId, e)}
                            onMouseLeave={() => {
                              setHoveredWeek(null);
                              setHoveredStudent(null);
                            }}
                            onClick={(e) => handleNodeClick(week.week, student.studentId, e)}
                            className="cursor-pointer transition-all duration-150 hover:stroke-white hover:stroke-[3px]"
                          />
                        </g>
                      );
                    });
                  })}
                </svg>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center justify-center mx-auto mb-3">
                  <img 
                    src={LineGraphIcon} 
                    alt="Analytics" 
                    className="w-8 h-8 opacity-40"
                    style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
                  />
                </div>
                <p className={getSecondaryTextColor()}>No students selected or no performance data available</p>
                <p className={`text-sm ${getSecondaryTextColor()} mt-2`}>Select students from the dropdown above</p>
              </div>
            </div>
          )}

          {/* Performance zones legend */}
          <div className="mt-6 flex flex-wrap gap-2 text-xs justify-center">
            <div className={`flex items-center gap-1 px-2 py-1 ${getInputBackground()} rounded`}>
              <div 
                className="w-2 h-2 rounded-full"
                style={{ 
                  backgroundColor: activityTypes.find(t => t.value === selectedActivityType)?.color || '#6366F1' 
                }}
              />
              <span className={`text-xs ${getTextColor()}`}>{getSelectedActivityLabel()}</span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 ${getInputBackground()} rounded`}>
              <div className="w-2 h-2 rounded-full bg-[#FF5555]"></div>
              <span className="text-[#FF5555] text-xs">Below 70% (Failing)</span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 ${getInputBackground()} rounded`}>
              <div className="w-2 h-2 rounded-full bg-[#FFA600]"></div>
              <span className="text-[#FFA600] text-xs">71-75% (Close to Failing)</span>
            </div>
            <div className={`flex items-center gap-1 px-2 py-1 ${getInputBackground()} rounded`}>
              <div className="w-2 h-2 rounded-full bg-[#00A15D]"></div>
              <span className="text-[#00A15D] text-xs">76%+ (Passing)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsed State Summary */}
      {isCollapsed && currentStudent && (
        <div className={`p-4 border-t ${getCardBorder()}`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left side - Current student summary */}
            <div className="flex items-start gap-6">
              <div className="text-left">
                <div className={`text-xs ${getSecondaryTextColor()}`}>Current Student</div>
                <div className="font-bold text-base text-[#6366F1]">
                  {currentStudent?.studentName?.split(' ')[0] || "Student"}
                </div>
                <div className={`text-sm ${getTextColor()} mt-1`}>
                  Avg: {comparisonInsights.currentStudentAvg.toFixed(2)}%
                </div>
              </div>
              
              <div className="text-left">
                <div className={`text-xs ${getSecondaryTextColor()}`}>Class Average</div>
                <div className={`font-bold text-base ${getTextColor()}`}>
                  {comparisonInsights.classAvg.toFixed(2)}%
                </div>
                <div className={`text-sm ${comparisonInsights.trendDirection === 'up' ? 'text-[#00A15D]' : comparisonInsights.trendDirection === 'down' ? 'text-[#FF5555]' : 'text-[#FFA600]'}`}>
                  {comparisonInsights.trendDirection === 'up' ? '+' : comparisonInsights.trendDirection === 'down' ? '-' : ''}
                  {comparisonInsights.trendVsClassAvg}% vs avg
                </div>
              </div>
              
              <div className="text-left">
                <div className={`text-xs ${getSecondaryTextColor()}`}>Student Ranking</div>
                <div className={`font-bold text-base ${getTextColor()}`}>
                  #{comparisonInsights.currentStudentRank} / {comparisonInsights.totalStudents}
                </div>
                {comparisonInsights.topStudent && (
                  <div className={`text-sm ${getSecondaryTextColor()} mt-1`}>
                    Top: {comparisonInsights.topStudent.studentName.split(' ')[0]}
                  </div>
                )}
              </div>

              <div className="text-left">
                <div className={`text-xs ${getSecondaryTextColor()}`}>Activity Type</div>
                <div className={`font-bold text-base ${getTextColor()}`}>
                  {getSelectedActivityLabel()}
                </div>
                {selectedActivityType === 'all' ? (
                  <div className={`text-xs ${getSecondaryTextColor()} mt-1`}>(75% Academic + 25% Attendance)</div>
                ) : (
                  <div className={`text-xs ${getSecondaryTextColor()} mt-1`}>(Academic Only)</div>
                )}
              </div>
            </div>
            
            {/* Right side - Student quick stats */}
            <div className="flex items-center gap-6">
              {currentStudent && selectedActivityType === 'all' && (
                <>
                  <div className="text-left">
                    <div className={`text-xs ${getSecondaryTextColor()}`}>Attendance</div>
                    <div className="font-bold text-base text-[#00A15D]">
                      {currentStudent.attendance || 0}%
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <div className={`text-xs ${getSecondaryTextColor()}`}>Assignments</div>
                    <div className="font-bold text-base text-[#10B981]">
                      {currentStudent.assignmentCompletion || 0}%
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* External Tooltip */}
      {hoveredWeek && hoveredStudent && !isCollapsed && visibleStudentsData.length > 0 && (
        <div 
          ref={tooltipRef}
          className={`fixed ${getTooltipBackground()} border ${getTooltipBorder()} rounded-lg p-3 shadow-2xl z-50 pointer-events-none transition-all duration-150`}
          style={{
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y - 120}px`,
            transform: 'translateX(-50%)',
            minWidth: '180px'
          }}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className={`${getTextColor()} text-sm font-semibold`}>Week {hoveredWeek}</span>
              <span className={`text-xs ${getSecondaryTextColor()}`}>
                {visibleStudentsData.find(s => s.studentId === hoveredStudent)?.studentName}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: studentColors[hoveredStudent] || '#6366F1' }}
              />
              <span className="text-lg font-bold text-white">
                {visibleStudentsData.find(s => s.studentId === hoveredStudent)?.performanceTrend?.find(w => w.week === hoveredWeek)?.score?.toFixed(2) || '0.00'}%
              </span>
            </div>
            
            {/* Show performance zone in tooltip */}
            {(() => {
              const score = visibleStudentsData.find(s => s.studentId === hoveredStudent)?.performanceTrend?.find(w => w.week === hoveredWeek)?.score || 0;
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

            <div className={`text-xs ${getSecondaryTextColor()}`}>
              {getSelectedActivityLabel()}
              {selectedActivityType === 'all' ? ' (Weighted)' : ' (Academic)'}
            </div>
            
            <div className={`text-xs ${getSecondaryTextColor()} mt-1`}>
              Click for detailed analysis
            </div>
          </div>
          
          {/* Tooltip arrow */}
          <div className={`absolute w-2 h-2 ${getTooltipBackground()} border-r border-b ${getTooltipBorder()} 
            transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2`} />
        </div>
      )}

      {/* Student Performance Analysis Popup */}
      <StudentPerformancePopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        studentData={selectedDataPoint?.studentData}
        weekData={selectedDataPoint?.weekData}
        activityType={selectedActivityType}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default ClassPerformanceTrend;