import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import ActivityOverview from "../../Components/ActivityOverview";

import Analytics from '../../assets/Analytics(Light).svg';
import ArrowDown from '../../assets/ArrowDown(Light).svg';
import Search from "../../assets/Search.svg";
import Details from '../../assets/Details(Light).svg';
import ArrowLeft from '../../assets/ArrowLeft.svg';
import ArrowRight from '../../assets/ArrowRight.svg';
import Award from '../../assets/Award.svg';
import LeastActivities from '../../assets/Least.svg';

export default function AnalyticsProf() {
  const [isOpen, setIsOpen] = useState(true);
  const [openSubject, setOpenSubject] = useState(false);
  const [openSection, setOpenSection] = useState(false);

  const [selectedFilter, setSelectedFilter] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [classes, setClasses] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [classesLoading, setClassesLoading] = useState(true);
  const [professorId, setProfessorId] = useState('');
  const [rankingSort, setRankingSort] = useState('highest'); // 'highest' or 'lowest'
  const [performanceFilter, setPerformanceFilter] = useState('top'); // 'top' or 'bottom'

  // Pagination states
  const [attendanceCurrentPage, setAttendanceCurrentPage] = useState(1);
  const [rankingCurrentPage, setRankingCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Updated colors for charts with proper color coding
  const ATTENDANCE_COLORS = ['#00C853', '#FFD600', '#FF3D00']; // Green (Submitted/Present), Yellow (Late), Red (Absent)
  const ACTIVITIES_COLORS = ['#00C853', '#FFD600', '#2962FF', '#FF3D00']; // Green (Submitted), Yellow (Late), Blue (Pending), Red (Missing)

  // Get professor ID from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setProfessorId(user.id || '');
      } catch {
        setProfessorId('');
      }
    } else {
      setProfessorId('');
    }
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setAttendanceCurrentPage(1);
    setRankingCurrentPage(1);
  }, [selectedFilter, selectedSubject, selectedSection]);

  // Fetch classes for the professor when professorId is available
  useEffect(() => {
    if (!professorId) return;

    const fetchClasses = async () => {
      setClassesLoading(true);
      try {
        const apiUrl = `https://tracked.6minds.site/Professor/ClassManagementDB/get_classes.php?professor_ID=${professorId}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.success) {
          const classesData = data.classes || [];
          setClasses(classesData);
          
          // Don't set any default selections - let the user choose
          setSelectedSubject("");
          setSelectedSection("");
        } else {
          setClasses([]);
          setSelectedSubject("");
          setSelectedSection("");
        }
      } catch {
        setClasses([]);
        setSelectedSubject("");
        setSelectedSection("");
      } finally {
        setClassesLoading(false);
      }
    };

    fetchClasses();
  }, [professorId]);

  // Get unique sections from classes
  const sections = useMemo(() => {
    const uniqueSections = [...new Set(classes.map(cls => cls.section).filter(Boolean))];
    return uniqueSections;
  }, [classes]);

  // Get subjects based on selected section filter
  const getFilteredSubjects = useMemo(() => {
    if (!selectedSection) return []; // Return empty if no section selected
    return classes.filter(cls => cls.section === selectedSection);
  }, [classes, selectedSection]);

  // Fetch analytics data when subject changes
  useEffect(() => {
    if (selectedSubject && professorId) {
      fetchAnalyticsData();
    } else {
      setAnalyticsData(null);
    }
  }, [selectedSubject, selectedSection, professorId]);

  const fetchAnalyticsData = async () => {
    if (!selectedSubject || !professorId || !selectedSection) return;

    setLoading(true);
    try {
      // Build URL with section parameter
      const attendanceUrl = `https://tracked.6minds.site/Professor/AttendanceDB/get_attendance_history.php?subject_code=${selectedSubject}&professor_ID=${professorId}&section=${selectedSection}`;

      const attendanceResponse = await fetch(attendanceUrl);
      
      if (!attendanceResponse.ok) {
        throw new Error(`Attendance API failed: ${attendanceResponse.status}`);
      }
      
      const attendanceData = await attendanceResponse.json();

      // Fetch activities data
      const activitiesUrl = `https://tracked.6minds.site/Professor/SubjectDetailsDB/get_activities.php?subject_code=${selectedSubject}&section=${selectedSection}`;

      const activitiesResponse = await fetch(activitiesUrl);
      
      if (!activitiesResponse.ok) {
        throw new Error(`Activities API failed: ${activitiesResponse.status}`);
      }
      
      const activitiesData = await activitiesResponse.json();

      // Process the data
      processAnalyticsData(attendanceData, activitiesData);
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Set empty analytics data structure
      setAnalyticsData({
        attendanceSummary: { present: 0, absent: 0, late: 0, total: 0, attendanceRate: 0 },
        activitiesSummary: { submitted: 0, missing: 0, pending: 0, late: 0, total: 0, submissionRate: 0 },
        studentPerformance: [],
        rawActivities: []
      });
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (attendanceData, activitiesData) => {
    // Check if we have valid data
    const attendanceHistory = (attendanceData.success && Array.isArray(attendanceData.attendance_history)) 
      ? attendanceData.attendance_history 
      : [];
    
    const activities = (activitiesData.success && Array.isArray(activitiesData.activities)) 
      ? activitiesData.activities 
      : [];

    // Process attendance data
    const attendanceSummary = calculateAttendanceSummary(attendanceHistory);
    
    // Process activities data
    const activitiesSummary = calculateActivitiesSummary(activities);
    
    // Process student performance
    const studentPerformance = calculateStudentPerformance(attendanceHistory, activities);

    setAnalyticsData({
      attendanceSummary,
      activitiesSummary,
      studentPerformance,
      rawAttendance: attendanceHistory,
      rawActivities: activities
    });
  };

  const calculateAttendanceSummary = (attendanceHistory) => {
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalStudents = 0;

    attendanceHistory.forEach(day => {
      if (!Array.isArray(day.students)) return;
      day.students.forEach(student => {
        totalStudents++;
        const status = String(student.status).toLowerCase();
        if (status === 'present') {
          totalPresent++;
        } else if (status === 'late') {
          totalLate++;
        } else {
          totalAbsent++;
        }
      });
    });

    return {
      present: totalPresent,
      absent: totalAbsent,
      late: totalLate,
      total: totalStudents,
      attendanceRate: totalStudents > 0 ? (((totalPresent + totalLate) / totalStudents) * 100).toFixed(1) : 0
    };
  };

  const calculateActivitiesSummary = (activities) => {
    let totalSubmitted = 0;
    let totalMissing = 0;
    let totalLate = 0;
    let totalPending = 0; // Add this for pending count
    let totalEntries = 0;

    activities.forEach(activity => {
      if (!Array.isArray(activity.students)) return;
      
      const currentDate = new Date();
      const deadlineDate = activity.deadline ? new Date(activity.deadline) : null;
      const isPastDeadline = deadlineDate && deadlineDate < currentDate;
      
      activity.students.forEach(student => {
        totalEntries++;
        const submitted = student.submitted === true || student.submitted === 1 || student.submitted === '1';
        const late = student.late === true || student.late === 1 || student.late === '1';
        
        if (submitted) {
          totalSubmitted++;
          if (late) {
            totalLate++;
          }
        } else {
          // FIX: Only count as missing if past deadline, otherwise count as pending
          if (isPastDeadline) {
            totalMissing++;
          } else {
            totalPending++; // Count as pending if not past deadline
          }
        }
      });
    });

    return {
      submitted: totalSubmitted,
      missing: totalMissing,
      pending: totalPending, // Include pending in the summary
      late: totalLate,
      total: totalEntries,
      submissionRate: totalEntries > 0 ? ((totalSubmitted / totalEntries) * 100).toFixed(1) : 0
    };
  };

  const calculateStudentPerformance = (attendanceHistory, activities) => {
    const studentMap = new Map();

    // Helper functions
    const getIdFrom = (studentObj) => {
      return studentObj?.student_ID ?? studentObj?.user_ID ?? null;
    };
    
    const getNameFrom = (studentObj) => {
      return studentObj?.user_Name ?? studentObj?.userName ?? studentObj?.name ?? 'Unknown Student';
    };

    // Initialize from attendance data
    if (attendanceHistory.length > 0 && Array.isArray(attendanceHistory[0].students)) {
      attendanceHistory[0].students.forEach(student => {
        const id = getIdFrom(student);
        const name = getNameFrom(student);
        if (!id) return;
        studentMap.set(id, {
          name: name,
          id,
          presentCount: 0,
          absentCount: 0,
          lateCount: 0,
          submittedCount: 0,
          pendingCount: 0,
          missingCount: 0,
          lateSubmissionCount: 0,
          totalActivities: 0
        });
      });
    }

    // Count attendance (keep existing code)
    attendanceHistory.forEach(day => {
      if (!Array.isArray(day.students)) return;
      day.students.forEach(student => {
        const id = getIdFrom(student);
        if (!id) return;
        
        let studentData = studentMap.get(id);
        if (!studentData) {
          const name = getNameFrom(student);
          studentData = {
            name: name,
            id,
            presentCount: 0,
            absentCount: 0,
            lateCount: 0,
            submittedCount: 0,
            pendingCount: 0,
            missingCount: 0,
            lateSubmissionCount: 0,
            totalActivities: 0
          };
          studentMap.set(id, studentData);
        }

        const status = String(student.status).toLowerCase();
        if (status === 'present') {
          studentData.presentCount++;
        } else if (status === 'late') {
          studentData.lateCount++;
        } else {
          studentData.absentCount++;
        }
      });
    });

    // Count activity submissions - UPDATED
    activities.forEach(activity => {
      if (!Array.isArray(activity.students)) return;
      
      const currentDate = new Date();
      const deadlineDate = activity.deadline ? new Date(activity.deadline) : null;
      const isPastDeadline = deadlineDate && deadlineDate < currentDate;
      
      activity.students.forEach(student => {
        const id = getIdFrom(student);
        if (!id) return;
        
        let studentData = studentMap.get(id);
        if (!studentData) {
          const name = getNameFrom(student);
          studentData = {
            name: name,
            id,
            presentCount: 0,
            absentCount: 0,
            lateCount: 0,
            submittedCount: 0,
            pendingCount: 0,
            missingCount: 0,
            lateSubmissionCount: 0,
            totalActivities: 0
          };
          studentMap.set(id, studentData);
        }

        studentData.totalActivities++;
        const submitted = student.submitted === true || student.submitted === 1 || student.submitted === '1';
        const late = student.late === true || student.late === 1 || student.late === '1';
        
        if (submitted) {
          studentData.submittedCount++;
          if (late) {
            studentData.lateSubmissionCount++;
          }
        } else {
          // FIX: Only count as missing if past deadline
          if (isPastDeadline) {
            studentData.missingCount++;
          } else {
            studentData.pendingCount++;
          }
        }
      });
    });

    // Convert to array and calculate rates (keep existing code)
    const studentArray = Array.from(studentMap.values());

    studentArray.forEach(s => {
      const attendanceDenom = s.presentCount + s.absentCount + s.lateCount;
      s.attendanceRate = attendanceDenom > 0 ? ((s.presentCount + s.lateCount) / attendanceDenom) * 100 : 0;
      s.submissionRate = s.totalActivities > 0 ? (s.submittedCount / s.totalActivities) * 100 : 0;
    });

    // Sort by performance
    studentArray.sort((a, b) => {
      if (b.submissionRate !== a.submissionRate) return b.submissionRate - a.submissionRate;
      return b.attendanceRate - a.attendanceRate;
    });

    return studentArray;
  };

  // Helper function to get subject name from class object
  const getSubjectName = (classItem) => {
    return classItem.subject_name || classItem.subject || 'Untitled Subject';
  };

  // Get current subject name for display
  const getCurrentSubjectName = () => {
    if (!selectedSubject || !selectedSection) return '';
    const subject = classes.find(cls => 
      cls.subject_code === selectedSubject && cls.section === selectedSection
    );
    return subject ? `${subject.subject_code} - ${getSubjectName(subject)}` : selectedSubject;
  };

  // Get activities data for ActivityOverview
  const getActivitiesData = () => {
    if (!analyticsData || !Array.isArray(analyticsData.rawActivities)) {
      return {
        quizzes: [],
        assignments: [],
        activities: [],
        projects: []
      };
    }

    const quizzes = [];
    const assignments = [];
    const activitiesList = [];
    const projects = [];

    analyticsData.rawActivities.forEach(activity => {
      const submitted = activity.students?.filter(s => 
        s.submitted === true || s.submitted === 1 || s.submitted === '1'
      ).length || 0;
      
      const late = activity.students?.filter(s => 
        (s.submitted === true || s.submitted === 1 || s.submitted === '1') && 
        (s.late === true || s.late === 1 || s.late === '1')
      ).length || 0;
      
      const totalStudents = activity.students?.length || 0;
      
      // FIX: Calculate pending and missing correctly
      const currentDate = new Date();
      const deadlineDate = activity.deadline ? new Date(activity.deadline) : null;
      const isPastDeadline = deadlineDate && deadlineDate < currentDate;
      
      // If past deadline, unsubmitted = missing
      // If not past deadline, unsubmitted = pending
      const missing = isPastDeadline ? (totalStudents - submitted) : 0;
      const pending = !isPastDeadline ? (totalStudents - submitted) : 0;
      
      const deadline = activity.deadline ? new Date(activity.deadline).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'No deadline';

      // FIX: Include activity type in task display like the student version
      const activityType = activity.activity_type?.toLowerCase();
      const taskDisplay = activityType && activity.task_number 
        ? `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} ${activity.task_number}`
        : activity.task_number || `Task ${activity.id}`;

      const activityItem = {
        id: activity.id,
        task: taskDisplay, // FIXED: Now shows "Quiz 1" instead of just "1"
        title: activity.title || 'Untitled',
        submitted: submitted,
        missing: missing, // Only count as missing if past deadline
        pending: pending, // Count as pending if not past deadline
        late: late,
        deadline: deadline,
        isPastDeadline: isPastDeadline // Add this for reference
      };

      switch (activityType) {
        case 'quiz':
          quizzes.push(activityItem);
          break;
        case 'assignment':
          assignments.push(activityItem);
          break;
        case 'activity':
          activitiesList.push(activityItem);
          break;
        case 'project':
          projects.push(activityItem);
          break;
        default:
          activitiesList.push(activityItem);
      }
    });

    return { quizzes, assignments, activities: activitiesList, projects };
  };

  const activitiesData = getActivitiesData();

  // Calculate sorted ranking data
  const sortedRankingData = useMemo(() => {
    if (!analyticsData?.studentPerformance) return [];
    
    const sorted = [...analyticsData.studentPerformance].sort((a, b) => {
      const totalA = (a.submittedCount || 0) + (a.presentCount || 0);
      const totalB = (b.submittedCount || 0) + (b.presentCount || 0);
      
      return rankingSort === 'highest' ? totalB - totalA : totalA - totalB;
    });

    return sorted;
  }, [analyticsData?.studentPerformance, rankingSort]);

  // Calculate performance data for bar chart
  const performanceChartData = useMemo(() => {
    if (!analyticsData?.studentPerformance) return [];
    
    const sorted = [...analyticsData.studentPerformance].sort((a, b) => {
      const totalA = (a.submittedCount || 0) + (a.presentCount || 0);
      const totalB = (b.submittedCount || 0) + (b.presentCount || 0);
      
      return performanceFilter === 'top' ? totalB - totalA : totalA - totalB;
    });

    return sorted.slice(0, 10).map(student => ({
      name: student.id,
      studentName: student.name,
      Attendance: student.attendanceRate ? Number(student.attendanceRate.toFixed(1)) : 0,
      Submission: student.submissionRate ? Number(student.submissionRate.toFixed(1)) : 0
    }));
  }, [analyticsData?.studentPerformance, performanceFilter]);

  // Pagination calculations for student attendance
  const attendanceTotalPages = Math.ceil((analyticsData?.studentPerformance?.length || 0) / itemsPerPage);
  const attendanceStartIndex = (attendanceCurrentPage - 1) * itemsPerPage;
  const attendanceEndIndex = attendanceStartIndex + itemsPerPage;
  const currentAttendance = analyticsData?.studentPerformance?.slice(attendanceStartIndex, attendanceEndIndex) || [];

  // Pagination calculations for ranking
  const rankingTotalPages = Math.ceil(sortedRankingData.length / itemsPerPage);
  const rankingStartIndex = (rankingCurrentPage - 1) * itemsPerPage;
  const rankingEndIndex = rankingStartIndex + itemsPerPage;
  const currentRanking = sortedRankingData.slice(rankingStartIndex, rankingEndIndex);

  // Pagination handlers
  const handleAttendancePageChange = (page) => {
    setAttendanceCurrentPage(page);
  };

  const handleRankingPageChange = (page) => {
    setRankingCurrentPage(page);
  };

  // Toggle ranking sort
  const toggleRankingSort = () => {
    setRankingSort(rankingSort === 'highest' ? 'lowest' : 'highest');
  };

  // Toggle performance filter
  const togglePerformanceFilter = () => {
    setPerformanceFilter(performanceFilter === 'top' ? 'bottom' : 'top');
  };

  // Chart data preparation
  const attendanceChartData = analyticsData ? [
    { name: 'Present', value: analyticsData.attendanceSummary.present },
    { name: 'Late', value: analyticsData.attendanceSummary.late },
    { name: 'Absent', value: analyticsData.attendanceSummary.absent }
  ] : [];

  const activitiesChartData = analyticsData ? [
    { name: 'Submitted', value: analyticsData.activitiesSummary.submitted },
    { name: 'Late', value: analyticsData.activitiesSummary.late },
    { name: 'Pending', value: analyticsData.activitiesSummary.pending },
    { name: 'Missing', value: analyticsData.activitiesSummary.missing }
  ] : [];

  // Enhanced CustomPieLabel with better styling
  const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show labels for very small segments

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
        stroke="#333"
        strokeWidth="0.5"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Enhanced Custom Tooltip for Pie Charts
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + entry.value, 0);
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg min-w-[150px]">
          <p className="font-bold text-gray-800 mb-2 border-b pb-1">{payload[0].name}</p>
          <div className="space-y-1">
            <p className="text-sm font-semibold" style={{ color: payload[0].color }}>
              Count: {payload[0].value}
            </p>
            <p className="text-sm text-gray-600">
              Percentage: {total > 0 ? ((payload[0].value / total) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for bar chart to show student name when hovering
  const CustomBarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 sm:p-3 border border-gray-300 rounded-lg shadow-lg text-xs sm:text-sm max-w-[200px]">
          <p className="font-bold text-gray-800 mb-1 truncate">{data.studentName}</p>
          <p className="text-[#00A15D] text-xs sm:text-sm">Attendance: {payload[0].value}%</p>
          <p className="text-[#2196F3] text-xs sm:text-sm">Submission: {payload[1].value}%</p>
        </div>
      );
    }
    return null;
  };

  // Get situational teacher actions based on current data
  const getAttendanceActions = () => {
    if (!analyticsData) return [];
    
    const { present, late, absent, total } = analyticsData.attendanceSummary;
    const actions = [];
    
    if (present === 0 && total > 0) {
      actions.push("No students are attending regularly - consider checking if there are schedule conflicts");
    } else if (absent > present) {
      actions.push("More than half of students are absent - consider contacting the class about attendance expectations");
    } else if (late > present * 0.3) {
      actions.push("Many students are arriving late - consider adjusting class start time or addressing lateness");
    } else if (present > total * 0.8) {
      actions.push("Great attendance! Consider implementing a reward system to maintain this rate");
    } else {
      actions.push("Monitor attendance patterns and reach out to frequently absent students");
    }

    if (absent > 0) {
      actions.push("Follow up with students who have multiple absences");
    }

    return actions;
  };

  const getActivitiesActions = () => {
    if (!analyticsData) return [];
    
    const { submitted, pending, missing, late, total } = analyticsData.activitiesSummary;
    const actions = [];
    
    if (pending > submitted) {
      actions.push("Many activities are still pending - consider extending deadlines or offering help sessions");
    }
    
    if (missing > total * 0.2) {
      actions.push("High number of missing submissions - reach out to students who need support");
    }
    
    if (late > submitted * 0.3) {
      actions.push("Many late submissions - review submission policies and provide clear deadlines");
    }
    
    if (pending > 0) {
      actions.push("Send reminders for pending activities approaching their deadlines");
    }
    
    if (submitted > total * 0.8 && missing < total * 0.1) {
      actions.push("Excellent submission rate! Consider providing positive feedback to the class");
    }

    return actions.slice(0, 3); // Limit to 3 most relevant actions
  };

  const getPerformanceActions = () => {
    const actions = [];
    
    if (performanceFilter === 'top') {
      actions.push("Consider these students for peer mentoring or leadership roles");
      actions.push("Recognize their achievements to motivate the entire class");
    } else {
      actions.push("Schedule one-on-one meetings to understand challenges");
      actions.push("Provide additional resources and support for struggling students");
    }

    return actions;
  };

  // Simple Chart Indicator Component with Teacher Actions
  const ChartIndicator = ({ title, rate, teacherActions }) => (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-lg text-[#465746]">{title}</h4>
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
          parseFloat(rate) >= 80 ? 'bg-green-100 text-green-800' : 
          parseFloat(rate) >= 60 ? 'bg-yellow-100 text-yellow-800' : 
          'bg-red-100 text-red-800'
        }`}>
          {rate}% Overall Rate
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
          {teacherActions.map((action, index) => (
            <li key={index}>{action}</li>
          ))}
        </ul>
      </div>
    </div>
  );

  // Custom Legend with circle icons
  const CustomLegend = ({ payload }) => (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <div key={`item-${index}`} className="flex items-center gap-2 text-xs">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );

  // Pagination Component
  const Pagination = ({ currentPage, totalPages, onPageChange, dataType, totalItems }) => {
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (totalPages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-2">
        <div className="text-xs sm:text-sm text-gray-600">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} {dataType === 'ranking' ? 'students' : 'entries'}
        </div>
        
        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center justify-center w-8 h-8 rounded-md border ${
              currentPage === 1 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300' 
                : 'bg-white text-[#465746] border-gray-300 hover:bg-gray-50 cursor-pointer'
            }`}
          >
            <img src={ArrowLeft} alt="Previous" className="w-5 h-5" />
          </button>

          {/* Page Numbers */}
          {pageNumbers.map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`cursor-pointer flex items-center justify-center w-8 h-8 rounded-md border text-sm font-medium ${
                currentPage === page
                  ? 'bg-[#465746] text-white border-[#465746]'
                  : 'bg-white text-[#465746] border-gray-300 hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex items-center justify-center w-8 h-8 rounded-md border ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-300'
                : 'bg-white text-[#465746] border-gray-300 hover:bg-gray-50 cursor-pointer'
            }`}
          >
            <img src={ArrowRight} alt="Next" className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen}/>

        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          {/* Header Section */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img 
                src={Analytics} 
                alt="Analytics" 
                className="h-6 w-6 sm:h-7 sm:w-7 mr-3" 
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                Reports
              </h1>
            </div>
            <div className="text-sm sm:text-base lg:text-lg text-[#465746]">
              <span>
                Student Performance
                {selectedSection && selectedSubject && (
                  <span className="text-gray-600 ml-2">
                    - Section {selectedSection} - {getCurrentSubjectName()}
                  </span>
                )}
              </span>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-4 sm:mb-5" />

          {/* Filter and Search Section */}
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 justify-between items-stretch lg:items-center mb-4 sm:mb-5">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1">
              {/* Section Dropdown */}
              <div className="relative w-full sm:w-auto sm:min-w-[150px] lg:min-w-[180px]">
                <button
                  onClick={() => { setOpenSection(!openSection); setOpenSubject(false); }}
                  className="flex w-full items-center justify-between font-bold px-3 py-2 sm:py-2.5 bg-[#fff] rounded-md cursor-pointer shadow-md text-sm sm:text-base text-[#465746]"
                  disabled={classesLoading || sections.length === 0}
                >
                  <span>
                    {classesLoading ? 'Loading...' : 
                     sections.length === 0 ? 'No sections available' :
                     selectedSection || 'Select Section'
                    }
                  </span>
                  {!classesLoading && sections.length > 0 && (
                    <img 
                      src={ArrowDown} 
                      alt="ArrowDown" 
                      className="h-4 w-4 sm:h-5 sm:w-5 ml-2" 
                    />
                  )}
                </button>
                {openSection && sections.length > 0 && (
                  <div className="absolute top-full mt-1 bg-white rounded-md w-full shadow-lg border border-gray-200 z-20 max-h-60 overflow-y-auto">
                    {sections.map((section) => (
                      <button 
                        key={section}
                        className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-sm sm:text-base text-[#465746] border-b border-gray-100 last:border-b-0"
                        onClick={() => { 
                          setSelectedSection(section);
                          setSelectedSubject(""); // Reset subject when section changes
                          setOpenSection(false);
                        }}>
                        {section}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Subject Dropdown */}
              <div className="relative w-full sm:w-auto sm:min-w-[200px] lg:min-w-[250px]">
                <button
                  onClick={() => { 
                    if (selectedSection) {
                      setOpenSubject(!openSubject); 
                      setOpenSection(false); 
                    }
                  }}
                  className={`flex w-full items-center justify-between font-bold px-3 py-2 sm:py-2.5 bg-[#fff] rounded-md cursor-pointer shadow-md text-sm sm:text-base ${
                    !selectedSection ? 'text-gray-400 cursor-not-allowed' : 'text-[#465746]'
                  }`}
                  disabled={classesLoading || getFilteredSubjects.length === 0 || !selectedSection}
                >
                  <span>
                    {classesLoading ? 'Loading classes...' : 
                     !selectedSection ? 'Select Subject' :
                     getFilteredSubjects.length === 0 ? 'No subjects available' :
                     selectedSubject ? 
                      getFilteredSubjects.find(cls => cls.subject_code === selectedSubject)?.subject_code || 'Select Subject' 
                      : 'Select Subject'
                    }
                  </span>
                  {!classesLoading && getFilteredSubjects.length > 0 && selectedSection && (
                    <img 
                      src={ArrowDown} 
                      alt="ArrowDown" 
                      className="h-4 w-4 sm:h-5 sm:w-5 ml-2" 
                    />
                  )}
                </button>
                {openSubject && getFilteredSubjects.length > 0 && selectedSection && (
                  <div className="absolute top-full mt-1 bg-white rounded-md w-full shadow-lg border border-gray-200 z-10 max-h-60 overflow-y-auto">
                    {getFilteredSubjects.map((classItem) => (
                      <button 
                        key={`${classItem.subject_code}-${classItem.section}`}
                        className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-sm sm:text-base text-[#465746] border-b border-gray-100 last:border-b-0"
                        onClick={() => { 
                          setSelectedSubject(classItem.subject_code);
                          setOpenSubject(false);
                        }}>
                        <div className="font-medium">{classItem.subject_code}</div>
                        <div className="text-xs text-gray-600">
                          {getSubjectName(classItem)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* No Classes Message */}
          {!classesLoading && classes.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center mb-6">
              <h3 className="font-bold text-lg text-yellow-800 mb-2">No Classes Found</h3>
              <p className="text-yellow-700">
                You don't have any classes assigned. Please contact administration to get assigned to classes.
              </p>
            </div>
          )}

          {/* Analytics Charts Section */}
          {classesLoading ? (
            <div className="bg-[#fff] p-6 rounded-lg shadow-md text-center">
              <p className="text-[#465746]">Loading classes...</p>
            </div>
          ) : loading ? (
            <div className="bg-[#fff] p-6 rounded-lg shadow-md text-center">
              <p className="text-[#465746]">Loading analytics data...</p>
            </div>
          ) : analyticsData && selectedSubject && selectedSection ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                {/* Attendance Pie Chart - UPDATED DESIGN */}
                <div className="bg-gradient-to-br from-white to-blue-50 p-4 sm:p-6 rounded-xl shadow-lg border border-blue-100">
                  <ChartIndicator
                    title="Attendance Overview"
                    rate={analyticsData.attendanceSummary.attendanceRate}
                    teacherActions={getAttendanceActions()}
                  />
                  <div className="h-64 sm:h-80 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart style={{ outline: 'none' }}>
                        <Pie
                          data={attendanceChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => <CustomPieLabel name={name} percent={percent} />}
                          outerRadius="80%"
                          innerRadius="45%" // Donut chart effect
                          fill="#8884d8"
                          dataKey="value"
                          activeShape={false}
                        >
                          {attendanceChartData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={ATTENDANCE_COLORS[index % ATTENDANCE_COLORS.length]} 
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                        <Legend content={<CustomLegend />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Activities Pie Chart - UPDATED DESIGN */}
                <div className="bg-gradient-to-br from-white to-green-50 p-4 sm:p-6 rounded-xl shadow-lg border border-green-100">
                  <ChartIndicator
                    title="Activities Submission"
                    rate={analyticsData.activitiesSummary.submissionRate}
                    teacherActions={getActivitiesActions()}
                  />
                  <div className="h-64 sm:h-80 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart style={{ outline: 'none' }}>
                        <Pie
                          data={activitiesChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => <CustomPieLabel name={name} percent={percent} />}
                          outerRadius="80%"
                          innerRadius="45%" // Donut chart effect
                          fill="#8884d8"
                          dataKey="value"
                          activeShape={false}
                        >
                          {activitiesChartData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={ACTIVITIES_COLORS[index % ACTIVITIES_COLORS.length]} 
                              stroke="#fff"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                        <Legend content={<CustomLegend />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Student Performance Bar Chart */}
                <div className="bg-gradient-to-br from-white to-purple-50 p-4 sm:p-6 rounded-xl shadow-lg border border-purple-100 lg:col-span-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-[#465746] mb-2">
                        Student Performance - Section {selectedSection}
                      </h3>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 max-w-2xl">
                        <ul className="text-sm text-purple-700 list-disc list-inside space-y-1">
                          {getPerformanceActions().map((action, index) => (
                            <li key={index}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <button
                      onClick={togglePerformanceFilter}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-base font-medium transition-all duration-200 cursor-pointer mt-2 sm:mt-0"
                    >
                      {performanceFilter === 'top' ? (
                        <>
                          <img src={Award} alt="Top Performers" className="w-5 h-5" />
                          <span>Top Performers</span>
                        </>
                      ) : (
                        <>
                          <img src={LeastActivities} alt="Least Performers" className="w-5 h-5" />
                          <span>Least Performers</span>
                        </>
                      )}
                      <img 
                        src={ArrowDown} 
                        alt="Sort" 
                        className={`h-4 w-4 transition-transform ${performanceFilter === 'bottom' ? 'rotate-180' : ''}`} 
                      />
                    </button>
                  </div>
                  <div className="h-60 sm:h-80 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={performanceChartData}
                        margin={{ 
                          top: 10, 
                          right: 10, 
                          left: 0, 
                          bottom: 20
                        }}
                        className="text-sm sm:text-lg"
                        style={{ outline: 'none' }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end" 
                          height={60} 
                          interval={0}
                          tick={{ fontSize: 12 }}
                          tickMargin={5} 
                        />
                        <YAxis 
                          label={{ 
                            value: 'Percentage (%)', 
                            angle: -90, 
                            style: { fontSize: 12 } 
                          }} 
                          domain={[0, 100]}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip 
                          content={<CustomBarTooltip />}
                          wrapperStyle={{ zIndex: 1000 }}
                          cursor={{ fill: 'rgba(0, 161, 93, 0.1)' }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '10px' }}
                          iconSize={15}
                          className="text-sm sm:text-lg"
                        />
                        <Bar 
                          dataKey="Attendance" 
                          fill="#00C853" 
                          name="Attendance Rate" 
                          barSize={40} 
                          maxBarSize={60}
                          radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                          dataKey="Submission" 
                          fill="#2962FF" 
                          name="Submission Rate" 
                          barSize={40} 
                          maxBarSize={60}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          ) : !classesLoading && classes.length > 0 ? (
            <div className="bg-[#fff] p-6 rounded-lg shadow-md text-center">
              <p className="text-[#465746]">
                {!selectedSection ? 'Please select a section to view analytics' : 'Please select a subject to view analytics'}
              </p>
            </div>
          ) : null}

          {/* ActivityOverview component - Only show if we have classes and both selections made */}
          {!classesLoading && selectedSubject && selectedSection && (
            <ActivityOverview
              quizzesList={activitiesData.quizzes}
              assignmentsList={activitiesData.assignments}
              activitiesList={activitiesData.activities}
              projectsList={activitiesData.projects}
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
              selectedSubject={selectedSubject}
              selectedSection={selectedSection}
              getCurrentSubjectName={getCurrentSubjectName}
            />
          )}

          {/* STUDENT RANKING SECTION - Only show if we have classes and analytics data */}
          {!classesLoading && selectedSubject && selectedSection && (
            <div className="bg-[#fff] rounded-lg sm:rounded-xl shadow-md mt-4 sm:mt-5 p-4 sm:p-5 text-[#465746] mb-4 sm:mb-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4">
                <p className="text-base sm:text-lg lg:text-xl font-bold">
                  Class Ranking - {getCurrentSubjectName()} (Section {selectedSection})
                </p>
                <button
                  onClick={toggleRankingSort}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-base font-medium transition-all duration-200 cursor-pointer mt-2 sm:mt-0"
                >
                  {rankingSort === 'highest' ? (
                    <>
                      <img src={Award} alt="Most Activities" className="w-5 h-5" />
                      <span>Most Activities</span>
                    </>
                  ) : (
                    <>
                      <img src={LeastActivities} alt="Least Activities" className="w-5 h-5" />
                      <span>Least Activities</span>
                    </>
                  )}
                  <img 
                    src={ArrowDown} 
                    alt="Sort" 
                    className={`h-4 w-4 transition-transform ${rankingSort === 'lowest' ? 'rotate-180' : ''}`} 
                  />
                </button>
              </div>

              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="px-3 py-3 text-left font-bold text-gray-700 bg-gray-50 rounded-tl-lg text-base">Rank</th>
                        <th className="px-3 py-3 text-left font-bold text-gray-700 bg-gray-50 text-base">Student</th>
                        <th className="px-3 py-3 text-left font-bold text-gray-700 bg-gray-50 text-base">Submitted</th>
                        <th className="px-3 py-3 text-left font-bold text-gray-700 bg-gray-50 text-base">Present</th>
                        <th className="px-3 py-3 text-left font-bold text-gray-700 bg-gray-50 text-base">Late</th>
                        <th className="px-3 py-3 text-left font-bold text-gray-700 bg-gray-50 text-base">Absent</th>
                        <th className="px-3 py-3 text-left font-bold text-gray-700 bg-gray-50 text-base">Late Sub</th>
                        <th className="px-3 py-3 text-left font-bold text-gray-700 bg-gray-50 text-base">Pending</th>
                        <th className="px-3 py-3 text-left font-bold text-gray-700 bg-gray-50 text-base">Missed</th>
                        <th className="px-3 py-3 text-left font-bold text-gray-700 bg-gray-50 rounded-tr-lg text-base">Total Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {currentRanking.map((student, index) => {
                        const totalScore = (student.submittedCount || 0) + (student.presentCount || 0);
                        
                        return (
                          <tr 
                            key={student.id} 
                            className="group transition-colors hover:bg-gray-50"
                          >
                            <td className="px-3 py-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {index === 0 && rankingSort === 'highest' && (
                                  <img src={Award} alt="Gold Medal" className="w-6 h-6" />
                                )}
                                {index === 1 && rankingSort === 'highest' && (
                                  <img src={Award} alt="Silver Medal" className="w-6 h-6" />
                                )}
                                {index === 2 && rankingSort === 'highest' && (
                                  <img src={Award} alt="Bronze Medal" className="w-6 h-6" />
                                )}
                                {index === 0 && rankingSort === 'lowest' && (
                                  <img src={LeastActivities} alt="Least Activities" className="w-6 h-6" />
                                )}
                                <span className={`font-semibold text-base ${
                                  index === 0 && rankingSort === 'highest' ? 'text-yellow-600' :
                                  index === 1 && rankingSort === 'highest' ? 'text-gray-600' :
                                  index === 2 && rankingSort === 'highest' ? 'text-orange-600' :
                                  index === 0 && rankingSort === 'lowest' ? 'text-red-500' :
                                  'text-gray-700'
                                }`}>
                                  {rankingStartIndex + index + 1}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3.5">
                              <div className="flex flex-col">
                                <span className="font-medium text-base text-gray-900">
                                  {student.name}
                                </span>
                                <span className="text-sm text-gray-500 mt-0.5">{student.id}</span>
                              </div>
                            </td>
                            <td className="px-3 py-3.5">
                              <span className="font-medium text-base text-[#00A15D]">
                                {student.submittedCount || 0}
                              </span>
                            </td>
                            <td className="px-3 py-3.5">
                              <span className="font-medium text-base text-[#00A15D]">
                                {student.presentCount || 0}
                              </span>
                            </td>
                            <td className="px-3 py-3.5">
                              <span className="font-medium text-base text-[#2196F3]">
                                {student.lateCount || 0}
                              </span>
                            </td>
                            <td className="px-3 py-3.5">
                              <span className="font-medium text-base text-[#FF6666]">
                                {student.absentCount || 0}
                              </span>
                            </td>
                            <td className="px-3 py-3.5">
                              <span className="font-medium text-base text-[#2196F3]">
                                {student.lateSubmissionCount || 0}
                              </span>
                            </td>
                            <td className="px-3 py-3.5">
                              <span className="font-medium text-base text-[#F59E0B]">
                                {student.pendingCount || 0}
                              </span>
                            </td>
                            <td className="px-3 py-3.5">
                              <span className="font-medium text-base text-[#FF6666]">
                                {student.missingCount || 0}
                              </span>
                            </td>
                            <td className="px-3 py-3.5">
                              <span className="font-bold text-base" style={{ color: '#2c5530' }}>
                                {totalScore}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Ranking Pagination */}
              <Pagination
                currentPage={rankingCurrentPage}
                totalPages={rankingTotalPages}
                onPageChange={handleRankingPageChange}
                dataType="ranking"
                totalItems={sortedRankingData.length}
              />
            </div>
          )}

          {/* Student Attendance Tracking - Only show if we have classes and analytics data */}
          {!classesLoading && selectedSubject && selectedSection && (
            <div className="bg-[#fff] rounded-lg sm:rounded-xl shadow-md mt-4 sm:mt-5 p-4 sm:p-5 text-[#465746]">
              <p className="text-base sm:text-lg lg:text-xl font-bold">
                Student Attendance Tracking - {getCurrentSubjectName()} (Section {selectedSection})
              </p>
              <hr className="border-[#465746]/30 my-3 sm:my-4" />
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                  <table className="min-w-full border-collapse text-xs sm:text-sm lg:text-base">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold">No.</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold whitespace-nowrap">Student No.</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold whitespace-nowrap">Student Name</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#00A15D]">Submitted</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#00A15D]">Present</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#2196F3]">Late</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#FF6666]">Absent</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#2196F3]">Late Sub</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#F59E0B]">Pending</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#FF6666]">Missed</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentAttendance.length > 0 ? (
                        currentAttendance.map((student, index) => (
                          <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-2 sm:px-4 py-2 sm:py-3">{attendanceStartIndex + index + 1}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{student.id}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{student.name}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#00A15D]">{student.submittedCount}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#00A15D]">{student.presentCount}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#2196F3]">{student.lateCount}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#FF6666]">{student.absentCount}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#2196F3]">{student.lateSubmissionCount}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#F59E0B]">{student.pendingCount}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#FF6666]">{student.missingCount}</td>
                            <td className="px-2 sm:px-4 py-2 sm:py-3">
                              <Link 
                                to={`/AnalyticsIndividualInfo?student_id=${student.id}&subject_code=${selectedSubject}&section=${selectedSection}`}
                                state={{ 
                                  student: student,
                                  subjectCode: selectedSubject,
                                  section: selectedSection
                                }}
                              >
                                <img src={Details} alt="Details" className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:opacity-70" />
                              </Link>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="11" className="px-2 sm:px-4 py-2 sm:py-3 text-center text-gray-500">
                            No student data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Attendance Tracking Pagination */}
              <Pagination
                currentPage={attendanceCurrentPage}
                totalPages={attendanceTotalPages}
                onPageChange={handleAttendancePageChange}
                dataType="attendance"
                totalItems={analyticsData?.studentPerformance?.length || 0}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}