import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import ClassManagementIcon from "../../assets/ClassManagement(Light).svg";
import ArrowDown from "../../assets/ArrowDown(Light).svg";
import Archive from "../../assets/Archive.svg";
import Palette from "../../assets/Palette.svg";
import Add from "../../assets/Add(Light).svg";
import Book from "../../assets/ClassManagementSubject(Light).svg";
import BackButton from "../../assets/BackButton(Light).svg";
import ArchiveWarningIcon from "../../assets/Warning(Yellow).svg";
import SuccessIcon from '../../assets/Success(Green).svg';

export default function ClassManagement() {
  const [isOpen, setIsOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false); // Added theme state

  // Modal form states
  const [selectedYearLevel, setSelectedYearLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [section, setSection] = useState("");
  const [formError, setFormError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdSubjectCode, setCreatedSubjectCode] = useState("");
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [classToArchive, setClassToArchive] = useState(null);

  // Dropdown state for modal
  const [yearLevelDropdownOpen, setYearLevelDropdownOpen] = useState(false);

  // Filter states
  const [selectedFilter, setSelectedFilter] = useState("All Year Levels");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  // Using dark vibrant colors like the student page
  const bgOptions = [
    "#1E40AF", // Blue
    "#065F46", // Green
    "#5B21B6", // Purple
    "#991B1B", // Red
    "#9A3412", // Orange
    "#0C4A6E", // Cyan
    "#4C1D95", // Purple
    "#134E4A", // Teal
    "#831843", // Pink
    "#3730A3", // Indigo
  ];

  const yearLevels = ["All Year Levels", "1st Year", "2nd Year", "3rd Year", "4th Year"];

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    // Check initial theme
    handleThemeChange();
    
    // Listen for theme changes
    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => observer.disconnect();
  }, []);

  // Theme-based colors
  const getBackgroundColor = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-gray-50";
  };

  const getCardBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getModalBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getInputBackgroundColor = () => {
    return isDarkMode ? "bg-[#23232C]" : "bg-gray-50";
  };

  const getDropdownBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getDropdownHoverColor = () => {
    return isDarkMode ? "hover:bg-[#23232C]" : "hover:bg-gray-100";
  };

  const getBorderColor = () => {
    return isDarkMode ? "border-[#FFFFFF]/20" : "border-gray-200";
  };

  const getTextColor = () => {
    return isDarkMode ? "text-white" : "text-gray-900";
  };

  const getSecondaryTextColor = () => {
    return isDarkMode ? "text-white/80" : "text-gray-600";
  };

  const getLightTextColor = () => {
    return isDarkMode ? "text-white/40" : "text-gray-400";
  };

  const getHoverBorderColor = () => {
    return isDarkMode ? "hover:border-[#00A15D]" : "hover:border-green-600";
  };

  const getFocusBorderColor = () => {
    return isDarkMode ? "focus:border-[#00A15D]" : "focus:border-green-600";
  };

  // GET LOGGED-IN USER ID
  const getProfessorId = () => {
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

  // Load classes from database on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  // Load saved colors from localStorage when component mounts
  useEffect(() => {
    const savedColors = localStorage.getItem('classColors');
    if (savedColors) {
      const colors = JSON.parse(savedColors);
      setClasses(prevClasses => 
        prevClasses.map(classItem => ({
          ...classItem,
          bgColor: colors[classItem.subject_code] || classItem.bgColor
        }))
      );
    }
  }, []);

  // Save colors to localStorage when classes change
  useEffect(() => {
    if (classes.length > 0) {
      const colorMap = {};
      classes.forEach(classItem => {
        colorMap[classItem.subject_code] = classItem.bgColor;
      });
      localStorage.setItem('classColors', JSON.stringify(colorMap));
    }
  }, [classes]);

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const professorId = getProfessorId();
      
      console.log('Professor ID:', professorId);
      
      if (!professorId) {
        console.error('No professor ID found. User may not be logged in.');
        setLoadingClasses(false);
        return;
      }
      
      // Using localhost endpoint from first component
      const response = await fetch(`https://tracked.6minds.site/Professor/ClassManagementDB/get_classes.php?professor_ID=${professorId}`);
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result);
        
        if (result.success) {
          // Try to load saved colors first
          const savedColors = localStorage.getItem('classColors');
          const colorMap = savedColors ? JSON.parse(savedColors) : {};
          
          const classesWithColors = result.classes.map((classItem, index) => ({
            ...classItem,
            bgColor: colorMap[classItem.subject_code] || bgOptions[index % bgOptions.length]
          }));
          setClasses(classesWithColors);
          console.log('Classes set:', classesWithColors);
        } else {
          console.error('Error fetching classes:', result.message);
        }
      } else {
        throw new Error('Failed to fetch classes');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Filter classes based on selected filter
  const filteredClasses = classes.filter(classItem => {
    if (selectedFilter === "All Year Levels") {
      return true;
    }
    return classItem.year_level === selectedFilter;
  });

  // Handle filter selection
  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    setFilterDropdownOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close year level dropdown in modal
      if (yearLevelDropdownOpen && !event.target.closest('.year-level-dropdown')) {
        setYearLevelDropdownOpen(false);
      }
      
      // Close filter dropdown
      if (filterDropdownOpen && !event.target.closest('.filter-dropdown')) {
        setFilterDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [yearLevelDropdownOpen, filterDropdownOpen]);

  // Check if class already exists
  const checkDuplicateClass = (yearLevel, subject, section) => {
    if (!yearLevel || !subject || !section) return null;
    
    const normalizedSubject = subject.trim().toUpperCase();
    const normalizedSection = section.trim().toUpperCase();
    
    // Check if a class with the same year level, subject, and section already exists
    const duplicate = classes.find(classItem => 
      classItem.year_level === yearLevel &&
      classItem.subject.toUpperCase() === normalizedSubject &&
      classItem.section.toUpperCase() === normalizedSection
    );
    
    return duplicate;
  };

  // Handle archive class
  const handleArchive = async (classItem, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setClassToArchive(classItem);
    setShowArchiveModal(true);
  };

  const confirmArchive = async () => {
    if (!classToArchive) return;

    try {
      const professorId = getProfessorId();
      
      // Using localhost endpoint from first component's structure
      const response = await fetch('https://tracked.6minds.site/Professor/ArchiveClassDB/archive_class.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject_code: classToArchive.subject_code,
          professor_ID: professorId
        })
      });

      const result = await response.json();

      if (result.success) {
        setClasses(prevClasses => prevClasses.filter(c => c.subject_code !== classToArchive.subject_code));
        
        // Remove color from localStorage
        const savedColors = localStorage.getItem('classColors');
        if (savedColors) {
          const colorMap = JSON.parse(savedColors);
          delete colorMap[classToArchive.subject_code];
          localStorage.setItem('classColors', JSON.stringify(colorMap));
        }
        
        setShowArchiveModal(false);
        setClassToArchive(null);
      } else {
        alert('Error archiving class: ' + result.message);
        setShowArchiveModal(false);
      }
    } catch (error) {
      console.error('Error archiving class:', error);
      alert('Error archiving class. Please try again.');
      setShowArchiveModal(false);
    }
  };

  // Handle Enter key press in modal inputs
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCreate();
    }
  };

  // Handle subject input change - convert to uppercase
  const handleSubjectChange = (e) => {
    setSubject(e.target.value.toUpperCase());
  };

  // Handle section input change - convert to uppercase and limit to one letter
  const handleSectionChange = (e) => {
    const value = e.target.value.toUpperCase();
    // Only allow letters and limit to one character
    if (value === '' || /^[A-Z]$/.test(value)) {
      setSection(value);
    }
  };

  const handlePaletteClick = (e, index) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Create a copy of the classes array
    const newClasses = [...classes];
    
    // Find the actual index in the original classes array
    const classItem = filteredClasses[index];
    const originalIndex = classes.findIndex(c => c.subject_code === classItem.subject_code);
    
    if (originalIndex !== -1) {
      // Get current color index
      const currentColor = newClasses[originalIndex].bgColor;
      const currentIndex = bgOptions.indexOf(currentColor);
      
      // Calculate next color (cycle through options)
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % bgOptions.length;
      const newColor = bgOptions[nextIndex];
      
      // Update the class with new color
      newClasses[originalIndex] = {
        ...newClasses[originalIndex],
        bgColor: newColor
      };
      
      // Update state
      setClasses(newClasses);
      
      // Update localStorage immediately
      const savedColors = localStorage.getItem('classColors');
      const colorMap = savedColors ? JSON.parse(savedColors) : {};
      colorMap[classItem.subject_code] = newColor;
      localStorage.setItem('classColors', JSON.stringify(colorMap));
    }
  };

  const handleCreate = async () => {
    if (!selectedYearLevel || !subject || !section) {
      setFormError("Please fill in all required fields");
      return;
    }

    // Additional validation for section
    if (section.length !== 1 || !/^[A-Z]$/.test(section)) {
      setFormError("Section must be a single letter (A-Z)");
      return;
    }

    // Check for duplicate class
    const duplicateClass = checkDuplicateClass(selectedYearLevel, subject, section);
    if (duplicateClass) {
      setFormError(`A class with Year Level: ${selectedYearLevel}, Subject: ${subject.toUpperCase()}, Section: ${section.toUpperCase()} already exists.`);
      return;
    }

    setFormError("");
    setLoading(true);

    try {
      const professorId = getProfessorId();

      if (!professorId) {
        alert('User not logged in. Please log in again.');
        setLoading(false);
        return;
      }

      const classData = {
        year_level: selectedYearLevel,
        subject: subject,
        section: section,
        professor_ID: professorId
      };

      // Using localhost endpoint from first component
      const response = await fetch('https://tracked.6minds.site/Professor/ClassManagementDB/create_class.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classData)
      });

      const result = await response.json();

      if (result.success) {
        // Get saved colors to maintain consistency
        const savedColors = localStorage.getItem('classColors');
        const colorMap = savedColors ? JSON.parse(savedColors) : {};
        
        const newClass = {
          ...result.class_data,
          bgColor: colorMap[result.class_data.subject_code] || bgOptions[classes.length % bgOptions.length]
        };
        
        setClasses(prevClasses => [...prevClasses, newClass]);
        
        setSelectedYearLevel("");
        setSubject("");
        setSection("");
        setFormError("");
        setShowModal(false);
        
        setCreatedSubjectCode(result.class_data.subject_code);
        setShowSuccessModal(true);
      } else {
        alert('Error creating class: ' + result.message);
      }
    } catch (error) {
      console.error('Error creating class:', error);
      alert('Error creating class. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Function to render class cards
  const renderClassCards = () => {
    const classesToRender = filteredClasses;

    if (loadingClasses) {
      return (
        <div className="col-span-full text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00A15D] border-r-transparent"></div>
          <p className={`mt-3 ${getSecondaryTextColor()}`}>Loading classes...</p>
        </div>
      );
    }

    if (classesToRender.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <div className={`mx-auto w-16 h-16 mb-4 rounded-full ${getCardBackgroundColor()} flex items-center justify-center`}>
            <img 
              src={Add} 
              alt="No classes" 
              className="h-8 w-8 opacity-50"
              style={{ filter: isDarkMode ? 'none' : 'invert(0.5)' }}
            />
          </div>
          <p className={`${getSecondaryTextColor()} text-sm sm:text-base`}>
            {selectedFilter === "All Year Levels" 
              ? "No classes created yet. Click the + button to create your first class."
              : `No classes found for ${selectedFilter}.`
            }
          </p>
        </div>
      );
    }

    return classesToRender.map((classItem, index) => (
      <Link 
        to={`/Class?code=${classItem.subject_code}`} 
        key={classItem.subject_code}
        className="block"
      >
        <div
          className={`text-white rounded-lg p-4.5 space-y-3 border-2 border-transparent hover:border-[#00A15D] hover:shadow-md transition-all duration-200 h-full`}
          style={{ backgroundColor: classItem.bgColor }}
        >
          {/* Header with Section and Buttons */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center min-w-0 flex-1">
              <img
                src={Book}
                alt="Subject"
                className="h-5 w-5 flex-shrink-0 mr-2"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <div className="min-w-0">
                <p className="text-xs opacity-70">Section:</p>
                <p className="text-sm font-bold truncate">
                  {classItem.section}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1.5 flex-shrink-0">
              <button
                onClick={(e) => handlePaletteClick(e, index)}
                className={`${isDarkMode ? 'bg-[#23232C]' : 'bg-white/20'} rounded-md w-8 h-8 shadow-sm flex items-center justify-center border-2 border-transparent hover:border-[#00A15D] hover:scale-105 transition-all duration-200 cursor-pointer`}
                aria-label="Change color"
              >
                <img 
                  src={Palette} 
                  alt="" 
                  className="h-4 w-4"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </button>
              <button 
                onClick={(e) => handleArchive(classItem, e)}
                className={`${isDarkMode ? 'bg-[#23232C]' : 'bg-white/20'} rounded-md w-8 h-8 shadow-sm flex items-center justify-center border-2 border-transparent hover:border-[#00A15D] hover:scale-105 transition-all duration-200 cursor-pointer`}
                aria-label="Archive class"
              >
                <img 
                  src={Archive} 
                  alt="" 
                  className="h-4 w-4"
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </button>
            </div>
          </div>

          {/* Subject Details */}
          <div className="space-y-1.5 pt-2.5 border-t border-white/20">
            <div>
              <p className="text-xs opacity-70 mb-0.5">Subject:</p>
              <p className="text-sm font-semibold break-words line-clamp-2">
                {classItem.subject}
              </p>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
              <div>
                <span className="opacity-70">Code: </span>
                <span className="font-semibold">{classItem.subject_code}</span>
              </div>
              <div>
                <span className="opacity-70">Year Level: </span>
                <span className="font-semibold">{classItem.year_level}</span>
              </div>
              {/* Semester Display */}
              {classItem.subject_semester && (
                <div>
                  <span className="opacity-70">Semester: </span>
                  <span className="font-semibold">{classItem.subject_semester}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    ));
  };

  return (
    <div className={`${getBackgroundColor()} min-h-screen`}>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen}/>

        {/* Main Content */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          
          {/* Page Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img
                src={ClassManagementIcon}
                alt="ClassManagementIcon"
                className="h-7 w-7 sm:h-9 sm:w-9 mr-2 sm:mr-3"
                style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'invert(0.5)' }}
              />
              <h1 className={`font-bold text-xl sm:text-2xl lg:text-3xl ${getTextColor()}`}>
                Class Management
              </h1>
            </div>
            <p className={`text-sm sm:text-base lg:text-lg ${getSecondaryTextColor()}`}>
              Academic Management
            </p>
          </div>

          <hr className={`${getBorderColor()} mb-5 sm:mb-6`} />

          {/* Filter and Action Bar */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-5 sm:mb-6">
            
            {/* Filter Dropdown */}
            <div className="relative flex-1 sm:flex-initial filter-dropdown">
              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className={`flex items-center justify-between w-full sm:w-auto font-bold px-4 py-2.5 ${getCardBackgroundColor()} rounded-md shadow-md border-2 border-transparent ${getHoverBorderColor()} transition-all duration-200 text-sm sm:text-base min-w-[140px] sm:min-w-[160px] cursor-pointer ${getTextColor()}`}
              >
                <span>{selectedFilter}</span>
                <img
                  src={ArrowDown}
                  alt=""
                  className={`ml-3 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 ${filterDropdownOpen ? 'rotate-180' : ''}`}
                  style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'invert(0.5)' }}
                />
              </button>

              {/* Dropdown Menu */}
              {filterDropdownOpen && (
                <div className={`absolute top-full mt-2 ${getDropdownBackgroundColor()} rounded-md w-full sm:min-w-[200px] shadow-xl border ${getBorderColor()} z-20 overflow-hidden`}>
                  {yearLevels.map((year) => (
                    <button
                      key={year}
                      className={`block px-4 py-2.5 w-full text-left ${getDropdownHoverColor()} text-sm sm:text-base transition-colors duration-150 cursor-pointer ${getTextColor()} ${
                        selectedFilter === year ? `${isDarkMode ? 'bg-[#23232C]' : 'bg-gray-100'} font-semibold` : ''
                      }`}
                      onClick={() => handleFilterSelect(year)}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3 sm:ml-auto">
              <Link to="/ArchiveClass">
                <button className={`font-bold py-2.5 ${getCardBackgroundColor()} rounded-md w-10 h-10 lg:w-11 lg:h-11 shadow-md flex items-center justify-center border-2 border-transparent ${getHoverBorderColor()} hover:scale-105 transition-all duration-200 cursor-pointer`}>
                  <img
                    src={Archive}
                    alt="Archive"
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'invert(0.5)' }}
                  />
                </button>
              </Link>
              <button 
                onClick={() => setShowModal(true)}
                className={`font-bold py-2.5 ${getCardBackgroundColor()} rounded-md w-10 h-10 lg:w-11 lg:h-11 shadow-md flex items-center justify-center border-2 border-transparent ${getHoverBorderColor()} hover:scale-105 transition-all duration-200 cursor-pointer`}
              >
                <img
                  src={Add}
                  alt="Add"
                  className="h-5 w-5"
                  style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'invert(0.5)' }}
                />
              </button>
            </div>
          </div>

          {/* Class Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {renderClassCards()}
          </div>
        </div>
      </div>

      {/* Create Class Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className={`${getModalBackgroundColor()} ${getTextColor()} rounded-lg shadow-2xl w-full max-w-md p-6 sm:p-8 relative modal-pop max-h-[90vh] overflow-y-auto`}>
            <button
              onClick={() => setShowModal(false)}
              aria-label="Close modal"
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-[#23232C] rounded-full transition-colors cursor-pointer"
            >
              <img
                src={BackButton}
                alt="Backbutton"
                className="w-5 h-5"
                style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'invert(0.5)' }}
              />
            </button>

            <h2 className={`text-xl sm:text-2xl font-bold mb-1 pr-10 ${getTextColor()}`}>
              Create Class
            </h2>
            <p className={`text-sm ${getSecondaryTextColor()} mb-4`}>Fill in the details to create a new class</p>
            <hr className={`${getBorderColor()} mb-5`} />

            {/* Error Message */}
            {formError && (
              <div className="bg-[#A15353]/20 border-l-4 border-[#A15353] text-[#A15353] px-4 py-3 rounded mb-5 text-sm">
                <p className="font-semibold">Error</p>
                <p>{formError}</p>
              </div>
            )}

            {/* Form */}
            <div className="space-y-5">
              {/* Year Level Dropdown */}
              <div className="relative year-level-dropdown">
                <label className={`text-sm font-semibold mb-2 block ${getSecondaryTextColor()}`}>
                  Year Level <span className="text-[#A15353]">*</span>
                </label>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setYearLevelDropdownOpen(!yearLevelDropdownOpen);
                  }}
                  className={`w-full ${getInputBackgroundColor()} border-2 ${isDarkMode ? 'border-[#23232C]' : 'border-gray-200'} ${getTextColor()} rounded-md px-4 py-3 flex items-center justify-between ${getHoverBorderColor()} ${getFocusBorderColor()} focus:outline-none transition-colors cursor-pointer`}
                >
                  <span className={`text-sm ${!selectedYearLevel ? getSecondaryTextColor() : getTextColor()}`}>
                    {selectedYearLevel || "Select Year Level"}
                  </span>
                  <img 
                    src={ArrowDown} 
                    alt="" 
                    className={`h-4 w-4 transition-transform ${yearLevelDropdownOpen ? 'rotate-180' : ''}`}
                    style={{ filter: isDarkMode ? 'brightness(0) invert(1)' : 'invert(0.5)' }}
                  />
                </button>
                {yearLevelDropdownOpen && (
                  <div className={`absolute top-full mt-1 w-full ${getDropdownBackgroundColor()} rounded-md shadow-xl border ${getBorderColor()} z-10 overflow-hidden`}>
                    {yearLevels.filter(year => year !== "All Year Levels").map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => {
                          setSelectedYearLevel(year);
                          setYearLevelDropdownOpen(false);
                        }}
                        className={`block w-full text-left px-4 py-3 text-sm ${getDropdownHoverColor()} transition-colors cursor-pointer ${getTextColor()}`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Subject Input */}
              <div>
                <label className={`text-sm font-semibold mb-2 block ${getSecondaryTextColor()}`}>
                  Subject <span className="text-[#A15353]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter subject name"
                  value={subject}
                  onChange={handleSubjectChange}
                  onKeyPress={handleKeyPress}
                  className={`w-full border-2 ${isDarkMode ? 'border-[#23232C]' : 'border-gray-200'} ${getInputBackgroundColor()} rounded-md px-4 py-3 outline-none text-sm ${getFocusBorderColor()} transition-colors uppercase ${getTextColor()} placeholder:${getLightTextColor()}`}
                />
              </div>

              {/* Section Input */}
              <div>
                <label className={`text-sm font-semibold mb-2 block ${getSecondaryTextColor()}`}>
                  Section <span className="text-[#A15353]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter section (A-Z)"
                  value={section}
                  onChange={handleSectionChange}
                  onKeyPress={handleKeyPress}
                  maxLength={1}
                  className={`w-full border-2 ${isDarkMode ? 'border-[#23232C]' : 'border-gray-200'} ${getInputBackgroundColor()} rounded-md px-4 py-3 outline-none text-sm ${getFocusBorderColor()} transition-colors uppercase ${getTextColor()} placeholder:${getLightTextColor()}`}
                />
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreate}
                disabled={loading}
                className={`w-full ${
                  loading ? 'bg-gray-300 cursor-not-allowed text-gray-500' : 'bg-[#00A15D] hover:bg-[#00874E] cursor-pointer'
                } text-white font-bold py-3 rounded-md transition-all duration-200 text-base flex items-center justify-center gap-2`}
              >
                {loading && (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                )}
                {loading ? 'Creating...' : 'Create Class'}
              </button>
            </div>
          </div>

          <style>{`
            .overlay-fade { animation: overlayFade .18s ease-out both; }
            @keyframes overlayFade { from { opacity: 0 } to { opacity: 1 } }

            .modal-pop {
              transform-origin: top center;
              animation: popIn .22s cubic-bezier(.2,.8,.2,1) both;
            }
            @keyframes popIn {
              from { opacity: 0; transform: translateY(-8px) scale(.98); }
              to   { opacity: 1; transform: translateY(0)   scale(1);    }
            }
          `}</style>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSuccessModal(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className={`${getModalBackgroundColor()} ${getTextColor()} rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop`}>
            <div className="text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#00A15D]/20 mb-4">
                <img 
                  src={SuccessIcon} 
                  alt="Success" 
                  className="h-8 w-8"
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                Class Created Successfully!
              </h3>
              
              <div className={`mt-4 mb-6 ${getInputBackgroundColor()} rounded-lg p-4`}>
                <p className={`text-sm ${getSecondaryTextColor()} mb-1`}>Subject Code:</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#00A15D]">{createdSubjectCode}</p>
              </div>

              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-[#00A15D] hover:bg-[#00874E] text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {showArchiveModal && classToArchive && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowArchiveModal(false);
              setClassToArchive(null);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className={`${getModalBackgroundColor()} ${getTextColor()} rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop`}>
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#FFA600]/20 mb-4">
                <img 
                  src={ArchiveWarningIcon} 
                  alt="Warning" 
                  className="h-8 w-8" 
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold mb-2">
                Archive Class?
              </h3>
              
              <div className="mt-4 mb-6">
                <p className={`text-sm ${getSecondaryTextColor()} mb-3`}>
                  Are you sure you want to archive this class?
                </p>
                <div className={`${getInputBackgroundColor()} rounded-lg p-4 text-left`}>
                  <p className={`text-base sm:text-lg font-semibold break-words ${getTextColor()}`}>
                    {classToArchive.subject}
                  </p>
                  <p className={`text-sm ${getSecondaryTextColor()} mt-1`}>
                    Section: {classToArchive.section}
                  </p>
                  <p className={`text-sm ${getSecondaryTextColor()}`}>
                    Code: {classToArchive.subject_code}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowArchiveModal(false);
                    setClassToArchive(null);
                  }}
                  className={`flex-1 ${getInputBackgroundColor()} hover:${isDarkMode ? 'bg-[#2A2A35]' : 'bg-gray-100'} font-bold py-3 rounded-md transition-all duration-200 cursor-pointer ${getTextColor()}`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmArchive}
                  className="flex-1 bg-[#00A15D] hover:bg-[#00874E] text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
                >
                  Archive
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}