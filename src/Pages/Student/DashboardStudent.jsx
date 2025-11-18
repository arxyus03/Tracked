import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import Dashboard from '../../assets/DashboardProf(Light).svg';
import ClassHandled from '../../assets/ClassHandled.svg';
import ActivitiesToGrade from '../../assets/ActivitiesToGrade.svg';
import ID from '../../assets/ID(Light).svg';
import Pie from '../../assets/Pie(Light).svg';
import Details from '../../assets/Details(Light).svg';
import Archive from '../../assets/Archive(Light).svg';
import ArrowDown from '../../assets/ArrowDown(Light).svg';
import CompletedActivities from '../../assets/CompletedActivities.svg';
import PendingTask from '../../assets/PendingTask.svg';
import TotalDaySpent from '../../assets/TotalDaySpent.svg';
import OverallSubmitted from '../../assets/OverallSubmitted.svg';
import OverallDaysAbsent from '../../assets/OverallDaysAbsent.svg';
import OverallMissed from '../../assets/OverallMissed.svg';

export default function DashboardStudent() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("Student");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [studentCourse, setStudentCourse] = useState("");
  const [studentYearLevel, setStudentYearLevel] = useState("");
  
  // Widget states
  const [completedActivities, setCompletedActivities] = useState(0);
  const [overallSubmitted, setOverallSubmitted] = useState(0);
  const [overallDaysAbsent, setOverallDaysAbsent] = useState(0);
  const [pendingTask, setPendingTask] = useState(0);
  const [totalDaysPresent, setTotalDaysPresent] = useState(0);
  const [overallMissed, setOverallMissed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage and fetch from database
    const fetchUserData = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          
          // Get user ID from localStorage
          const userIdFromStorage = user.id;
          
          if (userIdFromStorage) {
            setUserId(userIdFromStorage);
            
            // Fetch complete user data from database
            const response = await fetch(`https://tracked.6minds.site/Student/DashboardStudentDB/get_student_info.php?id=${userIdFromStorage}`);
            
            if (response.ok) {
              const data = await response.json();
              
              if (data.success) {
                // Set username from database
                const fullName = `${data.user.tracked_firstname} ${data.user.tracked_lastname}`;
                setUserName(fullName || "N/A");
                
                // Set email from database
                setUserEmail(data.user.tracked_email || "N/A");
                
                // Set course and year level
                setStudentCourse(data.user.tracked_program || "N/A");
                
                // Extract year level from yearandsec (e.g., "4D" -> "4th Year")
                if (data.user.tracked_yearandsec) {
                  // Extract the first character (the year number)
                  const yearChar = data.user.tracked_yearandsec.charAt(0);
                  const yearNum = parseInt(yearChar);
                  
                  if (!isNaN(yearNum)) {
                    const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
                    // Use yearNum - 1 to get the correct index, or default to the number itself
                    setStudentYearLevel(yearLevels[yearNum - 1] || `${yearNum}th Year`);
                  } else {
                    // If parsing fails, use the original value
                    setStudentYearLevel(data.user.tracked_yearandsec);
                  }
                } else {
                  setStudentYearLevel("N/A");
                }

                // Fetch dashboard data for widgets
                await fetchDashboardData(userIdFromStorage);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const fetchDashboardData = async (studentId) => {
    try {
      setLoading(true);
      const response = await fetch(`https://tracked.6minds.site/Student/DashboardStudentDB/get_dashboard_data.php?student_id=${studentId}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setCompletedActivities(data.completed_activities || 0);
          setOverallSubmitted(data.overall_submitted || 0);
          setOverallDaysAbsent(data.overall_days_absent || 0);
          setPendingTask(data.pending_task || 0);
          setTotalDaysPresent(data.total_days_present || 0);
          setOverallMissed(data.overall_missed || 0);
        }
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`
          transition-all duration-300
          ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
        `}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} userName={userName} />
          <div className="p-8 flex justify-center items-center h-64">
            <div className="text-[#465746] text-lg">Loading dashboard data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName={userName} />

        {/* Dashboard content */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8 text-[#465746]">
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img src={Dashboard} alt="Dashboard" className="h-6 w-6 sm:h-7 sm:w-7 mr-3" />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl">Dashboard</h1>
            </div>
            <div className='flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0'>
              <div className="text-sm sm:text-base lg:text-lg">
                <span>Hi</span>
                <span className="font-bold ml-1 mr-1">{userName}!</span>
                <span>Ready to check your progress.</span>
              </div>
              <div className="flex items-center text-sm sm:text-base lg:text-lg self-end sm:self-auto">
                <span>2nd Semester 2024 - 2025</span>
                <img src={ArrowDown} alt="ArrowDown" className="h-5 w-5 sm:h-6 sm:w-6 ml-2" />
              </div>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* WIDGETS */}
          <div className='flex justify-center items-center mt-5'>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4 lg:gap-6 w-full max-w-7xl'>

              {/* Completed Activities Widget */}
              <div className='bg-[#fff] h-32 sm:h-40 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-md'> 
                <div className='font-bold text-sm sm:text-base lg:text-[1.5rem] h-full flex flex-col'>
                  <h1 className='mb-2'>Completed Activities</h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#81ebbd] h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#449844]'>
                      <img src={CompletedActivities} alt="CompletedActivities" className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12"/>
                    </div>
                    <p className='pt-2 sm:pt-6 lg:pt-8 text-lg sm:text-xl lg:text-[2rem]'>
                      {completedActivities}
                    </p>
                  </div>
                </div>
              </div>

              {/* Overall Submitted Widget */}
              <div className='bg-[#fff] h-32 sm:h-40 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-md'> 
                <div className='font-bold text-sm sm:text-base lg:text-[1.5rem] h-full flex flex-col'>
                  <h1 className='mb-2'>Overall Submitted</h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#81ebbd] h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#449844]'>
                      <img src={OverallSubmitted} alt="OverallSubmitted" className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12"/>
                    </div>
                    <p className='pt-2 sm:pt-6 lg:pt-8 text-lg sm:text-xl lg:text-[2rem]'>
                      {overallSubmitted}
                    </p>
                  </div>
                </div>
              </div>

              {/* Overall Days Absent Widget */}
              <div className='bg-[#fff] h-32 sm:h-40 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-md'> 
                <div className='font-bold text-sm sm:text-base lg:text-[1.5rem] h-full flex flex-col'>
                  <h1 className='mb-2'>Overall Days Absent</h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#ffb1b1] h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#FF6666]'>
                      <img src={OverallDaysAbsent} alt="OverallDaysAbsent" className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12"/>
                    </div>
                    <p className='pt-2 sm:pt-6 lg:pt-8 text-lg sm:text-xl lg:text-[2rem]'>
                      {overallDaysAbsent}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pending Task Widget */}
              <div className='bg-[#fff] h-32 sm:h-40 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-md'> 
                <div className='font-bold text-sm sm:text-base lg:text-[1.5rem] h-full flex flex-col'>
                  <h1 className='mb-2'>Pending Task</h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#a7aef9] h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#4951AA]'>
                      <img src={PendingTask} alt="PendingTask" className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12"/>
                    </div>
                    <p className='pt-2 sm:pt-6 lg:pt-8 text-lg sm:text-xl lg:text-[2rem]'>
                      {pendingTask}
                    </p>
                  </div>
                </div>
              </div>

              {/* Total Days Present Widget */}
              <div className='bg-[#fff] h-32 sm:h-40 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-md'> 
                <div className='font-bold text-sm sm:text-base lg:text-[1.5rem] h-full flex flex-col'>
                  <h1 className='mb-2'>Total of Days Present</h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#81ebbd] h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#449844]'>
                      <img src={TotalDaySpent} alt="TotalDaySpent" className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12"/>
                    </div>
                    <p className='pt-2 sm:pt-6 lg:pt-8 text-lg sm:text-xl lg:text-[2rem]'>
                      {totalDaysPresent}
                    </p>
                  </div>
                </div>
              </div>

              {/* Overall Missed Widget */}
              <div className='bg-[#fff] h-32 sm:h-40 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 shadow-md'> 
                <div className='font-bold text-sm sm:text-base lg:text-[1.5rem] h-full flex flex-col'>
                  <h1 className='mb-2'>Overall Missed</h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#ffb1b1] h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#FF6666]'>
                      <img src={OverallMissed} alt="OverallMissed" className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12"/>
                    </div>
                    <p className='pt-2 sm:pt-6 lg:pt-8 text-lg sm:text-xl lg:text-[2rem]'>
                      {overallMissed}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Student Info */}
          <div className="bg-[#FFFFFF] rounded-lg sm:rounded-xl shadow-md mt-5 p-4 sm:p-5 text-sm sm:text-base lg:text-[1.125rem]">
            <div className="flex items-center">
              <img src={ID} alt="ID" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
              <p className="font-bold text-sm sm:text-base lg:text-[1.125rem]">{userName}</p>
            </div>

            <hr className="opacity-60 border-[#465746] rounded border-1 my-2 sm:my-3" />

            <div className="pl-4 sm:pl-8 space-y-1 sm:space-y-2">
              <div className="flex flex-col sm:flex-row">
                <span className="font-bold text-xs sm:text-sm lg:text-base w-full sm:w-40 mb-1 sm:mb-0">Student ID:</span>
                <span className="text-xs sm:text-sm lg:text-base">{userId || "Loading..."}</span>
              </div>
              <div className="flex flex-col sm:flex-row">
                <span className="font-bold text-xs sm:text-sm lg:text-base w-full sm:w-40 mb-1 sm:mb-0">Email:</span>
                <span className="text-xs sm:text-sm lg:text-base break-all sm:break-normal">{userEmail || "Loading..."}</span>
              </div>
              <div className="flex flex-col sm:flex-row">
                <span className="font-bold text-xs sm:text-sm lg:text-base w-full sm:w-40 mb-1 sm:mb-0">Course:</span>
                <span className="text-xs sm:text-sm lg:text-base">{studentCourse || "Loading..."}</span>
              </div>
              <div className="flex flex-col sm:flex-row">
                <span className="font-bold text-xs sm:text-sm lg:text-base w-full sm:w-40 mb-1 sm:mb-0">Year Level:</span>
                <span className="text-xs sm:text-sm lg:text-base">{studentYearLevel || "Loading..."}</span>
              </div>
            </div>
          </div>

          {/* Warning Links */}
          <Link to={"/AnalyticsStudent"}>
            <div className="bg-[#FFFFFF] rounded-lg sm:rounded-xl shadow-md mt-5 p-3 sm:p-4 text-sm sm:text-base lg:text-[1.125rem] border-2 border-transparent hover:border-[#00874E] transition-all duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                <p className="font-bold text-xs sm:text-sm lg:text-base text-[#FF6666] sm:flex-1">WARNING:</p>
                <p className="font-bold text-xs sm:text-sm lg:text-base sm:flex-1">You have a missing activity in GNED09</p>
                <img src={Details} alt="Details" className="h-6 w-6 sm:h-8 sm:w-8 self-end sm:self-auto"/>
              </div>
            </div>
          </Link>

          <Link to={"/AnalyticsStudent"}>
            <div className="bg-[#FFFFFF] rounded-lg sm:rounded-xl shadow-md mt-5 p-3 sm:p-4 text-sm sm:text-base lg:text-[1.125rem] border-2 border-transparent hover:border-[#00874E] transition-all duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                <p className="font-bold text-xs sm:text-sm lg:text-base text-[#FF6666] sm:flex-1">WARNING:</p>
                <p className="font-bold text-xs sm:text-sm lg:text-base sm:flex-1">You have a total of 1 Absent in GNED09</p>
                <img src={Details} alt="Details" className="h-6 w-6 sm:h-8 sm:w-8 self-end sm:self-auto"/>
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  )
}