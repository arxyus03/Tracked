import { useState } from "react";
import ArrowDown from "../assets/ArrowDown(Light).svg"; 

function AttendanceCard({ date, students }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-[#fff] rounded-md shadow-md mt-5">
      {/* ATTENDANCE CARD component*/}
      <div
        className="flex items-center justify-between p-5 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <span>
          Class Attendance for <span className="font-bold">{date}</span>
        </span>
        <img
          src={ArrowDown}
          alt="Expand"
          className={`h-6 w-6 transform transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Table */}
      {open && (
        <div className="p-5">
          <table className="table-auto w-full bg-[#fff] border-collapse text-left rounded-md overflow-hidden">
            <thead>
              <tr>
                <th className="px-4 py-2">No.</th>
                <th className="px-4 py-2">Student No.</th>
                <th className="px-4 py-2">Full Name</th>
                <th className="px-4 py-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.no} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{student.no}</td>
                  <td className="px-4 py-2">{student.studentNo}</td>
                  <td className="px-4 py-2">{student.name}</td>
                  <td
                    className={`px-4 py-2 text-right font-bold ${
                      student.status === "Present"
                        ? "text-[#00A15D]"
                        : "text-[#EF4444]"
                    }`}
                  >
                    {student.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AttendanceCard;
