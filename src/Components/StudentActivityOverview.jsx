import React from "react";
import PieIcon from "../assets/Pie(Light).svg";

export default function StudentActivityOverview({
  quizzesCount,
  assignmentsCount,
  activitiesCount,
  projectsCount,
  laboratoriesCount,
  totalTasksCount,
  selectedFilter,
  setSelectedFilter,
  animationProgress,
  segments,
  statusTotal
}) {
  // Compact color palette
  const activityTypeColors = {
    Overall: { text: "#00A15D" },
    Activities: { text: "#FFA600" },
    Assignment: { text: "#767EE0" },
    Quizzes: { text: "#A15353" },
    Laboratory: { text: "#B39DDB" },
    Projects: { text: "#FFA600" }
  };

  const toggleFilter = (label) => {
    if (label === "Overall") {
      setSelectedFilter("");
      return;
    }
    setSelectedFilter((prev) => (prev === label ? "" : label));
  };

  // Increased radius for bigger pie chart
  const radius = 16; // Increased from 12
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="bg-[#15151C] rounded-lg shadow-sm p-4 text-white h-full">
      {/* Header Section */}
      <div className="flex items-center">
        <img src={PieIcon} alt="Pie" className="h-5 w-5 mr-2" />
        <p className="text-base font-semibold">Activity Overview</p>
      </div>

      <hr className="border-white/20 mt-3" />

      {/* Main Content Area - Adjusted layout */}
      <div className="flex flex-col lg:flex-row gap-4 mt-4">
        {/* Created Task List */}
        <div className="bg-[#23232C] p-3 rounded text-sm lg:w-1/2">
          <p className="font-semibold mb-2 text-[#00A15D]">Created Task</p>

          {/* Overall */}
          <div
            onClick={() => toggleFilter("Overall")}
            className={`flex justify-between cursor-pointer p-2 rounded transition-all duration-150 border-l-4 ${
              (selectedFilter === "" && "border-[#00A15D] bg-[#23232C]/80") || "border-transparent hover:bg-[#23232C]/50"
            }`}
          >
            <span style={{ color: activityTypeColors.Overall.text }} className="font-medium">
              Overall:
            </span>
            <span style={{ color: activityTypeColors.Overall.text }} className="font-bold">
              {totalTasksCount}
            </span>
          </div>

          {/* Activities */}
          <div
            onClick={() => toggleFilter("Activities")}
            className={`flex justify-between cursor-pointer p-2 rounded transition-all duration-150 border-l-4 ${
              (selectedFilter === "Activities" && "border-[#FFA600] bg-[#23232C]/80") || "border-transparent hover:bg-[#23232C]/50"
            }`}
          >
            <span style={{ color: activityTypeColors.Activities.text }} className="font-medium">
              Activities:
            </span>
            <span style={{ color: activityTypeColors.Activities.text }} className="font-bold">
              {activitiesCount}
            </span>
          </div>

          {/* Assignment */}
          <div
            onClick={() => toggleFilter("Assignment")}
            className={`flex justify-between cursor-pointer p-2 rounded transition-all duration-150 border-l-4 ${
              (selectedFilter === "Assignment" && "border-[#767EE0] bg-[#23232C]/80") || "border-transparent hover:bg-[#23232C]/50"
            }`}
          >
            <span style={{ color: activityTypeColors.Assignment.text }} className="font-medium">
              Assignments:
            </span>
            <span style={{ color: activityTypeColors.Assignment.text }} className="font-bold">
              {assignmentsCount}
            </span>
          </div>

          {/* Quizzes */}
          <div
            onClick={() => toggleFilter("Quizzes")}
            className={`flex justify-between cursor-pointer p-2 rounded transition-all duration-150 border-l-4 ${
              (selectedFilter === "Quizzes" && "border-[#A15353] bg-[#23232C]/80") || "border-transparent hover:bg-[#23232C]/50"
            }`}
          >
            <span style={{ color: activityTypeColors.Quizzes.text }} className="font-medium">
              Quizzes:
            </span>
            <span style={{ color: activityTypeColors.Quizzes.text }} className="font-bold">
              {quizzesCount}
            </span>
          </div>

          {/* Laboratories */}
          <div
            onClick={() => toggleFilter("Laboratory")}
            className={`flex justify-between cursor-pointer p-2 rounded transition-all duration-150 border-l-4 ${
              (selectedFilter === "Laboratory" && "border-[#B39DDB] bg-[#23232C]/80") || "border-transparent hover:bg-[#23232C]/50"
            }`}
          >
            <span style={{ color: activityTypeColors.Laboratory.text }} className="font-medium">
              Laboratories:
            </span>
            <span style={{ color: activityTypeColors.Laboratory.text }} className="font-bold">
              {laboratoriesCount}
            </span>
          </div>

          {/* Projects */}
          <div
            onClick={() => toggleFilter("Projects")}
            className={`flex justify-between cursor-pointer p-2 rounded transition-all duration-150 border-l-4 ${
              (selectedFilter === "Projects" && "border-[#FFA600] bg-[#23232C]/80") || "border-transparent hover:bg-[#23232C]/50"
            }`}
          >
            <span style={{ color: activityTypeColors.Projects.text }} className="font-medium">
              Projects:
            </span>
            <span style={{ color: activityTypeColors.Projects.text }} className="font-bold">
              {projectsCount}
            </span>
          </div>

          <hr className="my-2 border-white/10" />

          <div className="flex justify-between font-semibold text-[#00A15D]">
            <span>Total Created Task:</span>
            <span>{totalTasksCount}</span>
          </div>
        </div>

        {/* PIE CHART - Bigger version */}
        <div className="bg-[#23232C] rounded p-4 lg:w-1/2">
          <div className="flex flex-col items-center justify-center h-full">
            {/* Chart Container - Made bigger */}
            <div className="w-full mb-4">
              <svg
                className="w-full h-auto max-w-[280px] mx-auto" // Increased max-width
                viewBox="0 0 40 40" // Increased viewBox size
              >
                {/* Base ring */}
                <circle 
                  r={radius} 
                  cx="20" 
                  cy="20" 
                  fill="transparent" 
                  stroke="rgba(255,255,255,0.1)" 
                  strokeWidth="3" // Slightly thicker stroke
                />

                {statusTotal === 0 ? null : (() => {
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
                        cx="20"
                        cy="20"
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth="3" // Slightly thicker stroke
                        strokeDasharray={dash}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="butt"
                        transform="rotate(-90 20 20)"
                        style={{
                          transition: 'stroke-dasharray 0.15s ease-out, stroke-dashoffset 0.15s ease-out'
                        }}
                      />
                    );
                  });
                })()}

                {/* Center labels - Adjusted positioning and font size */}
                <text
                  x="20"
                  y="19"
                  textAnchor="middle"
                  fontSize=".2rem" // Increased font size
                  fontWeight="bold"
                  fill="#FFFFFF"
                >
                  {selectedFilter ? selectedFilter.toUpperCase() : "OVERALL"}
                </text>

                <text
                  x="20"
                  y="23"
                  textAnchor="middle"
                  fontSize=".15rem" // Increased font size
                  fill="rgba(255,255,255,0.7)"
                >
                  {statusTotal === 0 ? "No activities" : "Overview"}
                </text>
              </svg>
            </div>

            {/* LEGEND - Adjusted for bigger chart */}
            <div className="flex flex-wrap justify-center gap-4 mt-2 w-full">
              {segments.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span
                    className="w-3 h-3 rounded-full inline-block flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-white/90">{item.label}:</span>
                  <span className="font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}