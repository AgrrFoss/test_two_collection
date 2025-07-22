import type { Field } from "payload";

const subscriptionStatus: Field = {
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
}
export default subscriptionStatus