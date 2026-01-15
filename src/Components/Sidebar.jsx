import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Dashboard from "../assets/Dashboard.svg";
import Subjects from "../assets/Subjects.svg";
import Analytics from "../assets/Analytics.svg";
import ClassManagement from "../assets/ClassManagement.svg";
import Report from "../assets/Report.svg";
import Import from "../assets/Import.svg";
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
  const [isDarkMode, setIsDarkMode] = useState(false); // Default to light mode
  const location = useLocation();

  // Check for theme preference on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark';
    setIsDarkMode(isDark);
  }, []);

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    };

    // Create a mutation observer to watch for class changes on html element
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const isControlled = typeof isOpenProp !== "undefined" && typeof setIsOpenProp === "function";
  const isOpen = isControlled ? isOpenProp : localOpen;
  const setIsOpen = isControlled ? setIsOpenProp : setLocalOpen;

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

  const fetchStudentSubjects = async () => {
    if (role !== "student") return;
    
    try {
      setLoadingSubjects(true);
      const studentId = getUserId();
      
      if (!studentId) return;
      
      const response = await fetch(`https://tracked.6minds.site/Student/SubjectsDB/get_student_classes.php?student_id=${studentId}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStudentSubjects(result.classes || []);
        } else {
          setStudentSubjects([]);
        }
      }
    } catch (error) {
      console.error('Error fetching student subjects:', error);
      setStudentSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchTeacherClasses = async () => {
    if (role !== "teacher") return;
    
    try {
      setLoadingClasses(true);
      const professorId = getUserId();
      
      if (!professorId) return;
      
      const response = await fetch(`https://tracked.6minds.site/Professor/ClassManagementDB/get_classes.php?professor_ID=${professorId}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setTeacherClasses(result.classes || []);
        } else {
          setTeacherClasses([]);
        }
      }
    } catch (error) {
      console.error('Error fetching teacher classes:', error);
      setTeacherClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      if (!isControlled) {
        setLocalOpen(!mobile);
      }
    };
    
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [isControlled]);

  useEffect(() => {
    if (role === "student") {
      fetchStudentSubjects();
    } else if (role === "teacher") {
      fetchTeacherClasses();
    }
  }, [role]);

  useEffect(() => {
    if (role === "student" && (location.pathname === '/Subjects' || location.pathname.includes('/Subject'))) {
      setSubjectsDropdownOpen(true);
    } else if (role === "teacher" && (location.pathname === '/ClassManagement' || location.pathname.includes('/SubjectOverviewProfessor') || location.pathname.includes('/Class') || location.pathname.includes('/Attendance') || location.pathname.includes('/GradeTab') || location.pathname.includes('/AnalyticsTab'))) {
      setClassesDropdownOpen(true);
    }
  }, [location.pathname, role]);

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

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isMobile && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMobile, isOpen, setIsOpen]);

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

  const getCurrentCode = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('code');
  };

  const menus = {
    student: {
      main: [
        { label: "Dashboard", icon: Dashboard, path: "/DashboardStudent" },
        { label: "Subjects", icon: Subjects, path: "/Subjects", hasDropdown: true },
      ],
      extras: [
        { label: "Profile", icon: Profile, path: "/ProfileStudent" },
        { label: "Account Setting", icon: AccountSettings, path: "/AccountSetting" },
      ],
    },
    teacher: {
      main: [
        { label: "Dashboard", icon: Dashboard, path: "/DashboardProf" },
        { label: "Class Management", icon: ClassManagement, path: "/ClassManagement", hasDropdown: true },
        { label: "Reports", icon: Analytics, path: "/AnalyticsProf" },
      ],
      extras: [
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
        { label: "Import", icon: Import, path: "/SuperAdminImport" },
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

  // Theme-based styles
  const getBackgroundColor = () => {
    return isDarkMode ? "#15151C" : "#ffffff";
  };

  const getBorderColor = () => {
    return isDarkMode ? "#23232C" : "#e5e7eb";
  };

  const getTextColor = () => {
    return isDarkMode ? "#ffffff" : "#1f2937";
  };

  const getSecondaryTextColor = () => {
    return isDarkMode ? "#d1d5db" : "#6b7280";
  };

  const getDividerColor = () => {
    return isDarkMode ? "#dbdbdb/40" : "#e5e7eb";
  };

  const getHoverBgColor = () => {
    return isDarkMode ? "rgba(0, 161, 93, 0.2)" : "rgba(0, 161, 93, 0.1)";
  };

  const getActiveBgColor = () => {
    return isDarkMode ? "rgba(0, 161, 93, 0.2)" : "rgba(0, 161, 93, 0.15)";
  };

  const getLogoFilter = () => {
    return isDarkMode ? "none" : "invert(1)";
  };

  const navItemBase = "flex items-center px-4 py-3 rounded-lg cursor-pointer select-none transition-colors duration-150";

  return (
    <>
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen select-none z-50 shadow-xl transition-transform duration-300 ease-in-out border-r
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        w-[75%] max-w-[280px] sm:w-[240px] lg:w-[250px] xl:w-[270px] 2xl:w-[290px]`}
        style={{ 
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor()
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex-shrink-0 p-4 pb-3">
            <div className="flex justify-center">
              <img 
                src={TextLogo} 
                alt="TrackED Logo" 
                className="h-10" 
                style={{ filter: getLogoFilter() }}
              />
            </div>
            <hr className="rounded border-1 mt-4" style={{ borderColor: getDividerColor() }} />
          </div>

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
                    <div className="mb-1">
                      <button
                        onClick={() => setSubjectsDropdownOpen(!subjectsDropdownOpen)}
                        className={`${navItemBase} w-full justify-between`}
                        style={{ 
                          backgroundColor: subjectsDropdownOpen ? getActiveBgColor() : 'transparent',
                          color: getTextColor()
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getHoverBgColor()}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = subjectsDropdownOpen ? getActiveBgColor() : 'transparent'}
                      >
                        <div className="flex items-center">
                          <img 
                            src={item.icon} 
                            alt="icons" 
                            className="h-5 w-5 mr-3 flex-shrink-0" 
                            style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                          />
                          <span className="text-sm sm:text-[1rem] truncate">{item.label}</span>
                        </div>
                        <img 
                          src={ArrowDown} 
                          alt=""
                          className={`h-3 w-3 transition-transform duration-200 ${
                            subjectsDropdownOpen ? "rotate-180" : ""
                          }`}
                          style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                        />
                      </button>
                      
                      {subjectsDropdownOpen && (
                        <div className="ml-4 mt-1 mb-2 border-transparent pl-2">
                          {loadingSubjects ? (
                            <div className="px-4 py-2">
                              <div className="text-xs opacity-70" style={{ color: getSecondaryTextColor() }}>Loading subjects...</div>
                            </div>
                          ) : studentSubjects.length > 0 ? (
                            studentSubjects.map((subject) => {
                              const currentCode = getCurrentCode();
                              const isSubjectActive = currentCode === subject.subject_code;
                              
                              return (
                                <NavLink
                                  key={subject.subject_code}
                                  to={`/SubjectOverviewStudent?code=${subject.subject_code}`}
                                  onClick={handleDropdownClick}
                                  className={`flex items-center px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors duration-150 mb-1`}
                                  style={{ 
                                    color: getTextColor(),
                                    backgroundColor: isSubjectActive ? getActiveBgColor() : 'transparent'
                                  }}
                                  onMouseEnter={(e) => !isSubjectActive && (e.currentTarget.style.backgroundColor = getHoverBgColor())}
                                  onMouseLeave={(e) => !isSubjectActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium truncate">{subject.subject}</div>
                                    <div className="text-xs truncate" style={{ color: getSecondaryTextColor() }}>
                                      {subject.section} • {subject.subject_code}
                                    </div>
                                  </div>
                                </NavLink>
                              );
                            })
                          ) : (
                            <div className="px-3 py-2">
                              <div className="text-xs opacity-70" style={{ color: getSecondaryTextColor() }}>No subjects enrolled</div>
                            </div>
                          )}
                          
                          <NavLink
                            to="/Subjects"
                            onClick={handleDropdownClick}
                            className={`flex items-center px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors duration-150 mt-1 border-t pt-2`}
                            style={({ isActive }) => ({
                              color: getTextColor(),
                              backgroundColor: isActive ? getActiveBgColor() : 'transparent',
                              borderColor: getDividerColor()
                            })}
                            onMouseEnter={(e) => !e.currentTarget.classList.contains('bg-[#00A15D]/20') && (e.currentTarget.style.backgroundColor = getHoverBgColor())}
                            onMouseLeave={(e) => !e.currentTarget.classList.contains('bg-[#00A15D]/20') && (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <div className="font-medium">View All Subjects</div>
                          </NavLink>
                        </div>
                      )}
                    </div>
                  ) : item.hasDropdown && role === "teacher" ? (
                    <div className="mb-1">
                      <button
                        onClick={() => setClassesDropdownOpen(!classesDropdownOpen)}
                        className={`${navItemBase} w-full justify-between`}
                        style={{ 
                          backgroundColor: classesDropdownOpen ? getActiveBgColor() : 'transparent',
                          color: getTextColor()
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getHoverBgColor()}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = classesDropdownOpen ? getActiveBgColor() : 'transparent'}
                      >
                        <div className="flex items-center">
                          <img 
                            src={item.icon} 
                            alt="icons" 
                            className="h-5 w-5 mr-3 flex-shrink-0" 
                            style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                          />
                          <span className="text-sm sm:text-[1rem] truncate">{item.label}</span>
                        </div>
                        <img 
                          src={ArrowDown} 
                          alt=""
                          className={`h-3 w-3 transition-transform duration-200 ${
                            classesDropdownOpen ? "rotate-180" : ""
                          }`}
                          style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                        />
                      </button>
                      
                      {classesDropdownOpen && (
                        <div className="ml-4 mt-1 mb-2 border-transparent pl-2">
                          {loadingClasses ? (
                            <div className="px-4 py-2">
                              <div className="text-xs opacity-70" style={{ color: getSecondaryTextColor() }}>Loading classes...</div>
                            </div>
                          ) : teacherClasses.length > 0 ? (
                            teacherClasses.map((classItem) => {
                              const currentCode = getCurrentCode();
                              const isClassActive = currentCode === classItem.subject_code;
                              
                              return (
                                <NavLink
                                  key={classItem.subject_code}
                                  to={`/SubjectOverviewProfessor?code=${classItem.subject_code}`}
                                  onClick={handleDropdownClick}
                                  className={`flex items-center px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors duration-150 mb-1`}
                                  style={{ 
                                    color: getTextColor(),
                                    backgroundColor: isClassActive ? getActiveBgColor() : 'transparent',
                                    borderLeft: isClassActive ? '2px solid currentColor' : 'none'
                                  }}
                                  onMouseEnter={(e) => !isClassActive && (e.currentTarget.style.backgroundColor = getHoverBgColor())}
                                  onMouseLeave={(e) => !isClassActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="font-medium truncate">{classItem.subject}</div>
                                    <div className="text-xs truncate" style={{ color: getSecondaryTextColor() }}>
                                      {classItem.section} • {classItem.year_level} • {classItem.subject_code}
                                    </div>
                                  </div>
                                </NavLink>
                              );
                            })
                          ) : (
                            <div className="px-3 py-2">
                              <div className="text-xs opacity-70" style={{ color: getSecondaryTextColor() }}>No classes created</div>
                            </div>
                          )}
                          
                          <NavLink
                            to="/ClassManagement"
                            onClick={handleDropdownClick}
                            className={`flex items-center px-3 py-2 rounded-lg text-xs sm:text-sm transition-colors duration-150 mt-1 border-t pt-2`}
                            style={({ isActive }) => ({
                              color: getTextColor(),
                              backgroundColor: isActive ? getActiveBgColor() : 'transparent',
                              borderColor: getDividerColor()
                            })}
                            onMouseEnter={(e) => !e.currentTarget.classList.contains('bg-[#00A15D]/20') && (e.currentTarget.style.backgroundColor = getHoverBgColor())}
                            onMouseLeave={(e) => !e.currentTarget.classList.contains('bg-[#00A15D]/20') && (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <div className="font-medium">Manage All Classes</div>
                          </NavLink>
                        </div>
                      )}
                    </div>
                  ) : (
                    <NavLink
                      to={item.path}
                      onClick={handleLinkClick}
                      className={({ isActive }) => `${navItemBase}`}
                      style={({ isActive }) => ({
                        color: getTextColor(),
                        backgroundColor: isActive ? getActiveBgColor() : 'transparent'
                      })}
                      onMouseEnter={(e) => !e.currentTarget.classList.contains('bg-[#00A15D]/20') && (e.currentTarget.style.backgroundColor = getHoverBgColor())}
                      onMouseLeave={(e) => !e.currentTarget.classList.contains('bg-[#00A15D]/20') && (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <img 
                        src={item.icon} 
                        alt="icons" 
                        className="h-5 w-5 mr-3 flex-shrink-0" 
                        style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                      />
                      <span className="text-sm sm:text-[1rem] truncate">{item.label}</span>
                    </NavLink>
                  )}
                </div>
              ))}
            </div>

            {menus[role]?.extras?.length > 0 && (
              <div className="pt-2 pb-2">
                <hr className="rounded border-1 my-3" style={{ borderColor: getDividerColor() }} />
                <div className="flex flex-col gap-1">
                  {menus[role].extras.map((item, index) => (
                    <NavLink
                      key={`${item.label}-extra-${index}`}
                      to={item.path}
                      onClick={handleLinkClick}
                      className={({ isActive }) => `${navItemBase}`}
                      style={({ isActive }) => ({
                        color: getTextColor(),
                        backgroundColor: isActive ? getActiveBgColor() : 'transparent'
                      })}
                      onMouseEnter={(e) => !e.currentTarget.classList.contains('bg-[#00A15D]/20') && (e.currentTarget.style.backgroundColor = getHoverBgColor())}
                      onMouseLeave={(e) => !e.currentTarget.classList.contains('bg-[#00A15D]/20') && (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <img 
                        src={item.icon} 
                        alt="" 
                        className="h-5 w-5 mr-3 flex-shrink-0" 
                        style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                      />
                      <span className="text-sm sm:text-[1rem] truncate">{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            )}
          </nav>

          <div className="flex-shrink-0 p-4 pt-2 border-t" style={{ borderColor: getDividerColor() }}>
            <NavLink 
              to="/Login" 
              onClick={handleLinkClick} 
              className={navItemBase}
              style={{ color: getTextColor() }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = getHoverBgColor()}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <img 
                src={LogOut} 
                alt="" 
                className="h-5 w-5 mr-3 flex-shrink-0" 
                style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
              />
              <span className="text-sm sm:text-[1rem] truncate">Log out</span>
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}