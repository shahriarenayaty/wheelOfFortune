// For Injection Tokens
export const SERVICE_AUTH = 'SERVICE_AUTH';
export const SERVICE_GAMIFICATION = 'SERVICE_GAMIFICATION';
export const SERVICE_ORDER = 'SERVICE_ORDER';
export const SERVICE_WHEEL = 'SERVICE_WHEEL';
export const SERVICE_HISTORY = 'SERVICE_HISTORY';

// For Action Names
export const MoleculerActions = {
  AUTH: {
    LOGIN: 'auth.login',
    REGISTER: 'auth.register',
  },
  GAMIFICATION: {
    REDEEM: 'gamification.redeem',
    GET_BALANCE: 'gamification.getBalance',
  },
  ORDER: {
    CREATE: 'order.create',
    PAY: 'order.pay',
  },
  WHEEL: {
    SPIN: 'wheel-of-fortune.spin',
  },
  HISTORY: {
    PRIZE: 'history.prize',
  },
};
