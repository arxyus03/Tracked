import React, { useState } from "react";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import ArrowDown from "../../assets/ArrowDown(Light).svg";
import AnnouncementIcon from "../../assets/Announcement(Light).svg";
import Search from "../../assets/Search.svg";
import Add from "../../assets/Add(Light).svg";
import BackButton from "../../assets/BackButton(Light).svg";

// Import your ActivityCard component
import ActivityCard from "../../Components/ActivityCard";

export default function Announcement() {
  const [isOpen, setIsOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Modal form states
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [deadline, setDeadline] = useState("");
  
  // Dropdown states for modal
  const [subjectDropdownOpen, setSubjectDropdownOpen] = useState(false);
  const [sectionDropdownOpen, setSectionDropdownOpen] = useState(false);

  // Announcements state
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      subject: "GNED09",
      title: "New Activity",
      postedBy: "Prof. LastName, FirstName MI",
      datePosted: "August 10, 2025",
      deadline: "August 17, 2025 | 11:59pm",
      instructions: "Mockup Instruction",
      link: "#"
    }
  ]);

  // Filter state
  const [filterOption, setFilterOption] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Sample data
  const subjects = ["GNED09", "COMP101", "MATH101", "ENG101"];
  const sections = ["All", "A", "B", "C"];

  // Format deadline from datetime-local to readable format
  const formatDeadline = (dateTimeString) => {
    if (!dateTimeString) return "";
    const date = new Date(dateTimeString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options);
    const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${formattedDate} | ${time}`;
  };

  // Get current date in readable format
  const getCurrentDate = () => {
    const date = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const handlePost = () => {
    // Validate required fields
    if (!selectedSubject || !title || !description) {
      alert("Please fill in all required fields (Subject, Title, and Description)");
      return;
    }

    // Create new announcement
    const newAnnouncement = {
      id: Date.now(),
      subject: selectedSubject,
      section: selectedSection,
      title: title,
      postedBy: "Jane Doe", // From the userName in Header
      datePosted: getCurrentDate(),
      deadline: formatDeadline(deadline),
      instructions: description,
      link: link || "#"
    };

    // Add to announcements list
    setAnnouncements([newAnnouncement, ...announcements]);
    
    // Reset form and close modal
    setSelectedSubject("");
    setSelectedSection("");
    setTitle("");
    setDescription("");
    setLink("");
    setDeadline("");
    setShowModal(false);
  };

  // Handle delete announcement
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      setAnnouncements(announcements.filter(announcement => announcement.id !== id));
    }
  };

  // Handle edit announcement
  const handleEdit = (announcement) => {
    setSelectedSubject(announcement.subject);
    setSelectedSection(announcement.section || "");
    setTitle(announcement.title);
    setDescription(announcement.instructions);
    setLink(announcement.link === "#" ? "" : announcement.link);
    // Convert deadline back to datetime-local format if needed
    setShowModal(true);
    // Remove the old announcement when editing
    setAnnouncements(announcements.filter(a => a.id !== announcement.id));
  };

  // Filter announcements based on search query
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.instructions.toLowerCase().includes(searchQuery.toLowerCase());
    
    // You can add more filter logic here based on filterOption (All, Unread, Read, Newest)
    return matchesSearch;
  });

  return (
    <div>
      {/* Sidebar */}
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className={`transition-all duration-300 ${isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"} `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Jane Doe" />
        
        {/* Page content */}
        <div className="p-3 sm:p-4 md:p-5 lg:p-5 xl:p-5">
          {/* Page title */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-2 sm:mb-4">
            <div className="flex items-center mb-2 sm:mb-0">
              <img
                src={AnnouncementIcon}
                alt="Announcement"
                className="h-7 w-7 sm:h-6 sm:w-7 md:h-7 md:w-7 mr-3 sm:mr-3 mt-0.5 ml-2"
              />
              <h1 className="font-bold text-xl sm:text-xl md:text-xl lg:text-[1.5rem] text-[#465746]">
                Announcement
              </h1>
            </div>
          </div>

          {/* Subtitle */}
          <div className="text-sm sm:text-base md:text-base lg:text-[1.125rem] text-[#465746] mb-4 sm:mb-5 ml-2">
            <span>Post a class Announcement</span>
          </div>

          <hr className="opacity-60 border-[#465746] rounded border-1 mt-3 sm:mt-4 md:mt-5" />

          {/* Filter + Action buttons */}
          <div className="mt-3 sm:mt-4 md:mt-5">
            {/* Filter and Add buttons row */}
            <div className="flex items-center justify-between gap-3 mb-3">
              {/* Filter dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center font-bold px-3 py-2 bg-[#fff] rounded-md cursor-pointer shadow-md hover:border-[#00874E] hover:border-2 text-xs sm:text-sm lg:text-base min-w-[100px] sm:min-w-[140px]"
                >
                  <span className="flex-1 text-left">{filterOption}</span>
                  <img
                    src={ArrowDown}
                    alt="ArrowDown"
                    className="ml-2 h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6"
                  />
                </button>

                {/* Dropdown options */}
                {open && (
                  <div className="absolute top-full mt-1 bg-white rounded-md w-full sm:w-48 shadow-lg border border-gray-200 z-10">
                    {["All", "Unread", "Read", "Newest"].map((option) => (
                      <button
                        key={option}
                        className="block px-3 py-2 w-full text-left hover:bg-gray-100 text-xs sm:text-sm md:text-base transition-colors duration-200 cursor-pointer"
                        onClick={() => {
                          setFilterOption(option);
                          setOpen(false);
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Add button */}
              <button 
                onClick={() => setShowModal(true)}
                className="font-bold py-2 bg-[#fff] rounded-md w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 shadow-md flex items-center justify-center hover:border-[#00874E] hover:border-2 cursor-pointer flex-shrink-0"
              >
                <img
                  src={Add}
                  alt="Add"
                  className="h-6 w-6 sm:h-5 sm:w-5 md:h-6 md:w-6"
                />
              </button>
            </div>

            {/* Search bar row */}
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 sm:h-10 md:h-10 lg:h-11 rounded-md px-2 sm:px-3 py-2 pr-9 sm:pr-10 shadow-md outline-none bg-white text-xs sm:text-sm"
              />
              <button className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500">
                <img
                  src={Search}
                  alt="Search"
                  className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7"
                />
              </button>
            </div>
          </div>

          {/* Activity Cards Section */}
          <div className="mt-4 sm:mt-5 md:mt-6 space-y-3 sm:space-y-4">
            {filteredAnnouncements.length > 0 ? (
              filteredAnnouncements.map((announcement) => (
                <ActivityCard
                  key={announcement.id}
                  subject={announcement.subject}
                  title={announcement.title}
                  postedBy={announcement.postedBy}
                  datePosted={announcement.datePosted}
                  deadline={announcement.deadline}
                  instructions={announcement.instructions}
                  link={announcement.link}
                  onEdit={() => handleEdit(announcement)}
                  onDelete={() => handleDelete(announcement.id)}
                />
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                No announcements found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Announcement Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-white bg-opacity-50 flex justify-center items-center z-50 overlay-fade p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white text-black rounded-lg shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg p-4 sm:p-6 md:p-8 relative modal-pop max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              aria-label="BackButton modal"
              className="absolute top-4 right-4 sm:right-6 md:right-8 top-5 sm:hidden cursor-pointer"
            >
              <img
                src={BackButton}
                alt="BackButton"
                className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6"
              />
            </button>

            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 pr-8">
              New Announcement
            </h2>
            <hr className="border-gray-300 mb-3 sm:mb-4" />

            {/* Modal Body */}
            <div className="space-y-4">
              {/* Subject Dropdown */}
              <div className="relative">
                <label className="text-sm font-semibold mb-1 block">Subject*</label>
                <button
                  onClick={() => {
                    setSubjectDropdownOpen(!subjectDropdownOpen);
                    setSectionDropdownOpen(false);
                  }}
                  className="w-full bg-white border border-gray-300 text-black rounded-md px-4 py-2.5 flex items-center justify-between hover:border-[#00874E] transition-colors"
                >
                  <span className="text-sm">{selectedSubject || "Select Subject"}</span>
                  <img src={ArrowDown} alt="Arrow" className="h-4 w-4" />
                </button>
                {subjectDropdownOpen && (
                  <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    {subjects.map((subj) => (
                      <button
                        key={subj}
                        onClick={() => {
                          setSelectedSubject(subj);
                          setSubjectDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        {subj}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Section Dropdown */}
              <div className="relative">
                <label className="text-sm font-semibold mb-1 block">Section</label>
                <button
                  onClick={() => {
                    setSectionDropdownOpen(!sectionDropdownOpen);
                    setSubjectDropdownOpen(false);
                  }}
                  className="w-full bg-white border border-gray-300 text-black rounded-md px-4 py-2.5 flex items-center justify-between hover:border-[#00874E] transition-colors"
                >
                  <span className="text-sm">{selectedSection || "Select Section"}</span>
                  <img src={ArrowDown} alt="Arrow" className="h-4 w-4" />
                </button>
                {sectionDropdownOpen && (
                  <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 z-10 max-h-40 overflow-y-auto">
                    {sections.map((sect) => (
                      <button
                        key={sect}
                        onClick={() => {
                          setSelectedSection(sect);
                          setSectionDropdownOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        {sect}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Title Input */}
              <div>
                <label className="text-sm font-semibold mb-1 block">Title:*</label>
                <input
                  type="text"
                  placeholder="Title*"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none text-sm focus:border-[#00874E] transition-colors"
                />
              </div>

              {/* Description Textarea */}
              <div>
                <label className="text-sm font-semibold mb-1 block">Description:*</label>
                <textarea
                  placeholder="Description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none min-h-[120px] resize-none text-sm focus:border-[#00874E] transition-colors"
                />
              </div>

              {/* Link Input */}
              <div>
                <label className="text-sm font-semibold mb-1 block">Insert Link:</label>
                <input
                  type="text"
                  placeholder="Link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none text-sm focus:border-[#00874E] transition-colors"
                />
              </div>

              {/* Deadline Input */}
              <div>
                <label className="text-sm font-semibold mb-1 block">Deadline:</label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 outline-none text-sm focus:border-[#00874E] transition-colors"
                />
              </div>

              {/* Post Button */}
              <button
                onClick={handlePost}
                className="w-full bg-[#00A15D] text-white font-bold py-2.5 rounded-md hover:bg-[#00874E] transition-colors text-sm sm:text-base cursor-pointer"
              >
                Post
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
    </div>
  );
}