export const API_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

export const createApiState = (initialData = null) => ({
  data: initialData,
  status: API_STATUS.IDLE,
  error: null,
  loading: false,
});

export const createApiError = (message, statusCode = 500, details = null) => ({
  message,
  statusCode,
  details,
  timestamp: new Date().toISOString(),
});
