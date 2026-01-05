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

const PendingIcon = () => (
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

  // New state for activities breakdown
  const [activitiesBreakdown, setActivitiesBreakdown] = useState({
    all: [],
    passed: [],
    low: [],
    failed: [],
    missed: [],
    pending: [],
    counts: {
      total: 0,
      passed: 0,
      low: 0,
      failed: 0,
      missed: 0,
      pending: 0
    }
  });

  const [performanceData, setPerformanceData] = useState({
    percentage: 0, // This is the WEIGHTED TOTAL (75% academic + 25% attendance)
    academic_percentage: 0, // This is academic only
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

  const [expandedSections, setExpandedSections] = useState({
    all: false,
    passed: false,
    low: false,
    failed: false,
    missed: false,
    pending: false
  });

  const [currentPage, setCurrentPage] = useState({
    all: 1,
    passed: 1,
    low: 1,
    failed: 1,
    missed: 1,
    pending: 1
  });

  const itemsPerPage = 10;

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
      const response = await fetch(`https://tracked.6minds.site/Student/SubjectDetailsStudentDB/get_performance_data.php?student_id=${studentId}&subject_code=${subjectCode}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          console.log('Performance Data:', data); // Debug log
          setPerformanceData({
            percentage: parseFloat(data.percentage) || 0, // WEIGHTED TOTAL
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
          setActivitiesBreakdown(data.breakdown);
        } else {
          // Set empty breakdown
          setActivitiesBreakdown({
            all: [],
            passed: [],
            low: [],
            failed: [],
            missed: [],
            pending: [],
            counts: {
              total: 0,
              passed: 0,
              low: 0,
              failed: 0,
              missed: 0,
              pending: 0
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
        pending: [],
        counts: {
          total: 0,
          passed: 0,
          low: 0,
          failed: 0,
          missed: 0,
          pending: 0
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
        }
      }
    } catch (error) {
      console.error('Error fetching teacher info:', error);
    }
  };

  // Calculate performance summary based on breakdown - FIXED to use performanceData.percentage
  const performanceSummary = useMemo(() => {
    if (!currentSubject || !activitiesBreakdown.all.length) {
      return {
        percentage: performanceData.percentage || 0, // Use WEIGHTED TOTAL
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
        pendingCount: 0,
        // Add suggestions data for dropdown
        suggestionsData: {
          missed: [],
          failed: [],
          low: [],
          pending: [],
          absences: []
        }
      };
    }

    // Use the WEIGHTED TOTAL percentage from performanceData
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
      pending: activitiesBreakdown.pending,
      absences: totalEffectiveAbsences > 0 ? [{
        type: 'absences',
        count: totalEffectiveAbsences,
        absent: subjectAttendance.absent,
        late: subjectAttendance.late
      }] : []
    };

    // IMPORTANT: Using the WEIGHTED TOTAL percentage (75% academic + 25% attendance)
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

      if (activitiesBreakdown.counts.pending > 0) {
        suggestions.push({
          text: `Submit ${activitiesBreakdown.counts.pending} pending activities`,
          type: 'pending',
          count: activitiesBreakdown.counts.pending
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
      percentage, // This is the WEIGHTED TOTAL
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
      pendingCount: activitiesBreakdown.counts.pending,
      suggestionsData
    };
  }, [currentSubject, activitiesBreakdown, performanceData.percentage, subjectAttendance]);

  // Email functions - WORKING WITH YOUR DATABASE
  const handleAskForExtraWork = () => {
    const { teacherEmail, teacherName } = performanceData;
    const { percentage, missedCount, pendingCount, lowCount, totalEffectiveAbsences } = performanceSummary;
    
    if (!teacherEmail) {
      alert("Teacher email not available. Please contact your teacher directly.");
      return;
    }

    const subject = encodeURIComponent(`Request for Extra Work - ${currentSubject?.subject || 'Subject'} (${subjectCode})`);
    
    let body = `Dear ${teacherName || 'Professor'},\n\n`;
    body += `I am writing to request additional work to improve my performance in ${currentSubject?.subject || 'this subject'} (${subjectCode}).\n\n`;
    body += `STUDENT INFORMATION:\n`;
    body += `- Student ID: ${studentId}\n`;
    body += `- Student Name: ${studentName}\n`;
    if (studentEmail) body += `- Student Email: ${studentEmail}\n`;
    body += `- Subject: ${currentSubject?.subject || ''}\n`;
    body += `- Section: ${currentSubject?.section || ''}\n`;
    body += `- Subject Code: ${subjectCode}\n\n`;
    body += `CURRENT PERFORMANCE:\n`;
    body += `- Current Grade Percentage: ${percentage}% (75% academic + 25% attendance)\n`;
    body += `- Academic Performance Only: ${performanceData.academic_percentage?.toFixed(2) || 0}%\n`;
    body += `- Attendance Performance: ${performanceData.attendance_percentage?.toFixed(2) || 0}%\n`;
    if (missedCount > 0) body += `- Missed Activities: ${missedCount}\n`;
    if (pendingCount > 0) body += `- Pending Activities: ${pendingCount}\n`;
    if (lowCount > 0) body += `- Activities with 75-79%: ${lowCount}\n`;
    if (totalEffectiveAbsences > 0) body += `- Effective Absences: ${totalEffectiveAbsences}\n\n`;
    body += `REQUEST:\n`;
    body += `I would appreciate any additional assignments, remedial work, or guidance you can provide to help me improve my performance in this subject.\n\n`;
    body += `Thank you for your consideration.\n\n`;
    body += `Sincerely,\n${studentName}\nStudent ID: ${studentId}`;
    if (studentEmail) body += `\nEmail: ${studentEmail}`;
    
    const mailtoLink = `mailto:${teacherEmail}?subject=${subject}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  const handleEmailTeacherAboutActivity = (activity) => {
    const { teacherEmail, teacherName } = performanceData;
    
    if (!teacherEmail) {
      alert("Teacher email not available. Please contact your teacher directly.");
      return;
    }

    const percentage = activity.grade !== null ? Math.round((activity.grade / activity.points) * 100) : null;
    const subject = encodeURIComponent(`Question about ${activity.activity_type} ${activity.task_number} - ${currentSubject?.subject || 'Subject'} (${subjectCode})`);
    
    let body = `Dear ${teacherName || 'Professor'},\n\n`;
    body += `I have a question regarding the following activity:\n\n`;
    body += `STUDENT INFORMATION:\n`;
    body += `- Student ID: ${studentId}\n`;
    body += `- Student Name: ${studentName}\n`;
    if (studentEmail) body += `- Student Email: ${studentEmail}\n`;
    body += `- Subject: ${currentSubject?.subject || ''}\n`;
    body += `- Section: ${currentSubject?.section || ''}\n`;
    body += `- Subject Code: ${subjectCode}\n\n`;
    body += `ACTIVITY DETAILS:\n`;
    body += `- Activity Type: ${activity.activity_type}\n`;
    body += `- Task Number: ${activity.task_number}\n`;
    body += `- Title: ${activity.title}\n`;
    body += `- Deadline: ${activity.deadline ? new Date(activity.deadline).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : 'No deadline'}\n`;
    body += `- Status: ${activity.status}\n`;
    body += `- Score: ${activity.grade !== null ? `${activity.grade}/${activity.points}` : 'Not graded yet'}\n`;
    if (percentage !== null) body += `- Percentage: ${percentage}%\n\n`;
    body += `MY QUESTION:\n\n`;
    body += `[Please state your question here]\n\n`;
    body += `Thank you for your time and assistance.\n\n`;
    body += `Sincerely,\n${studentName}\nStudent ID: ${studentId}`;
    if (studentEmail) body += `\nEmail: ${studentEmail}`;
    
    const mailtoLink = `mailto:${teacherEmail}?subject=${subject}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  const handleViewActivityDetails = (activity) => {
    window.location.href = `/SubjectSchoolWorksStudent?code=${subjectCode}&activity=${activity.id}`;
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
      return 'bg-[#767EE0]/20 text-[#767EE0]';
    };

    return (
      <div className="bg-[#15151C] rounded-lg border border-[#FFFFFF]/10 mb-3 overflow-hidden">
        <div 
          className={`cursor-pointer transition-all duration-200 ${
            isExpanded 
              ? 'p-3 border-b border-[#FFFFFF]/10' 
              : 'p-2 hover:bg-[#1E1E24]'
          }`}
          onClick={() => toggleSection(type)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex-shrink-0 ${
                isExpanded 
                  ? 'w-8 h-8' 
                  : 'w-6 h-6'
              } rounded-full flex items-center justify-center bg-[${color}]/20`}>
                <div className={`text-[${color}]`}>
                  {icon}
                </div>
              </div>
              <div>
                <h3 className={`font-semibold text-[#FFFFFF] ${
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
                } text-[#FFFFFF]/60`}>
                  <span>{activities.length} {activities.length === 1 ? 'activity' : 'activities'}</span>
                  <span className="text-[#FFFFFF]/30">•</span>
                  <span>
                    {type === 'passed' && '≥80% score'}
                    {type === 'low' && '75-79% score'}
                    {type === 'failed' && '<75% score'}
                    {type === 'missed' && 'Missed deadline'}
                    {type === 'pending' && 'Awaiting submission/grade'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <button className="text-[#FFFFFF] hover:text-[#FFFFFF]/80 transition-colors">
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
                  <tr className="border-b border-[#FFFFFF]/10">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#FFFFFF]/70">Activity</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#FFFFFF]/70">Title</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#FFFFFF]/70">Deadline</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#FFFFFF]/70">Score</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#FFFFFF]/70">Percentage</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#FFFFFF]/70 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedActivities.map((activity) => {
                    const percentage = activity.grade !== null ? Math.round((activity.grade / activity.points) * 100) : null;
                    return (
                      <tr key={activity.id} className="border-b border-[#FFFFFF]/5 hover:bg-[#23232C]/30 transition-colors">
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(activity)}`}>
                              {activity.activity_type} #{activity.task_number}
                            </span>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-xs text-[#FFFFFF] truncate max-w-[150px]">{activity.title}</td>
                        <td className="py-2 px-3 text-xs text-[#FFFFFF]/80">
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
                            <span className="text-xs text-[#FFFFFF]/60">-</span>
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
                            <span className="text-xs text-[#FFFFFF]/60">-</span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleViewActivityDetails(activity)}
                              className="p-1 rounded hover:bg-[#FFFFFF]/10 transition-colors group"
                              title="View Details"
                            >
                              <img src={DetailsIcon} alt="Details" className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                            </button>
                            <button
                              onClick={() => handleEmailTeacherAboutActivity(activity)}
                              className="p-1 rounded hover:bg-[#FFFFFF]/10 transition-colors group"
                              title="Email Teacher"
                            >
                              <img src={EmailIcon} alt="Email" className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
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
              <div className="flex items-center justify-between border-t border-[#FFFFFF]/10 pt-3">
                <div className="text-xs text-[#FFFFFF]/60">
                  Showing {startIndex + 1}-{Math.min(endIndex, activities.length)} of {activities.length} activities
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(type, 'prev')}
                    disabled={currentPageNum === 1}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      currentPageNum === 1
                        ? 'bg-[#15151C] text-[#FFFFFF]/30 cursor-not-allowed'
                        : 'bg-[#23232C] text-[#FFFFFF] hover:bg-[#2A2A35]'
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
                              : 'bg-[#23232C] text-[#FFFFFF] hover:bg-[#2A2A35]'
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
                        ? 'bg-[#15151C] text-[#FFFFFF]/30 cursor-not-allowed'
                        : 'bg-[#23232C] text-[#FFFFFF] hover:bg-[#2A2A35]'
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
      <div className="bg-[#15151C] rounded-lg border border-[#FFFFFF]/10 mb-3 overflow-hidden">
        <div 
          className={`cursor-pointer transition-all duration-200 ${
            isExpanded 
              ? 'p-3 border-b border-[#FFFFFF]/10' 
              : 'p-2 hover:bg-[#1E1E24]'
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
                <h3 className={`font-semibold text-[#FFFFFF] ${
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
                } text-[#FFFFFF]/60`}>
                  <span>{counts.total} total activities</span>
                  {performanceData.percentage > 0 && (
                    <>
                      <span className="text-[#FFFFFF]/30">•</span>
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
                  {counts.pending} Pending
                </span>
              </div>
              <button className="text-[#FFFFFF] hover:text-[#FFFFFF]/80 transition-colors">
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
                {counts.pending} Pending
              </span>
            </div>
          </div>
        )}

        {isExpanded && (
          <div className="p-3 pt-0 animate-slideDown">
            <div className="overflow-x-auto mb-4">
              <table className="w-full min-w-full">
                <thead>
                  <tr className="border-b border-[#FFFFFF]/10">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#FFFFFF]/70">Activity</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#FFFFFF]/70">Title</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#FFFFFF]/70">Deadline</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#FFFFFF]/70">Status</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#FFFFFF]/70">Score</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#FFFFFF]/70">Percentage</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#FFFFFF]/70 w-24">Actions</th>
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
                        case 'pending': return 'Pending';
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
                        default: return 'text-[#FFFFFF]';
                      }
                    };

                    return (
                      <tr key={activity.id} className="border-b border-[#FFFFFF]/5 hover:bg-[#23232C]/30 transition-colors">
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
                        <td className="py-2 px-3 text-xs text-[#FFFFFF] truncate max-w-[150px]">{activity.title}</td>
                        <td className="py-2 px-3 text-xs text-[#FFFFFF]/80">
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
                            <span className="text-xs text-[#FFFFFF]/60">-</span>
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
                            <span className="text-xs text-[#FFFFFF]/60">-</span>
                          )}
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleViewActivityDetails(activity)}
                              className="p-1 rounded hover:bg-[#FFFFFF]/10 transition-colors group"
                              title="View Details"
                            >
                              <img src={DetailsIcon} alt="Details" className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
                            </button>
                            <button
                              onClick={() => handleEmailTeacherAboutActivity(activity)}
                              className="p-1 rounded hover:bg-[#FFFFFF]/10 transition-colors group"
                              title="Email Teacher"
                            >
                              <img src={EmailIcon} alt="Email" className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
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
              <div className="flex items-center justify-between border-t border-[#FFFFFF]/10 pt-3">
                <div className="text-xs text-[#FFFFFF]/60">
                  Showing {startIndex + 1}-{Math.min(endIndex, activities.length)} of {activities.length} activities
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange('all', 'prev')}
                    disabled={currentPageNum === 1}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      currentPageNum === 1
                        ? 'bg-[#15151C] text-[#FFFFFF]/30 cursor-not-allowed'
                        : 'bg-[#23232C] text-[#FFFFFF] hover:bg-[#2A2A35]'
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
                              : 'bg-[#23232C] text-[#FFFFFF] hover:bg-[#2A2A35]'
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
                        ? 'bg-[#15151C] text-[#FFFFFF]/30 cursor-not-allowed'
                        : 'bg-[#23232C] text-[#FFFFFF] hover:bg-[#2A2A35]'
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
        <img src={icon} alt="" className="h-4 w-4" />
        <span className="sm:inline truncate">{label}</span>
      </button>
    </Link>
  );

  // Loading state
  if (!studentId || loading) {
    return (
      <div className="bg-[#23232C] min-h-screen">
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-8 text-center text-[#FFFFFF]">
            <p>Loading student data...</p>
          </div>
        </div>
      </div>
    );
  }

  const { overallWarning } = calculateAttendanceWarnings;

  // Main render
  return (
    <div className="bg-[#23232C] min-h-screen">
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        <div className="p-4 sm:p-5 md:p-6 lg:p-6">
          
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <img src={SubjectOverview} alt="Subject Overview" className="h-6 w-6 sm:h-7 sm:w-7 mr-2" />
              <h1 className="font-bold text-xl lg:text-2xl text-[#FFFFFF]">Subject Overview</h1>
            </div>
            <p className="text-sm lg:text-base text-[#FFFFFF]/80">View {currentSubject?.subject || 'Subject'} overview and details</p>
          </div>

          <div className="flex flex-col gap-1 text-sm text-[#FFFFFF]/80 mb-4">
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
                />
              </Link>
            </div>
          </div>

          <hr className="border-[#FFFFFF]/30 mb-4" />

          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              <div className="flex-1 sm:flex-initial min-w-0">
                <button className="flex items-center justify-center gap-2 px-3 py-2 font-semibold text-sm rounded-md shadow-md border-2 transition-all duration-300 cursor-pointer w-full sm:w-auto bg-[#FF5252]/20 text-[#FF5252] border-[#FF5252]/30">
                  <img src={SubjectOverview} alt="" className="h-4 w-4" />
                  <span className="sm:inline truncate">{currentSubject?.subject || 'Subject'} Overview</span>
                </button>
              </div>
              
              {renderActionButton("/SubjectAnnouncementStudent", Announcement, "Announcements", false, "bg-[#00A15D]/20 text-[#00A15D] border-[#00A15D]/30 hover:bg-[#00A15D]/30")}
              {renderActionButton("/SubjectSchoolWorksStudent", Classwork, "School Works", false, "bg-[#767EE0]/20 text-[#767EE0] border-[#767EE0]/30 hover:bg-[#767EE0]/30")}
              {renderActionButton("/SubjectAttendanceStudent", Attendance, "Attendance", false, "bg-[#FFA600]/20 text-[#FFA600] border-[#FFA600]/30 hover:bg-[#FFA600]/30")}
              {renderActionButton("/SubjectAnalyticsStudent", Analytics, "Reports", false, "bg-[#B39DDB]/20 text-[#B39DDB] border-[#B39DDB]/30 hover:bg-[#B39DDB]/30")}
            </div>
            <Link to={`/SubjectListStudent?code=${subjectCode}`} className="sm:self-start">
              <button className="p-2 bg-[#15151C] rounded-md shadow-md border-2 border-transparent hover:border-[#00A15D] transition-all duration-200 cursor-pointer">
                <img src={StudentsIcon} alt="Student List" className="h-4 w-4" />
              </button>
            </Link>
          </div>

          {overallWarning && (
            <div className="bg-[#FFA600]/10 border border-[#FFA600]/30 rounded-md p-3 mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-[#FFA600]" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-xs font-medium text-[#FFA600]">
                    Attendance Warning
                  </h3>
                  <div className="mt-1 text-xs text-[#FFA600]/90">
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
            <div className="bg-[#A15353]/10 border border-[#A15353]/30 rounded-md p-3 mb-4 text-center">
              <p className="text-[#A15353] text-sm">
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
                handleAskForExtraWork={handleAskForExtraWork}
                subjectAttendance={subjectAttendance}
                studentId={studentId}
                studentName={studentName}
              />

              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-[#FFFFFF]">Activities Breakdown</h2>
                  <div className="hidden sm:flex items-center gap-2 text-sm text-[#FFFFFF]/60">
                    <span>Total: {activitiesBreakdown.counts.total}</span>
                    <span className="text-[#FFFFFF]/30">|</span>
                    <span className="text-[#00A15D]">Passed: {activitiesBreakdown.counts.passed}</span>
                    <span className="text-[#FFFFFF]/30">|</span>
                    <span className="text-[#FFA600]">Low: {activitiesBreakdown.counts.low}</span>
                    <span className="text-[#FFFFFF]/30">|</span>
                    <span className="text-[#A15353]">Failed/Missed: {activitiesBreakdown.counts.failed + activitiesBreakdown.counts.missed}</span>
                    <span className="text-[#FFFFFF]/30">|</span>
                    <span className="text-[#767EE0]">Pending: {activitiesBreakdown.counts.pending}</span>
                  </div>
                </div>
                
                {renderAllActivitiesTable()}
                {renderActivityTable("Passed Activities (≥80%)", activitiesBreakdown.passed, 'passed', <PassedIcon />, '#00A15D')}
                {renderActivityTable("Low Grade Activities (75-79%)", activitiesBreakdown.low, 'low', <LowGradeIcon />, '#FFA600')}
                {renderActivityTable("Failed Activities (<75%)", activitiesBreakdown.failed, 'failed', <FailedIcon />, '#A15353')}
                {renderActivityTable("Missed Activities", activitiesBreakdown.missed, 'missed', <MissedIcon />, '#A15353')}
                {renderActivityTable("Pending Activities", activitiesBreakdown.pending, 'pending', <PendingIcon />, '#767EE0')}
              </div>
            </div>
          )}
        </div>
      </div>
      
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