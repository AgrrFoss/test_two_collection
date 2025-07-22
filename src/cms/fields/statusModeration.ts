import type { Field } from 'payload';

export const statusModeration: Field = {
  label: 'Модерация и активность',
  type: 'collapsible',
  admin: {
    position: 'sidebar',
  },
  fields: [
    {
      name: 'moderationStatus',
      label: 'Статус страницы',
      type: 'select',
      options: [
        { label: 'Черновик', value: 'draft' },
        { label: 'Ожидает модерации', value: 'on_moderation' },
        { label: 'Отклонено после модерации', value: 'failed_moderation' },
        { label: 'Опубликовано', value: 'published' },
        { label: 'Не активно', value: 'inactive' },
      ],
      admin: {
        position: 'sidebar',
      },
      defaultValue: () => 'draft',
      // validate: async (val: any, { req, data }: any) => {
      //   const isModerator = req.user?.role === 'admin' || req.user?.role === 'moderator' || req.context.localApiOperation
      //   const isSetStatusInactive = val === 'inactive'
      //   const isUnavailableImplementerStatuses =
      //     val === 'published' || val === 'failed_moderation' || data._status === 'published'
      //   if (isModerator && isSetStatusInactive && data._status === 'draft') {
      //     return true
      //   }
      //   if (isSetStatusInactive && data._status === 'draft') {
      //     return 'If you want set statusModeration "inactive" use "_status: "published"'
      //   }
      //   if (isUnavailableImplementerStatuses && !isModerator && !isSetStatusInactive) {
      //     return 'You cant publish this document or set this status'
      //   }
      //   return true
      // },
    },
    {
      name: 'moderationMessage',
      label: 'Сообщение от модератора',
      type: 'textarea',
      admin: {
        condition: (siblingData) => {
          return siblingData.moderationStatus === 'failed_moderation'
        },
        disableListColumn: true,
      },
    },
  ],
}