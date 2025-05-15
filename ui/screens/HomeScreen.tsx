// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import {
//   Alert,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
//   KeyboardAvoidingView,
//   Keyboard,
//   TouchableWithoutFeedback,
//   PanResponder,
//   Animated,
//   ScrollView,
//   ActivityIndicator,
//   Modal,
//   FlatList,
// } from 'react-native';
// // import Modal from 'react-native-modal';
// import Map from '../components/Map';
// import { theme } from '../../theme';
// import CheckboxUnchecked from '../../assets/images/icons/chevron-right-icon.svg';
// import CheckboxChecked from '../../assets/images/icons/chevron-left-blue.svg';
// import Settings from '../../assets/images/icons/settings.svg';
// import Previous from '../../assets/images/icons/previous.svg';
// import Minus15 from '../../assets/images/icons/minus15.svg';
// import Play from '../../assets/images/icons/play.svg';
// import PlayWhite from '../../assets/images/icons/play-white.svg';
// import Plus15 from '../../assets/images/icons/plus15.svg';
// import Next from '../../assets/images/icons/next.svg';
// import Like from '../../assets/images/icons/like.svg';
// import Line from '../../assets/images/icons/line.svg';
// import Pause from '../../assets/images/icons/pause.svg';
// import PauseWhite from '../../assets/images/icons/pause-white.svg';
// import Download from '../../assets/images/icons/download.svg';
// import ShowText from '../../assets/images/icons/text-btn.svg';
// import VolumeOn from '../../assets/images/icons/volume_on.svg';
// import VolumeOff from '../../assets/images/icons/volume_off.svg';
// import AIoutlined from '../../assets/images/icons/ai-outlined-icon.svg';
// import AIoutlinedBlue from '../../assets/images/icons/ai-outlined-blue.svg';
// import AIfiled from '../../assets/images/icons/ai-filled-icon.svg';
// import { VolumeManager } from 'react-native-volume-manager';
// import Slider from '@react-native-community/slider';
// import LinearGradient from 'react-native-linear-gradient';
// import TrackPlayer, { State, useProgress, usePlaybackState, PlaybackTrackChangedEvent, Event } from 'react-native-track-player';
// import { Suggest  } from 'react-native-yamap';
// // import { GeoFigureType } from 'react-native-yamap/build/Search';
// import {ClassTimer} from './test.tsx';
// import { Geocoder } from 'react-native-yamap';
// import base64 from 'base-64';
// import RNFS from 'react-native-fs';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { addToFavorites, removeFromFavorites, saveAudioToHistory, isFavorite } from '../../services/AudioService.ts';
// import { useFocusEffect } from '@react-navigation/native';
// import DraggableFlatList from 'react-native-draggable-flatlist';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// // import Animated from 'react-native-reanimated';

// Geocoder.init('500f7015-58c8-477a-aa0c-556ea02c2d9e');

// type AudioData = {
//   path: string;
//   text: string;
//   title: string;
// };

// type Preference = {
//   id: string;
//   name: string;
//   selected: boolean;
// };

// interface HomeScreenProps {
//   navigation: any;
//   route?: {
//     params?: {
//       removedFavoriteId?: string;
//     };
//   };
// }

// function HomeScreen({ navigation, route }: HomeScreenProps): React.JSX.Element {
//   const [isPlaying, setIsPlaying] = useState<boolean>(false);
//   const [volume, setVolume] = useState<number>(0);
//   const [volumeListenerInitialized, setVolumeListenerInitialized] = useState(false);
//   const [containerHeight] = useState<number | 'auto'>('auto');
//   const [isExpanded, setIsExpanded] = useState<boolean>(false);
//   const [previousVolume, setPreviousVolume] = useState<number>(volume);
//   const [audioUrl, setAudioUrl] = useState<string | null>(null);
//   const myInstance = new ClassTimer();
//   const [audioText, setAudioText] = useState<string>('');
//   const [audioTextTitle, setAudioTextTitle] = useState<string>('');
//   const [showTextManually, setShowTextManually] = useState<boolean>(false);
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [hasContent, setHasContent] = useState<boolean>(false);
//   const [audioData, setAudioData] = useState<AudioData | null>(null);
//   const [isTrackEnded, setIsTrackEnded] = useState(false);
//   const [isGeneratingNewAudio, setIsGeneratingNewAudio] = useState<boolean>(false);
//   const [isAudioFavorite, setIsAudioFavorite] = useState(false);
//   const [currentAudioId, setCurrentAudioId] = useState<string | null>(null);
//   const [showPreferencesModal, setShowPreferencesModal] = useState(false);
//   const [preferences, setPreferences] = useState<Preference[]>([
//     { id: '1', name: 'Парки', selected: true },
//     { id: '2', name: 'Монументы', selected: true },
//     { id: '3', name: 'Музеи', selected: true },
//     { id: '4', name: 'Памятники', selected: true },
//     { id: '5', name: 'Рестораны', selected: true },
//     { id: '6', name: 'Кафе', selected: true },
//     { id: '7', name: 'Театры', selected: true },
//     { id: '8', name: 'Галереи', selected: true },
//     { id: '9', name: 'Соборы', selected: true },
//     { id: '10', name: 'Мосты', selected: true },
//     { id: '11', name: 'Площади', selected: true },
//     { id: '12', name: 'Улицы', selected: true },
//   ]);
//   const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
//   const [playlist, setPlaylist] = useState<AudioData[]>([]);

//   const togglePreference = (id: string) => {
//     setPreferences(prev => 
//       prev.map(item => 
//         item.id === id ? { ...item, selected: !item.selected } : item
//       )
//     );
//   };
  
//   const progress = useProgress();
//   const playbackState = usePlaybackState();

//   const getToken = async (): Promise<string | null> => {
//     try {
//         const token = await AsyncStorage.getItem('token');
//         return token;
//     } catch (error) {
//         console.error('Ошибка при получении токена:', error);
//         return null;
//     }
//   };

//   const { position, duration } = useProgress();

//   useEffect(() => {
//     if (duration > 0 && position >= duration) {
//       setIsTrackEnded(true);
//       setIsPlaying(false);
//     }
//   }, [position, duration]);

//   useEffect(() => {
//     if (playbackState.state === State.Playing) {
//       setIsPlaying(true);
//     } else if (playbackState.state === State.Paused || playbackState.state === State.Stopped) {
//       setIsPlaying(false);
//     }
//   }, [playbackState.state]);

//   const fetchAllAudio = async (): Promise<AudioData[]> => {
//     try {
//       setIsLoading(true);
//       const jwtToken = await getToken();
//       if (!jwtToken) throw new Error('Токен отсутствует');

//       const response = await fetch('http://109.172.31.90:8080/api/process-json-noauth', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json', 'Authorization': jwtToken },
//         body: JSON.stringify({ json_data: await myInstance.fetchData() }),
//       });
      
//       if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
//       const data = await response.json();

//       if (!Array.isArray(data)) throw new Error('Ответ сервера не является массивом');
//       if (data.length === 0) throw new Error('Нет данных в ответе сервера');

//       const validItems = data.filter(item => item.audio !== null);
//       if (validItems.length === 0) throw new Error('Нет доступного аудио');

//       const audioItems: AudioData[] = [];
      
//       for (const item of validItems) {
//         const filePath = `${RNFS.DocumentDirectoryPath}/audio_${Date.now()}_${item.place_name}.mp3`;
//         await RNFS.writeFile(filePath, item.audio, 'base64');
        
//         audioItems.push({
//           path: filePath,
//           text: item.response,
//           title: item.place_name
//         });
//       }

