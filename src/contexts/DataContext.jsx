import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { DEMO_MODE } from '../lib/config';
import { ALL_TENANTS } from '../lib/mockData';
import {
  DEMO_CONVERSATIONS_KEY,
  DEMO_INVENTORY_KEY,
  DEMO_ORDERS_KEY,
  DEMO_SYNC_EVENT,
  appendDemoMessage,
  loadDemoConversations,
  loadDemoInventory,
  loadDemoOrders,
  resetDemoConversations,
  updateDemoConversation,
} from '../lib/demoStore';

const DataContext = createContext();

const DemoDataProvider = ({ children }) => {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [vendors, setVendors] = useState([]);

  const filterForProfile = (items) => {
    if (!profile) {
      // Guest mode: show first tenant's data as demo
      const demoTenantId = 'tenant-001';
      return items.filter(c => c.tenant_id === demoTenantId);
    }

    const isHigherAdmin = ['platform_owner', 'super_admin'].includes(profile?.role);
    
    if (isHigherAdmin) {
      if (selectedVendorId) return items.filter(i => i.tenant_id === selectedVendorId);
      return items;
    }
    
    if (profile?.role === 'customer') return items.filter(c => c.customerUserId === profile.id);
    if (profile?.tenant_id) return items.filter(c => c.tenant_id === profile.tenant_id);
    return [];
  };

  useEffect(() => {
    const fetchData = () => {
      const storedConversations = loadDemoConversations();
      const storedInventory = loadDemoInventory();
      const storedOrders = loadDemoOrders();
      
      const storedVendors = JSON.parse(localStorage.getItem('samuhik_demo_vendors') || '[]');
      setVendors([...ALL_TENANTS, ...storedVendors]);
      
      const isHigherAdmin = ['platform_owner', 'super_admin'].includes(profile?.role);

      if (!profile) {
        // Guest mode: show first tenant's data as demo
        const demoTenantId = 'tenant-001';
        setConversations(storedConversations.filter(c => c.tenant_id === demoTenantId));
        setInventory(storedInventory.filter(i => i.tenant_id === demoTenantId));
        setOrders(storedOrders.filter(o => o.tenant_id === demoTenantId));
        setLoading(false);
        return;
      }

      if (isHigherAdmin) {
        setConversations(selectedVendorId ? storedConversations.filter(c => c.tenant_id === selectedVendorId) : storedConversations);
        setInventory(selectedVendorId ? storedInventory.filter(i => i.tenant_id === selectedVendorId) : storedInventory);
        setOrders(selectedVendorId ? storedOrders.filter(o => o.tenant_id === selectedVendorId) : storedOrders);
      } else if (profile.role === 'customer') {
        setConversations(storedConversations.filter(c => c.customerUserId === profile.id));
        setInventory(storedInventory.filter(i => i.tenant_id === profile.tenant_id));
        setOrders(storedOrders.filter(o => o.tenant_id === profile.tenant_id));
      } else if (profile.tenant_id) {
        setConversations(storedConversations.filter(c => c.tenant_id === profile.tenant_id));
        setInventory(storedInventory.filter(i => i.tenant_id === profile.tenant_id));
        setOrders(storedOrders.filter(o => o.tenant_id === profile.tenant_id));
      } else {
        setConversations([]);
        setInventory([]);
        setOrders([]);
      }
      setLoading(false);
    };

    fetchData();
  }, [profile, selectedVendorId]);

  useEffect(() => {
    const sync = () => {
      const storedInventory = loadDemoInventory();
      const storedOrders = loadDemoOrders();
      const storedConversations = loadDemoConversations();

      const isHigherAdmin = ['platform_owner', 'super_admin'].includes(profile?.role);

      if (!profile) {
        const demoTenantId = 'tenant-001';
        setConversations(storedConversations.filter(c => c.tenant_id === demoTenantId));
        setInventory(storedInventory.filter(i => i.tenant_id === demoTenantId));
        setOrders(storedOrders.filter(o => o.tenant_id === demoTenantId));
        return;
      }

      setConversations(filterForProfile(storedConversations));
      setInventory(
        isHigherAdmin
          ? (selectedVendorId ? storedInventory.filter(i => i.tenant_id === selectedVendorId) : storedInventory)
          : storedInventory.filter(i => i.tenant_id === profile.tenant_id)
      );
      setOrders(
        isHigherAdmin
          ? (selectedVendorId ? storedOrders.filter(o => o.tenant_id === selectedVendorId) : storedOrders)
          : storedOrders.filter(o => o.tenant_id === profile.tenant_id)
      );
    };
    const onStorage = (event) => {
      if ([DEMO_CONVERSATIONS_KEY, DEMO_INVENTORY_KEY, DEMO_ORDERS_KEY].includes(event.key)) sync();
    };

    window.addEventListener(DEMO_SYNC_EVENT, sync);
    window.addEventListener('storage', onStorage);
    window.addEventListener('samuhik_sync_vendors', sync);

    return () => {
      window.removeEventListener(DEMO_SYNC_EVENT, sync);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('samuhik_sync_vendors', sync);
    };
  }, [profile, selectedVendorId]);

  const addMessage = async (chatId, message, extraUpdates = {}) => {
    const updated = appendDemoMessage(chatId, message, extraUpdates);
    setConversations(filterForProfile(updated));
  };

  const updateConversation = async (chatId, updates) => {
    const updated = updateDemoConversation(chatId, updates);
    setConversations(filterForProfile(updated));
  };

  const refreshData = () => {
    const storedConversations = loadDemoConversations();
    const storedInventory = loadDemoInventory();
    const storedOrders = loadDemoOrders();
    if (['platform_owner', 'super_admin'].includes(profile?.role)) {
      setConversations(storedConversations);
      setInventory(storedInventory);
      setOrders(storedOrders);
    } else if (profile?.role === 'customer') {
      setConversations(storedConversations.filter(c => c.customerUserId === profile.id));
      setInventory(storedInventory.filter(i => i.tenant_id === profile.tenant_id));
      setOrders(storedOrders.filter(o => o.tenant_id === profile.tenant_id));
    } else if (profile?.tenant_id) {
      setConversations(storedConversations.filter(c => c.tenant_id === profile.tenant_id));
      setInventory(storedInventory.filter(i => i.tenant_id === profile.tenant_id));
      setOrders(storedOrders.filter(o => o.tenant_id === profile.tenant_id));
    }
  };

  const resetDemo = () => {
    const next = resetDemoConversations();
    setConversations(filterForProfile(next));
    setInventory(
      ['platform_owner', 'super_admin'].includes(profile?.role)
        ? loadDemoInventory()
        : loadDemoInventory().filter(i => i.tenant_id === profile?.tenant_id)
    );
    setOrders([]);
  };

  return (
    <DataContext.Provider
      value={{
        conversations,
        inventory,
        orders,
        vendors,
        loading,
        selectedVendorId,
        setSelectedVendorId,
        addMessage,
        updateConversation,
        refreshData,
        resetDemo,
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
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [vendors, setVendors] = useState([]);

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
          filter: ['platform_owner', 'super_admin'].includes(profile.role) ? undefined : `tenant_id=eq.${profile.tenant_id}`
        },
        () => {
          fetchInitialData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(convSubscription);
    };
  }, [profile, supabaseModule, selectedVendorId]);

  const fetchInitialData = async () => {
    if (!supabaseModule) return;
    const { supabase } = supabaseModule;
    setLoading(true);
    try {
      const isHigherAdmin = ['platform_owner', 'super_admin'].includes(profile.role);
      const tenantId = isHigherAdmin ? selectedVendorId : profile.tenant_id;
      
      if (isHigherAdmin) {
        const { data: vendorData, error: vendorError } = await supabase.from('tenants').select('*');
        if (!vendorError) setVendors(vendorData);
      }

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

      if (tenantId) {
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
      if (tenantId) {
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
      orders: [],
      vendors,
      loading,
      selectedVendorId,
      setSelectedVendorId,
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
