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
 */
export function getDateRange(timeRange: string): {
  startDate?: Date;
  endDate?: Date;
} {
  const now = new Date();

  switch (timeRange) {
    case "last 24 hours":
      return {
        startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        endDate: now,
      };

    case "today":
      return {
        startDate: startOfToday(),
        endDate: endOfToday(),
      };

    case "yesterday": {
      const yesterday = subDays(now, 1);
      return {
        startDate: startOfDay(yesterday),
        endDate: endOfDay(yesterday),
      };
    }

    case "this week":
      return {
        startDate: startOfWeek(now, { weekStartsOn: 1 }),
        endDate: endOfWeek(now, { weekStartsOn: 1 }),
      };

    case "last week": {
      const lastWeekStart = subDays(startOfWeek(now, { weekStartsOn: 1 }), 7);
      const lastWeekEnd = subDays(endOfWeek(now, { weekStartsOn: 1 }), 7);
      return {
        startDate: lastWeekStart,
        endDate: lastWeekEnd,
      };
    }

    case "this month":
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
      };

    case "last month": {
      const lastMonthDate = subDays(startOfMonth(now), 1);
      return {
        startDate: startOfMonth(lastMonthDate),
        endDate: endOfMonth(lastMonthDate),
      };
    }

    case "all time":
      return {}; // No date filtering

    case "custom":
    default:
      return {}; // Let UI provide custom dates
  }
}

