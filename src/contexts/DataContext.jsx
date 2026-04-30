import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) {
      setConversations([]);
      setInventory([]);
      return;
    }

    fetchInitialData();

    // Set up Realtime subscriptions
    const convSubscription = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: profile.role === 'super_admin' ? undefined : `tenant_id=eq.${profile.tenant_id}`
        },
        (payload) => {
          handleConversationChange(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(convSubscription);
    };
  }, [profile]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const tenantId = profile.tenant_id;
      
      let convQuery = supabase
        .from('conversations')
        .select(`
          *,
          contacts (*),
          messages (
            content,
            created_at,
            sender_type
          )
        `)
        .order('last_message_at', { ascending: false });

      if (profile.role !== 'super_admin') {
        convQuery = convQuery.eq('tenant_id', tenantId);
      }

      const { data: convData, error: convError } = await convQuery;
      if (convError) throw convError;

      // Transform data to match the UI expectation
      const transformedConvs = convData.map(c => ({
        id: c.id,
        customerName: c.contacts.name,
        platform: c.platform,
        tags: c.tags,
        aiEnabled: c.ai_enabled,
        messages: c.messages.map(m => ({
          from: m.sender_type === 'customer' ? 'customer' : (m.sender_type === 'ai' ? 'ai' : 'agent'),
          time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: m.content
        })),
        initials: c.contacts.name.split(' ').map(n => n[0]).join('').toUpperCase(),
        role: c.contacts.metadata?.role || "Customer",
        time: new Date(c.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unread: c.unread_count,
        phone: c.contacts.phone,
        address: c.contacts.metadata?.address,
        lifetimeValue: c.contacts.metadata?.lifetimeValue,
        notes: c.contacts.metadata?.notes || [],
        activity: c.contacts.metadata?.activity || [],
      }));

      setConversations(transformedConvs);

      let invQuery = supabase.from('inventory').select('*');
      if (profile.role !== 'super_admin') {
        invQuery = invQuery.eq('tenant_id', tenantId);
      }
      const { data: invData, error: invError } = await invQuery;
      if (invError) throw invError;
      
      setInventory(invData.map(i => ({
        id: i.sku,
        item: i.name,
        stock: i.stock,
        price: i.price
      })));

    } catch (err) {
      console.error('Error fetching data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConversationChange = async (payload) => {
    // For simplicity, refetch or update state
    // Real production apps should update the specific item in state
    fetchInitialData(); 
  };

  const addMessage = async (chatId, message) => {
    // In live mode, we insert into Supabase
    const { error } = await supabase
      .from('messages')
      .insert({
        tenant_id: profile.tenant_id,
        conversation_id: chatId,
        direction: 'outbound',
        sender_type: message.from === 'ai' ? 'ai' : 'agent',
        content: message.text
      });

    if (error) console.error('Error sending message:', error.message);
    
    // Also update the conversation's last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', chatId);
  };

  const updateConversation = async (chatId, updates) => {
    // Map UI updates back to DB columns
    const dbUpdates = {};
    if (updates.unread !== undefined) dbUpdates.unread_count = updates.unread;
    if (updates.aiEnabled !== undefined) dbUpdates.ai_enabled = updates.aiEnabled;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;

    const { error } = await supabase
      .from('conversations')
      .update(dbUpdates)
      .eq('id', chatId);

    if (error) console.error('Error updating conversation:', error.message);
  };

  return (
    <DataContext.Provider value={{ 
      conversations, 
      inventory, 
      loading,
      addMessage,
      updateConversation,
      refreshData: fetchInitialData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
