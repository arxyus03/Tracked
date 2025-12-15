import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import CalendarDetails from "../../Components/StudentComponents/CalendarDetails";
import TaskCompletionDetails from "../../Components/StudentComponents/TaskCompletionDetails";
import SubjectPerformance from "../../Components/StudentComponents/SubjectPerformance";
import OverallPerformanceCard from "../../Components/StudentComponents/OverallPerformanceCard";

// Import assets
import Dashboard from '../../assets/Dashboard.svg';
import RecentActivity from '../../assets/RecentActivity.svg';
import ID from '../../assets/ID.svg';
import Pie from '../../assets/Pie.svg';
import Details from '../../assets/Details(Light).svg';
import CalendarIcon from '../../assets/Calendar.svg';

export default function DashboardStudent() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("Student");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [studentCourse, setStudentCourse] = useState("");
  const [studentYearLevel, setStudentYearLevel] = useState("");
  const [loading, setLoading] = useState(true);
  
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
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [warnings, setWarnings] = useState([]);

  // Calendar states
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayActivities, setSelectedDayActivities] = useState([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarDays, setCalendarDays] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Task completion states
  const [tasksDone, setTasksDone] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [taskCompletionPercentage, setTaskCompletionPercentage] = useState(0);
  const [activityAlerts, setActivityAlerts] = useState({
    missed: 0,
    active: 0
  });
  
  // New state for activity modal
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [selectedActivityType, setSelectedActivityType] = useState(null);
  const [modalActivities, setModalActivities] = useState([]);
  const [activityDetails, setActivityDetails] = useState({
    missed: [],
    active: []
  });

  // Overall performance state
  const [overallPerformance, setOverallPerformance] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsOpen(window.innerWidth >= 1024);
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
                await generateCalendarData(userIdFromStorage);
                await fetchTaskCompletionData(userIdFromStorage);
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
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatModalDate = (dateString) => {
    if (!dateString || dateString === "No deadline") return "No deadline";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        timeZone: 'UTC',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
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
                    .slice(0, 2)
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
                      status: activity.submitted ? 'Submitted' : activity.missing ? 'Missed' : 'Assigned'
                    }));
                  
                  allRecentActivities.push(...recent);
                }
              }
            }
          }

          const sortedRecentActivities = allRecentActivities
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 3);
          
          setRecentActivities(sortedRecentActivities);

          const overallCompletionRate = totalActivities > 0 ? Math.round((totalCompleted / totalActivities) * 100) : 0;
          setPerformanceScore(overallCompletionRate);
          setSubmissionRate(overallCompletionRate);
          
          // Calculate overall performance (average of all subject completion rates)
          if (subjectPerformanceData.length > 0) {
            const averageCompletionRate = Math.round(
              subjectPerformanceData.reduce((sum, subject) => sum + subject.completionRate, 0) / 
              subjectPerformanceData.length
            );
            setOverallPerformance(averageCompletionRate);
          } else {
            setOverallPerformance(0);
          }

          let riskLevelCalc = "LOW";
          if (totalMissed > totalActivities * 0.3) {
            riskLevelCalc = "HIGH";
          } else if (totalMissed > totalActivities * 0.15) {
            riskLevelCalc = "MEDIUM";
          }
          setRiskLevel(riskLevelCalc);

          setSubjectPerformance(subjectPerformanceData);

          const warningsList = [];
          if (riskLevelCalc === "HIGH") {
            warningsList.push({
              type: "critical",
              message: "High academic risk detected",
              suggestion: "Focus on missed assignments"
            });
          }
          if (overallMissed > 0) {
            warningsList.push({
              type: "warning", 
              message: `${overallMissed} missed assignment(s)`,
              suggestion: "Check submissions"
            });
          }
          if (overallDaysAbsent > 2) {
            warningsList.push({
              type: "warning",
              message: `${overallDaysAbsent} absences`,
              suggestion: "Maintain attendance"
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

  // Fetch task completion data
  const fetchTaskCompletionData = async (studentId) => {
    try {
      const response = await fetch(`https://tracked.6minds.site/Student/DashboardStudentDB/get_task_completion.php?student_id=${studentId}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setTasksDone(data.tasks_done || 0);
          setTotalTasks(data.total_tasks || 0);
          setTaskCompletionPercentage(data.completion_percentage || 0);
          
          // Set activity alerts (only missed and active now)
          setActivityAlerts({
            missed: data.missed_activities || 0,
            active: data.active_activities || 0
          });

          // Fetch detailed activities for each type
          await fetchDetailedActivities(studentId);
        }
      }
    } catch (error) {
      console.error("Error fetching task completion data:", error);
      // Set fallback data
      setTasksDone(14);
      setTotalTasks(20);
      setTaskCompletionPercentage(70);
      setActivityAlerts({
        missed: 3,
        active: 5
      });
      // Fetch mock detailed activities
      fetchMockDetailedActivities();
    }
  };

  // Fetch detailed activities for each type
  const fetchDetailedActivities = async (studentId) => {
    try {
      // This would be replaced with actual API calls
      // For now, using mock data
      fetchMockDetailedActivities();
    } catch (error) {
      console.error("Error fetching detailed activities:", error);
      fetchMockDetailedActivities();
    }
  };

  // Mock detailed activities
  const fetchMockDetailedActivities = () => {
    const mockMissedActivities = [
      {
        id: 1,
        subject: "Mathematics",
        subjectCode: "MATH101",
        activity_type: "Assignment",
        title: "Chapter 3 Exercises",
        task_number: "1",
        instructions: "Complete all problems on page 45-47. Show your work and submit as a PDF file.",
        deadline: "2024-03-15T23:59:00",
        status: "missed",
        professorEmail: "math.professor@university.edu",
        notes: "Late submissions not accepted",
        points: 20,
        submitted: 0,
        late: 0,
        professor_file_count: 2,
        grade: null
      },
      {
        id: 2,
        subject: "Science",
        subjectCode: "SCI201",
        activity_type: "Lab Report",
        title: "Chemistry Lab Experiment 2",
        task_number: "2",
        instructions: "Write a detailed lab report following the scientific method. Include data tables, analysis, and conclusion.",
        deadline: "2024-03-16T14:30:00",
        status: "missed",
        professorEmail: "science.professor@university.edu",
        notes: "Must include safety precautions section",
        points: 25,
        submitted: 0,
        late: 0,
        professor_file_count: 1,
        grade: null
      }
    ];

    const mockActiveActivities = [
      {
        id: 3,
        subject: "Computer Science",
        subjectCode: "CS301",
        activity_type: "Project",
        title: "Web Application Development",
        task_number: "3",
        instructions: "Develop a full-stack web application using React and Node.js. Include authentication and database integration.",
        deadline: "2024-03-25T17:00:00",
        status: "active",
        professorEmail: "cs.professor@university.edu",
        notes: "Group project - teams of 3",
        points: 50,
        submitted: 0,
        late: 0,
        professor_file_count: 3,
        grade: null
      },
      {
        id: 4,
        subject: "History",
        subjectCode: "HIST102",
        activity_type: "Research Paper",
        title: "World War II Causes",
        task_number: "4",
        instructions: "Research and analyze the primary causes of World War II. Minimum 2000 words with proper citations.",
        deadline: "2024-03-28T23:59:00",
        status: "active",
        professorEmail: "history.professor@university.edu",
        notes: "Chicago citation style required",
        points: 40,
        submitted: 0,
        late: 0,
        professor_file_count: 0,
        grade: null
      },
      {
        id: 5,
        subject: "Physics",
        subjectCode: "PHYS201",
        activity_type: "Quiz",
        title: "Quantum Mechanics Quiz",
        task_number: "5",
        instructions: "Complete the online quiz covering chapters 4-6. Multiple choice and short answer questions.",
        deadline: "2024-03-20T10:30:00",
        status: "active",
        professorEmail: "physics.professor@university.edu",
        notes: "Time limit: 45 minutes",
        points: 15,
        submitted: 0,
        late: 0,
        professor_file_count: 2,
        grade: null
      }
    ];

    setActivityDetails({
      missed: mockMissedActivities,
      active: mockActiveActivities
    });
  };

  // Generate calendar data
  const generateCalendarData = async (studentId) => {
    try {
      // Generate calendar days for current month
      const today = new Date();
      const currentMonthDays = new Date(currentYear, currentMonth + 1, 0).getDate();
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      const daysArray = [];

      // Add empty cells for days before the first day of month
      for (let i = 0; i < firstDayOfMonth; i++) {
        daysArray.push({
          dayNumber: null,
          isDay: false
        });
      }

      // Get today's date in YYYY-MM-DD format for comparison
      const todayStr = today.toISOString().split('T')[0];
      
      // Create days for the current month
      for (let day = 1; day <= currentMonthDays; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dateObj = new Date(dateStr);
        
        // Get day of week (0 = Sunday, 1 = Monday, etc.)
        const dayOfWeek = dateObj.getDay();
        
        // Get activities for this day
        const activitiesForDay = await fetchDayActivities(dateStr);
        
        // Determine attendance status based on activities
        let status = 'none';
        if (activitiesForDay.length > 0) {
          const hasPresent = activitiesForDay.some(a => a.attendance === 'present');
          const hasLate = activitiesForDay.some(a => a.attendance === 'late');
          const hasAbsent = activitiesForDay.some(a => a.attendance === 'absent');
          
          if (hasAbsent) status = 'absent';
          else if (hasLate) status = 'late';
          else if (hasPresent) status = 'present';
        }

        daysArray.push({
          date: dateStr,
          dayNumber: day,
          dayOfWeek,
          status,
          activities: activitiesForDay,
          isToday: dateStr === todayStr,
          isFuture: dateObj > today,
          isDay: true
        });
      }

      // Fill remaining cells to complete 6 weeks (42 cells)
      while (daysArray.length < 42) {
        daysArray.push({
          dayNumber: null,
          isDay: false
        });
      }

      setCalendarDays(daysArray);
    } catch (error) {
      console.error("Error generating calendar data:", error);
    }
  };

  // Mock function to fetch day activities - frontend only
  const fetchDayActivities = async (date) => {
    // Mock data for demonstration - this would come from your API
    const mockActivities = [
      {
        id: 1,
        subject: "Mathematics",
        activity_type: "Assignment",
        title: "Chapter 3 Exercises",
        posted_date: date,
        time: "10:00 AM",
        attendance: Math.random() > 0.5 ? 'present' : Math.random() > 0.5 ? 'late' : 'absent'
      },
      {
        id: 2,
        subject: "Science",
        activity_type: "Quiz",
        title: "Physics Quiz",
        posted_date: date,
        time: "2:00 PM",
        attendance: Math.random() > 0.5 ? 'present' : Math.random() > 0.5 ? 'late' : 'absent'
      }
    ];

    // Filter to return 0-3 random activities for the date
    const randomCount = Math.floor(Math.random() * 4); // 0-3 activities
    return mockActivities.slice(0, randomCount);
  };

  // Handle activity type click
  const handleActivityTypeClick = (type) => {
    setSelectedActivityType(type);
    setModalActivities(activityDetails[type] || []);
    setIsActivityModalOpen(true);
  };

  // Handle navigation to subject's school works
  const handleViewSchoolWorks = (activity) => {
    setIsActivityModalOpen(false);
    navigate(`/SubjectSchoolWorksStudent?code=${activity.subjectCode}&activityId=${activity.id}`);
  };

  const handleDayClick = (day) => {
    if (!day.isDay || day.isFuture) return;
    
    setSelectedDate(day);
    setSelectedDayActivities(day.activities || []);
    setIsCalendarOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-[#00A15D] border-[#00A15D]';
      case 'late': return 'bg-[#FFA600] border-[#FFA600]';
      case 'absent': return 'bg-[#A15353] border-[#A15353]';
      case 'none': return 'bg-transparent border-white/20';
      default: return 'bg-transparent border-white/20';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present': return 'Present';
      case 'late': return 'Late';
      case 'absent': return 'Absent';
      case 'none': return 'No Class';
      default: return 'No Data';
    }
  };

  const getAttendanceStatusColor = (status) => {
    switch (status) {
      case 'present': return 'text-[#00A15D]';
      case 'late': return 'text-[#FFA600]';
      case 'absent': return 'text-[#A15353]';
      default: return 'text-white/60';
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case "HIGH": return "text-[#A15353]";
      case "MEDIUM": return "text-[#FFA600]";
      case "LOW": return "text-[#00A15D]";
      default: return "text-gray-600";
    }
  };

  const getRiskBorderColor = (level) => {
    switch (level) {
      case "HIGH": return "border-[#A15353]";
      case "MEDIUM": return "border-[#FFA600]";
      case "LOW": return "border-[#00A15D]";
      default: return "border-gray-600";
    }
  };

  const getActivityTypeColor = (type) => {
    const colors = {
      'Assignment': 'bg-[#767EE0]/20 text-[#767EE0]',
      'Quiz': 'bg-[#B39DDB]/20 text-[#B39DDB]',
      'Activity': 'bg-[#00A15D]/20 text-[#00A15D]',
      'Project': 'bg-[#FFA600]/20 text-[#FFA600]',
      'Laboratory': 'bg-[#A15353]/20 text-[#A15353]',
      'Exam': 'bg-[#A15353]/20 text-[#A15353]',
      'Essay': 'bg-[#00A15D]/20 text-[#00A15D]',
      'Lab Report': 'bg-[#A15353]/20 text-[#A15353]',
      'Research Paper': 'bg-[#FFA600]/20 text-[#FFA600]'
    };
    return colors[type] || 'bg-[#767EE0]/20 text-[#767EE0]';
  };

  const getActivityStatusColor = (status) => {
    switch (status) {
      case 'missed': return 'text-[#A15353] border-[#A15353]/30 bg-[#A15353]/10';
      case 'active': return 'text-[#767EE0] border-[#767EE0]/30 bg-[#767EE0]/10';
      case 'submitted': return 'text-[#00A15D] border-[#00A15D]/30 bg-[#00A15D]/10';
      default: return 'text-white/60 border-white/20';
    }
  };

  const getActivityStatusLabel = (status) => {
    switch (status) {
      case 'missed': return 'Missed';
      case 'active': return 'Active';
      case 'submitted': return 'Submitted';
      default: return status;
    }
  };

  const getGradingStatus = (activity) => {
    const isSubmitted = activity.submitted === 1 || activity.submitted === true || activity.submitted === '1';
    const isGraded = activity.grade !== null && activity.grade !== undefined && activity.grade !== '';
    
    if (isGraded) {
      return {
        text: 'Graded',
        color: 'bg-[#00A15D]/20 text-[#00A15D]'
      };
    } else if (isSubmitted) {
      return {
        text: 'Pending Grade',
        color: 'bg-[#FFA600]/20 text-[#FFA600]'
      };
    } else if (activity.status === 'active') {
      return {
        text: 'Not Submitted',
        color: 'bg-[#767EE0]/20 text-[#767EE0]'
      };
    } else if (activity.status === 'missed') {
      return {
        text: 'Missed',
        color: 'bg-[#A15353]/20 text-[#A15353]'
      };
    }
    return null;
  };

  // Function to get month name
  const getMonthName = () => {
    const date = new Date(currentYear, currentMonth, 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  // Function to email professor
  const handleEmailProfessor = (professorEmail, activityTitle) => {
    const subject = encodeURIComponent(`Regarding: ${activityTitle}`);
    const body = encodeURIComponent(`Dear Professor,\n\nI would like to inquire about the activity "${activityTitle}". Could you please let me know what I can do to make up for this task?\n\nThank you,\n${userName}`);
    window.open(`mailto:${professorEmail}?subject=${subject}&body=${body}`);
  };

  if (loading) {
    return (
      <div className="bg-[#23232C] min-h-screen">
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[260px] xl:ml-[290px] 2xl:ml-[310px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} userName={userName} />
          <div className="p-8 flex justify-center items-center h-64">
            <div className="text-white text-sm">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#23232C] min-h-screen">
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[260px] xl:ml-[290px] 2xl:ml-[310px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName={userName} />

        <div className="p-3 sm:p-4 md:p-5 text-white">
          {/* Header */}
          <div className="mb-3">
            <div className="flex items-center mb-1">
              <img src={Dashboard} alt="Dashboard" className="h-5 w-5 mr-2" />
              <h1 className="font-bold text-lg text-white">Dashboard</h1>
            </div>
            <p className="text-sm text-white/80">
              Hi <span className="font-bold text-white">{userName}</span>! Check your progress.
            </p>
          </div>

          <hr className="border-white/30 mb-4 border-1" />

          {/* Overall Performance, Task Completion & Attendance Calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mb-6">
            {/* Overall Performance - First (2 columns) */}
            <OverallPerformanceCard
              overallPerformance={overallPerformance}
              subjectPerformance={subjectPerformance}
              tasksDone={tasksDone}
              totalTasks={totalTasks}
              submissionRate={submissionRate}
            />

            {/* Task Completion - Takes 3 columns on large screens */}
            <div className="lg:col-span-3 bg-[#15151C] rounded-lg shadow p-3 border-2 border-[#15151C]">
              <div className="flex items-center mb-3">
                <img src={Pie} alt="Task Completion" className="h-5 w-5 mr-2" />
                <h2 className="font-bold text-sm text-white">Task Completion</h2>
              </div>

              {/* Main Task Completion Stats */}
              <div className="text-center mb-4">
                <div className="flex items-baseline justify-center mb-2">
                  <p className="text-3xl font-bold text-white">{tasksDone}</p>
                  <p className="text-xl font-bold text-white/60 mx-1">/</p>
                  <p className="text-2xl font-bold text-white/60">{totalTasks}</p>
                </div>
                <p className="text-xs text-white/60 mb-3">Tasks Done vs Total Tasks</p>
                <div className="w-full bg-[#767EE0]/20 rounded-full h-2 mb-2">
                  <div 
                    className="bg-[#767EE0] h-2 rounded-full"
                    style={{ width: `${taskCompletionPercentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-white/80 mb-4">{taskCompletionPercentage}% Complete</p>
              </div>

              {/* Activity Type Breakdown - Now 2 columns only */}
              <div className="grid grid-cols-2 gap-3">
                {/* Missed Activities */}
                <button 
                  onClick={() => handleActivityTypeClick('missed')}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${getActivityStatusColor('missed')}`}
                >
                  <div className="flex items-center justify-center mb-1">
                    {activityAlerts.missed > 0 && (
                      <svg className="w-4 h-4 mr-1 text-[#A15353]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    <p className="text-lg font-bold">{activityAlerts.missed}</p>
                  </div>
                  <p className="text-xs">Missed</p>
                </button>

                {/* Active Activities */}
                <button 
                  onClick={() => handleActivityTypeClick('active')}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${getActivityStatusColor('active')}`}
                >
                  <div className="mb-1">
                    <p className="text-lg font-bold">{activityAlerts.active}</p>
                  </div>
                  <p className="text-xs">Active</p>
                </button>
              </div>
            </div>

            {/* Attendance Calendar - Takes 1 column on large screens (narrower) */}
            <div className="lg:col-span-1 bg-[#15151C] rounded-lg shadow p-3 border-2 border-[#15151C]">
              <div className="flex flex-col h-full">
                {/* Header - Simplified */}
                <div className="mb-3">
                  <div className="flex items-center mb-2">
                    <div className="flex justify-center items-center h-6 w-6 rounded mr-1.5">
                      <img src={CalendarIcon} alt="Calendar" className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="font-bold text-xs text-white">Attendance</h2>
                      <p className="text-[10px] text-white/50">{getMonthName()} {currentYear}</p>
                    </div>
                  </div>
                  
                  {/* Attendance percentage - smaller */}
                  <div className="text-center mb-2">
                    <p className="text-[10px] text-white/80 mb-0.5">This Month</p>
                    <div className="flex items-baseline justify-center">
                      <p className="text-xl font-bold text-white">{attendanceRate}</p>
                      <p className="text-base font-bold text-white ml-0.5">%</p>
                    </div>
                  </div>
                  
                  {/* Progress bar - smaller */}
                  <div className="mb-2">
                    <div className="w-full bg-[#767EE0]/20 rounded-full h-1">
                      <div 
                        className="bg-[#767EE0] h-1 rounded-full"
                        style={{ width: `${attendanceRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Compact Calendar Grid - Smaller */}
                <div className="mb-1.5 flex-grow">
                  <div className="grid grid-cols-7 gap-0.5 mb-0.5">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <div key={index} className="text-center">
                        <p className="text-[8px] text-white/50">{day}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-0.5">
                    {calendarDays.map((day, index) => (
                      <div key={index} className="flex justify-center">
                        {day.isDay ? (
                          <button
                            onClick={() => handleDayClick(day)}
                            disabled={day.isFuture}
                            className={`
                              h-3 w-3 rounded-full border text-[7px] font-medium
                              ${getStatusColor(day.status)}
                              ${day.isToday ? 'ring-0.5 ring-white ring-offset-0.5 ring-offset-[#15151C]' : ''}
                              ${day.isFuture ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 transition-transform cursor-pointer'}
                              flex items-center justify-center
                              ${day.status === 'none' ? 'text-white/40' : 'text-white'}
                            `}
                          >
                            <span className="font-medium">
                              {day.dayNumber}
                            </span>
                          </button>
                        ) : (
                          <div className="h-3 w-3"></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[6px] mt-1 pt-1 border-t border-white/10">
                  <div className="flex items-center gap-0.5">
                    <div className="h-1 w-1 rounded-full bg-[#00A15D]"></div>
                    <span className="text-white/60">Present</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <div className="h-1 w-1 rounded-full bg-[#FFA600]"></div>
                    <span className="text-white/60">Late</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <div className="h-1 w-1 rounded-full bg-[#A15353]"></div>
                    <span className="text-white/60">Absent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Day Activities Modal */}
          <CalendarDetails
            selectedDate={selectedDate}
            selectedDayActivities={selectedDayActivities}
            isCalendarOpen={isCalendarOpen}
            setIsCalendarOpen={setIsCalendarOpen}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            getAttendanceStatusColor={getAttendanceStatusColor}
            getActivityTypeColor={getActivityTypeColor}
          />

          {/* Activity Details Modal Component */}
          <TaskCompletionDetails
            isOpen={isActivityModalOpen}
            onClose={() => setIsActivityModalOpen(false)}
            selectedActivityType={selectedActivityType}
            modalActivities={modalActivities}
            handleViewSchoolWorks={handleViewSchoolWorks}
            handleEmailProfessor={handleEmailProfessor}
            getActivityTypeColor={getActivityTypeColor}
            getActivityStatusColor={getActivityStatusColor}
            getActivityStatusLabel={getActivityStatusLabel}
            formatModalDate={formatModalDate}
            getGradingStatus={getGradingStatus}
          />

          {/* Subject & Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
            {/* Subject Performance - Using the new component */}
            <SubjectPerformance subjectPerformance={subjectPerformance} />

            {/* Recent Activities */}
            <div className="bg-[#15151C] rounded-lg shadow p-3 border-2 border-[#15151C]">
              <h3 className="text-sm font-semibold mb-3 flex items-center text-white">
                <img src={RecentActivity} alt="Activity" className="h-4 w-4 mr-1" />
                Recent Activities
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div key={index} className="p-2 bg-[#23232C] rounded border border-white/5">
                      <div className="flex items-center gap-1 mb-1">
                        <span className={`px-1.5 py-0.5 text-xs rounded border ${getActivityTypeColor(activity.activity_type)}`}>
                          {activity.activity_type}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${
                          activity.submitted ? 'bg-[#00A15D]/20 text-[#00A15D]' : 
                          activity.missing ? 'bg-[#A15353]/20 text-[#A15353]' : 
                          'bg-[#767EE0]/20 text-[#767EE0]'
                        }`}>
                          {activity.submitted ? 'Submitted' : activity.missing ? 'Missed' : 'Assigned'}
                        </span>
                      </div>
                      <p className="text-xs font-medium truncate mb-1 text-white">{activity.subject}: {activity.title}</p>
                      <div className="text-xs text-white/50">{activity.formatted_date}</div>
                    </div>
                  ))
                ) : (
                  <p className="text-white/50 text-center py-3 text-xs">No recent activities</p>
                )}
              </div>
              <div className="flex justify-center mt-3">
                <Link to="/Subjects">
                  <button className="bg-[#00A15D] text-white px-3 py-1 rounded text-xs hover:bg-[#00874E] border-2 border-[#00A15D]/30">
                    View Activities
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Student Info */}
          <div className="bg-[#15151C] rounded-lg shadow mt-3 p-3 text-xs border-2 border-[#15151C]">
            <div className="flex items-center">
              <img src={ID} alt="ID" className="h-4 w-4 mr-1" />
              <p className="font-bold text-xs text-white">{userName}</p>
            </div>
            <hr className="border-white/30 my-2 border-1" />
            <div className="space-y-1">
              <div className="flex">
                <span className="font-medium w-20 text-white/70">Student ID:</span>
                <span className="text-white">{userId || "Loading..."}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-20 text-white/70">Email:</span>
                <span className="truncate text-white">{userEmail || "Loading..."}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-20 text-white/70">Course:</span>
                <span className="text-white">{studentCourse || "Loading..."}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-20 text-white/70">Year Level:</span>
                <span className="text-white">{studentYearLevel || "Loading..."}</span>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            warnings.map((warning, index) => (
              <Link key={index} to={"/AnalyticsStudent"}>
                <div className="bg-[#15151C] rounded-lg shadow mt-2 p-2 text-xs border-2 border-white/10 hover:border-[#00A15D] transition-colors">
                  <div className="flex items-center gap-2">
                    <p className={`font-bold ${
                      warning.type === 'critical' ? 'text-[#A15353]' : 'text-[#FFA600]'
                    }`}>
                      {warning.type === 'critical' ? 'CRITICAL' : 'WARNING'}
                    </p>
                    <p className="flex-1 font-medium text-white">{warning.message}</p>
                    <img src={Details} alt="Details" className="h-4 w-4"/>
                  </div>
                  {warning.suggestion && (
                    <p className="text-white/60 mt-1">{warning.suggestion}</p>
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