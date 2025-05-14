import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, FlatList, Image, Alert } from "react-native";
import { HistoryItem } from '../../../types/types';
import { getAudioHistory, deleteAudioFromHistory } from "../../../services/AudioService";
import PlayIcon from '../../../assets/images/icons/play.svg';
import DeleteIcon from '../../../assets/images/icons/delete-icon.svg';
import ChevronLeft from '../../../assets/images/icons/chevron-left.svg';
import { theme } from "../../../theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RNFS from 'react-native-fs';

interface HistoryScreenProps {
  navigation: any;
}

function HistoryScreen({ navigation }: HistoryScreenProps): React.JSX.Element {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      const audioHistory = await getAudioHistory();
      setHistory(audioHistory);
      setLoading(false);
    };
    
    loadHistory();
    
    // Обновляем историю при фокусе экрана
    const unsubscribe = navigation.addListener('focus', loadHistory);
    
    return unsubscribe;
  }, [navigation]);

  // const audioDelete = async (id: string) => {
  //   try {
  //     await deleteAudioFromHistory(id);
  //     setHistory(prev => prev.filter(item => item.id !== id));
  //   } catch (error) {
  //     console.error('Error deleting:', error);
  //     // Пытаемся удалить запись даже если файл не найден
  //     setHistory(prev => prev.filter(item => item.id !== id));
  //   }
  // };

  const audioDelete = async (id: string) => {
    try {
      await deleteAudioFromHistory(id);
      setHistory(prev => prev.filter(item => item.id !== id));
      Alert.alert("Успешно", "Запись удалена из истории");
    } catch (error) {
      console.error('Error deleting:', error);
      Alert.alert(
        "Частичное удаление",
        "Файл не найден, но запись удалена из истории",
        [{ text: "OK", onPress: () => 
          setHistory(prev => prev.filter(item => item.id !== id))
        }]
      );
    }
  };

  const clearAllHistory = async () => {
    if (history.length === 0) {
      Alert.alert("История уже пуста");
      return;
    }
  
    Alert.alert(
      "Очистить историю",
      "Вы уверены, что хотите удалить всю историю?",
      [
        {
          text: "Отмена",
          style: "cancel"
        },
        { 
          text: "Очистить", 
          onPress: async () => {
            try {
              // Удаляем только существующие файлы
              await Promise.all(history.map(async item => {
                try {
                  const exists = await RNFS.exists(item.path);
                  if (exists) await RNFS.unlink(item.path);
                } catch (fileError) {
                  console.warn(`Не удалось удалить файл ${item.path}:`, fileError);
                }
              }));
              
              // Очищаем всю историю
              await AsyncStorage.removeItem('@audio_history');
              setHistory([]);
            } catch (error) {
              console.error('Ошибка при очистке истории:', error);
              Alert.alert("Ошибка", "Не удалось полностью очистить историю");
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }: { item: HistoryItem }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDate}>{new Date(item.date).toLocaleDateString()}</Text>
        <Text style={styles.itemText} numberOfLines={2}>{item.text}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => {/* Воспроизвести */}}>
          <PlayIcon width={24} height={24} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => audioDelete(item.id)}>
          <DeleteIcon width={24} height={24} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ChevronLeft width={24} height={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>История</Text>
        {history.length > 0 && (
          <TouchableOpacity 
            onPress={clearAllHistory}
            style={styles.clearButton}
          >
            <Text style={styles.clearButtonText}>Очистить все</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {loading ? (
        <Text>Загрузка...</Text>
      ) : history.length === 0 ? (
        <Text style={styles.emptyText}>Ваша история пуста</Text>
      ) : (
        <FlatList
          data={history}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 10,
  },
  itemContent: {
    flex: 1,
    marginRight: 10,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
  },
  itemDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  itemText: {
    fontSize: 14,
    color: '#333',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  clearButton: {
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF3B30',
    borderRadius: 15,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default HistoryScreen;