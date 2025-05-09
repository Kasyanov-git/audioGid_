import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryItem } from '../types/types';
import { FavoriteItem } from '../types/types';

const HISTORY_KEY = '@audio_history';

  export const saveAudioToHistory = async (audioData: Omit<HistoryItem, 'id' | 'date'>) => {
    try {
      const history = await getAudioHistory();
      const newItem = {
        ...audioData,
        id: Date.now().toString(),
        date: new Date().toISOString(),
      };
      
      const newHistory = [newItem, ...history];
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      return newItem;
    } catch (error) {
      console.error('Error saving to history:', error);
      throw error;
    }
  };

  export const getAudioHistory = async (): Promise<HistoryItem[]> => {
    try {
      const history = await AsyncStorage.getItem(HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  };

  export const deleteAudioFromHistory = async (id: string) => {
    try {
      const history = await getAudioHistory();
      const newHistory = history.filter(item => item.id !== id);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      
      const itemToDelete = history.find(item => item.id === id);
      if (itemToDelete?.path) {
        await RNFS.unlink(itemToDelete.path);
      }
    } catch (error) {
      console.error('Error deleting from history:', error);
      throw error;
    }
  };

  const FAVORITES_KEY = '@audio_favorites';

  export const addToFavorites = async (audioId: string): Promise<FavoriteItem> => {
    const favorites = await getFavorites();
    const newItem = {
      id: Date.now().toString(),
      audioId,
      dateAdded: new Date().toISOString(),
    };
    
    if (!favorites.some(item => item.audioId === audioId)) {
      const newFavorites = [newItem, ...favorites];
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      return newItem;
    }
    throw new Error('Аудио уже в избранном');
  };
  
  export const removeFromFavorites = async (audioId: string) => {
    const favorites = await getFavorites();
    const newFavorites = favorites.filter(item => item.audioId !== audioId);
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  };
  
  export const getFavorites = async (): Promise<FavoriteItem[]> => {
    const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  };
  
  export const isFavorite = async (audioId: string): Promise<boolean> => {
    const favorites = await getFavorites();
    return favorites.some(item => item.audioId === audioId);
  };