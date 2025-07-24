import {
  startOfToday,
  endOfToday,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
} from "date-fns";

export function getDateRange(timeRange: string): {
  startDate?: Date;
  endDate?: Date;
} {
  const now = new Date();

  switch (timeRange) {
    case "Today":
      return {
        startDate: startOfToday(),
        endDate: endOfToday(),
      };

    case "Yesterday": {
      const yesterday = subDays(now, 1);
      return {
        startDate: startOfDay(yesterday),
        endDate: endOfDay(yesterday),
      };
    }

    case "This Week":
      return {
        startDate: startOfWeek(now, { weekStartsOn: 1 }),
        endDate: endOfWeek(now, { weekStartsOn: 1 }),
      };

    case "Last Week": {
      const lastWeekStart = subDays(startOfWeek(now, { weekStartsOn: 1 }), 7);
      const lastWeekEnd = subDays(endOfWeek(now, { weekStartsOn: 1 }), 7);
      return {
        startDate: lastWeekStart,
        endDate: lastWeekEnd,
      };
    }

    case "This Month":
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
      };

    case "Last Month": {
      const lastMonth = subDays(startOfMonth(now), 1);
      return {
        startDate: startOfMonth(lastMonth),
        endDate: endOfMonth(lastMonth),
      };
    }

    case "Custom":
    default:
      return {};
  }
}
