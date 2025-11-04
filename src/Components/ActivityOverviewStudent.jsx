// ActivityOverviewStudent.jsx
import React, { useMemo, useState, useEffect } from "react";
import ArrowDown from "../assets/ArrowDown(Light).svg";
import PieIcon from "../assets/Pie(Light).svg";

export default function ActivityOverviewStudent({
  quizzesList = [],
  assignmentsList = [],
  activitiesList = [],
  projectsList = [],
  selectedFilter,
  setSelectedFilter
}) {
  // counts used for the left "Created Task" panel (number of tasks)
  const quizzesCount = quizzesList.length;
  const assignmentsCount = assignmentsList.length;
  const activitiesCount = activitiesList.length;
  const projectsCount = projectsList.length;
  const totalTasksCount = quizzesCount + assignmentsCount + activitiesCount + projectsCount;

  const [animationProgress, setAnimationProgress] = useState(0);

  // utility: sum up status counts for a list of items
  const sumStatusCounts = (list) => {
    let completed = 0, missed = 0, ongoing = 0;
    list.forEach(it => {
      const s = Number(it.submitted || 0);
      const m = Number(it.missing || 0);
      // if total is provided use it, else assume total = submitted + missing (ongoing = 0)
      const t = Number(it.total ?? (s + m));
      completed += s;
      missed += m;
      ongoing += Math.max(0, t - s - m);
    });
    return { completed, ongoing, missed };
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
        ongoing:   q.ongoing   + a.ongoing   + act.ongoing   + p.ongoing,
        missed:    q.missed    + a.missed    + act.missed    + p.missed,
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
      return { completed: 0, ongoing: 0, missed: 0 };
    }
  }, [selectedFilter, quizzesList, assignmentsList, activitiesList, projectsList]);

  // segments for pie: Completed, Ongoing, Missed
  const segments = useMemo(() => [
    { label: "Completed", value: statusCounts.completed, color: "#00A15D" },
    { label: "Ongoing", value: statusCounts.ongoing, color: "#F59E0B" },
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

  // total for the current segments (statusTotal)
  const statusTotal = segments.reduce((acc, s) => acc + (s.value || 0), 0);

  return (
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
          <p className="font-bold mb-3">Created Task</p>

          <div
            onClick={() => toggleFilter("Overall")}
            className={`flex justify-between cursor-pointer p-2 rounded-md transition-colors ${selectedFilter === "" ? "bg-[#BEBEBE]" : "hover:bg-gray-300"}`}
          >
            <span>Overall:</span>
            <span className="font-semibold">{totalTasksCount}</span>
          </div>

          <div
            onClick={() => toggleFilter("Quizzes")}
            className={`flex justify-between cursor-pointer p-2 rounded-md transition-colors ${selectedFilter === "Quizzes" ? "bg-[#BEBEBE]" : "hover:bg-gray-300"}`}
          >
            <span>Quizzes:</span>
            <span className="font-semibold">{quizzesCount}</span>
          </div>

          <div
            onClick={() => toggleFilter("Assignment")}
            className={`flex justify-between cursor-pointer p-2 rounded-md transition-colors ${selectedFilter === "Assignment" ? "bg-[#BEBEBE]" : "hover:bg-gray-300"}`}
          >
            <span>Assignment:</span>
            <span className="font-semibold">{assignmentsCount}</span>
          </div>

          <div
            onClick={() => toggleFilter("Activities")}
            className={`flex justify-between cursor-pointer p-2 rounded-md transition-colors ${selectedFilter === "Activities" ? "bg-[#BEBEBE]" : "hover:bg-gray-300"}`}
          >
            <span>Activities:</span>
            <span className="font-semibold">{activitiesCount}</span>
          </div>

          <div
            onClick={() => toggleFilter("Projects")}
            className={`flex justify-between cursor-pointer p-2 rounded-md transition-colors ${selectedFilter === "Projects" ? "bg-[#BEBEBE]" : "hover:bg-gray-300"}`}
          >
            <span>Projects:</span>
            <span className="font-semibold">{projectsCount}</span>
          </div>

          <hr className="my-3 border-[#465746] opacity-50" />

          <div className="flex justify-between font-bold">
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

                {/* center labels */}
                <text
                  x="16"
                  y="15"
                  textAnchor="middle"
                  fontSize=".125rem"
                  fontWeight="bold"
                  fill="#465746"
                >
                  {selectedFilter ? selectedFilter.toUpperCase() : "SECTION X:"}
                </text>

                <text
                  x="16"
                  y="18"
                  textAnchor="middle"
                  fontSize=".125rem"
                  fill="#465746"
                >
                  {statusTotal === 0 ? "No data" : (selectedFilter ? "Overview" : "Overall")}
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
  );
}
