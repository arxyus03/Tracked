import { useState } from "react";
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import ClassManagementLight from '../../assets/ClassManagement(Light).svg';
import Student from '../../assets/Student(Light).svg';
import Professor from '../../assets/Professor(Light).svg';

export default function UserManagement() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-300">
      <Sidebar role="admin" isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[250px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* content of ADMIN USER MANAGEMENT */}
        <div className="p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">

          {/* "Header" of ADMIN USER MANAGEMENT */}
          <div className="flex flex-col sm:flex-row item-start sm:items-center mb-2 sm:mb-4">
            <div className="flex items-center mb-2 sm:mb-0">
              <img 
                src={ClassManagementLight} 
                alt="ClassManagement" 
                className="h-7 w-7 sm:h-6 sm:w-7 md:h-7 md:w-7 mr-3 sm: mr-3 mt-0.5 ml-2"
              />
              <h1 className="font-bold text-xl sm:text-xl md:text-xl lg:text-xl text-[#465746]">
                User Management
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center text-sm sm:text-base md:text-base lg:text-base text-[#465746] mb-4 sm:mb-5 ml-2">
            <span>Welcome back, </span>
            <span className="font-bold mx-1">ADMIN</span>
            <span>ready to manage accounts?</span>
          </div>

          <hr className="opacity-60 border-[#465746] rounded border-1 mb-6" />


          <div className="grid grid-cols-1 lg-grid-cols-2 gap-4 sm:gap-5 mb-6">
          {/* main content of ADMIN USER MANAGEMENT */}
            {/* Professor Accounts Button */}
            <Link to="/UserManagementProfessorAccounts" className="block">
              <div className="bg-[#FFFFFF] rounded-xl shadow-md hover:border-2 hover:border-[#00874E] transition-all duration-200 p-4 sm:p-5 lg:p-6">
                
                <div className="flex items-center mb-3 sm:mb-4">
                  <img 
                    src={Professor}
                    alt="Student"
                    className='h-6 w-6 sm:h-7 sm:w-7 mr-3 sm:mr-5'
                  />
                  <h2 className="font-bold text-base sm:text-lg lg:text-lg text-[#465746]">
                    Professor Accounts
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center">
                  <p className="font-bold text-sm sm:text-base lg-text-lg text-[#465746] mb-1 sm:mb-0">
                    Total of Professor Account Created:
                  </p>
                  <p className="font-bold text-sm sm:text-base lg-text-lg text-[#00874E] sm:ml-2">
                    X
                  </p>
                </div>
              </div>
            </Link>

            {/* Student Accounts Button */}
            <Link to="/UserManagementStudentAccounts" className="block">
              <div className="bg-[#FFFFFF] rounded-xl shadow-md hover:border-2 hover:border-[#00874E] transition-all duration-200 p-4 sm:p-5 lg:p-6">
                
                <div className="flex items-center mb-3 sm:mb-4">
                  <img 
                    src={Student}
                    alt="Student"
                    className='h-6 w-6 sm:h-7 sm:w-7 mr-3 sm:mr-5'
                  />
                  <h2 className="font-bold text-base sm:text-lg lg:text-lg text-[#465746]">
                    Student Accounts
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center">
                  <p className="font-bold text-sm sm:text-base lg:text-lg text-[#465746] mb-1 sm:mb-0">
                    Total of Student Account Created:
                  </p>
                  <p className="font-bold text-sm sm:text-base lg-text-lg text-[#00874E] sm:ml-2">
                    X
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