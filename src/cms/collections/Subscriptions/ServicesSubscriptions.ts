import { CollectionConfig } from "payload";
import { subscriptionTypes } from '@cms/constants/common';
import { servicesGroup } from '@cms/constants/localization';
import {
  updateServicesSubscriptionListAfterChange,
  updateServicesSubscriptionListAfterDelete,
} from '@cms/collections/Subscriptions/hooks/updateServicesSubscriptionList';

export const ServicesSubscriptions: CollectionConfig = {
  slug: 'servicesSub',
  labels: {
    singular: 'Подписка услуги',
    plural: 'Подписки услуг',
  },
  admin: {
    description: 'Подписки закреленные за услугами',
    group: servicesGroup,
  },

  hooks: {
    // beforeRead: [checkServicesSubscriptionStatus],
    // beforeChange: [checkExistingSubscriptions],
    afterChange: [updateServicesSubscriptionListAfterChange],
    afterDelete: [updateServicesSubscriptionListAfterDelete]
  },
  // endpoints: [addSubscription, paymentConfirmation],
  fields: [
    {
      name: 'type',
      label: 'Тип',
      type: 'select',
      options: subscriptionTypes,
      required: true,
    },
    {
      name: 'refer',
      label: 'Относится к',
      type: 'relationship',
      relationTo: 'services',
      required: true,
    },
    {
      name: 'subscriptionStatus',
      label: 'Статус',
      type: 'select',
      options: [
        {label: 'Оплачено', value: 'active'},
        {label: 'Ожидает оплаты', value: 'expect_payment'},
        {label: 'Закончилась', value: 'expired'},
      ],
      admin: {
        // readOnly: true,
        position: 'sidebar',
      },
    },
  ],
}