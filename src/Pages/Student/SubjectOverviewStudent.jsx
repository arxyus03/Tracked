import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import StudentPerformanceSummary from "../../Components/StudentComponents/StudentPerformanceSummary";

// Import assets
import Announcement from "../../assets/Announcement.svg";
import BackButton from '../../assets/BackButton.svg';
import StudentsIcon from "../../assets/StudentList.svg";
import Classwork from "../../assets/Classwork.svg";
import Attendance from "../../assets/Attendance.svg";
import Analytics from "../../assets/Analytics.svg";
import SubjectOverview from "../../assets/SubjectOverview.svg";
import EmailIcon from "../../assets/Email.svg";
import DetailsIcon from "../../assets/Details.svg";

// SVG Icons
const PassedIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const LowGradeIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);

const MissedIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const AssignedIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
  </svg>
);

const FailedIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

const AllActivitiesIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const ChevronDownIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

export default function SubjectOverviewStudent() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get('code');
  
  const [isOpen, setIsOpen] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [currentSubject, setCurrentSubject] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false); // Added theme state

  // New state for activities breakdown
  const [activitiesBreakdown, setActivitiesBreakdown] = useState({
    all: [],
    passed: [],
    low: [],
    failed: [],
    missed: [],
    assigned: [], // Changed from pending to assigned
    counts: {
      total: 0,
      passed: 0,
      low: 0,
      failed: 0,
      missed: 0,
      assigned: 0 // Changed from pending to assigned
    }
  });

  const [performanceData, setPerformanceData] = useState({
    percentage: 0,
    academic_percentage: 0,
    attendance_percentage: 0,
    activitiesNeeded: [],
    lowGradeActivities: [],
    missedActivities: [],
    absences: 0,
    teacherEmail: "",
    teacherName: "",
    teacherId: "",
    calculation_details: {
      academic_contribution: 0,
      attendance_contribution: 0
    }
  });

  // Add loading state for performance data
  const [performanceDataLoading, setPerformanceDataLoading] = useState(true);

  const [expandedSections, setExpandedSections] = useState({
    all: false,
    passed: false,
    low: false,
    failed: false,
    missed: false,
    assigned: false // Changed from pending to assigned
  });

  const [currentPage, setCurrentPage] = useState({
    all: 1,
    passed: 1,
    low: 1,
    failed: 1,
    missed: 1,
    assigned: 1 // Changed from pending to assigned
  });

  // Email modal state (similar to StudentPerformanceSummary.jsx)
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailType, setEmailType] = useState('specific_activity');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [, setSelectedActivityForEmail] = useState(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const itemsPerPage = 10;

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    // Check initial theme
    handleThemeChange();
    
    // Listen for theme changes
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => observer.disconnect();
  }, []);

  // Handle screen size responsiveness
  useEffect(() => {
    const checkScreenSize = () => {
      setIsOpen(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Get student ID and name from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setStudentId(userData.id || userData.tracked_ID || '');
        
        // Get student name from various possible fields
        let name = '';
        if (userData.name) {
          name = userData.name;
        } else if (userData.tracked_firstname && userData.tracked_lastname) {
          name = `${userData.tracked_firstname} ${userData.tracked_lastname}`;
        } else if (userData.first_name && userData.last_name) {
          name = `${userData.first_name} ${userData.last_name}`;
        } else {
          name = 'Student';
        }
        setStudentName(name);
        
        // Get student email
        setStudentEmail(userData.email || userData.tracked_email || '');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    if (studentId && subjectCode) {
      fetchStudentClasses();
    }
  }, [studentId, subjectCode]);

  useEffect(() => {
    if (studentId) fetchAttendanceData();
  }, [studentId]);

  // Fetch performance data from the API
  const fetchPerformanceData = async () => {
    if (!subjectCode || !studentId) return;
    
    try {
      setPerformanceDataLoading(true);
      const response = await fetch(`https://tracked.6minds.site/Student/SubjectDetailsStudentDB/get_performance_data.php?student_id=${studentId}&subject_code=${subjectCode}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('Performance Data:', data); // Debug log
          setPerformanceData({
            percentage: parseFloat(data.percentage) || 0,
            academic_percentage: parseFloat(data.academic_percentage) || 0,
            attendance_percentage: parseFloat(data.attendance_percentage) || 0,
            activitiesNeeded: data.activities_needed || [],
            lowGradeActivities: data.low_grade_activities || [],
            missedActivities: [],
            absences: 0,
            teacherEmail: data.teacherEmail || "",
            teacherName: data.teacherName || "",
            teacherId: data.teacherId || "",
            calculation_details: data.calculation_details || {
              academic_contribution: 0,
              attendance_contribution: 0
            }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setPerformanceDataLoading(false);
    }
  };

  useEffect(() => {
    if (subjectCode && studentId) {
      fetchPerformanceData();
      fetchActivitiesBreakdown();
      fetchTeacherInfo();
    }
  }, [subjectCode, studentId]);

  // Calculate attendance warnings
  const calculateAttendanceWarnings = useMemo(() => {
    if (!attendanceData.length) return { overallWarning: false, subjectWarnings: [] };

    let hasOverallWarning = false;
    const subjectWarnings = attendanceData.map(subject => {
      const equivalentAbsences = Math.floor(subject.late / 3);
      const totalEffectiveAbsences = subject.absent + equivalentAbsences;
      const hasWarning = totalEffectiveAbsences >= 2;
      const isAtRisk = totalEffectiveAbsences >= 3;
      
      if (hasWarning) hasOverallWarning = true;

      return {
        ...subject,
        equivalentAbsences,
        totalEffectiveAbsences,
        hasWarning,
        isAtRisk
      };
    });

    return { overallWarning: hasOverallWarning, subjectWarnings };
  }, [attendanceData]);

  // Get subject-specific attendance
  const subjectAttendance = useMemo(() => {
    if (!currentSubject || !attendanceData.length) return { absent: 0, late: 0 };
    
    return attendanceData.find(sub => 
      sub.subject_name?.includes(currentSubject.subject) || 
      sub.subject_code === subjectCode
    ) || { absent: 0, late: 0 };
  }, [currentSubject, attendanceData, subjectCode]);

  // Theme-based style functions
  const getBackgroundColor = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-gray-50";
  };

  const getCardBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getInputBackgroundColor = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-gray-100";
  };

  const getInputFocusBorderColor = () => {
    return isDarkMode ? "focus:border-[#00A15D]" : "focus:border-[#00A15D]";
  };

  const getTextColor = () => {
    return isDarkMode ? "text-[#FFFFFF]" : "text-gray-900";
  };

  const getSecondaryTextColor = () => {
    return isDarkMode ? "text-[#FFFFFF]/80" : "text-gray-600";
  };

  const getMutedTextColor = () => {
    return isDarkMode ? "text-[#FFFFFF]/50" : "text-gray-500";
  };

  const getDividerColor = () => {
    return isDarkMode ? "border-[#FFFFFF]/30" : "border-gray-300";
  };

  const getButtonBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-gray-100";
  };

  const getActionButtonBackground = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-gray-200";
  };

  const getActionButtonHover = () => {
    return isDarkMode ? "hover:border-[#00A15D]" : "hover:border-[#00A15D]";
  };

  const getPopupBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getWarningBackground = () => {
    return isDarkMode ? "bg-[#FFA600]/10" : "bg-yellow-50";
  };

  const getWarningBorder = () => {
    return isDarkMode ? "border-[#FFA600]/30" : "border-yellow-200";
  };

  const getWarningText = () => {
    return isDarkMode ? "text-[#FFA600]" : "text-yellow-600";
  };

  const getErrorBackground = () => {
    return isDarkMode ? "bg-[#A15353]/10" : "bg-red-50";
  };

  const getErrorBorder = () => {
    return isDarkMode ? "border-[#A15353]/30" : "border-red-200";
  };

  const getErrorText = () => {
    return isDarkMode ? "text-[#A15353]" : "text-red-600";
  };

  // Helper functions
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
    if (!expandedSections[section]) {
      setCurrentPage(prev => ({
        ...prev,
        [section]: 1
      }));
    }
  };

  const handlePageChange = (section, direction) => {
    setCurrentPage(prev => {
      const current = prev[section];
      const activities = activitiesBreakdown[section];
      const totalPages = Math.ceil(activities.length / itemsPerPage);
      
      if (direction === 'next' && current < totalPages) {
        return { ...prev, [section]: current + 1 };
      } else if (direction === 'prev' && current > 1) {
        return { ...prev, [section]: current - 1 };
      }
      return prev;
    });
  };

  // API functions
  const fetchStudentClasses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://tracked.6minds.site/Student/SubjectsDB/get_student_classes.php?student_id=${studentId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.classes) {
          setSubjects(data.classes);
          const currentSubj = data.classes.find(sub => sub.subject_code === subjectCode);
          if (currentSubj) setCurrentSubject(currentSubj);
        } else {
          setSubjects([]);
        }
      }
    } catch (error) {
      console.error('Error fetching student classes:', error);
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceData = async () => {
    if (!studentId) return;

    try {
      const response = await fetch(`https://tracked.6minds.site/Student/AttendanceStudentDB/get_attendance_student.php?student_id=${studentId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAttendanceData(data.attendance_summary);
        }
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  // Fetch activities breakdown
  const fetchActivitiesBreakdown = async () => {
    if (!subjectCode || !studentId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`https://tracked.6minds.site/Student/SubjectDetailsStudentDB/get_activities_breakdown.php?student_id=${studentId}&subject_code=${subjectCode}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update field names from pending to assigned
          const breakdown = data.breakdown;
          setActivitiesBreakdown({
            all: breakdown.all || [],
            passed: breakdown.passed || [],
            low: breakdown.low || [],
            failed: breakdown.failed || [],
            missed: breakdown.missed || [],
            assigned: breakdown.pending || [], // Map pending to assigned
            counts: {
              total: breakdown.counts?.total || 0,
              passed: breakdown.counts?.passed || 0,
              low: breakdown.counts?.low || 0,
              failed: breakdown.counts?.failed || 0,
              missed: breakdown.counts?.missed || 0,
              assigned: breakdown.counts?.pending || 0 // Map pending to assigned
            }
          });
        } else {
          // Set empty breakdown
          setActivitiesBreakdown({
            all: [],
            passed: [],
            low: [],
            failed: [],
            missed: [],
            assigned: [],
            counts: {
              total: 0,
              passed: 0,
              low: 0,
              failed: 0,
              missed: 0,
              assigned: 0
            }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching activities breakdown:', error);
      setActivitiesBreakdown({
        all: [],
        passed: [],
        low: [],
        failed: [],
        missed: [],
        assigned: [],
        counts: {
          total: 0,
          passed: 0,
          low: 0,
          failed: 0,
          missed: 0,
          assigned: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTeacherInfo = async () => {
    if (!subjectCode) return;
    
    try {
      const response = await fetch(`https://tracked.6minds.site/Student/SubjectDetailsStudentDB/get_teacher_info.php?subject_code=${subjectCode}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPerformanceData(prev => ({
            ...prev,
            teacherEmail: data.teacher_email || "",
            teacherName: data.teacher_name || "",
            teacherId: data.teacher_id || ""
          }));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error fetching teacher info:', error);
      return false;
    }
  };

  // Calculate performance summary based on breakdown
  const performanceSummary = useMemo(() => {
    if (!currentSubject || !activitiesBreakdown.all.length) {
      return {
        percentage: performanceData.percentage || 0,
        message: "Calculating your performance...",
        status: "loading",
        needsImprovement: false,
        critical: false,
        suggestions: [],
        totalEffectiveAbsences: 0,
        passedCount: 0,
        lowCount: 0,
        failedCount: 0,
        missedCount: 0,
        assignedCount: 0, // Changed from pendingCount
        suggestionsData: {
          missed: [],
          failed: [],
          low: [],
          assigned: [], // Changed from pending
          absences: []
        }
      };
    }

    const percentage = performanceData.percentage || 0;
    const equivalentAbsences = Math.floor(subjectAttendance.late / 3);
    const totalEffectiveAbsences = subjectAttendance.absent + equivalentAbsences;

    let message = "";
    let status = "";
    let needsImprovement = false;
    let critical = false;
    const suggestions = [];
    
    // Prepare suggestions data for dropdown
    const suggestionsData = {
      missed: activitiesBreakdown.missed,
      failed: activitiesBreakdown.failed,
      low: activitiesBreakdown.low,
      assigned: activitiesBreakdown.assigned, // Changed from pending
      absences: totalEffectiveAbsences > 0 ? [{
        type: 'absences',
        count: totalEffectiveAbsences,
        absent: subjectAttendance.absent,
        late: subjectAttendance.late
      }] : []
    };

    if (percentage >= 75) {
      message = "You're above the minimum passing grade! Keep up the good work! 🎉";
      status = "excellent";
    } else if (percentage >= 71) {
      message = "You're close to the minimum passing grade. Focus on improving low-grade activities!";
      status = "warning";
      needsImprovement = true;
      
      if (activitiesBreakdown.counts.low > 0) {
        suggestions.push({
          text: `Improve ${activitiesBreakdown.counts.low} activity with grade 75-79%`,
          type: 'low',
          count: activitiesBreakdown.counts.low
        });
      }
      
      if (activitiesBreakdown.counts.failed > 0) {
        suggestions.push({
          text: `Review ${activitiesBreakdown.counts.failed} failed activities`,
          type: 'failed',
          count: activitiesBreakdown.counts.failed
        });
      }
    } else {
      message = "You need to improve your performance. Consider the following actions:";
      status = "critical";
      needsImprovement = true;
      critical = percentage < 50;

      if (activitiesBreakdown.counts.missed > 0) {
        suggestions.push({
          text: `You missed ${activitiesBreakdown.counts.missed} activities`,
          type: 'missed',
          count: activitiesBreakdown.counts.missed
        });
      }

      if (activitiesBreakdown.counts.failed > 0) {
        suggestions.push({
          text: `Review ${activitiesBreakdown.counts.failed} failed activities`,
          type: 'failed',
          count: activitiesBreakdown.counts.failed
        });
      }

      if (activitiesBreakdown.counts.low > 0) {
        suggestions.push({
          text: `Improve ${activitiesBreakdown.counts.low} activity with grade 75-79%`,
          type: 'low',
          count: activitiesBreakdown.counts.low
        });
      }

      if (activitiesBreakdown.counts.assigned > 0) {
        suggestions.push({
          text: `Submit ${activitiesBreakdown.counts.assigned} assigned activities`, // Updated text
          type: 'assigned', // Changed from pending
          count: activitiesBreakdown.counts.assigned
        });
      }

      if (totalEffectiveAbsences > 0) {
        suggestions.push({
          text: `Reduce absences (${subjectAttendance.absent} absents, ${subjectAttendance.late} lates)`,
          type: 'absences',
          count: totalEffectiveAbsences
        });
      }
    }

    if (percentage < 50) {
      message = "Passing the semester is challenging. Contact your teacher immediately for guidance!";
      status = "urgent";
      critical = true;
    }

    return {
      percentage,
      message,
      status,
      needsImprovement,
      critical,
      suggestions,
      totalEffectiveAbsences,
      passedCount: activitiesBreakdown.counts.passed,
      lowCount: activitiesBreakdown.counts.low,
      failedCount: activitiesBreakdown.counts.failed,
      missedCount: activitiesBreakdown.counts.missed,
      assignedCount: activitiesBreakdown.counts.assigned, // Changed from pendingCount
      suggestionsData
    };
  }, [currentSubject, activitiesBreakdown, performanceData.percentage, subjectAttendance]);

  // Email functions - Updated to match StudentPerformanceSummary.jsx
  const handleEmailTeacherAboutActivity = (activity) => {
    // Check if teacher email is available
    if (!performanceData?.teacherEmail) {
      // Try to get teacher info first
      fetchTeacherInfo().then(() => {
        // After fetching, check again
        if (!performanceData?.teacherEmail) {
          alert("Professor email not available. Please contact your professor directly.");
          return;
        } else {
          // Continue with email setup after fetching
          setupEmailModal(activity);
        }
      }).catch(() => {
        alert("Professor email not available. Please contact your professor directly.");
      });
    } else {
      // Teacher email is already available
      setupEmailModal(activity);
    }
  };

  const setupEmailModal = (activity) => {
    setSelectedActivityForEmail(activity);
    setEmailType('specific_activity');
    
    // Generate email message similar to StudentPerformanceSummary.jsx
    const teacherName = performanceData?.teacherName || 'Professor';
    const percentage = activity.grade !== null && activity.points > 0 ? 
      Math.round((activity.grade / activity.points) * 100) : null;
    
    const subject = `Question about ${activity.activity_type} ${activity.task_number} - ${currentSubject?.subject || 'Subject'}`;
    
    // Format student name similar to StudentPerformanceSummary.jsx
    const formatStudentName = (fullName) => {
      if (!fullName) return 'Student';
      
      const nameParts = fullName.trim().split(' ');
      const cleanNameParts = nameParts.filter(part => part.trim() !== '');
      
      if (cleanNameParts.length === 0) return fullName;
      if (cleanNameParts.length === 1) return cleanNameParts[0];
      
      const surname = cleanNameParts[cleanNameParts.length - 1];
      const firstName = cleanNameParts[0];
      const middleParts = cleanNameParts.slice(1, -1);
      
      let middleInitials = '';
      if (middleParts.length > 0) {
        middleInitials = middleParts.map(part => {
          const cleanPart = part.replace(/[^\w]/g, '');
          return cleanPart.charAt(0) + '.';
        }).join(' ');
      }
      
      let result = `${surname}, ${firstName}`;
      if (middleInitials) {
        result += ` ${middleInitials}`;
      }
      
      return result.trim();
    };
    
    const finalFormattedName = formatStudentName(studentName);
    
    let message = `Dear ${teacherName},

I have a question regarding the following activity:

STUDENT INFORMATION:
- Student ID: ${studentId}
- Student Name: ${finalFormattedName}
${studentEmail ? `- Student Email: ${studentEmail}\n` : ''}- Subject: ${currentSubject?.subject || ''}
- Section: ${currentSubject?.section || ''}
- Subject Code: ${subjectCode}

ACTIVITY DETAILS:
- Activity Type: ${activity.activity_type}
- Task Number: ${activity.task_number}
- Title: ${activity.title}
- Deadline: ${activity.deadline ? new Date(activity.deadline).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : 'No deadline'}
- Status: ${activity.status}
- Score: ${activity.grade !== null ? `${activity.grade}/${activity.points}` : 'Not graded yet'}
${percentage !== null ? `- Percentage: ${percentage}%\n` : ''}

MY QUESTION:
[Please state your specific question about this activity here]

Thank you for your time and assistance.

Sincerely,
${finalFormattedName}
Student ID: ${studentId}
${studentEmail ? `Email: ${studentEmail}` : ''}`;
    
    setEmailSubject(subject);
    setEmailMessage(message);
    setShowEmailModal(true);
  };

  // Email modal functions (similar to StudentPerformanceSummary.jsx)
  const handleSendEmail = () => {
    const teacherEmail = performanceData?.teacherEmail;
    
    if (!teacherEmail) {
      // Try to fetch teacher info one more time
      fetchTeacherInfo().then(() => {
        if (!performanceData?.teacherEmail) {
          alert("Professor email not available. Please contact your professor directly.");
          return;
        } else {
          sendEmailWithTeacherInfo();
        }
      }).catch(() => {
        alert("Professor email not available. Please contact your professor directly.");
      });
      return;
    }

    sendEmailWithTeacherInfo();
  };

  const sendEmailWithTeacherInfo = () => {
    const teacherEmail = performanceData?.teacherEmail;
    
    if (!teacherEmail) {
      alert("Professor email not available. Please contact your professor directly.");
      return;
    }

    const encodedSubject = encodeURIComponent(emailSubject);
    const encodedBody = encodeURIComponent(emailMessage);
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(teacherEmail)}&su=${encodedSubject}&body=${encodedBody}`;
    
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    
    setShowEmailModal(false);
  };

  const handleViewActivityDetails = (activity) => {
    window.location.href = `/SubjectSchoolWorksStudent?code=${subjectCode}&activity=${activity.id}`;
  };

  // Email Modal Component
  const EmailModal = () => {
    const getButtonLabel = () => {
      switch(emailType) {
        case 'specific_activity': return 'Ask About Activity';
        default: return 'Send Email';
      }
    };

    const handleSendEmailClick = () => {
      setIsCheckingEmail(true);
      // Use a small timeout to ensure state updates
      setTimeout(() => {
        handleSendEmail();
        setIsCheckingEmail(false);
      }, 100);
    };

    return (
      <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4">
        <div className={`${getPopupBackgroundColor()} rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border ${isDarkMode ? 'border-[#FFFFFF]/10' : 'border-gray-200'}`}>
          {/* Header */}
          <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-[#FFFFFF]/10' : 'border-gray-200'}`}>
            <div>
              <h3 className={`text-lg font-semibold ${getTextColor()}`}>Email Professor</h3>
              <p className={`text-sm ${getSecondaryTextColor()} mt-0.5`}>
                {performanceData?.teacherName || 'Professor'} • {performanceData?.teacherEmail || 'Fetching email...'}
              </p>
            </div>
            <button
              onClick={() => setShowEmailModal(false)}
              className={`p-1.5 ${isDarkMode ? 'hover:bg-[#23232C]' : 'hover:bg-gray-100'} rounded transition-colors cursor-pointer`}
              disabled={isCheckingEmail}
            >
              <svg className={`w-5 h-5 ${getTextColor()}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Email Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <label className={`block text-sm font-medium ${getTextColor()} mb-1`}>Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className={`w-full px-3 py-2 ${getInputBackgroundColor()} border ${isDarkMode ? 'border-[#FFFFFF]/20' : 'border-gray-300'} rounded ${getTextColor()} text-sm focus:outline-none ${getInputFocusBorderColor()}`}
                  placeholder="Email subject"
                  disabled={isCheckingEmail}
                />
              </div>

              {/* Message */}
              <div>
                <label className={`block text-sm font-medium ${getTextColor()} mb-1`}>Message</label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  rows={12}
                  className={`w-full px-3 py-2 ${getInputBackgroundColor()} border ${isDarkMode ? 'border-[#FFFFFF]/20' : 'border-gray-300'} rounded ${getTextColor()} text-sm focus:outline-none ${getInputFocusBorderColor()} resize-none`}
                  placeholder="Write your message here..."
                  disabled={isCheckingEmail}
                />
              </div>

              {/* Email Preview Info */}
              <div className={`${getInputBackgroundColor()} rounded-lg p-3 border ${isDarkMode ? 'border-[#FFFFFF]/10' : 'border-gray-200'}`}>
                <h4 className={`text-sm font-medium ${getTextColor()} mb-2`}>Email Preview</h4>
                <div className="space-y-2 text-xs text-[#FFFFFF]/70">
                  <p><strong className={getTextColor()}>To:</strong> {performanceData?.teacherEmail || 'Fetching email...'}</p>
                  <p><strong className={getTextColor()}>Subject:</strong> {emailSubject || 'No subject'}</p>
                  <div className={`mt-2 p-2 ${getCardBackgroundColor()} rounded border ${isDarkMode ? 'border-[#FFFFFF]/5' : 'border-gray-200'}`}>
                    <p className={`text-xs ${getMutedTextColor()} whitespace-pre-wrap`}>{emailMessage.substring(0, 150)}...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`flex justify-end gap-2 p-4 border-t ${isDarkMode ? 'border-[#FFFFFF]/10' : 'border-gray-200'} ${isDarkMode ? 'bg-[#23232C]/30' : 'bg-gray-50'}`}>
            <button
              onClick={() => setShowEmailModal(false)}
              disabled={isCheckingEmail}
              className={`px-4 py-2 text-sm font-medium ${getSecondaryTextColor()} ${isDarkMode ? 'bg-[#2D2D3A]' : 'bg-gray-200'} border ${isDarkMode ? 'border-[#FFFFFF]/20' : 'border-gray-300'} rounded transition-colors cursor-pointer ${
                isCheckingEmail ? 'opacity-50 cursor-not-allowed' : isDarkMode ? 'hover:bg-[#374151]' : 'hover:bg-gray-300'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSendEmailClick}
              disabled={!emailSubject.trim() || !emailMessage.trim() || isCheckingEmail}
              className={`px-4 py-2 text-sm font-medium text-white rounded transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                !emailSubject.trim() || !emailMessage.trim() || isCheckingEmail
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#767EE0] to-[#5a62c4] hover:opacity-90'
              }`}
            >
              {isCheckingEmail ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Checking email...</span>
                </>
              ) : (
                <span>{getButtonLabel()} via Gmail</span>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render categorized activity table
  const renderActivityTable = (title, activities, type, icon, color) => {
    if (!activities.length) return null;

    const isExpanded = expandedSections[type];
    const currentPageNum = currentPage[type];
    const totalPages = Math.ceil(activities.length / itemsPerPage);
    const startIndex = (currentPageNum - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedActivities = activities.slice(startIndex, endIndex);

    const getStatusColor = (activity) => {
      if (activity.status === 'passed') return 'bg-[#00A15D]/20 text-[#00A15D]';
      if (activity.status === 'low') return 'bg-[#FFA600]/20 text-[#FFA600]';
      if (activity.status === 'failed') return 'bg-[#A15353]/20 text-[#A15353]';
      if (activity.status === 'missed') return 'bg-[#A15353]/20 text-[#A15353]';
      return 'bg-[#767EE0]/20 text-[#767EE0]'; // For assigned
    };

    return (
      <div className={`${getCardBackgroundColor()} rounded-lg border ${isDarkMode ? 'border-[#FFFFFF]/10' : 'border-gray-200'} mb-3 overflow-hidden`}>
        <div 
          className={`cursor-pointer transition-all duration-200 ${
            isExpanded 
              ? `p-3 border-b ${isDarkMode ? 'border-[#FFFFFF]/10' : 'border-gray-200'}` 
              : `p-2 ${isDarkMode ? 'hover:bg-[#1E1E24]' : 'hover:bg-gray-50'}`
          }`}
          onClick={() => toggleSection(type)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 ${
                isExpanded 
                  ? 'w-8 h-8' 
                  : 'w-6 h-6'
              } rounded-full flex items-center justify-center ${color}/20`}>
                <div className={`${color}`}>
                  {icon}
                </div>
              </div>
              <div>
                <h3 className={`font-semibold ${getTextColor()} ${
                  isExpanded 
                    ? 'text-base' 
                    : 'text-sm'
                }`}>
                  {title}
                </h3>
                <div className={`flex items-center gap-2 ${
                  isExpanded 
                    ? 'text-xs' 
                    : 'text-xs'
                } ${getSecondaryTextColor()}`}>
                  <span>{activities.length} {activities.length === 1 ? 'activity' : 'activities'}</span>
                  <span className={getSecondaryTextColor()}>•</span>
                  <span>
                    {type === 'passed' && '≥80% score'}
                    {type === 'low' && '75-79% score'}
                    {type === 'failed' && '<75% score'}
                    {type === 'missed' && 'Missed deadline'}
                    {type === 'assigned' && 'Awaiting submission/grade'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <button className={`${getTextColor()} ${isDarkMode ? 'hover:text-[#FFFFFF]/80' : 'hover:text-gray-700'} transition-colors`}>
                {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </button>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="p-3 pt-0 animate-slideDown">
            <div className="overflow-x-auto mb-4">
              <table className="w-full min-w-full">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-[#FFFFFF]/10' : 'border-gray-200'}`}>
                    <th className={`text-left py-2 px-3 text-xs font-semibold ${getSecondaryTextColor()}`}>Activity</th>
                    <th className={`text-left py-2 px-3 text-xs font-semibold ${getSecondaryTextColor()}`}>Title</th>
                    <th className={`text-left py-2 px-3 text-xs font-semibold ${getSecondaryTextColor()}`}>Deadline</th>
                    <th className={`text-left py-2 px-3 text-xs font-semibold ${getSecondaryTextColor()}`}>Score</th>
                    <th className={`text-left py-2 px-3 text-xs font-semibold ${getSecondaryTextColor()}`}>Percentage</th>
                    <th className={`text-left py-2 px-3 text-xs font-semibold ${getSecondaryTextColor()} w-24`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedActivities.map((activity) => {
                    const percentage = activity.grade !== null ? Math.round((activity.grade / activity.points) * 100) : null;
                    return (
                      <tr key={activity.id} className={`border-b ${isDarkMode ? 'border-[#FFFFFF]/5' : 'border-gray-100'} ${isDarkMode ? 'hover:bg-[#23232C]/30' : 'hover:bg-gray-50'} transition-colors`}>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(activity)}`}>
                              {activity.activity_type} #{activity.task_number}
                            </span>
                          </div>
                        </td>
                        <td className={`py-2 px-3 text-xs ${getTextColor()} truncate max-w-[150px]`}>{activity.title}</td>
                        <td className={`py-2 px-3 text-xs ${getSecondaryTextColor()}`}>
                          {activity.deadline ? new Date(activity.deadline).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'No deadline'}
                        </td>
                        <td className="py-2 px-3">
                          {activity.grade !== null ? (
                            <div className="flex items-center">
                              <span className={`text-xs font-semibold ${
                                percentage >= 80 ? 'text-[#00A15D]' : 
                                percentage >= 75 ? 'text-[#FFA600]' : 
                                'text-[#A15353]'
                              }`}>
                                {activity.grade}/{activity.points}
                              </span>
                            </div>
                          ) : (
                            <span className={`text-xs ${getMutedTextColor()}`}>-</span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          {percentage !== null ? (
                            <span className={`text-xs font-semibold ${
                              percentage >= 80 ? 'text-[#00A15D]' : 
                              percentage >= 75 ? 'text-[#FFA600]' : 
                              'text-[#A15353]'
                            }`}>
                              {percentage}%
                            </span>
                          ) : (
                            <span className={`text-xs ${getMutedTextColor()}`}>-</span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleViewActivityDetails(activity)}
                              className={`p-1 rounded ${isDarkMode ? 'hover:bg-[#FFFFFF]/10' : 'hover:bg-gray-200'} transition-colors group`}
                              title="View Details"
                            >
                              <img src={DetailsIcon} alt="Details" className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100"
                                style={!isDarkMode ? { filter: 'invert(0.5)' } : {}} />
                            </button>
                            <button
                              onClick={() => handleEmailTeacherAboutActivity(activity)}
                              className={`p-1 rounded ${isDarkMode ? 'hover:bg-[#FFFFFF]/10' : 'hover:bg-gray-200'} transition-colors group`}
                              title="Email Teacher"
                            >
                              <img src={EmailIcon} alt="Email" className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100"
                                style={!isDarkMode ? { filter: 'invert(0.5)' } : {}} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className={`flex items-center justify-between border-t ${isDarkMode ? 'border-[#FFFFFF]/10' : 'border-gray-200'} pt-3`}>
                <div className={`text-xs ${getSecondaryTextColor()}`}>
                  Showing {startIndex + 1}-{Math.min(endIndex, activities.length)} of {activities.length} activities
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(type, 'prev')}
                    disabled={currentPageNum === 1}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      currentPageNum === 1
                        ? `${getCardBackgroundColor()} ${getMutedTextColor()} cursor-not-allowed`
                        : `${getActionButtonBackground()} ${getTextColor()} ${isDarkMode ? 'hover:bg-[#2A2A35]' : 'hover:bg-gray-300'}`
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPageNum <= 3) {
                        pageNum = i + 1;
                      } else if (currentPageNum >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPageNum - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(prev => ({ ...prev, [type]: pageNum }))}
                          className={`w-8 h-8 text-xs rounded-md transition-colors ${
                            currentPageNum === pageNum
                              ? 'bg-[#FF5252] text-white'
                              : `${getActionButtonBackground()} ${getTextColor()} ${isDarkMode ? 'hover:bg-[#2A2A35]' : 'hover:bg-gray-300'}`
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(type, 'next')}
                    disabled={currentPageNum === totalPages}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      currentPageNum === totalPages
                        ? `${getCardBackgroundColor()} ${getMutedTextColor()} cursor-not-allowed`
                        : `${getActionButtonBackground()} ${getTextColor()} ${isDarkMode ? 'hover:bg-[#2A2A35]' : 'hover:bg-gray-300'}`
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render all activities table
  const renderAllActivitiesTable = () => {
    const activities = activitiesBreakdown.all;
    if (!activities.length) return null;

    const isExpanded = expandedSections.all;
    const currentPageNum = currentPage.all;
    const totalPages = Math.ceil(activities.length / itemsPerPage);
    const startIndex = (currentPageNum - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedActivities = activities.slice(startIndex, endIndex);

    const counts = activitiesBreakdown.counts;

    return (
      <div className={`${getCardBackgroundColor()} rounded-lg border ${isDarkMode ? 'border-[#FFFFFF]/10' : 'border-gray-200'} mb-3 overflow-hidden`}>
        <div 
          className={`cursor-pointer transition-all duration-200 ${
            isExpanded 
              ? `p-3 border-b ${isDarkMode ? 'border-[#FFFFFF]/10' : 'border-gray-200'}` 
              : `p-2 ${isDarkMode ? 'hover:bg-[#1E1E24]' : 'hover:bg-gray-50'}`
          }`}
          onClick={() => toggleSection('all')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 ${
                isExpanded 
                  ? 'w-8 h-8' 
                  : 'w-6 h-6'
              } rounded-full flex items-center justify-center bg-[#FF5252]/20`}>
                <div className="text-[#FF5252]">
                  <AllActivitiesIcon />
                </div>
              </div>
              <div>
                <h3 className={`font-semibold ${getTextColor()} ${
                  isExpanded 
                    ? 'text-base' 
                    : 'text-sm'
                }`}>
                  All Activities
                </h3>
                <div className={`flex items-center gap-2 ${
                  isExpanded 
                    ? 'text-xs' 
                    : 'text-xs'
                } ${getSecondaryTextColor()}`}>
                  <span>{counts.total} total activities</span>
                  {performanceData.percentage > 0 && (
                    <>
                      <span className={getSecondaryTextColor()}>•</span>
                      <span>Overall Performance: {performanceData.percentage.toFixed(2)}%</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2">
                <span className="px-2 py-1 text-xs rounded bg-[#00A15D]/20 text-[#00A15D]">
                  {counts.passed} Passed
                </span>
                <span className="px-2 py-1 text-xs rounded bg-[#FFA600]/20 text-[#FFA600]">
                  {counts.low} Low
                </span>
                <span className="px-2 py-1 text-xs rounded bg-[#A15353]/20 text-[#A15353]">
                  {counts.failed + counts.missed} Failed/Missed
                </span>
                <span className="px-2 py-1 text-xs rounded bg-[#767EE0]/20 text-[#767EE0]">
                  {counts.assigned} Assigned
                </span>
              </div>
              <button className={`${getTextColor()} ${isDarkMode ? 'hover:text-[#FFFFFF]/80' : 'hover:text-gray-700'} transition-colors`}>
                {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </button>
            </div>
          </div>
        </div>

        {!isExpanded && (
          <div className="sm:hidden px-2 pb-2">
            <div className="flex flex-wrap gap-1">
              <span className="px-2 py-1 text-xs rounded bg-[#00A15D]/20 text-[#00A15D]">
                {counts.passed} Passed
              </span>
              <span className="px-2 py-1 text-xs rounded bg-[#FFA600]/20 text-[#FFA600]">
                {counts.low} Low
              </span>
              <span className="px-2 py-1 text-xs rounded bg-[#A15353]/20 text-[#A15353]">
                {counts.failed + counts.missed} Failed/Missed
              </span>
              <span className="px-2 py-1 text-xs rounded bg-[#767EE0]/20 text-[#767EE0]">
                {counts.assigned} Assigned
              </span>
            </div>
          </div>
        )}

        {isExpanded && (
          <div className="p-3 pt-0 animate-slideDown">
            <div className="overflow-x-auto mb-4">
              <table className="w-full min-w-full">
                <thead>
                  <tr className={`border-b ${isDarkMode ? 'border-[#FFFFFF]/10' : 'border-gray-200'}`}>
                    <th className={`text-left py-2 px-3 text-xs font-semibold ${getSecondaryTextColor()}`}>Activity</th>
                    <th className={`text-left py-2 px-3 text-xs font-semibold ${getSecondaryTextColor()}`}>Title</th>
                    <th className={`text-left py-2 px-3 text-xs font-semibold ${getSecondaryTextColor()}`}>Deadline</th>
                    <th className={`text-left py-2 px-3 text-xs font-semibold ${getSecondaryTextColor()}`}>Status</th>
                    <th className={`text-left py-2 px-3 text-xs font-semibold ${getSecondaryTextColor()}`}>Score</th>
                    <th className={`text-left py-2 px-3 text-xs font-semibold ${getSecondaryTextColor()}`}>Percentage</th>
                    <th className={`text-left py-2 px-3 text-xs font-semibold ${getSecondaryTextColor()} w-24`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedActivities.map((activity) => {
                    const percentage = activity.grade !== null ? Math.round((activity.grade / activity.points) * 100) : null;
                    const getStatusText = () => {
                      switch(activity.status) {
                        case 'passed': return 'Passed (≥80%)';
                        case 'low': return 'Low (75-79%)';
                        case 'failed': return 'Failed (<75%)';
                        case 'missed': return 'Missed';
                        case 'pending': return 'Assigned';
                        default: return 'Unknown';
                      }
                    };
                    
                    const getStatusColor = () => {
                      switch(activity.status) {
                        case 'passed': return 'text-[#00A15D]';
                        case 'low': return 'text-[#FFA600]';
                        case 'failed': return 'text-[#A15353]';
                        case 'missed': return 'text-[#A15353]';
                        case 'pending': return 'text-[#767EE0]';
                        default: return getTextColor();
                      }
                    };

                    return (
                      <tr key={activity.id} className={`border-b ${isDarkMode ? 'border-[#FFFFFF]/5' : 'border-gray-100'} ${isDarkMode ? 'hover:bg-[#23232C]/30' : 'hover:bg-gray-50'} transition-colors`}>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              activity.status === 'passed' ? 'bg-[#00A15D]/20 text-[#00A15D]' :
                              activity.status === 'low' ? 'bg-[#FFA600]/20 text-[#FFA600]' :
                              activity.status === 'failed' ? 'bg-[#A15353]/20 text-[#A15353]' :
                              activity.status === 'missed' ? 'bg-[#A15353]/20 text-[#A15353]' :
                              'bg-[#767EE0]/20 text-[#767EE0]'
                            }`}>
                              {activity.activity_type} #{activity.task_number}
                            </span>
                          </div>
                        </td>
                        <td className={`py-2 px-3 text-xs ${getTextColor()} truncate max-w-[150px]`}>{activity.title}</td>
                        <td className={`py-2 px-3 text-xs ${getSecondaryTextColor()}`}>
                          {activity.deadline ? new Date(activity.deadline).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : 'No deadline'}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`text-xs font-medium ${getStatusColor()}`}>
                            {getStatusText()}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          {activity.grade !== null ? (
                            <div className="flex items-center">
                              <span className={`text-xs font-semibold ${
                                percentage >= 80 ? 'text-[#00A15D]' : 
                                percentage >= 75 ? 'text-[#FFA600]' : 
                                'text-[#A15353]'
                              }`}>
                                {activity.grade}/{activity.points}
                              </span>
                            </div>
                          ) : (
                            <span className={`text-xs ${getMutedTextColor()}`}>-</span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          {percentage !== null ? (
                            <span className={`text-xs font-semibold ${
                              percentage >= 80 ? 'text-[#00A15D]' : 
                              percentage >= 75 ? 'text-[#FFA600]' : 
                              'text-[#A15353]'
                            }`}>
                              {percentage}%
                            </span>
                          ) : (
                            <span className={`text-xs ${getMutedTextColor()}`}>-</span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleViewActivityDetails(activity)}
                              className={`p-1 rounded ${isDarkMode ? 'hover:bg-[#FFFFFF]/10' : 'hover:bg-gray-200'} transition-colors group`}
                              title="View Details"
                            >
                              <img src={DetailsIcon} alt="Details" className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100"
                                style={!isDarkMode ? { filter: 'invert(0.5)' } : {}} />
                            </button>
                            <button
                              onClick={() => handleEmailTeacherAboutActivity(activity)}
                              className={`p-1 rounded ${isDarkMode ? 'hover:bg-[#FFFFFF]/10' : 'hover:bg-gray-200'} transition-colors group`}
                              title="Email Teacher"
                            >
                              <img src={EmailIcon} alt="Email" className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100"
                                style={!isDarkMode ? { filter: 'invert(0.5)' } : {}} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className={`flex items-center justify-between border-t ${isDarkMode ? 'border-[#FFFFFF]/10' : 'border-gray-200'} pt-3`}>
                <div className={`text-xs ${getSecondaryTextColor()}`}>
                  Showing {startIndex + 1}-{Math.min(endIndex, activities.length)} of {activities.length} activities
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange('all', 'prev')}
                    disabled={currentPageNum === 1}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      currentPageNum === 1
                        ? `${getCardBackgroundColor()} ${getMutedTextColor()} cursor-not-allowed`
                        : `${getActionButtonBackground()} ${getTextColor()} ${isDarkMode ? 'hover:bg-[#2A2A35]' : 'hover:bg-gray-300'}`
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPageNum <= 3) {
                        pageNum = i + 1;
                      } else if (currentPageNum >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPageNum - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(prev => ({ ...prev, all: pageNum }))}
                          className={`w-8 h-8 text-xs rounded-md transition-colors ${
                            currentPageNum === pageNum
                              ? 'bg-[#FF5252] text-white'
                              : `${getActionButtonBackground()} ${getTextColor()} ${isDarkMode ? 'hover:bg-[#2A2A35]' : 'hover:bg-gray-300'}`
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange('all', 'next')}
                    disabled={currentPageNum === totalPages}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      currentPageNum === totalPages
                        ? `${getCardBackgroundColor()} ${getMutedTextColor()} cursor-not-allowed`
                        : `${getActionButtonBackground()} ${getTextColor()} ${isDarkMode ? 'hover:bg-[#2A2A35]' : 'hover:bg-gray-300'}`
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render action button helper
  const renderActionButton = (to, icon, label, active = false, colorClass = "") => (
    <Link to={`${to}?code=${subjectCode}`} className="flex-1 sm:flex-initial min-w-0">
      <button className={`flex items-center justify-center gap-2 px-3 py-2 font-semibold text-sm rounded-md shadow-md border-2 transition-all duration-300 cursor-pointer w-full sm:w-auto ${
        active 
          ? 'bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]/30 hover:bg-[#FF5252]/30' 
          : colorClass
      }`}>
        <img src={icon} alt="" className="h-4 w-4" style={!isDarkMode ? { filter: 'invert(0.5)' } : {}} />
        <span className="sm:inline truncate">{label}</span>
      </button>
    </Link>
  );

  // Loading state
  if (!studentId || loading) {
    return (
      <div className={`min-h-screen ${getBackgroundColor()}`}>
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className={`p-8 text-center ${getTextColor()}`}>
            <p>Loading student data...</p>
          </div>
        </div>
      </div>
    );
  }

  const { overallWarning } = calculateAttendanceWarnings;

  // Main render
  return (
    <div className={`min-h-screen ${getBackgroundColor()}`}>
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        <div className="p-4 sm:p-5 md:p-6 lg:p-6">
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <img src={SubjectOverview} alt="Subject Overview" className="h-6 w-6 sm:h-7 sm:w-7 mr-2"
                style={!isDarkMode ? { filter: 'invert(0.5)' } : {}} />
              <h1 className={`font-bold text-xl lg:text-2xl ${getTextColor()}`}>Subject Overview</h1>
            </div>
            <p className={`text-sm lg:text-base ${getSecondaryTextColor()}`}>View {currentSubject?.subject || 'Subject'} overview and details</p>
          </div>

          <div className={`flex flex-col gap-1 text-sm ${getSecondaryTextColor()} mb-4`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">SUBJECT:</span>
              <span>{currentSubject?.subject || 'Loading...'}</span>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="font-semibold">SECTION:</span>
                <span>{currentSubject?.section || 'Loading...'}</span>
              </div>
              <Link to="/Subjects">
                <img 
                  src={BackButton} 
                  alt="Back" 
                  className="h-5 w-5 cursor-pointer hover:opacity-70 transition-opacity"
                  style={!isDarkMode ? { filter: 'invert(0.5)' } : {}}
                />
              </Link>
            </div>
          </div>

          <hr className={`${getDividerColor()} mb-4`} />

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <div className="flex-1 sm:flex-initial min-w-0">
                <button className={`flex items-center justify-center gap-2 px-3 py-2 font-semibold text-sm rounded-md shadow-md border-2 transition-all duration-300 cursor-pointer w-full sm:w-auto bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]/30`}>
                  <img src={SubjectOverview} alt="" className="h-4 w-4"
                    style={!isDarkMode ? { filter: 'invert(0.5)' } : {}} />
                  <span className="sm:inline truncate">{currentSubject?.subject || 'Subject'} Overview</span>
                </button>
              </div>
              
              {renderActionButton("/SubjectAnnouncementStudent", Announcement, "Announcements", false, "bg-[#00A15D]/20 text-[#00A15D] border-[#00A15D]/30 hover:bg-[#00A15D]/30")}
              {renderActionButton("/SubjectSchoolWorksStudent", Classwork, "School Works", false, "bg-[#767EE0]/20 text-[#767EE0] border-[#767EE0]/30 hover:bg-[#767EE0]/30")}
              {renderActionButton("/SubjectAttendanceStudent", Attendance, "Attendance", false, "bg-[#FFA600]/20 text-[#FFA600] border-[#FFA600]/30 hover:bg-[#FFA600]/30")}
              {renderActionButton("/SubjectAnalyticsStudent", Analytics, "Reports", false, "bg-[#B39DDB]/20 text-[#B39DDB] border-[#B39DDB]/30 hover:bg-[#B39DDB]/30")}
            </div>
            <Link to={`/SubjectListStudent?code=${subjectCode}`} className="sm:self-start">
              <button className={`p-2 ${getButtonBackgroundColor()} rounded-md shadow-md border-2 border-transparent ${getActionButtonHover()} transition-all duration-200 cursor-pointer`}>
                <img src={StudentsIcon} alt="Student List" className="h-4 w-4"
                  style={!isDarkMode ? { filter: 'invert(0.5)' } : {}} />
              </button>
            </Link>
          </div>

          {overallWarning && (
            <div className={`${getWarningBackground()} border ${getWarningBorder()} rounded-md p-3 mb-4`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-[#FFA600]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className={`text-xs font-medium ${getWarningText()}`}>
                    Attendance Warning
                  </h3>
                  <div className={`mt-1 text-xs ${getWarningText()}/90`}>
                    <p>
                      You have attendance warnings in some subjects. Students with 3 accumulated absences will be dropped from the course. 
                      3 late arrivals are equivalent to one absent.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && subjects.length > 0 && !currentSubject && (
            <div className={`${getErrorBackground()} border ${getErrorBorder()} rounded-md p-3 mb-4 text-center`}>
              <p className={`${getErrorText()} text-sm`}>
                Subject not found or you are not enrolled in this subject.
              </p>
            </div>
          )}

          {!loading && currentSubject && (
            <div className="space-y-4">
              <StudentPerformanceSummary
                performanceSummary={performanceSummary}
                performanceData={performanceData}
                currentSubject={currentSubject}
                handleAskForExtraWork={() => {}} // This is handled by StudentPerformanceSummary itself
                subjectAttendance={subjectAttendance}
                studentId={studentId}
                studentName={studentName}
                studentEmail={studentEmail}
                performanceDataLoading={performanceDataLoading}
                onActivitySubmitted={() => {
                  // Refresh activities data when an activity is submitted
                  fetchActivitiesBreakdown();
                  fetchPerformanceData();
                }}
                isDarkMode={isDarkMode}
              />

              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-bold ${getTextColor()}`}>Activities Breakdown</h2>
                  <div className="hidden sm:flex items-center gap-2 text-sm text-[#FFFFFF]/60">
                    <span>Total: {activitiesBreakdown.counts.total}</span>
                    <span className={getSecondaryTextColor()}>|</span>
                    <span className="text-[#00A15D]">Passed: {activitiesBreakdown.counts.passed}</span>
                    <span className={getSecondaryTextColor()}>|</span>
                    <span className="text-[#FFA600]">Low: {activitiesBreakdown.counts.low}</span>
                    <span className={getSecondaryTextColor()}>|</span>
                    <span className="text-[#A15353]">Failed/Missed: {activitiesBreakdown.counts.failed + activitiesBreakdown.counts.missed}</span>
                    <span className={getSecondaryTextColor()}>|</span>
                    <span className="text-[#767EE0]">Assigned: {activitiesBreakdown.counts.assigned}</span>
                  </div>
                </div>
                
                {renderAllActivitiesTable()}
                {renderActivityTable("Passed Activities (≥80%)", activitiesBreakdown.passed, 'passed', <PassedIcon />, '#00A15D')}
                {renderActivityTable("Low Grade Activities (75-79%)", activitiesBreakdown.low, 'low', <LowGradeIcon />, '#FFA600')}
                {renderActivityTable("Failed Activities (<75%)", activitiesBreakdown.failed, 'failed', <FailedIcon />, '#A15353')}
                {renderActivityTable("Missed Activities", activitiesBreakdown.missed, 'missed', <MissedIcon />, '#A15353')}
                {renderActivityTable("Assigned Activities", activitiesBreakdown.assigned, 'assigned', <AssignedIcon />, '#767EE0')}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && <EmailModal />}
      
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}