import { openDB } from 'idb';

// Database name and version
const DB_NAME = 'LocationTrackerDB';
const DB_VERSION = 1;
const STORE_NAME = 'locations';

// Open or create the database
async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'timestamp' });
      }
    },
  });
}

// Save a location to the database
export async function saveLocation(location) {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  await store.put({ ...location, timestamp: new Date().getTime() });
  await tx.done;
}

// Get all locations from the database
export async function getLocations() {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  return store.getAll();
}
