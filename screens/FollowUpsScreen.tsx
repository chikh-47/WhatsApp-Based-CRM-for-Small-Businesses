import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCRM } from '../context/CRMContext';
import { FollowUpItem } from '../types/crm';
import { IndustryBadge } from '../components/IndustryBadge';

interface Props {
  navigation: any;
}

export const FollowUpsScreen: React.FC<Props> = ({ navigation }) => {
  const { followUps, toggleFollowUpComplete, deleteFollowUp, integrations } = useCRM();
  const [filterMode, setFilterMode] = useState<'all' | 'today' | 'upcoming' | 'completed'>('today');

  const todayStr = '2026-09-19'; // Today's date

  const filteredFollowUps = useMemo(() => {
    return followUps.filter((item) => {
      if (filterMode === 'completed') return item.completed;
      if (item.completed) return false;

      if (filterMode === 'today') {
        return item.dueDate === todayStr;
      }
      if (filterMode === 'upcoming') {
        return item.dueDate > todayStr;
      }
      return true;
    });
  }, [followUps, filterMode]);

  const dueTodayCount = followUps.filter((f) => !f.completed && f.dueDate === todayStr).length;
  const upcomingCount = followUps.filter((f) => !f.completed && f.dueDate > todayStr).length;

  const handleSendWhatsApp = (item: FollowUpItem) => {
    navigation.navigate('ChatDetail', { contactId: item.contactId });
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Reminder', 'Are you sure you want to remove this reminder?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteFollowUp(id) },
    ]);
  };

  const renderFollowUpCard = ({ item }: { item: FollowUpItem }) => {
    const isToday = item.dueDate === todayStr;
    const isOverdue = !item.completed && item.dueDate < todayStr;

    return (
      <View style={[styles.card, item.completed && styles.cardCompleted]}>
        <View style={styles.cardHeader}>
          <TouchableOpacity
            style={styles.checkboxTouch}
            onPress={() => toggleFollowUpComplete(item.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, item.completed && styles.checkboxChecked]}>
              {item.completed && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
          </TouchableOpacity>

          <View style={styles.headerTitleWrap}>
            <Text style={[styles.itemTitle, item.completed && styles.titleCompleted]}>
              {item.title}
            </Text>
            <View style={styles.contactSubRow}>
              <Text style={styles.contactName}>{item.contactName}</Text>
              <Text style={styles.dot}>•</Text>
              <IndustryBadge industry={item.industry} size="small" />
            </View>
          </View>

          <View
            style={[
              styles.priorityBadge,
              item.priority === 'high'
                ? styles.priorityHigh
                : item.priority === 'medium'
                ? styles.priorityMed
                : styles.priorityLow,
            ]}
          >
            <Text
              style={[
                styles.priorityText,
                item.priority === 'high'
                  ? styles.priorityHighText
                  : item.priority === 'medium'
                  ? styles.priorityMedText
                  : styles.priorityLowText,
              ]}
            >
              {item.priority.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={[styles.description, item.completed && styles.textMuted]}>
          {item.description}
        </Text>

        {/* Date and Time Bar */}
        <View style={styles.footerRow}>
          <View style={styles.dueTimePill}>
            <Ionicons
              name="calendar-outline"
              size={13}
              color={isOverdue ? '#DC2626' : isToday ? '#D97706' : '#64748B'}
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.dueTimeText,
                isOverdue ? styles.overdueText : isToday ? styles.todayText : null,
              ]}
            >
              {isToday ? 'Today' : item.dueDate} at {item.dueTime}
            </Text>
          </View>

          {item.isAutomatedWhatsApp && (
            <View style={styles.automatedBadge}>
              <Ionicons name="logo-whatsapp" size={12} color="#059669" style={{ marginRight: 3 }} />
              <Text style={styles.automatedText}>WhatsApp Automation</Text>
            </View>
          )}

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.chatActionBtn}
              onPress={() => handleSendWhatsApp(item)}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-whatsapp" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.chatActionText}>Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteActionBtn}
              onPress={() => handleDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={15} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Google Calendar integration banner */}
      <View style={styles.calendarBanner}>
        <View style={styles.calendarLeft}>
          <Ionicons name="calendar" size={14} color="#2563EB" style={{ marginRight: 6 }} />
          <Text style={styles.calendarText}>
            Google Calendar Sync: <Text style={{ fontWeight: '700' }}>Active ({integrations.googleCalendar.syncedEventsCount} appointments)</Text>
          </Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.tab, filterMode === 'today' && styles.tabActive]}
          onPress={() => setFilterMode('today')}
        >
          <Text style={[styles.tabText, filterMode === 'today' && styles.tabTextActive]}>
            Due Today ({dueTodayCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, filterMode === 'upcoming' && styles.tabActive]}
          onPress={() => setFilterMode('upcoming')}
        >
          <Text style={[styles.tabText, filterMode === 'upcoming' && styles.tabTextActive]}>
            Upcoming ({upcomingCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, filterMode === 'completed' && styles.tabActive]}
          onPress={() => setFilterMode('completed')}
        >
          <Text style={[styles.tabText, filterMode === 'completed' && styles.tabTextActive]}>
            Done
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, filterMode === 'all' && styles.tabActive]}
          onPress={() => setFilterMode('all')}
        >
          <Text style={[styles.tabText, filterMode === 'all' && styles.tabTextActive]}>
            All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Follow-up Items */}
      <FlatList
        data={filteredFollowUps}
        keyExtractor={(item) => item.id}
        renderItem={renderFollowUpCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={54} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySub}>No pending follow-ups in this filter.</Text>
            <TouchableOpacity
              style={styles.emptyAddBtn}
              onPress={() => navigation.navigate('NewFollowUpModal')}
            >
              <Text style={styles.emptyAddText}>+ Schedule Follow-up</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewFollowUpModal')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  calendarBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#DBEAFE',
  },
  calendarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  calendarText: {
    fontSize: 11.5,
    color: '#1E40AF',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#E8F5E9',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#075E54',
    fontWeight: '700',
  },
  listContent: {
    padding: 14,
    paddingBottom: 90,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  cardCompleted: {
    opacity: 0.6,
    backgroundColor: '#F8FAFC',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  checkboxTouch: {
    marginRight: 10,
    marginTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  headerTitleWrap: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  contactSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  dot: {
    marginHorizontal: 5,
    color: '#CBD5E1',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityHigh: {
    backgroundColor: '#FEE2E2',
  },
  priorityHighText: {
    color: '#DC2626',
  },
  priorityMed: {
    backgroundColor: '#FEF3C7',
  },
  priorityMedText: {
    color: '#D97706',
  },
  priorityLow: {
    backgroundColor: '#F1F5F9',
  },
  priorityLowText: {
    color: '#64748B',
  },
  priorityText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  description: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 12,
  },
  textMuted: {
    color: '#94A3B8',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  dueTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueTimeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  todayText: {
    color: '#D97706',
    fontWeight: '700',
  },
  overdueText: {
    color: '#DC2626',
    fontWeight: '700',
  },
  automatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  automatedText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#25D366',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  chatActionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  deleteActionBtn: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 70,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 10,
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  emptyAddBtn: {
    marginTop: 16,
    backgroundColor: '#075E54',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  emptyAddText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12.5,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#075E54',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
});
