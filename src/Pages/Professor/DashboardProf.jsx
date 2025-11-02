import React from 'react'
import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import Dashboard from '../../assets/DashboardProf(Light).svg';
import ClassHandled from '../../assets/ClassHandled.svg';
import ActivitiesToGrade from '../../assets/ActivitiesToGrade.svg';
import ID from '../../assets/ID(Light).svg';
import Pie from '../../assets/Pie(Light).svg';
import Details from '../../assets/Details(Light).svg';
import Archive from '../../assets/Archive(Light).svg';

export default function DashboardProf() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("Professor");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [handledSubjects, setHandledSubjects] = useState("");
  const [classesCount, setClassesCount] = useState(0);
  const [activitiesCount, setActivitiesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Get user data from localStorage and fetch from database
    const fetchUserData = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          
          // Get user ID from localStorage
          const userIdFromStorage = user.id;
          
          if (userIdFromStorage) {
            setUserId(userIdFromStorage);
            
            // Fetch complete user data from database
            const response = await fetch(`http://localhost/TrackEd/src/Pages/Professor/DashboardProfDB/get_class_count.php?id=${userIdFromStorage}`);
            
            if (response.ok) {
              const data = await response.json();
              
              if (data.success) {
                setUserData(data.user);
                // Set username from database
                const fullName = `${data.user.tracked_fname} ${data.user.tracked_lname}`;
                setUserName(fullName);
                
                // Set email from database
                setUserEmail(data.user.tracked_email);
                
                // Set handled subjects (only subject names)
                if (data.user.handled_subjects && data.user.handled_subjects.length > 0) {
                  setHandledSubjects(data.user.handled_subjects.join(", "));
                  setClassesCount(data.user.handled_subjects_count);
                } else {
                  setHandledSubjects("No subjects assigned");
                  setClassesCount(0);
                }

                // Fetch activities count
                await fetchActivitiesCount(userIdFromStorage);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch activities count
  const fetchActivitiesCount = async (professorId) => {
    try {
      const response = await fetch(`http://localhost/TrackEd/src/Pages/Professor/DashboardProfDB/get_activities_count.php?professor_id=${professorId}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setActivitiesCount(data.total_activities);
        }
      }
    } catch (error) {
      console.error("Error fetching activities count:", error);
    }
  };

  return (
    <div>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName={userName} />

        {/* content of PROFESSOR DASHBOARD*/}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">

          {/* "Header" of PROFESSOR DASHBOARD */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img
                src={Dashboard}
                alt="Dashboard"
                className="h-6 w-6 sm:h-7 sm:w-7 mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                Dashboard
              </h1>
            </div>
              <div className="text-sm sm:text-base lg:text-lg text-[#465746]">
                <span>Welcome back,</span>
                <span className="font-bold ml-1 mr-1">{userName}!</span>
                <span>Let's see how your students are doing.</span>
              </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* main content of PROFESSOR ADMIN */}

          {/* WIDGETS */}
          <div className='flex justify-center items-center mt-5'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4 lg:gap-6 w-full max-w-7xl'>

              {/* Widgets ACTIVE ACCOUNTS */}
              <div className='bg-[#fff] h-32 sm:h-40 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 text-[#465746] shadow-md'> 
                <div className='font-bold text-sm sm:text-base lg:text-[1.5rem] h-full flex flex-col'>
                  <h1 className='mb-2'> Class Handled </h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#a7aef9] h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#4951AA]'>
                      <img
                        src={ClassHandled}
                        alt="ClassHandled"
                        className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12"
                      />
                    </div>
                    <p className='pt-2 sm:pt-6 lg:pt-8 text-lg sm:text-xl lg:text-[2rem]'>
                      {classesCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* UPDATED: Activities to Grade Widget */}
              <div className='bg-[#fff] h-32 sm:h-40 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 text-[#465746] shadow-md'> 
                <div className='font-bold text-sm sm:text-base lg:text-[1.5rem] h-full flex flex-col'>
                  <h1 className='mb-2'> Activities to Grade </h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#ffb1b1] h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg sm:rounded-xl border-2 border-[#FF6666]'>
                      <img 
                        src={ActivitiesToGrade}
                        alt="ActivitiesToGrade"
                        className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12"
                      />
                    </div>
                    <p className='pt-2 sm:pt-6 lg:pt-8 text-lg sm:text-xl lg:text-[2rem]'>
                      {loading ? "..." : activitiesCount}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Profile Information Card */}
          <div className="bg-[#FFFFFF] text-[#465746] text-sm sm:text-base lg:text-[1.125rem] rounded-lg sm:rounded-xl shadow-md mt-5 p-4 sm:p-5">
            {/* Header: Name */}
            <div className="flex items-center">
              <img 
                src={ID}
                alt="ID"
                className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3"
              />
              <p className="font-bold text-sm sm:text-base lg:text-[1.125rem]">{userName}</p>
            </div>

            <hr className="opacity-60 border-[#465746] rounded border-1 my-2 sm:my-3" />

            {/* Info rows */}
            <div className="pl-4 sm:pl-8 space-y-1 sm:space-y-2">
              <div className="flex flex-col sm:flex-row">
                <span className="font-bold text-xs sm:text-sm lg:text-base w-full sm:w-40 mb-1 sm:mb-0">Faculty Number:</span>
                <span className="text-xs sm:text-sm lg:text-base">{loading ? "Loading..." : (userId || "N/A")}</span>
              </div>
              <div className="flex flex-col sm:flex-row">
                <span className="font-bold text-xs sm:text-sm lg:text-base w-full sm:w-40 mb-1 sm:mb-0">CvSU Email:</span>
                <span className="text-xs sm:text-sm lg:text-base break-all sm:break-normal">{loading ? "Loading..." : (userEmail || "N/A")}</span>
              </div>
              <div className="flex flex-col sm:flex-row">
                <span className="font-bold text-xs sm:text-sm lg:text-base w-full sm:w-40 mb-1 sm:mb-0">Handled Subject:</span>
                <span className="text-xs sm:text-sm lg:text-base">{loading ? "Loading..." : handledSubjects}</span>
              </div>
              <div className="flex flex-col sm:flex-row">
                <span className="font-bold text-xs sm:text-sm lg:text-base w-full sm:w-40 mb-1 sm:mb-0">Department:</span>
                <span className="text-xs sm:text-sm lg:text-base">{loading ? "Loading..." : (userData?.tracked_program || "N/A")}</span>
              </div>
            </div>
          </div>

          {/* Student Attendance Details Card */}
          <Link to={"/AnalyticsProf"}>
            <div className="bg-[#FFFFFF] text-[#465746] text-sm sm:text-base lg:text-[1.125rem] rounded-lg sm:rounded-xl shadow-md mt-5 p-3 sm:p-4 border-2 border-transparent hover:border-[#00874E] transition-all duration-200">
              <div className="flex items-center">
                <img
                  src={Pie}
                  alt="Pie"
                  className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3"
                />
                <p className="font-bold text-sm sm:text-base lg:text-[1.125rem] flex-1">
                  Student Attendance Details
                </p>
                <img 
                  src={Details}
                  alt="Details"
                  className="h-6 w-6 sm:h-8 sm:w-8 ml-2 sm:ml-auto sm:mr-2"
                />
              </div>
            </div>
          </Link>

          {/* Archive Subjects Card */}
          <Link to={"/ArchiveClass"}>
            <div className="bg-[#FFFFFF] text-[#465746] text-sm sm:text-base lg:text-[1.125rem] rounded-lg sm:rounded-xl shadow-md mt-5 p-3 sm:p-4 border-2 border-transparent hover:border-[#00874E] transition-all duration-200">
              <div className="flex items-center">
                <img 
                  src={Archive}
                  alt="Archive"
                  className="h-6 w-6 sm:h-8 sm:w-8 mr-2 sm:mr-3"
                />
                <p className="font-bold text-sm sm:text-base lg:text-[1.125rem] flex-1"> 
                  Archive Subjects
                </p>
                <img 
                  src={Details}
                  alt="Details"
                  className="h-6 w-6 sm:h-8 sm:w-8 ml-2 sm:ml-auto sm:mr-2"
                />
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  )
}