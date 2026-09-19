import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCRM } from '../context/CRMContext';
import { PricingTier } from '../types/crm';

interface Props {
  navigation: any;
}

export const PricingPlansModal: React.FC<Props> = ({ navigation }) => {
  const { subscription, setSubscriptionTier } = useCRM();
  const [selectedTier, setSelectedTier] = useState<PricingTier>(subscription.tier);

  const plans = [
    {
      id: 'basic' as PricingTier,
      name: 'Basic Plan',
      price: '$20',
      period: '/month',
      badge: 'Solo Entrepreneurs',
      badgeColor: '#64748B',
      description: 'Essential CRM tools for solo real estate agents, stylists, and mechanics.',
      features: [
        'Up to 500 WhatsApp Contacts',
        'Direct WhatsApp Message Logging',
        'Basic Follow-Up Reminders',
        'Single User Access',
        'Standard Google Contacts Sync',
        'Email Support',
      ],
      notIncluded: ['Visual Pipeline Kanban', 'Pre-Built Industry Templates', 'Advanced Analytics'],
    },
    {
      id: 'pro' as PricingTier,
      name: 'Pro Plan',
      price: '$50',
      period: '/month',
      badge: 'Most Popular',
      badgeColor: '#059669',
      popular: true,
      description: 'Power tools for small business sales teams, car dealerships & busy repair shops.',
      features: [
        'Unlimited WhatsApp Contacts',
        'Visual Pipeline Stages & Kanban',
        'Pre-Built Industry Templates (All 4 Verticals)',
        'Automated WhatsApp Follow-Up Reminders',
        'Response Rate & Conversion Analytics',
        'Google Calendar & Zapier Webhook Sync',
        'Up to 5 Team Members with Role Permissions',
      ],
      notIncluded: ['Custom Dedicated WhatsApp Server API'],
    },
    {
      id: 'enterprise' as PricingTier,
      name: 'Enterprise Plan',
      price: '$100',
      period: '/month',
      badge: 'Multi-Location Teams',
      badgeColor: '#7C3AED',
      description: 'Maximum performance, unlimited scale, dedicated WhatsApp Cloud API throughput.',
      features: [
        'Unlimited Everything',
        'Multi-Store / Multi-Location Management',
        'Unlimited Team Members & Custom Roles',
        'Dedicated WhatsApp Cloud API High-Throughput',
        'Custom Webhooks & ERP / DMS Integrations',
        '1-on-1 Account Manager & 24/7 Priority SLA',
        'GDPR / CCPA Enterprise Data Export Compliance',
      ],
      notIncluded: [],
    },
  ];

  const handleApplyPlan = (tier: PricingTier) => {
    setSelectedTier(tier);
    setSubscriptionTier(tier);
    Alert.alert(
      'Plan Updated',
      `You have successfully switched to the ${tier.toUpperCase()} Plan ($${tier === 'basic' ? '20' : tier === 'pro' ? '50' : '100'}/mo). Thank you for subscribing!`
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription Plans</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Trial Status Card */}
        {subscription.isTrial && (
          <View style={styles.trialCard}>
            <View style={styles.trialIconBox}>
              <Ionicons name="time" size={22} color="#059669" />
            </View>
            <View style={styles.trialInfo}>
              <Text style={styles.trialTitle}>14-Day Free Trial Active</Text>
              <Text style={styles.trialSub}>
                You have {subscription.trialDaysLeft} days remaining. Choose a plan to unlock full continuity after your trial.
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.pageTitle}>Simple, Transparent Pricing</Text>
        <Text style={styles.pageSub}>
          Tailored for small businesses in Real Estate, Auto, Repair, and Boutiques.
        </Text>

        {/* Plan Cards */}
        {plans.map((p) => {
          const isCurrentActive = subscription.tier === p.id;
          return (
            <View
              key={p.id}
              style={[
                styles.planCard,
                p.popular && styles.planCardPopular,
                isCurrentActive && styles.planCardActiveTier,
              ]}
            >
              {p.popular && (
                <View style={styles.popularRibbon}>
                  <Text style={styles.popularRibbonText}>RECOMMENDED</Text>
                </View>
              )}

              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.planName}>{p.name}</Text>
                  <View style={[styles.badgePill, { backgroundColor: `${p.badgeColor}18` }]}>
                    <Text style={[styles.badgeText, { color: p.badgeColor }]}>{p.badge}</Text>
                  </View>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceNumber}>{p.price}</Text>
                  <Text style={styles.pricePeriod}>{p.period}</Text>
                </View>
              </View>

              <Text style={styles.planDescription}>{p.description}</Text>

              {/* Feature List */}
              <View style={styles.featuresList}>
                {p.features.map((feat, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={17} color="#059669" style={{ marginRight: 8 }} />
                    <Text style={styles.featureText}>{feat}</Text>
                  </View>
                ))}
                {p.notIncluded.map((notFeat, idx) => (
                  <View key={`not_${idx}`} style={styles.featureItem}>
                    <Ionicons name="close-circle-outline" size={17} color="#CBD5E1" style={{ marginRight: 8 }} />
                    <Text style={styles.notIncludedText}>{notFeat}</Text>
                  </View>
                ))}
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={[
                  styles.selectBtn,
                  isCurrentActive ? styles.selectBtnCurrent : p.popular ? styles.selectBtnPopular : null,
                ]}
                onPress={() => handleApplyPlan(p.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.selectBtnText,
                    isCurrentActive ? styles.selectBtnTextCurrent : styles.selectBtnTextLight,
                  ]}
                >
                  {isCurrentActive ? 'Active Plan' : `Switch to ${p.name}`}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Security & FAQ */}
        <View style={styles.faqCard}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqItem}>
            <Text style={styles.faqQ}>Can I switch plans anytime?</Text>
            <Text style={styles.faqA}>
              Yes, switch or cancel at any moment. Your WhatsApp transcripts and contact database will never be lost.
            </Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQ}>Does it work with my existing WhatsApp number?</Text>
            <Text style={styles.faqA}>
              Yes! You can connect your current WhatsApp Business app number or WhatsApp Business Cloud API.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  content: {
    padding: 16,
    paddingBottom: 60,
  },
  trialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  trialIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  trialInfo: {
    flex: 1,
  },
  trialTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  trialSub: {
    fontSize: 11.5,
    color: '#047857',
    marginTop: 2,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  pageSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  planCardPopular: {
    borderColor: '#059669',
    borderWidth: 2,
  },
  planCardActiveTier: {
    backgroundColor: '#FAFCFB',
  },
  popularRibbon: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  popularRibbonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  pricePeriod: {
    fontSize: 12,
    color: '#64748B',
    marginLeft: 2,
  },
  planDescription: {
    fontSize: 12.5,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 14,
  },
  featuresList: {
    gap: 8,
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 12.5,
    color: '#1E293B',
    flex: 1,
  },
  notIncludedText: {
    fontSize: 12,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  selectBtn: {
    backgroundColor: '#075E54',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectBtnPopular: {
    backgroundColor: '#059669',
  },
  selectBtnCurrent: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  selectBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  selectBtnTextLight: {
    color: '#FFFFFF',
  },
  selectBtnTextCurrent: {
    color: '#075E54',
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  faqTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  faqItem: {
    marginBottom: 12,
  },
  faqQ: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 2,
  },
  faqA: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
});
