import React, { useState } from 'react';
import RankingIcon from '../../assets/Ranking.svg';
import TrackEdIcon from '../../assets/TrackEd.svg';

const ClassRanking = () => {
  const [viewMode, setViewMode] = useState('lowest'); // 'lowest' or 'highest'
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dummy data for lowest performers with detailed breakdown
  const lowestPerformers = [
    {
      id: 1,
      name: "Juan Dela Cruz",
      email: "juan.delacruz@university.edu",
      subject: "Web Development",
      section: "BSIT 3-1",
      average: 68,
      briefReason: "Multiple performance issues",
      details: {
        attendance: {
          rate: 65,
          absences: 8,
          lates: 4,
          totalClasses: 30,
          present: 20
        },
        grades: {
          quizzes: 62,
          assignments: 70,
          projects: 75
        },
        activities: {
          submitted: 12,
          total: 18,
          missed: 6
        }
      }
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria.santos@university.edu",
      subject: "Database Management",
      section: "BSIT 3-2",
      average: 72,
      briefReason: "Struggles with SQL queries",
      details: {
        attendance: {
          rate: 80,
          absences: 4,
          lates: 2,
          totalClasses: 30,
          present: 24
        },
        grades: {
          quizzes: 68,
          assignments: 75,
          projects: 78
        },
        activities: {
          submitted: 14,
          total: 18,
          missed: 4
        }
      }
    },
    {
      id: 3,
      name: "Pedro Reyes",
      email: "pedro.reyes@university.edu",
      subject: "Data Structures",
      section: "BSCS 2-1",
      average: 65,
      briefReason: "Algorithm understanding issues",
      details: {
        attendance: {
          rate: 70,
          absences: 6,
          lates: 3,
          totalClasses: 30,
          present: 21
        },
        grades: {
          quizzes: 60,
          assignments: 65,
          projects: 70
        },
        activities: {
          submitted: 10,
          total: 18,
          missed: 8
        }
      }
    },
    {
      id: 4,
      name: "Ana Gonzales",
      email: "ana.gonzales@university.edu",
      subject: "Web Development",
      section: "BSIT 3-1",
      average: 70,
      briefReason: "Inconsistent submissions",
      details: {
        attendance: {
          rate: 85,
          absences: 3,
          lates: 1,
          totalClasses: 30,
          present: 26
        },
        grades: {
          quizzes: 75,
          assignments: 72,
          projects: 68
        },
        activities: {
          submitted: 13,
          total: 18,
          missed: 5
        }
      }
    },
    {
      id: 5,
      name: "Luis Torres",
      email: "luis.torres@university.edu",
      subject: "Data Structures",
      section: "BSCS 2-1",
      average: 75,
      briefReason: "Poor quiz performance",
      details: {
        attendance: {
          rate: 90,
          absences: 2,
          lates: 0,
          totalClasses: 30,
          present: 28
        },
        grades: {
          quizzes: 65,
          assignments: 80,
          projects: 82
        },
        activities: {
          submitted: 16,
          total: 18,
          missed: 2
        }
      }
    },
    {
      id: 6,
      name: "Sofia Reyes",
      email: "sofia.reyes@university.edu",
      subject: "Database Management",
      section: "BSIT 3-2",
      average: 69,
      briefReason: "Missing lab exercises",
      details: {
        attendance: {
          rate: 75,
          absences: 5,
          lates: 2,
          totalClasses: 30,
          present: 23
        },
        grades: {
          quizzes: 70,
          assignments: 68,
          projects: 72
        },
        activities: {
          submitted: 11,
          total: 18,
          missed: 7
        }
      }
    }
  ];

  // Dummy data for highest performers with detailed breakdown
  const highestPerformers = [
    {
      id: 1,
      name: "Miguel Tan",
      email: "miguel.tan@university.edu",
      subject: "Web Development",
      section: "BSIT 3-1",
      average: 98,
      briefReason: "Excellent all-around performance",
      details: {
        attendance: {
          rate: 100,
          absences: 0,
          lates: 0,
          totalClasses: 30,
          present: 30
        },
        grades: {
          quizzes: 100,
          assignments: 97,
          projects: 100
        },
        activities: {
          submitted: 18,
          total: 18,
          missed: 0
        }
      }
    },
    {
      id: 2,
      name: "Anna Lim",
      email: "anna.lim@university.edu",
      subject: "Database Management",
      section: "BSIT 3-2",
      average: 96,
      briefReason: "Strong project work",
      details: {
        attendance: {
          rate: 95,
          absences: 1,
          lates: 0,
          totalClasses: 30,
          present: 29
        },
        grades: {
          quizzes: 95,
          assignments: 96,
          projects: 98
        },
        activities: {
          submitted: 18,
          total: 18,
          missed: 0
        }
      }
    },
    {
      id: 3,
      name: "Carlos Garcia",
      email: "carlos.garcia@university.edu",
      subject: "Data Structures",
      section: "BSCS 2-1",
      average: 97,
      briefReason: "Consistent high scores",
      details: {
        attendance: {
          rate: 100,
          absences: 0,
          lates: 0,
          totalClasses: 30,
          present: 30
        },
        grades: {
          quizzes: 98,
          assignments: 96,
          projects: 99
        },
        activities: {
          submitted: 18,
          total: 18,
          missed: 0
        }
      }
    },
    {
      id: 4,
      name: "Isabel Cruz",
      email: "isabel.cruz@university.edu",
      subject: "Web Development",
      section: "BSIT 3-1",
      average: 95,
      briefReason: "Creative implementations",
      details: {
        attendance: {
          rate: 95,
          absences: 1,
          lates: 0,
          totalClasses: 30,
          present: 29
        },
        grades: {
          quizzes: 94,
          assignments: 96,
          projects: 97
        },
        activities: {
          submitted: 17,
          total: 18,
          missed: 1
        }
      }
    },
    {
      id: 5,
      name: "James Wong",
      email: "james.wong@university.edu",
      subject: "Database Management",
      section: "BSIT 3-2",
      average: 94,
      briefReason: "Theoretical mastery",
      details: {
        attendance: {
          rate: 90,
          absences: 2,
          lates: 0,
          totalClasses: 30,
          present: 28
        },
        grades: {
          quizzes: 96,
          assignments: 92,
          projects: 95
        },
        activities: {
          submitted: 17,
          total: 18,
          missed: 1
        }
      }
    },
    {
      id: 6,
      name: "Elena Mendoza",
      email: "elena.mendoza@university.edu",
      subject: "Data Structures",
      section: "BSCS 2-1",
      average: 96,
      briefReason: "Problem-solving excellence",
      details: {
        attendance: {
          rate: 100,
          absences: 0,
          lates: 0,
          totalClasses: 30,
          present: 30
        },
        grades: {
          quizzes: 97,
          assignments: 95,
          projects: 98
        },
        activities: {
          submitted: 18,
          total: 18,
          missed: 0
        }
      }
    }
  ];

  // Get unique subjects from both lists
  const allSubjects = [...lowestPerformers, ...highestPerformers];
  const uniqueSubjects = ['all', ...new Set(allSubjects.map(student => student.subject))];

  // Filter performers based on selected subject
  const getFilteredPerformers = () => {
    const performers = viewMode === 'lowest' ? lowestPerformers : highestPerformers;
    
    if (selectedSubject === 'all') {
      return performers;
    }
    
    return performers.filter(student => student.subject === selectedSubject);
  };

  const filteredPerformers = getFilteredPerformers();
  
  // Calculate average for current filtered performers
  const calculateAverage = () => {
    if (filteredPerformers.length === 0) return 0;
    const sum = filteredPerformers.reduce((acc, student) => acc + student.average, 0);
    return Math.round(sum / filteredPerformers.length);
  };

  const handleStudentClick = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  // Generate system recommendations based on student performance
  const getRecommendations = (student) => {
    const recommendations = [];
    const actions = {
      email: false,
      remedial: false,
      extendDeadline: false,
      materials: false
    };

    // Attendance issues
    if (student.details.attendance.absences > 3) {
      recommendations.push("Multiple absences detected. Consider scheduling a consultation to discuss attendance.");
      actions.email = true;
    }

    // Activity submission issues
    if (student.details.activities.missed > 3) {
      recommendations.push("Several activities missed. May benefit from remedial activities or extended deadlines.");
      actions.remedial = true;
      actions.extendDeadline = true;
    }

    // Low grades
    const grades = student.details.grades;
    const lowGrades = [];
    if (grades.quizzes < 75) lowGrades.push("quizzes");
    if (grades.assignments < 75) lowGrades.push("assignments");
    if (grades.projects < 75) lowGrades.push("projects");
    
    if (lowGrades.length > 0) {
      recommendations.push(`Low performance in ${lowGrades.join(", ")}. Provide review materials and schedule extra help sessions.`);
      actions.materials = true;
    }

    // Good performance
    if (viewMode === 'highest') {
      recommendations.push("Excellent performance across all metrics. Consider peer mentoring opportunities.");
    }

    return { recommendations, actions };
  };

  // Handle action buttons
  const handleEmailClick = (student) => {
    const subject = `Regarding your performance in ${student.subject}`;
    const body = `Dear ${student.name},\n\nI would like to discuss your performance in ${student.subject}. Please schedule a meeting with me at your earliest convenience.\n\nBest regards,\n[Your Name]`;
    window.open(`mailto:${student.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleRemedialClick = (student) => {
    // In a real app, this would trigger an API call
    alert(`Remedial activities assigned for ${student.name} in ${student.subject}`);
  };

  const handleExtendDeadlineClick = (student) => {
    // In a real app, this would trigger an API call
    alert(`Deadlines extended for ${student.name} in ${student.subject}`);
  };

  const handleMaterialsClick = (student) => {
    // In a real app, this would trigger an API call
    alert(`Review materials sent to ${student.name} for ${student.subject}`);
  };

  return (
    <>
      <div className="bg-[#15151C] rounded-lg shadow-lg p-3 mb-4 border border-white/10 overflow-hidden">
        {/* Header with title and toggle buttons */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="flex justify-center items-center h-5 w-5 rounded-lg mr-2 bg-[#0F0F15]">
              <img src={RankingIcon} alt="Ranking" className="h-3.5 w-3.5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-[#FFFFFF]">Class Ranking</h2>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setViewMode('lowest')}
              className={`px-2 py-1 text-[10px] rounded-lg transition-all duration-200 font-medium ${
                viewMode === 'lowest'
                  ? 'bg-[#A15353] text-white shadow-md'
                  : 'bg-[#0F0F15] text-white/60 hover:bg-[#767EE0]/20 hover:text-white'
              }`}
            >
              Lowest
            </button>
            <button
              onClick={() => setViewMode('highest')}
              className={`px-2 py-1 text-[10px] rounded-lg transition-all duration-200 font-medium ${
                viewMode === 'highest'
                  ? 'bg-[#00A15D] text-white shadow-md'
                  : 'bg-[#0F0F15] text-white/60 hover:bg-[#767EE0]/20 hover:text-white'
              }`}
            >
              Highest
            </button>
          </div>
        </div>

        {/* Custom Dropdown with colored options */}
        <div className="relative mb-3">
          <select 
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full appearance-none bg-[#0F0F15] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-[#FFFFFF] focus:outline-none focus:border-[#767EE0] focus:bg-[#0F0F15] transition-all pr-8 cursor-pointer hover:border-[#767EE0]/50"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23767EE0' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em'
            }}
          >
            {uniqueSubjects.map(subject => (
              <option 
                key={subject} 
                value={subject} 
                className="bg-[#15151C] text-[#FFFFFF] hover:bg-[#767EE0] hover:text-white"
                style={{
                  backgroundColor: subject === selectedSubject ? '#767EE0' : '#15151C',
                  color: subject === selectedSubject ? '#FFFFFF' : '#FFFFFF'
                }}
              >
                {subject === 'all' ? 'All Subjects' : subject}
              </option>
            ))}
          </select>
        </div>

        {/* Students List - Compact */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5 overflow-x-hidden">
          {filteredPerformers.length === 0 ? (
            <div className="text-center py-4 bg-[#0F0F15] rounded-lg border border-white/5">
              <div className="text-[#767EE0]/40 mb-2">
                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-white/50">No students found</p>
            </div>
          ) : (
            filteredPerformers.map((student, index) => (
              <button
                key={student.id}
                onClick={() => handleStudentClick(student)}
                className="w-full bg-[#0F0F15] rounded-lg border border-white/5 p-2 hover:border-[#00A15D] hover:shadow-md hover:shadow-[#00A15D]/10 transition-all duration-200 text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mr-2 flex-shrink-0 ${
                      viewMode === 'lowest'
                        ? 'bg-[#A15353]/20 text-[#A15353] border border-[#A15353]/30'
                        : 'bg-[#00A15D]/20 text-[#00A15D] border border-[#00A15D]/30'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-[#FFFFFF] truncate">
                          {student.name}
                        </p>
                        <p className={`text-xs font-bold ml-2 flex-shrink-0 ${
                          viewMode === 'lowest' ? 'text-[#A15353]' : 'text-[#00A15D]'
                        }`}>
                          {student.average}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer Stats - Only subject name */}
        <div className="flex justify-center items-center text-[10px] text-white/60 mt-3 pt-2 border-t border-white/10">
          <span className="text-[#FFFFFF]/70">
            <span className="font-medium text-[#FFFFFF]">{selectedSubject === 'all' ? 'All Subjects' : selectedSubject}</span>
          </span>
        </div>
      </div>

      {/* Performance Details Modal - WIDER Version */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-hidden">
          <div className="bg-[#15151C] rounded-xl shadow-2xl max-w-md w-full max-h-[75vh] overflow-hidden border border-white/10">
            {/* Modal header - Compact */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${
                    viewMode === 'lowest'
                      ? 'bg-[#A15353]/20 text-[#A15353] border border-[#A15353]/30'
                      : 'bg-[#00A15D]/20 text-[#00A15D] border border-[#00A15D]/30'
                  }`}>
                    {filteredPerformers.findIndex(s => s.id === selectedStudent.id) + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#FFFFFF]">{selectedStudent.name}</h3>
                    <p className="text-xs text-white/60">{selectedStudent.email}</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg hover:bg-[#767EE0]/20 transition-colors"
                >
                  <svg className="w-4 h-4 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-2">
                <p className="text-xs text-white/80">
                  {selectedStudent.subject} • {selectedStudent.section}
                </p>
                <div className="flex items-baseline mt-1">
                  <p className={`text-xl font-bold ${
                    viewMode === 'lowest' ? 'text-[#A15353]' : 'text-[#00A15D]'
                  }`}>
                    {selectedStudent.average}%
                  </p>
                  <p className="text-xs text-white/60 ml-2">Overall Average</p>
                </div>
              </div>
            </div>

            {/* Modal body - Wider Performance Breakdown */}
            <div className="p-4 overflow-y-auto max-h-[50vh] overflow-x-hidden">
              <div className="space-y-4">
                {/* Combined Attendance & Activities Row - Wider */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Attendance Box - Updated with Present Count */}
                  <div className="bg-[#23232C] rounded-lg border border-white/5 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-[#FFFFFF]">Attendance</h4>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        selectedStudent.details.attendance.rate >= 90 
                          ? 'bg-[#00A15D]/20 text-[#00A15D]'
                          : selectedStudent.details.attendance.rate >= 80 
                          ? 'bg-[#FFA600]/20 text-[#FFA600]'
                          : 'bg-[#A15353]/20 text-[#A15353]'
                      }`}>
                        {selectedStudent.details.attendance.rate}%
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <p className="text-xs text-white/50 mb-0.5">Absences</p>
                        <p className={`text-sm font-bold ${
                          selectedStudent.details.attendance.absences === 0 
                            ? 'text-[#00A15D]'
                            : selectedStudent.details.attendance.absences <= 2 
                            ? 'text-[#FFA600]'
                            : 'text-[#A15353]'
                        }`}>
                          {selectedStudent.details.attendance.absences}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-white/50 mb-0.5">Lates</p>
                        <p className={`text-sm font-bold ${
                          selectedStudent.details.attendance.lates === 0 
                            ? 'text-[#00A15D]'
                            : selectedStudent.details.attendance.lates <= 2 
                            ? 'text-[#FFA600]'
                            : 'text-[#A15353]'
                        }`}>
                          {selectedStudent.details.attendance.lates}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-white/50 mb-0.5">Present</p>
                        <p className={`text-sm font-bold text-[#00A15D]`}>
                          {selectedStudent.details.attendance.present}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Activities Box */}
                  <div className="bg-[#23232C] rounded-lg border border-white/5 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-[#FFFFFF]">Activities</h4>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        selectedStudent.details.activities.missed === 0 
                          ? 'bg-[#00A15D]/20 text-[#00A15D]'
                          : selectedStudent.details.activities.missed <= 2 
                          ? 'bg-[#FFA600]/20 text-[#FFA600]'
                          : 'bg-[#A15353]/20 text-[#A15353]'
                      }`}>
                        {selectedStudent.details.activities.submitted}/{selectedStudent.details.activities.total}
                      </span>
                    </div>
                    <div className="text-center mb-2">
                      <div className="flex items-baseline justify-center">
                        <p className={`text-base font-bold ${
                          selectedStudent.details.activities.missed === 0 
                            ? 'text-[#00A15D]'
                            : selectedStudent.details.activities.missed <= 2 
                            ? 'text-[#FFA600]'
                            : 'text-[#A15353]'
                        }`}>
                          {selectedStudent.details.activities.submitted}
                        </p>
                        <p className="text-sm font-bold text-white/60 mx-1">/</p>
                        <p className="text-base font-bold text-white/60">{selectedStudent.details.activities.total}</p>
                      </div>
                      <p className="text-xs text-white/60 mt-0.5">Submitted vs Total</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <div className="flex items-center">
                        <div className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                          selectedStudent.details.activities.missed === 0 
                            ? 'bg-[#00A15D]'
                            : selectedStudent.details.activities.missed <= 2 
                            ? 'bg-[#FFA600]'
                            : 'bg-[#A15353]'
                        }`}></div>
                        <span>{selectedStudent.details.activities.missed} Missed</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[#FFFFFF] font-medium text-xs">
                          {Math.round((selectedStudent.details.activities.submitted / selectedStudent.details.activities.total) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grades Display - Wider Layout */}
                <div className="bg-[#23232C] rounded-lg border border-white/5 p-3">
                  <h4 className="text-xs font-semibold text-[#FFFFFF] mb-3">Performance Indicators</h4>
                  
                  {/* Critical Indicators - Wider Horizontal Layout */}
                  <div className="mb-4">
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Quizzes', value: selectedStudent.details.grades.quizzes },
                        { label: 'Assignments', value: selectedStudent.details.grades.assignments },
                        { label: 'Projects', value: selectedStudent.details.grades.projects }
                      ].map((item, index) => (
                        <div key={index} className={`text-center px-3 py-3 rounded-lg ${
                          item.value < 70 ? 'bg-[#A15353]/10 border border-[#A15353]/20' :
                          item.value < 80 ? 'bg-[#FFA600]/10 border border-[#FFA600]/20' :
                          'bg-[#00A15D]/10 border border-[#00A15D]/20'
                        }`}>
                          <p className="text-xs text-white/60 mb-1">{item.label}</p>
                          <div className={`text-lg font-bold ${
                            item.value >= 90 ? 'text-[#00A15D]' :
                            item.value >= 80 ? 'text-[#FFA600]' :
                            'text-[#A15353]'
                          }`}>
                            {item.value}%
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-1.5 mt-2">
                            <div 
                              className={`h-1.5 rounded-full ${
                                item.value >= 90 ? 'bg-[#00A15D]' :
                                item.value >= 80 ? 'bg-[#FFA600]' :
                                'bg-[#A15353]'
                              }`}
                              style={{ width: `${item.value}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Grade Summary - Horizontal */}
                  <div className="border-t border-white/10 pt-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-xs text-white/60 mb-0.5">Lowest Grade</p>
                        <p className={`text-sm font-bold ${
                          Math.min(
                            selectedStudent.details.grades.quizzes,
                            selectedStudent.details.grades.assignments,
                            selectedStudent.details.grades.projects
                          ) >= 90 ? 'text-[#00A15D]' :
                          Math.min(
                            selectedStudent.details.grades.quizzes,
                            selectedStudent.details.grades.assignments,
                            selectedStudent.details.grades.projects
                          ) >= 80 ? 'text-[#FFA600]' :
                          'text-[#A15353]'
                        }`}>
                          {Math.min(
                            selectedStudent.details.grades.quizzes,
                            selectedStudent.details.grades.assignments,
                            selectedStudent.details.grades.projects
                          )}%
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-white/60 mb-0.5">Highest Grade</p>
                        <p className={`text-sm font-bold ${
                          Math.max(
                            selectedStudent.details.grades.quizzes,
                            selectedStudent.details.grades.assignments,
                            selectedStudent.details.grades.projects
                          ) >= 90 ? 'text-[#00A15D]' :
                          Math.max(
                            selectedStudent.details.grades.quizzes,
                            selectedStudent.details.grades.assignments,
                            selectedStudent.details.grades.projects
                          ) >= 80 ? 'text-[#FFA600]' :
                          'text-[#A15353]'
                        }`}>
                          {Math.max(
                            selectedStudent.details.grades.quizzes,
                            selectedStudent.details.grades.assignments,
                            selectedStudent.details.grades.projects
                          )}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Recommendation with Action Buttons */}
                <div className="bg-gradient-to-r from-[#23232C] to-[#15151C] rounded-lg border border-white/5 p-4">
                  <div className="flex items-start mb-3">
                    <img src={TrackEdIcon} alt="TrackEd Recommendation" className="h-6 w-6 mr-2 opacity-80 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="text-xs font-semibold text-[#FFFFFF] mb-2">System Recommendation</h4>
                      <div className="space-y-2">
                        {(() => {
                          const { recommendations, actions } = getRecommendations(selectedStudent);
                          return (
                            <>
                              {recommendations.map((rec, index) => (
                                <p key={index} className="text-xs text-white/80 leading-relaxed">
                                  {rec}
                                </p>
                              ))}
                              
                              <div className="flex flex-wrap gap-2 mt-3">
                                {actions.email && (
                                  <button
                                    onClick={() => handleEmailClick(selectedStudent)}
                                    className="px-3 py-1.5 text-xs bg-[#767EE0] text-white rounded-lg hover:bg-[#6670D0] transition-all duration-200 font-medium flex items-center"
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Contact Student
                                  </button>
                                )}
                                
                                {actions.remedial && (
                                  <button
                                    onClick={() => handleRemedialClick(selectedStudent)}
                                    className="px-3 py-1.5 text-xs bg-[#FFA600] text-white rounded-lg hover:bg-[#E69500] transition-all duration-200 font-medium flex items-center"
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Assign Remedial
                                  </button>
                                )}
                                
                                {actions.extendDeadline && (
                                  <button
                                    onClick={() => handleExtendDeadlineClick(selectedStudent)}
                                    className="px-3 py-1.5 text-xs bg-[#00A15D] text-white rounded-lg hover:bg-[#008F4F] transition-all duration-200 font-medium flex items-center"
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Extend Deadline
                                  </button>
                                )}
                                
                                {actions.materials && (
                                  <button
                                    onClick={() => handleMaterialsClick(selectedStudent)}
                                    className="px-3 py-1.5 text-xs bg-[#A15353] text-white rounded-lg hover:bg-[#8A4242] transition-all duration-200 font-medium flex items-center"
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Send Materials
                                  </button>
                                )}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer - Compact */}
            <div className="p-4 border-t border-white/10">
              <button
                onClick={closeModal}
                className="w-full px-3 py-2 text-xs bg-[#767EE0] text-white rounded-lg hover:bg-[#6670D0] transition-all duration-200 font-medium"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClassRanking;