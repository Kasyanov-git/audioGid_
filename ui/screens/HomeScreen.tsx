import React, { useState, useEffect, useRef } from 'react';

import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Keyboard,
  TouchableWithoutFeedback, PanResponder, Animated } from 'react-native';
import Map from '../components/Map';
// import { Search, Suggest  } from 'react-native-yamap';
// import { GeoFigureType } from 'react-native-yamap/build/Search';
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
import Sound from 'react-native-sound';


function HomeScreen(): React.JSX.Element {

  // const [responseText, setResponseText] = useState('');
  // const [question, setQuestion] = useState('');
  // const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number | 'auto'>('auto');
  const [isExpanded, setIsExpanded] = useState(false);
  const soundRef = useRef<Sound | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(1);
  const [previousVolume, setPreviousVolume] = useState<number>(volume);
  // const [sound, setSound] = useState<Sound | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // useEffect(() => {
  //   soundRef.current = new Sound('audio.mp3', Sound.MAIN_BUNDLE, (error) => {
  //     if (error) {
  //       console.error('Ошибка загрузки аудиофайла:', error);
  //       return;
  //     }
  //     if (soundRef.current) {
  //       setDuration(soundRef.current.getDuration());
  //     }
  //   });

  //   return () => {
  //     if (soundRef.current) {
  //       soundRef.current.release();
  //       soundRef.current = null;
  //     }
  //   };
  // }, []);

  // const playTestAudioFromApi = async () => {
  //   try {
  //     const response = await fetch(
  //       'https://8744dcae-c929-4338-9b61-aae1b2adb84b.tunnel4.com/api/ask',
  //       {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({
  //           question: 'Привет, расскажи мне что-нибудь',
  //         }),
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error(`HTTP Error: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     const audioUrl = data.url;

  //     if (!audioUrl) {
  //       throw new Error('Сервер не вернул ссылку на аудиофайл');
  //     }

  //     const newSound = new Sound(audioUrl, '', (error) => {
  //       if (error) {
  //         console.error(' Ошибка загрузки аудио:', error);
  //         Alert.alert('Ошибка', 'Не удалось загрузить аудио');
  //         return;
  //       }

  //       newSound.play((success) => {
  //         if (success) {
  //           console.log('Аудио воспроизведено');
  //         } else {
  //           console.error('Ошибка воспроизведения');
  //         }
  //       });

  //       setSound(newSound);
  //     });
  //   } catch (error) {
  //     console.error('Ошибка:', error);
  //     Alert.alert('Ошибка', 'Не удалось получить или воспроизвести аудиофайл');
  //   }
  // };

  // const playAudio = () => {
  //   if (soundRef.current && !isPlaying) {
  //     soundRef.current.play((success) => {
  //       if (success) {
  //         console.log('Аудио успешно воспроизведено');
  //         setIsPlaying(false);
  //       } else {
  //         console.error('Ошибка воспроизведения аудио');
  //       }
  //     });
  //     // setIsPlaying(true);
  //     setIsPlaying(prevState => !prevState);
  //     setIsVisible(false);

  //     intervalRef.current = setInterval(() => {
  //       soundRef.current?.getCurrentTime((seconds) => {
  //         setCurrentTime(seconds);
  //       });
  //     }, 100);
  //   }
  // };

  const fetchAudio = async () => {
    try {
      const response = await fetch('https://e254d0c4-acb0-43df-99dc-49dff02ed044.tunnel4.com/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: 'Привет, расскажи мне что-нибудь' }),
      });

      if (!response.ok) throw new Error(`Ошибка: ${response.status}`);

      const data = await response.json();
      if (!data.url) throw new Error('Сервер не вернул ссылку на аудио');

      setAudioUrl(data.url);
      return data.url;
    } catch (error) {
      console.error('Ошибка загрузки аудио:', error);
      Alert.alert('Ошибка', 'Не удалось получить аудиофайл');
      return null;
    }
  };

  const playAudio = async () => {
    if (isPlaying) return;

    let url = audioUrl;
    if (!url) {
      url = await fetchAudio();
      if (!url) return;
    }

    if (soundRef.current) {
      soundRef.current.release();
      soundRef.current = null;
    }

    soundRef.current = new Sound(url, '', (error) => {
      if (error) {
        console.error('Ошибка загрузки аудио:', error);
        return;
      }

      if (soundRef.current) {
        setDuration(soundRef.current.getDuration());
        soundRef.current.play((success) => {
          if (success) {
            console.log('Аудио успешно воспроизведено');
          } else {
            console.error('Ошибка воспроизведения');
          }
          setIsPlaying(false);
        });
      }

      setIsPlaying(true);

      intervalRef.current = setInterval(() => {
        soundRef.current?.getCurrentTime((seconds) => {
          setCurrentTime(seconds);
        });
      }, 100);
    });
  };

  const pauseAudio = () => {
    if (soundRef.current) {
      soundRef.current.pause();
      setIsPlaying(false);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const playPauseAudio = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const seekAudio = (value: number) => {
    if (soundRef.current) {
      soundRef.current.setCurrentTime(value);
      setCurrentTime(value);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const forward15 = () => {
    if (soundRef.current) {
      soundRef.current.getCurrentTime((currentTime) => {
        const newTime = Math.min(currentTime + 15, duration);
        soundRef.current?.setCurrentTime(newTime);
        setCurrentTime(newTime);
      });
    }
  };

  const backward15 = () => {
    if (soundRef.current) {
      soundRef.current.getCurrentTime((currentTime) => {
        const newTime = Math.max(currentTime - 15, 0);
        soundRef.current?.setCurrentTime(newTime);
        setCurrentTime(newTime);
      });
    }
  };

  const moveToStart = () => {
    if (soundRef.current) {
      soundRef.current.setCurrentTime(0);
      setCurrentTime(0);
    }
  };

  const moveToEnd = () => {
    if (soundRef.current) {
      soundRef.current.setCurrentTime(duration);
      setCurrentTime(duration);
    }
  };

  const muteVolume = async () => {
    if (volume !== 0) {
      setPreviousVolume(volume);
    }
    setVolume(0);
    await VolumeManager.setVolume(0);
  };

  const unmuteVolume = async () => {
    if (previousVolume !== 0) {
      setVolume(previousVolume);
      await VolumeManager.setVolume(previousVolume);
    } else {
      const defaultVolume = 0.5;
      setVolume(defaultVolume);
      await VolumeManager.setVolume(defaultVolume);
    }
  };

  // const closeAction = () => {
  //   setIsVisible(false);
  //   setIsPlaying(false);
  // };

  const volumeChange = (newVolume: number) => {
    setVolume(newVolume);
    VolumeManager.setVolume(newVolume);
  };

  const pan = useRef(new Animated.Value(80)).current;

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
              {/* {isVisible && (
                <View style={styles.responseContainer}>
                  <TouchableOpacity style={styles.closeButton} onPress={closeAction}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                  <Text style={styles.responseText}>{responseText}</Text>
                </View>
              )} */}
                {isExpanded ? (
                  <View style={[styles.bottomContainer, { height: containerHeight }]}>
                    <Animated.View style={styles.swipeElement} {...panResponder.panHandlers}>
                      <Line width={24} height={24} color={theme.colors.text} />
                    </Animated.View>
                    {/* <View style={styles.inputContainer}>
                      <TextInput
                        style={styles.inputTop}
                        placeholder="Введите предпочтения"
                        value={question}
                        onChangeText={setQuestion}
                      />
                      <TouchableOpacity onPress={playTestAudioFromApi} style={styles.temporaryButton}>
                          <Text style={styles.temporaryButtonText}>Сгенерировать</Text>
                      </TouchableOpacity>
                    </View> */}
                    <View style={styles.bottomSubTopContainerExpanded}>
                      <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                        <Slider
                          style={styles.sliderTrack}
                          minimumValue={0}
                          maximumValue={duration}
                          value={currentTime}
                          onSlidingComplete={seekAudio}
                          minimumTrackTintColor="#2196F3"
                          maximumTrackTintColor="#13578D"
                          thumbImage={require('../../assets/images/icons/thumbImage.png')}
                        />
                      <Text style={styles.timeText}>{formatTime(duration)}</Text>
                    </View>
                    <View style={styles.bottomSubMidContainerExpanded}>
                      <TouchableOpacity>
                        <Previous width={24} height={24} onPress={moveToStart} color={isPlaying ? theme.colors.text : theme.colors.text2} />
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <Minus15 width={24} height={24} onPress={backward15} color={isPlaying ? theme.colors.text : theme.colors.text2} />
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
                      <TouchableOpacity>
                        <Plus15 width={24} height={24} onPress={forward15} color={isPlaying ? theme.colors.text : theme.colors.text2} />
                      </TouchableOpacity>
                      <TouchableOpacity>
                        <Next width={24} height={24} onPress={moveToEnd} color={isPlaying ? theme.colors.text : theme.colors.text2} />
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
                      <TouchableOpacity>
                        <VolumeOff width={24} height={24} onPress={muteVolume} color={theme.colors.text} />
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
                      <TouchableOpacity>
                        <VolumeOn width={24} height={24} onPress={unmuteVolume} color={theme.colors.text} />
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
                        <TouchableOpacity>
                          <Previous width={24} height={24} onPress={moveToStart} color={isPlaying ? theme.colors.text : theme.colors.text2} />
                        </TouchableOpacity>
                        <TouchableOpacity>
                          <Minus15 width={24} height={24} onPress={backward15} color={isPlaying ? theme.colors.text : theme.colors.text2} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={playPauseAudio}>
                          {isPlaying ? (
                            <Pause width={24} height={24} color={theme.colors.text} />
                          ) : (
                            <Play width={24} height={24} color={theme.colors.text} />
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity>
                          <Plus15 width={24} height={24} onPress={forward15} color={isPlaying ? theme.colors.text : theme.colors.text2} />
                        </TouchableOpacity>
                        <TouchableOpacity>
                          <Next width={24} height={24} onPress={moveToEnd} color={isPlaying ? theme.colors.text : theme.colors.text2} />
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
}

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
