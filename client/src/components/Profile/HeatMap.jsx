import React, { useState, useMemo } from 'react';

export function Heatmap ({activityLog})  {
  const [hoveredDay, setHoveredDay] = useState(null);

  const contributions = useMemo(() => {
    const map = {};
    activityLog.forEach((entry) => {
      const dateKey = new Date(entry.date).toISOString().split("T")[0];
      map[dateKey] = entry.interviewsGiven; 
    });
    return map;
  }, [activityLog]);

  const getIntensityLevel = (count) => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 4) return 2;
    if (count <= 6) return 3;
    return 4;
  };

  const getColor = (level) => {
  const colors = [
    "bg-slate-800 border border-slate-700", 
    "bg-purple-900/50 border border-purple-800",
    "bg-purple-700/70 border border-purple-600",
    "bg-purple-500/90 border border-purple-400",
    "bg-purple-400 border border-purple-300",
  ];
  return colors[level];
};


  // Generate months with their weeks
  const generateMonthsData = () => {
    const months = [];
    const endDate = new Date(); // Today
    const startDate = new Date(endDate);
    startDate.setFullYear(startDate.getFullYear() - 1); // One year before
    
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      // Adjust for our date range
      const rangeStart = currentDate < startDate ? startDate : 
                        (currentDate.getMonth() === startDate.getMonth() && currentDate.getFullYear() === startDate.getFullYear()) ? 
                        startDate : monthStart;
      
      const rangeEnd = monthEnd > endDate ? endDate : monthEnd;
      
      const monthData = {
        name: currentDate.toLocaleDateString('en-US', { month: 'short' }),
        year: currentDate.getFullYear(),
        weeks: []
      };

      // Generate weeks for this month
      let weekStart = new Date(rangeStart);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Go to Sunday

      while (weekStart <= rangeEnd) {
        const week = [];
        
        for (let day = 0; day < 7; day++) {
          const currentDay = new Date(weekStart);
          currentDay.setDate(weekStart.getDate() + day);
          
          const dateKey = currentDay.toISOString().split('T')[0];
          const isInRange = currentDay >= startDate && currentDay <= endDate;
          const isInMonth = currentDay.getMonth() === currentDate.getMonth() && 
                           currentDay.getFullYear() === currentDate.getFullYear();
          const contributionCount = isInRange ? (contributions[dateKey] || 0) : 0;
          
          week.push({
            date: new Date(currentDay),
            dateKey,
            contributionCount,
            isInRange: isInRange && isInMonth,
            intensity: (isInRange && isInMonth) ? getIntensityLevel(contributionCount) : 0
          });
        }
        
        monthData.weeks.push(week);
        weekStart.setDate(weekStart.getDate() + 7);
        
        // Break if we've gone past the month
        if (weekStart > rangeEnd) break;
      }
      
      months.push(monthData);
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
      currentDate.setDate(1);
    }
    
    return months;
  };

  const months = useMemo(() => generateMonthsData(), [contributions]);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-4 rounded-lg overflow-x-auto">
      <div className="mb-4 flex justify-between items-center">
        <span className="text-sm text-gray-400">
          {new Date(
            new Date().setFullYear(new Date().getFullYear() - 1)
          ).toLocaleDateString("en-US")}{" "}
          - {new Date().toLocaleDateString("en-US")}
        </span>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${getColor(level)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="relative">
        {/* Month labels */}
        <div className="flex gap-3 mb-3">
          {months.map((month, index) => (
            <div
              key={index}
              className="text-xs text-gray-400 font-medium text-center"
              style={{
                width: `${
                  month.weeks.length * 12 + (month.weeks.length - 1) * 2
                }px`,
              }}
            >
              {month.name}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="flex gap-3">
          {months.map((month, monthIndex) => (
            <div key={monthIndex} className="flex gap-0.5">
              {month.weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-0.5">
                  {week.map((day, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 hover:ring-1 hover:ring-gray-400 ${
                        day.isInRange
                          ? getColor(day.intensity)
                          : "bg-slate-800/30"
                      }`}
                      onMouseEnter={() => day.isInRange && setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      title={
                        day.isInRange
                          ? `${
                              day.contributionCount
                            } contributions on ${formatDate(day.date)}`
                          : formatDate(day.date)
                      }
                    />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Tooltip */}
        {hoveredDay && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-700 text-white text-sm rounded shadow-lg z-10 whitespace-nowrap pointer-events-none">
            <div className="font-medium">
              {hoveredDay.contributionCount} contributions
            </div>
            <div className="text-gray-300">{formatDate(hoveredDay.date)}</div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-gray-400">
        Total contributions:{" "}
        {Object.values(contributions).reduce((sum, count) => sum + count, 0)}
      </div>
    </div>
  );
};

export default Heatmap;