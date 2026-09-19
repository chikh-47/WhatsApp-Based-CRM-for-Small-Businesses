import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCRM } from '../context/CRMContext';

export const WhatsAppConnectionBanner: React.FC<{ onPress?: () => void }> = ({ onPress }) => {
  const { integrations, isSyncing, syncIntegrationsNow } = useCRM();

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.pulseContainer}>
          <View style={[styles.pulseDot, { backgroundColor: integrations.whatsappApi.connected ? '#25D366' : '#EF4444' }]} />
        </View>
        <Ionicons name="logo-whatsapp" size={15} color="#25D366" style={{ marginRight: 6 }} />
        <Text style={styles.title}>
          WhatsApp API: <Text style={styles.status}>{integrations.whatsappApi.connected ? 'Connected' : 'Offline'}</Text>
        </Text>
        <Text style={styles.latency}>({integrations.whatsappApi.webhookLatencyMs}ms • E2EE)</Text>
      </View>

      <TouchableOpacity
        style={styles.syncBtn}
        onPress={() => syncIntegrationsNow()}
        disabled={isSyncing}
        activeOpacity={0.7}
      >
        {isSyncing ? (
          <ActivityIndicator size="small" color="#075E54" />
        ) : (
          <View style={styles.syncInner}>
            <Ionicons name="sync-outline" size={13} color="#075E54" style={{ marginRight: 3 }} />
            <Text style={styles.syncText}>Sync</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pulseContainer: {
    marginRight: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E293B',
  },
  status: {
    color: '#059669',
    fontWeight: '700',
  },
  latency: {
    fontSize: 10,
    color: '#64748B',
    marginLeft: 4,
  },
  syncBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  syncInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncText: {
    fontSize: 11,
    color: '#075E54',
    fontWeight: '600',
  },
});
