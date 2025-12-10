import React from "react";
import PieIcon from "../assets/Pie(Light).svg";
import TrendingUp from "../assets/TrendingUp.svg";
import TrendingDown from "../assets/TrendingDown.svg";
import AlertTriangleGreen from "../assets/Warning(Green).svg";
import AlertTriangleYellow from "../assets/Warning(Yellow).svg";
import AlertTriangleRed from "../assets/Warning(Red).svg";
import ArrowDown from "../assets/ArrowDown(Light).svg";

export default function StudentAdvancedPerformanceReports({
  calculateAdvancedAnalytics,
  animationProgress,
  attendanceRate,
  attendanceLoading,
  currentSubject,
  submissionRateData,
  expandedInsights,
  setExpandedInsights,
  displayedInsights,
}) {
  // Risk level color coding - updated for dark theme
  const getRiskColor = (level) => {
    switch (level) {
      case "HIGH":
        return "text-[#A15353] bg-[#A15353]/10 border-[#A15353]/20";
      case "MEDIUM":
        return "text-[#FFA600] bg-[#FFA600]/10 border-[#FFA600]/20";
      case "LOW":
        return "text-[#00A15D] bg-[#00A15D]/10 border-[#00A15D]/20";
      default:
        return "text-[#FFFFFF]/60 bg-[#23232C] border-[#FFFFFF]/10";
    }
  };

  // Get appropriate AlertTriangle icon based on risk level
  const getRiskIcon = (level) => {
    switch (level) {
      case "HIGH":
        return AlertTriangleRed;
      case "MEDIUM":
        return AlertTriangleYellow;
      case "LOW":
        return AlertTriangleGreen;
      default:
        return AlertTriangleYellow;
    }
  };

  // Trend indicator - updated colors
  const TrendIndicator = ({ trend }) => {
    if (trend === "improving") {
      return (
        <div className="flex items-center text-[#00A15D]">
          <img src={TrendingUp} alt="Improving" className="w-3 h-3 mr-1" />
          <span className="text-xs">Improving</span>
        </div>
      );
    } else if (trend === "declining") {
      return (
        <div className="flex items-center text-[#A15353]">
          <img src={TrendingDown} alt="Declining" className="w-3 h-3 mr-1" />
          <span className="text-xs">Declining</span>
        </div>
      );
    }
    return (
      <div className="flex items-center text-[#767EE0]">
        <span className="text-xs">Stable</span>
      </div>
    );
  };

  // Activity type colors for performance cards - updated for dark theme
  const getTypeColor = (activityType) => {
    switch (activityType.toLowerCase()) {
      case "activities":
        return {
          bg: "bg-[#00A15D]/10",
          border: "border-[#00A15D]/20",
          text: "text-[#00A15D]",
          progress: "bg-[#00A15D]",
        };
      case "assignments":
        return {
          bg: "bg-[#767EE0]/10",
          border: "border-[#767EE0]/20",
          text: "text-[#767EE0]",
          progress: "bg-[#767EE0]",
        };
      case "quizzes":
        return {
          bg: "bg-[#A15353]/10",
          border: "border-[#A15353]/20",
          text: "text-[#A15353]",
          progress: "bg-[#A15353]",
        };
      case "laboratories":
        return {
          bg: "bg-[#FFA600]/10",
          border: "border-[#FFA600]/20",
          text: "text-[#FFA600]",
          progress: "bg-[#FFA600]",
        };
      case "projects":
        return {
          bg: "bg-[#B39DDB]/10",
          border: "border-[#B39DDB]/20",
          text: "text-[#B39DDB]",
          progress: "bg-[#B39DDB]",
        };
      default:
        return {
          bg: "bg-[#23232C]",
          border: "border-[#FFFFFF]/10",
          text: "text-[#FFFFFF]",
          progress: "bg-[#FFFFFF]/20",
        };
    }
  };

  return (
    <div className="bg-[#15151C] rounded-lg shadow-sm p-4 text-[#FFFFFF]">
      <div className="flex items-center mb-4">
        <img src={PieIcon} alt="Analytics" className="h-5 w-5 mr-2" />
        <h2 className="text-base font-semibold">Advanced Performance Reports</h2>
      </div>

      {/* Key Metrics Grid - More Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {/* Risk Level */}
        <div
          className={`p-3 rounded-lg border transition-all duration-500 ${getRiskColor(
            calculateAdvancedAnalytics.riskLevel
          )}`}
          style={{
            opacity: animationProgress,
            transform: `translateX(${-10 * (1 - animationProgress)}px)`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium mb-0.5">Risk Level</p>
              <p className="text-lg font-bold">
                {calculateAdvancedAnalytics.riskLevel}
              </p>
            </div>
            <div
              className={`w-8 h-8 rounded-md border flex items-center justify-center ${
                calculateAdvancedAnalytics.riskLevel === "HIGH"
                  ? "border-[#A15353]/30"
                  : calculateAdvancedAnalytics.riskLevel === "MEDIUM"
                  ? "border-[#FFA600]/30"
                  : "border-[#00A15D]/30"
              }`}
            >
              <img
                src={getRiskIcon(calculateAdvancedAnalytics.riskLevel)}
                alt="Risk Level"
                className="w-4 h-4"
              />
            </div>
          </div>
          <p className="text-xs mt-1.5 text-[#FFFFFF]/60">
            {calculateAdvancedAnalytics.missedActivities} missed activities
          </p>
        </div>

        {/* Performance Score */}
        <div
          className="bg-gradient-to-br from-[#00A15D]/10 to-[#00A15D]/5 p-3 rounded-lg border border-[#00A15D]/20 transition-all duration-500"
          style={{
            opacity: animationProgress,
            transform: `translateY(${-10 * (1 - animationProgress)}px)`,
            transitionDelay: "100ms",
          }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-[#00A15D] font-medium mb-0.5">
                Performance Score
              </p>
              <p className="text-lg font-bold text-[#FFFFFF]">
                {calculateAdvancedAnalytics.performanceScore}/100
              </p>
            </div>
            <TrendIndicator trend={calculateAdvancedAnalytics.trend} />
          </div>
          <div className="w-full bg-[#00A15D]/20 rounded-full h-1.5 mt-2">
            <div
              className="bg-[#00A15D] h-1.5 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${
                  calculateAdvancedAnalytics.performanceScore *
                  animationProgress
                }%`,
                transitionDelay: "200ms",
              }}
            ></div>
          </div>
        </div>

        {/* Attendance Rate */}
        <div
          className="bg-gradient-to-br from-[#767EE0]/10 to-[#767EE0]/5 p-3 rounded-lg border border-[#767EE0]/20 transition-all duration-500"
          style={{
            opacity: animationProgress,
            transform: `translateY(${10 * (1 - animationProgress)}px)`,
            transitionDelay: "200ms",
          }}
        >
          <p className="text-xs text-[#767EE0] font-medium mb-0.5">Attendance Rate</p>
          <p className="text-lg font-bold text-[#FFFFFF]">
            {attendanceLoading ? "..." : `${attendanceRate}%`}
          </p>
          <div className="w-full bg-[#767EE0]/20 rounded-full h-1.5 mt-2">
            <div
              className="bg-[#767EE0] h-1.5 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${attendanceRate * animationProgress}%`,
                transitionDelay: "300ms",
              }}
            ></div>
          </div>
          <p className="text-xs mt-1.5 text-[#FFFFFF]/60">
            {currentSubject ? `${currentSubject.subject}` : "Current subject"}
          </p>
        </div>

        {/* Submission Rate */}
        <div
          className="bg-gradient-to-br from-[#FFA600]/10 to-[#FFA600]/5 p-3 rounded-lg border border-[#FFA600]/20 transition-all duration-500"
          style={{
            opacity: animationProgress,
            transform: `translateX(${10 * (1 - animationProgress)}px)`,
            transitionDelay: "300ms",
          }}
        >
          <p className="text-xs text-[#FFA600] font-medium mb-0.5">Submission Rate</p>
          <p className="text-lg font-bold text-[#FFFFFF]">
            {submissionRateData.submissionRate}%
          </p>
          <div className="w-full bg-[#FFA600]/20 rounded-full h-1.5 mt-2">
            <div
              className="bg-[#FFA600] h-1.5 rounded-full transition-all duration-1000 ease-out"
              style={{
                width: `${
                  submissionRateData.submissionRate * animationProgress
                }%`,
                transitionDelay: "400ms",
              }}
            ></div>
          </div>
          <p className="text-xs mt-1.5 text-[#FFFFFF]/60">
            {submissionRateData.displayText} activities
          </p>
        </div>
      </div>

      {/* Performance by Activity Type - More Compact */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold mb-3 text-[#FFFFFF]">
          Performance by Activity Type
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {Object.entries(calculateAdvancedAnalytics.typePerformance).map(
            ([type, data], index) => {
              const colors = getTypeColor(type);
              const animationDelay = index * 100;

              return (
                <div
                  key={type}
                  className={`p-2 rounded border ${colors.bg} ${colors.border} transition-all duration-500`}
                  style={{
                    opacity: animationProgress,
                    transform: `translateY(${5 * (1 - animationProgress)}px)`,
                    transition: `opacity 0.5s ease-out ${animationDelay}ms, transform 0.5s ease-out ${animationDelay}ms`,
                  }}
                >
                  <p
                    className={`text-xs font-medium capitalize ${colors.text} mb-1`}
                  >
                    {type}
                  </p>
                  <p className={`text-base font-bold ${colors.text} mb-1`}>
                    {data.score}%
                  </p>
                  <div className="w-full bg-[#FFFFFF]/10 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full ${colors.progress} transition-all duration-800 ease-out`}
                      style={{
                        width: `${data.score * animationProgress}%`,
                        transition: `width 0.8s ease-out ${
                          animationDelay + 200
                        }ms`,
                      }}
                    ></div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Performance Insights with Collapsible Feature - More Compact */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[#FFFFFF]">Performance Insights</h3>
          {calculateAdvancedAnalytics.insights.length > 2 && (
            <button
              onClick={() => setExpandedInsights(!expandedInsights)}
              className="text-xs text-[#00A15D] hover:text-[#00A15D]/80 font-medium flex items-center gap-1"
            >
              {expandedInsights
                ? "Show Less"
                : `Show All (${calculateAdvancedAnalytics.insights.length})`}
              <img
                src={ArrowDown}
                alt={expandedInsights ? "Show Less" : "Show More"}
                className={`w-3 h-3 transition-transform ${
                  expandedInsights ? "rotate-180" : ""
                }`}
              />
            </button>
          )}
        </div>

        <div className="space-y-2">
          {displayedInsights.map((insight, index) => (
            <div
              key={index}
              className={`p-3 rounded border ${
                insight.type === "critical"
                  ? "bg-[#A15353]/10 border-[#A15353]/20"
                  : insight.type === "warning"
                  ? "bg-[#FFA600]/10 border-[#FFA600]/20"
                  : insight.type === "positive"
                  ? "bg-[#00A15D]/10 border-[#00A15D]/20"
                  : "bg-[#767EE0]/10 border-[#767EE0]/20"
              }`}
            >
              <div className="flex items-start">
                {insight.type === "critical" && (
                  <img
                    src={AlertTriangleRed}
                    alt="Critical"
                    className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
                  />
                )}
                {insight.type === "warning" && (
                  <img
                    src={AlertTriangleYellow}
                    alt="Warning"
                    className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
                  />
                )}
                {insight.type === "positive" && (
                  <img
                    src={AlertTriangleGreen}
                    alt="Positive"
                    className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0"
                  />
                )}
                {insight.type === "info" && (
                  <div className="w-4 h-4 mr-2 mt-0.5 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 bg-[#767EE0] rounded-full"></div>
                  </div>
                )}
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium ${
                      insight.type === "critical"
                        ? "text-[#A15353]"
                        : insight.type === "warning"
                        ? "text-[#FFA600]"
                        : insight.type === "positive"
                        ? "text-[#00A15D]"
                        : "text-[#767EE0]"
                    }`}
                  >
                    {insight.message}
                  </p>
                  <p className="text-xs mt-1 text-[#FFFFFF]/80">
                    {insight.suggestion}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}