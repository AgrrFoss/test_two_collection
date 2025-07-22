import process from 'node:process';
import { Payload } from 'payload';

const tochkaUrl = process.env.TOCHKA_URL || 'https://enter.tochka.com/sandbox/v2'
const customerCode = process.env.TOCHKA_CUSTOMER_CODE
const merchantId = process.env.TOCHKA_MERCHANT_ID
const apiVersion = process.env.TOCHKA_API_VERSION
const backEndUrl = process.env.BACKEND_URL
const linkLifeTime = Number(process.env.EXPECTED_TIME_PAYMENT_LINK) || 15

export const getPaymentUrl = async (
  subscriptionsPrice: number,
  purpose: string,
  consumerId: string,
  consumerEmail: string,
  items : {name: string, amount: number, quantity: number}) => {

  const bodyRequest = {
    Data: {
      customerCode,
      merchantId,
      amount: subscriptionsPrice,
      ttl: linkLifeTime,
      purpose,
      paymentMode: [
        "sbp",
        "card",
        "tinkoff"
      ],
      redirectUrl: process.env.TOCHKA_URL_REDIRECT_AFTER_PAY || process.env.DEV_FRONT || 'https://example.com',
      consumerId,
      Client: {
        email: consumerEmail
      },
      Items: [{
        name: items.name,
        amount: items.amount,
        quantity: 1,
        paymentMethod: 'full_payment',
        paymentObject: 'service'
      }]
    }
  }
  const optionsRequest = {
    method: 'POST',
    body: JSON.stringify(bodyRequest),
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TOCHKA_JWT}`,
    },
  };
  const getPaymentLinkUrl = `/acquiring/${apiVersion}/payments_with_receipt`
  try {
    const paymentLinkResponse = await fetch(`${tochkaUrl}${getPaymentLinkUrl}`, optionsRequest)
    if (paymentLinkResponse.ok) {
      const paymentLink = await paymentLinkResponse.json()
      return paymentLink.Data
    } else {
      return paymentLinkResponse
    }
  } catch (error) {
    console.error('Error when receiving the payment link', error)
  }
}

export const createTochkaHook = async (payload: Payload) => {
  const clientId = process.env.TOCHKA_CLIENT_ID
  const webhookUrl = `/webhook/${apiVersion}/${clientId}`
  let webHookList
  try {
    const optionsRequestGetWebhooks = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TOCHKA_JWT}`,
      },
    };
    const checkHookRequest = await fetch(`${tochkaUrl}${webhookUrl}`, optionsRequestGetWebhooks)
    if (checkHookRequest.ok) {
      const checkHookBody = await checkHookRequest.json()
      webHookList = checkHookBody.Data.webhooksList
    } else {
      payload.logger.info(`An error occurred when check a hooks. Bank response:`)
      const errorBody = await checkHookRequest.json()
      console.log(errorBody)
    }
  } catch (error) {
    console.error('Error when check hooks list from Tochka:', error)
  }
  if (webHookList.includes('acquiringInternetPayment')) {
    payload.logger.info(`Tochka "acquiringInternetPayment" hook already exist`)
  } else {
    const bodyRequest = {
      webhooksList: ['acquiringInternetPayment'],
      url: `${backEndUrl}/api/servicesSub/payment-confirmation`
    }
    const optionsRequestCreate = {
      method: 'PUT',
      body: JSON.stringify(bodyRequest),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.TOCHKA_JWT}`,
      },
    };
    try {
      const createHookResponse = await fetch(`${tochkaUrl}${webhookUrl}`, optionsRequestCreate)
      if (createHookResponse.ok) {
        payload.logger.info(`Tochka Hook created`)
      } else {
        payload.logger.info(`An error occurred when creating the hook. Bank response:`)
        const errorBody = await createHookResponse.json()
        console.log(errorBody)
      }
    } catch (error) {
      console.error('Error when receiving the payment link', error)
    }
  }

}
