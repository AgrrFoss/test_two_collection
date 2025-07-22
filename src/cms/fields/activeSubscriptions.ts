import type { Field } from "payload";
import { subscriptionTypes } from '@cms/constants/common';

export const activeSubscriptions: Field = {
  name: 'subscriptions',
  label: 'Активные подписки',
  admin: {
    position: 'sidebar',
    // readOnly: true,
  },
  type: 'select',
  options: subscriptionTypes,
  hasMany: true,
}