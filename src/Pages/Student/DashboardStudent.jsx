import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import Dashboard from '../../assets/DashboardProf(Light).svg';
import SubjectPerformance from '../../assets/SubjectPerformance.svg';
import RecentActivity from '../../assets/RecentActivity.svg';
import ID from '../../assets/ID(Light).svg';
import Pie from '../../assets/Pie(Light).svg';
import Details from '../../assets/Details(Light).svg';
import ArrowDown from '../../assets/ArrowDown(Light).svg';
import CompletedActivities from '../../assets/CompletedActivities.svg';
import PendingTask from '../../assets/PendingTask.svg';
import TotalDaySpent from '../../assets/TotalDaySpent.svg';
import OverallSubmitted from '../../assets/OverallSubmitted.svg';
import OverallDaysAbsent from '../../assets/OverallDaysAbsent.svg';
import OverallMissed from '../../assets/OverallMissed.svg';
import TrendingUp from "../../assets/TrendingUp.svg";
import TrendingDown from "../../assets/TrendingDown.svg";
import AlertTriangleGreen from "../../assets/Warning(Green).svg";
import AlertTriangleYellow from "../../assets/Warning(Yellow).svg";
import AlertTriangleRed from "../../assets/Warning(Red).svg";

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

  // NEW: Analytics states
  const [performanceScore, setPerformanceScore] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [submissionRate, setSubmissionRate] = useState(0);
  const [riskLevel, setRiskLevel] = useState("LOW");
  const [recentActivities, setRecentActivities] = useState([]);
  const [performanceTrend, setPerformanceTrend] = useState("stable");
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkScreenSize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          const userIdFromStorage = user.id;
          
          if (userIdFromStorage) {
            setUserId(userIdFromStorage);
            
            const response = await fetch(`https://tracked.6minds.site/Student/DashboardStudentDB/get_student_info.php?id=${userIdFromStorage}`);
            
            if (response.ok) {
              const data = await response.json();
              
              if (data.success) {
                const fullName = `${data.user.tracked_firstname} ${data.user.tracked_lastname}`;
                setUserName(fullName || "N/A");
                setUserEmail(data.user.tracked_email || "N/A");
                setStudentCourse(data.user.tracked_program || "N/A");
                
                if (data.user.tracked_yearandsec) {
                  const yearChar = data.user.tracked_yearandsec.charAt(0);
                  const yearNum = parseInt(yearChar);
                  
                  if (!isNaN(yearNum)) {
                    const yearLevels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
                    setStudentYearLevel(yearLevels[yearNum - 1] || `${yearNum}th Year`);
                  } else {
                    setStudentYearLevel(data.user.tracked_yearandsec);
                  }
                } else {
                  setStudentYearLevel("N/A");
                }

                await fetchDashboardData(userIdFromStorage);
                await fetchAttendanceData(userIdFromStorage); // NEW: Fetch attendance data
                await fetchAnalyticsData(userIdFromStorage); // NEW: Fetch analytics
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data");
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
      setError("Failed to load dashboard data");
    }
  };

  // NEW: Fetch attendance data - FIXED VERSION
  const fetchAttendanceData = async (studentId) => {
    try {
      console.log('Fetching attendance data for student:', studentId);
      const response = await fetch(`https://tracked.6minds.site/Student/AttendanceStudentDB/get_attendance_student.php?student_id=${studentId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Raw attendance API response:', data);
        
        if (data.success && data.attendance_summary && data.attendance_summary.length > 0) {
          console.log('Attendance summary data:', data.attendance_summary);
          
          // Calculate overall attendance rate across all subjects
          let totalPresent = 0;
          let totalPossible = 0;
          
          data.attendance_summary.forEach(subject => {
            const present = subject.present || 0;
            const late = subject.late || 0;
            const totalClasses = subject.total_classes || 0;
            
            console.log(`Subject: ${subject.subject_name}, Present: ${present}, Late: ${late}, Total Classes: ${totalClasses}`);
            
            // Present + Late count as attended
            totalPresent += present + late;
            totalPossible += totalClasses;
          });
          
          console.log('Total calculation:', { totalPresent, totalPossible });
          
          const overallAttendanceRate = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;
          setAttendanceRate(overallAttendanceRate);
          
          console.log('Final attendance rate:', overallAttendanceRate);
        } else {
          console.log('No attendance data found or empty data');
          setAttendanceRate(0);
        }
      } else {
        console.error('Failed to fetch attendance data, status:', response.status);
        setAttendanceRate(0);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setAttendanceRate(0);
    }
  };

  const formatActivityDate = (dateString) => {
    if (!dateString) return "No date";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return "Invalid date";
    }
  };

  const formatActivityTime = (dateString) => {
    if (!dateString) return "No time";
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting time:', dateString, error);
      return "Invalid time";
    }
  };

  // NEW: Fetch analytics data
  const fetchAnalyticsData = async (studentId) => {
    try {
      // Fetch student classes to get analytics for each subject
      const classesResponse = await fetch(`https://tracked.6minds.site/Student/SubjectsDB/get_student_classes.php?student_id=${studentId}`);
      
      if (classesResponse.ok) {
        const classesData = await classesResponse.json();
        
        if (classesData.success && classesData.classes) {
          // Calculate overall performance metrics
          let totalCompleted = 0;
          let totalActivities = 0;
          let totalMissed = 0;
          const subjectPerformanceData = [];
          const allRecentActivities = [];

          // Fetch analytics for each subject
          for (const subject of classesData.classes) {
            const analyticsResponse = await fetch(`https://tracked.6minds.site/Student/SubjectDetailsStudentDB/get_activities_student.php?student_id=${studentId}&subject_code=${subject.subject_code}`);
            
            if (analyticsResponse.ok) {
              const analyticsData = await analyticsResponse.json();
              
              if (analyticsData.success && analyticsData.activities) {
                const activities = analyticsData.activities;
                const completed = activities.filter(a => a.submitted).length;
                const missed = activities.filter(a => a.missing).length;
                
                totalCompleted += completed;
                totalActivities += activities.length;
                totalMissed += missed;

                const completionRate = activities.length > 0 ? Math.round((completed / activities.length) * 100) : 0;
                
                subjectPerformanceData.push({
                  subject: subject.subject,
                  subjectCode: subject.subject_code,
                  completionRate,
                  completed,
                  total: activities.length,
                  section: subject.section
                });

                // Get recent activities with proper formatting
                if (activities.length > 0) {
                  const recent = activities
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 3)
                    .map(activity => ({
                      id: activity.id,
                      title: activity.title,
                      activity_type: activity.activity_type,
                      subject: subject.subject,
                      subjectCode: subject.subject_code,
                      submitted: activity.submitted,
                      missing: activity.missing,
                      created_at: activity.created_at,
                      // Format the date and time properly with UTC
                      formatted_date: formatActivityDate(activity.created_at),
                      formatted_time: formatActivityTime(activity.created_at),
                      // Determine status for display
                      status: activity.submitted ? 'Submitted' : activity.missing ? 'Missed' : 'Assigned'
                    }));
                  
                  allRecentActivities.push(...recent);
                }
              }
            }
          }

          // Sort all recent activities by creation date and take top 5
          const sortedRecentActivities = allRecentActivities
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);
          
          setRecentActivities(sortedRecentActivities);

          // Calculate overall performance score
          const overallCompletionRate = totalActivities > 0 ? Math.round((totalCompleted / totalActivities) * 100) : 0;
          setPerformanceScore(overallCompletionRate);
          setSubmissionRate(overallCompletionRate);

          // Determine risk level
          let riskLevelCalc = "LOW";
          if (totalMissed > totalActivities * 0.3) {
            riskLevelCalc = "HIGH";
          } else if (totalMissed > totalActivities * 0.15) {
            riskLevelCalc = "MEDIUM";
          }
          setRiskLevel(riskLevelCalc);

          // Determine trend (simplified)
          const trend = overallCompletionRate > 70 ? "improving" : overallCompletionRate < 50 ? "declining" : "stable";
          setPerformanceTrend(trend);

          setSubjectPerformance(subjectPerformanceData);

          // Generate warnings
          const warningsList = [];
          if (riskLevelCalc === "HIGH") {
            warningsList.push({
              type: "critical",
              message: "High academic risk detected",
              subject: "Overall",
              suggestion: "Focus on completing missed assignments immediately"
            });
          }
          if (overallMissed > 0) {
            warningsList.push({
              type: "warning", 
              message: `You have ${overallMissed} missed assignment(s)`,
              subject: "Overall",
              suggestion: "Check if submissions are still possible"
            });
          }
          if (overallDaysAbsent > 2) {
            warningsList.push({
              type: "warning",
              message: `You have ${overallDaysAbsent} absences`,
              subject: "Overall", 
              suggestion: "Maintain good attendance to avoid being dropped"
            });
          }
          setWarnings(warningsList);

        }
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Risk level color coding
  const getRiskColor = (level) => {
    switch (level) {
      case "HIGH": return "text-red-800 bg-red-50 border-red-200";
      case "MEDIUM": return "text-yellow-800 bg-yellow-50 border-yellow-200";
      case "LOW": return "text-green-800 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  // NEW: Get risk icon
  const getRiskIcon = (level) => {
    switch (level) {
      case "HIGH": return AlertTriangleRed;
      case "MEDIUM": return AlertTriangleYellow;
      case "LOW": return AlertTriangleGreen;
      default: return AlertTriangleYellow;
    }
  };

  // NEW: Trend indicator component
  const TrendIndicator = ({ trend }) => {
    if (trend === "improving") {
      return (
        <div className="flex items-center text-green-600">
          <img src={TrendingUp} alt="Improving" className="w-4 h-4 mr-1" />
          <span className="text-sm">Improving</span>
        </div>
      );
    } else if (trend === "declining") {
      return (
        <div className="flex items-center text-red-600">
          <img src={TrendingDown} alt="Declining" className="w-4 h-4 mr-1" />
          <span className="text-sm">Needs Attention</span>
        </div>
      );
    }
    return (
      <div className="flex items-center text-blue-600">
        <span className="text-sm">Stable</span>
      </div>
    );
  };

  // NEW: Get activity type color
  const getActivityTypeColor = (type) => {
    const colors = {
      'Assignment': 'bg-blue-100 text-blue-800',
      'Quiz': 'bg-purple-100 text-purple-800',
      'Activity': 'bg-green-100 text-green-800',
      'Project': 'bg-orange-100 text-orange-800',
      'Laboratory': 'bg-red-100 text-red-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
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

  if (error) {
    return (
      <div>
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`
          transition-all duration-300
          ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
        `}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} userName={userName} />
          <div className="p-8 flex flex-col justify-center items-center h-64">
            <div className="text-[#FF6666] text-lg mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#00874E] text-white px-4 py-2 rounded-lg hover:bg-[#006c3d] transition-colors"
            >
              Retry
            </button>
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
                <span>Ready to check your progress?</span>
              </div>
              <div className="flex items-center text-sm sm:text-base lg:text-lg self-end sm:self-auto">
                <span>2nd Semester 2024 - 2025</span>
                <img src={ArrowDown} alt="ArrowDown" className="h-5 w-5 sm:h-6 sm:w-6 ml-2" />
              </div>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* PERFORMANCE OVERVIEW - UPDATED SECTION */}
          <div className="bg-[#fff] rounded-lg sm:rounded-xl shadow-md p-4 sm:p-5 mb-5">
            <div className="flex items-center mb-4">
              <img src={Pie} alt="Analytics" className="h-6 w-6 mr-2" />
              <h2 className="text-lg font-bold">Performance Overview</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Risk Level */}
              <div className={`p-4 rounded-lg border transition-all duration-500 ${getRiskColor(riskLevel)}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Risk Level</p>
                    <p className="text-xl font-bold">{riskLevel}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-md border-2 flex items-center justify-center ${
                    riskLevel === "HIGH" ? "border-red-300" :
                    riskLevel === "MEDIUM" ? "border-yellow-300" :
                    "border-green-300"
                  }`}>
                    <img 
                      src={getRiskIcon(riskLevel)} 
                      alt="Risk Level" 
                      className="w-6 h-6" 
                    />
                  </div>
                </div>
                <p className="text-xs mt-1 opacity-75">
                  {overallMissed} missed activities
                </p>
              </div>

              {/* Performance Score */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-green-800 font-medium">Performance Score</p>
                    <p className="text-2xl font-bold text-green-900">{performanceScore}/100</p>
                  </div>
                  <TrendIndicator trend={performanceTrend} />
                </div>
                <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${performanceScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Attendance Rate - UPDATED with real data */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-medium">Attendance Rate</p>
                <p className="text-2xl font-bold text-blue-900">{attendanceRate}%</p>
                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${attendanceRate}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-1 opacity-75">
                  Across all subjects
                </p>
              </div>

              {/* Submission Rate */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-800 font-medium">Submission Rate</p>
                <p className="text-2xl font-bold text-purple-900">{submissionRate}%</p>
                <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${submissionRate}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-1 opacity-75">
                  {completedActivities}/{completedActivities + overallMissed} activities
                </p>
              </div>
            </div>
          </div>

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

          {/* SUBJECT PERFORMANCE & RECENT ACTIVITIES - UPDATED SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
            {/* Subject Performance - Hidden on mobile */}
            <div className="hidden lg:block bg-[#fff] rounded-lg sm:rounded-xl shadow-md p-4 sm:p-5">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <img src={SubjectPerformance} alt="SubjectPerformance" className="h-6 w-6 mr-2" />
                Subject Performance
              </h3>
              <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
                {subjectPerformance.length > 0 ? (
                  subjectPerformance.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{subject.subject}</p>
                        <p className="text-xs text-gray-500">{subject.section}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">{subject.completionRate}%</p>
                        <p className="text-xs text-gray-500">
                          {subject.completed}/{subject.total}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No subject data available</p>
                )}
              </div>
              {/* UPDATED: Simple button without arrow, centered */}
              <div className="flex justify-center mt-4">
                <Link to="/Subjects">
                  <button className="bg-[#00874E] text-white px-6 py-2 rounded-lg hover:bg-[#006c3d] transition-colors font-medium">
                    View All Subjects
                  </button>
                </Link>
              </div>
            </div>

            {/* Recent Activities - UPDATED with scrollable area and improved layout */}
            <div className="bg-[#fff] rounded-lg sm:rounded-xl shadow-md p-4 sm:p-5">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <img src={RecentActivity} alt="RecentActivity" className="h-6 w-6 mr-2" />
                Recent Activities
              </h3>
              <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0 mr-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getActivityTypeColor(activity.activity_type)}`}>
                            {activity.activity_type}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            activity.submitted ? 'bg-green-100 text-green-800' : 
                            activity.missing ? 'bg-red-100 text-red-800' : 
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {activity.submitted ? 'Submitted' : activity.missing ? 'Missed' : 'Assigned'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="font-medium">Subject:</span> {activity.subject}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Title:</span> {activity.title}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500 min-w-20">
                        <div className="font-medium">{activity.formatted_date}</div>
                        <div>{activity.formatted_time}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent activities</p>
                )}
              </div>
              {/* UPDATED: Simple button without arrow, centered */}
              <div className="flex justify-center mt-4">
                <Link to="/Subjects">
                  <button className="bg-[#00874E] text-white px-6 py-2 rounded-lg hover:bg-[#006c3d] transition-colors font-medium">
                    View All Activities
                  </button>
                </Link>
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

          {/* Dynamic Warnings - REMOVED the success message */}
          {warnings.length > 0 && (
            warnings.map((warning, index) => (
              <Link key={index} to={"/AnalyticsStudent"}>
                <div className="bg-[#FFFFFF] rounded-lg sm:rounded-xl shadow-md mt-5 p-3 sm:p-4 text-sm sm:text-base lg:text-[1.125rem] border-2 border-transparent hover:border-[#00874E] transition-all duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                    <p className={`font-bold text-xs sm:text-sm lg:text-base sm:flex-1 ${
                      warning.type === 'critical' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {warning.type === 'critical' ? 'CRITICAL:' : 'WARNING:'}
                    </p>
                    <p className="font-bold text-xs sm:text-sm lg:text-base sm:flex-1">{warning.message}</p>
                    <img src={Details} alt="Details" className="h-6 w-6 sm:h-8 sm:w-8 self-end sm:self-auto"/>
                  </div>
                  {warning.suggestion && (
                    <p className="text-xs text-gray-600 mt-2 sm:mt-0 sm:ml-4">{warning.suggestion}</p>
                  )}
                </div>
              </Link>
            ))
          )}

          {/* REMOVED: Quick Analytics Link */}

        </div>
      </div>
    </div>
  )
}