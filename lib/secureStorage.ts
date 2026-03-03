
/**
 * SecureStorageManager
 * Gestisce la persistenza sicura delle credenziali simulando iOS Keychain su Web.
 * In un ambiente nativo (Capacitor/React Native), questo file userebbe le API native.
 */

const KEYCHAIN_PREFIX = 'gymbro_secure_';

export const SecureStorageManager = {
  
  /**
   * 1. saveCredentials
   * Salva il token in modo sicuro (simulato con encoding su Web).
   */
  saveCredentials: (key: string, value: string): void => {
    try {
      const encodedValue = btoa(value); 
      localStorage.setItem(`${KEYCHAIN_PREFIX}${key}`, encodedValue);
      console.log(`[Keychain] Credentials saved for ${key}`);
    } catch (error) {
      console.error('[Keychain] Error saving credentials:', error);
    }
  },

  /**
   * 2. getCredentials
   * Recupera il dato decodificandolo.
   */
  getCredentials: (key: string): string | null => {
    try {
      const item = localStorage.getItem(`${KEYCHAIN_PREFIX}${key}`);
      if (!item) return null;
      return atob(item);
    } catch (error) {
      console.error('[Keychain] Error retrieving credentials:', error);
      return null;
    }
  },

  /**
   * 3. clearCredentials
   * Rimuove la chiave dal storage sicuro.
   */
  clearCredentials: (key: string): void => {
    try {
      localStorage.removeItem(`${KEYCHAIN_PREFIX}${key}`);
      console.log(`[Keychain] Credentials cleared for ${key}`);
    } catch (error) {
      console.error('[Keychain] Error clearing credentials:', error);
    }
  }
};
