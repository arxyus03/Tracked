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
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(true);

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
          <p className="mt-3 text-[#FFFFFF]/70">Loading classes...</p>
        </div>
      );
    }

    if (classesToRender.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-[#15151C] flex items-center justify-center">
            <img 
              src={Add} 
              alt="No classes" 
              className="h-8 w-8 opacity-50"
            />
          </div>
          <p className="text-[#FFFFFF]/50 text-sm sm:text-base">
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
          className="text-[#FFFFFF] rounded-lg p-4.5 space-y-3 border-2 border-transparent hover:border-[#00A15D] hover:shadow-md transition-all duration-200 h-full"
          style={{ backgroundColor: classItem.bgColor }}
        >
          {/* Header with Section and Buttons */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center min-w-0 flex-1">
              <img
                src={Book}
                alt="Subject"
                className="h-5 w-5 flex-shrink-0 mr-2"
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
                className="bg-[#23232C] rounded-md w-8 h-8 shadow-sm flex items-center justify-center border-2 border-transparent hover:border-[#00A15D] hover:scale-105 transition-all duration-200 cursor-pointer"
                aria-label="Change color"
              >
                <img 
                  src={Palette} 
                  alt="" 
                  className="h-4 w-4" 
                />
              </button>
              <button 
                onClick={(e) => handleArchive(classItem, e)}
                className="bg-[#23232C] rounded-md w-8 h-8 shadow-sm flex items-center justify-center border-2 border-transparent hover:border-[#00A15D] hover:scale-105 transition-all duration-200 cursor-pointer"
                aria-label="Archive class"
              >
                <img 
                  src={Archive} 
                  alt="" 
                  className="h-4 w-4" 
                />
              </button>
            </div>
          </div>

          {/* Subject Details */}
          <div className="space-y-1.5 pt-2.5 border-t border-[#FFFFFF]/20">
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
    <div className="bg-[#23232C] min-h-screen">
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen}/>

        {/* Main Content */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8 text-[#FFFFFF]">
          
          {/* Page Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img
                src={ClassManagementIcon}
                alt="ClassManagementIcon"
                className="h-7 w-7 sm:h-9 sm:w-9 mr-2 sm:mr-3 brightness-0 invert"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl">
                Class Management
              </h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-[#FFFFFF]/80">
              Academic Management
            </p>
          </div>

          <hr className="border-[#FFFFFF]/30 mb-5 sm:mb-6" />

          {/* Filter and Action Bar */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-5 sm:mb-6">
            
            {/* Filter Dropdown */}
            <div className="relative flex-1 sm:flex-initial filter-dropdown">
              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="flex items-center justify-between w-full sm:w-auto font-bold px-4 py-2.5 bg-[#15151C] rounded-md shadow-md border-2 border-transparent hover:border-[#00A15D] transition-all duration-200 text-sm sm:text-base min-w-[140px] sm:min-w-[160px] cursor-pointer"
              >
                <span>{selectedFilter}</span>
                <img
                  src={ArrowDown}
                  alt=""
                  className={`ml-3 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 ${filterDropdownOpen ? 'rotate-180' : ''} brightness-0 invert`}
                />
              </button>

              {/* Dropdown Menu */}
              {filterDropdownOpen && (
                <div className="absolute top-full mt-2 bg-[#15151C] rounded-md w-full sm:min-w-[200px] shadow-xl border border-[#23232C] z-20 overflow-hidden">
                  {yearLevels.map((year) => (
                    <button
                      key={year}
                      className={`block px-4 py-2.5 w-full text-left hover:bg-[#23232C] text-sm sm:text-base transition-colors duration-150 cursor-pointer ${
                        selectedFilter === year ? 'bg-[#23232C] font-semibold' : ''
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
                <button className="font-bold py-2.5 bg-[#15151C] rounded-md w-10 h-10 lg:w-11 lg:h-11 shadow-md flex items-center justify-center border-2 border-transparent hover:border-[#00A15D] hover:scale-105 transition-all duration-200 cursor-pointer">
                  <img
                    src={Archive}
                    alt="Archive"
                    className="h-4 w-4 sm:h-5 sm:w-5 brightness-0 invert"
                  />
                </button>
              </Link>
              <button 
                onClick={() => setShowModal(true)}
                className="font-bold py-2.5 bg-[#15151C] rounded-md w-10 h-10 lg:w-11 lg:h-11 shadow-md flex items-center justify-center border-2 border-transparent hover:border-[#00A15D] hover:scale-105 transition-all duration-200 cursor-pointer"
              >
                <img
                  src={Add}
                  alt="Add"
                  className="h-5 w-5 brightness-0 invert"
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
          <div className="bg-[#15151C] text-[#FFFFFF] rounded-lg shadow-2xl w-full max-w-md p-6 sm:p-8 relative modal-pop max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              aria-label="Close modal"
              className="absolute top-4 right-4 p-2 hover:bg-[#23232C] rounded-full transition-colors cursor-pointer"
            >
              <img
                src={BackButton}
                alt="Backbutton"
                className="w-5 h-5 brightness-0 invert"
              />
            </button>

            <h2 className="text-xl sm:text-2xl font-bold mb-1 pr-10">
              Create Class
            </h2>
            <p className="text-sm text-[#FFFFFF]/70 mb-4">Fill in the details to create a new class</p>
            <hr className="border-[#FFFFFF]/20 mb-5" />

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
                <label className="text-sm font-semibold mb-2 block text-[#FFFFFF]/80">
                  Year Level <span className="text-[#A15353]">*</span>
                </label>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setYearLevelDropdownOpen(!yearLevelDropdownOpen);
                  }}
                  className="w-full bg-[#23232C] border-2 border-[#23232C] text-[#FFFFFF] rounded-md px-4 py-3 flex items-center justify-between hover:border-[#00A15D] focus:border-[#00A15D] focus:outline-none transition-colors cursor-pointer"
                >
                  <span className={`text-sm ${!selectedYearLevel ? 'text-[#FFFFFF]/50' : ''}`}>
                    {selectedYearLevel || "Select Year Level"}
                  </span>
                  <img 
                    src={ArrowDown} 
                    alt="" 
                    className={`h-4 w-4 transition-transform brightness-0 invert ${yearLevelDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                {yearLevelDropdownOpen && (
                  <div className="absolute top-full mt-1 w-full bg-[#15151C] rounded-md shadow-xl border border-[#23232C] z-10 overflow-hidden">
                    {yearLevels.filter(year => year !== "All Year Levels").map((year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() => {
                          setSelectedYearLevel(year);
                          setYearLevelDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-3 text-sm hover:bg-[#23232C] transition-colors cursor-pointer"
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Subject Input */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-[#FFFFFF]/80">
                  Subject <span className="text-[#A15353]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter subject name"
                  value={subject}
                  onChange={handleSubjectChange}
                  onKeyPress={handleKeyPress}
                  className="w-full border-2 border-[#23232C] bg-[#23232C] rounded-md px-4 py-3 outline-none text-sm focus:border-[#00A15D] transition-colors uppercase text-[#FFFFFF] placeholder:text-[#FFFFFF]/50"
                />
              </div>

              {/* Section Input */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-[#FFFFFF]/80">
                  Section <span className="text-[#A15353]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter section (A-Z)"
                  value={section}
                  onChange={handleSectionChange}
                  onKeyPress={handleKeyPress}
                  maxLength={1}
                  className="w-full border-2 border-[#23232C] bg-[#23232C] rounded-md px-4 py-3 outline-none text-sm focus:border-[#00A15D] transition-colors uppercase text-[#FFFFFF] placeholder:text-[#FFFFFF]/50"
                />
              </div>

              {/* Create Button */}
              <button
                onClick={handleCreate}
                disabled={loading}
                className={`w-full ${
                  loading ? 'bg-[#23232C] cursor-not-allowed text-[#FFFFFF]/50' : 'bg-[#00A15D] hover:bg-[#00874E] cursor-pointer'
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
          <div className="bg-[#15151C] text-[#FFFFFF] rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop">
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
              
              <div className="mt-4 mb-6 bg-[#23232C] rounded-lg p-4">
                <p className="text-sm text-[#FFFFFF]/70 mb-1">Subject Code:</p>
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
          <div className="bg-[#15151C] text-[#FFFFFF] rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop">
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
                <p className="text-sm text-[#FFFFFF]/70 mb-3">
                  Are you sure you want to archive this class?
                </p>
                <div className="bg-[#23232C] rounded-lg p-4 text-left">
                  <p className="text-base sm:text-lg font-semibold break-words">
                    {classToArchive.subject}
                  </p>
                  <p className="text-sm text-[#FFFFFF]/70 mt-1">
                    Section: {classToArchive.section}
                  </p>
                  <p className="text-sm text-[#FFFFFF]/70">
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
                  className="flex-1 bg-[#23232C] hover:bg-[#2A2A35] font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
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