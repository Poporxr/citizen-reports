import AsyncStorage from "@react-native-async-storage/async-storage";

// In-memory cache for synchronous fast-path access
const memoryCache = new Map<string, any>();

export async function setCachedItem<T>(key: string, value: T): Promise<void> {
  try {
    memoryCache.set(key, value);
    const serialized = JSON.stringify(value);
    await AsyncStorage.setItem(`@citizen_cache_${key}`, serialized);
  } catch (err) {
    console.warn(`[Cache] Error setting ${key}:`, err);
  }
}

export async function getCachedItem<T>(key: string): Promise<T | null> {
  try {
    if (memoryCache.has(key)) {
      return memoryCache.get(key) as T;
    }
    const item = await AsyncStorage.getItem(`@citizen_cache_${key}`);
    if (!item) return null;
    const parsed = JSON.parse(item) as T;
    memoryCache.set(key, parsed);
    return parsed;
  } catch (err) {
    console.warn(`[Cache] Error getting ${key}:`, err);
    return null;
  }
}

export function getMemoryItem<T>(key: string): T | null {
  return (memoryCache.get(key) as T) ?? null;
}

export async function removeCachedItem(key: string): Promise<void> {
  try {
    memoryCache.delete(key);
    await AsyncStorage.removeItem(`@citizen_cache_${key}`);
  } catch (err) {
    console.warn(`[Cache] Error removing ${key}:`, err);
  }
}
