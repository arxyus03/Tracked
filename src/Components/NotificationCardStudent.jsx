import React, { useState } from "react";
import { Link } from "react-router-dom";

import ArrowDown from "../assets/ArrowDown(Light).svg";

export default function NotificationCardStudent({
  subject,
  title,
  postedBy,
  datePosted,
  deadline,
  instructions,
  link = "#",
  section,
  isRead = false,
  onMarkAsRead,
  onMarkAsUnread
}) {
  const [open, setOpen] = useState(false);
  const [readStatus, setReadStatus] = useState(isRead);

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
    if (onMarkAsUnread) onMarkAsUnread();
  };

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pr-16 sm:pr-20">
          {/* Title section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-1 min-w-0 text-sm sm:text-base">
            <span className="font-bold">{subject}:</span>
            <span className="break-words">{title}</span>
            {section && section !== "All" && (
              <span className="text-xs sm:text-sm text-gray-600">({section})</span>
            )}
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
              <p className="text-xs sm:text-sm text-gray-600">Posted By: {postedBy}</p>
              {section && section !== "All" && (
                <p className="text-xs sm:text-sm text-gray-600">Section: {section}</p>
              )}
            </div>

            {/* Right side */}
            <div className="text-xs sm:text-sm text-gray-600 sm:text-right">
              <p>Date Posted: {datePosted}</p>
              {deadline && (
                <p className="text-[#FF6666] font-bold mt-1">
                  Deadline: {deadline}
                </p>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-4">
            <p className="font-semibold mb-2 text-sm sm:text-base">Instructions:</p>
            <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap break-words">
              {instructions}
            </p>
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