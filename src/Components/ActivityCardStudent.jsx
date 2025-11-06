import React, { useState } from "react";
import ArrowDown from "../assets/ArrowDown(Light).svg";

export default function ActivityCardStudent({ activity, formatDate }) {
  const [open, setOpen] = useState(false);

  const isSubmitted = activity.submitted === 1 || activity.submitted === true;
  const isLate = activity.late === 1 || activity.late === true;

  const getStatusText = () => {
    if (isSubmitted && isLate) return "Submitted Late";
    if (isSubmitted) return "Submitted";
    return "Not Submitted";
  };

  const getStatusColor = () => {
    if (isSubmitted && isLate) return "text-yellow-600";
    if (isSubmitted) return "text-green-600";
    return "text-[#FF6666]";
  };

  // Check if deadline is overdue
  const isOverdue = activity.deadline && new Date(activity.deadline) < new Date() && !isSubmitted;

  return (
    <div className="bg-white rounded-md shadow-md p-3 sm:p-4 mb-4 w-full mt-5 border-2 border-transparent hover:border-[#00874E] transition-all duration-200">
      {/* Card Header */}
      <div className="relative cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pr-10">
          
          {/* Title and details section */}
          <div className="flex flex-col text-sm sm:text-base lg:text-[1.125rem] flex-1 min-w-0">
            <span className="font-bold text-base sm:text-lg">{activity.title}</span>
            
            {/* Activity metadata */}
            <span className="text-xs sm:text-sm text-gray-600 mt-1">
              {activity.task_number} | {activity.activity_type} | Posted: {formatDate(activity.created_at)}
            </span>
            
            {/* Points and Deadline */}
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                {activity.points && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs sm:text-sm font-semibold text-[#465746] whitespace-nowrap">Points:</span>
                    <span className="text-xs sm:text-sm text-[#465746]">{activity.points}</span>
                  </div>
                )}
                {activity.deadline && (
                  <div className="flex items-center gap-1">
                    <span className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${isOverdue ? 'text-[#EF4444]' : 'text-[#465746]'}`}>
                      Deadline:
                    </span>
                    <span className={`text-xs sm:text-sm ${isOverdue ? 'text-[#EF4444] font-semibold' : 'text-[#465746]'}`}>
                      {formatDate(activity.deadline)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status section - stack on mobile, row on desktop */}
          <div className="flex items-center gap-2 text-sm sm:text-base lg:text-[1.125rem]">
            <p className="font-bold whitespace-nowrap text-xs sm:text-sm">Status:</p>
            <p className={`whitespace-nowrap text-xs sm:text-sm lg:text-base font-semibold ${getStatusColor()}`}>
              {getStatusText()}
            </p>
          </div>
        </div>

        {/* Arrow - absolute positioned on upper right */}
        <img
          src={ArrowDown}
          alt="Expand"
          className={`h-5 w-5 sm:h-6 sm:w-6 transform transition-transform duration-300 
                      absolute top-0 right-0
                      ${open ? "rotate-180" : ""}`}
        />
      </div>

      {/* Expanded content */}
      {open && (
        <div className="mt-3 pt-3 border-t space-y-3">
          <div className="text-gray-700 space-y-2">
            {/* Task Number */}
            {activity.task_number && (
              <div className="text-sm sm:text-lg flex items-start gap-2">
                <span className="font-semibold text-[#465746] whitespace-nowrap">Task Number:</span>
                <span className="text-[#465746] uppercase">{activity.task_number}</span>
              </div>
            )}

            {/* Activity Type */}
            {activity.activity_type && (
              <div className="text-xs sm:text-sm flex items-start gap-2">
                <span className="font-semibold text-[#465746] whitespace-nowrap">Activity Type:</span>
                <span className="text-[#465746] capitalize">{activity.activity_type.toLowerCase()}</span>
              </div>
            )}
            
            {/* Instructions */}
            {activity.instruction && (
              <div className="text-xs sm:text-sm flex items-start gap-2">
                <span className="font-semibold text-[#465746] whitespace-nowrap">Instructions:</span>
                <span className="text-[#465746] whitespace-pre-wrap">{activity.instruction}</span>
              </div>
            )}
            
            {/* Link */}
            {activity.link && (
              <div className="text-xs sm:text-xs flex items-start gap-2">
                <span className="font-semibold text-[#465746] whitespace-nowrap">Link:</span>
                <a 
                  href={activity.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-words flex-1"
                >
                  {activity.link}
                </a>
              </div>
            )}
            
            {/* Submitted */}
            {activity.submitted_at && (
              <div className="text-xs sm:text-sm flex items-start gap-2 mt-3 pt-3 border-t">
                <span className="font-semibold text-gray-600">Submitted:</span>
                <span className="text-gray-600">{formatDate(activity.submitted_at)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}