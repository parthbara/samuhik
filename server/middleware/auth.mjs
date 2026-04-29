import { createHash } from 'crypto';
import { supabase } from '../db/client.mjs';

function sha256(str) {
  return createHash('sha256').update(str).digest('hex');
}

export async function authMiddleware(request, reply) {
  const raw =
    request.headers['x-api-key'] ||
    request.headers['authorization']?.replace(/^Bearer\s+/i, '');

  if (!raw) {
    return reply.status(401).send({ error: 'Missing API key' });
  }

  const { data: tenant, error } = await supabase
    .from('tenants')
    .select('id, name, evolution_instance, evolution_api_url, evolution_api_key, llm_base_url, llm_model')
    .eq('api_key_hash', sha256(raw))
    .single();

  if (error || !tenant) {
    return reply.status(401).send({ error: 'Invalid API key' });
  }

  request.tenant = tenant;
}
