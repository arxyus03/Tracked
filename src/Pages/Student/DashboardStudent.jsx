import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

// ========== IMPORT ASSETS ==========
import Dashboard from '../../assets/Dashboard.svg';
import SubjectPerformance from '../../assets/SubjectPerformance.svg';
import RecentActivity from '../../assets/RecentActivity.svg';
import ID from '../../assets/ID.svg';
import Pie from '../../assets/Pie.svg';
import Details from '../../assets/Details(Light).svg';
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
  // ========== STATE VARIABLES ==========
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("Student");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [studentCourse, setStudentCourse] = useState("");
  const [studentYearLevel, setStudentYearLevel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Widget states
  const [completedActivities, setCompletedActivities] = useState(0);
  const [overallSubmitted, setOverallSubmitted] = useState(0);
  const [overallDaysAbsent, setOverallDaysAbsent] = useState(0);
  const [pendingTask, setPendingTask] = useState(0);
  const [totalDaysPresent, setTotalDaysPresent] = useState(0);
  const [overallMissed, setOverallMissed] = useState(0);

  // Analytics states
  const [performanceScore, setPerformanceScore] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState(0);
  const [submissionRate, setSubmissionRate] = useState(0);
  const [riskLevel, setRiskLevel] = useState("LOW");
  const [recentActivities, setRecentActivities] = useState([]);
  const [performanceTrend, setPerformanceTrend] = useState("stable");
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [warnings, setWarnings] = useState([]);

  // ========== USE EFFECTS ==========
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
    return () => window.removeEventListener('resize', checkScreenSize);
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
                await fetchAttendanceData(userIdFromStorage);
                await fetchAnalyticsData(userIdFromStorage);
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

  // ========== API CALL FUNCTIONS ==========
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

  const fetchAttendanceData = async (studentId) => {
    try {
      const response = await fetch(`https://tracked.6minds.site/Student/AttendanceStudentDB/get_attendance_student.php?student_id=${studentId}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.attendance_summary && data.attendance_summary.length > 0) {
          let totalPresent = 0;
          let totalPossible = 0;
          
          data.attendance_summary.forEach(subject => {
            const present = subject.present || 0;
            const late = subject.late || 0;
            const totalClasses = subject.total_classes || 0;
            
            totalPresent += present + late;
            totalPossible += totalClasses;
          });
          
          const overallAttendanceRate = totalPossible > 0 ? Math.round((totalPresent / totalPossible) * 100) : 0;
          setAttendanceRate(overallAttendanceRate);
        } else {
          setAttendanceRate(0);
        }
      } else {
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

  const fetchAnalyticsData = async (studentId) => {
    try {
      const classesResponse = await fetch(`https://tracked.6minds.site/Student/SubjectsDB/get_student_classes.php?student_id=${studentId}`);
      
      if (classesResponse.ok) {
        const classesData = await classesResponse.json();
        
        if (classesData.success && classesData.classes) {
          let totalCompleted = 0;
          let totalActivities = 0;
          let totalMissed = 0;
          const subjectPerformanceData = [];
          const allRecentActivities = [];

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
                      formatted_date: formatActivityDate(activity.created_at),
                      formatted_time: formatActivityTime(activity.created_at),
                      status: activity.submitted ? 'Submitted' : activity.missing ? 'Missed' : 'Assigned'
                    }));
                  
                  allRecentActivities.push(...recent);
                }
              }
            }
          }

          const sortedRecentActivities = allRecentActivities
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5);
          
          setRecentActivities(sortedRecentActivities);

          const overallCompletionRate = totalActivities > 0 ? Math.round((totalCompleted / totalActivities) * 100) : 0;
          setPerformanceScore(overallCompletionRate);
          setSubmissionRate(overallCompletionRate);

          let riskLevelCalc = "LOW";
          if (totalMissed > totalActivities * 0.3) {
            riskLevelCalc = "HIGH";
          } else if (totalMissed > totalActivities * 0.15) {
            riskLevelCalc = "MEDIUM";
          }
          setRiskLevel(riskLevelCalc);

          const trend = overallCompletionRate > 70 ? "improving" : overallCompletionRate < 50 ? "declining" : "stable";
          setPerformanceTrend(trend);

          setSubjectPerformance(subjectPerformanceData);

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

  // ========== STYLING HELPERS ==========
  const getRiskColor = (level) => {
    switch (level) {
      case "HIGH": return "text-[#FF6B6B] bg-[#A15353]/10 border-[#A15353]/20";
      case "MEDIUM": return "text-[#FFB347] bg-[#FFA600]/10 border-[#FFA600]/20";
      case "LOW": return "text-[#4CAF50] bg-[#00A15D]/10 border-[#00A15D]/20";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case "HIGH": return AlertTriangleRed;
      case "MEDIUM": return AlertTriangleYellow;
      case "LOW": return AlertTriangleGreen;
      default: return AlertTriangleYellow;
    }
  };

  const TrendIndicator = ({ trend }) => {
    if (trend === "improving") {
      return (
        <div className="flex items-center text-[#4CAF50]">
          <img src={TrendingUp} alt="Improving" className="w-4 h-4 mr-1" />
          <span className="text-sm">Improving</span>
        </div>
      );
    } else if (trend === "declining") {
      return (
        <div className="flex items-center text-[#FF6B6B]">
          <img src={TrendingDown} alt="Declining" className="w-4 h-4 mr-1" />
          <span className="text-sm">Needs Attention</span>
        </div>
      );
    }
    return (
      <div className="flex items-center text-[#8A9BFF]">
        <span className="text-sm">Stable</span>
      </div>
    );
  };

  const getActivityTypeColor = (type) => {
    const colors = {
      'Assignment': 'bg-[#8A9BFF]/20 text-[#8A9BFF]',
      'Quiz': 'bg-[#B39DDB]/20 text-[#B39DDB]',
      'Activity': 'bg-[#4CAF50]/20 text-[#4CAF50]',
      'Project': 'bg-[#FFB347]/20 text-[#FFB347]',
      'Laboratory': 'bg-[#FF6B6B]/20 text-[#FF6B6B]',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  // ========== LOADING & ERROR STATES ==========
  if (loading) {
    return (
      <div className="bg-[#23232C] min-h-screen">
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} userName={userName} />
          <div className="p-8 flex justify-center items-center h-64">
            <div className="text-[#FFFFFF] text-lg">Loading dashboard data...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#23232C] min-h-screen">
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} userName={userName} />
          <div className="p-8 flex flex-col justify-center items-center h-64">
            <div className="text-[#FF6B6B] text-lg mb-4">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#00A15D] text-white px-4 py-2 rounded-lg hover:bg-[#00874E] transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ========== MAIN RENDER ==========
  return (
    <div className="bg-[#23232C] min-h-screen">
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName={userName} />

        {/* ========== DASHBOARD CONTENT ========== */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8 text-[#FFFFFF]">
          
          {/* ========== HEADER SECTION ========== */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img src={Dashboard} alt="Dashboard" className="h-6 w-6 sm:h-7 sm:w-7 mr-3" />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl">Dashboard</h1>
            </div>
            <div className="text-sm sm:text-base lg:text-lg text-[#FFFFFF]/80">
              <span>Hi</span>
              <span className="font-bold ml-1 mr-1 text-[#FFFFFF]">{userName}!</span>
              <span>Ready to check your progress?</span>
            </div>
          </div>

          <hr className="border-[#FFFFFF]/30 mb-5 sm:mb-6" />

          {/* ========== PERFORMANCE OVERVIEW ========== */}
          <div className="bg-[#15151C] rounded-lg sm:rounded-xl shadow-md p-4 sm:p-5 mb-5">
            <div className="flex items-center mb-4">
              <img src={Pie} alt="Analytics" className="h-6 w-6 mr-2" />
              <h2 className="text-lg font-bold text-[#FFFFFF]">Performance Overview</h2>
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
                    riskLevel === "HIGH" ? "border-[#A15353]/30" :
                    riskLevel === "MEDIUM" ? "border-[#FFA600]/30" :
                    "border-[#00A15D]/30"
                  }`}>
                    <img src={getRiskIcon(riskLevel)} alt="Risk Level" className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs mt-1 opacity-75">{overallMissed} missed activities</p>
              </div>

              {/* Performance Score */}
              <div className="bg-gradient-to-br from-[#00A15D]/10 to-[#00A15D]/5 p-4 rounded-lg border border-[#00A15D]/20">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-[#4CAF50] font-medium">Performance Score</p>
                    <p className="text-xl font-bold text-[#FFFFFF]">{performanceScore}/100</p>
                  </div>
                  <TrendIndicator trend={performanceTrend} />
                </div>
                <div className="w-full bg-[#00A15D]/20 rounded-full h-2 mt-2">
                  <div 
                    className="bg-[#00A15D] h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${performanceScore}%` }}
                  ></div>
                </div>
              </div>

              {/* Attendance Rate */}
              <div className="bg-gradient-to-br from-[#767EE0]/10 to-[#767EE0]/5 p-4 rounded-lg border border-[#767EE0]/20">
                <p className="text-sm text-[#8A9BFF] font-medium">Attendance Rate</p>
                <p className="text-xl font-bold text-[#FFFFFF]">{attendanceRate}%</p>
                <div className="w-full bg-[#767EE0]/20 rounded-full h-2 mt-2">
                  <div 
                    className="bg-[#767EE0] h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${attendanceRate}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-1 opacity-75">Across all subjects</p>
              </div>

              {/* Submission Rate */}
              <div className="bg-gradient-to-br from-[#9b87f5]/10 to-[#9b87f5]/5 p-4 rounded-lg border border-[#9b87f5]/20">
                <p className="text-sm text-[#B39DDB] font-medium">Submission Rate</p>
                <p className="text-xl font-bold text-[#FFFFFF]">{submissionRate}%</p>
                <div className="w-full bg-[#9b87f5]/20 rounded-full h-2 mt-2">
                  <div 
                    className="bg-[#9b87f5] h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${submissionRate}%` }}
                  ></div>
                </div>
                <p className="text-xs mt-1 opacity-75">
                  {completedActivities}/{completedActivities + overallMissed} activities
                </p>
              </div>
            </div>
          </div>

          {/* ========== WIDGETS SECTION ========== */}
          <div className="mb-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Completed Activities */}
              <div className='bg-[#15151C] h-32 rounded-lg p-4 shadow-md w-full'> 
                <div className='font-bold text-sm h-full flex flex-col'>
                  <h1 className='mb-2 text-[#FFFFFF]'>Completed Activities</h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#00A15D]/20 h-12 w-12 rounded-lg border-2 border-[#00A15D]'>
                      <img src={CompletedActivities} alt="CompletedActivities" className="h-6 w-6"/>
                    </div>
                    <p className='text-3xl text-[#FFFFFF]'>{completedActivities}</p>
                  </div>
                </div>
              </div>

              {/* Overall Submitted */}
              <div className='bg-[#15151C] h-32 rounded-lg p-4 shadow-md w-full'> 
                <div className='font-bold text-sm h-full flex flex-col'>
                  <h1 className='mb-2 text-[#FFFFFF]'>Overall Submitted</h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#00A15D]/20 h-12 w-12 rounded-lg border-2 border-[#00A15D]'>
                      <img src={OverallSubmitted} alt="OverallSubmitted" className="h-6 w-6"/>
                    </div>
                    <p className='text-3xl text-[#FFFFFF]'>{overallSubmitted}</p>
                  </div>
                </div>
              </div>

              {/* Days Absent */}
              <div className='bg-[#15151C] h-32 rounded-lg p-4 shadow-md w-full'> 
                <div className='font-bold text-sm h-full flex flex-col'>
                  <h1 className='mb-2 text-[#FFFFFF]'>Days Absent</h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#A15353]/20 h-12 w-12 rounded-lg border-2 border-[#A15353]'>
                      <img src={OverallDaysAbsent} alt="OverallDaysAbsent" className="h-6 w-6"/>
                    </div>
                    <p className='text-3xl text-[#FFFFFF]'>{overallDaysAbsent}</p>
                  </div>
                </div>
              </div>

              {/* Pending Task */}
              <div className='bg-[#15151C] h-32 rounded-lg p-4 shadow-md w-full'> 
                <div className='font-bold text-sm h-full flex flex-col'>
                  <h1 className='mb-2 text-[#FFFFFF]'>Pending Task</h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#767EE0]/20 h-12 w-12 rounded-lg border-2 border-[#767EE0]'>
                      <img src={PendingTask} alt="PendingTask" className="h-6 w-6"/>
                    </div>
                    <p className='text-3xl text-[#FFFFFF]'>{pendingTask}</p>
                  </div>
                </div>
              </div>

              {/* Days Present */}
              <div className='bg-[#15151C] h-32 rounded-lg p-4 shadow-md w-full'> 
                <div className='font-bold text-sm h-full flex flex-col'>
                  <h1 className='mb-2 text-[#FFFFFF]'>Days Present</h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#00A15D]/20 h-12 w-12 rounded-lg border-2 border-[#00A15D]'>
                      <img src={TotalDaySpent} alt="TotalDaySpent" className="h-6 w-6"/>
                    </div>
                    <p className='text-3xl text-[#FFFFFF]'>{totalDaysPresent}</p>
                  </div>
                </div>
              </div>

              {/* Overall Missed */}
              <div className='bg-[#15151C] h-32 rounded-lg p-4 shadow-md w-full'> 
                <div className='font-bold text-sm h-full flex flex-col'>
                  <h1 className='mb-2 text-[#FFFFFF]'>Overall Missed</h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#A15353]/20 h-12 w-12 rounded-lg border-2 border-[#A15353]'>
                      <img src={OverallMissed} alt="OverallMissed" className="h-6 w-6"/>
                    </div>
                    <p className='text-3xl text-[#FFFFFF]'>{overallMissed}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========== SUBJECT & ACTIVITIES SECTION ========== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
            {/* Subject Performance */}
            <div className="bg-[#15151C] rounded-lg shadow-md p-4">
              <h3 className="text-base font-semibold mb-4 flex items-center text-[#FFFFFF]">
                <img src={SubjectPerformance} alt="SubjectPerformance" className="h-5 w-5 mr-2" />
                Subject Performance
              </h3>
              <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
                {subjectPerformance.length > 0 ? (
                  subjectPerformance.map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#23232C] rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate text-[#FFFFFF]">{subject.subject}</p>
                        <p className="text-xs text-[#FFFFFF]/50">{subject.section}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm text-[#FFFFFF]">{subject.completionRate}%</p>
                        <p className="text-xs text-[#FFFFFF]/50">
                          {subject.completed}/{subject.total}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[#FFFFFF]/50 text-center py-4 text-sm">No subject data available</p>
                )}
              </div>
              <div className="flex justify-center mt-4">
                <Link to="/Subjects">
                  <button className="bg-[#00A15D] text-white px-4 py-2 rounded text-sm hover:bg-[#00874E] transition-colors font-medium">
                    View All Subjects
                  </button>
                </Link>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-[#15151C] rounded-lg shadow-md p-4">
              <h3 className="text-base font-semibold mb-4 flex items-center text-[#FFFFFF]">
                <img src={RecentActivity} alt="RecentActivity" className="h-5 w-5 mr-2" />
                Recent Activities
              </h3>
              <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start justify-between p-3 bg-[#23232C] rounded-lg">
                      <div className="flex-1 min-w-0 mr-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getActivityTypeColor(activity.activity_type)}`}>
                            {activity.activity_type}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            activity.submitted ? 'bg-[#4CAF50]/20 text-[#4CAF50]' : 
                            activity.missing ? 'bg-[#FF6B6B]/20 text-[#FF6B6B]' : 
                            'bg-[#8A9BFF]/20 text-[#8A9BFF]'
                          }`}>
                            {activity.submitted ? 'Submitted' : activity.missing ? 'Missed' : 'Assigned'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-[#FFFFFF]">
                            <span className="font-medium">Subject:</span> {activity.subject}
                          </p>
                          <p className="text-sm text-[#FFFFFF]">
                            <span className="font-medium">Title:</span> {activity.title}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-xs text-[#FFFFFF]/50 min-w-20">
                        <div className="font-medium">{activity.formatted_date}</div>
                        <div>{activity.formatted_time}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[#FFFFFF]/50 text-center py-4 text-sm">No recent activities</p>
                )}
              </div>
              <div className="flex justify-center mt-4">
                <Link to="/Subjects">
                  <button className="bg-[#00A15D] text-white px-4 py-2 rounded text-sm hover:bg-[#00874E] transition-colors font-medium">
                    View All Activities
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* ========== STUDENT INFO ========== */}
          <div className="bg-[#15151C] rounded-lg shadow-md mt-5 p-4 text-sm">
            <div className="flex items-center">
              <img src={ID} alt="ID" className="h-5 w-5 mr-2" />
              <p className="font-bold text-sm text-[#FFFFFF]">{userName}</p>
            </div>

            <hr className="opacity-60 border-[#FFFFFF]/30 rounded border-1 my-3" />

            <div className="pl-4 space-y-2">
              <div className="flex flex-col sm:flex-row">
                <span className="font-bold text-sm w-28 mb-1 sm:mb-0 text-[#FFFFFF]">Student ID:</span>
                <span className="text-sm text-[#FFFFFF]/80">{userId || "Loading..."}</span>
              </div>
              <div className="flex flex-col sm:flex-row">
                <span className="font-bold text-sm w-28 mb-1 sm:mb-0 text-[#FFFFFF]">Email:</span>
                <span className="text-sm break-all sm:break-normal text-[#FFFFFF]/80">{userEmail || "Loading..."}</span>
              </div>
              <div className="flex flex-col sm:flex-row">
                <span className="font-bold text-sm w-28 mb-1 sm:mb-0 text-[#FFFFFF]">Course:</span>
                <span className="text-sm text-[#FFFFFF]/80">{studentCourse || "Loading..."}</span>
              </div>
              <div className="flex flex-col sm:flex-row">
                <span className="font-bold text-sm w-28 mb-1 sm:mb-0 text-[#FFFFFF]">Year Level:</span>
                <span className="text-sm text-[#FFFFFF]/80">{studentYearLevel || "Loading..."}</span>
              </div>
            </div>
          </div>

          {/* ========== WARNINGS ========== */}
          {warnings.length > 0 && (
            warnings.map((warning, index) => (
              <Link key={index} to={"/AnalyticsStudent"}>
                <div className="bg-[#15151C] rounded-lg shadow-md mt-4 p-3 text-sm border-2 border-transparent hover:border-[#00A15D] transition-all duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                    <p className={`font-bold text-sm sm:flex-1 ${
                      warning.type === 'critical' ? 'text-[#FF6B6B]' : 'text-[#FFB347]'
                    }`}>
                      {warning.type === 'critical' ? 'CRITICAL:' : 'WARNING:'}
                    </p>
                    <p className="font-bold text-sm sm:flex-1 text-[#FFFFFF]">{warning.message}</p>
                    <img src={Details} alt="Details" className="h-6 w-6 self-end sm:self-auto"/>
                  </div>
                  {warning.suggestion && (
                    <p className="text-sm text-[#FFFFFF]/60 mt-2 sm:mt-0 sm:ml-4">{warning.suggestion}</p>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}