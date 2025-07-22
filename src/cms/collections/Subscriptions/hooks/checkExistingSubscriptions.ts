// import { CollectionBeforeChangeHook, ValidationError } from 'payload';
//
// import {
//   LIMIT_BANNER_SUBSCRIPTIONS,
//   ACTUAL_SUBSCRIPTIONS_STATUS_STRING
// } from '@cms/constants/common';
// import { checkExistPrioritySubs } from '@cms/utilities/checkExistSubsOfService';
//
//
// export const checkExistingSubscriptions: CollectionBeforeChangeHook = async ({data, originalDoc, operation, req}) => {
//   const collection = 'servicesSub';
//   const isCreate = operation === 'create';
//   const isActualSubscription = data.subscriptionStatus === 'active' || data.subscriptionStatus === 'expect_payment'
//
//   const options = await req.payload.findGlobal({
//     slug: 'options',
//     select: {
//       maxNumberBanners: true,
//     }
//   })
//   const maxNumberBanners = options?.maxNumberBanners || LIMIT_BANNER_SUBSCRIPTIONS
//
//   // Проверяем существуют ли подписки запрашиваемого типа связанные с той-же карточкой. Если существуют сообщаем, что такая уже есть.
//   let similarSubscriptionExisting
//   if( isCreate ){
//     similarSubscriptionExisting = await req.payload.count({
//       collection,
//       where: {
//         and: [
//           {
//             refer: {
//               equals: data.refer
//             }
//           },
//           {
//             type: {
//               equals: data.type
//             }
//           },
//         ]
//       }
//     })
//   } else {
//     similarSubscriptionExisting = await req.payload.count({
//       collection,
//       where: {
//         and: [
//           {
//             refer: {
//               equals: data.refer
//             }
//           },
//           {
//             type: {
//               equals: data.type
//             }
//           },
//           {
//             id: {
//               not_equals: originalDoc.id
//             }
//           }
//         ]
//       }
//     })
//   }
//   if (similarSubscriptionExisting.totalDocs !== 0){
//     throw new ValidationError(({
//       errors: [
//         {
//           label: 'Относится к',
//           message: 'A subscription of this type already exists for this object',
//           path: 'refer'
//         },
//         {
//           label: 'Тип подписки',
//           message: 'A subscription of this type already exists for this object',
//           path: 'type'
//         },
//       ]
//     }))
//   }
//
//   // Узнаем категории, которые есть у карточки, на которую оформляется подписка. Дальше находим другие подписки типа
//   // PRIORITY и считаем сколько из них принадлежат карточкам с аналогичными категориями. Если больше разрешенного
//   // колличества - выдаем ошибку
//   if (data.type === 'priority' && isActualSubscription){
//     const priorityPlace = data.priorityPlace as 'first' | 'second' | 'third'
//     const isPriorityPlaceValid = priorityPlace === 'first' || priorityPlace === 'second' || priorityPlace === 'third'
//     if (!priorityPlace || !isPriorityPlaceValid) {
//       throw new ValidationError({
//         errors: [
//           {
//             label: 'Место приоритетного размещения',
//             path: 'priorityPlace',
//             message: 'The priorityPlace is required for Priority type of Subscription, may be: "first" | "second" | "third"'
//           }
//         ]
//       })
//     }
//     const existsPriority = await checkExistPrioritySubs(req.payload, data.refer, )
//     if (!existsPriority[`${priorityPlace}`]) {
//       throw new ValidationError({
//         errors: [
//           {
//             label: 'Место приоритетного размещения',
//             path: 'priorityPlace',
//             message: 'На данный момент эта позиция приоритетного размещения в этой категории выкуплена'
//           }
//         ]
//       })
//     }
//   }
//
//   // Если создается подписка баннерная, считаем сколько всего существует баннерных подписок и если их равно лии больше лимита, запрещаем создавать новые.
//   if (data.type === 'banners' && isActualSubscription){
//     let numberBannersSubscriptionsInCollection
//     if (isCreate) {
//       numberBannersSubscriptionsInCollection = await req.payload.count({
//         collection,
//         where: {
//           and: [
//             {
//               type: {
//                 equals: 'banners'
//               }
//             },
//             {
//               subscriptionStatus: {
//                 in: ACTUAL_SUBSCRIPTIONS_STATUS_STRING
//               }
//             }
//           ]
//         }
//       })
//     } else {
//       numberBannersSubscriptionsInCollection = await req.payload.count({
//         collection,
//         where: {
//           and: [
//             {
//               id: {
//                 not_equals: originalDoc.id
//               }
//             },
//             {
//               type: {
//                 equals: 'banners'
//               }
//             },
//             {
//               subscriptionStatus: {
//                 in: ACTUAL_SUBSCRIPTIONS_STATUS_STRING
//               }
//             }
//           ]
//         }
//       })
//     }
//     const numberAllBannersSubscriptions = numberBannersSubscriptionsInCollection.totalDocs
//     if (numberAllBannersSubscriptions >= maxNumberBanners){
//       throw new ValidationError({
//         errors: [
//           {
//             label: 'Тип подписки',
//             path: 'type',
//             message: 'The limit of the maximum number of available subscriptions of this type has been reached'
//           }
//         ]
//       })
//     }
//
//   }
//   return data
// }