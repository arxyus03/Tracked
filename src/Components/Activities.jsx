import React, { useState } from "react";
import ArrowDown from "../assets/ArrowDown(Light).svg";

export default function ActivityCard({ title, description, status, deadline, students }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-[#fff] rounded-md shadow-md p-4 mb-4 w-full mt-5">
      {/* Card Header */}
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex flex-col text-[1.125rem] max-w-[250px]">
          <span className="font-bold">{title}</span>
          <span className="">{description}</span>
        </div>

        <div className="grid grid-cols-4 text-[1.125rem] items-start">
          <p className="font-bold">Status:</p>
          <p className="truncate">{status}</p>
          <p className="font-bold text-[#EF4444]">Deadline:</p>
          <p className="truncate">{deadline}</p>
        </div>

        {/* Right: Arrow */}
        <img
          src={ArrowDown}
          alt="Expand"
          className={`h-6 w-6 transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="mt-3 pt-3 text-[1.125rem] space-y-4">
          {/* Student Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-left text-[1.125rem] font-semibold">
                  <th className="p-2">Student No.</th>
                  <th className="p-2">Student Name</th>
                  <th className="p-2 text-center">Score</th>
                  <th className="p-2 text-center text-[#00A15D]">Submitted</th>
                  <th className="p-2 text-center text-[#767EE0]">Late</th>
                  <th className="p-2 text-center text-[#EF4444]">Missed</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="p-2">{student.no}</td>
                    <td className="p-2">{student.name}</td>
                    <td className="p-2 text-center">
                      <input
                        type="number"
                        className="w-16 rounded border px-2 py-1 text-sm text-center"
                        placeholder="0"
                      />
                    </td>
                    {/* Submitted */}
                    <td className="p-2 text-center w-10">
                      <input
                        type="radio"
                        name={`status-${student.id}`}
                        className="appearance-none w-6 h-6 border-2 border-[#00A15D] rounded-md checked:bg-[#00A15D] cursor-pointer"
                      />
                    </td>
                    {/* Late */}
                    <td className="p-2 text-center w-10">
                      <input
                        type="radio"
                        name={`status-${student.id}`}
                        className="appearance-none w-6 h-6 border-2 border-[#767EE0] rounded-md checked:bg-[#767EE0] cursor-pointer"
                      />
                    </td>
                    {/* Missed */}
                    <td className="p-2 text-center w-10">
                      <input
                        type="radio"
                        name={`status-${student.id}`}
                        className="appearance-none w-6 h-6 border-2 border-[#EF4444] rounded-md checked:bg-[#EF4444] cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* EDIT, MARK ALL, SAVE Buttons */}
          <div className="flex justify-end space-x-3">
            <button className="px-4 py-2 bg-[#979797] text-[#fff] font-bold rounded-md hover:border-2 hover:border-[#007846]">
              Edit
            </button>
            <button className="px-4 py-2 bg-[#979797] text-[#fff] font-bold rounded-md hover:border-2 hover:border-[#007846]">
              Mark All Submitted
            </button>
            <button className="px-4 py-2 bg-[#00A15D] text-[#fff] font-bold rounded-md hover:border-2 hover:border-[#007846]">
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
