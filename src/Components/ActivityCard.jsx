import React, { useState } from "react";
import { Link } from "react-router-dom";

import ArrowDown from "../assets/ArrowDown(Light).svg";
import Edit from "../assets/Edit(Light).svg";
import Delete from "../assets/Delete.svg";

export default function ActivityCard({
  subject,
  title,
  postedBy,
  datePosted,
  deadline,
  instructions,
  link = "#",
  onEdit,
  onDelete
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-[#fff] shadow-md rounded-md mt-5">
      {/* Header */}
      <div className="flex items-center justify-between p-5">
        <div 
          className="flex items-center gap-3 flex-1 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <span className="font-bold">{subject}:</span>
          <span>{title}</span>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-4">
          <img 
            src={Edit} 
            alt="Edit" 
            className="cursor-pointer hover:opacity-70 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              if (onEdit) onEdit();
            }}
          />
          <img 
            src={Delete} 
            alt="Delete" 
            className="cursor-pointer hover:opacity-70 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              if (onDelete) onDelete();
            }}
          />
          <img
            src={ArrowDown}
            alt="Expand"
            className={`h-6 w-6 transform transition-transform duration-300 cursor-pointer ${
              open ? "rotate-180" : ""
            }`}
            onClick={() => setOpen(!open)}
          />
        </div>
      </div>

      {/* Content */}
      {open && (
        <div className="p-5 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between">
            {/* Left side */}
            <div className="mb-3 sm:mb-0">
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-gray-600">Posted By: {postedBy}</p>
            </div>

            {/* Right side */}
            <div className="text-sm text-gray-600">
              <p>Date Posted: {datePosted}</p>
              {deadline && (
                <p className="text-[#FF6666] font-bold">Deadline: {deadline}</p>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-4">
            <p className="font-semibold">Instructions:</p>
            <p className="text-sm text-gray-700">{instructions}</p>
            {link && link !== "#" && (
              <Link
                to={link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-[#00A15D] font-semibold hover:underline"
              >
                [View Activity]
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}