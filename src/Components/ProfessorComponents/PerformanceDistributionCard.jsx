import React from 'react';
import {
  PieChart, Pie, Cell,
  ResponsiveContainer,
  Tooltip, 
  Legend
} from 'recharts';

const COLORS = ['#00874E', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#B39DDB', '#98D8C8'];

const PerformanceDistributionCard = ({ pieChartData, totalStudents }) => {
  return (
    <div className="bg-[#2A2A35] rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <h3 className="text-sm font-semibold text-[#FFFFFF] mb-1">
        Class Performance Distribution
      </h3>
      <p className="text-xs text-[#FFFFFF]/60 mb-4">Distribution of students across performance levels</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
          <PieChart>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              outerRadius={70}
              fill="#8884d8"
              dataKey="count"
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name, props) => [
                `${value} student${value !== 1 ? 's' : ''} (${((value / totalStudents) * 100).toFixed(1)}%)`,
                props.payload.name
              ]}
              contentStyle={{ backgroundColor: '#2A2A35', borderColor: '#3A3A45', color: '#FFFFFF' }}
            />
            <Legend wrapperStyle={{ color: '#FFFFFF' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1 text-xs">
        {pieChartData.map((range, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-2.5 h-2.5 rounded mr-1.5"
              style={{ backgroundColor: range.color }}
            ></div>
            <span className="text-xs text-[#FFFFFF]">{range.name}: {range.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceDistributionCard;