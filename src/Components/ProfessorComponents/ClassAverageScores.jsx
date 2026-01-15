import React, { useState, useRef, useEffect } from 'react';
import AnalyticsIcon from '../../assets/Analytics.svg';
import ArrowUp from '../../assets/ArrowUp.svg';
import ArrowDown from '../../assets/ArrowDown.svg';

const ClassAverageScores = ({ 
  selectedType = 'assignment',
  onTypeChange,
  subjectCode,
  isDarkMode = false // Added theme prop
}) => {
  const [hoveredActivity, setHoveredActivity] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [maxScore, setMaxScore] = useState(100);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(false);
  const [currentActivities, setCurrentActivities] = useState([]);
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const typeDropdownRef = useRef(null);
  const statusDropdownRef = useRef(null);

  // Activity type options
  const activityTypes = [
    { value: 'assignment', label: 'Assignments' },
    { value: 'quiz', label: 'Quizzes' },
    { value: 'activity', label: 'Activities'},
    { value: 'project', label: 'Projects' },
    { value: 'laboratory', label: 'Laboratory' }
  ];

  // Status filter options
  const statusOptions = [
    { value: 'All', label: 'Status' },
    { value: 'Submitted', label: 'Submitted' },
    { value: 'Missed', label: 'Missed' }
  ];

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
    return isDarkMode ? "border-[#3A3A45]" : "border-gray-300";
  };

  const getInputHover = () => {
    return isDarkMode ? "hover:bg-[#3A3A45]" : "hover:bg-gray-200";
  };

  const getDropdownBackground = () => {
    return isDarkMode ? "bg-[#2A2A35]" : "bg-white";
  };

  const getDropdownBorder = () => {
    return isDarkMode ? "border-[#3A3A45]" : "border-gray-200";
  };

  const getDropdownHover = () => {
    return isDarkMode ? "hover:bg-[#3A3A45]" : "hover:bg-gray-100";
  };

  const getTooltipBackground = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-white";
  };

  const getTooltipBorder = () => {
    return isDarkMode ? "border-[#FFFFFF]/20" : "border-gray-200";
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target)) {
        setIsTypeDropdownOpen(false);
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch activities data from server
  useEffect(() => {
    const fetchActivities = async () => {
      if (!subjectCode) return;

      setLoading(true);
      try {
        const statusParam = selectedStatus !== 'All' ? `&status=${selectedStatus}` : '';
        const response = await fetch(
          `https://tracked.6minds.site/Professor/SubjectAnalyticsProfDB/fetch_class_averages.php?code=${subjectCode}&type=${selectedType}${statusParam}`
        );
        const data = await response.json();
        
        if (data.success) {
          setCurrentActivities(data.activities);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isExpanded) {
      fetchActivities();
    }
  }, [subjectCode, selectedType, selectedStatus, isExpanded]);

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
    if (currentActivities.length === 0) {
      setMaxScore(100);
      return;
    }

    let max = 100;
    currentActivities.forEach(activity => {
      if (activity.score > max) max = activity.score;
    });

    if (max <= 100) {
      setMaxScore(Math.ceil(max / 10) * 10);
    } else {
      setMaxScore(100);
    }
  }, [currentActivities]);

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
  const getSelectedTypeLabel = () => {
    const selected = activityTypes.find(type => type.value === selectedType);
    return selected ? selected.label : 'Select Type';
  };

  // Get selected status label
  const getSelectedStatusLabel = () => {
    const selected = statusOptions.find(status => status.value === selectedStatus);
    return selected ? selected.label : 'All Status';
  };

  // Handle activity type change
  const handleTypeChange = (type) => {
    onTypeChange && onTypeChange(type);
    setIsTypeDropdownOpen(false);
  };

  // Handle status change
  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setIsStatusDropdownOpen(false);
  };

  // Get activity display name
  const getActivityDisplayName = (activity) => {
    if (activity.task) return activity.task;
    if (activity.title) return activity.title;
    return `Activity ${currentActivities.indexOf(activity) + 1}`;
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
    const activities = currentActivities;
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

  // Get color based on score
  const getScoreColor = (score) => {
    if (score >= 76) return "#00A15D";  // Passing (76%+)
    if (score >= 71) return "#FFA600";  // Close to failing (71-75%)
    return "#FF5555";  // Failing (70% and below)
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return isDarkMode ? 'bg-[#00A15D]/20 text-[#00A15D] border border-[#00A15D]/30' : 'bg-[#00A15D]/10 text-[#00A15D] border border-[#00A15D]/20';
      case 'Missed': return isDarkMode ? 'bg-[#A15353]/20 text-[#A15353] border border-[#A15353]/30' : 'bg-[#A15353]/10 text-[#A15353] border border-[#A15353]/20';
      case 'Partially Submitted': return isDarkMode ? 'bg-[#FFA600]/20 text-[#FFA600] border border-[#FFA600]/30' : 'bg-[#FFA600]/10 text-[#FFA600] border border-[#FFA600]/20';
      default: return isDarkMode ? 'bg-gray-700 text-gray-300 border border-gray-600' : 'bg-gray-200 text-gray-600 border border-gray-300';
    }
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
  const activities = currentActivities;
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
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    
    return {
      average,
      highest,
      lowest,
      total: activities.length,
      completed: activities.filter(a => a.status === 'Submitted').length
    };
  };

  const summary = calculateSummary();

  // Responsive font sizes
  const scoreLabelFontSize = isMobile ? "9" : "10";
  const barScoreFontSize = isMobile ? "10" : "11";
  const activityLabelFontSize = isMobile ? "9" : "11";

  if (loading) {
    return (
      <div className={`${getCardBackground()} rounded-xl border ${getCardBorder()}`}>
        <div className={`p-5 border-b ${getCardBorder()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <img 
                  src={AnalyticsIcon} 
                  alt="Analytics" 
                  className="w-5 h-5"
                  style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
                />
              </div>
              <div>
                <h3 className={`font-bold text-lg ${getTextColor()}`}>Class Average Scores</h3>
                <p className={`text-sm ${getSecondaryTextColor()}`}>View class average scores for different activities</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Loading indicator */}
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#767EE0]"></div>
            </div>
          </div>
        </div>
        
        <div className="h-48 flex flex-col items-center justify-center gap-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#767EE0] mx-auto mb-3"></div>
            <p className={`text-sm sm:text-base ${getSecondaryTextColor()}`}>Loading {getSelectedTypeLabel()} data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (activities.length === 0 && isExpanded) {
    const selectedTypeLabel = activityTypes.find(t => t.value === selectedType)?.label || selectedType;
    
    return (
      <div className={`${getCardBackground()} rounded-xl border ${getCardBorder()}`}>
        <div className={`p-5 border-b ${getCardBorder()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center">
                <img 
                  src={AnalyticsIcon} 
                  alt="Analytics" 
                  className="w-5 h-5"
                  style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
                />
              </div>
              <div>
                <h3 className={`font-bold text-lg ${getTextColor()}`}>Class Average Scores</h3>
                <p className={`text-sm ${getSecondaryTextColor()}`}>View class average scores for different activities</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Activity Type Dropdown */}
              <div className="relative" ref={typeDropdownRef}>
                <button
                  onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                  className={`flex items-center justify-between gap-2 px-3 py-2 ${getInputBackground()} border ${getInputBorder()} rounded-lg text-sm ${getTextColor()} ${getInputHover()} transition-all duration-200`}
                >
                  <span>{getSelectedTypeLabel()}</span>
                  <svg 
                    className={`w-4 h-4 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`}
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {isTypeDropdownOpen && (
                  <div className={`absolute z-10 mt-1 w-48 ${getDropdownBackground()} border ${getDropdownBorder()} rounded-lg shadow-lg max-h-60 overflow-y-auto`}>
                    {activityTypes.map(type => (
                      <button
                        key={type.value}
                        onClick={() => handleTypeChange(type.value)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left ${getDropdownHover()} transition-colors ${
                          selectedType === type.value 
                            ? 'text-[#767EE0] bg-gray-100 dark:bg-[#3A3A45]' 
                            : `${getTextColor()}/80`
                        }`}
                      >
                        <span>{type.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Filter Dropdown */}
              <div className="relative" ref={statusDropdownRef}>
                <button
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className={`flex items-center justify-between gap-2 px-3 py-2 ${getInputBackground()} border ${getInputBorder()} rounded-lg text-sm ${getTextColor()} ${getInputHover()} transition-all duration-200`}
                >
                  <span>{getSelectedStatusLabel()}</span>
                  <svg 
                    className={`w-4 h-4 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`}
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {isStatusDropdownOpen && (
                  <div className={`absolute z-10 mt-1 w-40 ${getDropdownBackground()} border ${getDropdownBorder()} rounded-lg shadow-lg`}>
                    {statusOptions.map(status => (
                      <button
                        key={status.value}
                        onClick={() => handleStatusChange(status.value)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left ${getDropdownHover()} transition-colors ${
                          selectedStatus === status.value 
                            ? 'text-[#767EE0] bg-gray-100 dark:bg-[#3A3A45]' 
                            : `${getTextColor()}/80`
                        }`}
                      >
                        <span>{status.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Collapse/Expand button */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-2 rounded-lg ${getInputBackground()} ${getInputHover()} transition-all duration-200 cursor-pointer`}
                aria-label={isExpanded ? "Collapse chart" : "Expand chart"}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  {isExpanded ? (
                    <img 
                      src={ArrowUp} 
                      alt="Collapse" 
                      className="w-4 h-4"
                      style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
                    />
                  ) : (
                    <img 
                      src={ArrowDown} 
                      alt="Expand" 
                      className="w-4 h-4"
                      style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
                    />
                  )}
                </div>
              </button>
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
                style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
              />
            </div>
            <p className={`text-sm sm:text-base ${getSecondaryTextColor()}`}>No {selectedTypeLabel} data available</p>
            <p className={`text-xs ${getSecondaryTextColor()} mt-2`}>
              {selectedStatus !== 'All' ? `No ${selectedStatus.toLowerCase()} ${selectedTypeLabel.toLowerCase()}` : `No ${selectedTypeLabel.toLowerCase()} recorded yet`}
            </p>
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
                src={AnalyticsIcon} 
                alt="Analytics" 
                className="w-5 h-5"
                style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
              />
            </div>
            <div>
              <h3 className={`font-bold text-lg ${getTextColor()}`}>Class Average Scores</h3>
              <p className={`text-sm ${getSecondaryTextColor()}`}>View class average scores for different activities</p>
            </div>
          </div>
          
          {/* Right side with dropdowns and collapse button */}
          <div className="flex items-center gap-2">
            {/* Activity type dropdown */}
            <div className="relative" ref={typeDropdownRef}>
              <button
                onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                className={`flex items-center justify-between gap-2 px-3 py-2 ${getInputBackground()} border ${getInputBorder()} rounded-lg text-sm ${getTextColor()} ${getInputHover()} transition-all duration-200`}
              >
                <span>{getSelectedTypeLabel()}</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isTypeDropdownOpen && (
                <div className={`absolute z-10 mt-1 w-48 ${getDropdownBackground()} border ${getDropdownBorder()} rounded-lg shadow-lg max-h-60 overflow-y-auto`}>
                  {activityTypes.map(type => (
                    <button
                      key={type.value}
                      onClick={() => handleTypeChange(type.value)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left ${getDropdownHover()} transition-colors ${
                        selectedType === type.value 
                          ? 'text-[#767EE0] bg-gray-100 dark:bg-[#3A3A45]' 
                          : `${getTextColor()}/80`
                      }`}
                    >
                      <span>{type.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className={`flex items-center justify-between gap-2 px-3 py-2 ${getInputBackground()} border ${getInputBorder()} rounded-lg text-sm ${getTextColor()} ${getInputHover()} transition-all duration-200`}
              >
                <span>{getSelectedStatusLabel()}</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {isStatusDropdownOpen && (
                <div className={`absolute z-10 mt-1 w-40 ${getDropdownBackground()} border ${getDropdownBorder()} rounded-lg shadow-lg`}>
                  {statusOptions.map(status => (
                    <button
                      key={status.value}
                      onClick={() => handleStatusChange(status.value)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left ${getDropdownHover()} transition-colors ${
                        selectedStatus === status.value 
                          ? 'text-[#767EE0] bg-gray-100 dark:bg-[#3A3A45]' 
                          : `${getTextColor()}/80`
                      }`}
                    >
                      <span>{status.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Collapse/Expand button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 rounded-lg ${getInputBackground()} ${getInputHover()} transition-all duration-200 cursor-pointer`}
              aria-label={isExpanded ? "Collapse chart" : "Expand chart"}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                {isExpanded ? (
                  <img 
                    src={ArrowUp} 
                    alt="Collapse" 
                    className="w-4 h-4"
                    style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
                  />
                ) : (
                  <img 
                    src={ArrowDown} 
                    alt="Expand" 
                    className="w-4 h-4"
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
                {/* Grid lines */}
                {renderScoreLabels().map(({ score, label }) => (
                  <g key={`grid-${score}`}>
                    <line
                      x1={margin.left}
                      y1={yScale(score)}
                      x2={chartWidth - margin.right}
                      y2={yScale(score)}
                      stroke={isDarkMode ? "#2A2A35" : "#e5e7eb"}
                      strokeWidth={1}
                      strokeDasharray={isMobile ? "1,1" : "2,2"}
                      opacity={0.5}
                    />
                    <text
                      x={margin.left - (isMobile ? 5 : 10)}
                      y={yScale(score)}
                      textAnchor="end"
                      dominantBaseline="middle"
                      fill={isDarkMode ? "#FFFFFF" : "#374151"}
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
                  stroke={isDarkMode ? "#2A2A35" : "#e5e7eb"}
                  strokeWidth={2}
                />

                {/* Y-axis line */}
                <line
                  x1={margin.left}
                  y1={margin.top}
                  x2={margin.left}
                  y2={chartHeight - margin.bottom}
                  stroke={isDarkMode ? "#2A2A35" : "#e5e7eb"}
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
                        fill={isDarkMode ? "#000000" : "#6b7280"}
                        opacity={isDarkMode ? "0.2" : "0.1"}
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
                          fill={isDarkMode ? "#FFFFFF" : "#374151"}
                          fontSize={barScoreFontSize}
                          fontWeight="bold"
                        >
                          {score.toFixed(2)}%
                        </text>
                      )}
                      
                      {/* Activity label at bottom */}
                      <text
                        x={x + barWidth / 2}
                        y={chartHeight - margin.bottom + (isMobile ? 15 : 20)}
                        textAnchor="middle"
                        fill={isDarkMode ? "#FFFFFF" : "#374151"}
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
              className={`absolute ${getTooltipBackground()} border ${getTooltipBorder()} rounded-lg p-3 shadow-2xl z-10 pointer-events-none transition-all duration-150`}
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
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: getScoreColor(hoveredActivity.score) }} />
                    <span className={`text-xs ${getSecondaryTextColor()} capitalize`}>{selectedType}</span>
                  </div>
                  {/* Status badge in tooltip */}
                  <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(hoveredActivity.status)}`}>
                    {hoveredActivity.status}
                  </span>
                </div>
                
                <div className={`${getTextColor()} font-semibold text-sm mb-1 truncate`}>
                  {getActivityDisplayName(hoveredActivity)}
                </div>
                
                {/* Performance zone */}
                <div className="mb-2">
                  <div className={`text-xs ${getSecondaryTextColor()}`}>Performance</div>
                  <div className="text-sm font-medium" style={{ color: getScoreColor(hoveredActivity.score) }}>
                    {getPerformanceZone(hoveredActivity.score)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between gap-3 sm:gap-4">
                  <div className="text-left">
                    <div className={`text-xs ${getSecondaryTextColor()}`}>Class Average</div>
                    <div 
                      className="text-base sm:text-lg font-bold"
                      style={{ color: getScoreColor(hoveredActivity.score) }}
                    >
                      {hoveredActivity.score.toFixed(2)}%
                    </div>
                    <div className={`text-xs ${getSecondaryTextColor()} mt-1`}>
                      {hoveredActivity.submissions || 0}/{hoveredActivity.total_students || 0} students
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-xs ${getSecondaryTextColor()}`}>Max Score</div>
                    <div className={`text-base sm:text-lg font-bold ${getTextColor()}`}>
                      {hoveredActivity.points || 100}%
                    </div>
                    <div className={`text-xs ${getSecondaryTextColor()} mt-1`}>
                      Points: {hoveredActivity.points || 100}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`absolute w-2 h-2 ${getTooltipBackground()} border-r border-b ${getTooltipBorder()} 
                transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2`} />
            </div>
          )}

          {/* Performance zone legend */}
          <div className="mt-6 flex flex-wrap gap-2 text-xs justify-center">
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

      {/* Collapsed State Summary - Simplified */}
      {!isExpanded && (
        <div className={`p-4 border-t ${getCardBorder()}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left side - Stats summary only */}
            <div className="flex items-center gap-4">
              <div className="text-left">
                <div className={`text-xs ${getSecondaryTextColor()}`}>Class Average</div>
                <div className={`font-bold text-base ${getTextColor()}`}>{summary.average.toFixed(2)}%</div>
              </div>
              
              <div className="text-left">
                <div className={`text-xs ${getSecondaryTextColor()}`}>Highest Average</div>
                <div className={`font-bold text-base ${getTextColor()}`}>{summary.highest.toFixed(2)}%</div>
              </div>
              
              <div className="text-left">
                <div className={`text-xs ${getSecondaryTextColor()}`}>Lowest Average</div>
                <div className={`font-bold text-base ${getTextColor()}`}>{summary.lowest.toFixed(2)}%</div>
              </div>

              <div className="text-left">
                <div className={`text-xs ${getSecondaryTextColor()}`}>Total {getSelectedTypeLabel()}</div>
                <div className={`font-bold text-base ${getTextColor()}`}>{summary.total}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassAverageScores;