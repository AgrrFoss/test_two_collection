import { Payload } from 'payload';
import process from 'node:process';
import { seed } from '@cms/seed';
import { createTochkaHook } from '@cms/utilities/apiTochka';

export const onInin = async (payload: Payload): Promise<void> => {
  if (process.env.SEED_DB === 'true') {
    await seed(payload);
  } else {
    setTimeout(async ()=> {
      await createTochkaHook(payload);
    }, 20000)

  }
}