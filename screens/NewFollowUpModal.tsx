import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCRM } from '../context/CRMContext';
import { Contact } from '../types/crm';

interface Props {
  route?: any;
  navigation: any;
}

export const NewFollowUpModal: React.FC<Props> = ({ route, navigation }) => {
  const { contacts, addFollowUp, templates } = useCRM();
  const preselectedContactId = route?.params?.preselectedContactId;

  const [selectedContactId, setSelectedContactId] = useState<string>(
    preselectedContactId || contacts[0]?.id || ''
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isAutomatedWhatsApp, setIsAutomatedWhatsApp] = useState(true);
  const [selectedDaysOffset, setSelectedDaysOffset] = useState<number>(2);
  const [dueTime, setDueTime] = useState('14:00');

  const selectedContact = contacts.find((c) => c.id === selectedContactId);

  // Compute dueDate based on days offset
  const today = new Date('2026-09-19');
  const targetDate = new Date(today);
  targetDate.setDate(targetDate.getDate() + selectedDaysOffset);
  const dueDateStr = targetDate.toISOString().split('T')[0];

  const handleSave = () => {
    if (!selectedContact) {
      Alert.alert('Selection Error', 'Please select a contact.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please provide a reminder title.');
      return;
    }

    addFollowUp({
      contactId: selectedContact.id,
      contactName: selectedContact.name,
      contactPhone: selectedContact.phone,
      industry: selectedContact.industry,
      dueDate: dueDateStr,
      dueTime,
      title: title.trim(),
      description: description.trim() || `Follow up with ${selectedContact.name} regarding ${selectedContact.dealTitle}.`,
      isAutomatedWhatsApp,
      priority,
    });

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Follow-up</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Contact Selector */}
        <Text style={styles.fieldLabel}>Select Contact *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.contactScroll}>
          {contacts.map((c) => {
            const isSelected = selectedContactId === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[styles.contactCard, isSelected && styles.contactCardSelected]}
                onPress={() => {
                  setSelectedContactId(c.id);
                  if (!title) {
                    setTitle(`Follow up with ${c.name}`);
                  }
                }}
              >
                <Text style={[styles.cName, isSelected && styles.cNameSelected]} numberOfLines={1}>
                  {c.name}
                </Text>
                <Text style={styles.cDeal} numberOfLines={1}>
                  {c.dealTitle}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Title */}
        <Text style={styles.fieldLabel}>Follow-up Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Follow up on property viewing in 2 days"
          placeholderTextColor="#94A3B8"
          value={title}
          onChangeText={setTitle}
        />

        {/* Quick Date Presets */}
        <Text style={styles.fieldLabel}>When should we remind you?</Text>
        <View style={styles.presetRow}>
          {[
            { label: 'Today', days: 0 },
            { label: 'Tomorrow', days: 1 },
            { label: 'In 2 Days', days: 2 },
            { label: 'In 4 Days', days: 4 },
            { label: 'In 1 Week', days: 7 },
          ].map((preset) => {
            const isSelected = selectedDaysOffset === preset.days;
            return (
              <TouchableOpacity
                key={preset.days}
                style={[styles.presetChip, isSelected && styles.presetChipActive]}
                onPress={() => setSelectedDaysOffset(preset.days)}
              >
                <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.dateCalculatedNotice}>
          Scheduled for: <Text style={{ fontWeight: '700', color: '#0F172A' }}>{dueDateStr} at {dueTime}</Text>
        </Text>

        {/* Time Selector Presets */}
        <Text style={styles.fieldLabel}>Preferred Time</Text>
        <View style={styles.timeRow}>
          {['09:00', '11:00', '14:00', '16:30', '18:00'].map((time) => {
            const isSelected = dueTime === time;
            return (
              <TouchableOpacity
                key={time}
                style={[styles.timeChip, isSelected && styles.timeChipActive]}
                onPress={() => setDueTime(time)}
              >
                <Text style={[styles.timeText, isSelected && styles.timeTextActive]}>{time}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Priority */}
        <Text style={styles.fieldLabel}>Priority Level</Text>
        <View style={styles.priorityRow}>
          {(['low', 'medium', 'high'] as const).map((p) => {
            const isSelected = priority === p;
            return (
              <TouchableOpacity
                key={p}
                style={[styles.pChip, isSelected && styles.pChipActive]}
                onPress={() => setPriority(p)}
              >
                <Text style={[styles.pText, isSelected && styles.pTextActive]}>
                  {p.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Automated WhatsApp Toggle */}
        <View style={styles.toggleRow}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <View style={styles.waRowTitle}>
              <Ionicons name="logo-whatsapp" size={16} color="#25D366" style={{ marginRight: 6 }} />
              <Text style={styles.waTitle}>Automated WhatsApp Follow-Up</Text>
            </View>
            <Text style={styles.waSub}>
              Prepares or schedules the WhatsApp reminder template automatically.
            </Text>
          </View>
          <Switch
            value={isAutomatedWhatsApp}
            onValueChange={setIsAutomatedWhatsApp}
            trackColor={{ false: '#CBD5E1', true: '#86EFAC' }}
            thumbColor={isAutomatedWhatsApp ? '#16A34A' : '#F1F5F9'}
          />
        </View>

        {/* Notes / Instructions */}
        <Text style={styles.fieldLabel}>Notes & Instructions</Text>
        <TextInput
          style={[styles.input, { minHeight: 80 }]}
          placeholder="e.g. Ask if they need the HOA disclosure documents sent before Saturday."
          placeholderTextColor="#94A3B8"
          multiline
          value={description}
          onChangeText={setDescription}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  saveBtn: {
    backgroundColor: '#075E54',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  content: {
    padding: 16,
    paddingBottom: 50,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 14,
    marginBottom: 6,
  },
  contactScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  contactCard: {
    width: 140,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contactCardSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  cName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  cNameSelected: {
    color: '#065F46',
  },
  cDeal: {
    fontSize: 11,
    color: '#64748B',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  presetChipActive: {
    backgroundColor: '#075E54',
    borderColor: '#075E54',
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  presetTextActive: {
    color: '#FFFFFF',
  },
  dateCalculatedNotice: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  timeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  timeChipActive: {
    backgroundColor: '#075E54',
    borderColor: '#075E54',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  timeTextActive: {
    color: '#FFFFFF',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  pChipActive: {
    backgroundColor: '#075E54',
    borderColor: '#075E54',
  },
  pText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  pTextActive: {
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginTop: 16,
  },
  waRowTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  waTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  waSub: {
    fontSize: 11,
    color: '#047857',
  },
});
