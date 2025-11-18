import React, { useMemo, useState, useEffect } from "react";
import ArrowDown from "../assets/ArrowDown(Light).svg";
import PieIcon from "../assets/Pie(Light).svg";

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
  const quizzesCount = quizzesList.length;
  const assignmentsCount = assignmentsList.length;
  const activitiesCount = activitiesList.length;
  const projectsCount = projectsList.length;
  const totalCount = quizzesCount + assignmentsCount + activitiesCount + projectsCount;

  const [animationProgress, setAnimationProgress] = useState(0);

  const segments = useMemo(
    () => [
      { label: "Quizzes", value: quizzesCount, color: "#00A15D" },
      { label: "Assignment", value: assignmentsCount, color: "#F59E0B" },
      { label: "Activities", value: activitiesCount, color: "#3B82F6" },
      { label: "Projects", value: projectsCount, color: "#EF4444" },
    ],
    [quizzesCount, assignmentsCount, activitiesCount, projectsCount]
  );

  const radius = 14;
  const circumference = 2 * Math.PI * radius;

  // Animation effect when filter changes or component mounts
  useEffect(() => {
    setAnimationProgress(0);
    const duration = 300; // 0.3 second animation
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
  }, [selectedFilter, quizzesCount, assignmentsCount, activitiesCount, projectsCount]);

  const toggleFilter = (label) => {
    if (label === "Overall") {
      setSelectedFilter("");
      return;
    }
    setSelectedFilter((prev) => (prev === label ? "" : label));
  };

  // Get the display text for the pie chart center
  const getPieChartText = () => {
    if (selectedFilter === "") {
      return "OVERALL:";
    } else {
      return selectedFilter.toUpperCase();
    }
  };

  // Get the subtitle for the pie chart - NOW PROPERLY USING THE PROPS
  const getPieChartSubtitle = () => {
    if (selectedFilter === "") {
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
    }
    return "Overview";
  };

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
        {/* Created Task List - Shows second on mobile, first on desktop */}
        <div className="bg-[#D4D4D4] p-4 sm:p-5 rounded-md text-sm sm:text-base lg:text-lg w-full lg:w-80 flex-shrink-0 order-2 lg:order-1">
          <p className="font-bold mb-3">Created Task</p>

          <div
            onClick={() => toggleFilter("Overall")}
            className={`flex justify-between cursor-pointer p-2 rounded-md transition-colors ${
              selectedFilter === "" ? "bg-[#BEBEBE]" : "hover:bg-gray-300"
            }`}
          >
            <span>Overall:</span>
            <span className="font-semibold">{totalCount}</span>
          </div>

          <div
            onClick={() => toggleFilter("Quizzes")}
            className={`flex justify-between cursor-pointer p-2 rounded-md transition-colors ${
              selectedFilter === "Quizzes" ? "bg-[#BEBEBE]" : "hover:bg-gray-300"
            }`}
          >
            <span>Quizzes:</span>
            <span className="font-semibold">{quizzesCount}</span>
          </div>

          <div
            onClick={() => toggleFilter("Assignment")}
            className={`flex justify-between cursor-pointer p-2 rounded-md transition-colors ${
              selectedFilter === "Assignment" ? "bg-[#BEBEBE]" : "hover:bg-gray-300"
            }`}
          >
            <span>Assignment:</span>
            <span className="font-semibold">{assignmentsCount}</span>
          </div>

          <div
            onClick={() => toggleFilter("Activities")}
            className={`flex justify-between cursor-pointer p-2 rounded-md transition-colors ${
              selectedFilter === "Activities" ? "bg-[#BEBEBE]" : "hover:bg-gray-300"
            }`}
          >
            <span>Activities:</span>
            <span className="font-semibold">{activitiesCount}</span>
          </div>

          <div
            onClick={() => toggleFilter("Projects")}
            className={`flex justify-between cursor-pointer p-2 rounded-md transition-colors ${
              selectedFilter === "Projects" ? "bg-[#BEBEBE]" : "hover:bg-gray-300"
            }`}
          >
            <span>Projects:</span>
            <span className="font-semibold">{projectsCount}</span>
          </div>

          <hr className="my-3 border-[#465746] opacity-50" />

          <div className="flex justify-between font-bold">
            <span>Total Created Task:</span>
            <span>{totalCount}</span>
          </div>
        </div>

        {/* PIE CHART - Shows first on mobile, second on desktop */}
        <div className="bg-[#D4D4D4] rounded-md text-sm sm:text-base lg:text-lg flex-1 p-4 sm:p-5 order-1 lg:order-2">
          <div className="flex flex-col items-center">
            {/* Chart Container */}
            <div className="w-full max-w-md flex justify-center">
              <svg 
                className="w-full h-auto max-w-[280px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[400px]" 
                viewBox="0 0 32 32"
              >
                <circle r={radius} cx="16" cy="16" fill="transparent" stroke="#E5E7EB" strokeWidth="2.5" />

                {(() => {
                  // overall view when no specific filter selected
                  if (!selectedFilter) {
                    let cum = 0;
                    return segments.map((seg, i) => {
                      if (seg.value === 0 || totalCount === 0) return null;
                      const len = (seg.value / totalCount) * circumference;
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
                  }

                  // specific filter: show chosen vs others
                  const chosen = segments.find((s) => s.label === selectedFilter);
                  const othersValue = totalCount - (chosen ? chosen.value : 0);
                  const toDraw = [];
                  if (chosen && chosen.value > 0) toDraw.push({ ...chosen });
                  if (othersValue > 0) toDraw.push({ label: "Others", value: othersValue, color: "#D1D5DB" });

                  let cum2 = 0;
                  return toDraw.map((seg, i) => {
                    const len = (seg.value / (chosen ? chosen.value + othersValue : totalCount)) * circumference;
                    const animatedLen = len * animationProgress;
                    const dash = `${animatedLen} ${Math.max(0, circumference - animatedLen)}`;
                    const dashOffset = -cum2 * animationProgress;
                    cum2 += len;
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
                })()}

                <text 
                  x="16" 
                  y="14.5" 
                  textAnchor="middle" 
                  fontSize=".125rem" 
                  fontWeight="bold" 
                  fill="#465746"
                >
                  {getPieChartText()}
                </text>

                <text 
                  x="16" 
                  y="17.5" 
                  textAnchor="middle" 
                  fontSize=".08rem" 
                  fill="#465746"
                >
                  {getPieChartSubtitle()}
                </text>
              </svg>
            </div>

            {/* LEGEND */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-5 w-full">
              {(() => {
                if (!selectedFilter) {
                  return segments.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm lg:text-base">
                      <span 
                        className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full inline-block flex-shrink-0" 
                        style={{ backgroundColor: item.color }} 
                      />
                      <span>{item.label}:</span>
                      <span className="font-bold">{item.value}</span>
                    </div>
                  ));
                } else {
                  const chosen = segments.find((s) => s.label === selectedFilter);
                  const othersValue = totalCount - (chosen ? chosen.value : 0);
                  return (
                    <>
                      {chosen && (
                        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm lg:text-base">
                          <span 
                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full inline-block flex-shrink-0" 
                            style={{ backgroundColor: chosen.color }} 
                          />
                          <span>{chosen.label}:</span>
                          <span className="font-bold">{chosen.value}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm lg:text-base">
                        <span 
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full inline-block flex-shrink-0" 
                          style={{ backgroundColor: "#D1D5DB" }} 
                        />
                        <span>Others:</span>
                        <span className="font-bold">{othersValue}</span>
                      </div>
                    </>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}