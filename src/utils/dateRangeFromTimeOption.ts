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

/**
 * Returns a date range object { startDate, endDate } based on the backend's expected time options.
 * The backend expects ISO strings for fromDate/toDate, and week starts on Monday.
 * "Last 24 hours" is a common backend option, so we include it.
 */
export function getDateRange(timeRange: string): {
  startDate?: Date;
  endDate?: Date;
} {
  const now = new Date();

  switch (timeRange) {
    case "Last 24 hours":
      return {
        startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        endDate: now,
      };

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
      // Last week: start = startOfWeek(now) - 7 days, end = endOfWeek(now) - 7 days
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
      // Last month: get last day of previous month, then get start/end of that month
      const lastMonthDate = subDays(startOfMonth(now), 1);
      return {
        startDate: startOfMonth(lastMonthDate),
        endDate: endOfMonth(lastMonthDate),
      };
    }

    case "All Time":
      // Backend: omit date range for all time, or set to undefined
      return {};

    case "Custom":
    default:
      // For custom, the UI should provide startDate/endDate directly
      return {};
  }
}
