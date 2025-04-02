import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, FlatList, Image } from "react-native";
import { HistoryItem } from '../../../types/types';
import { getAudioHistory, deleteAudioFromHistory } from "../../../services/AudioService";
import PlayIcon from '../../../assets/images/icons/play.svg';
import DeleteIcon from '../../../assets/images/icons/delete-icon.svg';

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

  const audioDelete = async (id: string) => {
    try {
      await deleteAudioFromHistory(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting:', error);
    }
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
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Назад</Text>
      </TouchableOpacity>
      
      <Text style={styles.title}>История прослушивания</Text>
      
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
    padding: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2196F3',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
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
});

export default HistoryScreen;