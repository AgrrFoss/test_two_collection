import type { Field } from 'payload';
// import { isAdminFieldLevel } from '@cms/access/isAdmins'

export const description: Field = {
  name: 'description',
  label: 'Описание',
  type: 'textarea',
  required: true,
  admin: {
    disableListColumn: true
  },
  minLength: 50,
  maxLength: 200,
}

export const rating: Field = {
  name: 'rating',
  label: 'Рейтинг',
  type: 'number',
  admin: {
    readOnly: true,
    position: 'sidebar',
  },
}

// export const owner: Field = {
//   name: 'owner',
//   label: 'Владелец',
//   type: 'relationship',
//   relationTo: 'implementers',
//   required: true,
//   admin: {
//     position: 'sidebar',
//   },
//   access: {
//     update: isAdminFieldLevel,
//   }
// }

export const order: Field = {
  name: 'order',
  label: 'Приоритет выдачи',
  type: 'number',
  admin: {
    readOnly: true,
    position: 'sidebar',
  },
}

export const city: Field = {
  name: 'city',
  label: 'Город',
  type: 'text',
  required: true,
  defaultValue: () => 'Нижний Новгород',
  admin: {
    disableListColumn: true
  }
}