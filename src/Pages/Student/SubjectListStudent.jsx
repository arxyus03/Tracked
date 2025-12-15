import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import SubjectDetailsIcon from '../../assets/SubjectDetails.svg';
import BackButton from '../../assets/BackButton.svg';
import Search from "../../assets/Search.svg";
import TeacherIcon from '../../assets/Teacher.svg';
import StudentIcon from '../../assets/Student.svg';
import Details from '../../assets/Details(Light).svg';
import PersonIcon from '../../assets/Person.svg';
import ClassManagementIcon from "../../assets/StudentList.svg";

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
      <div className="bg-[#23232C] min-h-screen">
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-5 text-center text-[#FFFFFF]">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#767EE0] border-r-transparent"></div>
            <p className="mt-3 text-[#FFFFFF]/80">Loading class data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-[#23232C] min-h-screen">
        <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-5 text-center">
            <div className="text-[#A15353] mb-4">
              <p className="text-lg font-semibold">Error Loading Data</p>
              <p className="text-sm text-[#FFFFFF]/80">{error}</p>
            </div>
            <Link to="/Subjects">
              <button className="bg-[#767EE0] hover:bg-[#5a62c4] text-white font-bold py-2 px-4 rounded transition-colors">
                Back to Subjects
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#23232C] min-h-screen">
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* Main Content */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-6">
          
          {/* Page Header - Compact Version */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <img
                src={ClassManagementIcon}
                alt="Class"
                className="h-6 w-6 sm:h-7 sm:w-7 mr-2"
              />
              <h1 className="font-bold text-xl lg:text-2xl text-[#FFFFFF]">
                Class List
              </h1>
            </div>
            <p className="text-sm lg:text-base text-[#FFFFFF]/80">
              View your classmates and teachers
            </p>
          </div>

          {/* Subject Information - Compact Version */}
          <div className="flex flex-col gap-1 text-sm text-[#FFFFFF]/80 mb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">SUBJECT:</span>
              <span>{classInfo?.subject || 'Loading...'}</span>
            </div>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="font-semibold">SECTION:</span>
                <span>{classInfo?.section || 'Loading...'}</span>
              </div>
              <Link to={`/SubjectAnnouncementStudent?code=${subjectCode}`}>
                <img 
                  src={BackButton} 
                  alt="Back" 
                  className="h-5 w-5 cursor-pointer hover:opacity-70 transition-opacity" 
                />
              </Link>
            </div>
          </div>

          <hr className="border-[#FFFFFF]/30 mb-4" />

          {/* Summary Stats - Compact Version with Vibrant Colors */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
            <div className="bg-[#15151C] p-3 rounded-md border border-[#FFFFFF]/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#767EE0] rounded-md flex items-center justify-center">
                  <img src={TeacherIcon} alt="Teachers" className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[#FFFFFF]/60 text-xs font-medium">Teachers</p>
                  <p className="text-lg font-bold text-[#FFFFFF]">{teachers.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#15151C] p-3 rounded-md border border-[#FFFFFF]/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#00A15D] rounded-md flex items-center justify-center">
                  <img src={StudentIcon} alt="Students" className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[#FFFFFF]/60 text-xs font-medium">Students</p>
                  <p className="text-lg font-bold text-[#FFFFFF]">{students.length}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#15151C] p-3 rounded-md border border-[#FFFFFF]/10 sm:col-span-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#B39DDB] rounded-md flex items-center justify-center">
                  <img src={PersonIcon} alt="Active" className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[#FFFFFF]/60 text-xs font-medium">Class Members</p>
                  <p className="text-lg font-bold text-[#FFFFFF]">
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
                className="w-full h-9 rounded px-2.5 py-1.5 pr-9 outline-none bg-[#15151C] text-xs text-[#FFFFFF] border border-[#FFFFFF]/10 focus:border-[#767EE0] transition-colors placeholder:text-[#FFFFFF]/40"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[#FFFFFF]/60">
                <img
                  src={Search}
                  alt="Search"
                  className="h-3.5 w-3.5"
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
                />
              </div>
              <h2 className="font-bold text-lg text-[#FFFFFF]">
                Teachers
              </h2>
            </div>

            <div className="space-y-2.5">
              {filteredTeachers.length === 0 ? (
                <div className="text-center py-6 text-[#FFFFFF]/60 bg-[#15151C] rounded-md shadow-md border border-[#FFFFFF]/10">
                  No teachers found matching your search
                </div>
              ) : (
                filteredTeachers.map((teacher) => (
                  <div key={teacher.id} className="bg-[#15151C] p-3 rounded-md shadow-md border border-[#FFFFFF]/10 hover:border-[#767EE0] transition-all min-h-[70px] flex items-center">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#767EE0] flex items-center justify-center">
                          <img src={PersonIcon} alt="Person" className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-[#FFFFFF] text-sm truncate">
                            {teacher.name}
                          </h3>
                          <p className="text-[#767EE0] text-xs font-medium mt-0.5">
                            {teacher.role}
                          </p>
                          {teacher.email && (
                            <p className="text-[#FFFFFF]/60 text-xs mt-0.5 truncate">
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
                />
              </div>
              <h2 className="font-bold text-lg text-[#FFFFFF]">
                Students
              </h2>
            </div>

            <div className="space-y-2.5">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-6 text-[#FFFFFF]/60 bg-[#15151C] rounded-md shadow-md border border-[#FFFFFF]/10">
                  {searchQuery ? "No students found matching your search" : "No students enrolled in this class"}
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <div key={student.id} className="bg-[#15151C] p-3 rounded-md shadow-md border border-[#FFFFFF]/10 hover:border-[#00A15D] transition-all min-h-[70px] flex items-center">
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#00A15D] flex items-center justify-center">
                          <img src={PersonIcon} alt="Person" className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-[#FFFFFF] text-sm truncate">
                            {student.name}
                          </h3>
                          <p className="text-[#FFFFFF]/60 text-xs mt-0.5">
                            Student • {student.yearSection || 'N/A'}
                          </p>
                          {student.email && (
                            <p className="text-[#FFFFFF]/60 text-xs mt-0.5 truncate">
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