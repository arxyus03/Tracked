import React, { useState } from "react";
import { Link } from "react-router-dom";

import ArrowDown from "../assets/ArrowDown(Light).svg";
import Edit from "../assets/Edit(Light).svg";
import Delete from "../assets/Delete.svg";

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
                  {section && section !== "All" && (
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