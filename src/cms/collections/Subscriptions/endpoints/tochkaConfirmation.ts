import { Endpoint, headersWithCors, PayloadHandler, PayloadRequest } from 'payload';
import process from 'node:process';
import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem'
import { findSubscriptionByOperation } from '@cms/utilities/findSubscriptionByOperation';

const subscriptionDuration = Number(process.env.SUBSCRIPTION_DURATION) || 30

interface ITochkaConfirmationPayload {
  customerCode: string,
  amount: string,
  paymentType: string,
  operationId: string,
  purpose: string,
  webhookType: string,
  merchantId: string,
  consumerId?: string,
  transactionId?: string,
  qrcId?: string,
  payerName?: string,
}

function getMoscowDateTime () {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('ru-RU', { // или 'en-US' для английского
    timeZone: 'Europe/Moscow',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  return formatter.format(now);
}
function addDaysToMoscowTime (daysToAdd: number) {
  const now = new Date()
  const moscowTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }))
  moscowTime.setDate(moscowTime.getDate() + daysToAdd)
  return moscowTime
}

const handler: PayloadHandler = async (req: PayloadRequest) => {
  if(req.text) {
    const token = await req.text();
    const jwkString = process.env.TOCHKA_OPENAPI_JWT
    if (!jwkString) {
      console.error('Переменная окружения TOCHKA_OPENAPI_JWT не найдена.');
      throw new Error('Необходимо установить переменную окружения TOCHKA_OPENAPI_JWT.');
    }
    let pemApiKey
    try {
      const jwk = JSON.parse(jwkString);
      pemApiKey = jwkToPem(jwk);
    } catch (error) {
      console.error('Ошибка при извлечении и конвертации ключа TOCHKA_OPENAPI', error);
    }
    if (pemApiKey && token) {
      const data = jwt.verify(token, pemApiKey, { algorithms: ['RS256'] }) as ITochkaConfirmationPayload;

      const operationId = data?.operationId;
      const currentSubscriptionId = data?.customerCode === process.env.TOCHKA_CUSTOMER_CODE ? await findSubscriptionByOperation(operationId, req.payload) : undefined// Находим ID подписки в которой лежит эта операция
      if (currentSubscriptionId) {
        const currentSubscription = await req.payload.findByID({
          collection: 'servicesSub',
          id: currentSubscriptionId
        })
        const existPayments = currentSubscription && currentSubscription.paymentInfo && currentSubscription?.paymentInfo.length > 0
        if (existPayments) {
          const updatedPaymentsList = currentSubscription?.paymentInfo?.map((payment) => {
            if (payment?.id === operationId) {
              return {
                id: payment.id,
                amount: data.amount,
                date: getMoscowDateTime(),
              }
            } else {
              return payment
            }
          })
          //Обновляем подписку
          await req.payload.update({
            collection: 'servicesSub',
            id: currentSubscriptionId,
            data: {
              subscriptionStatus: 'active',
              endDate: addDaysToMoscowTime(subscriptionDuration).toISOString(),
              paymentInfo: updatedPaymentsList,
            }
          })
        }
      }
    } else {
      throw new Error('A token or key is missing')
    }
  }
  return new Response(null, {
    status: 200,
  })
}

export const paymentConfirmation: Omit<Endpoint, 'root'> = {
  path: '/payment-confirmation',
  method: 'post',
  handler,
}