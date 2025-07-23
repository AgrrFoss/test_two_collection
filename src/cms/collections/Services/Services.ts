import { CollectionConfig } from 'payload'
import { rating } from '@cms/fields/commonFields'
import { statusModeration } from '@cms/fields/statusModeration'
import { title } from '@cms/fields/title'
import { activeSubscriptions } from '@cms/fields/activeSubscriptions'
import { subscriptionTypes } from '@cms/constants/common'


export const Services: CollectionConfig = {
  slug: 'services',
  labels: {
    singular: 'Услуга',
    plural: 'Услуги',
  },
  fields: [
    {
      label: 'Площадка',
      name: 'isPlace',
      type: 'checkbox',
      defaultValue: false
    },
    {
      name: 'title',
      label: 'Название',
      type: 'text',
      required: true,
      minLength: 2,
      maxLength: 50,
    },
    {
      name: 'subscriptions',
      label: 'Активные подписки',
      admin: {
        position: 'sidebar',
        // readOnly: true,
      },
      type: 'select',
      options: subscriptionTypes,
      hasMany: true,
    },
    {
      name: 'rating',
      label: 'Рейтинг',
      type: 'number',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ]
}