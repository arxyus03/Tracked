import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import ArrowDown from "../../assets/ArrowDown(Light).svg";
import Edit from "../../assets/Edit(Light).svg";
import Delete from "../../assets/Delete.svg";

export default function AnnouncementCard({
  subject,
  title,
  postedBy,
  datePosted,
  deadline,
  instructions,
  link = "#",
  section,
  isRead = false,
  onEdit,
  onDelete,
  onMarkAsRead,
  onMarkAsUnread
}) {
  const [open, setOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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
        month: 'long',
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

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (onDelete) onDelete();
    setShowDeleteModal(false);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
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

  return (
    <>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pr-24 sm:pr-28">
            {/* Title section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 flex-1 min-w-0 text-sm sm:text-base">
              <span className="font-bold">{subject}:</span>
              <span className="break-words">{title}</span>
              {section && (
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
              src={Edit} 
              alt="Edit" 
              className="cursor-pointer hover:opacity-70 transition-opacity w-5 h-5 sm:w-6 sm:h-6"
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit();
              }}
            />
            <img 
              src={Delete} 
              alt="Delete" 
              className="cursor-pointer hover:opacity-70 transition-opacity w-5 h-5 sm:w-6 sm:h-6"
              onClick={handleDeleteClick}
            />
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
                {section && (
                  <p className="text-xs sm:text-sm text-gray-600">Section: {section}</p>
                )}
              </div>

              {/* Right side */}
              <div className="text-xs sm:text-sm text-gray-600 sm:text-right">
                <p>Date Posted: {relativeTime}</p>
                {deadline && deadline !== "N/A" && (
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              cancelDelete();
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <img 
                  src={Delete} 
                  alt="Delete" 
                  className="h-8 w-8"
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Delete Announcement?
              </h3>
              
              <div className="mt-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">
                  Are you sure you want to delete this announcement?
                </p>
                <p className="text-sm font-semibold text-red-600 mb-3">
                  This action cannot be undone.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <p className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                    {title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Subject: {subject}
                  </p>
                  {section && (
                    <p className="text-sm text-gray-600">
                      Section: {section}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .overlay-fade { animation: overlayFade .18s ease-out both; }
        @keyframes overlayFade { from { opacity: 0 } to { opacity: 1 } }

        .modal-pop {
          transform-origin: top center;
          animation: popIn .22s cubic-bezier(.2,.8,.2,1) both;
        }
        @keyframes popIn {
          from { opacity: 0; transform: translateY(-8px) scale(.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </>
  );
}