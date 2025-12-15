import React, { useState, useEffect } from "react";

import ArrowDown from "../../assets/ArrowDown.svg";
import Edit from "../../assets/Edit.svg";
import Delete from "../../assets/Delete.svg";

export default function AnnouncementCard({
  subject,
  title,
  postedBy,
  datePosted,
  deadline,
  description,  // Changed from "instructions" to "description"
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

  // Check if description are long (more than 150 characters)
  const isDescriptionLong = description && description.length > 150;
  const displayDescription = showFullInstructions 
    ? description 
    : (isDescriptionLong ? description.substring(0, 150) + '...' : description);

  // Format the deadline for display
  const formattedDeadline = formatDeadline(deadline);

  return (
    <>
      <div 
        className={`shadow-md rounded-md mt-3 w-full transition-all duration-200 ${
          readStatus 
            ? 'bg-[#15151C]' 
            : 'bg-[#00A15D]/10 border-l-4 border-[#00A15D]'
        } hover:shadow-lg hover:border-[#767EE0] hover:border-1`}
      >
        {/* Header */}
        <div 
          className="relative p-3 cursor-pointer" 
          onClick={handleCardClick}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pr-24">
            {/* Title section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 flex-1 min-w-0 text-sm">
              <span className="font-bold text-[#FFFFFF]">{subject}:</span>
              <span className="text-[#FFFFFF]/90 break-words">{title}</span>
              {section && (
                <span className="text-xs text-[#FFFFFF]/60">({section})</span>
              )}
              {!readStatus && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#00A15D] text-[#FFFFFF]">
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
                className="text-xs text-[#00A15D] hover:text-[#00874E] font-medium hover:underline transition-colors cursor-pointer"
                title="Mark as unread"
              >
                Mark Unread
              </button>
            )}
            <img 
              src={Edit} 
              alt="Edit" 
              className="cursor-pointer hover:opacity-70 transition-opacity w-4 h-4 brightness-0 invert"
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) onEdit();
              }}
            />
            <img 
              src={Delete} 
              alt="Delete" 
              className="cursor-pointer hover:opacity-70 transition-opacity w-4 h-4 brightness-0 invert"
              onClick={handleDeleteClick}
            />
            <img
              src={ArrowDown}
              alt="Expand"
              className={`h-4 w-4 transform transition-transform duration-300 brightness-0 invert ${
                open ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {/* Content - Only visible when expanded */}
        {open && (
          <div className="p-3 border-t border-[#FFFFFF]/10">
            <div className="flex flex-col sm:flex-row justify-between gap-2 mb-3">
              <div className="mb-2 sm:mb-0">
                <p className="font-semibold text-base text-[#FFFFFF]">{title}</p>
                <p className="text-xs text-[#FFFFFF]/60">Posted By: {postedBy}</p>
                {section && (
                  <p className="text-xs text-[#FFFFFF]/60">Section: {section}</p>
                )}
              </div>

              <div className="text-xs text-[#FFFFFF]/60 sm:text-right">
                <p>Date Posted: {relativeTime}</p>
                {deadline && deadline !== "N/A" && (
                  <p className="text-[#A15353] font-bold mt-1">
                    Deadline: {formattedDeadline}
                  </p>
                )}
              </div>
            </div>

            {/* Description/Instructions with Show More/Less */}
            <div className="mt-4">
              <p className="font-semibold mb-1 text-sm text-[#FFFFFF]">Instructions:</p>
              {description ? (
                <>
                  <p className="text-xs text-[#FFFFFF]/80 whitespace-pre-wrap break-words">
                    {displayDescription}
                  </p>
                  {isDescriptionLong && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowFullInstructions(!showFullInstructions);
                      }}
                      className="mt-1 text-[#00A15D] font-medium hover:underline text-xs cursor-pointer"
                    >
                      {showFullInstructions ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-xs text-[#FFFFFF]/60 italic">No instructions provided.</p>
              )}
              {link && link !== "#" && link !== null && link !== "" && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-[#767EE0] font-semibold hover:underline text-xs break-all"
                  onClick={(e) => e.stopPropagation()}
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
          <div className="bg-[#15151C] text-[#FFFFFF] rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-4 sm:p-6 relative modal-pop">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#A15353]/20 mb-3">
                <img 
                  src={Delete} 
                  alt="Delete" 
                  className="h-6 w-6"
                />
              </div>

              <h3 className="text-lg sm:text-xl font-bold mb-2">
                Delete Announcement?
              </h3>
              
              <div className="mt-3 mb-4">
                <p className="text-xs sm:text-sm text-[#FFFFFF]/70 mb-1">
                  Are you sure you want to delete this announcement?
                </p>
                <p className="text-xs sm:text-sm font-semibold text-[#A15353] mb-2">
                  This action cannot be undone.
                </p>
                <div className="bg-[#23232C] rounded-lg p-3 text-left">
                  <p className="text-sm sm:text-base font-semibold break-words">
                    {title}
                  </p>
                  <p className="text-xs text-[#FFFFFF]/70 mt-1">
                    Subject: {subject}
                  </p>
                  {section && (
                    <p className="text-xs text-[#FFFFFF]/70">
                      Section: {section}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={cancelDelete}
                  className="flex-1 bg-[#23232C] hover:bg-[#2A2A35] text-[#FFFFFF] font-bold py-2 rounded-md transition-all duration-200 cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-[#A15353] hover:bg-[#8A4545] text-[#FFFFFF] font-bold py-2 rounded-md transition-all duration-200 cursor-pointer text-sm"
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