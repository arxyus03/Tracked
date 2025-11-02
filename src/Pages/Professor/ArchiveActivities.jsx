import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

import Sidebar from "../../Components/Sidebar";
import Header from "../../Components/Header";

import ArchiveIcon from "../../assets/Archive(Light).svg";
import BackButton from "../../assets/BackButton(Light).svg";
import DeleteIcon from "../../assets/Delete.svg";
import UnarchiveIcon from "../../assets/Unarchive.svg";
import ActivityIcon from '../../assets/SubjectDetails.svg';

export default function ArchiveActivities() {
  const [isOpen, setIsOpen] = useState(false);
  const [archivedActivities, setArchivedActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUnarchiveModal, setShowUnarchiveModal] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [activityToUnarchive, setActivityToUnarchive] = useState(null);
  const [classInfo, setClassInfo] = useState(null);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const subjectCode = searchParams.get('code');

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

  // Load archived activities and class details on component mount
  useEffect(() => {
    if (subjectCode) {
      fetchClassDetails();
      fetchArchivedActivities();
    }
  }, [subjectCode]);

  const fetchClassDetails = async () => {
    try {
      const professorId = getProfessorId();
      const response = await fetch(`http://localhost/TrackEd/src/Pages/Professor/SubjectDetailsDB/get_class_details.php?subject_code=${subjectCode}&professor_ID=${professorId}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setClassInfo(result.class_data);
        }
      }
    } catch (error) {
      console.error('Error fetching class details:', error);
    }
  };

  const fetchArchivedActivities = async () => {
    try {
      setLoading(true);
      const professorId = getProfessorId();
      
      if (!professorId || !subjectCode) {
        console.error('No professor ID or subject code found.');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`http://localhost/TrackEd/src/Pages/Professor/ArchiveActivitiesDB/get_archived_activities.php?subject_code=${subjectCode}&professor_ID=${professorId}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setArchivedActivities(result.activities);
        } else {
          console.error('Error fetching archived activities:', result.message);
        }
      } else {
        throw new Error('Failed to fetch archived activities');
      }
    } catch (error) {
      console.error('Error fetching archived activities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle unarchive
  const handleUnarchive = async (activity, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setActivityToUnarchive(activity);
    setShowUnarchiveModal(true);
  };

  const confirmUnarchive = async () => {
    if (!activityToUnarchive) return;

    try {
      const professorId = getProfessorId();
      
      const response = await fetch('http://localhost/TrackEd/src/Pages/Professor/ArchiveActivitiesDB/unarchive_activity.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity_ID: activityToUnarchive.id,
          professor_ID: professorId
        })
      });

      const result = await response.json();

      if (result.success) {
        setArchivedActivities(prevActivities => 
          prevActivities.filter(activity => activity.id !== activityToUnarchive.id)
        );
        setShowUnarchiveModal(false);
        setActivityToUnarchive(null);
      } else {
        alert('Error unarchiving activity: ' + result.message);
        setShowUnarchiveModal(false);
      }
    } catch (error) {
      console.error('Error unarchiving activity:', error);
      alert('Error unarchiving activity. Please try again.');
      setShowUnarchiveModal(false);
    }
  };

  // Handle delete
  const handleDelete = async (activity, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setActivityToDelete(activity);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!activityToDelete) return;

    try {
      const professorId = getProfessorId();
      
      const response = await fetch('http://localhost/TrackEd/src/Pages/Professor/ArchiveActivitiesDB/delete_activity.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity_ID: activityToDelete.id,
          professor_ID: professorId
        })
      });

      const result = await response.json();

      if (result.success) {
        setArchivedActivities(prevActivities => 
          prevActivities.filter(activity => activity.id !== activityToDelete.id)
        );
        setShowDeleteModal(false);
        setActivityToDelete(null);
      } else {
        alert('Error deleting activity: ' + result.message);
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Error deleting activity:', error);
      alert('Error deleting activity. Please try again.');
      setShowDeleteModal(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateString;
    }
  };

  // Function to render archived activity cards
  const renderArchivedActivityCards = () => {
    if (loading) {
      return (
        <div className="col-span-full text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00874E] border-r-transparent"></div>
          <p className="mt-3 text-gray-600">Loading archived activities...</p>
        </div>
      );
    }

    if (archivedActivities.length === 0) {
      return (
        <div className="col-span-full text-center py-12">
          <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <img 
              src={ArchiveIcon} 
              alt="No archived activities" 
              className="h-8 w-8 opacity-50"
            />
          </div>
          <p className="text-gray-500 text-sm sm:text-base">
            No archived activities found.
          </p>
          <p className="text-gray-400 text-xs sm:text-sm mt-2">
            Activities you archive will appear here.
          </p>
        </div>
      );
    }

    return archivedActivities.map((activity) => (
      <div
        key={activity.id}
        className="bg-white rounded-lg shadow-md p-4 sm:p-5 lg:p-6 space-y-3 border-2 border-transparent hover:border-[#00874E] hover:shadow-lg transition-all duration-200"
      >
        {/* Header with Title and Buttons */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center min-w-0 flex-1">
            <img
              src={ActivityIcon}
              alt="Activity"
              className="h-6 w-6 sm:h-8 sm:w-8 flex-shrink-0 mr-2"
            />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Title:</p>
              <p className="text-sm sm:text-base lg:text-lg font-bold truncate text-[#465746]">
                {activity.title || activity.task_number}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={(e) => handleDelete(activity, e)}
              className="bg-white rounded-md w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 shadow-md flex items-center justify-center border-2 border-transparent hover:border-red-500 hover:scale-105 transition-all duration-200 cursor-pointer"
              title="Delete permanently"
            >
              <img 
                src={DeleteIcon} 
                alt="Delete activity" 
                className="h-5 w-5 sm:h-5 sm:w-5 lg:h-6 lg:w-6" 
              />
            </button>

            <button
              onClick={(e) => handleUnarchive(activity, e)}
              className="bg-white rounded-md w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 shadow-md flex items-center justify-center border-2 border-transparent hover:border-[#00874E] hover:scale-105 transition-all duration-200 cursor-pointer"
              title="Restore activity"
            >
              <img 
                src={UnarchiveIcon} 
                alt="Unarchive activity" 
                className="h-5 w-5 sm:h-5 sm:w-5 lg:h-6 lg:w-6" 
              />
            </button>
          </div>
        </div>

        {/* Activity Details */}
        <div className="space-y-2 pt-2 border-t border-gray-200">
          <div>
            <p className="text-xs sm:text-sm text-gray-600 mb-0.5">Instruction:</p>
            <p className="text-sm text-gray-700 break-words line-clamp-2">
              {activity.instruction || activity.description || 'No instruction provided'}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs sm:text-sm">
            <div>
              <span className="text-gray-600">Type: </span>
              <span className="font-semibold text-[#465746] capitalize">{activity.activity_type?.toLowerCase()}</span>
            </div>
            <div>
              <span className="text-gray-600">Task: </span>
              <span className="font-semibold text-[#465746] uppercase">{activity.task_number}</span>
            </div>
            {activity.points && (
              <div>
                <span className="text-gray-600">Points: </span>
                <span className="font-semibold text-[#465746]">{activity.points}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <span className="font-bold text-[#EF4444]">Deadline:</span>
            <span className="text-gray-700">{formatDate(activity.deadline)}</span>
          </div>

          {activity.link && (
            <div className="flex items-start gap-2 text-xs sm:text-sm">
              <span className="font-semibold text-gray-600 whitespace-nowrap">Link:</span>
              <a 
                href={activity.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline break-words flex-1"
              >
                {activity.link}
              </a>
            </div>
          )}
        </div>
      </div>
    ));
  };

  return (
    <div>
      <Sidebar role="teacher" isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className={`
        transition-all duration-300
        ${isOpen ? 'lg:ml-[250px] xl:ml-[280px] 2xl:ml-[300px]' : 'ml-0'}
      `}>
        <Header setIsOpen={setIsOpen} isOpen={isOpen} userName="Jane Doe" />

        {/* Main Content */}
        <div className="p-4 sm:p-5 md:p-6 lg:p-8">
          
          {/* Page Header */}
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <img
                  src={ArchiveIcon}
                  alt=""
                  className="h-6 w-6 sm:h-7 sm:w-7 mr-3"
                />
                <h1 className="font-bold text-xl sm:text-2xl lg:text-3xl text-[#465746]">
                  Archived Activities
                </h1>
              </div>
              
              {/* Mobile Back Button */}
              <Link to={`/SubjectDetails?code=${subjectCode}`} className="sm:hidden">
                <button 
                  className="flex items-center justify-center w-9 h-9 cursor-pointer transition-all duration-200 hover:scale-110"
                  aria-label="Back to Activities"
                >
                  <img
                    src={BackButton}
                    alt="Back"
                    className="h-6 w-6"
                  />
                </button>
              </Link>
            </div>
            <p className="text-sm sm:text-base lg:text-lg text-[#465746]/80">
              {classInfo ? `${classInfo.subject} - ${classInfo.section}` : 'Loading...'}
            </p>
          </div>

          <hr className="border-[#465746]/30 mb-5 sm:mb-6" />

          {/* Archived Activities Grid */}
          <div className="grid grid-cols-1 gap-4 sm:gap-5">
            {renderArchivedActivityCards()}
          </div>
        </div>
      </div>

      {/* Unarchive Confirmation Modal */}
      {showUnarchiveModal && activityToUnarchive && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowUnarchiveModal(false);
              setActivityToUnarchive(null);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop">
            <div className="text-center">
              {/* Info Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <img 
                  src={UnarchiveIcon} 
                  alt="Restore" 
                  className="h-8 w-8"
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Restore Activity?
              </h3>
              
              <div className="mt-4 mb-6">
                <p className="text-sm text-gray-600 mb-3">
                  Are you sure you want to restore this activity?
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <p className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                    {activityToUnarchive.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Type: {activityToUnarchive.activity_type}
                  </p>
                  <p className="text-sm text-gray-600">
                    Task: {activityToUnarchive.task_number}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowUnarchiveModal(false);
                    setActivityToUnarchive(null);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUnarchive}
                  className="flex-1 bg-[#00A15D] hover:bg-[#00874E] text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
                >
                  Restore
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && activityToDelete && (
        <div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 overlay-fade p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteModal(false);
              setActivityToDelete(null);
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-sm sm:max-w-md p-6 sm:p-8 relative modal-pop">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <img 
                  src={DeleteIcon} 
                  alt="Delete" 
                  className="h-8 w-8"
                />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Delete Activity?
              </h3>
              
              <div className="mt-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">
                  Are you sure you want to permanently delete this activity?
                </p>
                <p className="text-sm font-semibold text-red-600 mb-3">
                  This action cannot be undone.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <p className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                    {activityToDelete.title}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Type: {activityToDelete.activity_type}
                  </p>
                  <p className="text-sm text-gray-600">
                    Task: {activityToDelete.task_number}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setActivityToDelete(null);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-md transition-all duration-200 cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
  );
}