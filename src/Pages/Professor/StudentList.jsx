import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import KickStudentList from "../../Components/StudentListComponents/KickStudentList";
import SubjectDetailsIcon from '../../assets/SubjectDetails.svg';
import BackButton from '../../assets/BackButton.svg';
import Search from "../../assets/Search.svg";
import TeacherIcon from '../../assets/Teacher.svg';
import StudentIcon from '../../assets/Student.svg';
import Details from '../../assets/Details(Light).svg';
import PersonIcon from '../../assets/Person.svg';
import ClassManagementIcon from "../../assets/ClassManagement.svg";
import Copy from '../../assets/Copy.svg';

export default function StudentList() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get('code');
  
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [kickModal, setKickModal] = useState({ isOpen: false, student: null });
  const [activeDropdown, setActiveDropdown] = useState(null);

  // State for backend data
  const [classInfo, setClassInfo] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========== ADDED: Theme State ==========
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Get professor ID from localStorage
  const getProfessorId = () => {
    try {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        return userData.id;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return null;
  };

  // Enhanced fetch function with better error handling
  const fetchData = async (url, options = {}) => {
    try {
      const response = await fetch(url, options);
      
      // Check if response is empty
      const text = await response.text();
      if (!text || text.trim() === '') {
        throw new Error('Empty response from server');
      }
      
      try {
        const data = JSON.parse(text);
        return { ok: response.ok, data };
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response text:', text);
        throw new Error('Invalid JSON response from server');
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      throw error;
    }
  };

  // ========== ADDED: Theme Listener ==========
  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    // Check initial theme
    handleThemeChange();
    
    // Listen for theme changes
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => observer.disconnect();
  }, []);

  // Fetch professor details by ID
  const fetchProfessorDetails = async (professorId) => {
    try {
      const result = await fetchData(
        `https://tracked.6minds.site/Professor/SubjectDetailsDB/get_professor_details.php?professor_ID=${professorId}`
      );
      
      if (result.ok && result.data.success) {
        return result.data.professor;
      } else {
        console.error('Error fetching professor details:', result.data?.message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching professor details:', error);
      return null;
    }
  };

  // Copy subject code to clipboard
  const copySubjectCode = () => {
    if (classInfo?.subject_code) {
      navigator.clipboard.writeText(classInfo.subject_code)
        .then(() => {
          const originalText = document.querySelector('.copy-text');
          if (originalText) {
            originalText.textContent = 'Copied!';
            setTimeout(() => {
              originalText.textContent = 'Copy';
            }, 2000);
          }
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      if (!subjectCode) {
        setError("Subject code is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        
        const professorId = getProfessorId();
        if (!professorId) {
          throw new Error("Professor ID not found. Please log in again.");
        }

        // Fetch class details and students in parallel
        const [classResult, studentsResult] = await Promise.allSettled([
          fetchClassDetails(professorId),
          fetchStudents()
        ]);

        // Handle class details result
        if (classResult.status === 'rejected') {
          console.error('Failed to fetch class details:', classResult.reason);
          setError("Failed to load class details: " + (classResult.reason.message || 'Unknown error'));
        }

        // Handle students result
        if (studentsResult.status === 'rejected') {
          console.error('Failed to fetch students:', studentsResult.reason);
          if (!error) { // Only set error if not already set
            setError("Failed to load students: " + (studentsResult.reason.message || 'Unknown error'));
          }
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError("Failed to load class data: " + (error.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [subjectCode]);

  const fetchClassDetails = async (professorId) => {
    try {
      const result = await fetchData(
        `https://tracked.6minds.site/Professor/SubjectDetailsDB/get_class_details.php?subject_code=${subjectCode}&professor_ID=${professorId}`
      );
      
      if (result.ok && result.data.success) {
        setClassInfo(result.data.class_data);
        
        // Fetch professor details to get the actual name
        const professorDetails = await fetchProfessorDetails(result.data.class_data.professor_ID);
        
        if (professorDetails) {
          setTeachers([
            {
              id: result.data.class_data.professor_ID,
              name: professorDetails.tracked_firstname && professorDetails.tracked_lastname 
                ? `${professorDetails.tracked_firstname} ${professorDetails.tracked_lastname}`
                : `Professor ${result.data.class_data.professor_ID}`,
              role: "Head Teacher",
              email: professorDetails.tracked_email,
            }
          ]);
        } else {
          setTeachers([
            {
              id: result.data.class_data.professor_ID,
              name: `Professor ${result.data.class_data.professor_ID}`,
              role: "Head Teacher",
            }
          ]);
        }
      } else {
        throw new Error(result.data?.message || "Failed to fetch class details");
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
      throw error;
    }
  };

  const fetchStudents = async () => {
    try {
      const result = await fetchData(
        `https://tracked.6minds.site/Professor/SubjectDetailsDB/get_students_by_section.php?subject_code=${subjectCode}`
      );
      
      if (result.ok && result.data.success) {
        const transformedStudents = result.data.students.map(student => ({
          id: student.tracked_ID,
          name: `${student.tracked_firstname} ${student.tracked_lastname}`,
          email: student.tracked_email,
          gender: student.tracked_gender,
          yearSection: student.tracked_yearandsec,
          enrolledAt: student.enrolled_at
        }));
        setStudents(transformedStudents);
      } else {
        throw new Error(result.data?.message || "Failed to fetch students");
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  };

  // Filter students and teachers based on search
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleKickStudent = (student) => {
    setKickModal({ isOpen: true, student });
    setActiveDropdown(null);
  };

  const confirmKickStudent = async () => {
    if (!kickModal.student) return;

    try {
      const professorId = getProfessorId();
      if (!professorId) {
        alert("Error: Professor ID not found");
        return;
      }

      const result = await fetchData('https://tracked.6minds.site/Professor/AttendanceDB/remove_student.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_ID: kickModal.student.id,
          subject_code: subjectCode,
          professor_ID: professorId
        })
      });

      if (result.ok && result.data.success) {
        console.log(`Successfully removed student: ${kickModal.student.name}`);
        await fetchStudents();
        setKickModal({ isOpen: false, student: null });
      } else {
        alert('Error removing student: ' + (result.data?.message || 'Unknown error'));
        setKickModal({ isOpen: false, student: null });
      }
    } catch (error) {
      console.error('Error removing student:', error);
      alert('Error removing student. Please try again.');
      setKickModal({ isOpen: false, student: null });
    }
  };

  const closeKickModal = () => {
    setKickModal({ isOpen: false, student: null });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activeDropdown && !e.target.closest('.dropdown-container')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeDropdown]);

  // ========== THEME HELPER FUNCTIONS ==========
  const getBackgroundColor = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-gray-50";
  };

  const getCardBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getTextColor = () => {
    return isDarkMode ? "text-white" : "text-gray-900";
  };

  const getSecondaryTextColor = () => {
    return isDarkMode ? "text-white/80" : "text-gray-600";
  };

  const getBorderColor = () => {
    return isDarkMode ? "border-[#FFFFFF]/10" : "border-gray-200";
  };

  const getInputBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-gray-50";
  };

  const getHoverBorderColor = (type) => {
    if (type === 'teacher') return isDarkMode ? 'hover:border-[#767EE0]' : 'hover:border-[#767EE0]/70';
    if (type === 'student') return isDarkMode ? 'hover:border-[#00A15D]' : 'hover:border-[#00A15D]/70';
    return isDarkMode ? 'hover:border-white/20' : 'hover:border-gray-300';
  };

  const getDropdownBackground = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getDropdownHover = () => {
    return isDarkMode ? "hover:bg-[#23232C]" : "hover:bg-gray-100";
  };

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${getBackgroundColor()}`}>
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className={`p-5 text-center ${getTextColor()}`}>
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#767EE0] border-r-transparent"></div>
            <p className={`mt-3 ${getSecondaryTextColor()}`}>Loading class data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !classInfo) {
    return (
      <div className={`min-h-screen ${getBackgroundColor()}`}>
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className={`p-5 text-center ${getTextColor()}`}>
            <div className="text-[#A15353] mb-4">
              <p className="text-lg font-semibold ${getTextColor()}">Error Loading Data</p>
              <p className={`text-sm ${getSecondaryTextColor()}`}>{error || "Class not found or access denied"}</p>
              <p className={`text-xs mt-2 ${getSecondaryTextColor()}`}>
                Subject Code: {subjectCode || 'Not provided'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => window.location.reload()}
                className={`${isDarkMode ? 'bg-[#15151C] hover:bg-[#23232C]' : 'bg-gray-100 hover:bg-gray-200'} ${getTextColor()} font-bold py-2 px-4 rounded transition-colors border ${getBorderColor()}`}
              >
                Retry Loading
              </button>
              <Link to="/ClassManagement">
                <button 
                  className="bg-[#767EE0] hover:bg-[#5a62c4] text-white font-bold py-2 px-4 rounded transition-colors"
                >
                  Back to Class Management
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getBackgroundColor()}`}>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* Main Content - Updated to match StudentListStudent */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-6">
          
          {/* Page Header - Compact Version */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <img
                src={ClassManagementIcon}
                alt="Class"
                className="h-6 w-6 sm:h-7 sm:w-7 mr-2"
                style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
              />
              <h1 className={`font-bold text-xl lg:text-2xl ${getTextColor()}`}>
                Class List
              </h1>
            </div>
            <p className={`text-sm lg:text-base ${getSecondaryTextColor()}`}>
              View your classmates and teachers
            </p>
          </div>

          {/* Subject Information - Compact Version */}
          <div className={`flex flex-col gap-1 text-sm ${getSecondaryTextColor()} mb-4`}>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`font-semibold ${getTextColor()}`}>SUBJECT CODE:</span>
              <div className="flex items-center gap-2">
                <span className={getTextColor()}>{classInfo?.subject_code || 'N/A'}</span>
                {classInfo?.subject_code && (
                  <button
                    onClick={copySubjectCode}
                    className={`p-1 ${isDarkMode ? 'text-white/80 hover:text-white hover:bg-[#15151C]' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'} rounded transition-colors cursor-pointer flex items-center gap-1`}
                    title="Copy subject code"
                  >
                    <img 
                      src={Copy} 
                      alt="Copy" 
                      className="w-4 h-4"
                      style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
                    />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={`font-semibold ${getTextColor()}`}>SUBJECT:</span>
              <span className={getTextColor()}>{classInfo?.subject || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${getTextColor()}`}>SECTION:</span>
                <span className={getTextColor()}>{classInfo?.section || 'N/A'}</span>
              </div>
              <Link to={`/Class?code=${subjectCode}`}>
                <img 
                  src={BackButton} 
                  alt="Back to Class Details" 
                  className="h-5 w-5 cursor-pointer hover:opacity-70 transition-opacity"
                  title="Back to Class Details"
                  style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
                />
              </Link>
            </div>
          </div>

          <hr className={`${getBorderColor()} mb-4`} />

          {/* Summary Stats - Compact Version with Vibrant Colors */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
            <div className={`${getCardBackgroundColor()} p-3 rounded-md border ${getBorderColor()}`}>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#767EE0] rounded-md flex items-center justify-center">
                  <img 
                    src={TeacherIcon} 
                    alt="Teachers" 
                    className="h-4 w-4"
                    style={{ filter: isDarkMode ? 'none' : 'invert(1) brightness(2)' }}
                  />
                </div>
                <div>
                  <p className={`text-xs font-medium ${getSecondaryTextColor()}`}>Teachers</p>
                  <p className={`text-lg font-bold ${getTextColor()}`}>{teachers.length}</p>
                </div>
              </div>
            </div>
            
            <div className={`${getCardBackgroundColor()} p-3 rounded-md border ${getBorderColor()}`}>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#00A15D] rounded-md flex items-center justify-center">
                  <img 
                    src={StudentIcon} 
                    alt="Students" 
                    className="h-4 w-4"
                    style={{ filter: isDarkMode ? 'none' : 'invert(1) brightness(2)' }}
                  />
                </div>
                <div>
                  <p className={`text-xs font-medium ${getSecondaryTextColor()}`}>Students</p>
                  <p className={`text-lg font-bold ${getTextColor()}`}>{students.length}</p>
                </div>
              </div>
            </div>
            
            <div className={`${getCardBackgroundColor()} p-3 rounded-md border ${getBorderColor()} sm:col-span-1`}>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#B39DDB] rounded-md flex items-center justify-center">
                  <img 
                    src={PersonIcon} 
                    alt="Active" 
                    className="h-4 w-4"
                    style={{ filter: isDarkMode ? 'none' : 'invert(1) brightness(2)' }}
                  />
                </div>
                <div>
                  <p className={`text-xs font-medium ${getSecondaryTextColor()}`}>Class Members</p>
                  <p className={`text-lg font-bold ${getTextColor()}`}>
                    {teachers.length + students.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar - Compact Version */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search people by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full h-9 rounded px-2.5 py-1.5 pr-9 outline-none ${getInputBackgroundColor()} text-xs ${getTextColor()} border ${getBorderColor()} focus:border-[#767EE0] transition-colors placeholder:${isDarkMode ? 'text-white/40' : 'text-gray-400'}`}
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2">
                <img
                  src={Search}
                  alt="Search"
                  className="h-3.5 w-3.5"
                  style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
                />
              </button>
            </div>
          </div>

          {/* Teachers Section - Compact Cards */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 flex items-center justify-center">
                <img
                  src={TeacherIcon}
                  alt="Teachers"
                  className="h-4 w-4"
                  style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
                />
              </div>
              <h2 className={`font-bold text-lg ${getTextColor()}`}>
                Teachers
              </h2>
            </div>

            <div className="space-y-2.5">
              {filteredTeachers.length === 0 ? (
                <div className={`text-center py-6 ${getSecondaryTextColor()} ${getCardBackgroundColor()} rounded-md shadow-md border ${getBorderColor()}`}>
                  No teachers found matching your search
                </div>
              ) : (
                filteredTeachers.map((teacher) => (
                  <div key={teacher.id} className={`${getCardBackgroundColor()} p-3 rounded-md shadow-md border ${getBorderColor()} ${getHoverBorderColor('teacher')} transition-all min-h-[70px] flex items-center`}>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#767EE0] flex items-center justify-center">
                          <img 
                            src={PersonIcon} 
                            alt="Person" 
                            className="h-4 w-4"
                            style={{ filter: 'invert(1) brightness(2)' }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className={`font-semibold text-sm truncate ${getTextColor()}`}>
                            {teacher.name}
                          </h3>
                          <p className="text-[#767EE0] text-xs font-medium mt-0.5">
                            {teacher.role}
                          </p>
                          {teacher.email && (
                            <p className={`text-xs mt-0.5 truncate ${getSecondaryTextColor()}`}>
                              {teacher.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Students Section - Compact Cards */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 flex items-center justify-center">
                <img
                  src={StudentIcon}
                  alt="Students"
                  className="h-4 w-4"
                  style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
                />
              </div>
              <h2 className={`font-bold text-lg ${getTextColor()}`}>
                Students
              </h2>
            </div>

            <div className="space-y-2.5">
              {filteredStudents.length === 0 ? (
                <div className={`text-center py-6 ${getSecondaryTextColor()} ${getCardBackgroundColor()} rounded-md shadow-md border ${getBorderColor()}`}>
                  {searchQuery ? "No students found matching your search" : "No students enrolled in this class"}
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <div key={student.id} className={`${getCardBackgroundColor()} p-3 rounded-md shadow-md border ${getBorderColor()} ${getHoverBorderColor('student')} transition-all min-h-[70px] flex items-center dropdown-container`}>
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#00A15D] flex items-center justify-center">
                          <img 
                            src={PersonIcon} 
                            alt="Person" 
                            className="h-4 w-4"
                            style={{ filter: 'invert(1) brightness(2)' }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className={`font-semibold text-sm truncate ${getTextColor()}`}>
                            {student.name}
                          </h3>
                          <p className={`text-xs mt-0.5 ${getSecondaryTextColor()}`}>
                            Student • {student.yearSection || 'N/A'}
                          </p>
                          {student.email && (
                            <p className={`text-xs mt-0.5 truncate ${getSecondaryTextColor()}`}>
                              {student.email}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Fixed Dropdown Menu */}
                      <div className="relative flex-shrink-0 dropdown-container">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(activeDropdown === student.id ? null : student.id);
                          }}
                          className={`p-2 ${isDarkMode ? 'hover:bg-[#23232C]' : 'hover:bg-gray-100'} rounded-full transition-colors cursor-pointer`}
                          title="Student options"
                        >
                          <img 
                            src={Details} 
                            alt="More options" 
                            className="h-4 w-4"
                            style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
                          />
                        </button>
                        
                        {activeDropdown === student.id && (
                          <div className={`absolute right-0 mt-1 w-40 ${getDropdownBackground()} rounded-md shadow-lg border ${getBorderColor()} z-10`}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleKickStudent(student);
                              }}
                              className={`w-full text-left px-3 py-2 text-xs text-[#A15353] ${getDropdownHover()} transition-colors`}
                              title="Remove this student from the class"
                            >
                              Remove Student
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Kick Student Modal */}
      <KickStudentList
        isOpen={kickModal.isOpen}
        student={kickModal.student}
        onClose={closeKickModal}
        onConfirm={confirmKickStudent}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}