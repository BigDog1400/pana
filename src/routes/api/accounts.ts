import { ClientResponseError } from 'pocketbase';
import { APIEvent, json } from 'solid-start/api';
import { initPocketBase } from '~/db';

export async function GET({ params, request }: APIEvent) {
  try {
    const pb = await initPocketBase(request);
    const resultList = await pb.collection('accounts').getFullList();
    return json({ data: resultList });
  } catch (error) {
    if (error instanceof ClientResponseError) {
      return json({ error: error.data.message, status: error.status }, { status: error.status });
    }
    return json({ error: 'Unexpected server error.', status: 500 }, { status: 500 });
  }
}
