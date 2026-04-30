import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
// ── Demo Mode Toggle (must match AuthContext) ───────────────────────────────
const DEMO_MODE = true;

const DataContext = createContext();

// ═══════════════════════════════════════════════════════════════════════════
//  DEMO DATA PROVIDER — uses in-memory mock data
// ═══════════════════════════════════════════════════════════════════════════
const DemoDataProvider = ({ children }) => {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) {
      setConversations([]);
      setInventory([]);
      setLoading(false);
      return;
    }

    // Simulate network latency
    const timer = setTimeout(() => {
      setConversations([]);
      setInventory([]);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [profile]);

  const addMessage = async (chatId, message) => {
    setConversations(prev =>
      prev.map(c =>
        c.id === chatId
          ? { ...c, messages: [...c.messages, message], time: message.time }
          : c
      )
    );
  };

  const updateConversation = async (chatId, updates) => {
    setConversations(prev =>
      prev.map(c =>
        c.id === chatId ? { ...c, ...updates } : c
      )
    );
  };

  const refreshData = () => {
    setConversations([]);
    setInventory([]);
  };

  return (
    <DataContext.Provider
      value={{
        conversations,
        inventory,
        loading,
        addMessage,
        updateConversation,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
//  SUPABASE DATA PROVIDER — real Supabase queries (for production)
// ═══════════════════════════════════════════════════════════════════════════
const SupabaseDataProvider = ({ children }) => {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supabaseModule, setSupabaseModule] = useState(null);

  useEffect(() => {
    import('../lib/supabase').then(mod => setSupabaseModule(mod));
  }, []);

  useEffect(() => {
    if (!profile || !supabaseModule) {
      setConversations([]);
      setInventory([]);
      return;
    }

    fetchInitialData();

    const { supabase } = supabaseModule;
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
        () => {
          fetchInitialData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(convSubscription);
    };
  }, [profile, supabaseModule]);

  const fetchInitialData = async () => {
    if (!supabaseModule) return;
    const { supabase } = supabaseModule;
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
        tenant_id: c.tenant_id,
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
        tenant_id: i.tenant_id,
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

  const addMessage = async (chatId, message) => {
    if (!supabaseModule) return;
    const { supabase } = supabaseModule;
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
    if (!supabaseModule) return;
    const { supabase } = supabaseModule;
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

// ═══════════════════════════════════════════════════════════════════════════
//  Exported Provider — auto-selects demo vs real
// ═══════════════════════════════════════════════════════════════════════════
export const DataProvider = ({ children }) => {
  if (DEMO_MODE) {
    return <DemoDataProvider>{children}</DemoDataProvider>;
  }
  return <SupabaseDataProvider>{children}</SupabaseDataProvider>;
};

export const useData = () => useContext(DataContext);
