import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import KickStudentList from "../../Components/StudentListComponents/KickStudentList";

import SubjectDetailsIcon from '../../assets/SubjectDetails.svg';
import BackButton from '../../assets/BackButton(Light).svg';
import Search from "../../assets/Search.svg";
import TeacherIcon from '../../assets/Teacher(Light).svg';
import StudentIcon from '../../assets/Student(Light).svg';
import Details from '../../assets/Details(Light).svg';
import PersonIcon from '../../assets/Person.svg';
import ClassManagementIcon from "../../assets/ClassManagement(Light).svg";
import Copy from "../../assets/Copy(Light).svg"; // Added import

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

  // Fetch professor details by ID
  const fetchProfessorDetails = async (professorId) => {
    try {
      const response = await fetch(`https://tracked.6minds.site/Professor/SubjectDetailsDB/get_professor_details.php?professor_ID=${professorId}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return result.professor;
        } else {
          console.error('Error fetching professor details:', result.message);
          return null;
        }
      } else {
        throw new Error('Failed to fetch professor details');
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
          // Show temporary feedback
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
        
        await Promise.all([
          fetchClassDetails(),
          fetchStudents()
        ]);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError("Failed to load class data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [subjectCode]);

  const fetchClassDetails = async () => {
    try {
      const professorId = getProfessorId();
      if (!professorId) {
        throw new Error("Professor ID not found");
      }

      const response = await fetch(`https://tracked.6minds.site/Professor/SubjectDetailsDB/get_class_details.php?subject_code=${subjectCode}&professor_ID=${professorId}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setClassInfo(result.class_data);
          
          // Fetch professor details to get the actual name
          const professorDetails = await fetchProfessorDetails(result.class_data.professor_ID);
          
          if (professorDetails) {
            // Set teacher information with actual professor name
            setTeachers([
              {
                id: result.class_data.professor_ID,
                name: professorDetails.tracked_firstname && professorDetails.tracked_lastname 
                  ? `${professorDetails.tracked_firstname} ${professorDetails.tracked_lastname}`
                  : `Professor ${result.class_data.professor_ID}`,
                role: "Head Teacher",
                email: professorDetails.tracked_email,
                // Add other professor details if needed
              }
            ]);
          } else {
            // Fallback if professor details can't be fetched
            setTeachers([
              {
                id: result.class_data.professor_ID,
                name: `Professor ${result.class_data.professor_ID}`,
                role: "Head Teacher",
              }
            ]);
          }
        } else {
          throw new Error(result.message || "Failed to fetch class details");
        }
      } else {
        throw new Error('Failed to fetch class details');
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
      setError("Error loading class details: " + error.message);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(`https://tracked.6minds.site/Professor/SubjectDetailsDB/get_students_by_section.php?subject_code=${subjectCode}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Transform the student data to match the frontend structure
          const transformedStudents = result.students.map(student => ({
            id: student.tracked_ID,
            name: `${student.tracked_firstname} ${student.tracked_lastname}`,
            email: student.tracked_email,
            gender: student.tracked_gender,
            yearSection: student.tracked_yearandsec,
            enrolledAt: student.enrolled_at
          }));
          setStudents(transformedStudents);
        } else {
          throw new Error(result.message || "Failed to fetch students");
        }
      } else {
        throw new Error('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError("Error loading students: " + error.message);
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
    setActiveDropdown(null); // Close dropdown when opening modal
  };

  const confirmKickStudent = async () => {
    if (!kickModal.student) return;

    try {
      const professorId = getProfessorId();
      if (!professorId) {
        alert("Error: Professor ID not found");
        return;
      }

      const response = await fetch('https://tracked.6minds.site/Professor/AttendanceDB/remove_student.php', {
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

      const result = await response.json();

      if (result.success) {
        console.log(`Successfully removed student: ${kickModal.student.name}`);
        // Refresh the students list
        await fetchStudents();
        setKickModal({ isOpen: false, student: null });
      } else {
        alert('Error removing student: ' + result.message);
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
    const handleClickOutside = () => {
      setActiveDropdown(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Loading state
  if (loading) {
    return (
      <div>
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-5 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00874E] border-r-transparent"></div>
            <p className="mt-3 text-gray-600">Loading class data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-5 text-center">
            <div className="text-red-600 mb-4">
              <p className="text-lg font-semibold">Error Loading Data</p>
              <p className="text-sm">{error}</p>
            </div>
            <Link to="/ClassManagement">
              <button 
                className="bg-[#00A15D] hover:bg-[#00874E] text-white font-bold py-2 px-4 rounded transition-colors"
                title="Return to class management page"
              >
                Back to Class Management
              </button>
            </Link>
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

        {/* Main Content */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          
          {/* Page Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img
                src={ClassManagementIcon}
                alt="Class"
                className="h-7 w-7 sm:h-9 sm:w-9 mr-2 sm:mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                Class List
              </h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-[#465746]">
              Manage your class
            </p>
          </div>

          {/* Subject Information with Copy Button */}
          <div className="flex flex-col gap-2 text-sm sm:text-base lg:text-[1.125rem] text-[#465746] mb-4 sm:mb-5">
            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT CODE:</span>
              <div className="flex items-center gap-2">
                <span className="break-all">{classInfo?.subject_code || 'N/A'}</span>
                {classInfo?.subject_code && (
                  <button
                    onClick={copySubjectCode}
                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors cursor-pointer flex items-center gap-1"
                    title="Copy subject code"
                  >
                    <img 
                      src={Copy} 
                      alt="Copy" 
                      className="w-4 h-4" 
                    />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT:</span>
              <span className="break-words">{classInfo?.subject || 'N/A'}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Section:</span>
                <span>{classInfo?.section || 'N/A'}</span>
              </div>
              <div className="w-full sm:w-auto flex justify-end">
                <Link to={`/Class?code=${subjectCode}`}>
                  <img 
                    src={BackButton} 
                    alt="Back to Class Details" 
                    className="h-6 w-6 cursor-pointer hover:opacity-70 transition-opacity"
                    title="Back to Class Details"
                  />
                </Link>
              </div>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            <div className="bg-white p-4 sm:p-5 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <img src={TeacherIcon} alt="Teachers" className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Total Teachers</p>
                  <p className="text-2xl font-bold text-gray-900">{teachers.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-5 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <img src={StudentIcon} alt="Students" className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Total Students</p>
                  <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-5 rounded-lg shadow-md border border-gray-200 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <img src={PersonIcon} alt="Active Members" className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Class Members</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {teachers.length + students.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6 sm:mb-8">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search people by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 sm:h-12 rounded-md px-4 py-2.5 pr-12 shadow-md outline-none bg-white text-sm sm:text-base border-2 border-transparent focus:border-[#00874E] transition-colors"
                title="Search for teachers or students by name"
              />
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                title="Search"
              >
                <img
                  src={Search}
                  alt="Search"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
              </button>
            </div>
          </div>

          {/* Teachers Section */}
          <div className="mb-8 sm:mb-10">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <img
                src={TeacherIcon}
                alt="Teachers"
                className="h-6 w-6 sm:h-7 sm:w-7"
                title="Teachers section"
              />
              <h2 className="font-bold text-lg sm:text-xl lg:text-2xl text-[#465746]">
                Teachers
              </h2>
            </div>

            <div className="space-y-3">
              {filteredTeachers.length === 0 ? (
                <div className="text-center py-6 text-gray-500 bg-white rounded-lg shadow-md text-sm">
                  No teachers found matching your search
                </div>
              ) : (
                filteredTeachers.map((teacher) => (
                  <div key={teacher.id} className="bg-white p-3 sm:p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div 
                          className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center"
                          title="Teacher profile"
                        >
                          <img src={PersonIcon} alt="Person" className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {teacher.name}
                          </h3>
                          <p className="text-[#00874E] text-xs font-medium mt-0.5">
                            {teacher.role}
                          </p>
                          {teacher.email && (
                            <p className="text-gray-500 text-xs mt-0.5 truncate">
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

          {/* Students Section */}
          <div>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <img
                src={StudentIcon}
                alt="Students"
                className="h-6 w-6 sm:h-7 sm:w-7"
                title="Students section"
              />
              <h2 className="font-bold text-lg sm:text-xl lg:text-2xl text-[#465746]">
                Students
              </h2>
            </div>

            <div className="space-y-3">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-6 text-gray-500 bg-white rounded-lg shadow-md text-sm">
                  {searchQuery ? "No students found matching your search" : "No students enrolled in this class"}
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <div key={student.id} className="bg-white p-3 sm:p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div 
                          className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center"
                          title="Student profile"
                        >
                          <img src={PersonIcon} alt="Person" className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {student.name}
                          </h3>
                          <p className="text-gray-500 text-xs mt-0.5">
                            Student • {student.yearSection || 'N/A'}
                          </p>
                          {student.email && (
                            <p className="text-gray-500 text-xs mt-0.5 truncate">
                              {student.email}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Fixed Dropdown Menu */}
                      <div className="relative flex-shrink-0">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveDropdown(activeDropdown === student.id ? null : student.id);
                          }}
                          className="p-2 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                          title="Student options"
                        >
                          <img src={Details} alt="More options" className="h-4 w-4" />
                        </button>
                        
                        {activeDropdown === student.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleKickStudent(student);
                              }}
                              className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-gray-100 transition-colors"
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
      />
    </div>
  );
}