import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { productAPI } from '../services/api';
import { showConfirmAlert, showSuccessAlert, showErrorAlert } from '../utils/alert';
import { Product } from '../types';

type ProductListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ProductList'>;

// --- UTILS : Formatage du prix ---
const formatPrice = (price: number | string): string => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return 'N/A';
  return num.toFixed(2);
};
// ----------------------------------

export const ProductListScreen: React.FC = () => {
  const navigation = useNavigation<ProductListScreenNavigationProp>();
  
  // États
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // États modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Charger les produits (et mettre fin au chargement/refresh)
  const loadProducts = async () => {
    try {
      const data = await productAPI.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Erreur de chargement:', error);
      showErrorAlert('Erreur de chargement des produits');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Recharge complète et effacement de la recherche en cas de pull-to-refresh
    setSearchQuery(''); 
    loadProducts();
  }, []);

  // Recherche API
  const performSearch = async (query: string) => {
    try {
      setLoading(true); // Indiquer qu'une recherche est en cours
      const data = await productAPI.search(query);
      setProducts(data);
    } catch (error) {
      console.error('Erreur de recherche:', error);
      showErrorAlert('Erreur lors de la recherche.');
    } finally {
        setLoading(false);
    }
  };
  
  // Recherche optimisée (Debounce)
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      if (text.trim() === '') {
        loadProducts();
      } else {
        performSearch(text);
      }
    }, 300);
  };

  // Effacer recherche
  const clearSearch = () => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setSearchQuery('');
    loadProducts();
  };

  // Modifier produit
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    // S'assurer que le prix est affiché comme une chaîne
    setEditPrice(String(product.price)); 
    setEditDescription(product.description || '');
    setModalVisible(true);
  };
  // Sauvegarder modifications
  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    if (!editName.trim()) {
      showErrorAlert('Le nom est obligatoire');
      return;
    }
    // : S'assurer que le prix est un nombre valide (gère la virgule/point)
    const priceNumber = Number(editPrice.replace(',', '.')); 
    if (isNaN(priceNumber) || priceNumber <= 0) {
      showErrorAlert('Le prix doit être un nombre positif valide');
      return;
    }
    try {
      await productAPI.update(editingProduct.id, {
        name: editName.trim(),
        price: priceNumber,
        description: editDescription.trim(),
      });
      // Mise à jour optimisée locale
      setProducts(prev => prev.map(p => 
        p.id === editingProduct.id 
          ? { ...p, name: editName, price: priceNumber, description: editDescription }
          : p
      ));
      showSuccessAlert('Produit modifié !');
      setModalVisible(false);
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      showErrorAlert('Erreur lors de la modification');
    }
  };

  // Supprimer produit
  const handleDeleteProduct = (id: number, name: string) => {
    showConfirmAlert(
      'Supprimer',
      `Supprimer "${name}" ?`,
      async () => {
        try {
          await productAPI.delete(id);
          setProducts(prev => prev.filter(p => p.id !== id));
          showSuccessAlert('Produit supprimé');
        } catch (error) {
          showErrorAlert('Erreur lors de la suppression');
        }
      }
    );
  };

  // Naviguer vers ajout
  const goToAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  // Écran de chargement
  if (loading && products.length === 0 && !refreshing) { // Vérifier loading initial
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a6cff" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  // Render un produit
  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>
          {formatPrice(item.price)} € {/* Utilisation du formatage universel */}
        </Text>
        {item.description && (
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEditProduct(item)}
        >
          <Text style={styles.editText}>✏️</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteProduct(item.id, item.name)}
        >
          <Text style={styles.deleteText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Écran vide
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      {searchQuery ? (
        <>
          <Text style={styles.emptyText}>Aucun produit pour "{searchQuery}"</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={clearSearch}>
            <Text style={styles.emptyButtonText}>Voir tous</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.emptyText}>Aucun produit</Text>
          <TouchableOpacity style={styles.emptyButton} onPress={goToAddProduct}>
            <Text style={styles.emptyButtonText}>Ajouter</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header fixe */}
      <View style={styles.header}>
        <Text style={styles.title}>📋 Liste des Produits</Text>
        <TouchableOpacity style={styles.addButton} onPress={goToAddProduct}>
          <Text style={styles.addButtonText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {/* Recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Compteur (utilise 'products' car il contient déjà les résultats de la recherche API) */}
      <Text style={styles.count}>
        {products.length} produit{products.length !== 1 ? 's' : ''}
        {searchQuery ? ` (recherche)` : ''}
      </Text>

      {/* FlatList pour la liste */}
      <FlatList
        data={products} // Utilise directement 'products' après la simplification de la recherche
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#4a6cff']}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={true}
        initialNumToRender={10} 
        maxToRenderPerBatch={5} 
        windowSize={5} 
      />

      {/* Modal de modification (inchangé, c'est l'origine du blocage de scroll si actif) */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✏️ Modifier produit</Text>
            
            <TextInput
              style={styles.modalInput}
              value={editName}
              onChangeText={setEditName}
              placeholder="Nom"
            />
            
            <TextInput
              style={styles.modalInput}
              value={editPrice}
              onChangeText={setEditPrice}
              keyboardType="decimal-pad"
              placeholder="Prix"
            />
            
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
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveButtonText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles (inchangés, ils sont très corrects)
const styles = StyleSheet.create({
  // ... (tous les styles d'origine)
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  searchInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    paddingRight: 40,
  },
  clearButton: {
    position: 'absolute',
    right: 24,
    top: 22,
    backgroundColor: '#ced4da',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: 'bold',
  },
  count: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    flexGrow: 1, // Important pour le scroll si la liste est vide
  },
  productCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    color: '#28a745',
    fontWeight: '600',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#4a6cff',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  editText: {
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyButton: {
    backgroundColor: '#4a6cff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  modalTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: '#e9ecef',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#28a745',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#495057',
    fontWeight: '600',
    fontSize: 14,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});