import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { productAPI } from '../services/api';
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from '../utils/alert';
import { Product } from '../types';

type ProductListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProductList'>;

export const ProductListScreen: React.FC = () => {
  const navigation = useNavigation<ProductListScreenNavigationProp>();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour la modal de modification
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [updating, setUpdating] = useState(false);

  // Charger les produits au démarrage
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productAPI.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Erreur de chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour ouvrir la modal de modification
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(product.price.toString());
    setEditDescription(product.description || '');
    setModalVisible(true);
  };

  // Fonction pour sauvegarder les modifications
  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    // Validation
    if (!editName.trim()) {
      showErrorAlert('Le nom est obligatoire');
      return;
    }
    
    const priceNumber = parseFloat(editPrice);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      showErrorAlert('Le prix doit être un nombre positif');
      return;
    }

    setUpdating(true);
    try {
      await productAPI.update(editingProduct.id, {
        name: editName.trim(),
        price: priceNumber,
        description: editDescription.trim(),
      });

      // Mettre à jour la liste locale
      setProducts(products.map(p => 
        p.id === editingProduct.id 
          ? { ...p, name: editName, price: priceNumber, description: editDescription }
          : p
      ));

      showSuccessAlert('Produit modifié avec succès !');
      setModalVisible(false);
    } catch (error) {
      showErrorAlert('Erreur lors de la modification');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteProduct = (id: number, name: string) => {
    showConfirmAlert(
      'Supprimer',
      `Voulez-vous supprimer "${name}" ?`,
      async () => {
        try {
          await productAPI.delete(id);
          setProducts(products.filter(p => p.id !== id));
          showSuccessAlert('Produit supprimé');
        } catch (error) {
          console.error('Erreur de suppression:', error);
        }
      }
    );
  };

  const goToAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6cff" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.title}>📋 Liste des Produits</Text>
        <TouchableOpacity style={styles.addButton} onPress={goToAddProduct}>
          <Text style={styles.addButtonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.count}>
        {products.length} produit{products.length !== 1 ? 's' : ''}
      </Text>

      {/* Liste des produits */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.productCard}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productPrice}>
                {typeof item.price === 'number' 
                  ? item.price.toFixed(2) 
                  : parseFloat(item.price as string).toFixed(2)} €
              </Text>
              {item.description && (
                <Text style={styles.productDescription}>{item.description}</Text>
              )}
            </View>
            
            {/* BOUTONS D'ACTION */}
            <View style={styles.actionButtons}>
              {/* Bouton Modifier */}
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => handleEditProduct(item)}
              >
                <Text style={styles.editText}>✏️</Text>
              </TouchableOpacity>
              
              {/* Bouton Supprimer */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteProduct(item.id, item.name)}
              >
                <Text style={styles.deleteText}>🗑️</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun produit</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={loadProducts}>
              <Text style={styles.emptyButtonText}>Actualiser</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* MODAL DE MODIFICATION */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✏️ Modifier le produit</Text>
            
            <Text style={styles.label}>Nom *</Text>
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Nom du produit"
            />
            
            <Text style={styles.label}>Prix *</Text>
            <TextInput
              style={styles.modalInput}
              value={editPrice}
              onChangeText={setEditPrice}
              keyboardType="decimal-pad"
              placeholder="Prix"
            />
            
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              value={editDescription}
              onChangeText={setEditDescription}
              multiline
              placeholder="Description"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                disabled={updating}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEdit}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Sauvegarder</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  count: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  productCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    elevation: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: '600',
    marginBottom: 5,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
  },
  // NOUVEAU : Conteneur pour les boutons
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Bouton Modifier
  editButton: {
    backgroundColor: '#4a6cff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  editText: {
    fontSize: 18,
  },
  // Bouton Supprimer (modifié)
  deleteButton: {
    backgroundColor: '#ff6b6b',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 18,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#4a6cff',
    padding: 10,
    borderRadius: 5,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  // STYLES POUR LA MODAL
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
  },
  modalInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#28a745',
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});