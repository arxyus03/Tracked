import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

import Dashboard from "../assets/Dashboard.svg";
import Subjects from "../assets/Subjects.svg";
import Analytics from "../assets/Analytics.svg";
import ClassManagement from "../assets/ClassManagement.svg";
import Announcement from "../assets/Announcement.svg";
import Report from "../assets/Report.svg";
import AccountRequest from "../assets/AccountRequest.svg";
import Import from "../assets/Import.svg";
import Notification from "../assets/Notification.svg";
import Profile from "../assets/Profile.svg";
import AccountSettings from "../assets/Settings.svg";
import LogOut from "../assets/LogOut.svg";
import TextLogo from "../assets/New-FullWhite-TrackEdLogo.svg";
import ArrowDown from "../assets/ArrowDown(Dark).svg";

export default function Sidebar({ role = "student", isOpen: isOpenProp, setIsOpen: setIsOpenProp }) {
  const [localOpen, setLocalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [studentSubjects, setStudentSubjects] = useState([]);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [subjectsDropdownOpen, setSubjectsDropdownOpen] = useState(false);
  const [classesDropdownOpen, setClassesDropdownOpen] = useState(false);
  const location = useLocation();

  const isControlled = typeof isOpenProp !== "undefined" && typeof setIsOpenProp === "function";
  const isOpen = isControlled ? isOpenProp : localOpen;
  const setIsOpen = isControlled ? setIsOpenProp : setLocalOpen;

  // Get user ID from localStorage
  const getUserId = () => {
    try {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        return userData.id;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
    return null;
  };

  // Fetch student's enrolled subjects
  const fetchStudentSubjects = async () => {
    if (role !== "student") return;
    
    try {
      setLoadingSubjects(true);
      const studentId = getUserId();
      
      if (!studentId) {
        console.error('No student ID found');
        setLoadingSubjects(false);
        return;
      }
      
      const response = await fetch(`https://tracked.6minds.site/Student/SubjectsDB/get_student_classes.php?student_id=${studentId}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Student subjects response:', result);
        if (result.success) {
          setStudentSubjects(result.classes || []);
        } else {
          console.error('Error fetching subjects:', result.message);
          setStudentSubjects([]);
        }
      } else {
        throw new Error('Failed to fetch subjects');
      }
    } catch (error) {
      console.error('Error fetching student subjects:', error);
      setStudentSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Fetch teacher's classes - USING THE SAME ENDPOINT AS CLASS MANAGEMENT PAGE
  const fetchTeacherClasses = async () => {
    if (role !== "teacher") return;
    
    try {
      setLoadingClasses(true);
      const professorId = getUserId();
      
      if (!professorId) {
        console.error('No professor ID found');
        setLoadingClasses(false);
        return;
      }
      
      // Using the same endpoint that works in the Class Management page
      const response = await fetch(`https://tracked.6minds.site/Professor/ClassManagementDB/get_classes.php?professor_ID=${professorId}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Teacher classes response:', result);
        if (result.success) {
          setTeacherClasses(result.classes || []);
        } else {
          console.error('Error fetching classes:', result.message);
          setTeacherClasses([]);
        }
      } else {
        throw new Error('Failed to fetch classes');
      }
    } catch (error) {
      console.error('Error fetching teacher classes:', error);
      setTeacherClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Check screen size and set initial state
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Auto-open on desktop, auto-close on mobile (only if uncontrolled)
      if (!isControlled) {
        setLocalOpen(!mobile);
      }
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [isControlled]);

  // Fetch data when component mounts based on role
  useEffect(() => {
    if (role === "student") {
      fetchStudentSubjects();
    } else if (role === "teacher") {
      fetchTeacherClasses();
    }
  }, [role]);

  // Auto-open dropdowns if current path matches and we have data
  useEffect(() => {
    if (role === "student" && (location.pathname === '/Subjects' || location.pathname.includes('/Subject'))) {
      setSubjectsDropdownOpen(true);
    } else if (role === "teacher" && (location.pathname === '/ClassManagement' || location.pathname.includes('/Class'))) {
      setClassesDropdownOpen(true);
    }
  }, [location.pathname, role, studentSubjects, teacherClasses]);

  // Handle outside clicks on mobile only
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isMobile && isOpen && !event.target.closest("aside") && !event.target.closest("button[data-sidebar-toggle]")) {
        setIsOpen(false);
      }
    };
    
    if (isMobile && isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      return () => document.removeEventListener("mousedown", handleOutsideClick);
    }
  }, [isMobile, isOpen, setIsOpen]);

  // Handle escape key on mobile only
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isMobile && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMobile, isOpen, setIsOpen]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, isOpen]);

  // Get current subject/class code from URL
  const getCurrentCode = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('code');
  };

  // Check if a specific subject is currently active (for students)
  const isSubjectActive = (subject) => {
    const currentCode = getCurrentCode();
    return currentCode === subject.subject_code;
  };

  // Check if a specific class is currently active (for teachers)
  const isClassActive = (classItem) => {
    const currentCode = getCurrentCode();
    return currentCode === classItem.subject_code;
  };

  // Role menus
  const menus = {
    student: {
      main: [
        { label: "Dashboard", icon: Dashboard, path: "/DashboardStudent" },
        { 
          label: "Subjects", 
          icon: Subjects, 
          path: "/Subjects",
          hasDropdown: true
        },
        { label: "Reports", icon: Analytics, path: "/AnalyticsStudent" },
      ],
      extras: [
        { label: "Notification", icon: Notification, path: "/NotificationStudent" },
        { label: "Profile", icon: Profile, path: "/ProfileStudent" },
        { label: "Account Setting", icon: AccountSettings, path: "/AccountSetting" },
      ],
    },

    teacher: {
      main: [
        { label: "Dashboard", icon: Dashboard, path: "/DashboardProf" },
        { 
          label: "Class Management", 
          icon: ClassManagement, 
          path: "/ClassManagement",
          hasDropdown: true
        },
        { label: "Reports", icon: Analytics, path: "/AnalyticsProf" },
      ],
      extras: [
        { label: "Notification", icon: Notification, path: "/NotificationProf" },
        { label: "Profile", icon: Profile, path: "/ProfileProf" },
        { label: "Account Setting", icon: AccountSettings, path: "/AccountSettingProf" },
      ],
    },

    admin: {
      main: [
        { label: "User Management", icon: ClassManagement, path: "/UserManagement" },
        { label: "Reports", icon: Report, path: "/Report" },
        { label: "Import", icon: Import, path: "/Import" },
      ],
    },

    superadmin: {
      main: [
        { label: "User Management", icon: ClassManagement, path: "/SuperAdminAccountList" },
        { label: "Import", icon: Import, path: "/SuperAdminLanding" },
      ],
    },
  };

  const handleLinkClick = () => {
    if (isMobile) setIsOpen(false);
  };

  const handleDropdownClick = () => {
    if (isMobile) setIsOpen(false);
    setSubjectsDropdownOpen(false);
    setClassesDropdownOpen(false);
  };

  const navItemBase =
    "flex items-center px-4 py-3 rounded-lg hover:bg-[#00A15D] cursor-pointer select-none transition-colors duration-150";

  return (
    <>
      {/* Backdrop overlay for mobile only */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-[#00874E] select-none z-50 shadow-xl transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        w-[75%] max-w-[280px] sm:w-[240px] lg:w-[250px] xl:w-[270px] 2xl:w-[290px]`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo section */}
          <div className="flex-shrink-0 p-4 pb-3">
            <div className="flex justify-center">
              <img src={TextLogo} alt="TrackED Logo" className="h-10" />
            </div>
            <hr className="border-[#DBDBDB] rounded border-1 opacity-40 mt-4" />
          </div>

          {/* Main navigation - conditionally scrollable */}
          <nav 
            className={`flex-1 px-4 ${
              (subjectsDropdownOpen && role === "student") || (classesDropdownOpen && role === "teacher")
                ? "overflow-hidden" 
                : "overflow-y-auto overflow-x-hidden"
            }`}
          >
            <div className="flex flex-col gap-1 py-2">
              {menus[role]?.main?.map((item, index) => (
                <div key={`${item.label}-${index}`}>
                  {item.hasDropdown && role === "student" ? (
                    // Subjects with dropdown for students
                    <div className="mb-1">
                      <button
                        onClick={() => setSubjectsDropdownOpen(!subjectsDropdownOpen)}
                        className={`${navItemBase} w-full justify-between ${
                          subjectsDropdownOpen ? "bg-[#00A15D]" : ""
                        }`}
                      >
                        <div className="flex items-center">
                          <img src={item.icon} alt="icons" className="h-5 w-5 mr-3 flex-shrink-0" />
                          <span className="text-white text-sm sm:text-[1rem] truncate">{item.label}</span>
                        </div>
                        <img 
                          src={ArrowDown} 
                          alt=""
                          className={`h-3 w-3 transition-transform duration-200 ${
                            subjectsDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      
                      {/* Subjects Dropdown */}
                      {subjectsDropdownOpen && (
                        <div className="ml-4 mt-1 mb-2 border-transparent pl-2">
                          {loadingSubjects ? (
                            <div className="px-4 py-2">
                              <div className="text-white text-xs opacity-70">Loading subjects...</div>
                            </div>
                          ) : studentSubjects.length > 0 ? (
                            studentSubjects.map((subject) => {
                              const isActive = isSubjectActive(subject);
                              
                              return (
                                <NavLink
                                  key={subject.subject_code}
                                  to={`/SubjectAnnouncementStudent?code=${subject.subject_code}`}
                                  onClick={handleDropdownClick}
                                  className={`flex items-center px-3 py-2 rounded-lg text-white text-xs sm:text-sm hover:bg-[#00A15D] transition-colors duration-150 mb-1 ${
                                    isActive ? "bg-[#00A15D] border-l-2 border-white font-semibold" : ""
                                  }`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium truncate">{subject.subject}</div>
                                    <div className="text-white/70 text-xs truncate">
                                      {subject.section} • {subject.subject_code}
                                    </div>
                                  </div>
                                </NavLink>
                              );
                            })
                          ) : (
                            <div className="px-3 py-2">
                              <div className="text-white text-xs opacity-70">No subjects enrolled</div>
                              <div className="text-white/80 text-xs mt-1">
                                Contact your professor to enroll
                              </div>
                            </div>
                          )}
                          
                          {/* Always show link to Subjects page */}
                          <NavLink
                            to="/Subjects"
                            onClick={handleDropdownClick}
                            className={({ isActive }) =>
                              `flex items-center px-3 py-2 rounded-lg text-white text-xs sm:text-sm hover:bg-[#00A15D] transition-colors duration-150 mt-1 border-t border-white/20 pt-2 ${
                                isActive ? "bg-[#00A15D]" : ""
                              }`
                            }
                          >
                            <div className="font-medium">View All Subjects</div>
                          </NavLink>
                        </div>
                      )}
                    </div>
                  ) : item.hasDropdown && role === "teacher" ? (
                    // Class Management with dropdown for teachers
                    <div className="mb-1">
                      <button
                        onClick={() => setClassesDropdownOpen(!classesDropdownOpen)}
                        className={`${navItemBase} w-full justify-between ${
                          classesDropdownOpen ? "bg-[#00A15D]" : ""
                        }`}
                      >
                        <div className="flex items-center">
                          <img src={item.icon} alt="icons" className="h-5 w-5 mr-3 flex-shrink-0" />
                          <span className="text-white text-sm sm:text-[1rem] truncate">{item.label}</span>
                        </div>
                        <img 
                          src={ArrowDown} 
                          alt=""
                          className={`h-3 w-3 transition-transform duration-200 ${
                            classesDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      
                      {/* Classes Dropdown */}
                      {classesDropdownOpen && (
                        <div className="ml-4 mt-1 mb-2 border-transparent pl-2">
                          {loadingClasses ? (
                            <div className="px-4 py-2">
                              <div className="text-white text-xs opacity-70">Loading classes...</div>
                            </div>
                          ) : teacherClasses.length > 0 ? (
                            teacherClasses.map((classItem) => {
                              const isActive = isClassActive(classItem);
                              
                              return (
                                <NavLink
                                  key={classItem.subject_code}
                                  to={`/Class?code=${classItem.subject_code}`}
                                  onClick={handleDropdownClick}
                                  className={`flex items-center px-3 py-2 rounded-lg text-white text-xs sm:text-sm hover:bg-[#00A15D] transition-colors duration-150 mb-1 ${
                                    isActive ? "bg-[#00A15D] border-l-2 border-white font-semibold" : ""
                                  }`}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium truncate">{classItem.subject}</div>
                                    <div className="text-white/70 text-xs truncate">
                                      {classItem.section} • {classItem.year_level} • {classItem.subject_code}
                                    </div>
                                  </div>
                                </NavLink>
                              );
                            })
                          ) : (
                            <div className="px-3 py-2">
                              <div className="text-white text-xs opacity-70">No classes created</div>
                              <div className="text-white/80 text-xs mt-1">
                                Create your first class to get started
                              </div>
                            </div>
                          )}
                          
                          {/* Always show link to Class Management page */}
                          <NavLink
                            to="/ClassManagement"
                            onClick={handleDropdownClick}
                            className={({ isActive }) =>
                              `flex items-center px-3 py-2 rounded-lg text-white text-xs sm:text-sm hover:bg-[#00A15D] transition-colors duration-150 mt-1 border-t border-white/20 pt-2 ${
                                isActive ? "bg-[#00A15D]" : ""
                              }`
                            }
                          >
                            <div className="font-medium">Manage All Classes</div>
                          </NavLink>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Regular navigation item
                    <NavLink
                      to={item.path}
                      onClick={handleLinkClick}
                      className={({ isActive }) =>
                        `${navItemBase} ${isActive ? "bg-[#00A15D]" : ""}`
                      }
                    >
                      <img src={item.icon} alt="icons" className="h-5 w-5 mr-3 flex-shrink-0" />
                      <span className="text-white text-sm sm:text-[1rem] truncate">{item.label}</span>
                    </NavLink>
                  )}
                </div>
              ))}
            </div>

            {/* Extra menu items */}
            {menus[role]?.extras?.length > 0 && (
              <div className="pt-2 pb-2">
                <hr className="border-[#DBDBDB] rounded border-1 opacity-40 my-3" />
                <div className="flex flex-col gap-1">
                  {menus[role].extras.map((item, index) => (
                    <NavLink
                      key={`${item.label}-extra-${index}`}
                      to={item.path}
                      onClick={handleLinkClick}
                      className={({ isActive }) =>
                        `${navItemBase} ${isActive ? "bg-[#00A15D]" : ""}`
                      }
                    >
                      <img src={item.icon} alt="" className="h-5 w-5 mr-3 flex-shrink-0" />
                      <span className="text-white text-sm sm:text-[1rem] truncate">{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* Logout section - fixed at bottom */}
          <div className="flex-shrink-0 p-4 pt-2 border-t border-[#DBDBDB]/20">
            <NavLink 
              to="/Login" 
              onClick={handleLinkClick} 
              className={navItemBase}
            >
              <img src={LogOut} alt="" className="h-5 w-5 mr-3 flex-shrink-0" />
              <span className="text-white text-sm sm:text-[1rem] truncate">Log out</span>
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}