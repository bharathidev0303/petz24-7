export const APP_ERROR_CODES = {
  NO_INTERNET: 'NO_INTERNET',
  REQUEST_FAILED: 'REQUEST_FAILED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
};

export const APP_ERROR_MESSAGES = {
  [APP_ERROR_CODES.NO_INTERNET]:
    'No internet connection. Please check your network and try again.',
  [APP_ERROR_CODES.REQUEST_FAILED]: 'Something went wrong. Please try again.',
  [APP_ERROR_CODES.SESSION_EXPIRED]: 'Your session has expired. Please sign in again.',
};

export const createAppError = (code, originalError) => {
  const error = new Error(
    APP_ERROR_MESSAGES[code] || APP_ERROR_MESSAGES[APP_ERROR_CODES.REQUEST_FAILED],
  );
  error.code = code;
  if (originalError) {
    error.originalError = originalError;
  }
  return error;
};

export const isNoInternetError = error => error?.code === APP_ERROR_CODES.NO_INTERNET;

export const isNoInternetMessage = message =>
  message === APP_ERROR_MESSAGES[APP_ERROR_CODES.NO_INTERNET];

export const getUserErrorMessage = (
  error,
  fallback = APP_ERROR_MESSAGES[APP_ERROR_CODES.REQUEST_FAILED],
) => {
  if (!error) return fallback;

  if (error.code && APP_ERROR_MESSAGES[error.code]) {
    return APP_ERROR_MESSAGES[error.code];
  }

  if (Object.values(APP_ERROR_MESSAGES).includes(error.message)) {
    return error.message;
  }

  if (/network|fetch failed|internet|offline|timed out/i.test(String(error.message || ''))) {
    return APP_ERROR_MESSAGES[APP_ERROR_CODES.NO_INTERNET];
  }

  return fallback;
};
