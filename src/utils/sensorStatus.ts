// src/utils/sensorStatus.ts

export type SensorStatus = "normal" | "alert" | "offline";

export interface SensorInfo {
  sensorStatus?: string;
  sensorLastSeen?: string;
}

/**
 * Determine sensor status based on sensor info and time-based logic
 * @param sensorInfo - Object containing sensorStatus and sensorLastSeen
 * @returns SensorStatus - "normal", "alert", or "offline"
 */
export function determineSensorStatus(sensorInfo: SensorInfo): SensorStatus {
  let status: SensorStatus = "offline";
  
  // Check if sensor status is explicitly set
  if (sensorInfo.sensorStatus) {
    if (sensorInfo.sensorStatus === "OK") {
      status = "normal";
    } else if (sensorInfo.sensorStatus === "OFFLINE" || sensorInfo.sensorStatus === "FAULTY") {
      status = "offline";
    } else {
      status = "offline";
    }
  }
  
  // Time-based status detection
  if (sensorInfo.sensorLastSeen) {
    const lastSeenTime = new Date(sensorInfo.sensorLastSeen).getTime();
    const currentTime = Date.now();
    const timeDiffMinutes = (currentTime - lastSeenTime) / (1000 * 60);
    
    // Mark as offline if last seen more than 30 minutes ago
    if (timeDiffMinutes > 60) {
      status = "offline";
    }
    // Mark as alert if last seen more than 10 minutes ago but less than 30 minutes
    else if (timeDiffMinutes > 40 && status === "normal") {
      status = "alert";
    }
  }
  
  return status;
}

/**
 * Get CSS classes for status badge
 * @param status - Sensor status
 * @returns CSS classes string
 */
export function getStatusBadgeClasses(status: SensorStatus): string {
  switch (status) {
    case "alert": return "bg-yellow-500 text-white";
    case "offline": return "bg-gray-500 text-white";
    case "normal": return "bg-green-500 text-white";
    default: return "bg-gray-500 text-white";
  }
}

/**
 * Get display text for status
 * @param status - Sensor status
 * @returns Display text
 */
export function getStatusText(status: SensorStatus): string {
  switch (status) {
    case "alert": return "Warning";
    case "offline": return "Offline";
    case "normal": return "Online";
    default: return "Offline";
  }
}
