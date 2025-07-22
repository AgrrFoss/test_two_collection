// import { services, services_rels, services_sub } from '@/payload-generated-schema';
// import { and, eq, exists, inArray } from '@payloadcms/db-postgres/drizzle';
// import { Payload } from 'payload';
// import {
//   LIMIT_BANNER_SUBSCRIPTIONS,
//   ACTUAL_SUBSCRIPTIONS_STATUS_ARRAY
// } from '../constants/common';
//
// interface IPrioritySubsExist {
//   first: boolean;
//   second: boolean;
//   third: boolean;
// }
//
// export async function checkExistPrioritySubs (payload: Payload, id: string | number): Promise<IPrioritySubsExist> {
//   const currentService = await payload.findByID({
//     collection: 'services',
//     id,
//     select: {
//       category: true
//     },
//     depth: 0
//   })
//   if(!currentService){
//     throw new Error('Услуга с таким id не найдена')
//   }
//   const categories = currentService.category as number[]
//   const drizzle = payload.db.drizzle
//
//   const countPriorityServices = async (place: 'first' | 'second' | 'third') => {
//     return drizzle.$count(services, and(
//       exists(drizzle.select()
//         .from(services_sub)
//         .where(and(
//           eq(services_sub.type, 'priority'),
//           inArray(services_sub.subscriptionStatus, ACTUAL_SUBSCRIPTIONS_STATUS_ARRAY),
//           eq(services_sub.refer, services.id),
//           eq(services_sub.priorityPlace, place),
//         ))
//       ),
//       exists(drizzle.select()
//         .from(services_rels)
//         .where(and(
//           eq(services_rels.parent, services.id),
//           inArray(services_rels.categoriesID, categories)
//         ))
//       )
//     ));
//   }
//   return {
//     first: await countPriorityServices('first') === 0,
//     second:  await countPriorityServices('second') === 0,
//     third:  await countPriorityServices('third') === 0,
//   }
// }
//
// export async function checkExistBannerSubs (payload: Payload, id: string | number): Promise<boolean> {
//   const existBannerSubForCurrentService = await payload.count({
//     collection: 'servicesSub',
//     where: {
//       and: [
//         {
//           refer: {
//             equals: id
//           }
//         },
//         {
//           type: {
//             equals: 'banners'
//           }
//         },
//         {
//           subscriptionStatus: {
//             equals: 'active'
//           }
//         }
//       ]
//     }
//   })
//   if (existBannerSubForCurrentService.totalDocs > 0) {
//     return false
//   }
//   const options = await payload.findGlobal({
//       slug: 'options',
//       select: {
//         maxNumberBanners: true,
//       }
//     }
//   )
//   const countBannerSubs = await payload.count({
//     collection: 'servicesSub',
//     where: {
//       and: [
//         {
//           type: {
//             equals: 'banners'
//           }
//         },
//         {
//           subscriptionStatus: {
//             equals: 'active'
//           }
//         }
//       ]
//     }
//   })
//   return options.maxNumberBanners
//     ? options?.maxNumberBanners > countBannerSubs.totalDocs
//     : LIMIT_BANNER_SUBSCRIPTIONS > countBannerSubs.totalDocs
// }