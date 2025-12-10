import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";

// Components
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

// Assets
import ClassManagementLight from "../../assets/ClassManagement(Light).svg";
import SectionIcon from "../../assets/Book(Light).svg";
import BackIcon from "../../assets/BackButton(Light).svg";
import loadingAnimation from "../../assets/system-regular-716-spinner-three-dots-loop-expand.json";

export default function UserManagementStudentSections() {
  // State variables
  const [isOpen, setIsOpen] = useState(true);
  const [sectionData, setSectionData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Color scheme for sections A to G
  const sectionColors = {
    A: "#F0F9FF",
    B: "#F0FDF4",
    C: "#FFFBEB",
    D: "#FEF2F2",
    E: "#FAF5FF",
    F: "#ECFEFF",
    G: "#FFF7ED"
  };

  // Year level colors
  const yearLevelColors = {
    "1": "#A1EE9D",
    "2": "#8ADB86",
    "3": "#68BF64",
    "4": "#48A245"
  };

  // Year level labels
  const yearLevelLabels = {
    "1": "1st",
    "2": "2nd", 
    "3": "3rd",
    "4": "4th"
  };

  // Lottie animation config
  const defaultLottieOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  // Fetch section data from API
  useEffect(() => {
    const fetchSectionData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("https://tracked.6minds.site/Admin/StudentAccountsDB/get_section_details.php");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data) {
          setSectionData(data);
        } else {
          throw new Error("Invalid data received from server");
        }
        
      } catch (err) {
        console.error("Error fetching section data:", err);
        setError(err.message);
        // Fallback data
        const emptyData = {};
        ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach(section => {
          emptyData[section] = {
            total: 0,
            yearLevels: {}
          };
        });
        setSectionData(emptyData);
      } finally {
        setLoading(false);
      }
    };

    fetchSectionData();
  }, []);

  // Get top year levels for display
  const getTopYearLevels = (yearLevels, maxDisplay = 2) => {
    const entries = Object.entries(yearLevels)
      .sort(([,a], [,b]) => b - a)
      .slice(0, maxDisplay);
    
    return entries.map(([year, count]) => ({
      year: yearLevelLabels[year] || `${year}th`,
      count
    }));
  };

  // Loading state
  if (loading) {
    return (
      <div>
        <Sidebar role="admin" isOpen={isOpen} setIsOpen={setIsOpen} />
        <div className={`
          transition-all duration-300
          ${isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"}
        `}>
          <Header setIsOpen={setIsOpen} isOpen={isOpen} />
          <div className="p-4 sm:p-5 md:p-6 lg:p-8">
            <div className="flex flex-col justify-center items-center h-40">
              <div className="w-20 h-20 mb-4">
                <Lottie 
                  {...defaultLottieOptions}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              <p className="text-[#465746] text-lg font-medium">Loading section data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Sidebar role="admin" isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className={`
        transition-all duration-300
        ${isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* Main Content */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          {/* Header Section */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <img
                  src={ClassManagementLight}
                  alt="ClassManagement"
                  className="h-6 w-6 sm:h-7 sm:w-7 mr-3"
                />
                <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                  Manage Student Section
                </h1>
              </div>
              
              {/* Back Button */}
              <Link 
                to="/UserManagement" 
                className="inline-flex items-center text-[#465746] hover:text-[#00874E] transition-colors duration-200 group"
              >
                <img
                  src={BackIcon}
                  alt="Back"
                  className="w-6 h-6 transition-transform duration-200"
                />
              </Link>
            </div>
            <div className="text-sm sm:text-base lg:text-lg text-[#465746]">
              <span>View and manage student accounts with year-level breakdown</span>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <p className="font-bold">Error Loading Data</p>
              <p>{error}</p>
              <p className="text-sm mt-1">Showing placeholder data. Please check your connection.</p>
            </div>
          )}

          {/* Section Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((section) => {
              const data = sectionData[section] || { total: 0, yearLevels: {} };
              const topYearLevels = getTopYearLevels(data.yearLevels);
              const hasYearLevels = Object.keys(data.yearLevels).length > 0;

              return (
                <Link 
                  key={section} 
                  to={`/UserManagementStudentAccounts?section=${section}`} 
                  className="block"
                >
                  <div 
                    className="rounded-lg sm:rounded-xl shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 p-4 sm:p-5 lg:p-6 h-full hover:shadow-lg"
                    style={{ backgroundColor: sectionColors[section] }}
                  >
                    {/* Section Header */}
                    <div className="flex items-center mb-3 sm:mb-4">
                      <img
                        src={SectionIcon}
                        alt={`Section ${section}`}
                        className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 mr-3 sm:mr-4"
                      />
                      <h2 className="font-bold text-base sm:text-lg lg:text-xl text-[#465746]">
                        Section {section}
                      </h2>
                    </div>

                    {/* Total Students */}
                    <div className="mb-3 sm:mb-4">
                      <p className="font-bold text-sm sm:text-base lg:text-lg text-[#465746]">
                        Total Students:
                      </p>
                      <p className="font-bold text-lg sm:text-xl lg:text-2xl text-[#00874E] mt-1">
                        {data.total || 0}
                      </p>
                    </div>

                    {/* Year Level Breakdown */}
                    <div className="border-t border-gray-200 pt-3">
                      <p className="font-semibold text-xs sm:text-sm text-[#465746] mb-2">
                        Year Level Breakdown:
                      </p>
                      
                      {hasYearLevels ? (
                        <div className="space-y-2">
                          {/* Top year levels */}
                          {topYearLevels.map(({ year, count }) => (
                            <div key={year} className="flex justify-between items-center">
                              <span className="text-xs sm:text-sm text-[#465746]">
                                {year} Year:
                              </span>
                              <span className="font-semibold text-xs sm:text-sm text-[#00874E]">
                                {count}
                              </span>
                            </div>
                          ))}
                          
                          {/* Show more indicator */}
                          {Object.keys(data.yearLevels).length > topYearLevels.length && (
                            <div className="text-xs text-gray-500 text-center">
                              +{Object.keys(data.yearLevels).length - topYearLevels.length} more year levels
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs sm:text-sm text-gray-500 text-center py-2">
                          No students enrolled
                        </p>
                      )}
                    </div>

                    {/* Visual year level distribution */}
                    {hasYearLevels && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-[#465746] font-semibold mb-2">Distribution:</p>
                        <div className="flex h-2 rounded-full overflow-hidden">
                          {Object.entries(data.yearLevels)
                            .sort(([,a], [,b]) => b - a)
                            .map(([year]) => (
                              <div
                                key={year}
                                className="flex-1"
                                style={{ 
                                  backgroundColor: yearLevelColors[year] || '#E5E7EB',
                                  margin: '0 1px'
                                }}
                                title={`${yearLevelLabels[year] || year} Year`}
                              />
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Year Level Legend */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-[#465746] mb-3">Year Level Colors:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(yearLevelLabels).map(([key, label]) => (
                <div key={key} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded mr-2"
                    style={{ backgroundColor: yearLevelColors[key] }}
                  />
                  <span className="text-sm text-[#465746]">{label} Year</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}