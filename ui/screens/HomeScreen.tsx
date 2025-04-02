import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import Map from '../components/Map';
import { theme } from '../../theme';
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
import TrackPlayer, { State, useProgress, usePlaybackState } from 'react-native-track-player';
import { Suggest  } from 'react-native-yamap';
// import { GeoFigureType } from 'react-native-yamap/build/Search';
import {ClassTimer} from './test.tsx';
import { Geocoder } from 'react-native-yamap';
import base64 from 'base-64';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addToFavorites, removeFromFavorites, saveAudioToHistory, isFavorite } from '../../services/AudioService.ts';
import { useFocusEffect } from '@react-navigation/native';

Geocoder.init('500f7015-58c8-477a-aa0c-556ea02c2d9e');

type AudioData = {
  path: string | null;
  text: string;
  title: string;
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
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0);
  const [containerHeight] = useState<number | 'auto'>('auto');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [previousVolume, setPreviousVolume] = useState<number>(volume);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
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

  useEffect(() => {
    if (playbackState.state === State.Playing) {
      setIsPlaying(true);
    } else if (playbackState.state === State.Paused || playbackState.state === State.Stopped) {
      setIsPlaying(false);
    }
  }, [playbackState.state]);

  const fetchAudio = async (): Promise<AudioData> => {
    try {
      setIsLoading(true);
      const jwtToken = await getToken();
      if (!jwtToken) throw new Error('Токен отсутствует');

      const response = await fetch('http://149.154.69.184:8080/api/process-json-noauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': jwtToken },
        body: JSON.stringify({ json_data: await myInstance.fetchData()}),
      });
      
      if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
      const data = await response.json();

      const filePath = `${RNFS.DocumentDirectoryPath}/audio_${Date.now()}.mp3`;
      await RNFS.writeFile(filePath, data[0].audio, 'base64');
      
      const result: AudioData = {
        path: filePath,
        text: data[0].response,
        title: data[0].place_name
      };

      const newItem = await saveAudioToHistory({
        path: filePath,
        text: data[0].response,
        title: data[0].place_name
      });

      setCurrentAudioId(newItem.id);
      const favoriteStatus = await isFavorite(newItem.id);
      setIsAudioFavorite(favoriteStatus);
      
      setAudioData(result);
      return result;

    } catch (error) {
      console.error('Ошибка загрузки аудио:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const playAudio = async (): Promise<void> => {
    if (isPlaying && !isTrackEnded) {
      await pauseAudio();
      return;
    }

    try {
      // Если трек закончился, начинаем сначала
      if (isTrackEnded) {
        await TrackPlayer.seekTo(0);
        setIsTrackEnded(false);
      }

      // Если данные уже загружены, используем их
      if (audioData?.path) {
        const currentTrack = await TrackPlayer.getCurrentTrack();
        
        if (currentTrack === null) {
          await TrackPlayer.reset();
          await TrackPlayer.add({
            id: 'audio-track',
            url: `file://${audioData.path}`,
            title: 'Аудиогид',
            artist: 'Автор',
          });
        }
        await TrackPlayer.play();
        setIsPlaying(true);
        return;
      }

      // Если данных нет, загружаем их
      const newAudioData = await fetchAudio();
      setAudioText(newAudioData.text);
      setAudioTextTitle(newAudioData.title);
      
      if (newAudioData.path) {
        const currentTrack = await TrackPlayer.getCurrentTrack();
        
        if (currentTrack === null) {
          await TrackPlayer.reset();
          await TrackPlayer.add({
            id: 'audio-track',
            url: `file://${newAudioData.path}`,
            title: 'Аудиогид',
            artist: 'Автор',
          });
        }
        await TrackPlayer.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Ошибка воспроизведения:', error);
    }
  };

  const generateNewAudio = async () => {
    try {
      setIsGeneratingNewAudio(true);
      const newAudioData = await fetchAudio();
      setAudioText(newAudioData.text);
      setAudioTextTitle(newAudioData.title);
      
      if (newAudioData.path) {
        await TrackPlayer.reset();
        await TrackPlayer.add({
          id: 'audio-track',
          url: `file://${newAudioData.path}`,
          title: 'Аудиогид',
          artist: 'Автор',
        });
        await TrackPlayer.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Ошибка генерации нового аудио:', error);
    } finally {
      setIsGeneratingNewAudio(false);
    }
  };

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
    await TrackPlayer.seekTo(0);
  };

  const moveToEnd = async (): Promise<void> => {
    const duration = await TrackPlayer.getDuration();
    await TrackPlayer.seekTo(duration);
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
      const {path, text, title} = await fetchAudio();
      setAudioText(text);
      setAudioTextTitle(title);
      setAudioUrl(path);
      setHasContent(true);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось загрузить данные');
    }
  };

  useEffect(() => {
    const setupVolumeManager = async () => {
      try {
        const currentVolume = await VolumeManager.getVolume();
        setVolume(currentVolume.volume || 0);
      } catch (error) {
        console.error('Ошибка при получении громкости:', error);
      }
    };

    setupVolumeManager();
  }, []);

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
      // Очищаем параметр после обработки
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView style={styles.container}>
          <View style={styles.mapComponent}>
            <Map />
          </View>

          {!hasContent ? (
            <View style={styles.generateButtonContainer}>
              <TouchableOpacity 
                onPress={generateContent}
                disabled={isLoading}
              >
                <LinearGradient colors={['#2196F3', '#13578D']} style={styles.generateButton}>
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
            </View>
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
  generateButtonContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  generateButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 20,
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    // elevation: 3, 
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
});

export default HomeScreen;