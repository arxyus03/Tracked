import React, { useState, useEffect } from "react";
import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import ArrowDown from "../../assets/ArrowDown(Light).svg";
import AnnouncementIcon from "../../assets/Announcement(Light).svg";
import Search from "../../assets/Search.svg";
import Add from "../../assets/Add(Light).svg";
import BackButton from "../../assets/BackButton(Light).svg";

import AnnouncementCard from "../../Components/AnnouncementCard";

export default function Announcement() {
  const [isOpen, setIsOpen] = useState(false);
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

  // Editing state
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Classes state (for dropdowns)
  const [classes, setClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  // Filter state
  const [filterOption, setFilterOption] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

  // Get professor ID from localStorage
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

  // Fetch professor's classes for dropdowns
  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const professorId = getProfessorId();
      
      if (!professorId) {
        console.error('No professor ID found');
        setLoadingClasses(false);
        return;
      }
      
      const response = await fetch(`http://localhost/TrackEd/src/Pages/Professor/ClassManagementDB/get_classes.php?professor_ID=${professorId}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setClasses(result.classes);
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

  // Fetch announcements from database
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const professorId = getProfessorId();
      
      if (!professorId) {
        console.error('No professor ID found');
        setLoading(false);
        return;
      }
      
      // Fetch all announcements for the professor
      const response = await fetch(`http://localhost/TrackEd/src/Pages/Professor/AnnouncementDB/get_announcements.php?professor_ID=${professorId}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Fetched announcements:', result);
        if (result.success) {
          // Add read status to announcements (default to unread)
          const announcementsWithReadStatus = result.announcements.map(announcement => ({
            ...announcement,
            isRead: false // Default to unread
          }));
          setAnnouncements(announcementsWithReadStatus);
        } else {
          console.error('Error fetching announcements:', result.message);
          setAnnouncements([]);
        }
      } else {
        throw new Error('Failed to fetch announcements');
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchAnnouncements();
  }, []);

  // Get unique subjects from classes
  const getUniqueSubjects = () => {
    const subjects = classes.map(classItem => ({
      subject_code: classItem.subject_code,
      subject_name: classItem.subject
    }));
    
    // Remove duplicates based on subject_code
    const uniqueSubjects = subjects.filter((subject, index, self) =>
      index === self.findIndex(s => s.subject_code === subject.subject_code)
    );
    
    return uniqueSubjects;
  };

  // Get sections for selected subject
  const getSectionsForSubject = () => {
    if (!selectedSubject) return [];
    
    return classes
      .filter(classItem => classItem.subject_code === selectedSubject)
      .map(classItem => classItem.section);
  };

  // Handle marking announcement as read
  const handleMarkAsRead = (announcementId) => {
    setAnnouncements(prevAnnouncements => 
      prevAnnouncements.map(announcement => 
        announcement.id === announcementId 
          ? { ...announcement, isRead: true }
          : announcement
      )
    );
  };

  // Handle marking announcement as unread
  const handleMarkAsUnread = (announcementId) => {
    setAnnouncements(prevAnnouncements => 
      prevAnnouncements.map(announcement => 
        announcement.id === announcementId 
          ? { ...announcement, isRead: false }
          : announcement
      )
    );
  };

  // Filter announcements based on filter option and search query
  const filteredAnnouncements = announcements.filter(announcement => {
    // Filter by read status
    let matchesFilter = true;
    if (filterOption === "Unread") {
      matchesFilter = !announcement.isRead;
    } else if (filterOption === "Read") {
      matchesFilter = announcement.isRead;
    }
    
    // Filter by search query
    const matchesSearch = 
      announcement.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.instructions.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // Sort announcements based on filter option
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    if (filterOption === "Newest") {
      // Sort by date posted (newest first)
      return new Date(b.datePosted) - new Date(a.datePosted);
    }
    // For other filters, maintain original order or sort by unread first
    if (filterOption === "All") {
      // Put unread announcements first
      if (a.isRead && !b.isRead) return 1;
      if (!a.isRead && b.isRead) return -1;
      return new Date(b.datePosted) - new Date(a.datePosted);
    }
    return 0;
  });

  const handlePost = async () => {
    // Validate required fields
    if (!selectedSubject || !title || !description) {
      alert("Please fill in all required fields (Subject, Title, and Description)");
      return;
    }

    const professorId = getProfessorId();
    if (!professorId) {
      alert("Error: Professor ID not found");
      return;
    }

    console.log('Posting announcement with data:', {
      professor_ID: professorId,
      classroom_ID: selectedSubject,
      title: title,
      description: description,
      link: link || null,
      deadline: deadline
    });

    try {
      if (editingAnnouncement) {
        // Update existing announcement
        const updateData = {
          announcement_ID: editingAnnouncement.id,
          professor_ID: professorId,
          title: title,
          description: description,
          link: link || null,
          deadline: deadline
        };

        console.log('Sending UPDATE data:', updateData);

        const response = await fetch('http://localhost/TrackEd/src/Pages/Professor/AnnouncementDB/update_announcement.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        });

        console.log('Update response status:', response.status);
        
        const result = await response.json();
        console.log('Update response:', result);

        if (result.success) {
          // Refresh announcements
          await fetchAnnouncements();
          resetForm();
          setShowModal(false);
        } else {
          alert('Error updating announcement: ' + result.message);
        }
      } else {
        // Create new announcement
        const postData = {
          professor_ID: professorId,
          classroom_ID: selectedSubject,
          title: title,
          description: description,
          link: link || null,
          deadline: deadline
        };

        console.log('Sending CREATE data:', postData);

        const response = await fetch('http://localhost/TrackEd/src/Pages/Professor/AnnouncementDB/create_announcement.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData)
        });

        console.log('Create response status:', response.status);
        
        const result = await response.json();
        console.log('Create response:', result);

        if (result.success) {
          // Refresh announcements
          await fetchAnnouncements();
          resetForm();
          setShowModal(false);
        } else {
          alert('Error posting announcement: ' + result.message);
        }
      }
    } catch (error) {
      console.error('Error posting announcement:', error);
      alert('Error posting announcement. Please try again.');
    }
  };

  // Reset form function
  const resetForm = () => {
    setSelectedSubject("");
    setSelectedSection("");
    setTitle("");
    setDescription("");
    setLink("");
    setDeadline("");
    setEditingAnnouncement(null);
  };

  // Handle delete announcement
  const handleDelete = async (id) => {
    try {
      const professorId = getProfessorId();
      
      const response = await fetch('http://localhost/TrackEd/src/Pages/Professor/AnnouncementDB/delete_announcement.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          announcement_ID: id,
          professor_ID: professorId
        })
      });

      const result = await response.json();

      if (result.success) {
        // Refresh announcements
        fetchAnnouncements();
      } else {
        alert('Error deleting announcement: ' + result.message);
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      alert('Error deleting announcement. Please try again.');
    }
  };

  // Handle edit announcement
  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    
    // Find the subject code that matches the announcement subject name
    const subjectCode = classes.find(classItem => 
      classItem.subject === announcement.subject
    )?.subject_code || "";
    
    setSelectedSubject(subjectCode);
    setSelectedSection(announcement.section || "");
    setTitle(announcement.title);
    setDescription(announcement.instructions);
    setLink(announcement.link === "#" ? "" : announcement.link);
    
    // Convert deadline back to datetime-local format if it exists
    if (announcement.deadline && announcement.deadline !== "No deadline") {
      // Parse the formatted deadline back to datetime-local format
      const deadlineParts = announcement.deadline.split(' | ');
      if (deadlineParts.length === 2) {
        const datePart = deadlineParts[0];
        const timePart = deadlineParts[1];
        const date = new Date(datePart);
        if (timePart) {
          const [time, modifier] = timePart.split(' ');
          let [hours, minutes] = time.split(':');
          if (modifier === 'pm' && hours !== '12') {
            hours = parseInt(hours) + 12;
          } else if (modifier === 'am' && hours === '12') {
            hours = '00';
          }
          date.setHours(parseInt(hours), parseInt(minutes));
        }
        setDeadline(date.toISOString().slice(0, 16));
      }
    } else {
      setDeadline("");
    }
    
    setShowModal(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    resetForm();
    setShowModal(false);
  };

  // Handle Enter key press in modal inputs
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      handlePost();
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close filter dropdown
      if (filterDropdownOpen && !event.target.closest('.filter-dropdown')) {
        setFilterDropdownOpen(false);
      }
      
      // Close subject dropdown
      if (subjectDropdownOpen && !event.target.closest('.subject-dropdown')) {
        setSubjectDropdownOpen(false);
      }
      
      // Close section dropdown
      if (sectionDropdownOpen && !event.target.closest('.section-dropdown')) {
        setSectionDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [filterDropdownOpen, subjectDropdownOpen, sectionDropdownOpen]);

  return (
    <div>
      {/* Sidebar */}
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />

      <div className={`transition-all duration-300 ${isOpen ? "lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]" : "ml-0"}`}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Jane Doe" />
        
        {/* Page content */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center mb-2">
              <img
                src={AnnouncementIcon}
                alt="Announcement"
                className="h-7 w-7 sm:h-9 sm:w-9 mr-2 sm:mr-3"
              />
              <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                Announcement
              </h1>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-[#465746]">
              Post a class Announcement
            </p>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Filter and Search - Responsive Layout */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-5 sm:mb-6">
            {/* Filter dropdown */}
            <div className="relative sm:flex-initial filter-dropdown">
              <button
                onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                className="flex items-center justify-between w-full sm:w-auto font-bold px-4 py-2.5 bg-white rounded-md shadow-md border-2 border-transparent hover:border-[#00874E] active:border-[#00874E] transition-all duration-200 text-sm sm:text-base sm:min-w-[160px] cursor-pointer touch-manipulation"
              >
                <span>{filterOption}</span>
                <img
                  src={ArrowDown}
                  alt=""
                  className={`ml-3 h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 ${filterDropdownOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Dropdown options */}
              {filterDropdownOpen && (
                <div className="absolute top-full mt-2 bg-white rounded-md w-full sm:min-w-[200px] shadow-xl border border-gray-200 z-20 overflow-hidden">
                  {["All", "Unread", "Read", "Newest"].map((option) => (
                    <button
                      key={option}
                      className={`block px-4 py-2.5 w-full text-left hover:bg-gray-100 active:bg-gray-200 text-sm sm:text-base transition-colors duration-150 cursor-pointer touch-manipulation ${
                        filterOption === option ? 'bg-gray-50 font-semibold' : ''
                      }`}
                      onClick={() => {
                        setFilterOption(option);
                        setFilterDropdownOpen(false);
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search bar with Add button */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1">
              {/* Search bar */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search announcements..."
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

              {/* Add button */}
              <button 
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
                className="font-bold py-2.5 bg-white rounded-md w-11 h-11 lg:w-12 lg:h-12 shadow-md flex items-center justify-center border-2 border-transparent hover:border-[#00874E] active:border-[#00874E] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer flex-shrink-0 touch-manipulation"
                aria-label="Add announcement"
              >
                <img
                  src={Add}
                  alt=""
                  className="h-6 w-6"
                />
              </button>
            </div>
          </div>

          {/* Activity Cards Section */}
          <div className="space-y-4 sm:space-y-5">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00874E] border-r-transparent"></div>
                <p className="mt-3 text-gray-600">Loading announcements...</p>
              </div>
            ) : sortedAnnouncements.length > 0 ? (
              sortedAnnouncements.map((announcement) => (
                <AnnouncementCard
                  key={announcement.id}
                  id={announcement.id}
                  subject={announcement.subject}
                  title={announcement.title}
                  postedBy={announcement.postedBy}
                  datePosted={announcement.datePosted}
                  deadline={announcement.deadline}
                  instructions={announcement.instructions}
                  link={announcement.link}
                  section={announcement.section}
                  isRead={announcement.isRead}
                  onEdit={() => handleEdit(announcement)}
                  onDelete={() => handleDelete(announcement.id)}
                  onMarkAsRead={() => handleMarkAsRead(announcement.id)}
                  onMarkAsUnread={() => handleMarkAsUnread(announcement.id)}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <img 
                    src={AnnouncementIcon} 
                    alt="No announcements" 
                    className="h-8 w-8 opacity-50"
                  />
                </div>
                <p className="text-gray-500 text-sm sm:text-base">
                  {searchQuery || filterOption !== "All" 
                    ? "No announcements match your search criteria" 
                    : "No announcements found"
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Announcement Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleModalClose();
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-md p-6 sm:p-8 relative modal-pop max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleModalClose}
              aria-label="Close modal"
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors cursor-pointer touch-manipulation sm:hidden"
            >
              <img
                src={BackButton}
                alt="Close"
                className="w-5 h-5"
              />
            </button>

            <h2 className="text-xl sm:text-2xl font-bold mb-1 pr-10">
              {editingAnnouncement ? "Edit Announcement" : "New Announcement"}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {editingAnnouncement ? "Update the announcement details" : "Fill in the details to create a new announcement"}
            </p>
            <hr className="border-gray-200 mb-5" />

            {/* Modal Body */}
            <div className="space-y-5">
              {/* Subject Dropdown */}
              <div className="relative subject-dropdown">
                <label className="text-sm font-semibold mb-2 block text-gray-700">
                  Subject <span className="text-red-500">*</span>
                </label>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSubjectDropdownOpen(!subjectDropdownOpen);
                    setSectionDropdownOpen(false);
                  }}
                  className="w-full bg-white border-2 border-gray-300 text-black rounded-md px-4 py-3 flex items-center justify-between hover:border-[#00874E] active:border-[#00874E] focus:border-[#00874E] focus:outline-none transition-colors cursor-pointer touch-manipulation"
                >
                  <span className={`text-sm ${!selectedSubject ? 'text-gray-500' : ''}`}>
                    {selectedSubject ? getUniqueSubjects().find(subj => subj.subject_code === selectedSubject)?.subject_name : "Select Subject"}
                  </span>
                  <img 
                    src={ArrowDown} 
                    alt="" 
                    className={`h-4 w-4 transition-transform ${subjectDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                {subjectDropdownOpen && (
                  <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-xl border border-gray-200 z-10 overflow-hidden max-h-40 overflow-y-auto">
                    {loadingClasses ? (
                      <div className="px-4 py-3 text-sm text-gray-500">Loading subjects...</div>
                    ) : getUniqueSubjects().length > 0 ? (
                      getUniqueSubjects().map((subject) => (
                        <button
                          key={subject.subject_code}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSubject(subject.subject_code);
                            setSelectedSection(""); // Reset section when subject changes
                            setSubjectDropdownOpen(false);
                          }}
                          className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer touch-manipulation"
                        >
                          {subject.subject_name}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">No subjects found. Create a class first.</div>
                    )}
                  </div>
                )}
              </div>

              {/* Section Dropdown */}
              <div className="relative section-dropdown">
                <label className="text-sm font-semibold mb-2 block text-gray-700">Section</label>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSectionDropdownOpen(!sectionDropdownOpen);
                    setSubjectDropdownOpen(false);
                  }}
                  disabled={!selectedSubject}
                  className={`w-full bg-white border-2 border-gray-300 text-black rounded-md px-4 py-3 flex items-center justify-between hover:border-[#00874E] active:border-[#00874E] focus:border-[#00874E] focus:outline-none transition-colors cursor-pointer touch-manipulation ${
                    !selectedSubject ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span className={`text-sm ${!selectedSection ? 'text-gray-500' : ''}`}>
                    {selectedSection || "Select Section"}
                  </span>
                  <img 
                    src={ArrowDown} 
                    alt="" 
                    className={`h-4 w-4 transition-transform ${sectionDropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                {sectionDropdownOpen && selectedSubject && (
                  <div className="absolute top-full mt-1 w-full bg-white rounded-md shadow-xl border border-gray-200 z-10 max-h-40 overflow-y-auto">
                    {getSectionsForSubject().length > 0 ? (
                      getSectionsForSubject().map((section) => (
                        <button
                          key={section}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSection(section);
                            setSectionDropdownOpen(false);
                          }}
                          className="block w-full text-left px-4 py-3 text-sm hover:bg-gray-100 active:bg-gray-200 transition-colors cursor-pointer touch-manipulation"
                        >
                          {section}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-500">No sections found for this subject</div>
                    )}
                  </div>
                )}
              </div>

              {/* Title Input */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full border-2 border-gray-300 rounded-md px-4 py-3 outline-none text-sm focus:border-[#00874E] transition-colors"
                />
              </div>

              {/* Description Textarea */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Enter description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-md px-4 py-3 outline-none min-h-[120px] resize-none text-sm focus:border-[#00874E] transition-colors"
                />
              </div>

              {/* Link Input */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700">Insert Link</label>
                <input
                  type="text"
                  placeholder="Enter link (optional)"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full border-2 border-gray-300 rounded-md px-4 py-3 outline-none text-sm focus:border-[#00874E] transition-colors"
                />
              </div>

              {/* Deadline Input */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700">Deadline</label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-md px-4 py-3 outline-none text-sm focus:border-[#00874E] transition-colors"
                />
              </div>

              {/* Post Button */}
              <button
                onClick={handlePost}
                className="w-full bg-[#00A15D] hover:bg-[#00874E] active:bg-[#006B3D] text-white font-bold py-3 rounded-md transition-all duration-200 text-base cursor-pointer touch-manipulation active:scale-98"
              >
                {editingAnnouncement ? "Update Announcement" : "Post Announcement"}
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