import React from "react";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Target,
  CheckCircle,
} from "lucide-react";

export function DifficultyBreakdown ({ userData })  {
  const difficultyStats = userData.difficultyStats || {
    easy: 0,
    medium: 0,
    hard: 0,
  };

  const totalQuestions =
    difficultyStats.easy + difficultyStats.medium + difficultyStats.hard;

  // Calculate percentages
  const easyPercentage =
    totalQuestions > 0 ? (difficultyStats.easy / totalQuestions) * 100 : 0;
  const mediumPercentage =
    totalQuestions > 0 ? (difficultyStats.medium / totalQuestions) * 100 : 0;
  const hardPercentage =
    totalQuestions > 0 ? (difficultyStats.hard / totalQuestions) * 100 : 0;

  // Data for charts
  const barChartData = [
    {
      difficulty: "Easy",
      count: difficultyStats.easy,
      color: "bg-green-500",
      lightColor: "bg-green-400/20",
    },
    {
      difficulty: "Medium",
      count: difficultyStats.medium,
      color: "bg-yellow-500",
      lightColor: "bg-yellow-400/20",
    },
    {
      difficulty: "Hard",
      count: difficultyStats.hard,
      color: "bg-red-500",
      lightColor: "bg-red-400/20",
    },
  ];

  // Find max count for bar chart scaling
  const maxCount = Math.max(
    difficultyStats.easy,
    difficultyStats.medium,
    difficultyStats.hard,
    1
  );

  // Calculate success rates (simplified - in real app you'd track this)
  const getSuccessRate = (difficulty) => {
    const baseRates = { easy: 85, medium: 70, hard: 55 };
    const variance = Math.random() * 10 - 5; // Random variance for demo
    return Math.max(40, Math.min(95, baseRates[difficulty] + variance));
  };

  const successRates = {
    easy: getSuccessRate("easy"),
    medium: getSuccessRate("medium"),
    hard: getSuccessRate("hard"),
  };

  // Pie chart component (simplified SVG implementation)
  const PieChartComponent = () => {
    const radius = 60;
    const centerX = 70;
    const centerY = 70;

    // Calculate angles
    const easyAngle = (easyPercentage / 100) * 360;
    const mediumAngle = (mediumPercentage / 100) * 360;
    const hardAngle = (hardPercentage / 100) * 360;

    // Convert to radians and calculate coordinates
    const toRadians = (angle) => (angle * Math.PI) / 180;

    const getCoordinates = (angle, startAngle = 0) => {
      const rad = toRadians(startAngle + angle / 2);
      return {
        x: centerX + Math.cos(rad - Math.PI / 2) * radius,
        y: centerY + Math.sin(rad - Math.PI / 2) * radius,
      };
    };

    const createArcPath = (startAngle, endAngle) => {
      const start = toRadians(startAngle - 90);
      const end = toRadians(endAngle - 90);

      const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

      const x1 = centerX + Math.cos(start) * radius;
      const y1 = centerY + Math.sin(start) * radius;
      const x2 = centerX + Math.cos(end) * radius;
      const y2 = centerY + Math.sin(end) * radius;

      return [
        "M",
        centerX,
        centerY,
        "L",
        x1,
        y1,
        "A",
        radius,
        radius,
        0,
        largeArcFlag,
        1,
        x2,
        y2,
        "Z",
      ].join(" ");
    };

    let currentAngle = 0;
    const segments = [];

    if (easyPercentage > 0) {
      segments.push({
        path: createArcPath(currentAngle, currentAngle + easyAngle),
        color: "#22c55e",
        label: "Easy",
      });
      currentAngle += easyAngle;
    }

    if (mediumPercentage > 0) {
      segments.push({
        path: createArcPath(currentAngle, currentAngle + mediumAngle),
        color: "#eab308",
        label: "Medium",
      });
      currentAngle += mediumAngle;
    }

    if (hardPercentage > 0) {
      segments.push({
        path: createArcPath(currentAngle, currentAngle + hardAngle),
        color: "#ef4444",
        label: "Hard",
      });
    }

    return (
      <div className="flex items-center justify-center">
        <svg width="140" height="140" className="transform -rotate-90">
          {segments.map((segment, index) => (
            <path
              key={index}
              d={segment.path}
              fill={segment.color}
              className="hover:opacity-80 transition-opacity"
            />
          ))}
        </svg>
      </div>
    );
  };

  const DifficultyCard = ({
    difficulty,
    count,
    percentage,
    successRate,
    color,
    lightColor,
    icon,
  }) => (
    <div className="bg-slate-800/50 rounded-lg p-5 border border-purple-500/10 hover:border-purple-500/30 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 ${lightColor} rounded-lg flex items-center justify-center`}
          >
            {icon}
          </div>
          <div>
            <h4 className="font-semibold text-white">{difficulty}</h4>
            <p className="text-sm text-gray-400">Questions Solved</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{count}</p>
          <p className="text-sm text-gray-400">{percentage.toFixed(1)}%</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* Progress bar for count */}
        <div>
          <div className="flex justify-between text-sm text-gray-300 mb-1">
            <span>Progress</span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${color}`}
              style={{ width: `${(count / maxCount) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Success rate */}
        <div className="flex justify-between items-center pt-2 border-t border-slate-600">
          <span className="text-sm text-gray-400">Success Rate</span>
          <span className="text-sm font-semibold text-green-400">
            {successRate.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl shadow-lg border border-purple-500/20 p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center">
          <BarChart3 className="w-5 h-5 text-purple-400 mr-2" />
          Difficulty Breakdown
        </h2>
        <p className="text-gray-300 text-sm">
          Analysis of questions solved by difficulty level
        </p>
      </div>

      {/* Summary Stats */}
      <div className="bg-slate-800/30 rounded-lg p-4 mb-6 border border-purple-500/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{totalQuestions}</p>
            <p className="text-sm text-gray-400">Total Solved</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">
              {difficultyStats.easy}
            </p>
            <p className="text-sm text-gray-400">Easy</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-yellow-400">
              {difficultyStats.medium}
            </p>
            <p className="text-sm text-gray-400">Medium</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">
              {difficultyStats.hard}
            </p>
            <p className="text-sm text-gray-400">Hard</p>
          </div>
        </div>
      </div>

      {/* Difficulty Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DifficultyCard
          difficulty="Easy"
          count={difficultyStats.easy}
          percentage={easyPercentage}
          successRate={successRates.easy}
          color="bg-green-500"
          lightColor="bg-green-400/20"
          icon={<CheckCircle className="w-5 h-5 text-green-400" />}
        />
        <DifficultyCard
          difficulty="Medium"
          count={difficultyStats.medium}
          percentage={mediumPercentage}
          successRate={successRates.medium}
          color="bg-yellow-500"
          lightColor="bg-yellow-400/20"
          icon={<Target className="w-5 h-5 text-yellow-400" />}
        />
        <DifficultyCard
          difficulty="Hard"
          count={difficultyStats.hard}
          percentage={hardPercentage}
          successRate={successRates.hard}
          color="bg-red-500"
          lightColor="bg-red-400/20"
          icon={<TrendingUp className="w-5 h-5 text-red-400" />}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-slate-800/30 rounded-lg p-5 border border-purple-500/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 text-purple-400 mr-2" />
            Questions by Difficulty
          </h3>

          {totalQuestions > 0 ? (
            <div className="space-y-4">
              {barChartData.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-3 h-3 rounded-full ${item.color}`}
                      ></div>
                      <span className="text-sm text-gray-300">
                        {item.difficulty}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-white">
                      {item.count}
                    </span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-700 ${item.color}`}
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No data to display</p>
              <p className="text-sm text-gray-500">
                Complete some interviews to see your difficulty breakdown
              </p>
            </div>
          )}
        </div>

        {/* Pie Chart */}
        <div className="bg-slate-800/30 rounded-lg p-5 border border-purple-500/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <PieChart className="w-5 h-5 text-purple-400 mr-2" />
            Difficulty Distribution
          </h3>

          {totalQuestions > 0 ? (
            <div>
              <PieChartComponent />

              {/* Legend */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-300">Easy</span>
                  </div>
                  <span className="text-sm text-white">
                    {easyPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm text-gray-300">Medium</span>
                  </div>
                  <span className="text-sm text-white">
                    {mediumPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-gray-300">Hard</span>
                  </div>
                  <span className="text-sm text-white">
                    {hardPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <PieChart className="w-12 h-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No data to display</p>
              <p className="text-sm text-gray-500">
                Complete some interviews to see distribution
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
