import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// Color palette for charts
const COLORS = ['#00874E', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#B39DDB', '#98D8C8'];
const ACTIVITY_TYPES = ['Assignment', 'Quiz', 'Activity', 'Project', 'Laboratory', 'Attendance'];

const PerformanceByAssessmentType = ({ 
  analyticsData, 
  getStudentDisplayName 
}) => {
  
  const calculateAttendanceRecord = (studentId) => {
    if (!analyticsData?.attendanceData || analyticsData.attendanceData.length === 0) {
      return null;
    }
    
    const attendanceSummary = {
      totalDays: analyticsData.attendanceData.length,
      present: 0,
      late: 0,
      absent: 0,
      excused: 0,
      records: []
    };
    
    analyticsData.attendanceData.forEach(dateRecord => {
      // Find student's attendance record for this date
      const studentRecord = dateRecord.students.find(s => 
        s.student_ID == studentId || 
        s.user_ID == studentId
      );
      
      let status = 'absent'; // Default status
      
      if (studentRecord) {
        status = studentRecord.status ? studentRecord.status.toLowerCase() : 'absent';
      }
      
      attendanceSummary.records.push({
        date: dateRecord.date,
        rawDate: dateRecord.raw_date,
        status: status
      });
      
      switch (status) {
        case 'present':
        case 'on-time':
          attendanceSummary.present++;
          break;
        case 'late':
          attendanceSummary.late++;
          break;
        case 'absent':
          attendanceSummary.absent++;
          break;
        case 'excused':
          attendanceSummary.excused++;
          break;
        default:
          attendanceSummary.absent++;
      }
    });
    
    return attendanceSummary;
  };

  // Safety check
  if (!analyticsData || !analyticsData.activityTypeData) {
    console.log('PerformanceByAssessmentType: Missing analyticsData or activityTypeData');
    return null;
  }

  return (
    <div className="bg-[#2A2A35] rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <h3 className="text-sm font-semibold text-[#FFFFFF] mb-1">
        Performance by Assessment Type
      </h3>
      <p className="text-xs text-[#FFFFFF]/60 mb-4">
        Detailed student performance across different assessment types
      </p>
      
      {/* Attendance Graph Section */}
      <div className="mb-6 bg-[#1E1E26] rounded-lg p-3 border border-[#3A3A45]">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-[#FFFFFF] text-sm flex items-center">
            <div 
              className="w-2.5 h-2.5 rounded-full mr-1.5"
              style={{ backgroundColor: COLORS[5 % COLORS.length] }}
            ></div>
            Attendance Analysis
          </h4>
          <span className="text-xs text-[#FFFFFF]/60">
            {analyticsData.summary.totalAttendanceDays || 0} days tracked
          </span>
        </div>
        
        {analyticsData.activityTypeData['Attendance'] && analyticsData.activityTypeData['Attendance'].length > 0 ? (
          <>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <BarChart 
                  data={analyticsData.activityTypeData['Attendance']}
                  margin={{ top: 15, right: 25, left: 15, bottom: 50 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#3A3A45" />
                  <XAxis 
                    dataKey="studentName" 
                    tick={{ fontSize: 9, fill: '#FFFFFF' }}
                    angle={-45}
                    textAnchor="end"
                    height={35}
                    stroke="#FFFFFF"
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 9, fill: '#FFFFFF' }}
                    label={{ value: 'Attendance Rate (%)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#FFFFFF' }}
                    stroke="#FFFFFF"
                  />
                  <Tooltip 
                    formatter={(value, name, props) => {
                      if (name === 'average') {
                        const fullName = props.payload.fullName || `Student ${props.payload.studentName}`;
                        const displayName = getStudentDisplayName(props.payload.studentName, fullName);
                        return [
                          `${value}%`, 
                          `Attendance Rate for ${displayName}`
                        ];
                      }
                      return [value, name];
                    }}
                    contentStyle={{ backgroundColor: '#2A2A35', borderColor: '#3A3A45', color: '#FFFFFF' }}
                    labelFormatter={(label) => {
                      const student = analyticsData?.students?.find(s => s.user_ID === label);
                      return student ? getStudentDisplayName(student.user_ID, student.user_Name) : `Student ${label}`;
                    }}
                  />
                  <Bar 
                    dataKey="average" 
                    name="Attendance Rate"
                    fill={COLORS[5 % COLORS.length]}
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-[#1B5E20]/30 border border-[#2E7D32]/30 rounded p-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#A5D6A7]">High</span>
                  <span className="text-xs bg-[#1B5E20]/50 text-[#A5D6A7] px-1 py-0.5 rounded">
                    ≥90%
                  </span>
                </div>
                <p className="text-lg font-bold text-[#A5D6A7]">
                  {
                    analyticsData.activityTypeData['Attendance'].filter(
                      item => item.average >= 90
                    ).length
                  }
                </p>
                <p className="text-xs text-[#A5D6A7]">students</p>
              </div>
              
              <div className="bg-[#F57F17]/30 border border-[#FF9800]/30 rounded p-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#FFE082]">Moderate</span>
                  <span className="text-xs bg-[#F57F17]/50 text-[#FFE082] px-1 py-0.5 rounded">
                    70-89%
                  </span>
                </div>
                <p className="text-lg font-bold text-[#FFE082]">
                  {
                    analyticsData.activityTypeData['Attendance'].filter(
                      item => item.average >= 70 && item.average < 90
                    ).length
                  }
                </p>
                <p className="text-xs text-[#FFE082]">students</p>
              </div>
              
              <div className="bg-[#E65100]/30 border border-[#EF6C00]/30 rounded p-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#FFAB91]">Low</span>
                  <span className="text-xs bg-[#E65100]/50 text-[#FFAB91] px-1 py-0.5 rounded">
                    50-69%
                  </span>
                </div>
                <p className="text-lg font-bold text-[#FFAB91]">
                  {
                    analyticsData.activityTypeData['Attendance'].filter(
                      item => item.average >= 50 && item.average < 70
                    ).length
                  }
                </p>
                <p className="text-xs text-[#FFAB91]">students</p>
              </div>
              
              <div className="bg-[#C62828]/30 border border-[#D32F2F]/30 rounded p-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[#EF9A9A]">Critical</span>
                  <span className="text-xs bg-[#C62828]/50 text-[#EF9A9A] px-1 py-0.5 rounded">
                    {'<'}50%
                  </span>
                </div>
                <p className="text-lg font-bold text-[#EF9A9A]">
                  {
                    analyticsData.activityTypeData['Attendance'].filter(
                      item => item.average < 50
                    ).length
                  }
                </p>
                <p className="text-xs text-[#EF9A9A]">students</p>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-[#3A3A45]">
              <h5 className="text-xs font-medium text-[#FFFFFF] mb-1">Attendance Insights:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {analyticsData.activityTypeData['Attendance'].some(item => item.average < 70) && (
                  <div className="bg-[#FF6F00]/20 border border-[#FF8F00]/30 rounded p-2">
                    <div className="flex items-center mb-0.5">
                      <svg className="w-3 h-3 text-[#FFB74D] mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium text-[#FFCC80]">Attendance Concerns</span>
                    </div>
                    <p className="text-xs text-[#FFCC80]">
                      {
                        analyticsData.activityTypeData['Attendance'].filter(
                          item => item.average < 70
                        ).length
                      } students below 70%. Consider intervention.
                    </p>
                  </div>
                )}
                
                {analyticsData.activityTypeData['Attendance'].some(item => item.average >= 90) && (
                  <div className="bg-[#1B5E20]/20 border border-[#2E7D32]/30 rounded p-2">
                    <div className="flex items-center mb-0.5">
                      <svg className="w-3 h-3 text-[#A5D6A7] mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs font-medium text-[#A5D6A7]">Excellent Attendance</span>
                    </div>
                    <p className="text-xs text-[#A5D6A7]">
                      {
                        analyticsData.activityTypeData['Attendance'].filter(
                          item => item.average >= 90
                        ).length
                      } students maintain ≥90% attendance.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <svg className="w-12 h-12 mx-auto text-[#FFFFFF]/40 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="text-sm font-medium text-[#FFFFFF] mb-1">No Attendance Data</h4>
            <p className="text-[#FFFFFF]/60 text-xs mb-3">
              No attendance records found. Take attendance to see analytics.
            </p>
          </div>
        )}
      </div>
      
      {/* Other Assessment Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACTIVITY_TYPES.filter(type => type !== 'Attendance').map((type, index) => {
          const typeData = analyticsData.activityTypeData[type];
          
          if (!typeData || typeData.length === 0) {
            const activityCount = Object.entries(analyticsData.summary.activityTypeDistribution)
              .find(([t]) => t === type)?.[1] || 0;
            
            if (activityCount === 0) return null;
            
            return (
              <div key={type} className="bg-[#1E1E26] rounded-lg p-3 border border-[#3A3A45]">
                <h4 className="font-semibold text-[#FFFFFF] text-sm mb-2 flex items-center">
                  <div 
                    className="w-2.5 h-2.5 rounded-full mr-1.5"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  {type}
                </h4>
                <div className="h-40 flex items-center justify-center">
                  <div className="text-center text-[#FFFFFF]/40 text-xs">
                    <p>No graded submissions yet</p>
                    <p className="text-xs mt-0.5">{activityCount} activity(s)</p>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={type} className="bg-[#1E1E26] rounded-lg p-3 border border-[#3A3A45] hover:bg-[#2A2A35] transition-colors">
              <h4 className="font-semibold text-[#FFFFFF] text-sm mb-2 flex items-center">
                <div 
                  className="w-2.5 h-2.5 rounded-full mr-1.5"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                {type}
                <span className="ml-auto text-xs text-[#FFFFFF]/60">
                  {typeData.length} students
                </span>
              </h4>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={typeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#3A3A45" />
                    <XAxis 
                      dataKey="studentName" 
                      tick={{ fontSize: 9, fill: '#FFFFFF' }}
                      angle={-45}
                      textAnchor="end"
                      height={35}
                      stroke="#FFFFFF"
                    />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#FFFFFF' }} stroke="#FFFFFF" />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Grade']}
                      contentStyle={{ backgroundColor: '#2A2A35', borderColor: '#3A3A45', color: '#FFFFFF' }}
                      labelFormatter={(label) => {
                        const student = analyticsData?.students?.find(s => s.user_ID === label);
                        return student ? getStudentDisplayName(student.user_ID, student.user_Name) : `Student ${label}`;
                      }}
                    />
                    <Bar 
                      dataKey="average" 
                      fill={COLORS[index % COLORS.length]}
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-2 text-xs text-[#FFFFFF]/60">
                <div className="flex justify-between items-center">
                  <span>Average:</span>
                  <span className="font-medium text-[#FFFFFF]">
                    {Math.round(
                      typeData.reduce((sum, item) => sum + item.average, 0) / typeData.length
                    )}%
                  </span>
                </div>
                <div className="flex justify-between items-center mt-0.5">
                  <span>Top performer:</span>
                  <span className="font-medium text-[#FFFFFF]">
                    {Math.max(...typeData.map(item => item.average))}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PerformanceByAssessmentType;