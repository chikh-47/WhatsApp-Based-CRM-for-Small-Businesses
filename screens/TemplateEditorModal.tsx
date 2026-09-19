import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCRM } from '../context/CRMContext';
import { IndustryType, MessageTemplate } from '../types/crm';
import { INDUSTRY_LABELS, INDUSTRY_COLORS } from '../lib/mockData';

interface Props {
  navigation: any;
}

export const TemplateEditorModal: React.FC<Props> = ({ navigation }) => {
  const { addTemplate } = useCRM();

  const [title, setTitle] = useState('');
  const [industry, setIndustry] = useState<IndustryType>('real_estate');
  const [category, setCategory] = useState<MessageTemplate['category']>('Follow-up');
  const [shortcut, setShortcut] = useState('');
  const [content, setContent] = useState('');

  const insertVariable = (variable: string) => {
    setContent((prev) => `${prev} {{${variable}}}`);
  };

  const previewText = content
    .replace(/{{name}}/g, 'Marcus Thorne')
    .replace(/{{dealTitle}}/g, 'Skyline Penthouse 34B')
    .replace(/{{date}}/g, 'Tomorrow at 2:00 PM')
    .replace(/{{businessName}}/g, 'Prime WhatsApp CRM');

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Required Field', 'Please enter a template title.');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Required Field', 'Please enter message content.');
      return;
    }

    const cleanShortcut = shortcut.startsWith('/') ? shortcut.trim() : `/${shortcut.trim()}`;

    addTemplate({
      title: title.trim(),
      industry,
      category,
      shortcut: cleanShortcut || '/quick',
      content: content.trim(),
    });

    Alert.alert('Template Created', 'Your custom WhatsApp template is now ready to use!');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create WhatsApp Template</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Industry */}
        <Text style={styles.fieldLabel}>Vertical / Industry *</Text>
        <View style={styles.chipRow}>
          {(['real_estate', 'car_dealership', 'repair_shop', 'boutique'] as IndustryType[]).map((ind) => {
            const isSelected = industry === ind;
            const color = INDUSTRY_COLORS[ind];
            return (
              <TouchableOpacity
                key={ind}
                style={[
                  styles.chip,
                  isSelected && { backgroundColor: color, borderColor: color },
                ]}
                onPress={() => setIndustry(ind)}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                  {INDUSTRY_LABELS[ind]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Title */}
        <Text style={styles.fieldLabel}>Template Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. VIP Price Drop Alert"
          placeholderTextColor="#94A3B8"
          value={title}
          onChangeText={setTitle}
        />

        {/* Category */}
        <Text style={styles.fieldLabel}>Category</Text>
        <View style={styles.chipRow}>
          {(['Greeting', 'Quote', 'Follow-up', 'Confirmation', 'Promo', 'Status Update'] as const).map(
            (cat) => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, isSelected && styles.chipActiveCat]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              );
            }
          )}
        </View>

        {/* Shortcut */}
        <Text style={styles.fieldLabel}>Quick Shortcut (trigger in chat)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. /pricedrop or /review"
          placeholderTextColor="#94A3B8"
          value={shortcut}
          onChangeText={setShortcut}
        />

        {/* Variable Buttons */}
        <Text style={styles.fieldLabel}>Insert Dynamic Customer Variables</Text>
        <View style={styles.varRow}>
          {['name', 'dealTitle', 'date', 'businessName'].map((v) => (
            <TouchableOpacity
              key={v}
              style={styles.varPill}
              onPress={() => insertVariable(v)}
            >
              <Ionicons name="add" size={12} color="#075E54" />
              <Text style={styles.varPillText}>&#123;&#123;{v}&#125;&#125;</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Template Content */}
        <Text style={styles.fieldLabel}>Message Template Text *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Hi {{name}}, we have exciting news regarding {{dealTitle}}! Are you available on {{date}} to discuss?"
          placeholderTextColor="#94A3B8"
          multiline
          value={content}
          onChangeText={setContent}
        />

        {/* Live Preview Bubble */}
        <Text style={styles.previewHeader}>Live WhatsApp Message Preview:</Text>
        <View style={styles.previewBubbleContainer}>
          <View style={styles.previewBubble}>
            <Text style={styles.previewText}>
              {previewText || 'Type template text above to see live variable preview.'}
            </Text>
            <View style={styles.previewTimeRow}>
              <Text style={styles.previewTime}>10:45 AM</Text>
              <Ionicons name="checkmark-done" size={13} color="#34B7F1" style={{ marginLeft: 3 }} />
            </View>
          </View>
        </View>
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
    paddingBottom: 60,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 14,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActiveCat: {
    backgroundColor: '#075E54',
    borderColor: '#075E54',
  },
  chipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  chipTextActive: {
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
  textArea: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  varRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  varPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  varPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#075E54',
  },
  previewHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 18,
    marginBottom: 8,
  },
  previewBubbleContainer: {
    backgroundColor: '#EFEAE2',
    borderRadius: 12,
    padding: 12,
  },
  previewBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#E7FFDB',
    borderRadius: 10,
    borderTopRightRadius: 2,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  previewText: {
    fontSize: 14,
    color: '#111B21',
    lineHeight: 19,
  },
  previewTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  previewTime: {
    fontSize: 10.5,
    color: '#667781',
  },
});
