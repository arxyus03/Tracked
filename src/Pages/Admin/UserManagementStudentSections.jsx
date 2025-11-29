import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import ClassManagementLight from "../../assets/ClassManagement(Light).svg";
import SectionIcon from "../../assets/Book(Light).svg";
import BackIcon from "../../assets/BackButton(Light).svg"; // Import your back icon

// Import the Lottie animation JSON file
import loadingAnimation from "../../assets/system-regular-716-spinner-three-dots-loop-expand.json";

export default function UserManagementStudentSections() {
  const [isOpen, setIsOpen] = useState(false);
  const [sectionCounts, setSectionCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subtle color scheme for different sections
  const sectionColors = {
    A: "#F0F9FF", // Very light blue
    B: "#F0FDF4", // Very light green
    C: "#FFFBEB", // Very light amber
    D: "#FEF2F2", // Very light red
    E: "#FAF5FF", // Very light purple
    F: "#ECFEFF", // Very light cyan
    G: "#FFF7ED"  // Very light orange
  };

  // Lottie animation options
  const defaultLottieOptions = {
    loop: true,
    autoplay: true,
    animationData: loadingAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  // Mock data for sections - replace with actual API call
  useEffect(() => {
    const fetchSectionData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        setTimeout(() => {
          const mockSectionData = {
            A: 25,
            B: 30,
            C: 28,
            D: 22,
            E: 35,
            F: 27,
            G: 31
          };
          
          setSectionCounts(mockSectionData);
          setLoading(false);
        }, 1000);
        
      } catch (err) {
        console.error("Error fetching section data:", err);
        setError(err.message);
        setSectionCounts({});
      } finally {
      }
    };

    fetchSectionData();
  }, []);

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

      <div
        className={`
        transition-all duration-300
        ${isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"}
      `}
      >
        <Header setIsOpen={setIsOpen} isOpen={isOpen} />

        {/* content of MANAGE STUDENT SECTIONS */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          {/* Header of MANAGE STUDENT SECTIONS */}
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
              
              {/* Back Button with Custom Icon */}
              <Link 
                to="/UserManagement" 
                className="inline-flex items-center text-[#465746] hover:text-[#00874E] transition-colors duration-200 group"
                title="Back to User Management"
              >
                <img
                  src={BackIcon}
                  alt="Back"
                  className="w-6 h-6 transition-transform duration-200"
                />
              </Link>
            </div>
            <div className="text-sm sm:text-base lg:text-lg text-[#465746]">
              <span>View and manage student accounts </span>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              Error: {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {/* Section Cards A to G */}
            {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map((section) => (
              <Link 
                key={section} 
                to={`/UserManagementStudentAccounts?section=${section}`} 
                className="block"
              >
                <div 
                  className="rounded-lg sm:rounded-xl shadow-md border-2 border-transparent hover:border-[#00874E] transition-all duration-200 p-4 sm:p-5 lg:p-6 h-full"
                  style={{ backgroundColor: sectionColors[section] }}
                >
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

                  <div className="flex flex-col">
                    <p className="font-bold text-sm sm:text-base lg:text-lg text-[#465746]">
                      Total of Students:
                    </p>
                    <p className="font-bold text-sm sm:text-base lg:text-lg text-[#00874E] mt-1">
                      {sectionCounts[section] || 0}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}