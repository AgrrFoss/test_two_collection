import { CollectionBeforeReadHook } from 'payload';
import { ServicesSub } from '@/payload-types';
import process from 'node:process';
import { updateServicesSubscriptionList } from './updateServicesSubscriptionList';

export const checkServicesSubscriptionStatus: CollectionBeforeReadHook = async ({context, doc, req}) => {
  if(context.triggerAfterRead || context.localApiOperation){
    return
  }
  const collectionName = 'servicesSub'
  if(doc.subscriptionStatus === 'active'){
    const endDate = new Date(doc.endDate);
    const now = new Date();
    if (endDate < now) {
      // const requestSubscriptionsOfRefer = await req.payload.findByID({
      //   collection: 'services',
      //   id: doc.refer,
      //   select: {
      //     subscriptions: true
      //   }
      // })
      // const newSubscriptionArray = requestSubscriptionsOfRefer?.subscriptions?.filter(subscription => subscription !== doc.type)
      await updateServicesSubscriptionList(req.payload, doc, 'remove')

      await req.payload.update({
        collection: collectionName,
        id: doc.id,
        data: {
          subscriptionStatus: 'expired'
        },
        context: {
          triggerAfterRead: true,
          localApiOperation: true,
        }
      })
      // if (newSubscriptionArray) {
      //   await req.payload.update({
      //     collection: 'services',
      //     id: doc.refer,
      //     data: {
      //       subscriptions: newSubscriptionArray,
      //     },
      //     select: {
      //       subscriptions: true
      //     }
      //
      //   })
      // }
    }
  }
  if(doc.subscriptionStatus === 'expect_payment' && doc._paymentLinkCreatedAt){
    const timeLinkCreated = new Date(doc._paymentLinkCreatedAt);
    const now = new Date();
    const diffInMilliseconds = now.getTime() - timeLinkCreated.getTime();
    const diffInMinutes = diffInMilliseconds / (1000 * 60);
    const paymentInfo = doc.paymentInfo as Pick<ServicesSub, 'paymentInfo'>['paymentInfo']
    const linkExpired = diffInMinutes >= (Number( process.env.PAYMENT_LINK_EXPIRATION) || 15 )
    const paymentInfoExist = paymentInfo && paymentInfo.length > 0
    if (linkExpired && paymentInfoExist) {
      const newPaymentInfo = paymentInfo.filter(payment => !!payment.date)
      await updateServicesSubscriptionList(req.payload, doc, 'remove')

      await req.payload.update({
        collection: collectionName,
        id: doc.id,
        data: {
          subscriptionStatus: 'expired',
          paymentInfo: newPaymentInfo,
          _paymentLinkCreatedAt: null
        },
        context: {
          triggerAfterRead: true,
          localApiOperation: true,
        }
      })

    }
  }
  context.triggerAfterRead = true
  return doc
};

