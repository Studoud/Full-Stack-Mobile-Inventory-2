import { Alert, Platform } from 'react-native';

// Fonction pour afficher une alerte simple
export const showAlert = (title: string, message: string): void => {
  // Vérifie si on est sur web ou mobile
  if (Platform.OS === 'web') {
    // Pour le navigateur web
    window.alert(`${title}\n\n${message}`);
  } else {
    // Pour les téléphones (React Native)
    Alert.alert(title, message);
  }
};

// Fonction pour les messages de succès
export const showSuccessAlert = (message: string): void => {
  showAlert('Succès', message);
};

// Fonction pour les messages d'erreur
export const showErrorAlert = (message: string): void => {
  showAlert('Erreur', message);
};

// Fonction pour les confirmations (oui/non)
export const showConfirmAlert = (
  title: string,
  message: string,
  onConfirm: () => void
): void => {
  if (Platform.OS === 'web') {
    // Pour le web : fenêtre de confirmation
    const confirmed = window.confirm(`${title}\n\n${message}`);
    if (confirmed) {
      onConfirm();
    }
  } else {
    // Pour mobile : alerte avec deux boutons
    Alert.alert(
      title,
      message,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          style: 'destructive',
          onPress: onConfirm
        }
      ]
    );
  }
};