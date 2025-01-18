export const StorageService = {
  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(value));
        return true;
      }
      console.warn('localStorage is not available');
      return false;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },

  getItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      }
      console.warn('localStorage is not available');
      return null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  },

  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return true;
      }
      console.warn('localStorage is not available');
      return false;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },

  clear: () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
        return true;
      }
      console.warn('localStorage is not available');
      return false;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};
