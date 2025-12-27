import React, { useState, useEffect } from 'react';

// Import assets
import FilterIcon from "../../assets/Filter.svg";
import DownArrowIcon from "../../assets/ArrowDown.svg";
import ExpandIcon from "../../assets/ArrowUp.svg";
import Classwork from "../../assets/Classwork.svg";

export default function ActivitiesCard({ classStats }) {
  const [activities, setActivities] = useState([]);
  const [activityFilter, setActivityFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activitiesExpanded, setActivitiesExpanded] = useState(false);

  useEffect(() => {
    generateMockActivities();
  }, []);

  const generateMockActivities = () => {
    const mockActivities = [
      {
        id: 1,
        name: "Midterm Examination",
        type: "quiz",
        datePosted: "2024-03-15",
        dueDate: "2024-03-20",
        totalPoints: 100,
        submissionCount: 35,
        status: "completed"
      },
      {
        id: 2,
        name: "Final Project Proposal",
        type: "project",
        datePosted: "2024-03-10",
        dueDate: "2024-03-25",
        totalPoints: 50,
        submissionCount: 32,
        status: "in-progress"
      },
      {
        id: 3,
        name: "Chapter 5 Assignment",
        type: "assignment",
        datePosted: "2024-03-05",
        dueDate: "2024-03-12",
        totalPoints: 30,
        submissionCount: 35,
        status: "completed"
      },
      {
        id: 4,
        name: "Laboratory Experiment 3",
        type: "laboratory",
        datePosted: "2024-03-01",
        dueDate: "2024-03-08",
        totalPoints: 40,
        submissionCount: 34,
        status: "completed"
      },
      {
        id: 5,
        name: "Quiz 2: Data Structures",
        type: "quiz",
        datePosted: "2024-02-28",
        dueDate: "2024-03-05",
        totalPoints: 20,
        submissionCount: 35,
        status: "completed"
      },
      {
        id: 6,
        name: "Group Presentation",
        type: "activity",
        datePosted: "2024-02-25",
        dueDate: "2024-03-15",
        totalPoints: 100,
        submissionCount: 7,
        status: "in-progress"
      },
      {
        id: 7,
        name: "Programming Assignment 4",
        type: "assignment",
        datePosted: "2024-02-20",
        dueDate: "2024-02-28",
        totalPoints: 50,
        submissionCount: 34,
        status: "completed"
      },
      {
        id: 8,
        name: "Laboratory Final Report",
        type: "laboratory",
        datePosted: "2024-02-15",
        dueDate: "2024-03-01",
        totalPoints: 60,
        submissionCount: 35,
        status: "completed"
      },
      {
        id: 9,
        name: "Pop Quiz",
        type: "quiz",
        datePosted: "2024-02-10",
        dueDate: "2024-02-10",
        totalPoints: 10,
        submissionCount: 35,
        status: "completed"
      },
      {
        id: 10,
        name: "Research Paper",
        type: "project",
        datePosted: "2024-02-05",
        dueDate: "2024-03-30",
        totalPoints: 100,
        submissionCount: 0,
        status: "upcoming"
      }
    ];

    const sortedActivities = mockActivities.sort((a, b) => 
      new Date(b.datePosted) - new Date(a.datePosted)
    );
    setActivities(sortedActivities);
  };

  const getActivityTypeColor = (type) => {
    switch (type) {
      case 'quiz': return { bg: '#FF5252/15', text: '#FF5252' };
      case 'project': return { bg: '#767EE0/15', text: '#767EE0' };
      case 'assignment': return { bg: '#00A15D/15', text: '#00A15D' };
      case 'laboratory': return { bg: '#FFA600/15', text: '#FFA600' };
      case 'activity': return { bg: '#B39DDB/15', text: '#B39DDB' };
      default: return { bg: '#15151C', text: '#FFFFFF' };
    }
  };

  const getActivityStatusColor = (status) => {
    switch (status) {
      case 'completed': return { bg: '#00A15D/15', text: '#00A15D' };
      case 'in-progress': return { bg: '#FFA600/15', text: '#FFA600' };
      case 'upcoming': return { bg: '#767EE0/15', text: '#767EE0' };
      default: return { bg: '#15151C', text: '#FFFFFF' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredActivities = activities.filter(activity => {
    if (activityFilter === 'all') return true;
    return activity.type === activityFilter;
  });

  const getActivityTypeLabel = (type) => {
    switch (type) {
      case 'quiz': return 'Quiz';
      case 'project': return 'Project';
      case 'assignment': return 'Assignment';
      case 'laboratory': return 'Laboratory';
      case 'activity': return 'Activity';
      default: return type;
    }
  };

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
                  <button
                    onClick={() => {
                      setActivityFilter('quiz');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#2A2A35] cursor-pointer ${
                      activityFilter === 'quiz' ? 'text-[#FF5252] font-semibold' : 'text-white'
                    }`}
                  >
                    Quiz
                  </button>
                  <button
                    onClick={() => {
                      setActivityFilter('project');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#2A2A35] cursor-pointer ${
                      activityFilter === 'project' ? 'text-[#767EE0] font-semibold' : 'text-white'
                    }`}
                  >
                    Projects
                  </button>
                  <button
                    onClick={() => {
                      setActivityFilter('assignment');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#2A2A35] cursor-pointer ${
                      activityFilter === 'assignment' ? 'text-[#00A15D] font-semibold' : 'text-white'
                    }`}
                  >
                    Assignment
                  </button>
                  <button
                    onClick={() => {
                      setActivityFilter('laboratory');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#2A2A35] cursor-pointer ${
                      activityFilter === 'laboratory' ? 'text-[#FFA600] font-semibold' : 'text-white'
                    }`}
                  >
                    Laboratory
                  </button>
                  <button
                    onClick={() => {
                      setActivityFilter('activity');
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[#2A2A35] cursor-pointer ${
                      activityFilter === 'activity' ? 'text-[#B39DDB] font-semibold' : 'text-white'
                    }`}
                  >
                    Activity
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Improved Compact Summary */}
      <div className="mb-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { 
              label: "Total", 
              value: activities.length, 
              color: "text-white",
              bgColor: "bg-[#23232C]"
            },
            { 
              label: "Completed", 
              value: activities.filter(a => a.status === 'completed').length,
              color: "text-[#00A15D]",
              bgColor: "bg-[#00A15D]/10"
            },
            { 
              label: "In Progress", 
              value: activities.filter(a => a.status === 'in-progress').length,
              color: "text-[#FFA600]",
              bgColor: "bg-[#FFA600]/10"
            },
            { 
              label: "Upcoming", 
              value: activities.filter(a => a.status === 'upcoming').length,
              color: "text-[#767EE0]",
              bgColor: "bg-[#767EE0]/10"
            }
          ].map((stat, index) => (
            <div key={index} className={`text-center p-2 rounded ${stat.bgColor}`}>
              <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
        
        {/* Activity Type Distribution */}
        <div className="mt-3 pt-3 border-t border-gray-800">
          <div className="text-xs text-gray-400 mb-2">Activity Types:</div>
          <div className="flex flex-wrap gap-1">
            {['quiz', 'assignment', 'project', 'laboratory', 'activity'].map((type) => {
              const count = activities.filter(a => a.type === type).length;
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
                  const typeColor = getActivityTypeColor(activity.type);
                  const statusColor = getActivityStatusColor(activity.status);
                  
                  return (
                    <tr key={activity.id} className="border-b border-gray-800 hover:bg-[#23232C]/50">
                      <td className="py-1.5 px-2">
                        <div className="font-medium text-white text-xs whitespace-normal">{activity.name}</div>
                      </td>
                      <td className="py-1.5 px-2">
                        <span 
                          className="inline-block px-1.5 py-0.5 text-xs font-medium rounded"
                          style={{
                            backgroundColor: typeColor.bg,
                            color: typeColor.text
                          }}
                        >
                          {getActivityTypeLabel(activity.type)}
                        </span>
                      </td>
                      <td className="py-1.5 px-2 text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(activity.datePosted)}
                      </td>
                      <td className="py-1.5 px-2 text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(activity.dueDate)}
                      </td>
                      <td className="py-1.5 px-2 text-xs text-gray-400 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <span>{activity.submissionCount}</span>
                          <span className="text-gray-500">/</span>
                          <span>{classStats?.totalStudents || 35}</span>
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
                          {activity.status === 'in-progress' ? 'In Progress' : activity.status}
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