export type IndustryType = 'all' | 'real_estate' | 'car_dealership' | 'repair_shop' | 'boutique';

export type PipelineStage = 
  // Real estate
  | 'new_inquiry'
  | 'viewing_scheduled'
  | 'offer_submitted'
  | 'under_contract'
  | 'closed_won'
  | 'closed_lost'
  // Car dealership
  | 'test_drive_booked'
  | 'trade_in_eval'
  | 'finance_approved'
  | 'vehicle_delivered'
  // Repair shop
  | 'diagnostic_booked'
  | 'quote_sent'
  | 'in_progress'
  | 'ready_for_pickup'
  // Boutique
  | 'catalog_browsing'
  | 'fitting_reserved'
  | 'order_placed'
  | 'shipped_delivered';

export interface StageDefinition {
  id: string;
  label: string;
  industry: IndustryType;
  color: string;
  order: number;
}

export interface WhatsAppMessage {
  id: string;
  sender: 'customer' | 'business' | 'system';
  text: string;
  timestamp: string; // ISO string
  status?: 'sent' | 'delivered' | 'read';
  hasAttachment?: boolean;
  attachmentType?: 'image' | 'document' | 'audio' | 'location';
  attachmentUrl?: string;
  attachmentTitle?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: 'Admin' | 'Sales Agent' | 'Service Advisor' | 'Stylist';
  avatar: string;
  email: string;
  phone: string;
  active: boolean;
}

export interface InternalNote {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  timestamp: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  industry: IndustryType;
  stageId: string;
  dealValue: number;
  dealTitle: string;
  assignedTo: string; // TeamMember ID
  unreadCount: number;
  lastMessageText: string;
  lastMessageTime: string;
  tags: string[];
  followUpDate?: string; // ISO string
  followUpNote?: string;
  notes: InternalNote[];
  customFields: Record<string, string>;
  createdAt: string;
  source: 'WhatsApp QR' | 'Instagram Ad' | 'Website Widget' | 'Walk-in' | 'Referral';
}

export interface FollowUpItem {
  id: string;
  contactId: string;
  contactName: string;
  contactPhone: string;
  industry: IndustryType;
  dueDate: string; // YYYY-MM-DD
  dueTime: string; // HH:mm
  title: string;
  description: string;
  isAutomatedWhatsApp: boolean;
  templateId?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface MessageTemplate {
  id: string;
  title: string;
  industry: IndustryType;
  category: 'Greeting' | 'Quote' | 'Follow-up' | 'Confirmation' | 'Promo' | 'Status Update';
  content: string; // Contains variables like {{name}}, {{dealTitle}}, {{date}}, {{businessName}}
  shortcut: string; // e.g. /viewing, /quote, /drive
}

export interface CRMAnalytics {
  totalLeads: number;
  activeConversations: number;
  pipelineValue: number;
  responseRatePercent: number;
  avgResponseMinutes: number;
  closedWonCount: number;
  closedWonValue: number;
  industryBreakdown: {
    industry: IndustryType;
    count: number;
    value: number;
  }[];
  leadsByStage: {
    stage: string;
    count: number;
  }[];
}

export type PricingTier = 'basic' | 'pro' | 'enterprise';

export interface SubscriptionInfo {
  tier: PricingTier;
  isTrial: boolean;
  trialDaysLeft: number;
  billingCycle: 'monthly' | 'yearly';
  renewalDate: string;
}
