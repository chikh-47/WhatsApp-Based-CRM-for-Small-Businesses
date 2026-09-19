import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCRM } from '../context/CRMContext';
import { IndustryType, Contact, StageDefinition } from '../types/crm';
import { STAGE_DEFINITIONS, INDUSTRY_COLORS, INDUSTRY_LABELS } from '../lib/mockData';
import { IndustryBadge } from '../components/IndustryBadge';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

export const PipelineScreen: React.FC<Props> = ({ navigation }) => {
  const { contacts, moveContactStage } = useCRM();
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType>('real_estate');

  // Stages for the selected industry
  const currentStages = STAGE_DEFINITIONS.filter(
    (s) => s.industry === selectedIndustry
  ).sort((a, b) => a.order - b.order);

  // Filter contacts by selected industry
  const industryContacts = contacts.filter((c) => c.industry === selectedIndustry);

  // Compute stats
  const totalPipelineValue = industryContacts.reduce((sum, c) => sum + (c.dealValue || 0), 0);
  const closedDeals = industryContacts.filter(
    (c) => c.stageId.includes('won') || c.stageId.includes('completed') || c.stageId.includes('delivered')
  );
  const closedValue = closedDeals.reduce((sum, c) => sum + (c.dealValue || 0), 0);

  const handleAdvanceStage = (contact: Contact, currentStageDef: StageDefinition) => {
    const currentIndex = currentStages.findIndex((s) => s.id === currentStageDef.id);
    if (currentIndex < currentStages.length - 1) {
      const nextStage = currentStages[currentIndex + 1];
      moveContactStage(contact.id, nextStage.id);
    }
  };

  const handleRegressStage = (contact: Contact, currentStageDef: StageDefinition) => {
    const currentIndex = currentStages.findIndex((s) => s.id === currentStageDef.id);
    if (currentIndex > 0) {
      const prevStage = currentStages[currentIndex - 1];
      moveContactStage(contact.id, prevStage.id);
    }
  };

  return (
    <View style={styles.container}>
      {/* Industry Pipeline Switcher */}
      <View style={styles.industryTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
          {(['real_estate', 'car_dealership', 'repair_shop', 'boutique'] as IndustryType[]).map((ind) => {
            const isSelected = selectedIndustry === ind;
            const indColor = INDUSTRY_COLORS[ind];
            return (
              <TouchableOpacity
                key={ind}
                style={[
                  styles.tabChip,
                  isSelected && { backgroundColor: indColor, borderColor: indColor },
                ]}
                onPress={() => setSelectedIndustry(ind)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, isSelected && styles.tabTextSelected]}>
                  {INDUSTRY_LABELS[ind]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Pipeline Summary Bar */}
      <View style={styles.metricsSummary}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Pipeline Value</Text>
          <Text style={styles.metricValue}>${totalPipelineValue.toLocaleString()}</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Active Deals</Text>
          <Text style={styles.metricValue}>{industryContacts.length}</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Closed Revenue</Text>
          <Text style={[styles.metricValue, { color: '#059669' }]}>${closedValue.toLocaleString()}</Text>
        </View>
      </View>

      {/* Horizontal Kanban Columns */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.kanbanScroll}
        decelerationRate="fast"
      >
        {currentStages.map((stage, stageIndex) => {
          const stageDeals = industryContacts.filter((c) => c.stageId === stage.id);
          const stageValue = stageDeals.reduce((sum, c) => sum + (c.dealValue || 0), 0);
          const isLastStage = stageIndex === currentStages.length - 1;
          const isFirstStage = stageIndex === 0;

          return (
            <View key={stage.id} style={styles.kanbanColumn}>
              {/* Column Header */}
              <View style={[styles.columnHeader, { borderLeftColor: stage.color }]}>
                <View style={styles.columnHeaderTitleRow}>
                  <Text style={styles.columnTitle} numberOfLines={1}>
                    {stage.label}
                  </Text>
                  <View style={[styles.dealCountBadge, { backgroundColor: `${stage.color}25` }]}>
                    <Text style={[styles.dealCountText, { color: stage.color }]}>
                      {stageDeals.length}
                    </Text>
                  </View>
                </View>
                <Text style={styles.columnValue}>${stageValue.toLocaleString()}</Text>
              </View>

              {/* Deals in this Stage */}
              <ScrollView
                style={styles.dealsList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {stageDeals.length === 0 ? (
                  <View style={styles.emptyStageBox}>
                    <Ionicons name="file-tray-outline" size={24} color="#CBD5E1" />
                    <Text style={styles.emptyStageText}>No deals in this stage</Text>
                  </View>
                ) : (
                  stageDeals.map((deal) => (
                    <View key={deal.id} style={styles.dealCard}>
                      <TouchableOpacity
                        onPress={() => navigation.navigate('ChatDetail', { contactId: deal.id })}
                        activeOpacity={0.7}
                      >
                        <View style={styles.dealCardHeader}>
                          {deal.avatar ? (
                            <Image source={{ uri: deal.avatar }} style={styles.dealAvatar} />
                          ) : (
                            <View style={[styles.dealAvatar, styles.fallbackDealAvatar]}>
                              <Text style={styles.dealAvatarInitial}>{deal.name.charAt(0)}</Text>
                            </View>
                          )}
                          <View style={styles.dealCustomerInfo}>
                            <Text style={styles.dealName} numberOfLines={1}>
                              {deal.name}
                            </Text>
                            <Text style={styles.dealPhone}>{deal.phone}</Text>
                          </View>
                        </View>

                        <Text style={styles.dealCardTitle} numberOfLines={2}>
                          {deal.dealTitle}
                        </Text>

                        <View style={styles.dealPriceRow}>
                          <Text style={styles.dealCardPrice}>
                            ${deal.dealValue.toLocaleString()}
                          </Text>
                          <Text style={styles.dealSourceTag}>{deal.source}</Text>
                        </View>
                      </TouchableOpacity>

                      {/* Stage Progression Actions */}
                      <View style={styles.stageActionRow}>
                        {!isFirstStage && (
                          <TouchableOpacity
                            style={styles.stageMoveBtn}
                            onPress={() => handleRegressStage(deal, stage)}
                          >
                            <Ionicons name="arrow-back" size={12} color="#64748B" />
                            <Text style={styles.stageMoveText}>Back</Text>
                          </TouchableOpacity>
                        )}

                        <TouchableOpacity
                          style={styles.quickChatBtn}
                          onPress={() => navigation.navigate('ChatDetail', { contactId: deal.id })}
                        >
                          <Ionicons name="logo-whatsapp" size={14} color="#25D366" />
                        </TouchableOpacity>

                        {!isLastStage && (
                          <TouchableOpacity
                            style={[styles.stageMoveBtn, styles.stageAdvanceBtn]}
                            onPress={() => handleAdvanceStage(deal, stage)}
                          >
                            <Text style={styles.stageAdvanceText}>Next Stage</Text>
                            <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
                          </TouchableOpacity>
                        )}

                        {isLastStage && (
                          <View style={styles.wonPill}>
                            <Ionicons name="checkmark-done" size={12} color="#10B981" />
                            <Text style={styles.wonText}>Won</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  industryTabs: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
  },
  tabsScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  tabTextSelected: {
    color: '#FFFFFF',
  },
  metricsSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  kanbanScroll: {
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 12,
  },
  kanbanColumn: {
    width: width * 0.76,
    maxHeight: '100%',
    backgroundColor: '#EEF2F6',
    borderRadius: 14,
    padding: 10,
  },
  columnHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  columnHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  columnTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
  },
  dealCountBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  dealCountText: {
    fontSize: 11,
    fontWeight: '800',
  },
  columnValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
  dealsList: {
    flex: 1,
  },
  emptyStageBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    marginTop: 8,
  },
  emptyStageText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 6,
  },
  dealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dealCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dealAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  fallbackDealAvatar: {
    backgroundColor: '#075E54',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealAvatarInitial: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  dealCustomerInfo: {
    flex: 1,
  },
  dealName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  dealPhone: {
    fontSize: 11,
    color: '#64748B',
  },
  dealCardTitle: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 17,
    marginBottom: 8,
    fontWeight: '500',
  },
  dealPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  dealCardPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  dealSourceTag: {
    fontSize: 10,
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stageActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  stageMoveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    gap: 4,
  },
  stageMoveText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  stageAdvanceBtn: {
    backgroundColor: '#075E54',
  },
  stageAdvanceText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  quickChatBtn: {
    padding: 6,
    backgroundColor: '#E8F5E9',
    borderRadius: 6,
  },
  wonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 3,
  },
  wonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
});
