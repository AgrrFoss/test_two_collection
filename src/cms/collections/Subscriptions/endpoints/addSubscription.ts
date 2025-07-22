import { Endpoint, headersWithCors, PayloadHandler, PayloadRequest } from 'payload';
import { Category, Service, ServicesSub } from '@/payload-types';
import { getPaymentUrl } from '@cms/utilities/apiTochka';
import { updateServicesSubscriptionList } from '@cms/collections/Subscriptions/hooks/updateServicesSubscriptionList';

interface IAddSubscriptionRequest {
  type: Pick<ServicesSub, 'type'>['type']
  refer: Pick<ServicesSub, 'refer'>['refer']
  priorityPlace?: Pick<ServicesSub, 'priorityPlace'>['priorityPlace']
  inn?: string,
  officialName?: string
}

interface IReferDoc {
  id: number,
  owner: Pick<Service, 'owner'>['owner']
  email: Pick<Service, 'email'>['email']
  category: Pick<Service, 'category'>['category']
}


function returnError ( req:PayloadRequest, message: string, status?: number) {
  return Response.json(
    {error: message},
    {
      status: status || 500,
      headers: headersWithCors({
        headers: new Headers(),
        req,
      })
    },
  )
}
async function getOrCreateSubscription (req: PayloadRequest, data: IAddSubscriptionRequest) {
  const {refer, type, priorityPlace} = data
  const collection = 'servicesSub'
  let currentSubscription
  const similarSubscriptionExisting = await req.payload.find({
    collection,
    depth: 0,
    where: {
      and: [
        {
          refer: {
            equals: refer
          }
        },
        {
          type: {
            equals: type
          }
        }
      ]
    }
  })
  if (similarSubscriptionExisting.totalDocs === 0) {
    currentSubscription = await req.payload.create({
      collection,
      data: {
        type,
        refer,
        priorityPlace,
      }
    })
  } else {
    if (type === 'priority') {
      currentSubscription = await req.payload.update({
        collection,
        id: similarSubscriptionExisting.docs[0].id,
        data: {
          priorityPlace
        }
      })
    }
    currentSubscription = similarSubscriptionExisting.docs[0]
  }
  return currentSubscription
}
async function  getSubscriptionCost (req: PayloadRequest, data: IAddSubscriptionRequest, referDoc: IReferDoc) {
  if (data.type !== 'priority') {
    const fieldName = data.type  && `${data.type}Price` as 'proPrice' | 'bannersPrice'
    const options = await req.payload.findGlobal({
      slug: 'options',
      select: {
        [fieldName]: true,
      }
    })
    return options[fieldName]
  } else {
    const categories = referDoc.category as Category[]
    const existCategories = categories && categories.length > 0
    const parentCategory = existCategories ? categories.find(cat => cat.isParent) : null
    return (parentCategory?.prioritySubsPrices && data?.priorityPlace) && parentCategory?.prioritySubsPrices[`${data?.priorityPlace}Place`]
  }
}

const handler: PayloadHandler = async (req: PayloadRequest) => {
  if (req.json) {
    const data: IAddSubscriptionRequest = await req.json()
    const {type, refer} = data
    if (!type || !refer) {
      return Response.json(
        {error: 'Bad Request - field type and refer is required'},
        {
          headers: headersWithCors({
            headers: new Headers(),
            req,
          })
        },
      )
    } else if (type !== 'priority' && type !== 'banners' && type !== 'pro') {
      return Response.json(
        {error: 'Bad Request - field type may be only: priority | banners | pro'},
        {
          headers: headersWithCors({
            headers: new Headers(),
            req,
          })
        },
      )
    } else {
       // Получаем документ к которому привязана подписка
      const referDoc = await req.payload.findByID({
        collection: 'services',
        id: refer as number,
        select: {
          owner: true,
          email: true,
          category: true,
        },
        depth: 1,
      })
      // Если документ не найден
      if (!referDoc) {
        return returnError(req, 'System error: Document of refer service not found. Contact the site administrator.', 404 )
      }
      // Если пользователь не является владельцем документа или администратором.
      const isOwner = (typeof referDoc.owner === 'number' && referDoc.owner === req.user?.id) || (typeof referDoc.owner !== 'number' && referDoc.owner.id === req.user?.id)
      const isAdmin = (req.user?.collection === 'admins' && req.user?.role === 'admin')
      if (!isOwner && !isAdmin) {
        return returnError(req, 'Forbidden. You a not allowed to perform this action', 403 )
      }
      const currentSubscription = await getOrCreateSubscription(req, data)
      const subscriptionCost = await getSubscriptionCost(req, data, referDoc)
      // Если стоимость подписки не установлена возвращаем ошибку и просим связаться с администратором.
      if(!subscriptionCost) {
        return returnError( req, 'System error: there is a problem when forming a payment link. Contact the site administrator.', 500)
      }
      // Если все необходимые данные есть получаем платежную ссылку.
      const response = await getPaymentUrl(
        subscriptionCost,
        `Оплата ${type}-подписки на сайте The weddings team`,
        `subs-${currentSubscription.id}`,
        referDoc.email,
        {
          name: `${type}-подписка на 30 дней`,
          amount: subscriptionCost,
          quantity: 1
        }
      )

      if(response.paymentLink) {
        const previousPayment = currentSubscription.paymentInfo
        const existPreviousPayment = previousPayment && previousPayment.length > 0
        const newPaymentInfo = existPreviousPayment ? [...previousPayment, {id: response.operationId}] : [{id: response.operationId}]
        const now = new Date().toISOString();
        await req.payload.update({
          collection: 'servicesSub',
          id: currentSubscription.id,
          select: {
            paymentInfo: true,
            _paymentLinkCreatedAt: true,
            subscriptionStatus: true
          },
          data: {
            paymentInfo: newPaymentInfo,
            _paymentLinkCreatedAt: now,
            subscriptionStatus: 'expect_payment'
          },
          context: {
            updatePaymentInfo: true
          }
        })
        // Обновляем список актуальных подписок для соответствующей услуги
        await updateServicesSubscriptionList(req.payload, currentSubscription, 'add')
      }
      return Response.json(
        response,
        {
          headers: headersWithCors({
            headers: new Headers(),
            req,
          })
        },
      )
    }
  } else {
    return Response.json(
      {error: 'Bad Request'},
      {
        headers: headersWithCors({
          headers: new Headers(),
          req,
        })
      },
    )
  }
}

export const addSubscription: Omit<Endpoint, 'root'> = {
  path: '/add',
  method: 'post',
  handler,
}