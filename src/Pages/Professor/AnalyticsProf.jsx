import React, { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

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
import ClassManagementIcon from "../../assets/ClassManagement(Light).svg";
import Announcement from "../../assets/Announcement(Light).svg";
import Classwork from '../../assets/Classwork(Light).svg';
import GradeIcon from "../../assets/Grade(Light).svg";
import AttendanceIcon from '../../assets/Attendance(Light).svg';
import BackButton from '../../assets/BackButton(Light).svg';
import OverviewIcon from '../../assets/Overview(Light).svg';
import PerformanceIcon from '../../assets/Ranking(Light).svg';
import ActivitiesIcon from '../../assets/Classwork(Light).svg';
import AttendanceTabIcon from '../../assets/Record(Light).svg';
import ClassworkTabIcon from '../../assets/Classwork(Light).svg';
import AttendanceNavIcon from '../../assets/Attendance(Light).svg';
import NoDataIcon from '../../assets/NoData.svg';

export default function AnalyticsProf() {
  const [isOpen, setIsOpen] = useState(true);
  const [openSubject, setOpenSubject] = useState(false);
  const [openSection, setOpenSection] = useState(false);
  const [activeTab, setActiveTab] = useState('Overview'); // Default tab

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
  
  // New states for section comparison
  const [comparisonData, setComparisonData] = useState(null);
  const [activityTypeFilter, setActivityTypeFilter] = useState('all'); // 'all', 'quiz', 'assignment', 'activity', 'project'
  const [selectedSectionsForComparison, setSelectedSectionsForComparison] = useState([]);
  
  // Pagination states
  const [attendanceCurrentPage, setAttendanceCurrentPage] = useState(1);
  const [rankingCurrentPage, setRankingCurrentPage] = useState(1);
  const [sectionPage, setSectionPage] = useState(1);
  const itemsPerPage = 10;
  const sectionsPerPage = 20;

  // Updated colors for charts with proper color coding
  const ATTENDANCE_COLORS = ['#00C853', '#FFD600', '#FF3D00']; 
  const ACTIVITIES_COLORS = ['#00C853', '#2962FF', '#2196F3', '#FF3D00']; 
  
  // Colors for section comparison (up to 20 distinct colors for many sections)
  const SECTION_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
    '#F9E79F', '#ABEBC6', '#FAD7A0', '#D5DBDB', '#F5B7B1',
    '#A9DFBF', '#D2B4DE', '#FADBD8', '#D6EAF8', '#FCF3CF',
    '#E8DAEF', '#D5F4E6', '#FDEBD0', '#EBDEF0', '#D6EAF8'
  ];

  // Updated Tab color schemes with darker hover/selected colors
  const TAB_COLORS = {
    'Overview': { 
      bg: '#e6f4ea', 
      hover: '#d4ebda',
      selected: '#c8e6c9',
      border: '#4CAF50',
      icon: OverviewIcon
    },
    'Performance & Ranking': { 
      bg: '#fff3e0', 
      hover: '#ffe8cc',
      selected: '#ffe0b2',
      border: '#FF9800',
      icon: PerformanceIcon
    },
    'Activities': { 
      bg: '#e3f2fd', 
      hover: '#d1e7fd',
      selected: '#bbdefb',
      border: '#2196F3',
      icon: ActivitiesIcon
    },
    'Student Attendance': { 
      bg: '#f3e5f5', 
      hover: '#ead6ee',
      selected: '#e1bee7',
      border: '#9C27B0',
      icon: AttendanceTabIcon
    },
    'Section Comparison': {
      bg: '#fff0f5',
      hover: '#ffe4ec',
      selected: '#ffd6e7',
      border: '#FF4081',
      icon: Analytics
    }
  };

  // Tab configuration with type (internal or navigation)
  const internalTabs = [
    { id: 'Overview', name: 'Overview', type: 'internal' },
    { id: 'Performance & Ranking', name: 'Performance & Ranking', type: 'internal' },
    { id: 'Activities', name: 'Activities', type: 'internal' },
    { id: 'Student Attendance', name: 'Student Attendance', type: 'internal' },
    { id: 'Section Comparison', name: 'Section Comparison', type: 'internal' }
  ];

  // Get professor ID from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('Professor ID from localStorage:', user.id);
        setProfessorId(user.id || '');
      } catch {
        console.error('Error parsing user data');
        setProfessorId('');
      }
    } else {
      console.log('No user data in localStorage');
      setProfessorId('');
    }
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setAttendanceCurrentPage(1);
    setRankingCurrentPage(1);
    setSectionPage(1);
  }, [selectedFilter, selectedSubject, selectedSection]);

  // Fetch classes for the professor when professorId is available
  useEffect(() => {
    if (!professorId) {
      console.log('No professor ID available');
      return;
    }

    console.log('Fetching classes for professor:', professorId);
    const fetchClasses = async () => {
      setClassesLoading(true);
      try {
        const apiUrl = `https://tracked.6minds.site/Professor/ClassManagementDB/get_classes.php?professor_ID=${professorId}`;
        console.log('API URL:', apiUrl);
        
        const response = await fetch(apiUrl);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response data:', data);
        
        if (data.success) {
          const classesData = data.classes || [];
          console.log('Classes data:', classesData);
          console.log('Number of classes:', classesData.length);
          
          // Log each class to see structure
          classesData.forEach((cls, index) => {
            console.log(`Class ${index + 1}:`, {
              subject_code: cls.subject_code,
              subject: cls.subject, // This is the field name from your database
              section: cls.section,
              year_level: cls.year_level,
              status: cls.status
            });
          });
          
          setClasses(classesData);
          
          // Don't set any default selections - let the user choose
          setSelectedSubject("");
          setSelectedSection("");
        } else {
          console.log('API returned success: false', data.message);
          setClasses([]);
          setSelectedSubject("");
          setSelectedSection("");
        }
      } catch (error) {
        console.error('Error fetching classes:', error);
        setClasses([]);
        setSelectedSubject("");
        setSelectedSection("");
      } finally {
        setClassesLoading(false);
      }
    };

    fetchClasses();
  }, [professorId]);

  // Get unique subjects from classes
  const subjects = useMemo(() => {
    console.log('Processing subjects from classes:', classes);
    
    // Use 'subject' field as shown in your API response
    const subjectNames = classes.map(cls => cls.subject).filter(Boolean);
    console.log('Subject names found:', subjectNames);
    
    const uniqueSubjects = [...new Set(subjectNames)];
    console.log('Unique subjects:', uniqueSubjects);
    
    return uniqueSubjects;
  }, [classes]);

  // Get sections based on selected subject
  const getFilteredSections = useMemo(() => {
    if (!selectedSubject) {
      console.log('No subject selected');
      return [];
    }
    const filtered = classes.filter(cls => cls.subject === selectedSubject);
    console.log('Filtered sections for subject', selectedSubject, ':', filtered);
    return filtered;
  }, [classes, selectedSubject]);

  // Get unique sections for the selected subject
  const sectionsForSelectedSubject = useMemo(() => {
    const sections = [...new Set(getFilteredSections.map(cls => cls.section).filter(Boolean))];
    console.log('Sections for selected subject:', sections);
    return sections;
  }, [getFilteredSections]);

  // Fetch analytics data when subject and section change
  useEffect(() => {
    if (selectedSubject && selectedSection && professorId) {
      console.log('Fetching analytics for:', selectedSubject, 'Section', selectedSection);
      fetchAnalyticsData();
    } else {
      console.log('Analytics conditions not met:', { selectedSubject, selectedSection, professorId });
      setAnalyticsData(null);
    }
  }, [selectedSubject, selectedSection, professorId]);

  // Fetch section comparison data when selected subject changes
  useEffect(() => {
    if (selectedSubject && professorId) {
      console.log('Fetching section comparison for subject:', selectedSubject);
      fetchSectionComparisonData();
    } else {
      console.log('Section comparison conditions not met:', { selectedSubject, professorId });
      setComparisonData(null);
    }
  }, [selectedSubject, professorId, activityTypeFilter]);

  const fetchAnalyticsData = async () => {
    if (!selectedSubject || !professorId || !selectedSection) {
      console.log('Missing required data for analytics');
      return;
    }

    setLoading(true);
    console.log('Starting analytics fetch...');
    
    try {
      // Find the subject code for the selected subject and section
      const classItem = classes.find(cls => 
        cls.subject === selectedSubject && cls.section === selectedSection
      );
      
      if (!classItem) {
        console.error('Class not found for:', { selectedSubject, selectedSection });
        throw new Error('Class not found');
      }
      
      const subjectCode = classItem.subject_code;
      console.log('Found subject code:', subjectCode, 'for', selectedSubject);

      // Fetch attendance data
      const attendanceUrl = `https://tracked.6minds.site/Professor/AttendanceDB/get_attendance_history.php?subject_code=${subjectCode}&professor_ID=${professorId}`;
      console.log('Attendance URL:', attendanceUrl);

      const attendanceResponse = await fetch(attendanceUrl);
      
      if (!attendanceResponse.ok) {
        throw new Error(`Attendance API failed: ${attendanceResponse.status}`);
      }
      
      const attendanceData = await attendanceResponse.json();
      console.log('Attendance data received:', attendanceData);

      // Fetch activities data
      const activitiesUrl = `https://tracked.6minds.site/Professor/SubjectDetailsDB/get_activities.php?subject_code=${subjectCode}`;
      console.log('Activities URL:', activitiesUrl);

      const activitiesResponse = await fetch(activitiesUrl);
      
      if (!activitiesResponse.ok) {
        throw new Error(`Activities API failed: ${activitiesResponse.status}`);
      }
      
      const activitiesData = await activitiesResponse.json();
      console.log('Activities data received:', activitiesData);

      // Process the data
      processAnalyticsData(attendanceData, activitiesData, subjectCode);
      
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

  const fetchSectionComparisonData = async () => {
    if (!selectedSubject || !professorId) {
      console.log('Missing data for section comparison');
      return;
    }

    console.log('Starting section comparison fetch for subject:', selectedSubject);
    
    try {
      // Get all classes for this subject
      const subjectClasses = classes.filter(cls => cls.subject === selectedSubject);
      console.log('Classes for subject comparison:', subjectClasses);
      
      if (subjectClasses.length === 0) {
        console.log('No classes found for this subject');
        setComparisonData(null);
        return;
      }

      const comparisonResults = [];
      const activityTypeCounts = {
        all: { quizzes: 0, assignments: 0, activities: 0, projects: 0, total: 0 },
        quiz: { total: 0, submitted: 0 },
        assignment: { total: 0, submitted: 0 },
        activity: { total: 0, submitted: 0 },
        project: { total: 0, submitted: 0 }
      };

      // Fetch data for each section with better error handling
      const promises = subjectClasses.map(async (classItem) => {
        const subjectCode = classItem.subject_code;
        const section = classItem.section;

        try {
          const activitiesUrl = `https://tracked.6minds.site/Professor/SubjectDetailsDB/get_activities.php?subject_code=${subjectCode}`;
          console.log(`API URL for section ${section}:`, activitiesUrl);
          
          const activitiesResponse = await fetch(activitiesUrl);
          
          if (!activitiesResponse.ok) {
            console.log(`No data for section ${section}, skipping`);
            return null;
          }
          
          const activitiesData = await activitiesResponse.json();
          console.log(`Data for section ${section}:`, activitiesData);

          if (activitiesData.success && Array.isArray(activitiesData.activities)) {
            let sectionSubmitted = 0;
            let sectionTotal = 0;
            let sectionLate = 0;
            let sectionMissing = 0;
            let sectionPending = 0;
            
            // Count by activity type
            const typeStats = {
              quiz: { submitted: 0, total: 0 },
              assignment: { submitted: 0, total: 0 },
              activity: { submitted: 0, total: 0 },
              project: { submitted: 0, total: 0 }
            };

            activitiesData.activities.forEach(activity => {
              const activityType = activity.activity_type?.toLowerCase() || 'activity';
              const currentDate = new Date();
              const deadlineDate = activity.deadline ? new Date(activity.deadline) : null;
              const isPastDeadline = deadlineDate && deadlineDate < currentDate;
              
              if (Array.isArray(activity.students)) {
                activity.students.forEach(student => {
                  sectionTotal++;
                  const submitted = student.submitted === true || student.submitted === 1 || student.submitted === '1';
                  const late = student.late === true || student.late === 1 || student.late === '1';
                  
                  if (submitted) {
                    sectionSubmitted++;
                    if (typeStats[activityType]) {
                      typeStats[activityType].submitted++;
                    }
                    if (late) {
                      sectionLate++;
                    }
                  } else {
                    if (isPastDeadline) {
                      sectionMissing++;
                    } else {
                      sectionPending++;
                    }
                  }
                  
                  if (typeStats[activityType]) {
                    typeStats[activityType].total++;
                  }
                });
              }
            });

            const submissionRate = sectionTotal > 0 ? ((sectionSubmitted / sectionTotal) * 100).toFixed(1) : 0;
            
            return {
              section: section,
              subjectCode: subjectCode,
              totalStudents: activitiesData.students?.length || 0,
              submitted: sectionSubmitted,
              total: sectionTotal,
              late: sectionLate,
              missing: sectionMissing,
              pending: sectionPending,
              submissionRate: parseFloat(submissionRate),
              typeStats: typeStats,
              rawActivities: activitiesData.activities || []
            };
          }
        } catch (error) {
          console.error(`Error fetching data for section ${section}:`, error);
          return null;
        }
        return null;
      });

      // Wait for all promises to resolve
      const results = await Promise.all(promises);
      
      // Filter out null results and add to comparisonResults
      results.forEach(result => {
        if (result) {
          comparisonResults.push(result);
          
          // Update activity type counts
          const { typeStats, total } = result;
          
          activityTypeCounts.all.quizzes += typeStats.quiz.total;
          activityTypeCounts.all.assignments += typeStats.assignment.total;
          activityTypeCounts.all.activities += typeStats.activity.total;
          activityTypeCounts.all.projects += typeStats.project.total;
          activityTypeCounts.all.total += total;

          activityTypeCounts.quiz.total += typeStats.quiz.total;
          activityTypeCounts.quiz.submitted += typeStats.quiz.submitted;
          activityTypeCounts.assignment.total += typeStats.assignment.total;
          activityTypeCounts.assignment.submitted += typeStats.assignment.submitted;
          activityTypeCounts.activity.total += typeStats.activity.total;
          activityTypeCounts.activity.submitted += typeStats.activity.submitted;
          activityTypeCounts.project.total += typeStats.project.total;
          activityTypeCounts.project.submitted += typeStats.project.submitted;
        }
      });

      // Sort sections by submission rate (highest first)
      comparisonResults.sort((a, b) => b.submissionRate - a.submissionRate);

      console.log('Final comparison results:', comparisonResults);

      setComparisonData({
        sections: comparisonResults,
        activityTypeCounts: activityTypeCounts,
        totalSections: comparisonResults.length
      });

      // Auto-select top 3 performing sections for comparison
      const sectionsToSelect = comparisonResults.slice(0, Math.min(3, comparisonResults.length));
      setSelectedSectionsForComparison(sectionsToSelect.map(s => s.section));
      
      console.log('Auto-selected sections:', sectionsToSelect.map(s => s.section));

    } catch (error) {
      console.error('Error fetching section comparison data:', error);
      setComparisonData(null);
    }
  };

  const processAnalyticsData = (attendanceData, activitiesData, subjectCode) => {
    // Check if we have valid data
    const attendanceHistory = (attendanceData.success && Array.isArray(attendanceData.attendance_history)) 
      ? attendanceData.attendance_history 
      : [];
    
    const activities = (activitiesData.success && Array.isArray(activitiesData.activities)) 
      ? activitiesData.activities 
      : [];

    console.log('Processing analytics data:', {
      attendanceHistoryLength: attendanceHistory.length,
      activitiesLength: activities.length,
      subjectCode: subjectCode
    });

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
      rawActivities: activities,
      subjectCode: subjectCode
    });
  };

  // Calculate attendance summary
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

    const attendanceRate = totalStudents > 0 ? (((totalPresent + totalLate) / totalStudents) * 100).toFixed(1) : 0;
    
    console.log('Attendance summary:', {
      present: totalPresent,
      absent: totalAbsent,
      late: totalLate,
      total: totalStudents,
      attendanceRate: attendanceRate
    });

    return {
      present: totalPresent,
      absent: totalAbsent,
      late: totalLate,
      total: totalStudents,
      attendanceRate: attendanceRate
    };
  };

  // Calculate activities summary
  const calculateActivitiesSummary = (activities) => {
    let totalSubmitted = 0;
    let totalMissed = 0; // Changed from missing
    let totalLate = 0;
    let totalAssigned = 0; // Changed from pending
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
          if (isPastDeadline) {
            totalMissed++; // Changed from missing
          } else {
            totalAssigned++; // Changed from pending
          }
        }
      });
    });

    const submissionRate = totalEntries > 0 ? ((totalSubmitted / totalEntries) * 100).toFixed(1) : 0;
    
    console.log('Activities summary:', {
      submitted: totalSubmitted,
      missed: totalMissed,
      assigned: totalAssigned,
      late: totalLate,
      total: totalEntries,
      submissionRate: submissionRate
    });

    return {
      submitted: totalSubmitted,
      missed: totalMissed, // Changed from missing
      assigned: totalAssigned, // Changed from pending
      late: totalLate,
      total: totalEntries,
      submissionRate: submissionRate
    };
  };

  // Calculate student performance
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

    // Count activity submissions
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
          if (isPastDeadline) {
            studentData.missingCount++;
          } else {
            studentData.pendingCount++;
          }
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

    console.log('Student performance calculated:', studentArray.length, 'students');
    
    return studentArray;
  };

  // Get current subject code for display
  const getCurrentSubjectCode = () => {
    if (!selectedSubject || !selectedSection) return '';
    const classItem = classes.find(cls => 
      cls.subject === selectedSubject && cls.section === selectedSection
    );
    const code = classItem ? classItem.subject_code : '';
    console.log('Current subject code:', { selectedSubject, selectedSection, code });
    return code;
  };

  // Get activities data for ActivityOverview
  const getActivitiesData = () => {
    if (!analyticsData || !Array.isArray(analyticsData.rawActivities)) {
      console.log('No activities data available');
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
      
      const currentDate = new Date();
      const deadlineDate = activity.deadline ? new Date(activity.deadline) : null;
      const isPastDeadline = deadlineDate && deadlineDate < currentDate;
      
      const missing = isPastDeadline ? (totalStudents - submitted) : 0;
      const pending = !isPastDeadline ? (totalStudents - submitted) : 0;
      
      const deadline = activity.deadline ? new Date(activity.deadline).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'No deadline';

      const activityType = activity.activity_type?.toLowerCase();
      const taskDisplay = activityType && activity.task_number 
        ? `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} ${activity.task_number}`
        : activity.task_number || `Task ${activity.id}`;

      const activityItem = {
        id: activity.id,
        task: taskDisplay,
        title: activity.title || 'Untitled',
        submitted: submitted,
        missing: missing,
        pending: pending,
        late: late,
        deadline: deadline,
        isPastDeadline: isPastDeadline
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

    console.log('Activities data prepared:', {
      quizzes: quizzes.length,
      assignments: assignments.length,
      activities: activitiesList.length,
      projects: projects.length
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

    console.log('Sorted ranking data:', sorted.length, 'students');
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

    const chartData = sorted.slice(0, 10).map(student => ({
      name: student.id,
      studentName: student.name,
      Attendance: student.attendanceRate ? Number(student.attendanceRate.toFixed(1)) : 0,
      Submission: student.submissionRate ? Number(student.submissionRate.toFixed(1)) : 0
    }));
    
    console.log('Performance chart data:', chartData.length, 'students');
    return chartData;
  }, [analyticsData?.studentPerformance, performanceFilter]);

  // Get paginated sections for display
  const getPaginatedSections = () => {
    if (!comparisonData) return [];
    
    const startIndex = (sectionPage - 1) * sectionsPerPage;
    const endIndex = startIndex + sectionsPerPage;
    
    return comparisonData.sections.slice(startIndex, endIndex);
  };

  // Calculate section comparison data for line chart
  const sectionComparisonLineData = useMemo(() => {
    if (!comparisonData || selectedSectionsForComparison.length === 0) return [];

    const filteredSections = comparisonData.sections.filter(section => 
      selectedSectionsForComparison.includes(section.section)
    );

    if (activityTypeFilter === 'all') {
      // Use overall submission rate
      return filteredSections.map(section => ({
        section: `Section ${section.section}`,
        submissionRate: section.submissionRate,
        totalStudents: section.totalStudents,
        submitted: section.submitted,
        total: section.total,
        color: SECTION_COLORS[selectedSectionsForComparison.indexOf(section.section) % SECTION_COLORS.length]
      }));
    } else {
      // Calculate rate for specific activity type
      return filteredSections.map(section => {
        const typeStats = section.typeStats[activityTypeFilter];
        const typeRate = typeStats?.total > 0 
          ? ((typeStats.submitted / typeStats.total) * 100).toFixed(1)
          : 0;
        
        return {
          section: `Section ${section.section}`,
          submissionRate: parseFloat(typeRate),
          totalStudents: section.totalStudents,
          submitted: typeStats?.submitted || 0,
          total: typeStats?.total || 0,
          activityType: activityTypeFilter,
          color: SECTION_COLORS[selectedSectionsForComparison.indexOf(section.section) % SECTION_COLORS.length]
        };
      });
    }
  }, [comparisonData, selectedSectionsForComparison, activityTypeFilter]);

  // Calculate student performance distribution for pie chart
  const studentPerformancePieData = useMemo(() => {
    if (!analyticsData?.studentPerformance || analyticsData.studentPerformance.length === 0) {
      console.log('No student performance data for pie chart');
      return [];
    }

    const students = analyticsData.studentPerformance;
    
    // Categorize students by performance
    const excellent = students.filter(s => s.submissionRate >= 90).length;
    const good = students.filter(s => s.submissionRate >= 70 && s.submissionRate < 90).length;
    const average = students.filter(s => s.submissionRate >= 50 && s.submissionRate < 70).length;
    const needsImprovement = students.filter(s => s.submissionRate >= 30 && s.submissionRate < 50).length;
    const failing = students.filter(s => s.submissionRate < 30).length;

    const pieData = [
      { name: 'Excellent (90-100%)', value: excellent, color: '#00C853' },
      { name: 'Good (70-89%)', value: good, color: '#4CAF50' },
      { name: 'Average (50-69%)', value: average, color: '#FFC107' },
      { name: 'Needs Improvement (30-49%)', value: needsImprovement, color: '#FF9800' },
      { name: 'Failing (<30%)', value: failing, color: '#F44336' }
    ];
    
    console.log('Student performance pie data:', pieData);
    
    return pieData;
  }, [analyticsData?.studentPerformance]);

  // Get suggestions for section comparison
  const getSectionComparisonSuggestions = () => {
    if (!comparisonData || comparisonData.sections.length === 0) return [];

    const suggestions = [];
    const sections = comparisonData.sections;

    // Find sections with low submission rates (<60%)
    const lowPerformingSections = sections.filter(s => s.submissionRate < 60);
    const failingSections = sections.filter(s => s.submissionRate < 40);
    
    if (failingSections.length > 0) {
      suggestions.push(
        `⚠️ **CRITICAL:** ${failingSections.length} section(s) are failing with submission rates below 40%:`
      );
      
      failingSections.forEach(section => {
        suggestions.push(
          `• **Section ${section.section}** has only ${section.submissionRate}% submission rate. Immediate intervention required.`
        );
      });
      
      suggestions.push(
        `**Recommendation:** Schedule individual meetings with these sections, review teaching materials, and consider additional support sessions.`
      );
    }

    if (lowPerformingSections.length > 0) {
      const nonFailing = lowPerformingSections.filter(s => s.submissionRate >= 40);
      if (nonFailing.length > 0) {
        suggestions.push(
          `📉 ${nonFailing.length} section(s) have submission rates between 40-60%:`
        );
        
        nonFailing.forEach(section => {
          suggestions.push(
            `• Section ${section.section} has ${section.submissionRate}% submission rate.`
          );
        });
        
        suggestions.push(
          `**Recommendation:** Consider targeted interventions like review sessions or adjusting assignment difficulty.`
        );
      }
    }

    // Find the best performing section
    if (sections.length > 1) {
      const bestSection = sections[0]; // Already sorted by submission rate
      const worstSection = sections[sections.length - 1];
      
      if (bestSection.submissionRate > 80) {
        suggestions.push(
          `🏆 **Top Performer:** Section ${bestSection.section} has ${bestSection.submissionRate}% submission rate.`
        );
        suggestions.push(
          `**Recommendation:** Consider peer mentoring program where top section assists struggling sections.`
        );
      }

      // Check for large gaps between sections
      const gap = bestSection.submissionRate - worstSection.submissionRate;
      if (gap > 30) {
        suggestions.push(
          `📊 **Performance Gap:** Large difference of ${gap.toFixed(1)}% between best and worst sections.`
        );
        suggestions.push(
          `**Recommendation:** Standardize teaching approaches and share successful strategies across sections.`
        );
      }
    }

    // Activity type specific suggestions
    if (activityTypeFilter !== 'all') {
      const typeName = activityTypeFilter.charAt(0).toUpperCase() + activityTypeFilter.slice(1);
      const typeSections = sections.map(section => ({
        section: section.section,
        rate: section.typeStats[activityTypeFilter]?.total > 0 
          ? ((section.typeStats[activityTypeFilter].submitted / section.typeStats[activityTypeFilter].total) * 100).toFixed(1)
          : 'No data'
      })).filter(s => s.rate !== 'No data');
      
      if (typeSections.length > 0) {
        const avgRate = typeSections.reduce((sum, s) => sum + parseFloat(s.rate), 0) / typeSections.length;
        
        suggestions.push(
          `📝 **${typeName} Performance:** Average ${avgRate.toFixed(1)}% across ${typeSections.length} sections.`
        );
      }
    }

    return suggestions.slice(0, 8); // Limit to 8 suggestions
  };

  // Get suggestions for student performance pie chart
  const getStudentPerformanceSuggestions = () => {
    if (studentPerformancePieData.length === 0) return [];

    const totalStudents = studentPerformancePieData.reduce((sum, item) => sum + item.value, 0);
    const failingStudents = studentPerformancePieData.find(item => item.name.includes('Failing'))?.value || 0;
    const needsImprovementStudents = studentPerformancePieData.find(item => item.name.includes('Needs Improvement'))?.value || 0;
    
    const suggestions = [];

    if (failingStudents > 0) {
      const percentage = ((failingStudents / totalStudents) * 100).toFixed(1);
      suggestions.push(
        `⚠️ ${failingStudents} student(s) (${percentage}%) are failing (<30% submission rate). Consider one-on-one meetings to identify challenges.`
      );
    }

    if (needsImprovementStudents > 0) {
      const percentage = ((needsImprovementStudents / totalStudents) * 100).toFixed(1);
      suggestions.push(
        `📝 ${needsImprovementStudents} student(s) (${percentage}%) need improvement. Consider offering extra help sessions or study groups.`
      );
    }

    const excellentStudents = studentPerformancePieData.find(item => item.name.includes('Excellent'))?.value || 0;
    if (excellentStudents > 0 && excellentStudents >= totalStudents * 0.3) {
      suggestions.push(
        `🎉 ${excellentStudents} student(s) are excelling! Consider engaging them as peer mentors to help struggling classmates.`
      );
    }

    return suggestions;
  };

  // Handle section selection for comparison
  const handleSectionSelection = (section) => {
    console.log('Toggling section selection:', section);
    
    if (selectedSectionsForComparison.includes(section)) {
      // Remove the section
      setSelectedSectionsForComparison(prev => {
        const newSelection = prev.filter(s => s !== section);
        console.log('Section removed. New selection:', newSelection);
        return newSelection;
      });
    } else {
      // Add the section with a limit
      if (selectedSectionsForComparison.length < 10) { // Limit to 10 sections for visibility
        setSelectedSectionsForComparison(prev => {
          const newSelection = [...prev, section];
          console.log('Section added. New selection:', newSelection);
          return newSelection;
        });
      } else {
        alert('Maximum 10 sections can be compared at once for optimal visibility.');
      }
    }
  };

  // Select all sections for comparison
  const handleSelectAllSections = () => {
    if (comparisonData) {
      const allSections = comparisonData.sections.map(s => s.section);
      console.log('Selecting all sections:', allSections);
      setSelectedSectionsForComparison(allSections.slice(0, 10)); // Limit to 10
    }
  };

  // Clear all section selections
  const handleClearAllSections = () => {
    console.log('Clearing all section selections');
    setSelectedSectionsForComparison([]);
  };

  // Custom tooltip for line chart
  const CustomLineTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800 mb-2">{data.section}</p>
          <div className="space-y-1">
            <p className="text-sm" style={{ color: data.color }}>
              Submission Rate: <strong>{data.submissionRate}%</strong>
            </p>
            {data.activityType && (
              <p className="text-sm text-gray-600">
                Activity Type: <strong>{data.activityType.charAt(0).toUpperCase() + data.activityType.slice(1)}</strong>
              </p>
            )}
            <p className="text-sm text-gray-600">
              Students: {data.totalStudents}
            </p>
            <p className="text-sm text-gray-600">
              Submitted: {data.submitted}/{data.total} activities
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom label for pie chart
  const CustomPerformancePieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

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
    console.log('Changing attendance page to:', page);
    setAttendanceCurrentPage(page);
  };

  const handleRankingPageChange = (page) => {
    console.log('Changing ranking page to:', page);
    setRankingCurrentPage(page);
  };

  // Toggle ranking sort
  const toggleRankingSort = () => {
    const newSort = rankingSort === 'highest' ? 'lowest' : 'highest';
    console.log('Toggling ranking sort to:', newSort);
    setRankingSort(newSort);
  };

  // Toggle performance filter
  const togglePerformanceFilter = () => {
    const newFilter = performanceFilter === 'top' ? 'bottom' : 'top';
    console.log('Toggling performance filter to:', newFilter);
    setPerformanceFilter(newFilter);
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
    { name: 'Assigned', value: analyticsData.activitiesSummary.assigned },
    { name: 'Missed', value: analyticsData.activitiesSummary.missed }
  ] : [];

  // Check if charts have data
  const hasAttendanceData = analyticsData?.attendanceSummary?.total > 0;
  const hasActivitiesData = analyticsData?.activitiesSummary?.total > 0;
  const hasPerformanceData = performanceChartData.length > 0;
  const hasRankingData = sortedRankingData.length > 0;
  const hasStudentAttendanceData = currentAttendance.length > 0;

  // Enhanced CustomPieLabel with better styling
  const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

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
    
    const { submitted, assigned, missed, late, total } = analyticsData.activitiesSummary;
    const actions = [];
    
    if (assigned > submitted) {
      actions.push("Many activities are still assigned - consider extending deadlines or offering help sessions");
    }
    
    if (missed > total * 0.2) {
      actions.push("High number of missed submissions - reach out to students who need support");
    }
    
    if (late > submitted * 0.3) {
      actions.push("Many late submissions - review submission policies and provide clear deadlines");
    }
    
    if (assigned > 0) {
      actions.push("Send reminders for assigned activities approaching their deadlines");
    }
    
    if (submitted > total * 0.8 && missed < total * 0.1) {
      actions.push("Excellent submission rate! Consider providing positive feedback to the class");
    }

    return actions.slice(0, 3);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
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

  // No Data Message Component
  const NoDataMessage = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-64 sm:h-80 text-gray-500 p-4">
      <img src={NoDataIcon} alt="No data" className="w-30 h-30 mb-3 opacity-50" />
      <p className="text-lg font-medium text-center">{message}</p>
      <p className="text-sm text-gray-400 text-center mt-2">
        Data will appear here once students start attending classes and submitting activities
      </p>
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

  // Tab content renderer
  const renderTabContent = () => {
    console.log('Rendering tab:', activeTab);
    
    switch(activeTab) {
      case 'Overview':
        return (
          <>
            {/* Attendance Overview */}
            <div className="bg-gradient-to-br from-white to-blue-50 p-4 sm:p-6 rounded-xl shadow-lg border border-blue-100 mb-6">
              <ChartIndicator
                title="Attendance Overview"
                rate={analyticsData?.attendanceSummary?.attendanceRate || "0.0"}
                teacherActions={getAttendanceActions()}
              />
              <div className="h-64 sm:h-80 min-h-0">
                {hasAttendanceData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart style={{ outline: 'none' }}>
                      <Pie
                        data={attendanceChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => <CustomPieLabel name={name} percent={percent} />}
                        outerRadius="80%"
                        innerRadius="45%"
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
                ) : (
                  <NoDataMessage message="No attendance data available" />
                )}
              </div>
            </div>

            {/* Activities Submission */}
            <div className="bg-gradient-to-br from-white to-green-50 p-4 sm:p-6 rounded-xl shadow-lg border border-green-100 mb-6">
              <ChartIndicator
                title="Activities Submission"
                rate={analyticsData?.activitiesSummary?.submissionRate || "0.0"}
                teacherActions={getActivitiesActions()}
              />
              <div className="h-64 sm:h-80 min-h-0">
                {hasActivitiesData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart style={{ outline: 'none' }}>
                      <Pie
                        data={activitiesChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => <CustomPieLabel name={name} percent={percent} />}
                        outerRadius="80%"
                        innerRadius="45%"
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
                ) : (
                  <NoDataMessage message="No activities data available" />
                )}
              </div>
            </div>
          </>
        );
      
      case 'Performance & Ranking':
        return (
          <>
            {/* Student Performance */}
            <div className="bg-gradient-to-br from-white to-purple-50 p-4 sm:p-6 rounded-xl shadow-lg border border-purple-100 mb-6">
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
                {hasPerformanceData ? (
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
                ) : (
                  <NoDataMessage message="No performance data available" />
                )}
              </div>
            </div>

            {/* Class Ranking */}
            <div className="bg-[#fff] rounded-lg sm:rounded-xl shadow-md p-4 sm:p-5 text-[#465746] mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4">
                <p className="text-base sm:text-lg lg:text-xl font-bold">
                  Class Ranking - {selectedSubject} (Section {selectedSection})
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

              {hasRankingData ? (
                <>
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
                </>
              ) : (
                <div className="py-10 text-center">
                  <NoDataMessage message="No ranking data available" />
                </div>
              )}
            </div>
          </>
        );
      
      case 'Activities':
        return (
          <div className="mb-6">
            <ActivityOverview
              quizzesList={activitiesData.quizzes}
              assignmentsList={activitiesData.assignments}
              activitiesList={activitiesData.activities}
              projectsList={activitiesData.projects}
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
              selectedSubject={selectedSubject}
              selectedSection={selectedSection}
              getCurrentSubjectName={() => `${selectedSubject} - Section ${selectedSection}`}
            />
          </div>
        );
      
        case 'Student Attendance':
          return (
            <div className="bg-[#fff] rounded-lg sm:rounded-xl shadow-md p-4 sm:p-5 text-[#465746]">
              <p className="text-base sm:text-lg lg:text-xl font-bold">
                Student Attendance & Submission Tracking - {selectedSubject} (Section {selectedSection})
              </p>
              <hr className="border-[#465746]/30 my-3 sm:my-4" />
              
              {hasStudentAttendanceData ? (
                <>
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle px-4 sm:px-0">
                      <table className="min-w-full border-collapse text-xs sm:text-sm lg:text-base">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold">No.</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold whitespace-nowrap">Student No.</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold whitespace-nowrap">Student Name</th>
                            {/* Attendance Columns */}
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#00A15D]">Present</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#2196F3]">Late</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#FF6666]">Absent</th>
                            {/* Submission Columns */}
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#00A15D]">Submitted</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#2196F3]">Assigned</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold text-[#FF6666]">Missed</th>
                            <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-bold">Details</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentAttendance.map((student, index) => (
                            <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-2 sm:px-4 py-2 sm:py-3">{attendanceStartIndex + index + 1}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{student.id}</td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">{student.name}</td>
                              {/* Attendance Data */}
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#00A15D] font-medium">
                                {student.presentCount || 0}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#2196F3] font-medium">
                                {student.lateCount || 0}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#FF6666] font-medium">
                                {student.absentCount || 0}
                              </td>
                              {/* Submission Data */}
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#00A15D] font-medium">
                                {student.submittedCount || 0}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#2196F3] font-medium">
                                {student.pendingCount || 0} {/* This is now "Assigned" */}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3 text-[#FF6666] font-medium">
                                {student.missingCount || 0} {/* This is now "Missed" */}
                              </td>
                              <td className="px-2 sm:px-4 py-2 sm:py-3">
                                <Link 
                                  to={`/AnalyticsIndividualInfo?student_id=${student.id}&subject_code=${getCurrentSubjectCode()}&section=${selectedSection}`}
                                  state={{ 
                                    student: student,
                                    subjectCode: getCurrentSubjectCode(),
                                    section: selectedSection
                                  }}
                                >
                                  <img src={Details} alt="Details" className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:opacity-70" />
                                </Link>
                              </td>
                            </tr>
                          ))}
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
                </>
              ) : (
                <div className="py-10 text-center">
                  <NoDataMessage message="No student attendance data available" />
                </div>
              )}
            </div>
          );
      
      case 'Section Comparison':
        return (
          <>
            {/* Section Comparison Header */}
            <div className="bg-gradient-to-br from-white to-pink-50 p-4 sm:p-6 rounded-xl shadow-lg border border-pink-100 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div>
                  <h3 className="font-bold text-lg text-[#465746] mb-2">
                    Section Performance Comparison - {selectedSubject}
                  </h3>
                  <p className="text-gray-600">
                    Compare submission rates across different sections teaching the same subject
                  </p>
                </div>
                
                {/* Activity Type Filter */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Filter by:</span>
                  <select
                    value={activityTypeFilter}
                    onChange={(e) => setActivityTypeFilter(e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm cursor-pointer"
                  >
                    <option value="all">All Activities</option>
                    <option value="quiz">Quizzes Only</option>
                    <option value="assignment">Assignments Only</option>
                    <option value="activity">Activities Only</option>
                    <option value="project">Projects Only</option>
                  </select>
                </div>
              </div>

              {/* Activity Type Filter Info */}
              {activityTypeFilter !== 'all' && comparisonData && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    Showing {activityTypeFilter} data only. {comparisonData.sections.filter(s => 
                      s.typeStats[activityTypeFilter]?.total > 0
                    ).length} of {comparisonData.sections.length} sections have {activityTypeFilter} data.
                  </p>
                </div>
              )}

              {/* Suggestions */}
              {getSectionComparisonSuggestions().length > 0 && (
                <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-bold text-yellow-800 mb-2">📊 Recommendations</h4>
                  <ul className="text-sm text-yellow-700 list-disc list-inside space-y-1">
                    {getSectionComparisonSuggestions().map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Section Selection with Pagination */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                  <h4 className="font-bold text-[#465746] mb-2 sm:mb-0">
                    Select Sections to Compare ({selectedSectionsForComparison.length} selected of {comparisonData?.sections.length || 0})
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSelectAllSections}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 cursor-pointer"
                    >
                      Select All
                    </button>
                    <button
                      onClick={handleClearAllSections}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                
                {/* Pagination Controls for Sections */}
                {comparisonData && comparisonData.sections.length > sectionsPerPage && (
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-600">
                      Showing {(sectionPage - 1) * sectionsPerPage + 1} to {Math.min(sectionPage * sectionsPerPage, comparisonData.sections.length)} of {comparisonData.sections.length} sections
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSectionPage(prev => Math.max(1, prev - 1))}
                        disabled={sectionPage === 1}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm disabled:opacity-50 cursor-pointer"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setSectionPage(prev => 
                          prev < Math.ceil(comparisonData.sections.length / sectionsPerPage) ? prev + 1 : prev
                        )}
                        disabled={sectionPage >= Math.ceil(comparisonData.sections.length / sectionsPerPage)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm disabled:opacity-50 cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Section Selection Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-60 overflow-y-auto p-2">
                  {getPaginatedSections().map((section) => (
                    <button
                      key={section.section}
                      onClick={() => handleSectionSelection(section.section)}
                      className={`
                        p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer
                        ${selectedSectionsForComparison.includes(section.section)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-gray-800">Section {section.section}</span>
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ 
                            backgroundColor: selectedSectionsForComparison.includes(section.section)
                              ? SECTION_COLORS[(selectedSectionsForComparison.indexOf(section.section)) % SECTION_COLORS.length]
                              : '#D1D5DB'
                          }}
                        />
                      </div>
                      <div className="text-left">
                        <p className={`text-sm font-bold ${
                          section.submissionRate >= 70 ? 'text-green-600' : 
                          section.submissionRate >= 50 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {section.submissionRate}%
                        </p>
                        <p className="text-xs text-gray-500">
                          {section.submitted}/{section.total} submissions
                        </p>
                        <p className="text-xs text-gray-500">
                          {section.totalStudents} students
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Chart - Section Comparison */}
              <div className="h-64 sm:h-80 min-h-0 mb-6">
                {sectionComparisonLineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={sectionComparisonLineData}
                      margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="section" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        label={{ 
                          value: 'Submission Rate (%)', 
                          angle: -90, 
                          position: 'insideLeft',
                          style: { fontSize: 12 }
                        }}
                        domain={[0, 100]}
                      />
                      <Tooltip content={<CustomLineTooltip />} />
                      <Legend />
                      {sectionComparisonLineData.map((section) => (
                        <Line
                          key={section.section}
                          type="monotone"
                          dataKey="submissionRate"
                          name={`Section ${section.section.split(' ')[1]}`}
                          stroke={section.color}
                          strokeWidth={3}
                          dot={{ r: 6 }}
                          activeDot={{ r: 8 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
                    <img src={NoDataIcon} alt="No data" className="w-20 h-20 mb-3 opacity-50" />
                    <p className="text-center">Select sections to compare from above</p>
                    <p className="text-sm text-gray-400 text-center mt-1">
                      {selectedSectionsForComparison.length === 0 
                        ? 'No sections selected' 
                        : 'Loading comparison data...'}
                    </p>
                  </div>
                )}
              </div>

              {/* Performance Summary Table */}
              {comparisonData && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h4 className="font-bold text-[#465746] mb-3">Section Performance Summary</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-3 py-2 text-left font-bold">Section</th>
                          <th className="px-3 py-2 text-left font-bold">Submission Rate</th>
                          <th className="px-3 py-2 text-left font-bold">Total Students</th>
                          <th className="px-3 py-2 text-left font-bold">Submitted</th>
                          <th className="px-3 py-2 text-left font-bold">Total Activities</th>
                          <th className="px-3 py-2 text-left font-bold">Performance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {comparisonData.sections.map((section) => (
                          <tr key={section.section} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium">Section {section.section}</td>
                            <td className="px-3 py-2">
                              <span className={`font-bold ${
                                section.submissionRate >= 70 ? 'text-green-600' :
                                section.submissionRate >= 50 ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {section.submissionRate}%
                              </span>
                            </td>
                            <td className="px-3 py-2">{section.totalStudents}</td>
                            <td className="px-3 py-2">{section.submitted}</td>
                            <td className="px-3 py-2">{section.total}</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                section.submissionRate >= 70 ? 'bg-green-100 text-green-800' :
                                section.submissionRate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {section.submissionRate >= 70 ? 'Excellent' :
                                 section.submissionRate >= 50 ? 'Average' :
                                 'Needs Improvement'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Student Performance Distribution */}
            <div className="bg-gradient-to-br from-white to-indigo-50 p-4 sm:p-6 rounded-xl shadow-lg border border-indigo-100 mb-6">
              <div className="mb-4">
                <h3 className="font-bold text-lg text-[#465746] mb-2">
                  Student Performance Distribution - Section {selectedSection}
                </h3>
                <p className="text-gray-600">
                  Distribution of students based on their submission rates
                </p>
              </div>

              {/* Performance Suggestions */}
              {getStudentPerformanceSuggestions().length > 0 && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-bold text-blue-800 mb-2">📈 Student Performance Insights</h4>
                  <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                    {getStudentPerformanceSuggestions().map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="h-64 sm:h-80 min-h-0">
                {studentPerformancePieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={studentPerformancePieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={CustomPerformancePieLabel}
                        outerRadius="80%"
                        innerRadius="40%"
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {studentPerformancePieData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color} 
                            stroke="#fff"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [
                          `${value} students (${((value / studentPerformancePieData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%)`,
                          name
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <NoDataMessage message="No student performance data available" />
                )}
              </div>

              {/* Performance Categories Legend */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {studentPerformancePieData.map((category, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <p className="text-sm font-medium">{category.name.split(' (')[0]}</p>
                      <p className="text-xs text-gray-500">
                        {category.value} student{category.value !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      
      default:
        return null;
    }
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
              <div className="block">
                <span className="font-medium block mb-1">Student Performance</span>
                {selectedSection && selectedSubject && (
                  <>
                    <div className="text-gray-600 block mb-1">
                      {selectedSubject} - Section {selectedSection}
                    </div>
                    <div className="text-gray-600 block">
                      {getCurrentSubjectCode()}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-4 sm:mb-5" />

          {/* Tab Navigation */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between items-stretch mb-4 sm:mb-5">
            {/* Internal Tabs - Left side */}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2">
              {internalTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 
                    font-semibold text-xs sm:text-sm rounded-md shadow-md border-2 
                    transition-all duration-300 cursor-pointer min-h-[44px]
                    ${activeTab === tab.id ? 'border-opacity-100' : 'border-opacity-0'}
                  `}
                  style={{
                    backgroundColor: activeTab === tab.id ? TAB_COLORS[tab.id].selected : TAB_COLORS[tab.id].bg,
                    borderColor: TAB_COLORS[tab.id].border,
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = TAB_COLORS[tab.id].hover;
                      e.currentTarget.style.borderColor = TAB_COLORS[tab.id].border;
                      e.currentTarget.style.borderOpacity = '1';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.backgroundColor = TAB_COLORS[tab.id].bg;
                      e.currentTarget.style.borderColor = TAB_COLORS[tab.id].border;
                      e.currentTarget.style.borderOpacity = '0';
                    }
                  }}
                >
                  <img 
                    src={TAB_COLORS[tab.id].icon} 
                    alt={`${tab.name} icon`} 
                    className="w-4 h-4 sm:w-5 sm:h-5" 
                  />
                  <span className="text-center">{tab.name}</span>
                </button>
              ))}
            </div>

            {/* Action Buttons - Right side */}
            <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
              {/* Classwork Button */}
              <Link
                to={{
                  pathname: '/ClassworkTab',
                  state: {
                    subjectCode: getCurrentSubjectCode(),
                    section: selectedSection,
                    subjectName: selectedSubject,
                    shortSubjectName: getCurrentSubjectCode()
                  }
                }}
                className="p-2 bg-[#fff] rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 flex-shrink-0 cursor-pointer"
                title="Classwork"
              >
                <img 
                  src={ClassworkTabIcon} 
                  alt="Classwork" 
                  className="h-5 w-5 sm:h-6 sm:w-6" 
                />
              </Link>
            </div>
          </div>

          {/* Filter and Search Section */}
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 justify-between items-stretch lg:items-center mb-4 sm:mb-5">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1">
              {/* Subject Dropdown - FIRST FILTER */}
              <div className="relative w-full sm:w-auto sm:min-w-[200px] lg:min-w-[250px]">
                <button
                  onClick={() => { setOpenSubject(!openSubject); setOpenSection(false); }}
                  className="flex w-full items-center justify-between font-bold px-3 py-2 sm:py-2.5 bg-[#fff] rounded-md cursor-pointer shadow-md text-sm sm:text-base text-[#465746]"
                  disabled={classesLoading || subjects.length === 0}
                >
                  <span>
                    {classesLoading ? 'Loading...' : 
                     subjects.length === 0 ? 'No subjects available' :
                     selectedSubject || 'Select Subject'
                    }
                  </span>
                  {!classesLoading && subjects.length > 0 && (
                    <img 
                      src={ArrowDown} 
                      alt="ArrowDown" 
                      className="h-4 w-4 sm:h-5 sm:w-5 ml-2" 
                    />
                  )}
                </button>
                {openSubject && subjects.length > 0 && (
                  <div className="absolute top-full mt-1 bg-white rounded-md w-full shadow-lg border border-gray-200 z-20 max-h-60 overflow-y-auto">
                    {subjects.map((subject) => (
                      <button 
                        key={subject}
                        className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-sm sm:text-base text-[#465746] border-b border-gray-100 last:border-b-0"
                        onClick={() => { 
                          console.log('Subject selected:', subject);
                          setSelectedSubject(subject);
                          setSelectedSection(""); // Reset section when subject changes
                          setOpenSubject(false);
                        }}>
                        {subject}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Section Dropdown - SECOND FILTER (depends on subject) */}
              <div className="relative w-full sm:w-auto sm:min-w-[150px] lg:min-w-[180px]">
                <button
                  onClick={() => { 
                    if (selectedSubject) {
                      setOpenSection(!openSection); 
                      setOpenSubject(false); 
                    }
                  }}
                  className={`flex w-full items-center justify-between font-bold px-3 py-2 sm:py-2.5 bg-[#fff] rounded-md cursor-pointer shadow-md text-sm sm:text-base ${
                    !selectedSubject ? 'text-gray-400 cursor-not-allowed' : 'text-[#465746]'
                  }`}
                  disabled={classesLoading || sectionsForSelectedSubject.length === 0 || !selectedSubject}
                >
                  <span>
                    {classesLoading ? 'Loading...' : 
                     !selectedSubject ? 'Select Subject First' :
                     sectionsForSelectedSubject.length === 0 ? 'No sections available' :
                     selectedSection || 'Select Section'
                    }
                  </span>
                  {!classesLoading && sectionsForSelectedSubject.length > 0 && selectedSubject && (
                    <img 
                      src={ArrowDown} 
                      alt="ArrowDown" 
                      className="h-4 w-4 sm:h-5 sm:w-5 ml-2" 
                    />
                  )}
                </button>
                {openSection && sectionsForSelectedSubject.length > 0 && selectedSubject && (
                  <div className="absolute top-full mt-1 bg-white rounded-md w-full shadow-lg border border-gray-200 z-10 max-h-60 overflow-y-auto">
                    {sectionsForSelectedSubject.map((section) => (
                      <button 
                        key={section}
                        className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-sm sm:text-base text-[#465746] border-b border-gray-100 last:border-b-0"
                        onClick={() => { 
                          console.log('Section selected:', section);
                          setSelectedSection(section);
                          setOpenSection(false);
                        }}>
                        {section}
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
              {renderTabContent()}
            </>
          ) : activeTab === 'Section Comparison' && selectedSubject ? (
            // Show section comparison even without specific section selected
            <>
              {renderTabContent()}
            </>
          ) : !classesLoading && classes.length > 0 ? (
            <div className="bg-[#fff] p-6 rounded-lg shadow-md text-center">
              <p className="text-[#465746]">
                {!selectedSubject ? 'Please select a subject to view analytics' : 
                 activeTab === 'Section Comparison' ? 'Loading section comparison data...' :
                 'Please select a section to view analytics'}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}