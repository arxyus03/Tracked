import React, { useEffect, useState } from 'react';

import Menu from '../assets/MenuLine(Light).svg';
import Notification from '../assets/NotificationIcon.svg';
import ProfilePhoto from '../assets/ProfilePhoto.svg';

function Header({ setIsOpen, userName = "User" }) {

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
    <div>
      {/* HEADER */}
      <div className="flex">
        {/* Left: Menu + Date */}
        <div className="flex mt-2 px-4 py-3 cursor-pointer items-center">
          <img 
            src={Menu} 
            alt="Menu" 
            className="h-10 w-10 mt-[-0.4rem] cursor-pointer"
            onClick={() => setIsOpen(prev => !prev)} 
          />
          
          <p className="text-[#465746] text-[1.125rem] font-bold mr-2 ml-2">{weekday}</p>
          <p className="text-[#465746] text-[1.125rem] mr-2">|</p>
          <p className="text-[#465746] text-[1.125rem] mr-2">{fullDate}</p>
          <p className="text-[#465746] text-[1.125rem]">{year}</p>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex mt-2 px-4 py-3 cursor-pointer items-center ml-auto">
          <img src={Notification} alt="Notification" className="h-5 w-5" />
          <p className="text-[#00874E] text-[1.125rem] font-bold ml-2">X</p>
          <p className="text-[#465746] text-[1.125rem] font-bold mr-2 ml-2">New</p>
          <img src={ProfilePhoto} alt="Profile Photo" className="h-7 w-7 mt-[-0.1rem] ml-5 mr-5" />
          <p className="text-[#465746] text-[1.125rem] mr-2">{userName}</p>
        </div>
      </div>

      <hr className="ml-5 mr-5 opacity-60 border-[#465746] rounded border-1" />
    </div>
  );
}

export default Header;
