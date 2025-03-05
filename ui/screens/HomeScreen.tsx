import React, { useState } from 'react';

import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Map from '../components/Map';
import { Search,Suggest  } from 'react-native-yamap';
import { GeoFigureType } from 'react-native-yamap/build/Search';
import {ClassTimer} from './test.tsx';
import { Geocoder } from 'react-native-yamap';
Geocoder.init('500f7015-58c8-477a-aa0c-556ea02c2d9e');


function HomeScreen(): React.JSX.Element {

  const [responseText, setResponseText] = useState('');
  // Тестовая функция для саджеста(выводит очень далеко, посмотреть настрйоку)
  const find = async (query: string) => {
    console.log(query);
    const suggestions = await Suggest.suggest(query,{userPosition: {lat: 59.9537667, lon: 30.4121783}});
    console.log(suggestions)
    Suggest.reset();
  }
  function sayHello() {
    console.log('Hello every 3 seconds');
  }
  const timer=new ClassTimer(5);
  const handlePressTest = async () => {
    // timer.start();
    timer.fetchData();
    try {
      
      
      //Поиск по тексту(ищет как раз метки в близи)
      // console.log("check");
      // const searchResult = await Search.searchText(
      //   'Парк',
      //   { type: GeoFigureType.POINT, value: {lat: 59.9537667, lon: 30.4121783}},
      //   { disableSpellingCorrection: true, geometry: true },
      // );
      // console.log("check1");
      // console.log(searchResult);
      
      // const result= await Geocoder.geoToAddress({lat: 59.9537667, lon: 30.4121783});
      //       console.log(result);
      
    } catch (error) {
      console.error('Ошибка при запросе:', error);
      Alert.alert('Ошибка', 'Не удалось получить рассказ');
    }
    
  };
  
  const [preferences, setPreferences] = useState('');
  const [location, setLocation] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  
  
  
  
  const handlePress = async () => {
    try {
      timer.stop();
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
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mapComponent}>
        <Map />
      </View>
      <View style={styles.inputContainer}>
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
      </View>
      {isVisible && (
        <View style={styles.responseContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={() => setIsVisible(false)}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.responseText}>{responseText}</Text>
        </View>
      )}
      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>Начать рассказ</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={handlePressTest}>
          <Text style={styles.buttonText}>Тест</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textStyle: {
    fontSize: 26,
    color: 'black',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  inputContainer: {
    position: 'absolute',
    zIndex: 1,
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
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
});

export default HomeScreen;
