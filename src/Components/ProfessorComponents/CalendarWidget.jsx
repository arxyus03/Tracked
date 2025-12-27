import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CalendarIcon from '../../assets/Calendar.svg';

const CalendarWidget = ({ professorId }) => {
  // Calendar states
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDayAbsences, setSelectedDayAbsences] = useState([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarDays, setCalendarDays] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [monthlyAbsenceRate, setMonthlyAbsenceRate] = useState(0);

  useEffect(() => {
    if (professorId) {
      generateCalendarData();
    }
  }, [professorId, currentMonth, currentYear]);

  // Generate calendar data
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
        
        // Get dummy absences for this day
        const absencesForDay = await fetchDayAbsences(dateStr);
        const hasAbsences = absencesForDay.length > 0;
        
        // Count only weekdays for absence rate
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
          totalDays++;
          if (hasAbsences) {
            totalDaysWithAbsences++;
          }
        }

        daysArray.push({
          date: dateStr,
          dayNumber: day,
          dayOfWeek,
          status: hasAbsences ? 'absent' : 'present',
          absences: absencesForDay,
          isToday: dateStr === todayStr,
          isFuture: dateObj > today,
          isDay: true
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

      setCalendarDays(daysArray);
    } catch (error) {
      console.error("Error generating calendar data:", error);
    }
  };

  // Fetch dummy absences for a day
  const fetchDayAbsences = async (date) => {
    // Dummy data - in real app, this would come from API
    const dummyAbsences = [
      {
        id: 1,
        studentName: "Juan Dela Cruz",
        section: "BSIT 3-1",
        subject: "Web Development"
      },
      {
        id: 2,
        studentName: "Maria Santos",
        section: "BSIT 3-2", 
        subject: "Database Management"
      },
      {
        id: 3,
        studentName: "Pedro Reyes",
        section: "BSCS 2-1",
        subject: "Data Structures"
      },
      {
        id: 4,
        studentName: "Ana Gonzales",
        section: "BSIT 3-1",
        subject: "Web Development"
      },
      {
        id: 5,
        studentName: "Luis Torres",
        section: "BSCS 2-1",
        subject: "Data Structures"
      }
    ];

    // Return 0-5 random absences for the date
    const randomCount = Math.floor(Math.random() * 6); // 0-5 absences
    return dummyAbsences.slice(0, randomCount);
  };

  // Handle day click
  const handleDayClick = (day) => {
    if (!day.isDay || day.isFuture) return;
    
    setSelectedDate(day);
    setSelectedDayAbsences(day.absences || []);
    setIsCalendarOpen(true);
  };

  // Get status color for calendar day
  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-transparent border-white/20';
      case 'absent': return 'bg-[#A15353] border-[#A15353]';
      default: return 'bg-transparent border-white/20';
    }
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

  return (
    <>
      {/* Attendance Calendar - Increased height even more to prevent text overflow */}
      <div className='lg:col-span-1 bg-[#15151C] rounded-lg shadow p-3 border-2 border-[#15151C] h-64'>
        <div className="flex flex-col h-full">
          {/* Header with month and navigation */}
          <div className="mb-3">
            <div className="flex items-center mb-2">
              <div className="flex justify-center items-center h-6 w-6 rounded mr-1.5">
                <img src={CalendarIcon} alt="Calendar" className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-xs text-white mb-0.5">Attendance</h2>
                <div className="flex items-center justify-between">
                  <button 
                    onClick={goToPreviousMonth}
                    className="p-0.5 rounded hover:bg-white/10 transition-colors"
                    aria-label="Previous month"
                  >
                    <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="text-center flex-1 mx-0.5">
                    <p className="text-[10px] text-white/50">{getMonthName()} {currentYear}</p>
                  </div>
                  <button 
                    onClick={goToNextMonth}
                    className="p-0.5 rounded hover:bg-white/10 transition-colors"
                    aria-label="Next month"
                  >
                    <svg className="w-2 h-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Absence rate - smaller */}
            <div className="text-center mb-2">
              <p className="text-[10px] text-white/80 mb-0.5">Absence Rate</p>
              <div className="flex items-baseline justify-center">
                <p className="text-xl font-bold text-white">{monthlyAbsenceRate}</p>
                <p className="text-base font-bold text-white ml-0.5">%</p>
              </div>
            </div>
            
            {/* Progress bar - smaller */}
            <div className="mb-3">
              <div className="w-full bg-[#767EE0]/20 rounded-full h-1">
                <div 
                  className="bg-[#767EE0] h-1 rounded-full"
                  style={{ width: `${monthlyAbsenceRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Compact Calendar Grid - More space with increased height */}
          <div className="mb-3 flex-grow">
            <div className="grid grid-cols-7 gap-0.5 mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={index} className="text-center">
                  <p className="text-[8px] text-white/50">{day}</p>
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
                        ${getStatusColor(day.status)}
                        ${day.isToday ? 'ring-0.5 ring-white ring-offset-0.5 ring-offset-[#15151C]' : ''}
                        ${day.isFuture ? 'opacity-30 cursor-not-allowed' : 'hover:scale-110 transition-transform cursor-pointer'}
                        flex items-center justify-center
                        ${day.status === 'absent' ? 'text-white' : 'text-white/40'}
                      `}
                    >
                      <span className="font-medium">
                        {day.dayNumber}
                      </span>
                    </button>
                  ) : (
                    <div className="h-3 w-3"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Absence Details Modal */}
      {isCalendarOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-3">
          <div className="bg-[#23232C] rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-hidden border-2 border-white/10">
            {/* Modal header - Simplified without arrows and month toggles */}
            <div className="p-3 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img src={CalendarIcon} alt="Calendar" className="h-4 w-4 mr-2" />
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      Absences on {formatDateDisplay(selectedDate?.date)}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] text-white/60">
                      <span>{selectedDayAbsences.length} student(s) absent</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsCalendarOpen(false)}
                  className="p-1 rounded hover:bg-white/10"
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal body - Simplified with only student name, section, and subject */}
            <div className="p-3 overflow-y-auto max-h-[60vh]">
              {selectedDayAbsences.length > 0 ? (
                <div className="space-y-2">
                  {selectedDayAbsences.map((absence) => (
                    <div 
                      key={absence.id} 
                      className="bg-[#15151C] rounded border border-white/5 p-2 hover:border-[#A15353]/30 transition-colors"
                    >
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-white">{absence.studentName}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        <div>
                          <p className="text-white/50">Section</p>
                          <p className="text-white font-medium">{absence.section}</p>
                        </div>
                        <div>
                          <p className="text-white/50">Subject</p>
                          <p className="text-white font-medium">{absence.subject}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <svg className="w-8 h-8 text-white/30 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-white/60">No absences recorded for this day</p>
                </div>
              )}
            </div>

            {/* Modal footer - Updated to link to Attendance page */}
            <div className="p-3 border-t border-white/10">
              <div className="flex justify-between">
                <button
                  onClick={() => setIsCalendarOpen(false)}
                  className="px-3 py-1 text-xs bg-[#15151C] text-white rounded hover:bg-[#1E1E24] transition-colors"
                >
                  Close
                </button>
                <Link to="/Attendance">
                  <button
                    onClick={() => setIsCalendarOpen(false)}
                    className="px-3 py-1 text-xs bg-[#A15353] text-white rounded hover:bg-[#A15353]/80 transition-colors"
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