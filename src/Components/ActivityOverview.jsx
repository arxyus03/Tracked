import React, { useMemo, useState, useEffect } from "react";
import ArrowDown from "../assets/ArrowDown(Light).svg";
import PieIcon from "../assets/Pie(Light).svg";
import Search from "../assets/Search.svg";
import CheckSubmitted from "../assets/CheckTable(Green).svg";
import CheckLate from "../assets/PendingTable(Yellow).svg";
import CheckPending from "../assets/LateTable(Blue).svg";
import Cross from "../assets/CrossTable(Red).svg";
import ArrowLeft from '../assets/ArrowLeft.svg';
import ArrowRight from '../assets/ArrowRight.svg';

export default function ActivityOverview({
  quizzesList = [],
  assignmentsList = [],
  activitiesList = [],
  projectsList = [],
  selectedFilter,
  setSelectedFilter,
  selectedSubject = "",
  selectedSection = "",
  getCurrentSubjectName = () => ""
}) {
  // counts used for the left "Created Task" panel (number of tasks)
  const quizzesCount = quizzesList.length;
  const assignmentsCount = assignmentsList.length;
  const activitiesCount = activitiesList.length;
  const projectsCount = projectsList.length;
  const totalTasksCount = quizzesCount + assignmentsCount + activitiesCount + projectsCount;

  const [animationProgress, setAnimationProgress] = useState(0);

  // Activity List States
  const [activityCurrentPage, setActivityCurrentPage] = useState(1);
  const [activitySearchTerm, setActivitySearchTerm] = useState("");
  const itemsPerPage = 10;

  // Gradient color palette for activity types (matching student version)
  const activityTypeColors = {
    Overall: { 
      text: "text-[#2c5530]", 
      border: "border-l-[#2c5530]",
      hover: "hover:bg-[#2c5530]/10 hover:border-l-[#2c5530]"
    },
    Quizzes: { 
      text: "text-[#8B4513]", 
      border: "border-l-[#8B4513]",
      hover: "hover:bg-[#8B4513]/10 hover:border-l-[#8B4513]"
    },
    Assignment: { 
      text: "text-[#A0522D]", 
      border: "border-l-[#A0522D]",
      hover: "hover:bg-[#A0522D]/10 hover:border-l-[#A0522D]"
    },
    Activities: { 
      text: "text-[#B8860B]", 
      border: "border-l-[#B8860B]",
      hover: "hover:bg-[#B8860B]/10 hover:border-l-[#B8860B]"
    },
    Projects: { 
      text: "text-[#D2691E]", 
      border: "border-l-[#D2691E]",
      hover: "hover:bg-[#D2691E]/10 hover:border-l-[#D2691E]"
    }
  };

  // FIXED: Updated utility function to properly count pending tasks
  const sumStatusCounts = (list) => {
    let completed = 0, missed = 0, pending = 0, late = 0;
    
    list.forEach(it => {
      const submitted = it.submitted === 1 || it.submitted === true;
      const missing = it.missing === 1 || it.missing === true;
      const lateSubmission = it.late === 1 || it.late === true;
      
      if (submitted) {
        if (lateSubmission) {
          late++; // Count as late if submitted but late
        } else {
          completed++; // Count as completed if submitted on time
        }
      } else if (missing) {
        missed++;
      } else {
        // If not submitted and not missing, it's pending/pending
        pending++;
      }
    });
    
    return { completed, pending, missed, late };
  };

  // compute status counts depending on selected filter
  const statusCounts = useMemo(() => {
    if (!selectedFilter || selectedFilter === "") {
      const q = sumStatusCounts(quizzesList);
      const a = sumStatusCounts(assignmentsList);
      const act = sumStatusCounts(activitiesList);
      const p = sumStatusCounts(projectsList);
      return {
        completed: q.completed + a.completed + act.completed + p.completed,
        pending:   q.pending   + a.pending   + act.pending   + p.pending,
        missed:    q.missed    + a.missed    + act.missed    + p.missed,
        late:      q.late      + a.late      + act.late      + p.late,
      };
    } else if (selectedFilter === "Quizzes") {
      return sumStatusCounts(quizzesList);
    } else if (selectedFilter === "Assignment") {
      return sumStatusCounts(assignmentsList);
    } else if (selectedFilter === "Activities") {
      return sumStatusCounts(activitiesList);
    } else if (selectedFilter === "Projects") {
      return sumStatusCounts(projectsList);
    } else {
      return { completed: 0, pending: 0, missed: 0, late: 0 };
    }
  }, [selectedFilter, quizzesList, assignmentsList, activitiesList, projectsList]);

  // Fixed: Combine all activities when "Overall" is selected
  const displayedList = useMemo(() => {
    if (selectedFilter === 'Assignment') {
      return assignmentsList || [];
    } else if (selectedFilter === 'Activities') {
      return activitiesList || [];
    } else if (selectedFilter === 'Projects') {
      return projectsList || [];
    } else if (selectedFilter === '') {
      // Overall view - combine all activity types
      return [
        ...(quizzesList || []),
        ...(assignmentsList || []),
        ...(activitiesList || []),
        ...(projectsList || [])
      ];
    } else {
      // Default to quizzes (for backward compatibility)
      return quizzesList || [];
    }
  }, [selectedFilter, quizzesList, assignmentsList, activitiesList, projectsList]);

  // Filter activities based on search term
  const filteredActivities = useMemo(() => {
    if (!activitySearchTerm.trim()) {
      return displayedList;
    }
    
    const searchTermLower = activitySearchTerm.toLowerCase().trim();
    return displayedList.filter(activity => 
      activity.task?.toLowerCase().includes(searchTermLower) ||
      activity.title?.toLowerCase().includes(searchTermLower) ||
      activity.deadline?.toLowerCase().includes(searchTermLower)
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
  const getCurrentSubjectDisplayName = () => {
    const subjectName = getCurrentSubjectName();
    if (subjectName && selectedSection) {
      return `${subjectName} (Section ${selectedSection})`;
    } else if (subjectName) {
      return subjectName;
    } else if (selectedSubject && selectedSection) {
      return `${selectedSubject} (Section ${selectedSection})`;
    } else if (selectedSubject) {
      return selectedSubject;
    }
    return "All Activities";
  };

  // segments for pie: Completed, pending, Missed
  const segments = useMemo(() => [
    { label: "Completed", value: statusCounts.completed, color: "#00A15D" },
    { label: "Late", value: statusCounts.late, color: "#F59E0B" }, 
    { label: "Pending", value: statusCounts.pending, color: "#2196F3" },
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
  }, [selectedFilter, quizzesList, assignmentsList, activitiesList, projectsList]);

  const toggleFilter = (label) => {
    if (label === "Overall") {
      setSelectedFilter("");
      return;
    }
    setSelectedFilter((prev) => (prev === label ? "" : label));
  };

  // Helper function to get styles for each task item (matching student version)
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
      {/* Activity Overview Section */}
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
          {/* Created Task List - Updated with student version styling */}
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

            {/* Quizzes */}
            <div
              onClick={() => toggleFilter("Quizzes")}
              className={getTaskItemStyles("Quizzes").container}
            >
              <span className={getTaskItemStyles("Quizzes").text}>Quizzes:</span>
              <span className={getTaskItemStyles("Quizzes").count}>{quizzesCount}</span>
            </div>

            {/* Assignment */}
            <div
              onClick={() => toggleFilter("Assignment")}
              className={getTaskItemStyles("Assignment").container}
            >
              <span className={getTaskItemStyles("Assignment").text}>Assignment:</span>
              <span className={getTaskItemStyles("Assignment").count}>{assignmentsCount}</span>
            </div>

            {/* Activities */}
            <div
              onClick={() => toggleFilter("Activities")}
              className={getTaskItemStyles("Activities").container}
            >
              <span className={getTaskItemStyles("Activities").text}>Activities:</span>
              <span className={getTaskItemStyles("Activities").count}>{activitiesCount}</span>
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

          {/* PIE CHART - Updated to show status counts like student version */}
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

                  {/* center labels */}
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
                    {statusTotal === 0 ? "No data" : "Overview"}
                  </text>
                </svg>
              </div>

              {/* LEGEND */}
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-5 w-full">
                {segments.map((item, i) => {
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
            {displayedLabel} - {getCurrentSubjectDisplayName()}
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
              {activitySearchTerm ? `No activities found for "${activitySearchTerm}"` : `No ${displayedLabel.toLowerCase()} found for ${getCurrentSubjectDisplayName()}.`}
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
                    <th className="text-left p-2 sm:p-3 font-bold text-[#F59E0B]">Late</th> 
                    <th className="text-left p-2 sm:p-3 font-bold text-[#2196F3]">Pending</th>
                    <th className="text-left p-2 sm:p-3 font-bold text-[#FF6666]">Missing</th>
                    <th className="text-left p-2 sm:p-3 font-bold">Deadline</th>
                  </tr>
                </thead>
                <tbody>
                  {currentActivities.map((item, index) => {
                    // Determine status for each item
                    const isSubmitted = item.submitted === 1 || item.submitted === true;
                    const isLate = item.late === 1 || item.late === true;
                    const isMissing = item.missing === 1 || item.missing === true;
                    const isPending = !isSubmitted && !isMissing && !isLate;
                    
                    return (
                      <tr key={item.id || index} className="border-b border-gray-100 hover:bg-gray-50">
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
                        
                        {/* Late Column */}
                        <td className="p-2 sm:p-3 text-[#F59E0B]">
                          {isLate ? (
                            <img src={CheckLate} alt="Late" className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <span>-</span>
                          )}
                        </td>

                        {/* Pending Column */}
                        <td className="p-2 sm:p-3 text-[#2196F3]">
                          {isPending ? (
                            <img src={CheckPending} alt="Pending" className="w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                        
                        {/* Missing Column */}
                        <td className="p-2 sm:p-3 text-[#FF6666]">
                          {isMissing ? (
                            <img src={Cross} alt="Missing" className="w-4 h-4 sm:w-5 sm:h-5" />
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