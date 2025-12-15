import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

interface ProductFormProps {
  onSubmit: (data: { name: string; price: number; description: string }) => Promise<void>;
  isLoading: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, isLoading }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) return;
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) return;

    await onSubmit({
      name: name.trim(),
      price: priceValue,
      description: description.trim(),
    });

    setName('');
    setPrice('');
    setDescription('');
  };

  return (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>➕ Ajouter un produit</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Nom du produit *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: iPhone 15"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Prix *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 999.99"
          placeholderTextColor="#999"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description du produit..."
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </View>
      
      <TouchableOpacity
        style={[styles.addButton, isLoading && styles.addButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.addButtonText}>Ajouter le produit</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formCard: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#1E293B',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonDisabled: {
    backgroundColor: '#94A3B8',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});