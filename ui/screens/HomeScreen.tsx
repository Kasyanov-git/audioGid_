import React, { useState } from 'react';

import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView, Keyboard,
  TouchableWithoutFeedback, } from 'react-native';
import Map from '../components/Map';
import { Search, Suggest  } from 'react-native-yamap';
import { GeoFigureType } from 'react-native-yamap/build/Search';
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

function HomeScreen(): React.JSX.Element {

  const [responseText, setResponseText] = useState('');
  // Тестовая функция для саджеста(выводит очень далеко, посмотреть настрйоку)
  // const find = async (query: string) => {
  //   console.log(query);
  //   const suggestions = await Suggest.suggest(query,{userPosition: {lat: 59.9537667, lon: 30.4121783}});
  //   console.log(suggestions)
  //   Suggest.reset();
  // };
  // const handlePressTest = async () => {
  //   try {
  //     //Поиск по тексту(ищет как раз метки в близи)
  //     const searchResult = await Search.searchText(
  //       'Памятники',
  //       { type: GeoFigureType.POINT, value: {lat: 59.9537667, lon: 30.4121783}},
  //       { disableSpellingCorrection: true, geometry: true },
  //     );
  //     console.log(searchResult);
  //     const response = await fetch('http://localhost:5555/ask', {  //ЗДЕСЬ МОЖНО ПОМЕНЯТЬ IP СЕРВЕРА
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },

  //       body: JSON.stringify({
  //         searchResult,
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP Error: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     setResponseText(data);

  //     console.log('Ответ от сервера:', data);

  //     if (data.message) {
  //       setResponseText(data.message);
  //       setIsVisible(true);
  //     } else {
  //       throw new Error('Ответ не содержит поля "message"');
  //     }
  //   } catch (error) {
  //     console.error('Ошибка при запросе:', error);
  //     Alert.alert('Ошибка', 'Не удалось получить рассказ');
  //   }
  // };

  const [preferences, setPreferences] = useState('');
  const [location, setLocation] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const handlePress = async () => {
    try {
      const response = await fetch('http://10.0.2.2:8000/ask', {  //ЗДЕСЬ МОЖНО ПОМЕНЯТЬ IP СЕРВЕРА
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

      console.log('Ответ от сервера:', data);

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

  const [isPlaying, setIsPlaying] = useState(false);

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView style={styles.container}>
          <View style={styles.mapComponent}>
            <Map />
          </View>
          {/* <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Введите предпочтения"
              value={preferences}
              onChangeText={setPreferences}
            />
            <TextInput
              style={styles.input}
              placeholder="Введите местоположение"
              value={location}
              onChangeText={setLocation}
            />
          </View> */}
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
                {isPlaying ? (
                  <Previous width={24} height={24} color={theme.colors.text} />
                ) : (
                  <Previous width={24} height={24} color={theme.colors.text2} />
                )}
                </View>
                <View>
                {isPlaying ? (
                  <Minus15 width={24} height={24} color={theme.colors.text} />
                ) : (
                  <Minus15 width={24} height={24} color={theme.colors.text2} />
                )}
                </View>
                <TouchableOpacity onPress={playPause}>
                {isPlaying ? (
                  <Pause width={24} height={24} color={theme.colors.text} />
                ) : (
                  <Play width={24} height={24} color={theme.colors.text} />
                )}
                </TouchableOpacity>
                <View>
                {isPlaying ? (
                  <Plus15 width={24} height={24} color={theme.colors.text} />
                ) : (
                  <Plus15 width={24} height={24} color={theme.colors.text2} />
                )}
                </View>
                <View>
                {isPlaying ? (
                  <Next width={24} height={24} color={theme.colors.text} />
                ) : (
                  <Next width={24} height={24} color={theme.colors.text2} />
                )}
                </View>
              </View>
              <View style={styles.bottomSubContainerRight}>
              {isPlaying ? (
                  <Like width={24} height={24} color={theme.colors.text} />
                ) : (
                  <Like width={24} height={24} color={theme.colors.text2} />
                )}
              </View>
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
  textStyle: {
    fontSize: 26,
    color: 'black',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  inputContainer: {
    // position: 'absolute',
    zIndex: 1,
    // bottom: 160,
    // left: 20,
    // right: 20,
    // backgroundColor: 'rgba(255, 255, 255, 0.8)',
    // padding: 10,
    marginBottom: 20,
    gap: 10,
  },
  inputTop: {
    borderWidth: 1,
    borderColor: theme.colors.text2,
    borderRadius: 10,
    padding: 10,
    // marginBottom: 10,
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
    zIndex: 1,
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
    zIndex: 2,
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
  buttonContainer: {
    position: 'absolute',
    zIndex: 1,
    bottom: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
    width: '100%',
  },
  button: {
    borderRadius: 16,
    backgroundColor: 'green',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonTestContainer: {
    position: 'absolute',
    zIndex: 1,
    bottom: 82,
    paddingHorizontal: 16,
    paddingBottom: 16,
    alignItems: 'center',
    width: '100%',
  },
  buttonTest: {
    borderRadius: 16,
    backgroundColor: 'orange',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonTestText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomContainer: {
    position: 'absolute',
    zIndex: 100,
    bottom: 0,
    width: '100%',
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  slideElement: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    // marginBottom: 30,
    marginBottom: 10,
  },
  bottomSubContainer: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bottomSubContainerLeft: {

  },
  bottomSubContainerCenter: {
    flexDirection: 'row',
    gap: 20,
  },
  bottomSubContainerRight: {

  }
});

export default HomeScreen;
