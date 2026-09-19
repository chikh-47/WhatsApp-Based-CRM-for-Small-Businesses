import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCRM } from '../context/CRMContext';
import { IndustryType, Contact } from '../types/crm';
import { IndustryBadge } from '../components/IndustryBadge';
import { StageBadge } from '../components/StageBadge';
import { WhatsAppConnectionBanner } from '../components/WhatsAppConnectionBanner';

interface Props {
  navigation: any;
}

export const ChatsScreen: React.FC<Props> = ({ navigation }) => {
  const { contacts, messages, activeIndustry, setActiveIndustry, markMessagesAsRead } = useCRM();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unread' | IndustryType>('all');

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      // Industry or unread filter
      if (filterMode === 'unread' && contact.unreadCount === 0) return false;
      if (filterMode !== 'all' && filterMode !== 'unread' && contact.industry !== filterMode) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = contact.name.toLowerCase().includes(query);
        const matchesPhone = contact.phone.includes(query);
        const matchesDeal = contact.dealTitle.toLowerCase().includes(query);
        const matchesTag = contact.tags.some((t) => t.toLowerCase().includes(query));
        return matchesName || matchesPhone || matchesDeal || matchesTag;
      }
      return true;
    });
  }, [contacts, filterMode, searchQuery]);

  const totalUnread = contacts.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const handleOpenChat = (contact: Contact) => {
    markMessagesAsRead(contact.id);
    navigation.navigate('ChatDetail', { contactId: contact.id });
  };

  const renderChatItem = ({ item }: { item: Contact }) => {
    const chatHistory = messages[item.id] || [];
    const lastMsg = chatHistory[chatHistory.length - 1];
    const isBusinessLastSender = lastMsg?.sender === 'business';

    return (
      <TouchableOpacity
        style={styles.chatCard}
        onPress={() => handleOpenChat(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} contentFit="cover" />
          ) : (
            <View style={[styles.avatar, styles.fallbackAvatar]}>
              <Text style={styles.fallbackAvatarText}>{item.name.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.onlineDot} />
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatHeaderRow}>
            <Text style={styles.contactName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.timeText, item.unreadCount > 0 && styles.unreadTimeText]}>
              {item.lastMessageTime}
            </Text>
          </View>

          <View style={styles.dealRow}>
            <Text style={styles.dealTitle} numberOfLines={1}>
              {item.dealTitle}
            </Text>
            <Text style={styles.dealValue}>${item.dealValue.toLocaleString()}</Text>
          </View>

          <View style={styles.messageRow}>
            <View style={styles.previewContainer}>
              {isBusinessLastSender && (
                <Ionicons
                  name="checkmark-done"
                  size={14}
                  color={lastMsg?.status === 'read' ? '#34B7F1' : '#94A3B8'}
                  style={{ marginRight: 3 }}
                />
              )}
              <Text
                style={[styles.lastMessageText, item.unreadCount > 0 && styles.unreadMessageText]}
                numberOfLines={1}
              >
                {item.lastMessageText}
              </Text>
            </View>

            {item.unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>

          <View style={styles.badgeRow}>
            <IndustryBadge industry={item.industry} size="small" />
            <View style={{ width: 6 }} />
            <StageBadge stageId={item.stageId} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <WhatsAppConnectionBanner />

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={17} color="#64748B" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats, deals, phones, tags..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.newChatBtn}
          onPress={() => navigation.navigate('NewContactModal')}
          activeOpacity={0.8}
        >
          <Ionicons name="person-add" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filter Chips Horizontal Scroll */}
      <View style={styles.filterBar}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          data={[
            { id: 'all', label: 'All Leads' },
            { id: 'unread', label: `Unread (${totalUnread})` },
            { id: 'real_estate', label: 'Real Estate' },
            { id: 'car_dealership', label: 'Auto' },
            { id: 'repair_shop', label: 'Repair' },
            { id: 'boutique', label: 'Boutique' },
          ]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = filterMode === item.id;
            return (
              <TouchableOpacity
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setFilterMode(item.id as any)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Conversation List */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No WhatsApp chats found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your filter or start a new WhatsApp conversation.</Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => navigation.navigate('NewContactModal')}
            >
              <Text style={styles.emptyActionText}>+ New WhatsApp Lead</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewContactModal')}
        activeOpacity={0.85}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  newChatBtn: {
    backgroundColor: '#075E54',
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#075E54',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  filterBar: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#075E54',
    borderColor: '#075E54',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingBottom: 90,
  },
  separator: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 78,
  },
  chatCard: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E2E8F0',
  },
  fallbackAvatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#128C7E',
  },
  fallbackAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#25D366',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatInfo: {
    flex: 1,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
  },
  unreadTimeText: {
    color: '#25D366',
    fontWeight: '700',
  },
  dealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  dealTitle: {
    fontSize: 12,
    color: '#64748B',
    flex: 1,
    marginRight: 8,
  },
  dealValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  lastMessageText: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
  },
  unreadMessageText: {
    color: '#0F172A',
    fontWeight: '600',
  },
  unreadBadge: {
    backgroundColor: '#25D366',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  emptyActionBtn: {
    marginTop: 16,
    backgroundColor: '#075E54',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
});
