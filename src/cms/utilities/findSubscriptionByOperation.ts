import { ServicesSub } from '@/payload-types';
import { Payload } from 'payload';
import { services_sub_payment_info } from '@/payload-generated-schema';
import { eq } from '@payloadcms/db-postgres/drizzle';

export const findSubscriptionByOperation = async (operationID: string, payload: Payload): Promise<Pick <ServicesSub, 'id'>['id'] | undefined> => {
  const drizzle = payload.db.drizzle
  const currentSubscription = await drizzle
    .select({id: services_sub_payment_info._parentID})
    .from(services_sub_payment_info)
    .where(eq(services_sub_payment_info.id, operationID))
  return currentSubscription && currentSubscription.length > 0 ? currentSubscription[0].id : undefined
}