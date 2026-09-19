import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCRM } from '../context/CRMContext';
import { IndustryType, Contact } from '../types/crm';
import { IndustryBadge } from '../components/IndustryBadge';
import { StageBadge } from '../components/StageBadge';

interface Props {
  navigation: any;
}

export const ContactsScreen: React.FC<Props> = ({ navigation }) => {
  const { contacts, exportContactsCSV, integrations, syncIntegrationsNow, isSyncing } = useCRM();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType | 'all'>('all');
  const [showExportModal, setShowExportModal] = useState(false);
  const [copiedCsv, setCopiedCsv] = useState(false);

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      if (selectedIndustry !== 'all' && c.industry !== selectedIndustry) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          c.name.toLowerCase().includes(query) ||
          c.phone.includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.dealTitle.toLowerCase().includes(query) ||
          c.tags.some((t) => t.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [contacts, selectedIndustry, searchQuery]);

  const csvContent = useMemo(() => exportContactsCSV(), [contacts]);

  const handleCopyCsv = () => {
    setCopiedCsv(true);
    setTimeout(() => setCopiedCsv(false), 2500);
    Alert.alert('Data Export Ready', 'Customer contacts CSV copied to clipboard and ready to open in Excel / Google Sheets.');
  };

  const renderContactCard = ({ item }: { item: Contact }) => {
    return (
      <TouchableOpacity
        style={styles.contactCard}
        onPress={() => navigation.navigate('ContactDetail', { contactId: item.id })}
        activeOpacity={0.7}
      >
        <View style={styles.cardTop}>
          {item.avatar ? (
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.fallbackAvatar]}>
              <Text style={styles.fallbackAvatarText}>{item.name.charAt(0)}</Text>
            </View>
          )}

          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.contactName}>{item.name}</Text>
              <Text style={styles.dealPrice}>${item.dealValue.toLocaleString()}</Text>
            </View>
            <Text style={styles.dealTitle} numberOfLines={1}>
              {item.dealTitle}
            </Text>
            <View style={styles.contactDetailsRow}>
              <Text style={styles.phoneText}>{item.phone}</Text>
              <Text style={styles.dotSeparator}>•</Text>
              <Text style={styles.emailText} numberOfLines={1}>{item.email}</Text>
            </View>
          </View>
        </View>

        <View style={styles.badgesRow}>
          <IndustryBadge industry={item.industry} size="small" />
          <View style={{ width: 6 }} />
          <StageBadge stageId={item.stageId} />
        </View>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, idx) => (
            <View key={idx} style={styles.tagPill}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {/* Quick action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionBtnWhatsApp}
            onPress={() => navigation.navigate('ChatDetail', { contactId: item.id })}
          >
            <Ionicons name="logo-whatsapp" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.actionBtnWhatsAppText}>WhatsApp Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnCall}
            onPress={() => Alert.alert('Initiate Call', `Calling ${item.name} at ${item.phone}`)}
          >
            <Ionicons name="call-outline" size={15} color="#075E54" style={{ marginRight: 4 }} />
            <Text style={styles.actionBtnCallText}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnDetails}
            onPress={() => navigation.navigate('ContactDetail', { contactId: item.id })}
          >
            <Ionicons name="chevron-forward" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Sync & Data Status Bar */}
      <View style={styles.syncBar}>
        <View style={styles.syncLeft}>
          <Ionicons name="cloud-done-outline" size={14} color="#059669" style={{ marginRight: 4 }} />
          <Text style={styles.syncStatusText}>
            Google Contacts: <Text style={{ fontWeight: '700' }}>Synced</Text> ({integrations.googleContacts.lastSync})
          </Text>
        </View>
        <TouchableOpacity
          style={styles.exportBtn}
          onPress={() => setShowExportModal(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="download-outline" size={13} color="#075E54" style={{ marginRight: 4 }} />
          <Text style={styles.exportBtnText}>Export Excel</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Add section */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color="#64748B" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts, phones, emails, tags..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('NewContactModal')}
          activeOpacity={0.8}
        >
          <Ionicons name="person-add" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <View style={styles.industryFilters}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}
          data={[
            { id: 'all', label: 'All (8)' },
            { id: 'real_estate', label: 'Real Estate' },
            { id: 'car_dealership', label: 'Car Dealership' },
            { id: 'repair_shop', label: 'Repair Shop' },
            { id: 'boutique', label: 'Boutique' },
          ]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = selectedIndustry === item.id;
            return (
              <TouchableOpacity
                style={[styles.filterChip, isSelected && styles.filterChipActive]}
                onPress={() => setSelectedIndustry(item.id as any)}
              >
                <Text style={[styles.filterChipText, isSelected && styles.filterChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Contacts List */}
      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContactCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No contacts found</Text>
            <Text style={styles.emptySubtitle}>Try clearing the search query or adding a new lead.</Text>
          </View>
        }
      />

      {/* CSV / Excel Export Modal */}
      <Modal visible={showExportModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.exportModalCard}>
            <View style={styles.exportHeader}>
              <View>
                <Text style={styles.exportTitle}>Export Contacts to Excel / CSV</Text>
                <Text style={styles.exportSubtitle}>
                  Compatible with Microsoft Excel, Google Contacts & Sheets.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowExportModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.exportStatsBox}>
              <View style={styles.statBoxItem}>
                <Text style={styles.statBoxNum}>{contacts.length}</Text>
                <Text style={styles.statBoxLabel}>Total Records</Text>
              </View>
              <View style={styles.statBoxItem}>
                <Text style={styles.statBoxNum}>10</Text>
                <Text style={styles.statBoxLabel}>Columns / Fields</Text>
              </View>
              <View style={styles.statBoxItem}>
                <Text style={styles.statBoxNum}>UTF-8</Text>
                <Text style={styles.statBoxLabel}>Encoding</Text>
              </View>
            </View>

            <Text style={styles.previewLabel}>CSV Preview (Top rows):</Text>
            <View style={styles.csvPreviewContainer}>
              <Text style={styles.csvPreviewText} numberOfLines={10}>
                {csvContent}
              </Text>
            </View>

            <View style={styles.exportActionsRow}>
              <TouchableOpacity
                style={styles.copyCsvBtn}
                onPress={handleCopyCsv}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={copiedCsv ? 'checkmark-circle' : 'copy-outline'}
                  size={16}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.copyCsvBtnText}>
                  {copiedCsv ? 'Copied to Clipboard!' : 'Copy CSV Data'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.doneExportBtn}
                onPress={() => setShowExportModal(false)}
              >
                <Text style={styles.doneExportBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  syncBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#A7F3D0',
  },
  syncLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  syncStatusText: {
    fontSize: 11,
    color: '#065F46',
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6EE7B7',
  },
  exportBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#075E54',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 10,
    backgroundColor: '#FFFFFF',
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
    fontSize: 13.5,
    color: '#0F172A',
    paddingVertical: 0,
  },
  addBtn: {
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
  industryFilters: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 8,
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
    padding: 14,
    paddingBottom: 80,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  fallbackAvatar: {
    backgroundColor: '#075E54',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  dealPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  dealTitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
    marginBottom: 3,
  },
  contactDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneText: {
    fontSize: 11,
    color: '#475569',
  },
  dotSeparator: {
    marginHorizontal: 5,
    color: '#CBD5E1',
    fontSize: 10,
  },
  emailText: {
    fontSize: 11,
    color: '#64748B',
    flex: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tagPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10.5,
    color: '#475569',
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
  },
  actionBtnWhatsApp: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnWhatsAppText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12.5,
  },
  actionBtnCall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  actionBtnCallText: {
    color: '#075E54',
    fontWeight: '700',
    fontSize: 12,
  },
  actionBtnDetails: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  exportModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    maxHeight: '85%',
  },
  exportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  exportTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  exportSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  exportStatsBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statBoxItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBoxNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#075E54',
  },
  statBoxLabel: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 2,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  csvPreviewContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    maxHeight: 140,
  },
  csvPreviewText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 10,
    color: '#34D399',
    lineHeight: 14,
  },
  exportActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  copyCsvBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#075E54',
    paddingVertical: 12,
    borderRadius: 10,
  },
  copyCsvBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  doneExportBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneExportBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
});
