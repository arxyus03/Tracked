import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CalendarIcon from '../../assets/Calendar.svg';

const CalendarWidget = ({ professorId, isDarkMode = false }) => {
  // Calendar states
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayAbsences, setSelectedDayAbsences] = useState([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarDays, setCalendarDays] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [monthlyAbsenceRate, setMonthlyAbsenceRate] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [isSectionSelected, setIsSectionSelected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [calendarData, setCalendarData] = useState({});
  const [studentData, setStudentData] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]); // Store all subjects for dropdown
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    if (professorId) {
      generateCalendarData();
      fetchAvailableSubjects();
    }
  }, [professorId, currentMonth, currentYear]);

  // Fetch available subjects with all their sections
  const fetchAvailableSubjects = async () => {
    try {
      console.log("Fetching subjects for professor:", professorId);
      const response = await fetch(
        `https://tracked.6minds.site/Professor/DashboardProfDB/get_calendar_attendance.php?professor_ID=${professorId}`
      );
      
      if (response.ok) {
        const result = await response.json();
        console.log("Subjects API response:", result);
        if (result.success && result.subjects) {
          // Subjects are grouped by subject name with sections array
          setAllSubjects(result.subjects);
          setDebugInfo(`Loaded ${result.subjects.length} subjects`);
        } else {
          setDebugInfo(`Failed to load subjects: ${result.message || 'Unknown error'}`);
        }
      } else {
        setDebugInfo(`Failed to fetch subjects: HTTP ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setDebugInfo(`Error fetching subjects: ${error.message}`);
    }
  };

  // Generate calendar data - show all dates, color only days with absent/late
  const generateCalendarData = async () => {
    try {
      const today = new Date();
      const currentMonthDays = new Date(currentYear, currentMonth + 1, 0).getDate();
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
      
      const daysArray = [];

      // Add empty cells for days before the first day of month
      for (let i = 0; i < firstDayOfMonth; i++) {
        daysArray.push({
          dayNumber: null,
          isDay: false
        });
      }

      // Get today's date in YYYY-MM-DD format for comparison
      const todayStr = today.toISOString().split('T')[0];
      
      let totalDaysWithAbsences = 0;
      let totalDays = 0;

      // Create days for the current month
      for (let day = 1; day <= currentMonthDays; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dateObj = new Date(dateStr);
        
        // Get day of week (0 = Sunday, 1 = Monday, etc.)
        const dayOfWeek = dateObj.getDay();
        
        // Get absence data for this day (only absent/late)
        const absenceData = await fetchDayAbsences(dateStr);
        
        console.log(`Date: ${dateStr}, Day of week: ${dayOfWeek}, Absence data count: ${absenceData.length}`);
        
        // Determine day status based on absences/lates
        let dayStatus = 'normal'; // default to normal (no color)
        const hasAbsences = absenceData.some(a => a.status === 'absent');
        const hasLates = absenceData.some(a => a.status === 'late');
        
        if (hasAbsences) {
          dayStatus = 'absent'; // Red if any absences
        } else if (hasLates) {
          dayStatus = 'late'; // Yellow if only lates (no absences)
        }
        
        // Count only weekdays for absence rate
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
          totalDays++;
          if (hasAbsences || hasLates) {
            totalDaysWithAbsences++;
          }
        }

        daysArray.push({
          date: dateStr,
          dayNumber: day,
          dayOfWeek,
          status: dayStatus,
          absences: absenceData,
          isToday: dateStr === todayStr,
          isFuture: dateObj > today,
          isDay: true,
          hasIssues: hasAbsences || hasLates
        });
      }

      // Calculate monthly absence rate
      if (totalDays > 0) {
        const absenceRate = Math.round((totalDaysWithAbsences / totalDays) * 100);
        setMonthlyAbsenceRate(absenceRate);
      }

      // Fill remaining cells to complete 6 weeks (42 cells)
      while (daysArray.length < 42) {
        daysArray.push({
          dayNumber: null,
          isDay: false
        });
      }

      console.log(`Generated calendar with ${daysArray.length} cells`);
      console.log(`First day position: ${firstDayOfMonth}`);
      console.log(`Days in month: ${currentMonthDays}`);
      
      // Debug: Log the position of specific days
      const jan6Index = daysArray.findIndex(day => day.date === '2026-01-06');
      console.log(`January 6th position in array: ${jan6Index}`);
      
      // Debug grid layout
      console.log('Calendar Grid Layout:');
      for (let week = 0; week < 6; week++) {
        let weekStr = 'Week ' + (week + 1) + ': ';
        for (let day = 0; day < 7; day++) {
          const index = week * 7 + day;
          const dayData = daysArray[index];
          if (dayData && dayData.isDay) {
            weekStr += `${dayData.dayNumber}(${dayData.status.charAt(0)}) `;
          } else {
            weekStr += '--- ';
          }
        }
        console.log(weekStr);
      }
      
      setCalendarDays(daysArray);
      setDebugInfo(prev => `${prev} | Generated calendar for ${currentMonth+1}/${currentYear} - ${totalDaysWithAbsences}/${totalDays} days with issues`);
    } catch (error) {
      console.error("Error generating calendar data:", error);
      setDebugInfo(`Error generating calendar: ${error.message}`);
    }
  };

  // Fetch attendance data for a specific day (only absent/late)
  const fetchDayAbsences = async (date) => {
    try {
      console.log("Fetching day absences for date:", date);
      const response = await fetch(
        `https://tracked.6minds.site/Professor/DashboardProfDB/get_calendar_attendance.php?professor_ID=${professorId}&date=${date}&get_attendance_only=1`
      );
      
      if (response.ok) {
        const result = await response.json();
        console.log("Day absences API response for", date, ":", result);
        if (result.success) {
          return result.attendance || [];
        } else {
          console.error("API returned error:", result.message);
          return [];
        }
      } else {
        console.error("Failed to fetch day absences: HTTP", response.status);
        return [];
      }
    } catch (error) {
      console.error("Error fetching day absences:", error);
      return [];
    }
  };

  // Handle day click
  const handleDayClick = async (day) => {
    if (!day.isDay || day.isFuture) return;
    
    console.log("Day clicked:", day.date, "Status:", day.status, "Absences:", day.absences);
    setLoading(true);
    try {
      const response = await fetch(
        `https://tracked.6minds.site/Professor/DashboardProfDB/get_calendar_attendance.php?professor_ID=${professorId}&date=${day.date}&get_attendance_only=1`
      );
      
      if (response.ok) {
        const result = await response.json();
        console.log("Day click API response:", result);
        if (result.success) {
          setSelectedDate(day);
          setSelectedDayAbsences(result.attendance || []);
          setMonthlyAbsenceRate(result.monthly_absence_rate || 0);
          
          // Group attendance by subject name for the dropdown (only subjects with issues on this day)
          const subjectsWithIssues = {};
          result.attendance?.forEach(attendance => {
            const subjectName = attendance.subject;
            
            if (!subjectsWithIssues[subjectName]) {
              subjectsWithIssues[subjectName] = {
                subject_name: subjectName,
                sections: {}
              };
            }
            if (!subjectsWithIssues[subjectName].sections[attendance.section]) {
              subjectsWithIssues[subjectName].sections[attendance.section] = {
                section: attendance.section,
                students: []
              };
            }
            subjectsWithIssues[subjectName].sections[attendance.section].students.push(attendance);
          });
          
          setCalendarData(subjectsWithIssues);
          
          // Use ALL subjects for dropdown, not just those with issues
          setAvailableSubjects(allSubjects);
          setIsCalendarOpen(true);
          
          setDebugInfo(prev => `${prev} | Clicked ${day.date}: ${result.attendance?.length || 0} absences found`);
        } else {
          console.error("API returned error:", result.message);
          setDebugInfo(`API error: ${result.message}`);
        }
      }
    } catch (error) {
      console.error("Error fetching attendance details:", error);
      setDebugInfo(`Error: ${error.message}`);
    } finally {
      setLoading(false);
      // Reset selections
      setSelectedSubject('');
      setSelectedSection('');
      setIsSectionSelected(false);
      setAvailableSections([]);
      setStudentData([]);
    }
  };

  // Handle subject change - show ALL sections for the selected subject name
  const handleSubjectChange = async (subjectName) => {
    console.log("Subject changed to:", subjectName);
    setSelectedSubject(subjectName);
    setSelectedSection('');
    setIsSectionSelected(false);
    setStudentData([]);
    
    if (subjectName) {
      // Find the selected subject from allSubjects
      const selectedSubjectData = allSubjects.find(subject => subject.subject_name === subjectName);
      
      if (selectedSubjectData) {
        // Show ALL sections for this subject name from the grouped data
        setAvailableSections(selectedSubjectData.sections || []);
        
        // If we have attendance data for this day, prepare it
        if (calendarData[subjectName]) {
          console.log("Found existing data for subject:", subjectName);
        } else {
          console.log("No attendance data for subject today:", subjectName);
          // No attendance data for this subject today - will show "no absent/late students"
          setCalendarData(prev => ({
            ...prev,
            [subjectName]: {
              subject_name: subjectName,
              sections: {}
            }
          }));
        }
        
        setDebugInfo(`Selected subject: ${subjectName} with ${selectedSubjectData.sections.length} sections`);
      } else {
        console.error("Subject not found in allSubjects:", subjectName);
        setDebugInfo(`Subject not found: ${subjectName}`);
      }
    } else {
      setAvailableSections([]);
    }
  };

  // Handle section click
  const handleSectionClick = async (section) => {
    console.log("Section clicked:", section, "for subject:", selectedSubject);
    setSelectedSection(section);
    setIsSectionSelected(true);
    
    // Fetch attendance data for this specific subject name and section
    setLoading(true);
    try {
      const url = new URL('https://tracked.6minds.site/Professor/DashboardProfDB/get_calendar_attendance.php');
      url.searchParams.append('professor_ID', professorId);
      url.searchParams.append('date', selectedDate?.date);
      url.searchParams.append('subject_name', selectedSubject);
      url.searchParams.append('section', section);
      url.searchParams.append('get_attendance_only', '1');
      
      console.log("Fetching URL:", url.toString());
      
      const response = await fetch(url.toString());
      
      if (response.ok) {
        const result = await response.json();
        console.log("Section click API response:", result);
        if (result.success) {
          setStudentData(result.students || []);
          setDebugInfo(`Loaded ${result.students?.length || 0} students for ${selectedSubject} - Section ${section}`);
        } else {
          console.error("API returned error:", result.message);
          setStudentData([]);
          setDebugInfo(`API error: ${result.message}`);
        }
      } else {
        console.error("Failed to fetch section attendance: HTTP", response.status);
        setStudentData([]);
        setDebugInfo(`HTTP error: ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching section attendance:", error);
      setStudentData([]);
      setDebugInfo(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Get status color for calendar day
  const getStatusColor = (status, isFuture) => {
    if (isFuture) {
      return isDarkMode ? 'bg-transparent border-white/10 text-white/30' : 'bg-transparent border-gray-300 text-gray-300';
    }
    
    switch (status) {
      case 'absent': 
        return 'bg-[#A15353] border-[#A15353] text-white';
      case 'late': 
        return 'bg-[#FFA600] border-[#FFA600] text-white';
      case 'normal': 
      default:
        return isDarkMode ? 'bg-transparent border-white/20 text-white/70 hover:bg-white/5' : 'bg-transparent border-gray-300 text-gray-600 hover:bg-gray-100';
    }
  };

  // Get text color for day number
  const getTextColor = (status, isFuture) => {
    if (isFuture) {
      return isDarkMode ? 'text-white/30' : 'text-gray-300';
    }
    
    switch (status) {
      case 'absent': 
      case 'late': 
        return 'text-white';
      case 'normal': 
      default:
        return isDarkMode ? 'text-white/70' : 'text-gray-600';
    }
  };

  // Get status badge color and text
  const getStudentStatusBadge = (status) => {
    switch (status) {
      case 'absent':
        return {
          bgColor: isDarkMode ? 'bg-[#A15353]/20' : 'bg-[#A15353]/10',
          textColor: 'text-[#FF8A8A]',
          borderColor: 'border-[#A15353]',
          text: 'Absent'
        };
      case 'late':
        return {
          bgColor: isDarkMode ? 'bg-[#FFA600]/20' : 'bg-[#FFA600]/10',
          textColor: 'text-[#FFA600]',
          borderColor: 'border-[#FFA600]',
          text: 'Late'
        };
      default:
        return {
          bgColor: isDarkMode ? 'bg-gray-500/20' : 'bg-gray-500/10',
          textColor: isDarkMode ? 'text-gray-400' : 'text-gray-500',
          borderColor: isDarkMode ? 'border-gray-500' : 'border-gray-400',
          text: 'Present'
        };
    }
  };

  // Get counts by status for the selected subject and section
  const getStatusCounts = () => {
    if (studentData.length === 0) {
      return { absent: 0, late: 0, total: 0 };
    }
    
    const absent = studentData.filter(s => s.status === 'absent').length;
    const late = studentData.filter(s => s.status === 'late').length;
    
    return {
      absent,
      late,
      total: studentData.length
    };
  };

  // Get student count for each section
  const getSectionStudentCount = (section) => {
    if (!selectedSubject || !calendarData[selectedSubject]) {
      return 0;
    }
    
    const sectionData = calendarData[selectedSubject].sections[section];
    return sectionData ? (sectionData.students ? sectionData.students.length : 0) : 0;
  };

  // Get month name
  const getMonthName = () => {
    const date = new Date(currentYear, currentMonth, 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navigate to next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Format date to display
  const formatDateDisplay = (dateString) => {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Format student name
  const formatStudentName = (student) => {
    return `${student.tracked_firstname} ${student.tracked_lastname}`;
  };

  // Get subject display name with sections count
  const getSubjectDisplayName = (subject) => {
    return `${subject.subject_name} (${subject.sections.length} section${subject.sections.length !== 1 ? 's' : ''})`;
  };

  // Refresh calendar data
  const refreshCalendar = () => {
    generateCalendarData();
    fetchAvailableSubjects();
  };

  // Theme-based colors
  const getCardBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getCardBorderColor = () => {
    return isDarkMode ? "border-[#15151C]" : "border-gray-200";
  };

  const getSecondaryTextColor = () => {
    return isDarkMode ? "text-white/50" : "text-gray-600";
  };

  const getModalBackgroundColor = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-white";
  };

  const getModalBorderColor = () => {
    return isDarkMode ? "border-white/10" : "border-gray-200";
  };

  const getInputBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-gray-50";
  };

  const getInputBorderColor = () => {
    return isDarkMode ? "border-white/10" : "border-gray-300";
  };

  const getHoverBackgroundColor = () => {
    return isDarkMode ? "hover:bg-white/10" : "hover:bg-gray-100";
  };

  const getSectionButtonColor = (isSelected) => {
    if (isSelected) {
      return 'bg-[#767EE0] text-white';
    }
    return isDarkMode ? 'bg-[#15151C] text-white/70 hover:bg-[#1E1E24]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  };

  const getCloseButtonColor = () => {
    return isDarkMode ? 'bg-[#15151C] text-white hover:bg-[#1E1E24]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  };

  return (
    <>
      {/* Attendance Calendar */}
      <div className={`rounded-lg shadow p-3 border-2 ${getCardBorderColor()} ${getCardBackgroundColor()}`}>
        <div className="flex flex-col h-full">
          {/* Header with month and navigation */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="flex justify-center items-center h-6 w-6 rounded mr-1.5">
                  <img src={CalendarIcon} alt="Calendar" className="h-4 w-4" style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }} />
                </div>
                <div>
                  <h2 className={`font-bold text-xs mb-0.5 ${getTextColor()}`}>Attendance</h2>
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={goToPreviousMonth}
                      className={`p-0.5 rounded ${getHoverBackgroundColor()} transition-colors`}
                      aria-label="Previous month"
                    >
                      <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div className="text-center flex-1 mx-0.5">
                      <p className={`text-[10px] ${getSecondaryTextColor()}`}>{getMonthName()} {currentYear}</p>
                    </div>
                    <button 
                      onClick={goToNextMonth}
                      className={`p-0.5 rounded ${getHoverBackgroundColor()} transition-colors`}
                      aria-label="Next month"
                    >
                      <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <button 
                onClick={refreshCalendar}
                className={`p-1 rounded ${getHoverBackgroundColor()}`}
                title="Refresh calendar"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            
            {/* Absence rate */}
            <div className="text-center mb-2">
              <p className={`text-[10px] mb-0.5 ${getSecondaryTextColor()}`}>Absence Rate</p>
              <div className="flex items-baseline justify-center">
                <p className={`text-xl font-bold ${getTextColor()}`}>{monthlyAbsenceRate}</p>
                <p className={`text-base font-bold ${getTextColor()} ml-0.5`}>%</p>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="mb-3">
              <div className={`w-full rounded-full h-1 ${isDarkMode ? 'bg-[#767EE0]/20' : 'bg-[#767EE0]/10'}`}>
                <div 
                  className="bg-[#767EE0] h-1 rounded-full"
                  style={{ width: `${monthlyAbsenceRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Compact Calendar Grid */}
          <div className="mb-3 flex-grow">
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={index} className="text-center">
                  <p className={`text-[8px] ${getSecondaryTextColor()}`}>{day}</p>
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
                        ${getStatusColor(day.status, day.isFuture)}
                        ${day.isToday ? (isDarkMode ? 'ring-0.5 ring-white ring-offset-0.5 ring-offset-[#15151C]' : 'ring-0.5 ring-gray-300 ring-offset-0.5 ring-offset-white') : ''}
                        ${day.isFuture ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 transition-transform cursor-pointer'}
                        flex items-center justify-center
                      `}
                      style={{
                        borderColor: day.status === 'normal' && !day.isFuture ? (isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)') : undefined
                      }}
                      title={`${day.date} - ${day.status === 'absent' ? 'Absent' : day.status === 'late' ? 'Late' : 'No issues'}`}
                    >
                      <span className={`font-medium ${getTextColor(day.status, day.isFuture)}`}>
                        {day.dayNumber}
                      </span>
                    </button>
                  ) : (
                    <div className="h-3 w-3"></div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="flex justify-center items-center gap-2 mt-3 text-[6px]">
              <div className="flex items-center gap-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-[#A15353]"></div>
                <span className={getSecondaryTextColor()}>Absent</span>
              </div>
              <div className="flex items-center gap-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-[#FFA600]"></div>
                <span className={getSecondaryTextColor()}>Late</span>
              </div>
              <div className="flex items-center gap-0.5">
                <div className="h-1.5 w-1.5 rounded-full border border-white/20 bg-transparent"></div>
                <span className={getSecondaryTextColor()}>No Issues</span>
              </div>
            </div>
            
            {/* Debug info (hidden in production) */}
            <div className="mt-2 text-center">
              <p className={`text-[6px] truncate ${isDarkMode ? 'text-white/30' : 'text-gray-400'}`} title={debugInfo}>
                {professorId ? `Prof ID: ${professorId}` : 'No professor ID'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Absence Details Modal */}
      {isCalendarOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-3">
          <div className={`rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-hidden border-2 ${getModalBorderColor()} ${getModalBackgroundColor()}`}>
            {/* Modal header */}
            <div className={`p-3 border-b ${getModalBorderColor()}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <img src={CalendarIcon} alt="Calendar" className="h-4 w-4 mr-2" style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }} />
                  <div>
                    <h3 className={`font-bold text-sm ${getTextColor()}`}>
                      Attendance on {formatDateDisplay(selectedDate?.date)}
                    </h3>
                    <div className={`flex items-center gap-1 text-[10px] ${getSecondaryTextColor()}`}>
                      <span>{selectedDayAbsences.length} student(s) absent/late</span>
                      <span>•</span>
                      <span>Monthly Absence Rate: {monthlyAbsenceRate}%</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsCalendarOpen(false)}
                  className={`p-1 rounded ${getHoverBackgroundColor()}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Loading indicator */}
              {loading && (
                <div className="text-center py-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#767EE0] mx-auto"></div>
                  <p className={`text-sm ${getSecondaryTextColor()}`}>Loading attendance data...</p>
                </div>
              )}
              
              {/* Subject Filter Dropdown */}
              <div className="mb-3">
                <label className={`block text-xs mb-1.5 ${getSecondaryTextColor()}`}>Select Subject:</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  disabled={loading}
                  className={`w-full border rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#767EE0] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${getInputBackgroundColor()} ${getInputBorderColor()} ${getTextColor()}`}
                >
                  <option value="" className={isDarkMode ? 'bg-[#15151C] text-white' : 'bg-white text-gray-900'}>
                    -- Select a subject --
                  </option>
                  {availableSubjects.map((subject, index) => (
                    <option key={index} value={subject.subject_name} className={isDarkMode ? 'bg-[#15151C] text-white' : 'bg-white text-gray-900'}>
                      {getSubjectDisplayName(subject)}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Section Buttons - Only show when a subject is selected */}
              {selectedSubject && availableSections.length > 0 && !loading && (
                <div className="mb-3">
                  <label className={`block text-xs mb-1.5 ${getSecondaryTextColor()}`}>Select Section:</label>
                  <div className="flex flex-wrap gap-2">
                    {availableSections.map((section, index) => (
                      <button
                        key={index}
                        onClick={() => handleSectionClick(section)}
                        disabled={loading}
                        className={`px-3 py-2 text-xs rounded transition-colors flex flex-col items-center ${
                          getSectionButtonColor(selectedSection === section)
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span>Section {section}</span>
                        <span className="text-[10px] opacity-80">
                          {getSectionStudentCount(section)} student(s) absent/late
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Status Summary - Only show when a section is selected */}
              {isSectionSelected && !loading && (
                <div className={`flex gap-4 text-[10px] ${getSecondaryTextColor()}`}>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#A15353]"></div>
                    <span>Absent: {getStatusCounts().absent}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#FFA600]"></div>
                    <span>Late: {getStatusCounts().late}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-[#767EE0]"></div>
                    <span>Total: {getStatusCounts().total}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Modal body - Student cards (only show when section is selected) */}
            <div className="p-3 overflow-y-auto max-h-[60vh]">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#767EE0] mx-auto mb-3"></div>
                  <p className={`text-sm ${getSecondaryTextColor()}`}>Loading attendance data...</p>
                </div>
              ) : !selectedSubject ? (
                <div className="text-center py-4">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className={`text-sm ${getSecondaryTextColor()}`}>Please select a subject to view sections</p>
                </div>
              ) : !isSectionSelected ? (
                <div className="text-center py-4">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 5.197a6 6 0 00-9-5.197M12 4.354a4 4 0 110 5.292" />
                  </svg>
                  <p className={`text-sm ${getSecondaryTextColor()}`}>Please select a section to view students</p>
                  <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-gray-400'} mt-1`}>
                    {availableSections.length} section(s) available for {selectedSubject}
                  </p>
                </div>
              ) : studentData.length > 0 ? (
                <div className="space-y-2">
                  <div className={`text-xs mb-2 ${getSecondaryTextColor()}`}>
                    Showing absent/late students for <span className="text-[#767EE0]">{selectedSubject}</span> - <span className="text-[#767EE0]">Section {selectedSection}</span>
                  </div>
                  {studentData.map((student) => {
                    const statusBadge = getStudentStatusBadge(student.status);
                    return (
                      <div 
                        key={`${student.id}-${student.student_ID}`} 
                        className={`rounded border p-2 hover:border-white/10 transition-colors ${isDarkMode ? 'bg-[#15151C] border-white/5' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className={`text-xs font-semibold ${getTextColor()}`}>{formatStudentName(student)}</p>
                            <p className={`text-[10px] mt-0.5 ${getSecondaryTextColor()}`}>ID: {student.student_ID}</p>
                            <p className={`text-[10px] mt-0.5 ${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}>Class: {student.tracked_yearandsec}</p>
                          </div>
                          <div className={`px-2 py-0.5 rounded text-[9px] border ${statusBadge.bgColor} ${statusBadge.textColor} ${statusBadge.borderColor}`}>
                            {statusBadge.text}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className={`text-sm ${getSecondaryTextColor()}`}>No absent or late students</p>
                  <p className={`text-xs ${isDarkMode ? 'text-white/40' : 'text-gray-400'} mt-1`}>
                    All students are present in Section {selectedSection} for {selectedSubject}
                  </p>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className={`p-3 border-t ${getModalBorderColor()}`}>
              <div className="flex justify-between">
                <button
                  onClick={() => setIsCalendarOpen(false)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${getCloseButtonColor()}`}
                >
                  Close
                </button>
                <Link to="/Attendance">
                  <button
                    onClick={() => setIsCalendarOpen(false)}
                    className="px-3 py-1 text-xs bg-[#767EE0] text-white rounded hover:bg-[#767EE0]/80 transition-colors"
                  >
                    View Full Report
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarWidget;