import React, { useState, useEffect } from 'react';
import RankingIcon from '../../assets/Ranking.svg';
import TrackEdIcon from '../../assets/TrackEd.svg';
import EmailIcon from '../../assets/Email.svg';
import ArrowDownLight from '../../assets/ArrowDown.svg';

const ClassRanking = () => {
  const [viewMode, setViewMode] = useState('lowest');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activityFilter, setActivityFilter] = useState('All');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [performers, setPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [professorId, setProfessorId] = useState('');
  const [averagePerformance, setAveragePerformance] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [activitiesData, setActivitiesData] = useState({});

  useEffect(() => {
    // Get professor ID from localStorage
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setProfessorId(user.id);
    }
  }, []);

  useEffect(() => {
    if (professorId) {
      fetchSubjects();
    }
  }, [professorId]);

  useEffect(() => {
    if (professorId && selectedSubject) {
      fetchRankingData();
    }
  }, [professorId, selectedSubject, viewMode]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch(
        `https://tracked.6minds.site/Professor/DashboardProfDB/get_class_ranking.php?professor_ID=${professorId}`
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.subjects) {
          setSubjects(result.subjects);
          if (result.subjects.length > 0 && !selectedSubject) {
            setSelectedSubject(result.subjects[0].subject_code);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRankingData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://tracked.6minds.site/Professor/DashboardProfDB/get_class_ranking.php?professor_ID=${professorId}&subject_code=${selectedSubject}&type=${viewMode}&limit=3&get_subjects_only=1`
      );
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setPerformers(result.students || []);
          setAveragePerformance(result.average_performance || 0);
          setTotalStudents(result.total_students || 0);
          
          // Generate activities for each student
          const activities = {};
          result.students?.forEach(student => {
            activities[student.id] = generateDummyActivities(student.id);
          });
          setActivitiesData(activities);
        }
      }
    } catch (error) {
      console.error("Error fetching ranking data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Generate dummy activities for a student
  const generateDummyActivities = (studentId) => {
    const activityTypes = ['Assignment', 'Quiz', 'Project', 'Discussion', 'Lab'];
    const statuses = ['Submitted', 'Missed', 'Assigned'];
    const titles = [
      'Introduction to API',
      'API Quiz',
      'React Components Assignment',
      'Final Project Proposal',
      'Database Design Lab',
      'Midterm Exam',
      'Group Presentation',
      'Research Paper'
    ];
    
    const activities = [];
    const totalActivities = Math.floor(Math.random() * 8) + 4;
    
    for (let i = 0; i < totalActivities; i++) {
      const title = titles[Math.floor(Math.random() * titles.length)];
      const type = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() - Math.floor(Math.random() * 30));
      
      activities.push({
        id: `${studentId}-activity-${i}`,
        title,
        dueDate: dueDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
        type,
        grade: Math.random() > 0.7 ? `${Math.floor(Math.random() * 20) + 80}/100` : 'Not graded',
        maxPoints: 100,
        status,
        submitted: status === 'Submitted',
        late: status === 'Submitted' && Math.random() > 0.5
      });
    }
    
    return activities;
  };

  // Get status color class
  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted': return 'bg-[#00A15D]/20 text-[#00A15D] border border-[#00A15D]/30';
      case 'Late': return 'bg-[#FFA600]/20 text-[#FFA600] border border-[#FFA600]/30';
      case 'Missed': return 'bg-[#A15353]/20 text-[#A15353] border border-[#A15353]/30';
      case 'Assigned': return 'bg-gray-700 text-gray-300 border border-gray-600';
      default: return 'bg-gray-700 text-gray-300 border border-gray-600';
    }
  };

  // Get filtered activities
  const getFilteredActivities = (activities) => {
    if (!activities) return [];
    
    switch (activityFilter) {
      case 'Submitted':
        return activities.filter(activity => activity.status === 'Submitted');
      case 'Missed':
        return activities.filter(activity => activity.status === 'Missed');
      case 'Assigned':
        return activities.filter(activity => activity.status === 'Assigned');
      case 'All':
      default:
        return activities;
    }
  };

  const handleStudentClick = (student) => {
    const studentWithActivities = {
      ...student,
      activities: activitiesData[student.id] || []
    };
    setSelectedStudent(studentWithActivities);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
    setActivityFilter('All');
    setFilterDropdownOpen(false);
  };

  // Calculate activity statistics
  const getActivityStatistics = (activities) => {
    if (!activities) return { total: 0, submitted: 0, missed: 0, assigned: 0 };
    
    const total = activities.length;
    const submitted = activities.filter(a => a.status === 'Submitted').length;
    const missed = activities.filter(a => a.status === 'Missed').length;
    const assigned = activities.filter(a => a.status === 'Assigned').length;
    
    return {
      total,
      submitted,
      missed,
      assigned
    };
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

    if (!student) return { recommendations, actions };

    // Attendance issues
    if (student.details?.attendance?.absences > 3) {
      recommendations.push("Multiple absences detected. Consider scheduling a consultation.");
      actions.email = true;
    }

    // Activity submission issues
    const activityStats = getActivityStatistics(activitiesData[student.id] || []);
    if (activityStats.missed > 3) {
      recommendations.push("Several activities missed. May benefit from remedial activities or extended deadlines.");
      actions.remedial = true;
      actions.extendDeadline = true;
    }

    // Low grades
    const grades = student.details?.grades;
    if (grades) {
      const lowGrades = [];
      if (grades.quizzes < 75) lowGrades.push("quizzes");
      if (grades.assignments < 75) lowGrades.push("assignments");
      if (grades.projects < 75) lowGrades.push("projects");
      
      if (lowGrades.length > 0) {
        recommendations.push(`Low performance in ${lowGrades.join(", ")}. Provide review materials.`);
        actions.materials = true;
      }
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
    const body = `Dear ${student.name},\n\nI would like to discuss your performance in ${student.subject}. Please schedule a meeting.\n\nBest regards,\n[Your Name]`;
    window.open(`mailto:${student.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const handleRemedialClick = (student) => {
    alert(`Remedial activities assigned for ${student.name} in ${student.subject}`);
  };

  const handleExtendDeadlineClick = (student) => {
    alert(`Deadlines extended for ${student.name} in ${student.subject}`);
  };

  const handleMaterialsClick = (student) => {
    alert(`Review materials sent to ${student.name} for ${student.subject}`);
  };

  const getCurrentSubjectName = () => {
    const subject = subjects.find(s => s.subject_code === selectedSubject);
    return subject ? subject.subject : 'Select Subject';
  };

  const getCurrentSection = () => {
    const subject = subjects.find(s => s.subject_code === selectedSubject);
    return subject ? subject.section : '';
  };

  if (loading && !selectedSubject) {
    return (
      <div className="bg-[#15151C] rounded-lg shadow-lg p-3 mb-4 border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="flex justify-center items-center h-5 w-5 rounded-lg mr-2 bg-[#0F0F15]">
              <img src={RankingIcon} alt="Ranking" className="h-3.5 w-3.5" />
            </div>
            <h2 className="font-bold text-sm text-[#FFFFFF]">Class Ranking</h2>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#767EE0] mx-auto"></div>
          <p className="text-sm text-white/60 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

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

        {/* Custom Dropdown */}
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
            {subjects.map(subject => (
              <option 
                key={subject.subject_code} 
                value={subject.subject_code} 
                className="bg-[#15151C] text-[#FFFFFF] hover:bg-[#767EE0] hover:text-white"
                style={{
                  backgroundColor: subject.subject_code === selectedSubject ? '#767EE0' : '#15151C',
                  color: subject.subject_code === selectedSubject ? '#FFFFFF' : '#FFFFFF'
                }}
              >
                {subject.subject} ({subject.section})
              </option>
            ))}
          </select>
        </div>

        {/* Students List - Compact */}
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5 overflow-x-hidden">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#767EE0] mx-auto"></div>
            </div>
          ) : performers.length === 0 ? (
            <div className="text-center py-4 bg-[#0F0F15] rounded-lg border border-white/5">
              <div className="text-[#767EE0]/40 mb-2">
                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-white/50">No students found</p>
            </div>
          ) : (
            performers.map((student, index) => (
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
                      <p className="text-[10px] text-white/60 truncate mt-0.5">
                        {student.email}
                      </p>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer Stats */}
        <div className="flex justify-between items-center text-[10px] text-white/60 mt-3 pt-2 border-t border-white/10">
          <span className="text-[#FFFFFF]/70">
            <span className="font-medium text-[#FFFFFF]">{getCurrentSubjectName()}</span>
            {getCurrentSection() && (
              <span className="ml-1 text-white/60">({getCurrentSection()})</span>
            )}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-white/50">Avg: <span className="font-medium text-white">{averagePerformance}%</span></span>
            <span className="text-white/30">|</span>
            <span className="text-white/50">Total: <span className="font-medium text-white">{totalStudents}</span></span>
          </div>
        </div>
      </div>

      {/* Performance Details Modal - Two Column Layout */}
      {isModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-hidden">
          <div className="bg-[#15151C] rounded-xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden border border-white/10">
            {/* Modal Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${
                    viewMode === 'lowest'
                      ? 'bg-[#A15353]/20 text-[#A15353] border border-[#A15353]/30'
                      : 'bg-[#00A15D]/20 text-[#00A15D] border border-[#00A15D]/30'
                  }`}>
                    {performers.findIndex(s => s.id === selectedStudent.id) + 1}
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

            <div className="flex flex-col lg:flex-row h-[calc(85vh-140px)]">
              {/* Left Column - Statistics */}
              <div className="lg:w-1/2 p-4 border-r border-white/10 overflow-y-auto">
                <div className="space-y-4">
                  {/* Attendance Section */}
                  <div className="bg-[#23232C] rounded-lg border border-white/5 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-[#FFFFFF]">Attendance</h4>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        selectedStudent.details.attendance.rate >= 90 
                          ? 'bg-[#00A15D]/20 text-[#00A15D]'
                          : selectedStudent.details.attendance.rate >= 80 
                          ? 'bg-[#FFA600]/20 text-[#FFA600]'
                          : 'bg-[#A15353]/20 text-[#A15353]'
                      }`}>
                        {selectedStudent.details.attendance.rate}%
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Absences', value: selectedStudent.details.attendance.absences, color: 'text-[#A15353]' },
                        { label: 'Lates', value: selectedStudent.details.attendance.lates, color: 'text-[#FFA600]' },
                        { label: 'Present', value: selectedStudent.details.attendance.present, color: 'text-[#00A15D]' }
                      ].map((item, idx) => (
                        <div key={idx} className="text-center bg-[#15151C] p-3 rounded-lg">
                          <p className="text-xs text-white/50 mb-1">{item.label}</p>
                          <p className={`text-base font-bold ${item.color}`}>
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Activity Summary */}
                  <div className="bg-[#23232C] rounded-lg border border-white/5 p-4">
                    <h4 className="text-sm font-semibold text-[#FFFFFF] mb-3">Activity Summary</h4>
                    {(() => {
                      const activityStats = getActivityStatistics(selectedStudent.activities);
                      return (
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: 'Total', value: activityStats.total, color: 'bg-gray-800 text-white' },
                            { label: 'Submitted', value: activityStats.submitted, color: 'bg-[#00A15D]/20 text-[#00A15D]' },
                            { label: 'Missed', value: activityStats.missed, color: 'bg-[#A15353]/20 text-[#A15353]' },
                            { label: 'Assigned', value: activityStats.assigned, color: 'bg-[#FFA600]/20 text-[#FFA600]' }
                          ].map((item, idx) => (
                            <div key={idx} className={`text-center p-2 rounded-lg ${item.color} border border-white/10`}>
                              <p className="text-xs font-medium mb-0.5">{item.label}</p>
                              <p className="text-base font-bold">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Grades Display */}
                  <div className="bg-[#23232C] rounded-lg border border-white/5 p-4">
                    <h4 className="text-sm font-semibold text-[#FFFFFF] mb-3">Performance Indicators</h4>
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

                  {/* System Recommendation */}
                  <div className="bg-gradient-to-r from-[#23232C] to-[#15151C] rounded-lg border border-white/5 p-4">
                    <div className="flex items-start mb-3">
                      <img src={TrackEdIcon} alt="TrackEd Recommendation" className="h-5 w-5 mr-2 opacity-80 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-xs font-semibold text-[#FFFFFF] mb-2">System Recommendation</h4>
                        <div className="space-y-2">
                          {(() => {
                            const { recommendations, actions } = getRecommendations(selectedStudent);
                            return (
                              <>
                                {recommendations.length > 0 ? (
                                  recommendations.map((rec, index) => (
                                    <p key={index} className="text-xs text-white/80 leading-relaxed">{rec}</p>
                                  ))
                                ) : (
                                  <p className="text-xs text-white/80 leading-relaxed">Student is performing within expected parameters. No immediate action required.</p>
                                )}
                                
                                {Object.values(actions).some(value => value) && (
                                  <div className="flex flex-wrap gap-2 mt-3">
                                    {actions.email && (
                                      <button onClick={() => handleEmailClick(selectedStudent)} className="px-3 py-1.5 text-xs bg-[#767EE0] text-white rounded-lg hover:bg-[#6670D0] transition-all duration-200 font-medium flex items-center">
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Contact Student
                                      </button>
                                    )}
                                    
                                    {actions.remedial && (
                                      <button onClick={() => handleRemedialClick(selectedStudent)} className="px-3 py-1.5 text-xs bg-[#FFA600] text-white rounded-lg hover:bg-[#E69500] transition-all duration-200 font-medium flex items-center">
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Assign Remedial
                                      </button>
                                    )}
                                    
                                    {actions.extendDeadline && (
                                      <button onClick={() => handleExtendDeadlineClick(selectedStudent)} className="px-3 py-1.5 text-xs bg-[#00A15D] text-white rounded-lg hover:bg-[#008F4F] transition-all duration-200 font-medium flex items-center">
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Extend Deadline
                                      </button>
                                    )}
                                    
                                    {actions.materials && (
                                      <button onClick={() => handleMaterialsClick(selectedStudent)} className="px-3 py-1.5 text-xs bg-[#A15353] text-white rounded-lg hover:bg-[#8A4242] transition-all duration-200 font-medium flex items-center">
                                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        Send Materials
                                      </button>
                                    )}
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Activities List */}
              <div className="lg:w-1/2 p-4 overflow-y-auto">
                <div className="flex flex-col h-full">
                  {/* Activities Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[#FFFFFF] truncate">
                        {selectedStudent.name}'s Activities
                      </h3>
                      <p className="text-xs text-white/60 mt-0.5 truncate">
                        {selectedStudent.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Activity Filter Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                          className="flex items-center justify-between font-medium px-3 py-1.5 bg-gray-800 rounded-md border border-gray-700 hover:border-gray-600 transition-all duration-200 text-xs cursor-pointer text-[#FFFFFF] min-w-[80px]"
                        >
                          <span>{activityFilter}</span>
                          <img
                            src={ArrowDownLight}
                            alt=""
                            className={`ml-1.5 h-3 w-3 transition-transform ${filterDropdownOpen ? 'rotate-180' : ''}`}
                          />
                        </button>

                        {filterDropdownOpen && (
                          <div className="absolute top-full mt-1 right-0 bg-[#15151C] rounded-md shadow-lg border border-gray-700 z-10 overflow-hidden min-w-[110px]">
                            {["All", "Submitted", "Missed", "Assigned"].map((option) => (
                              <button
                                key={option}
                                className={`block w-full text-left px-3 py-2 text-xs hover:bg-gray-800 cursor-pointer transition-colors text-[#FFFFFF] ${
                                  activityFilter === option ? 'bg-gray-800 font-semibold' : ''
                                }`}
                                onClick={() => {
                                  setActivityFilter(option);
                                  setFilterDropdownOpen(false);
                                }}
                              >
                                {option}
                              </button>
                            ))}
                        </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleEmailClick(selectedStudent)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors cursor-pointer text-xs text-[#FFFFFF]"
                      >
                        <img src={EmailIcon} alt="Email" className="w-3.5 h-3.5" />
                        <span>Email</span>
                      </button>
                    </div>
                  </div>

                  {/* Activity Count */}
                  <div className="mb-3">
                    <p className="text-xs text-white/60">
                      Showing {getFilteredActivities(selectedStudent.activities).length} of {selectedStudent.activities?.length || 0} activities
                    </p>
                  </div>

                  {/* Activities List */}
                  <div className="flex-1 overflow-y-auto">
                    {getFilteredActivities(selectedStudent.activities).length > 0 ? (
                      <div className="space-y-3">
                        {getFilteredActivities(selectedStudent.activities).map((activity) => (
                          <div key={activity.id} className="border border-gray-700 rounded-lg p-3 hover:bg-gray-800/50 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-[#FFFFFF] text-sm break-words">
                                  {activity.title}
                                </h4>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-white/60">
                                  <span>Due: {activity.dueDate}</span>
                                  <span>•</span>
                                  <span>{activity.type}</span>
                                  <span>•</span>
                                  <span className={`font-medium ${
                                    activity.grade === 'Not graded' ? 'text-gray-400' : 'text-[#00A15D]'
                                  }`}>
                                    {activity.grade}
                                  </span>
                                </div>
                                {activity.maxPoints > 0 && (
                                  <div className="mt-1 text-xs text-gray-500">
                                    Max points: {activity.maxPoints}
                                  </div>
                                )}
                              </div>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded ${getStatusColor(activity.status)} flex-shrink-0 self-start sm:self-auto mt-1 sm:mt-0`}>
                                {activity.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-white/60 text-sm text-center px-3">
                        <div className="mb-2 text-gray-500">
                          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p>
                          {activityFilter === "All" 
                            ? "No activities found." 
                            : activityFilter === "Submitted"
                            ? "No submitted activities found."
                            : activityFilter === "Assigned"
                            ? "No assigned activities found."
                            : "No missed activities found."
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10">
              <button onClick={closeModal} className="w-full px-3 py-2 text-sm bg-[#767EE0] text-white rounded-lg hover:bg-[#6670D0] transition-all duration-200 font-medium">
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