//       return audioItems;
//     } catch (error) {
//       console.error('Ошибка загрузки аудио:', error);
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const initializePlaylist = async () => {
//     try {
//       const audioItems = await fetchAllAudio();
//       setPlaylist(audioItems);
//       setCurrentTrackIndex(0);
//       return audioItems;
//     } catch (error) {
//       console.error('Ошибка при создании плейлиста:', error);
//       return [];
//     }
//   };

//   const playCurrentTrack = async () => {
//     if (playlist.length === 0 || currentTrackIndex >= playlist.length) return;

//     const currentTrack = playlist[currentTrackIndex];
    
//     try {
//       await TrackPlayer.reset();
//       await TrackPlayer.add({
//         id: `audio-track-${currentTrackIndex}`,
//         url: `file://${currentTrack.path}`,
//         title: currentTrack.title,
//         artist: 'Аудиогид',
//       });
      
//       setAudioText(currentTrack.text);
//       setAudioTextTitle(currentTrack.title);
      
//       const newItem = await saveAudioToHistory({
//         path: currentTrack.path,
//         text: currentTrack.text,
//         title: currentTrack.title
//       });
      
//       setCurrentAudioId(newItem.id);
//       const favoriteStatus = await isFavorite(newItem.id);
//       setIsAudioFavorite(favoriteStatus);
      
//       await TrackPlayer.play();
//       setIsPlaying(true);
//       setIsTrackEnded(false);
//     } catch (error) {
//       console.error('Ошибка воспроизведения:', error);
//     }
//   };

//   const handleTrackEnd = async () => {
//     if (currentTrackIndex < playlist.length - 1) {
//       setCurrentTrackIndex(prev => {
//         const newIndex = prev + 1;
//         if (showPlaylistModal) {
//           setShowPlaylistModal(false);
//           setShowPlaylistModal(true);
//         }
//         return newIndex;
//       });
//     } else {
//       setIsTrackEnded(true);
//     }
//   };

// new
// const handleTrackEnd = async () => {
//   try {
//     if (currentTrackIndex < playlist.length - 1) {
//       await TrackPlayer.reset(); // Сбросить перед переходом
//       setCurrentTrackIndex(prev => prev + 1);
//     } else {
//       setIsTrackEnded(true);
//       await TrackPlayer.pause();
//     }
//   } catch (error) {
//     console.error('Ошибка переключения трека:', error);
//   }
// };

//   useEffect(() => {
//     if (playlist.length > 0 && currentTrackIndex < playlist.length) {
//       playCurrentTrack();
//     }
//   }, [currentTrackIndex, playlist]);

//   useEffect(() => {
//     const listener = TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
//       handleTrackEnd();
//     });
  
//     return () => {
//       listener.remove();
//     };
//   }, [currentTrackIndex, playlist]);
  
//   const playAudio = async (): Promise<void> => {
//     if (isPlaying && !isTrackEnded) {
//       await pauseAudio();
//       return;
//     }

//     try {
//       if (isTrackEnded) {
//         const audioItems = await initializePlaylist();
//         if (audioItems.length > 0) {
//           setCurrentTrackIndex(0);
//         }
//         return;
//       }

//       if (playlist.length === 0) {
//         const audioItems = await initializePlaylist();
//         if (audioItems.length > 0) {
//           setCurrentTrackIndex(0);
//         }
//         return;
//       }

//       await TrackPlayer.play();
//       setIsPlaying(true);
//     } catch (error) {
//       console.error('Ошибка воспроизведения:', error);
//     }
//   };

//   const generateNewAudio = async () => {
//     try {
//       setIsGeneratingNewAudio(true);
//       const audioItems = await initializePlaylist();
//       if (audioItems.length > 0) {
//         setCurrentTrackIndex(0);
//       }
//     } catch (error) {
//       console.error('Ошибка генерации нового аудио:', error);
//     } finally {
//       setIsGeneratingNewAudio(false);
//     }
//   };

//   const pauseAudio = async (): Promise<void> => {
//     await TrackPlayer.pause();
//     setIsPlaying(false);
//   };

//   const playPauseAudio = async (): Promise<void> => {
//     if (isPlaying) {
//       await pauseAudio();
//     } else {
//       await playAudio();
//     }
//   };

//   const seekAudio = async (value: number): Promise<void> => {
//     await TrackPlayer.seekTo(value);
//   };

//   const formatTime = (time: number): string => {
//     const minutes = Math.floor(time / 60);
//     const seconds = Math.floor(time % 60);
//     return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
//   };

//   const forward15 = async (): Promise<void> => {
//     const position = await TrackPlayer.getPosition();
//     await TrackPlayer.seekTo(position + 15);
//   };

//   const backward15 = async (): Promise<void> => {
//     const position = await TrackPlayer.getPosition();
//     await TrackPlayer.seekTo(Math.max(position - 15, 0));
//   };

//   const moveToStart = async (): Promise<void> => {
//     if (playlist.length === 0) return;
  
//     const position = await TrackPlayer.getPosition();
//     if (position < 3) {
//       if (currentTrackIndex > 0) {
//         setCurrentTrackIndex(currentTrackIndex - 1);
//       } else {
//         await TrackPlayer.seekTo(0);
//       }
//     } else {
//       await TrackPlayer.seekTo(0);
//     }
//   };

//   const moveToEnd = async (): Promise<void> => {
//     if (playlist.length === 0) return;
  
//     if (currentTrackIndex < playlist.length - 1) {
//       setCurrentTrackIndex(currentTrackIndex + 1);
//     } else {
//       const duration = await TrackPlayer.getDuration();
//       await TrackPlayer.seekTo(duration);
//     }
//   };

//   const muteVolume = async (): Promise<void> => {
//     if (volume !== 0) {
//       setPreviousVolume(volume);
//     }
//     setVolume(0);
//     await VolumeManager.setVolume(0);
//   };

//   const unmuteVolume = async (): Promise<void> => {
//     if (previousVolume !== 0) {
//       setVolume(previousVolume);
//       await VolumeManager.setVolume(previousVolume);
//     } else {
//       const defaultVolume = 0.5;
//       setVolume(defaultVolume);
//       await VolumeManager.setVolume(defaultVolume);
//     }
//   };

//   const volumeChange = (newVolume: number): void => {
//     setVolume(newVolume);
//     VolumeManager.setVolume(newVolume);
//   };

//   const pan = useRef(new Animated.Value(80)).current;
//   // открытие слайдера меню 
//   const panResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => true,
//       onPanResponderMove: (_, gestureState) => {
//         if (gestureState.dy < 0) {
//           Animated.timing(pan, {
//             toValue: 80 - gestureState.dy,
//             duration: 50,
//             useNativeDriver: false,
//           }).start();
//         }
//       },
//       onPanResponderRelease: (_, gestureState) => {
//         if (gestureState.dy < 0) {
//           Animated.timing(pan, {
//             toValue: 410,
//             duration: 300,
//             useNativeDriver: false,
//           }).start(() => setIsExpanded(true));
//         } else {
//           Animated.timing(pan, {
//             toValue: 80,
//             duration: 300,
//             useNativeDriver: false,
//           }).start(() => {
//             setIsExpanded(false);
//             setAudioText('');
//             setAudioTextTitle('');
//           });
//         }
//       },
//     })
//   ).current;

//   const textDisplayManually = () => {
//     setShowTextManually(!showTextManually);
//   };

//   const generateContent = async () => {
//     try {
//       const audioItems = await fetchAllAudio();
      
//       if (audioItems.length === 0) {
//         Alert.alert('Аудио недоступно', 'Для этого места нет аудиозаписей.');
//         return;
//       }

//       setPlaylist(audioItems);
//       setCurrentTrackIndex(0);
//       setHasContent(true);
//     } catch (error) {
//       Alert.alert('Ошибка', 'Не удалось загрузить данные');
//     }
// };

//   useEffect(() => {
//     const setupVolumeManager = async () => {
//       try {
//         const currentVolume = await VolumeManager.getVolume();
//         setVolume(currentVolume.volume || 0);
        
//         if (!volumeListenerInitialized) {
//           const listener = VolumeManager.addVolumeListener((result) => {
//             setVolume(result.volume);
//           });
//           setVolumeListenerInitialized(true);
          
//           return () => {
//             listener.remove();
//           };
//         }
//       } catch (error) {
//         console.error('Ошибка при получении громкости:', error);
//       }
//     };
  
//     setupVolumeManager();
//   }, [volumeListenerInitialized]);

//   const toggleFavorite = async () => {
//     if (!currentAudioId) return;
    
//     try {
//       if (isAudioFavorite) {
//         await removeFromFavorites(currentAudioId);
//       } else {
//         await addToFavorites(currentAudioId);
//       }
//       setIsAudioFavorite(!isAudioFavorite);
//     } catch (error) {
//       console.error('Ошибка при обновлении избранного:', error);
//     }
//   };

//   useEffect(() => {
//     const updateFavoriteStatus = async () => {
//       if (currentAudioId) {
//         const status = await isFavorite(currentAudioId);
//         setIsAudioFavorite(status);
//       }
//     };
  
//     const unsubscribe = navigation.addListener('favoritesUpdated', updateFavoriteStatus);
  
//     updateFavoriteStatus();
  
//     return unsubscribe;
//   }, [navigation, currentAudioId]);

//   useEffect(() => {
//     const checkFavoriteStatus = async () => {
//       if (currentAudioId) {
//         const status = await isFavorite(currentAudioId);
//         setIsAudioFavorite(status);
//       }
//     };
//     checkFavoriteStatus();
//   }, [currentAudioId]);

//   useEffect(() => {
//     if (route?.params?.removedFavoriteId && currentAudioId === route.params.removedFavoriteId) {
//       setIsAudioFavorite(false);
//       navigation.setParams({ removedFavoriteId: undefined });
//     }
//   }, [route?.params?.removedFavoriteId, currentAudioId]);

//   useFocusEffect(
//     React.useCallback(() => {
//       if (currentAudioId) {
//         const checkStatus = async () => {
//           const status = await isFavorite(currentAudioId);
//           setIsAudioFavorite(status);
//         };
//         checkStatus();
//       }
//     }, [currentAudioId])
//   );

//   const PreferencesModal = () => {
//     const renderItem = ({ item, drag, isActive }: {
//       item: Preference;
//       drag: () => void;
//       isActive: boolean;
//     }) => {
//       return (
//         <Animated.View>
//           <TouchableOpacity
//             style={[
//               styles.preferenceItem,
//               isActive && styles.activePreferenceItem
//             ]}
//             onLongPress={drag}
//             onPress={() => togglePreference(item.id)}
//             activeOpacity={0.7}
//           >
//             <View style={styles.dragHandle}>
//               <Line width={24} height={24} color={theme.colors.text2} />
//             </View>
//             {/* {item.selected ? (
//               <CheckboxChecked width={24} height={24} />
//             ) : (
//               <CheckboxUnchecked width={24} height={24} />
//             )} */}
//             <Text style={styles.preferenceText}>{item.name}</Text>
//           </TouchableOpacity>
//         </Animated.View>
//       );
//     };
  
//     return (
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={showPreferencesModal}
//         onRequestClose={() => setShowPreferencesModal(false)}
//       >
//         <GestureHandlerRootView style={{ flex: 1 }}>
//           <View style={styles.modalOverlay}>
//             <View style={styles.modalContainer}>
//               <Text style={styles.modalTitle}>Настройте предпочтения</Text>
//               <Text style={styles.modalSubtitle}>Удерживайте и перемещайте для изменения порядка</Text>
              
//               <DraggableFlatList
//                 data={preferences}
//                 renderItem={renderItem}
//                 keyExtractor={(item) => item.id}
//                 onDragEnd={({ data }) => setPreferences(data)}
//                 contentContainerStyle={styles.preferencesList}
//                 activationDistance={10}
//                 autoscrollSpeed={50}
//               />
              
//               <TouchableOpacity 
//                 style={styles.modalCloseButton}
//                 onPress={() => setShowPreferencesModal(false)}
//               >
//                 <Text style={styles.modalCloseButtonText}>Готово</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </GestureHandlerRootView>
//       </Modal>
//     );
//   };

//   const GenerateContentSection = () => (
//     <View style={styles.generateContentContainer}>
//       <TouchableOpacity 
//         onPress={generateContent}
//         disabled={isLoading}
//         style={styles.generateButton}
//       >
//         <LinearGradient colors={['#2196F3', '#13578D']} style={styles.generateButtonGradient}>
//           {isLoading ? (
//             <ActivityIndicator color="#FFFFFF" />
//           ) : (
//             <>
//               <AIoutlined width={24} height={24} />
//               <Text style={styles.generateButtonText}>Сгенерировать рассказ</Text>
//             </>
//           )}
//         </LinearGradient>
//       </TouchableOpacity>
      
//       <TouchableOpacity 
//         style={styles.preferencesButton}
//         onPress={() => setShowPreferencesModal(true)}
//       >
//         <Settings width={24} height={24} color="#2196F3" />
//       </TouchableOpacity>
//     </View>
//   );

//   const PlaylistItem = React.memo(({ item, index, isCurrent, isPlaying, onPress }: {
//     item: AudioData;
//     index: number;
//     isCurrent: boolean;
//     isPlaying: boolean;
//     onPress: () => void;
//   }) => {
//     return (
//       <TouchableOpacity 
//         style={[
//           styles.playlistItem,
//           isCurrent && styles.currentTrackItem
//         ]}
//         onPress={onPress}
//       >
//         <Text style={styles.playlistItemText}>
//           {item.title || `Трек ${index + 1}`}
//         </Text>
//         {isCurrent && (
//           <View style={styles.playingIndicator}>
//             {isPlaying ? (
//               <Pause width={16} height={16} color="#2196F3" />
//             ) : (
//               <Play width={16} height={16} color="#2196F3" />
//             )}
//           </View>
//         )}
//       </TouchableOpacity>
//     );
//   });

//   const [showPlaylistModal, setShowPlaylistModal] = useState(false);

//   const PlaylistModal = () => {
//     const [internalVisible, setInternalVisible] = useState(false);
  
//     useEffect(() => {
//       if (showPlaylistModal) {
//         setInternalVisible(true);
//       } else {
//         const timer = setTimeout(() => setInternalVisible(false), 300);
//         return () => clearTimeout(timer);
//       }
//     }, [showPlaylistModal]);
  
//     const handleItemPress = async (index: number) => {
//       try {
//         setCurrentTrackIndex(index);
//         setShowPlaylistModal(false);
//         await new Promise(resolve => setTimeout(resolve, 100));
//         await playCurrentTrack();
//       } catch (error) {
//         console.error('Ошибка при выборе трека:', error);
//       }
//     };
  
//     if (!internalVisible) return null;
  
//     return (
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={showPlaylistModal}
//         onRequestClose={() => setShowPlaylistModal(false)}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.playlistModalContainer}>
//             <Text style={styles.playlistTitle}>Плейлист</Text>
            
//             <FlatList
//               data={playlist}
//               keyExtractor={(item, index) => `track-${index}`}
//               renderItem={({ item, index }) => (
//                 <PlaylistItem 
//                   item={item}
//                   index={index}
//                   isCurrent={index === currentTrackIndex}
//                   isPlaying={false} // Всегда показываем иконку паузы в плейлисте
//                   onPress={() => handleItemPress(index)}
//                 />
//               )}
//               extraData={currentTrackIndex}
//             />
            
//             <TouchableOpacity 
//               style={styles.closePlaylistButton}
//               onPress={handleClosePlaylist}
//             >
//               <Text style={styles.closePlaylistButtonText}>Закрыть</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     );
//   };

//   const wasPlayingBeforeOpen = useRef(false);

//   const handleOpenPlaylist = async () => {
//     try {
//       wasPlayingBeforeOpen.current = isPlaying;
//       // Ставим аудио на паузу, если оно играет
//       if (isPlaying) {
//         await TrackPlayer.pause();
//         setIsPlaying(false);
//         await new Promise(resolve => setTimeout(resolve, 1000));
//       }
      
//       // Затем открываем плейлист
//       setShowPlaylistModal(true);
      
//     } catch (error) {
//       console.error('Ошибка при открытии плейлиста:', error);
//     }
//   };

//   const handleClosePlaylist = async () => {
//     try {
//       // Закрываем плейлист
//       setShowPlaylistModal(false);
      
//       // Добавляем небольшую задержку для стабилизации UI
//       await new Promise(resolve => setTimeout(resolve, 300));
      
//       // Проверяем, было ли аудио на паузе перед открытием плейлиста
//       if (wasPlayingBeforeOpen.current) {
//         await TrackPlayer.play();
//         setIsPlaying(true);
//       }
      
//     } catch (error) {
//       console.error('Ошибка при возобновлении воспроизведения:', error);
//     }
//   };

//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
//         <KeyboardAvoidingView style={styles.container}>
//           <View style={styles.mapComponent}>
//             <Map />
//           </View>

//           <TouchableOpacity 
//             style={styles.playlistButton}
//             // onPress={() => setShowPlaylistModal(true)}
//             onPress={handleOpenPlaylist}
//           >
//             <Text style={styles.playlistButtonText}>Плейлист</Text>
//           </TouchableOpacity>


//           {hasContent && (
//             <TouchableOpacity 
//               style={styles.backButton}
//               onPress={() => {
//                 setHasContent(false);
//                 setAudioText('');
//                 setAudioTextTitle('');
//                 setAudioUrl(null);
//                 TrackPlayer.reset();
//                 setIsPlaying(false);
//               }}
//             >
//               <Text style={styles.backButtonText}>Назад</Text>
//             </TouchableOpacity>
//           )}

//           {!hasContent ? (
//             <GenerateContentSection />
//           ) : (
//             <>
//               {isExpanded ? (
//                 <View style={[styles.bottomContainer, { height: containerHeight }]}>
//                   {showTextManually && audioText ? (
//                     <View style={styles.textContentContainer}>
//                       <Animated.View style={styles.swipeElement} {...panResponder.panHandlers}>
//                         <Line width={24} height={24} color={theme.colors.text} />
//                       </Animated.View>
//                       <View style={styles.textContentMainContainer}>
//                         <View style={styles.textContentTopContainer}>
//                           <Text style={styles.textContentTitle}>{audioTextTitle}</Text>
//                           <TouchableOpacity onPress={textDisplayManually}>
//                             <ShowText width={24} height={24} color={theme.colors.text} />
//                           </TouchableOpacity>
//                         </View>
//                         <ScrollView style={styles.textScrollView}>
//                           <Text style={styles.audioText}>{audioText}</Text>
//                         </ScrollView>
//                       </View>
//                     </View>
//                   ) : (
//                     <>
//                       <Animated.View style={styles.swipeElement} {...panResponder.panHandlers}>
//                         <Line width={24} height={24} color={theme.colors.text} />
//                       </Animated.View>
//                       <View style={styles.bottomSubTopContainerExpanded}>
//                         <Text style={styles.timeText}>{formatTime(progress.position)}</Text>
//                         <Slider
//                           style={styles.sliderTrack}
//                           minimumValue={0}
//                           maximumValue={progress.duration}
//                           value={progress.position}
//                           onSlidingComplete={seekAudio}
//                           minimumTrackTintColor="#2196F3"
//                           maximumTrackTintColor="#13578D"
//                           thumbTintColor="#2196F3"
//                           // thumbImage={require('../../assets/images/icons/thumbImage.png')}
//                         />
//                         <Text style={styles.timeText}>{formatTime(progress.duration)}</Text>
//                       </View>
//                       <View style={styles.bottomSubMidContainerExpanded}>
//                         <TouchableOpacity onPress={moveToStart}>
//                           <Previous width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
//                         </TouchableOpacity>
//                         <TouchableOpacity onPress={backward15}>
//                           <Minus15 width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
//                         </TouchableOpacity>
//                         <TouchableOpacity style={styles.playPauseButtonSubContainer} onPress={playPauseAudio} disabled={isGeneratingNewAudio}>
//                           <LinearGradient colors={['#2196F3', '#13578D']} style={styles.playPauseButtonContainer}>
//                             {isGeneratingNewAudio ? (
//                               <ActivityIndicator size="large" color="#2196F3" />
//                             ) : (
//                               <LinearGradient colors={['#2196F3', '#13578D']} style={styles.playPauseButtonContainer}>
//                                 {isPlaying && !isTrackEnded ? (
//                                   <PauseWhite width={24} height={24} color={theme.colors.text} />
//                                 ) : (
//                                   <PlayWhite width={24} height={24} color={theme.colors.text} />
//                                 )}
//                               </LinearGradient>
//                             )}
//                           </LinearGradient>
//                         </TouchableOpacity>
//                         <TouchableOpacity onPress={forward15}>
//                           <Plus15 width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
//                         </TouchableOpacity>
//                         <TouchableOpacity onPress={moveToEnd}>
//                           <Next width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
//                         </TouchableOpacity>
//                       </View>
//                       <View style={styles.bottomSubBotContainerExpanded}>
//                         <View style={styles.bottomSubBotContainerLeftExpanded}>
//                         <TouchableOpacity onPress={toggleFavorite}>
//                           <Like 
//                             width={24} 
//                             height={24} 
//                             color={isAudioFavorite ? theme.colors.primary : (isPlaying ? theme.colors.text : theme.colors.text2)} 
//                             fill={isAudioFavorite ? theme.colors.primary : 'none'}
//                           />
//                         </TouchableOpacity>
//                           <TouchableOpacity>
//                             <Settings width={24} height={24} color={theme.colors.text} />
//                           </TouchableOpacity>
//                         </View>
//                         <TouchableOpacity 
//                           onPress={generateNewAudio}
//                           disabled={isGeneratingNewAudio}
//                         >
//                           {isGeneratingNewAudio ? (
//                             // <ActivityIndicator size="small" color="#2196F3" />
//                             <AIoutlinedBlue width={24} height={24} />
//                           ) : (
//                             <AIoutlinedBlue width={24} height={24} />
//                           )}
//                         </TouchableOpacity>
//                         <View style={styles.bottomSubBotContainerRightExpanded}>
//                           <TouchableOpacity onPress={textDisplayManually}>
//                             <ShowText width={24} height={24} color={theme.colors.text} />
//                           </TouchableOpacity>
//                           <TouchableOpacity>
//                             <Download width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
//                           </TouchableOpacity>
//                         </View>
//                       </View>
//                       <View style={styles.sliderVolumeContainer}>
//                         <TouchableOpacity onPress={muteVolume}>
//                           <VolumeOff width={24} height={24} color={theme.colors.text} />
//                         </TouchableOpacity>
//                         <Slider
//                           style={styles.sliderVolume}
//                           minimumValue={0}
//                           maximumValue={1}
//                           value={volume}
//                           onValueChange={volumeChange}
//                           minimumTrackTintColor="#2196F3"
//                           maximumTrackTintColor="#13578D"
//                           thumbTintColor="#2196F3"
//                           // thumbImage={require('../../assets/images/icons/thumbVolumeImage.png')}
//                         />
//                         <TouchableOpacity onPress={unmuteVolume}>
//                           <VolumeOn width={24} height={24} color={theme.colors.text} />
//                         </TouchableOpacity>
//                       </View>
//                     </>
//                   )}
//                 </View>
//               ) : (
//                 <View style={[styles.bottomContainer, { height: containerHeight }]}>
//                   <Animated.View style={styles.swipeElement} {...panResponder.panHandlers}>
//                     <Line width={24} height={24} color={theme.colors.text} />
//                   </Animated.View>
//                   <View style={styles.bottomSubContainer}>
//                     <TouchableOpacity style={styles.bottomSubContainerLeft}>
//                       <Settings width={24} height={24} color={theme.colors.text} />
//                     </TouchableOpacity>
//                     <View style={styles.bottomSubContainerCenter}>
//                       <TouchableOpacity onPress={moveToStart}>
//                         <Previous width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
//                       </TouchableOpacity>
//                       <TouchableOpacity onPress={backward15}>
//                         <Minus15 width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
//                       </TouchableOpacity>
//                       <TouchableOpacity onPress={playPauseAudio}>
//                         {isPlaying ? (
//                           <Pause width={24} height={24} color={theme.colors.text} />
//                         ) : (
//                           <Play width={24} height={24} color={theme.colors.text} />
//                         )}
//                       </TouchableOpacity>
//                       <TouchableOpacity onPress={forward15}>
//                         <Plus15 width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
//                       </TouchableOpacity>
//                       <TouchableOpacity onPress={moveToEnd}>
//                         <Next width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
//                       </TouchableOpacity>
//                     </View>
//                     <TouchableOpacity onPress={toggleFavorite}>
//                       <Like 
//                         width={24} 
//                         height={24} 
//                         color={isAudioFavorite ? theme.colors.primary : (isPlaying ? theme.colors.text : theme.colors.text2)} 
//                         fill={isAudioFavorite ? theme.colors.primary : 'none'}
//                       />
//                     </TouchableOpacity>
//                   </View>
//                 </View>
//               )}
//             </>
//           )}
//           <PlaylistModal />
//           <PreferencesModal />
//         </KeyboardAvoidingView>
//       </TouchableWithoutFeedback>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     fontFamily: theme.fonts.regular,
//   },
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#FFFFFF',
//   },
//   mapComponent: {
//     flex: 1,
//   },
//   bottomContainer: {
//     position: 'absolute',
//     bottom: 0,
//     width: '100%',
//     paddingLeft: 16,
//     paddingRight: 16,
//     backgroundColor: theme.colors.background,
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     minHeight: 80,
//     // minHeight: 240,
//     maxHeight: 410,
//     // borderBottomWidth: 1,
//     // borderBottomColor: theme.colors.text2,
//   },
//   swipeElement: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     marginBottom: 10,
//   },
//   textContentContainer: {
//     flex: 1,
//     // paddingBottom: 16,
//   },
//   textContentMainContainer: {
//     flexDirection: 'column',
//   },
//   textContentTopContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   textContentTitle: {
//     fontWeight: 600,
//     fontSize: 22,
//     color: theme.colors.text,
//   },
//   textScrollView: {
//     // flex: 1,
//     marginTop: 16,
//     marginBottom: 16,
//   },
//   audioText: {
//     fontSize: 16,
//     color: theme.colors.text,
//     lineHeight: 24,
//   },
//   bottomSubContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   bottomSubContainerLeft: {},
//   bottomSubContainerCenter: {
//     flexDirection: 'row',
//     gap: 20,
//   },
//   bottomSubContainerRight: {},
//   sliderVolumeContainer: {
//     justifyContent: 'space-between',
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//     marginTop: 20,
//   },
//   sliderVolume: {
//     flex: 1,
//     height: 20,
//   },
//   bottomSubTopContainerExpanded: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 16,
//   },
//   sliderTrack: {
//     flex: 1,
//     height: 20,
//   },
//   timeText: {
//     fontSize: 14,
//     color: '#000',
//     textAlign: 'center',
//   },
//   bottomSubMidContainerExpanded: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingLeft: 13,
//     paddingRight: 13,
//   },
//   playPauseButtonContainer: {
//     width: 76,
//     height: 76,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 100,
//     marginLeft: 12,
//     marginRight: 12,
//   },
//   playPauseButtonSubContainer: {
//     zIndex: 50,
//     alignItems: 'center',
//   },
//   bottomSubBotContainerExpanded: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingLeft: 13,
//     paddingRight: 13,
//     marginTop: 16,
//   },
//   bottomSubBotContainerLeftExpanded: {
//     flexDirection: 'row',
//     gap: 40,
//   },
//   bottomSubBotContainerRightExpanded: {
//     flexDirection: 'row',
//     gap: 40,
//   },



//   generateContentContainer: {
//     position: 'absolute',
//     bottom: 40,
//     width: '100%',
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   generateButton: {
//     flex: 1,
//     marginRight: 10,
//   },
//   generateButtonGradient: {
//     backgroundColor: '#2196F3',
//     paddingVertical: 16,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 6,
//   },
//   generateButtonText: {
//     color: '#FFFFFF',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   preferencesButton: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: 'white',
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 3,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'flex-end',
//   },
//   modalContainer: {
//     backgroundColor: 'white',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     padding: 20,
//     // maxHeight: '70%',
//   },
//   modalTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//     color: theme.colors.text,
//   },
//   modalSubtitle: {
//     fontSize: 14,
//     color: theme.colors.text2,
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   preferencesList: {
//     paddingBottom: 20,
//   },
//   preferenceItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: theme.colors.text2,
//     backgroundColor: 'white',
//   },
//   // activePreferenceItem: {
//   //   backgroundColor: '#f5f5f5',
//   // },
//   activePreferenceItem: {
//     backgroundColor: '#f5f5f5',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//     transform: [{ scale: 1.01 }],
//   },
//   dragHandle: {
//     marginRight: 12,
//     opacity: 0.5,
//   },
//   preferenceText: {
//     marginLeft: 12,
//     fontSize: 16,
//     color: theme.colors.text,
//   },
//   modalCloseButton: {
//     backgroundColor: '#2196F3',
//     padding: 16,
//     borderRadius: 20,
//     alignItems: 'center',
//     marginTop: 10,
//   },
//   modalCloseButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   backButton: {
//     position: 'absolute',
//     top: 16,
//     left: 16,
//     zIndex: 100,
//     backgroundColor: 'rgba(255, 255, 255, 0.8)',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#2196F3',
//   },
//   backButtonText: {
//     color: '#2196F3',
//     fontSize: 16,
//     fontWeight: '500',
//   },


//   //стили к плейлисту:
//   playlistButton: {
//     position: 'absolute',
//     top: 16,
//     right: 16,
//     zIndex: 100,
//     backgroundColor: 'rgba(255, 255, 255, 0.8)',
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: '#2196F3',
//   },
//   playlistButtonText: {
//     color: '#2196F3',
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   playlistModalContainer: {
//     backgroundColor: 'white',
//     margin: 20,
//     borderRadius: 20,
//     padding: 20,
//     maxHeight: '80%',
//   },
//   playlistTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 15,
//     textAlign: 'center',
//     color: theme.colors.text,
//   },
//   playlistItem: {
//     padding: 15,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   currentTrackItem: {
//     backgroundColor: 'rgba(33, 150, 243, 0.1)',
//   },
//   playlistItemText: {
//     fontSize: 16,
//     color: theme.colors.text,
//     flex: 1,
//   },
//   playingIndicator: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     height: 20,
//     marginLeft: 10,
//   },
//   playingBar: {
//     width: 3,
//     height: 15,
//     backgroundColor: '#2196F3',
//     marginHorizontal: 2,
//   },
//   closePlaylistButton: {
//     marginTop: 15,
//     padding: 12,
//     backgroundColor: '#2196F3',
//     borderRadius: 20,
//     alignItems: 'center',
//   },
//   closePlaylistButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
// });

// export default HomeScreen;




import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
  PanResponder,
  Animated,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
  Switch,
} from 'react-native';
// import Modal from 'react-native-modal';
import Map from '../components/Map';
import { theme } from '../../theme';
import CheckboxUnchecked from '../../assets/images/icons/chevron-right-icon.svg';
import CheckboxChecked from '../../assets/images/icons/chevron-left-blue.svg';
import Settings from '../../assets/images/icons/settings.svg';
import Previous from '../../assets/images/icons/previous.svg';
import Minus15 from '../../assets/images/icons/minus15.svg';
import Play from '../../assets/images/icons/play.svg';
import PlayWhite from '../../assets/images/icons/play-white.svg';
import Plus15 from '../../assets/images/icons/plus15.svg';
import Next from '../../assets/images/icons/next.svg';
import Like from '../../assets/images/icons/like.svg';
import Line from '../../assets/images/icons/line.svg';
import Pause from '../../assets/images/icons/pause.svg';
import PauseWhite from '../../assets/images/icons/pause-white.svg';
import Download from '../../assets/images/icons/download.svg';
import ShowText from '../../assets/images/icons/text-btn.svg';
import VolumeOn from '../../assets/images/icons/volume_on.svg';
import VolumeOff from '../../assets/images/icons/volume_off.svg';
import AIoutlined from '../../assets/images/icons/ai-outlined-icon.svg';
import AIoutlinedBlue from '../../assets/images/icons/ai-outlined-blue.svg';
import AIfiled from '../../assets/images/icons/ai-filled-icon.svg';
import { VolumeManager } from 'react-native-volume-manager';
import Slider from '@react-native-community/slider';
import LinearGradient from 'react-native-linear-gradient';
import TrackPlayer, { State, useProgress, usePlaybackState, PlaybackTrackChangedEvent, Event } from 'react-native-track-player';
import { Suggest  } from 'react-native-yamap';
// import TrackPlayer, { State, useProgress, usePlaybackState } from 'react-native-track-player';
import { PermissionsAndroid ,Platform } from 'react-native';
// import { useCallback  } from 'react';
// import RNFS from 'react-native-fs';
import Geolocation from 'react-native-geolocation-service';
import { accelerometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';
// import { GeoFigureType } from 'react-native-yamap/build/Search';
import {ClassTimer,Coordinates} from './test.tsx';
import { Geocoder } from 'react-native-yamap';
import base64 from 'base-64';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addToFavorites, removeFromFavorites, saveAudioToHistory, isFavorite } from '../../services/AudioService.ts';
import { useFocusEffect } from '@react-navigation/native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// import Animated from 'react-native-reanimated';

Geocoder.init('500f7015-58c8-477a-aa0c-556ea02c2d9e');

type AudioData = {
  path: string;
  text: string;
  title: string;
};

type Preference = {
  id: string;
  name: string;
  selected: boolean;
};

interface HomeScreenProps {
  navigation: any;
  route?: {
    params?: {
      removedFavoriteId?: string;
    };
  };
}

function HomeScreen({ navigation, route }: HomeScreenProps): React.JSX.Element {
  type Position = {
    latitude: number;
    longitude: number;
  };

  type TransportMode = 'pedestrian' | 'scooter' | 'car' ;

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0);
  const [volumeListenerInitialized, setVolumeListenerInitialized] = useState(false);
  const [containerHeight] = useState<number | 'auto'>('auto');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [previousVolume, setPreviousVolume] = useState<number>(volume);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [parentPosition, setParentPosition] = useState<{ lat: number; lon: number } | null>(null);
  const myInstance = new ClassTimer();
  const [audioText, setAudioText] = useState<string>('');
  const [audioTextTitle, setAudioTextTitle] = useState<string>('');
  const [showTextManually, setShowTextManually] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasContent, setHasContent] = useState<boolean>(false);
  const [audioData, setAudioData] = useState<AudioData | null>(null);
  const [isTrackEnded, setIsTrackEnded] = useState(false);
  const [isGeneratingNewAudio, setIsGeneratingNewAudio] = useState<boolean>(false);
  const [isAudioFavorite, setIsAudioFavorite] = useState(false);
  const [currentAudioId, setCurrentAudioId] = useState<string | null>(null);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [preferences, setPreferences] = useState<Preference[]>([
    { id: '1', name: 'Парки', selected: true },
    { id: '2', name: 'Монументы', selected: true },
    { id: '3', name: 'Музеи', selected: true },
    { id: '4', name: 'Памятники', selected: true },
    { id: '5', name: 'Рестораны', selected: true },
    { id: '6', name: 'Кафе', selected: true },
    { id: '7', name: 'Театры', selected: true },
    { id: '8', name: 'Галереи', selected: true },
    { id: '9', name: 'Соборы', selected: true },
    { id: '10', name: 'Мосты', selected: true },
    { id: '11', name: 'Площади', selected: true },
    { id: '12', name: 'Улицы', selected: true },
  ]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [playlist, setPlaylist] = useState<AudioData[]>([]);

  const [useAlternativeEndpoint, setUseAlternativeEndpoint] = useState(false);

  const togglePreference = (id: string) => {
    setPreferences(prev => 
      prev.map(item => 
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };
  
  const progress = useProgress();
  const playbackState = usePlaybackState();

  const getToken = async (): Promise<string | null> => {
    try {
        const token = await AsyncStorage.getItem('token');
        return token;
    } catch (error) {
        console.error('Ошибка при получении токена:', error);
        return null;
    }
  };

  const { position, duration } = useProgress();

  useEffect(() => {
    if (duration > 0 && position >= duration) {
      setIsTrackEnded(true);
      setIsPlaying(false);
    }
  }, [position, duration]);

  //NEw
  const [isActive, setIsActive] = useState(false);
  const [radius, setRadius] = useState(500);
  const [speed, setSpeed] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [transportMode, setTransportMode] = useState<TransportMode>('pedestrian');
  const [status, setStatus] = useState('Нажмите "Начать отслеживание"');

  // Референсы
  const zoneCenterRef = useRef<Position | null>(null);
  const positionHistoryRef = useRef<Position[]>([]);
  const gpsWatchIdRef = useRef<number | null>(null);
  const accelSubscriptionRef = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Настройки режимов
  const MODE_SETTINGS = {
    pedestrian: { maxSpeed: 2, radius: 500 },
    scooter: { maxSpeed: 8, radius: 1500 },
    car: { maxSpeed: 20, radius: 3000 },
  };

  // 1. Запрос разрешений
  const requestPermissions = useCallback(async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);
      return granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted';
    }
    return true;
  }, []);

  // 2. Инициализация WebSocket
  // const initWebSocket = useCallback(() => {
  //   wsRef.current = new WebSocket('ws://149.154.69.184:8080/ws/process-json-noauth');

  //   wsRef.current.onopen = () => {
  //     console.log('WebSocket подключен');
  //   };

  //   wsRef.current.onerror = (error) => {
  //     console.error('WebSocket ошибка:', error);
  //     setStatus('Ошибка подключения к серверу');
  //   };
  //   wsRef.current.onmessage = async (event) => {
  //     const data = JSON.parse(event.data);
  //     await playAudioStream(data.content);
  //   } 
  // }, []);

  const initWebSocket = useCallback(() => {
    const endpoint = useAlternativeEndpoint 
      ? 'ws://149.154.69.184:8080/ws/process-json-mistral' 
      : 'ws://149.154.69.184:8080/ws/process-json-noauth';
  
    wsRef.current = new WebSocket(endpoint);
  
    wsRef.current.onopen = () => {
      console.log('WebSocket подключен к:', endpoint);
    };
  
    wsRef.current.onerror = (error) => {
      console.error('WebSocket ошибка:', error);
      setStatus('Ошибка подключения к серверу');
    };
  
    wsRef.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      await playAudioStream(data.content);
    };
  }, [useAlternativeEndpoint]);

  // 3. Отправка данных на сервер
  const sendLocationData = useCallback(async () => {
    if (!currentPosition) return false;
    if(parentPosition==null)return false;
    const requestCoords: Coordinates = {
      lat: parentPosition.lat,
      lon: parentPosition.lon
    };
    try {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN || wsRef.current==null ) {
        await initWebSocket();
      }
      wsRef.current?.send(JSON.stringify({
        json_data: myInstance.fetchData(requestCoords)
      }));
      
       
      setStatus(`Данные отправлены (${new Date().toLocaleTimeString()})`);
      return true;
    } catch (error) {
      console.error('Ошибка отправки:', error);
      setStatus('Ошибка отправки данных');
      return false;
    }
  }, [currentPosition, speed, transportMode, initWebSocket]);

  // 4. Запуск отслеживания
  const startTracking = useCallback(async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('Ошибка', 'Необходимы разрешения на геолокацию');
      return;
    }

    // Первая отправка данных
    const success = await sendLocationData();
    if (!success) return;

    // Начинаем отслеживание позиции
    gpsWatchIdRef.current = Geolocation.watchPosition(
      position => {
        const { latitude, longitude, speed: gpsSpeed } = position.coords;
        const newPos = { latitude, longitude };
        
        setCurrentPosition(newPos);
        positionHistoryRef.current = [...positionHistoryRef.current.slice(-5), newPos];
        
        if (gpsSpeed && gpsSpeed > 0) {
          setSpeed(gpsSpeed);
        }
      },
      error => {
        console.error('Ошибка геолокации:', error);
        setStatus('Ошибка получения местоположения');
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 5,
        interval: 3000,
        fastestInterval: 1000
      }
    );

    // Запуск акселерометра
    setUpdateIntervalForType(SensorTypes.accelerometer, 1000);
    accelSubscriptionRef.current = accelerometer.subscribe(({ x, y, z }) => {
      const acceleration = Math.sqrt(x*x + y*y + z*z);
      if (acceleration > 1.5) {
        setSpeed(prev => Math.min(prev + 0.5, 25));
      }
    });

    setIsActive(true);
    setStatus('Отслеживание активно');
  }, [requestPermissions, sendLocationData]);

  // 5. Остановка отслеживания
  const stopTracking = useCallback(() => {
    if (gpsWatchIdRef.current) {
      Geolocation.clearWatch(gpsWatchIdRef.current);
      gpsWatchIdRef.current = null;
    }
    
    if (accelSubscriptionRef.current) {
      accelSubscriptionRef.current.unsubscribe();
      accelSubscriptionRef.current = null;
    }
    
    zoneCenterRef.current = null;
    setIsActive(false);
    setStatus('Отслеживание остановлено');
  }, []);

  // 6. Проверка выхода за границы зоны
  const checkZoneBoundary = useCallback((pos: Position, center: Position, radius: number) => {
    const toRad = (val: number) => val * Math.PI / 180;
    const R = 6371e3;
    const dLat = toRad(pos.latitude - center.latitude);
    const dLon = toRad(pos.longitude - center.longitude);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(center.latitude)) * Math.cos(toRad(pos.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) > radius;
  }, []);

  // 7. Определение режима транспорта и радиуса
  useEffect(() => {
    if (!isActive || !currentPosition) return;

    let newMode: TransportMode = 'pedestrian';
    if (speed >= MODE_SETTINGS.car.maxSpeed * 0.8) {
      newMode = 'car';
    } else if (speed >= MODE_SETTINGS.scooter.maxSpeed * 0.7) {
      newMode = 'scooter';
    }

    setTransportMode(newMode);
    const newRadius = MODE_SETTINGS[newMode].radius;
    setRadius(newRadius);

    // Инициализация или проверка зоны
    if (!zoneCenterRef.current) {
      zoneCenterRef.current = currentPosition;
      return;
    }

    if (checkZoneBoundary(currentPosition, zoneCenterRef.current, newRadius)) {
      Alert.alert(
        'Смена зоны',
        `Вы вышли за границы (${radius}m). Новая зона: ${newRadius}m`,
        [{ 
          text: 'OK', 
          onPress: async () => {
            zoneCenterRef.current = currentPosition;
            await sendLocationData();
          } 
        }]
      );
    }
  }, [currentPosition, speed, isActive, checkZoneBoundary, radius, sendLocationData]);
  //

  const handlePositionUpdate = (newPosition: { lat: number; lon: number }) => {
    setParentPosition(newPosition);
  };
  useEffect(() => {
    if (playbackState.state === State.Playing) {
      setIsPlaying(true);
    } else if (playbackState.state === State.Paused || playbackState.state === State.Stopped) {
      setIsPlaying(false);
    }
  }, [playbackState.state]);


  const fetchAllAudio = async (): Promise<AudioData[]> => {
    try {
      setIsLoading(true);
      const jwtToken = await getToken();
      if (!jwtToken) throw new Error('Токен отсутствует');

     if (!parentPosition) {
       throw new Error('Координаты не определены');
     }
  
     const requestCoords: Coordinates = {
       lat: parentPosition.lat,
       lon: parentPosition.lon
     };

      // Выбираем endpoint в зависимости от состояния переключателя
      const endpoint = useAlternativeEndpoint 
        ? 'http://109.172.31.90:8080/api/process-json-mistral' 
        : 'http://109.172.31.90:8080/api/process-json-noauth';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': jwtToken },
        body: JSON.stringify({ json_data: await myInstance.fetchData(requestCoords) }),
      });
      
      if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
      const data = await response.json();

      if (!Array.isArray(data)) throw new Error('Ответ сервера не является массивом');
      if (data.length === 0) throw new Error('Нет данных в ответе сервера');

      const validItems = data.filter(item => item.audio !== null);
      if (validItems.length === 0) throw new Error('Нет доступного аудио');

      const audioItems: AudioData[] = [];
      
      for (const item of validItems) {
        const filePath = `${RNFS.DocumentDirectoryPath}/audio_${Date.now()}_${item.place_name}.mp3`;
        await RNFS.writeFile(filePath, item.audio, 'base64');
        
        audioItems.push({
          path: filePath,
          text: item.response,
          title: item.place_name
        });
      }

      return audioItems;
    } catch (error) {
      console.error('Ошибка загрузки аудио:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // const fetchAllAudio = async (): Promise<AudioData | null> => {
  //   try {
  //     setIsLoading(true);
  //     const jwtToken = await getToken();
  //     if (!jwtToken) throw new Error('Токен отсутствует');

  //     // Получаем текущие координаты из состояния компонента
  //     if (!parentPosition) {
  //       throw new Error('Координаты не определены');
  //     }
      
  //     const requestCoords: Coordinates = {
  //       lat: parentPosition.lat,
  //       lon: parentPosition.lon
  //     };
  
  //     const endpoint = useAlternativeEndpoint 
  //       ? 'http://109.172.31.90:8080/api/process-json-mistral' 
  //       : 'http://109.172.31.90:8080/api/process-json-noauth';
  
  //     const response = await fetch(endpoint, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json', 'Authorization': jwtToken },
  //       body: JSON.stringify({ json_data: await myInstance.fetchData(requestCoords) }),
  //     });
      
  //     if (!response.ok) {
  //       const errorData = await response.json().catch(() => null);
  //       throw new Error(`Ошибка: ${response.status} - ${errorData?.message || 'Неизвестная ошибка сервера'}`);
  //     }
  
  //     const data = await response.json();
  
  //     if (!Array.isArray(data)) throw new Error('Ответ сервера не является массивом');
  //     if (data.length === 0) throw new Error('Нет данных в ответе сервера');
  
  //     const validItem = data.find(item => 
  //       item.audio !== null && 
  //       item.audio !== undefined &&
  //       item.place_name && 
  //       typeof item.place_name === 'string' &&
  //       !item.place_name.toLowerCase().startsWith('node') && // Новое условие
  //       item.response
  //     );
  
  //     if (!validItem) throw new Error('Не найдено подходящего аудио (проверьте place_name и audio)');
  
  //     const filePath = `${RNFS.DocumentDirectoryPath}/audio_${Date.now()}_${validItem.place_name.replace(/[^a-z0-9]/gi, '_')}.mp3`;
  //     await RNFS.writeFile(filePath, validItem.audio, 'base64');
      
  //     return {
  //       path: filePath,
  //       text: validItem.response,
  //       title: validItem.place_name
  //     };
  //   } catch (error) {
  //     console.error('Ошибка загрузки аудио:', error);
  //     throw error;
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const initializePlaylist = async () => {
    try {
      // Удаляем старые аудиофайлы
      await Promise.all(
        playlist.map(track => RNFS.unlink(track.path).catch(console.warn))
      );

      const audioItems = await fetchAllAudio();
      setPlaylist(audioItems);
      setCurrentTrackIndex(0);
      return audioItems;
    } catch (error) {
      console.error('Ошибка при создании плейлиста:', error);
      return [];
    }
  };

  // const initializePlaylist = async () => {
  //   try {
  //     // Удаляем старый аудиофайл
  //     if (playlist.length > 0) {
  //       await RNFS.unlink(playlist[0].path).catch(console.warn);
  //     }

  //     const audioItem = await fetchAllAudio();
  //     if (!audioItem) return [];

  //     // Создаем плейлист с одним треком
  //     const singleItemPlaylist = [audioItem];
  //     setPlaylist(singleItemPlaylist);
  //     setCurrentTrackIndex(0);
  //     return singleItemPlaylist;
  //   } catch (error) {
  //     console.error('Ошибка при создании плейлиста:', error);
  //     return [];
  //   }
  // };

  const playCurrentTrack = async () => {
    if (playlist.length === 0 || currentTrackIndex >= playlist.length) return;

    const currentTrack = playlist[currentTrackIndex];
    
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: `audio-track-${currentTrackIndex}-${Date.now()}`,
        url: `file://${currentTrack.path}`,
        title: currentTrack.title,
        artist: 'Аудиогид',
      });
      
      setAudioText(currentTrack.text);
      setAudioTextTitle(currentTrack.title);
      
      const newItem = await saveAudioToHistory({
        path: currentTrack.path,
        text: currentTrack.text,
        title: currentTrack.title
      });
      
      setCurrentAudioId(newItem.id);
      const favoriteStatus = await isFavorite(newItem.id);
      setIsAudioFavorite(favoriteStatus);
      
      await TrackPlayer.play();
      setIsPlaying(true);
      setIsTrackEnded(false);
    } catch (error) {
      console.error('Ошибка воспроизведения:', error);
    }
  };

  const handleTrackEnd = async () => {
    try {
      if (currentTrackIndex < playlist.length - 1) {
        await TrackPlayer.reset(); // Сбросить перед переходом
        setCurrentTrackIndex(prev => prev + 1);
      } else {
        setIsTrackEnded(true);
        await TrackPlayer.pause();
      }
    } catch (error) {
      console.error('Ошибка переключения трека:', error);
    }
  };

  useEffect(() => {
    if (playlist.length > 0 && currentTrackIndex < playlist.length) {
      playCurrentTrack();
    }
  }, [currentTrackIndex, playlist]);

  useEffect(() => {
    const listener = TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
      handleTrackEnd();
    });
  
    return () => {
      listener.remove();
    };
  }, [currentTrackIndex, playlist]);
  
  // const playAudio = async (): Promise<void> => {
  //   if (isPlaying && !isTrackEnded) {
  //     await pauseAudio();
  //     return;
  //   }

  //   try {
  //     if (isTrackEnded) {
  //       const audioItems = await initializePlaylist();
  //       if (audioItems.length > 0) {
  //         setCurrentTrackIndex(0);
  //       }
  //       return;
  //     }

  //     if (playlist.length === 0) {
  //       const audioItems = await initializePlaylist();
  //       if (audioItems.length > 0) {
  //         setCurrentTrackIndex(0);
  //       }
  //       return;
  //     }

  //     await TrackPlayer.play();
  //     setIsPlaying(true);
  //   } catch (error) {
  //     console.error('Ошибка воспроизведения:', error);
  //   }
  // };

  const generateNewAudio = async () => {
    try {
      setIsGeneratingNewAudio(true);
      const audioItems = await initializePlaylist();
      if (audioItems.length > 0) {
        setCurrentTrackIndex(0);
      }
    } catch (error) {
      console.error('Ошибка генерации нового аудио:', error);
    } finally {
      setIsGeneratingNewAudio(false);
    }
  }
  //новый плеер
    //TODO у меня есть запуск алгоритма startTracking есть stopTracking, аудио формируется в новом плеере, я не знаю как связать, можети у тебя будет идея
  const playAudioStream = async (audioData: string) => {
    try {
      const filePath = `${RNFS.DocumentDirectoryPath}/audio_${Date.now()}.mp3`;
      await RNFS.writeFile(filePath, audioData, 'base64');
      
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: filePath,
        url: `file://${filePath}`,
        title: 'Аудиогид',
        artist: 'Текущее местоположение'
      });
      
      await TrackPlayer.play();
      setIsPlaying(true);
    } catch (error) {
      console.error('Ошибка воспроизведения:', error);
    }
  };

  const playAudio = async () => {
    if (isPlaying) {
      await pauseAudio();
      stopTracking(); // Остановить трекинг при паузе
      return;
    }
  
    if (isTrackEnded || playlist.length === 0) {
      await initializePlaylist();
    }
  
    await TrackPlayer.play();
    setIsPlaying(true);
    startTracking(); // Запустить трекинг при воспроизведении
  };
  //   const playAudio = async (): Promise<void> => {
  //   if (isPlaying) return;

  //   let url = audioUrl;
  //   if (!url ) {
  //     url = await fetchAudio();
  //     if (!url) return;
  //   }

  //   await TrackPlayer.reset();
  //   await TrackPlayer.add({
  //     id: 'audio-track',
  //     url: url,
  //     title: 'Аудиогид',
  //     artist: 'Автор',
  //   });
  //   await TrackPlayer.play();
  //   setIsPlaying(true);
  // };

  const pauseAudio = async (): Promise<void> => {
    await TrackPlayer.pause();
    setIsPlaying(false);
  };

  const playPauseAudio = async (): Promise<void> => {
    if (isPlaying) {
      await pauseAudio();
    } else {
      await playAudio();
    }
  };

  const seekAudio = async (value: number): Promise<void> => {
    await TrackPlayer.seekTo(value);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const forward15 = async (): Promise<void> => {
    const position = await TrackPlayer.getPosition();
    await TrackPlayer.seekTo(position + 15);
  };

  const backward15 = async (): Promise<void> => {
    const position = await TrackPlayer.getPosition();
    await TrackPlayer.seekTo(Math.max(position - 15, 0));
  };

  const moveToStart = async (): Promise<void> => {
    if (playlist.length === 0) return;
  
    const position = await TrackPlayer.getPosition();
    if (position < 3) {
      if (currentTrackIndex > 0) {
        setCurrentTrackIndex(currentTrackIndex - 1);
      } else {
        await TrackPlayer.seekTo(0);
      }
    } else {
      await TrackPlayer.seekTo(0);
    }
  };

  const moveToEnd = async (): Promise<void> => {
    if (playlist.length === 0) return;
  
    if (currentTrackIndex < playlist.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    } else {
      const duration = await TrackPlayer.getDuration();
      await TrackPlayer.seekTo(duration);
    }
  };

  const muteVolume = async (): Promise<void> => {
    if (volume !== 0) {
      setPreviousVolume(volume);
    }
    setVolume(0);
    await VolumeManager.setVolume(0);
  };

  const unmuteVolume = async (): Promise<void> => {
    if (previousVolume !== 0) {
      setVolume(previousVolume);
      await VolumeManager.setVolume(previousVolume);
    } else {
      const defaultVolume = 0.5;
      setVolume(defaultVolume);
      await VolumeManager.setVolume(defaultVolume);
    }
  };

  const volumeChange = (newVolume: number): void => {
    setVolume(newVolume);
    VolumeManager.setVolume(newVolume);
  };

  const pan = useRef(new Animated.Value(80)).current;
  // открытие слайдера меню 
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy < 0) {
          Animated.timing(pan, {
            toValue: 80 - gestureState.dy,
            duration: 50,
            useNativeDriver: false,
          }).start();
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < 0) {
          Animated.timing(pan, {
            toValue: 410,
            duration: 300,
            useNativeDriver: false,
          }).start(() => setIsExpanded(true));
        } else {
          Animated.timing(pan, {
            toValue: 80,
            duration: 300,
            useNativeDriver: false,
          }).start(() => {
            setIsExpanded(false);
            setAudioText('');
            setAudioTextTitle('');
          });
        }
      },
    })
  ).current;

  const textDisplayManually = () => {
    setShowTextManually(!showTextManually);
  };

  const generateContent = async () => {
    try {
      const audioItems = await fetchAllAudio();
      
      if (audioItems.length === 0) {
        Alert.alert('Аудио недоступно', 'Для этого места нет аудиозаписей.');
        return;
      }

      setPlaylist(audioItems);
      setCurrentTrackIndex(0);
      setHasContent(true);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить данные');
    }
  };

  // const generateContent = async () => {
  //   try {
  //     const audioItem = await fetchAllAudio();
      
  //     if (!audioItem) {
  //       Alert.alert('Аудио недоступно', 'Не удалось получить аудиозапись.');
  //       return;
  //     }
  
  //     // Удаляем предыдущий файл, если он существует
  //     if (playlist.length > 0) {
  //       await RNFS.unlink(playlist[0].path).catch(console.warn);
  //     }
  
  //     setPlaylist([audioItem]);
  //     setCurrentTrackIndex(0);
  //     setHasContent(true);
      
  //     // Автоматически начинаем воспроизведение
  //     await playCurrentTrack();
  //   } catch (error) {
  //     Alert.alert('Ошибка', 'Не удалось загрузить данные');
  //     console.error('Ошибка в generateContent:', error);
  //   }
  // };

  useEffect(() => {
    const setupVolumeManager = async () => {
      try {
        const currentVolume = await VolumeManager.getVolume();
        setVolume(currentVolume.volume || 0);
        
        if (!volumeListenerInitialized) {
          const listener = VolumeManager.addVolumeListener((result) => {
            setVolume(result.volume);
          });
          setVolumeListenerInitialized(true);
          
          return () => {
            listener.remove();
          };
        }
      } catch (error) {
        console.error('Ошибка при получении громкости:', error);
      }
    };
  
    setupVolumeManager();
  }, [volumeListenerInitialized]);

  const toggleFavorite = async () => {
    if (!currentAudioId) return;
    
    try {
      if (isAudioFavorite) {
        await removeFromFavorites(currentAudioId);
      } else {
        await addToFavorites(currentAudioId);
      }
      setIsAudioFavorite(!isAudioFavorite);
    } catch (error) {
      console.error('Ошибка при обновлении избранного:', error);
    }
  };

  useEffect(() => {
    const updateFavoriteStatus = async () => {
      if (currentAudioId) {
        const status = await isFavorite(currentAudioId);
        setIsAudioFavorite(status);
      }
    };
  
    const unsubscribe = navigation.addListener('favoritesUpdated', updateFavoriteStatus);
  
    updateFavoriteStatus();
  
    return unsubscribe;
  }, [navigation, currentAudioId]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (currentAudioId) {
        const status = await isFavorite(currentAudioId);
        setIsAudioFavorite(status);
      }
    };
    checkFavoriteStatus();
  }, [currentAudioId]);

  useEffect(() => {
    if (route?.params?.removedFavoriteId && currentAudioId === route.params.removedFavoriteId) {
      setIsAudioFavorite(false);
      navigation.setParams({ removedFavoriteId: undefined });
    }
  }, [route?.params?.removedFavoriteId, currentAudioId]);

  useFocusEffect(
    React.useCallback(() => {
      if (currentAudioId) {
        const checkStatus = async () => {
          const status = await isFavorite(currentAudioId);
          setIsAudioFavorite(status);
        };
        checkStatus();
      }
    }, [currentAudioId])
  );

  const PreferencesModal = () => {
    const renderItem = ({ item, drag, isActive }: {
      item: Preference;
      drag: () => void;
      isActive: boolean;
    }) => {
      return (
        <Animated.View>
          <TouchableOpacity
            style={[
              styles.preferenceItem,
              isActive && styles.activePreferenceItem
            ]}
            onLongPress={drag}
            onPress={() => togglePreference(item.id)}
            activeOpacity={0.7}
          >
            <View style={styles.dragHandle}>
              <Line width={24} height={24} color={theme.colors.text2} />
            </View>
            {/* {item.selected ? (
              <CheckboxChecked width={24} height={24} />
            ) : (
              <CheckboxUnchecked width={24} height={24} />
            )} */}
            <Text style={styles.preferenceText}>{item.name}</Text>
          </TouchableOpacity>
        </Animated.View>
      );
    };
  
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPreferencesModal}
        onRequestClose={() => setShowPreferencesModal(false)}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Настройте предпочтения</Text>
              <Text style={styles.modalSubtitle}>Удерживайте и перемещайте для изменения порядка</Text>
              
              <DraggableFlatList
                data={preferences}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                onDragEnd={({ data }) => setPreferences(data)}
                contentContainerStyle={styles.preferencesList}
                activationDistance={10}
                autoscrollSpeed={50}
              />
              
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowPreferencesModal(false)}
              >
                <Text style={styles.modalCloseButtonText}>Готово</Text>
              </TouchableOpacity>
            </View>
          </View>
        </GestureHandlerRootView>
      </Modal>
    );
  };

  const GenerateContentSection = () => (
    <View style={styles.generateContentContainer}>
      <TouchableOpacity 
        onPress={generateContent}
        disabled={isLoading}
        style={styles.generateButton}
      >
        <LinearGradient colors={['#2196F3', '#13578D']} style={styles.generateButtonGradient}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <AIoutlined width={24} height={24} />
              <Text style={styles.generateButtonText}>Сгенерировать рассказ</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
      
      <View style={styles.endpointSwitchContainer}>
        <Text style={styles.endpointSwitchLabel}>
          {useAlternativeEndpoint ? 'LLM' : 'Без LLM'}
        </Text>
        <Switch
          value={useAlternativeEndpoint}
          onValueChange={setUseAlternativeEndpoint}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
          thumbColor={useAlternativeEndpoint ? "#2196F3" : "#f4f3f4"}
        />
      </View>
      
      <TouchableOpacity 
        style={styles.preferencesButton}
        onPress={() => setShowPreferencesModal(true)}
      >
        <Settings width={24} height={24} color="#2196F3" />
      </TouchableOpacity>
    </View>
  );

  const PlaylistItem = React.memo(({ item, index, isCurrent, isPlaying, onPress }: {
    item: AudioData;
    index: number;
    isCurrent: boolean;
    isPlaying: boolean;
    onPress: () => void;
  }) => {
    return (
      <TouchableOpacity 
        style={[
          styles.playlistItem,
          isCurrent && styles.currentTrackItem
        ]}
        onPress={onPress}
      >
        <Text style={styles.playlistItemText}>
          {item.title || `Трек ${index + 1}`}
        </Text>
        {isCurrent && (
          <View style={styles.playingIndicator}>
            {isPlaying ? (
              <Pause width={16} height={16} color="#2196F3" />
            ) : (
              <Play width={16} height={16} color="#2196F3" />
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  });

  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const PlaylistModal = () => {
    const [internalVisible, setInternalVisible] = useState(false);
  
    useEffect(() => {
      if (showPlaylistModal) {
        setInternalVisible(true);
      } else {
        const timer = setTimeout(() => setInternalVisible(false), 300);
        return () => clearTimeout(timer);
      }
    }, [showPlaylistModal]);
  
    const handleItemPress = async (index: number) => {
      try {
        setCurrentTrackIndex(index);
        setShowPlaylistModal(false);
        await TrackPlayer.reset();
      } catch (error) {
        console.error('Ошибка при выборе трека:', error);
      }
    };
  
    if (!internalVisible) return null;
  
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPlaylistModal}
        onRequestClose={() => setShowPlaylistModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.playlistModalContainer}>
            <Text style={styles.playlistTitle}>Плейлист</Text>
            
            <FlatList
              data={playlist}
              keyExtractor={(item, index) => `track-${index}`}
              renderItem={({ item, index }) => (
                <PlaylistItem 
                  item={item}
                  index={index}
                  isCurrent={index === currentTrackIndex}
                  isPlaying={false}
                  onPress={() => handleItemPress(index)}
                />
              )}
              extraData={currentTrackIndex}
            />
            
            <TouchableOpacity 
              style={styles.closePlaylistButton}
              onPress={handleClosePlaylist}
            >
              <Text style={styles.closePlaylistButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const wasPlayingBeforeOpen = useRef(false);

  const handleOpenPlaylist = async () => {
    try {
      wasPlayingBeforeOpen.current = isPlaying;
      // Ставим аудио на паузу, если оно играет
      if (isPlaying) {
        await TrackPlayer.pause();
        setIsPlaying(false);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Затем открываем плейлист
      setShowPlaylistModal(true);
      
    } catch (error) {
      console.error('Ошибка при открытии плейлиста:', error);
    }
  };

  const handleClosePlaylist = async () => {
    try {
      // Закрываем плейлист
      setShowPlaylistModal(false);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Проверяем, было ли аудио на паузе перед открытием плейлиста
      if (wasPlayingBeforeOpen.current) {
        await TrackPlayer.play();
        setIsPlaying(true);
      }
      
    } catch (error) {
      console.error('Ошибка при возобновлении воспроизведения:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView style={styles.container}>
          <View style={styles.mapComponent}>
            <Map onPositionChange={handlePositionUpdate}/>
          </View>

          <TouchableOpacity 
            style={styles.playlistButton}
            // onPress={() => setShowPlaylistModal(true)}
            onPress={handleOpenPlaylist}
          >
            <Text style={styles.playlistButtonText}>Плейлист</Text>
          </TouchableOpacity>


          {hasContent && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                setHasContent(false);
                setAudioText('');
                setAudioTextTitle('');
                setAudioUrl(null);
                TrackPlayer.reset();
                setIsPlaying(false);
              }}
            >
              <Text style={styles.backButtonText}>Назад</Text>
            </TouchableOpacity>
          )}

          {!hasContent ? (
            <GenerateContentSection />
          ) : (
            <>
              {isExpanded ? (
                <View style={[styles.bottomContainer, { height: containerHeight }]}>
                  {showTextManually && audioText ? (
                    <View style={styles.textContentContainer}>
                      <Animated.View style={styles.swipeElement} {...panResponder.panHandlers}>
                        <Line width={24} height={24} color={theme.colors.text} />
                      </Animated.View>
                      <View style={styles.textContentMainContainer}>
                        <View style={styles.textContentTopContainer}>
                          <Text style={styles.textContentTitle}>{audioTextTitle}</Text>
                          <TouchableOpacity onPress={textDisplayManually}>
                            <ShowText width={24} height={24} color={theme.colors.text} />
                          </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.textScrollView}>
                          <Text style={styles.audioText}>{audioText}</Text>
                        </ScrollView>
                      </View>
                    </View>
                  ) : (
                    <>
                      <Animated.View style={styles.swipeElement} {...panResponder.panHandlers}>
                        <Line width={24} height={24} color={theme.colors.text} />
                      </Animated.View>
                      <View style={styles.bottomSubTopContainerExpanded}>
                        <Text style={styles.timeText}>{formatTime(progress.position)}</Text>
                        <Slider
                          style={styles.sliderTrack}
                          minimumValue={0}
                          maximumValue={progress.duration}
                          value={progress.position}
                          onSlidingComplete={seekAudio}
                          minimumTrackTintColor="#2196F3"
                          maximumTrackTintColor="#13578D"
                          thumbTintColor="#2196F3"
                          // thumbImage={require('../../assets/images/icons/thumbImage.png')}
                        />
                        <Text style={styles.timeText}>{formatTime(progress.duration)}</Text>
                      </View>
                      <View style={styles.bottomSubMidContainerExpanded}>
                        <TouchableOpacity onPress={moveToStart}>
                          <Previous width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={backward15}>
                          <Minus15 width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.playPauseButtonSubContainer} onPress={playPauseAudio} disabled={isGeneratingNewAudio}>
                          <LinearGradient colors={['#2196F3', '#13578D']} style={styles.playPauseButtonContainer}>
                            {isGeneratingNewAudio ? (
                              <ActivityIndicator size="large" color="#2196F3" />
                            ) : (
                              <LinearGradient colors={['#2196F3', '#13578D']} style={styles.playPauseButtonContainer}>
                                {isPlaying && !isTrackEnded ? (
                                  <PauseWhite width={24} height={24} color={theme.colors.text} />
                                ) : (
                                  <PlayWhite width={24} height={24} color={theme.colors.text} />
                                )}
                              </LinearGradient>
                            )}
                          </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={forward15}>
                          <Plus15 width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={moveToEnd}>
                          <Next width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.bottomSubBotContainerExpanded}>
                        <View style={styles.bottomSubBotContainerLeftExpanded}>
                        <TouchableOpacity onPress={toggleFavorite}>
                          <Like 
                            width={24} 
                            height={24} 
                            color={isAudioFavorite ? theme.colors.primary : (isPlaying ? theme.colors.text : theme.colors.text2)} 
                            fill={isAudioFavorite ? theme.colors.primary : 'none'}
                          />
                        </TouchableOpacity>
                          <TouchableOpacity>
                            <Settings width={24} height={24} color={theme.colors.text} />
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity 
                          onPress={generateNewAudio}
                          disabled={isGeneratingNewAudio}
                        >
                          {isGeneratingNewAudio ? (
                            // <ActivityIndicator size="small" color="#2196F3" />
                            <AIoutlinedBlue width={24} height={24} />
                          ) : (
                            <AIoutlinedBlue width={24} height={24} />
                          )}
                        </TouchableOpacity>
                        <View style={styles.bottomSubBotContainerRightExpanded}>
                          <TouchableOpacity onPress={textDisplayManually}>
                            <ShowText width={24} height={24} color={theme.colors.text} />
                          </TouchableOpacity>
                          <TouchableOpacity>
                            <Download width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View style={styles.sliderVolumeContainer}>
                        <TouchableOpacity onPress={muteVolume}>
                          <VolumeOff width={24} height={24} color={theme.colors.text} />
                        </TouchableOpacity>
                        <Slider
                          style={styles.sliderVolume}
                          minimumValue={0}
                          maximumValue={1}
                          value={volume}
                          onValueChange={volumeChange}
                          minimumTrackTintColor="#2196F3"
                          maximumTrackTintColor="#13578D"
                          thumbTintColor="#2196F3"
                          // thumbImage={require('../../assets/images/icons/thumbVolumeImage.png')}
                        />
                        <TouchableOpacity onPress={unmuteVolume}>
                          <VolumeOn width={24} height={24} color={theme.colors.text} />
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              ) : (
                <View style={[styles.bottomContainer, { height: containerHeight }]}>
                  <Animated.View style={styles.swipeElement} {...panResponder.panHandlers}>
                    <Line width={24} height={24} color={theme.colors.text} />
                  </Animated.View>
                  <View style={styles.bottomSubContainer}>
                    <TouchableOpacity style={styles.bottomSubContainerLeft}>
                      <Settings width={24} height={24} color={theme.colors.text} />
                    </TouchableOpacity>
                    <View style={styles.bottomSubContainerCenter}>
                      <TouchableOpacity onPress={moveToStart}>
                        <Previous width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={backward15}>
                        <Minus15 width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={playPauseAudio}>
                        {isPlaying ? (
                          <Pause width={24} height={24} color={theme.colors.text} />
                        ) : (
                          <Play width={24} height={24} color={theme.colors.text} />
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity onPress={forward15}>
                        <Plus15 width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={moveToEnd}>
                        <Next width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={toggleFavorite}>
                      <Like 
                        width={24} 
                        height={24} 
                        color={isAudioFavorite ? theme.colors.primary : (isPlaying ? theme.colors.text : theme.colors.text2)} 
                        fill={isAudioFavorite ? theme.colors.primary : 'none'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}
          <PlaylistModal />
          <PreferencesModal />
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontFamily: theme.fonts.regular,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapComponent: {
    flex: 1,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 80,
    // minHeight: 240,
    maxHeight: 410,
    // borderBottomWidth: 1,
    // borderBottomColor: theme.colors.text2,
  },
  swipeElement: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  textContentContainer: {
    flex: 1,
    // paddingBottom: 16,
  },
  textContentMainContainer: {
    flexDirection: 'column',
  },
  textContentTopContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textContentTitle: {
    fontWeight: 600,
    fontSize: 22,
    color: theme.colors.text,
  },
  textScrollView: {
    // flex: 1,
    marginTop: 16,
    marginBottom: 16,
  },
  audioText: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
  },
  bottomSubContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bottomSubContainerLeft: {},
  bottomSubContainerCenter: {
    flexDirection: 'row',
    gap: 20,
  },
  bottomSubContainerRight: {},
  sliderVolumeContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 20,
  },
  sliderVolume: {
    flex: 1,
    height: 20,
  },
  bottomSubTopContainerExpanded: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  sliderTrack: {
    flex: 1,
    height: 20,
  },
  timeText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
  },
  bottomSubMidContainerExpanded: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 13,
    paddingRight: 13,
  },
  playPauseButtonContainer: {
    width: 76,
    height: 76,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
    marginLeft: 12,
    marginRight: 12,
  },
  playPauseButtonSubContainer: {
    zIndex: 50,
    alignItems: 'center',
  },
  bottomSubBotContainerExpanded: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 13,
    paddingRight: 13,
    marginTop: 16,
  },
  bottomSubBotContainerLeftExpanded: {
    flexDirection: 'row',
    gap: 40,
  },
  bottomSubBotContainerRightExpanded: {
    flexDirection: 'row',
    gap: 40,
  },



  generateContentContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  generateButton: {
    flex: 1,
    marginRight: 10,
  },
  generateButtonGradient: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  preferencesButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    // maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: theme.colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: theme.colors.text2,
    textAlign: 'center',
    marginBottom: 20,
  },
  preferencesList: {
    paddingBottom: 20,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.text2,
    backgroundColor: 'white',
  },
  // activePreferenceItem: {
  //   backgroundColor: '#f5f5f5',
  // },
  activePreferenceItem: {
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ scale: 1.01 }],
  },
  dragHandle: {
    marginRight: 12,
    opacity: 0.5,
  },
  preferenceText: {
    marginLeft: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  modalCloseButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  backButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '500',
  },


  //стили к плейлисту:
  playlistButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  playlistButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '500',
  },
  playlistModalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  playlistTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: theme.colors.text,
  },
  playlistItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentTrackItem: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  playlistItemText: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    marginLeft: 10,
  },
  playingBar: {
    width: 3,
    height: 15,
    backgroundColor: '#2196F3',
    marginHorizontal: 2,
  },
  closePlaylistButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#2196F3',
    borderRadius: 20,
    alignItems: 'center',
  },
  closePlaylistButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  endpointSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    elevation: 2,
  },
  endpointSwitchLabel: {
    marginRight: 8,
    fontSize: 12,
    color: '#2196F3',
  },
});

export default HomeScreen;
