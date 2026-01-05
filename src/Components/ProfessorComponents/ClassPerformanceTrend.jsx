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

// MOCK DATA GENERATOR - For student performance
const generateMockStudents = () => {
  const students = [
    { studentId: 'stud-001', studentName: 'John Smith', studentNumber: '2023001' },
    { studentId: 'stud-002', studentName: 'Maria Garcia', studentNumber: '2023002' },
    { studentId: 'stud-003', studentName: 'David Chen', studentNumber: '2023003' },
    { studentId: 'stud-004', studentName: 'Sarah Johnson', studentNumber: '2023004' },
    { studentId: 'stud-005', studentName: 'Michael Brown', studentNumber: '2023005' },
  ];

  // Generate performance trends for 8 weeks
  const weeks = [1, 2, 3, 4, 5, 6, 7, 8];
  
  return students.map((student, index) => {
    // Create different performance patterns for each student
    let baseScore;
    let volatility;
    let trendType;
    
    switch(index % 5) {
      case 0: // Consistently high performer
        baseScore = 88;
        volatility = 4;
        trendType = 'high';
        break;
      case 1: // Average performer, stable
        baseScore = 78;
        volatility = 6;
        trendType = 'stable';
        break;
      case 2: // Struggling student
        baseScore = 68;
        volatility = 8;
        trendType = 'low';
        break;
      case 3: // Improving student
        baseScore = 72;
        volatility = 5;
        trendType = 'improving';
        break;
      case 4: // Declining student
        baseScore = 85;
        volatility = 7;
        trendType = 'declining';
        break;
      default:
        baseScore = 75;
        volatility = 8;
        trendType = 'stable';
    }

    const performanceTrend = weeks.map(week => {
      // Add trend based on student type
      let trend = 0;
      if (trendType === 'improving') trend = week * 1.5; // Upward trend
      if (trendType === 'declining') trend = -week * 1.0; // Downward trend
      if (trendType === 'high') trend = week * 0.5; // Slight upward
      if (trendType === 'low') trend = -week * 0.3; // Slight downward
      
      // Add some randomness
      const random = (Math.random() - 0.5) * volatility;
      
      let score = baseScore + trend + random;
      
      // Ensure score stays within bounds
      score = Math.min(Math.max(score, 50), 98);
      
      return {
        week,
        score: Math.round(score)
      };
    });

    return {
      ...student,
      performanceTrend,
      attendance: Math.floor(Math.random() * 15) + 85, // 85-100% attendance
      assignmentCompletion: Math.floor(Math.random() * 15) + 80, // 80-95% completion
      performanceType: trendType
    };
  });
};

