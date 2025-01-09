import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'search_history';
const MAX_HISTORY_ITEMS = 5;

interface HistoryItem {
  name: string;
  formula: string;
  timestamp: number;
}

export const addToHistory = async (substance: any) => {
  try {
    const currentHistory = await getHistory();
    
    const newItem: HistoryItem = {
      name: substance.name,
      formula: substance.formula,
      timestamp: Date.now(),
    };
    
    const filteredHistory = Array.isArray(currentHistory) 
      ? currentHistory.filter(item => item.name !== newItem.name)
      : [];
    
    const newHistory = [newItem, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
    
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    
    return newHistory;
  } catch (error) {
    console.error('Error adding to history:', error);
    return [];
  }
};

export const getHistory = async (): Promise<HistoryItem[]> => {
  try {
    const history = await AsyncStorage.getItem(HISTORY_KEY);
    if (!history) return [];
    return JSON.parse(history);
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
};

export const clearHistory = async () => {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing history:', error);
    return false;
  }
};

export type { HistoryItem };