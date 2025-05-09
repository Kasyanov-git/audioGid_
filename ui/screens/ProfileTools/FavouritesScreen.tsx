import React, { useEffect, useState } from "react";
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  FlatList, 
  ActivityIndicator
} from "react-native";
import { theme } from "../../../theme";
// import LikeFilled from '../../../assets/images/icons/like-filled.svg';
import LikeFilled from '../../../assets/images/icons/like.svg'
import PlayIcon from '../../../assets/images/icons/play.svg'
import ChevronLeft from '../../../assets/images/icons/chevron-left.svg';
import { getFavorites, removeFromFavorites, getAudioHistory } from "../../../services/AudioService";
import { FavoriteWithAudio, HistoryItem } from "../../../types/types";

interface FavouritesScreenProps {
  navigation: any;
}

function FavouritesScreen({ navigation }: FavouritesScreenProps): React.JSX.Element {
  const [favorites, setFavorites] = useState<FavoriteWithAudio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const [favs, history] = await Promise.all([
          getFavorites(),
          getAudioHistory()
        ]);
        
        // Соединяем избранное с данными аудио
        const combined: FavoriteWithAudio[] = favs.reduce((acc, fav) => {
          const audioItem = history.find(item => item.id === fav.audioId);
          if (audioItem) {
            acc.push({ ...fav, ...audioItem });
          }
          return acc;
        }, [] as FavoriteWithAudio[]);
        
        setFavorites(combined);
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
    
    const unsubscribe = navigation.addListener('focus', loadFavorites);
    return unsubscribe;
  }, [navigation]);

//   const handleRemoveFavorite = async (id: string) => {
//     try {
//       await removeFromFavorites(id);
//       setFavorites(prev => prev.filter(item => item.id !== id));
      
//       navigation.emit('favoritesUpdated', { 
//         audioId: id,
//         isFavorite: false
//       });
//     } catch (error) {
//       console.error('Error removing favorite:', error);
//     }
//   };

const handleRemoveFavorite = async (id: string) => {
    try {
      await removeFromFavorites(id);
      setFavorites(prev => prev.filter(item => item.id !== id));
      
      navigation.navigate('MainApp', { 
        removedFavoriteId: id
      });
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const renderItem = ({ item }: { item: FavoriteWithAudio }) => (
    <View style={styles.itemContainer}>
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDate}>
          Добавлено: {new Date(item.dateAdded).toLocaleDateString()}
        </Text>
        <Text style={styles.itemText} numberOfLines={2}>{item.text}</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => {/* TODO: воспроизведение */}}>
          <PlayIcon width={24} height={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleRemoveFavorite(item.id)}>
          <LikeFilled width={24} height={24} fill={theme.colors.primary} />
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
        <Text style={styles.title}>Избранное</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>В избранном пока ничего нет</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
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
  loader: {
    marginTop: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text2,
  },
  listContent: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  itemContent: {
    flex: 1,
    marginRight: 16,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
    color: theme.colors.text2,
    marginBottom: 8,
  },
  itemText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
});

export default FavouritesScreen;