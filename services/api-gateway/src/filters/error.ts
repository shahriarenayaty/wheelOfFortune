// A simple map for error messages. In a real app, this would use an i18n library.
const ERROR_MESSAGE_MAP: Record<string, string> = {
  USER_NOT_FOUND:
    'The account associated with this phone number could not be found.',
  INVALID_CREDENTIALS: 'The phone number or password you entered is incorrect.',
  DEFAULT: 'An unexpected error occurred. Please try again later.',
  INTERNAL_SERVER_ERROR:
    'An internal server error occurred. Please try again later.',
  INVALID_PHONE: 'The phone number you entered is invalid.',
  INVALID_PASSWORD: 'The password you entered is incorrect.',
  PHONE_EXISTS:
    'The phone number you entered is already associated with an account.',
  ALREADY_REDEEMED: 'This referral code has already been redeemed.',
  INVALID_REFERRAL_CODE: 'The referral code you entered is invalid.',
  SELF_REDEMPTION: 'You cannot redeem your own referral code.',
};

export { ERROR_MESSAGE_MAP };
