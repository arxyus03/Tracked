import React, { useState } from "react";
import ArrowDown from "../assets/ArrowDown(Light).svg";

export default function ActivityCardStudent({
  index = 0,
  id,
  title,
  status,
  deadline,
  datePosted,
  description,
  section,
  postedBy
}) {
  const [open, setOpen] = useState(false);

  const isGraded = String(status).toLowerCase() === "graded";

  return (
    <div className="bg-white rounded-md shadow-md p-4 sm:p-5 border-2 border-transparent hover:border-[#00874E] transition-all duration-200 cursor-pointer">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="min-w-0">
            <div className="text-lg font-semibold">
              {title}
            </div>
            <div className="text-md">
              {section} • Posted {datePosted}
            </div>
          </div>
        </div>

        {/* Right: status, deadline, expand */}
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className={`font-semibold ${isGraded ? "text-green-600" : "text-[#FF6666]"}`}>
              {isGraded ? "Graded" : "Not graded"}
            </span>
          </div>

          <div className="text-sm text-[#FF6666] font-bold whitespace-nowrap">
            {deadline || "No deadline"}
          </div>

          <button
            onClick={() => setOpen(prev => !prev)}
            aria-label={open ? "Collapse" : "Expand"}
            className={`p-2 rounded-md transform transition-transform ${open ? "rotate-180" : ""}`}
            title={open ? "Collapse" : "Expand"}
          >
            <img src={ArrowDown} alt="Toggle" className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {open && (
        <div className="mt-3 border-t pt-3 text-sm text-gray-700">
          <p className="mb-2">{description}</p>
          <div className="text-sm text-gray-700">
            <span>Posted by {postedBy}</span>
          </div>
        </div>
      )}
    </div>
  );
}
