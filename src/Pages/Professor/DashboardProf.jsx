import React from 'react'
import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import Dashboard from '../../assets/Dashboard.svg';
import ClassHandled from '../../assets/ClassHandled.svg';
import ActivitiesToGrade from '../../assets/ActivitiesToGrade.svg';
import ID from '../../assets/ID.svg';
import Pie from '../../assets/Pie.svg';
import Details from '../../assets/Details.svg';
import Archive from '../../assets/ArchiveBox.svg';

export default function DashboardProf() {
  const [isOpen, setIsOpen] = useState(true);
  const [userName, setUserName] = useState("Professor");
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [handledSubjects, setHandledSubjects] = useState("");
  const [classesCount, setClassesCount] = useState(0);
  const [activitiesCount, setActivitiesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          
          const userIdFromStorage = user.id;
          
          if (userIdFromStorage) {
            setUserId(userIdFromStorage);
            
            const response = await fetch(`https://tracked.6minds.site/Professor/DashboardProfDB/get_class_count.php?id=${userIdFromStorage}`);
            
            if (response.ok) {
              const data = await response.json();
              
              if (data.success) {
                setUserData(data.user);
                const fullName = `${data.user.tracked_firstname} ${data.user.tracked_lastname}`;
                setUserName(fullName);
                
                setUserEmail(data.user.tracked_email);
                
                if (data.user.handled_subjects && data.user.handled_subjects.length > 0) {
                  setHandledSubjects(data.user.handled_subjects.join(", "));
                  setClassesCount(data.user.handled_subjects_count);
                } else {
                  setHandledSubjects("No subjects assigned");
                  setClassesCount(0);
                }

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

  const fetchActivitiesCount = async (professorId) => {
    try {
      const response = await fetch(`https://tracked.6minds.site/Professor/DashboardProfDB/get_activities_count.php?professor_id=${professorId}`);
      
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

  if (loading) {
    return (
      <div className="bg-[#23232C] min-h-screen">
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`
          transition-all duration-300
          ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
        `}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} userName={userName} />
          <div className="p-8 flex justify-center items-center h-64">
            <div className="text-white text-sm">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#23232C] min-h-screen">
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName={userName} />

        {/* content of PROFESSOR DASHBOARD*/}
        <div className="p-3 sm:p-4 md:p-5 text-white">

          {/* "Header" of PROFESSOR DASHBOARD */}
          <div className="mb-3">
            <div className="flex items-center mb-1">
              <img
                src={Dashboard}
                alt="Dashboard"
                className="h-5 w-5 mr-2"
              />
              <h1 className="font-bold text-lg text-white">
                Dashboard
              </h1>
            </div>
              <div className="text-sm text-white/80">
                <span>Welcome back,</span>
                <span className="font-bold ml-1 mr-1 text-white">{userName}!</span>
                <span>Let's see how your students are doing.</span>
              </div>
          </div>

          <hr className="border-white/30 mb-4 border-1" />

          {/* main content of PROFESSOR ADMIN */}

          {/* WIDGETS */}
          <div className='flex justify-center items-center mt-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-7xl'>

              {/* Widgets ACTIVE ACCOUNTS */}
              <div className='bg-[#15151C] h-28 rounded-lg p-3 text-white shadow-md border-2 border-[#15151C]'> 
                <div className='font-bold text-sm h-full flex flex-col'>
                  <h1 className='mb-1'> Class Handled </h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#767EE0]/50 h-10 w-10 rounded-lg'>
                      <img
                        src={ClassHandled}
                        alt="ClassHandled"
                        className="h-5 w-5"
                      />
                    </div>
                    <p className='pt-2 text-xl'>
                      {classesCount}
                    </p>
                  </div>
                </div>
              </div>

              {/* UPDATED: Activities to Grade Widget */}
              <div className='bg-[#15151C] h-28 rounded-lg p-3 text-white shadow-md border-2 border-[#15151C]'> 
                <div className='font-bold text-sm h-full flex flex-col'>
                  <h1 className='mb-1'> Activities to Grade </h1>
                  <div className='flex justify-between items-end mt-auto'>
                    <div className='flex justify-center items-center bg-[#A15353]/50 h-10 w-10 rounded-lg'>
                      <img 
                        src={ActivitiesToGrade}
                        alt="ActivitiesToGrade"
                        className="h-5 w-5"
                      />
                    </div>
                    <p className='pt-2 text-xl'>
                      {activitiesCount}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Prof Information Card */}
          <div className="bg-[#15151C] text-white text-sm rounded-lg shadow-md mt-4 p-3 border-2 border-[#15151C]">
            {/* Header: Name */}
            <div className="flex items-center">
              <img 
                src={ID}
                alt="ID"
                className="h-4 w-4 mr-2"
              />
              <p className="font-bold text-sm">{userName}</p>
            </div>

            <hr className="opacity-60 border-white/30 rounded border-1 my-2" />

            {/* Info rows */}
            <div className="pl-4 space-y-1">
              <div className="flex flex-col">
                <span className="font-bold text-xs w-full mb-1 text-white/70">Faculty Number:</span>
                <span className="text-xs">{userId || "N/A"}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs w-full mb-1 text-white/70">CvSU Email:</span>
                <span className="text-xs break-all">{userEmail || "N/A"}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs w-full mb-1 text-white/70">Handled Subject:</span>
                <span className="text-xs">{handledSubjects}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xs w-full mb-1 text-white/70">Department:</span>
                <span className="text-xs">{userData?.tracked_program || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Student Attendance Details Card */}
          <Link to={"/AnalyticsProf"}>
            <div className="bg-[#15151C] text-white text-sm rounded-lg shadow-md mt-3 p-2 border-2 border-transparent hover:border-[#00A15D] transition-all duration-200">
              <div className="flex items-center">
                <img
                  src={Pie}
                  alt="Pie"
                  className="h-5 w-5 mr-2"
                />
                <p className="font-bold text-sm flex-1">
                  Student Attendance Details
                </p>
                <img 
                  src={Details}
                  alt="Details"
                  className="h-5 w-5 ml-2"
                />
              </div>
            </div>
          </Link>

          {/* Archive Subjects Card */}
          <Link to={"/ArchiveClass"}>
            <div className="bg-[#15151C] text-white text-sm rounded-lg shadow-md mt-3 p-2 border-2 border-transparent hover:border-[#00A15D] transition-all duration-200">
              <div className="flex items-center">
                <img 
                  src={Archive}
                  alt="Archive"
                  className="h-5 w-5 mr-2"
                />
                <p className="font-bold text-sm flex-1"> 
                  Archive Subjects
                </p>
                <img 
                  src={Details}
                  alt="Details"
                  className="h-5 w-5 ml-2"
                />
              </div>
            </div>
          </Link>

        </div>
      </div>
    </div>
  )
}