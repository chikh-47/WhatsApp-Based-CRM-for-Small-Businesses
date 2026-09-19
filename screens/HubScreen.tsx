import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCRM } from '../context/CRMContext';
import { INDUSTRY_COLORS, INDUSTRY_LABELS } from '../lib/mockData';

interface Props {
  navigation: any;
}

export const HubScreen: React.FC<Props> = ({ navigation }) => {
  const {
    analytics,
    subscription,
    integrations,
    toggleIntegration,
    syncIntegrationsNow,
    isSyncing,
    teamMembers,
    selectedTeamMemberId,
    setSelectedTeamMemberId,
    templates,
    resetToDefaultData,
  } = useCRM();

  const currentMember = teamMembers.find((m) => m.id === selectedTeamMemberId) || teamMembers[0];

  const handleResetData = () => {
    Alert.alert(
      'Reset Sample Data',
      'This will reset all contacts, WhatsApp conversations, and templates back to initial defaults.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetToDefaultData();
            Alert.alert('Reset Complete', 'Sample dataset restored successfully.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Subscription Card */}
      <View style={styles.subscriptionBanner}>
        <View style={styles.subBannerLeft}>
          <View style={styles.tierPill}>
            <Ionicons name="sparkles" size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.tierPillText}>
              {subscription.tier.toUpperCase()} PLAN
            </Text>
          </View>
          <Text style={styles.subTitle}>
            {subscription.tier === 'basic'
              ? 'Basic Plan ($20/mo)'
              : subscription.tier === 'pro'
              ? 'Pro Plan ($50/mo)'
              : 'Enterprise Plan ($100/mo)'}
          </Text>
          <Text style={styles.subStatus}>
            {subscription.isTrial
              ? `Free Trial: ${subscription.trialDaysLeft} days remaining`
              : `Renews on ${subscription.renewalDate}`}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.upgradeBtn}
          onPress={() => navigation.navigate('PricingPlansModal')}
          activeOpacity={0.8}
        >
          <Text style={styles.upgradeBtnText}>Change Plan</Text>
        </TouchableOpacity>
      </View>

      {/* Analytics & Key Metrics */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>WhatsApp Analytics & Performance</Text>
          <View style={styles.liveTag}>
            <View style={styles.greenPulse} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        </View>

        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsBox}>
            <Text style={styles.analyticsVal}>{analytics.responseRatePercent}%</Text>
            <Text style={styles.analyticsSub}>Response Rate</Text>
            <Text style={styles.analyticsTrend}>↑ 4.2% vs last month</Text>
          </View>

          <View style={styles.analyticsBox}>
            <Text style={styles.analyticsVal}>{analytics.avgResponseMinutes} min</Text>
            <Text style={styles.analyticsSub}>Avg Reply Time</Text>
            <Text style={styles.analyticsTrend}>Instant 24/7</Text>
          </View>

          <View style={styles.analyticsBox}>
            <Text style={[styles.analyticsVal, { color: '#059669' }]}>
              ${(analytics.pipelineValue / 1000).toFixed(0)}k
            </Text>
            <Text style={styles.analyticsSub}>Active Pipeline</Text>
            <Text style={styles.analyticsTrend}>{analytics.totalLeads} active deals</Text>
          </View>

          <View style={styles.analyticsBox}>
            <Text style={[styles.analyticsVal, { color: '#2563EB' }]}>
              ${(analytics.closedWonValue / 1000).toFixed(0)}k
            </Text>
            <Text style={styles.analyticsSub}>Closed Deals</Text>
            <Text style={styles.analyticsTrend}>
              {analytics.closedWonCount} deals completed
            </Text>
          </View>
        </View>

        {/* Industry Breakdown Bars */}
        <Text style={styles.breakdownHeader}>Pipeline by Industry:</Text>
        <View style={styles.breakdownList}>
          {analytics.industryBreakdown.map((item) => {
            const indColor = INDUSTRY_COLORS[item.industry];
            const percent = analytics.pipelineValue > 0 ? (item.value / analytics.pipelineValue) * 100 : 0;
            return (
              <View key={item.industry} style={styles.breakdownRow}>
                <View style={styles.breakdownLabelRow}>
                  <Text style={styles.breakdownName}>{INDUSTRY_LABELS[item.industry]}</Text>
                  <Text style={styles.breakdownValue}>
                    ${item.value.toLocaleString()} ({item.count} leads)
                  </Text>
                </View>
                <View style={styles.progressBarTrack}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${Math.max(percent, 4)}%`, backgroundColor: indColor },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* Templates Library Access */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>WhatsApp Message Templates</Text>
          <TouchableOpacity
            style={styles.addTemplateBtn}
            onPress={() => navigation.navigate('TemplateEditorModal')}
          >
            <Ionicons name="add-circle" size={16} color="#075E54" style={{ marginRight: 4 }} />
            <Text style={styles.addTemplateBtnText}>+ New Template</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionDesc}>
          {templates.length} pre-built templates for Real Estate, Auto, Repair & Boutique.
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
          {templates.slice(0, 5).map((tmpl) => (
            <View key={tmpl.id} style={styles.miniTemplateCard}>
              <View style={styles.miniTmplHeader}>
                <Text style={styles.miniTmplShortcut}>{tmpl.shortcut}</Text>
                <Text style={styles.miniTmplCategory}>{tmpl.category}</Text>
              </View>
              <Text style={styles.miniTmplTitle} numberOfLines={1}>
                {tmpl.title}
              </Text>
              <Text style={styles.miniTmplSnippet} numberOfLines={2}>
                {tmpl.content}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Integrations Center */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Integrations & Automations</Text>
          <TouchableOpacity
            style={styles.syncAllBtn}
            onPress={() => syncIntegrationsNow()}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color="#075E54" />
            ) : (
              <>
                <Ionicons name="sync" size={14} color="#075E54" style={{ marginRight: 4 }} />
                <Text style={styles.syncAllBtnText}>Sync All</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* WhatsApp Cloud API */}
        <View style={styles.integrationItem}>
          <View style={[styles.intIcon, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="logo-whatsapp" size={20} color="#16A34A" />
          </View>
          <View style={styles.intDetails}>
            <Text style={styles.intName}>WhatsApp Business Cloud API</Text>
            <Text style={styles.intSub}>E2EE Webhook • {integrations.whatsappApi.phoneConnected}</Text>
          </View>
          <Switch
            value={integrations.whatsappApi.connected}
            onValueChange={() => toggleIntegration('whatsappApi')}
            trackColor={{ false: '#CBD5E1', true: '#86EFAC' }}
            thumbColor={integrations.whatsappApi.connected ? '#16A34A' : '#F1F5F9'}
          />
        </View>

        {/* Google Calendar */}
        <View style={styles.integrationItem}>
          <View style={[styles.intIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="calendar" size={20} color="#2563EB" />
          </View>
          <View style={styles.intDetails}>
            <Text style={styles.intName}>Google Calendar</Text>
            <Text style={styles.intSub}>
              {integrations.googleCalendar.syncedEventsCount} appointments scheduled
            </Text>
          </View>
          <Switch
            value={integrations.googleCalendar.connected}
            onValueChange={() => toggleIntegration('googleCalendar')}
            trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
            thumbColor={integrations.googleCalendar.connected ? '#2563EB' : '#F1F5F9'}
          />
        </View>

        {/* Zapier */}
        <View style={styles.integrationItem}>
          <View style={[styles.intIcon, { backgroundColor: '#FFEDD5' }]}>
            <Ionicons name="flash" size={20} color="#EA580C" />
          </View>
          <View style={styles.intDetails}>
            <Text style={styles.intName}>Zapier Automation</Text>
            <Text style={styles.intSub}>{integrations.zapier.activeZaps} Active Webhooks & Zaps</Text>
          </View>
          <Switch
            value={integrations.zapier.connected}
            onValueChange={() => toggleIntegration('zapier')}
            trackColor={{ false: '#CBD5E1', true: '#FDBA74' }}
            thumbColor={integrations.zapier.connected ? '#EA580C' : '#F1F5F9'}
          />
        </View>

        {/* Google Contacts & Excel */}
        <View style={styles.integrationItem}>
          <View style={[styles.intIcon, { backgroundColor: '#F3E8FF' }]}>
            <Ionicons name="cloud-upload" size={20} color="#9333EA" />
          </View>
          <View style={styles.intDetails}>
            <Text style={styles.intName}>Google Contacts / CSV Sync</Text>
            <Text style={styles.intSub}>{integrations.googleContacts.lastSync}</Text>
          </View>
          <Switch
            value={integrations.googleContacts.connected}
            onValueChange={() => toggleIntegration('googleContacts')}
            trackColor={{ false: '#CBD5E1', true: '#D8B4FE' }}
            thumbColor={integrations.googleContacts.connected ? '#9333EA' : '#F1F5F9'}
          />
        </View>
      </View>

      {/* Multi-User Collaboration */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Multi-User Team Access & Roles</Text>
        <Text style={styles.sectionDesc}>
          Active User: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{currentMember.name}</Text> ({currentMember.role})
        </Text>

        <View style={styles.teamList}>
          {teamMembers.map((member) => {
            const isSelected = member.id === selectedTeamMemberId;
            return (
              <TouchableOpacity
                key={member.id}
                style={[styles.teamMemberCard, isSelected && styles.teamMemberSelected]}
                onPress={() => setSelectedTeamMemberId(member.id)}
              >
                <Image source={{ uri: member.avatar }} style={styles.teamAvatar} />
                <View style={styles.teamInfo}>
                  <Text style={styles.teamName}>{member.name}</Text>
                  <Text style={styles.teamRole}>{member.role}</Text>
                </View>
                {isSelected ? (
                  <View style={styles.currentActiveBadge}>
                    <Text style={styles.currentActiveText}>Active Now</Text>
                  </View>
                ) : (
                  <Text style={styles.switchText}>Switch</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Security, Compliance & Data Reset */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Security & Compliance</Text>
        <View style={styles.complianceList}>
          <View style={styles.complianceItem}>
            <Ionicons name="shield-checkmark" size={16} color="#059669" style={{ marginRight: 6 }} />
            <Text style={styles.complianceText}>256-bit WhatsApp End-to-End Encryption</Text>
          </View>
          <View style={styles.complianceItem}>
            <Ionicons name="document-lock" size={16} color="#059669" style={{ marginRight: 6 }} />
            <Text style={styles.complianceText}>GDPR & CCPA Compliant Data Handling</Text>
          </View>
          <View style={styles.complianceItem}>
            <Ionicons name="time" size={16} color="#059669" style={{ marginRight: 6 }} />
            <Text style={styles.complianceText}>Automated 99.98% WhatsApp API Uptime</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.resetBtn} onPress={handleResetData}>
          <Ionicons name="refresh-outline" size={16} color="#475569" style={{ marginRight: 6 }} />
          <Text style={styles.resetBtnText}>Restore Default Sample CRM Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 14,
    paddingBottom: 60,
  },
  subscriptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#075E54',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#075E54',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  subBannerLeft: {
    flex: 1,
    marginRight: 10,
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  tierPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#075E54',
    letterSpacing: 0.5,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subStatus: {
    fontSize: 12,
    color: '#C8E6C9',
  },
  upgradeBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  upgradeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#075E54',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  sectionDesc: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 10,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 8,
  },
  analyticsBox: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  analyticsVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  analyticsSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  analyticsTrend: {
    fontSize: 10,
    fontWeight: '600',
    color: '#059669',
    marginTop: 4,
  },
  breakdownHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 10,
    marginBottom: 8,
  },
  breakdownList: {
    gap: 8,
  },
  breakdownRow: {
    gap: 4,
  },
  breakdownLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  breakdownValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  addTemplateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addTemplateBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#075E54',
  },
  miniTemplateCard: {
    width: 170,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
  },
  miniTmplHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  miniTmplShortcut: {
    fontSize: 11,
    fontWeight: '800',
    color: '#075E54',
  },
  miniTmplCategory: {
    fontSize: 9.5,
    color: '#64748B',
  },
  miniTmplTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  miniTmplSnippet: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 14,
  },
  syncAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  syncAllBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#075E54',
  },
  integrationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  intIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  intDetails: {
    flex: 1,
    marginRight: 8,
  },
  intName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  intSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  teamList: {
    gap: 8,
    marginTop: 6,
  },
  teamMemberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  teamMemberSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  teamAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  teamRole: {
    fontSize: 11,
    color: '#64748B',
  },
  currentActiveBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  currentActiveText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  switchText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  complianceList: {
    gap: 6,
    marginBottom: 12,
  },
  complianceItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  complianceText: {
    fontSize: 12,
    color: '#334155',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 8,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
});
