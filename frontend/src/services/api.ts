import { Product } from '../types';
import { Platform } from 'react-native';

const API_URL = Platform.select({
  web: 'http://localhost:3000/api/products',
  default: 'http://192.168.185.48:3000/api/products',
});

export const productAPI = {
  getAll: async (): Promise<Product[]> => {
    const response = await fetch(API_URL);
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

  create: async (productData: { name: string; price: number; description: string }): Promise<Product | null> => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) throw new Error('Erreur lors de la création');
    return await response.json();
  },

  // MÉTHODE UPDATE AJOUTÉE ICI
  update: async (id: number, productData: { name: string; price: number; description: string }): Promise<Product | null> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) throw new Error('Erreur lors de la mise à jour');
    return await response.json();
  },

  delete: async (id: number): Promise<boolean> => {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error('Erreur lors de la suppression');
    return true;
  },
};