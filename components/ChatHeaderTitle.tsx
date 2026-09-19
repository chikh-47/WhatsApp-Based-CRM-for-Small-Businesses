import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useCRM } from '../context/CRMContext';

export const ChatHeaderTitle: React.FC<{ contactId: string }> = ({ contactId }) => {
  const { contacts } = useCRM();
  const contact = contacts.find((c) => c.id === contactId);

  if (!contact) {
    return <Text style={styles.title}>WhatsApp Chat</Text>;
  }

  return (
    <View style={styles.container}>
      {contact.avatar ? (
        <Image source={{ uri: contact.avatar }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.fallback]}>
          <Text style={styles.fallbackText}>{contact.name.charAt(0)}</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {contact.name}
        </Text>
        <View style={styles.subRow}>
          <View style={styles.onlineDot} />
          <Text style={styles.statusText}>online • {contact.phone}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 220,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    marginRight: 8,
  },
  fallback: {
    backgroundColor: '#128C7E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  info: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  name: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14.5,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#25D366',
    marginRight: 4,
  },
  statusText: {
    color: '#D1FAE5',
    fontSize: 10,
  },
});
