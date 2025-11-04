import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import ArrowDown from "../../assets/ArrowDown(Light).svg";
import Subject from '../../assets/Subjects(Light).svg';
import Search from "../../assets/Search.svg";
import BackButton from "../../assets/BackButton(Light).svg";

import ActivityCard from "../../Components/ActivityCardStudent";
import { Link } from "react-router-dom";

export default function SubjectDetailsStudent() {
  const [isOpen, setIsOpen] = useState(false);

  // Filter and search states
  const [filterOption, setFilterOption] = useState("Filter");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  // Activities state (mock)
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data (simulating DB)
  const mockActivities = [
    {
      title: "HTML & CSS Project",
      status: "Not graded",
      deadline: "2025-11-10 | 11:59 PM",
      datePosted: "2025-11-01",
      description: "Submit your first responsive design project. Follow the layout spec and include a mobile version.",
      section: "IT-301",
      postedBy: "Prof. Jane Doe"
    },
    {
      title: "Linked List Exercises",
      status: "Graded",
      deadline: "2025-10-25 | 05:00 PM",
      datePosted: "2025-10-20",
      description: "Complete problems 1-6 on linked lists and submit your outputs as a .zip.",
      section: "IT-302",
      postedBy: "Prof. Jane Doe"
    },
    {
      title: "HCI Reflection",
      status: "Not graded",
      deadline: "2025-11-15 | 11:59 PM",
      datePosted: "2025-11-02",
      description: "Write a one-page reflection about how UI/UX affects user trust.",
      section: "IT-303",
      postedBy: "Prof. John Smith"
    }
  ];

  // load mock
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setActivities(mockActivities);
      setLoading(false);
    }, 500);
  }, []);

  // filter logic
  const filtered = activities.filter(act => {
    let matchesFilter = true;
    if (filterOption === "Graded") matchesFilter = act.status.toLowerCase() === "graded";
    else if (filterOption === "Not graded") matchesFilter = act.status.toLowerCase() === "not graded";

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || act.title.toLowerCase().includes(q) || act.description.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  // sort newest first by datePosted
  const sorted = [...filtered].sort((a, b) => new Date(b.datePosted) - new Date(a.datePosted));

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

  return (
    <div>
      <Sidebar role="student" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`transition-all duration-300 ${isOpen ? "lg:ml-[250px] xl:ml-[280px]" : "ml-0"}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Jane Doe" />

        <div className="text-[#465746] p-4 sm:p-5 md:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img src={Subject} alt="Subjects" className="h-6 w-6 sm:h-7 sm:w-7 mr-3" />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl">Subjects</h1>
            </div>
            <div className="flex justify-between">
              <div className="text-sm sm:text-base lg:text-lg">
                <span>Subject Code:</span>
                <span>Subject Name</span>
              </div>
              <div className="flex text-sm sm:text-base lg:text-lg">
                <Link to="/Subjects">
                  <img src={BackButton} alt="Close" className="w-7 h-7 mr-3" />
                </Link>
                <span>2nd Semester 2024 - 2025</span>
                <img src={ArrowDown} alt="ArrowDown" className="h-6 w-6 sm:h-7 sm:w-7 mr-3" />
              </div>
            </div>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Filter + Search */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-5 sm:mb-6">
            <div className="relative sm:flex-initial filter-dropdown">
              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="flex items-center justify-between w-full sm:w-auto font-bold px-4 py-2.5 bg-white rounded-md shadow-md hover:border-[#00874E] transition-all text-sm sm:text-base sm:min-w-[160px]"
              >
                <span>{filterOption}</span>
                <img src={ArrowDown} alt="" className={`ml-3 h-4 w-4 sm:h-5 sm:w-5 ${filterDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {filterDropdownOpen && (
                <div className="absolute top-full mt-2 bg-white rounded-md w-full sm:min-w-[200px] shadow-xl border border-gray-200 z-20 overflow-hidden">
                  {["Filter", "Graded", "Not graded", "Newest"].map(opt => (
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
                className="w-full h-11 sm:h-12 rounded-md px-4 py-2.5 pr-12 shadow-md outline-none bg-white text-sm sm:text-base focus:border-[#00874E]"
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
              sorted.map((act, idx) => (
                <ActivityCard
                  key={act.id}
                  index={idx}
                  id={act.id}
                  title={act.title}
                  status={act.status}
                  deadline={act.deadline}
                  datePosted={act.datePosted}
                  description={act.description}
                  section={act.section}
                  postedBy={act.postedBy}
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
