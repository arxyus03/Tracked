import React, { useState } from "react";

import ArrowDown from "../assets/ArrowDown(Light).svg";

export default function AnnouncementCardStudent({
  subject,
  title,
  postedBy,
  datePosted, // This should now be a UTC timestamp from backend
  deadline, // This should now be a UTC timestamp from backend
  instructions,
  link = "#",
  isRead = false,
  onMarkAsRead,
  onMarkAsUnread
}) {
  const [open, setOpen] = useState(false);
  const [readStatus, setReadStatus] = useState(isRead);
  const [showFullInstructions, setShowFullInstructions] = useState(false);

  // Format dates for display in local timezone
  const formattedDatePosted = formatLocalDateTime(datePosted);
  const formattedDeadline = deadline ? formatLocalDateTime(deadline) : null;

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

  // Format UTC timestamp to local timezone for display
  const formatLocalDateTime = (dateString) => {
    if (!dateString) return "No date";
    try {
      const date = new Date(dateString);
      const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      return `${formattedDate} | ${formattedTime}`;
    } catch (error) {
      console.error('Error formatting datetime:', dateString, error);
      return "Invalid date";
    }
  };

  // Check if instructions are long (more than 150 characters)
  const isInstructionsLong = instructions && instructions.length > 150;
  const displayInstructions = showFullInstructions 
    ? instructions 
    : (isInstructionsLong ? instructions.substring(0, 150) + '...' : instructions);

  return (
    <div 
      className={`shadow-md rounded-md mt-5 w-full transition-all duration-200 ${
        readStatus 
          ? 'bg-white' 
          : 'bg-green-50 border-l-4 border-green-500'
      } hover:shadow-lg`}
    >
      {/* Header */}
      <div 
        className="relative p-3 sm:p-5 cursor-pointer" 
        onClick={handleCardClick}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pr-20 sm:pr-24">
          {/* Title section - Removed section from header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-1 min-w-0 text-sm sm:text-base">
            <span className="font-bold">{subject}:</span>
            <span className="break-words">{title}</span>
            {/* Removed section display from header */}
            {!readStatus && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                New
              </span>
            )}
          </div>
        </div>

        {/* Action Icons - absolute positioned on upper right */}
        <div className="absolute top-3 sm:top-5 right-3 sm:right-5 flex items-center gap-2 sm:gap-4">
          {readStatus && (
            <button
              onClick={handleMarkAsUnreadClick}
              className="text-xs text-green-600 hover:text-green-800 font-medium hover:underline transition-colors cursor-pointer"
              title="Mark as unread"
            >
              Mark Unread
            </button>
          )}
          <img
            src={ArrowDown}
            alt="Expand"
            className={`h-5 w-5 sm:h-6 sm:w-6 transform transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Content */}
      {open && (
        <div className="p-3 sm:p-5 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            {/* Left side */}
            <div className="mb-3 sm:mb-0">
              <p className="font-semibold text-base sm:text-lg">{title}</p>
              {/* Posted By now comes formatted from backend */}
              <p className="text-xs sm:text-sm text-gray-600">
                Posted By: {postedBy}
              </p>
              {/* Removed section display inside card */}
            </div>

            {/* Right side */}
            <div className="text-xs sm:text-sm text-gray-600 sm:text-right">
              {/* Date Posted in green - Now in local timezone */}
              <p className="text-green-600 font-medium">
                Date Posted: {formattedDatePosted}
              </p>
              {formattedDeadline && (
                <p className="text-[#FF6666] font-bold mt-1">
                  Deadline: {formattedDeadline}
                </p>
              )}
            </div>
          </div>

          {/* Instructions with Show More/Less */}
          <div className="mt-4">
            <p className="font-semibold mb-2 text-sm sm:text-base">Instructions:</p>
            <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap break-words">
              {displayInstructions}
            </p>
            {isInstructionsLong && (
              <button
                onClick={() => setShowFullInstructions(!showFullInstructions)}
                className="mt-2 text-[#00A15D] font-medium hover:underline text-xs sm:text-sm cursor-pointer"
              >
                {showFullInstructions ? 'Show less' : 'Show more'}
              </button>
            )}
            {link && link !== "#" && link !== null && link !== "" && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block text-[#00A15D] font-semibold hover:underline text-xs sm:text-sm break-all"
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