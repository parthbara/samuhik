import { supabase } from '../db/client.mjs';
import { parseEvolutionWebhook, extractInstanceFromPayload } from '../services/evolution.mjs';
import { processIncomingMessage } from '../services/pipeline.mjs';

// Evolution API delivers: POST /webhook/evolution?instance=<name>
// Configure this URL in your Evolution API dashboard.

export async function webhookRoutes(app) {
  app.post('/evolution', async (request, reply) => {
    const payload = request.body;
    const instanceName = extractInstanceFromPayload(payload, request.query.instance);

    if (!instanceName) {
      return reply.status(400).send({ error: 'Missing Evolution instance identifier' });
    }

    // Resolve tenant by evolution_instance — unknown instance gets 200 to prevent retry loops
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id, name, evolution_instance, evolution_api_url, evolution_api_key, llm_base_url, llm_model')
      .eq('evolution_instance', instanceName)
      .single();

    if (!tenant) {
      app.log.warn({ instanceName }, 'Webhook: unknown Evolution instance — ignored');
      return reply.status(200).send({ ok: true, ignored: true });
    }

    // Only process new message events
    const event = payload?.event || payload?.type || '';
    const isMessageEvent = ['messages.upsert', 'message', 'MESSAGES_UPSERT'].includes(event);
    if (!isMessageEvent) {
      return reply.status(200).send({ ok: true, skipped: event });
    }

    // Respond immediately — Evolution API expects a fast ack
    reply.status(200).send({ ok: true });

    // Parse then process asynchronously
    const { text, platformId, name, platform } = parseEvolutionWebhook(payload);

    if (!text || !platformId) return;

    processIncomingMessage({ tenant, text, platformId, name, platform }).catch((err) => {
      app.log.error({ err, instanceName }, 'Pipeline error');
    });
  });
}
