import React, { useState } from "react";
import ArrowDown from "../assets/ArrowDown(Light).svg";

export default function NotificationCardStudent({
  title,
  description,
  date,
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
      className={`bg-white shadow-md rounded-md mt-4 border-l-4 ${
        readStatus ? "border-gray-400" : "border-[#00874E]"
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex flex-col">
          <span className="font-bold">{title}</span>
          <span className="text-xs text-gray-500">{date}</span>
          {!readStatus && (
            <span className="inline-block mt-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
              New
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {readStatus && (
            <button
              onClick={handleMarkAsUnreadClick}
              className="text-xs text-green-600 hover:text-green-800 font-medium hover:underline transition-colors"
              title="Mark as unread"
            >
              Mark Unread
            </button>
          )}
          <img
            src={ArrowDown}
            alt="Expand"
            className={`h-5 w-5 transform transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Expanded Content */}
      {open && (
        <div className="p-4 border-t border-gray-200">
          <p className="text-sm text-gray-700">{description}</p>
        </div>
      )}
    </div>
  );
}