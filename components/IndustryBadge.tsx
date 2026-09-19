import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { IndustryType } from '../types/crm';
import { INDUSTRY_COLORS, INDUSTRY_LABELS } from '../lib/mockData';

interface Props {
  industry: IndustryType;
  size?: 'small' | 'medium';
}

export const IndustryBadge: React.FC<Props> = ({ industry, size = 'small' }) => {
  const getIconName = (): keyof typeof Ionicons.glyphMap => {
    switch (industry) {
      case 'real_estate':
        return 'home';
      case 'car_dealership':
        return 'car-sport';
      case 'repair_shop':
        return 'construct';
      case 'boutique':
        return 'shirt';
      default:
        return 'briefcase';
    }
  };

  const color = INDUSTRY_COLORS[industry] || '#075E54';
  const label = INDUSTRY_LABELS[industry] || 'General';

  const isSmall = size === 'small';

  return (
    <View style={[styles.badge, { backgroundColor: `${color}18`, borderColor: `${color}40` }]}>
      <Ionicons name={getIconName()} size={isSmall ? 11 : 13} color={color} style={{ marginRight: 4 }} />
      <Text style={[styles.text, { color, fontSize: isSmall ? 10 : 12 }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
