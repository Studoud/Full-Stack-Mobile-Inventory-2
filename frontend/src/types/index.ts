export interface Product {
  id: number;
  name: string;
  price: number | string; // Peut être number ou string
  description?: string;
}

export interface ProductFormData {
  name: string;
  price: string; // Toujours string pour le formulaire
  description: string;
}