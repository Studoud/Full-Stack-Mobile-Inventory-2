import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HeaderProps {
  title: string;
  count: number;
}

export const Header: React.FC<HeaderProps> = ({ title, count }) => {
  return (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {count} produit{count !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#4F46E5',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  countBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
});