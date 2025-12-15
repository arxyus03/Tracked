import React from 'react';
import {
  BarChart, Bar,
  ResponsiveContainer,
  Tooltip, 
  CartesianGrid, 
  XAxis, 
  YAxis
} from 'recharts';

const BarChartTooltip = ({ active, payload, label, getStudentDisplayName }) => {
  if (active && payload && payload.length) {
    // For ranking chart, we don't have full student data in payload
    // We'll display what we have
    const studentData = payload[0]?.payload;
    const displayName = studentData?.fullName 
      ? getStudentDisplayName(studentData.name, studentData.fullName)
      : `Student ${label}`;
    
    return (
      <div className="bg-[#2A2A35] border border-[#3A3A45] rounded-lg shadow-xl p-3">
        <p className="font-semibold text-[#FFFFFF] mb-1">
          {displayName}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between">
            <span style={{ color: entry.color }} className="text-sm">
              {entry.name === 'grade' ? 'Average Grade' : 
               entry.name === 'submissions' ? 'Submissions' : 
               entry.name === 'totalActivities' ? 'Total Activities' : 
               entry.name === 'rank' ? 'Rank' : entry.name}:
            </span>
            <span className="text-sm font-medium ml-2 text-[#FFFFFF]">
              {entry.name === 'grade' ? `${entry.value}%` : entry.value}
            </span>
          </div>
        ))}
        {studentData?.rank && (
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#3A3A45]">
            <span className="text-sm text-[#FFFFFF]/80">Current Rank:</span>
            <span className="text-sm font-medium ml-2 text-[#FFFFFF]">
              #{studentData.rank} of {payload[0]?.payload.totalStudents || '?'}
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const StudentPerformanceRankingCard = ({ 
  barChartData, 
  barChartSort, 
  handleBarChartSortChange,
  totalStudents,
  getStudentDisplayName 
}) => {
  return (
    <div className="bg-[#2A2A35] rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[#FFFFFF] mb-1">
            Student Performance Ranking
          </h3>
          <p className="text-xs text-[#FFFFFF]/60">
            {barChartSort === 'desc' 
              ? 'Ranked from highest to lowest average grade' 
              : 'Ranked from lowest to highest average grade'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleBarChartSortChange}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-[#3A3A45] hover:bg-[#4A4A55] rounded-md transition-colors text-[#FFFFFF]"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {barChartSort === 'desc' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              )}
            </svg>
            {barChartSort === 'desc' ? 'High to Low' : 'Low to High'}
          </button>
          <span className="text-xs text-[#FFFFFF]/60">
            {totalStudents} students
          </span>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <BarChart data={barChartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3A3A45" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 10, fill: '#FFFFFF' }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={50}
              label={{ value: 'Student ID', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#FFFFFF' }}
              stroke="#FFFFFF"
            />
            <YAxis 
              domain={[0, 100]} 
              tick={{ fontSize: 11, fill: '#FFFFFF' }}
              label={{ value: 'Average Grade %', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#FFFFFF' }}
              stroke="#FFFFFF"
            />
            <Tooltip content={<BarChartTooltip getStudentDisplayName={getStudentDisplayName} />} />
            <Bar 
              dataKey="grade" 
              name="Average Grade" 
              fill={barChartSort === 'desc' ? '#00874E' : '#FF6B6B'} 
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 text-xs text-[#FFFFFF]/60 text-center">
        Showing all {totalStudents} students
      </div>
    </div>
  );
};

export default StudentPerformanceRankingCard;