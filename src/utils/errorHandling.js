/*
 * IMPORTS
 */
import { apiLogger } from "./debug";

/*
 * CONFIG
 */
const _ErrorMessages = {
  network: {
    ECONNREFUSED: "Service is currently unavailable. Please try again later.",
    TIMEOUT: "Request timed out. Please check your connection and try again.",
    NETWORK_ERROR:
      "Network error occurred. Please check your internet connection.",
  },
  http: {
    400: "Invalid request. Please check your input and try again.",
    401: "Authentication failed. Please log in again.",
    403: "Access denied. You do not have permission to perform this action.",
    404: "Requested resource not found.",
    409: "Conflict occurred. The resource already exists or is in use.",
    422: "Validation failed. Please check your input.",
    429: "Too many requests. Please wait a moment before trying again.",
    500: "Internal server error. Please try again later.",
    502: "Service temporarily unavailable. Please try again later.",
    503: "Service is under maintenance. Please try again later.",
    504: "Request timed out. Please try again later.",
  },
  auth: {
    INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
    ACCOUNT_LOCKED: "Account is temporarily locked. Please try again later.",
    EMAIL_EXISTS: "An account with this email already exists.",
    WEAK_PASSWORD: "Password is too weak. Please choose a stronger password.",
    TOKEN_EXPIRED: "Session expired. Please log in again.",
    REFRESH_FAILED: "Session refresh failed. Please log in again.",
  },
  chat: {
    CONVERSATION_NOT_FOUND: "Conversation not found or has been deleted.",
    MESSAGE_SEND_FAILED: "Failed to send message. Please try again.",
    CONVERSATION_CREATE_FAILED:
      "Failed to create conversation. Please try again.",
    DELETE_FAILED: "Failed to delete conversation. Please try again.",
  },
};

/*
 * ERROR HANDLING FUNCTIONS
 */
export const handleNetworkError = (error) => {
  apiLogger.error("Network error occurred", error);

  if (error.code === "ECONNREFUSED") {
    return _ErrorMessages.network.ECONNREFUSED;
  }

  if (error.code === "TIMEOUT" || error.message?.includes("timeout")) {
    return _ErrorMessages.network.TIMEOUT;
  }

  return _ErrorMessages.network.NETWORK_ERROR;
};

export const handleHttpError = (status, responseData = null) => {
  apiLogger.error("HTTP error occurred", null, { status, responseData });

  if (_ErrorMessages.http[status]) {
    return _ErrorMessages.http[status];
  }

  if (status >= 500) {
    return _ErrorMessages.http[500];
  }

  if (status >= 400) {
    return _ErrorMessages.http[400];
  }

  return "An unexpected error occurred. Please try again.";
};

export const handleAuthError = (errorCode, customMessage = null) => {
  apiLogger.error("Authentication error occurred", null, {
    errorCode,
    customMessage,
  });

  if (customMessage) {
    return customMessage;
  }

  if (_ErrorMessages.auth[errorCode]) {
    return _ErrorMessages.auth[errorCode];
  }

  return _ErrorMessages.auth.INVALID_CREDENTIALS;
};

export const handleChatError = (errorCode, customMessage = null) => {
  apiLogger.error("Chat operation error occurred", null, {
    errorCode,
    customMessage,
  });

  if (customMessage) {
    return customMessage;
  }

  if (_ErrorMessages.chat[errorCode]) {
    return _ErrorMessages.chat[errorCode];
  }

  return "An error occurred while processing your request. Please try again.";
};

export const handleApolloError = (error) => {
  apiLogger.error("Apollo GraphQL error occurred", error);

  if (error.networkError) {
    if (error.networkError.statusCode) {
      return handleHttpError(error.networkError.statusCode);
    }
    return handleNetworkError(error.networkError);
  }

  if (error.graphQLErrors && error.graphQLErrors.length > 0) {
    const firstError = error.graphQLErrors[0];

    if (firstError.extensions?.code) {
      const code = firstError.extensions.code;

      if (code.startsWith("AUTH_")) {
        return handleAuthError(code, firstError.message);
      }

      if (code.startsWith("CHAT_")) {
        return handleChatError(code, firstError.message);
      }
    }

    return (
      firstError.message || "An error occurred while processing your request."
    );
  }

  return "An unexpected error occurred. Please try again.";
};
