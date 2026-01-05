import React, { useState, useMemo, useRef, useEffect } from 'react';
import Analytics from '../../assets/BarChart.svg';

const ActivityScoresBarChart = ({ 
  activitiesData,
  selectedType = 'all',
  onTypeChange,
  studentId,
  subjectCode
}) => {
  const [hoveredActivity, setHoveredActivity] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [maxScore, setMaxScore] = useState(100);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [improvementData, setImprovementData] = useState(null);
  const [loadingImprovement, setLoadingImprovement] = useState(false);
  const [categoryStats, setCategoryStats] = useState({});
  
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Activity type options - including "All Activities" as first option
  const activityTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'assignment', label: 'Assignments' },
    { value: 'quiz', label: 'Quizzes' },
    { value: 'exam', label: 'Exams' },
    { value: 'activity', label: 'Activities'},
    { value: 'project', label: 'Projects' },
    { value: 'laboratory', label: 'Laboratories' }
  ];

  // Fetch improvement data when props change
  useEffect(() => {
    if (studentId && subjectCode && selectedType !== 'all') {
      fetchImprovementData();
    } else {
      setImprovementData(null);
    }
  }, [studentId, subjectCode, selectedType]);

  // Calculate category statistics for "All Activities" view
  useEffect(() => {
    if (selectedType === 'all') {
      calculateCategoryStats();
    }
  }, [activitiesData, selectedType]);

  const fetchImprovementData = async () => {
    if (!studentId || !subjectCode || selectedType === 'all') return;
    
    setLoadingImprovement(true);
    try {
      const response = await fetch(
        `https://tracked.6minds.site/Student/AnalyticsStudentDB/get_activity_improvement.php?student_id=${studentId}&subject_code=${subjectCode}&activity_type=${selectedType}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.improvement_data) {
          setImprovementData(data.improvement_data);
        } else {
          setImprovementData(null);
        }
      } else {
        setImprovementData(null);
      }
    } catch (error) {
      console.error('Error fetching improvement data:', error);
      setImprovementData(null);
    } finally {
      setLoadingImprovement(false);
    }
  };

  // Calculate statistics for each category (for "All Activities" view)
  const calculateCategoryStats = () => {
    const stats = {};
    
    // Process each category
    const categories = [
      { key: 'assignments', label: 'Assignments', data: activitiesData.assignments || [] },
      { key: 'quizzes', label: 'Quizzes', data: activitiesData.quizzes || [] },
      { key: 'activities', label: 'Activities', data: activitiesData.activities || [] },
      { key: 'projects', label: 'Projects', data: activitiesData.projects || [] },
      { key: 'laboratories', label: 'Laboratories', data: activitiesData.laboratories || [] }
    ];

    // Filter and process exams from all activities
    const allExams = [];
    categories.forEach(category => {
      category.data.forEach(activity => {
        const title = activity.title?.toLowerCase() || '';
        const task = activity.task?.toLowerCase() || '';
        
        // Check if it's an exam
        if (title.includes('exam') || title.includes('midterm') || title.includes('final') || 
            task.includes('exam') || task.includes('midterm') || task.includes('final')) {
          allExams.push(activity);
        }
      });
    });

    // Add exams as a category
    categories.push({ key: 'exams', label: 'Exams', data: allExams });

    categories.forEach(category => {
      const activities = category.data;
      if (activities.length > 0) {
        const scores = activities.map(a => a.score || 0);
        const validScores = scores.filter(score => score > 0);
        
        stats[category.key] = {
          label: category.label,
          count: activities.length,
          completed: activities.filter(a => a.submitted).length,
          average: validScores.length > 0 ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length) : 0,
          highest: validScores.length > 0 ? Math.max(...validScores) : 0,
          lowest: validScores.length > 0 ? Math.min(...validScores.filter(s => s > 0)) : 0,
          totalScore: scores.reduce((sum, score) => sum + score, 0),
          color: getAverageColor(validScores.length > 0 ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length) : 0)
        };
      } else {
        stats[category.key] = {
          label: category.label,
          count: 0,
          completed: 0,
          average: 0,
          highest: 0,
          lowest: 0,
          totalScore: 0,
          color: '#666666'
        };
      }
    });

    setCategoryStats(stats);
  };

  // Get color based on average score
  const getAverageColor = (score) => {
    if (score >= 80) return "#00A15D"; // Green for 80%+
    if (score >= 71) return "#FFA600"; // Yellow for 71-79%
    return "#FF5555"; // Red for 70% and below
  };

  // Get color for individual score
  const getScoreColor = (score) => {
    if (score >= 80) return "#00A15D"; // Green for 80%+
    if (score >= 71) return "#FFA600"; // Yellow for 71-79%
    return "#FF5555"; // Red for 70% and below
  };

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
    if (selectedType === 'all') {
      // For "All Activities" view, we'll handle it differently in render
      return [];
    }

    let activities = [];
    
    switch (selectedType) {
      case 'assignment':
        activities = activitiesData.assignments || [];
        break;
      case 'quiz':
        activities = activitiesData.quizzes || [];
        break;
      case 'exam':
        // Filter exams from all activities
        const allActivities = [
          ...(activitiesData.assignments || []),
          ...(activitiesData.quizzes || []),
          ...(activitiesData.activities || []),
          ...(activitiesData.projects || []),
          ...(activitiesData.laboratories || [])
        ];
        activities = allActivities.filter(activity => {
          const title = activity.title?.toLowerCase() || '';
          const task = activity.task?.toLowerCase() || '';
          const activityType = activity.activity_type?.toLowerCase() || '';
          
          return title.includes('exam') || 
                 title.includes('midterm') || 
                 title.includes('final') ||
                 task.includes('exam') || 
                 task.includes('midterm') || 
                 task.includes('final') ||
                 activityType.includes('exam');
        });
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
    
    // Sort by task number if available, otherwise by title or date
    return activities.sort((a, b) => {
      const getNumber = (str) => {
        const match = str?.match(/\d+/);
        return match ? parseInt(match[0]) : 0;
      };
      
      const aNum = getNumber(a.task || a.title);
      const bNum = getNumber(b.task || b.title);
      
      if (aNum !== bNum) return aNum - bNum;
      
      // If same number, sort by title
      return (a.title || '').localeCompare(b.title || '');
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
    if (selectedType === 'all') {
      setMaxScore(100);
      return;
    }

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
  }, [getFilteredActivities, selectedType]);

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
    
    if (selectedType === 'all') {
      // For "All Activities" view, show category abbreviations
      return activity.category?.substring(0, 3).toUpperCase() || `CAT${index + 1}`;
    }
    
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

  // Calculate chart layout (responsive) for individual activities
  const calculateIndividualChartLayout = () => {
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

  // Calculate chart layout for "All Activities" view
  const calculateCategoryChartLayout = () => {
    const categories = Object.keys(categoryStats).filter(key => categoryStats[key].count > 0);
    const chartHeight = isMobile ? 200 : 250;
    const margin = { 
      top: isMobile ? 20 : 30, 
      right: isMobile ? 10 : 20, 
      bottom: isMobile ? 80 : 100, 
      left: isMobile ? 40 : 60 
    };
    
    const availableWidth = Math.max(containerWidth - 40, 300);
    const chartWidth = availableWidth;
    
    if (categories.length === 0) {
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
      if (categories.length <= 3) {
        baseBarWidth = 50;
        baseSpacing = 40;
      } else if (categories.length <= 6) {
        baseBarWidth = 40;
        baseSpacing = 35;
      } else {
        baseBarWidth = 30;
        baseSpacing = 25;
      }
    } else {
      if (categories.length <= 3) {
        baseBarWidth = 80;
        baseSpacing = 100;
      } else if (categories.length <= 6) {
        baseBarWidth = 70;
        baseSpacing = 80;
      } else {
        baseBarWidth = 60;
        baseSpacing = 70;
      }
    }

    const totalWidthNeeded = categories.length * baseBarWidth + (categories.length - 1) * baseSpacing;
    
    let finalBarWidth = baseBarWidth;
    let finalSpacing = baseSpacing;
    
    if (totalWidthNeeded > graphWidth) {
      const scaleFactor = graphWidth / totalWidthNeeded;
      finalBarWidth = Math.max(20, baseBarWidth * scaleFactor);
      finalSpacing = Math.max(10, baseSpacing * scaleFactor);
    } else if (totalWidthNeeded < graphWidth) {
      const extraSpace = graphWidth - totalWidthNeeded;
      finalSpacing += extraSpace / Math.max(1, categories.length);
    }
    
    const totalActualWidth = categories.length * finalBarWidth + (categories.length - 1) * finalSpacing;
    const startX = margin.left + (graphWidth - totalActualWidth) / 2;

    const xScale = (index) => startX + index * (finalBarWidth + finalSpacing);

    const yScale = (score) => {
      return chartHeight - margin.bottom - (score / 100) * (chartHeight - margin.top - margin.bottom);
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

  // Render improvement indicators
  const renderImprovementIndicators = (activity, index, x, y, barWidth) => {
    if (!improvementData?.has_improvement_data || !improvementData.activities || index === 0) {
      return null;
    }

    const activityData = improvementData.activities[index];
    if (!activityData || activityData.improvement_rate === 0) {
      return null;
    }

    const improvementRate = activityData.improvement_rate || 0;
    const isPositive = improvementRate > 0;
    
    return (
      <g key={`improvement-${activity.id}`}>
        {/* Improvement arrow */}
        <polygon
          points={`
            ${x + barWidth / 2 - (isMobile ? 4 : 5)},${y - (isMobile ? 8 : 10)}
            ${x + barWidth / 2},${y - (isMobile ? 15 : 20)}
            ${x + barWidth / 2 + (isMobile ? 4 : 5)},${y - (isMobile ? 8 : 10)}
          `}
          fill={isPositive ? "#00A15D" : "#FF5555"}
          opacity="0.9"
          transform={isPositive ? "" : "rotate(180)"}
          transform-origin={`${x + barWidth / 2} ${y - (isMobile ? 15 : 20)}`}
        />
        
        {/* Improvement percentage */}
        <text
          x={x + barWidth / 2}
          y={y - (isMobile ? 20 : 25)}
          textAnchor="middle"
          fill={isPositive ? "#00A15D" : "#FF5555"}
          fontSize={isMobile ? "8" : "9"}
          fontWeight="bold"
        >
          {improvementRate >= 0 ? '+' : ''}{improvementRate.toFixed(1)}%
        </text>
      </g>
    );
  };

  // Get trend icon
  const getTrendIcon = () => {
    if (!improvementData) return null;
    
    const trend = improvementData.trend;
    
    switch(trend) {
      case 'improving':
        return (
          <div className="flex items-center gap-1 text-[#00A15D]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M13 20h-2V8l-5.5 5.5-1.42-1.42L12 4.16l7.92 7.92-1.42 1.42L13 8v12z"/>
            </svg>
            <span className="text-xs">Improving</span>
          </div>
        );
      case 'declining':
        return (
          <div className="flex items-center gap-1 text-[#FF5555]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M11 4v12.17l-5.5-5.5-1.42 1.42L12 19.84l7.92-7.92-1.42-1.42L13 16.17V4h-2z"/>
            </svg>
            <span className="text-xs">Declining</span>
          </div>
        );
      case 'stable':
        return (
          <div className="flex items-center gap-1 text-[#FFA600]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M19 13H5v-2h14v2z"/>
            </svg>
            <span className="text-xs">Stable</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Render score labels for y-axis (responsive)
  const renderScoreLabels = (forCategories = false) => {
    const labels = [];
    let step = 20;
    
    const currentMax = forCategories ? 100 : maxScore;
    
    if (currentMax <= 50) step = 10;
    if (currentMax <= 30) step = 5;
    if (isMobile && currentMax > 50) step = 25;
    
    if (isMobile) {
      if (currentMax <= 50) step = 20;
      if (currentMax <= 30) step = 10;
    }
    
    for (let score = 0; score <= currentMax; score += step) {
      if (score === 100 && currentMax >= 100) {
        labels.push({ score: 100, label: "100" });
      } else {
        labels.push({ score, label: score });
      }
    }
    
    return labels;
  };

  // Get the appropriate chart layout
  const chartLayout = selectedType === 'all' 
    ? calculateCategoryChartLayout() 
    : calculateIndividualChartLayout();
  
  const activities = selectedType === 'all' 
    ? Object.keys(categoryStats).filter(key => categoryStats[key].count > 0)
    : getFilteredActivities;

  const {
    chartWidth,
    chartHeight,
    margin,
    barWidth,
    spacing,
    xScale,
    yScale
  } = chartLayout;

  // Calculate summary statistics
  const calculateSummary = () => {
    if (selectedType === 'all') {
      // Calculate overall summary for all categories
      const categories = Object.values(categoryStats);
      const validCategories = categories.filter(cat => cat.count > 0);
      
      if (validCategories.length === 0) {
        return {
          average: 0,
          highest: 0,
          lowest: 0,
          total: 0,
          completed: 0
        };
      }
      
      const totalActivities = validCategories.reduce((sum, cat) => sum + cat.count, 0);
      const completedActivities = validCategories.reduce((sum, cat) => sum + cat.completed, 0);
      const weightedAverage = validCategories.reduce((sum, cat) => sum + cat.average * cat.count, 0) / totalActivities;
      const highest = Math.max(...validCategories.map(cat => cat.highest));
      const lowest = Math.min(...validCategories.map(cat => cat.lowest).filter(l => l > 0));
      
      return {
        average: Math.round(weightedAverage),
        highest,
        lowest,
        total: totalActivities,
        completed: completedActivities
      };
    } else {
      // Calculate summary for specific activity type
      const activities = getFilteredActivities;
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
      const validScores = scores.filter(score => score > 0);
      const average = validScores.length > 0 ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length) : 0;
      const highest = validScores.length > 0 ? Math.max(...validScores) : 0;
      const lowest = validScores.length > 0 ? Math.min(...validScores.filter(s => s > 0)) : 0;
      const completed = activities.filter(a => a.submitted).length;
      
      return {
        average,
        highest,
        lowest,
        total: activities.length,
        completed
      };
    }
  };

  const summary = calculateSummary();

  // Responsive font sizes
  const scoreLabelFontSize = isMobile ? "9" : "10";
  const barLabelFontSize = isMobile ? "10" : "11";
  const barScoreFontSize = isMobile ? "10" : "11";
  const activityLabelFontSize = isMobile ? "9" : "11";

  // Render "All Activities" view
  const renderAllActivitiesView = () => {
    const categories = Object.keys(categoryStats).filter(key => categoryStats[key].count > 0);
    
    if (categories.length === 0) {
      return (
        <div className="h-48 flex flex-col items-center justify-center gap-4">
          <div className="text-center">
            <div className="mb-3">
              <img 
                src={Analytics} 
                alt="Analytics" 
                className="w-10 h-10 sm:w-12 sm:h-12 mx-auto opacity-40"
              />
            </div>
            <p className="text-sm sm:text-base text-[#FFFFFF]/60">No activity data available</p>
            <p className="text-xs text-[#FFFFFF]/40 mt-2">Activities will appear as they are graded</p>
          </div>
        </div>
      );
    }

    return (
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
            {/* Grid lines */}
            {renderScoreLabels(true).map(({ score, label }) => (
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
                  {label}
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

            {/* Category Bars */}
            {categories.map((categoryKey, index) => {
              const category = categoryStats[categoryKey];
              const x = xScale(index);
              const y = yScale(category.average);
              const barHeight = chartHeight - margin.bottom - y;
              const isHovered = hoveredActivity?.key === categoryKey;
              
              return (
                <g key={`category-${categoryKey}`}>
                  {/* Hover area */}
                  <rect
                    x={x - spacing/2}
                    y={margin.top}
                    width={barWidth + spacing}
                    height={chartHeight - margin.top - margin.bottom}
                    fill="transparent"
                    onMouseEnter={(e) => handleMouseEnter({ key: categoryKey, ...category }, e.clientX, e.clientY)}
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
                    rx={isMobile ? "3" : "4"}
                  />
                  
                  {/* Main bar */}
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    fill={category.color}
                    opacity={isHovered ? 0.9 : 0.8}
                    rx={isMobile ? "3" : "4"}
                    onMouseEnter={(e) => handleMouseEnter({ key: categoryKey, ...category }, e.clientX, e.clientY)}
                    onMouseLeave={() => setHoveredActivity(null)}
                    className="cursor-pointer transition-all duration-200 hover:opacity-100"
                  />
                  
                  {/* Average score label on bar */}
                  {barHeight > (isMobile ? 20 : 25) && (
                    <text
                      x={x + barWidth / 2}
                      y={y - (isMobile ? 5 : 10)}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize={barScoreFontSize}
                      fontWeight="bold"
                    >
                      {category.average}%
                    </text>
                  )}
                  
                  {/* Category label at bottom */}
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight - margin.bottom + (isMobile ? 20 : 30)}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={activityLabelFontSize}
                    opacity={0.9}
                    className="select-none"
                  >
                    {category.label}
                  </text>
                  
                  {/* Activity count below category label */}
                  <text
                    x={x + barWidth / 2}
                    y={chartHeight - margin.bottom + (isMobile ? 35 : 45)}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={isMobile ? "8" : "9"}
                    opacity={0.7}
                  >
                    {category.completed}/{category.count}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  // Render individual activities view
  const renderIndividualActivitiesView = () => {
    const activities = getFilteredActivities;
    
    if (activities.length === 0) {
      const selectedTypeLabel = activityTypes.find(t => t.value === selectedType)?.label || selectedType;
      
      return (
        <div className="h-48 flex flex-col items-center justify-center gap-4">
          <div className="text-center">
            <div className="mb-3">
              <img 
                src={Analytics} 
                alt="Analytics" 
                className="w-10 h-10 sm:w-12 sm:h-12 mx-auto opacity-40"
              />
            </div>
            <p className="text-sm sm:text-base text-[#FFFFFF]/60">No {selectedTypeLabel} data available</p>
            <p className="text-xs text-[#FFFFFF]/40 mt-2">Try selecting a different activity type</p>
          </div>
        </div>
      );
    }

    return (
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
                  {label}
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
                  
                  {/* Improvement indicators */}
                  {renderImprovementIndicators(activity, index, x, y, barWidth)}
                  
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
                      {score}
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
    );
  };

  return (
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
              <h3 className="font-bold text-lg text-[#FFFFFF]">Activity Scores</h3>
              <p className="text-sm text-[#FFFFFF]/60">View your scores for different activities</p>
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
            
            {/* Collapse/Expand button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg bg-[#2A2A35] hover:bg-[#3A3A45] transition-all duration-200 cursor-pointer"
              aria-label={isExpanded ? "Collapse chart" : "Expand chart"}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {isExpanded ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF" className="w-4 h-4">
                    <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFFFFF" className="w-4 h-4">
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
        isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-5 pt-0">
          {/* Improvement Summary Section (only for individual activity types) */}
          {selectedType !== 'all' && improvementData?.has_improvement_data && (
            <div className="mb-4 p-3 bg-[#23232C]/50 rounded-lg border border-[#FFFFFF]/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-left">
                    <div className="text-xs text-[#FFFFFF]/60">Trend</div>
                    <div className="flex items-center gap-2">
                      {getTrendIcon()}
                      <span className="text-sm text-[#FFFFFF]/80">
                        Avg: {improvementData.average_improvement >= 0 ? '+' : ''}
                        {improvementData.average_improvement?.toFixed(1) || '0.0'}%
                      </span>
                    </div>
                  </div>
                  
                  {improvementData.overall_improvement !== undefined && (
                    <div className="text-left">
                      <div className="text-xs text-[#FFFFFF]/60">Overall Change</div>
                      <div className={`text-sm font-medium ${
                        improvementData.overall_improvement >= 0 ? 'text-[#00A15D]' : 'text-[#FF5555]'
                      }`}>
                        {improvementData.overall_improvement >= 0 ? '+' : ''}
                        {improvementData.overall_improvement?.toFixed(1) || '0.0'}%
                      </div>
                    </div>
                  )}
                  
                  {improvementData.first_score !== undefined && improvementData.last_score !== undefined && (
                    <div className="text-left">
                      <div className="text-xs text-[#FFFFFF]/60">Progress</div>
                      <div className="text-sm text-[#FFFFFF]">
                        {improvementData.first_score?.toFixed(1) || '0.0'}% → {improvementData.last_score?.toFixed(1) || '0.0'}%
                      </div>
                    </div>
                  )}
                </div>
                
                {improvementData.improvement_rates && improvementData.improvement_rates.length > 0 && (
                  <div className="text-left md:text-right">
                    <div className="text-xs text-[#FFFFFF]/60">Improvement Rate</div>
                    <div className="text-sm text-[#FFFFFF]">
                      {improvementData.improvement_rates.filter(rate => rate > 0).length}/
                      {improvementData.improvement_rates.length} activities improved
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chart container */}
          {selectedType === 'all' ? renderAllActivitiesView() : renderIndividualActivitiesView()}

          {/* Tooltip */}
          {hoveredActivity && (
            <div 
              className="absolute bg-[#23232C] border border-[#FFFFFF]/20 rounded-lg p-3 shadow-2xl z-10 pointer-events-none transition-all duration-150"
              style={{
                left: `clamp(20px, ${tooltipPosition.x + 20}px, calc(100% - 250px))`,
                top: `${tooltipPosition.y - 100}px`,
                transform: 'translateX(-50%)',
                minWidth: isMobile ? '160px' : '220px',
                maxWidth: isMobile ? '180px' : '250px'
              }}
            >
              <div className="flex flex-col gap-1">
                {selectedType === 'all' ? (
                  // Category tooltip
                  <>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hoveredActivity.color }} />
                      <span className="text-xs text-[#FFFFFF]/60">Category</span>
                    </div>
                    
                    <div className="text-[#FFFFFF] font-semibold text-sm mb-2 truncate">
                      {hoveredActivity.label}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div className="text-left">
                        <div className="text-xs text-[#FFFFFF]/60">Average Score</div>
                        <div 
                          className="text-base font-bold"
                          style={{ color: hoveredActivity.color }}
                        >
                          {hoveredActivity.average}%
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xs text-[#FFFFFF]/60">Activities</div>
                        <div className="text-base font-bold text-[#FFFFFF]">
                          {hoveredActivity.completed}/{hoveredActivity.count}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-left">
                        <div className="text-xs text-[#FFFFFF]/60">Highest</div>
                        <div className="text-sm text-[#00A15D] font-medium">
                          {hoveredActivity.highest}%
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xs text-[#FFFFFF]/60">Lowest</div>
                        <div className="text-sm text-[#FF5555] font-medium">
                          {hoveredActivity.lowest || 0}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-[#FFFFFF]/10">
                      <div className="text-xs text-[#FFFFFF]/60 mb-1">Performance</div>
                      <div className="text-xs text-[#FFFFFF]">
                        {hoveredActivity.average >= 80 ? 'Excellent' : 
                         hoveredActivity.average >= 71 ? 'Good' : 
                         'Needs Improvement'}
                      </div>
                    </div>
                  </>
                ) : (
                  // Individual activity tooltip
                  <>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: getScoreColor(hoveredActivity.score) }} />
                      <span className="text-xs text-[#FFFFFF]/60 capitalize">{selectedType}</span>
                    </div>
                    
                    <div className="text-[#FFFFFF] font-semibold text-sm mb-1 truncate">
                      {getActivityDisplayName(hoveredActivity)}
                    </div>
                    
                    {hoveredActivity.title && hoveredActivity.title !== hoveredActivity.task && (
                      <div className="text-xs text-[#FFFFFF]/80 mb-2 truncate">
                        {hoveredActivity.title}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between gap-3 sm:gap-4">
                      <div className="text-left">
                        <div className="text-xs text-[#FFFFFF]/60">Your Score</div>
                        <div 
                          className="text-base sm:text-lg font-bold"
                          style={{ color: getScoreColor(hoveredActivity.score) }}
                        >
                          {hoveredActivity.score || 0}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-xs text-[#FFFFFF]/60">Max Score</div>
                        <div className="text-base sm:text-lg font-bold text-[#FFFFFF]">
                          100
                        </div>
                      </div>
                    </div>
                    
                    {/* Improvement info in tooltip */}
                    {improvementData?.has_improvement_data && hoveredActivity && 
                     improvementData.activities && improvementData.activities[getFilteredActivities.indexOf(hoveredActivity)] && (
                      <div className="mt-2 pt-2 border-t border-[#FFFFFF]/10">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#FFFFFF]/60">Improvement</span>
                          <span className={`text-xs font-medium ${
                            improvementData.activities[getFilteredActivities.indexOf(hoveredActivity)].improvement_rate > 0 
                              ? 'text-[#00A15D]' 
                              : improvementData.activities[getFilteredActivities.indexOf(hoveredActivity)].improvement_rate < 0
                                ? 'text-[#FF5555]'
                                : 'text-[#FFA600]'
                          }`}>
                            {improvementData.activities[getFilteredActivities.indexOf(hoveredActivity)].improvement_rate > 0 ? '+' : ''}
                            {improvementData.activities[getFilteredActivities.indexOf(hoveredActivity)].improvement_rate.toFixed(1)}%
                            {improvementData.activities[getFilteredActivities.indexOf(hoveredActivity)].improvement_rate > 0 ? ' ↑' : 
                             improvementData.activities[getFilteredActivities.indexOf(hoveredActivity)].improvement_rate < 0 ? ' ↓' : ' →'}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-2 pt-2 border-t border-[#FFFFFF]/10">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#FFFFFF]/60">Status</span>
                        <span className={`text-xs font-medium ${
                          hoveredActivity.submitted 
                            ? hoveredActivity.late 
                              ? 'text-[#FFA600]' 
                              : 'text-[#00A15D]'
                            : 'text-[#FF5555]'
                        }`}>
                          {hoveredActivity.submitted 
                            ? hoveredActivity.late 
                              ? 'Late' 
                              : 'Submitted'
                            : 'Not Submitted'
                          }
                        </span>
                      </div>
                      
                      {hoveredActivity.deadline && hoveredActivity.deadline !== 'No deadline' && (
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-[#FFFFFF]/60">Deadline</span>
                          <span className="text-xs text-[#FFFFFF] truncate">{hoveredActivity.deadline}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              <div className="absolute w-2 h-2 bg-[#23232C] border-r border-b border-[#FFFFFF]/20 
                transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2" />
            </div>
          )}

          {/* Info section */}
          <div className="mt-4 sm:mt-6">
            <div className="text-xs text-[#FFFFFF]/60">
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                {selectedType === 'all' ? (
                  <>
                    <span>Showing {Object.keys(categoryStats).filter(key => categoryStats[key].count > 0).length} categories</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Total: {summary.total} activities</span>
                  </>
                ) : (
                  <>
                    <span>Showing {getFilteredActivities.length} {activityTypes.find(t => t.value === selectedType)?.label?.toLowerCase() || selectedType}</span>
                    {getFilteredActivities.length > 0 && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span>Completed: {summary.completed}/{summary.total}</span>
                      </>
                    )}
                  </>
                )}
              </div>
              
              {/* Color legend */}
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-[#00A15D]"></div>
                  <span className="text-xs text-[#FFFFFF]/80">80%+ (Good)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-[#FFA600]"></div>
                  <span className="text-xs text-[#FFFFFF]/80">71-79% (Average)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm bg-[#FF5555]"></div>
                  <span className="text-xs text-[#FFFFFF]/80">70%↓ (Needs Improvement)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsed State Summary - Simplified */}
      {!isExpanded && (
        <div className="p-4 border-t border-[#FFFFFF]/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left side - Stats summary */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-left">
                <div className="text-xs text-[#FFFFFF]/60">Average Score</div>
                <div className="font-bold text-base text-[#FFFFFF]">{summary.average}%</div>
              </div>
              
              <div className="text-left">
                <div className="text-xs text-[#FFFFFF]/60">Highest Score</div>
                <div className="font-bold text-base text-[#00A15D]">{summary.highest}%</div>
              </div>
              
              <div className="text-left">
                <div className="text-xs text-[#FFFFFF]/60">Completion</div>
                <div className="font-bold text-base text-[#FFFFFF]">
                  {summary.completed}/{summary.total}
                </div>
              </div>
              
              {/* Improvement summary in collapsed state (only for individual activities) */}
              {selectedType !== 'all' && improvementData?.has_improvement_data && (
                <div className="text-left">
                  <div className="text-xs text-[#FFFFFF]/60">Trend</div>
                  <div className="flex items-center gap-1">
                    {improvementData.trend === 'improving' ? (
                      <span className="font-bold text-base text-[#00A15D]">↑</span>
                    ) : improvementData.trend === 'declining' ? (
                      <span className="font-bold text-base text-[#FF5555]">↓</span>
                    ) : (
                      <span className="font-bold text-base text-[#FFA600]">→</span>
                    )}
                    <span className="text-xs text-[#FFFFFF]/80">
                      {improvementData.average_improvement >= 0 ? '+' : ''}
                      {improvementData.average_improvement?.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                </div>
              )}
              
              {/* Category count for "All Activities" view */}
              {selectedType === 'all' && (
                <div className="text-left">
                  <div className="text-xs text-[#FFFFFF]/60">Categories</div>
                  <div className="font-bold text-base text-[#FFFFFF]">
                    {Object.keys(categoryStats).filter(key => categoryStats[key].count > 0).length}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityScoresBarChart;