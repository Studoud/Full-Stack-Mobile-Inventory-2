import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Product } from '../../types';

interface ProductItemProps {
  product: Product;
  onDelete: (id: number, name: string) => void;
}

export const ProductItem: React.FC<ProductItemProps> = ({ product, onDelete }) => {
  // S'assurer que le prix est un nombre
  const price = typeof product.price === 'string' 
    ? parseFloat(product.price) 
    : product.price;

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📦</Text>
        </View>
        <View style={styles.info}>
          <View style={styles.headerRow}>
            <Text style={styles.name} numberOfLines={1}>
              {product.name}
            </Text>
            <Text style={styles.price}>
              {typeof price === 'number' ? price.toFixed(2) : '0.00'} €
            </Text>
          </View>
          {product.description && product.description.trim() !== '' && (
            <Text style={styles.description} numberOfLines={2}>
              {product.description}
            </Text>
          )}
          <Text style={styles.id}>ID: {product.id}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(product.id, product.name)}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
  },
  description: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 6,
    lineHeight: 20,
  },
  id: {
    fontSize: 12,
    color: '#94A3B8',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  deleteIcon: {
    fontSize: 20,
  },
});