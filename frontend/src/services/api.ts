import { Product } from '../types';
import { Platform } from 'react-native';

// Fonction pour obtenir l'URL de base en fonction de la plateforme
const getBaseUrl = () => {
  return Platform.select({
    web: 'http://localhost:3000/api',
    default: 'http://192.168.185.48:3000/api',
  });
};

export const productAPI = {
  getAll: async (): Promise<Product[]> => {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/products`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    let products: Product[] = [];
    if (Array.isArray(data)) {
      products = data;
    } else if (data && data.data) {
      products = data.data;
    }
    
    return products.map(product => ({
      ...product,
      price: typeof product.price === 'string' 
        ? parseFloat(product.price) 
        : product.price
    }));
  },

  // NOUVELLE MÉTHODE : Recherche de produits
  search: async (query: string): Promise<Product[]> => {
    const baseUrl = getBaseUrl();
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`${baseUrl}/products/search?q=${encodedQuery}`);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    
    let products: Product[] = [];
    if (Array.isArray(data)) {
      products = data;
    } else if (data && data.data) {
      products = data.data;
    }
    
    return products.map(product => ({
      ...product,
      price: typeof product.price === 'string' 
        ? parseFloat(product.price) 
        : product.price
    }));
  },

  create: async (productData: { name: string; price: number; description: string }): Promise<Product> => {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/products`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erreur lors de la création');
    }
    
    const data = await response.json();
    return {
      ...data.data,
      price: typeof data.data.price === 'string' 
        ? parseFloat(data.data.price) 
        : data.data.price
    };
  },

  update: async (id: number, productData: { name: string; price: number; description: string }): Promise<Product> => {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/products/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erreur lors de la mise à jour');
    }
    
    const data = await response.json();
    return {
      ...data.data,
      price: typeof data.data.price === 'string' 
        ? parseFloat(data.data.price) 
        : data.data.price
    };
  },

  delete: async (id: number): Promise<boolean> => {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/products/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erreur lors de la suppression');
    }
    
    return true;
  },
};