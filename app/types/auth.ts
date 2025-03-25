export interface ValidationResult {
  valid: boolean;
  message: string;
}

export interface AuthErrorMessages {
  [key: string]: string;
}

export const AUTH_ERROR_MESSAGES: AuthErrorMessages = {
  "Invalid user credentials.": "错误的用户名或密码",
};

export const AUTH_VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME: {
    CHINESE_MIN_LENGTH: 2,
    ENGLISH_MIN_LENGTH: 3,
    CHINESE_MAX_LENGTH: 8,
    ENGLISH_MAX_LENGTH: 20,
  },
};
