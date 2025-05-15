import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

function MapScreen(): React.JSX.Element {

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.textContainer}>
        <Text style={styles.textStyle}>In development!</Text>
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
  textContainer: {
    position: 'absolute',
    zIndex: 1,
    top: 20,
    left: 20,
  },
});

export default MapScreen;
