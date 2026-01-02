import React, { useState, useEffect } from "react";

import ArrowDown from "../../assets/ArrowDown.svg";
import Edit from "../../assets/Edit.svg";
import Delete from "../../assets/Delete.svg";

export default function AnnouncementCard(props) {
  // Destructure with defaults to prevent undefined errors
  const {
    subject = 'Unknown Subject',
    title = 'No Title',
    postedBy = 'Unknown Professor',
    datePosted = new Date().toISOString(),
    deadline = null,
    instructions = 'No instructions provided.',
    link = "#",
    section = 'Unknown Section',
    isRead = false,
    onEdit,
    onDelete,
    onMarkAsRead,
    onMarkAsUnread,
    announcementId,
    updatedAt = datePosted
  } = props;

  const [open, setOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [readStatus, setReadStatus] = useState(isRead);
  const [showFullInstructions, setShowFullInstructions] = useState(false);
  const [relativeTime, setRelativeTime] = useState("");
  const [, setFormattedPostedDate] = useState("");
  const [formattedDeadline, setFormattedDeadline] = useState("");

  // Load read status from localStorage on component mount
  useEffect(() => {
    if (announcementId) {
      const savedReadStatus = localStorage.getItem(`announcement_${announcementId}_read`);
      if (savedReadStatus !== null) {
        setReadStatus(savedReadStatus === 'true');
      }
    }
  }, [announcementId]);

  // Save read status to localStorage whenever it changes
  useEffect(() => {
    if (announcementId) {
      localStorage.setItem(`announcement_${announcementId}_read`, readStatus.toString());
    }
  }, [readStatus, announcementId]);

  // Function to properly parse date string
  const parseDate = (dateString) => {
    if (!dateString || dateString === "No deadline" || dateString === "N/A") return null;
    
    try {
      // If it's a MySQL datetime without timezone, treat it as UTC
      if (dateString && !dateString.includes('+') && !dateString.includes('Z')) {
        // Add Z to indicate UTC
        const date = new Date(dateString + 'Z');
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
      
      // Otherwise, parse normally
      return new Date(dateString);
    } catch (error) {
      console.error('Error parsing date:', error, dateString);
      return null;
    }
  };

  // Function to calculate relative time
  const getRelativeTime = (dateString) => {
    if (!dateString || dateString === "No deadline" || dateString === "N/A") return "N/A";
    
    try {
      const postedDate = parseDate(dateString);
      if (!postedDate) {
        return "Recently";
      }
      
      const now = new Date();
      const diffInSeconds = Math.floor((now - postedDate) / 1000);
      
      // Handle future dates (just in case)
      if (diffInSeconds < 0) {
        return "Just now";
      }
      
      // Calculate time differences
      if (diffInSeconds < 60) {
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

  // Format date for display in local timezone
  const formatDateForDisplay = (dateString, includeTimezone = false) => {
    if (!dateString || dateString === "No deadline" || dateString === "N/A") {
      return dateString === "No deadline" ? "No deadline" : "N/A";
    }
    
    try {
      const date = parseDate(dateString);
      if (!date) {
        return "Recently";
      }
      
      // Format for display in local timezone (which should be PHT if user is in Philippines)
      const dateFormatted = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      
      const timeFormatted = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      
      // Get timezone abbreviation
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const timeZoneAbbr = getTimezoneAbbreviation(timeZone);
      
      return includeTimezone ? 
        `${dateFormatted} at ${timeFormatted} (${timeZoneAbbr})` :
        `${dateFormatted} at ${timeFormatted}`;
    } catch {
      return dateString;
    }
  };

  // Format deadline in UTC time (exactly as stored in database)
  const formatDeadlineUTC = (dateString) => {
    if (!dateString || dateString === "No deadline" || dateString === "N/A") {
      return "No deadline";
    }
    
    try {
      const date = parseDate(dateString);
      if (!date) {
        return dateString;
      }
      
      // Format in UTC timezone
      const dateFormatted = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'
      });
      
      const timeFormatted = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'UTC'
      });
      
      // Return in 12-hour format with AM/PM
      return `${dateFormatted} at ${timeFormatted}`;
    } catch (error) {
      console.error('Error formatting UTC deadline:', error, dateString);
      return dateString;
    }
  };

  // Helper function to get timezone abbreviation
  const getTimezoneAbbreviation = (timeZone) => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone,
        timeZoneName: 'short'
      });
      const parts = formatter.formatToParts();
      const tzPart = parts.find(part => part.type === 'timeZoneName');
      return tzPart ? tzPart.value : timeZone;
    } catch {
      return timeZone;
    }
  };

  // Update relative time and formatted date
  useEffect(() => {
    if (datePosted) {
      setRelativeTime(getRelativeTime(datePosted));
      setFormattedPostedDate(formatDateForDisplay(datePosted, false));
    }
    
    if (deadline) {
      // Debug logging
      console.log('Deadline debug:', {
        rawDeadline: deadline,
        parsedDate: parseDate(deadline),
        formattedUTC: formatDeadlineUTC(deadline)
      });
      
      // Use UTC formatting for deadline
      setFormattedDeadline(formatDeadlineUTC(deadline));
    }
    
    // Update every minute for recent posts
    const interval = setInterval(() => {
      if (datePosted) {
        setRelativeTime(getRelativeTime(datePosted));
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [datePosted, deadline]);

  // Check if announcement has been edited
  const isEdited = () => {
    if (!updatedAt || !datePosted) return false;
    
    try {
      const updatedDate = parseDate(updatedAt);
      const createdDate = parseDate(datePosted);
      
      if (!updatedDate || !createdDate) {
        return false;
      }
      
      // Return true if updated_at is after created_at by more than 1 second
      return (updatedDate.getTime() - createdDate.getTime()) > 1000;
    } catch {
      return false;
    }
  };

  const edited = isEdited();

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
          <div className="flex flex-col gap-1 pr-28">
            {/* Title and subject section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 flex-1 min-w-0 text-sm">
                <span className="font-bold text-[#FFFFFF]">{subject}:</span>
                <span className="text-[#FFFFFF]/90 break-words">{title}</span>
                {section && (
                  <span className="text-xs text-[#FFFFFF]/60">({section})</span>
                )}
                {/* Show "Edited" badge when announcement has been updated */}
                {edited && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#767EE0] text-[#FFFFFF]">
                    Edited
                  </span>
                )}
                {/* Show "New" badge only when unread */}
                {!readStatus && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#00A15D] text-[#FFFFFF]">
                    New
                  </span>
                )}
              </div>
            </div>
            
            {/* Posted by and timestamp - only shown when card is CLOSED */}
            {!open && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-xs text-[#FFFFFF]/60">
                <span>{relativeTime}</span>
              </div>
            )}
          </div>

          {/* Action Icons - absolute positioned on upper right */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            {/* Only show "Mark Unread" button when announcement is read */}
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
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-[#FFFFFF]/60">Posted By: {postedBy}</p>
                </div>
                {section && (
                  <p className="text-xs text-[#FFFFFF]/60 mt-1">Section: {section}</p>
                )}
              </div>

              {/* Timestamp and deadline - shown when card is OPEN */}
              <div className="text-xs text-[#FFFFFF]/60 sm:text-right">
                <p>{relativeTime}</p>
                {deadline && deadline !== "N/A" && deadline !== "No deadline" && (
                  <p className="text-[#A15353] font-bold mt-1">
                    Deadline: {formattedDeadline}
                  </p>
                )}
              </div>
            </div>

            {/* Instructions with Show More/Less */}
            <div className="mt-4">
              <p className="font-semibold mb-1 text-sm text-[#FFFFFF]">Instructions:</p>
              {instructions ? (
                <>
                  <p className="text-xs text-[#FFFFFF]/80 whitespace-pre-wrap break-words">
                    {displayInstructions}
                  </p>
                  {isInstructionsLong && (
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