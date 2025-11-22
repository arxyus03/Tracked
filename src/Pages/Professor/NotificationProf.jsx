import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";
import NotificationCard from "../../Components/NotificationCard";

import ArrowDown from "../../assets/ArrowDown(Light).svg";
import Notification from "../../assets/NotificationIcon.svg";
import Search from "../../assets/Search.svg";

export default function NotificationProf() {
  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [filterOption, setFilterOption] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user || !user.id) {
        throw new Error("User not found");
      }

      const formData = new FormData();
      formData.append("professor_id", user.id);

      const response = await fetch("https://tracked.6minds.site/Professor/NotificationDB/get_professor_notifications.php", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Load read status from localStorage
        const readNotifications = JSON.parse(localStorage.getItem('professorReadNotifications') || '{}');
        const notificationsWithReadStatus = data.notifications.map(notification => ({
          ...notification,
          isRead: readNotifications[notification.id] || false
        }));
        
        setNotifications(notificationsWithReadStatus);
        
        // Update unread count in localStorage for Header
        const unreadCount = notificationsWithReadStatus.filter(n => !n.isRead).length;
        localStorage.setItem('professorUnreadCount', unreadCount.toString());
        
        // Trigger storage event to update Header counter
        window.dispatchEvent(new Event('storage'));
      } else {
        throw new Error(data.message || "Failed to fetch notifications");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Refresh notifications every 30 seconds (changed from 5 minutes)
    const interval = setInterval(fetchNotifications, 30 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle mark as read
  const handleMarkAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId 
        ? { ...notification, isRead: true }
        : notification
    );
    
    setNotifications(updatedNotifications);
    
    // Save to localStorage
    const readNotifications = JSON.parse(localStorage.getItem('professorReadNotifications') || '{}');
    readNotifications[notificationId] = true;
    localStorage.setItem('professorReadNotifications', JSON.stringify(readNotifications));
    
    // Update unread count
    const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
    localStorage.setItem('professorUnreadCount', unreadCount.toString());
    window.dispatchEvent(new Event('storage'));
  };

  // Handle mark as unread
  const handleMarkAsUnread = (notificationId) => {
    const updatedNotifications = notifications.map(notification =>
      notification.id === notificationId 
        ? { ...notification, isRead: false }
        : notification
    );
    
    setNotifications(updatedNotifications);
    
    // Save to localStorage
    const readNotifications = JSON.parse(localStorage.getItem('professorReadNotifications') || '{}');
    localStorage.setItem('professorReadNotifications', JSON.stringify(readNotifications));
    
    // Update unread count
    const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
    localStorage.setItem('professorUnreadCount', unreadCount.toString());
    window.dispatchEvent(new Event('storage'));
  };

  // Filter notifications based on filter option and search query
  const filteredNotifications = notifications.filter(notification => {
    // Filter by read status
    if (filterOption === "Unread" && notification.isRead) return false;
    if (filterOption === "Read" && !notification.isRead) return false;
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        notification.title.toLowerCase().includes(query) ||
        notification.description.toLowerCase().includes(query) ||
        notification.subject?.toLowerCase().includes(query) ||
        notification.section?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Sort by newest first (latest to oldest) - FIXED
  const sortedNotifications = [...filteredNotifications].sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );

  if (loading) {
    return (
      <div>
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen}/>
          <div className="p-8 flex justify-center items-center h-64">
            <div className="text-lg">Loading notifications...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`transition-all duration-300 ${isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"}`}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen}/>
          <div className="p-8 flex justify-center items-center h-64">
            <div className="text-red-500 text-lg">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen}/>

        {/* content of NOTIFICATION*/}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img
                src={Notification}
                alt="Notification"
                className="h-7 w-7 sm:h-9 sm:w-9 mr-2 sm:mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                Notification
              </h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-[#465746]">
              Account Notification
            </p>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Filter and Search - Responsive Layout */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-5 sm:mb-6">
            {/* Filter dropdown */}
            <div className="relative sm:flex-initial filter-dropdown">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full sm:w-auto font-bold px-4 py-2.5 bg-white rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] active:border-[#00874E] transition-all duration-200 text-sm sm:text-base sm:min-w-[160px] cursor-pointer touch-manipulation"
              >
                <span>{filterOption}</span>
                <img
                  src={ArrowDown}
                  alt=""
                  className={`ml-3 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Filter Dropdown SELECTIONS */}
              {open && (
                <div className="absolute top-full mt-2 bg-white rounded-md w-full sm:min-w-[200px] shadow-xl border border-gray-200 z-20 overflow-hidden">
                  {["All", "Unread", "Read", "Newest"].map((filter) => (
                    <button
                      key={filter}
                      className={`block px-4 py-2.5 w-full text-left hover:bg-gray-100 active:bg-gray-200 text-sm sm:text-base transition-colors duration-150 cursor-pointer touch-manipulation ${
                        filterOption === filter ? 'bg-gray-50 font-semibold' : ''
                      }`}
                      onClick={() => {
                        setFilterOption(filter);
                        setOpen(false);
                      }}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search bar */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search notifications..."
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

          {/* Notification Cards */}
          <div className="space-y-4 sm:space-y-5">
            {sortedNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No notifications found.
              </div>
            ) : (
              sortedNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  title={notification.title}
                  description={notification.description}
                  date={new Date(notification.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                  isRead={notification.isRead}
                  onMarkAsRead={() => handleMarkAsRead(notification.id)}
                  onMarkAsUnread={() => handleMarkAsUnread(notification.id)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}