import React, { useState } from "react";
import ArrowDown from "../assets/ArrowDown(Light).svg";

export default function ActivityCardStudent({ activity, formatDate }) {
  const [open, setOpen] = useState(false);

  const isSubmitted = activity.submitted === 1 || activity.submitted === true;
  const isLate = activity.late === 1 || activity.late === true;

  // Check if deadline is overdue and not submitted
  const isOverdue = activity.deadline && new Date(activity.deadline) < new Date() && !isSubmitted;
  
  // Check if activity is pending (not submitted and deadline not passed)
  const isPending = !isSubmitted && !isOverdue;

  // Get status text based on submission status
  const getStatusText = () => {
    if (isSubmitted && isLate) return "Late";
    if (isSubmitted) return "Submitted";
    if (isOverdue) return "Missed";
    return "Pending"; // Added Pending status
  };

  const getStatusColor = () => {
    if (isSubmitted && isLate) return "text-[#767EE0]";
    if (isSubmitted) return "text-[#00A15D]";
    if (isOverdue) return "text-[#EF4444]";
    return "text-[#3B82F6]"; // Blue color for Pending
  };

  return (
    <div className="bg-white rounded-md shadow-md p-3 sm:p-4 mb-4 w-full mt-5 border-2 border-transparent hover:border-[#00874E] transition-all duration-200">
      {/* Card Header */}
      <div className="relative cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pr-10">
          
          {/* Title and details section */}
          <div className="flex flex-col text-sm sm:text-base lg:text-[1.125rem] flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-bold text-base sm:text-lg break-words">{activity.title}</span>
              {/* Show (Edited) indicator for students */}
              {activity.is_edited === 1 && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold self-start sm:self-center whitespace-nowrap">
                  (Edited)
                </span>
              )}
            </div>
            
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
                    <span className={`text-xs sm:text-sm font-semibold whitespace-nowrap ${
                      isOverdue ? 'text-[#EF4444]' : 
                      isPending ? 'text-[#3B82F6]' : 
                      'text-[#465746]'
                    }`}>
                      Deadline:
                    </span>
                    <span className={`text-xs sm:text-sm ${
                      isOverdue ? 'text-[#EF4444] font-semibold' : 
                      isPending ? 'text-[#3B82F6]' : 
                      'text-[#465746]'
                    }`}>
                      {formatDate(activity.deadline)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status section - UPDATED to include "Pending" status */}
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
            
            {/* Grade (if available) */}
            {activity.grade !== null && activity.grade !== undefined && (
              <div className="text-xs sm:text-sm flex items-start gap-2">
                <span className="font-semibold text-[#465746] whitespace-nowrap">Grade:</span>
                <span className="text-[#465746]">{activity.grade} / {activity.points || 'N/A'}</span>
              </div>
            )}
            
            {/* Status Explanation */}
            <div className="text-xs sm:text-sm flex items-start gap-2 mt-2 p-2 bg-gray-50 rounded-md">
              <span className="font-semibold text-gray-600">Status Help:</span>
              <span className="text-gray-600">
                {getStatusText() === "Pending" && "This activity is awaiting your submission before the deadline."}
                {getStatusText() === "Submitted" && "You have successfully submitted this activity."}
                {getStatusText() === "Late" && "You submitted this activity after the deadline."}
                {getStatusText() === "Missed" && "You missed the deadline for this activity."}
              </span>
            </div>
            
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