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
import { VolumeManager } from 'react-native-volume-manager';
import Slider from '@react-native-community/slider';
import LinearGradient from 'react-native-linear-gradient';
import TrackPlayer, { State, useProgress, usePlaybackState } from 'react-native-track-player';
import { PermissionsAndroid ,Platform } from 'react-native';
import { useCallback  } from 'react';
import RNFS from 'react-native-fs';
import Geolocation from 'react-native-geolocation-service';
import { accelerometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';
// import { GeoFigureType } from 'react-native-yamap/build/Search';
import {ClassTimer,Coordinates} from './test.tsx';
import { Geocoder } from 'react-native-yamap';
Geocoder.init('500f7015-58c8-477a-aa0c-556ea02c2d9e');

type Position = {
  latitude: number;
  longitude: number;
};

type TransportMode = 'pedestrian' | 'scooter' | 'car' ;

const HomeScreen: React.FC<{}> = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0);
  const [containerHeight] = useState<number | 'auto'>('auto');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [previousVolume, setPreviousVolume] = useState<number>(volume);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [parentPosition, setParentPosition] = useState<{ lat: number; lon: number } | null>(null);
  const myInstance = new ClassTimer();
  
  const progress = useProgress();
  const playbackState = usePlaybackState();
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
  const initWebSocket = useCallback(() => {
    wsRef.current = new WebSocket('ws://149.154.69.184:8080/ws/process-json-noauth');

    wsRef.current.onopen = () => {
      console.log('WebSocket подключен');
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket ошибка:', error);
      setStatus('Ошибка подключения к серверу');
    };
    wsRef.current.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      await playAudioStream(data.content);
    } 
  }, []);

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
  
  const fetchAudio = async (): Promise<string | null> => {
    try {
      if (parentPosition === null) {
        return null;
      }
  
      
  
      return new Promise<string | null>((resolve) => {
        const ws = new WebSocket('ws://149.154.69.184:8080/ws/process-json-noauth');
  
        ws.onopen = () => {
          console.log('WebSocket соединение установлено');
          
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket ошибка:', error);
          Alert.alert('Ошибка', 'Проблемы с подключением к серверу');
          resolve(null);
        };
  
        ws.onclose = () => {
          console.log('WebSocket соединение закрыто');
        };
  
        ws.onmessage = async (event) => {
          try {
            const data = JSON.parse(event.data);
            const filePath = `${RNFS.DocumentDirectoryPath}/audio_${Date.now()}.mp3`;
            console.log("Начинаем сохранение аудио через WebSocket");
            
            await RNFS.writeFile(filePath, data.audio, 'base64');
            console.log('Аудиофайл сохранён:', filePath);
            
            if (!data.url) {
              throw new Error('Сервер не вернул ссылку на аудио');
            }
  
            setAudioUrl(data.url);
            resolve(data.url);
          } catch (error) {
            console.error('Ошибка обработки сообщения:', error);
            resolve(null);
          } finally {
            ws.close();
          }
        };
      });
    } catch (error) {
      console.error('Ошибка загрузки аудио:', error);
      Alert.alert('Ошибка', 'Не удалось получить аудиофайл');
      return null;
    }
  };
  //новый плеер
    //TODO у меня есть запуск алгоритма startTracking есть stopTracking, аудио формироуется в новом плеере, я не знаю как связать, можети у тебя будет идея
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
    const playAudio = async (): Promise<void> => {
    if (isPlaying) return;

    let url = audioUrl;
    if (!url ) {
      url = await fetchAudio();
      if (!url) return;
    }

    await TrackPlayer.reset();
    await TrackPlayer.add({
      id: 'audio-track',
      url: url,
      title: 'Аудиогид',
      artist: 'Автор',
    });
    await TrackPlayer.play();
    setIsPlaying(true);
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
          }).start(() => setIsExpanded(false));
        }
      },
    })
  ).current;

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView style={styles.container}>
          <View style={styles.mapComponent}>
            <Map onPositionChange={handlePositionUpdate}/>
          </View>
          {isExpanded ? (
            <View style={[styles.bottomContainer, { height: containerHeight }]}>
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
                  thumbImage={require('../../assets/images/icons/thumbImage.png')}
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
                <TouchableOpacity style={styles.playPauseButtonSubContainer} onPress={playPauseAudio}>
                  <LinearGradient colors={['#2196F3', '#13578D']} style={styles.playPauseButtonContainer}>
                    {isPlaying ? (
                      <PauseWhite width={24} height={24} color={theme.colors.text} />
                    ) : (
                      <PlayWhite width={24} height={24} color={theme.colors.text} />
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
                  <TouchableOpacity>
                    <Like width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Settings width={24} height={24} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>
                <View style={styles.bottomSubBotContainerRightExpanded}>
                  <TouchableOpacity>
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
                  thumbImage={require('../../assets/images/icons/thumbVolumeImage.png')}
                />
                <TouchableOpacity onPress={unmuteVolume}>
                  <VolumeOn width={24} height={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
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
                <TouchableOpacity style={styles.bottomSubContainerRight}>
                  <Like width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
                </TouchableOpacity>
              </View>
            </View>
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
  inputContainer: {
    marginBottom: 20,
    gap: 10,
    alignItems: 'center',
  },
  inputTop: {
    borderWidth: 1,
    borderColor: theme.colors.text2,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#FFF',
    fontSize: 16,
    width: '100%',
  },
  inputBot: {
    borderWidth: 1,
    borderColor: theme.colors.text2,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#FFF',
    fontSize: 16,
    width: '100%',
  },
  temporaryButton: {
    // backgroundColor: '#d24dfa',
    backgroundColor: '#000',
    width: 160,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  temporaryButtonText: {
    color: '#FFF',
  },
  responseContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 10,
  },
  responseText: {
    fontSize: 16,
    color: 'black',
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 2,
    padding: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#000',
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.text2,
  },
  swipeElement: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
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
    width: 302,
    height: 2,
  },
  bottomSubTopContainerExpanded: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  sliderTrack: {
    flex: 1,
    height: 1,
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
