import React, { useEffect, useState } from 'react';
import Menu from '../assets/MenuLine(Light).svg';
import Notification from '../assets/NotificationIcon.svg';
import ProfilePhoto from '../assets/ProfilePhoto.svg';
import ArrowDown from '../assets/ArrowDown(Light).svg';

function Header({ setIsOpen, userName = "User" }) {
  {/* Date Function*/}
  const [weekday, setWeekday] = useState("");
  const [fullDate, setFullDate] = useState("");
  const [year, setYear] = useState("");

  useEffect(() => {
    const today = new Date();
    setWeekday(today.toLocaleDateString("en-US", { weekday: "long" }));
    setFullDate(today.toLocaleDateString("en-US", { month: "long", day: "numeric" }));
    setYear(today.getFullYear());
  }, []);

  return (
    <div className='bg-white sticky top-0 z-30'>
      {/* HEADER content */}
      
      <div className='flex items-center justify-between px-2 sm:px-4 py-3'>
        {/* LEFT SIDE : menu and date */}
        <div className='flex items-center'>
          <img 
            src={Menu}
            alt="Menu"
            className='h-8 w-8 sm:h-10 sm:w-10 mt-[-0.2rem] cursor-pointer flex-shrink-0'
            onClick={() => setIsOpen(prev => !prev)}
          />
          
          <div className="flex flex-wrap items-center ml-2 sm:ml-4 mt-0">
            <p className="text-[#465746] text-sm sm:text-base mr-1 sm:mr-1">{weekday}{","}</p>
            <p className="text-[#465746] text-sm sm:text-base mr-1 sm:mr-1 hidden xs:block"> | </p>
            <p className="text-[#465746] text-sm sm:text-base mr-1 sm:mr-1">{fullDate}{","}</p>
            <p className="text-[#465746] text-sm sm:text-base mr-1 sm:mr-1">{year}</p>
          </div>
        </div>

        {/* RIGHT SIDE : notifs and profile */}
        <div className='flex cursor-pointer items-center'>
          {/* NOTIF */}
          <div className="flex items-center mr-2 sm:mr-4">
            <img 
              src={Notification} 
              alt="Notification"
              className='h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0' />
            <p className="text-[#00874E] text-sm sm:text-base font-bold ml-1 sm:ml-2"> X </p>
            <p className="text-[#465746] text-sm sm:text-base font-bold mr-1 sm:mr-2 ml-1 sm:ml-2 hidden sm:block">New</p>
          </div>
          
          {/* PROFILE */}
          <div className="flex items-center">
            <img src={ProfilePhoto} 
              alt="Profile Photo"
              className='h-6 w-6 sm:h-7 sm:w-7 mt-[-0.1rem] ml-2 sm:ml-5 mr-1 sm:mr-3 flex-shrink-0'
            />
            <div className="hidden md:flex items-center">
              <p className="text-[#465746] text-sm mr-1 sm:mr-2 hidden lg:block">{userName}</p>
            </div>
          </div>
        </div>
      </div>
      <hr className="mx-2 ml-0 mr-0 sm:ml-0 sm:mr-0 opacity-40 border-[#465746] rounded border-1" />
    </div>
  );
}

export default Header;