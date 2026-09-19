import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Contact,
  WhatsAppMessage,
  MessageTemplate,
  FollowUpItem,
  TeamMember,
  IndustryType,
  SubscriptionInfo,
  PricingTier,
  CRMAnalytics,
} from '../types/crm';
import {
  INITIAL_CONTACTS,
  INITIAL_MESSAGES,
  INITIAL_TEMPLATES,
  INITIAL_FOLLOW_UPS,
  INITIAL_TEAM_MEMBERS,
  STAGE_DEFINITIONS,
} from '../lib/mockData';

interface IntegrationState {
  whatsappApi: { connected: boolean; webhookLatencyMs: number; phoneConnected: string };
  googleCalendar: { connected: boolean; syncedEventsCount: number };
  zapier: { connected: boolean; activeZaps: number };
  googleContacts: { connected: boolean; lastSync: string };
}

interface CRMContextType {
  contacts: Contact[];
  messages: Record<string, WhatsAppMessage[]>;
  templates: MessageTemplate[];
  followUps: FollowUpItem[];
  teamMembers: TeamMember[];
  selectedTeamMemberId: string;
  setSelectedTeamMemberId: (id: string) => void;
  activeIndustry: IndustryType;
  setActiveIndustry: (industry: IndustryType) => void;
  subscription: SubscriptionInfo;
  setSubscriptionTier: (tier: PricingTier) => void;
  integrations: IntegrationState;
  toggleIntegration: (key: keyof IntegrationState) => void;
  syncIntegrationsNow: () => Promise<void>;
  isSyncing: boolean;

  // Actions
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'notes' | 'unreadCount' | 'lastMessageText' | 'lastMessageTime'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  moveContactStage: (contactId: string, newStageId: string) => void;
  addContactNote: (contactId: string, noteText: string) => void;
  
  sendMessage: (
    contactId: string,
    text: string,
    options?: { hasAttachment?: boolean; attachmentType?: 'image' | 'document' | 'audio'; attachmentTitle?: string }
  ) => void;
  markMessagesAsRead: (contactId: string) => void;

  addFollowUp: (followUp: Omit<FollowUpItem, 'id' | 'completed'>) => void;
  toggleFollowUpComplete: (id: string) => void;
  deleteFollowUp: (id: string) => void;

  addTemplate: (template: Omit<MessageTemplate, 'id'>) => void;
  updateTemplate: (id: string, updates: Partial<MessageTemplate>) => void;
  deleteTemplate: (id: string) => void;

