/*
 * IMPORTS
 */
import { authLogger } from "./debug";

/*
 * CONFIG
 */
const _ValidationConfig = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Please enter a valid email address",
  },
  password: {
    minLength: 8,
    message: "Password must be at least 8 characters long",
  },
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
    message: "Name must be 2-50 characters and contain only letters and spaces",
  },
  message: {
    maxLength: 2000,
    message: "Message cannot exceed 2000 characters",
  },
};

/*
 * VALIDATION FUNCTIONS
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== "string") {
    return { isValid: false, message: "Email is required" };
  }

  if (!_ValidationConfig.email.pattern.test(email.trim())) {
    authLogger.warn("Invalid email format provided", {
      email: email.substring(0, 5) + "...",
    });
    return { isValid: false, message: _ValidationConfig.email.message };
  }

  return { isValid: true, message: null };
};

export const validatePassword = (password) => {
  if (!password || typeof password !== "string") {
    return { isValid: false, message: "Password is required" };
  }

  if (password.length < _ValidationConfig.password.minLength) {
    authLogger.warn("Password length validation failed");
    return { isValid: false, message: _ValidationConfig.password.message };
  }

  return { isValid: true, message: null };
};

export const validateName = (name) => {
  if (!name || typeof name !== "string") {
    return { isValid: false, message: "Name is required" };
  }

  const trimmedName = name.trim();

  if (
    trimmedName.length < _ValidationConfig.name.minLength ||
    trimmedName.length > _ValidationConfig.name.maxLength
  ) {
    return { isValid: false, message: _ValidationConfig.name.message };
  }

  if (!_ValidationConfig.name.pattern.test(trimmedName)) {
    return { isValid: false, message: _ValidationConfig.name.message };
  }

  return { isValid: true, message: null };
};

export const validateMessage = (message) => {
  if (!message || typeof message !== "string") {
    return { isValid: false, message: "Message is required" };
  }

  if (message.trim().length === 0) {
    return { isValid: false, message: "Message cannot be empty" };
  }

  if (message.length > _ValidationConfig.message.maxLength) {
    return { isValid: false, message: _ValidationConfig.message.message };
  }

  return { isValid: true, message: null };
};

/*
 * FORM VALIDATION
 */
export const validateLoginForm = (formData) => {
  const errors = {};

  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
  }

  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateRegisterForm = (formData) => {
  const errors = {};

  const nameValidation = validateName(formData.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.message;
  }

  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
  }

  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
