/**
 * Core message processing pipeline.
 *
 * Flow:
 *   inbound text
 *     → upsert contact + conversation
 *     → write inbound message to DB
 *     → if AI enabled: call LLM
 *         → write AI reply to DB
 *         → send via Evolution API
 *         → handle intent side-effects (order / escalate)
 */

import { supabase } from '../db/client.mjs';
import { callLlm } from './llm.mjs';
import { sendOutboundMessage } from './evolution.mjs';
import { processOrder } from './orderService.mjs';

async function upsertContact(tenantId, { name, platformId, platform }) {
  const { data, error } = await supabase
    .from('contacts')
    .upsert(
      { tenant_id: tenantId, name, platform_id: platformId, platform },
      { onConflict: 'tenant_id,platform,platform_id' }
    )
    .select()
    .single();

  if (error) throw new Error(`upsertContact: ${error.message}`);
  return data;
}

async function upsertConversation(tenantId, { contactId, platform, platformConversationId }) {
  const { data, error } = await supabase
    .from('conversations')
    .upsert(
      {
        tenant_id: tenantId,
        contact_id: contactId,
        platform,
        platform_conversation_id: platformConversationId,
        last_message_at: new Date().toISOString(),
      },
      { onConflict: 'tenant_id,platform_conversation_id' }
    )
    .select()
    .single();

  if (error) throw new Error(`upsertConversation: ${error.message}`);
  return data;
}

async function writeMessage(tenantId, conversationId, { direction, senderType, content, metadata = {} }) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ tenant_id: tenantId, conversation_id: conversationId, direction, sender_type: senderType, content, metadata })
    .select()
    .single();

  if (error) throw new Error(`writeMessage: ${error.message}`);
  return data;
}

function addTag(existing, tag) {
  return existing.includes(tag) ? existing : [...existing, tag];
}

// ── Public entry point ────────────────────────────────────────────────────────

export async function processIncomingMessage({ tenant, text, platformId, name, platform }) {
  if (!text || !platformId) return;

  // 1. Upsert contact
  const contact = await upsertContact(tenant.id, { name, platformId, platform });

  // 2. Upsert conversation
  const conv = await upsertConversation(tenant.id, {
    contactId: contact.id,
    platform,
    platformConversationId: platformId,
  });

  // 3. Increment unread
  await supabase.rpc('increment_unread', { conv_id: conv.id });

  // 4. Persist inbound message
  await writeMessage(tenant.id, conv.id, {
    direction: 'inbound',
    senderType: 'customer',
    content: text,
  });

  if (!conv.ai_enabled) return;

  // 5. Load last 30 messages for LLM context
  const { data: history } = await supabase
    .from('messages')
    .select('sender_type, content, created_at')
    .eq('conversation_id', conv.id)
    .order('created_at', { ascending: true })
    .limit(30);

  // 6. Load tenant inventory
  const { data: inventory } = await supabase
    .from('inventory')
    .select('*')
    .eq('tenant_id', tenant.id);

  // 7. Call LLM (with built-in retry + fallback)
  const llmResult = await callLlm({
    tenant,
    messages: history || [],
    inventory: inventory || [],
  });

  // 8. Persist AI reply
  await writeMessage(tenant.id, conv.id, {
    direction: 'outbound',
    senderType: 'ai',
    content: llmResult.reply,
    metadata: { intent: llmResult.intent, orderData: llmResult.orderData },
  });

  // 9. Send via Evolution API (non-fatal if it fails)
  try {
    await sendOutboundMessage({ tenant, conversationId: platformId, text: llmResult.reply });
  } catch (err) {
    console.error('[pipeline] Evolution send failed:', err.message);
  }

  // 10. Intent side-effects
  if (llmResult.intent === 'order' && llmResult.orderData) {
    await processOrder({
      tenantId: tenant.id,
      conversationId: conv.id,
      contactId: contact.id,
      orderData: llmResult.orderData,
    });

    await supabase
      .from('conversations')
      .update({ tags: addTag(conv.tags, 'Order') })
      .eq('id', conv.id);
  }

  if (llmResult.intent === 'escalate') {
    await supabase
      .from('conversations')
      .update({
        ai_enabled: false,
        status: 'escalated',
        tags: addTag(addTag(conv.tags, 'Needs Human'), 'Escalated'),
      })
      .eq('id', conv.id);
  }

  // Update last_message_at
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conv.id);
}
