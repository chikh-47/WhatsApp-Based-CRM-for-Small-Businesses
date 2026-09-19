import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { STAGE_DEFINITIONS } from '../lib/mockData';

interface Props {
  stageId: string;
}

export const StageBadge: React.FC<Props> = ({ stageId }) => {
  const stage = STAGE_DEFINITIONS.find((s) => s.id === stageId);
  const color = stage?.color || '#64748B';
  const label = stage?.label || stageId;

  return (
    <View style={[styles.badge, { backgroundColor: `${color}15`, borderColor: `${color}40` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});
