import React, { useState, useEffect } from 'react';

import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Keyboard,
  TouchableWithoutFeedback } from 'react-native';
import Map from '../components/Map';
// import { Search, Suggest  } from 'react-native-yamap';
// import { GeoFigureType } from 'react-native-yamap/build/Search';
import { theme } from '../../theme';
import Settings from '../../assets/images/icons/settings.svg';
import Previous from '../../assets/images/icons/previous.svg';
import Minus15 from '../../assets/images/icons/minus15.svg';
import Play from '../../assets/images/icons/play.svg';
import Plus15 from '../../assets/images/icons/plus15.svg';
import Next from '../../assets/images/icons/next.svg';
import Like from '../../assets/images/icons/like.svg';
import Line from '../../assets/images/icons/line.svg';
import Pause from '../../assets/images/icons/pause.svg';
import { VolumeManager } from 'react-native-volume-manager';
import Slider from '@react-native-community/slider';

function HomeScreen(): React.JSX.Element {

  const [responseText, setResponseText] = useState('');
  const [preferences, setPreferences] = useState('');
  const [location, setLocation] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState<number>(0);


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

  const handlePress = async () => {
    try {
      const response = await fetch('http://10.0.2.2:8000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences,
          location,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      setResponseText(data);

      if (data.message) {
        setResponseText(data.message);
        setIsVisible(true);
      } else {
        throw new Error('Ответ не содержит поля "message"');
      }
    } catch (error) {
      console.error('Ошибка при запросе:', error);
      Alert.alert('Ошибка', 'Не удалось получить рассказ');
    }
  };

  const playPause = () => {
    if (!isPlaying) {
      handlePress();
    }
    setIsPlaying(prevState => !prevState);
    setIsVisible(false);
  };

  const closeAction = () => {
    setIsVisible(false);
    setIsPlaying(false);
  };

  const volumeChange = (newVolume: number) => {
    setVolume(newVolume);
    VolumeManager.setVolume(newVolume);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView style={styles.container}>
          <View style={styles.mapComponent}>
            <Map />
          </View>
          {isVisible && (
            <View style={styles.responseContainer}>
              <TouchableOpacity style={styles.closeButton} onPress={closeAction}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.responseText}>{responseText}</Text>
            </View>
          )}
          <View style={styles.bottomContainer}>
            <View style={styles.slideElement}>
              <Line width={24} height={24} color={theme.colors.text} />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputTop}
                placeholder="Введите предпочтения"
                value={preferences}
                onChangeText={setPreferences}
              />
              <TextInput
                style={styles.inputBot}
                placeholder="Введите местоположение"
                value={location}
                onChangeText={setLocation}
              />
            </View>
            <View style={styles.bottomSubContainer}>
              <View style={styles.bottomSubContainerLeft}>
                <Settings width={24} height={24} color={theme.colors.text} />
              </View>
              <View style={styles.bottomSubContainerCenter}>
                <View>
                  <Previous width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
                </View>
                <View>
                  <Minus15 width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
                </View>
                <TouchableOpacity onPress={playPause}>
                  {isPlaying ? (
                    <Pause width={24} height={24} color={theme.colors.text} />
                  ) : (
                    <Play width={24} height={24} color={theme.colors.text} />
                  )}
                </TouchableOpacity>
                <View>
                  <Plus15 width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
                </View>
                <View>
                  <Next width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
                </View>
              </View>
              <View style={styles.bottomSubContainerRight}>
                <Like width={24} height={24} color={isPlaying ? theme.colors.text : theme.colors.text2} />
              </View>
            </View>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={1}
                value={volume}
                onValueChange={volumeChange}
                minimumTrackTintColor="#2196F3"
                maximumTrackTintColor="#13578D"
                // thumbTintColor={theme.colors.text}
                thumbTintColor="#2196F3"
              />
            </View>
          </View>
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
  },
  inputTop: {
    borderWidth: 1,
    borderColor: theme.colors.text2,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#FFF',
    fontSize: 16,
  },
  inputBot: {
    borderWidth: 1,
    borderColor: theme.colors.text2,
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#FFF',
    fontSize: 16,
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
  },
  slideElement: {
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
  sliderContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 2,
  },
});

export default HomeScreen;
