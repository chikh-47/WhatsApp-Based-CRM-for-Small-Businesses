import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCRM } from '../context/CRMContext';
import { STAGE_DEFINITIONS } from '../lib/mockData';
import { IndustryBadge } from '../components/IndustryBadge';
import { StageBadge } from '../components/StageBadge';

interface Props {
  route: any;
  navigation: any;
}

export const ContactDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { contactId } = route.params;
  const { contacts, moveContactStage, addContactNote, deleteContact } = useCRM();

  const [newNoteText, setNewNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  const contact = contacts.find((c) => c.id === contactId);

  if (!contact) {
    return (
      <View style={styles.centerContainer}>
        <Text>Contact not found.</Text>
      </View>
    );
  }

  const stagesForIndustry = STAGE_DEFINITIONS.filter(
    (s) => s.industry === contact.industry
  ).sort((a, b) => a.order - b.order);

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    addContactNote(contact.id, newNoteText.trim());
    setNewNoteText('');
    setIsAddingNote(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'GDPR / CCPA Data Erasure',
      `Permanently delete ${contact.name} and all linked WhatsApp transcripts and records?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: () => {
            deleteContact(contact.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Top Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileTopRow}>
          {contact.avatar ? (
            <Image source={{ uri: contact.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.fallbackAvatar]}>
              <Text style={styles.fallbackAvatarText}>{contact.name.charAt(0)}</Text>
            </View>
          )}

          <View style={styles.profileInfo}>
            <Text style={styles.contactName}>{contact.name}</Text>
            <Text style={styles.dealValue}>${contact.dealValue.toLocaleString()}</Text>
            <Text style={styles.dealTitle}>{contact.dealTitle}</Text>
          </View>
        </View>

        <View style={styles.contactMetaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="call" size={13} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={styles.metaText}>{contact.phone}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="mail" size={13} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={styles.metaText}>{contact.email}</Text>
          </View>
        </View>

        <View style={styles.badgesRow}>
          <IndustryBadge industry={contact.industry} size="medium" />
          <View style={{ width: 8 }} />
          <StageBadge stageId={contact.stageId} />
        </View>

        {/* Quick action strip */}
        <View style={styles.quickActionStrip}>
          <TouchableOpacity
            style={styles.actionButtonWhatsApp}
            onPress={() => navigation.navigate('ChatDetail', { contactId: contact.id })}
          >
            <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.actionButtonWhatsAppText}>WhatsApp Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButtonSecondary}
            onPress={() => Alert.alert('Phone Call', `Calling ${contact.name} at ${contact.phone}`)}
          >
            <Ionicons name="call-outline" size={18} color="#075E54" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButtonSecondary}
            onPress={() =>
              navigation.navigate('NewFollowUpModal', { preselectedContactId: contact.id })
            }
          >
            <Ionicons name="alarm-outline" size={18} color="#075E54" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Pipeline Stage Tracker */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Sales Pipeline Progression</Text>
        <Text style={styles.sectionSub}>Tap any stage to advance this lead immediately:</Text>
        <View style={styles.stageTrackerContainer}>
          {stagesForIndustry.map((stg, index) => {
            const isCurrent = contact.stageId === stg.id;
            return (
              <TouchableOpacity
                key={stg.id}
                style={[
                  styles.stageStepItem,
                  isCurrent && { borderColor: stg.color, backgroundColor: `${stg.color}15` },
                ]}
                onPress={() => moveContactStage(contact.id, stg.id)}
              >
                <View style={[styles.stageStepNumber, { backgroundColor: isCurrent ? stg.color : '#CBD5E1' }]}>
                  <Text style={styles.stageStepNumText}>{index + 1}</Text>
                </View>
                <Text style={[styles.stageStepLabel, isCurrent && { color: stg.color, fontWeight: '700' }]}>
                  {stg.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Industry Custom Fields */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Industry Specifications</Text>
          <Text style={styles.industryTagLabel}>{contact.industry.replace('_', ' ').toUpperCase()}</Text>
        </View>
        <View style={styles.customFieldsList}>
          {Object.entries(contact.customFields || {}).map(([key, val]) => (
            <View key={key} style={styles.customFieldRow}>
              <Text style={styles.customFieldKey}>{key}</Text>
              <Text style={styles.customFieldValue}>{val}</Text>
            </View>
          ))}
          <View style={styles.customFieldRow}>
            <Text style={styles.customFieldKey}>Lead Source</Text>
            <Text style={styles.customFieldValue}>{contact.source}</Text>
          </View>
          <View style={styles.customFieldRow}>
            <Text style={styles.customFieldKey}>First Logged Date</Text>
            <Text style={styles.customFieldValue}>{contact.createdAt}</Text>
          </View>
        </View>
      </View>

      {/* Internal Team Notes (Private CRM Notes) */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeader}>Internal Team Notes</Text>
          <TouchableOpacity
            style={styles.addNoteToggleBtn}
            onPress={() => setIsAddingNote(!isAddingNote)}
          >
            <Ionicons name={isAddingNote ? 'close' : 'add'} size={16} color="#075E54" />
            <Text style={styles.addNoteToggleText}>{isAddingNote ? 'Cancel' : 'Add Note'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.privateNotesNotice}>
          🔒 Private to your team. Never visible to WhatsApp contact.
        </Text>

        {isAddingNote && (
          <View style={styles.noteInputCard}>
            <TextInput
              style={styles.noteTextInput}
              placeholder="Write an internal team note (e.g. buyer budget flex, inspection findings)..."
              placeholderTextColor="#94A3B8"
              value={newNoteText}
              onChangeText={setNewNoteText}
              multiline
            />
            <TouchableOpacity style={styles.saveNoteBtn} onPress={handleAddNote}>
              <Text style={styles.saveNoteBtnText}>Save Internal Note</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.notesList}>
          {contact.notes && contact.notes.length > 0 ? (
            contact.notes.map((note) => (
              <View key={note.id} style={styles.noteItem}>
                <View style={styles.noteHeader}>
                  <Text style={styles.noteAuthor}>{note.authorName}</Text>
                  <Text style={styles.noteTime}>{note.timestamp}</Text>
                </View>
                <Text style={styles.noteBody}>{note.text}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noNotesText}>No internal notes logged yet.</Text>
          )}
        </View>
      </View>

      {/* GDPR / CCPA Security & Erasure */}
      <View style={[styles.sectionCard, styles.dangerCard]}>
        <Text style={styles.dangerHeader}>Privacy, Compliance & Data Security</Text>
        <Text style={styles.dangerSub}>
          E2EE WhatsApp logs stored in compliance with GDPR and CCPA. Customers have right of data portability and erasure.
        </Text>
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={16} color="#DC2626" style={{ marginRight: 6 }} />
          <Text style={styles.deleteBtnText}>Erase Customer Record (GDPR)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 14,
    paddingBottom: 60,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
  },
  fallbackAvatar: {
    backgroundColor: '#075E54',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackAvatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  dealValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
    marginTop: 2,
  },
  dealTitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  contactMetaRow: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 10,
    marginBottom: 10,
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#475569',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  quickActionStrip: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonWhatsApp: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366',
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionButtonWhatsAppText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  actionButtonSecondary: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
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
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  industryTagLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#075E54',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sectionSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 12,
  },
  stageTrackerContainer: {
    gap: 8,
  },
  stageStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stageStepNumber: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  stageStepNumText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  stageStepLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  customFieldsList: {
    gap: 8,
    marginTop: 6,
  },
  customFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  customFieldKey: {
    fontSize: 12.5,
    color: '#64748B',
    fontWeight: '500',
  },
  customFieldValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'right',
  },
  privateNotesNotice: {
    fontSize: 11,
    color: '#D97706',
    backgroundColor: '#FEF3C7',
    padding: 6,
    borderRadius: 6,
    marginBottom: 10,
  },
  addNoteToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  addNoteToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#075E54',
    marginLeft: 2,
  },
  noteInputCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  noteTextInput: {
    fontSize: 13,
    color: '#1E293B',
    minHeight: 60,
  },
  saveNoteBtn: {
    backgroundColor: '#D97706',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveNoteBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  notesList: {
    gap: 8,
  },
  noteItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#075E54',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  noteAuthor: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  noteTime: {
    fontSize: 10,
    color: '#94A3B8',
  },
  noteBody: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 17,
  },
  noNotesText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  dangerCard: {
    borderColor: '#FEE2E2',
    borderWidth: 1,
    backgroundColor: '#FEF2F2',
  },
  dangerHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
    marginBottom: 4,
  },
  dangerSub: {
    fontSize: 11.5,
    color: '#7F1D1D',
    marginBottom: 12,
    lineHeight: 16,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
});
