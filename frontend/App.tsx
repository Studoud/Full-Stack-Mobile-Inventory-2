import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AddProductScreen } from './src/screens/AddProductScreen';
import { ProductListScreen } from './src/screens/ProductListScreen';
import { Product } from './src/types';


// Définis les types de navigation
export type RootStackParamList = {
  AddProduct: undefined;
  ProductList: undefined; // Pas besoin de paramètre pour ProductList
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="AddProduct">
        <Stack.Screen 
          name="AddProduct" 
          component={AddProductScreen}
          options={{ title: 'Ajouter un Produit' }}
        />
        <Stack.Screen 
          name="ProductList" 
          component={ProductListScreen}
          options={{ title: 'Liste des Produits' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}