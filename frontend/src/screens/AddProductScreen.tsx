import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App'; // IMPORTANT : importer le type
import { productAPI } from '../services/api';
import { showSuccessAlert, showErrorAlert } from '../utils/alert';

// Définir le type de navigation pour cet écran
type AddProductScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddProduct'>;

export const AddProductScreen: React.FC = () => {
  // Utiliser le type défini pour la navigation
  const navigation = useNavigation<AddProductScreenNavigationProp>();
  
  // États pour les champs du formulaire
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Fonction pour ajouter un produit
  const handleAddProduct = async () => {
    // Vérification des champs
    if (!name.trim()) {
      showErrorAlert('Le nom est obligatoire');
      return;
    }
    const priceNumber = parseFloat(price);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      showErrorAlert('Le prix doit être un nombre positif');
      return;
    }
    setLoading(true); 
    try {
      // Appel à l'API pour ajouter le produit
      await productAPI.create({
        name: name.trim(),
        price: priceNumber,
        description: description.trim(),
      });

      // Réinitialiser le formulaire
      setName('');
      setPrice('');
      setDescription('');
      
      // Afficher un message de succès
      showSuccessAlert('Produit ajouté avec succès !');
      
    } catch (error) {
      showErrorAlert('Erreur lors de l\'ajout');
    } finally {
      setLoading(false);
    }
  };

  // Aller à l'écran de liste
  const goToProductList = () => {
    navigation.navigate('ProductList');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* En-tête avec titre et bouton */}
      <View style={styles.header}>
        <Text style={styles.title}>📦 Ajouter un Produit</Text>
        <TouchableOpacity style={styles.listButton} onPress={goToProductList}>
          <Text style={styles.listButtonText}>Voir la Liste</Text>
        </TouchableOpacity>
      </View>

      {/* Formulaire */}
      <View style={styles.formCard}>
        {/* Champ Nom */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom du produit *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: iPhone 15"
            value={name}
            onChangeText={setName}
          />
        </View>
        
        {/* Champ Prix */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Prix *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 999.99"
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
        </View>
        
        {/* Champ Description */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Description..."
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>
        
        {/* Bouton d'ajout */}
        <TouchableOpacity
          style={[styles.addButton, loading && styles.disabledButton]}
          onPress={handleAddProduct}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Ajouter le produit</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Bouton pour voir la liste */}
      <TouchableOpacity 
        style={styles.listLinkButton} 
        onPress={goToProductList}
      >
        <Text style={styles.listLinkText}>📋 Voir tous les produits</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// Styles CSS pour l'écran
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  listButton: {
    backgroundColor: '#4a6cff',
    padding: 10,
    borderRadius: 5,
  },
  listButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    // Correction pour éviter le warning shadow*
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listLinkButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  listLinkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});