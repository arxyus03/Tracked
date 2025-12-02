import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import BackButton from '../../assets/BackButton(Light).svg';
import Search from "../../assets/Search.svg";
import ClassManagementIcon from "../../assets/ClassManagement(Light).svg"; 
import Announcement from "../../assets/Announcement(Light).svg";
import Classwork from "../../assets/Classwork(Light).svg";
import GradeIcon from "../../assets/Grade(Light).svg";
import AnalyticsIcon from "../../assets/Analytics(Light).svg";
import AttendanceIcon from '../../assets/Attendance(Light).svg';

// Color palette for charts
const COLORS = ['#00874E', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
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
  const [failingStudents, setFailingStudents] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [attendanceData, setAttendanceData] = useState(null);

  useEffect(() => {
    if (subjectCode) {
      fetchClassInfo();
      fetchAnalyticsData();
      fetchAttendanceData();
    }
  }, [subjectCode]);

  const fetchClassInfo = async () => {
    try {
      const response = await fetch(
        `http://localhost/TrackEd/src/Pages/Professor/SubjectDetailsDB/get_students_by_section.php?subject_code=${subjectCode}`
      );
      const result = await response.json();
      if (result.success) {
        setClassInfo(result.class_info);
      } else {
        console.warn("Class info warning:", result.message);
      }
    } catch (error) {
      console.error("Error fetching class info:", error);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      const professor_ID = localStorage.getItem('professor_ID') || '1';
      
      const response = await fetch(
        `http://localhost/TrackEd/src/Pages/Professor/SubjectDetailsDB/get_attendance_history.php?subject_code=${subjectCode}&professor_ID=${professor_ID}`
      );
      
      const result = await response.json();
      console.log("Attendance API response:", result);
      
      if (result.success && result.attendance_history) {
        setAttendanceData(result.attendance_history);
      } else {
        setAttendanceData(null);
      }
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setAttendanceData(null);
    }
  };

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching analytics for subject:", subjectCode);
      
      const response = await fetch(
        `http://localhost/TrackEd/src/Pages/Professor/SubjectDetailsDB/get_activities.php?subject_code=${subjectCode}`
      );
      
      const result = await response.json();
      console.log("Analytics API response:", result);
      
      if (result.success) {
        if (result.activities && result.students) {
          console.log(`Found ${result.activities.length} activities and ${result.students.length} students`);
          processAnalyticsData(result.activities, result.students);
        } else {
          setAnalyticsData(null);
        }
      } else {
        setAnalyticsData(null);
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (activities, students) => {
    if ((!activities || activities.length === 0) && (!attendanceData || attendanceData.length === 0)) {
      setAnalyticsData(null);
      setFailingStudents([]);
      return;
    }

    console.log("Processing analytics data...");
    
    const studentPerformance = calculateStudentPerformance(activities, students);
    
    const failing = studentPerformance
      .filter(student => student.averageGrade < 60)
      .map(student => ({
        studentId: student.studentId,
        studentName: student.studentName, // Keep student name for recommendations
        averageGrade: student.averageGrade,
        submissionRate: student.submissionRate,
        gradedActivities: student.gradedActivities,
        totalActivities: student.totalActivities,
        performanceByType: student.performanceByType,
        attendanceRate: student.attendanceRate
      }));
    
    setFailingStudents(failing);
    
    const lineChartData = prepareLineChartData(activities, studentPerformance);
    const pieChartData = preparePieChartData(studentPerformance);
    const barChartData = prepareBarChartData(studentPerformance, barChartSort);
    const activityTypeData = prepareActivityTypeData(activities, students);
    const assessmentTypeBarData = prepareAssessmentTypeBarData(activities, students);

    setAnalyticsData({
      studentPerformance,
      lineChartData,
      pieChartData,
      barChartData,
      activityTypeData,
      assessmentTypeBarData,
      activities,
      students,
      attendanceData,
      summary: calculateSummary(studentPerformance, activities, attendanceData)
    });
  };

  const calculateAttendanceRecord = (studentId) => {
    if (!attendanceData) return null;
    
    const attendanceSummary = {
      totalDays: attendanceData.length,
      present: 0,
      late: 0,
      absent: 0,
      excused: 0,
      records: []
    };
    
    attendanceData.forEach(dateRecord => {
      const studentRecord = dateRecord.students.find(s => s.student_ID === studentId);
      const status = studentRecord ? studentRecord.status.toLowerCase() : 'absent';
      
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
        const studentAttendance = attendanceData.map(dateRecord => {
          const studentRecord = dateRecord.students.find(s => s.student_ID === student.user_ID);
          return studentRecord ? studentRecord.status : 'absent';
        });
        
        const presentCount = studentAttendance.filter(status => 
          status.toLowerCase() === 'present' || status.toLowerCase() === 'on-time'
        ).length;
        
        attendanceRate = studentAttendance.length > 0 ? 
          (presentCount / studentAttendance.length) * 100 : 0;
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

    if (attendanceData && attendanceData.length > 0) {
      students.forEach(student => {
        const attendanceSummary = calculateAttendanceRecord(student.user_ID);
        if (attendanceSummary && attendanceSummary.totalDays > 0) {
          const attendanceRate = ((attendanceSummary.present + attendanceSummary.excused) / attendanceSummary.totalDays) * 100;
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
      .sort((a, b) => b.average - a.average);
  };

  const calculateSummary = (studentPerformance, activities, attendanceData) => {
    const avgGrade = studentPerformance.length > 0 ? 
      studentPerformance.reduce((sum, student) => sum + student.averageGrade, 0) / studentPerformance.length : 0;
    
    const avgSubmissionRate = studentPerformance.length > 0 ? 
      studentPerformance.reduce((sum, student) => sum + student.submissionRate, 0) / studentPerformance.length : 0;

    const avgAttendanceRate = studentPerformance.length > 0 ? 
      studentPerformance.reduce((sum, student) => sum + student.attendanceRate, 0) / studentPerformance.length : 0;

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
      rank: sortOrder === 'desc' ? index + 1 : sortedPerformance.length - index
    }));
  };

  const prepareActivityTypeData = (activities, students) => {
    const typeData = {};
    
    [...ACTIVITY_TYPES].forEach(type => {
      typeData[type] = [];
    });

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
      }).filter(student => student.average > 0 && student.activityCount > 0)
        .sort((a, b) => b.average - a.average)
        .slice(0, 8);

      typeData[type] = typePerformance;
    });

    if (attendanceData && students.length > 0) {
      const attendancePerformance = students.map(student => {
        const attendanceSummary = calculateAttendanceRecord(student.user_ID);
        const attendanceRate = attendanceSummary ? 
          ((attendanceSummary.present + attendanceSummary.excused) / attendanceSummary.totalDays) * 100 : 0;
        
        return {
          studentName: student.user_ID,
          fullName: student.user_Name,
          average: Math.round(attendanceRate * 100) / 100,
          activityCount: attendanceSummary ? attendanceSummary.totalDays : 0,
          attendanceSummary: attendanceSummary
        };
      }).filter(student => student.average > 0 && student.activityCount > 0)
        .sort((a, b) => b.average - a.average)
        .slice(0, 8);

      typeData['Attendance'] = attendancePerformance;
    }

    return typeData;
  };

  const filteredLineChartData = analyticsData?.lineChartData.filter(item => 
    selectedActivityType === 'All' || item.activityType === selectedActivityType
  ) || [];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg max-w-xs">
          <p className="font-semibold text-[#465746] mb-1">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between">
              <span style={{ color: entry.color }} className="text-sm">
                {entry.name === 'Class Average' ? 'Class Average' : `Student ${entry.name}`}:
              </span>
              <span className="text-sm font-medium ml-2">
                {entry.value !== null ? `${entry.value}%` : 'Not submitted'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const BarChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-[#465746] mb-1">
            Student ID: {label}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between">
              <span style={{ color: entry.color }} className="text-sm">
                {entry.name}:
              </span>
              <span className="text-sm font-medium ml-2">
                {entry.name === 'grade' ? `${entry.value}%` : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const AssessmentTypeBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold text-[#465746] mb-1">{label}</p>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-sm">Average Performance:</span>
              <span className="text-sm font-medium ml-2">{data.average}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Students with data:</span>
              <span className="text-sm font-medium ml-2">{data.students}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Data points:</span>
              <span className="text-sm font-medium ml-2">{data.count}</span>
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

  const FailingStudentRecommendations = () => {
    if (failingStudents.length === 0 || !showSuggestions) return null;

    return (
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-amber-800 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Student Intervention Recommendations
          </h3>
          <button 
            onClick={() => setShowSuggestions(false)}
            className="text-amber-600 hover:text-amber-800"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <p className="text-amber-700 mb-4">
          <strong>{failingStudents.length} student{failingStudents.length !== 1 ? 's' : ''}</strong> 
          {failingStudents.length !== 1 ? ' are' : ' is'} performing below passing grade (60%). 
          Consider the following interventions:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {failingStudents.map((student) => {
            const attendanceSummary = calculateAttendanceRecord(student.studentId);
            const attendanceRate = attendanceSummary ? 
              ((attendanceSummary.present + attendanceSummary.excused) / attendanceSummary.totalDays) * 100 : 0;
            
            return (
              <div key={student.studentId} className="bg-white rounded p-3 border border-amber-100">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium text-gray-800">Student ID: {student.studentId}</span>
                    <p className="text-sm text-gray-600">{student.studentName}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    student.averageGrade < 40 ? 'bg-red-100 text-red-800' : 
                    student.averageGrade < 50 ? 'bg-orange-100 text-orange-800' : 
                    'bg-amber-100 text-amber-800'
                  }`}>
                    Average: {student.averageGrade}%
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Submission Rate:</span>
                    <span className={`font-medium ${
                      student.submissionRate < 50 ? 'text-red-600' : 
                      student.submissionRate < 70 ? 'text-amber-600' : 
                      'text-green-600'
                    }`}>
                      {student.submissionRate}%
                    </span>
                  </div>
                  
                  {attendanceSummary && (
                    <div className="flex justify-between">
                      <span>Attendance Rate:</span>
                      <span className={`font-medium ${
                        attendanceRate < 70 ? 'text-red-600' : 
                        attendanceRate < 85 ? 'text-amber-600' : 
                        'text-green-600'
                      }`}>
                        {Math.round(attendanceRate)}%
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span>Graded Activities:</span>
                    <span>{student.gradedActivities} of {student.totalActivities}</span>
                  </div>
                </div>
                
                {attendanceSummary && attendanceSummary.totalDays > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-700 mb-1">Attendance Breakdown:</p>
                    <div className="grid grid-cols-4 gap-1 text-xs text-center">
                      <div className="bg-green-100 text-green-800 p-1 rounded">
                        <div className="font-bold">{attendanceSummary.present}</div>
                        <div>Present</div>
                      </div>
                      <div className="bg-yellow-100 text-yellow-800 p-1 rounded">
                        <div className="font-bold">{attendanceSummary.late}</div>
                        <div>Late</div>
                      </div>
                      <div className="bg-red-100 text-red-800 p-1 rounded">
                        <div className="font-bold">{attendanceSummary.absent}</div>
                        <div>Absent</div>
                      </div>
                      <div className="bg-blue-100 text-blue-800 p-1 rounded">
                        <div className="font-bold">{attendanceSummary.excused}</div>
                        <div>Excused</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {Object.keys(student.performanceByType).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-700 mb-1">Performance by Activity Type:</p>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(student.performanceByType).map(([type, grade]) => (
                        <span key={type} className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                          {type}: {grade}%
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-3 pt-2 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-700 mb-1">Recommended Actions:</p>
                  <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
                    {student.submissionRate < 70 && (
                      <li>Schedule a one-on-one meeting to discuss submission issues</li>
                    )}
                    {attendanceRate < 70 && (
                      <li>Address attendance concerns and discuss importance of regular class attendance</li>
                    )}
                    {student.averageGrade < 50 && (
                      <li>Provide additional resources or tutoring sessions</li>
                    )}
                    {Object.entries(student.performanceByType).some(([_, grade]) => grade < 60) && (
                      <li>Review specific activity types where student is struggling</li>
                    )}
                    {attendanceRate < 70 && student.submissionRate < 70 && (
                      <li>Consider involving academic advisor for attendance and submission issues</li>
                    )}
                    <li>Set up progress monitoring with weekly check-ins</li>
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="bg-blue-50 border border-blue-100 rounded p-3">
          <p className="text-sm font-medium text-blue-800 mb-1">General Recommendations:</p>
          <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
            <li>Monitor correlation between attendance rates and academic performance</li>
            <li>Consider implementing additional support sessions for struggling students</li>
            <li>Review assessment methods for activities with consistently low scores</li>
            <li>Provide clear feedback on assignments to help students improve</li>
            <li>Encourage peer-to-peer learning and study groups</li>
            <li>Track attendance patterns and address chronic absenteeism early</li>
          </ul>
        </div>
      </div>
    );
  };

  const FailingStudentsSummary = () => {
    if (failingStudents.length === 0) return null;
    
    return (
      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg shadow-md p-4 border-l-4 border-red-500">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-red-700">Students Needing Attention</h3>
            <p className="text-2xl font-bold text-red-600">{failingStudents.length}</p>
            <p className="text-xs text-red-600 mt-1">Below passing grade (60%)</p>
          </div>
          <button 
            onClick={() => {
              const element = document.getElementById('student-intervention');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-md transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            View Details
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div>
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-5 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00874E] border-r-transparent"></div>
            <p className="mt-3 text-gray-600">Loading Student Progress Analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img
                src={AnalyticsIcon}
                alt="Analytics"
                className="h-7 w-7 sm:h-9 sm:w-9 mr-2 sm:mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                Student Progress Tracking System
              </h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-[#465746]">
              Integrated Academic Data Analytics & Performance Insights
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm sm:text-base lg:text-[1.125rem] text-[#465746] mb-4 sm:mb-5">
            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT CODE:</span>
              <span>{classInfo?.subject_code || subjectCode || 'N/A'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT:</span>
              <span>{classInfo?.subject || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Section:</span>
                <span>{classInfo?.section || 'N/A'}</span>
              </div>
              <div className="w-full flex justify-end">
                <Link to="/ClassManagement">
                  <img 
                    src={BackButton} 
                    alt="Back" 
                    className="h-6 w-6 cursor-pointer hover:opacity-70 transition-opacity" 
                    title="Back to Class Management"
                  />
                </Link>
              </div>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between w-full mt-4 sm:mt-5 gap-3">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Link to={`/Class?code=${subjectCode}`} className="flex-1 sm:flex-initial">
                <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#e6f4ea] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#d4edd8] transition-all duration-300 cursor-pointer w-full sm:w-auto" title="Announcement">
                  <img 
                    src={Announcement} 
                    alt="" 
                    className="h-4 w-4 sm:h-5 sm:w-5"
                  />
                  <span className="sm:inline">Announcement</span>
                </button>
              </Link>

              <div className="grid grid-cols-2 gap-3 w-full sm:flex sm:gap-4 sm:w-auto">
                <Link to={`/ClassworkTab?code=${subjectCode}`} className="min-w-0">
                  <button className="flex items-center justify-center gap-2 px-3 sm:px-5 py-2 bg-[#e6f0ff] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#d4e3ff] transition-all duration-300 cursor-pointer w-full" title="Class Work">
                    <img 
                      src={Classwork} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0"
                    />
                    <span className="whitespace-nowrap truncate">Class work</span>
                  </button>
                </Link>

                <Link to={`/Attendance?code=${subjectCode}`} className="sm:flex-initial">
                  <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#fff4e6] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#ffebd4] transition-all duration-300 cursor-pointer w-full sm:w-auto" title="Attendance">
                    <img 
                      src={AttendanceIcon}
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <span className="sm:inline">Attendance</span>
                  </button>
                </Link>

                <Link to={`/GradeTab?code=${subjectCode}`} className="sm:flex-initial">
                  <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#ffe6e6] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-transparent hover:bg-[#ffd4d4] transition-all duration-300 cursor-pointer w-full sm:w-auto" title="Grade">
                    <img 
                      src={GradeIcon} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <span className="sm:inline">Grade</span>
                  </button>
                </Link>

                <Link to={`/AnalyticsTab?code=${subjectCode}`} className="sm:flex-initial">
                  <button className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 bg-[#f0e6ff] font-semibold text-sm sm:text-base rounded-md shadow-md border-2 border-[#c4a0ff] hover:bg-[#e6d4ff] transition-all duration-300 cursor-pointer w-full sm:w-auto" title="Analytics">
                    <img 
                      src={AnalyticsIcon} 
                      alt="" 
                      className="h-4 w-4 sm:h-5 sm:w-5"
                    />
                    <span className="sm:inline">Analytics</span>
                  </button>
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
              <Link to={`/StudentList?code=${subjectCode}`}>
                <button className="p-2 bg-[#fff] rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 flex-shrink-0 cursor-pointer" title="Student List">
                  <img 
                    src={ClassManagementIcon} 
                    alt="ClassManagement" 
                    className="h-5 w-5 sm:h-6 sm:w-6" 
                  />
                </button>
              </Link>
            </div>
          </div>

          <div className="mt-6 sm:mt-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search by Student ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 sm:h-12 rounded-md px-4 py-2.5 pr-12 shadow-md outline-none bg-white text-sm sm:text-base border-2 border-transparent focus:border-[#00874E] transition-colors"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" title="Search">
                  <img
                    src={Search}
                    alt="Search"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                  />
                </button>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedActivityType}
                  onChange={(e) => setSelectedActivityType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00874E] focus:border-transparent bg-white"
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
            <div className="mt-6 sm:mt-8 space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-[#00874E] hover:shadow-lg transition-shadow">
                  <h3 className="text-sm font-semibold text-gray-600">Total Students</h3>
                  <p className="text-2xl font-bold text-[#465746]">{analyticsData.summary.totalStudents}</p>
                  <p className="text-xs text-gray-500 mt-1">Enrolled in class</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-[#4ECDC4] hover:shadow-lg transition-shadow">
                  <h3 className="text-sm font-semibold text-gray-600">Learning Activities</h3>
                  <p className="text-2xl font-bold text-[#465746]">{analyticsData.summary.totalActivities}</p>
                  <p className="text-xs text-gray-500 mt-1">Assignments & Assessments</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-[#45B7D1] hover:shadow-lg transition-shadow">
                  <h3 className="text-sm font-semibold text-gray-600">Class Average</h3>
                  <p className="text-2xl font-bold text-[#465746]">
                    {analyticsData.summary.averageGrade}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Overall Performance</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-[#FF6B6B] hover:shadow-lg transition-shadow">
                  <h3 className="text-sm font-semibold text-gray-600">Engagement Rate</h3>
                  <p className="text-2xl font-bold text-[#465746]">
                    {analyticsData.summary.averageSubmissionRate}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Average Submission Rate</p>
                </div>
                <FailingStudentsSummary />
              </div>

              {analyticsData.summary.averageAttendanceRate !== undefined && (
                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-[#96CEB4] hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600">Average Attendance</h3>
                      <p className="text-2xl font-bold text-[#465746]">
                        {analyticsData.summary.averageAttendanceRate}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {analyticsData.summary.totalAttendanceDays || 0} days tracked
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Attendance Rate Distribution</div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-16 h-2 bg-red-500 rounded-full"></div>
                        <div className="w-16 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="w-16 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div id="student-intervention">
                <FailingStudentRecommendations />
              </div>

              {/* Average Performance by Assessment Type Bar Graph */}
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Average Performance by Assessment Type
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Class average performance across different types of assessments and attendance
                </p>
                
                <div className="h-80 min-h-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart
                      data={analyticsData.assessmentTypeBarData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="type" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        label={{ value: 'Average Performance (%)', angle: -90, position: 'insideLeft' }}
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip content={<AssessmentTypeBarTooltip />} />
                      <Bar 
                        dataKey="average" 
                        name="Average Performance"
                        radius={[4, 4, 0, 0]}
                      >
                        {analyticsData.assessmentTypeBarData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {analyticsData.assessmentTypeBarData.map((item, index) => (
                    <div key={index} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-700 text-sm">{item.type}</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                          {item.students} students
                        </span>
                      </div>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold text-[#465746]">{item.average}%</span>
                        <span className="text-xs text-gray-500 ml-1">average</span>
                      </div>
                      <div className="mt-2 flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full"
                            style={{ 
                              width: `${item.average}%`,
                              backgroundColor: item.color || COLORS[index % COLORS.length]
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Insights & Recommendations:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analyticsData.assessmentTypeBarData
                      .filter(item => item.average < 70)
                      .map((item, index) => (
                        <div key={index} className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
                            ></div>
                            <h5 className="font-medium text-amber-800">{item.type} Needs Attention</h5>
                          </div>
                          <p className="text-sm text-amber-700 mb-2">
                            Average score of {item.average}% is below the 70% threshold.
                          </p>
                          <ul className="text-xs text-amber-600 list-disc pl-4 space-y-1">
                            <li>Review difficulty level of {item.type.toLowerCase()} assessments</li>
                            <li>Consider providing additional resources for {item.type.toLowerCase()}</li>
                            <li>Schedule review sessions focusing on {item.type.toLowerCase()} topics</li>
                            <li>Analyze individual student performance in this category</li>
                          </ul>
                        </div>
                      ))}
                    
                    {analyticsData.assessmentTypeBarData
                      .filter(item => item.average >= 90)
                      .map((item, index) => (
                        <div key={index} className="bg-green-50 border border-green-100 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
                            ></div>
                            <h5 className="font-medium text-green-800">{item.type} Strength</h5>
                          </div>
                          <p className="text-sm text-green-700 mb-2">
                            Excellent average score of {item.average}% in this category.
                          </p>
                          <ul className="text-xs text-green-600 list-disc pl-4 space-y-1">
                            <li>Students are performing well in {item.type.toLowerCase()}</li>
                            <li>Consider maintaining current teaching methods for this category</li>
                            <li>Use successful strategies from this category in other areas</li>
                          </ul>
                        </div>
                      ))}
                  </div>
                  
                  {analyticsData.assessmentTypeBarData
                    .filter(item => item.type === 'Attendance' && item.average < 85)
                    .map((item, index) => (
                      <div key={index} className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: item.color || COLORS[5 % COLORS.length] }}
                          ></div>
                          <h5 className="font-medium text-blue-800">Attendance Analysis</h5>
                        </div>
                        <p className="text-sm text-blue-700 mb-2">
                          Attendance rate of {item.average}% suggests potential room for improvement.
                        </p>
                        <ul className="text-xs text-blue-600 list-disc pl-4 space-y-1">
                          <li>Monitor attendance patterns for specific days/times</li>
                          <li>Consider implementing attendance incentives</li>
                          <li>Review correlation between attendance and academic performance</li>
                          <li>Address chronic absenteeism with early interventions</li>
                        </ul>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      Student Performance Across Activities
                    </h3>
                    <p className="text-sm text-gray-500">Individual student scores on each class activity (Student IDs displayed)</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <span className="text-sm text-gray-600">Filter by:</span>
                    <select
                      value={selectedActivityType}
                      onChange={(e) => setSelectedActivityType(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00874E] focus:border-transparent bg-white"
                    >
                      <option value="All">All Types</option>
                      {ACTIVITY_TYPES.filter(type => type !== 'Attendance').map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="h-96 min-h-0">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <LineChart data={filteredLineChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="activity" 
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        label={{ value: 'Score (%)', angle: -90, position: 'insideLeft' }} 
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      
                      {analyticsData.students.map((student, index) => (
                        <Line
                          key={student.user_ID}
                          type="monotone"
                          dataKey={student.user_ID}
                          name={`Student ${student.user_ID}`}
                          stroke={COLORS[index % COLORS.length]}
                          strokeWidth={1.5}
                          dot={{ r: 2 }}
                          activeDot={{ r: 4 }}
                          connectNulls
                        />
                      ))}
                      
                      {filteredLineChartData.some(d => d['Class Average'] !== undefined) && (
                        <Line
                          type="monotone"
                          dataKey="Class Average"
                          name="Class Average"
                          stroke="#465746"
                          strokeWidth={3}
                          strokeDasharray="5 5"
                          dot={{ r: 5 }}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-[#00874E]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Activity Key: What A1, A2, A3 Represent
                      </h4>
                      
                      {selectedActivityType !== 'All' && (
                        <div className="inline-flex items-center bg-purple-100 text-purple-800 text-xs font-medium px-3 py-1 rounded-full mb-3">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                          </svg>
                          Filtered: Showing only "{selectedActivityType}" activities
                        </div>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-[#465746] rounded mr-2 border-2 border-white"></div>
                        <span>Dashed line = Class Average</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-medium text-gray-700">
                          Activity Details
                        </h5>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                          {filteredLineChartData.length} activities shown
                        </span>
                      </div>
                      
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {analyticsData.activities
                          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                          .slice(0, 8)
                          .map((activity, index) => (
                            <div key={activity.id} className="flex items-start p-2 bg-white rounded border border-gray-200 hover:bg-gray-50">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 flex items-center justify-center bg-[#00874E] text-white text-sm font-bold rounded mr-3">
                                  A{index + 1}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 text-sm truncate" title={activity.title}>
                                  {activity.title}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded">
                                    {activity.activity_type || 'Other'}
                                  </span>
                                  <span className="text-xs text-gray-600">
                                    {activity.points || 0} points
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    • {new Date(activity.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                      
                      {analyticsData.activities.length > 8 && (
                        <p className="text-xs text-gray-500 mt-2 text-center">
                          Showing first 8 of {analyticsData.activities.length} activities
                        </p>
                      )}
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <h5 className="font-medium text-blue-800 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        Understanding the Chart
                      </h5>
                      
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center bg-[#00874E] text-white text-xs font-bold rounded mr-2 mt-0.5">
                            A1
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Activity Sequence</span>
                            <p className="text-xs text-gray-600">
                              <strong>A1, A2, A3</strong> represent activities in the order they were assigned.
                              A1 is the first activity, A2 is the second, etc.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-3 h-3 flex-shrink-0 mt-1 mr-2">
                            <div className="w-full h-full bg-[#465746] border-2 border-white rounded"></div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Class Average</span>
                            <p className="text-xs text-gray-600">
                              Dashed line shows the average score of all students for each activity.
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="w-3 h-3 flex-shrink-0 mt-1 mr-2">
                            <div className="w-full h-full bg-[#00874E] rounded"></div>
                          </div>
                          <div>
                            <span className="text-sm font-medium text-gray-700">Student Lines</span>
                            <p className="text-xs text-gray-600">
                              Each colored line represents one student's performance across all activities.
                              Student IDs are shown instead of names.
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-xs text-blue-700 bg-blue-100 p-3 rounded border border-blue-200">
                          <strong>Tip:</strong> Hover over any point to see the student's ID and exact score percentage.
                          The chart shows all {analyticsData.students.length} students in the class.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Class Performance Distribution
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">Distribution of students across performance levels</p>
                  <div className="h-80 min-h-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <PieChart>
                        <Pie
                          data={analyticsData.pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {analyticsData.pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name, props) => [
                          `${value} student${value !== 1 ? 's' : ''} (${((value / analyticsData.summary.totalStudents) * 100).toFixed(1)}%)`,
                          props.payload.name
                        ]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    {analyticsData.pieChartData.map((range, index) => (
                      <div key={index} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded mr-2"
                          style={{ backgroundColor: range.color }}
                        ></div>
                        <span>{range.name}: {range.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Student Performance Ranking
                      </h3>
                      <p className="text-sm text-gray-500">
                        {barChartSort === 'desc' 
                          ? 'All students ranked from highest to lowest average grade' 
                          : 'All students ranked from lowest to highest average grade'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleBarChartSortChange}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {barChartSort === 'desc' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                          )}
                        </svg>
                        {barChartSort === 'desc' ? 'Highest to Lowest' : 'Lowest to Highest'}
                      </button>
                      <span className="text-sm text-gray-600">
                        {analyticsData.students.length} students
                      </span>
                    </div>
                  </div>
                  <div className="h-80 min-h-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <BarChart data={analyticsData.barChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 11 }}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          label={{ value: 'Student ID', position: 'insideBottom', offset: -10 }}
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          tick={{ fontSize: 12 }}
                          label={{ value: 'Average Grade %', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip content={<BarChartTooltip />} />
                        <Bar 
                          dataKey="grade" 
                          name="Average Grade" 
                          fill={barChartSort === 'desc' ? '#00874E' : '#FF6B6B'} 
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 text-sm text-gray-600 text-center">
                    Showing all {analyticsData.students.length} students sorted by average grade
                    {barChartSort === 'desc' ? ' (highest to lowest)' : ' (lowest to highest)'}
                  </div>
                </div>
              </div>

              {/* Performance by Assessment Type (Detailed View) - Now with Attendance Graph */}
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Performance by Assessment Type (Detailed View)
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Detailed student performance across different assessment types including attendance analysis
                </p>
                
                {/* Attendance Graph Section */}
                <div className="mb-8 bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-700 flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[5 % COLORS.length] }}
                      ></div>
                      Attendance Analysis
                    </h4>
                    <span className="text-sm text-gray-500">
                      {analyticsData.summary.totalAttendanceDays || 0} days tracked
                    </span>
                  </div>
                  
                  <div className="h-64 min-h-0">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <BarChart 
                        data={analyticsData.activityTypeData['Attendance'] || []}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis 
                          dataKey="studentName" 
                          tick={{ fontSize: 10 }}
                          angle={-45}
                          textAnchor="end"
                          height={40}
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          tick={{ fontSize: 10 }}
                          label={{ value: 'Attendance Rate (%)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip 
                          formatter={(value, name, props) => {
                            if (name === 'average') {
                              const fullName = props.payload.fullName || `Student ${props.payload.studentName}`;
                              return [
                                `${value}%`, 
                                `Attendance Rate for ${fullName}`
                              ];
                            }
                            return [value, name];
                          }}
                          labelFormatter={(label) => `Student ID: ${label}`}
                        />
                        <Bar 
                          dataKey="average" 
                          name="Attendance Rate"
                          fill={COLORS[5 % COLORS.length]}
                          radius={[2, 2, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 border border-green-100 rounded p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">High Attendance</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          ≥90%
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-green-700 mt-1">
                        {
                          analyticsData.activityTypeData['Attendance']?.filter(
                            item => item.average >= 90
                          ).length || 0
                        }
                      </p>
                      <p className="text-xs text-green-600 mt-1">students</p>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-100 rounded p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-yellow-800">Moderate</span>
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                          70-89%
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-700 mt-1">
                        {
                          analyticsData.activityTypeData['Attendance']?.filter(
                            item => item.average >= 70 && item.average < 90
                          ).length || 0
                        }
                      </p>
                      <p className="text-xs text-yellow-600 mt-1">students</p>
                    </div>
                    
                    <div className="bg-orange-50 border border-orange-100 rounded p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-orange-800">Low</span>
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                          50-69%
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-orange-700 mt-1">
                        {
                          analyticsData.activityTypeData['Attendance']?.filter(
                            item => item.average >= 50 && item.average < 70
                          ).length || 0
                        }
                      </p>
                      <p className="text-xs text-orange-600 mt-1">students</p>
                    </div>
                    
                    <div className="bg-red-50 border border-red-100 rounded p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-red-800">Critical</span>
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                          {'<'}50%
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-red-700 mt-1">
                        {
                          analyticsData.activityTypeData['Attendance']?.filter(
                            item => item.average < 50
                          ).length || 0
                        }
                      </p>
                      <p className="text-xs text-red-600 mt-1">students</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Attendance Insights:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analyticsData.activityTypeData['Attendance']?.some(item => item.average < 70) && (
                        <div className="bg-amber-50 border border-amber-200 rounded p-3">
                          <div className="flex items-center mb-1">
                            <svg className="w-4 h-4 text-amber-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium text-amber-800">Attendance Concerns</span>
                          </div>
                          <p className="text-xs text-amber-700">
                            {
                              analyticsData.activityTypeData['Attendance']?.filter(
                                item => item.average < 70
                              ).length || 0
                            } students have attendance below 70%. Consider intervention.
                          </p>
                        </div>
                      )}
                      
                      {analyticsData.activityTypeData['Attendance']?.some(item => item.average >= 90) && (
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <div className="flex items-center mb-1">
                            <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium text-green-800">Excellent Attendance</span>
                          </div>
                          <p className="text-xs text-green-700">
                            {
                              analyticsData.activityTypeData['Attendance']?.filter(
                                item => item.average >= 90
                              ).length || 0
                            } students maintain ≥90% attendance.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Other Assessment Types */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ACTIVITY_TYPES.filter(type => type !== 'Attendance').map((type, index) => {
                    const typeData = analyticsData.activityTypeData[type];
                    
                    if (!typeData || typeData.length === 0) {
                      const activityCount = Object.entries(analyticsData.summary.activityTypeDistribution)
                        .find(([t]) => t === type)?.[1] || 0;
                      
                      if (activityCount === 0) return null;
                      
                      return (
                        <div key={type} className="bg-gray-50 rounded-lg p-4 border">
                          <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            {type}
                          </h4>
                          <div className="h-48 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              <p>No graded submissions yet</p>
                              <p className="text-sm mt-1">{activityCount} activity(s) created</p>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={type} className="bg-gray-50 rounded-lg p-4 border hover:bg-white transition-colors">
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          {type}
                          <span className="ml-auto text-xs text-gray-500">
                            {typeData.length} students with grades
                          </span>
                        </h4>
                        <div className="h-48 min-h-0">
                          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                            <BarChart data={typeData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                              <XAxis 
                                dataKey="studentName" 
                                tick={{ fontSize: 10 }}
                                angle={-45}
                                textAnchor="end"
                                height={40}
                              />
                              <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                              <Tooltip 
                                formatter={(value) => [`${value}%`, 'Grade']}
                                labelFormatter={(label) => `Student ID: ${label}`}
                              />
                              <Bar 
                                dataKey="average" 
                                fill={COLORS[index % COLORS.length]}
                                radius={[2, 2, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div className="mt-3 text-xs text-gray-600">
                          <div className="flex justify-between items-center">
                            <span>Average:</span>
                            <span className="font-medium">
                              {Math.round(
                                typeData.reduce((sum, item) => sum + item.average, 0) / typeData.length
                              )}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span>Top performer:</span>
                            <span className="font-medium">
                              {Math.max(...typeData.map(item => item.average))}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            <div className="mt-8">
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="text-gray-500 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready for Analytics</h3>
                  <p className="mb-4 text-gray-600 max-w-md mx-auto">
                    Create activities and grade student submissions to generate comprehensive academic analytics.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to={`/ClassworkTab?code=${subjectCode}`}>
                      <button className="px-6 py-2 bg-[#00874E] text-white rounded hover:bg-[#006e3d] transition-colors">
                        Create Activities
                      </button>
                    </Link>
                    <button 
                      onClick={fetchAnalyticsData}
                      className="px-6 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
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