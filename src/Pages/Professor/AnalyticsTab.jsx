import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  PieChart, Pie, Cell,
  BarChart, Bar,
  ResponsiveContainer,
  Tooltip, 
  Legend, 
  CartesianGrid, 
  XAxis, 
  YAxis
} from 'recharts';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import StudentPerformanceCard from "../../Components/ProfessorComponents/StudentPerformanceCard";
import PerformanceByAssessmentType from "../../Components/ProfessorComponents/PerformanceByAssessmentType";
import PerformanceDistributionCard from "../../Components/ProfessorComponents/PerformanceDistributionCard";
import StudentPerformanceRankingCard from "../../Components/ProfessorComponents/StudentPerformanceRankingCard";

import BackButton from '../../assets/BackButton.svg';
import Search from "../../assets/Search.svg";
import ClassManagementIcon from "../../assets/ClassManagement.svg"; 
import Announcement from "../../assets/Announcement.svg";
import Classwork from "../../assets/Classwork.svg";
import GradeIcon from "../../assets/Grade.svg";
import AnalyticsIcon from "../../assets/Analytics.svg";
import AttendanceIcon from '../../assets/Attendance.svg';

// Color palette for charts (adjusted for dark mode)
const COLORS = ['#00874E', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#B39DDB', '#98D8C8'];
const ACTIVITY_TYPES = ['Assignment', 'Quiz', 'Activity', 'Project', 'Laboratory', 'Attendance'];

export default function AnalyticsTab() {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get("code");

  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedActivityType, setSelectedActivityType] = useState('All');
  const [error, setError] = useState(null);
  const [barChartSort, setBarChartSort] = useState('desc');
  const [attendanceData, setAttendanceData] = useState(null);
  const [activitiesData, setActivitiesData] = useState(null);
  const [studentsData, setStudentsData] = useState(null);

  // Get professor ID from localStorage
  const getProfessorId = () => {
    try {
      const userDataString = localStorage.getItem("user");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        
        // Try different possible keys
        if (userData.tracked_ID) return userData.tracked_ID;
        if (userData.id) return userData.id;
        if (userData.userId) return userData.userId;
        if (userData.professor_ID) return userData.professor_ID;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
    
    // Default to the professor ID from your database
    return "202210602";
  };

  useEffect(() => {
    const loadAllData = async () => {
      if (!subjectCode) return;
      
      setLoading(true);
      
      try {
        // 1. Load class info
        await fetchClassInfo();
        
        // 2. Load all data in parallel but wait for all to complete
        const [attendanceResult, activitiesResult] = await Promise.all([
          fetchAttendanceData(),
          fetchActivitiesData()
        ]);
        
        // 3. Process all data together
        if (activitiesResult && activitiesResult.success) {
          await processAllData(activitiesResult.activities, activitiesResult.students, attendanceResult);
        } else {
          setAnalyticsData(null);
        }
        
      } catch (error) {
        console.error("Error loading data:", error);
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
      }
    };
    
    if (subjectCode) {
      loadAllData();
    }
  }, [subjectCode]);

  // Process analytics whenever attendance or activities data changes
  useEffect(() => {
    if (activitiesData && studentsData) {
      processAnalyticsData(activitiesData, studentsData);
    }
  }, [attendanceData, activitiesData, studentsData]);

  const fetchClassInfo = async () => {
    try {
      const response = await fetch(
        `https://tracked.6minds.site/Professor/SubjectDetailsDB/get_students_by_section.php?subject_code=${subjectCode}`
      );
      const result = await response.json();
      if (result.success) {
        setClassInfo(result.class_info);
      }
    } catch (error) {
      console.error("Error fetching class info:", error);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const professorId = getProfessorId();
      
      const url = `https://tracked.6minds.site/Professor/AttendanceDB/get_attendance_history.php?subject_code=${subjectCode}&professor_ID=${professorId}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        if (result.attendance_history && result.attendance_history.length > 0) {
          setAttendanceData(result.attendance_history);
          return result.attendance_history;
        } else {
          setAttendanceData([]);
          return [];
        }
      } else {
        setAttendanceData([]);
        return [];
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setAttendanceData([]);
      return [];
    }
  };

  const fetchActivitiesData = async () => {
    try {
      const response = await fetch(
        `https://tracked.6minds.site/Professor/SubjectDetailsDB/get_activities.php?subject_code=${subjectCode}`
      );
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error fetching activities data:", error);
      return null;
    }
  };

  const processAllData = async (activities, students, attendance) => {
    // Store raw data for reprocessing if needed
    setActivitiesData(activities);
    setStudentsData(students);
    
    // Process analytics with all data
    processAnalyticsData(activities, students);
  };

  const processAnalyticsData = (activities, students) => {
    // Check if we have any data at all
    const hasActivities = activities && activities.length > 0;
    const hasStudents = students && students.length > 0;
    const hasAttendance = attendanceData && attendanceData.length > 0;
    
    if (!hasActivities && !hasAttendance) {
      setAnalyticsData(null);
      return;
    }

    const studentPerformance = calculateStudentPerformance(activities, students);
    
    const lineChartData = prepareLineChartData(activities, studentPerformance);
    const pieChartData = preparePieChartData(studentPerformance);
    const barChartData = prepareBarChartData(studentPerformance, barChartSort);
    const activityTypeData = prepareActivityTypeData(activities, students);
    const assessmentTypeBarData = prepareAssessmentTypeBarData(activities, students);

    const analyticsResult = {
      studentPerformance,
      lineChartData,
      pieChartData,
      barChartData,
      activityTypeData,
      assessmentTypeBarData,
      activities,
      students,
      attendanceData: attendanceData || [],
      summary: calculateSummary(studentPerformance, activities, attendanceData)
    };
    
    setAnalyticsData(analyticsResult);
    
    return analyticsResult;
  };

  const calculateAttendanceRecord = (studentId) => {
    if (!attendanceData || attendanceData.length === 0) {
      return null;
    }
    
    const attendanceSummary = {
      totalDays: attendanceData.length,
      present: 0,
      late: 0,
      absent: 0,
      excused: 0,
      records: []
    };
    
    attendanceData.forEach(dateRecord => {
      // Find student's attendance record for this date
      const studentRecord = dateRecord.students.find(s => 
        s.student_ID == studentId || 
        s.user_ID == studentId
      );
      
      let status = 'absent'; // Default status
      
      if (studentRecord) {
        status = studentRecord.status ? studentRecord.status.toLowerCase() : 'absent';
      }
      
      attendanceSummary.records.push({
        date: dateRecord.date,
        rawDate: dateRecord.raw_date,
        status: status
      });
      
      switch (status) {
        case 'present':
        case 'on-time':
          attendanceSummary.present++;
          break;
        case 'late':
          attendanceSummary.late++;
          break;
        case 'absent':
          attendanceSummary.absent++;
          break;
        case 'excused':
          attendanceSummary.excused++;
          break;
        default:
          attendanceSummary.absent++;
      }
    });
    
    return attendanceSummary;
  };

  const calculateStudentPerformance = (activities, students) => {
    return students.map(student => {
      const studentActivities = activities.filter(activity => 
        activity.students && activity.students.some(s => s.user_ID === student.user_ID)
      );

      const submittedActivities = studentActivities.filter(activity => {
        const studentData = activity.students.find(s => s.user_ID === student.user_ID);
        return studentData && studentData.submitted;
      });

      const gradedActivities = submittedActivities.filter(activity => {
        const studentData = activity.students.find(s => s.user_ID === student.user_ID);
        return studentData && studentData.grade !== null && studentData.grade !== undefined;
      });

      let totalPoints = 0;
      let maxPossiblePoints = 0;
      let performanceByType = {};
      
      gradedActivities.forEach(item => {
        const studentData = item.students.find(s => s.user_ID === student.user_ID);
        const grade = parseFloat(studentData.grade) || 0;
        const maxPoints = parseFloat(item.points) || 0;
        
        totalPoints += grade;
        maxPossiblePoints += maxPoints;
        
        const type = item.activity_type || 'Other';
        if (!performanceByType[type]) {
          performanceByType[type] = { total: 0, max: 0, count: 0 };
        }
        performanceByType[type].total += grade;
        performanceByType[type].max += maxPoints;
        performanceByType[type].count += 1;
      });

      Object.keys(performanceByType).forEach(type => {
        const data = performanceByType[type];
        performanceByType[type] = data.max > 0 ? (data.total / data.max) * 100 : 0;
      });

      const averageGrade = maxPossiblePoints > 0 ? (totalPoints / maxPossiblePoints) * 100 : 0;
      
      let attendanceRate = 0;
      if (attendanceData && attendanceData.length > 0) {
        const attendanceSummary = calculateAttendanceRecord(student.user_ID);
        if (attendanceSummary && attendanceSummary.totalDays > 0) {
          const totalAttended = attendanceSummary.present + attendanceSummary.excused;
          attendanceRate = (totalAttended / attendanceSummary.totalDays) * 100;
        }
      }

      return {
        studentId: student.user_ID,
        studentName: student.user_Name,
        totalActivities: studentActivities.length,
        submittedActivities: submittedActivities.length,
        gradedActivities: gradedActivities.length,
        averageGrade: Math.round(averageGrade * 100) / 100,
        performanceByType,
        submissionRate: studentActivities.length > 0 ? 
          (submittedActivities.length / studentActivities.length) * 100 : 0,
        attendanceRate: Math.round(attendanceRate * 100) / 100
      };
    });
  };

  const prepareAssessmentTypeBarData = (activities, students) => {
    const typeData = {};
    
    [...ACTIVITY_TYPES].forEach(type => {
      typeData[type] = {
        total: 0,
        count: 0,
        students: 0
      };
    });

    // Process regular activities
    activities.forEach(activity => {
      const type = activity.activity_type || 'Other';
      if (!typeData[type]) {
        typeData[type] = { total: 0, count: 0, students: 0 };
      }
      
      const gradedStudents = students.filter(student => {
        const studentData = activity.students?.find(s => s.user_ID === student.user_ID);
        return studentData && studentData.grade !== null && activity.points > 0;
      });
      
      gradedStudents.forEach(student => {
        const studentData = activity.students.find(s => s.user_ID === student.user_ID);
        const grade = parseFloat(studentData.grade) || 0;
        const percentage = (grade / activity.points) * 100;
        
        typeData[type].total += percentage;
        typeData[type].count += 1;
      });
      
      typeData[type].students = Math.max(typeData[type].students, gradedStudents.length);
    });

    // Process attendance data
    if (attendanceData && attendanceData.length > 0) {
      students.forEach(student => {
        const attendanceSummary = calculateAttendanceRecord(student.user_ID);
        if (attendanceSummary && attendanceSummary.totalDays > 0) {
          const totalAttended = attendanceSummary.present + attendanceSummary.excused;
          const attendanceRate = (totalAttended / attendanceSummary.totalDays) * 100;
          typeData['Attendance'].total += attendanceRate;
          typeData['Attendance'].count += 1;
        }
      });
    }

    return Object.entries(typeData)
      .filter(([type, data]) => data.count > 0)
      .map(([type, data]) => ({
        type: type,
        average: Math.round((data.total / data.count) * 100) / 100,
        count: data.count,
        students: data.students || data.count,
        color: COLORS[ACTIVITY_TYPES.indexOf(type) % COLORS.length]
      }))
      .sort((a, b) => b.average - b.average);
  };

  const calculateSummary = (studentPerformance, activities, attendanceData) => {
    const avgGrade = studentPerformance.length > 0 ? 
      studentPerformance.reduce((sum, student) => sum + student.averageGrade, 0) / studentPerformance.length : 0;
    
    const avgSubmissionRate = studentPerformance.length > 0 ? 
      studentPerformance.reduce((sum, student) => sum + student.submissionRate, 0) / studentPerformance.length : 0;

    let avgAttendanceRate = 0;
    if (attendanceData && attendanceData.length > 0) {
      const totalAttendanceRates = studentPerformance.reduce((sum, student) => sum + student.attendanceRate, 0);
      avgAttendanceRate = totalAttendanceRates / studentPerformance.length;
    }

    const activityTypes = {};
    activities.forEach(activity => {
      const type = activity.activity_type || 'Other';
      activityTypes[type] = (activityTypes[type] || 0) + 1;
    });

    if (attendanceData && attendanceData.length > 0) {
      activityTypes['Attendance'] = attendanceData.length;
    }

    return {
      averageGrade: Math.round(avgGrade * 100) / 100,
      averageSubmissionRate: Math.round(avgSubmissionRate * 100) / 100,
      averageAttendanceRate: Math.round(avgAttendanceRate * 100) / 100,
      totalStudents: studentPerformance.length,
      totalActivities: activities.length,
      totalAttendanceDays: attendanceData ? attendanceData.length : 0,
      activityTypeDistribution: activityTypes
    };
  };

  const prepareLineChartData = (activities, studentPerformance) => {
    if (!activities.length) return [];

    const allActivitiesSorted = [...activities].sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );
    
    const activityPositionMap = {};
    allActivitiesSorted.forEach((activity, index) => {
      activityPositionMap[activity.id] = index + 1;
    });

    const sortedActivities = [...activities].sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );

    return sortedActivities.map((activity) => {
      const originalPosition = activityPositionMap[activity.id] || 1;
      
      const dataPoint = {
        activity: `A${originalPosition}`,
        activityType: activity.activity_type || 'Other',
        fullTitle: activity.title,
        maxPoints: activity.points || 0,
        originalPosition: originalPosition,
        filteredPosition: sortedActivities.findIndex(a => a.id === activity.id) + 1
      };

      studentPerformance.forEach(student => {
        const studentData = activity.students?.find(s => s.user_ID === student.studentId);
        if (studentData && studentData.grade !== null && activity.points > 0) {
          const percentage = (studentData.grade / activity.points) * 100;
          dataPoint[student.studentId] = Math.round(percentage * 100) / 100;
        } else {
          dataPoint[student.studentId] = null;
        }
      });

      const studentsWithGrades = studentPerformance.filter(student => {
        const studentData = activity.students?.find(s => s.user_ID === student.studentId);
        return studentData && studentData.grade !== null && activity.points > 0;
      });
      
      if (studentsWithGrades.length > 0) {
        const totalPercentage = studentsWithGrades.reduce((sum, student) => {
          const studentData = activity.students?.find(s => s.user_ID === student.studentId);
          return sum + (studentData.grade / activity.points * 100);
        }, 0);
        dataPoint['Class Average'] = Math.round((totalPercentage / studentsWithGrades.length) * 100) / 100;
      }

      return dataPoint;
    });
  };

  const preparePieChartData = (studentPerformance) => {
    const performanceRanges = [
      { name: 'Excellent (90-100%)', range: [90, 100], count: 0, color: '#00874E' },
      { name: 'Good (80-89%)', range: [80, 89], count: 0, color: '#4ECDC4' },
      { name: 'Average (70-79%)', range: [70, 79], count: 0, color: '#45B7D1' },
      { name: 'Needs Improvement (60-69%)', range: [60, 69], count: 0, color: '#FFEAA7' },
      { name: 'Poor (<60%)', range: [0, 59], count: 0, color: '#FF6B6B' }
    ];

    studentPerformance.forEach(student => {
      const range = performanceRanges.find(r => 
        student.averageGrade >= r.range[0] && student.averageGrade <= r.range[1]
      );
      if (range) range.count++;
    });

    return performanceRanges.filter(range => range.count > 0);
  };

  const prepareBarChartData = (studentPerformance, sortOrder = 'desc') => {
    const sortedPerformance = [...studentPerformance]
      .filter(student => student.gradedActivities > 0)
      .sort((a, b) => sortOrder === 'desc' ? b.averageGrade - a.averageGrade : a.averageGrade - b.averageGrade);

    return sortedPerformance.map((student, index) => ({
      name: student.studentId,
      fullName: student.studentName,
      grade: student.averageGrade,
      submissions: student.submittedActivities,
      totalActivities: student.totalActivities,
      rank: sortOrder === 'desc' ? index + 1 : sortedPerformance.length - index,
      totalStudents: studentPerformance.length
    }));
  };

  const prepareActivityTypeData = (activities, students) => {
    const typeData = {};
    
    [...ACTIVITY_TYPES].forEach(type => {
      typeData[type] = [];
    });

    // Process regular activities
    const activitiesByType = {};
    activities.forEach(activity => {
      const type = activity.activity_type || 'Other';
      if (!activitiesByType[type]) {
        activitiesByType[type] = [];
      }
      activitiesByType[type].push(activity);
    });

    Object.keys(activitiesByType).forEach(type => {
      const typeActivities = activitiesByType[type];
      
      const typePerformance = students.map(student => {
        const gradedActivities = typeActivities.filter(activity => {
          const studentData = activity.students?.find(s => s.user_ID === student.user_ID);
          return studentData && studentData.submitted && studentData.grade !== null;
        });

        if (gradedActivities.length === 0) {
          return null;
        }

        const total = gradedActivities.reduce((sum, activity) => {
          const studentData = activity.students?.find(s => s.user_ID === student.user_ID);
          return sum + (parseFloat(studentData?.grade) || 0);
        }, 0);

        const maxPossible = gradedActivities.reduce((sum, activity) => 
          sum + (parseFloat(activity.points) || 0), 0);

        const average = maxPossible > 0 ? (total / maxPossible) * 100 : 0;

        return {
          studentName: student.user_ID,
          fullName: student.user_Name,
          average: Math.round(average * 100) / 100,
          activityCount: gradedActivities.length
        };
      }).filter(student => student !== null && student.average > 0)
        .sort((a, b) => b.average - a.average)
        .slice(0, 8);

      typeData[type] = typePerformance;
    });

    // Process attendance data separately
    if (attendanceData && students.length > 0) {
      const attendancePerformance = students.map(student => {
        const attendanceSummary = calculateAttendanceRecord(student.user_ID);
        
        if (!attendanceSummary || attendanceSummary.totalDays === 0) {
          return null;
        }
        
        // Calculate attendance rate
        const totalAttended = attendanceSummary.present + attendanceSummary.excused;
        const attendanceRate = (totalAttended / attendanceSummary.totalDays) * 100;
        
        return {
          studentName: student.user_ID,
          fullName: student.user_Name,
          average: Math.round(attendanceRate * 100) / 100,
          activityCount: attendanceSummary.totalDays,
          attendanceSummary: attendanceSummary
        };
      }).filter(student => student !== null && student.activityCount > 0)
        .sort((a, b) => b.average - a.average)
        .slice(0, 8);

      typeData['Attendance'] = attendancePerformance;
    }

    return typeData;
  };

  // Helper function to extract surname from full name
  const getStudentDisplayName = (studentId, studentName) => {
    if (!studentName) {
      return `Student ${studentId}`;
    }
    
    // Extract surname (last word) from full name
    const nameParts = studentName.trim().split(' ');
    if (nameParts.length === 0) {
      return `Student ${studentId}`;
    }
    
    const surname = nameParts[nameParts.length - 1];
    return `${surname} (${studentId})`;
  };

  const AssessmentTypeBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#2A2A35] border border-[#3A3A45] rounded-lg shadow-xl p-3">
          <p className="font-semibold text-[#FFFFFF] mb-1">{label}</p>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm text-[#FFFFFF]/80">Average Performance:</span>
              <span className="text-sm font-medium ml-2 text-[#FFFFFF]">{data.average}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#FFFFFF]/80">Students with data:</span>
              <span className="text-sm font-medium ml-2 text-[#FFFFFF]">{data.students}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-[#FFFFFF]/80">Data points:</span>
              <span className="text-sm font-medium ml-2 text-[#FFFFFF]">{data.count}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleBarChartSortChange = () => {
    const newSort = barChartSort === 'desc' ? 'asc' : 'desc';
    setBarChartSort(newSort);
    
    if (analyticsData) {
      const updatedBarChartData = prepareBarChartData(analyticsData.studentPerformance, newSort);
      setAnalyticsData(prev => ({
        ...prev,
        barChartData: updatedBarChartData
      }));
    }
  };

  const reloadAllData = async () => {
    setLoading(true);
    try {
      await fetchClassInfo();
      const attendance = await fetchAttendanceData();
      const activitiesResult = await fetchActivitiesData();
      
      if (activitiesResult && activitiesResult.success) {
        await processAllData(activitiesResult.activities, activitiesResult.students, attendance);
      }
    } catch (error) {
      console.error("Error reloading data:", error);
      setError("Failed to reload data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-5 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00874E] border-r-transparent"></div>
            <p className="mt-3 text-[#FFFFFF]/80">Loading Student Progress Analytics...</p>
            <p className="text-sm text-[#FFFFFF]/60 mt-1">This may take a moment as we load all data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#15151C] min-h-screen">
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          
          {/* ========== PAGE HEADER ========== */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img
                src={AnalyticsIcon}
                alt="Analytics"
                className="h-7 w-7 sm:h-9 sm:w-9 mr-2 sm:mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#FFFFFF]">
                Student Progress Tracking System
              </h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-[#FFFFFF]/80">
              Integrated Academic Data Analytics & Performance Insights
            </p>
          </div>

          {/* ========== SUBJECT INFORMATION - UPDATED TO WHITE AND SMALLER ========== */}
          <div className="flex flex-col gap-1 text-sm text-[#FFFFFF]/80 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">SUBJECT CODE:</span>
              <span>{classInfo?.subject_code || subjectCode || 'N/A'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">SUBJECT:</span>
              <span>{classInfo?.subject || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="font-semibold">SECTION:</span>
                <span>{classInfo?.section || 'N/A'}</span>
              </div>
              <div className="flex justify-end">
                <Link to="/ClassManagement">
                  <img 
                    src={BackButton} 
                    alt="Back" 
                    className="h-5 w-5 cursor-pointer hover:opacity-70 transition-opacity brightness-0 invert" 
                    title="Back to Class Management"
                  />
                </Link>
              </div>
            </div>
          </div>

          <hr className="border-[#FFFFFF]/20 mb-4" />

          {/* ========== ACTION BUTTONS ========== */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <div className="flex flex-col sm:flex-row gap-2 flex-1">
              {/* Announcement Button */}
              <Link to={`/Class?code=${subjectCode}`} className="flex-1 sm:flex-initial">
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-[#00A15D]/20 text-[#00A15D] border-2 border-[#00A15D]/30 font-semibold text-sm rounded-md shadow-md hover:bg-[#00A15D]/30 transition-all duration-300 cursor-pointer w-full sm:w-auto">
                  <img 
                    src={Announcement} 
                    alt="" 
                    className="h-4 w-4 brightness-0 invert"
                  />
                  <span className="sm:inline">Announcements</span>
                </button>
              </Link>

              {/* Classwork Button */}
              <Link to={`/ClassworkTab?code=${subjectCode}`} className="min-w-0">
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-[#767EE0]/20 text-[#767EE0] border-2 border-[#767EE0]/30 font-semibold text-sm rounded-md shadow-md hover:bg-[#767EE0]/30 transition-all duration-300 cursor-pointer w-full">
                  <img 
                    src={Classwork} 
                    alt="" 
                    className="h-4 w-4 flex-shrink-0 brightness-0 invert"
                  />
                  <span className="whitespace-nowrap truncate">Class Work</span>
                </button>
              </Link>

              {/* Attendance Button */}
              <Link to={`/Attendance?code=${subjectCode}`} className="sm:flex-initial">
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-[#FFA600]/20 text-[#FFA600] border-2 border-[#FFA600]/30 font-semibold text-sm rounded-md shadow-md hover:bg-[#FFA600]/30 transition-all duration-300 cursor-pointer w-full sm:w-auto">
                  <img 
                    src={AttendanceIcon}
                    alt="" 
                    className="h-4 w-4 brightness-0 invert"
                  />
                  <span className="sm:inline">Attendance</span>
                </button>
              </Link>

              {/* Grade Button */}
              <Link to={`/GradeTab?code=${subjectCode}`} className="sm:flex-initial">
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-[#A15353]/20 text-[#A15353] border-2 border-[#A15353]/30 font-semibold text-sm rounded-md shadow-md hover:bg-[#A15353]/30 transition-all duration-300 cursor-pointer w-full sm:w-auto">
                  <img 
                    src={GradeIcon} 
                    alt="" 
                    className="h-4 w-4 brightness-0 invert"
                  />
                  <span className="sm:inline">Grade</span>
                </button>
              </Link>

              {/* Analytics Button - Active */}
              <Link to={`/AnalyticsTab?code=${subjectCode}`} className="sm:flex-initial">
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-[#B39DDB]/20 text-[#B39DDB] border-2 border-[#B39DDB]/30 font-semibold text-sm rounded-md shadow-md hover:bg-[#B39DDB]/30 transition-all duration-300 cursor-pointer w-full sm:w-auto">
                  <img 
                    src={AnalyticsIcon} 
                    alt="" 
                    className="h-4 w-4 brightness-0 invert"
                  />
                  <span className="sm:inline">Analytics</span>
                </button>
              </Link>
            </div>

            {/* ========== ICON BUTTONS ========== */}
            <div className="flex items-center gap-2 justify-end sm:justify-start">
              <Link to={`/StudentList?code=${subjectCode}`}>
                <button className="p-2 bg-[#2A2A35] rounded-md shadow-md border-2 border-transparent hover:border-[#00A15D] transition-all duration-200 flex-shrink-0 cursor-pointer" title="Student List">
                  <img 
                    src={ClassManagementIcon} 
                    alt="ClassManagement" 
                    className="h-4 w-4 brightness-0 invert" 
                  />
                </button>
              </Link>
            </div>
          </div>

          {/* ========== EVERYTHING BELOW ACTION BUTTONS MADE SMALLER ========== */}
          <div className="mt-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search by Student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 rounded-md px-3 py-2 pr-10 shadow-md outline-none bg-[#2A2A35] text-[#FFFFFF] text-sm border-2 border-transparent focus:border-[#00874E] transition-colors placeholder:text-[#FFFFFF]/50"
                />
                <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#FFFFFF]/50" title="Search">
                  <img
                    src={Search}
                    alt="Search"
                    className="h-4 w-4 brightness-0 invert"
                  />
                </button>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedActivityType}
                  onChange={(e) => setSelectedActivityType(e.target.value)}
                  className="px-2 py-1.5 border border-[#3A3A45] rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#00874E] focus:border-transparent bg-[#2A2A35] text-[#FFFFFF]"
                >
                  <option value="All">All Types</option>
                  {ACTIVITY_TYPES.filter(type => type !== 'Attendance').map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {analyticsData ? (
            <div className="mt-4 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-[#2A2A35] rounded-lg shadow-md p-3 border-l-4 border-[#00874E] hover:shadow-lg transition-shadow">
                  <h3 className="text-xs font-semibold text-[#FFFFFF]/60">Total Students</h3>
                  <p className="text-lg font-bold text-[#FFFFFF]">{analyticsData.summary.totalStudents}</p>
                  <p className="text-xs text-[#FFFFFF]/40">Enrolled in class</p>
                </div>
                <div className="bg-[#2A2A35] rounded-lg shadow-md p-3 border-l-4 border-[#4ECDC4] hover:shadow-lg transition-shadow">
                  <h3 className="text-xs font-semibold text-[#FFFFFF]/60">Learning Activities</h3>
                  <p className="text-lg font-bold text-[#FFFFFF]">{analyticsData.summary.totalActivities}</p>
                  <p className="text-xs text-[#FFFFFF]/40">Assignments & Assessments</p>
                </div>
                <div className="bg-[#2A2A35] rounded-lg shadow-md p-3 border-l-4 border-[#45B7D1] hover:shadow-lg transition-shadow">
                  <h3 className="text-xs font-semibold text-[#FFFFFF]/60">Class Average</h3>
                  <p className="text-lg font-bold text-[#FFFFFF]">
                    {analyticsData.summary.averageGrade}%
                  </p>
                  <p className="text-xs text-[#FFFFFF]/40">Overall Performance</p>
                </div>
                <div className="bg-[#2A2A35] rounded-lg shadow-md p-3 border-l-4 border-[#FF6B6B] hover:shadow-lg transition-shadow">
                  <h3 className="text-xs font-semibold text-[#FFFFFF]/60">Engagement Rate</h3>
                  <p className="text-lg font-bold text-[#FFFFFF]">
                    {analyticsData.summary.averageSubmissionRate}%
                  </p>
                  <p className="text-xs text-[#FFFFFF]/40">Average Submission Rate</p>
                </div>
              </div>

              {/* Always show attendance section if we have data */}
              {analyticsData.summary.averageAttendanceRate > 0 ? (
                <div className="bg-[#2A2A35] rounded-lg shadow-md p-3 border-l-4 border-[#96CEB4] hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold text-[#FFFFFF]/60">Average Attendance</h3>
                      <p className="text-lg font-bold text-[#FFFFFF]">
                        {analyticsData.summary.averageAttendanceRate}%
                      </p>
                      <p className="text-xs text-[#FFFFFF]/40">
                        {analyticsData.summary.totalAttendanceDays || 0} days tracked
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-[#FFFFFF]/60">Attendance Rate Distribution</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="w-12 h-1.5 bg-[#EF5350] rounded-full"></div>
                        <div className="w-12 h-1.5 bg-[#FFB74D] rounded-full"></div>
                        <div className="w-12 h-1.5 bg-[#66BB6A] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[#2A2A35] rounded-lg shadow-md p-3 border-l-4 border-[#3A3A45] hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold text-[#FFFFFF]/60">Attendance Data</h3>
                      <p className="text-lg font-bold text-[#FFFFFF]/40">Not Available</p>
                      <p className="text-xs text-[#FFFFFF]/40">
                        No attendance records found
                      </p>
                    </div>
                    <Link to={`/Attendance?code=${subjectCode}`}>
                      <button className="px-2 py-1.5 bg-[#00A15D]/20 text-[#00A15D] border-2 border-[#00A15D]/30 rounded-md shadow-md hover:bg-[#00A15D]/30 transition-all duration-300 text-xs">
                        Take Attendance
                      </button>
                    </Link>
                  </div>
                </div>
              )}

              {/* Use the new StudentPerformanceCard component */}
              <StudentPerformanceCard 
                analyticsData={analyticsData}
                selectedActivityType={selectedActivityType}
                setSelectedActivityType={setSelectedActivityType}
                getStudentDisplayName={getStudentDisplayName}
              />

              {/* Separated Chart Components */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PerformanceDistributionCard 
                  pieChartData={analyticsData.pieChartData}
                  totalStudents={analyticsData.summary.totalStudents}
                />

                <StudentPerformanceRankingCard
                  barChartData={analyticsData.barChartData}
                  barChartSort={barChartSort}
                  handleBarChartSortChange={handleBarChartSortChange}
                  totalStudents={analyticsData.students.length}
                  getStudentDisplayName={getStudentDisplayName}
                />
              </div>

              {/* Use the new PerformanceByAssessmentType component */}
              <PerformanceByAssessmentType 
                analyticsData={analyticsData}
                getStudentDisplayName={getStudentDisplayName}
              />

            </div>
          ) : (
            <div className="mt-6">
              <div className="bg-[#2A2A35] rounded-lg shadow-md p-6 text-center">
                <div className="text-[#FFFFFF]/60">
                  <svg className="w-12 h-12 mx-auto mb-3 text-[#FFFFFF]/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-[#FFFFFF] mb-1">Ready for Analytics</h3>
                  <p className="mb-3 text-[#FFFFFF]/60 text-sm max-w-md mx-auto">
                    Create activities and grade student submissions to generate comprehensive academic analytics.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Link to={`/ClassworkTab?code=${subjectCode}`}>
                      <button className="px-2 py-1.5 bg-[#00A15D]/20 text-[#00A15D] border-2 border-[#00A15D]/30 rounded-md shadow-md hover:bg-[#00A15D]/30 transition-all duration-300 text-xs">
                        Create Activities
                      </button>
                    </Link>
                    <button 
                      onClick={reloadAllData}
                      className="px-2 py-1.5 bg-[#3A3A45] text-[#FFFFFF] rounded-md hover:bg-[#4A4A55] transition-colors text-xs"
                    >
                      Refresh Data
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}