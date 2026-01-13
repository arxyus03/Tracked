import React, { useState, useEffect } from 'react';

// Import assets
import FilterIcon from "../../assets/Filter.svg";
import DownArrowIcon from "../../assets/ArrowDown.svg";
import ExpandIcon from "../../assets/ArrowUp.svg";
import Classwork from "../../assets/Classwork.svg";

export default function ActivitiesCard({ subjectCode }) {
  const [activities, setActivities] = useState([]);
  const [activityFilter, setActivityFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activitiesExpanded, setActivitiesExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get professor ID from localStorage
  const getProfessorId = () => {
    try {
      const userDataString = localStorage.getItem("user");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        return userData.id;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
    return null;
  };

  // Fetch real activities from API
  useEffect(() => {
    const fetchActivities = async () => {
      if (!subjectCode) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const professorId = getProfessorId();
        const response = await fetch(
          `https://tracked.6minds.site/Professor/SubjectOverviewProfDB/get_subject_activities.php?subject_code=${subjectCode}&professor_ID=${professorId}`
        );
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setActivities(result.activities || []);
          } else {
            console.error('Error fetching activities:', result.message);
            setActivities([]);
          }
        } else {
          throw new Error('Failed to fetch activities');
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [subjectCode]);

  const getActivityTypeColor = (type) => {
    switch (type) {
      case 'Assignment': return { bg: '#767EE0/15', text: '#767EE0' };
      case 'Quiz': return { bg: '#B39DDB/15', text: '#B39DDB' };
      case 'Activity': return { bg: '#00A15D/15', text: '#00A15D' };
      case 'Project': return { bg: '#FFA600/15', text: '#FFA600' };
      case 'Laboratory': return { bg: '#A15353/15', text: '#A15353' };
      case 'Exam': return { bg: '#FF5252/15', text: '#FF5252' };
      case 'Remedial': return { bg: '#3B82F6/15', text: '#3B82F6' };
      default: return { bg: '#15151C', text: '#FFFFFF' };
    }
  };

  const getActivityStatusColor = (status) => {
    switch (status) {
      case 'submitted': return { bg: '#00A15D/15', text: '#00A15D' }; // Green - all submitted after deadline
      case 'completed': return { bg: '#3B82F6/15', text: '#3B82F6' }; // Blue - all submitted before deadline
      case 'assigned': return { bg: '#767EE0/15', text: '#767EE0' }; // Purple - ongoing
      case 'incomplete': return { bg: '#FFA600/15', text: '#FFA600' }; // Yellow - more than half submitted after deadline
      case 'missed': return { bg: '#A15353/15', text: '#A15353' }; // Red - less than half submitted after deadline
      default: return { bg: '#15151C', text: '#FFFFFF' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "No deadline") return "No deadline";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (activityFilter === 'all') return true;
    return activity.activity_type === activityFilter;
  });

  const getActivityTypeLabel = (type) => {
    switch (type) {
      case 'Assignment': return 'Assignment';
      case 'Quiz': return 'Quiz';
      case 'Activity': return 'Activity';
      case 'Project': return 'Project';
      case 'Laboratory': return 'Laboratory';
      case 'Exam': return 'Exam';
      case 'Remedial': return 'Remedial';
      default: return type;
    }
  };

  const getActivityStatusLabel = (status) => {
    switch (status) {
      case 'submitted': return 'Submitted';
      case 'completed': return 'Completed';
      case 'assigned': return 'Assigned';
      case 'incomplete': return 'Incomplete';
      case 'missed': return 'Missed';
      default: return status;
    }
  };

  // Calculate statistics
  const getActivityStats = () => {
    const submitted = activities.filter(a => a.status === 'submitted').length;
    const completed = activities.filter(a => a.status === 'completed').length;
    const assigned = activities.filter(a => a.status === 'assigned').length;
    const incomplete = activities.filter(a => a.status === 'incomplete').length;
    const missed = activities.filter(a => a.status === 'missed').length;
    
    return {
      total: activities.length,
      submitted: submitted + completed, // Combine submitted and completed
      assigned,
      incomplete,
      missed
    };
  };

  const stats = getActivityStats();

  // Get activity type distribution
  const getTypeDistribution = () => {
    const distribution = {};
    activities.forEach(activity => {
      const type = activity.activity_type;
      distribution[type] = (distribution[type] || 0) + 1;
    });
    return distribution;
  };

  const typeDistribution = getTypeDistribution();

  if (loading) {
    return (
      <div className="bg-[#15151C] rounded-lg border border-white/5 p-3 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#FF5252]/15 flex items-center justify-center">
              <img src={Classwork} alt="Activities" className="h-3 w-3" />
            </div>
            <h3 className="text-base font-bold text-white">Posted Activities</h3>
          </div>
        </div>
        <div className="text-center py-4">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-[#00A15D] border-r-transparent"></div>
          <p className="mt-2 text-sm text-gray-400">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#15151C] rounded-lg border border-white/5 p-3 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#FF5252]/15 flex items-center justify-center">
            <img src={Classwork} alt="Activities" className="h-3 w-3" />
          </div>
          <h3 className="text-base font-bold text-white">Posted Activities</h3>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Expand/Collapse Button - Small */}
          <button
            onClick={() => setActivitiesExpanded(!activitiesExpanded)}
            className="flex items-center gap-1 px-2 py-1.5 bg-[#23232C] border border-gray-700 rounded-md text-xs text-white hover:bg-[#2A2A35] transition-colors cursor-pointer"
          >
            <img src={activitiesExpanded ? DownArrowIcon : ExpandIcon} alt={activitiesExpanded ? "Collapse" : "Expand"} className="h-3 w-3" />
            <span>{activitiesExpanded ? 'Collapse' : 'Expand'}</span>
          </button>
          
          {/* Filter Dropdown (only show when expanded) */}
          {activitiesExpanded && (
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-1 px-2 py-1.5 bg-[#23232C] border border-gray-700 rounded-md text-xs text-white hover:bg-[#2A2A35] transition-colors cursor-pointer"
              >
                <img src={FilterIcon} alt="Filter" className="h-3 w-3" />
                <span>
                  {activityFilter === 'all' ? 'All' : getActivityTypeLabel(activityFilter)}
                </span>
                <img src={DownArrowIcon} alt="Dropdown" className="h-2 w-2" />
              </button>
              
              {showFilterDropdown && (
                <div className="absolute right-0 mt-1 w-40 bg-[#23232C] border border-gray-700 rounded-md shadow-lg z-10">
                  <button
                    onClick={() => {
                      setActivityFilter('all');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#2A2A35] cursor-pointer ${
                      activityFilter === 'all' ? 'text-[#00A15D] font-semibold' : 'text-white'
                    }`}
                  >
                    All Activities
                  </button>
                  {/* Updated dropdown options based on ClassworkTab.jsx */}
                  <button
                    onClick={() => {
                      setActivityFilter('Assignment');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#2A2A35] cursor-pointer ${
                      activityFilter === 'Assignment' ? 'text-[#767EE0] font-semibold' : 'text-white'
                    }`}
                  >
                    Assignment
                  </button>
                  <button
                    onClick={() => {
                      setActivityFilter('Quiz');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#2A2A35] cursor-pointer ${
                      activityFilter === 'Quiz' ? 'text-[#B39DDB] font-semibold' : 'text-white'
                    }`}
                  >
                    Quiz
                  </button>
                  <button
                    onClick={() => {
                      setActivityFilter('Activity');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#2A2A35] cursor-pointer ${
                      activityFilter === 'Activity' ? 'text-[#00A15D] font-semibold' : 'text-white'
                    }`}
                  >
                    Activity
                  </button>
                  <button
                    onClick={() => {
                      setActivityFilter('Project');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#2A2A35] cursor-pointer ${
                      activityFilter === 'Project' ? 'text-[#FFA600] font-semibold' : 'text-white'
                    }`}
                  >
                    Projects
                  </button>
                  <button
                    onClick={() => {
                      setActivityFilter('Laboratory');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#2A2A35] cursor-pointer ${
                      activityFilter === 'Laboratory' ? 'text-[#A15353] font-semibold' : 'text-white'
                    }`}
                  >
                    Laboratory
                  </button>
                  <button
                    onClick={() => {
                      setActivityFilter('Exam');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#2A2A35] cursor-pointer ${
                      activityFilter === 'Exam' ? 'text-[#FF5252] font-semibold' : 'text-white'
                    }`}
                  >
                    Exam
                  </button>
                  <button
                    onClick={() => {
                      setActivityFilter('Remedial');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#2A2A35] cursor-pointer ${
                      activityFilter === 'Remedial' ? 'text-[#3B82F6] font-semibold' : 'text-white'
                    }`}
                  >
                    Remedial
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Improved Compact Summary - Submitted, Assigned, Total */}
      <div className="mb-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { 
              label: "Submitted", 
              value: stats.submitted,
              color: "text-[#00A15D]",
              bgColor: "bg-[#00A15D]/10"
            },
            { 
              label: "Assigned", 
              value: stats.assigned,
              color: "text-[#767EE0]",
              bgColor: "bg-[#767EE0]/10"
            },
            { 
              label: "Total", 
              value: stats.total, 
              color: "text-white",
              bgColor: "bg-[#23232C]"
            }
          ].map((stat, index) => (
            <div key={index} className={`text-center p-2 rounded ${stat.bgColor}`}>
              <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
        
        {/* Activity Type Distribution */}
        {Object.keys(typeDistribution).length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-800">
            <div className="text-xs text-gray-400 mb-2">Activity Types:</div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(typeDistribution).map(([type, count]) => {
                if (count === 0) return null;
                const typeColor = getActivityTypeColor(type);
                return (
                  <div 
                    key={type}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs"
                    style={{ backgroundColor: typeColor.bg, color: typeColor.text }}
                  >
                    <span className="font-medium">{count}</span>
                    <span>{getActivityTypeLabel(type)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Activities Table (Visible only when expanded) */}
      {activitiesExpanded && (
        <>
          <div className="overflow-x-auto mb-3">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-1.5 px-2 text-xs font-semibold text-gray-400">Activity Name</th>
                  <th className="text-left py-1.5 px-2 text-xs font-semibold text-gray-400">Type</th>
                  <th className="text-left py-1.5 px-2 text-xs font-semibold text-gray-400">Posted</th>
                  <th className="text-left py-1.5 px-2 text-xs font-semibold text-gray-400">Due Date</th>
                  <th className="text-left py-1.5 px-2 text-xs font-semibold text-gray-400">Submissions</th>
                  <th className="text-left py-1.5 px-2 text-xs font-semibold text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((activity) => {
                  const typeColor = getActivityTypeColor(activity.activity_type);
                  const statusColor = getActivityStatusColor(activity.status);
                  
                  return (
                    <tr key={activity.id} className="border-b border-gray-800 hover:bg-[#23232C]/50">
                      <td className="py-1.5 px-2">
                        <div className="font-medium text-white text-xs whitespace-normal">
                          {activity.title || `Untitled Activity`}
                          {activity.task_number && (
                            <span className="text-gray-400 text-[10px] ml-1">
                              #{activity.task_number}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-1.5 px-2">
                        <span 
                          className="inline-block px-1.5 py-0.5 text-xs font-medium rounded"
                          style={{
                            backgroundColor: typeColor.bg,
                            color: typeColor.text
                          }}
                        >
                          {getActivityTypeLabel(activity.activity_type)}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-xs text-gray-400 whitespace-nowrap">
                        {activity.created_at ? formatDate(activity.created_at) : 'N/A'}
                      </td>
                      <td className="py-1.5 px-2 text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(activity.deadline)}
                      </td>
                      <td className="py-1.5 px-2 text-xs text-gray-400 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span>{activity.submitted_count || 0}</span>
                          <span className="text-gray-500">/</span>
                          <span>{activity.total_students || 0}</span>
                        </div>
                      </td>
                      <td className="py-1.5 px-2">
                        <span 
                          className="inline-block px-1.5 py-0.5 text-xs font-medium rounded capitalize whitespace-nowrap"
                          style={{
                            backgroundColor: statusColor.bg,
                            color: statusColor.text
                          }}
                        >
                          {getActivityStatusLabel(activity.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredActivities.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-xs">
                No activities found for the selected filter
              </div>
            )}
          </div>
        </>
      )}
      
      {/* Close dropdown when clicking outside */}
      {showFilterDropdown && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowFilterDropdown(false)}
        />
      )}
    </div>
  );
}