import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const StudentPerformanceCard = ({ 
  analyticsData, 
  selectedActivityType, 
  setSelectedActivityType,
  getStudentDisplayName 
}) => {
  // Color palette for charts (adjusted for dark mode)
  const COLORS = ['#00874E', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#B39DDB', '#98D8C8'];
  const ACTIVITY_TYPES = ['Assignment', 'Quiz', 'Activity', 'Project', 'Laboratory', 'Attendance'];

  // Filter line chart data based on selected activity type
  const filteredLineChartData = analyticsData?.lineChartData?.filter(item => 
    selectedActivityType === 'All' || item.activityType === selectedActivityType
  ) || [];

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#2A2A35] border border-[#3A3A45] rounded-lg shadow-xl p-3 max-w-xs">
          <p className="font-semibold text-[#FFFFFF] mb-1">{label}</p>
          {payload.map((entry, index) => {
            let displayName = entry.name;
            if (entry.name === 'Class Average') {
              displayName = 'Class Average';
            } else {
              const student = analyticsData?.students?.find(s => s.user_ID === entry.name);
              if (student) {
                displayName = getStudentDisplayName(student.user_ID, student.user_Name);
              } else {
                displayName = `Student ${entry.name}`;
              }
            }
            
            return (
              <div key={index} className="flex items-center justify-between">
                <span style={{ color: entry.color }} className="text-sm">
                  {displayName}:
                </span>
                <span className="text-sm font-medium ml-2 text-[#FFFFFF]">
                  {entry.value !== null ? `${entry.value}%` : 'Not submitted'}
                </span>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // Safety check - if no analyticsData, don't render
  if (!analyticsData) {
    return null;
  }

  return (
    <div className="bg-[#2A2A35] rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#FFFFFF]">
            Student Performance Across Activities
          </h3>
          <p className="text-xs text-[#FFFFFF]/60">Individual student scores on each class activity</p>
        </div>
        <div className="flex items-center gap-2 mt-1 sm:mt-0">
          <span className="text-xs text-[#FFFFFF]/60">Filter by:</span>
          <select
            value={selectedActivityType}
            onChange={(e) => setSelectedActivityType(e.target.value)}
            className="px-2 py-1.5 border border-[#3A3A45] rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#00874E] focus:border-transparent bg-[#2A2A35] text-[#FFFFFF]"
          >
            <option value="All">All Types</option>
            {ACTIVITY_TYPES.filter(type => type !== 'Attendance').map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <LineChart data={filteredLineChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3A3A45" />
            <XAxis 
              dataKey="activity" 
              tick={{ fontSize: 11, fill: '#FFFFFF' }}
              stroke="#FFFFFF"
            />
            <YAxis 
              label={{ value: 'Score (%)', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#FFFFFF' }} 
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: '#FFFFFF' }}
              stroke="#FFFFFF"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: '#FFFFFF' }} />
            
            {analyticsData?.students?.map((student, index) => {
              const displayName = getStudentDisplayName(student.user_ID, student.user_Name);
              
              return (
                <Line
                  key={student.user_ID}
                  type="monotone"
                  dataKey={student.user_ID}
                  name={displayName}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={1.5}
                  dot={{ r: 2 }}
                  activeDot={{ r: 3 }}
                  connectNulls
                />
              );
            })}
            
            {filteredLineChartData.some(d => d['Class Average'] !== undefined) && (
              <Line
                type="monotone"
                dataKey="Class Average"
                name="Class Average"
                stroke="#FFFFFF"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 pt-4 border-t border-[#3A3A45]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div>
            <h4 className="text-xs font-semibold text-[#FFFFFF] mb-1 flex items-center">
              <svg className="w-3 h-3 mr-1 text-[#00874E]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Activity Key: What A1, A2, A3 Represent
            </h4>
            
            {selectedActivityType !== 'All' && (
              <div className="inline-flex items-center bg-[#B39DDB]/20 text-[#B39DDB] text-xs font-medium px-2 py-0.5 rounded-full mb-2">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
                Filtered: Showing only "{selectedActivityType}"
              </div>
            )}
          </div>
          
          <div className="text-xs text-[#FFFFFF]/60">
            <div className="flex items-center">
              <div className="w-2.5 h-2.5 bg-[#FFFFFF] rounded mr-1.5 border border-[#3A3A45]"></div>
              <span>Dashed line = Class Average</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#1E1E26] rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-medium text-[#FFFFFF] text-sm">
                Activity Details
              </h5>
              <span className="text-xs bg-[#3A3A45] text-[#FFFFFF]/70 px-2 py-0.5 rounded">
                {filteredLineChartData.length} activities shown
              </span>
            </div>
            
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {analyticsData?.activities
                ?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
                .slice(0, 6)
                .map((activity, index) => (
                  <div key={activity.id} className="flex items-start p-1.5 bg-[#2A2A35] rounded border border-[#3A3A45] hover:bg-[#3A3A45]">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 flex items-center justify-center bg-[#00874E] text-white text-xs font-bold rounded mr-2">
                        A{index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-[#FFFFFF] text-xs truncate" title={activity.title}>
                        {activity.title}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs px-1.5 py-0.5 bg-[#3A3A45] text-[#FFFFFF]/70 rounded">
                          {activity.activity_type || 'Other'}
                        </span>
                        <span className="text-xs text-[#FFFFFF]/60">
                          {activity.points || 0} pts
                        </span>
                        <span className="text-xs text-[#FFFFFF]/40">
                          • {new Date(activity.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            
            {analyticsData?.activities && analyticsData.activities.length > 6 && (
              <p className="text-xs text-[#FFFFFF]/40 mt-1 text-center">
                Showing first 6 of {analyticsData.activities.length} activities
              </p>
            )}
          </div>
          
          <div className="bg-[#1A237E]/20 rounded-lg p-3 border border-[#283593]/30">
            <h5 className="font-medium text-[#7986CB] text-sm mb-2 flex items-center">
              <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Understanding the Chart
            </h5>
            
            <div className="space-y-2">
              <div className="flex items-start">
                <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center bg-[#00874E] text-white text-xs font-bold rounded mr-2">
                  A1
                </div>
                <div>
                  <span className="text-xs font-medium text-[#FFFFFF]">Activity Sequence</span>
                  <p className="text-xs text-[#FFFFFF]/80">
                    <strong>A1, A2, A3</strong> represent activities in chronological order.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-2.5 h-2.5 flex-shrink-0 mt-0.5 mr-1.5">
                  <div className="w-full h-full bg-[#FFFFFF] border border-[#3A3A45] rounded"></div>
                </div>
                <div>
                  <span className="text-xs font-medium text-[#FFFFFF]">Class Average</span>
                  <p className="text-xs text-[#FFFFFF]/80">
                    Dashed line shows average score for each activity.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-2.5 h-2.5 flex-shrink-0 mt-0.5 mr-1.5">
                  <div className="w-full h-full bg-[#00874E] rounded"></div>
                </div>
                <div>
                  <span className="text-xs font-medium text-[#FFFFFF]">Student Lines</span>
                  <p className="text-xs text-[#FFFFFF]/80">
                    Each line represents one student's performance.
                  </p>
                </div>
              </div>
              
              <div className="text-xs text-[#7986CB] bg-[#283593]/20 p-2 rounded border border-[#283593]/30">
                <strong>Tip:</strong> Hover over points to see student details and exact scores.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformanceCard;