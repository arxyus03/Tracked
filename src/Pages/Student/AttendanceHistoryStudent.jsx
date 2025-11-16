import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import Analytics from "../../assets/Analytics(Light).svg";
import UserIcon from "../../assets/UserIcon(Light).svg";
import BackButton from "../../assets/BackButton(Light).svg";

export default function AttendanceHistoryStudent() {
  const [isOpen, setIsOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState('');
  const location = useLocation();
  
  const subject = location.state?.subject || '';
  const subjectName = location.state?.subjectName || 'Current Subject';

  // Get student ID from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setStudentId(user.id || '');
      } catch (error) {
        setStudentId('');
      }
    } else {
      setStudentId('');
    }
  }, []);

  // Fetch attendance data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!studentId || !subject) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const attendanceUrl = `https://tracked.6minds.site/Student/StudentDB/get_attendance_history_student.php?student_id=${studentId}&subject_code=${subject}`;
        const response = await fetch(attendanceUrl);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setAttendanceData(data);
          }
        }
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [studentId, subject]);

  if (loading) {
    return (
      <div>
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Jane Doe" />
          <div className="p-8 text-center">
            <p className="text-gray-500">Loading attendance data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!attendanceData) {
    return (
      <div>
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Jane Doe" />
          <div className="p-8 text-center">
            <p className="text-red-500">Error loading attendance data.</p>
            <Link to="/AnalyticsStudent" className="text-blue-500 hover:underline">
              Go back to Analytics
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const student = attendanceData.student || { 
    id: studentId, 
    name: "Student Name" 
  };

  const attendance = attendanceData.attendance_summary || {
    present: 0,
    late: 0,
    absent: 0,
    total: 0
  };

  const attendanceDates = attendanceData.attendance_dates || {
    absent: [],
    late: []
  };

  // Find the maximum length to determine how many rows to show
  const maxRows = Math.max(attendanceDates.absent.length, attendanceDates.late.length);

  return (
    <div>
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div
        className={`
          transition-all duration-300
          ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
        `}
      >
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Jane Doe" />

        {/* PAGE CONTENT */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8 text-[#465746]">
          {/* HEADER */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img 
                src={Analytics} 
                alt="Analytics" 
                className="h-6 w-6 sm:h-7 sm:w-7 mr-3" 
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl">
                Analytics
              </h1>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <p className="text-sm sm:text-base lg:text-lg">
              Class Attendance Details - {subjectName}
            </p>
            <Link to="/AnalyticsStudent" className="">
              <img 
                src={BackButton} 
                alt="BackButton" 
                className="h-5 w-5 sm:h-6 sm:w-6 hover:opacity-70 cursor-pointer" 
              />
            </Link>
          </div>

          <hr className="border-[#465746]/30 mb-4 sm:mb-5" />

          {/* STUDENT INFO */}
          <div className="flex items-center bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mb-4 sm:mb-5 gap-3 sm:gap-4">
            <img 
              src={UserIcon} 
              alt="User" 
              className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" 
            />
            <div>
              <p className="text-xs sm:text-sm lg:text-base">
                Student No: {student.id}
              </p>
              <p className="font-bold text-base sm:text-lg lg:text-xl">
                {student.name}
              </p>
            </div>
          </div>

          {/* ATTENDANCE DATES */}
          <div className="bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mb-4 sm:mb-5">
            <p className="font-bold text-[#00874E] mb-3 text-base sm:text-lg lg:text-xl">
              Attendance Details
            </p>
            <hr className="border-[#465746]/30 mb-3 sm:mb-4" />

            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                <div className="overflow-hidden rounded-lg border border-gray-300">
                  <table className="min-w-full text-left border-collapse text-xs sm:text-sm lg:text-base">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-2 sm:p-3 font-bold">Date Absent</th>
                        <th className="p-2 sm:p-3 font-bold">Date Late</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maxRows > 0 ? (
                        Array.from({ length: maxRows }).map((_, index) => (
                          <tr key={index} className="hover:bg-gray-50 border-b border-gray-200 last:border-0">
                            <td className="p-2 sm:p-3">
                              {attendanceDates.absent[index] || "—"}
                            </td>
                            <td className="p-2 sm:p-3">
                              {attendanceDates.late[index] || "—"}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" className="p-2 sm:p-3 text-center text-gray-500">
                            No attendance records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* TOTALS */}
          <div className="bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mb-6 sm:mb-8 lg:mb-10">
            <p className="font-bold mb-3 sm:mb-4 text-base sm:text-lg lg:text-xl">
              Attendance Summary
            </p>
            <hr className="border-[#465746]/30 mb-3 sm:mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center text-xs sm:text-sm lg:text-base">
              <div className="p-2 sm:p-3 bg-gray-50 rounded-md">
                <p className="font-semibold text-green-600 mb-1 sm:mb-2">Present</p>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {attendance.present}
                </span>
              </div>
              <div className="p-2 sm:p-3 bg-gray-50 rounded-md">
                <p className="font-semibold text-[#767EE0] mb-1 sm:mb-2">Late</p>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {attendance.late}
                </span>
              </div>
              <div className="p-2 sm:p-3 bg-gray-50 rounded-md">
                <p className="font-semibold text-red-500 mb-1 sm:mb-2">Absent</p>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {attendance.absent}
                </span>
              </div>
              <div className="p-2 sm:p-3 bg-gray-50 rounded-md">
                <p className="font-semibold text-gray-700 mb-1 sm:mb-2">Total Days</p>
                <span className="text-lg sm:text-xl lg:text-2xl font-bold">
                  {attendance.total}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}