  analytics: CRMAnalytics;
  exportContactsCSV: () => string;
  resetToDefaultData: () => Promise<void>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CONTACTS: '@whatcrm_contacts_v1',
  MESSAGES: '@whatcrm_messages_v1',
  TEMPLATES: '@whatcrm_templates_v1',
  FOLLOWUPS: '@whatcrm_followups_v1',
  SUBSCRIPTION: '@whatcrm_subscription_v1',
  INTEGRATIONS: '@whatcrm_integrations_v1',
  TEAM_MEMBER: '@whatcrm_selected_member_v1',
};

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [messages, setMessages] = useState<Record<string, WhatsAppMessage[]>>(INITIAL_MESSAGES);
  const [templates, setTemplates] = useState<MessageTemplate[]>(INITIAL_TEMPLATES);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>(INITIAL_FOLLOW_UPS);
  const [teamMembers] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState<string>('team_1');
  const [activeIndustry, setActiveIndustry] = useState<IndustryType>('all');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [subscription, setSubscription] = useState<SubscriptionInfo>({
    tier: 'pro',
    isTrial: true,
    trialDaysLeft: 11,
    billingCycle: 'monthly',
    renewalDate: '2026-10-03',
  });

  const [integrations, setIntegrations] = useState<IntegrationState>({
    whatsappApi: { connected: true, webhookLatencyMs: 42, phoneConnected: '+1 (800) 555-CHAT' },
    googleCalendar: { connected: true, syncedEventsCount: 28 },
    zapier: { connected: true, activeZaps: 6 },
    googleContacts: { connected: true, lastSync: 'Today at 10:14 AM' },
  });

  // Load from local storage on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const storedContacts = await AsyncStorage.getItem(STORAGE_KEYS.CONTACTS);
        const storedMessages = await AsyncStorage.getItem(STORAGE_KEYS.MESSAGES);
        const storedTemplates = await AsyncStorage.getItem(STORAGE_KEYS.TEMPLATES);
        const storedFollowUps = await AsyncStorage.getItem(STORAGE_KEYS.FOLLOWUPS);
        const storedSubscription = await AsyncStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
        const storedIntegrations = await AsyncStorage.getItem(STORAGE_KEYS.INTEGRATIONS);

        if (storedContacts) setContacts(JSON.parse(storedContacts));
        if (storedMessages) setMessages(JSON.parse(storedMessages));
        if (storedTemplates) setTemplates(JSON.parse(storedTemplates));
        if (storedFollowUps) setFollowUps(JSON.parse(storedFollowUps));
        if (storedSubscription) setSubscription(JSON.parse(storedSubscription));
        if (storedIntegrations) setIntegrations(JSON.parse(storedIntegrations));
      } catch (err) {
        console.warn('Failed to load CRM state from storage:', err);
      }
    };
    loadState();
  }, []);

  // Save changes to AsyncStorage
  const saveState = async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn('AsyncStorage save error:', e);
    }
  };

  const addContact = (
    contactData: Omit<Contact, 'id' | 'createdAt' | 'notes' | 'unreadCount' | 'lastMessageText' | 'lastMessageTime'>
  ) => {
    const newId = `contact_${Date.now()}`;
    const newContact: Contact = {
      ...contactData,
      id: newId,
      unreadCount: 0,
      lastMessageText: 'New contact record initiated via WhatsApp CRM.',
      lastMessageTime: 'Just now',
      notes: [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newContact, ...contacts];
    setContacts(updated);
    saveState(STORAGE_KEYS.CONTACTS, updated);

    // Seed welcoming conversation
    const initialConv: WhatsAppMessage[] = [
      {
        id: `msg_${Date.now()}_1`,
        sender: 'system',
        text: `WhatsApp CRM connected to ${newContact.name} (${newContact.phone}). End-to-end encrypted.`,
        timestamp: new Date().toISOString(),
      },
      {
        id: `msg_${Date.now()}_2`,
        sender: 'business',
        text: `Hello ${newContact.name}! Thank you for connecting with us regarding ${newContact.dealTitle}. How can our team assist you today?`,
        timestamp: new Date().toISOString(),
        status: 'delivered',
      },
    ];

    const updatedMessages = {
      ...messages,
      [newId]: initialConv,
    };
    setMessages(updatedMessages);
    saveState(STORAGE_KEYS.MESSAGES, updatedMessages);
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    const updated = contacts.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setContacts(updated);
    saveState(STORAGE_KEYS.CONTACTS, updated);
  };

  const deleteContact = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    saveState(STORAGE_KEYS.CONTACTS, updated);
  };

  const moveContactStage = (contactId: string, newStageId: string) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return;
    const stage = STAGE_DEFINITIONS.find((s) => s.id === newStageId);
    const stageName = stage ? stage.label : newStageId;

    const currentMember = teamMembers.find((m) => m.id === selectedTeamMemberId);

    const auditNote = {
      id: `note_${Date.now()}`,
      authorId: selectedTeamMemberId,
      authorName: currentMember ? currentMember.name : 'Team Agent',
      text: `Stage changed to "${stageName}"`,
      timestamp: 'Just now',
    };

    const updated = contacts.map((c) => {
      if (c.id === contactId) {
        return {
          ...c,
          stageId: newStageId,
          notes: [auditNote, ...c.notes],
        };
      }
      return c;
    });

    setContacts(updated);
    saveState(STORAGE_KEYS.CONTACTS, updated);
  };

  const addContactNote = (contactId: string, noteText: string) => {
    const currentMember = teamMembers.find((m) => m.id === selectedTeamMemberId);
    const newNote = {
      id: `note_${Date.now()}`,
      authorId: selectedTeamMemberId,
      authorName: currentMember ? currentMember.name : 'Team Member',
      text: noteText,
      timestamp: 'Just now',
    };

    const updated = contacts.map((c) => {
      if (c.id === contactId) {
        return {
          ...c,
          notes: [newNote, ...c.notes],
        };
      }
      return c;
    });

    setContacts(updated);
    saveState(STORAGE_KEYS.CONTACTS, updated);
  };

  const sendMessage = (
    contactId: string,
    text: string,
    options?: { hasAttachment?: boolean; attachmentType?: 'image' | 'document' | 'audio'; attachmentTitle?: string }
  ) => {
    const newMessage: WhatsAppMessage = {
      id: `msg_${Date.now()}`,
      sender: 'business',
      text,
      timestamp: new Date().toISOString(),
      status: 'sent',
      hasAttachment: options?.hasAttachment,
      attachmentType: options?.attachmentType,
      attachmentTitle: options?.attachmentTitle,
    };

    const currentList = messages[contactId] || [];
    const updatedConv = [...currentList, newMessage];

    const updatedMessages = {
      ...messages,
      [contactId]: updatedConv,
    };
    setMessages(updatedMessages);
    saveState(STORAGE_KEYS.MESSAGES, updatedMessages);

    // Update contact last message
    const updatedContacts = contacts.map((c) => {
      if (c.id === contactId) {
        return {
          ...c,
          lastMessageText: text || (options?.attachmentTitle ? `Attachment: ${options.attachmentTitle}` : 'Sent media'),
          lastMessageTime: 'Just now',
        };
      }
      return c;
    });
    setContacts(updatedContacts);
    saveState(STORAGE_KEYS.CONTACTS, updatedContacts);

    // Simulated status update: delivered -> read
    setTimeout(() => {
      setMessages((prev) => {
        const list = prev[contactId] || [];
        const nextList = list.map((m) => (m.id === newMessage.id ? { ...m, status: 'read' as const } : m));
        const next = { ...prev, [contactId]: nextList };
        saveState(STORAGE_KEYS.MESSAGES, next);
        return next;
      });
    }, 1500);

    // Optional simulated customer auto-reply after 4 seconds to make WhatsApp feel dynamic!
    setTimeout(() => {
      const contact = contacts.find((c) => c.id === contactId);
      if (!contact) return;

      const autoReplies: Record<IndustryType, string[]> = {
        all: ['Thank you! Will review this and let you know shortly.'],
        real_estate: [
          'Thank you for the quick info! Looking forward to reviewing the floor plan.',
          'Got it! Is there any flexibility on the seller’s closing date?',
        ],
        car_dealership: [
          'Sounds good! Looking forward to the test drive.',
          'Thanks for the estimate. Can you also send the car history report?',
        ],
        repair_shop: [
          'Thanks for the heads-up. Please keep the old parts so I can see them.',
          'Perfect, I will pick it up on my way home from work.',
        ],
        boutique: [
          'Love it! Please reserve that piece for me, thank you!',
          'Thank you so much Chloe! Looking forward to my fitting.',
        ],
      };

      const repliesPool = autoReplies[contact.industry] || autoReplies.all;
      const randomReply = repliesPool[Math.floor(Math.random() * repliesPool.length)];

      const customerMsg: WhatsAppMessage = {
        id: `reply_${Date.now()}`,
        sender: 'customer',
        text: randomReply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => {
        const list = prev[contactId] || [];
        const nextList = [...list, customerMsg];
        const next = { ...prev, [contactId]: nextList };
        saveState(STORAGE_KEYS.MESSAGES, next);
        return next;
      });

      setContacts((prev) => {
        const nextContacts = prev.map((c) => {
          if (c.id === contactId) {
            return {
              ...c,
              lastMessageText: randomReply,
              lastMessageTime: 'Just now',
            };
          }
          return c;
        });
        saveState(STORAGE_KEYS.CONTACTS, nextContacts);
        return nextContacts;
      });
    }, 4500);
  };

  const markMessagesAsRead = (contactId: string) => {
    const updatedContacts = contacts.map((c) => {
      if (c.id === contactId) {
        return { ...c, unreadCount: 0 };
      }
      return c;
    });
    setContacts(updatedContacts);
    saveState(STORAGE_KEYS.CONTACTS, updatedContacts);
  };

  const addFollowUp = (itemData: Omit<FollowUpItem, 'id' | 'completed'>) => {
    const newItem: FollowUpItem = {
      ...itemData,
      id: `fu_${Date.now()}`,
      completed: false,
    };
    const updated = [newItem, ...followUps];
    setFollowUps(updated);
    saveState(STORAGE_KEYS.FOLLOWUPS, updated);
  };

  const toggleFollowUpComplete = (id: string) => {
    const updated = followUps.map((f) => (f.id === id ? { ...f, completed: !f.completed } : f));
    setFollowUps(updated);
    saveState(STORAGE_KEYS.FOLLOWUPS, updated);
  };

  const deleteFollowUp = (id: string) => {
    const updated = followUps.filter((f) => f.id !== id);
    setFollowUps(updated);
    saveState(STORAGE_KEYS.FOLLOWUPS, updated);
  };

  const addTemplate = (templateData: Omit<MessageTemplate, 'id'>) => {
    const newTemplate: MessageTemplate = {
      ...templateData,
      id: `tmpl_${Date.now()}`,
    };
    const updated = [newTemplate, ...templates];
    setTemplates(updated);
    saveState(STORAGE_KEYS.TEMPLATES, updated);
  };

  const updateTemplate = (id: string, updates: Partial<MessageTemplate>) => {
    const updated = templates.map((t) => (t.id === id ? { ...t, ...updates } : t));
    setTemplates(updated);
    saveState(STORAGE_KEYS.TEMPLATES, updated);
  };

  const deleteTemplate = (id: string) => {
    const updated = templates.filter((t) => t.id !== id);
    setTemplates(updated);
    saveState(STORAGE_KEYS.TEMPLATES, updated);
  };

  const setSubscriptionTier = (tier: PricingTier) => {
    const updated: SubscriptionInfo = {
      ...subscription,
      tier,
      isTrial: false,
      renewalDate: '2026-10-19',
    };
    setSubscription(updated);
    saveState(STORAGE_KEYS.SUBSCRIPTION, updated);
  };

  const toggleIntegration = (key: keyof IntegrationState) => {
    const updated = {
      ...integrations,
      [key]: {
        ...integrations[key],
        connected: !integrations[key].connected,
      },
    };
    setIntegrations(updated);
    saveState(STORAGE_KEYS.INTEGRATIONS, updated);
  };

  const syncIntegrationsNow = async () => {
    setIsSyncing(true);
    await new Promise((res) => setTimeout(res, 1200));
    const updated = {
      ...integrations,
      googleContacts: {
        ...integrations.googleContacts,
        lastSync: 'Just now (Synced 8 contacts)',
      },
      whatsappApi: {
        ...integrations.whatsappApi,
        webhookLatencyMs: 38,
      },
    };
    setIntegrations(updated);
    setIsSyncing(false);
  };

  const resetToDefaultData = async () => {
    setContacts(INITIAL_CONTACTS);
    setMessages(INITIAL_MESSAGES);
    setTemplates(INITIAL_TEMPLATES);
    setFollowUps(INITIAL_FOLLOW_UPS);
    await AsyncStorage.clear();
  };

  const exportContactsCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Email', 'Industry', 'Stage', 'Deal Title', 'Deal Value ($)', 'Tags', 'Created At'];
    const rows = contacts.map((c) => {
      const stage = STAGE_DEFINITIONS.find((s) => s.id === c.stageId);
      return [
        c.id,
        `"${c.name}"`,
        `"${c.phone}"`,
        `"${c.email}"`,
        `"${c.industry}"`,
        `"${stage?.label || c.stageId}"`,
        `"${c.dealTitle.replace(/"/g, '""')}"`,
        c.dealValue,
        `"${c.tags.join('; ')}"`,
        c.createdAt,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  };

  // Compute analytics
  const pipelineValue = contacts.reduce((sum, c) => sum + (c.dealValue || 0), 0);
  const closedWonContacts = contacts.filter((c) => c.stageId.includes('won') || c.stageId.includes('completed') || c.stageId.includes('delivered'));
  const closedWonValue = closedWonContacts.reduce((sum, c) => sum + (c.dealValue || 0), 0);

  const industryCounts: Record<IndustryType, { count: number; value: number }> = {
    all: { count: contacts.length, value: pipelineValue },
    real_estate: { count: 0, value: 0 },
    car_dealership: { count: 0, value: 0 },
    repair_shop: { count: 0, value: 0 },
    boutique: { count: 0, value: 0 },
  };

  contacts.forEach((c) => {
    if (industryCounts[c.industry]) {
      industryCounts[c.industry].count += 1;
      industryCounts[c.industry].value += c.dealValue;
    }
  });

  const industryBreakdown = (['real_estate', 'car_dealership', 'repair_shop', 'boutique'] as IndustryType[]).map((ind) => ({
    industry: ind,
    count: industryCounts[ind].count,
    value: industryCounts[ind].value,
  }));

  const leadsByStage = STAGE_DEFINITIONS.map((stage) => ({
    stage: stage.label,
    count: contacts.filter((c) => c.stageId === stage.id).length,
  }));

  const analytics: CRMAnalytics = {
    totalLeads: contacts.length,
    activeConversations: contacts.filter((c) => (messages[c.id] || []).length > 0).length,
    pipelineValue,
    responseRatePercent: 96.4,
    avgResponseMinutes: 1.8,
    closedWonCount: closedWonContacts.length,
    closedWonValue,
    industryBreakdown,
    leadsByStage,
  };

  return (
    <CRMContext.Provider
      value={{
        contacts,
        messages,
        templates,
        followUps,
        teamMembers,
        selectedTeamMemberId,
        setSelectedTeamMemberId,
        activeIndustry,
        setActiveIndustry,
        subscription,
        setSubscriptionTier,
        integrations,
        toggleIntegration,
        syncIntegrationsNow,
        isSyncing,
        addContact,
        updateContact,
        deleteContact,
        moveContactStage,
        addContactNote,
        sendMessage,
        markMessagesAsRead,
        addFollowUp,
        toggleFollowUpComplete,
        deleteFollowUp,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        analytics,
        exportContactsCSV,
        resetToDefaultData,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};
