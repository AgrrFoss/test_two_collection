import { CollectionConfig } from 'payload'
import { rating } from '@cms/fields/commonFields'
import { statusModeration } from '@cms/fields/statusModeration'
import { title } from '@cms/fields/title'
import { activeSubscriptions } from '@cms/fields/activeSubscriptions'


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
    title,
    statusModeration,
    activeSubscriptions,
    rating,
  ]
}