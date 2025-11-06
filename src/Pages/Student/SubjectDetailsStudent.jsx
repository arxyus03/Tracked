import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import ArrowDown from "../../assets/ArrowDown(Light).svg";
import Subject from '../../assets/Subjects(Light).svg';
import Search from "../../assets/Search.svg";
import BackButton from "../../assets/BackButton(Light).svg";

import ActivityCardStudent from "../../Components/ActivityCardStudent";
import { Link, useLocation } from "react-router-dom";

export default function SubjectDetailsStudent() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get('code');

  // Filter and search states
  const [filterOption, setFilterOption] = useState("Filter");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  // Activities state
  const [activities, setActivities] = useState([]);
  const [classInfo, setClassInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get student ID from localStorage
  const getStudentId = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
    return null;
  };

  useEffect(() => {
    if (subjectCode) {
      fetchClassDetails();
      fetchActivities();
    }
  }, [subjectCode]);

  const fetchClassDetails = async () => {
    try {
      const response = await fetch(`http://localhost/TrackEd/src/Pages/Professor/SubjectDetailsDB/get_class_details.php?subject_code=${subjectCode}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setClassInfo(data.class_data);
        }
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const studentId = getStudentId();
      
      const response = await fetch(`http://localhost/TrackEd/src/Pages/Student/SubjectDetailsStudentDB/get_activities_student.php?subject_code=${subjectCode}&student_id=${studentId}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setActivities(data.activities);
        }
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  // filter logic
  const filtered = activities.filter(act => {
    let matchesFilter = true;
    if (filterOption === "Graded") matchesFilter = act.grade !== null;
    else if (filterOption === "Not graded") matchesFilter = act.grade === null;
    else if (filterOption === "Submitted") matchesFilter = act.submitted === 1;
    else if (filterOption === "Not submitted") matchesFilter = act.submitted === 0;

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || 
      act.title.toLowerCase().includes(q) || 
      (act.instruction && act.instruction.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  // sort newest first by created_at
  const sorted = [...filtered].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // close dropdown on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (filterDropdownOpen && !e.target.closest(".filter-dropdown")) {
        setFilterDropdownOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [filterDropdownOpen]);

  // Format date for display with time
  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    try {
      const date = new Date(dateString);
      
      // Check if the date has time component
      const hasTime = dateString.includes(' ') || dateString.includes('T');
      
      if (hasTime) {
        // Format with time
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }) + ' | ' + date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      } else {
        // Format without time (legacy date-only format)
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
      }
    } catch {
      return dateString;
    }
  };

  return (
    <div>
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Student" />

        <div className="text-[#465746] p-4 sm:p-5 md:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-4 sm:mb-4">
            <div className="flex items-center mb-2">
              <img
                src={Subject}
                alt="Subjects"
                className="h-7 w-7 sm:h-9 sm:w-9 mr-2 sm:mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl">
                Subjects
              </h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg">
              Academic Management
            </p>
          </div>

          {/* Subject Information */}
          <div className="flex flex-col gap-2 text-sm sm:text-base lg:text-[1.125rem] mb-4 sm:mb-5">
            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT CODE:</span>
              <span>{classInfo?.subject_code || 'Loading...'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1 sm:gap-3">
              <span className="font-semibold">SUBJECT:</span>
              <span>{classInfo?.subject || 'Loading...'}</span>
            </div>

            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <span>2nd Semester 2024 - 2025</span>
                <img 
                  src={ArrowDown} 
                  alt="ArrowDown" 
                  className="h-5 w-5 sm:h-6 sm:w-6" 
                />
              </div>
              <Link to="/Subjects" className="hidden sm:block">
                <img 
                  src={BackButton} 
                  alt="Back" 
                  className="h-6 w-6 cursor-pointer hover:opacity-70 transition-opacity" 
                />
              </Link>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Filter + Search */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-5 sm:mb-6">
            <div className="relative sm:flex-initial filter-dropdown">
              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="flex items-center justify-between w-full sm:w-auto font-bold px-4 py-2.5 bg-white rounded-md shadow-md hover:border-[#00874E] transition-all text-sm sm:text-base sm:min-w-[160px] border-2 border-transparent"
              >
                <span>{filterOption}</span>
                <img src={ArrowDown} alt="" className={`ml-3 h-4 w-4 sm:h-5 sm:w-5 transition-transform ${filterDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {filterDropdownOpen && (
                <div className="absolute top-full mt-2 bg-white rounded-md w-full sm:min-w-[200px] shadow-xl border border-gray-200 z-20 overflow-hidden">
                  {["Filter", "Graded", "Not graded", "Submitted", "Not submitted"].map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setFilterOption(opt); setFilterDropdownOpen(false); }}
                      className={`block px-4 py-2.5 w-full text-left hover:bg-gray-100 text-sm sm:text-base ${filterOption === opt ? "bg-gray-50 font-semibold" : ""}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 sm:h-12 rounded-md px-4 py-2.5 pr-12 shadow-md outline-none bg-white text-sm sm:text-base focus:border-[#00874E] border border-gray-300"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                <img src={Search} alt="Search" className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>

          {/* Activities */}
          <div className="space-y-4 sm:space-y-5">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#00874E] border-r-transparent"></div>
                <p className="mt-3 text-gray-600">Loading activities...</p>
              </div>
            ) : sorted.length > 0 ? (
              sorted.map((activity) => (
                <ActivityCardStudent
                  key={activity.id}
                  activity={activity}
                  formatDate={formatDate}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm sm:text-base">
                  {searchQuery ? "No activities match your search" : "No activities found"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}