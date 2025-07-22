import type { Field } from 'payload'

export const title: Field = {
  name: 'title',
  label: 'Название',
  type: 'text',
  required: true,
  minLength: 2,
  maxLength: 50,
}