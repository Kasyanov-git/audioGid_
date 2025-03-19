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
import { Suggest  } from 'react-native-yamap';
// import { GeoFigureType } from 'react-native-yamap/build/Search';
import {ClassTimer} from './test.tsx';
import { Geocoder } from 'react-native-yamap';
import base64 from 'base-64';
import RNFS from 'react-native-fs';

Geocoder.init('500f7015-58c8-477a-aa0c-556ea02c2d9e');

interface DataItem {
  audio: string;
  place_id: number;
  place_name: string;
  response: string;
  status: string;
}

const HomeScreen: React.FC<{}> = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0);
  const [containerHeight] = useState<number | 'auto'>('auto');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [previousVolume, setPreviousVolume] = useState<number>(volume);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const myInstance = new ClassTimer();
  
  const progress = useProgress();
  const playbackState = usePlaybackState();

  useEffect(() => {
    if (playbackState.state === State.Playing) {
      setIsPlaying(true);
    } else if (playbackState.state === State.Paused || playbackState.state === State.Stopped) {
      setIsPlaying(false);
    }
  }, [playbackState.state]);

  const fetchAudio = async (): Promise<string | null> => {
    try {
      
      const response = await fetch('http://149.154.69.184:8080/api/process-json-noauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ json_data: await myInstance.fetchData()}),
      });
      if (!response.ok) throw new Error(`Ошибка: ${response.status}`);
      const data = await response.json();

      const filePath = `${RNFS.DocumentDirectoryPath}/audio.mp3`;
      console.log("Начинаем сохранение");
      await RNFS.writeFile(filePath, data[0].audio, 'base64');
      console.log('Аудиофайл сохранён:', filePath);

      return filePath;

    }catch (error) {
        console.error('Ошибка загрузки аудио:', error);
        Alert.alert('Ошибка', 'Не удалось получить аудиофайл');
        return null;
      }
  }
  
  const playAudio = async (): Promise<void> => {
    if (isPlaying) return;

    let url = audioUrl;
    if (!url) {
      url = await fetchAudio();
      if (!url) return;

      setAudioUrl(url);
    }

    await TrackPlayer.reset();
    await TrackPlayer.add({
      id: 'audio-track',
      url: `file://${url}`,
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
            <Map />
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
    // borderBottomWidth: 1,
    // borderBottomColor: theme.colors.text2,
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