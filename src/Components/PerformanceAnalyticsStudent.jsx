// Components/PerformanceAnalyticsStudent.jsx
import React, { useMemo, useState, useEffect } from "react";
import ArrowDown from "../assets/ArrowDown(Light).svg";
import PieIcon from "../assets/Pie(Light).svg";
import Search from "../assets/Search.svg";
import CheckSubmitted from "../assets/CheckTable(Green).svg";
import CheckPending from "../assets/LateTable(Blue).svg";
import Cross from "../assets/CrossTable(Red).svg";
import ArrowLeft from '../assets/ArrowLeft.svg';
import ArrowRight from '../assets/ArrowRight.svg';
import TrendingUp from "../assets/TrendingUp.svg";
import TrendingDown from "../assets/TrendingDown.svg";
import AlertTriangleGreen from "../assets/Warning(Green).svg";
import AlertTriangleYellow from "../assets/Warning(Yellow).svg";
import AlertTriangleRed from "../assets/Warning(Red).svg";

export default function PerformanceAnalyticsStudent({
  quizzesList = [],
  assignmentsList = [],
  activitiesList = [],
  projectsList = [],
  laboratoriesList = [], // Added laboratoriesList prop
  selectedFilter,
  setSelectedFilter,
  currentSubject,
  subjectCode
}) {
  // counts used for the left "Created Task" panel (number of tasks)
  const quizzesCount = quizzesList.length;
  const assignmentsCount = assignmentsList.length;
  const activitiesCount = activitiesList.length;
  const projectsCount = projectsList.length;
  const laboratoriesCount = laboratoriesList.length; // Added laboratories count
  const totalTasksCount = quizzesCount + assignmentsCount + activitiesCount + projectsCount + laboratoriesCount;

  const [animationProgress, setAnimationProgress] = useState(0);

  // Activity List States
  const [activityCurrentPage, setActivityCurrentPage] = useState(1);
  const [activitySearchTerm, setActivitySearchTerm] = useState("");
  const itemsPerPage = 10;

  // Gradient color palette for activity types
  const activityTypeColors = {
    Overall: { 
      text: "text-[#2c5530]", 
      border: "border-l-[#2c5530]",
      hover: "hover:bg-[#2c5530]/10 hover:border-l-[#2c5530]"
    },
    Activities: { 
      text: "text-[#B8860B]", 
      border: "border-l-[#B8860B]",
      hover: "hover:bg-[#B8860B]/10 hover:border-l-[#B8860B]"
    },
    Assignment: { 
      text: "text-[#D2691E]", 
      border: "border-l-[#D2691E]",
      hover: "hover:bg-[#D2691E]/10 hover:border-l-[#D2691E]"
    },
    Quizzes: { 
      text: "text-[#A0522D]", 
      border: "border-l-[#A0522D]",
      hover: "hover:bg-[#A0522D]/10 hover:border-l-[#A0522D]"
    },
    Laboratory: {
      text: "text-[#8B4513]", 
      border: "border-l-[#8B4513]",
      hover: "hover:bg-[#8B4513]/10 hover:border-l-[#8B4513]"
    },
    Projects: { 
      text: "text-[#5D4037]", 
      border: "border-l-[#5D4037]",
      hover: "hover:bg-[#5D4037]/10 hover:border-l-[#5D4037]"
    }
  };

  // FIXED: Updated utility function to count Submitted, Assigned, Missed (removed late)
  const sumStatusCounts = (list) => {
    let submitted = 0, assigned = 0, missed = 0;
    
    list.forEach(it => {
      const isSubmitted = it.submitted === 1 || it.submitted === true;
      const isMissing = it.missing === 1 || it.missing === true;
      
      if (isSubmitted) {
        submitted++;
      } else if (isMissing) {
        missed++;
      } else {
        assigned++;
      }
    });
    
    return { submitted, assigned, missed };
  };

  // ADVANCED ANALYTICS CALCULATIONS (removed late references)
  const calculateAdvancedAnalytics = useMemo(() => {
    const allActivities = [
      ...quizzesList,
      ...assignmentsList,
      ...activitiesList,
      ...projectsList,
      ...laboratoriesList
    ];

    // Basic metrics (removed lateActivities)
    const totalActivities = allActivities.length;
    const submittedActivities = allActivities.filter(a => a.submitted).length;
    const missedActivities = allActivities.filter(a => a.missing).length;
    const assignedActivities = allActivities.filter(a => !a.submitted && !a.missing).length;

    // Performance score (0-100) - simplified without late factor
    const completionRate = totalActivities > 0 ? (submittedActivities / totalActivities) * 100 : 0;
    
    // Performance score based only on completion rate
    const performanceScore = Math.round(completionRate);

    // Risk assessment (removed late factor)
    let riskLevel = "LOW";
    let riskScore = 0;
    
    if (missedActivities > totalActivities * 0.3) {
      riskLevel = "HIGH";
      riskScore = 80;
    } else if (missedActivities > totalActivities * 0.15) {
      riskLevel = "MEDIUM";
      riskScore = 50;
    } else {
      riskLevel = "LOW";
      riskScore = 20;
    }

    // Trend analysis
    const activitiesWithDates = allActivities
      .filter(a => a.deadline && a.deadline !== 'No deadline')
      .map(a => ({
        ...a,
        deadlineDate: new Date(a.deadline)
      }))
      .sort((a, b) => a.deadlineDate - b.deadlineDate);

    const recentActivities = activitiesWithDates.slice(-5);
    const recentCompletionRate = recentActivities.length > 0 ? 
      (recentActivities.filter(a => a.submitted).length / recentActivities.length) * 100 : 0;

    const trend = recentCompletionRate > completionRate ? "improving" : 
                 recentCompletionRate < completionRate ? "declining" : "stable";

    // Activity type performance
    const typePerformance = {
      activities: calculateTypePerformance(activitiesList),
      assignments: calculateTypePerformance(assignmentsList),
      quizzes: calculateTypePerformance(quizzesList),
      laboratories: calculateTypePerformance(laboratoriesList),
      projects: calculateTypePerformance(projectsList)
    };

    // Submission patterns (removed late analysis)
    const submissionPatterns = analyzeSubmissionPatterns(allActivities);

    return {
      // Basic metrics
      totalActivities,
      submittedActivities,
      missedActivities,
      assignedActivities,
      
      // Performance metrics
      performanceScore,
      completionRate: Math.round(completionRate),
      
      // Risk assessment
      riskLevel,
      riskScore,
      
      // Trend analysis
      trend,
      recentCompletionRate: Math.round(recentCompletionRate),
      
      // Activity progress
      activityProgress: `${submittedActivities}/${totalActivities}`,
      activityProgressPercentage: totalActivities > 0 ? Math.round((submittedActivities / totalActivities) * 100) : 0,
      
      // Comparative analytics
      typePerformance,
      
      // Behavioral analytics
      submissionPatterns,
      
      // Insights (updated to remove late references)
      insights: generateInsights({
        performanceScore,
        riskLevel,
        trend,
        missedActivities,
        completionRate,
        submittedActivities,
        totalActivities
      })
    };
  }, [quizzesList, assignmentsList, activitiesList, projectsList, laboratoriesList]);

  // Helper function for type performance
  function calculateTypePerformance(activityList) {
    if (activityList.length === 0) return { score: 0, completion: 0 };
    
    const completed = activityList.filter(a => a.submitted).length;
    
    return {
      score: Math.round((completed / activityList.length) * 100),
      completion: Math.round((completed / activityList.length) * 100)
    };
  }

  // Analyze submission patterns (removed late analysis)
  function analyzeSubmissionPatterns(activities) {
    const submittedActivities = activities.filter(a => a.submitted && a.deadline && a.deadline !== 'No deadline');
    
    if (submittedActivities.length === 0) {
      return {
        averageSubmissionTime: "No data",
        submissionConsistency: "No data"
      };
    }

    // Simple consistency measure
    const submissionDates = submittedActivities.map(a => new Date(a.deadline).getTime());
    const dateVariation = Math.max(...submissionDates) - Math.min(...submissionDates);
    const consistency = dateVariation < (30 * 24 * 60 * 60 * 1000) ? "Consistent" : "Variable";

    return {
      submissionConsistency: consistency,
      totalSubmitted: submittedActivities.length
    };
  }

  // Generate actionable insights (removed late references)
  function generateInsights(metrics) {
    const insights = [];

    if (metrics.performanceScore < 60) {
      insights.push({
        type: "warning",
        message: "Your current performance is below satisfactory levels. Focus on completing pending activities.",
        suggestion: "Prioritize missed activities and create a study schedule."
      });
    }

    if (metrics.riskLevel === "HIGH") {
      insights.push({
        type: "critical",
        message: "High risk of subject failure detected. Immediate action required.",
        suggestion: "Contact your professor and develop a recovery plan."
      });
    }

    if (metrics.missedActivities > 0) {
      insights.push({
        type: "info",
        message: `You have ${metrics.missedActivities} missed activity(ies).`,
        suggestion: "Check if submissions are still possible and prioritize completion."
      });
    }

    if (metrics.trend === "improving") {
      insights.push({
        type: "positive",
        message: "Your performance is improving! Keep up the good work.",
        suggestion: "Maintain this momentum by staying organized."
      });
    } else if (metrics.trend === "declining") {
      insights.push({
        type: "warning",
        message: "Recent performance shows a declining trend.",
        suggestion: "Identify challenges and seek help if needed."
      });
    }

    // Add insight about activity completion progress
    if (metrics.submittedActivities < metrics.totalActivities && metrics.submittedActivities > 0) {
      insights.push({
        type: "info",
        message: `You've completed ${metrics.submittedActivities} out of ${metrics.totalActivities} activities.`,
        suggestion: "Focus on completing the remaining assigned activities to improve your performance."
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: "positive",
        message: "You're maintaining good academic performance!",
        suggestion: "Continue your current study habits."
      });
    }

    return insights;
  }

  // compute status counts depending on selected filter
  const statusCounts = useMemo(() => {
    if (!selectedFilter || selectedFilter === "") {
      const q = sumStatusCounts(quizzesList);
      const a = sumStatusCounts(assignmentsList);
      const act = sumStatusCounts(activitiesList);
      const p = sumStatusCounts(projectsList);
      const lab = sumStatusCounts(laboratoriesList);
      return {
        submitted: q.submitted + a.submitted + act.submitted + p.submitted + lab.submitted,
        assigned:   q.assigned   + a.assigned   + act.assigned   + p.assigned + lab.assigned,
        missed:    q.missed    + a.missed    + act.missed    + p.missed + lab.missed,
      };
    } else if (selectedFilter === "Quizzes") {
      return sumStatusCounts(quizzesList);
    } else if (selectedFilter === "Assignment") {
      return sumStatusCounts(assignmentsList);
    } else if (selectedFilter === "Activities") {
      return sumStatusCounts(activitiesList);
    } else if (selectedFilter === "Projects") {
      return sumStatusCounts(projectsList);
    } else if (selectedFilter === "Laboratory") {
      return sumStatusCounts(laboratoriesList);
    } else {
      return { submitted: 0, assigned: 0, missed: 0 };
    }
  }, [selectedFilter, quizzesList, assignmentsList, activitiesList, projectsList, laboratoriesList]);

  // Fixed: Combine all activities when "Overall" is selected
  const displayedList = useMemo(() => {
    if (selectedFilter === 'Assignment') {
      return assignmentsList || [];
    } else if (selectedFilter === 'Activities') {
      return activitiesList || [];
    } else if (selectedFilter === 'Projects') {
      return projectsList || [];
    } else if (selectedFilter === 'Laboratory') {
      return laboratoriesList || [];
    } else if (selectedFilter === '') {
      return [
        ...(quizzesList || []),
        ...(assignmentsList || []),
        ...(activitiesList || []),
        ...(projectsList || []),
        ...(laboratoriesList || [])
      ];
    } else {
      return quizzesList || [];
    }
  }, [selectedFilter, quizzesList, assignmentsList, activitiesList, projectsList, laboratoriesList]);

  // Filter activities based on search term
  const filteredActivities = useMemo(() => {
    if (!activitySearchTerm.trim()) {
      return displayedList;
    }
    
    const searchTermLower = activitySearchTerm.toLowerCase().trim();
    return displayedList.filter(activity => 
      activity.task.toLowerCase().includes(searchTermLower) ||
      activity.title.toLowerCase().includes(searchTermLower) ||
      activity.deadline.toLowerCase().includes(searchTermLower)
    );
  }, [displayedList, activitySearchTerm]);

  const displayedLabel = selectedFilter === '' 
    ? 'All Activities' 
    : selectedFilter || 'Quizzes';

  // Get the text color for the current displayed label
  const getDisplayedLabelColor = () => {
    if (selectedFilter === '') {
      return activityTypeColors.Overall.text;
    } else if (selectedFilter === 'Quizzes') {
      return activityTypeColors.Quizzes.text;
    } else if (selectedFilter === 'Assignment') {
      return activityTypeColors.Assignment.text;
    } else if (selectedFilter === 'Activities') {
      return activityTypeColors.Activities.text;
    } else if (selectedFilter === 'Projects') {
      return activityTypeColors.Projects.text;
    } else if (selectedFilter === 'Laboratory') {
      return activityTypeColors.Laboratory.text;
    } else {
      return activityTypeColors.Overall.text;
    }
  };

  // Pagination calculations for activities (using filteredActivities)
  const activityTotalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const activityStartIndex = (activityCurrentPage - 1) * itemsPerPage;
  const activityEndIndex = activityStartIndex + itemsPerPage;
  const currentActivities = filteredActivities.slice(activityStartIndex, activityEndIndex);

  // Reset pagination when filters or search change
  useEffect(() => {
    setActivityCurrentPage(1);
  }, [selectedFilter, activitySearchTerm]);

  // Pagination handler
  const handleActivityPageChange = (page) => {
    setActivityCurrentPage(page);
  };

  // Get current subject name
  const getCurrentSubjectName = () => {
    if (!currentSubject) {
      return `${subjectCode || 'Loading...'}`;
    }
    return `${currentSubject.subject || 'Unknown Subject'} (${currentSubject.section})`;
  };

  // segments for pie: Submitted, Assigned, Missed
  const segments = useMemo(() => [
    { label: "Submitted", value: statusCounts.submitted, color: "#00A15D" },
    { label: "Assigned", value: statusCounts.assigned, color: "#2196F3" },
    { label: "Missed", value: statusCounts.missed, color: "#EF4444" },
  ], [statusCounts]);

  // For SVG pie
  const radius = 14;
  const circumference = 2 * Math.PI * radius;

  // Animation effect when filter changes or component mounts
  useEffect(() => {
    setAnimationProgress(0);
    const duration = 300; // ms
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setAnimationProgress(currentStep / steps);
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [selectedFilter, quizzesList, assignmentsList, activitiesList, projectsList, laboratoriesList]);

  const toggleFilter = (label) => {
    if (label === "Overall") {
      setSelectedFilter("");
      return;
    }
    setSelectedFilter((prev) => (prev === label ? "" : label));
  };

  // Helper function to get styles for each task item
  const getTaskItemStyles = (label) => {
    const colors = activityTypeColors[label];
    const isSelected = (label === "Overall" && selectedFilter === "") || selectedFilter === label;
    
    if (isSelected) {
      return {
        container: `flex justify-between cursor-pointer p-2 rounded-md transition-all duration-200 border-l-4 ${colors.border} bg-white shadow-sm`,
        text: `${colors.text} font-bold`,
        count: `${colors.text} font-extrabold`
      };
    }
    
    return {
      container: `flex justify-between cursor-pointer p-2 rounded-md transition-all duration-200 border-l-2 border-transparent ${colors.hover}`,
      text: `${colors.text} font-medium`,
      count: `${colors.text} font-semibold`
    };
  };

  // total for the current segments (statusTotal)
  const statusTotal = segments.reduce((acc, s) => acc + (s.value || 0), 0);

  // Risk level color coding
  const getRiskColor = (level) => {
    switch (level) {
      case "HIGH": return "text-red-800 bg-red-50 border-red-200";
      case "MEDIUM": return "text-yellow-800 bg-yellow-50 border-yellow-200";
      case "LOW": return "text-green-800 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // Get appropriate AlertTriangle icon based on risk level
  const getRiskIcon = (level) => {
    switch (level) {
      case "HIGH": return AlertTriangleRed;
      case "MEDIUM": return AlertTriangleYellow;
      case "LOW": return AlertTriangleGreen;
      default: return AlertTriangleYellow;
    }
  };

  // Trend indicator
  const TrendIndicator = ({ trend }) => {
    if (trend === "improving") {
      return (
        <div className="flex items-center text-yellow-600">
          <img src={TrendingUp} alt="Improving" className="w-4 h-4 mr-1" />
          <span className="text-sm">Improving</span>
        </div>
      );
    } else if (trend === "declining") {
      return (
        <div className="flex items-center text-red-600">
          <img src={TrendingDown} alt="Declining" className="w-4 h-4 mr-1" />
          <span className="text-sm">Declining</span>
        </div>
      );
    }
    return (
      <div className="flex items-center text-green-600">
        <span className="text-sm">Stable</span>
      </div>
    );
  };

  // Pagination Component
  const Pagination = () => {
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, activityCurrentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(activityTotalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (activityTotalPages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-2">
        <div className="text-xs sm:text-sm text-gray-600">
          Showing {((activityCurrentPage - 1) * itemsPerPage) + 1} to {Math.min(activityCurrentPage * itemsPerPage, filteredActivities.length)} of {filteredActivities.length} entries
        </div>
        
        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <button
            onClick={() => handleActivityPageChange(activityCurrentPage - 1)}
            disabled={activityCurrentPage === 1}
            className={`flex items-center justify-center w-8 h-8 rounded-md border ${
              activityCurrentPage === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300' 
                : 'bg-white text-[#465746] border-gray-300 hover:bg-gray-50 cursor-pointer'
            }`}
          >
            <img src={ArrowLeft} alt="Previous" className="w-5 h-5" />
          </button>

          {/* Page Numbers */}
          {pageNumbers.map(page => (
            <button
              key={page}
              onClick={() => handleActivityPageChange(page)}
              className={`cursor-pointer flex items-center justify-center w-8 h-8 rounded-md border text-sm font-medium ${
                activityCurrentPage === page
                  ? 'bg-[#465746] text-white border-[#465746]'
                  : 'bg-white text-[#465746] border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() => handleActivityPageChange(activityCurrentPage + 1)}
            disabled={activityCurrentPage === activityTotalPages}
            className={`flex items-center justify-center w-8 h-8 rounded-md border ${
              activityCurrentPage === activityTotalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                : 'bg-white text-[#465746] border-gray-300 hover:bg-gray-50 cursor-pointer'
            }`}
          >
            <img src={ArrowRight} alt="Next" className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* ADVANCED REPORTS DASHBOARD */}
      <div className="bg-[#fff] rounded-lg sm:rounded-xl shadow-md mt-4 sm:mt-5 p-4 sm:p-5 text-[#465746]">
        <div className="flex items-center mb-4">
          <img src={PieIcon} alt="Analytics" className="h-6 w-6 mr-2" />
          <h2 className="text-lg font-bold">Advanced Performance Reports</h2>
        </div>

        {/* Key Metrics Grid - REORDERED as requested */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Risk Level - NOW FIRST with button-like styling */}
          <div 
            className={`p-4 rounded-lg border transition-all duration-500 ${getRiskColor(calculateAdvancedAnalytics.riskLevel)}`}
            style={{
              opacity: animationProgress,
              transform: `translateX(${-20 * (1 - animationProgress)}px)`
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Risk Level</p>
                <p className="text-xl font-bold">{calculateAdvancedAnalytics.riskLevel}</p>
              </div>
              {/* Button-like AlertTriangle with border */}
              <div className={`w-10 h-10 rounded-md border-2 flex items-center justify-center ${
                calculateAdvancedAnalytics.riskLevel === "HIGH" ? "border-red-300" :
                calculateAdvancedAnalytics.riskLevel === "MEDIUM" ? "border-yellow-300" :
                "border-green-300"
              }`}>
                <img 
                  src={getRiskIcon(calculateAdvancedAnalytics.riskLevel)} 
                  alt="Risk Level" 
                  className="w-6 h-6" 
                />
              </div>
            </div>
            <p className="text-xs mt-1 opacity-75">
              {calculateAdvancedAnalytics.missedActivities} missed activities
            </p>
          </div>

          {/* Performance Score */}
          <div 
            className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 transition-all duration-500"
            style={{
              opacity: animationProgress,
              transform: `translateY(${-20 * (1 - animationProgress)}px)`,
              transitionDelay: '100ms'
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-green-800 font-medium">Performance Score</p>
                <p className="text-2xl font-bold text-green-900">{calculateAdvancedAnalytics.performanceScore}/100</p>
              </div>
              <TrendIndicator trend={calculateAdvancedAnalytics.trend} />
            </div>
            <div className="w-full bg-green-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${calculateAdvancedAnalytics.performanceScore * animationProgress}%`,
                  transitionDelay: '200ms'
                }}
              ></div>
            </div>
          </div>

          {/* Completion Rate */}
          <div 
            className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 transition-all duration-500"
            style={{
              opacity: animationProgress,
              transform: `translateY(${20 * (1 - animationProgress)}px)`,
              transitionDelay: '200ms'
            }}
          >
            <p className="text-sm text-blue-800 font-medium">Completion Rate</p>
            <p className="text-2xl font-bold text-blue-900">{calculateAdvancedAnalytics.completionRate}%</p>
            <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${calculateAdvancedAnalytics.completionRate * animationProgress}%`,
                  transitionDelay: '300ms'
                }}
              ></div>
            </div>
          </div>

          {/* Activity Progress */}
          <div 
            className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 transition-all duration-500"
            style={{
              opacity: animationProgress,
              transform: `translateX(${20 * (1 - animationProgress)}px)`,
              transitionDelay: '300ms'
            }}
          >
            <p className="text-sm text-purple-800 font-medium">Activity Progress</p>
            <p className="text-2xl font-bold text-purple-900">{calculateAdvancedAnalytics.activityProgress}</p>
            <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${calculateAdvancedAnalytics.activityProgressPercentage * animationProgress}%`,
                  transitionDelay: '400ms'
                }}
              ></div>
            </div>
            <p className="text-xs mt-1 opacity-75">
              Submitted / Total Activities
            </p>
          </div>
        </div>

        {/* Performance by Activity Type */}
        <div className="mb-6">
          <h3 className="text-md font-semibold mb-3">Performance by Activity Type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Object.entries(calculateAdvancedAnalytics.typePerformance).map(([type, data], index) => {
              // Get the corresponding color from activityTypeColors - Lightest to Darkest
              const getTypeColor = (activityType) => {
                switch (activityType.toLowerCase()) {
                  case 'activities':
                    return {
                      bg: 'bg-[#B8860B]/10',
                      border: 'border-[#B8860B]/30',
                      text: 'text-[#B8860B]',
                      progress: 'bg-[#B8860B]'
                    };
                  case 'assignments':
                    return {
                      bg: 'bg-[#D2691E]/10',
                      border: 'border-[#D2691E]/30',
                      text: 'text-[#D2691E]',
                      progress: 'bg-[#D2691E]'
                    };
                  case 'quizzes':
                    return {
                      bg: 'bg-[#A0522D]/10',
                      border: 'border-[#A0522D]/30',
                      text: 'text-[#A0522D]',
                      progress: 'bg-[#A0522D]'
                    };
                  case 'laboratories':
                    return {
                      bg: 'bg-[#8B4513]/10',
                      border: 'border-[#8B4513]/30',
                      text: 'text-[#8B4513]',
                      progress: 'bg-[#8B4513]'
                    };
                  case 'projects':
                    return {
                      bg: 'bg-[#5D4037]/10',
                      border: 'border-[#5D4037]/30',
                      text: 'text-[#5D4037]',
                      progress: 'bg-[#5D4037]'
                    };
                  default:
                    return {
                      bg: 'bg-gray-50',
                      border: 'border-gray-200',
                      text: 'text-gray-700',
                      progress: 'bg-gray-600'
                    };
                }
              };

              const colors = getTypeColor(type);
              // Staggered animation delay based on index
              const animationDelay = index * 100; // 100ms delay between each card
              
              return (
                <div 
                  key={type} 
                  className={`p-3 rounded-lg border ${colors.bg} ${colors.border} transition-all duration-500`}
                  style={{
                    opacity: animationProgress,
                    transform: `translateY(${10 * (1 - animationProgress)}px)`,
                    transition: `opacity 0.5s ease-out ${animationDelay}ms, transform 0.5s ease-out ${animationDelay}ms`
                  }}
                >
                  <p className={`text-sm font-medium capitalize ${colors.text}`}>{type}</p>
                  <p className={`text-lg font-bold ${colors.text}`}>{data.score}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                      className={`h-1.5 rounded-full ${colors.progress} transition-all duration-800 ease-out`}
                      style={{ 
                        width: `${data.score * animationProgress}%`,
                        transition: `width 0.8s ease-out ${animationDelay + 200}ms`
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Performance Insights */}
        <div>
          <h3 
            className="text-md font-semibold mb-3"
          >
            Performance Insights
          </h3>
          <div className="space-y-3">
            {calculateAdvancedAnalytics.insights.map((insight, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${
                  insight.type === 'critical' ? 'bg-red-50 border-red-200' :
                  insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  insight.type === 'positive' ? 'bg-green-50 border-green-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start">
                  {insight.type === 'critical' && (
                    <img src={AlertTriangleRed} alt="Critical" className="w-5 h-5 mr-3 mt-0.5 text-red-600 flex-shrink-0" />
                  )}
                  {insight.type === 'warning' && (
                    <img src={AlertTriangleYellow} alt="Warning" className="w-5 h-5 mr-3 mt-0.5 text-yellow-600 flex-shrink-0" />
                  )}
                  {insight.type === 'positive' && (
                    <img src={AlertTriangleGreen} alt="Positive" className="w-5 h-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" />
                  )}
                  <div>
                    <p className={`font-medium ${
                      insight.type === 'critical' ? 'text-red-800' :
                      insight.type === 'warning' ? 'text-yellow-800' :
                      insight.type === 'positive' ? 'text-green-800' :
                      'text-blue-800'
                    }`}>
                      {insight.message}
                    </p>
                    <p className="text-sm mt-1 opacity-90">{insight.suggestion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Original Activity Overview Section */}
      <div className="bg-[#fff] rounded-lg sm:rounded-xl shadow-md mt-4 sm:mt-5 p-4 sm:p-5 text-[#465746]">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0">
          <div className="flex items-center">
            <img src={PieIcon} alt="Pie" className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mr-2 sm:mr-3" />
            <p className="text-base sm:text-lg lg:text-xl font-bold">Activity Overview</p>
          </div>
        </div>

        <hr className="border-[#465746]/30 mt-3 sm:mt-4 lg:mt-5" />

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 mt-4 sm:mt-5">
          {/* Created Task List */}
          <div className="bg-[#D4D4D4] p-4 sm:p-5 rounded-md text-sm sm:text-base lg:text-lg w-full lg:w-80 flex-shrink-0 order-2 lg:order-1">
            <p className="font-bold mb-3 text-[#2c5530]">Created Task</p>

            {/* Overall */}
            <div
              onClick={() => toggleFilter("Overall")}
              className={getTaskItemStyles("Overall").container}
            >
              <span className={getTaskItemStyles("Overall").text}>Overall:</span>
              <span className={getTaskItemStyles("Overall").count}>{totalTasksCount}</span>
            </div>

            {/* Activities */}
            <div
              onClick={() => toggleFilter("Activities")}
              className={getTaskItemStyles("Activities").container}
            >
              <span className={getTaskItemStyles("Activities").text}>Activities:</span>
              <span className={getTaskItemStyles("Activities").count}>{activitiesCount}</span>
            </div>

            {/* Assignment */}
            <div
              onClick={() => toggleFilter("Assignment")}
              className={getTaskItemStyles("Assignment").container}
            >
              <span className={getTaskItemStyles("Assignment").text}>Assignments:</span>
              <span className={getTaskItemStyles("Assignment").count}>{assignmentsCount}</span>
            </div>

            {/* Quizzes */}
            <div
              onClick={() => toggleFilter("Quizzes")}
              className={getTaskItemStyles("Quizzes").container}
            >
              <span className={getTaskItemStyles("Quizzes").text}>Quizzes:</span>
              <span className={getTaskItemStyles("Quizzes").count}>{quizzesCount}</span>
            </div>

            {/* Laboratories */}
            <div
              onClick={() => toggleFilter("Laboratory")}
              className={getTaskItemStyles("Laboratory").container}
            >
              <span className={getTaskItemStyles("Laboratory").text}>Laboratories:</span>
              <span className={getTaskItemStyles("Laboratory").count}>{laboratoriesCount}</span>
            </div>

            {/* Projects */}
            <div
              onClick={() => toggleFilter("Projects")}
              className={getTaskItemStyles("Projects").container}
            >
              <span className={getTaskItemStyles("Projects").text}>Projects:</span>
              <span className={getTaskItemStyles("Projects").count}>{projectsCount}</span>
            </div>

            <hr className="my-3 border-[#465746] opacity-50" />

            <div className="flex justify-between font-bold text-[#2c5530]">
              <span>Total Created Task:</span>
              <span>{totalTasksCount}</span>
            </div>
          </div>

          {/* PIE CHART */}
          <div className="bg-[#D4D4D4] rounded-md text-sm sm:text-base lg:text-lg flex-1 p-4 sm:p-5 order-1 lg:order-2">
            <div className="flex flex-col items-center">
              {/* Chart Container */}
              <div className="w-full max-w-md flex justify-center">
                <svg
                  className="w-full h-auto max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px]"
                  viewBox="0 0 32 32"
                >
                  {/* base ring */}
                  <circle r={radius} cx="16" cy="16" fill="transparent" stroke="#E5E7EB" strokeWidth="2.5" />

                  {statusTotal === 0 ? (
                    // No-data fallback: just show base ring
                    null
                  ) : (
                    (() => {
                      let cum = 0;
                      return segments.map((seg, i) => {
                        if (!seg || seg.value === 0) return null;
                        const len = (seg.value / statusTotal) * circumference;
                        const animatedLen = len * animationProgress;
                        const dash = `${animatedLen} ${Math.max(0, circumference - animatedLen)}`;
                        const dashOffset = -cum * animationProgress;
                        cum += len;
                        return (
                          <circle
                            key={i}
                            r={radius}
                            cx="16"
                            cy="16"
                            fill="transparent"
                            stroke={seg.color}
                            strokeWidth="2.5"
                            strokeDasharray={dash}
                            strokeDashoffset={dashOffset}
                            strokeLinecap="butt"
                            transform="rotate(-90 16 16)"
                            style={{
                              transition: 'stroke-dasharray 0.2s ease-out, stroke-dashoffset 0.2s ease-out'
                            }}
                          />
                        );
                      });
                    })()
                  )}

                  {/* center labels - FIXED: Show "Overall:" instead of "SECTION X:" */}
                  <text
                    x="16"
                    y="15"
                    textAnchor="middle"
                    fontSize=".125rem"
                    fontWeight="bold"
                    fill="#465746"
                  >
                    {selectedFilter ? selectedFilter.toUpperCase() : "OVERALL:"}
                  </text>

                  <text
                    x="16"
                    y="18"
                    textAnchor="middle"
                    fontSize=".125rem"
                    fill="#465746"
                  >
                    {statusTotal === 0 ? "No activities found" : "Overview"}
                  </text>
                </svg>
              </div>

              {/* LEGEND */}
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-5 w-full">
                {segments.map((item, i) => {
                  // show each status even if zero (optional); you can filter out zeros if you prefer
                  return (
                    <div key={i} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm lg:text-base">
                      <span
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full inline-block flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.label}:</span>
                      <span className="font-bold">{item.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVITY LIST - Integrated into the same component */}
      <div className="bg-[#fff] p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mt-4 sm:mt-5 text-[#465746]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <p className={`font-bold text-base sm:text-lg lg:text-xl ${getDisplayedLabelColor()}`}>
            {displayedLabel} - {getCurrentSubjectName()}
          </p>
          
          {/* Activity List Search */}
          <div className="relative w-full sm:w-64 lg:w-80">
            <input
              type="text"
              placeholder="Search activities..."
              value={activitySearchTerm}
              onChange={(e) => setActivitySearchTerm(e.target.value)}
              className="w-full h-9 sm:h-10 rounded-md px-3 py-2 pr-10 shadow-md outline-none bg-white text-xs sm:text-sm text-[#465746] border border-gray-300 focus:border-[#465746]"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              <img src={Search} alt="Search" className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {currentActivities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[#465746]">
              {activitySearchTerm ? `No activities found for "${activitySearchTerm}"` : `No ${displayedLabel.toLowerCase()} found for ${getCurrentSubjectName()}.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="min-w-full border-collapse text-xs sm:text-sm lg:text-base">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-2 sm:p-3 font-bold">Task</th>
                    <th className="text-left p-2 sm:p-3 font-bold">Title</th>
                    <th className="text-left p-2 sm:p-3 font-bold text-[#00A15D]">Submitted</th>
                    <th className="text-left p-2 sm:p-3 font-bold text-[#2196F3]">Assigned</th>
                    <th className="text-left p-2 sm:p-3 font-bold text-[#FF6666]">Missed</th>
                    <th className="text-left p-2 sm:p-3 font-bold">Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {currentActivities.map(item => {
                    // Determine status for each item (removed late logic)
                    const isSubmitted = item.submitted === 1 || item.submitted === true;
                    const isMissing = item.missing === 1 || item.missing === true;
                    const isAssigned = !isSubmitted && !isMissing;
                    
                    return (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-2 sm:p-3 whitespace-nowrap">{item.task}</td>
                        <td className="p-2 sm:p-3">{item.title}</td>
                        
                        {/* Submitted Column */}
                        <td className="p-2 sm:p-3 text-[#00A15D]">
                          {isSubmitted ? (
                            <img src={CheckSubmitted} alt="Submitted" className="w-5 h-5 sm:w-6 sm:h-6" />
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        
                        {/* Assigned Column */}
                        <td className="p-2 sm:p-3 text-[#2196F3]">
                          {isAssigned ? (
                            <img src={CheckPending} alt="Assigned" className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        
                        {/* Missed Column */}
                        <td className="p-2 sm:p-3 text-[#FF6666]">
                          {isMissing ? (
                            <img src={Cross} alt="Missed" className="w-4 h-4 sm:w-5 sm:w-5" />
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        
                        <td className="p-2 sm:p-3 whitespace-nowrap">{item.deadline}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Activity List Pagination */}
        {currentActivities.length > 0 && (
          <Pagination />
        )}
      </div>
    </div>
  );
}