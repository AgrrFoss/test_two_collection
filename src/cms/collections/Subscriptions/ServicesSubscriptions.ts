import { CollectionConfig } from "payload";
import { subscriptionTypes } from '@cms/constants/common';
import { servicesGroup } from '@cms/constants/localization';
import subscriptionStatus from '@cms/fields/subscribtionStatus';
import { checkServicesSubscriptionStatus } from './hooks/checkSubscriptionStatus';
// import { isOwnerReferServiceOrModerator } from '@cms/access/isAdminOrImplementer';
// import { isAdmin } from '@cms/access/isAdmins';
// import { checkExistingSubscriptions } from './hooks/checkExistingSubscriptions';
import { addSubscription } from '@cms/collections/Subscriptions/endpoints/addSubscription';
import { paymentConfirmation } from '@cms/collections/Subscriptions/endpoints/tochkaConfirmation';
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
  // access: {
  //   read: () => true,
  //   create: isOwnerReferServiceOrModerator,
  //   update: isAdmin,
  //   delete: isAdmin,
  // },
  hooks: {
    beforeRead: [checkServicesSubscriptionStatus],
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
      name: 'priorityPlace',
      label: 'Место приоритетного размещения',
      type: 'select',
      options: [
        { label: 'Первое', value: 'first' },
        { label: 'Второе', value: 'second' },
        { label: 'Третье', value: 'third' },
      ],
      admin: {
        condition: (data) => data.type === 'priority',
      },
      // validate: (val: any, { siblingData }: {siblingData: any}) => {
      //   if (siblingData.type === 'priority') {
      //     return val ? true : 'Поле "Место приоритетного размещения обязательно для приоритетной подписки"'
      //   }
      //   return true
      // },
    },
    {
      name: 'refer',
      label: 'Относится к',
      type: 'relationship',
      relationTo: 'services',
      required: true,
    },
    {
      name: 'endDate',
      label: 'Дата окончания',
      type: 'date',
      admin: {
        date: {
          displayFormat: 'd MMM yyy',
        },
      },
    },
    subscriptionStatus,
    {
      name: '_paymentLinkCreatedAt',
      label: 'Время создания платежной ссылки',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
          timeIntervals: 1
        },
        readOnly: true,
      }
    },
    {
      name: 'paymentInfo',
      type: 'array',
      label: 'Информация о платежах',
      labels: {
        singular: 'Платеж',
        plural: 'Платежи',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'id',
              label: 'ID операции',
              type: 'text',
            },
            {
              name: 'amount',
              label: 'Сумма',
              type: 'text',
            },
            {
              name: 'date',
              label: 'Дата время исполнения платежа',
              type: 'text',
            },
          ],
        },
      ],
    },
  ],
}