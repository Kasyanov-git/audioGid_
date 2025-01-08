import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Map from '../components/Map';

function HomeScreen(): React.JSX.Element {

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mapComponent}>
        <Map />
      </View>
      {/* <View style={styles.buttonContainer}>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>GO!</Text>
        </Pressable>
      </View> */}
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
  textContainer: {
    position: 'absolute',
    zIndex: 1,
    top: 20,
    left: 20,
  },
  mapComponent: {
    flex: 1,
    // position: 'absolute',
  },
  buttonContainer: {
    position: 'absolute',
    zIndex: 1,
    bottom: 0,
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
