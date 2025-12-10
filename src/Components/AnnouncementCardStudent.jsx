import React, { useState, useEffect } from "react";
import ArrowDown from "../assets/ArrowDown(Light).svg";

export default function AnnouncementCardStudent({
  subject,
  title,
  postedBy,
  datePosted,
  deadline,
  instructions,
  link = "#",
  isRead = false,
  onMarkAsRead,
  onMarkAsUnread
}) {
  const [open, setOpen] = useState(false);
  const [readStatus, setReadStatus] = useState(isRead);
  const [showFullInstructions, setShowFullInstructions] = useState(false);
  const [relativeTime, setRelativeTime] = useState("");

  // Function to parse and convert server timestamp to local time
  const parseServerTimestamp = (dateString) => {
    if (!dateString || dateString === "No deadline" || dateString === "N/A") return null;
    
    try {
      // If the dateString is already a valid ISO string with timezone info, use it directly
      if (dateString.includes('Z') || dateString.includes('+')) {
        return new Date(dateString);
      }
      
      // If it's a MySQL datetime format (YYYY-MM-DD HH:MM:SS), assume UTC and convert to local
      if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
        // Append 'Z' to indicate UTC, then let JavaScript convert to local time
        return new Date(dateString + 'Z');
      }
      
      // Fallback: try parsing as is
      return new Date(dateString);
    } catch {
      return null;
    }
  };

  // Function to calculate relative time with proper timezone handling
  const getRelativeTime = (dateString) => {
    if (!dateString || dateString === "No deadline" || dateString === "N/A") return "N/A";
    
    try {
      const date = parseServerTimestamp(dateString);
      if (!date || isNaN(date.getTime())) {
        return "Recently";
      }
      
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 0) {
        return "Just now";
      } else if (diffInSeconds < 60) {
        return `${diffInSeconds}s ago`;
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h ago`;
      } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d ago`;
      } else if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000);
        return `${months}mo ago`;
      } else {
        const years = Math.floor(diffInSeconds / 31536000);
        return `${years}y ago`;
      }
    } catch {
      return "Recently";
    }
  };

  // Update relative time periodically
  useEffect(() => {
    if (datePosted) {
      setRelativeTime(getRelativeTime(datePosted));
      
      // Update every minute for recent posts
      const interval = setInterval(() => {
        setRelativeTime(getRelativeTime(datePosted));
      }, 60000); // Update every minute
      
      return () => clearInterval(interval);
    }
  }, [datePosted]);

  // Format deadline for display with local timezone
  const formatDeadline = (dateString) => {
    if (!dateString || dateString === "No deadline" || dateString === "N/A") return "N/A";
    
    try {
      const date = parseServerTimestamp(dateString);
      if (!date || isNaN(date.getTime())) {
        return dateString;
      }
      
      // Format date: Month Day, Year | Time (in user's local timezone)
      const dateFormatted = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      
      // Format time: 00:00 AM/PM (in user's local timezone)
      const timeFormatted = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      return `${dateFormatted} | ${timeFormatted}`;
    } catch {
      return dateString;
    }
  };

  const handleCardClick = () => {
    if (!readStatus) {
      // Mark as read when card is opened for the first time
      setReadStatus(true);
      if (onMarkAsRead) onMarkAsRead();
    }
    setOpen(!open);
  };

  const handleMarkAsUnreadClick = (e) => {
    e.stopPropagation();
    setReadStatus(false);
    setOpen(false); // Close the card when marking as unread
    if (onMarkAsUnread) onMarkAsUnread();
  };

  // Check if instructions are long (more than 150 characters)
  const isInstructionsLong = instructions && instructions.length > 150;
  const displayInstructions = showFullInstructions 
    ? instructions 
    : (isInstructionsLong ? instructions.substring(0, 150) + '...' : instructions);

  // Format the deadline for display
  const formattedDeadline = formatDeadline(deadline);

  // Check if deadline is urgent (within 24 hours) or passed - with proper timezone handling
  const isDeadlineUrgent = (deadline) => {
    if (!deadline || deadline === "No deadline" || deadline === "N/A") return false;
    
    try {
      const deadlineDate = parseServerTimestamp(deadline);
      if (!deadlineDate || isNaN(deadlineDate.getTime())) return false;
      
      const now = new Date();
      const timeDiff = deadlineDate.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      return hoursDiff <= 24 && hoursDiff > 0; // Within 24 hours but not passed
    } catch {
      return false;
    }
  };

  // Check if deadline is passed - with proper timezone handling
  const isDeadlinePassed = (deadline) => {
    if (!deadline || deadline === "No deadline" || deadline === "N/A") return false;
    
    try {
      const deadlineDate = parseServerTimestamp(deadline);
      if (!deadlineDate || isNaN(deadlineDate.getTime())) return false;
      
      const now = new Date();
      return deadlineDate.getTime() < now.getTime();
    } catch {
      return false;
    }
  };

  return (
    <div 
      className={`rounded-lg mt-2 w-full transition-all duration-200 border border-[#FFFFFF]/10 ${
        readStatus 
          ? 'bg-[#15151C]' 
          : 'bg-[#15151C] border-l-4 border-[#00A15D]'
      } hover:bg-[#15151C]/80`}
    >
      {/* Header */}
      <div 
        className="relative p-3 cursor-pointer" 
        onClick={handleCardClick}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pr-16 sm:pr-20">
          {/* Title section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1 min-w-0 text-xs">
            <span className="font-bold text-[#FFFFFF] truncate">{subject}:</span>
            <span className="text-[#FFFFFF]/80 truncate">{title}</span>
            {!readStatus && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#00A15D]/20 text-[#00A15D]">
                New
              </span>
            )}
          </div>
        </div>

        {/* Action Icons - absolute positioned on upper right */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {readStatus && (
            <button
              onClick={handleMarkAsUnreadClick}
              className="text-[10px] text-[#767EE0] hover:text-[#767EE0]/80 font-medium hover:underline transition-colors cursor-pointer"
              title="Mark as unread"
            >
              Mark Unread
            </button>
          )}
          <img
            src={ArrowDown}
            alt="Expand"
            className={`h-4 w-4 transform transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Content */}
      {open && (
        <div className="p-3 border-t border-[#FFFFFF]/10">
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            {/* Left side */}
            <div className="mb-2 sm:mb-0">
              <p className="font-semibold text-sm text-[#FFFFFF] truncate">{title}</p>
              <p className="text-xs text-[#FFFFFF]/60">
                Posted By: {postedBy}
              </p>
            </div>

            {/* Right side */}
            <div className="text-xs text-[#FFFFFF]/60 sm:text-right">
              <p className="text-[#00A15D] font-medium">
                Date Posted: {relativeTime}
              </p>
              {deadline && deadline !== "N/A" && (
                <p className={`mt-0.5 ${isDeadlinePassed(deadline) ? 'text-[#A15353]' : isDeadlineUrgent(deadline) ? 'text-[#FFA600]' : 'text-[#FFFFFF]/60'}`}>
                  Deadline: {formattedDeadline}
                  {(isDeadlinePassed(deadline) || isDeadlineUrgent(deadline)) && (
                    <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${isDeadlinePassed(deadline) ? 'bg-[#A15353]/20 text-[#A15353]' : 'bg-[#FFA600]/20 text-[#FFA600]'}`}>
                      {isDeadlinePassed(deadline) ? 'Deadline Passed' : 'Deadline Approaching'}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Instructions with Show More/Less */}
          <div className="mt-3">
            <p className="font-semibold mb-1.5 text-xs text-[#FFFFFF]">Instructions:</p>
            <p className="text-xs text-[#FFFFFF]/80 whitespace-pre-wrap break-words">
              {displayInstructions}
            </p>
            {isInstructionsLong && (
              <button
                onClick={() => setShowFullInstructions(!showFullInstructions)}
                className="mt-1.5 text-[#767EE0] font-medium hover:underline text-[11px] cursor-pointer"
              >
                {showFullInstructions ? 'Show less' : 'Show more'}
              </button>
            )}
            {link && link !== "#" && link !== null && link !== "" && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-[#00A15D] font-semibold hover:underline text-[11px] break-all"
              >
                🔗 View Link
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}