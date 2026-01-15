import React from "react";
import Search from "../../assets/Search.svg";
import CheckSubmitted from "../../assets/CheckTable(Green).svg";
import CheckPending from "../../assets/LateTable(Blue).svg";
import Cross from "../../assets/CrossTable(Red).svg";
import ArrowLeft from '../../assets/ArrowLeft.svg';
import ArrowRight from '../../assets/ArrowRight.svg';

export default function ActivityList({
  displayedList,
  selectedFilter,
  currentSubject,
  subjectCode,
  activitySearchTerm,
  setActivitySearchTerm,
  activityCurrentPage,
  setActivityCurrentPage,
  itemsPerPage = 8,
  isDarkMode = true
}) {
  // Color palette for activity types
  const activityTypeColors = {
    Overall: isDarkMode ? "#FFFFFF" : "#374151",
    Activities: "#FFA600",
    Assignment: "#767EE0",
    Quizzes: "#00A15D",
    Laboratory: "#A15353",
    Projects: "#767EE0"
  };

  // Get current subject name
  const getCurrentSubjectName = () => {
    if (!currentSubject) {
      return `${subjectCode || 'Loading...'}`;
    }
    return `${currentSubject.subject || 'Unknown Subject'} (${currentSubject.section})`;
  };

  // Get the text color for the current displayed label
  const getDisplayedLabelColor = () => {
    if (selectedFilter === '') return activityTypeColors.Overall;
    if (selectedFilter === 'Quizzes') return activityTypeColors.Quizzes;
    if (selectedFilter === 'Assignment') return activityTypeColors.Assignment;
    if (selectedFilter === 'Activities') return activityTypeColors.Activities;
    if (selectedFilter === 'Projects') return activityTypeColors.Projects;
    if (selectedFilter === 'Laboratory') return activityTypeColors.Laboratory;
    return activityTypeColors.Overall;
  };

  const displayedLabel = selectedFilter === '' 
    ? 'All Activities' 
    : selectedFilter || 'Quizzes';

  // Filter activities based on search term
  const filteredActivities = React.useMemo(() => {
    if (!activitySearchTerm.trim()) {
      return displayedList;
    }
    
    const searchTermLower = activitySearchTerm.toLowerCase().trim();
    return displayedList.filter(activity => 
      activity.task.toLowerCase().includes(searchTermLower) ||
      activity.title.toLowerCase().includes(searchTermLower) ||
      activity.deadline.toLowerCase().includes(searchTermLower)
    );
  }, [displayedList, activitySearchTerm]);

  // Pagination calculations for activities
  const activityTotalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const activityStartIndex = (activityCurrentPage - 1) * itemsPerPage;
  const currentActivities = filteredActivities.slice(activityStartIndex, activityStartIndex + itemsPerPage);

  // Reset pagination when filters or search change
  React.useEffect(() => {
    setActivityCurrentPage(1);
  }, [selectedFilter, activitySearchTerm, setActivityCurrentPage]);

  // Pagination handler
  const handleActivityPageChange = (page) => {
    setActivityCurrentPage(page);
  };

  // Theme helper functions
  const getBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-white";
  };

  const getTextColor = () => {
    return isDarkMode ? "text-white" : "text-gray-900";
  };

  const getSecondaryTextColor = () => {
    return isDarkMode ? "text-gray-400" : "text-gray-600";
  };

  const getBorderColor = () => {
    return isDarkMode ? "border-gray-700" : "border-gray-200";
  };

  const getHoverBackgroundColor = () => {
    return isDarkMode ? "hover:bg-gray-900/50" : "hover:bg-gray-50";
  };

  const getInputBackgroundColor = () => {
    return isDarkMode ? "bg-gray-900" : "bg-gray-100";
  };

  const getInputBorderColor = () => {
    return isDarkMode ? "border-gray-700" : "border-gray-300";
  };

  const getInputFocusBorderColor = () => {
    return isDarkMode ? "focus:border-[#767EE0]" : "focus:border-[#767EE0]";
  };

  const getInputTextColor = () => {
    return isDarkMode ? "text-white" : "text-gray-900";
  };

  const getTableHeaderBackgroundColor = () => {
    return isDarkMode ? "bg-[#15151C]" : "bg-gray-50";
  };

  const getTableHeaderTextColor = () => {
    return isDarkMode ? "text-gray-300" : "text-gray-600";
  };

  const getButtonBackgroundColor = () => {
    return isDarkMode ? "bg-gray-900" : "bg-gray-100";
  };

  const getButtonHoverBackgroundColor = () => {
    return isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-200";
  };

  const getButtonDisabledBackgroundColor = () => {
    return isDarkMode ? "bg-gray-800" : "bg-gray-200";
  };

  const getButtonDisabledTextColor = () => {
    return isDarkMode ? "text-gray-500" : "text-gray-400";
  };

  // Pagination Component
  const Pagination = () => {
    const maxVisiblePages = 3;
    
    let startPage = Math.max(1, activityCurrentPage - 1);
    let endPage = Math.min(activityTotalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    if (activityTotalPages <= 1) return null;

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-3 px-1">
        <div className={`text-xs ${getSecondaryTextColor()}`}>
          Showing {activityStartIndex + 1} to {Math.min(activityCurrentPage * itemsPerPage, filteredActivities.length)} of {filteredActivities.length} entries
        </div>
        
        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <button
            onClick={() => handleActivityPageChange(activityCurrentPage - 1)}
            disabled={activityCurrentPage === 1}
            className={`flex items-center justify-center w-7 h-7 rounded-md ${
              activityCurrentPage === 1 
                ? `${getButtonDisabledBackgroundColor()} ${getButtonDisabledTextColor()} cursor-not-allowed` 
                : `${getButtonBackgroundColor()} ${getTextColor()} border ${getBorderColor()} ${getButtonHoverBackgroundColor()} cursor-pointer`
            }`}
          >
            <img 
              src={ArrowLeft} 
              alt="Previous" 
              className="w-3 h-3" 
              style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
            />
          </button>

          {/* Page Numbers */}
          {pageNumbers.map(page => (
            <button
              key={page}
              onClick={() => handleActivityPageChange(page)}
              className={`cursor-pointer flex items-center justify-center w-7 h-7 rounded-md text-xs font-medium ${
                activityCurrentPage === page
                  ? 'bg-[#767EE0] text-white'
                  : `${getButtonBackgroundColor()} ${getTextColor()} border ${getBorderColor()} ${getButtonHoverBackgroundColor()}`
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next Button */}
          <button
            onClick={() => handleActivityPageChange(activityCurrentPage + 1)}
            disabled={activityCurrentPage === activityTotalPages}
            className={`flex items-center justify-center w-7 h-7 rounded-md ${
              activityCurrentPage === activityTotalPages
                ? `${getButtonDisabledBackgroundColor()} ${getButtonDisabledTextColor()} cursor-not-allowed`
                : `${getButtonBackgroundColor()} ${getTextColor()} border ${getBorderColor()} ${getButtonHoverBackgroundColor()} cursor-pointer`
            }`}
          >
            <img 
              src={ArrowRight} 
              alt="Next" 
              className="w-3 h-3" 
              style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
            />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`${getBackgroundColor()} p-3 rounded-lg shadow-md ${getTextColor()} h-full flex flex-col`}>
      {/* Header with search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
        <p className="font-semibold text-sm" style={{ color: getDisplayedLabelColor() }}>
          {displayedLabel} - {getCurrentSubjectName()}
        </p>
        
        {/* Activity List Search */}
        <div className="relative w-full sm:w-56">
          <input
            type="text"
            placeholder="Search activities..."
            value={activitySearchTerm}
            onChange={(e) => setActivitySearchTerm(e.target.value)}
            className={`w-full h-8 rounded-md px-3 py-1 pr-8 outline-none ${getInputBackgroundColor()} ${getInputTextColor()} text-sm border ${getInputBorderColor()} ${getInputFocusBorderColor()}`}
          />
          <button className={`absolute right-2 top-1/2 -translate-y-1/2 ${getSecondaryTextColor()}`}>
            <img 
              src={Search} 
              alt="Search" 
              className="h-3.5 w-3.5" 
              style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
            />
          </button>
        </div>
      </div>

      {/* Table container with flex-grow to take available space */}
      <div className="flex-grow overflow-auto">
        {currentActivities.length === 0 ? (
          <div className="text-center py-8">
            <p className={`${getSecondaryTextColor()} text-sm`}>
              {activitySearchTerm ? `No activities found for "${activitySearchTerm}"` : `No ${displayedLabel.toLowerCase()} found for ${getCurrentSubjectName()}.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className={`border-b ${getBorderColor()} sticky top-0 ${getTableHeaderBackgroundColor()}`}>
                  <th className={`text-left p-2 font-medium ${getTableHeaderTextColor()}`}>Task</th>
                  <th className={`text-left p-2 font-medium ${getTableHeaderTextColor()}`}>Title</th>
                  <th className={`text-left p-2 font-medium`} style={{ color: '#00A15D' }}>Submitted</th>
                  <th className={`text-left p-2 font-medium`} style={{ color: '#767EE0' }}>Assigned</th>
                  <th className={`text-left p-2 font-medium`} style={{ color: '#A15353' }}>Missed</th>
                  <th className={`text-left p-2 font-medium ${getTableHeaderTextColor()}`}>Deadline</th>
                </tr>
              </thead>
              <tbody>
                {currentActivities.map(item => {
                  // Determine status for each item
                  const isSubmitted = item.submitted === 1 || item.submitted === true;
                  const isMissing = item.missing === 1 || item.missing === true;
                  const isAssigned = !isSubmitted && !isMissing;
                  
                  return (
                    <tr key={item.id} className={`border-b ${getBorderColor()} ${getHoverBackgroundColor()}`}>
                      <td className={`p-2 whitespace-nowrap ${getTextColor()}`}>{item.task}</td>
                      <td className={`p-2 ${getTextColor()}`}>{item.title}</td>
                      
                      {/* Submitted Column */}
                      <td className="p-2">
                        {isSubmitted ? (
                          <img 
                            src={CheckSubmitted} 
                            alt="Submitted" 
                            className="w-4 h-4" 
                            style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                          />
                        ) : (
                          <span className={`${getSecondaryTextColor()}`}>-</span>
                        )}
                      </td>
                      
                      {/* Assigned Column */}
                      <td className="p-2">
                        {isAssigned ? (
                          <img 
                            src={CheckPending} 
                            alt="Assigned" 
                            className="w-3.5 h-3.5" 
                            style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                          />
                        ) : (
                          <span className={`${getSecondaryTextColor()}`}>-</span>
                        )}
                      </td>
                      
                      {/* Missed Column */}
                      <td className="p-2">
                        {isMissing ? (
                          <img 
                            src={Cross} 
                            alt="Missed" 
                            className="w-3.5 h-3.5" 
                            style={isDarkMode ? {} : { filter: 'invert(0.5)' }}
                          />
                        ) : (
                          <span className={`${getSecondaryTextColor()}`}>-</span>
                        )}
                      </td>
                      
                      <td className={`p-2 whitespace-nowrap ${getTextColor()}`}>{item.deadline}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Activity List Pagination */}
      {currentActivities.length > 0 && (
        <div className="mt-3">
          <Pagination />
        </div>
      )}
    </div>
  );
}