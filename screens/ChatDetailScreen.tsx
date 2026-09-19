import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCRM } from '../context/CRMContext';
import { STAGE_DEFINITIONS } from '../lib/mockData';
import { StageBadge } from '../components/StageBadge';
import { IndustryBadge } from '../components/IndustryBadge';
import { MessageTemplate, WhatsAppMessage } from '../types/crm';

interface Props {
  route: any;
  navigation: any;
}

export const ChatDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { contactId } = route.params;
  const { contacts, messages, templates, sendMessage, moveContactStage } = useCRM();

  const contact = contacts.find((c) => c.id === contactId);
  const chatMessages = messages[contactId] || [];

  const [inputText, setInputText] = useState('');
  const [showStagePicker, setShowStagePicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Industry-specific templates
  const relevantTemplates = templates.filter(
    (t) => t.industry === contact?.industry || t.industry === 'all'
  );

  const resolveTemplateVariables = (rawText: string): string => {
    if (!contact) return rawText;
    return rawText
      .replace(/{{name}}/g, contact.name)
      .replace(/{{dealTitle}}/g, contact.dealTitle)
      .replace(/{{date}}/g, 'tomorrow at 2:00 PM')
      .replace(/{{businessName}}/g, 'Prime WhatsApp CRM');
  };

  const handleApplyTemplate = (tmpl: MessageTemplate) => {
    const resolved = resolveTemplateVariables(tmpl.content);
    setInputText(resolved);
    setShowTemplateModal(false);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(contactId, inputText.trim());
    setInputText('');
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendAttachment = (type: 'document' | 'image', title: string, caption: string) => {
    setShowAttachmentMenu(false);
    sendMessage(contactId, caption, {
      hasAttachment: true,
      attachmentType: type,
      attachmentTitle: title,
    });
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  if (!contact) {
    return (
      <View style={styles.centerContainer}>
        <Text>Contact not found.</Text>
      </View>
    );
  }

  const stagesForIndustry = STAGE_DEFINITIONS.filter(
    (s) => s.industry === contact.industry
  );

  const renderMessageBubble = ({ item }: { item: WhatsAppMessage }) => {
    if (item.sender === 'system') {
      return (
        <View style={styles.systemBubble}>
          <Ionicons name="lock-closed" size={11} color="#64748B" style={{ marginRight: 4 }} />
          <Text style={styles.systemText}>{item.text}</Text>
        </View>
      );
    }

    const isBusiness = item.sender === 'business';
    const timeFormatted = new Date(item.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View
        style={[
          styles.messageRowWrapper,
          isBusiness ? styles.rowBusiness : styles.rowCustomer,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isBusiness ? styles.businessBubble : styles.customerBubble,
          ]}
        >
          {/* Document / Media attachment card */}
          {item.hasAttachment && (
            <View style={styles.attachmentCard}>
              <View style={styles.attachmentIconBox}>
                <Ionicons
                  name={item.attachmentType === 'document' ? 'document-text' : 'image'}
                  size={24}
                  color="#075E54"
                />
              </View>
              <View style={styles.attachmentDetails}>
                <Text style={styles.attachmentTitle} numberOfLines={1}>
                  {item.attachmentTitle || 'Attachment'}
                </Text>
                <Text style={styles.attachmentSub}>WhatsApp E2EE Document</Text>
              </View>
              <TouchableOpacity
                onPress={() => Alert.alert('Attachment Preview', `Simulating download of ${item.attachmentTitle}`)}
              >
                <Ionicons name="cloud-download-outline" size={20} color="#075E54" />
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.messageText}>{item.text}</Text>

          <View style={styles.bubbleMeta}>
            <Text style={styles.messageTime}>{timeFormatted}</Text>
            {isBusiness && (
              <Ionicons
                name="checkmark-done"
                size={14}
                color={item.status === 'read' ? '#34B7F1' : '#94A3B8'}
                style={{ marginLeft: 3 }}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Sticky Header with Deal & Stage Bar */}
      <View style={styles.dealBar}>
        <View style={styles.dealBarLeft}>
          <View style={styles.dealTitleRow}>
            <Text style={styles.dealBarTitle} numberOfLines={1}>
              {contact.dealTitle}
            </Text>
            <Text style={styles.dealBarValue}>${contact.dealValue.toLocaleString()}</Text>
          </View>
          <View style={styles.dealBarBadges}>
            <IndustryBadge industry={contact.industry} size="small" />
            <View style={{ width: 6 }} />
            <TouchableOpacity onPress={() => setShowStagePicker(true)} activeOpacity={0.7}>
              <View style={styles.stageButton}>
                <StageBadge stageId={contact.stageId} />
                <Ionicons name="chevron-down" size={13} color="#475569" style={{ marginLeft: 2 }} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.crmDossierBtn}
          onPress={() => navigation.navigate('ContactDetail', { contactId: contact.id })}
          activeOpacity={0.8}
        >
          <Ionicons name="person-circle-outline" size={16} color="#075E54" style={{ marginRight: 4 }} />
          <Text style={styles.crmDossierText}>CRM Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Messages Feed */}
      <FlatList
        ref={flatListRef}
        data={chatMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageBubble}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Quick Templates Drawer Strip */}
      <View style={styles.quickTemplateBar}>
        <View style={styles.quickTemplateLabelRow}>
          <Ionicons name="flash-outline" size={13} color="#075E54" />
          <Text style={styles.quickTemplateHeader}>Quick Templates</Text>
          <TouchableOpacity
            style={styles.allTemplatesBtn}
            onPress={() => setShowTemplateModal(true)}
          >
            <Text style={styles.allTemplatesText}>Browse All ({relevantTemplates.length})</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={relevantTemplates}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.quickTemplateScroll}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.templateChip}
              onPress={() => handleApplyTemplate(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.templateShortcut}>{item.shortcut}</Text>
              <Text style={styles.templateTitle} numberOfLines={1}>
                {item.title}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Chat Input Bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setShowAttachmentMenu(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="attach" size={24} color="#54656F" />
        </TouchableOpacity>

        <View style={styles.textInputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Type WhatsApp message..."
            placeholderTextColor="#8696A0"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
        </View>

        <TouchableOpacity
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
          activeOpacity={0.8}
        >
          <Ionicons name="send" size={17} color="#FFFFFF" style={{ marginLeft: 2 }} />
        </TouchableOpacity>
      </View>

      {/* Stage Picker Modal */}
      <Modal visible={showStagePicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Pipeline Stage</Text>
              <TouchableOpacity onPress={() => setShowStagePicker(false)}>
                <Ionicons name="close" size={22} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Moving this deal will update the sales pipeline and log a team activity audit note.
            </Text>

            <View style={styles.stageOptionsList}>
              {stagesForIndustry.map((stg) => {
                const isCurrent = contact.stageId === stg.id;
                return (
                  <TouchableOpacity
                    key={stg.id}
                    style={[styles.stageOptionItem, isCurrent && styles.stageOptionItemActive]}
                    onPress={() => {
                      moveContactStage(contact.id, stg.id);
                      setShowStagePicker(false);
                    }}
                  >
                    <View style={styles.stageOptionLeft}>
                      <View style={[styles.stageDot, { backgroundColor: stg.color }]} />
                      <Text style={[styles.stageOptionLabel, isCurrent && styles.stageOptionLabelActive]}>
                        {stg.label}
                      </Text>
                    </View>
                    {isCurrent && <Ionicons name="checkmark-circle" size={18} color="#075E54" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Attachment Menu Modal */}
      <Modal visible={showAttachmentMenu} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAttachmentMenu(false)}
        >
          <View style={styles.attachmentSheet}>
            <Text style={styles.sheetTitle}>WhatsApp Attachment Hub</Text>
            <View style={styles.attachmentGrid}>
              <TouchableOpacity
                style={styles.attachmentAction}
                onPress={() =>
                  handleSendAttachment(
                    'document',
                    contact.industry === 'real_estate'
                      ? 'FloorPlan_Brochure.pdf (3.4 MB)'
                      : contact.industry === 'car_dealership'
                      ? 'Window_Sticker_Specs.pdf (1.9 MB)'
                      : contact.industry === 'repair_shop'
                      ? 'Vehicle_Inspection_Estimate.pdf (2.1 MB)'
                      : 'Boutique_Spring_Catalog.pdf (4.2 MB)',
                    'Here is the verified PDF document as requested.'
                  )
                }
              >
                <View style={[styles.sheetIconCircle, { backgroundColor: '#5F66CD' }]}>
                  <Ionicons name="document-text" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.sheetLabel}>PDF Brochure</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.attachmentAction}
                onPress={() =>
                  handleSendAttachment(
                    'image',
                    'HighRes_Showcase.jpg (1.8 MB)',
                    'Here is the high-resolution photo.'
                  )
                }
              >
                <View style={[styles.sheetIconCircle, { backgroundColor: '#AC44CF' }]}>
                  <Ionicons name="images" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.sheetLabel}>Photos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.attachmentAction}
                onPress={() =>
                  handleSendAttachment(
                    'document',
                    'Official_Invoice_Quote.pdf',
                    'Here is your formal itemized invoice & quote.'
                  )
                }
              >
                <View style={[styles.sheetIconCircle, { backgroundColor: '#0084FF' }]}>
                  <Ionicons name="receipt" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.sheetLabel}>Invoice / Quote</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.attachmentAction}
                onPress={() => {
                  setShowAttachmentMenu(false);
                  sendMessage(
                    contactId,
                    '📍 Showroom Location: 100 Bayview Financial Center, Suite 1400. Google Maps: https://maps.google.com/?q=Prime+CRM'
                  );
                }}
              >
                <View style={[styles.sheetIconCircle, { backgroundColor: '#1FA855' }]}>
                  <Ionicons name="location" size={24} color="#FFFFFF" />
                </View>
                <Text style={styles.sheetLabel}>Location PIN</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Full Templates Library Modal */}
      <Modal visible={showTemplateModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>WhatsApp Template Library</Text>
                <Text style={styles.modalSubtitle}>Tap a template to resolve variables and draft message.</Text>
              </View>
              <TouchableOpacity onPress={() => setShowTemplateModal(false)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={relevantTemplates}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingVertical: 10 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.templateLibraryCard}
                  onPress={() => handleApplyTemplate(item)}
                >
                  <View style={styles.templateLibHeader}>
                    <Text style={styles.templateLibTitle}>{item.title}</Text>
                    <Text style={styles.templateLibShortcut}>{item.shortcut}</Text>
                  </View>
                  <Text style={styles.templateLibContent}>{resolveTemplateVariables(item.content)}</Text>
                  <View style={styles.templateLibFooter}>
                    <Text style={styles.templateCategory}>{item.category}</Text>
                    <Text style={styles.templateTapUse}>Tap to Use →</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EFEAE2', // WhatsApp classic wallpaper tone
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dealBarLeft: {
    flex: 1,
    marginRight: 10,
  },
  dealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dealBarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },
  dealBarValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  dealBarBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crmDossierBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  crmDossierText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#075E54',
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  systemBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFFFFFEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
    maxWidth: '90%',
  },
  systemText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
    textAlign: 'center',
  },
  messageRowWrapper: {
    marginVertical: 3,
    flexDirection: 'row',
  },
  rowBusiness: {
    justifyContent: 'flex-end',
  },
  rowCustomer: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1.5,
    elevation: 1,
  },
  businessBubble: {
    backgroundColor: '#E7FFDB', // WhatsApp outgoing bubble
    borderTopRightRadius: 2,
  },
  customerBubble: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 2,
  },
  messageText: {
    fontSize: 14.5,
    color: '#111B21',
    lineHeight: 20,
  },
  bubbleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 3,
  },
  messageTime: {
    fontSize: 10.5,
    color: '#667781',
  },
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  attachmentIconBox: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  attachmentDetails: {
    flex: 1,
    marginRight: 6,
  },
  attachmentTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
  attachmentSub: {
    fontSize: 10,
    color: '#047857',
  },
  quickTemplateBar: {
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 6,
    paddingBottom: 6,
  },
  quickTemplateLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  quickTemplateHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#075E54',
    marginLeft: 4,
  },
  allTemplatesBtn: {
    marginLeft: 'auto',
  },
  allTemplatesText: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600',
  },
  quickTemplateScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  templateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  templateShortcut: {
    fontSize: 11,
    fontWeight: '800',
    color: '#075E54',
    marginRight: 4,
  },
  templateTitle: {
    fontSize: 11,
    color: '#334155',
    maxWidth: 140,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  iconBtn: {
    padding: 6,
  },
  textInputWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    marginHorizontal: 6,
    maxHeight: 100,
  },
  textInput: {
    fontSize: 15,
    color: '#111B21',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#25D366',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 14,
    lineHeight: 17,
  },
  stageOptionsList: {
    gap: 8,
  },
  stageOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stageOptionItemActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  stageOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  stageOptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  stageOptionLabelActive: {
    color: '#065F46',
    fontWeight: '700',
  },
  attachmentSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    marginTop: 'auto',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
    textAlign: 'center',
  },
  attachmentGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  attachmentAction: {
    alignItems: 'center',
    width: 72,
  },
  sheetIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sheetLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    textAlign: 'center',
  },
  templateLibraryCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  templateLibHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  templateLibTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  templateLibShortcut: {
    fontSize: 12,
    fontWeight: '800',
    color: '#075E54',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  templateLibContent: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 8,
  },
  templateLibFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  templateCategory: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  templateTapUse: {
    fontSize: 12,
    fontWeight: '700',
    color: '#075E54',
  },
});
