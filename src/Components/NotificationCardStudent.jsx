import React, { useState } from "react";
import ArrowDown from "../assets/ArrowDown(Light).svg";
import Delete from "../assets/Delete.svg";

export default function NotificationCard({
  title,
  description,
  date,
  isRead = false,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`bg-white shadow-md rounded-md mt-4 border-l-4 ${
        isRead ? "border-gray-400" : "border-[#00874E]"
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-col">
          <span className="font-bold">{title}</span>
          <span className="text-xs text-gray-500">{date}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <img src={Delete} alt="Delete" className="h-5 w-5" />
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