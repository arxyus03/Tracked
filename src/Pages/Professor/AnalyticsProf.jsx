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

export default function AnalyticsProf() {
  const [isOpen, setIsOpen] = useState(false);
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

  // Colors for charts
  const COLORS = ['#00A15D', '#FF6666', '#FFC107', '#2196F3', '#9C27B0'];

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
          
          if (classesData.length > 0) {
            setSelectedSubject(classesData[0].subject_code);
            setSelectedSection(classesData[0].section || '');
          } else {
            setSelectedSubject("");
            setSelectedSection("");
          }
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

  // Filter classes by selected section
  const filteredClasses = useMemo(() => {
    if (!selectedSection) return classes;
    return classes.filter(cls => cls.section === selectedSection);
  }, [classes, selectedSection]);

  // Fetch analytics data when subject changes
  useEffect(() => {
    if (selectedSubject && professorId) {
      fetchAnalyticsData();
    } else {
      setAnalyticsData(null);
    }
  }, [selectedSubject, professorId]);

  const fetchAnalyticsData = async () => {
    if (!selectedSubject || !professorId) return;

    setLoading(true);
    try {
      // Fetch attendance data
      const attendanceUrl = `https://tracked.6minds.site/Professor/AttendanceDB/get_attendance_history.php?subject_code=${selectedSubject}&professor_ID=${professorId}`;
      const attendanceResponse = await fetch(attendanceUrl);
      
      if (!attendanceResponse.ok) {
        throw new Error(`Attendance API failed: ${attendanceResponse.status}`);
      }
      
      const attendanceData = await attendanceResponse.json();

      // Fetch activities data
      const activitiesUrl = `https://tracked.6minds.site/Professor/SubjectDetailsDB/get_activities.php?subject_code=${selectedSubject}`;
      const activitiesResponse = await fetch(activitiesUrl);
      
      if (!activitiesResponse.ok) {
        throw new Error(`Activities API failed: ${activitiesResponse.status}`);
      }
      
      const activitiesData = await activitiesResponse.json();

      // Process the data
      processAnalyticsData(attendanceData, activitiesData);
      
    } catch {
      // Set empty analytics data structure
      setAnalyticsData({
        attendanceSummary: { present: 0, absent: 0, late: 0, total: 0, attendanceRate: 0 },
        activitiesSummary: { submitted: 0, missing: 0, late: 0, total: 0, submissionRate: 0 },
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
    let totalEntries = 0;

    activities.forEach(activity => {
      if (!Array.isArray(activity.students)) return;
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
          totalMissing++;
        }
      });
    });

    return {
      submitted: totalSubmitted,
      missing: totalMissing,
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
          missingCount: 0,
          lateSubmissionCount: 0,
          totalActivities: 0
        });
      });
    }

    // Count attendance
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

    // Count activity submissions
    activities.forEach(activity => {
      if (!Array.isArray(activity.students)) return;
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
          studentData.missingCount++;
        }
      });
    });

    // Convert to array and calculate rates
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
      const missing = totalStudents - submitted;
      
      const deadline = activity.deadline ? new Date(activity.deadline).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'No deadline';

      const activityItem = {
        id: activity.id,
        task: activity.task_number || `Task ${activity.id}`,
        title: activity.title || 'Untitled',
        submitted: submitted,
        missing: missing,
        late: late,
        deadline: deadline
      };

      const activityType = activity.activity_type?.toLowerCase();
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
  const displayedList = selectedFilter === 'Assignment'
    ? activitiesData.assignments
    : selectedFilter === 'Activities'
    ? activitiesData.activities
    : selectedFilter === 'Projects'
    ? activitiesData.projects
    : activitiesData.quizzes;

  const displayedLabel = selectedFilter === '' ? 'Quizzes' : selectedFilter;

  // Chart data preparation
  const attendanceChartData = analyticsData ? [
    { name: 'Present', value: analyticsData.attendanceSummary.present },
    { name: 'Absent', value: analyticsData.attendanceSummary.absent },
    { name: 'Late', value: analyticsData.attendanceSummary.late }
  ] : [];

  const activitiesChartData = analyticsData ? [
    { name: 'Submitted', value: analyticsData.activitiesSummary.submitted },
    { name: 'Missing', value: analyticsData.activitiesSummary.missing },
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
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-bold">{`Student: ${data.studentName}`}</p>
          <p className="text-[#00A15D]">{`Attendance: ${payload[0].value}%`}</p>
          <p className="text-[#2196F3]">{`Submission: ${payload[1].value}%`}</p>
        </div>
      );
    }
    return null;
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
                     sections.length === 0 ? 'All Sections' :
                     selectedSection || 'All Sections'
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
                  <div className="absolute top-full mt-1 bg-white rounded-md w-full shadow-lg border border-gray-200 z-20">
                    <button 
                      className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-sm sm:text-base text-[#465746] border-b border-gray-100"
                      onClick={() => { 
                        setSelectedSection('');
                        setOpenSection(false);
                      }}>
                      All Sections
                    </button>
                    {sections.map((section) => (
                      <button 
                        key={section}
                        className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-sm sm:text-base text-[#465746]"
                        onClick={() => { 
                          setSelectedSection(section);
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
                  onClick={() => { setOpenSubject(!openSubject); setOpenSection(false); }}
                  className="flex w-full items-center justify-between font-bold px-3 py-2 sm:py-2.5 bg-[#fff] rounded-md cursor-pointer shadow-md text-sm sm:text-base text-[#465746]"
                  disabled={classesLoading || filteredClasses.length === 0}
                >
                  <span>
                    {classesLoading ? 'Loading classes...' : 
                     filteredClasses.length === 0 ? 'No classes available' :
                     selectedSubject ? 
                      filteredClasses.find(cls => cls.subject_code === selectedSubject)?.subject_code || 'Select Subject' 
                      : 'Select Subject'
                    }
                  </span>
                  {!classesLoading && filteredClasses.length > 0 && (
                    <img 
                      src={ArrowDown} 
                      alt="ArrowDown" 
                      className="h-4 w-4 sm:h-5 sm:w-5 ml-2" 
                    />
                  )}
                </button>
                {openSubject && filteredClasses.length > 0 && (
                  <div className="absolute top-full mt-1 bg-white rounded-md w-full shadow-lg border border-gray-200 z-10">
                    {filteredClasses.map((classItem) => (
                      <button 
                        key={classItem.subject_code}
                        className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-sm sm:text-base text-[#465746]"
                        onClick={() => { 
                          setSelectedSubject(classItem.subject_code);
                          setOpenSubject(false);
                        }}>
                        {classItem.subject_code} - {getSubjectName(classItem)}
                        {classItem.section && ` (${classItem.section})`}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="relative w-full lg:w-64 xl:w-80">
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-9 sm:h-10 lg:h-11 rounded-md px-3 py-2 pr-10 shadow-md outline-none bg-white text-xs sm:text-sm text-[#465746]"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                <img src={Search} alt="Search" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
              </button>
            </div>
          </div>

          {/* No Classes Message */}
          {!classesLoading && filteredClasses.length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center mb-6">
              <h3 className="font-bold text-lg text-yellow-800 mb-2">No Classes Found</h3>
              <p className="text-yellow-700 mb-4">
                {selectedSection 
                  ? `No classes found for section "${selectedSection}". Try selecting a different section.`
                  : 'You don\'t have any classes assigned. Please contact administration to get assigned to classes.'
                }
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
          ) : analyticsData && filteredClasses.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
              {/* Attendance Pie Chart */}
              <div className="bg-[#fff] p-4 sm:p-6 rounded-lg shadow-md">
                <h3 className="font-bold text-lg mb-4 text-[#465746]">Attendance Overview</h3>
                <div className="h-64 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={attendanceChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={CustomPieLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {attendanceChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
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
                <div className="h-64 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={activitiesChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={CustomPieLabel}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {activitiesChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-2">
                  <p className="text-sm text-[#465746]">
                    Overall Submission Rate: <strong>{analyticsData.activitiesSummary.submissionRate}%</strong>
                  </p>
                  <p className="text-sm text-[#FFC107]">
                    Late Submissions: <strong>{analyticsData.activitiesSummary.late}</strong>
                  </p>
                </div>
              </div>

              {/* Student Performance Bar Chart */}
              <div className="bg-[#fff] p-4 sm:p-6 rounded-lg shadow-md lg:col-span-2">
                <h3 className="font-bold text-lg mb-4 text-[#465746]">Top Student Performance</h3>
                <div className="h-80 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={performanceChartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end" 
                        height={60} 
                        interval={0}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} 
                        domain={[0, 100]}
                      />
                      <Tooltip content={<CustomBarTooltip />} />
                      <Legend />
                      <Bar dataKey="Attendance" fill="#00A15D" name="Attendance Rate" />
                      <Bar dataKey="Submission" fill="#2196F3" name="Submission Rate" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ) : !classesLoading && filteredClasses.length > 0 ? (
            <div className="bg-[#fff] p-6 rounded-lg shadow-md text-center">
              <p className="text-[#465746]">Select a subject to view analytics</p>
            </div>
          ) : null}

          {/* ActivityOverview component - Only show if we have classes */}
          {!classesLoading && filteredClasses.length > 0 && (
            <ActivityOverview
              quizzesList={activitiesData.quizzes}
              assignmentsList={activitiesData.assignments}
              activitiesList={activitiesData.activities}
              projectsList={activitiesData.projects}
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
              selectedSection={selectedSection}
              setSelectedSection={setSelectedSection}
              sections={sections}
            />
          )}

          {/* Only show activity list and student tracking if we have classes and analytics data */}
          {!classesLoading && filteredClasses.length > 0 && (
            <>
              {/* ACTIVITY LIST */}
              <div className="bg-[#fff] p-4 sm:p-5 rounded-lg sm:rounded-xl shadow-md mt-4 sm:mt-5 text-[#465746]">
                <p className="font-bold mb-3 sm:mb-4 text-base sm:text-lg lg:text-xl">
                  {displayedLabel}
                </p>
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                    <table className="min-w-full border-collapse text-xs sm:text-sm lg:text-base">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left p-2 sm:p-3 font-bold">Task</th>
                          <th className="text-left p-2 sm:p-3 font-bold">Title</th>
                          <th className="text-left p-2 sm:p-3 font-bold text-[#00A15D]">Submitted</th>
                          <th className="text-left p-2 sm:p-3 font-bold text-[#FFC107]">Late</th>
                          <th className="text-left p-2 sm:p-3 font-bold text-[#FF6666]">Missing</th>
                          <th className="text-left p-2 sm:p-3 font-bold">Deadline</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayedList.length > 0 ? (
                          displayedList.map(item => (
                            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="p-2 sm:p-3 whitespace-nowrap">{item.task}</td>
                              <td className="p-2 sm:p-3">{item.title}</td>
                              <td className="p-2 sm:p-3 text-[#00A15D]">{item.submitted}</td>
                              <td className="p-2 sm:p-3 text-[#FFC107]">{item.late || 0}</td>
                              <td className="p-2 sm:p-3 text-[#FF6666]">{item.missing}</td>
                              <td className="p-2 sm:p-3 whitespace-nowrap">{item.deadline}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="p-2 sm:p-3 text-center text-gray-500">
                              No {displayedLabel.toLowerCase()} found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Student Attendance Tracking */}
              <div className="bg-[#fff] rounded-lg sm:rounded-xl shadow-md mt-4 sm:mt-5 p-4 sm:p-5 text-[#465746]">
                <p className="text-base sm:text-lg lg:text-xl font-bold">
                  Student Attendance Tracking
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
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#FFC107]">Late</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#FF6666]">Absent</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#00A15D]">Submitted</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#FFC107]">Late Sub</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#FF6666]">Missed</th>
                          <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold">Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData?.studentPerformance && analyticsData.studentPerformance.length > 0 ? (
                          analyticsData.studentPerformance.slice(0, 5).map((student, index) => (
                            <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-2 sm:px-4 py-2 sm:py-3">{index + 1}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{student.id}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{student.name}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#00A15D]">{student.presentCount}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#FFC107]">{student.lateCount}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#FF6666]">{student.absentCount}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#00A15D]">{student.submittedCount}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#FFC107]">{student.lateSubmissionCount}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#FF6666]">{student.missingCount}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3">
                                <Link 
                                  to="/AnalyticsIndividualInfo" 
                                  state={{ 
                                    student: student,
                                    subjectCode: selectedSubject
                                  }}
                                >
                                  <img src={Details} alt="Details" className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:opacity-70" />
                                </Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="10" className="px-2 sm:px-4 py-2 sm:py-3 text-center text-gray-500">
                              No student data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}