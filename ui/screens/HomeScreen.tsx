import React, { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Map from '../components/Map';

function HomeScreen(): React.JSX.Element {

  const [responseText, setResponseText] = useState('');

  const handlePress = async () => {
    try {
      const response = await fetch('http://localhost:5555/ask', {  //ЗДЕСЬ МОЖНО ПОМЕНЯТЬ IP СЕРВЕРА
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          preferences: 'bridges, architecture, memorials',
          location: 'Red Square, Moscow',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      setResponseText(data);
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
      <View style={styles.responseContainer}>
        <Text style={styles.responseText}>{responseText}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={handlePress}>
          <Text style={styles.buttonText}>Начать рассказ</Text>
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
  mapComponent: {
    flex: 1,
    // position: 'absolute',
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
