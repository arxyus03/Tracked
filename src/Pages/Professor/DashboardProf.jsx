import React from 'react'
import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import CalendarWidget from "../../Components/ProfessorComponents/CalendarWidget";
import ClassRanking from "../../Components/ProfessorComponents/ClassRanking";
import HandledSubjectCard from "../../Components/ProfessorComponents/HandledSubjectCard";

import Dashboard from '../../assets/Dashboard.svg';
import ClassHandled from '../../assets/ClassHandled.svg';
import ActivitiesToGrade from '../../assets/ActivitiesToGrade.svg';
import ID from '../../assets/ID.svg';
import Pie from '../../assets/Pie.svg';
import Details from '../../assets/Details.svg';
import Archive from '../../assets/ArchiveBox.svg';
import AlertIcon from '../../assets/TrackEd.svg'; // Keep this for the icon
import CrossIcon from '../../assets/Cross.svg'; // Changed from CloseIcon to CrossIcon

export default function DashboardProf() {
  const [isOpen, setIsOpen] = useState(true);
  const [userName, setUserName] = useState("Professor");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [handledSubjects, setHandledSubjects] = useState([]);
  const [handledSubjectsCount, setHandledSubjectsCount] = useState(0);
  const [classesCount, setClassesCount] = useState(0);
  const [activitiesCount, setActivitiesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  
  // Alert states
  const [showAttendanceAlert, setShowAttendanceAlert] = useState(false);
  const [subjectsNeedingAttendance, setSubjectsNeedingAttendance] = useState([]);
  const [todayDate, setTodayDate] = useState("");
  const [currentSubjectIndex, setCurrentSubjectIndex] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          
          const userIdFromStorage = user.id;
          
          if (userIdFromStorage) {
            setUserId(userIdFromStorage);
            
            const response = await fetch(`https://tracked.6minds.site/Professor/DashboardProfDB/get_class_count.php?id=${userIdFromStorage}`);
            
            if (response.ok) {
              const data = await response.json();
              
              if (data.success) {
                setUserData(data.user);
                const fullName = `${data.user.tracked_firstname} ${data.user.tracked_lastname}`;
                setUserName(fullName);
                
                setUserEmail(data.user.tracked_email);
                
                await fetchClasses(userIdFromStorage);
                await fetchActivitiesCount(userIdFromStorage);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    // Set today's date for display
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setTodayDate(today.toLocaleDateString('en-US', options));
    
    // Check for attendance alert after subjects are loaded
    if (handledSubjects.length > 0) {
      checkAttendanceAlert();
    }
  }, [handledSubjects]);

  const fetchClasses = async (professorId) => {
    try {
      if (!professorId) {
        setHandledSubjects([]);
        setHandledSubjectsCount(0);
        setClassesCount(0);
        return;
      }
      
      const response = await fetch(`https://tracked.6minds.site/Professor/ClassManagementDB/get_classes.php?professor_ID=${professorId}`);
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.classes) {
          const classes = result.classes;
          
          const subjectsWithStats = classes.map(classItem => {
            const completionRate = Math.floor(Math.random() * 36) + 60;
            const totalActivities = Math.floor(Math.random() * 15) + 5;
            const completedActivities = Math.floor((completionRate / 100) * totalActivities);
            
            return {
              subject: classItem.subject,
              subjectCode: classItem.subject_code,
              completionRate: completionRate,
              completed: completedActivities,
              total: totalActivities,
              section: classItem.section,
              year_level: classItem.year_level,
              subject_semester: classItem.subject_semester || "",
              // Add additional class info for attendance checking
              classSchedule: classItem.schedule || "No schedule",
              classDays: classItem.days || "MWF"
            };
          });
          
          setHandledSubjects(subjectsWithStats);
          setHandledSubjectsCount(subjectsWithStats.length);
          setClassesCount(subjectsWithStats.length);
        } else {
          setHandledSubjects([]);
          setHandledSubjectsCount(0);
          setClassesCount(0);
        }
      } else {
        throw new Error('Failed to fetch classes');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      setHandledSubjects([]);
      setHandledSubjectsCount(0);
      setClassesCount(0);
    }
  };

  const fetchActivitiesCount = async (professorId) => {
    try {
      const response = await fetch(`https://tracked.6minds.site/Professor/DashboardProfDB/get_activities_count.php?professor_id=${professorId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setActivitiesCount(data.total_activities);
        }
      }
    } catch (error) {
      console.error("Error fetching activities count:", error);
    }
  };

  const checkAttendanceAlert = async () => {
    try {
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentDayName = dayNames[dayOfWeek];
      
      // Show all subjects in the alert
      setSubjectsNeedingAttendance(handledSubjects);
      setCurrentSubjectIndex(0);
      
      // Always show alert if there are subjects
      // Removed localStorage dismissal check
      if (handledSubjects.length > 0) {
        setShowAttendanceAlert(true);
      }
    } catch (error) {
      console.error("Error checking attendance alert:", error);
    }
  };

  const dismissAlert = () => {
    // Only hide temporarily, will show again on next check
    setShowAttendanceAlert(false);
  };

  const showNextSubject = () => {
    if (subjectsNeedingAttendance.length > 1) {
      // Cycle to the next subject
      setCurrentSubjectIndex((prevIndex) => 
        (prevIndex + 1) % subjectsNeedingAttendance.length
      );
    }
  };

  const getBorderColor = (percentage) => {
    if (percentage < 75) return 'border-[#A15353] border-2';
    if (percentage >= 75 && percentage <= 85) return 'border-[#FFA600] border-2';
    return 'border-transparent border-2';
  };

  const getTextColor = (percentage) => {
    if (percentage < 75) return 'text-[#A15353]';
    if (percentage >= 75 && percentage <= 85) return 'text-[#FFA600]';
    return 'text-white';
  };

  const sortedSubjects = [...handledSubjects].sort((a, b) => {
    const getPriority = (percentage) => {
      if (percentage < 75) return 3;
      if (percentage <= 85) return 2;
      return 1;
    };
    return getPriority(b.completionRate) - getPriority(a.completionRate);
  });

  const hasCriticalSubjects = handledSubjects.some(subject => subject.completionRate < 75);
  const hasWarningSubjects = handledSubjects.some(subject => subject.completionRate >= 75 && subject.completionRate <= 85);

  if (loading) {
    return (
      <div className="bg-[#23232C] min-h-screen">
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`
          transition-all duration-300
          ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
        `}>
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
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName={userName} />

        <div className="p-3 sm:p-4 md:p-5 text-white">
          <div className="mb-3">
            <div className="flex items-center mb-1">
              <img src={Dashboard} alt="Dashboard" className="h-5 w-5 mr-2" />
              <h1 className="font-bold text-lg text-white">Dashboard</h1>
            </div>
            <div className="text-sm text-white/80">
              <span>Welcome back,</span>
              <span className="font-bold ml-1 mr-1 text-white">{userName}!</span>
              <span>Let's see how your students are doing.</span>
            </div>
          </div>

          <hr className="border-white/30 mb-4 border-1" />

          {/* Compact Attendance Alert Notification - Always shows if there are subjects */}
          {showAttendanceAlert && subjectsNeedingAttendance.length > 0 && (
            <div className="mb-3 bg-[#00A15D]/20 rounded-lg p-2 relative border border-[#00A15D]/50">
              <div className="flex items-start">
                <div className="mr-1.5 mt-0.5">
                  <img src={AlertIcon} alt="Alert" className="h-3.5 w-3.5" />
                </div>
                
                <div className="flex-1">
                  {/* Header with date text on the right */}
                  <div className="flex justify-between items-start mb-0.5">
                    <div className="flex items-center">
                      <h3 className="font-bold text-white text-xs mr-1.5">
                        Attendance Reminder
                      </h3>
                      <span className="text-[9px] bg-[#00A15D] text-white px-1 py-0.5 rounded-full">
                        Today
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <p className="text-[10px] text-white/80 mr-2 leading-tight">
                        Record attendance for {todayDate}
                      </p>
                      <button 
                        onClick={dismissAlert}
                        className="text-white/60 hover:text-white transition-colors p-0.5"
                      >
                        <img src={CrossIcon} alt="Close" className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Compact subject display */}
                  <div className="bg-[#23232C]/60 rounded p-1 mb-1 mt-1.5">
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0 pr-1">
                        <p className="font-medium text-white text-xs truncate leading-tight mb-0.5">
                          {subjectsNeedingAttendance[currentSubjectIndex]?.subject}
                        </p>
                        <p className="text-[10px] text-white/60 truncate leading-tight">
                          Sec: {subjectsNeedingAttendance[currentSubjectIndex]?.section} • {subjectsNeedingAttendance[currentSubjectIndex]?.subjectCode}
                        </p>
                      </div>
                      <Link 
                        to={`/Attendance?code=${subjectsNeedingAttendance[currentSubjectIndex]?.subjectCode}`}
                        className="flex-shrink-0"
                      >
                        <button className="bg-[#00A15D] hover:bg-[#008F4F] text-white font-medium text-[10px] px-1.5 py-0.5 rounded transition-colors whitespace-nowrap">
                          Record Attendance
                        </button>
                      </Link>
                    </div>
                  </div>
                  
                  {/* Show clickable count of remaining subjects if there are more */}
                  {subjectsNeedingAttendance.length > 1 && (
                    <div className="mb-0.5">
                      <button 
                        onClick={showNextSubject}
                        className="text-[10px] text-white/60 hover:text-white/80 transition-colors underline"
                      >
                        + {subjectsNeedingAttendance.length - 1} more
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mb-6">
            {/* Handled Subjects Section */}
            <div className="lg:col-span-3 bg-[#15151C] rounded-lg shadow p-3 border-2 border-[#15151C]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold flex items-center text-white">
                  <img src={ClassHandled} alt="Subjects" className="h-4 w-4 mr-1" />
                  Handled Subjects
                </h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {sortedSubjects.length > 0 ? (
                  sortedSubjects.map((subject, index) => (
                    <HandledSubjectCard 
                      key={index} 
                      subject={subject}
                      getBorderColor={getBorderColor}
                      getTextColor={getTextColor}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-6">
                    <p className="text-white/50 text-sm">No subjects assigned</p>
                  </div>
                )}
              </div>
              
              {/* Legend */}
              {(hasCriticalSubjects || hasWarningSubjects) && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex flex-wrap gap-3 text-[10px] text-white/60">
                    {hasCriticalSubjects && (
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded border-2 border-[#A15353]"></div>
                        <span>Low (&lt;75%)</span>
                      </div>
                    )}
                    
                    {hasWarningSubjects && (
                      <div className="flex items-center gap-1">
                        <div className="h-3 w-3 rounded border-2 border-[#FFA600]"></div>
                        <span>Average (75-85%)</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded border-2 border-transparent bg-[#23232C]"></div>
                      <span>Good (&gt;85%)</span>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Widgets Section */}
            <div className="lg:col-span-2 space-y-4">
              <div className='bg-[#15151C] rounded-lg p-3 text-white shadow-md border-2 border-[#15151C] h-32'> 
                <div className='font-bold text-sm h-full flex flex-col'>
                  <h1 className='mb-1'> Class Handled </h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#767EE0]/50 h-10 w-10 rounded-lg'>
                      <img src={ClassHandled} alt="ClassHandled" className="h-5 w-5" />
                    </div>
                    <p className='pt-2 text-xl'>{classesCount}</p>
                  </div>
                </div>
              </div>

              <div className='bg-[#15151C] rounded-lg p-3 text-white shadow-md border-2 border-[#15151C] h-32'> 
                <div className='font-bold text-sm h-full flex flex-col'>
                  <h1 className='mb-1'> Activities to Grade </h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#A15353]/50 h-10 w-10 rounded-lg'>
                      <img src={ActivitiesToGrade} alt="ActivitiesToGrade" className="h-5 w-5" />
                    </div>
                    <p className='pt-2 text-xl'>{activitiesCount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Calendar Widget */}
            <div className="lg:col-span-1">
              <CalendarWidget professorId={userId} />
            </div>
          </div>

          {/* Class Ranking */}
          <div className="mb-4">
            <ClassRanking />
          </div>

          {/* Prof Information Card */}
          <div className="bg-[#15151C] text-white text-sm rounded-lg shadow-md mt-4 p-3 border-2 border-[#15151C]">
            <div className="flex items-center">
              <img src={ID} alt="ID" className="h-4 w-4 mr-2" />
              <p className="font-bold text-sm">{userName}</p>
            </div>

            <hr className="opacity-60 border-white/30 rounded border-1 my-2" />

            <div className="pl-4 space-y-1">
              <div className="flex flex-col">
                <span className="font-bold text-xs w-full mb-1 text-white/70">Faculty Number:</span>
                <span className="text-xs">{userId || "N/A"}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs w-full mb-1 text-white/70">CvSU Email:</span>
                <span className="text-xs break-all">{userEmail || "N/A"}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs w-full mb-1 text-white/70">Handled Subjects:</span>
                <span className="text-xs">{handledSubjectsCount || 0} subjects</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs w-full mb-1 text-white/70">Department:</span>
                <span className="text-xs">{userData?.tracked_program || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Student Attendance Details Card */}
          <Link to={"/AnalyticsProf"}>
            <div className="bg-[#15151C] text-white text-sm rounded-lg shadow-md mt-3 p-2 border-2 border-transparent hover:border-[#00A15D] transition-all duration-200">
              <div className="flex items-center">
                <img src={Pie} alt="Pie" className="h-5 w-5 mr-2" />
                <p className="font-bold text-sm flex-1">Student Attendance Details</p>
                <img src={Details} alt="Details" className="h-5 w-5 ml-2" />
              </div>
            </div>
          </Link>

          {/* Archive Subjects Card */}
          <Link to={"/ArchiveClass"}>
            <div className="bg-[#15151C] text-white text-sm rounded-lg shadow-md mt-3 p-2 border-2 border-transparent hover:border-[#00A15D] transition-all duration-200">
              <div className="flex items-center">
                <img src={Archive} alt="Archive" className="h-5 w-5 mr-2" />
                <p className="font-bold text-sm flex-1">Archive Subjects</p>
                <img src={Details} alt="Details" className="h-5 w-5 ml-2" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}