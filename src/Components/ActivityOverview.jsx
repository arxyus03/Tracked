import React, { useMemo } from "react";
import ArrowDown from "../assets/ArrowDown(Light).svg";
import PieIcon from "../assets/Pie(Light).svg";

export default function ActivityOverview({
  quizzesList = [],
  assignmentsList = [],
  activitiesList = [],
  projectsList = [],
  selectedFilter,
  setSelectedFilter
}) {
  const quizzesCount = quizzesList.length;
  const assignmentsCount = assignmentsList.length;
  const activitiesCount = activitiesList.length;
  const projectsCount = projectsList.length;
  const totalCount = quizzesCount + assignmentsCount + activitiesCount + projectsCount;

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

  const toggleFilter = (label) => {
    if (label === "Overall") {
      setSelectedFilter("");
      return;
    }
    setSelectedFilter((prev) => (prev === label ? "" : label));
  };

  return (
    <div className="bg-[#fff] rounded-lg shadow-md mt-5 p-5">
      <div className="flex items-center">
        <img src={PieIcon} alt="Pie" className="h-8 w-8 mr-3" />
        <p className="text-[1.125rem] font-bold"> Activity Overview </p>

        <div className="flex flex-wrap gap-2 mt-3 ml-auto">
          <div className="relative">
            <button
              onClick={() => {}}
              className="flex w-80 items-center font-bold px-3 py-2 bg-[#D4D4D4] rounded-md cursor-pointer shadow-md"
            >
              Section
              <img src={ArrowDown} alt="ArrowDown" className="ml-50 h-5 w-5 sm:h-6 sm:w-6 md:h-6 md:w-6 lg:h-7 lg:w-7" />
            </button>
          </div>
        </div>
      </div>

      <hr className="opacity-60 border-[#465746] rounded border-1 mt-5" />

      <div className="flex mt-5">
        {/* Created Task list */}
        <div className="bg-[#D4D4D4] p-5 rounded-md text-[1.125rem] w-80 h-120">
          <p className="font-bold mb-3">Created Task</p>

          <div
            onClick={() => toggleFilter("Overall")}
            className={`flex justify-between cursor-pointer p-1 rounded-md ${selectedFilter === "" ? "bg-[#BEBEBE]" : "hover:bg-gray-300"}`}
          >
            <span>Overall:</span>
            <span>{totalCount}</span>
          </div>

          <div
            onClick={() => toggleFilter("Quizzes")}
            className={`flex justify-between cursor-pointer p-1 rounded-md ${selectedFilter === "Quizzes" ? "bg-[#BEBEBE]" : "hover:bg-gray-300"}`}
          >
            <span>Quizzes:</span>
            <span>{quizzesCount}</span>
          </div>

          <div
            onClick={() => toggleFilter("Assignment")}
            className={`flex justify-between cursor-pointer p-1 rounded-md ${selectedFilter === "Assignment" ? "bg-[#BEBEBE]" : "hover:bg-gray-300"}`}
          >
            <span>Assignment:</span>
            <span>{assignmentsCount}</span>
          </div>

          <div
            onClick={() => toggleFilter("Activities")}
            className={`flex justify-between cursor-pointer p-1 rounded-md ${selectedFilter === "Activities" ? "bg-[#BEBEBE]" : "hover:bg-gray-300"}`}
          >
            <span>Activities:</span>
            <span>{activitiesCount}</span>
          </div>

          <div
            onClick={() => toggleFilter("Projects")}
            className={`flex justify-between cursor-pointer p-1 rounded-md ${selectedFilter === "Projects" ? "bg-[#BEBEBE]" : "hover:bg-gray-300"}`}
          >
            <span>Projects:</span>
            <span>{projectsCount}</span>
          </div>

          <hr className="my-2 border-[#465746] opacity-50" />

          <div className="flex justify-between font-bold">
            <span>Total Created Task:</span>
            <span>{totalCount}</span>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="bg-[#D4D4D4] ml-5 rounded-md text-[1.125rem] items-center gap-6 w-295">
          <div className="flex flex-col items-center mt-5">
            <div>
              <svg width="400" height="400" viewBox="0 0 32 32">
                <circle r={radius} cx="16" cy="16" fill="transparent" stroke="#E5E7EB" strokeWidth="2.5" />

                {(() => {
                  // overall view when no specific filter selected
                  if (!selectedFilter) {
                    let cum = 0;
                    return segments.map((seg, i) => {
                      if (seg.value === 0 || totalCount === 0) return null;
                      const len = (seg.value / totalCount) * circumference;
                      const dash = `${len} ${Math.max(0, circumference - len)}`;
                      const dashOffset = -cum;
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
                        />
                      );
                    });
                  }

                  // specific filter: show chosen vs others
                  const chosen = segments.find((s) => s.label === selectedFilter);
                  const othersValue = totalCount - (chosen ? chosen.value : 0);
                  const toDraw = [];
                  if (chosen && chosen.value > 0) toDraw.push({ ...chosen });
                  if (othersValue > 0) toDraw.push({ label: "Others", value: othersValue, color: "#fff" });

                  let cum2 = 0;
                  return toDraw.map((seg, i) => {
                    const len = (seg.value / (chosen ? chosen.value + othersValue : totalCount)) * circumference;
                    const dash = `${len} ${Math.max(0, circumference - len)}`;
                    const dashOffset = -cum2;
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
                      />
                    );
                  });
                })()}

                <text x="16" y="15" textAnchor="middle" fontSize=".125rem" fontWeight="bold" fill="#465746">
                  {selectedFilter ? selectedFilter.toUpperCase() : "SECTION X:"}
                </text>

                <text x="16" y="18" textAnchor="middle" fontSize=".125rem" fill="#465746">
                  {selectedFilter ? "Overview" : "Overall"}
                </text>
              </svg>
            </div>

            {/* LEGEND */}
            <div className="flex gap-6 mt-5">
              {(() => {
                if (!selectedFilter) {
                  return segments.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                      <span> {item.label}: </span>
                      <span className="font-bold">{item.value}</span>
                    </div>
                  ));
                } else {
                  const chosen = segments.find((s) => s.label === selectedFilter);
                  const othersValue = totalCount - (chosen ? chosen.value : 0);
                  return (
                    <>
                      {chosen && (
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: chosen.color }} />
                          <span> {chosen.label}: </span>
                          <span className="font-bold">{chosen.value}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: "#D1D5DB" }} />
                        <span> Others: </span>
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