// Function to generate mock performance reasons for students
const generatePerformanceReasons = (studentName, week, currentScore, previousScore) => {
  const scoreChange = previousScore ? currentScore - previousScore : 0;
  const isImproving = scoreChange > 0;

  const reasons = [
    {
      factor: "Assignment Scores",
      description: isImproving
        ? "Assignment scores have improved significantly"
        : "Assignment scores show a decline this week",
      impact: isImproving ? "positive" : "negative",
      details: isImproving 
        ? "Higher accuracy in submitted work" 
        : "Multiple errors in recent submissions"
    },
    {
      factor: "Class Participation",
      description: isImproving
        ? "Active participation in class discussions"
        : "Reduced participation observed",
      impact: isImproving ? "positive" : "negative",
      details: isImproving
        ? "Frequently contributes to discussions"
        : "Minimal engagement in classroom activities"
    },
    {
      factor: "Attendance",
      description: isImproving
        ? "Perfect attendance maintained"
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

const ClassPerformanceTrend = ({ 
  students: propStudents, 
  currentStudentId,
  useMockData = false
}) => {
  const [hoveredWeek, setHoveredWeek] = useState(null);
  const [hoveredStudent, setHoveredStudent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [visibleStudents, setVisibleStudents] = useState({});
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedDataPoint, setSelectedDataPoint] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const dropdownRef = useRef(null);

  // Use mock data if prop is empty or useMockData is true
  const students = useMemo(() => {
    if (useMockData || !propStudents || propStudents.length === 0) {
      return generateMockStudents();
    }
    return propStudents;
  }, [propStudents, useMockData]);

  // Initialize visible students (limit to 4 visible by default for clarity)
  useMemo(() => {
    if (students && students.length > 0) {
      const initialVisibility = {};
      students.forEach((student, index) => {
        // Show first 4 students by default, or current student if specified
        initialVisibility[student.studentId] = index < 4 || student.studentId === currentStudentId;
      });
      setVisibleStudents(initialVisibility);
    }
  }, [students, currentStudentId]);

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

  // Default currentStudentId if not provided
  const defaultCurrentStudentId = currentStudentId || (students?.[0]?.studentId);
  const currentStudent = students?.find(s => s.studentId === defaultCurrentStudentId) || students?.[0];
  
  // Color palette for students
  const studentColors = useMemo(() => {
    const colors = [
      '#6366F1', // Primary purple (current student)
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
    
    // Assign colors to students
    students?.forEach((student, index) => {
      if (student.studentId === defaultCurrentStudentId) {
        assignedColors[student.studentId] = colors[0]; // Primary color for current student
      } else {
        colorIndex = (colorIndex % (colors.length - 1)) + 1; // Skip first color
        assignedColors[student.studentId] = colors[colorIndex];
      }
    });
    
    return assignedColors;
  }, [students, defaultCurrentStudentId]);

  // Calculate insights for comparison
  const comparisonInsights = useMemo(() => {
    if (!students || students.length === 0) {
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

    // Calculate class average across all students
    const allScores = students.flatMap(student => 
      student.performanceTrend.map(week => week.score)
    );
    const classAvg = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;

    // Current student average
    const currentStudentAvg = currentStudent?.performanceTrend?.length > 0
      ? currentStudent.performanceTrend.reduce((sum, week) => sum + week.score, 0) / currentStudent.performanceTrend.length
      : 0;

    // Sort students by average performance
    const sortedStudents = [...students].sort((a, b) => {
      const avgA = a.performanceTrend.reduce((sum, week) => sum + week.score, 0) / a.performanceTrend.length;
      const avgB = b.performanceTrend.reduce((sum, week) => sum + week.score, 0) / b.performanceTrend.length;
      return avgB - avgA;
    });

    const currentStudentRank = sortedStudents.findIndex(s => s.studentId === defaultCurrentStudentId) + 1;
    const topStudent = sortedStudents[0];
    const bottomStudent = sortedStudents[sortedStudents.length - 1];

    // Trend vs class average
    const trendVsClassAvg = currentStudentAvg - classAvg;
    const trendDirection = trendVsClassAvg > 2 ? 'up' : trendVsClassAvg < -2 ? 'down' : 'stable';

    return {
      currentStudentRank,
      totalStudents: students.length,
      currentStudentAvg: Math.round(currentStudentAvg),
      classAvg: Math.round(classAvg),
      topStudent,
      bottomStudent,
      trendVsClassAvg: Math.abs(trendVsClassAvg).toFixed(1),
      trendDirection,
      sortedStudents
    };
  }, [students, defaultCurrentStudentId, currentStudent]);

  // Get visible students data
  const visibleStudentsData = useMemo(() => {
    return students?.filter(student => visibleStudents[student.studentId]) || [];
  }, [students, visibleStudents]);

  // Calculate visible student count
  const visibleCount = Object.values(visibleStudents).filter(Boolean).length;

  // Chart dimensions
  const chartHeight = 320;
  const margin = { top: 30, right: 30, bottom: 40, left: 40 };
  const innerWidth = 1200;
  const innerHeight = chartHeight - margin.top - margin.bottom;
  
  const maxScore = 100;
  
  // Get all weeks from all students (assume same weeks for all students)
  const weeks = currentStudent?.performanceTrend || [];

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
    
    const student = students.find(s => s.studentId === studentId);
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
        currentScore: weekData.score,
        previousScore,
        performanceChange,
        performanceZone,
        attendance: student.attendance || 0,
        assignmentCompletion: student.assignmentCompletion || 0
      },
      weekData: {
        week,
        score: weekData.score,
        reasons
      }
    };
    
    setSelectedDataPoint(dataPoint);
    setIsPopupOpen(true);
  };

  // Calculate positions
  const xScale = (week) => (week - 1) * (innerWidth / (weeks.length - 1));
  const yScale = (score) => innerHeight - (score / maxScore) * innerHeight;

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

  if (!students || students.length === 0) {
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
              <h3 className="font-bold text-lg text-[#FFFFFF]">Student Performance Trend</h3>
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
            <p className="text-[#FFFFFF]/60">Loading student performance data...</p>
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
              <h3 className="font-bold text-lg text-[#FFFFFF]">Student Performance Trend</h3>
              <p className="text-sm text-[#FFFFFF]/60">
                Individual student performance comparison
                {useMockData && (
                  <span className="ml-2 text-[#FFA600] text-xs">(Demo Data)</span>
                )}
              </p>
            </div>
          </div>
          
          {/* Right side with stats and collapse button */}
          <div className="flex items-center gap-3">
            {/* Current student stats */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-[#FFFFFF]/60">Student Rank</div>
                <div className="font-bold text-base text-[#FFFFFF]">
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
          {/* Student Selection Dropdown */}
          <div className='mt-5 relative' ref={dropdownRef}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-[#FFFFFF]/60">Select students to display:</span>
              
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
                      <span className="text-sm font-medium text-white">Select Students</span>
                    </div>
                    
                    {/* Student List */}
                    <div className="max-h-48 overflow-y-auto custom-scrollbar">
                      {students.map(student => {
                        const isCurrent = student.studentId === defaultCurrentStudentId;
                        const isVisible = visibleStudents[student.studentId];
                        
                        return (
                          <div
                            key={student.studentId}
                            className={`flex items-center p-3 hover:bg-[#2A2A35] cursor-pointer transition-all ${
                              isCurrent ? 'bg-[#6366F1]/5' : ''
                            }`}
                            onClick={() => toggleStudentVisibility(student.studentId)}
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
                            
                            {/* Student Name */}
                            <div className="text-sm text-white">
                              {student.studentName}
                              {isCurrent && (
                                <span className="ml-2 text-xs text-[#6366F1] font-medium">(Current)</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Selected Students Preview */}
            <div className="flex flex-wrap gap-2 mb-4">
              {students
                .filter(student => visibleStudents[student.studentId])
                .map(student => (
                  <div
                    key={student.studentId}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#2A2A35] rounded-lg border border-[#FFFFFF]/5"
                  >
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: studentColors[student.studentId] }}
                    />
                    <span className="text-xs text-white">
                      {student.studentName.split(' ')[0]}
                    </span>
                    <button
                      onClick={() => toggleStudentVisibility(student.studentId)}
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
                      <stop offset="0%" stopColor={studentColors[student.studentId]} stopOpacity={student.studentId === defaultCurrentStudentId ? "0.25" : "0.15"}/>
                      <stop offset="100%" stopColor={studentColors[student.studentId]} stopOpacity="0"/>
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

                {/* Draw lines for each visible student */}
                {visibleStudentsData.map(student => {
                  const linePath = createSmoothLinePath(student.performanceTrend);
                  const isCurrent = student.studentId === defaultCurrentStudentId;
                  
                  return (
                    <g key={`student-${student.studentId}`}>
                      {/* Area under curve */}
                      {linePath && student.performanceTrend.length > 0 && (
                        <path
                          d={`${linePath} L ${margin.left + xScale(student.performanceTrend[student.performanceTrend.length-1].week)} ${margin.top + innerHeight} L ${margin.left + xScale(student.performanceTrend[0].week)} ${margin.top + innerHeight} Z`}
                          fill={`url(#areaGradient-${student.studentId})`}
                          opacity={isCurrent ? 0.4 : 0.3}
                        />
                      )}

                      {/* Performance line */}
                      {linePath && (
                        <path
                          d={linePath}
                          fill="none"
                          stroke={studentColors[student.studentId]}
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

                {/* Data points for each visible student */}
                {visibleStudentsData.map(student => {
                  const isCurrent = student.studentId === defaultCurrentStudentId;
                  
                  return student.performanceTrend.map((week, index) => {
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
                          r={isCurrent ? 20 : 16}
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
                          r={isHovered ? (isCurrent ? 8 : 6) : (isCurrent ? 6 : 4)}
                          fill={studentColors[student.studentId]}
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

          {/* Performance zones legend */}
          <div className="mt-6 flex flex-wrap gap-2 text-xs justify-center">
            <div className="flex items-center gap-1 px-2 py-1 bg-[#2A2A35] rounded">
              <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
              <span className="text-[#FFFFFF] text-xs">Current Student</span>
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
            {/* Left side - Current student summary */}
            <div className="flex items-start gap-6">
              <div className="text-left">
                <div className="text-xs text-[#FFFFFF]/60">Current Student</div>
                <div className="font-bold text-base text-[#6366F1]">
                  {currentStudent?.studentName?.split(' ')[0] || "Student"}
                </div>
                <div className="text-sm text-[#FFFFFF] mt-1">
                  Avg: {comparisonInsights.currentStudentAvg}%
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
                <div className="text-xs text-[#FFFFFF]/60">Student Ranking</div>
                <div className="font-bold text-base text-[#FFFFFF]">
                  #{comparisonInsights.currentStudentRank} / {comparisonInsights.totalStudents}
                </div>
                {comparisonInsights.topStudent && (
                  <div className="text-sm text-[#FFFFFF]/60 mt-1">
                    Top: {comparisonInsights.topStudent.studentName.split(' ')[0]}
                  </div>
                )}
              </div>
            </div>
            
            {/* Right side - Student quick stats */}
            <div className="flex items-center gap-6">
              {currentStudent && (
                <>
                  <div className="text-left">
                    <div className="text-xs text-[#FFFFFF]/60">Attendance</div>
                    <div className="font-bold text-base text-[#00A15D]">
                      {currentStudent.attendance || 0}%
                    </div>
                  </div>
                  
                  <div className="text-left">
                    <div className="text-xs text-[#FFFFFF]/60">Assignments</div>
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
      {hoveredWeek && hoveredStudent && !isCollapsed && (
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
                {students.find(s => s.studentId === hoveredStudent)?.studentName}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: studentColors[hoveredStudent] }}
              />
              <span className="text-lg font-bold text-white">
                {students.find(s => s.studentId === hoveredStudent)?.performanceTrend?.find(w => w.week === hoveredWeek)?.score || 0}%
              </span>
              {hoveredStudent === defaultCurrentStudentId && (
                <span className="text-xs text-white font-medium bg-[#6366F1] px-2 py-0.5 rounded">
                  Current
                </span>
              )}
            </div>
            
            {/* Show performance zone in tooltip */}
            {(() => {
              const score = students.find(s => s.studentId === hoveredStudent)?.performanceTrend?.find(w => w.week === hoveredWeek)?.score || 0;
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

      {/* Student Performance Analysis Popup */}
      <StudentPerformancePopup
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        studentData={selectedDataPoint?.studentData}
        weekData={selectedDataPoint?.weekData}
      />
    </div>
  );
};

export default ClassPerformanceTrend;