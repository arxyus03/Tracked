import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import ClassManagementLight from "../../assets/ClassManagement(Light).svg";
import Student from "../../assets/Student(Light).svg";
import Professor from "../../assets/Professor(Light).svg";

export default function UserManagement() {
  const [isOpen, setIsOpen] = useState(false);
  const [professorCount, setProfessorCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);

  useEffect(() => {
    fetch("http://localhost/TrackEd/src/Pages/Admin/UserManagementDB/get_user_counts.php")
      .then((res) => res.json())
      .then((data) => {
        setProfessorCount(data.Professors || 0);
        setStudentCount(data.Students || 0);
      })
      .catch((err) => console.error("Error fetching user counts:", err));
  }, []);

  return (
    <div>
      <Sidebar role="admin" isOpen={isOpen} setIsOpen={setIsOpen} />

      <div
        className={`
        transition-all duration-300
        ${isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"}
      `}
      >
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* content of ADMIN USER MANAGEMENT */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          {/* "Header" of ADMIN USER MANAGEMENT */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img
                src={ClassManagementLight}
                alt="ClassManagement"
                className="h-6 w-6 sm:h-7 sm:w-7 mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                User Management
              </h1>
            </div>
            <div className="text-sm sm:text-base lg:text-lg text-[#465746]">
              <span>Welcome back, </span>
              <span className="font-bold">ADMIN</span>
              <span> ready to manage accounts?</span>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-5 lg:gap-6">
            {/* Professor Accounts Button */}
            <Link to="/UserManagementProfessorAccounts" className="block">
              <div className="bg-[#FFFFFF] rounded-lg sm:rounded-xl shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 p-4 sm:p-5 lg:p-6">
                <div className="flex items-center mb-3 sm:mb-4">
                  <img
                    src={Professor}
                    alt="Professor"
                    className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mr-3 sm:mr-4"
                  />
                  <h2 className="font-bold text-base sm:text-lg lg:text-xl text-[#465746]">
                    Professor Accounts
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center">
                  <p className="font-bold text-sm sm:text-base lg:text-lg text-[#465746] mb-1 sm:mb-0">
                    Total of Professor Account Created:
                  </p>
                  <p className="font-bold text-sm sm:text-base lg:text-lg text-[#00874E] sm:ml-2">
                    {professorCount}
                  </p>
                </div>
              </div>
            </Link>

            {/* Student Accounts Button */}
            <Link to="/UserManagementStudentAccounts" className="block">
              <div className="bg-[#FFFFFF] rounded-lg sm:rounded-xl shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 p-4 sm:p-5 lg:p-6">
                <div className="flex items-center mb-3 sm:mb-4">
                  <img
                    src={Student}
                    alt="Student"
                    className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mr-3 sm:mr-4"
                  />
                  <h2 className="font-bold text-base sm:text-lg lg:text-xl text-[#465746]">
                    Student Accounts
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center">
                  <p className="font-bold text-sm sm:text-base lg:text-lg text-[#465746] mb-1 sm:mb-0">
                    Total of Student Account Created:
                  </p>
                  <p className="font-bold text-sm sm:text-base lg:text-lg text-[#00874E] sm:ml-2">
                    {studentCount}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}