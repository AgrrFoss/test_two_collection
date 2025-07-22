export const IMPLEMENTER_TOKEN_EXPIRATION = 15 * 60 * 1000;
export const NUMBER_FOR_PRO = 2000
export const NUMBER_FOR_NOT_PRO = 1000
export const NUMBER_FOR_NEW = 200
export const NUMBER_FOR_OLD = 100
export const RATING_MULTIPLIER = 10
export const MAX_DAYS = 7 * 24 * 3600 * 1000
export const SUBSCRIPTION_DURATION = 30
export const LIMIT_CATEGORY_FOR_CARD = 3
export const LIMIT_PRIORITY_SUBSCRIPTIONS = 3
export const LIMIT_BANNER_SUBSCRIPTIONS = 10
export const LIMIT_MEDIA_SIZE = 10 //mb
export const ACTUAL_SUBSCRIPTIONS_STATUS_STRING = 'active,expect_payment'
export const ACTUAL_SUBSCRIPTIONS_STATUS_ARRAY:  ('active' | 'expired' | 'expect_payment')[] = ['active','expect_payment']

export const subscriptionTypes = [
  {label: 'pro', value: 'pro'},
  {label: 'Приоритетное размещение', value: 'priority'},
  {label: 'Статические банеры', value: 'banners'}
]
