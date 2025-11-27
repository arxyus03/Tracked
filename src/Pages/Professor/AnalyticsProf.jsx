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

  // Pagination states
  const [activityCurrentPage, setActivityCurrentPage] = useState(1);
  const [attendanceCurrentPage, setAttendanceCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Search state for Activity List
  const [activitySearchTerm, setActivitySearchTerm] = useState("");

  // Colors for charts
  const COLORS = ['#00A15D', '#FF6666', '#2196F3', '#FFC107', '#9C27B0'];

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
    setActivityCurrentPage(1);
    setAttendanceCurrentPage(1);
  }, [selectedFilter, selectedSubject, selectedSection]);

  // Reset search and pagination when search term changes
  useEffect(() => {
    setActivityCurrentPage(1);
  }, [activitySearchTerm]);

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

  // Fixed: Combine all activities when "Overall" is selected (empty selectedFilter)
  const displayedList = useMemo(() => {
    if (selectedFilter === 'Assignment') {
      return activitiesData.assignments || [];
    } else if (selectedFilter === 'Activities') {
      return activitiesData.activities || [];
    } else if (selectedFilter === 'Projects') {
      return activitiesData.projects || [];
    } else if (selectedFilter === '') {
      // Overall view - combine all activity types
      return [
        ...(activitiesData.quizzes || []),
        ...(activitiesData.assignments || []),
        ...(activitiesData.activities || []),
        ...(activitiesData.projects || [])
      ];
    } else {
      // Default to quizzes (for backward compatibility)
      return activitiesData.quizzes || [];
    }
  }, [selectedFilter, activitiesData]);

  // Filter activities based on search term
  const filteredActivities = useMemo(() => {
    if (!activitySearchTerm.trim()) {
      return displayedList;
    }
    
    const searchTermLower = activitySearchTerm.toLowerCase().trim();
    return displayedList.filter(activity => 
      activity.task.toLowerCase().includes(searchTermLower) ||
      activity.title.toLowerCase().includes(searchTermLower) ||
      activity.deadline.toLowerCase().includes(searchTermLower)
    );
  }, [displayedList, activitySearchTerm]);

  const displayedLabel = selectedFilter === '' 
    ? 'All Activities' 
    : selectedFilter || 'Quizzes';

  // Pagination calculations for activities (using filteredActivities)
  const activityTotalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const activityStartIndex = (activityCurrentPage - 1) * itemsPerPage;
  const activityEndIndex = activityStartIndex + itemsPerPage;
  const currentActivities = filteredActivities.slice(activityStartIndex, activityEndIndex);

  // Pagination calculations for student attendance
  const attendanceTotalPages = Math.ceil((analyticsData?.studentPerformance?.length || 0) / itemsPerPage);
  const attendanceStartIndex = (attendanceCurrentPage - 1) * itemsPerPage;
  const attendanceEndIndex = attendanceStartIndex + itemsPerPage;
  const currentAttendance = analyticsData?.studentPerformance?.slice(attendanceStartIndex, attendanceEndIndex) || [];

  // Pagination handlers
  const handleActivityPageChange = (page) => {
    setActivityCurrentPage(page);
  };

  const handleAttendancePageChange = (page) => {
    setAttendanceCurrentPage(page);
  };

  // Chart data preparation
  const attendanceChartData = analyticsData ? [
    { name: 'Present', value: analyticsData.attendanceSummary.present },
    { name: 'Absent', value: analyticsData.attendanceSummary.absent },
    { name: 'Late', value: analyticsData.attendanceSummary.late }
  ] : [];

  const activitiesChartData = analyticsData ? [
    { name: 'Submitted', value: analyticsData.activitiesSummary.submitted },
    { name: 'Missing', value: analyticsData.activitiesSummary.missing },
    { name: 'Pending', value: analyticsData.activitiesSummary.pending }, // Add pending to chart
    { name: 'Late', value: analyticsData.activitiesSummary.late }
  ] : [];

  // Show student IDs instead of full names in the bar chart
  const performanceChartData = analyticsData && analyticsData.studentPerformance ?
    analyticsData.studentPerformance.slice(0, 10).map(student => ({
      name: student.id,
      studentName: student.name,
      Attendance: student.attendanceRate ? Number(student.attendanceRate.toFixed(1)) : 0,
      Submission: student.submissionRate ? Number(student.submissionRate.toFixed(1)) : 0
    })) : [];

  const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
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

  // Pagination Component
  const Pagination = ({ currentPage, totalPages, onPageChange, dataType }) => {
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
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, dataType === 'activities' ? filteredActivities.length : analyticsData?.studentPerformance?.length || 0)} of {dataType === 'activities' ? filteredActivities.length : analyticsData?.studentPerformance?.length || 0} tasks
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
                Analytics
              </h1>
            </div>
            <div className="text-sm sm:text-base lg:text-lg text-[#465746]">
              <span>Student Performance</span>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
              {/* Attendance Pie Chart */}
              <div className="bg-[#fff] p-4 sm:p-6 rounded-lg shadow-md">
                <h3 className="font-bold text-lg mb-4 text-[#465746]">Attendance Overview</h3>
                <div className="h-64 sm:h-80 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart style={{ outline: 'none' }}>
                      <Pie
                        data={attendanceChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={CustomPieLabel}
                        outerRadius="70%" 
                        fill="#8884d8"
                        dataKey="value"
                        activeShape={false}
                      >
                        {attendanceChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #ddd', 
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '12px'
                        }}
                        itemStyle={{ fontSize: '12px', padding: '2px 0' }}
                        wrapperStyle={{ zIndex: 1000 }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '5px' }}
                        iconSize={15}
                        className="text-sm sm:text-lg"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-2">
                  <p className="text-sm text-[#465746]">
                    Overall Attendance Rate: <strong>{analyticsData.attendanceSummary.attendanceRate}%</strong>
                  </p>
                </div>
              </div>

              {/* Activities Pie Chart */}
              <div className="bg-[#fff] p-4 sm:p-6 rounded-lg shadow-md">
                <h3 className="font-bold text-lg mb-4 text-[#465746]">Activities Submission</h3>
                <div className="h-64 sm:h-80 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart style={{ outline: 'none' }}>
                      <Pie
                        data={activitiesChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={CustomPieLabel}
                        outerRadius="70%"  // Change from 80 to "60%" for responsive sizing
                        fill="#8884d8"
                        dataKey="value"
                        activeShape={false}
                      >
                        {activitiesChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #ddd', 
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '12px'
                        }}
                        itemStyle={{ fontSize: '12px', padding: '2px 0' }}
                        wrapperStyle={{ zIndex: 1000 }}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '5px' }}
                        iconSize={15}
                        className="text-sm sm:text-lg"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-2">
                  <p className="text-sm text-[#465746]">
                    Overall Submission Rate: <strong>{analyticsData.activitiesSummary.submissionRate}%</strong>
                  </p>
                  <p className="text-sm text-[#2196F3]">
                    Late Submissions: <strong>{analyticsData.activitiesSummary.late}</strong>
                  </p>
                  <p className="text-sm text-[#F59E0B]">
                    Pending Submissions: <strong>{analyticsData.activitiesSummary.pending}</strong>
                  </p>
                </div>
              </div>

              {/* Student Performance Bar Chart */}
              <div className="bg-[#fff] p-4 sm:p-6 rounded-lg shadow-md lg:col-span-2">
                <h3 className="font-bold text-lg mb-4 text-[#465746]">
                  Top Student Performance - Section {selectedSection}
                </h3>
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
                      <CartesianGrid strokeDasharray="3 3" />
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
                      <Bar dataKey="Attendance" fill="#00A15D" name="Attendance Rate" barSize={40} maxBarSize={60} />
                      <Bar dataKey="Submission" fill="#2196F3" name="Submission Rate" barSize={40} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
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

          {/* Only show activity list and student tracking if we have classes and analytics data */}
          {!classesLoading && selectedSubject && selectedSection && (
            <>
              {/* ACTIVITY LIST */}
              <div className="bg-[#fff] p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mt-4 sm:mt-5 text-[#465746]">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <p className="font-bold text-base sm:text-lg lg:text-xl">
                    {displayedLabel} - {getCurrentSubjectName()} (Section {selectedSection})
                  </p>
                  
                  {/* Activity List Search */}
                  <div className="relative w-full sm:w-64 lg:w-80">
                    <input
                      type="text"
                      placeholder="Search activities..."
                      value={activitySearchTerm}
                      onChange={(e) => setActivitySearchTerm(e.target.value)}
                      className="w-full h-9 sm:h-10 rounded-md px-3 py-2 pr-10 shadow-md outline-none bg-white text-xs sm:text-sm text-[#465746] border border-gray-300 focus:border-[#465746]"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                      <img src={Search} alt="Search" className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                    <table className="min-w-full border-collapse text-xs sm:text-sm lg:text-base">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left p-2 sm:p-3 font-bold">Task</th>
                          <th className="text-left p-2 sm:p-3 font-bold">Title</th>
                          <th className="text-left p-2 sm:p-3 font-bold text-[#00A15D]">Submitted</th>
                          <th className="text-left p-2 sm:p-3 font-bold text-[#2196F3]">Late</th>
                          <th className="text-left p-2 sm:p-3 font-bold text-[#F59E0B]">Pending</th>
                          <th className="text-left p-2 sm:p-3 font-bold text-[#FF6666]">Missing</th>
                          <th className="text-left p-2 sm:p-3 font-bold">Deadline</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentActivities.length > 0 ? (
                          currentActivities.map(item => {
                            const hasSubmitted = item.submitted && item.submitted > 0;
                            const hasLate = item.late && item.late > 0;
                            const hasPending = item.pending && item.pending > 0;
                            const hasMissing = item.missing && item.missing > 0;
                            
                            return (
                              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="p-2 sm:p-3 whitespace-nowrap">{item.task}</td>
                                <td className="p-2 sm:p-3">{item.title}</td>
                                
                                {/* Submitted Column - Show count as number */}
                                <td className="p-2 sm:p-3 text-[#00A15D] font-semibold">
                                  {hasSubmitted ? item.submitted : '0'}
                                </td>
                                
                                {/* Late Column - Show count as number */}
                                <td className="p-2 sm:p-3 text-[#2196F3] font-semibold">
                                  {hasLate ? item.late : '0'}
                                </td>
                                
                                {/* Pending Column - Show count as number */}
                                <td className="p-2 sm:p-3 text-[#F59E0B] font-semibold">
                                  {hasPending ? item.pending : '0'}
                                </td>
                                
                                {/* Missing Column - Show count as number */}
                                <td className="p-2 sm:p-3 text-[#FF6666] font-semibold">
                                  {hasMissing ? item.missing : '0'}
                                </td>
                                
                                <td className="p-2 sm:p-3 whitespace-nowrap">{item.deadline}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="7" className="p-2 sm:p-3 text-center text-gray-500">
                              {activitySearchTerm ? `No activities found for "${activitySearchTerm}"` : `No ${displayedLabel.toLowerCase()} found`}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Activity List Pagination */}
                <Pagination
                  currentPage={activityCurrentPage}
                  totalPages={activityTotalPages}
                  onPageChange={handleActivityPageChange}
                  dataType="activities"
                />
              </div>

              {/* Student Attendance Tracking */}
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
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#00A15D]">Present</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#2196F3]">Late</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#FF6666]">Absent</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#00A15D]">Submitted</th>
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
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#00A15D]">{student.presentCount}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#2196F3]">{student.lateCount}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#FF6666]">{student.absentCount}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#00A15D]">{student.submittedCount}</td>
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
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}