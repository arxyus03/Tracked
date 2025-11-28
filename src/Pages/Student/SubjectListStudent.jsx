import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import SubjectDetailsIcon from '../../assets/SubjectDetails.svg';
import BackButton from '../../assets/BackButton(Light).svg';
import Search from "../../assets/Search.svg";
import TeacherIcon from '../../assets/Teacher(Light).svg';
import StudentIcon from '../../assets/Student(Light).svg';
import Details from '../../assets/Details(Light).svg';
import PersonIcon from '../../assets/Person.svg';
import ClassManagementIcon from "../../assets/ClassManagement(Light).svg";

export default function StudentListStudent() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get('code');
  
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [setActiveDropdown] = useState(null);

  // State for backend data
  const [classInfo, setClassInfo] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [setStudentId] = useState('');

  // Get student ID from localStorage
  useEffect(() => {
    const getStudentId = () => {
      try {
        const userDataString = localStorage.getItem('user');
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setStudentId(userData.id);
          return userData.id;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
      return null;
    };

    getStudentId();
  }, []);

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
      const response = await fetch(`https://tracked.6minds.site/Student/SubjectDetailsStudentDB/get_class_details_student.php?subject_code=${subjectCode}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setClassInfo(result.class_data);
          
          // Fetch professor details to get the actual name
          if (result.class_data.professor_ID) {
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
      const response = await fetch(`https://tracked.6minds.site/Student/SubjectDetailsStudentDB/get_students_by_section_student.php?subject_code=${subjectCode}`);
      
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
            program: student.tracked_program,
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
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
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
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-5 text-center">
            <div className="text-red-600 mb-4">
              <p className="text-lg font-semibold">Error Loading Data</p>
              <p className="text-sm">{error}</p>
            </div>
            <Link to="/Subjects">
              <button className="bg-[#00A15D] hover:bg-[#00874E] text-white font-bold py-2 px-4 rounded transition-colors">
                Back to Subjects
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* Main Content */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          
          {/* Page Header - Matching Professor Version */}
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
              View your classmates and teachers
            </p>
          </div>

          {/* Subject Information - Matching Professor Version */}
          <div className="flex flex-col gap-2 text-sm sm:text-base lg:text-[1.125rem] text-[#465746] mb-4 sm:mb-5">
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT CODE:</span>
              <span className="break-all">{classInfo?.subject_code || 'N/A'}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT:</span>
              <span className="break-words">{classInfo?.subject || 'N/A'}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold">SECTION:</span>
                <span>{classInfo?.section || 'N/A'}</span>
              </div>
              <div className="w-full sm:w-auto flex justify-end">
                <Link to={`/SubjectAnnouncementStudent?code=${subjectCode}`}>
                  <img 
                    src={BackButton} 
                    alt="Back" 
                    className="h-6 w-6 cursor-pointer hover:opacity-70 transition-opacity" 
                  />
                </Link>
              </div>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Summary Stats - Matching Professor Version */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            <div className="bg-white p-4 sm:p-5 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <img src={TeacherIcon} alt="Teachers" className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold">Teachers</p>
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
                  <p className="text-gray-600 text-sm font-semibold">Students</p>
                  <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-5 rounded-lg shadow-md border border-gray-200 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <img src={PersonIcon} alt="Active" className="h-6 w-6" />
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

          {/* Search Bar - Matching Professor Version */}
          <div className="mb-6 sm:mb-8">
            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Search people by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 sm:h-12 rounded-md px-4 py-2.5 pr-12 shadow-md outline-none bg-white text-sm sm:text-base border-2 border-transparent focus:border-[#00874E] transition-colors"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                <img
                  src={Search}
                  alt="Search"
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
              </button>
            </div>
          </div>

          {/* Teachers Section - Matching Professor Version */}
          <div className="mb-8 sm:mb-10">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <img
                src={TeacherIcon}
                alt="Teachers"
                className="h-6 w-6 sm:h-7 sm:w-7"
              />
              <h2 className="font-bold text-lg sm:text-xl lg:text-2xl text-[#465746]">
                Teachers
              </h2>
            </div>

            <div className="space-y-4">
              {filteredTeachers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-md">
                  No teachers found matching your search
                </div>
              ) : (
                filteredTeachers.map((teacher) => (
                  <div key={teacher.id} className="bg-white p-4 sm:p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <img src={PersonIcon} alt="Person" className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                            {teacher.name}
                          </h3>
                          <p className="text-[#00874E] text-sm font-medium mt-1">
                            {teacher.role}
                          </p>
                          {teacher.email && (
                            <p className="text-gray-500 text-sm mt-1 truncate">
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

          {/* Students Section - Matching Professor Version */}
          <div>
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <img
                src={StudentIcon}
                alt="Students"
                className="h-6 w-6 sm:h-7 sm:w-7"
              />
              <h2 className="font-bold text-lg sm:text-xl lg:text-2xl text-[#465746]">
                Students
              </h2>
            </div>

            <div className="space-y-4">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-md">
                  {searchQuery ? "No students found matching your search" : "No students enrolled in this class"}
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <div key={student.id} className="bg-white p-4 sm:p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                          <img src={PersonIcon} alt="Person" className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                            {student.name}
                          </h3>
                          <p className="text-gray-500 text-sm mt-1">
                            Student • {student.yearSection || 'N/A'}
                          </p>
                          {student.email && (
                            <p className="text-gray-500 text-sm mt-1 truncate">
                              {student.email}
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
        </div>
      </div>
    </div>
  );
}