import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = 'user_bookmarks';

interface Substance {
  oonNumber: number;
  name: string;
  dangerousNumber: string;
  formula: string;
  description: string;
  aggregationState: string;
  densityAir: string;
  densityWater: string;
  solubility: string;
  generalDanger: string;
  waterDanger: string;
  imdg: string;
  haz: string;
  container: string;
  respirationRecommendation: string;
  skinDefenseRecommendation: string;
  molecularWeight: number;
  flammabilityClass: string;
  temperatureProperties: {
    boilingPoint: number;
    freezePoint: number;
    meltingPoint: number;
    flashPoint: number;
  };
  healthInvolve: {
    lethal: number;
    limitConcentration: number;
    involveWays: string;
    symptoms: string;
    organImpacts: string;
  };
  firstAid: {
    eyes: string;
    skin: string;
    inhalation: string;
    swallowing: string;
  };
  dangerSquare: {
    health: number;
    fire: number;
    chemistry: number;
    other: number;
  };
  timestamp?: number; // Додамо часову мітку, як в історії
}

export const addToBookmarks = async (substance: Substance) => {
    try {
      const currentBookmarks = await getBookmarks();
      
      const newBookmark: Substance = {
        ...substance,
        timestamp: Date.now(),
      };
      
      // Перевіряємо чи вже є така закладка
      const filteredBookmarks = Array.isArray(currentBookmarks) 
        ? currentBookmarks.filter(item => item.oonNumber !== newBookmark.oonNumber)
        : [];
      
      // Додаємо нову закладку на початок масиву
      const updatedBookmarks = [newBookmark, ...filteredBookmarks];
      
      // Використовуємо BOOKMARKS_KEY замість 'bookmarks'
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
      return true;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      return false;
    }
  };

export const getBookmarks = async (): Promise<Substance[]> => {
  try {
    const bookmarks = await AsyncStorage.getItem(BOOKMARKS_KEY);
    if (!bookmarks) return [];
    return JSON.parse(bookmarks);
  } catch (error) {
    console.error('Error getting bookmarks:', error);
    return [];
  }
};

export const removeFromBookmarks = async (oonNumber: number): Promise<boolean> => {
  try {
    const currentBookmarks = await getBookmarks();
    
    const updatedBookmarks = currentBookmarks.filter(
      bookmark => bookmark.oonNumber !== oonNumber
    );
    
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
    return true;
  } catch (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }
};

export const isSubstanceBookmarked = async (oonNumber: number): Promise<boolean> => {
  try {
    const bookmarks = await getBookmarks();
    return bookmarks.some(bookmark => bookmark.oonNumber === oonNumber);
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return false;
  }
};

export const clearBookmarks = async () => {
  try {
    await AsyncStorage.removeItem(BOOKMARKS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing bookmarks:', error);
    return false;
  }
};

export type { Substance };