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

// Set API base URL based on environment - UPDATED
const API_BASE = window.location.hostname === 'tracked.6minds.site' 
  ? 'https://tracked.6minds.site/Student'  // Changed from '/api' to '/Student'
  : 'http://localhost/TrackEd/Student';    // Added /Student for local too

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
    active: [],
    submitted: []
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
            
            // Use the API_BASE variable - UPDATED PATH
            const response = await fetch(`${API_BASE}/DashboardStudentDB/get_student_info.php?id=${userIdFromStorage}`, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
            });
            
            console.log('Fetching from:', `${API_BASE}/DashboardStudentDB/get_student_info.php?id=${userIdFromStorage}`);
            
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
            } else {
              console.error('Failed to fetch user data:', response.status);
              // Fallback to mock data
              setUserName("John Doe");
              setUserEmail("student@example.com");
              setStudentCourse("Computer Science");
              setStudentYearLevel("2nd Year");
              fetchMockData();
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Fallback to mock data
        setUserName("John Doe");
        setUserEmail("student@example.com");
        setStudentCourse("Computer Science");
        setStudentYearLevel("2nd Year");
        fetchMockData();
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fallback mock data function
  const fetchMockData = () => {
    setTasksDone(14);
    setTotalTasks(20);
    setTaskCompletionPercentage(70);
    setActivityAlerts({
      missed: 3,
      active: 5
    });
    setOverallPerformance(85);
    setPerformanceScore(85);
    setAttendanceRate(90);
    setSubmissionRate(85);
    setRiskLevel("LOW");
    
    // Mock subject performance
    const mockSubjectPerformance = [
      {
        subject: "Mathematics",
        subjectCode: "MATH101",
        percentage: 88,
        academicPercentage: 90,
        attendancePercentage: 85,
        gradedActivities: 5,
        totalActivities: 6,
        section: "A",
        status: 'good',
        statusMessage: '',
        hasGrades: true,
        completionRate: 83,
        attendanceSummary: {
          present_days: 15,
          late_days: 2,
          absent_days: 1,
          total_days: 18
        }
      }
    ];
    
    setSubjectPerformance(mockSubjectPerformance);
    
    // Mock recent activities
    setRecentActivities([
      {
        id: 1,
        title: "Chapter 3 Exercises",
        activity_type: "Assignment",
        subject: "Mathematics",
        subjectCode: "MATH101",
        submitted: true,
        missing: false,
        created_at: "2024-03-10T10:00:00",
        formatted_date: "Mar 10",
        status: 'Submitted'
      }
    ]);
    
    // Mock activity details
    setActivityDetails({
      missed: [
        {
          id: 1,
          subject: "Mathematics",
          subjectCode: "MATH101",
          activity_type: "Assignment",
          title: "Chapter 3 Exercises",
          task_number: "1",
          instructions: "Complete all problems on page 45-47.",
          deadline: "2024-03-15T23:59:00",
          status: "missed",
          professor_ID: "202210602",
          professorEmail: "math.professor@university.edu",
          notes: "Late submissions not accepted",
          points: 20,
          submitted: false,
          late: false
        }
      ],
      active: [
        {
          id: 3,
          subject: "Computer Science",
          subjectCode: "CS301",
          activity_type: "Project",
          title: "Web Application Development",
          task_number: "3",
          instructions: "Develop a full-stack web application.",
          deadline: "2024-03-25T17:00:00",
          status: "active",
          professor_ID: "202210602",
          professorEmail: "cs.professor@university.edu",
          notes: "Group project - teams of 3",
          points: 50,
          submitted: false,
          late: false
        }
      ],
      submitted: [
        {
          id: 4,
          subject: "History",
          subjectCode: "HIST102",
          activity_type: "Research Paper",
          title: "World War II Causes",
          task_number: "4",
          instructions: "Research and analyze the primary causes.",
          deadline: "2024-03-10T23:59:00",
          status: "submitted",
          professor_ID: "202210602",
          professorEmail: "history.professor@university.edu",
          notes: "Chicago citation style required",
          points: 40,
          submitted: true,
          late: false
        }
      ]
    });
    
    // Mock warnings
    setWarnings([]);
  };

  // Month navigation functions
  const goToPreviousMonth = () => {
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear = currentYear - 1;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    
    if (userId) {
      generateCalendarData(userId);
    }
  };

  const goToNextMonth = () => {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear = currentYear + 1;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    
    if (userId) {
      generateCalendarData(userId);
    }
  };

  // Fetch real activity data - UPDATED PATH
  const fetchTaskCompletionData = async (studentId) => {
    try {
      const response = await fetch(`${API_BASE}/DashboardStudentDB/student_activities.php?student_id=${studentId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Activity data:', data);
        
        if (data.success) {
          setTasksDone(data.submitted_activities || 0);
          setTotalTasks(data.total_activities || 0);
          
          const completionPercentage = data.total_activities > 0 
            ? Math.round((data.submitted_activities / data.total_activities) * 100) 
            : 0;
          setTaskCompletionPercentage(completionPercentage);
          
          setActivityAlerts({
            missed: data.missed_activities || 0,
            active: data.active_activities || 0
          });
          
          setActivityDetails({
            missed: data.activities_by_status?.missed || [],
            active: data.activities_by_status?.active || [],
            submitted: data.activities_by_status?.submitted || []
          });
          
          setOverallMissed(data.missed_activities || 0);
        }
      } else {
        console.error('Failed to fetch activity data');
      }
    } catch (error) {
      console.error("Error fetching task completion data:", error);
    }
  };

  const fetchDashboardData = async (studentId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/DashboardStudentDB/get_dashboard_data.php?student_id=${studentId}`);
      
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
      const response = await fetch(`${API_BASE}/AttendanceStudentDB/get_attendance_student.php?student_id=${studentId}`);
      
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
          setAttendanceRate(90); // Fallback
        }
      } else {
        setAttendanceRate(90); // Fallback
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setAttendanceRate(90); // Fallback
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

  // Fetch subject grades - UPDATED PATH
  const fetchSubjectGrades = async (studentId, subjectCode) => {
    try {
      const response = await fetch(`${API_BASE}/SubjectDetailsStudentDB/calculate_subject_performance.php?student_id=${studentId}&subject_code=${subjectCode}`);
      
      if (!response.ok) {
        console.error(`HTTP error for ${subjectCode}: ${response.status}`);
        return {
          percentage: 0,
          academicPercentage: 0,
          attendancePercentage: 0,
          gradedActivities: 0,
          totalActivities: 0,
          hasGrades: false,
          attendanceSummary: {
            present_days: 0,
            late_days: 0,
            absent_days: 0,
            total_days: 0
          }
        };
      }
      
      const data = await response.json();
      
      if (!data.success || !data.performance_data) {
        return {
          percentage: 0,
          academicPercentage: 0,
          attendancePercentage: 0,
          gradedActivities: 0,
          totalActivities: 0,
          hasGrades: false,
          attendanceSummary: {
            present_days: 0,
            late_days: 0,
            absent_days: 0,
            total_days: 0
          }
        };
      }
      
      const perf = data.performance_data;
      
      return {
        percentage: perf.final_percentage,
        academicPercentage: perf.academic_percentage,
        attendancePercentage: perf.attendance_percentage,
        gradedActivities: perf.graded_activities_count,
        totalActivities: perf.total_activities,
        hasGrades: perf.graded_activities_count > 0,
        attendanceSummary: perf.attendance_summary
      };
      
    } catch (error) {
      console.error(`Error fetching performance for ${subjectCode}:`, error);
      return {
        percentage: 0,
        academicPercentage: 0,
        attendancePercentage: 0,
        gradedActivities: 0,
        totalActivities: 0,
        hasGrades: false,
        attendanceSummary: {
          present_days: 0,
          late_days: 0,
          absent_days: 0,
          total_days: 0
        }
      };
    }
  };

  const fetchAnalyticsData = async (studentId) => {
    try {
      const classesResponse = await fetch(`${API_BASE}/SubjectsDB/get_student_classes.php?student_id=${studentId}`);
      
      if (classesResponse.ok) {
        const classesData = await classesResponse.json();
        
        if (classesData.success && classesData.classes) {
          let totalCompleted = 0;
          let totalActivities = 0;
          let totalMissed = 0;
          const subjectPerformanceData = [];
          const allRecentActivities = [];

          for (const subject of classesData.classes) {
            const gradeData = await fetchSubjectGrades(studentId, subject.subject_code);
            
            const analyticsResponse = await fetch(`${API_BASE}/SubjectDetailsStudentDB/get_activities_student.php?student_id=${studentId}&subject_code=${subject.subject_code}`);
            
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
                
                let status = 'good';
                let statusMessage = '';
                
                if (gradeData.hasGrades) {
                  if (gradeData.percentage <= 70) {
                    status = 'failing';
                    statusMessage = 'Failing';
                  } else if (gradeData.percentage >= 71 && gradeData.percentage <= 75) {
                    status = 'warning';
                    statusMessage = 'At Risk';
                  }
                }
                
                subjectPerformanceData.push({
                  subject: subject.subject,
                  subjectCode: subject.subject_code,
                  percentage: gradeData.percentage,
                  academicPercentage: gradeData.academicPercentage,
                  attendancePercentage: gradeData.attendancePercentage,
                  gradedActivities: gradeData.gradedActivities,
                  totalActivities: gradeData.totalActivities,
                  section: subject.section,
                  status: status,
                  statusMessage: statusMessage,
                  hasGrades: gradeData.hasGrades,
                  completionRate: completionRate,
                  attendanceSummary: gradeData.attendanceSummary
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

          subjectPerformanceData.sort((a, b) => {
            const statusPriority = { 'failing': 0, 'warning': 1, 'good': 2 };
            const statusDiff = statusPriority[a.status] - statusPriority[b.status];
            
            if (statusDiff !== 0) return statusDiff;
            
            return a.percentage - b.percentage;
          });

          const sortedRecentActivities = allRecentActivities
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 3);
          
          setRecentActivities(sortedRecentActivities);

          // Overall performance calculation
          const allEnrolledSubjects = subjectPerformanceData;
          let overallPerformanceScore = 0;

          if (allEnrolledSubjects.length > 0) {
            let totalWeightedSum = 0;
            
            allEnrolledSubjects.forEach(subject => {
              if (subject.hasGrades) {
                const subjectPercentage = parseFloat(subject.percentage) || 0;
                totalWeightedSum += subjectPercentage;
              } else {
                const attendancePercentage = parseFloat(subject.attendancePercentage) || 0;
                totalWeightedSum += attendancePercentage;
              }
            });
            
            overallPerformanceScore = Math.round(totalWeightedSum / allEnrolledSubjects.length);
          }
          
          setOverallPerformance(overallPerformanceScore);
          setPerformanceScore(overallPerformanceScore);
          setSubmissionRate(allEnrolledSubjects.length > 0 ? overallPerformanceScore : 0);

          let riskLevelCalc = "LOW";
          if (allEnrolledSubjects.length > 0) {
            const failingSubjects = allEnrolledSubjects.filter(subject => subject.status === 'failing').length;
            const warningSubjects = allEnrolledSubjects.filter(subject => subject.status === 'warning').length;
            
            if (failingSubjects > 0) {
              riskLevelCalc = "HIGH";
            } else if (warningSubjects > 0) {
              riskLevelCalc = "MEDIUM";
            }
          }
          
          setRiskLevel(riskLevelCalc);
          setSubjectPerformance(subjectPerformanceData);

          const warningsList = [];
          
          allEnrolledSubjects.forEach(subject => {
            if (subject.status === 'failing') {
              warningsList.push({
                type: "critical",
                message: `${subject.subject}: Failing (${subject.percentage}%)`,
                suggestion: "Focus on improving this subject immediately"
              });
            } else if (subject.status === 'warning') {
              warningsList.push({
                type: "warning",
                message: `${subject.subject}: At Risk (${subject.percentage}%)`,
                suggestion: "Needs attention to avoid failing"
              });
            }
          });

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
          
          setWarnings(warningsList.slice(0, 3));
        }
      }
    } catch (error) {
      console.error("Error in fetchAnalyticsData:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarData = async (studentId) => {
    try {
      const today = new Date();
      const currentMonthDays = new Date(currentYear, currentMonth + 1, 0).getDate();
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
      
      const daysArray = [];

      for (let i = 0; i < firstDayOfMonth; i++) {
        daysArray.push({
          dayNumber: null,
          isDay: false
        });
      }

      const todayStr = today.toISOString().split('T')[0];
      
      for (let day = 1; day <= currentMonthDays; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dateObj = new Date(dateStr);
        
        const dayOfWeek = dateObj.getDay();
        
        const attendanceData = await fetchDayAttendanceFromDB(studentId, dateStr);
        
        let status = 'none';
        
        if (attendanceData.length > 0) {
          const hasAbsent = attendanceData.some(a => a.status === 'absent');
          const hasLate = attendanceData.some(a => a.status === 'late');
          const allPresent = attendanceData.every(a => a.status === 'present');
          
          if (hasAbsent) {
            status = 'absent';
          } else if (hasLate) {
            status = 'late';
          } else if (allPresent) {
            status = 'present';
          } else if (attendanceData.some(a => a.status === 'present')) {
            status = 'present';
          }
        }

        const activitiesForDay = await fetchDayActivities(studentId, dateStr);
        
        daysArray.push({
          date: dateStr,
          dayNumber: day,
          dayOfWeek,
          status,
          activities: activitiesForDay,
          isToday: dateStr === todayStr,
          isFuture: dateObj > today,
          isDay: true,
          attendanceData: attendanceData
        });
      }

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

  const fetchDayAttendanceFromDB = async (studentId, date) => {
    try {
      const response = await fetch(`${API_BASE}/DashboardStudentDB/get_daily_attendance.php?student_id=${studentId}&date=${date}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.attendance) {
          return data.attendance.map(record => ({
            subject_code: record.subject_code,
            subject: record.subject,
            status: record.status,
            attendance_date: record.attendance_date,
            professor_ID: record.professor_ID
          }));
        }
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching day attendance:", error);
      return [];
    }
  };

  const fetchDayActivities = async (studentId, date) => {
    try {
      const response = await fetch(`${API_BASE}/DashboardStudentDB/get_daily_activities.php?student_id=${studentId}&date=${date}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.activities) {
          return data.activities.map(activity => {
            const status = activity.submitted ? 'submitted' : 
                          (activity.deadline && new Date(activity.deadline) < new Date() ? 'missed' : 'active');
            
            return {
              id: activity.id,
              subject: activity.subject || activity.subject_code,
              subjectCode: activity.subject_code,
              activity_type: activity.activity_type,
              title: activity.title,
              task_number: activity.task_number,
              posted_date: activity.created_at,
              deadline: activity.deadline,
              points: activity.points,
              professor_file_count: activity.professor_file_count || 0,
              submitted: activity.submitted,
              status: status
            };
          });
        }
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching day activities:", error);
      return [];
    }
  };

  const handleActivityTypeClick = (type) => {
    setSelectedActivityType(type);
    setModalActivities(activityDetails[type] || []);
    setIsActivityModalOpen(true);
  };

  const handleViewSchoolWorks = (activity) => {
    setIsActivityModalOpen(false);
    navigate(`/SubjectSchoolWorksStudent?code=${activity.subjectCode}&activityId=${activity.id}`);
  };

  const handleDayClick = (day) => {
    if (!day.isDay || day.isFuture) return;
    
    setSelectedDate(day);
    
    const combinedActivities = day.activities.map(activity => {
      const attendance = day.attendanceData?.find(a => a.subject_code === activity.subjectCode);
      return {
        ...activity,
        attendance_status: attendance ? attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1) : 'No Data'
      };
    });
    
    setSelectedDayActivities(combinedActivities);
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
      case 'Present': return 'text-[#00A15D]';
      case 'Late': return 'text-[#FFA600]';
      case 'Absent': return 'text-[#A15353]';
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
      'Research Paper': 'bg-[#FFA600]/20 text-[#FFA600]',
      'Discussion': 'bg-[#767EE0]/20 text-[#767EE0]'
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
    const isSubmitted = activity.submitted === 1 || activity.submitted === true || activity.submitted === '1' || activity.submitted === true;
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

  const getMonthName = () => {
    const date = new Date(currentYear, currentMonth, 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

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

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mb-6">
            <OverallPerformanceCard
              overallPerformance={overallPerformance}
              subjectPerformance={subjectPerformance}
              tasksDone={tasksDone}
              totalTasks={totalTasks}
              submissionRate={submissionRate}
            />

            <div className="lg:col-span-3 bg-[#15151C] rounded-lg shadow p-3 border-2 border-[#15151C]">
              <div className="flex items-center mb-3">
                <img src={Pie} alt="Task Completion" className="h-5 w-5 mr-2" />
                <h2 className="font-bold text-sm text-white">Task Completion</h2>
              </div>

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

              <div className="grid grid-cols-2 gap-3">
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

            <div className="lg:col-span-1 bg-[#15151C] rounded-lg shadow p-3 border-2 border-[#15151C]">
              <div className="flex flex-col h-full">
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="flex justify-center items-center h-6 w-6 rounded mr-1.5">
                        <img src={CalendarIcon} alt="Calendar" className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="font-bold text-xs text-white">Attendance</h2>
                        <p className="text-[10px] text-white/50">{getMonthName()} {currentYear}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={goToPreviousMonth}
                        className="text-white/70 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
                        title="Previous month"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={goToNextMonth}
                        className="text-white/70 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
                        title="Next month"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center mb-2">
                    <p className="text-[10px] text-white/80 mb-0.5">This Month</p>
                    <div className="flex items-baseline justify-center">
                      <p className="text-xl font-bold text-white">{attendanceRate}</p>
                      <p className="text-base font-bold text-white ml-0.5">%</p>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="w-full bg-[#767EE0]/20 rounded-full h-1">
                      <div 
                        className="bg-[#767EE0] h-1 rounded-full"
                        style={{ width: `${attendanceRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

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

          <CalendarDetails
            selectedDate={selectedDate}
            selectedDayActivities={selectedDayActivities}
            isCalendarOpen={isCalendarOpen}
            setIsCalendarOpen={setIsCalendarOpen}
            getStatusColor={getStatusColor}
            getStatusText={getStatusText}
            getAttendanceStatusColor={getAttendanceStatusColor}
            getActivityTypeColor={getActivityTypeColor}
            currentMonth={currentMonth}
            currentYear={currentYear}
            setCurrentMonth={setCurrentMonth}
            setCurrentYear={setCurrentYear}
            generateCalendarData={generateCalendarData}
            userId={userId}
          />

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
            userName={userName}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-6">
            <SubjectPerformance subjectPerformance={subjectPerformance} />

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
        </div>
      </div>
    </div>
  )
}