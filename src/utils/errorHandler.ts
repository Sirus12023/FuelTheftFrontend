/**
 * Error handling and validation utilities
 */

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export function handleApiError(error: any): ApiError {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || `HTTP ${error.response.status}: ${error.response.statusText}`,
      status: error.response.status,
      code: error.response.data?.code
    };
  } else if (error.request) {
    // Network error
    return {
      message: 'Network error: Unable to connect to server',
      code: 'NETWORK_ERROR'
    };
  } else {
    // Other error
    return {
      message: error.message || 'Unknown error occurred',
      code: 'UNKNOWN_ERROR'
    };
  }
}

export function validateDateRange(startDate: Date, endDate: Date): boolean {
  if (!startDate || !endDate) return false;
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;
  if (startDate > endDate) return false;
  
  // Check if date range is reasonable (not more than 1 year)
  const oneYear = 365 * 24 * 60 * 60 * 1000;
  if (endDate.getTime() - startDate.getTime() > oneYear) return false;
  
  return true;
}

export function validateVehicleId(vehicleId: string): boolean {
  if (!vehicleId || typeof vehicleId !== 'string') return false;
  if (vehicleId.trim().length === 0) return false;
  return true;
}

export function validateSensorData(sensorData: any): boolean {
  if (!sensorData) return false;
  if (typeof sensorData.sensorStatus !== 'string') return false;
  if (typeof sensorData.isActive !== 'boolean') return false;
  return true;
}

export function logError(context: string, error: any): void {
  console.error(`[${context}] Error:`, {
    message: error.message,
    status: error.response?.status,
    data: error.response?.data,
    timestamp: new Date().toISOString()
  });
}

export function logInfo(context: string, message: string, data?: any): void {
  console.log(`[${context}] ${message}`, data || '');
}
