// STEP Academy 2026 - Storage Manager
// IndexedDB & LocalStorage Management

class StorageManager {
  constructor() {
    this.dbName = 'STEP_Academy_DB';
    this.dbVersion = 1;
    this.db = null;
    this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Test Results Store
        if (!db.objectStoreNames.contains('testResults')) {
          const testStore = db.createObjectStore('testResults', {
            keyPath: 'id',
            autoIncrement: true
          });
          testStore.createIndex('userId', 'userId', { unique: false });
          testStore.createIndex('date', 'date', { unique: false });
        }

        // User Progress Store
        if (!db.objectStoreNames.contains('userProgress')) {
          const progressStore = db.createObjectStore('userProgress', {
            keyPath: 'userId'
          });
          progressStore.createIndex('lastActivity', 'lastActivity', { unique: false });
        }

        // Points & Rewards Store
        if (!db.objectStoreNames.contains('pointsRewards')) {
          db.createObjectStore('pointsRewards', {
            keyPath: 'id',
            autoIncrement: true
          });
        }
      };
    });
  }

  // Save test result
  async saveTestResult(result) {
    const transaction = this.db.transaction(['testResults'], 'readwrite');
    const store = transaction.objectStore('testResults');
    
    const data = {
      ...result,
      userId: localStorage.getItem('userId'),
      date: new Date().toISOString()
    };
    
    return new Promise((resolve, reject) => {
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get all test results for user
  async getUserTestResults(userId) {
    const transaction = this.db.transaction(['testResults'], 'readonly');
    const store = transaction.objectStore('testResults');
    const index = store.index('userId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(userId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Save user progress
  async saveUserProgress(progress) {
    const transaction = this.db.transaction(['userProgress'], 'readwrite');
    const store = transaction.objectStore('userProgress');
    
    const data = {
      userId: localStorage.getItem('userId'),
      ...progress,
      lastActivity: new Date().toISOString()
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Get user progress
  async getUserProgress(userId) {
    const transaction = this.db.transaction(['userProgress'], 'readonly');
    const store = transaction.objectStore('userProgress');
    
    return new Promise((resolve, reject) => {
      const request = store.get(userId);
      request.onsuccess = () => resolve(request.result || {});
      request.onerror = () => reject(request.error);
    });
  }

  // Points & Rewards
  async addPoints(points, reason) {
    const transaction = this.db.transaction(['pointsRewards'], 'readwrite');
    const store = transaction.objectStore('pointsRewards');
    
    const data = {
      userId: localStorage.getItem('userId'),
      points,
      reason,
      date: new Date().toISOString()
    };
    
    return new Promise((resolve, reject) => {
      const request = store.add(data);
      request.onsuccess = () => {
        this.updateTotalPoints(points);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  updateTotalPoints(points) {
    const currentPoints = parseInt(localStorage.getItem('totalPoints') || '0');
    localStorage.setItem('totalPoints', (currentPoints + points).toString());
  }

  getTotalPoints() {
    return parseInt(localStorage.getItem('totalPoints') || '0');
  }

  // Clear all data
  async clearAllData() {
    const stores = ['testResults', 'userProgress', 'pointsRewards'];
    const transaction = this.db.transaction(stores, 'readwrite');
    
    const promises = stores.map(storeName => {
      return new Promise((resolve, reject) => {
        const request = transaction.objectStore(storeName).clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });
    
    return Promise.all(promises);
  }
}

// LocalStorage helpers
const LocalStore = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('LocalStorage set error:', error);
      return false;
    }
  },

  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('LocalStorage get error:', error);
      return defaultValue;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('LocalStorage remove error:', error);
      return false;
    }
  },

  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('LocalStorage clear error:', error);
      return false;
    }
  }
};

// Initialize storage manager
const storage = new StorageManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StorageManager, LocalStore, storage };
}
