import { CollectionAfterChangeHook, CollectionAfterDeleteHook, Payload } from 'payload';
import { ServicesSub } from '@/payload-types';
import { ACTUAL_SUBSCRIPTIONS_STATUS_STRING } from '@cms/constants/common';

export const updateServicesSubscriptionListAfterChange: CollectionAfterChangeHook = async ({doc, req, context})=> {

  console.log('Generate active subscription from adminPanel. context: ', context)

  if (context.updatePaymentInfo) {
    return
  }
  const isCreateActiveSubscription = ACTUAL_SUBSCRIPTIONS_STATUS_STRING.includes(doc.subscriptionStatus)
  if (isCreateActiveSubscription) {

    console.log('This subscription have status "Active or expect_payment": ', ACTUAL_SUBSCRIPTIONS_STATUS_STRING.includes(doc.subscriptionStatus))

    await updateServicesSubscriptionList(req.payload, doc, 'add')
  }



}

export const updateServicesSubscriptionListAfterDelete: CollectionAfterDeleteHook = async ({doc, req})=> {
  await updateServicesSubscriptionList(req.payload, doc, 'remove')
}



export async function updateServicesSubscriptionList(payload: Payload, currentSubscription: ServicesSub, action: 'add' | 'remove'  ) {
  const currentSubscriptionReferId = typeof currentSubscription?.refer === 'number' ? currentSubscription.refer : currentSubscription.refer.id
  const requestSubscriptionsOfRefer = await payload.findByID({
    collection: 'services',
    id: currentSubscriptionReferId,
    select: {
      subscriptions: true
    },
    context: {
      localApiOperation: true
    }
  })


  console.log('Function ServiceUpdate found current document: ', requestSubscriptionsOfRefer)

  const isExistCurrentSubscription = requestSubscriptionsOfRefer?.subscriptions?.find(elem => elem === currentSubscription.type)
  let newSubscriptionArray: ('pro' | 'priority' | 'banners')[] | null = []
  switch (action) {
    case 'remove':
      newSubscriptionArray =  requestSubscriptionsOfRefer?.subscriptions ?
        requestSubscriptionsOfRefer?.subscriptions?.filter(subscription => subscription !== currentSubscription.type)
        : null
      break
    case 'add':
      newSubscriptionArray =  requestSubscriptionsOfRefer?.subscriptions || []
      if (!isExistCurrentSubscription) {
        newSubscriptionArray.push(currentSubscription.type)
      }
      break
  }

  console.log('Function ServiceUpdate generated new subscriptionList: ', newSubscriptionArray)

  if (newSubscriptionArray) {
    const result = await payload.update({
      collection: 'services',
      id: currentSubscriptionReferId,
      data: {
        subscriptions: newSubscriptionArray,
      },
      depth: 0,
      draft: false,
      context: {
        localApiOperation: true
      }
    })
    console.log('result: ', result)
  }

}
