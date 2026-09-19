import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCRM } from '../context/CRMContext';
import { IndustryType } from '../types/crm';
import { STAGE_DEFINITIONS, INDUSTRY_LABELS, INDUSTRY_COLORS } from '../lib/mockData';

interface Props {
  navigation: any;
}

export const NewContactModal: React.FC<Props> = ({ navigation }) => {
  const { addContact } = useCRM();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [industry, setIndustry] = useState<IndustryType>('real_estate');
  const [dealTitle, setDealTitle] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['WhatsApp Inbound', 'Hot Lead']);
  const [source, setSource] = useState<'WhatsApp QR' | 'Instagram Ad' | 'Website Widget' | 'Walk-in' | 'Referral'>('WhatsApp QR');

  const industryStages = STAGE_DEFINITIONS.filter((s) => s.industry === industry);
  const [selectedStageId, setSelectedStageId] = useState<string>(industryStages[0]?.id || 're_new_inquiry');

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    if (!tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please provide a contact name.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Required Field', 'Please provide a WhatsApp phone number.');
      return;
    }

    const numericDealValue = parseFloat(dealValue.replace(/[^0-9.]/g, '')) || 0;

    // Build reasonable custom fields according to industry
    const customFields: Record<string, string> = {};
    if (industry === 'real_estate') {
      customFields['Property Type'] = 'Inquiry';
      customFields['Target Budget'] = `$${numericDealValue.toLocaleString()}`;
    } else if (industry === 'car_dealership') {
      customFields['Desired Vehicle'] = dealTitle || 'Vehicle Inquiry';
      customFields['Financing Requested'] = 'Yes';
    } else if (industry === 'repair_shop') {
      customFields['Service Requested'] = dealTitle || 'General Inspection';
    } else {
      customFields['Preferred Styling'] = dealTitle || 'Custom Outfit';
    }

    addContact({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@client.com`,
      industry,
      stageId: selectedStageId || industryStages[0]?.id,
      dealTitle: dealTitle.trim() || `${INDUSTRY_LABELS[industry]} Opportunity`,
      dealValue: numericDealValue,
      assignedTo: 'team_1',
      tags,
      customFields,
      source,
    });

    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New WhatsApp Lead</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Industry Selector */}
        <Text style={styles.fieldLabel}>Business Vertical / Industry *</Text>
        <View style={styles.industryRow}>
          {(['real_estate', 'car_dealership', 'repair_shop', 'boutique'] as IndustryType[]).map((ind) => {
            const isSelected = industry === ind;
            const color = INDUSTRY_COLORS[ind];
            return (
              <TouchableOpacity
                key={ind}
                style={[
                  styles.industryChip,
                  isSelected && { backgroundColor: color, borderColor: color },
                ]}
                onPress={() => {
                  setIndustry(ind);
                  const newStages = STAGE_DEFINITIONS.filter((s) => s.industry === ind);
                  if (newStages[0]) setSelectedStageId(newStages[0].id);
                }}
              >
                <Text style={[styles.industryChipText, isSelected && styles.industryChipTextActive]}>
                  {INDUSTRY_LABELS[ind]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Basic Info */}
        <Text style={styles.fieldLabel}>Contact Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. David Sterling"
          placeholderTextColor="#94A3B8"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.fieldLabel}>WhatsApp Phone Number *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. +1 (555) 345-6789"
          placeholderTextColor="#94A3B8"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.fieldLabel}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. david@sample.com"
          placeholderTextColor="#94A3B8"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {/* Deal Info */}
        <Text style={styles.fieldLabel}>Opportunity / Deal Title</Text>
        <TextInput
          style={styles.input}
          placeholder={
            industry === 'real_estate'
              ? 'e.g. 2-Bed Waterfront Condo'
              : industry === 'car_dealership'
              ? 'e.g. 2024 BMW M4 Competition'
              : industry === 'repair_shop'
              ? 'e.g. Suspension Overhaul & Alignment'
              : 'e.g. Custom Velvet Tuxedo Fitting'
          }
          placeholderTextColor="#94A3B8"
          value={dealTitle}
          onChangeText={setDealTitle}
        />

        <Text style={styles.fieldLabel}>Estimated Deal Value ($)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 25000"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          value={dealValue}
          onChangeText={setDealValue}
        />

        {/* Initial Pipeline Stage */}
        <Text style={styles.fieldLabel}>Initial Pipeline Stage</Text>
        <View style={styles.stagePickerContainer}>
          {industryStages.map((stage) => {
            const isSelected = selectedStageId === stage.id;
            return (
              <TouchableOpacity
                key={stage.id}
                style={[
                  styles.stageOption,
                  isSelected && { borderColor: stage.color, backgroundColor: `${stage.color}15` },
                ]}
                onPress={() => setSelectedStageId(stage.id)}
              >
                <View style={[styles.stageDot, { backgroundColor: stage.color }]} />
                <Text style={[styles.stageText, isSelected && { color: stage.color, fontWeight: '700' }]}>
                  {stage.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Lead Source */}
        <Text style={styles.fieldLabel}>Lead Source</Text>
        <View style={styles.sourceRow}>
          {(['WhatsApp QR', 'Instagram Ad', 'Website Widget', 'Walk-in', 'Referral'] as const).map((src) => {
            const isSelected = source === src;
            return (
              <TouchableOpacity
                key={src}
                style={[styles.sourceChip, isSelected && styles.sourceChipActive]}
                onPress={() => setSource(src)}
              >
                <Text style={[styles.sourceText, isSelected && styles.sourceTextActive]}>{src}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tags */}
        <Text style={styles.fieldLabel}>Tags</Text>
        <View style={styles.tagsInputRow}>
          <TextInput
            style={styles.tagInput}
            placeholder="Add a tag (e.g. Cash Buyer, VIP)"
            placeholderTextColor="#94A3B8"
            value={tagInput}
            onChangeText={setTagInput}
            onSubmitEditing={handleAddTag}
          />
          <TouchableOpacity style={styles.addTagBtn} onPress={handleAddTag}>
            <Text style={styles.addTagText}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tagsPillContainer}>
          {tags.map((t) => (
            <TouchableOpacity key={t} style={styles.tagPill} onPress={() => handleRemoveTag(t)}>
              <Text style={styles.tagPillText}>{t}</Text>
              <Ionicons name="close-circle" size={14} color="#64748B" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  industryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  industryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  industryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  industryChipTextActive: {
    color: '#FFFFFF',
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
  stagePickerContainer: {
    gap: 6,
  },
  stageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  stageText: {
    fontSize: 13,
    color: '#334155',
  },
  sourceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sourceChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sourceChipActive: {
    backgroundColor: '#075E54',
    borderColor: '#075E54',
  },
  sourceText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#475569',
  },
  sourceTextActive: {
    color: '#FFFFFF',
  },
  tagsInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tagInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  addTagBtn: {
    backgroundColor: '#075E54',
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTagText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  tagsPillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  tagPillText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
});
