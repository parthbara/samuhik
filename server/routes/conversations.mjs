import { supabase } from '../db/client.mjs';
import { sendOutboundMessage } from '../services/evolution.mjs';
import { processIncomingMessage } from '../services/pipeline.mjs';

export async function conversationsRoutes(app) {
  // ── GET /api/conversations ───────────────────────────────────────────────────
  app.get('/conversations', async (request, reply) => {
    const { status, platform, limit = 50, offset = 0 } = request.query;

    let q = supabase
      .from('conversations')
      .select(`
        id, platform, platform_conversation_id, status, ai_enabled,
        tags, unread_count, last_message_at, created_at, updated_at,
        contacts ( id, name, phone, platform_id ),
        users!assigned_agent_id ( id, email )
      `)
      .eq('tenant_id', request.tenant.id)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (status) q = q.eq('status', status);
    if (platform) q = q.eq('platform', platform);

    const { data, error } = await q;
    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  // ── GET /api/conversations/:id ───────────────────────────────────────────────
  app.get('/conversations/:id', async (request, reply) => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*, contacts(*), users!assigned_agent_id(*)')
      .eq('id', request.params.id)
      .eq('tenant_id', request.tenant.id)
      .single();

    if (error || !data) return reply.status(404).send({ error: 'Conversation not found' });
    return data;
  });

  // ── GET /api/conversations/:id/messages ──────────────────────────────────────
  app.get('/conversations/:id/messages', async (request, reply) => {
    const { limit = 100, before } = request.query;

    // Ownership check
    const { data: conv } = await supabase
      .from('conversations')
      .select('id')
      .eq('id', request.params.id)
      .eq('tenant_id', request.tenant.id)
      .single();

    if (!conv) return reply.status(404).send({ error: 'Conversation not found' });

    let q = supabase
      .from('messages')
      .select('id, direction, sender_type, content, metadata, created_at')
      .eq('conversation_id', request.params.id)
      .order('created_at', { ascending: true })
      .limit(Number(limit));

    if (before) q = q.lt('created_at', before);

    const { data, error } = await q;
    if (error) return reply.status(500).send({ error: error.message });

    // Mark conversation as read
    await supabase
      .from('conversations')
      .update({ unread_count: 0 })
      .eq('id', request.params.id);

    return data;
  });

  // ── PATCH /api/conversations/:id ─────────────────────────────────────────────
  // Update status, ai_enabled, tags, assigned_agent_id
  app.patch('/conversations/:id', async (request, reply) => {
    const ALLOWED = new Set(['status', 'ai_enabled', 'tags', 'assigned_agent_id']);
    const updates = Object.fromEntries(
      Object.entries(request.body).filter(([k]) => ALLOWED.has(k))
    );

    if (!Object.keys(updates).length) {
      return reply.status(400).send({ error: 'No valid fields to update' });
    }

    const { data, error } = await supabase
      .from('conversations')
      .update(updates)
      .eq('id', request.params.id)
      .eq('tenant_id', request.tenant.id)
      .select()
      .single();

    if (error || !data) return reply.status(404).send({ error: 'Not found or update failed' });
    return data;
  });

  // ── POST /api/send — human agent outbound message ────────────────────────────
  app.post('/send', {
    schema: {
      body: {
        type: 'object',
        required: ['conversation_id', 'text'],
        properties: {
          conversation_id: { type: 'string', format: 'uuid' },
          text: { type: 'string', minLength: 1, maxLength: 4096 },
        },
      },
    },
  }, async (request, reply) => {
    const { conversation_id, text } = request.body;

    const { data: conv } = await supabase
      .from('conversations')
      .select('id, platform, platform_conversation_id')
      .eq('id', conversation_id)
      .eq('tenant_id', request.tenant.id)
      .single();

    if (!conv) return reply.status(404).send({ error: 'Conversation not found' });

    const { data: msg, error } = await supabase
      .from('messages')
      .insert({
        tenant_id: request.tenant.id,
        conversation_id,
        direction: 'outbound',
        sender_type: 'agent',
        content: text,
      })
      .select()
      .single();

    if (error) return reply.status(500).send({ error: error.message });

    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversation_id);

    try {
      await sendOutboundMessage({
        tenant: request.tenant,
        conversationId: conv.platform_conversation_id,
        text,
      });
    } catch (err) {
      // Logged but not fatal — message is already in DB
      app.log.error({ err }, 'Evolution send failed for agent reply');
    }

    return msg;
  });

  // ── POST /api/simulate — frontend "customer demo" triggers the pipeline ───────
  // Simulates an inbound webhook for dev/demo without going through Evolution.
  app.post('/simulate', {
    schema: {
      body: {
        type: 'object',
        required: ['conversation_id', 'text'],
        properties: {
          conversation_id: { type: 'string', format: 'uuid' },
          text: { type: 'string', minLength: 1 },
        },
      },
    },
  }, async (request, reply) => {
    const { conversation_id, text } = request.body;

    const { data: conv } = await supabase
      .from('conversations')
      .select('platform_conversation_id, platform, contacts(name)')
      .eq('id', conversation_id)
      .eq('tenant_id', request.tenant.id)
      .single();

    if (!conv) return reply.status(404).send({ error: 'Conversation not found' });

    reply.status(202).send({ ok: true, queued: true });

    processIncomingMessage({
      tenant: request.tenant,
      text,
      platformId: conv.platform_conversation_id,
      name: conv.contacts?.name || 'Demo Customer',
      platform: conv.platform,
    }).catch((err) => app.log.error({ err }, 'Simulate pipeline error'));
  });

  // ── GET /api/inventory ───────────────────────────────────────────────────────
  app.get('/inventory', async (request, reply) => {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('tenant_id', request.tenant.id)
      .order('name');

    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  // ── GET /api/orders ──────────────────────────────────────────────────────────
  app.get('/orders', async (request, reply) => {
    const { status, conversation_id, limit = 100 } = request.query;

    let q = supabase
      .from('orders')
      .select('*, contacts(name), conversations(platform_conversation_id, platform)')
      .eq('tenant_id', request.tenant.id)
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (status) q = q.eq('status', status);
    if (conversation_id) q = q.eq('conversation_id', conversation_id);

    const { data, error } = await q;
    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });
}
