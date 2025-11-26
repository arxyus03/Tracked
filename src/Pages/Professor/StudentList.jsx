import React, { useState } from 'react';
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import KickStudentList from "../../Components/KickStudentList";

import SubjectDetailsIcon from '../../assets/SubjectDetails.svg';
import BackButton from '../../assets/BackButton(Light).svg';
import Search from "../../assets/Search.svg";
import TeacherIcon from '../../assets/Teacher(Light).svg';
import StudentIcon from '../../assets/Student(Light).svg';
import Details from '../../assets/Details(Light).svg';
import PersonIcon from '../../assets/Person.svg';
import ClassManagementIcon from "../../assets/ClassManagement(Light).svg";
import { Link } from 'react-router-dom';

export default function StudentList() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [kickModal, setKickModal] = useState({ isOpen: false, student: null });

  const classInfo = {
    subject_code: "CS-101",
    subject: "Introduction to Computer Science",
    section: "A"
  };

  const teachers = [
    {
      id: 1,
      name: "Dr. Sarah Johnson",
      role: "Head Teacher",
    }
  ];

  const students = [
    {
      id: 1,
      name: "Alice Johnson",
    },
    {
      id: 2,
      name: "Brian Smith",
    },
    {
      id: 3,
      name: "Catherine Wong",
    },
    {
      id: 4,
      name: "David Brown",
    },
    {
      id: 5,
      name: "Emma Davis",
    }
  ];

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleKickStudent = (student) => {
    setKickModal({ isOpen: true, student });
  };

  const confirmKickStudent = () => {
    console.log(`Kicking student: ${kickModal.student.name}`);
    setKickModal({ isOpen: false, student: null });
  };

  const closeKickModal = () => {
    setKickModal({ isOpen: false, student: null });
  };

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

          {/* Subject Information */}
          <div className="flex flex-col gap-2 text-sm sm:text-base lg:text-[1.125rem] text-[#465746] mb-4 sm:mb-5">
            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT CODE:</span>
              <span>{classInfo.subject_code}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT:</span>
              <span>{classInfo.subject}</span>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Section:</span>
                <span>{classInfo.section}</span>
              </div>
              <div className="w-full flex justify-end">
                <Link to="/Class">
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

          {/* Summary Stats */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
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
            
            <div className="bg-white p-4 sm:p-5 rounded-lg shadow-md border border-gray-200">
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

          {/* Search Bar */}
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

          {/* Teachers Section */}
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
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <img src={PersonIcon} alt="Person" className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                            {teacher.name}
                          </h3>
                          <p className="text-[#00874E] text-sm font-medium mt-1">
                            {teacher.role}
                          </p>
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
              />
              <h2 className="font-bold text-lg sm:text-xl lg:text-2xl text-[#465746]">
                Students
              </h2>
            </div>

            <div className="space-y-4">
              {filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-md">
                  No students found matching your search
                </div>
              ) : (
                filteredStudents.map((student) => (
                  <div key={student.id} className="bg-white p-4 sm:p-5 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                          <img src={PersonIcon} alt="Person" className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                            {student.name}
                          </h3>
                          <p className="text-gray-500 text-sm mt-1">
                            Student
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleKickStudent(student)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors group relative"
                      >
                        <img src={Details} alt="More options" className="h-5 w-5" />
                        <span className="absolute opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs rounded py-1 px-2 -mt-8 -ml-4 transition-opacity">
                          Remove
                        </span>
                      </button>
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